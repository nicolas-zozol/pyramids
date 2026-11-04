# Story : Ouvrir robusta.build à l'indexation

**Dernière mise à jour :** 2026-11-04
**Feature :** go-live
**Infix :** GOLIVE
**Status :** SUBMITTED (2026-11-04, commit 6182d17)

## Story

**En tant qu'**éditeur de robusta.build, **je veux** ouvrir à l'indexation les pages que le site déclare indexables, et elles seules, **afin que** les moteurs de recherche trouvent le site v2 sans jamais indexer une page vide ou la 404.

## Contexte & objectif

Avant go-live, la racine déclarait `noindex, nofollow` sur chaque page et `INDEXING_OPEN` valait `false`. Désormais, sur la seule build de production faite par Netlify (`NETLIFY=true` et `CONTEXT=production`), chaque page que seo-excellence déclare indexable s'ouvre ; toute autre page, et toute autre build, garde `noindex`. `robusta-build.netlify.app` renvoie en 301 vers `https://www.robusta.build`. Rien n'est indexé avant que Nicolas merge `epic/robusta-v2` sur `main`.

## Livré

### Requirements

- R-GOLIVE-01 : `INDEXING_OPEN` vaut `process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production'`, écrit une fois dans `src/seo` à la place du littéral `false`. `robotsOf`, `pageHead`, `isIndexable` et la route racine restent ceux de seo-excellence.
- R-GOLIVE-02 : `vite.config.ts` déclare dans `define` les valeurs de build de `process.env.NETLIFY` et `process.env.CONTEXT`, si bien que le HTML prérendu et le head recalculé dans le navigateur portent le même `robots`.
- R-GOLIVE-03 : sur la build de production, `check-seo.mjs` lit `INDEXING_OPEN` vrai dans `.routing-dist`, exige `index, follow` sur chaque page qui porte une canonical URL et `noindex, nofollow` sur toute autre, et écrit `indexing open`.
- R-GOLIVE-04 : `robots.txt` et le sitemap ne dépendent pas de `INDEXING_OPEN` : hors production, `robots.txt` ne bloque rien et le crawler lit le `noindex` de chaque page.
- R-GOLIVE-05 : go-live n'écrit aucune liste de pages : l'ouverture suit `isIndexable` à chaque build, et un déploiement d'avant go-live, construit avec `INDEXING_OPEN` à `false`, sert `noindex` partout.
- R-GOLIVE-21 : `netlify.toml` ouvre ses redirections sur la règle forcée de `https://robusta-build.netlify.app/*` vers `https://www.robusta.build/:splat` en 301.
- R-GOLIVE-22 : aucune autre règle ne change, aucune ne vise `www.robusta.build`, et l'apex reste au dashboard.

### Acceptance Criteria

