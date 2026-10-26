# Story : robusta.build en trois langues, l'anglais par défaut

**Dernière mise à jour :** 2026-10-26
**Feature :** multilingual-site
**Infix :** MULTILINGUAL
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** servir le site en anglais, en français et en espagnol, chaque page sous le préfixe de sa Locale, et suivre les traductions de chaque article, **afin de** publier RB Compound pour un public international sans qu'une traduction dérive en silence de son original.

## Contexte & objectif

Le 2026-10-25, BR-ROBUSTA-1 remplace BR-PYRAMID-11 : robusta.build sert ses pages dans plusieurs Locales, `en` par défaut, avec `fr` et `es`. Le site met désormais en avant RB Compound ; les PME françaises restent un positionnement parmi d'autres, non mis en avant. Aujourd'hui le site sert `fr` sans marqueur et `en` sous `/l/en` (default-locale-fr, `6bcbca6`), et sa Site configuration n'a qu'un bloc de page copy, en français.

Toutes les Locales portent un préfixe, `en`, `fr` et `es`, la Locale par défaut comprise : changer de Locale par défaut ne déplacera plus aucune URL. La landing page d'une Locale est `/en`, sans barre finale comme toute URL que `buildUrl` produit ; `/` redirige vers `/en`, et `/en/` reçoit le 301 que Netlify sert déjà vers la forme sans barre. Le premier segment étant toujours une Locale, le discriminant `l` disparaît des URL ; le schéma reste lisible sans la content source (BR-PYRAMID-1). Cette story défait en partie default-locale-fr : Locale par défaut, adresses, `<html lang>` et texte français constant de la 404 et de la fin d'article.

Le corpus compte 8 articles anglais et 9 français publiés, et aucun article espagnol. Huit paires se traduisent : les six traductions publiées par `a3408ff` ont l'anglais pour original, les deux paires venues de v1, `yield-farming-fr` et `pourquoi-migration-gatsby-next-js`, le français. Un article n'existe que dans les Locales où une version publiée existe (BR-PYRAMID-10) : sans version espagnole, il n'a aucune adresse sous le préfixe `es` et aucun lien n'y mène. `/es` n'a que sa landing page, page copy en espagnol, sans section de notes ni repli vers l'anglais. Le site ne détecte pas la langue du navigateur ; l'en-tête de chaque page mène aux autres Locales.

Une traduction obsolète est signalée par la build, jamais dépubliée : une coquille corrigée dans l'original dépublierait sinon toutes ses traductions. Seul le traducteur la redéclare à jour.

RB Compound est une offre de services de Nicolas, pour les équipes et responsables techniques qui veulent produire du logiciel avec des agents IA (décision du 2026-10-26). Elle a deux versions, deux offres distinctes, que la landing page présente chacune par son propre schéma de workflow, la surface `FlowDiagram` du design system :

- la version open source, simple et gratuite : epicman, storyman, designman et tddman, de l'epic à l'implémentation test-first, sans brainstorm, ni boss, ni codeman, docman ou archiman ;
- la version complète, avec le brainstorm, codeman, la documentation par docman et archiman, boss et le vocabulaire slang comme rloq : elle n'existe qu'avec un accompagnement personnalisé et payant d'une entreprise, jamais seule.

La landing page décrit le workflow tel qu'il existe (§Code Routine de Compound et ses agents : epicman, storyman, bsman, designman, tddman et codeman, docman et archiman, boss), sans prix ni promesse de résultat ; un chiffre factuel comme « vingt ans de logiciel » reste permis. Son appel à l'action reste le contact actuel, e-mail et LinkedIn, qui mène à l'accompagnement. La version open source n'est pas encore publiée : ce sera un plugin, présenté à la manière de Superpowers, extrait plus tard de l'existant. La landing page le dit et ne lie aucun dépôt tant que le plugin n'est pas publié ; ajouter ce lien sera un changement de page copy, hors de cette story.

La page copy anglaise est écrite directement sur ce positionnement ; `fr` et `es` la traduisent, et la page copy française actuelle, tournée vers les PME de Toulouse, est remplacée. Aucun item à part ne réécrit la landing page. Hors périmètre : l'extraction et la publication du plugin open source (item d'À faire de l'epic), hreflang, x-default et sitemap (seo-excellence), les articles sur RB Compound, et les traductions espagnoles des articles, publiées plus tard comme contenu.

