# Design: SEO excellence sur le site v2

**Last update:** 2026-11-04
**Feature:** seo-excellence
**Infix:** SEOEXCELLENCE
**Status:** IMPLEMENTED (2026-11-04, commit 93f6770)
**Sources:** [story](seo-excellence.story.md), [brainstorm](seo-excellence.brainstorm.md), [epic](../pyramid-v2.epic.md), [blog-rolls](../blog-rolls/blog-rolls.design.md), [article-page](../article-page/article-page.design.md)

## Goal

Chaque page indexable de `apps/robusta-build` déclare dans son head ce qu'elle est : titre, description, canonical URL, hreflang et x-default, aperçu de partage, données structurées. Un nouveau package `seo`, pur et lisible depuis Node, porte ces déclarations, la règle d'indexabilité, le sitemap et `robots.txt` ; deux scripts de build écrivent les fichiers et auditent les pages construites. La page article gagne fil d'Ariane, date de mise à jour et Related articles, le roll de Category son fil d'Ariane. Le site reste fermé : une seule constante, `INDEXING_OPEN`, sépare la déclaration de l'ouverture, et go-live la bascule. Le pourquoi : [story](seo-excellence.story.md).

Le brainstorm date du 2026-10-06, avant multilingual-site et default-locale-at-root : là où il diverge de la story ou du code (Next.js, une seule Locale, `@robusta/pyramids-content`), la story et le code font foi.

## Boundaries

```
  Packages of app `@robusta/robusta-build`. Arrow: client code ──→ API,
  all library. No loop.

                        routes [modified]
           ┌────────────────┼────────────────┐
           ↓                ↓                ↓
   article [modified]  listing [modified]  landing [modified]
           │                │                │
           └────────────────┼────────────────┘
                            ↓
   page-data [modified] ──→ seo [new] ←── scripts [modified]
           │                │                │
           ↓                ↓                │
   content [modified] ←── routing [modified] ←┘

  Omitted: routes → page-data; article and listing → page-data (types);
  page-data → routing; seo → content (types only); scripts → content and
  routing through .routing-dist; the view packages → seopyramids.config
  [modified]; article and listing → components (Breadcrumb [new]).
```

La route racine ne change pas : elle garde `robots: noindex, nofollow`, le titre et la description de `PageCopy.head`, et ne déclare ni canonical ni hreflang. Une page la surcharge en posant son propre head, construit par `pageHead`.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers et plateformes sociales.

