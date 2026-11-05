# Design: robusta.build en trois Locales préfixées, et le suivi des traductions

**Last update:** 2026-10-26
**Feature:** multilingual-site
**Infix:** MULTILINGUAL
**Status:** IMPLEMENTED (2026-10-31, commit fb4803b)
**Sources:** [story](multilingual-site.story.md), [brainstorm](multilingual-site.brainstorm.md), [epic](../pyramid-v2.epic.md), [default-locale-fr](../__done/default-locale-fr/default-locale-fr.design.md), [robusta-landing-page](../__done/robusta-landing-page/robusta-landing-page.design.md)

## Goal

Première étape : le code de `@robusta/pyramids-routing` et `@robusta/pyramids-content` devient deux packages de `apps/robusta-build`, sans changement de comportement. Ensuite : chaque page sous le préfixe de sa Locale (`en` par défaut, `fr`, `es`), `/` en 301 vers `/en`, une page copy par Locale, dont la landing page présente les deux offres de RB Compound par deux `FlowDiagram`, un sélecteur de Locale nourri par les contreparties calculées au build, et un signalement de build des traductions obsolètes, à partir d'une empreinte déclarée dans le frontmatter. Le pourquoi : [story](multilingual-site.story.md).

## Ubiquitous Language

Deux termes pour `ubiquitous-language.md`, que docman crée (Documentation updates de la story) :

- Original : la version d'un article dont une autre version est la traduction. Un article qui ne se déclare la traduction d'aucun autre est son propre original.
- Stale translation : une traduction dont l'original a changé de titre, d'excerpt ou de corps depuis que son traducteur l'a déclarée à jour. Elle reste publiée, la build la signale.

Termes de code, hors glossaire : l'empreinte (`fingerprint`), la contrepartie d'une page (`counterpart`), la paire non suivie (`untracked-pair`).

## Boundaries

