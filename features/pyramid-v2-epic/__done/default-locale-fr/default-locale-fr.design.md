# Design: Le français devient la Locale par défaut de robusta.build

**Last update:** 2026-10-08
**Feature:** default-locale-fr
**Infix:** DEFAULTLOCALE
**Status:** IMPLEMENTED (2026-10-08, commit d711893)
**Sources:** [story](default-locale-fr.story.md), [brainstorm](default-locale-fr.brainstorm.md), [epic](../../pyramid-v2.epic.md)

## Goal

`urlScheme` passe à `fr` par défaut et `en` seule autre Locale ; tout ce qui lit déjà le schéma suit sans code. Autour de ces deux valeurs : la racine de la Site configuration lit le schéma, la v1 map calcule ses adresses v1 avec les Locales de v1 figées, et la 404, l'état d'échec de navigation et la fin de page article passent en français. Le pourquoi est dans la [story](default-locale-fr.story.md).

## Ubiquitous Language

Termes du glossaire employés : Locale (la Locale par défaut sans marqueur, les autres sous `/l/<locale>`), Site configuration, Published article, Category, Blog roll, Page copy. « v1 map » nomme `v1UrlMap` et sa sortie JSON, comme dans la story : un nom de code, hors glossaire.

## Business Rules (cited)

- BR-PYRAMID-10 — A site publishes an article only if that article declares itself published.
- BR-PYRAMID-11 — robusta.build must have no locale other than French.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Packages of app `@robusta/robusta-build`.

  routes   page-data   landing   Site configuration   scripts
    │          │          │       [modified]             │
    │          │          │              │               │
    └──────────┴──────────┴───library────┴───────────────┘
                               ↓
                   package `routing` [modified]
```

### HTTP API of app `@robusta/robusta-build` — modified

Le bloc de la [story](default-locale-fr.story.md#boundaries), tel quel. Erreurs et garanties en plus :

- Aucune redirection : `/l/fr/…` et toute adresse non construite reçoivent `404.html` de Netlify, `netlify.toml` inchangé.
- `404.html` est un seul document : `lang="fr"` et texte français quelle que soit l'adresse demandée, sous `/l/en` comprise.
- Le build écrit 21 pages de contenu, 7 sans marqueur et 14 sous `/l/en`, plus `/` et `/404`, et rien sous `dist/client/l/fr`. `check-route-table` tient déjà le prerender contre la dérivation.
- Une page article anglaise déclare `<html lang="en">` et `<article lang="en">`, son `<nav>` de fin `lang="fr"`.

### library API of package `routing` in app `@robusta/robusta-build` — modified

Client code : les routes, `page-data`, `landing`, la Site configuration, et en Node `scripts/emit-v1-map.mjs`, `prerender-pages.mjs`, `check-route-table.mjs`.

Types inchangés, cités : `UrlScheme` (`@robusta/pyramids-routing`), `ArticleIndexEntry`, `V1MappingRow`.

```ts
// scheme.ts — values modified, shape unchanged:
// defaultLocale 'fr', otherLocales ['en']
const urlScheme: UrlScheme;

// v1-url-map.ts
/** new — the Locales v1 published, frozen with the rest of the v1 inventory:
 *  { defaultLocale: 'en', otherLocales: ['fr'] } */
const V1_LOCALES: Pick<UrlScheme, 'defaultLocale' | 'otherLocales'>;

/** Same signature. Every `from` comes from V1_LOCALES; every `to` is built
 *  with `scheme`, in the language of the v1 page. */
