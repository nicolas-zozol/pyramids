# Design: ouvrir robusta.build à l'indexation

**Last update:** 2026-11-04
**Feature:** go-live
**Infix:** GOLIVE
**Status:** IMPLEMENTED (2026-11-04, commit 6182d17)
**Sources:** [story](go-live.story.md), [brainstorm](go-live.brainstorm.md), [epic](../../pyramid-v2.epic.md), [seo-excellence](../seo-excellence/seo-excellence.design.md)

## Goal

go-live donne une valeur de build à `INDEXING_OPEN`, la constante que seo-excellence pose à `false` dans le package `seo` : vraie sur la seule build de production faite par Netlify, `NETLIFY === 'true'` et `CONTEXT === 'production'`, identique dans le bundle serveur, le bundle client et `.routing-dist`. `netlify.toml` gagne une règle forcée qui renvoie `robusta-build.netlify.app` en 301 vers `https://www.robusta.build`. Rien d'autre ne change : ce que chaque page déclare reste à seo-excellence. Le pourquoi : [story](go-live.story.md).

Ce design suppose le code de seo-excellence livré ; ses noms sont ceux de son design.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Nothing points into an app, no loop.

  Netlify build (sets NETLIFY, CONTEXT)   crawlers
      │                                      │
      │ CLI                                  │ HTTP
      ↓                                      ↓
  app `@robusta/robusta-build` [modified]
```

Dans l'app, seul le package `seo` change, et seulement la valeur de `INDEXING_OPEN` ; ses client code (`pageHead`, `check-seo.mjs`) ne changent pas. La route racine garde `robots: noindex, nofollow`.

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, une build locale.

- `yarn build:robusta` · modifié — lit `NETLIFY` et `CONTEXT` au build : `NETLIFY=true` avec `CONTEXT=production` ouvre les pages indexables ; toute autre valeur de `CONTEXT` (`branch-deploy`, `deploy-preview`, `dev`), l'absence de l'une des deux, donc toute build du CLI Netlify, garde tout fermé. Étapes et codes de sortie inchangés ; aucune variable d'environnement ajoutée au dashboard.
- stdout de `node scripts/check-seo.mjs` · modifié — `… indexing open` sur la build de production, `… indexing closed` partout ailleurs. Exit 1 quand le `robots` d'une page diffère de `robotsOf` appliqué à la présence de sa canonical URL, comme dans seo-excellence.
- `yarn workspace @robusta/robusta-build run test` · inchangé — les specs tournent sans `CONTEXT`, donc fermées.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers.

- `GET` sur une page indexable, build de production, jumeau `.html` compris · modifié — 200, `<meta name="robots" content="index, follow">` dans le HTML prérendu et dans le head recalculé à l'hydratation et à chaque navigation client · était `noindex, nofollow`.
- `GET` sur toute autre page de la production (`404.html`, un accueil du blog construit vide, une route sans head propre) · inchangé — `noindex, nofollow`, le `robots` de la racine.
- `GET` sur toute page d'une build hors production (`epic-robusta-v2--robusta-build.netlify.app`, une deploy preview, un draft deploy, `vite dev`) · inchangé — `noindex, nofollow`, scripts exécutés ou non.
- `GET https://robusta-build.netlify.app/{path}` · modifié — 301, `Location: https://www.robusta.build/{path}`, pour tout `{path}`, fichier existant ou non · était 200.
- `GET https://www.robusta.build/{path}` · inchangé — aucune redirection d'hôte. L'apex `robusta.build` répond toujours 301 vers `www`, réglage du dashboard.
- `GET /robots.txt` et `GET /sitemap.xml` · inchangés — ceux de seo-excellence, identiques dans chaque contexte.

### library API of package `seo` in app `@robusta/robusta-build` — modified

Client code : inchangé, `pageHead` et `robotsOf` dans `src/seo`, `check-seo.mjs` par `.routing-dist`.

```ts
/** The go-live switch: true on a production build run by Netlify only, fixed at build time. */
const INDEXING_OPEN: boolean; // was the literal false; now process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production'
```

`robotsOf(indexable)` garde sa signature et sa règle : `'index, follow'` seulement quand `indexable` et `INDEXING_OPEN`.