```
  Packages of app `@robusta/robusta-build`. Arrow: client code ──→ API,
  every arrow a library API. No loop.

  routes [modified] ─────────────────────→ page-data [modified]
  landing [modified]                         │             │
  chrome [modified]                          │             │
        │                                    │             │
        ↓                                    │             ↓
  routing [modified] ←───────────────────────┘     content [modified]
    url-scheme [new]                                 corpus-reader [new]
    content-urls, counterparts, v1-url-map ──────→ content

  Build scripts reach `routing` and `content` compiled under .routing-dist.
  Other zoom: `chrome`, `landing` ──→ module `@robusta/pyramids-design-system` [modified].
```

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers. Le bloc de la [story](multilingual-site.story.md#boundaries), au zoom complet :

- `GET /` — 301, `Location: /en`. Une seule règle `[[redirects]]` dans `netlify.toml`, sans `force` : elle ne s'applique que si aucun fichier n'occupe `/`, d'où aucun `index.html` à la racine de `dist/client`.
- `GET /{en|fr|es}` — 200, `{locale}.html`, la landing page de la Locale.
- `GET /{en|fr|es}/` — 301 vers la forme sans barre, servi par Pretty URLs comme pour `/articles/` aujourd'hui ; aucune règle ne l'exprime, Netlify normalise la barre finale avant ses règles.
- `GET /{en|fr}/articles…` — 200, les 30 URL de contenu, 14 et 16.
- `GET /es/articles…`, `GET /articles…`, `GET /l/…`, `GET /de` et toute adresse inconnue — 404, `404.html` : texte anglais constant, `lang="en"`, lien de retour vers `/en`.
- Données statiques : chaque page prérendue qui a une `PageUrl` écrit un fichier de contreparties sous `__tsr/staticServerFnCache`, à côté de ceux des articles et des flux de notes.

### library API of package `url-scheme` in package `routing` — new

Le code de `packages/pyramids-routing/src`, déplacé dans `src/routing/url-scheme/`, entrée `index.ts`. Il n'importe rien hors de son répertoire, et rien d'un site : le content root et les Locales arrivent par `UrlScheme`.

Client code : `routing` (fichiers du site), `page-data`, `chrome`, `landing`, `routes`, scripts de build.

```ts
type UrlScheme, PageUrl, AddressableArticle; // unchanged
type SchemeViolation; // unchanged, `reserved-segment` now covers c, p, t

/** every URL starts with `/{locale}`, the default Locale included; landing: `/{locale}` */
function buildUrl(scheme: UrlScheme, page: PageUrl): string;

/** `/{locale}` and `/{locale}/{contentRoot}…`; undefined when the first segment is no known Locale */
function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;

/** new — one landing per known Locale, default first */
function landingPages(scheme: UrlScheme): PageUrl[];

function urlSet(scheme: UrlScheme, articles: readonly AddressableArticle[]): PageUrl[]; // content section only, rule unchanged
function validateArticles(scheme: UrlScheme, articles: readonly AddressableArticle[]): SchemeViolation[]; // unchanged
```

Garanties et erreurs :

- `LOCALE_DISCRIMINANT` est supprimé de l'API et de `RESERVED_SEGMENTS` ; `CATEGORY_DISCRIMINANT`, `ROLL_PAGE_DISCRIMINANT`, `TAG_DISCRIMINANT`, `isReservedSegment` inchangés.
- `buildUrl` n'émet jamais de barre finale, `parseUrl` garde ses tolérances (barre finale, casse, page un explicite) : la canonicité reste le point fixe du couple.
- `parseUrl` rend `undefined` pour `/articles…`, `/l/…` et `/404`. `buildUrl` lève toujours sur une page de roll inférieure à 1.

Client code, dans `scripts/prerender-pages.mjs` :

```js
const { buildUrl, landingPages } = await import(join(compiled, 'routing/url-scheme/index.js'));
const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
const { contentUrls } = await import(join(compiled, 'routing/content-urls.js'));

const landings = landingPages(urlScheme).map((page) => buildUrl(urlScheme, page));
const content = (await contentUrls()).map((page) => buildUrl(urlScheme, page));
return [...landings, '/404', ...content].map((path) => ({ path }));
```

### library API of package `routing` in app `@robusta/robusta-build` — modified

Les fichiers du site autour de `url-scheme`, importés par leur chemin comme aujourd'hui. `scheme.ts` reste une feuille sans React ni import d'asset ; `content-urls.ts`, `counterparts.ts` et `v1-url-map.ts` lisent l'index d'articles et ne sont importés que par `page-data`, les specs et les scripts, jamais par du code client.

```ts
/** scheme.ts — the site's three Locales, default first */
const LOCALES = ['en', 'fr', 'es'] as const;
type Locale = (typeof LOCALES)[number];
const urlScheme: UrlScheme; // { contentRoot: 'articles', defaultLocale: 'en', otherLocales: ['fr', 'es'], rollSize: 12 }

/** content-urls.ts — unchanged: the derived content section, throws on a SchemeViolation */
function contentUrls(): Promise<PageUrl[]>;

/** counterparts.ts, new — for each other Locale, the same page there; nothing for a Locale that has none */
function counterpartsOf(
  page: PageUrl,
  urls: readonly PageUrl[],
  articles: readonly ArticleIndexEntry[],
): PageUrl[];
```

Règles de `counterpartsOf`, de vrais équivalents seulement, jamais de repli :

- landing → la landing de chaque autre Locale ;
- blog-home ou category, toute page de roll → la page 1 du même roll dans l'autre Locale, si `urls` la contient ;
- article → chaque autre version publiée, même translation identifier, autre Locale ;
- tag → rien.

Le repli vers la landing page appartient à `Header`. seo-excellence reprend `counterpartsOf` pour hreflang et filtre ce qu'il retient ; ce qu'elle reçoit est une `PageUrl`, pas une chaîne.

Les fonctions `*Params` et `LocaleScope` de `content-urls.ts` disparaissent : sans moitié non marquée de l'arbre de routes, aucun appelant ne reste.

### library API of package `corpus-reader` in package `content` — new

Le code de `packages/pyramids-content/src`, déplacé dans `src/content/corpus-reader/`, entrée `index.ts` ; `test/corpus-fixture.ts` devient `src/test-support/corpus-fixture.ts`. Même règle d'import que `url-scheme`.

Client code : `content` (fichiers du site), scripts de build.

```ts
type CorpusSpec, ArticleBody, AssetSpec, LocaleSource; // unchanged

type ArticleEntry = {
  path: string;
  locale: string;
  translationId?: string;
  original?: OriginalDeclaration; // new — declared by a translation only
  // … slug, category, title, date, author, tags, excerpt, image unchanged
};

type OriginalDeclaration = {
  locale: string;      // the Locale of the original
  fingerprint: string; // the original's fingerprint when the translation was declared up to date
};

type CorpusRead = {
  articles: readonly ArticleEntry[];
  violations: readonly CorpusViolation[];             // fail the build, as today
  translationNotices: readonly TranslationNotice[];   // new — never fail it
  unpublished: readonly string[];
};

type CorpusViolation = /* unchanged codes */ | { code: 'malformed-original'; path: string; detail: string };

type TranslationNotice =
  | { code: 'stale-translation'; path: string; originalPath: string; fingerprint: string } // fingerprint to copy
  | { code: 'untracked-pair'; translationId: string; versions: readonly { path: string; locale: string; fingerprint: string }[] }
  | { code: 'missing-original'; path: string; translationId: string; locale: string };
```

```ts
function readCorpus(corpus: CorpusSpec): Promise<CorpusRead>;          // same signature, memo unchanged
function describeViolation(violation: CorpusViolation): string;        // gains `malformed-original`
/** new — one line naming the translation, its original and the value to copy */
function describeTranslationNotice(notice: TranslationNotice): string;
// readArticleBody, articleSlug, copyCorpusAssets, resolveAssetUrl unchanged
```

Frontmatter d'une traduction :

```yaml
translationId: leaving-gmail
original:
  locale: en
  fingerprint: 9c1e4a7b2d30
```

Garanties :

- Empreinte : les 12 premiers caractères hexadécimaux du SHA-256 du titre, de l'excerpt et du corps markdown brut, chaque suite de blancs réduite à une espace. Ni le rendu HTML, ni les autres champs du frontmatter, ni git n'y entrent : un reflow Prettier, une montée de version de remark ou un clone superficiel ne signalent rien (BR-PYRAMID-5).
- Un article sans `original` est son propre original. L'original déclaré est la version publiée de `original.locale` qui porte le même translation identifier.
- `malformed-original`, qui fait échouer la build : `original` sans `translationId`, `locale` ou `fingerprint` absent, `fingerprint` hors de `[0-9a-f]{12}`, ou `original.locale` égale à la Locale de l'article.
- Notices, sur les seuls articles publiés : `stale-translation` quand l'empreinte de l'original diffère de celle déclarée ; `untracked-pair` quand un translation identifier groupe plus d'une version sans `original` ; `missing-original` quand l'original déclaré n'est pas publié ou a quitté le corpus. Une notice ne dépublie rien et ne retire aucun article de `articles`.
- Le message d'`untracked-pair` donne l'empreinte de chaque version : c'est la valeur à recopier pour la première déclaration.

### library API of package `content` in app `@robusta/robusta-build` — modified

```ts
function getArticleIndex(): Promise<readonly ArticleIndexEntry[]>;          // unchanged, throws on a violation
/** new — the corpus read's notices, for `check:translations` */
function getTranslationNotices(): Promise<readonly TranslationNotice[]>;
function findArticle(locale: string, slug: string): Promise<ArticleIndexEntry>; // unchanged
```

`findTranslation` disparaît : les versions d'un article viennent de `counterpartsOf`. `corpus.ts` est inchangé.

### library API of package `page-data` in app `@robusta/robusta-build` — modified

Client code : `routes`.

```ts
type ArticleVersion = { locale: string; url: string };

type ArticlePage = {
  article: ArticleIndexEntry;
  versions: ArticleVersion[]; // new — every other published version, replaces `translation`
  // … html, coverUrl, categoryUrl, writtenDate unchanged
};

interface PageData {
  getArticlePage(call: { data: ArticleKey }): Promise<ArticlePage>;
  getNotesFeed(call: { data: NotesFeedRequest }): Promise<NotePost[]>; // unchanged
  /** new — counterpartsOf on the landings and the content URLs, written to a data file per page */
  getCounterparts(call: { data: PageUrl }): Promise<PageUrl[]>;
}
```

`TranslationLink` disparaît, et avec lui le libellé `Intl.DisplayNames` : le nom d'une Locale vient de sa page copy.

Client code, dans `src/routes/__root.tsx` :

```ts
loader: async ({ location }) => {
  const page = parseUrl(urlScheme, location.pathname);
  return {
    locale: page?.locale ?? urlScheme.defaultLocale,
    counterparts: page === undefined ? [] : await getCounterparts({ data: page }),
  };
},
```

### library API of the Site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

Client code : `routes`, `landing`, `chrome`, `article`, `components`.

```ts
interface SeoPyramidsConfig {
  pageCopy: Record<Locale, PageCopy>; // was one PageCopy
  // … domain, siteName, logo, Locales, blogConfig, contact unchanged; siteTitle and mission removed
}

interface PageCopy {
  localeName: string;                         // new — the Locale named in its own language
  head: { title: string; description: string }; // new — every page of the Locale but its landing
  article: { navLabel: string; categoryPrefix: string; versionsPrefix: string }; // new — end of article
  listing: { blogTitle: string };             // new — heading of the blog roll placeholders
  landing: LandingCopy;                       // modified
  // … tagline, header, footer, categoryLabels unchanged in shape
}

interface LandingCopy {
  hero: HeroCopy;       // `note` removed
  openSource: FlowCopy; // new — the open source version
  complete: FlowCopy;   // new — the complete version, with a paid accompaniment
  // … head, principles, notes, cta unchanged in shape
}

/** new — the texts of one FlowDiagram, plain strings, named as its props */
interface FlowCopy {
  eyebrow: string;
  title: string;
  steps: FlowStep[]; // from the design system
  caveat: string;
}

/** throws naming the Locale when the site declares none */
function getPageCopy(locale: string): PageCopy;
/** throws naming the Category and the Locale when that Locale's page copy has no label */
function getCategoryLabel(locale: string, category: string): string;
```

Garanties :

- Une Locale ou un champ manquant échoue au typecheck. `HeroCopy` perd `note` : Toulouse et les rencontres sur place ne parlent plus à un public international, et `Hero` reçoit `footnote=""`. `PrinciplesCopy`, `NotesCopy` et `CtaCopy` gardent leur forme ; `contact` et les deux appels du hero, e-mail et LinkedIn, ne changent pas.
- `getPageCopy` et `getCategoryLabel` sont les seuls chemins de lecture. `getCategoryLabel` lève au rendu prérendu, ce qui fait échouer la build (`failOnError`) en nommant la Category et la Locale ; `NotesSection` y passe aussi et perd son repli silencieux vers le slug.
- `categoryLabels` d'une Locale couvre les Categories que ses articles publiés revendiquent ; celui d'`es` est vide.

### library API of packages `chrome` and `landing` in app `@robusta/robusta-build` — modified

Client code : `routes`.

```ts
/** wordmark to the landing of `locale`; one link per other Locale, to its counterpart or else its landing */
function Header(props: { locale: string; counterparts: PageUrl[] }): JSX.Element;
function Footer(props: { locale: string }): JSX.Element;
function LandingPage(props: { locale: string; posts: NotePost[] }): JSX.Element;
function NotesSection(props: { locale: string; posts: NotePost[] }): JSX.Element | null; // locale now required
```

Chaque `locale` se lit par `getPageCopy`, qui lève sur une Locale inconnue. `Header` et `Footer` perdent leur `div lang` : `<html lang>` porte la Locale de la page. `RoutePlaceholder` prend `{ title: string; url: string }` : titre `listing.blogTitle` ou libellé de Category, liste de faits supprimée. `ArticleView` lit `getPageCopy(article.locale).article` et rend chaque `ArticleVersion` avec `lang`, `hrefLang` et le `localeName` de sa Locale.

`LandingPage` rend, dans cet ordre, `Hero`, le `FlowDiagram` de la version open source, celui de la version complète, `PrinciplesList`, `NotesSection` et `CTA` : l'ordre de R-LANDING-82 gagne les deux schémas. Leurs `id`, `open-source` et `complete`, ne changent pas d'une Locale à l'autre ; aucun ne porte de mascotte.

Client code, dans `RootDocument` :

```tsx
const { locale, counterparts } = Route.useLoaderData();
return (
  <html lang={locale}>
    <head><HeadContent /></head>
    <body>
      <Header locale={locale} counterparts={counterparts} />
      {children}
      <Footer locale={locale} />
```

### CLI API of app `@robusta/robusta-build` — new

- `yarn workspace @robusta/robusta-build run check:translations` — `node scripts/check-translations.mjs`, sur le code compilé par `compile:seams`.
- stdout : une ligne par `TranslationNotice` (`describeTranslationNotice`), puis un décompte ; `translations: no notice` quand il n'y en a aucune.
- Exit 0, notices ou pas. Exit 1 seulement sur une violation du corpus, levée par `getArticleIndex`.
- `build` l'enchaîne après `compile:seams`, avant `emit:v1-map` : les notices s'impriment une fois par build.

### library API of module `@robusta/pyramids-design-system` — modified

Client code : packages `chrome` et `landing` ; `apps/robusta` (`src/app/_design-test/page.tsx`) ne passe aucun des trois ajouts.

```ts
interface SiteHeaderProps {
  homeHref?: string; // new — the wordmark's target, '/' when absent
  // … wordmarkSrc, links, ctaLabel, ctaHref, linkComponent, className, style unchanged
}

interface NavLink {
  label: string;
  href: string;
  locale?: string; // new — rendered as `lang` and `hrefLang` on the link
}

interface FlowDiagramProps {
  id?: string; // new — the section's id, 'approach' when absent
  // … eyebrow, title, steps, caveat, mascotSrc, className, style unchanged
}
```

Sans les trois ajouts, le balisage d'aujourd'hui, octet pour octet. Deux `FlowDiagram` sur une page exigent deux `id` : sans la prop, l'`id="approach"` en dur serait dupliqué.

Client code, dans `LandingPage` :

```tsx
const { openSource, complete } = getPageCopy(locale).landing;
<FlowDiagram id="open-source" {...openSource} />
<FlowDiagram id="complete" {...complete} />
```

## Technical Constraints

- Deux compilations du même code : Vite pour le site, `tsc -p tsconfig.routing.json` (`moduleResolution: Node`, sans alias `@/`) pour les scripts en Node pur. Ce que les scripts atteignent, `url-scheme`, `corpus-reader`, `scheme.ts`, `content-urls.ts`, `counterparts.ts`, `v1-url-map.ts` et `src/content`, n'importe ni React, ni JSX, ni asset de bundler, ni `@/` : imports relatifs en `.js`.
- `importProtection` du client interdit `**/src/content/**`, `gray-matter` et `remark`. `url-scheme` reste sans `node:*` : `chrome`, `landing` et le loader racine l'importent côté client. `counterparts.ts` ne s'atteint que depuis le handler de `getCounterparts`.
- Dépendances de `corpus-reader`, reprises de l'ancien manifeste dans celui du site : `gray-matter`, `remark`, `remark-html`, `unist-util-visit`, `@types/mdast`, et `slugify` épinglé à `1.6.6`, dont la dérivation des slugs dépend. L'empreinte utilise `node:crypto`.
- Les specs déplacées tournent sous le vitest 5 du site, non plus vitest 3. Celles qui résolvent un chemin depuis leur propre fichier, comme `article-slug.spec.ts` vers `apps/robusta/content/blog`, sont réenracinées.
- TanStack Router : la route statique `/404` passe avant `$locale` ; le prérendu ne construit que la liste dérivée, donc `/de` ou `/es/articles` n'ont aucun fichier, sans garde dans le routeur. Le loader racine tourne aussi à chaque navigation client, où `getCounterparts` lit son fichier statique ; le document 404 ne charge aucun script.
- Hydratation : `Header` rend la même chose au prérendu et dans le navigateur. Les noms de Locale viennent de la page copy et non d'`Intl.DisplayNames`, dont l'ICU diffère entre Node et les navigateurs.
- `FlowDiagram` : à partir de `lg`, ses étapes tiennent sur une rangée `nowrap` ; cinq étapes au plus par schéma, le compte du prototype, au-delà rien ne garantit qu'elle tienne.
- Netlify : `vite dev` n'applique pas `netlify.toml`, `/` y répond 404, on ouvre `/en`. Le 301 de `/` et de `/en/` ne se vérifie que sur un branch deploy.
- Design system : `node --test`, le site lit son `dist/`, donc `yarn build:deps` ou `w:design-system` avant que `chrome` voie `homeHref` et `landing` l'`id` de `FlowDiagram`. Les trois ajouts sont optionnels : `yarn build:robusta-v1` reste vert sans toucher `apps/robusta` (BR-PYRAMID-5).

## Requirements

### Prérequis : packages du site

- R-MULTILINGUAL-01 : le code de `packages/pyramids-routing/src` passe dans `src/routing/url-scheme/`, celui de `packages/pyramids-content/src` dans `src/content/corpus-reader/`, dans un commit à part et avant tout changement de schéma ; ce commit sert les mêmes 30 URL de contenu, le même corpus et la même v1 map qu'aujourd'hui (BR-PYRAMID-12).
- R-MULTILINGUAL-02 : leurs specs, 78 et 98, suivent leur code et passent dans `yarn workspace @robusta/robusta-build run test`.
- R-MULTILINGUAL-03 : les deux workspaces disparaissent : répertoires, dépendances `workspace:*` du site, étapes de `build:deps`, watchers `w:routing` et `w:content`, chemins de la règle `ignore` de `netlify.toml`, spécificateur `@robusta/pyramids-content` d'`importProtection`. Le design system reste la seule dépendance workspace du site (BR-PYRAMID-13). `routing.archi.md` et `content.archi.md` suivent leur code, inchangés, pour archiman.
- R-MULTILINGUAL-04 : `tsconfig.routing.json` inclut `src/routing/url-scheme` et `src/routing/counterparts.ts` ; les scripts importent `.routing-dist/…` et plus aucun module par son nom.
- R-MULTILINGUAL-05 : `url-scheme` et `corpus-reader` n'importent rien hors de leur répertoire ; le content root, la racine du corpus et les Locales ne s'écrivent que dans `src/routing/scheme.ts` et `src/content/corpus.ts`. Une spec échoue sur un import qui sort de l'un des deux répertoires.

### Schéma préfixé et redirection

- R-MULTILINGUAL-21 : `buildUrl` préfixe toute page de `/{locale}`, la Locale par défaut comprise ; la landing page d'une Locale est `/{locale}`, sans barre finale ; `l` n'est plus un discriminant (BR-ROBUSTA-1, BR-PYRAMID-1).
- R-MULTILINGUAL-22 : `parseUrl` lit les formes préfixées avec ses tolérances actuelles et rend `undefined` pour tout premier segment qui n'est pas une Locale connue.
- R-MULTILINGUAL-23 : `landingPages` rend les trois landing pages ; `urlSet` rend toujours la seule section de contenu, et une Locale autre que la Locale par défaut n'y a d'accueil de blog que si elle porte un article.
- R-MULTILINGUAL-24 : `urlScheme` déclare `en` par défaut, puis `fr` et `es` ; `Locale` est l'union de ces trois valeurs.
- R-MULTILINGUAL-25 : sept fichiers de route sous `src/routes/$locale/`, la landing et les six formes de contenu, remplacent `routes/index.tsx`, `routes/articles/**` et `routes/l/**` ; `prerender-pages` vérifie ces sept fichiers et prérend les landing pages, `/404`, puis les URL de contenu, et rien à `/`.
- R-MULTILINGUAL-26 : `/` répond 301 vers `/en` par la règle de `netlify.toml`, dont l'en-tête cesse d'affirmer « no redirect rule ». Une spec vérifie que la cible de la règle vaut `buildUrl` de la landing page de la Locale par défaut ; `check-route-table` échoue si `dist/client/index.html` existe.
- R-MULTILINGUAL-27 : `check-route-table` compare les pages HTML écrites, `404.html` exclue, aux landing pages plus les URL de contenu ; il attend un fichier de données par article, par flux de notes demandé et par page portant une `PageUrl`.
- R-MULTILINGUAL-28 : la page 404 est en anglais, texte constant, `lang="en"`, et son lien de retour mène à la landing page de la Locale par défaut.

### Page copy par Locale

- R-MULTILINGUAL-41 : `pageCopy` porte un bloc complet par Locale ; une Locale ou un texte manquant échoue au typecheck (BR-PYRAMID-8).
- R-MULTILINGUAL-42 : `<html lang>`, en-tête, pied de page, landing page, titres des placeholders, fin d'article, titre et description de repli de chaque page suivent la Locale de la page ; `siteTitle` et `mission` cèdent la place à `pageCopy[locale].head`.
- R-MULTILINGUAL-43 : un libellé de Category se lit par `getCategoryLabel` seul ; sans libellé dans la Locale de la page, la build échoue en nommant la Category et la Locale.
- R-MULTILINGUAL-44 : la page copy anglaise est écrite sur le positionnement RB Compound, offre de services aux équipes et responsables techniques qui produisent du logiciel avec des agents IA ; `fr` et `es` la traduisent section pour section, schémas compris, et la page copy française tournée vers les PME de Toulouse disparaît. Les noms d'agents, `rloq` et `APPROVED` restent tels quels dans les trois Locales.
- R-MULTILINGUAL-45 : la landing page d'une Locale demande le flux de notes de sa Locale, quatre au plus ; un flux vide ne rend aucune section, ce qui est le cas d'`es`.
- R-MULTILINGUAL-46 : `FlowDiagram` gagne `id`, optionnel, `approach` par défaut ; une spec du design system couvre l'`id` passé et le défaut (BR-PYRAMID-13).
- R-MULTILINGUAL-47 : `LandingPage` rend `Hero`, deux `FlowDiagram`, `PrinciplesList`, `NotesSection` et `CTA`, dans cet ordre ; chaque texte des deux schémas vient de `landing.openSource` ou `landing.complete`, aucun défaut du prototype ne s'affiche (R-LANDING-83, BR-PYRAMID-8). Le CTA reste le contact, e-mail et LinkedIn, qui mène à l'accompagnement.
- R-MULTILINGUAL-48 : chaque schéma décrit le workflow tel qu'il existe (§Code Routine de Compound), une étape par stade, ses agents nommés. Version open source : l'epic par epicman, la story par storyman, le design par designman, sa validation, DRAFT → APPROVED, puis l'implémentation test-first par tddman ; ni codeman, ni docman, ni archiman. Version complète : la story, le brainstorm par bsman, le design et sa validation, l'implémentation par tddman ou codeman, la documentation par docman et archiman. Le caveat du premier dit la version gratuite et pas encore publiée ; celui du second dit que boss enchaîne le pipeline, piloté par le slang comme rloq, et que cette version n'existe qu'avec un accompagnement personnalisé payant.
- R-MULTILINGUAL-49 : `PrinciplesList` reste, réorientée : chaque principe énonce une règle que le workflow applique dans ses deux versions, la documentation avant le code, une story par feature avec ses critères d'acceptation, des contrats écrits avant le code, un glossaire employé par chaque document ; jamais un résultat promis.
- R-MULTILINGUAL-50 : chaque `href` du rendu des trois landing pages, en-tête et pied de page compris, est le `mailto:` du contact, `contact.linkedIn` ou un chemin que `buildUrl` produit ; une spec le vérifie. Aucun lien ne mène donc à un dépôt ni à une page du plugin open source ; l'ajouter le jour de sa publication change la page copy et cette spec (item 15 de l'epic).

