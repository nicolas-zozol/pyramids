# Architecture: robusta-build

**Last updated:** 2026-11-04
**Kind:** app

## Parent

- [root](../../root.archi.md)

## Children

- [url-scheme](src/routing/url-scheme/url-scheme.archi.md)
- [corpus-reader](src/content/corpus-reader/corpus-reader.archi.md)

## Overview

`@robusta/robusta-build` est le site version 2 de robusta.build, sur TanStack Start et Vite 8, publié par Netlify. `vite build` prérend dans `dist/client` la landing page de chaque Locale, la page 404 et chaque URL de contenu que le corpus dérive, et Netlify publie ce dossier tel quel : aucune fonction, deux règles de redirection, `/en` et `/en/*` en 301 vers la même page sans préfixe, aucun code exécuté sur une requête servie. Une page prérendue s'hydrate puis navigue côté client, et ses données arrivent en fichiers que cinq server functions statiques écrivent au prérendu : la Content source n'est lue qu'au build (BR-PYRAMID-7). Le site sert trois Locales (BR-ROBUSTA-1) : `en`, la Locale par défaut, sans préfixe (BR-PYRAMID-14), `fr` et `es` sous le leur. `/` est la Landing page de `en`, `/fr` et `/es` celles des deux autres, composée des sections du design system ; chaque Published article s'affiche en page article ; chaque page de listing, accueil du blog ou roll de Category, liste au plus 12 articles de sa Locale, du plus récent au plus ancien. L'en-tête et le pied de page du design system encadrent chaque document, 404 comprise ; l'en-tête mène à la même page dans chaque autre Locale, ou à défaut à sa landing page, et le pied de page lie l'accueil du blog et les Categories de la Locale quand elle publie un article. Chaque page se lit dans sa Locale, sur la page copy de cette Locale que fournit la Site configuration (BR-PYRAMID-8) ; la page 404 et l'état d'échec de navigation sont en anglais, texte constant. La build signale chaque Stale translation et ne la dépublie pas. Chaque document porte `noindex`. Le site ne sert pas les adresses v1 : leur correspondance est écrite, et rien ne la sert. Il ne porte aucun web service.

## Apps, modules, packages

