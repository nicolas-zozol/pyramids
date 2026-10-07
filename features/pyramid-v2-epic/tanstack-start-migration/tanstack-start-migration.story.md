# Story : Passer le site v2 de Next.js sur Vercel à TanStack Start sur Netlify

**Dernière mise à jour :** 2026-10-07
**Feature :** tanstack-start-migration
**Infix :** TANSTACK
**Status :** LANDED (2026-10-07, commit 7caa131)

## Story

En tant qu'éditeur de robusta.build, je veux le site v2 reconstruit sur TanStack Start et hébergé chez Netlify, avec les mêmes pages sous les mêmes URL, prérendues au build puis hydratées en navigation côté client, afin qu'il soit écrit en React standard, qu'il tourne chez un hébergeur dont l'offre gratuite autorise l'usage commercial, et qu'il garde un serveur où ajouter des web services plus tard.

## Contexte & objectif

`apps/robusta-build` était un site Next.js 15 App Router configuré pour un projet Vercel dont aucun déploiement n'a jamais rendu de page ; Nicolas a écarté Next et Vercel pour ce site le 2026-10-06. C'est un changement de plateforme, pas une refonte : mêmes routes, mêmes Canonical URL, même apparence, mêmes règles (BR-PYRAMID-2, 6 et 7, `noindex` sur chaque page), et plus aucune redirection. `apps/robusta` et `apps/dakar` restent sur Next et Vercel.

## Livré

Livré par `af89ec1`, rendu aligné sur le build Next par `27cdbe0` (polices variables, lien actif exact), scripts racine renommés par `e942e65`, déploiement consigné par `7caa131`. Le build écrit dans `apps/robusta-build/dist/client` 23 fichiers HTML (21 URL de contenu, `index.html`, `404.html`) et 12 fichiers de données ; Netlify publie ce dossier sans fonction ni règle de redirection. Depuis le 2026-10-06, robusta.build est servi par Netlify (DNS Hover basculé, premier déploiement `6ac53fd1` de `main`), `noindex` sur chaque page, et le déploiement de branche `epic-robusta-v2--robusta-build.netlify.app` répond. AC-TANSTACK-2, 4, 7 et 8 vérifiés sur le site déployé. Tests au land : 92 pour le site (AC-TANSTACK-1 en annonçait 38), 98 pour `@robusta/pyramids-content`, 78 pour `@robusta/pyramids-routing`, 54 pour le design system.

### Requirements