### Site build configuration `vite.config.ts` in app `@robusta/robusta-build` — modified

- `define` · nouveau — remplace les expressions `process.env.NETLIFY` et `process.env.CONTEXT` par leurs valeurs de build, chaîne vide quand l'une est absente, dans chaque environnement Vite, client et serveur.

### Netlify configuration `netlify.toml` in app `@robusta/robusta-build` — modified

- une règle `[[redirects]]` · nouvelle, première du fichier — `from = "https://robusta-build.netlify.app/*"`, `to = "https://www.robusta.build/:splat"`, `status = 301`, `force = true`. Les deux règles `/en` et `/en/*` suivent, inchangées.

## Technical Constraints

- Netlify expose à la build deux variables en lecture seule : `NETLIFY`, toujours `true` sur ses serveurs de build, et `CONTEXT` : `production`, `deploy-preview`, `branch-deploy` ou `dev`. Le CLI (netlify-cli 27.16, `netlify build` comme `netlify deploy`, qui construit par défaut) pose `NETLIFY_LOCAL=true` à la place de `NETLIFY`, et `CONTEXT=production` sans `--context` : `CONTEXT` seul ouvrirait un draft deploy du CLI. `NETLIFY` ferme toute build du CLI, `deploy --prod` compris, que CLAUDE.md interdit. `yarn build:robusta` hors Netlify ne porte aucune des deux. `netlify deploy --remote` construit chez Netlify, et la documentation ne dit pas le `CONTEXT` d'un draft distant : le draft deploy du CLI est la build locale. Le `X-Robots-Tag: noindex` que Netlify ajoute aux deploy previews et aux anciens déploiements de branche n'est pas une garantie : le dernier déploiement de `epic/robusta-v2` ne le porte pas.
- TanStack Router réexécute `head()` à l'hydratation et à chaque navigation client. `INDEXING_OPEN` doit donc être un littéral dans le bundle client : le `define` de Vite remplace `process.env.NETLIFY` et `process.env.CONTEXT` au build, et le navigateur ne lit jamais `process`. Le `define` de premier niveau s'applique à tous les environnements Vite ; le prérendu, qui exécute le bundle serveur sous Node, lit la même valeur.
- Hors Vite (`.routing-dist` compilé par `tsc`, scripts Node, vitest), `process.env.NETLIFY` et `process.env.CONTEXT` se lisent au chargement du module, dans le processus de `yarn build:robusta` : mêmes valeurs que les bundles. `src/seo` est le seul lecteur de `NETLIFY` et `CONTEXT` dans `src` (R-SEOEXCELLENCE-25).
- `INDEXING_OPEN` est évalué une fois, au chargement de son module : une spec qui teste la production pose `NETLIFY` et `CONTEXT` avant d'importer `src/seo` et recharge le module.
- Redirections Netlify : la première règle qui correspond gagne, dans l'ordre du fichier, d'où la règle d'hôte en tête ; sans `force`, une règle ne s'applique pas quand un fichier existe au chemin demandé, et chaque page est un fichier. Une règle à hôte complet ne correspond qu'à cet hôte : `www.robusta.build`, servi par CNAME vers `robusta-build.netlify.app` mais sous son propre en-tête `Host`, les déploiements de branche et les deploy previews ne sont pas redirigés.

## Requirements

### Ouverture en production

- R-GOLIVE-01 : `INDEXING_OPEN` vaut `process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production'`, écrit une fois dans `src/seo` à la place du littéral `false`. `robotsOf`, `pageHead`, `isIndexable` et la route racine restent ceux de seo-excellence.
- R-GOLIVE-02 : `vite.config.ts` déclare dans `define` les valeurs de build de `process.env.NETLIFY` et `process.env.CONTEXT`, si bien que le HTML prérendu et le head recalculé dans le navigateur portent le même `robots`.
- R-GOLIVE-03 : sur la build de production, `check-seo.mjs` lit `INDEXING_OPEN` vrai dans `.routing-dist`, exige `index, follow` sur chaque page qui porte une canonical URL et `noindex, nofollow` sur toute autre, et écrit `indexing open`.
- R-GOLIVE-04 : `robots.txt` et le sitemap ne dépendent pas de `INDEXING_OPEN` : hors production, `robots.txt` ne bloque rien et le crawler lit le `noindex` de chaque page.
- R-GOLIVE-05 : go-live n'écrit aucune liste de pages : l'ouverture suit `isIndexable` à chaque build, et un déploiement d'avant go-live, construit avec `INDEXING_OPEN` à `false`, sert `noindex` partout.