- package `routes` — `src/routes/**`, `src/router.tsx` et l'arbre généré `src/routeTree.gen.ts` : la route racine, `/404`, puis sous `{-$locale}` la route de layout et sept fichiers, la landing page et six formes de contenu. La route de layout, `{-$locale}/route.tsx`, résout le segment de Locale optionnel par `localeOfSegment`, `en` quand il est absent, et écarte la correspondance quand il marque `en` ou ne nomme aucune Locale du site ; `params.stringify` rend `en` à un segment absent. Le loader de la route racine lit la Locale de l'adresse par `parseUrl`, la Locale par défaut pour une adresse hors du schéma, puis, en parallèle, les contreparties de la page par `getCounterparts` et la première page de chaque roll de cette Locale par `getLocaleRolls`. La route racine rend le document : `<html lang>` de cette Locale, `noindex`, les quatre feuilles de style dans l'ordre que fixe `src/routes/__root.tsx`, `Header` avant le contenu et `Footer` après, qui reçoit ces rolls, et aucun script sur la page 404. Les deux routes article chargent leur page par `getArticlePage` ; `{-$locale}/index.tsx` charge les quatre notes les plus récentes de sa Locale par `getNotesFeed` et rend `LandingPage` sous `landing.head` de sa page copy ; les quatre routes de listing chargent leur page par `getRollPage` et rendent `ListingPage` sous `listingHead` ; toute autre page est sous `head`. `getRouter()` pose `NotFoundPage` et `NavigationFailure` par défaut.
- package `page-data` — `getArticlePage`, `getNotesFeed`, `getCounterparts`, `getRollPage` et `getLocaleRolls`, cinq server functions dont le dernier middleware est `staticFunctionMiddleware`, seul chemin d'une route vers `content`. Exécutées au prérendu seulement, elles laissent un fichier par entrée distincte sous `dist/client/__tsr/staticServerFnCache`. `ArticlePage.versions` liste chaque autre version publiée de l'article ; `getCounterparts` applique `counterpartsOf` aux landing pages et aux URL de contenu. `getRollPage` rend un `RollPage` : les `NotePost` d'une page de roll, `tag` sur l'accueil du blog seulement, et `previousUrl` et `nextUrl` pris dans le jeu d'URL ; il lève au build sur une page que le jeu d'URL ne porte pas. `getLocaleRolls` rend la première page de chaque roll d'une Locale, accueil du blog d'abord, `[]` pour une Locale sans article publié. La date d'un article ou d'une note est écrite dans sa Locale, au build.
- package `article` — `ArticleView` rend un `ArticlePage` sans rien lire, chaque URL arrivant calculée, l'article sous le `lang` de sa Locale ; sa fin de page, dans la page copy de cette Locale, lie la Category et chaque autre version, nommée par son `localeName` et marquée de son `lang` et `hreflang`. `ArticleProse` porte l'unique `dangerouslySetInnerHTML` du site, sous son CSS Module.
- package `listing` — `ListingPage` rend un `RollPage` dans un `<main>` : le `h1`, titre du blog ou libellé de la Category, le `NotesPreview` des posts sans surtitre, titre ni lien vers tous les articles, chaque `tag` remplacé par le libellé de sa Category, puis un `nav` vers la page précédente et la suivante quand l'une existe ; le `h1` et le `nav` ne stylent qu'en tokens du design system. `listingHead` rend le `title` et la `description` d'une `RollUrl`, tirés du modèle `listing.head` de sa Locale et de sa sorte de page, remplis du libellé de la Category et, dès la page 2, de `pageSuffix`.
- package `landing` — `LandingPage`, un `<main>` qui compose `Hero`, le `FlowDiagram` de la version open source de RB Compound (`id="open-source"`), celui de la version complète (`id="complete"`), `PrinciplesList`, `NotesSection` et `CTA` du design system, dans cet ordre. Chaque prop de texte vient de la page copy de la Locale ou reste vide pour masquer, chaque appel au contact mène à `contact`, sans formulaire. `NotesSection` rend le `NotesPreview` des posts qu'il reçoit, absent sur un flux vide, le tag d'une note remplacé par le libellé de sa Category (BR-PYRAMID-8).
- package `chrome` — `Header` et `Footer`, que la route racine rend sur chaque document, dans la page copy de la Locale de la page. `Header` est le `SiteHeader` du design system : le wordmark vers la landing page de cette Locale, un lien par autre Locale, libellé par son `localeName` et marqué de son `lang` et `hreflang`, vers la contrepartie de la page ou, à défaut, la landing page de cette Locale, puis l'appel au contact. `Footer` est son `SiteFooter`, tagline et copyright, sans ligne de version, avec une colonne quand la Locale publie un article : l'accueil du blog, puis chaque Category de ses rolls, par ordre alphabétique de libellé selon la collation de la Locale.
- package `components` — `SiteLink`, seul endroit où une URL de `buildUrl` devient un lien du router, et le `linkComponent` que le site passe aux sections du design system ; une URL `https:` ou `mailto:` y reste une ancre simple. `NotFoundPage`, en anglais quelle que soit l'adresse, son lien de retour vers `/` ; `NavigationFailure`, qui recharge une fois l'adresse d'une navigation client échouée, puis rend l'état d'erreur, `FailedNavigationPage`, en anglais lui aussi.
- package `content` — la déclaration du corpus, `corpus.ts` : racine `content/articles`, Locale lue dans le frontmatter, Asset root `public/article-images` servi sous `/article-images`. Ses accès : `getArticleIndex`, seul endroit où une violation du corpus devient fatale, `getTranslationNotices`, `getArticleBody`, `getAssetUrl` et `findArticle`. L'import protection du build l'interdit côté client.
- package `corpus-reader` dans `content` — le contrat de lecture d'un corpus markdown : un `CorpusSpec` lu en index d'articles, corps HTML, assets publiés et notices de traduction. Il ne porte aucune valeur du site et n'importe rien hors de son répertoire.
- package `routing` — `scheme.ts` : `urlScheme`, `LOCALES`, le type `Locale` et `ROLL_SIZE`, seul endroit où `articles` et les trois Locales sont écrits ; `contentUrls`, la dérivation unique des URL de contenu, qui lève sur une violation du schéma ; `counterpartsOf`, la même page dans chaque autre Locale qui l'a, sans repli ; `v1UrlMap`, la correspondance v1, écrite dans `v1-url-map.generated.json` et lue par rien : ses adresses v1 suivent `V1_LOCALES`, les Locales de v1 figées, `en` sans marqueur, et ses destinations `urlScheme`. `content-urls.ts`, `counterparts.ts` et `v1-url-map.ts` lisent l'index d'articles : seuls `page-data`, les specs et les scripts les importent.
- package `url-scheme` dans `routing` — le schéma d'URL v2 en fonctions pures : les discriminants `c`, `p` et `t`, `buildUrl`, `parseUrl`, `localeOfSegment`, `landingPages`, `urlSet` et `validateArticles`. Il ne porte aucune valeur du site et n'importe rien hors de son répertoire.
- package `design-system` — `wordmarkSrc`, `heroMascotSrc` et `ctaMascotSrc`, les URL sous lesquelles Vite publie le wordmark et les deux mascottes du design system.
- package `styles` — `fonts.css`, les trois polices auto-hébergées depuis Fontsource, et `globals.css`, l'entrée Tailwind 4 et le pont de tokens : les noms qu'attend shadcn, `--destructive` sur `--brand-error` compris, tous des alias de tokens du design system (BR-PYRAMID-6).
- package `scripts` — les étapes Node du build : `check-source.mjs` sur le source de `src`, puis, sur `routing` et `content` compilés sous `.routing-dist` par `compile:seams`, `check-translations.mjs`, `emit-v1-map.mjs`, `copy-article-images.mjs`, `prerender-pages.mjs`, la liste de prérendu que lit `vite.config.ts`, et `check-route-table.mjs`, après `vite build`.
- package `test-support` — les helpers des specs du site : `markup.ts`, des requêtes sur le balisage d'un rendu serveur, dont `readableTexts`, ce qu'un lecteur reçoit, text nodes puis `alt`, `placeholder`, `aria-label` et `title` non vides ; `corpus-fixture.ts`, un corpus écrit dans un répertoire temporaire ; `designSystemClassNames`, les noms de classe que définissent les feuilles de style du design system ; `renderInRouter`, le rendu d'un élément dans un router. Seuls les specs l'importent.
- `src/seopyramids.config.ts` — la Site configuration ; ses trois Locales et les quatre valeurs de sa section de contenu viennent de `routing`. Elle porte `contact`, l'e-mail et le profil LinkedIn vers lesquels mène chaque appel au contact, et `pageCopy`, un bloc par Locale, en texte brut et dans sa Locale : `localeName`, le `head` des pages, la landing page et ses deux schémas, l'en-tête, le pied de page, la fin d'article, `listing`, soit le titre du blog, les modèles de head, la pagination et la colonne du pied de page des pages de listing, et `categoryLabels`. `getPageCopy` et `getCategoryLabel` sont ses seuls chemins de lecture ; le second lève en nommant la Category et la Locale quand la page copy de cette Locale n'a pas de libellé, ce qui fait échouer le prérendu.

