# Story : la page anglaise à la racine, sans redirection

**Dernière mise à jour :** 2026-11-03
**Feature :** default-locale-at-root
**Infix :** ROOTLOCALE
**Status :** DONE (2026-11-05, commit 2fbc7be sur main)

## Story

**En tant qu'**éditeur de robusta.build, **je veux** servir la landing page anglaise à la racine du site, en 200 et à sa propre adresse, et le contenu anglais sans préfixe de Locale, **afin qu'**aucune redirection ni copie ne s'interpose entre un visiteur ou un moteur de recherche et la page canonique.

## Contexte & objectif

multilingual-site préfixait toutes les Locales, `en` comprise, et `/` répondait 301 vers `/en`. Le 2026-11-01, Nicolas refuse ce préfixe : la Locale par défaut se sert sans marqueur (BR-PYRAMID-14), `/` est la landing page `en` et sa canonical URL, `fr` et `es` gardent `/fr` et `/es`.

## Livré

Commit `2fbc7be`. 490 tests du site (464 avant), lint du site vert, `tsc --noEmit` propre, `yarn build:robusta` vert : 33 pages, 3 landing pages et 30 URL de contenu, 14 sous `/articles/…` et 16 sous `/fr/articles/…`, rien sous `/en`, 53 fichiers de données. Les six AC validés : AC-ROOTLOCALE-1, 3 et 6 sur un draft deploy Netlify CLI, alias `dev` (deploy `6aea49cee5e834ef0e27b242`), et sous `vite dev`.

### Requirements

- R-ROOTLOCALE-01 : `buildUrl` émet la landing page de la Locale par défaut à `/` et son contenu sous `/{contentRoot}…`, sans marqueur de Locale ; une autre Locale garde `/{locale}` (BR-PYRAMID-14).
- R-ROOTLOCALE-02 : `parseUrl` lit un chemin sans préfixe comme une page de la Locale par défaut, `/{autre}…` comme une page de cette Locale, et `/{défaut}…` comme la même page que sa forme sans préfixe ; tout autre chemin rend `undefined`.
- R-ROOTLOCALE-03 : `localeOfSegment` rend la Locale par défaut pour un segment absent, une autre Locale du schéma pour son code exact, `undefined` pour le code de la Locale par défaut et pour tout autre segment.
- R-ROOTLOCALE-04 : une spec du package `routing` échoue quand une Locale du site vaut son content root ou le premier segment de son asset root, `article-images` : sans discriminant de Locale, ces deux valeurs restent sans ambiguïté (BR-PYRAMID-1).
- R-ROOTLOCALE-21 : les sept fichiers de route passent de `src/routes/$locale/` à `src/routes/{-$locale}/`, et `src/routeTree.gen.ts` est régénéré.
- R-ROOTLOCALE-22 : la route de layout `src/routes/{-$locale}/route.tsx` filtre le segment par `localeOfSegment` dans `params.parse` et le rétablit par `params.stringify` ; `/en…` et une Locale non déclarée reçoivent la page 404, sous `vite dev` compris.
- R-ROOTLOCALE-23 : le loader racine obtient la Locale et les contreparties de `/` et de `/articles…` par `parseUrl`, au prérendu et après une navigation client ; son code ne change pas.
- R-ROOTLOCALE-24 : `prerender-pages` vérifie la route de layout et les sept fichiers sous `{-$locale}`, et prérend `/` en `index.html`, puis `/fr`, `/es`, `/404` et les URL de contenu ; aucun fichier sous `en`.
- R-ROOTLOCALE-25 : `check-route-table` lit `index.html` comme la page `/`, compare toutes les pages écrites à la dérivation, `404.html` exclue, et ne porte plus de garde propre à la racine.
- R-ROOTLOCALE-41 : `netlify.toml` perd la règle de `/` et porte deux règles 301 sans `force`, `/en` vers `/` et `/en/*` vers `/:splat` ; son en-tête les décrit.
- R-ROOTLOCALE-42 : la spec de `netlify.toml`, aujourd'hui `src/routing/root-redirect.spec.ts`, renommée `marked-locale-redirect.spec.ts`, vérifie exactement ces deux règles : `from` tiré de `urlScheme.defaultLocale`, la cible de la première égale à `buildUrl` de la landing page par défaut, 301, sans `force`.
- R-ROOTLOCALE-61 : tout lien vers une page anglaise vient de `buildUrl` : wordmark, liens de Locale de `Header`, lien « tous les articles » de la landing, fin d'article, `NotFoundPage` et `FailedNavigationPage` ; aucun `/en` littéral ne reste sous `src` hors des specs et de la v1 map générée.
- R-ROOTLOCALE-81 : `v1-url-map.generated.json` est régénéré : mêmes 82 lignes, même ordre, mêmes issues ; seules changent les destinations anglaises et la raison de la ligne `/`.