- R-TANSTACK-01 : The site builds with Vite 8 and TanStack Start, and its own manifest declares `vite`, `@vitejs/plugin-react`, `@tanstack/react-start`, `@tanstack/start-static-server-functions`, `@tailwindcss/vite`, `vitest`, `@fontsource-variable/ibm-plex-sans`, `@fontsource/ibm-plex-mono` and `@fontsource-variable/caveat`.
- R-TANSTACK-02 : `next`, `@tailwindcss/postcss` and `vite-tsconfig-paths` leave the site's manifest; `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`, and the `next` plugin and `.next/types` entries of `tsconfig.json` leave the site.
- R-TANSTACK-03 : The TanStack packages are declared at exact versions and are upgraded together.
- R-TANSTACK-04 : After a clean install, every resolution of `vite` from the site's build and test graph lands on the site's 8.x copy, while `apps/robusta` and the packages keep the hoisted 6.4.3; a package importing `vite` without declaring it gets the peer through `packageExtensions`, never through a root `resolutions` (BR-PYRAMID-5).
- R-TANSTACK-05 : The green set completes from a clean checkout, `apps/dakar` at 23/23 and `apps/robusta` at 42/42 pages as before.
- R-TANSTACK-06 : Local imports keep their `.js` suffix and Vite resolves them; the generated route tree carries `.js` suffixes; `@/*` resolves through Vite's `resolve.tsconfigPaths`.
- R-TANSTACK-07 : Tailwind 4 runs through `@tailwindcss/vite`, and `globals.css` moves to `src/styles/globals.css` with its token bridge unchanged (BR-PYRAMID-6).
- R-TANSTACK-08 : The site's 38 specs run unchanged under the site's own vitest.
- R-TANSTACK-09 : `emit:redirects` becomes `emit:v1-map`, writing the same committed JSON; `v1-url-map.ts` and the specs reading it stay, and nothing in the build reads the JSON.
- R-TANSTACK-10 : `lint` runs eslint over `src` with no `next` preset, and `start` is removed.
- R-TANSTACK-11 : `build` fails on a `'use client'`, a `'use server'` or a relative import without its `.js` suffix anywhere in `src`, the generated route tree excepted.
- R-TANSTACK-21 : Prerender runs with `autoStaticPathsDiscovery`, `crawlLinks` and `autoSubfolderIndex` off and `failOnError` on, on the page list `/`, `/404` and every URL of `urlSet` as `contentUrls` derives it, and on no other page.
- R-TANSTACK-22 : Every page is written under `dist/client` as its canonical path plus `.html`, `/` as `index.html` and `/404` as `404.html`.
- R-TANSTACK-23 : The build fails before Vite starts, naming the content root and the missing route files, when the route tree and `urlScheme.contentRoot` diverge (R-URLSCHEME-30).
- R-TANSTACK-24 : The route-table check compares the written `.html` files, `index.html` and `404.html` excepted, with the derived URL set, and fails the build on any difference (AC-URLSCHEME-42).
- R-TANSTACK-25 : The route-table check fails the build when the number of data files differs from the number of article URLs plus one.
- R-TANSTACK-26 : An article added to the corpus gets its page, its data file and its place in the route-table check from the same derivation, with no code change.
- R-TANSTACK-41 : The route tree holds the root route, `/`, `/404`, the twelve content routes and the locale landing, at the paths of today's route files; `src/app`, `src/middleware.ts` and the `/learn` handler are deleted, not ported.
- R-TANSTACK-42 : The root route sets `<html lang>` from the `locale` param of the matched route, and from `urlScheme.defaultLocale` when the route has none, at prerender and after every client navigation; no locale is written as a literal (BR-PYRAMID-11).
- R-TANSTACK-43 : Every document's head carries the title and the mission of the site configuration and `robots` `noindex, nofollow`, the not-found document included.
- R-TANSTACK-44 : The root head links the font stylesheet, then `globals.css`, `colors_and_type.css` and `sketch.css` in that order.
- R-TANSTACK-45 : IBM Plex Sans 300 to 700, IBM Plex Mono 400 to 600 and Caveat 600 and 700 come from Fontsource's latin files, served by the deploy with `font-display: swap`; the site sets no `--font-*` property, and a page issues no third-party request (BR-PYRAMID-6).
- R-TANSTACK-46 : No route reads content: an article route's loader calls `getArticlePage`, the `/` loader calls `getNotesFeed`, and every other route renders from its params.
- R-TANSTACK-47 : A link between two pages of the site goes through `SiteLink` with a URL `buildUrl` produced, and no route path is composed elsewhere (BR-PYRAMID-1). The links `NotesPreview` renders in the notes section of the placeholder home are the one exception: the design-system surface renders its own `<a>` from a `buildUrl` URL, so they load their target in full; robusta-landing-page, which rebuilds the home, owns them.
- R-TANSTACK-48 : `ArticleView` renders an `ArticlePage` in today's markup; the cover is a plain `<img>` with an empty `alt`, loaded eagerly in the 16:9 box, and an article declaring no cover renders no box.
- R-TANSTACK-49 : The site wires no telemetry client (BR-PYRAMID-2) and imports nothing from `next`.
- R-TANSTACK-50 : `src/design-system/assets.ts` keeps `wordmarkSrc: string` and drops its `StaticImageData` branch.
- R-TANSTACK-61 : `getArticlePage` and `getNotesFeed` are server functions whose last middleware is `staticFunctionMiddleware`, and they are the only path from a route to `src/content` and `@robusta/pyramids-content`.
- R-TANSTACK-62 : Both run at prerender only and leave one data file per distinct input in the client output; the deploy runs neither, and a hydrated page reaches their results as files (BR-PYRAMID-7).
- R-TANSTACK-63 : Every string whose text depends on Intl data is computed into the payload at build.
- R-TANSTACK-64 : Import protection denies `@robusta/pyramids-content`, `gray-matter`, `remark` and the files of `src/content` in the client environment, and the build fails on a violation.
- R-TANSTACK-65 : `notesFeed` moves from package `landing` to package `page-data`, unchanged in what it selects, and `NotesSection` renders the posts it receives.
- R-TANSTACK-66 : If the static functions fail the English-to-French walk of R-TANSTACK-104 on the deploy, `page-data` keeps both signatures and switches to JSON modules a build script writes from the same seams before `vite build`, git-ignored and loaded lazily through `import.meta.glob`; a missing key rejects as a missing data file does. No route and no component changes.
- R-TANSTACK-81 : The `/404` route renders `NotFoundPage`, and Netlify serves its `404.html` with status 404 for any path matching no file.
- R-TANSTACK-82 : The not-found document runs no client entry: the root route omits `<Scripts />` when `/404` is the matched route. The `modulepreload` hints `<HeadContent />` emits may still download the entry, which never executes, so nothing replaces the not-found page once loaded.
- R-TANSTACK-83 : `NotFoundPage` is the router's default not-found component.
- R-TANSTACK-84 : A client navigation whose route chunk or data file fails to load ends in one full load of the target address; a second failure at the same address in the same tab renders the site's error state, which only a defect reaches.
- R-TANSTACK-101 : `apps/robusta-build/netlify.toml` carries the build command, the publish directory, the ignore rule and `YARN_FLAGS`, and no function, redirect, header or plugin section.
- R-TANSTACK-102 : The Netlify site has package directory `apps/robusta-build`, no base directory, production branch `main`, branch deploys for `epic/robusta-v2`, Pretty URLs on and no build variable.
- R-TANSTACK-103 : `@netlify/vite-plugin-tanstack-start` is not a dependency, and the deploy summary lists no function.
- R-TANSTACK-104 : The following are recorded on the first deploy, a production deploy of `main`, then on the branch deploy of `epic/robusta-v2`: the install on Node 22 with yarn 4.17.1 from `.yarn/releases`, no function, an unknown article URL answering 404 with the not-found page still on screen after load, the English-to-French walk — the English yield-farming article, its other-locale link, then the French article's category link — fetching only files, which decides the fallback of R-TANSTACK-66 rather than AC-TANSTACK-2 (OQ-TANSTACK-13), `M87.jpg` answering 200, and the host's answers to a trailing slash and an uppercase letter.
- R-TANSTACK-105 : The Deployment section of the site's README records the first green deploy, which settles AC-BOOTSTRAP-81.