## Diagram

```
  Arrow = depends on. Packages of app `@robusta/robusta-build`. No loop.
  A nested package follows its parent, in parentheses.

                                routes
     ┌──────────┬──────────┬────────┴─┬──────────┬───────────┐
     ↓          ↓          ↓          ↓          ↓           ↓
  article    listing    landing    chrome    components  page-data
     │          │          │          │          ↑        │      │
     └──────────┴──────────┴──────────┴──────────┘        │      │
                                                          ↓      │
                                          routing (url-scheme)   │
                                             │                   │
                                             ↓                   ↓
                                           content (corpus-reader)

  Omitted: `routes`, `listing`, `landing`, `chrome` and `components` →
  `routing`; `landing` and `chrome` → `design-system`; `article` and
  `listing` → `page-data`, a type only; `routes` → `styles`; `routes`,
  `article`, `listing`, `landing` and `chrome` → the site config, which →
  `routing` and `design-system`. `scripts`, outside src/, runs `routing`
  and `content` compiled. Other zoom: every package rendering a section →
  module `@robusta/pyramids-design-system`.
```

## Boundaries

```
  Arrow = from client code to the API it uses.

    browsers, crawlers          root scripts, Netlify build
            │                                │
            │ HTTP                           │ CLI
            ↓                                ↓
  ┌─────────────── app `@robusta/robusta-build` ───────────────┐
  │ HTTP: the files of dist/client, no code run on a request   │
  │ CLI:  build · dev · check:translations · test · lint       │
  └────────────────────────────────────────────────────────────┘
```

