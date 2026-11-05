# Design: la Locale par défaut sans préfixe, la landing page anglaise à la racine

**Last update:** 2026-11-03
**Feature:** default-locale-at-root
**Infix:** ROOTLOCALE
**Status:** IMPLEMENTED (2026-11-03, commit 2fbc7be)
**Sources:** [story](default-locale-at-root.story.md), [brainstorm](default-locale-at-root.brainstorm.md), [epic](../../pyramid-v2.epic.md), [multilingual-site](../multilingual-site/multilingual-site.design.md)

## Goal

`buildUrl` cesse de préfixer la Locale par défaut : `/` est la landing page `en`, le contenu anglais vit sous `/articles…`, `fr` et `es` gardent leur préfixe. Les sept fichiers de route passent sous un segment de Locale optionnel, `{-$locale}`, filtré à la correspondance par une route de layout ; le prérendu écrit `index.html` à la racine ; `netlify.toml` remplace la règle de `/` par deux 301 depuis `/en…`. Liens, contreparties, page 404 et v1 map suivent `buildUrl` sans autre changement. Le pourquoi : [story](default-locale-at-root.story.md).

## Boundaries

```
  Packages of app `@robusta/robusta-build`. Arrow = depends on, from client
  code to the API it uses. No loop.

  vite.config.ts ──library──→ scripts/prerender-pages [modified] ───┐
  `build` script ──CLI──────→ scripts/check-route-table [modified] ─┤
                                                                    │
  routes [modified] ─────────────────────────────────library────────┤
  chrome · landing · components · page-data                         │
  routing: v1-url-map [modified], counterparts ─────────────────────┤
                                                                    ↓
                              package `url-scheme` in package `routing`
                              [modified]

  Other zoom: the HTTP API of the app, served by Netlify.
```

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers. Le bloc de la [story](default-locale-at-root.story.md#boundaries), au zoom complet :

- `GET /` — 200, `index.html`, la landing page `en`, `lang="en"`, sa canonical URL. Un fichier occupe `/` : aucune règle ne s'y applique, aucune barre finale n'est normalisée.
- `GET /articles…` — 200, les 14 URL de contenu `en`, chacune `{chemin}.html`.
- `GET /fr`, `GET /es`, `GET /fr/articles…` — 200, inchangés : les 16 URL de contenu `fr` et les deux landing pages.
- `GET /en` — 301, `Location: /`. `GET /en/` et `GET /en/{reste}` — 301, `Location: /{reste}`. Deux règles `[[redirects]]`, `from = "/en"` → `to = "/"` et `from = "/en/*"` → `to = "/:splat"`, `status = 301`, sans `force` : aucun fichier n'existe sous `en`, elles s'appliquent toujours. Quand la page n'existe pas en anglais, la cible répond ensuite 404.
- `GET /fr/`, `GET /es/` — 301 vers la forme sans barre, par Pretty URLs, inchangé.
- `GET /l/…`, `GET /de`, `GET /es/articles…`, `GET /articles/c/theory` et toute adresse inconnue — 404, `404.html` : texte anglais constant, `lang="en"`, lien de retour vers `/`.
- Le jumeau `.html` que Netlify sert en 200 pour toute page (`/index.html`, `/fr.html`…) reste hors périmètre (story, §Contexte).

### library API of package `url-scheme` in package `routing` — modified

Client code : `routing` (`counterparts`, `content-urls`, `v1-url-map`), `page-data`, `chrome`, `components`, `routes` et son loader racine, les scripts sur `.routing-dist`.

```ts
type UrlScheme, PageUrl, AddressableArticle, SchemeViolation; // unchanged

/** default Locale unmarked: landing `/`, content `/{contentRoot}…`;
 *  any other Locale: `/{locale}`, `/{locale}/{contentRoot}…` */
function buildUrl(scheme: UrlScheme, page: PageUrl): string;

/** unprefixed path: a page of the default Locale; `/{other}…`: a page of that
 *  Locale; `/{default}…`: the same page as its unprefixed form; else undefined */
function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;

/** new — the Locale an optional first route segment designates: the default
 *  Locale when absent, another Locale when it names one; undefined when it
 *  marks the default Locale or names no Locale of the scheme */
function localeOfSegment(scheme: UrlScheme, segment: string | undefined): string | undefined;

// landingPages, urlSet, validateArticles: signatures unchanged, URLs through buildUrl
```

Garanties et erreurs :

- `buildUrl` n'émet jamais `/{defaultLocale}` en tête ni de barre finale ; `/` est la seule URL qui finit par `/`. Il lève toujours sur une page de roll inférieure à 1.
- La canonicité reste le point fixe du couple : `buildUrl(parseUrl(p))` est la forme canonique de `p`. `/en`, `/en/` et `/EN` donnent `/` ; `/en/articles/c/blockchain` donne `/articles/c/blockchain`. Tolérances de `parseUrl` inchangées : barre finale, casse, page un explicite.
- Après le marqueur de la Locale par défaut, `parseUrl` ne lit que des formes de cette Locale : `/en/fr` et `/en/en` rendent `undefined`. `/404`, `/l/…`, `/de` et `/article-images/…` rendent `undefined`.
- `localeOfSegment` est strict, sans tolérance de casse : il décide de ce que la table de routes sert, donc des formes canoniques seules. `parseUrl` est tolérant : il canonicalise.
- `landingPages` rend toujours la Locale par défaut en premier, donc `/` d'abord.
- `url-scheme` n'importe toujours rien hors de son répertoire, ni React, ni `node:*`.

Client code, dans `src/routes/{-$locale}/route.tsx` :

```ts
import { urlScheme } from '@/routing/scheme.ts';
import { localeOfSegment } from '@/routing/url-scheme/index.ts';
export const Route = createFileRoute('/{-$locale}')({
  params: {
    parse: ({ locale }) => {
      const resolved = localeOfSegment(urlScheme, locale);
      return resolved === undefined ? false : { locale: resolved };
    },
  },
});
```

### library API of package `routes` in app `@robusta/robusta-build` — modified

Client code : le routeur (`src/router.tsx`, sur `src/routeTree.gen.ts` régénéré et commité), `scripts/prerender-pages.mjs`, qui vérifie ses fichiers.

- `src/routes/$locale/` devient `src/routes/{-$locale}/`, mêmes sept fichiers : la landing et les six formes de contenu, d'identifiants `/{-$locale}/`, `/{-$locale}/articles/`, `/{-$locale}/articles/c/$category/$slug`…
- Nouvelle route de layout `src/routes/{-$locale}/route.tsx`, sans composant : `params.parse` résout le segment par `localeOfSegment` et rend `false` quand il n'en résout aucun ; `params.stringify` en est l'inverse, la Locale par défaut redevenant un segment absent.
- Les sept routes reçoivent `params.locale` résolu : toujours une Locale du site, `en` quand le segment est absent. Leur corps ne change pas, seul leur identifiant.
- `/en…` et une Locale non déclarée ne correspondent à aucune route : le routeur rend `NotFoundPage` (`defaultNotFoundComponent`) sous `vite dev` ; le prérendu ne les demande jamais.
- `/404`, route statique, inchangée.
- Loader racine (`__root.tsx`) inchangé : `parseUrl` y lit désormais `/` et `/articles…` comme pages `en`, d'où `lang="en"` et les contreparties par `getCounterparts`, au prérendu comme après une navigation client. `/404` ne porte aucune `PageUrl`, donc aucune contrepartie.

### library API of script `prerender-pages` in app `@robusta/robusta-build` — modified

Client code : `vite.config.ts`.

```ts
/** the landing pages, `/` first, `/404`, then the content URLs; route files checked first */
async function prerenderPages(): Promise<{ path: string }[]>;

/** the layout route and the seven route files under `{-$locale}` that `routesDirectory` lacks */
function missingRouteFiles(routesDirectory: string, contentRoot: string): string[];

// assertRouteFilesFollow, pageList: unchanged
```

Le prérendu écrit `/` en `index.html` ; plus aucun fichier sous `en`.

### CLI API of script `check-route-table` in app `@robusta/robusta-build` — modified

Client code : le script `build`, après `vite build`.

- Invocation inchangée : `node scripts/check-route-table.mjs`.
- `urlOfHtmlFile('index.html')` rend `/` ; `fr.html` rend toujours `/fr`.
- `routeTableReport` perd `rootIndexWritten` et son message : `index.html` est une page comparée comme les autres. Absent, il sort en `derived but not built: /` ; un `en.html` ou un fichier sous `en/` sort en `built but not derived`.
- Exit 1 sur un désaccord ou un rendu qui a levé, exit 0 sinon, inchangés. Stdout inchangé : 33 pages construites, 3 landing pages et 30 URL de contenu, 53 fichiers de données.

### library API of package `routing` in app `@robusta/robusta-build` — modified

Client code : `scripts/emit-v1-map.mjs`, `page-data`, les specs.

```ts
/** signature unchanged; English destinations unprefixed through buildUrl */
function v1UrlMap(scheme: UrlScheme, articles: readonly ArticleIndexEntry[]): V1MappingRow[];
```

- La ligne `/` reste `{ kind: 'none' }`, sa raison devient `the v2 site serves its English landing page at this same address`.
- `urlScheme`, `LOCALES`, `counterpartsOf` et `contentUrls` inchangés.

## Technical Constraints

- TanStack Router 1.170.41, router-core 1.171.34 : le segment optionnel s'écrit `{-$locale}` dans un nom de dossier. `params.parse` est typé `TParams | false` ; `false` écarte la route pendant la correspondance, sur une route de layout comme sur une feuille, et le résultat de la layout s'accumule dans les params de ses enfants. Le chemin d'une correspondance s'interpole sur les params bruts : résoudre l'absence en `en` ne change aucune URL.
- Le serveur de TanStack Start redirige vers `buildLocation({ to: pathname })` quand il diffère de l'adresse demandée ; `to` y est un chemin concret, sans param à interpoler, donc `/` et `/articles…` ne sont pas réécrits.
- Prérendu (`autoSubfolderIndex: false`) : un chemin qui finit par `/` s'écrit `index.html`, les autres `{chemin}.html`.
- Netlify : une règle sans `force` cède à un fichier existant ; `/en/*` porte sur le segment `en` entier et ne capture pas `/enterprise`. `vite dev` n'applique pas `netlify.toml` : `/` y sert la landing page, `/en` et `/en/articles` la page 404 par le filtre de la layout. Le loader racine lit alors `/en` comme la landing `en`, et l'en-tête de ce 404 de développement porte ses liens de Locale ; le site publié ne sert jamais ce document. Les 301 ne se vérifient que sur un draft deploy (`npx netlify-cli deploy`, jamais `--prod`).
- Imports des fichiers de route : extension réelle, `.ts` ou `.tsx`, alias `@/` compris (`check:source`). `tsconfig.routing.json` est inchangé : aucun fichier de route n'y est compilé.

## Requirements

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

## Acceptance Criteria

- AC-ROOTLOCALE-1 : Given le site publié sur un deploy Netlify, When un visiteur ou un crawler ouvre `/`, Then il reçoit en 200, sans aucune redirection, la landing page anglaise, `lang="en"`, avec sa page copy RB Compound ; `/` est la seule adresse que le site construit pour cette page, le jumeau `.html` de l'hébergeur mis à part, et `/fr` et `/es` restent les landing pages française et espagnole.
- AC-ROOTLOCALE-2 : Given le corpus publié, When le site est construit, Then le contenu anglais est servi sans préfixe et le français sous `/fr` : `/articles/c/privacy/leaving-gmail` et `/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répondent 200, le site compte toujours 30 URL de contenu, 14 sous `/articles/…` et 16 sous `/fr/articles/…`, et aucune page n'est publiée sous `/en` : chaque page anglaise n'existe qu'à une adresse construite par le site, jumeau `.html` de l'hébergeur mis à part.
- AC-ROOTLOCALE-3 : Given une ancienne adresse anglaise préfixée, When un visiteur ouvre `/en`, `/en/` ou `/en/articles/c/blockchain`, Then il reçoit une redirection permanente vers la même page sans préfixe, `/` ou `/articles/c/blockchain`, servie par l'hébergeur.
- AC-ROOTLOCALE-4 : Given une page du site, When un visiteur suit ses liens, Then chaque lien vers une page anglaise mène à sa forme sans préfixe : le wordmark d'une page anglaise et le lien « tous les articles » de `/` mènent à `/` et `/articles`, le lien anglais de l'en-tête de `/fr/articles/c/blockchain` à `/articles/c/blockchain` et celui de `/es` à `/`, `quitter-gmail` lie `leaving-gmail` sous `/articles/…` ; dans l'autre sens, `/` lie `/fr` et `/es`, et `leaving-gmail` lie `/fr/articles/c/privacy/quitter-gmail`, que la page soit prérendue ou atteinte par une navigation client depuis `/fr` ; enfin la page 404 comme l'état d'échec de navigation renvoient vers `/`.
- AC-ROOTLOCALE-5 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes 82 adresses v1 dans le même ordre avec la même issue (67 permanentes, 5 Gone, 10 sans destination), et seules changent les destinations anglaises, `/learn` menant à `/articles` et `/learn/fr/blockchain` toujours à `/fr/articles/c/blockchain`, et la raison de la ligne `/`, qui reste sans destination et dit que le site v2 sert sa landing page anglaise à cette même adresse.
- AC-ROOTLOCALE-6 : Given les cas limites, When le site est construit puis servi, Then `theory`, revendiquée par `fr` seule, n'a de page que sous `/fr`, `/articles/c/theory` répond 404, `/en/articles/c/theory` y mène par la 301 de l'hébergeur puis reçoit la page 404 anglaise, et le lien anglais de `/fr/articles/c/theory` mène à `/` ; `/es/articles` répond 404 tant qu'aucun article espagnol n'est publié ; `/fr/` et `/es/` reçoivent toujours la redirection permanente de l'hébergeur vers la forme sans barre finale, et `/` n'en reçoit aucune ; une adresse sous `/l/` ou une Locale que le site ne déclare pas, comme `/de`, reçoit la page 404 anglaise ; sous `vite dev`, `/` sert aussi la landing page anglaise, et `/en` comme `/en/articles` reçoivent la page 404 anglaise, la 301 n'existant que chez l'hébergeur.

Edge cases to test:

- `/` atteinte par une navigation client depuis `/fr` : `lang="en"`, liens vers `/fr` et `/es`, wordmark vers `/`.
- `leaving-gmail` atteint par une navigation client depuis `/fr` : lien vers `/fr/articles/c/privacy/quitter-gmail`.
- `/en/articles/c/theory` : 301 vers `/articles/c/theory`, puis la page 404 anglaise ; depuis `/fr/articles/c/theory`, le lien anglais mène à `/`.
- `/en`, `/en/` et `/en/articles/c/blockchain` : 301 vers `/`, `/` et `/articles/c/blockchain`.
- `/fr/` et `/es/` : 301 vers la forme sans barre ; `/` : aucune redirection.
- `/de` et une adresse sous `/l/` : page 404 anglaise, retour vers `/`.
- `/es/articles` : 404 tant qu'aucun article espagnol n'est publié.
- Sous `vite dev` : `/` sert la landing page anglaise, `/en` et `/en/articles` la page 404 anglaise.
- v1 map : la ligne `/` reste sans destination et dit que le site v2 sert sa landing page anglaise à cette même adresse ; `/learn` mène à `/articles`.

## Dependencies

- Depends on : multilingual-site, IMPLEMENTED (2026-10-31, `fb4803b`) ; BR-PYRAMID-14 au registre.
- Blocks : blog-rolls, qui récrit les routes de listing sous `{-$locale}/articles/` ; glossary-refresh ; seo-excellence (landing pages `/`, `/fr`, `/es`, x-default sans préfixe) ; restore-v1-urls (destinations `en` régénérées).