### Acceptance Criteria

- AC-TANSTACK-1 : Étant donné un Clean checkout, quand Tux lance le Green set, alors les cinq builds aboutissent, `apps/dakar` et `apps/robusta` produisent les pages qu'ils produisaient avant et les 38 tests du site passent ; le site v2 écrit `/`, chaque URL de `urlSet` et la page 404 en HTML complet, le titre, l'auteur et le corps d'un article lisibles JavaScript désactivé ; la vérification de la table des routes fait toujours échouer le build à la moindre différence (AC-URLSCHEME-42) ; et le source du site ne porte aucun `'use client'`, aucun `'use server'` ni aucun import local sans son suffixe `.js`.
- AC-TANSTACK-2 : Étant donné l'article français sur le yield farming ouvert dans un navigateur, quand Barbot suit son lien de category vers `/l/fr/articles/c/blockchain` puis revient à l'article par le bouton retour, alors chaque page s'affiche sans rechargement complet, l'article avec son titre et son corps, et chaque requête reçoit un fichier du déploiement — page, script, feuille de style, image ou donnée écrite au build — aucune n'exécutant de code serveur ni ne lisant `content/articles` (BR-PYRAMID-7).
- AC-TANSTACK-3 : Étant donné des captures de référence de `/` et des onze articles à 375, 768 et 1280 px, prises sur le build Next avant que cette story ne change le moindre code, quand Ada compare les mêmes pages sur le nouveau build une fois les polices chargées, alors elles s'affichent à l'identique : les trois polices viennent du site lui-même sans aucune requête tierce, chaque Design token vient du design system, chaque page porte `noindex`, et aucun client de Telemetry n'est livré.
- AC-TANSTACK-4 : Étant donné une adresse que le build Next redirige ou déclare Gone — une des 66 lignes v1 permanentes, une des six lignes Gone, tout autre chemin `/learn`, `/articles/p/1`, ou une Locale par défaut marquée comme `/l/en/articles/c/web/{slug}` — quand Barbot la demande, alors elle répond 404 avec la page 404, et le déploiement ne porte aucune règle de redirection.
- AC-TANSTACK-7 : Étant donné les cas limites, quand Barbot ou Nina les rencontrent, alors une URL inconnue, sous la Content root ou ailleurs, répond 404 avec la page 404 toujours à l'écran une fois les scripts exécutés, jamais la page d'accueil avec un 200 ; une URL portant une majuscule ou un slash final n'est jamais servie comme une page avec un 200, tandis que `/article-images/theory/images/M87.jpg` répond 200 à sa casse exacte ; un article qu'aucune autre page ne lie est prérendu quand même, si bien qu'un article ajouté par Nina se construit sans changement de code ; un article qui ne déclare aucune couverture, une fixture de test puisque chaque article migré en déclare une, n'affiche aucun cadre de couverture vide ; un lecteur dont l'onglet était ouvert avant un déploiement atteint toujours la page qu'un lien vise, par un chargement complet s'il le faut, jamais une page d'erreur ; un commit qui ne touche que `apps/dakar` ne déclenche aucun déploiement de production du site v2.
- AC-TANSTACK-8 : Étant donné les pages de la Locale française — les trois articles français et toutes les autres pages sous `/l/fr` — quand le site est construit, alors leurs documents déclarent `lang="fr"` ; et étant donné l'article français sur le yield farming ouvert dans un navigateur, quand Barbot suit son lien de category, alors la langue du document reste `fr`, sans rechargement.