### HTTP API of app `@robusta/robusta-build`

Client code : navigateurs et crawlers. Netlify sert les fichiers de `apps/robusta-build/dist/client` et n'exécute rien.

- `GET /`, `/fr` et `/es` — 200, `index.html`, `fr.html` et `es.html`, la Landing page de la Locale, sous son propre `<title>` et sa propre description, sans `<form>` ni `<input>`
- `GET /en` — 301, `Location: /` ; `GET /en/` et `/en/{reste}` — 301, `Location: /{reste}`, par les deux règles `[[redirects]]` de `netlify.toml`, sans `force` : aucun fichier n'existe sous `en`. Une cible que le site ne construit pas répond ensuite 404
- `GET` chaque URL de `urlSet` — 200, le `<path>.html` prérendu, sous `/articles` pour `en` et `/fr/articles` pour `fr` : une Locale autre que `en` n'a de section de contenu que si elle publie un article, et `/es/articles` n'est pas construite ; une page de listing porte le `<title>` et la description de `listingHead`, et `/p/{n}` n'existe que de la page 2 à la dernière
- chaque page servie — `noindex`, `<html lang>` de la Locale de son préfixe, `<header class="sk-site-header">` avant le contenu et `<footer class="sk-site-footer">` après, dont la colonne de liens est celle de sa Locale, aucune sous `/es`, celle de `en` sur `404.html`
- `GET /__tsr/staticServerFnCache/{sha1}.json` — 200, les données d'une page article, d'un flux de notes, des contreparties d'une page, d'une page de roll ou des rolls d'une Locale, qu'une page hydratée récupère en navigation côté client
- `GET /assets/{fichier haché}` — 200, scripts, feuilles de style, polices, wordmark, mascottes
- `GET /article-images/{path}` — 200, le fichier ; le chemin est sensible à la casse
- `GET` une URL de page avec un slash final, `/fr/` compris — 301 de l'hébergeur vers la forme canonique
- `GET` une URL portant une majuscule — 301 de l'hébergeur vers sa forme en minuscules quand ce fichier existe, 404 sinon
- `GET` un chemin canonique suivi de `.html` — 200, le même document
- tout autre `GET` : adresses v1, page un explicite, `/l/…`, Locale non déclarée, page absente dans sa Locale (`/articles/c/theory`) — 404, `404.html`, en anglais quelle que soit l'adresse, `lang="en"`, entre l'en-tête et le pied de page, sans script client : ses liens rechargent la page