- `GET /sitemap.xml` · nouveau — 200, fichier statique de `dist/client`. Un `<urlset>` du protocole sitemap 0.9, une `<url>` par page indexable : `<loc>` absolu, `<lastmod>` `YYYY-MM-DD` quand le contenu donne une date. Aujourd'hui 33 entrées : 3 landing pages, 13 pages de listing, 17 articles ; `/es` sans `<lastmod>`.
- `GET /robots.txt` · nouveau — 200 : `User-agent: *`, `Allow: /`, puis `Sitemap: https://www.robusta.build/sitemap.xml`. Aucun `Disallow`.
- `GET` sur une page indexable, jumeau `.html` compris · modifié — le head porte, dans cet ordre : `<title>`, `description`, `robots` (`noindex, nofollow` jusqu'à go-live), `og:type`, `og:title`, `og:description`, `og:url`, `og:locale`, `og:image` quand la page a une image propre, un `<link rel="canonical">`, les `<link rel="alternate" hreflang>` et le x-default quand la page a une autre version, puis ses données structurées en `application/ld+json`.
- `GET` sur une page non indexable (`404.html`, un accueil du blog de la Locale par défaut construit vide) — le head de la racine seul : titre et description de `PageCopy.head`, `noindex, nofollow`, ni canonical, ni hreflang, ni aperçu, ni données structurées.
- Ce qu'un lecteur voit de plus : sur une page article, le fil d'Ariane au-dessus de la couverture, la date de mise à jour à côté de la date de publication, le bloc de Related articles en fin de page ; sur une page d'un roll de Category, le fil d'Ariane au-dessus du `h1`.

Head de `/fr/articles/c/privacy/quitter-gmail`, robots et aperçu omis :

```html
<title>Quitter Gmail</title>
<link rel="canonical" href="https://www.robusta.build/fr/articles/c/privacy/quitter-gmail">
<link rel="alternate" hreflang="en" href="https://www.robusta.build/articles/c/privacy/leaving-gmail">
<link rel="alternate" hreflang="fr" href="https://www.robusta.build/fr/articles/c/privacy/quitter-gmail">
<link rel="alternate" hreflang="x-default" href="https://www.robusta.build/articles/c/privacy/leaving-gmail">
```

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn build:robusta`, la build Netlify.

- `build` — `check:source`, `compile:seams`, `check:translations`, `emit:v1-map`, `copy:assets`, `vite build`, `check-route-table.mjs`, puis deux étapes nouvelles, dans cet ordre :
- `node scripts/emit-site-files.mjs` — écrit `dist/client/sitemap.xml` et `dist/client/robots.txt` depuis `.routing-dist`. Exit 1 sur une violation du corpus ou du schéma, levée par `contentUrls`. stdout : `site files: sitemap.xml lists 33 indexable pages (3 landing pages, 13 listing pages, 17 articles), robots.txt names it`.
- `node scripts/check-seo.mjs` — l'audit d'AC-SEOEXCELLENCE-6 sur les `.html` de `dist/client`. Exit 1 sur tout défaut, une ligne par défaut, `{url}: {défaut}`. stdout : `seo: 34 pages checked, 33 indexable and all in the sitemap; indexing closed`, `open` une fois go-live passé.
- `compile:seams` compile aussi `src/seo` et `src/routing/listed-articles.ts`.
- `test` — inchangé, `vitest run` ; les specs de `check-seo.mjs` tournent sur des sorties de fixture.

### library API of package `seo` in app `@robusta/robusta-build` — new

Client code : packages `article`, `listing`, `landing` et `page-data` ; `emit-site-files.mjs` et `check-seo.mjs` par `.routing-dist`. Entrée : `src/seo/index.ts`.

Types :

```ts
type PageUrl, ArticleIndexEntry; // already known

type PageVersion = { locale: string; url: string }; // root-relative canonical path
type Crumb = { label: string; url?: string };       // url absent on the current page
type StructuredData = { '@type': string /* … schema.org fields */ };

type PageDeclaration = {
  locale: string;
  url: string;         // root-relative canonical path, from buildUrl
  title: string;
  description: string;
  indexable: boolean;
  // … versions: PageVersion[], image?: string, structuredData: StructuredData[]
  shareType?: 'article' | 'website'; // og:type, 'website' when absent
};

type HeadMeta = { title: string } | { name: string; content: string } | { property: string; content: string };
type HeadLink = { rel: string; href: string; hrefLang?: string };
type HeadScript = { type: 'application/ld+json'; children: string }; // one JSON-LD block, serialized and escaped
type RouteHead = { meta: HeadMeta[]; links: HeadLink[]; scripts: HeadScript[] }; // the shape a TanStack route's head returns
type SitemapEntry = { loc: string; lastmod?: string };
```

`versions` liste les autres versions indexables de la page, elle exclue. `image` est un chemin sous l'asset root, absent quand la page n'a pas d'image propre.

Interfaces :

```ts
/** The go-live switch: a build-time constant, false in this story. */
const INDEXING_OPEN: boolean;

interface Seo {
  /** title and description always; robots, og:*, canonical, hreflang and JSON-LD on an indexable declaration only */
  pageHead(declaration: PageDeclaration): RouteHead;
  /** 'index, follow' only when indexable and open, 'noindex, nofollow' otherwise; `open` defaults to INDEXING_OPEN, tests pass it */
  robotsOf(indexable: boolean, open?: boolean): string;
  /** landing and article pages; a roll page when it lists an article; never a tag page */
  isIndexable(page: PageUrl, articles: readonly ArticleIndexEntry[]): boolean;
  /** SITE_ORIGIN followed by a root-relative path */
  absoluteUrl(path: string): string;

  /** BlogPosting; dateModified only when the entry declares `updated` */
  articleData(entry: ArticleIndexEntry, coverUrl?: string): StructuredData;
  /** BreadcrumbList; `item` only on the crumbs that carry a url */
  breadcrumbData(trail: Crumb[]): StructuredData;
  /** Organization: name, url, email, sameAs */
  organizationData(name: string, url: string, email: string, profiles: string[]): StructuredData;

  /** the indexable pages of `urls`, in the order given, each dated when it lists a dated article */
  sitemapEntries(urls: readonly PageUrl[], articles: readonly ArticleIndexEntry[]): SitemapEntry[];
  sitemapXml(entries: SitemapEntry[]): string;
  robotsTxt(): string;
}
```

Garanties de `pageHead` :

- `versions` non vide : un `alternate` par Locale, la page comprise, puis un `x-default` vers la version `en`, la page elle-même quand elle est en `en` ; aucun `x-default` sans version `en`. `versions` vide : aucun lien `alternate`.
- Chaque URL déclarée est absolue sur `SITE_ORIGIN` et sous sa forme canonique : jamais `/en…`, jamais de barre finale hors `/`, jamais `.html`.
- `og:image` n'existe que si `image` est posé : pas d'image par défaut. Aucune balise `keywords`, aucune `twitter:*`.
- Chaque `StructuredData` devient un `HeadScript` de `scripts`, `children` son `JSON.stringify` où `<`, `>` et `&` sont échappés en `\u003c`, `\u003e`, `\u0026`.
- Aucune erreur levée : une valeur manquante est une erreur de compilation.

Client code, dans package `landing` :

```ts
import { absoluteUrl, organizationData, pageHead } from '../seo/index.ts';

const head = pageHead({
  locale: 'fr', url: '/fr', title, description, indexable: true,
  versions: [{ locale: 'en', url: '/' }, { locale: 'es', url: '/es' }],
  structuredData: [organizationData(siteName, absoluteUrl('/fr'), email, [linkedIn])],
});
```

### library API of package `routing` in app `@robusta/robusta-build` — modified

Client code : packages `seo` et `page-data`, la Site configuration, les scripts.

```ts
/** scheme.ts — the host of every canonical URL; the Site configuration's `domain` reads it */
const SITE_ORIGIN = 'https://www.robusta.build';
/** scheme.ts — the notes a landing page lists; the landing route reads it in place of NOTES_LIMIT */
const NOTES_FEED_SIZE = 4;

interface Versions {
  /** counterparts.ts — the same page in each other Locale that has it; for a roll page n, page n of the same roll, never its first page */
  versionsOf(page: PageUrl, urls: readonly PageUrl[], articles: readonly ArticleIndexEntry[]): PageUrl[];
}

interface ListedArticles {
  /** listed-articles.ts — a landing page: the NOTES_FEED_SIZE newest of its Locale; a roll page: its slice; any other page: none */
  articlesListedBy(page: PageUrl, articles: readonly ArticleIndexEntry[]): readonly ArticleIndexEntry[];
}
```

`counterpartsOf` ne change pas : l'en-tête mène toujours une page de roll à la première page du même roll. `rollPageOf` prend ses posts dans `articlesListedBy`, pour que la page et la date du sitemap lisent le même jeu.

### library API of package `content` in app `@robusta/robusta-build` — modified

Client code : `page-data`, les scripts. Le package `corpus-reader` dans `content` change avec lui.

```ts
type ArticleEntry = {
  path: string; slug: string; locale: string; date: string;
  updated?: string; // new — `YYYY-MM-DD`, read from the frontmatter field `updated`
  // … unchanged
};

type CorpusViolation =
  | { code: 'malformed-date'; path: string; field: 'date' | 'updated'; date: string } // gains `field`
  | /* … unchanged */;

interface ContentReads {
  /** article-index.ts — the excerpt as plain text, whole: markdown marks dropped, their text kept */
  getExcerptText(entry: ArticleIndexEntry): string;
  /** article-lookup.ts — published, same Locale, sharing the Category or a tag, itself excluded; same Category first, then more shared tags, then newest; `limit` at most */
  findRelated(entry: ArticleIndexEntry, limit: number): Promise<ArticleIndexEntry[]>;
  /** article-lookup.ts — the same rule, pure, among the given index; findRelated is it over getArticleIndex */
  relatedAmong(entry: ArticleIndexEntry, articles: readonly ArticleIndexEntry[], limit: number): ArticleIndexEntry[];
}
```

`readCorpus` refuse un `updated` malformé comme un `date` malformé, sous le même code ; `describeViolation` nomme le champ.

### library API of package `page-data` in app `@robusta/robusta-build` — modified

Client code : packages `routes`, `article`, `listing`. Aucune server function nouvelle : 69 fichiers de données, comme aujourd'hui.

```ts
type ArticlePage = {
  article: ArticleIndexEntry;
  url: string;                // new — its root-relative canonical path
  description: string;        // new — getExcerptText of the article
  writtenUpdated?: string;    // new — `updated` as its Locale writes it, absent without one
  related: RelatedArticle[];  // new — findRelated(article, 3)
  // … html, coverUrl, categoryUrl, versions, writtenDate unchanged
};
type RelatedArticle = { title: string; url: string };

type RollPage = {
  locale: string;
  category?: string;
  indexable: boolean;        // new — isIndexable of the page, at build
  versions: PageVersion[];   // new — versionsOf, built and indexable only
  // … posts, previousUrl, nextUrl unchanged
};
```

### library API of package `article` in app `@robusta/robusta-build` — modified

Client code : les deux routes article. Nouvelle entrée `src/article/index.ts`, qui exporte `ArticleView`, `articleHead` et `articleTrail`.

```ts
interface ArticleDeclarations {
  /** title, plain excerpt, indexable, versions, cover, BlogPosting and BreadcrumbList; without a payload, nothing over the root */
  articleHead(page?: ArticlePage): RouteHead;
  /** blog home, then its Category when it claims one, then the article without url */
  articleTrail(page: ArticlePage): Crumb[];
}
```

`ArticleView` rend `articleTrail` par le composant du site `Breadcrumb` (`src/components/Breadcrumb.tsx`, props `{ label: string; trail: Crumb[] }`) au-dessus de la couverture, `writtenUpdated` à côté de la date de publication, et, après la fin de page, le bloc de Related articles quand `related` n'est pas vide.

Client code, dans package `routes` :

```ts
import { ArticleView, articleHead } from '@/article/index.ts';

export const Route = createFileRoute('/{-$locale}/articles/c/$category/$slug')({
  loader: ({ params }) =>
    getArticlePage({ data: { locale: params.locale, slug: params.slug } }),
  head: ({ loaderData }) => articleHead(loaderData),
  component: CategorisedArticlePage,
});
```

### library API of package `listing` in app `@robusta/robusta-build` — modified

Client code : les quatre routes de listing.

```ts
interface ListingDeclarations {
  /** modified — same title and description; adds the declaration of the roll page; without a payload, title and description only */
  listingHead(page: RollUrl, roll?: RollPage): RouteHead;
  /** new — a Category roll: blog home, then the Category, linked from page 2 on; a blog home: none */
  rollTrail(roll: RollPage, page: RollUrl): Crumb[];
}
```

`ListingPage` gagne la prop requise `url: RollUrl`, la page du roll rendue, dont `rollTrail` lit le numéro ; il rend `rollTrail(page, url)` par `Breadcrumb` au-dessus du `h1` quand il n'est pas vide. Les routes passent `loaderData` : `head: ({ params, loaderData }) => listingHead(rollAt(params), loaderData)`. Les modèles de `ListingCopy` ne changent pas (décision de l'epic du 2026-11-04).

### library API of package `landing` in app `@robusta/robusta-build` — modified

Client code : la route `{-$locale}/index.tsx`, dont le head inline disparaît.

```ts
interface LandingDeclarations {
  /** landing.head of the Locale, indexable, the two other landing pages as versions, the Organization */
  landingHead(locale: string): RouteHead;
}
```

### library API of the Site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

```ts
type BlogConfig = {
  contentRoot: string; defaultLocale: string; otherLocales: string[]; rollSize: typeof ROLL_SIZE;
  // … mandatoryKeywords removed
};

type PageCopy = {
  article: { navLabel: string; categoryPrefix: string; versionsPrefix: string;
             relatedTitle: string; updatedPrefix: string }; // two new texts
  breadcrumb: { navLabel: string };                         // new
  // … unchanged
};
```

`domain` lit `SITE_ORIGIN`. Le commentaire de `PageCopy.head` le réserve à la page 404 et à l'état d'échec de navigation.

## Technical Constraints

- TanStack Router 1.170.41, `buildTagsFromMatches` : un `meta` est dédupliqué par `name` ou `property` et le `title` par match, le plus profond gagne ; un `link` n'est jamais dédupliqué. D'où : la racine pose le `robots` par défaut, que la page surcharge, et seul le head de la page pose canonical et `alternate`, sinon ils sortent deux fois. `head().meta` est typé en attributs JSX de `<meta>` : les données structurées passent par `head().scripts`, une entrée `{ type: 'application/ld+json', children }` par bloc, que le router sort en `<script type="application/ld+json">` avec `children` brut ; d'où l'échappement de `<`, `>` et `&` par `pageHead`.
- Un `head` s'exécute au prérendu, à l'hydratation et à chaque navigation client. Chaque valeur vient du payload du loader ou d'une fonction pure ; aucune ne lit `process.env` au runtime. `INDEXING_OPEN` est une constante fixée au build, identique dans le bundle serveur et le bundle client : sinon l'hydratation réécrirait le `robots` prérendu.
- `src/seo` est compilé par `tsc -p tsconfig.routing.json` pour les scripts Node : ni React, ni import de valeur de `seopyramids.config.ts` (import PNG du bundler) ni de `page-data` ; ses imports locaux nomment leur `.ts` (`check:source`). `tsconfig.routing.json` gagne `src/seo` et `src/routing/listed-articles.ts`.
- L'option `sitemap` de TanStack Start reste absente : son générateur écrit la date du jour sur toute entrée sans `lastmod` et publie un `pages.json` dans `dist/client`.
- `vite build` vide `dist/client` : `emit-site-files.mjs` s'exécute après. Netlify sert les deux fichiers tels quels, type par extension.
- `getExcerptText` lit le markdown par `remark`, déjà dépendance du site ; `content` reste interdit côté client par l'import protection. L'audit lit le HTML prérendu par motifs de balises, comme `check-route-table.mjs` et `test-support/markup.ts`, sans dépendance nouvelle.
- Corriger le corps d'un original change son fingerprint : sa traduction devient une `stale-translation` et `migrated-corpus.spec.ts` échoue. Chaque traduction concernée redéclare `original.fingerprint` dans le commit de la correction. `corpus-freeze.spec.ts` impose le même corps dans `apps/robusta/content/blog`.

## Requirements

### Déclaration des pages

- R-SEOEXCELLENCE-01 : `pageHead` est le seul producteur des balises SEO du head. Les sept routes de page le reçoivent par `landingHead`, `listingHead` ou `articleHead` ; la route racine reste inchangée.
- R-SEOEXCELLENCE-02 : titre et description : `landing.head` de la Locale pour une landing page, les modèles de `listingHead` pour une page de listing, et pour un article son titre seul, sans nom de site ajouté, et `getExcerptText` de son excerpt, entier, sans troncature.
- R-SEOEXCELLENCE-03 : la canonical URL d'une page est `absoluteUrl(buildUrl(urlScheme, page))` ; le jumeau `.html` sert le même document, donc déclare la canonical URL de sa page (BR-PYRAMID-14).
- R-SEOEXCELLENCE-04 : les versions d'une page : `ArticlePage.versions` pour un article, les deux autres landing pages pour une landing page, `RollPage.versions` pour une page de roll ; `pageHead` en tire hreflang et x-default selon ses garanties (BR-ROBUSTA-1).
- R-SEOEXCELLENCE-05 : l'aperçu de partage : `og:type` `article` sur une page article, posé par `shareType`, et `website` ailleurs, `og:title` et `og:description` égaux au titre et à la description, `og:url` égal à la canonical URL, `og:locale` `en_US`, `fr_FR` ou `es_ES` selon la Locale, correspondance fixe écrite dans `src/seo`, alors que `inLanguage` et `<html lang>` gardent le code de la Locale, `og:image` absolu sur la couverture d'un article qui en déclare une, sur aucune autre page.

### Indexabilité, fermée jusqu'à go-live

- R-SEOEXCELLENCE-21 : `isIndexable` est la règle unique : une landing page et une page article le sont, une page de roll l'est quand `articlesListedBy` n'est pas vide, une page de tag ne l'est jamais. Une page sans `PageUrl`, la 404, n'a pas de déclaration.
- R-SEOEXCELLENCE-22 : `RollPage.indexable` vient de `isIndexable` au build ; `RollPage.versions` est `versionsOf` restreint aux pages indexables et construites, si bien qu'aucun hreflang ne nomme une page non indexable.
- R-SEOEXCELLENCE-23 : le `robots` d'une page déclarée est `robotsOf(indexable)`. `INDEXING_OPEN` vaut `false` : chaque page sort `noindex, nofollow`, et une page indexable se reconnaît dans la build à sa canonical URL, que seule une déclaration indexable porte.
- R-SEOEXCELLENCE-24 : une route qui ne pose aucun head garde le `noindex, nofollow` de la racine et n'est pas au sitemap.
- R-SEOEXCELLENCE-25 : `INDEXING_OPEN` est écrit une fois, dans `src/seo/indexing.ts`, et rien d'autre ne décide de l'ouverture : go-live n'a qu'elle à changer. Le second paramètre de `robotsOf` ne sert qu'aux tests ; aucun code de production ne le passe.

### Sitemap et robots.txt

- R-SEOEXCELLENCE-41 : `emit-site-files.mjs` passe à `sitemapEntries` `landingPages` puis `contentUrls`, dans cet ordre ; `sitemapEntries` garde cet ordre, garde les pages que `isIndexable` accepte, publiées seulement puisque l'index ne porte qu'elles (BR-PYRAMID-10), et les écrit au build, jamais sur une requête (BR-PYRAMID-7).
- R-SEOEXCELLENCE-42 : `lastmod` : pour un article, `updated` s'il existe, `date` sinon ; pour une landing page ou une page de roll, le plus récent de ces mêmes dates parmi `articlesListedBy` ; absent quand la page ne liste aucun article.
- R-SEOEXCELLENCE-43 : `robotsTxt` autorise tout et nomme `absoluteUrl('/sitemap.xml')` : l'asset root et `/learn` restent lisibles.
- R-SEOEXCELLENCE-44 : `SITE_ORIGIN` et `NOTES_FEED_SIZE` sont écrits dans `src/routing/scheme.ts` ; la Site configuration lit le premier, la route de la landing page et `articlesListedBy` le second.

### Données structurées et fil d'Ariane

- R-SEOEXCELLENCE-61 : une page article déclare `articleData` — `headline`, `datePublished`, `dateModified` seulement si `updated` existe, `author` comme `Person` nommée, `inLanguage`, `image` absolue sous l'asset root quand la couverture existe — et `breadcrumbData(articleTrail(page))`.
- R-SEOEXCELLENCE-62 : `articleTrail` : l'accueil du blog de la Locale, libellé `listing.blogTitle`, puis la Category, libellée par `getCategoryLabel`, quand l'article en revendique une, puis le titre de l'article sans lien. `ArticleView` le rend dans un `nav` nommé `breadcrumb.navLabel`, une liste ordonnée, chaque lien par `SiteLink`, le dernier élément en texte marqué `aria-current="page"`.
- R-SEOEXCELLENCE-63 : une page d'un roll de Category rend et déclare `rollTrail` : l'accueil du blog, puis la Category, en texte sur la page 1 et liée à la page 1 dès la page 2. L'accueil du blog ne rend ni ne déclare de fil d'Ariane.
- R-SEOEXCELLENCE-64 : chaque landing page déclare `organizationData` : `siteName`, sa propre canonical URL, `contact.email` et `contact.linkedIn` en `sameAs`. Aucune page ne déclare `LocalBusiness`, d'adresse ni de zone.
- R-SEOEXCELLENCE-65 : une page article montre `article.updatedPrefix` et `writtenUpdated` dans un `<time dateTime>` à côté de la date de publication, seulement quand l'article déclare `updated`, écrite au build dans sa Locale et en UTC comme `writtenDate`.
- R-SEOEXCELLENCE-66 : la vue et la déclaration lisent la même valeur — `articleTrail`, `rollTrail`, le titre, les dates, l'auteur, la couverture — de sorte qu'aucune donnée structurée ne porte un champ que la page n'affiche pas. Fil d'Ariane et bloc de Related articles ne stylent qu'en tokens du design system (BR-PYRAMID-6) et ne lisent que la page copy de leur Locale (BR-PYRAMID-8) ; le design system ne gagne aucun composant.

### Related articles

- R-SEOEXCELLENCE-81 : `ArticlePage.related` est `findRelated(article, 3)`, dont la règle vit dans `relatedAmong`, chaque article réduit à son titre et à sa canonical URL.
- R-SEOEXCELLENCE-82 : `ArticleView` termine la page sur un bloc titré `article.relatedTitle` en `h2`, une liste de liens par `SiteLink` vers les titres, sans date ni image, après le `nav` de fin de page ; aucun bloc quand `related` est vide.

### Contenu

- R-SEOEXCELLENCE-101 : `updated` est un champ optionnel du frontmatter, `YYYY-MM-DD`, entre guillemets ou lu comme timestamp YAML, comparé au jour calendaire comme `date`.
- R-SEOEXCELLENCE-102 : les cinq corps qui déclarent un titre de premier niveau sont corrigés dans `content/articles` et dans `apps/robusta/content/blog`, dans un même commit : `leaving-gmail`, titré en setext, et `easy-automation-with-sonoff` perdent le titre qui répète le leur ; `yield-farming` et `yield-farming-fr` descendent le leur au deuxième niveau, libellé gardé ; `quel-second-langage` descend tout son arbre d'un niveau. `quitter-gmail`, `domotique-facile-avec-sonoff` et `yield-farming` redéclarent le fingerprint de leur original dans ce commit.

### Site configuration

- R-SEOEXCELLENCE-121 : `BlogConfig` perd `mandatoryKeywords`, et aucune page ne déclare de mot-clé.
- R-SEOEXCELLENCE-122 : `PageCopy` gagne `article.relatedTitle`, `article.updatedPrefix` et `breadcrumb.navLabel` pour `en`, `fr` et `es` : `relatedTitle` « Related articles », « Articles liés », « Artículos relacionados » ; `updatedPrefix` « Updated on », « Mis à jour le », « Actualizado el » ; `breadcrumb.navLabel` « Breadcrumb », « Fil d'Ariane », « Ruta de navegación ».

### Contrôle de build

- R-SEOEXCELLENCE-141 : `check-seo.mjs` échoue, en nommant la page, sur : un titre ou une description absent ou partagé avec une autre page de la même `<html lang>` ; une page portant une canonical URL absente du sitemap, ou une entrée du sitemap sans page construite qui la déclare canonique ; un `href` interne qui ne mène ni à une page construite ni à un fichier de `dist/client` ; un `alternate` qui mène à une page non construite ou qui ne lui rend pas le lien ; un nombre de `<h1>` autre que un.
- R-SEOEXCELLENCE-142 : il échoue aussi quand le `robots` d'une page diffère de `robotsOf` appliqué à la présence de sa canonical URL, `INDEXING_OPEN` lu dans `.routing-dist` : tant qu'il vaut `false`, aucune page ne porte `index`.
- R-SEOEXCELLENCE-143 : aucun fichier ni balise de vérification n'est livré : robusta.build est vérifié dans la console webmaster par un enregistrement DNS, hors du dépôt (BR-PYRAMID-2).

## Acceptance Criteria

- AC-SEOEXCELLENCE-1 : Given toute page indexable, When un moteur de recherche ou une plateforme sociale la lit, Then il y trouve un titre et une description qui lui sont propres (celle d'un article est son excerpt, entier, en texte brut), une canonical URL qui la nomme sous sa forme canonique, la langue de sa Locale, un aperçu de partage construit sur ces mêmes valeurs, un lien hreflang vers chacune de ses versions publiées en `en`, `fr` et `es`, elle-même comprise, et un x-default vers sa version `en`, sans préfixe, quand elle en a une ; il n'y trouve aucun mot-clé ajouté par la Site configuration.
- AC-SEOEXCELLENCE-2 : Given une page sans contenu propre (la page 404) ou une page qui ne déclare rien de son indexation, When le site est construit, Then cette page se déclare non indexable et le sitemap l'omet, alors que landing pages, pages de listing et pages article sont indexables ; aucune canonical URL, aucun lien hreflang ni aucune entrée du sitemap ne nomme une forme que l'hébergeur redirige (`/en…`, une barre finale) ni un jumeau `.html`, et ce jumeau déclare la canonical URL de sa page. Jusqu'à go-live, aucune page n'est ouverte à l'indexation.
- AC-SEOEXCELLENCE-3 : Given le site construit, When un crawler lit `/sitemap.xml` et `/robots.txt`, Then le sitemap liste exactement les pages indexables des trois Locales, articles publiés seulement (BR-PYRAMID-10), chacune datée quand le contenu donne une date : la date de mise à jour d'un article s'il en déclare une, sa date de publication sinon, et pour une page qui liste des articles la plus récente d'entre elles ; une page qui ne liste aucun article daté, comme `/es` tant qu'aucun article espagnol n'est publié, y figure sans date ; `robots.txt` nomme le sitemap et ne bloque rien de ce qu'il liste, ni l'asset root qui sert les couvertures.
- AC-SEOEXCELLENCE-4 : Given une page article, une page d'un roll de Category ou une landing page, When un lecteur ou un crawler la lit, Then une page article montre un fil d'Ariane (accueil du blog, Category, article) libellé dans sa Locale et la date de mise à jour quand l'article en déclare une, et déclare en données structurées l'article (titre, date de publication, date de mise à jour, auteur, langue, couverture en URL absolue sous l'asset root) et ce fil d'Ariane ; chaque page d'un roll de Category montre et déclare le fil d'Ariane accueil du blog puis Category, et l'accueil du blog n'en montre pas ; chaque landing page, `/`, `/fr` et `/es`, déclare Robusta Build comme organisation, avec le nom et le contact qu'elle affiche, et aucune page ne déclare d'entreprise locale (OQ-SEOEXCELLENCE-21) ; aucune donnée structurée ne porte un champ que sa page n'affiche pas.
- AC-SEOEXCELLENCE-5 : Given un article, When sa page est construite, Then elle lie sa page de Category et se termine sur ses Related articles de la même Locale, trois au plus, ou sans bloc quand il n'en a aucun.
- AC-SEOEXCELLENCE-6 : Given la build de production, When on la vérifie, Then aucune page n'a de titre ou de description absent ou partagé avec une autre page de sa Locale, chaque page indexable est au sitemap et chaque entrée du sitemap est une page construite, aucun lien interne n'est cassé, chaque lien hreflang mène à une page construite qui le lui rend, et chaque page porte exactement un titre de premier niveau ; un échec nomme la page. Le résultat se lit dans la console webmaster d'un moteur de recherche, où robusta.build est une propriété vérifiée, et rien n'est livré au visiteur.
- AC-SEOEXCELLENCE-7 : Given les cas limites métier, When le site est reconstruit, Then un article qui cesse de se déclarer publié quitte le sitemap, et aucun bloc de Related articles, fil d'Ariane ou lien hreflang d'une autre page ne le cible ; une traduction est canonique à elle-même, jamais à son original, et une traduction signalée obsolète garde ses liens hreflang tant qu'elle est publiée ; une page publiée dans une seule Locale (la Category `theory`, un article sans traduction) ne déclare aucun hreflang, et une page sans version `en` ne déclare pas de x-default ; la seconde page d'un roll est canonique à elle-même, jamais à la première, et ses versions sont la même page du même roll dans les autres Locales quand elle est construite, jamais leur première page ; un article sans date de mise à jour ne déclare de date de modification nulle part ; un corps qui répète son titre en titre de premier niveau ne l'affiche qu'une fois, et un corps qui titre ses sections au premier niveau les garde un niveau plus bas ; une Category qui ne contient qu'un article reste indexable ; une page sans image propre partage un aperçu sans image plutôt qu'une image par défaut.

Edge cases to test:

- Un article dépublié sur fixture : absent du sitemap, des Related articles, des fils d'Ariane et des `alternate` de sa traduction, qui ne déclare plus de hreflang si c'était sa seule autre version.
- `yield-farming`, traduction de `yield-farming-fr` : canonique à elle-même ; rendue obsolète sur fixture, elle garde ses deux `alternate`.
- `/fr/articles/c/theory` et un article sans traduction : aucun `alternate`, aucun x-default ; un article `fr` traduit en `es` seulement : deux `alternate`, aucun x-default.
- Un roll de 13 articles de Category dans deux Locales sur fixture : `/p/2` canonique à elle-même, versions `/p/2` de l'autre Locale ; une autre Locale qui n'a qu'une page : aucun `alternate` vers sa page 1.
- Un accueil du blog `en` construit vide sur fixture : `noindex`, sans canonical, absent du sitemap, et `/fr/articles` ne déclare aucun `alternate` vers lui.
- Un article avec `updated` : date montrée, `dateModified` et `lastmod` égaux à `updated` ; sans `updated` : ni date de mise à jour montrée, ni `dateModified`, `lastmod` égal à `date`.
- La landing page d'une Locale dont un article plus ancien que ses quatre notes déclare un `updated` récent : son `lastmod` reste celui des quatre notes listées.
- `/es` : au sitemap sans `<lastmod>`, avec ses deux `alternate` et un x-default vers `/`.
- Les neuf articles `fr` du corpus : aucun Related article `en` ; un article qui ne partage ni Category ni tag avec aucun autre : pas de bloc.
- Une Category d'un seul article, `privacy` en `en` : indexable et au sitemap.
- Un roll de Category et une landing page : aperçu sans `og:image` ; un article sans couverture sur fixture : sans `og:image`, et son `BlogPosting` sans `image`.
- `leaving-gmail`, dont le titre répété est en setext : un seul `h1` dans la page construite.
- Un excerpt portant de l'emphase ou un lien sur fixture : la description en porte le texte, sans marque markdown, entier.

## Dependencies

- Depends on : aucune dépendance ouverte (story, Dependencies). Hors dépôt : Nicolas inscrit robusta.build dans la console webmaster d'un moteur de recherche par un enregistrement TXT chez Hover, qui porte la zone DNS ; la dernière phrase d'AC-SEOEXCELLENCE-6 s'y lit.
- Blocks : go-live, qui remplace `INDEXING_OPEN` par une valeur fixée au build, vraie sur le seul déploiement de production (AC-GOLIVE-3), et rien d'autre.