## Boundaries

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers. Netlify sert les fichiers de `apps/robusta-build/dist/client` et n'exécute rien ; aucun chemin `/_serverFn/*` n'existe sur le déploiement.

- `GET /` et chaque URL de `urlSet` — 200, le `<path>.html` prérendu (`index.html` pour `/`), `noindex`, `<html lang>` de la Locale de la page
- `GET /__tsr/staticServerFnCache/{sha1}.json` · nouveau — 200, un fichier de données par page d'article et un pour le flux de notes, écrits au build
- `GET /assets/{fichier haché}` · nouveau — 200, scripts, feuilles de style, polices, wordmark · avant : `/_next/static/…`
- `GET /article-images/{path}` — 200, le fichier ; le chemin est sensible à la casse
- `GET` une adresse v1 : une ligne permanente, une ligne Gone, tout chemin `/learn` — 404, `404.html` · avant : 308 ou 410
- `GET` une page un explicite ou une Locale par défaut marquée — 404, `404.html` · avant : 308
- `GET` une URL avec un slash final — 301 de l'hébergeur vers la forme canonique · avant : 308
- `GET` une URL portant une majuscule — 301 de l'hébergeur vers sa forme en minuscules quand ce fichier existe, 404 sinon · avant : 308
- `GET` le chemin canonique d'une page suivi de `.html` — 200, le même document, servi par l'hébergeur
- tout autre `GET` — 404, `404.html`, qui ne charge aucun script

Les library APIs des packages `page-data`, `routes`, `article`, `landing` et `components` du site, son CLI API et ses configurations Vite et Netlify sont dans le design file. Les scripts racine de la v2 sont `yarn build:robusta` et `yarn dev:robusta`, ceux de la v1 `yarn build:robusta-v1` et `yarn dev:robusta-v1`. Inchangés : les library APIs des trois packages de base et les custom properties de police que lit `colors_and_type.css`.

## Décisions