Le schéma et la lecture du corpus vivent dans deux modules, `@robusta/pyramids-routing` et `@robusta/pyramids-content`, dont le seul consommateur est `apps/robusta-build`. Ce qu'un seul site utilise appartient à ce site (BR-PYRAMID-12) : leur code redevient des packages du site, en première étape de cette story. `@robusta/pyramids-design-system` reste un module (BR-PYRAMID-13), mais `SiteHeader` y gagne deux ajouts optionnels : l'adresse d'accueil du wordmark, aujourd'hui `/` en dur, et une Locale par lien.

## Prérequis : le schéma et la lecture du corpus deviennent des packages du site

- Le code de `packages/pyramids-routing` et `packages/pyramids-content` devient des packages de `apps/robusta-build`, auprès de `src/routing/scheme.ts` et `src/content/corpus.ts` ; noms et emplacements au design. Leurs specs suivent, 78 et 98 tests.
- Aucun changement de comportement dans cette étape : le site sert les mêmes 30 URL de contenu, le même corpus et la même v1 map qu'aujourd'hui.
- Les deux workspaces disparaissent, avec leurs étapes de `build:deps` et leurs watchers `w:routing` et `w:content` ; le design system reste la seule dépendance workspace du site.
- Le code du schéma et de la lecture du corpus ne contient l'arborescence d'aucun site : la Site configuration et `CorpusSpec` déclarent le content root, la racine du corpus et les Locales.
- Les scripts de build en Node pur (`check-route-table`, `prerender-pages`, `copy-article-images`) importent aujourd'hui le `dist` des deux modules ; la façon dont ils atteignent le code rapatrié revient au design.

## Acceptance Criteria