### Acceptance Criteria

- AC-ROOTLOCALE-1 : Given le site publié sur un deploy Netlify, When un visiteur ou un crawler ouvre `/`, Then il reçoit en 200, sans aucune redirection, la landing page anglaise, `lang="en"`, avec sa page copy RB Compound ; `/` est la seule adresse que le site construit pour cette page, le jumeau `.html` de l'hébergeur mis à part, et `/fr` et `/es` restent les landing pages française et espagnole.
- AC-ROOTLOCALE-2 : Given le corpus publié, When le site est construit, Then le contenu anglais est servi sans préfixe et le français sous `/fr` : `/articles/c/privacy/leaving-gmail` et `/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répondent 200, le site compte toujours 30 URL de contenu, 14 sous `/articles/…` et 16 sous `/fr/articles/…`, et aucune page n'est publiée sous `/en` : chaque page anglaise n'existe qu'à une adresse construite par le site, jumeau `.html` de l'hébergeur mis à part.
- AC-ROOTLOCALE-3 : Given une ancienne adresse anglaise préfixée, When un visiteur ouvre `/en`, `/en/` ou `/en/articles/c/blockchain`, Then il reçoit une redirection permanente vers la même page sans préfixe, `/` ou `/articles/c/blockchain`, servie par l'hébergeur.
- AC-ROOTLOCALE-4 : Given une page du site, When un visiteur suit ses liens, Then chaque lien vers une page anglaise mène à sa forme sans préfixe : le wordmark d'une page anglaise et le lien « tous les articles » de `/` mènent à `/` et `/articles`, le lien anglais de l'en-tête de `/fr/articles/c/blockchain` à `/articles/c/blockchain` et celui de `/es` à `/`, `quitter-gmail` lie `leaving-gmail` sous `/articles/…` ; dans l'autre sens, `/` lie `/fr` et `/es`, et `leaving-gmail` lie `/fr/articles/c/privacy/quitter-gmail`, que la page soit prérendue ou atteinte par une navigation client depuis `/fr` ; enfin la page 404 comme l'état d'échec de navigation renvoient vers `/`.
- AC-ROOTLOCALE-5 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes 82 adresses v1 dans le même ordre avec la même issue (67 permanentes, 5 Gone, 10 sans destination), et seules changent les destinations anglaises, `/learn` menant à `/articles` et `/learn/fr/blockchain` toujours à `/fr/articles/c/blockchain`, et la raison de la ligne `/`, qui reste sans destination et dit que le site v2 sert sa landing page anglaise à cette même adresse.
- AC-ROOTLOCALE-6 : Given les cas limites, When le site est construit puis servi, Then `theory`, revendiquée par `fr` seule, n'a de page que sous `/fr`, `/articles/c/theory` répond 404, `/en/articles/c/theory` y mène par la 301 de l'hébergeur puis reçoit la page 404 anglaise, et le lien anglais de `/fr/articles/c/theory` mène à `/` ; `/es/articles` répond 404 tant qu'aucun article espagnol n'est publié ; `/fr/` et `/es/` reçoivent toujours la redirection permanente de l'hébergeur vers la forme sans barre finale, et `/` n'en reçoit aucune ; une adresse sous `/l/` ou une Locale que le site ne déclare pas, comme `/de`, reçoit la page 404 anglaise ; sous `vite dev`, `/` sert aussi la landing page anglaise, et `/en` comme `/en/articles` reçoivent la page 404 anglaise, la 301 n'existant que chez l'hébergeur.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses.

  routes · page-data · chrome · landing · components · scripts
      │
      └──library──→  package `url-scheme` in package `routing` [modified]
```