- 2026-10-06 — Netlify héberge le site v2 ; le projet Vercel `robusta-build-v2` est abandonné. Pourquoi : l'offre gratuite de Netlify autorise l'usage commercial, pas Vercel Hobby, et Nicolas préfère son expérience. Les crédits se comptent par équipe, 300 par mois en Free avec un plafond qui met les sites en pause ; le changement de domaine se fait sur l'offre Personal.
- 2026-10-06 — Next.js App Router et les React Server Components sont abandonnés pour ce site : « un React standard, pas de use client ou use server ». Pourquoi : sur environ 25 pages, les RSC économisent quelques dizaines de Ko et coûtent deux mondes de composants, une frontière client, un cache opaque et la dépendance à Next.
- 2026-10-06 — TanStack Start, plutôt qu'un export statique ou React Router en mode framework. Pourquoi : le site doit garder un serveur à portée pour de futurs web services (server routes, server functions ou Netlify Functions), et Netlify est le partenaire de déploiement officiel de TanStack Start.
- 2026-10-06 — Les pages sont prérendues au build, la liste dérivée de `urlSet`, puis hydratées ; `ssr: false` n'est pas le mécanisme. Pourquoi : dans TanStack Start, il produit un document vide qu'un crawler ne lit pas.
- 2026-10-06 — Aucune redirection : les 66 adresses v1 permanentes et les 6 Gone répondent 404, comme une page un explicite et une Locale par défaut marquée ; seul l'hébergeur répond 301 à un slash final ou à une majuscule, jamais une page en 200, Pretty URLs restant activé. Les clauses de redirection de seo-url-scheme sont remplacées, le mapping v1 reste écrit (R-URLSCHEME-14 et 28). Pourquoi : Nicolas, « on peut abandonner ces vieilles URL. On verra à la fin si on peut les ramener par un autre format » — c'est restore-v1-urls ; OQ-TANSTACK-8.
- 2026-10-06 — Pas de middleware de normalisation de casse. Pourquoi : OQ-TANSTACK-3, `lgtm` — chaque URL que le site émet est en minuscules.
- 2026-10-06 — La route racine pose `<html lang>` d'après la Locale de la route, et html-lang-locale se clôt avec cette story. Pourquoi : OQ-TANSTACK-1, `lgtm`.
- 2026-10-06 — La couverture est un simple `<img>` ; AC-ARTICLEPAGE-12, le WebP de l'optimiseur, est retiré. Pourquoi : OQ-TANSTACK-4, `lgtm` — les couvertures pèsent de 8 à 142 Ko, et Netlify Image CDN lierait la page à l'hébergeur.
- 2026-10-06 — Deux server functions statiques calculent au build les données d'article et le flux de notes, livrées en fichiers ; aucune ne s'exécute sur une requête servie. Pourquoi : Gap-TANSTACK-5 du brainstorm, `lgtm`.
- 2026-10-06 — Aucune fonction SSR sur le déploiement : `@netlify/vite-plugin-tanstack-start` n'est pas utilisé. Pourquoi : OQ-TANSTACK-6 du brainstorm, `lgtm` — sa fonction capte tous les chemins et lirait le corpus sur une requête servie (BR-PYRAMID-7).
- 2026-10-06 — `main` déploie en production, `epic/robusta-v2` en déploiement de branche, et une règle d'ignore saute les builds qui ne touchent ni le site, ni ses trois packages, ni les manifestes racine. Pourquoi : OQ-TANSTACK-7 du brainstorm, `lgtm` — une production coûte 15 crédits sur 300, une branche aucun.
- 2026-10-06 — AC-TANSTACK-2 et AC-TANSTACK-8 passent sur les pages françaises ; default-locale-fr reste un item distinct. Pourquoi : OQ-TANSTACK-12 du design, arbitrée par Nicolas.
- 2026-10-06 — Le parcours anglais → français de R-TANSTACK-104, et non AC-TANSTACK-2, décide du repli JSON des server functions statiques. Pourquoi : OQ-TANSTACK-13, `lgtm` — aucune page française ne lie un autre article français.
- 2026-10-06 — Les scripts racine de la v2 prennent les noms courts `build:robusta` et `dev:robusta`, la v1 passe en `build:robusta-v1` et `dev:robusta-v1`. Pourquoi : demande de Nicolas ; remplace la décision du 2026-07-31 de bootstrap-robusta-build.
- 2026-10-06 — AC-TANSTACK-5 est fusionné dans AC-TANSTACK-1 et AC-TANSTACK-6 est retiré ; leurs numéros ne sont pas réutilisés. Pourquoi : html-lang-locale demandait AC-TANSTACK-8 ; Nicolas, « AC-TANSTACK-6 : on s'en fiche, ignore ».
- 2026-10-06 — Le repli JSON de R-TANSTACK-66 n'est pas nécessaire : en production, AC-TANSTACK-2 et le parcours de R-TANSTACK-104 passent en navigation client, les données arrivant en fichiers `/__tsr/staticServerFnCache/*.json`.
- 2026-10-06 — La clause dakar d'AC-TANSTACK-7 est tenue pour acquise sans vérification. Pourquoi : Nicolas, « dakar est out pour l'instant, on suppose que c'est ok ».