### CLI API of app `@robusta/robusta-build`

Client code : `yarn build:robusta` et `yarn dev:robusta` à la racine, et le build Netlify par `netlify.toml`.

- `build` — `check:source`, `compile:seams`, `check:translations`, `emit:v1-map`, `copy:assets`, `vite build` avec le prérendu, puis `scripts/check-route-table.mjs`. Exit 1 sur une directive `'use client'` ou `'use server'`, un import local de code qui ne nomme pas le `.ts` ou le `.tsx` qu'il importe, arbre de routes généré compris, une violation du corpus ou du schéma, la route de layout ou un des sept fichiers de route sous `{-$locale}` manquant, une Category sans libellé dans la page copy d'une Locale, une violation d'import protection, une page prérendue hors 2xx ou écrite autour d'un rendu qui a levé, une différence entre les pages écrites, `index.html` lu comme `/`, et les landing pages plus la dérivation, ou un nombre de fichiers de données autre qu'un par article, un par flux de notes demandé, un par page portant une `PageUrl`, un par page de listing et un par landing page pour les rolls du pied de page.
- `dev` — `compile:seams`, `emit:v1-map`, `copy:assets`, puis `vite dev` ; les trois server functions s'y exécutent à chaque appel et lisent le corpus. `netlify.toml` ne s'y applique pas : `/en…` y répond par la page 404.
- `check:translations` — stdout : une ligne par notice de traduction, `stale-translation`, `untracked-pair` ou `missing-original`, avec l'empreinte à recopier, puis leur décompte, `translations: no notice` sans notice. Exit 0, notices ou pas ; exit 1 sur une violation du corpus.
- `test` — `vitest run`, sur les specs de `src` et de `scripts`. Exit 1, entre autres, quand une landing page ou une page de listing, en-tête et pied de page compris, porte un texte lisible que le site ne fournit pas, ou une phrase du prototype du design system.
- `lint` — eslint sur `src`, qu'aucun build n'exécute.

## Dependencies

- Depends on : le module `@robusta/pyramids-design-system`, en `workspace:*` et lu dans son `dist/`, seule dépendance workspace du site (BR-PYRAMID-13) ; TanStack Start, soit `@tanstack/react-start`, `@tanstack/react-router` et `@tanstack/start-static-server-functions` en versions exactes, montées ensemble ; React 19 ; pour `corpus-reader`, `gray-matter`, `remark`, `remark-html`, `unist-util-visit` et `slugify` épinglé à 1.6.6 ; Vite 8, Tailwind 4 par `@tailwindcss/vite`, vitest 5 ; TypeScript 5, dont `check-source.mjs` lit l'arbre syntaxique ; Fontsource pour IBM Plex Sans, IBM Plex Mono et Caveat ; Node 22.12 ou plus.
- Vite : la copie 8 du site est sous `apps/robusta-build/node_modules`, la racine hisse Vite 6 pour les autres workspaces, et `packageExtensions` dans `.yarnrc.yml` lie `@tanstack/react-start-rsc` à la copie du site.
- Hébergement : le projet Netlify `robusta-build`, qui publie `dist/client` sans fonction, avec les deux règles de redirection de `/en…` ; sa configuration est dans `netlify.toml` et dans la section Deployment du README.
- Hors dépendances : `next`, `@netlify/vite-plugin-tanstack-start`, `pyramids-layouts`, `pyramids-links` et `pyramids-ctas`, qui rendent des classes DaisyUI, `@robusta/scribe-intel` (BR-PYRAMID-2), `@tailwindcss/typography` (BR-PYRAMID-6).
- Tests : `src/content/corpus-freeze.spec.ts` et `src/content/corpus-reader/article-slug.spec.ts` lisent `apps/robusta/content/blog`, seuls fichiers du site qui atteignent une autre app.
- Used by : rien, c'est une app déployée.