Hors figure, autre zoom : l'HTTP API de l'app, servie par Netlify.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /` — 200, `index.html`, la landing page `en`, sa canonical URL · avant : 301 vers `/en`, règle de `netlify.toml`
- `GET /articles…` — 200, les 14 URL de contenu `en` · avant : 404, servies sous `/en/articles…`
- `GET /en` → 301 `/` ; `GET /en/` et `GET /en/{reste}` → 301 `/{reste}`, deux règles de `netlify.toml` sans `force` ; une page absente en anglais finit en 404 · avant : 200
- `GET /fr`, `/es`, `/fr/articles…`, et `/{fr|es}/` en 301 de l'hébergeur — inchangés
- `GET /l/…`, `/de`, `/es/articles…`, `/articles/c/theory` et toute adresse inconnue — 404, la page 404 anglaise, retour vers `/` · avant : retour vers `/en`

### library API of package `url-scheme` in package `routing` — modified

```ts
type UrlScheme, PageUrl // unchanged

/** no prefix for the default Locale: `/`, `/articles…` */
function buildUrl(scheme: UrlScheme, page: PageUrl): string;

/** an unprefixed path is a page of the default Locale; a path marked with
 *  the default Locale reads as that same page, its canonical form unmarked */
function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;

/** new — the Locale an optional first route segment designates */
function localeOfSegment(scheme: UrlScheme, segment: string | undefined): string | undefined;
```

## Décisions

- 2026-11-03 — `/en…` répond 301 de l'hébergeur vers la même page sans préfixe (OQ-ROOTLOCALE-1). Pourquoi : écarté, un rewrite 200 de `/` vers `/en`, qui crée une copie de la page.
- 2026-11-03 — BR-PYRAMID-14 au registre : un site sert les pages de sa Locale par défaut sans marqueur de Locale (OQ-ROOTLOCALE-2). Prix accepté : changer de Locale par défaut déplacera des URL.
- 2026-11-03 — Un seul jeu de routes sous un segment optionnel `{-$locale}`, filtré par une route de layout ; `/en…` et une Locale non déclarée ne correspondent à aucune route (OQ-ROOTLOCALE-5). Pourquoi : la 301 n'existe que chez l'hébergeur, `vite dev` sert la page 404.
- 2026-11-03 — Le jumeau `.html` que Netlify sert en 200 pour toute page reste hors périmètre (Gap-ROOTLOCALE-3). Pourquoi : réglage d'hébergeur pour tout le site ; le canonical link qui le traite revient à seo-excellence.

## Documentation updates

- changed l'introduction, §Routing, §The route table, §One URL per page, §The v1 mapping, la commande `dev` et §Deployment dans `apps/robusta-build/README.md`
- changed `apps/robusta-build/robusta-build.archi.md`, `apps/robusta-build/src/routing/url-scheme/url-scheme.archi.md` et `root.archi.md`, via archiman, ainsi que les en-têtes de package de `url-scheme/index.ts`, `router.tsx`, `routing/scheme.ts`, `check-route-table.mjs` et `prerender-pages.mjs`
- changed l'en-tête de `apps/robusta-build/netlify.toml`, dans le commit `2fbc7be`
- changed « chacune sous son préfixe » dans `CLAUDE.md`

## Dependencies

- Dep 1 : multilingual-site, LANDED le 2026-10-31 (`fb4803b`) — levée.
- Débloque glossary-refresh (AC-GLOSSARY-1, 2 et 7 à réécrire), blog-rolls (accueil du blog `en` à `/articles`), seo-excellence (landing pages `/`, `/fr`, `/es`, x-default sans préfixe) et restore-v1-urls (destinations `en` régénérées).