## Open Questions & Gaps

- Gap-TANSTACK-14 : R-TANSTACK-84 promet un seul chargement complet quand le chunk de route d'une navigation client manque. Livré, un chunk manquant pour de bon provoque deux rechargements complets avant l'état d'erreur : celui que `lazyRouteComponent` de TanStack Router fait de lui-même, puis celui de `NavigationFailure`. Un vrai déploiement se résout au premier.
- Proposition : accepter l'écart sans correctif et le consigner en Décision.
- Rationale : le lecteur d'un onglet ouvert avant un déploiement atteint sa page au premier rechargement ; le second ne touche qu'un chunk réellement absent, donc un défaut.
- Resolution:

- Gap-TANSTACK-15 : R-CONTENTSOURCE-03 (un processus lit un corpus au plus une fois) ne tient plus sous `vite build`, qui charge deux copies de `@robusta/pyramids-content` dans le même processus, donc deux lectures. BR-PYRAMID-7 n'est pas touchée : les deux lectures ont lieu au build.
- Proposition : amender R-CONTENTSOURCE-03 en « au plus une fois par copie chargée du module », comme le dit déjà `content.archi.md`.
- Rationale : la règle protégeait le temps de build, et une lecture de plus sur onze articles ne le menace pas.
- Resolution:

## Documentation updates

- changed la section Deployment de `apps/robusta-build/README.md` pour Netlify (R-TANSTACK-105)
- changed les sections Routing, One URL per page, v1 mapping, Styling, Fonts, Assets et Commands de `apps/robusta-build/README.md`, et retiré sa section `emit:redirects`
- changed `apps/robusta-build/robusta-build.archi.md`, réécrit en français sur TanStack Start et Netlify, et les en-têtes de package de `ArticleView.tsx`, `NotesSection.tsx`, `assets.ts` et `page-data/index.ts`
- changed `root.archi.md` : vue d'ensemble, entrées des apps, diagramme, flux de contenu, Green set
- changed les sections Repository, Apps, Install / clean, Tests, Styling et Other de `CLAUDE.md`
- changed les commentaires d'en-tête de `packages/robusta-design-system/colors_and_type.css` et `fonts.css`
- changed l'en-tête de `.yarnrc.yml`
- changed le paragraphe de déploiement de `ROADMAP.md` qui nommait `robusta-build-v2`
- changed le `README.md` racine
- changed `packages/robusta-design-system/design-system.archi.md` et le `README.md` du package
- changed `packages/pyramids-content/content.archi.md` et `packages/pyramids-routing/routing.archi.md`, avec les en-têtes de package de leurs `src/index.ts`
- modifier l'entrée `Canonical URL` de `ubiquitous-language.md`, via epicman comme greffier — pourquoi : elle dit que toute autre forme, casse comprise, redirige en permanent vers la forme canonique ; le site n'en redirige aucune, seul l'hébergeur répond 301 à un slash final ou à une majuscule. Reportée : le fichier porte des modifications non commitées d'une autre origine.

## Dependencies

- Dep 2 : le site Netlify `robusta-build`, relié au dépôt, package directory `apps/robusta-build`, production `main`, déploiement de branche `epic/robusta-v2`, règle d'ignore — levée.
- Dep 3 : les designs de robusta-landing-page et de seo-excellence attendaient cette story — levée par ce land.