- AC-GOLIVE-1 : Given la build de production de robusta.build, When un crawler lit une page que seo-excellence déclare indexable, qu'il exécute les scripts ou y arrive par une navigation dans le site, Then la page se déclare indexable et ses liens peuvent être suivis.
- AC-GOLIVE-2 : Given la build de production, When un crawler lit une page que seo-excellence ne déclare pas indexable (la 404, qu'une adresse v1 sert aussi, une page sans contenu propre, une page ajoutée sans rien déclarer), Then elle garde le `noindex` de la racine.
- AC-GOLIVE-3 : Given une build qui n'est pas celle de la production Netlify, le déploiement de branche de `epic/robusta-v2`, une deploy preview, une build locale ou un draft deploy du CLI, When un crawler la lit, scripts exécutés ou non, Then aucune page ne s'y déclare indexable, go-live y étant déjà commité, et son `robots.txt` ne bloque rien, pour que le crawler lise le `noindex` de chaque page.
- AC-GOLIVE-4 : Given go-live mergé sur `main` et déployé, When Nicolas soumet `/sitemap.xml` dans la console webmaster où robusta.build est une propriété vérifiée, Then la console lit le sitemap, et aucune URL qu'il liste n'est signalée bloquée par `noindex` ou par `robots.txt`. Vérifié après le merge, à `storyman done`.
- AC-GOLIVE-5 : Given la production ouverte, When elle revient à un déploiement d'avant go-live, Then tout le site se referme.
- AC-GOLIVE-6 : Given la production ouverte, When une page indexable perd son contenu propre, Then elle se referme à la build suivante, sans retouche de go-live.
- AC-GOLIVE-7 : Given la production ouverte, When un crawler lit une page sous `robusta-build.netlify.app`, Then il est renvoyé en 301 vers la même page sous `https://www.robusta.build`, et `www` n'est pas redirigé.

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

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, une build du CLI Netlify et une build locale.

- `yarn build:robusta` · modifié — lit `NETLIFY` et `CONTEXT` ; seuls `NETLIFY=true` et `CONTEXT=production` ensemble ouvrent les pages indexables, toute autre combinaison, une build du CLI Netlify comprise, garde tout fermé. `check-seo.mjs` écrit `indexing open` ou `indexing closed`. Codes de sortie inchangés.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers.

- `GET` sur une page indexable, build de production · modifié — 200, son head la déclare `index, follow` · était `noindex, nofollow`, la directive de la racine. Toute autre page, et toute page d'une build hors production, garde cette directive.
- `GET https://robusta-build.netlify.app/{path}` · modifié — 301 vers `https://www.robusta.build/{path}`, règle forcée limitée à cet hôte · était 200.

`/sitemap.xml` et `/robots.txt` sont livrés par seo-excellence ; go-live n'y change rien.

## Décisions

- 2026-10-06 — La racine garde `noindex` par défaut et seules les pages que seo-excellence déclare indexables s'ouvrent. Pourquoi : OQ-LANDING-12 et OQ-SEOEXCELLENCE-19, `lgtm` ; une 404 ou une page vide ne s'ouvre jamais.
- 2026-11-04 — La build ne s'ouvre que si `NETLIFY=true` et `CONTEXT=production` sont réunis. Pourquoi : Netlify ne pose pas `X-Robots-Tag: noindex` sur le dernier déploiement d'une branche, et une build du CLI porte `CONTEXT=production` sans `NETLIFY` (Gap-GOLIVE-4).
- 2026-11-04 — La valeur est figée au build par le `define` de Vite, calculée par `scripts/netlify-build-define.mjs`. Pourquoi : TanStack Router recalcule le head dans le navigateur, qui doit dire la même chose que le HTML prérendu.
- 2026-11-04 — `robusta-build.netlify.app` répond 301 forcé vers `https://www.robusta.build`, règle limitée à cet hôte. Pourquoi : aucune copie ouverte ne vit sous un second hôte ; les déploiements de branche, les deploy previews et `www` ne sont pas redirigés (OQ-GOLIVE-2).
- 2026-11-04 — Le draft deploy se fait par `npx netlify-cli deploy` sans `--prod`, fermé par construction ; `netlify deploy --remote` est exclu. Pourquoi : la documentation Netlify ne dit pas le `CONTEXT` d'un draft distant.
- 2026-11-04 — Vérifié au submit : build locale fermée, build `NETLIFY=true CONTEXT=production` à 33 pages `index, follow` égales au sitemap, 404 en `noindex`, draft deploy `https://dev--robusta-build.netlify.app` en `noindex, nofollow`. Restent à `storyman done`, après le merge sur `main` : AC-GOLIVE-4 dans la console webmaster et AC-GOLIVE-7 en direct.

## Documentation updates

- changed the SEO and Deployment sections of `apps/robusta-build/README.md`: production-only opening, the `define`, `indexing open`, the forced 301 of `robusta-build.netlify.app`, the draft deploy command and the exclusion of `netlify deploy --remote`.
- changed the `noindex` paragraph of « Where the truth of this site lives » in `apps/robusta-build/README.md`.
- changed the robusta.build line of `README.md` and the `apps/robusta-build` line of `CLAUDE.md`.
- changed the go-live line of `.claude/skills/geo-article/SKILL.md`.
- change the Netlify plan in the Deployment section of `apps/robusta-build/README.md` — why: il dit encore l'offre Free à 300 crédits ; à écrire une fois Dep 2 faite.

## Dependencies

- Dep 1: seo-excellence, B2 — levée, soumise le 2026-11-04 avec `93f6770`.
- Dep 2: l'équipe Netlify passe en offre Personal avec recharge automatique avant le merge sur `main` (décision du 2026-10-06) — action de Nicolas hors dépôt.