### Contreparties et sélecteur de Locale

- R-MULTILINGUAL-61 : `counterpartsOf` applique les règles du bloc `routing` et ne rend que de vrais équivalents.
- R-MULTILINGUAL-62 : le loader racine obtient la Locale et les contreparties de chaque page par `parseUrl` puis `getCounterparts`, au prérendu ; le 404 n'en a aucune.
- R-MULTILINGUAL-63 : le wordmark mène à la landing page de la Locale de la page ; l'en-tête porte un lien par autre Locale, libellé par le `localeName` de cette Locale et marqué de son `lang` et `hreflang`, vers la contrepartie ou, à défaut, la landing page de cette Locale.
- R-MULTILINGUAL-64 : `ArticlePage.versions` liste toutes les autres versions publiées, tirées de `counterpartsOf` ; `ArticleView` les lie toutes, sa fin d'article rédigée dans la Locale de l'article.
- R-MULTILINGUAL-65 : `SiteHeader` gagne `homeHref` et `NavLink.locale`, optionnels ; une spec du design system couvre les deux, une autre le balisage inchangé sans eux.

### Original et traduction obsolète

- R-MULTILINGUAL-81 : une traduction déclare `original: { locale, fingerprint }` dans son frontmatter ; un article sans cette déclaration est son propre original.
- R-MULTILINGUAL-82 : l'empreinte suit la définition du bloc `corpus-reader`, calculée sur le contenu des fichiers seul (BR-PYRAMID-5).
- R-MULTILINGUAL-83 : une déclaration mal formée est une violation `malformed-original`, qui fait échouer la build.
- R-MULTILINGUAL-84 : `readCorpus` rend les notices `stale-translation`, `untracked-pair` et `missing-original` à part des violations ; aucune ne bloque ni ne dépublie un article (BR-PYRAMID-10 inchangée).
- R-MULTILINGUAL-85 : `check:translations` imprime chaque notice avec la valeur à recopier, une fois par build, et sort en 0.
- R-MULTILINGUAL-86 : les huit traductions actuelles déclarent leur original dans le même changement : les six fichiers français traduits par `a3408ff` déclarent `en`, `blockchain/yield-farming.md` et `javascript/why-migration-gatsby-next.md` déclarent `fr`. Une spec sur le corpus réel n'attend aucune notice.