- AC-MULTILINGUAL-1 : Given le corpus publié et un clean checkout du dépôt, sans les workspaces `pyramids-routing` et `pyramids-content`, When le site est construit et testé, Then la build aboutit, et chaque URL de contenu commence par la Locale de sa page : `/en/articles/c/privacy/leaving-gmail` et `/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répondent 200, le site compte toujours 30 URL de contenu, 14 sous `/en/…` et 16 sous `/fr/…`, et `/en`, `/fr` et `/es` sont les trois landing pages, sans barre finale.
- AC-MULTILINGUAL-2 : Given le site publié sur un branch deploy, When un visiteur ou un crawler ouvre `/`, Then il reçoit une redirection permanente (301) vers `/en`, et `/en/`, `/fr/` ou `/es/` une redirection permanente vers la même adresse sans barre finale ; une ancienne adresse sans préfixe ou sous `/l/en`, comme `/articles/c/blockchain` ou `/l/en/articles`, répond 404, sans redirection. Les redirections sont servies par l'hébergeur : `vite dev` ne les applique pas.
- AC-MULTILINGUAL-3 : Given une page de chaque Locale, landing page, page de category ou article, When un visiteur l'ouvre, Then son document déclare `<html lang>` à la Locale du préfixe, et tout ce qu'il lit, en-tête, pied de page, sections et libellés de category, est la page copy de cette Locale, fournie par le site (BR-PYRAMID-8) : `/fr/articles/c/blockchain` et un article français sont entièrement en français. La landing page `/en` présente RB Compound, l'offre de services aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, et non plus une offre aux PME de Toulouse : deux schémas séparés montrent la version open source, epicman, storyman, designman et tddman, et la version complète, proposée seulement avec un accompagnement ; la page dit que la version open source n'est pas encore publiée, ne cite ni prix ni promesse de résultat, et son appel à l'action mène au contact e-mail et LinkedIn. `/fr` et `/es` en sont les traductions, mêmes sections et même propos, titre et description de la page compris. La section de notes de `/fr` liste les quatre articles français les plus récents, celle de `/en` les anglais, et `/es` n'en a pas tant qu'aucun article espagnol n'est publié.
- AC-MULTILINGUAL-4 : Given une page du site, When un visiteur la lit, Then le wordmark de l'en-tête mène à la landing page de sa Locale, jamais à `/` ; l'en-tête propose un lien vers chaque autre Locale, nommé et prononcé dans sa propre langue, qui mène à la même page dans cette Locale si elle existe, à sa landing page sinon, et une page de blog roll au-delà de la première, `/fr/articles/p/2`, mène à la première page du même blog roll. Une version d'article se déclare dans sa Locale, sa fin d'article est rédigée dans cette Locale, et elle lie chacune de ses autres versions publiées : `leaving-gmail` et `quitter-gmail` se lient l'un à l'autre, et depuis chacun le lien espagnol de l'en-tête mène à `/es`.
- AC-MULTILINGUAL-5 : Given une traduction déclarée à jour de son original, When le titre, l'excerpt ou le corps de l'original change ensuite, Then la build signale la traduction obsolète en nommant la traduction et son original, avec de quoi la redéclarer à jour, et elle reste publiée ; une fois redéclarée, le signalement cesse. Un changement des seuls tags, date, category ou image de couverture de l'original ne signale rien, et une correction de la traduction elle-même la laisse à jour. Chaque article connaît son original : lui-même s'il n'est la traduction d'aucun autre, sinon la version d'une autre Locale reliée par le même translation identifier. Les huit paires actuelles sont déclarées à jour dans le même changement : la build du corpus réel ne signale rien.
- AC-MULTILINGUAL-6 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes 82 adresses v1 dans le même ordre avec la même issue (67 permanentes, 5 Gone, 10 sans destination), seules les destinations changent, chacune une URL que le site construit dans la langue de la page v1 : `/learn` mène à `/en/articles`, `/learn/fr/blockchain` à `/fr/articles/c/blockchain`.
- AC-MULTILINGUAL-7 : Given les cas limites, When le site est construit, Then une category revendiquée par une seule Locale n'a de page que dans celle-ci (`theory` sous `/fr/…` seulement, `/en/articles/c/theory` répond 404, et depuis `/fr/articles/c/theory` le lien anglais de l'en-tête mène à `/en`) ; le premier article anglais publié dans `theory` crée `/en/articles/c/theory` sous un libellé anglais, vers lequel mène alors ce lien, et sans libellé anglais dans la page copy la build échoue en nommant la category et la Locale ; deux versions reliées par un translation identifier, dont aucune ne se déclare traduction de l'autre, sont signalées comme paire non suivie et restent publiées ; une traduction dont l'original n'est pas publié, ou a quitté le corpus, est servie dans sa Locale sans lien vers l'original, et le signalement nomme l'original manquant ; `/es/articles` répond 404 tant qu'aucun article espagnol n'est publié ; aucun lien des trois landing pages ne mène à un dépôt ou à une page du plugin open source tant qu'il n'est pas publié ; une adresse inconnue reçoit la page 404 en anglais, `lang="en"`, dont le lien de retour mène à la landing page anglaise.

## Boundaries

Packages de l'app `@robusta/robusta-build` [modified] :

```
  routes · page-data · landing · scripts de build
      │
      ├──library──→  package `routing` [modified]   reçoit le code de `pyramids-routing`
      │
      └──library──→  package `content` [modified]   reçoit le code de `pyramids-content`
```

Hors figure, autre zoom : le module `@robusta/pyramids-design-system` [modified], dont l'en-tête du site est le client.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /` — 301 vers `/en`, première redirection du site v2, servie par l'hébergeur · avant : 200, la landing page française
- `GET /{en|fr|es}` — 200, la landing page de la Locale, `<html lang>` à cette Locale, page copy RB Compound · avant : `/` seule, `/l/en` non construite
- `GET /{en|fr|es}/` — 301 vers la même adresse sans barre finale, comportement que Netlify sert déjà
- `GET /{en|fr}/articles…` — 200, les pages de la Locale · avant : `fr` sans marqueur, `en` sous `/l/en`
- `GET /es/articles…` — 404 tant qu'aucun article espagnol n'est publié
- `GET /articles…`, `GET /l/{locale}/…` et toute adresse inconnue — 404, `404.html` en anglais, retour vers la landing page anglaise · avant : 200 pour `/articles…` et `/l/en/…`

### library API of package `routing` in app `@robusta/robusta-build` — modified

Client code : routes, `page-data`, `landing`, scripts de build ; ils importent le point d'entrée du package, plus le workspace.

- reçoit `UrlScheme`, `buildUrl`, `parseUrl`, `urlSet`, `validateArticles` et les discriminants de l'ancien module, à l'identique
- `UrlScheme` · modifié — chaque Locale porte son préfixe, la Locale par défaut comprise ; la forme sans marqueur et le discriminant `l` disparaissent
- `buildUrl`, `urlSet` · même signature — chaque URL produite commence par sa Locale, et la landing page d'une Locale s'écrit sans barre finale