### Un seul hôte

- R-GOLIVE-21 : `netlify.toml` ouvre ses redirections sur la règle forcée de `https://robusta-build.netlify.app/*` vers `https://www.robusta.build/:splat` en 301.
- R-GOLIVE-22 : aucune autre règle ne change, aucune ne vise `www.robusta.build`, et l'apex reste au dashboard.

## Acceptance Criteria

- AC-GOLIVE-1 : Given la build de production de robusta.build, When un crawler lit une page que seo-excellence déclare indexable, qu'il exécute les scripts ou y arrive par une navigation dans le site, Then la page se déclare indexable et ses liens peuvent être suivis.
- AC-GOLIVE-2 : Given la build de production, When un crawler lit une page que seo-excellence ne déclare pas indexable (la 404, qu'une adresse v1 sert aussi, une page sans contenu propre, une page ajoutée sans rien déclarer), Then elle garde le `noindex` de la racine.
- AC-GOLIVE-3 : Given une build qui n'est pas celle de la production Netlify, le déploiement de branche de `epic/robusta-v2`, une deploy preview, une build locale ou un draft deploy du CLI, When un crawler la lit, scripts exécutés ou non, Then aucune page ne s'y déclare indexable, go-live y étant déjà commité, et son `robots.txt` ne bloque rien, pour que le crawler lise le `noindex` de chaque page.
- AC-GOLIVE-4 : Given go-live mergé sur `main` et déployé, When Nicolas soumet `/sitemap.xml` dans la console webmaster où robusta.build est une propriété vérifiée, Then la console lit le sitemap, et aucune URL qu'il liste n'est signalée bloquée par `noindex` ou par `robots.txt`. Vérifié après le merge, à `storyman done`.
- AC-GOLIVE-5 : Given la production ouverte, When elle revient à un déploiement d'avant go-live, Then tout le site se referme.
- AC-GOLIVE-6 : Given la production ouverte, When une page indexable perd son contenu propre, Then elle se referme à la build suivante, sans retouche de go-live.
- AC-GOLIVE-7 : Given la production ouverte, When un crawler lit une page sous `robusta-build.netlify.app`, Then il est renvoyé en 301 vers la même page sous `https://www.robusta.build`, et `www` n'est pas redirigé.

Edge cases to test:

- Une page article de la production, lue après hydratation puis atteinte par une navigation client depuis la landing page : `index, follow` les deux fois ; le même parcours sur le déploiement de branche : `noindex, nofollow` les deux fois.
- Une build sans `CONTEXT`, puis avec `branch-deploy`, `deploy-preview` et `dev`, puis `CONTEXT=production` sans `NETLIFY`, la build d'un draft deploy du CLI : aucune page `index`, `check-seo.mjs` écrit `indexing closed`.
- La build avec `NETLIFY=true` et `CONTEXT=production` : `404.html` et un accueil du blog construit vide sur fixture restent `noindex, nofollow`, et le nombre de pages `index, follow` égale le nombre d'entrées du sitemap.
- Une page de roll dont le dernier article est dépublié sur fixture, build de production : `noindex, nofollow` et absente du sitemap.
- `robots.txt` octet pour octet identique entre une build de production et une build sans `CONTEXT`.
- `https://robusta-build.netlify.app/fr/articles` : 301 vers `https://www.robusta.build/fr/articles` ; `https://robusta-build.netlify.app/en/x` : 301 vers `https://www.robusta.build/en/x`, puis la règle `/en/*` ; `https://www.robusta.build/fr/articles` : 200 ; `https://epic-robusta-v2--robusta-build.netlify.app/` : 200, sans redirection.

## Dependencies

- Depends on : seo-excellence (B2), dont le design est APPROVED — package `seo`, `INDEXING_OPEN`, `robotsOf`, `check-seo.mjs`. Hors dépôt, avant le merge sur `main` : l'équipe Netlify en offre Personal avec recharge automatique (story, Dep 2).
- Blocks : rien.