### v1 map

- R-MULTILINGUAL-101 : `v1-url-map.generated.json` est régénéré ; mêmes 82 lignes, même ordre, mêmes issues, seules changent les destinations et les champs `defaultLocale` et `otherLocales` de l'en-tête.

## Acceptance Criteria

- AC-MULTILINGUAL-1 : Given le corpus publié et un clean checkout du dépôt, sans les workspaces `pyramids-routing` et `pyramids-content`, When le site est construit et testé, Then la build aboutit, et chaque URL de contenu commence par la Locale de sa page : `/en/articles/c/privacy/leaving-gmail` et `/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répondent 200, le site compte toujours 30 URL de contenu, 14 sous `/en/…` et 16 sous `/fr/…`, et `/en`, `/fr` et `/es` sont les trois landing pages, sans barre finale.
- AC-MULTILINGUAL-2 : Given le site publié sur un branch deploy, When un visiteur ou un crawler ouvre `/`, Then il reçoit une redirection permanente (301) vers `/en`, et `/en/`, `/fr/` ou `/es/` une redirection permanente vers la même adresse sans barre finale ; une ancienne adresse sans préfixe ou sous `/l/en`, comme `/articles/c/blockchain` ou `/l/en/articles`, répond 404, sans redirection. Les redirections sont servies par l'hébergeur : `vite dev` ne les applique pas.
- AC-MULTILINGUAL-3 : Given une page de chaque Locale, landing page, page de category ou article, When un visiteur l'ouvre, Then son document déclare `<html lang>` à la Locale du préfixe, et tout ce qu'il lit, en-tête, pied de page, sections et libellés de category, est la page copy de cette Locale, fournie par le site (BR-PYRAMID-8) : `/fr/articles/c/blockchain` et un article français sont entièrement en français. La landing page `/en` présente RB Compound, l'offre de services aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, et non plus une offre aux PME de Toulouse : deux schémas séparés montrent la version open source, epicman, storyman, designman et tddman, et la version complète, proposée seulement avec un accompagnement ; la page dit que la version open source n'est pas encore publiée, ne cite ni prix ni promesse de résultat, et son appel à l'action mène au contact e-mail et LinkedIn. `/fr` et `/es` en sont les traductions, mêmes sections et même propos, titre et description de la page compris. La section de notes de `/fr` liste les quatre articles français les plus récents, celle de `/en` les anglais, et `/es` n'en a pas tant qu'aucun article espagnol n'est publié.
- AC-MULTILINGUAL-4 : Given une page du site, When un visiteur la lit, Then le wordmark de l'en-tête mène à la landing page de sa Locale, jamais à `/` ; l'en-tête propose un lien vers chaque autre Locale, nommé et prononcé dans sa propre langue, qui mène à la même page dans cette Locale si elle existe, à sa landing page sinon, et une page de blog roll au-delà de la première, `/fr/articles/p/2`, mène à la première page du même blog roll. Une version d'article se déclare dans sa Locale, sa fin d'article est rédigée dans cette Locale, et elle lie chacune de ses autres versions publiées : `leaving-gmail` et `quitter-gmail` se lient l'un à l'autre, et depuis chacun le lien espagnol de l'en-tête mène à `/es`.
- AC-MULTILINGUAL-5 : Given une traduction déclarée à jour de son original, When le titre, l'excerpt ou le corps de l'original change ensuite, Then la build signale la traduction obsolète en nommant la traduction et son original, avec de quoi la redéclarer à jour, et elle reste publiée ; une fois redéclarée, le signalement cesse. Un changement des seuls tags, date, category ou image de couverture de l'original ne signale rien, et une correction de la traduction elle-même la laisse à jour. Chaque article connaît son original : lui-même s'il n'est la traduction d'aucun autre, sinon la version d'une autre Locale reliée par le même translation identifier. Les huit paires actuelles sont déclarées à jour dans le même changement : la build du corpus réel ne signale rien.
- AC-MULTILINGUAL-6 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes 82 adresses v1 dans le même ordre avec la même issue (67 permanentes, 5 Gone, 10 sans destination), seules les destinations changent, chacune une URL que le site construit dans la langue de la page v1 : `/learn` mène à `/en/articles`, `/learn/fr/blockchain` à `/fr/articles/c/blockchain`.
- AC-MULTILINGUAL-7 : Given les cas limites, When le site est construit, Then une category revendiquée par une seule Locale n'a de page que dans celle-ci (`theory` sous `/fr/…` seulement, `/en/articles/c/theory` répond 404, et depuis `/fr/articles/c/theory` le lien anglais de l'en-tête mène à `/en`) ; le premier article anglais publié dans `theory` crée `/en/articles/c/theory` sous un libellé anglais, vers lequel mène alors ce lien, et sans libellé anglais dans la page copy la build échoue en nommant la category et la Locale ; deux versions reliées par un translation identifier, dont aucune ne se déclare traduction de l'autre, sont signalées comme paire non suivie et restent publiées ; une traduction dont l'original n'est pas publié, ou a quitté le corpus, est servie dans sa Locale sans lien vers l'original, et le signalement nomme l'original manquant ; `/es/articles` répond 404 tant qu'aucun article espagnol n'est publié ; aucun lien des trois landing pages ne mène à un dépôt ou à une page du plugin open source tant qu'il n'est pas publié ; une adresse inconnue reçoit la page 404 en anglais, `lang="en"`, dont le lien de retour mène à la landing page anglaise.

Edge cases to test:

- `theory` revendiquée par `fr` seule : `/fr/articles/c/theory` existe, `/en/articles/c/theory` répond 404, et depuis la première le lien anglais mène à `/en`.
- Premier article anglais publié dans `theory` : `/en/articles/c/theory` naît, le lien anglais y mène ; sans libellé anglais, la build échoue en nommant `theory` et `en`.
- `/fr/articles/p/2` : le lien anglais mène à `/en/articles`.
- Original dont seuls les tags, la date, la category ou la couverture changent : aucune notice.
- Original reformaté sans changer un mot, retour à la ligne ou blancs : aucune notice.
- Traduction corrigée par son traducteur : toujours à jour.
- Paire sans aucune déclaration : `untracked-pair` nommant les deux versions et leurs empreintes, les deux publiées.
- Original dépublié, ou fichier supprimé : `missing-original` nommant la Locale et le translation identifier ; la traduction est servie sans lien vers lui.
- Un article en `en`, `fr` et `es`, deux traductions du même original : chaque version lie les deux autres, et chaque en-tête mène à leurs pages.
- `/es` sans article espagnol : landing sans section de notes ; `/es/articles` répond 404.
- Les trois landing pages : chaque `href` est le mailto du contact, LinkedIn ou une URL du site, aucun vers un dépôt ou le plugin ; deux `id` de schéma distincts, aucun `approach`.
- Adresse inconnue ou ancienne forme, `/articles/c/blockchain`, `/l/en/articles` : 404 en anglais, retour vers `/en`.

## Dependencies

- Depends on : BR-PYRAMID-12 et BR-PYRAMID-13, au registre depuis le 2026-10-25.
- Blocks : seo-excellence (hreflang et sitemap sur `counterpartsOf` et `landingPages`, Canonical URL préfixée), restore-v1-urls (destinations régénérées), go-live.