### library API of package `content` in app `@robusta/robusta-build` — modified

Client code : `src/content`, `page-data`, scripts de build.

- reçoit `CorpusSpec`, `readCorpus`, `readArticleBody`, `articleSlug`, `describeViolation`, `copyCorpusAssets` et `resolveAssetUrl` de l'ancien module, à l'identique
- `ArticleEntry` · modifié — porte de quoi connaître l'original d'une traduction et l'état à jour ou obsolète de celle-ci ; forme au design
- signalement des traductions obsolètes ou non suivies · nouveau — produit à la lecture du corpus, distinct des violations, sans bloquer la publication

### library API of module `@robusta/pyramids-design-system` — modified

Client code : l'en-tête du site, `src/chrome`, et la landing page, `src/landing`, de `apps/robusta-build`. Le design system reste un module (BR-PYRAMID-13) ; ses autres usages ne changent pas.

- `SiteHeaderProps` · modifié — gagne une adresse d'accueil optionnelle pour le wordmark, `/` par défaut ; nom au design
- `NavLink` · modifié — gagne une Locale optionnelle, rendue en `lang` et `hreflang` sur le lien ; nom au design
- `FlowDiagram` · utilisé deux fois sur une même page, une instance par version de RB Compound ; sa section porte aujourd'hui un `id="approach"` en dur ; la landing page fournit chaque texte, le reste au design

## Documentation updates

- change l'entrée `Locale` de `ubiquitous-language.md` — why: chaque Locale porte un marqueur dans l'URL, la Locale par défaut comprise.
- change l'entrée `Canonical URL` de `ubiquitous-language.md`, dans la même passe que l'item 6 d'À faire (canonical-url-glossary) — why: une Locale par défaut marquée devient la forme canonique, et `/` est la seule redirection du site.
- change les entrées `Pyramid`, `Discriminant` (« appartiennent à la base partagée ») et `Content source` (« que la base partagée sait lire ») de `ubiquitous-language.md` — why: le schéma et la lecture du corpus ne font plus partie de la base partagée.
- create les termes de l'original d'un article et de la traduction obsolète dans `ubiquitous-language.md`, noms fixés au design — why: la gestion des traductions en a besoin.
- change §Routing, §One URL per page, §The v1 mapping et la description du déploiement Netlify (« no redirect rule ») de `apps/robusta-build/README.md` — why: formes préfixées, fin du discriminant `l`, redirection de `/`, destinations de la v1 map.
- change §Articles de `apps/robusta-build/README.md` — why: les Locales `en`, `fr`, `es`, et ce qu'un article déclare sur son original et sa mise à jour.
- change la composition de la landing page dans `apps/robusta-build/README.md` (§What they render) et le package `landing` de `apps/robusta-build/robusta-build.archi.md`, via archiman — why: deux `FlowDiagram` présentent les deux versions de RB Compound.
- change les mentions de `pyramids-routing` et `pyramids-content` dans `apps/robusta-build/README.md` — why: ce sont des packages du site.
- change l'exemple et la description de `SiteHeader` dans `packages/robusta-design-system/README.md` — why: adresse d'accueil du wordmark et Locale par lien.
- change `build:deps`, les commandes de test, les watchers, la phrase sur les discriminants `l`, `c`, `p`, `t` et « `/` is the landing page » dans `CLAUDE.md` — why: deux workspaces disparaissent, leurs tests passent dans le site, `l` sort du schéma v2 et les landing pages passent sous leur Locale.
- change la liste des modules et l'Overview de `root.archi.md`, via archiman — why: le site n'a plus que le design system comme dépendance workspace.
- delete `packages/pyramids-routing/routing.archi.md` et `packages/pyramids-content/content.archi.md`, ou les fusionner dans `apps/robusta-build/robusta-build.archi.md`, via archiman — why: leurs modules disparaissent.

## Dependencies

- BR-PYRAMID-12 et BR-PYRAMID-13, sur lesquelles s'appuie l'étape prérequis, sont validées et au registre depuis le 2026-10-25.
- Débloque : seo-excellence (hreflang, x-default, sitemap et canonical URLs sur le schéma préfixé), restore-v1-urls (nouvelles destinations), go-live.