function v1UrlMap(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[];
```

Garanties de `v1UrlMap` :

- Aucun `from` ne lit `scheme.defaultLocale` ni `scheme.otherLocales` : la liste des Locales de `v1UrlMap`, `v1Path`, `articleRows` et `tagRows` passent sur `V1_LOCALES`.
- Mêmes `from`, même `kind`, même ordre, quelles que soient les Locales de `scheme`.
- Aucune erreur nouvelle : `buildUrl` accepte une Locale absente du schéma, donc une destination qui cesse d'être construite est attrapée par la spec de R-DEFAULTLOCALE-25, pas par `v1UrlMap`.

Client code, dans `scripts/emit-v1-map.mjs`, inchangé :

```js
const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
const { v1UrlMap } = await import(join(compiled, 'routing/v1-url-map.js'));
const rows = v1UrlMap(urlScheme, await getArticleIndex());
```

## Technical Constraints

- `scheme.ts` et `v1-url-map.ts` sont compilés par `tsconfig.routing.json` vers `.routing-dist` et exécutés en Node pur : `V1_LOCALES` vit dans `v1-url-map.ts`, sans import React ni import réservé au bundler. La Site configuration lit `scheme.ts`, jamais l'inverse (import PNG du wordmark).
- `emit:v1-map` tourne à chaque `dev` et `build` et réécrit `v1-url-map.generated.json` : le JSON commité est celui régénéré après le changement, et aucune spec ne prend ses attentes dans ce fichier.
- vitest tourne en `environment: 'node'`, sans DOM ni effet : `<html lang>` ne s'observe que sur le prérendu (`dist/client/index.html`, `404.html`, `l/en/articles.html`), l'état d'échec de navigation que par un rendu sans effet (R-DEFAULTLOCALE-42).
- Sous `apps/robusta-build/src` : imports locaux en `.js`, aucun `'use client'` ni `'use server'` (`check-source` fait échouer le build).

## Requirements

### Locales du site

- R-DEFAULTLOCALE-01 : `urlScheme` déclare `defaultLocale: 'fr'` et `otherLocales: ['en']`, première étape vers BR-PYRAMID-11. Ce qui lit le schéma suit sans autre code : table de routes et prerender (`contentUrls`), `<html lang>` (`__root.tsx`), flux de notes de `/` et son lien « all articles », `articleUrl`, `blogConfig`.
- R-DEFAULTLOCALE-02 : la racine de la Site configuration lit `defaultLocale` et `otherLocales` de `urlScheme`, comme `blogConfig` ; `seopyramids.config.ts` n'écrit plus aucune Locale.
- R-DEFAULTLOCALE-03 : les specs qui lisent le corpus réel ou la Locale par défaut prennent leurs attentes des AC : `migrated-corpus` (les 21 URL), `article-page` (paire yield farming, category URL), `notes-feed`, `NotesSection` (son cas « Locale donnée » passe à `en`, vers `/l/en/articles`). Les chaînes `/l/fr/…` qui ne passent pas par le schéma restent : `SiteLink`, `reloadOnce`, `urlOfHtmlFile`, les payloads de fixture d'`ArticleView`.

### v1 map

- R-DEFAULTLOCALE-21 : `v1-url-map.ts` exporte `V1_LOCALES` à côté des trois constantes d'inventaire v1, et `v1UrlMap` calcule chaque `from` avec elle seule. Les commentaires du module qui disent « non-default locale » nomment la Locale de v1.
- R-DEFAULTLOCALE-22 : chaque ligne mène à une page dans la langue de la page v1 : une adresse v1 sans marqueur vise `en` tant qu'elle est publiée, `/learn/fr/…` vise `fr`, une ligne d'article la Locale de l'article, une ligne de tag `en`.
- R-DEFAULTLOCALE-23 : `v1-url-map.generated.json` est régénéré par `scripts/emit-v1-map.mjs` et commité dans le même changement. Son diff ne touche que des `to` et les deux Locales de l'en-tête, qui restent celles de `urlScheme`, le schéma des destinations.
- R-DEFAULTLOCALE-24 : une spec fige les 82 paires (`from`, `destination.kind`) dans l'ordre, extraites une fois de la map commitée à HEAD (`git show HEAD:apps/robusta-build/src/routing/v1-url-map.generated.json`), et exige que `v1UrlMap(urlScheme, index)` les reproduise. La spec « only the French ones twice » reste telle quelle.
- R-DEFAULTLOCALE-25 : une spec exige que chaque destination permanente soit une URL que le site construit, `buildUrl(urlScheme, …)` sur `urlSet(urlScheme, index)`.

### Texte de page

- R-DEFAULTLOCALE-41 : `NotFoundPage` est rédigée en français : « page introuvable », « Aucune page n'est publiée à cette adresse. », lien « retour à l'accueil » vers `/`.
- R-DEFAULTLOCALE-42 : l'état d'échec de navigation est rédigé en français : « cette page n'a pas pu se charger », liens « réessayer cette adresse » et « revenir à l'accueil ». Il est rendu par un composant sans état du package `components`, `FailedNavigationPage({ href }: { href: string })`, que `NavigationFailure` rend quand `reloadOnce` abandonne ; `reloadOnce` ne change pas.
- R-DEFAULTLOCALE-43 : le `<nav>` de fin d'`ArticleView` porte `lang="fr"` et un texte constant, quelle que soit la Locale de l'article : `aria-label` « Pour continuer la lecture », « Classé dans » devant la category, « Autre langue : » devant le lien de traduction. Ce lien garde `translation.label`, écrit dans sa propre langue, avec ses `lang` et `hrefLang`.

## Acceptance Criteria

- AC-DEFAULTLOCALE-1 : Given les trois articles français publiés, When le site est construit, Then eux, le blog roll français et leurs pages de category sont servis sans marqueur de Locale : `/articles` est le blog roll français, `/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répond 200, et l'ancienne adresse marquée `/l/fr/articles/c/blockchain` répond 404 avec la page 404, sans redirection.
- AC-DEFAULTLOCALE-2 : Given les huit articles anglais encore publiés, When le site est construit, Then eux, leur blog roll et leurs pages de category sont servis sous `/l/en`, `/l/en/articles/c/privacy/leaving-gmail` répond 200, et le site compte toujours 21 URL de contenu, 7 sans marqueur et 14 sous `/l/en`.
- AC-DEFAULTLOCALE-3 : Given une page sans marqueur de Locale, `/` et la page 404 comprises, When un visiteur l'ouvre, Then son document déclare `lang="fr"`, et une page sous `/l/en` déclare `lang="en"` ; la page 404, servie aussi pour une adresse inconnue sous `/l/en`, et l'état d'erreur d'une navigation échouée sont rédigés en français.
- AC-DEFAULTLOCALE-4 : Given trois articles français publiés et une section de notes de quatre places, When un visiteur ouvre `/`, Then elle liste ces trois articles, aucun article anglais ni aucune traduction non publiée, et son lien vers tous les articles mène à `/articles`.
- AC-DEFAULTLOCALE-5 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes adresses v1 dans le même ordre, avec la même issue chacune (82 lignes : 66 permanentes, 6 Gone, 10 sans destination), et seules les destinations changent, chacune étant une URL que le site construit, dans la langue de la page v1 : `/learn/fr/blockchain` mène à `/articles/c/blockchain`, `/learn` à `/l/en/articles`, `/learn/tag/web` à `/l/en/articles/c/web`.
- AC-DEFAULTLOCALE-6 : Given les cas limites, When le site est construit, Then une category revendiquée par une seule Locale n'a de page que dans celle-ci : `web`, que seuls des articles anglais publiés revendiquent, existe sous `/l/en` et `/articles/c/web` répond 404 ; `theory`, que seul un article français revendique, existe sans marqueur et `/l/en/articles/c/theory` répond 404 ; aucune des six traductions françaises non publiées n'a d'adresse.
- AC-DEFAULTLOCALE-7 : Given une page article, anglaise sous `/l/en` comprise, When un visiteur en lit la fin, Then elle est rédigée en français et se déclare `lang="fr"`, le nom de langue du lien de traduction restant dans sa propre langue ; l'article français sur le yield farming et sa version anglaise se lient l'un à l'autre à leurs nouvelles adresses, et `leaving-gmail`, dont la traduction n'est pas publiée, n'a aucun lien de traduction.

Edge cases to test:

- Une page article anglaise garde `<html lang="en">` et `<article lang="en">` ; seul son `<nav>` de fin déclare `fr`.
- Un article français a deux lignes v1, l'adresse sans marqueur que v1 a publiée et la forme `/learn/fr/…`, toutes deux vers son adresse sans marqueur ; un article anglais n'en a qu'une : 14 lignes d'article, 11 sans marqueur, 3 sous `/learn/fr`.
- Une category v1 qu'aucun article publié de sa Locale ne revendique mène au blog roll de cette Locale : `/learn/fr/web` mène à `/articles`.
- Aucune des six traductions non publiées (BR-PYRAMID-10) n'apparaît dans la section de notes de `/`, ni comme lien de traduction d'un article anglais.

## Dependencies

Celles de la [story](default-locale-fr.story.md#dependencies). En plus, pour translate-english-articles : la v1 map dérive ses lignes d'article de l'index, donc chaque traduction publiée y ajoute deux adresses v1 que v1 n'a jamais publiées. La spec de R-DEFAULTLOCALE-24 échoue alors ; le sort de ces lignes revient à cet item ou à restore-v1-urls.
