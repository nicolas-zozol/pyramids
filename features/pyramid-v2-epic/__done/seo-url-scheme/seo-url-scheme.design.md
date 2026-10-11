# Design: SEO URL scheme of the v2 site

**Last update:** 2026-07-31
**Feature:** seo-url-scheme
**Infix:** URLSCHEME
**Status:** APPROVED (2026-07-31)
**Sources:** [story](seo-url-scheme.story.md) · [brainstorm](seo-url-scheme.brainstorm.md) · [epic](../pyramid-v2.epic.md) · [root.archi.md](../../../root.archi.md) · [business-rules.md](../../../business-rules.md) · [ubiquitous-language.md](../../../ubiquitous-language.md) · [v1 routing](../../../apps/robusta/README.md)

## Goal

Give `apps/robusta-build` the URL scheme the story fixes — `/`, `/articles`, `/articles/p/{n}`, `/articles/c/{category}`, `/articles/c/{category}/p/{n}`, `/articles/c/{category}/{slug}`, `/articles/{slug}`, any of them prefixed by `/l/{locale}` — as three artefacts: a discriminant contract in the shared base, an App Router route table in the site that pregenerates every content URL, and the mapping from the v1 address space onto it. Why the scheme is shaped this way is in the [story](seo-url-scheme.story.md); this document says what is built and where it lives.

The scheme is settled and not reopened here. Two things this design adds on top of it: the route table is the single source of the URL set, and the v1 mapping is a function of the article index rather than a hand-kept table.

This document was corrected on 2026-07-31 against the first implementation, which is the reference from that date. Five points where the code and the document disagreed are recorded as dated entries in Decisions; the body says what ships.

## Ubiquitous Language

Terms are used in the sense `ubiquitous-language.md` gives them: site, site configuration, article, category, tag, blog roll, slug, locale, content source, content root, discriminant, indexable page, clean checkout, workspace, build chain.

Three consequences:

- URL is the glossary term. The story and the brainstorm say "address" for the same thing; requirements and acceptance criteria below say URL, and "address" appears only in prose carried over from those documents. No new term is proposed for it — it would be a synonym, not a concept.
- Content root and Tag entered the glossary on 2026-07-31 and this document uses them in that sense, defining neither in its own words: the content root is the single segment under which a site publishes its content section, named by the site configuration, and a tag is a classification an article may carry freely, with no page of its own today and a reserved address for the page it must stay able to grow.
- Discriminant gains the category, and Category loses its nesting sentence. Both edits are already in the story's Documentation updates; nothing here waits on them.

## Business Rules (cited)

Cited verbatim from `business-rules.md`, under the epic's Infix:

- BR-PYRAMID-1 — The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source.
- BR-PYRAMID-7 — A site must not read its content source while serving a request.
- BR-PYRAMID-9 — An article carries at most one category and any number of tags.

BR-PYRAMID-9 is where the article URL rests. `/articles/c/{category}/{slug}` designates one page only because a category is singular: a second category on the same article would give it a second address, and the scheme carries no rule for choosing between them. The other half of the rule is why `/articles/t/{tag}` is reserved and not generated — the tags of an article are many, so they classify without addressing.

No rule is created by this document. BR-PYRAMID-9 was recorded on 2026-07-31 in `business-rules.md` by `bulkman resolve` as delegated registrar; this design cites it. The story's decision of 2026-07-30 refused "a page must be reachable at exactly one address" as a business rule, and it stays R-URLSCHEME-8, 9 and 10 below.

## Interfaces

### `@robusta/pyramids-routing` — the discriminant contract

Created, as `packages/pyramids-routing`, published as `@robusta/pyramids-routing`. Zero runtime dependencies, no React, no Next import, pure string functions. It holds `l`, `c`, `p`, `t` and the shapes built from them, and it never holds the word `articles`. A new workspace rather than a subpath of `pyramids-helpers`: the helpers package is a v1-era grab-bag with a React peer, `react-icons`, `tailwind-merge` and a DaisyUI dev dependency, and a second site should be able to take the scheme without inheriting that surface. The repository keeps one architecture document per package, so the package owes `packages/pyramids-routing/routing.archi.md`, its child entry in `root.archi.md` and its line in the Packages section of `CLAUDE.md`.

```ts
export const LOCALE_DISCRIMINANT = 'l';
export const CATEGORY_DISCRIMINANT = 'c';
export const ROLL_PAGE_DISCRIMINANT = 'p';
export const TAG_DISCRIMINANT = 't';
export const RESERVED_SEGMENTS: readonly string[];

export interface UrlScheme {
  contentRoot: string;
  defaultLocale: string;
  otherLocales: readonly string[];
  rollSize: number; // the site supplies the constant 12
}

export type PageUrl =
  | { kind: 'landing'; locale: string }
  | { kind: 'blog-home'; locale: string; page: number }
  | { kind: 'category'; locale: string; category: string; page: number }
  | { kind: 'tag'; locale: string; tag: string; page: number }
  | { kind: 'article'; locale: string; category?: string; slug: string };

export interface AddressableArticle {
  slug: string;
  locale: string;
  category?: string;
}

export function buildUrl(scheme: UrlScheme, page: PageUrl): string;
export function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;
export function urlSet(scheme: UrlScheme, articles: readonly AddressableArticle[]): PageUrl[];
export function isReservedSegment(segment: string): boolean;

export type SchemeViolation =
  | { code: 'reserved-segment'; segment: string; slug: string }
  | { code: 'duplicate-slug'; slug: string; locale: string }
  | { code: 'nested-category'; category: string; slug: string }
  | { code: 'unknown-locale'; locale: string; slug: string }
  | { code: 'non-canonical-segment'; segment: string; slug: string };

export function validateArticles(scheme: UrlScheme, articles: readonly AddressableArticle[]): SchemeViolation[];
```

The contract, and each line of it is what makes the scheme hold:

- `buildUrl` emits the canonical form and nothing else. `page: 1` produces the bare roll URL, never `/p/1`; `locale === scheme.defaultLocale` produces no prefix. The non-canonical forms are not representable in its output, so they cannot be emitted by a link, a sitemap or a redirect target.
- `parseUrl` returns `undefined` for anything outside the content section. It does not claim `/`, `/pricing` or any future marketing page — only the content root and the locale prefix in front of it. The landing page is the case worth stating, because it is inside `PageUrl` and outside the parser: `parseUrl(scheme, '/')` and `parseUrl(scheme, '/l/fr')` both return `undefined`, a landing page being buildable and not parseable. The round-trip property below is therefore asserted over the content section and not over the whole of `PageUrl`.
- Canonicality is the fixed point of the pair: `p` is canonical when `buildUrl(scheme, parseUrl(scheme, p)) === p`. Where it differs, `p` is a redirect source and the built value is its target. The page-one form, the marked default locale, the trailing slash and the uppercase variant all fall out of that one rule instead of four hand-written families.
- `urlSet` derives every URL the site must produce from the article set alone: the blog home, its roll pages, one category page per category an article claims, its roll pages, and one URL per article. Never a tag URL, and never a landing page — the landing copy is robusta-landing-page's, which is why `l/[locale]/page.tsx` correctly emits no param today. It is the only place a page count is computed from `rollSize`.
- `AddressableArticle.category` is one optional string and not a list — BR-PYRAMID-9 stated in the type, so a corpus growing a second category on one article fails to compile rather than growing a second address for it.
- `TAG_DISCRIMINANT` reserves a segment and builds nothing. `buildUrl` emits `/articles/t/{tag}` and `parseUrl` recognises it, so the shape is spoken for and testable; `urlSet` never returns a `tag` page, no route file matches `t`, and a request for one answers 404 like any URL the route table does not produce. That gap is the design, not an oversight: no tag page ships with this story, and reserving the segment now costs one constant where reopening the scheme later costs a second redirect on the fourteen indexed tag URLs plus whatever slug has taken `t` in the meantime.
- `validateArticles` returns violations, it does not throw. The caller decides that a non-empty result fails the build, which is what the site does.

`urlSet` and `validateArticles` take articles, never a declared category list. That is deliberate: v1 declares seven category paths through its site configuration — `blockchain`, `blockchain/ethers-js`, `blockchain/solidity`, `web`, `javascript`, `javascript/typescript`, `javascript/react` — while its eleven articles claim six categories: `blockchain`, `javascript`, `typescript`, `privacy`, `theory` and `web`. Three declared paths no article claims, and two claimed categories are declared nowhere, which is how `/learn/privacy/s/leaving-gmail` and `/learn/theory/s/quel-second-langage` came to be pregenerated and then refused at request time. Two of eleven articles are unreachable on the live v1 site because of it.

### `apps/robusta-build/src/routing/scheme.ts` — the site's scheme instance

Created, and it is where the four scheme values live:

```ts
export const ROLL_SIZE = 12;
export const urlScheme: UrlScheme; // contentRoot 'articles', defaultLocale 'en', otherLocales ['fr'], rollSize ROLL_SIZE
```

The ownership direction is the inverse of what this design first stated, and the reason is the one that also kills the config import chain below: `seopyramids.config.ts` reaches the design system's wordmark through a bundler-only PNG import, so every module reachable from the site configuration is unreachable outside webpack — and `next.config.ts`, `scripts/emit-redirects.mjs` and `scripts/check-route-table.mjs` all have to reach the scheme from there. `scheme.ts` is a leaf module: it imports the `UrlScheme` type and nothing else.

The guarantees are untouched by the move. `articles` is written exactly once, in site-owned code, and the shared base still never holds it; `ROLL_SIZE` is still exported from `seopyramids.config.ts`; `blogConfig.contentRoot` still exists and still names the content root. What swapped is which of the two modules is the source and which is the reader.

The roll size is a constant of 12, not a per-site knob — decision of 2026-07-31. It stays a field of `UrlScheme` because `urlSet` needs the number to compute a page count, and a function taking its inputs as parameters is testable at any value; what the decision fixes is the value the site supplies, which is `ROLL_SIZE` and never a literal at a call site. The consequence is stated rather than smoothed: at 12 the real corpus of 11 articles produces no roll page at all, so `/articles/p/{n}` exists in the fixture corpus and nowhere else until the corpus passes 12 articles. That is the accepted state, not a gap — the shape is built and exercised now so that the twelfth article needs no route work.

### `apps/robusta-build/src/seopyramids.config.ts` — the content root in `blogConfig`

Modified. `blogConfig` gains one field and reads the content section's four values from `scheme.ts`, so the route table and the site configuration cannot state different ones:

```ts
import { ROLL_SIZE, urlScheme } from './routing/scheme.js';
export { ROLL_SIZE };

export interface BlogConfig {
  contentRoot: string; // urlScheme.contentRoot, 'articles'
  rollSize: typeof ROLL_SIZE; // ROLL_SIZE, not a tunable
  // unchanged: defaultLocale, otherLocales, debugImagePath, mandatoryKeywords, author, getCategories
}
```

In `blogConfig` rather than at the top level because the content root sits with the roll size and the locales the scheme reads, and because it is a property of the content section and not of the site's identity.

`getCategories` stays declared and stops being read by anything: the category URL set comes from the articles. Removing the field belongs to content-source, which owns the shape of the pipeline; leaving a second source of categories wired to a route is what this design refuses.

### `apps/robusta-build/src/routing/content-urls.ts` — the one derivation

Created. No route file calls `urlSet` itself; each calls one of the seven param functions here, which is what makes "one derivation feeds every route" a fact of the code rather than a convention (R-URLSCHEME-22):

```ts
export type LocaleScope = 'default-locale' | 'other-locales';

export function contentUrls(): Promise<PageUrl[]>;
export function blogHomeParams(): Promise<Record<string, string>[]>;
export function rollPageParams(scope: LocaleScope): Promise<Record<string, string>[]>;
export function landingParams(): Promise<Record<string, string>[]>;
export function categoryParams(scope: LocaleScope): Promise<Record<string, string>[]>;
export function categoryRollPageParams(scope: LocaleScope): Promise<Record<string, string>[]>;
export function looseArticleParams(scope: LocaleScope): Promise<Record<string, string>[]>;
export function categorisedArticleParams(scope: LocaleScope): Promise<Record<string, string>[]>;
```

`LocaleScope` is what splits the two halves of the route table: the default-locale files get params carrying no locale, the `l/[locale]/` files get params carrying it.

`contentUrls` is also where a corpus that breaks the scheme stops the build. `validateArticles` returns violations and never throws, and this caller is the one deciding a non-empty result is fatal (R-URLSCHEME-11 and 12). The message names the article by slug and locale, which is what `ArticleIndexEntry` carries.

### `apps/robusta-build/src/content/article-index.ts` — the seam content-source implements

Created. The minimal shape the route table needs, deliberately without the article body:

```ts
export interface ArticleIndexEntry {
  slug: string;
  locale: string;
  category?: string;
  title: string;
  date: string;
}

export function getArticleIndex(): Promise<ArticleIndexEntry[]>;
```

No `tags` field: a tag addresses nothing, so the route table has no use for it, and content-source is free to carry tags wherever the page body needs them.

No path field either, and that is a limit rather than a choice: a scheme violation can name the article by slug and locale and cannot name a file, because the entry carries none and the fixture corpus is one module. When content-source supplies the real index it is worth carrying the source path with each entry — the publisher fixing a violation needs the file, not the slug — and AC-URLSCHEME-04 and 05 tighten back to naming it that day.

This story ships a fixture implementation — a handful of articles in both locales, sized to force at least three roll pages so pagination is exercised on a corpus the real one does not produce. content-source replaces the implementation and keeps the signature. `getArticleIndex` is called from `generateStaticParams` and from page bodies at build time, and from nothing else (BR-PYRAMID-7).

### `apps/robusta-build/src/routing/v1-url-map.ts` — the mapping artefact

Created. The mapping is a function of the article index, not a table:

```ts
export type V1Destination =
  | { kind: 'permanent'; to: string }
  | { kind: 'gone' }
  | { kind: 'none'; why: string };

export interface V1MappingRow {
  from: string;
  destination: V1Destination;
  note?: string;
}

export function v1UrlMap(scheme: UrlScheme, articles: readonly ArticleIndexEntry[]): V1MappingRow[];
export const V1_RAW_MARKDOWN_URLS: readonly string[];
export const V1_TAG_URLS: readonly string[];
export const V1_DECLARED_CATEGORY_PATHS: readonly string[][];
```

Three destination kinds because the mapping has three outcomes, and the third one is why the artefact exists: `none` rows emit nothing and are listed so that `/portfolio` and `/fr/portfolio` are visibly let go rather than forgotten. The three constants are the v1 inventory that no article index can produce — the raw markdown URLs, the tag URLs, the declared category paths — read once from the v1 code and frozen. Which destination a tag URL or a declared category path takes is not frozen with them: `v1UrlMap` recomputes it against the article index, so the day an article claims `solidity` the corresponding rows change without an edit.

The module imports nothing from Next and nothing from React, which is what lets a plain Node script run it. Rules per class are in the mapping section below.

### `apps/robusta-build/next.config.ts` and `scripts/emit-redirects.mjs` — the permanent redirects

The config does not import the routing modules, and no configuration makes it able to. Two blockers, independent of each other, and both worth stating because both generalise:

- Next compiles `next.config.ts` to CJS and registers a `require.extensions['.ts']` hook, but module resolution happens before that hook fires. This repository's local imports end in `.js` where the source is `.ts`, so the resolver looks for files that do not exist. `experimental.extensionAlias` does not help: it belongs to the webpack pipeline, and the config is loaded outside it.
- Independently of the extensions, the chain dies on a `SyntaxError` at `robusta-build-wordmark.png`, because `seopyramids.config.ts` reaches the design system's wordmark through a bundler-only PNG import that Node cannot parse.

So the fallback the design named is the design, and no longer a contingency:

- `apps/robusta-build/tsconfig.routing.json` compiles `routing/scheme.ts`, `routing/v1-url-map.ts`, `routing/content-urls.ts` and `src/content` to plain ESM under `apps/robusta-build/.routing-dist/`, which is gitignored.
- `apps/robusta-build/scripts/emit-redirects.mjs` runs that output and writes `apps/robusta-build/src/routing/v1-url-map.generated.json`: the scheme's four values, the row counts and the rows.
- `next.config.ts` reads that file with `node:fs` and throws a named error when it is missing. `async redirects()` returns the `permanent` rows plus the two canonical-form families, and asserts on the way through that the twelve route folders the configured content root implies all exist (R-URLSCHEME-30).
- The site's `build` script is `yarn emit:redirects && next build && node scripts/check-route-table.mjs`, and its `dev` script runs `emit:redirects` first.

The generated JSON is committed on purpose. R-URLSCHEME-14 asks for a mapping written down and reviewable before any redirect ships, and a file in the tree is exactly that: a diff shows the map changing when the corpus does. It stays generated output all the same — `emit-redirects.mjs` rewrites it whole, and no hand edit survives a build.

The two canonical-form families the mapping does not carry:

- `/l/{defaultLocale}` to `/`, and `/l/{defaultLocale}/:path*` to `/:path*`
- `/articles/p/1` to `/articles`, `/articles/c/:category/p/1` to `/articles/c/:category`, and their `/l/:locale`-prefixed forms

Every rule states `permanent: true`, which Next emits as 308. Google treats 308 as a permanent redirect exactly as it treats 301, and 308 is what `permanent` means in this API; `statusCode: 301` exists if a specific tool ever requires it.

`redirects()` is evaluated at build time and compiled into the platform's routing layer, ahead of the filesystem. That is what lets the eight `.md` rules answer for files the v2 site does not carry.

### `apps/robusta-build/src/app/learn/[...path]/route.ts` — the Gone handler

Created. `redirects()` cannot answer anything that is not a redirect, so the 410 needs its own mechanism, and a route handler is the cheapest one that is not middleware. It answers 410 for any document URL under `/learn` that no redirect claimed, and reads nothing at all — no content source, no article index, no filesystem.

`/learn` itself never reaches it: a redirect claims it first. Neither does any URL a redirect rule matches. What remains is the retired namespace, which is the whole point.

Gone is scoped to documents. The 73 image URLs published under `public/learn/**/images` answer 404 and not 410: a path carrying an `images` segment falls through instead of being declared retired. Where those images end up on the v2 site is migrate-learn-content's deliverable, and asserting a deliberate retirement for an image about to be republished at another URL is the one thing 410 should not be used for.

### `apps/robusta-build/src/middleware.ts` — case normalization

Created, and it is the only middleware the site carries. A matched path is 308-redirected to its lowercase form, and the matcher is what keeps it both cheap and harmless:

```ts
export const config = { matcher: ['/((?!learn/|learn$|_next/)(?=[^?]*[A-Z]).*)'] };
```

The rule the string encodes is what matters: a case-normalising rule must exclude every namespace whose paths are case-significant. There are two of them here, and the first design named only one.

- `/learn` is excluded so the v1 mapping keeps matching the addresses as they were published — `/learn/tag/DeFi` included.
- `/_next` is excluded because build assets live under `/_next/static/{buildId}/` and a build ID contains uppercase letters; this build's was `MCEymiDwC1K1U9y1TRjFa`. Without that exclusion every asset of every build is 308-redirected to a lowercase path that does not exist, and the site ships broken.

The lookahead `(?=[^?]*[A-Z])` is the rest of it: a path with no uppercase letter never invokes the middleware, so normal traffic does not reach it at all.

This is the fourth family of R-URLSCHEME-10 and the only one Next does not give for free: the trailing slash is already normalised by `trailingSlash: false`, the marked default locale and the explicit page one are `redirects()` rules.

## Route table

Under `apps/robusta-build/src/app`, static segments where the scheme has literals, so the router does the discrimination rather than a parser the router could disagree with.

Default locale:

- `page.tsx` — `/`, the landing page. Exists; its content is robusta-landing-page's.
- `articles/page.tsx` — `/articles`, page one of the blog roll. No params.
- `articles/p/[n]/page.tsx` — `/articles/p/{n}`. Params: `n` from 2 to the page count of the whole roll; the empty list on a corpus of one page.
- `articles/[slug]/page.tsx` — `/articles/{slug}`, an article carrying no category. Params: the default-locale articles with no category.
- `articles/c/[category]/page.tsx` — `/articles/c/{category}`. Params: the categories default-locale articles claim.
- `articles/c/[category]/p/[n]/page.tsx` — `/articles/c/{category}/p/{n}`. Params: category and page pairs, `n` from 2.
- `articles/c/[category]/[slug]/page.tsx` — `/articles/c/{category}/{slug}`. Params: category and slug pairs of the default-locale articles carrying a category.

Seven files, and no `articles/t/[tag]/` among them. The tag segment is reserved by the contract and served by nothing, so `/articles/t/rxjs` answers 404 exactly like a slug that does not exist.

Non-default locales, mirroring the seven above under `l/[locale]/`, with `locale` taken from `otherLocales` and never from `defaultLocale` — which is what makes `/l/en/...` a redirect rather than a page. `l/[locale]/page.tsx` is the locale-prefixed landing: it is part of the shape, and its param set is empty until robusta-landing-page supplies landing copy in another locale, so it emits nothing today. That emptiness is the derivation being consistent, not a hole: `urlSet` produces no landing page, and `parseUrl` claims none either.

Every one of these files declares `dynamic = 'force-static'` and `dynamicParams = false`, and gets its params from `content-urls.ts`, which is `urlSet(urlScheme, await getArticleIndex())` filtered by kind and by locale scope. Three consequences, and they are the requirements this table exists to satisfy:

- `dynamicParams = false` makes a URL the table does not produce answer 404 instead of being resolved on demand. `/articles/p/999` is a 404, not an empty roll.
- `force-static` makes `searchParams` resolve to an empty object, so no content route can read a search parameter even by accident.
- One derivation feeds every route, so the v1 failure mode — a pregenerated URL a second list then refuses — has no place to occur. `parseUrl` is used at build time, in the mapping and in tests, never while serving.

Whether `revalidate` stays `false` is content-source's call and changes none of the above.

The site's route folder `articles/` and `blogConfig.contentRoot` are two site-owned statements of the same value, and two build-time checks tie them together. `next.config.ts` asserts inside `redirects()` that every route folder the configured content root implies exists, so a rename that touches one and not the other fails the build (R-URLSCHEME-30). `scripts/check-route-table.mjs` runs after `next build` and compares the prerender manifest against the derived URL set, `/` and `/_not-found` excluded as being outside the content section (AC-URLSCHEME-42). The alternative — a `[root]` dynamic segment whose only param is the configured value — buys configuration purity that one site does not need, at the cost of a route tree nobody can read.

### What discriminates what

- `/articles/c/...` against `/articles/{slug}`: `c` is a static segment and outranks the dynamic sibling, so a category URL never reaches the article route. `/articles/c` on its own would match `[slug]` with the value `c`, which `dynamicParams = false` turns into a 404 because no such slug is ever generated — and `validateArticles` fails the build before it could be.
- `/articles/c/{category}/p/{n}` against `/articles/c/{category}/{slug}`: five segments against four, and `p` is a static segment under `[category]`, so the router separates them structurally. The genuine ambiguity is a slug literally named `p`, which would claim `/articles/c/{category}/p` and read as a truncated roll URL to a human, a link checker and a crawler alike. What forbids it is `validateArticles`: a slug or a category equal to `l`, `c`, `p` or `t` returns a `reserved-segment` violation and the build fails naming the offending article. The four discriminants are reserved words at every level of the scheme, which is also what keeps the locale prefix unambiguous.
- `/articles/t/{tag}` against nothing: the segment discriminates no route today, because no route carries it. It is reserved all the same — `validateArticles` refuses `t` as a slug and as a category — so the tag page the scheme must stay able to grow finds its address free instead of taken by an article published in the meantime. Reserved is not unwritten: nothing under `t` is built, served or redirected by this story.
- Nesting is what would break this, and it is dropped. A category is exactly one segment, so the tail after `/c/{category}` is either one segment (a slug) or exactly two (`p` and a number). `validateArticles` returns `nested-category` on a category containing a slash, so the corpus cannot reintroduce the case the router could not decide.

## The v1 to v2 mapping

Structure: a rule per class of v1 URL, applied by `v1UrlMap` to the article index, and emitted as `src/routing/v1-url-map.generated.json`. Rows are generated where the article index determines them, and enumerated where the v1 inventory does — the raw markdown files, the tag URLs and the declared category paths cannot be derived from anything v2 holds.

Two inputs the rules depend on and this story does not own. The slug does not change: v1 derives it from the title through `immutableSlugify`, which the code forbids changing, and v2 keeps that slug. The locale does change on two articles: migrate-learn-content's decision of 2026-07-30 corrects `yield-farming.md` and `why-migration-gatsby-next.md`, which are English pieces declaring `locale: "fr"`, so the real split is 8 English and 3 French and the mapping is computed after that correction.

Rules per class:

- Blog home. `/learn` to `/articles`, `/learn/fr` to `/l/fr/articles`. Two rows.
- Blog roll pages. `/learn/page/{n}` and its locale-marked form take destination `none`, one row per locale: v1 never generated one, its corpus of 11 articles never reaching the roll size of 12. The shape is listed rather than dropped, because a shape the v1 code can serve belongs in the mapping whether or not a row of it was ever built.
- Category pages. `/learn/{categoryPath}` and `/learn/{categoryPath}/page/{n}` to `/articles/c/{category}` when an article claims that category, and to `/articles` when none does. `{categoryPath}` is one of the seven paths v1 declares, and `{category}` is its last segment: v2 categories are flat, so a nested v1 path maps to its leaf and not to its head — `javascript/typescript` reaches `/articles/c/typescript`. Seven declared paths, in two locales, in two forms — twenty-eight rows, not seven: AC-URLSCHEME-62 requires the paginated form to have a destination too, and the page number is dropped, every v2 category roll being one page on this corpus. The destinations are recomputed by `v1UrlMap` from the article index rather than read from here; on the corpus of today `blockchain`, `web`, `javascript` and `javascript/typescript` reach a category page, and `blockchain/ethers-js`, `blockchain/solidity` and `javascript/react` reach the blog home, no article having ever claimed them.
- Articles. `/learn/{categoryPath}/s/{slug}` and its locale-marked form to the article's v2 URL, `/l/{locale}/` prefix included when the locale is not the default. One row per article of the index carrying a category, which on today's fixture is thirty-one: the eleven migrated articles, plus the twenty pagination fillers that carry one. The fillers are the honest consequence of a mapping derived from the article index meeting a fixture corpus that must force three roll pages; their slugs carry a `fixture-` prefix, so they are self-labelling in the emitted JSON, and they vanish the day content-source supplies the real index. Of the eleven real rows, one is where the v1 path and the v2 category part ways: `/learn/javascript/typescript/s/completes-with` reaches `/articles/c/typescript/completes-with`, the article claiming `typescript` and nothing else. Two others — `/learn/privacy/s/leaving-gmail` and `/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere` — answer 404 on the live v1 site today because their category is declared nowhere; they are mapped anyway, since a redirect on a URL that currently fails costs one row and recovers whatever was indexed before the configuration drifted.
- Tag pages. `/learn/tag/{tag}` to `/articles/c/{tag}` when an article claims a category of that name, and to `/articles` otherwise; the tag itself stays metadata with no page. Fourteen rows, and the split between the two destinations belongs to `v1UrlMap`, computed from the corpus, not to this prose: on the corpus of today three tags reach a category page — `javascript`, `blockchain`, `web` — and eleven reach the blog home. A tag is never promoted to a category to make a redirect land: an article carries at most one category (BR-PYRAMID-9), and the address a tag page would take is `/articles/t/{tag}`, reserved and unbuilt. `/learn/tag/{tag}/page/{n}` is one `none` row, no tag having reached the roll size.
- Raw markdown. The thirteen `.md` files published under `public/learn` are keyed by file name and not by slug, so they are enumerated. Eight redirect permanently to the v2 URL of the article whose content travels — `blockchain/s/ledger-versus-metamask.md`, `blockchain/s/start-coding-blockchain.md`, `blockchain/s/yield-farming-fr.md`, `javascript/s/completes-with.md`, `javascript/s/styled-components.md`, `privacy/leaving-gmail.md`, `theory/quel-second-langage.md`, `web/easy-automation-with-sonoff.md`. Five answer 410 Gone, their content existing nowhere in the corpus: `javascript/s/completes-with-fr.md`, `javascript/s/es6-7.md`, `javascript/s/javascript-build.md`, `javascript/s/redux-en.md`, `theory/solid-principles.md`. This settles the count the story could not: eight and five, not one and twelve. `completes-with-fr.md` is the one judgement call inside the class — it is the French version of an article that does travel, but the French text does not, and a redirect to a page in another language is read as a soft 404, which is exactly what the arbitration of 2026-07-30 chose 410 to avoid. Should migrate-learn-content republish any of the five, its row moves from `gone` to `permanent` and nothing else changes.
- Images. The 73 files under `public/learn/**/images` are one `none` row, `/learn/:path*/images/:file`, and answer 404, the Gone handler letting any path with an `images` segment fall through. They are a migrate-learn-content deliverable, not a retirement.
- Portfolio. `/portfolio` and `/fr/portfolio` are listed with destination `none`, per the arbitration of 2026-07-30. They emit no rule and answer 404. `/fr/portfolio` has no route in the v1 code and survives from an earlier site; it is listed all the same, because the arbitration named it.
- The v1 landing and the development leftovers. `/`, `/prosemirror/:path*`, `/test/:path*` and `/_design-test` are `none` rows: four rows, listed rather than left out of the mapping. The leftovers have no editorial value, which is the brainstorm's scope line, and `/` needs nothing because the v2 landing serves that URL. Listing them is what AC-URLSCHEME-67 asks for — every shape the v1 code can serve appears exactly once — and `none` is precisely the destination of a shape deliberately given none.
- Everything else under `/learn`. Gone, as one `/learn/:path*` row. The section is retired as a whole, so the exception list is empty rather than enumerated, and a crawler drops the URL cleanly instead of reading a redirect to an unrelated page as a soft 404.

Row counts on today's fixture corpus, as the emitted JSON holds them:

- blog home — 2 permanent
- blog roll pages — 2 none
- category pages — 28 permanent
- articles — 31 permanent
- tag pages — 14 permanent, 1 none
- raw markdown — 8 permanent, 5 gone
- images — 1 none
- portfolio — 2 none
- the v1 landing and the development leftovers — 4 none
- the `/learn` namespace — 1 gone

Ninety-nine rows in total: 83 permanent, 6 gone, 10 none. `emit-redirects.mjs` prints the three counts on every run, so a corpus change that moves them is visible without reading the file.

What emits what: `permanent` rows become `redirects()` entries in `next.config.ts`; the `gone` rows of the raw markdown class and the `/learn/:path*` namespace row are both answered by the `/learn` route handler, which needs no enumeration to be right; `none` rows emit nothing and exist to be read.

The mapping is enumerated from the v1 route code, which is what the code actually serves. Checking it against the indexed set of Search Console is migrate-learn-content's, whose decision of 2026-07-30 already fixes that pass as a verification and not an input.

## Technical Constraints

- Next 15 App Router with RSC on Vercel. Static segments, catch-all segments and `generateStaticParams` are what make the scheme pregenerable; reading a search parameter is what would break it, and `dynamic = 'force-static'` removes the possibility rather than forbidding it.
- Routing order puts `redirects()` from `next.config.ts` ahead of the filesystem, which is why redirects answer for `.md` URLs the site does not carry. The case-normalising middleware and the v1 mapping are kept disjoint by the middleware matcher — it excludes `/learn` — so nothing in this design depends on the relative order of middleware and configuration redirects.
- `next.config.ts` cannot import application code, and no setting changes that. Next compiles it to CJS and registers a `require.extensions['.ts']` hook that fires after module resolution, so the repository's `.js`-suffixed local imports resolve to files that do not exist; `experimental.extensionAlias` belongs to the webpack pipeline, which the config is loaded outside of. Anything the site configuration can reach is doubly out, the design system's wordmark being a bundler-only PNG import. Whatever the config needs from the application is emitted by a build script and read as data.
- Build assets are case-significant. They live under `/_next/static/{buildId}/` and a build ID carries uppercase letters, so any request-time normalisation of case must exclude `/_next` — and, by the same argument, any namespace whose paths mean something in their own case.
- Local TypeScript imports end in `.js` even though the source is `.ts`. This holds inside the site and inside the new package; the package is consumed by its name, so no extension question crosses the boundary. The one place the rule bends is `tsconfig.routing.json`, whose `moduleResolution: "Node"` output is run by Node directly.
- Apps consume built artefacts. `@robusta/pyramids-routing` takes a slot in `build:deps` before the site builds, and depends on nothing, so the slot is free — first in the chain. `apps/robusta-build` declares it at `workspace:*`, its second workspace dependency after the design system, and a developer editing it needs the watcher like any other package.
- Node 22, yarn 4.17.1, `nodeLinker: node-modules`, React 19.1.1. The new package declares no dependency at all, so it introduces no second copy of anything.
- The shell carries `robots: { index: false, follow: false }` in its root layout, site-wide, until robusta-landing-page lifts it. Every route this story ships is therefore built, served and unindexable. That is fine for the routes and fatal for the redirects: sending the indexed v1 URLs to targets that say not to index trades indexed pages for de-indexed ones. The redirects go live on robusta.build only once the flag is lifted, which sequences them with retire-robusta-v1 and not with this story.
- The corpus is 11 articles at a roll size fixed at 12, so pagination produces no URL at all on the real content, and six categories, one of which — `typescript` — holds a single article, a roll the arbitration of 2026-07-31 accepted knowingly. Both were weighed on 2026-07-31 and both stand. The fixture corpus therefore has to force at least three pages, or the shape ships unexercised — and it is the only place it is exercised until the corpus passes twelve articles.
- Slugs are lowercase ASCII today and the constraint is stated so the first accented French slug does not decide it by accident. `validateArticles` returns `non-canonical-segment` on anything else.

## Requirements

R-URLSCHEME-1 to 15 keep the brainstorm's numbers, so the story's decisions of 2026-07-30 keep referring to what they referred to: R-URLSCHEME-5, 8, 9 and 10 mean here exactly what those decisions say they mean. Nothing is renumbered. Three are restated by arbitration rather than by choice — R-2 because the content root moved into site configuration, R-3 because arbitration C2 put the category back into the article URL, R-4 and R-5 because nesting is dropped, R-5 having stated the opposite. The block from 21 is what this design adds, R-URLSCHEME-31 included: the arbitrations of 2026-07-31 append rather than renumber.

The scheme

- R-URLSCHEME-1: The site determines from the shape of a URL alone whether it designates the landing page, the blog home, a category page, a roll page or an article, without reading any article. Realizes BR-PYRAMID-1.
- R-URLSCHEME-2: The content section is rooted at one segment named by the site configuration; the discriminants that follow it belong to the shared base, which carries no site's editorial word.
- R-URLSCHEME-3: An article carrying a category is addressed under that category, and one carrying none directly under the content root; the content root never appears twice in a URL. Realizes BR-PYRAMID-9.
- R-URLSCHEME-4: A category is addressed under the category discriminant by exactly one segment, and no category URL nests.
- R-URLSCHEME-5: A category page presents the articles claiming that exact category.
- R-URLSCHEME-6: The set of category URLs is derived from the categories the articles claim. No category URL exists that no article claims, every category an article claims has one, and no route reads a declared category list.
- R-URLSCHEME-7: A blog roll is paginated by the roll-page discriminant carrying the page number. The number of articles per page is the roll size, a constant of 12, and never appears in a URL.
- R-URLSCHEME-8: The first page of a blog roll is addressed by the roll's own URL, on the blog home as on a category page; the explicit page-one form redirects to it permanently.
- R-URLSCHEME-9: A page in a non-default locale carries the locale discriminant at the head of its URL. The default locale carries no marker, and the marked form of a default-locale URL redirects permanently to the unmarked one.
- R-URLSCHEME-10: A page is reachable at exactly one URL. Any other form that would serve the same content — explicit page one, marked default locale, trailing slash, letter case — redirects permanently to it.
- R-URLSCHEME-11: The discriminant segments `l`, `c`, `p` and `t` are reserved words at every level: no article slug and no category may take one of those values, whether or not a page is served under the segment, and the build fails naming the offending article.
- R-URLSCHEME-12: An article slug is unique within its locale across the whole site, and the build fails naming the slug and the locale on a collision.
- R-URLSCHEME-13: Every content URL of the site is produced at build time. No content page is resolved at request time and no content route reads a search parameter. Realizes BR-PYRAMID-7.

The mapping

- R-URLSCHEME-14: Every URL the v1 site published has a destination, and that mapping is written down and reviewable before any redirect ships.
- R-URLSCHEME-15: A URL whose content does not travel to the v2 site is retired deliberately rather than redirected to a page that does not answer it.
- R-URLSCHEME-25: The `/learn` namespace is retired: a document URL under it that no mapping rule claims answers Gone, while an image URL under it falls through to 404, its fate belonging to the content migration.
- R-URLSCHEME-26: A v1 tag URL redirects to the category page of the same name when that category has a page, and to the blog home otherwise; which tags take which destination is derived from the corpus, and no tag has a page of its own.
- R-URLSCHEME-27: A raw markdown URL redirects permanently to the article when that article's content travels to v2, and answers Gone when it does not.
- R-URLSCHEME-28: `/portfolio` and `/fr/portfolio` appear in the mapping as receiving no destination, rather than being left unlisted.
- R-URLSCHEME-29: The redirects go live on the published domain only once the site's pages are indexable.

The base and the site

- R-URLSCHEME-21: The shared base exposes one URL builder and one parser, and the canonical form of a URL is what the builder emits; a form the builder cannot emit is a redirect source whose target is the built value.
- R-URLSCHEME-22: One derivation of the URL set feeds every route's pregeneration, and no second list accepts or rejects a URL at request time.
- R-URLSCHEME-23: A URL the route table does not produce answers 404 rather than being resolved on demand.
- R-URLSCHEME-24: When an article's category changes after publication, its former URL enters the redirect map rather than being dropped.
- R-URLSCHEME-30: The site's content-root route folder and the configured content root state the same value, and the build fails when they diverge.
- R-URLSCHEME-31: The tag address is reserved by the scheme: the builder and the parser know its shape, no such URL is produced and no route serves one.

## Acceptance Criteria

Cast: Barbot is a crawler; Nina is the publisher; Ada develops the site; Tux builds from a clean checkout.

The scheme

- AC-URLSCHEME-01: Given the URL of a fixture article claiming no category, `/articles/fixture-en-uncategorised-01`, when the site resolves it, then it serves an article page and reads no article set to decide that. Realizes BR-PYRAMID-1.
- AC-URLSCHEME-02: Given an article claiming the category `javascript`, when the site is built, then it is served at `/articles/c/javascript/{slug}` and at no URL repeating the content root.
- AC-URLSCHEME-03: Given an article claiming no category, when the site is built, then it is served at `/articles/{slug}`.
- AC-URLSCHEME-04: Given a fixture article whose slug is `l`, `c`, `p` or `t`, or a fixture category taking one of those four values, when Tux builds, then the build fails, naming the offending segment and the slug of the article that carries it.
- AC-URLSCHEME-05: Given two fixture articles of the same locale sharing a slug, when Tux builds, then the build fails, naming the slug and the locale.
- AC-URLSCHEME-06: Given a fixture corpus where no article claims `solidity`, when the site is built, then no URL exists for that category; and given one article claiming `privacy` with no configuration mentioning it, then `/articles/c/privacy` exists and serves it.
- AC-URLSCHEME-07: Given a fixture article claiming the category `typescript`, when the site is built, then it is served at `/articles/c/typescript/{slug}` and under no other category, whatever folder its source file sits in. Realizes BR-PYRAMID-9.

Pagination and locale

- AC-URLSCHEME-21: Given a fixture roll of 30 articles at a roll size of 12, when the site is built, then `/articles`, `/articles/p/2` and `/articles/p/3` are produced and no other roll URL exists.
- AC-URLSCHEME-22: Given `/articles/p/1`, when Barbot requests it, then it is permanently redirected to `/articles`; and the same holds for `/articles/c/{category}/p/1` against `/articles/c/{category}`.
- AC-URLSCHEME-23: Given `/articles/p/999` on that roll, when Barbot requests it, then the site answers 404 and never an empty roll.
- AC-URLSCHEME-24: Given a French fixture article, when the site is built, then it is served under `/l/fr/` and no unmarked form of it exists.
- AC-URLSCHEME-25: Given `/l/en/articles/fixture-en-uncategorised-01` where `en` is the default locale, when Barbot requests it, then it is permanently redirected to `/articles/fixture-en-uncategorised-01`.
- AC-URLSCHEME-26: Given a reader whose browser prefers French arriving at `/articles/c/privacy/leaving-gmail`, when the page is served, then no redirect to a locale occurs.
- AC-URLSCHEME-27: Given `/Articles/C/Privacy/Leaving-Gmail` and `/articles/c/privacy/leaving-gmail/`, when Barbot requests either, then both are permanently redirected to `/articles/c/privacy/leaving-gmail`. Realizes R-URLSCHEME-10.

Build time and the route table

- AC-URLSCHEME-41: Given any content route, when the site is built, then it is pregenerated, its search parameters resolve to nothing, and no request-time resolution occurs. Realizes BR-PYRAMID-7.
- AC-URLSCHEME-42: Given the built route table and the URL set the base derives from the fixture corpus, when the two are compared, then they are equal — no URL is pregenerated that the site then refuses, and none is served that the derivation does not contain.
- AC-URLSCHEME-43: Given the configured content root and the site's route folders, when they diverge, then the build fails.
- AC-URLSCHEME-44: Given the site is served, when its routes are inspected, then the URL parser is called nowhere on the request path.
- AC-URLSCHEME-45: Given a fixture corpus whose articles carry tags, when the site is built, then no `/articles/t/{tag}` URL is produced and Barbot requesting one gets a 404, while the builder and the parser both accept that shape. Realizes R-URLSCHEME-31.

The v1 mapping

- AC-URLSCHEME-61: Given `/learn/blockchain/s/ledger-versus-metamask`, when Barbot requests it on the v2 site, then it is permanently redirected to that article's v2 URL under its category.
- AC-URLSCHEME-62: Given `/learn/fr/javascript/page/2`, when Barbot requests it, then it is permanently redirected to the French blog home's counterpart of that roll.
- AC-URLSCHEME-63: Given the fourteen `/learn/tag/{tag}` URLs, when Barbot requests each, then each is permanently redirected either to a category page that exists or to the blog home, and none lands on a 404.
- AC-URLSCHEME-64: Given the thirteen raw markdown URLs, when Barbot requests each, then eight are permanently redirected to their article and five answer 410 Gone.
- AC-URLSCHEME-65: Given a document URL under `/learn` that no rule claims, when Barbot requests it, then the site answers 410 and never a redirect to an unrelated page. Realizes R-URLSCHEME-15.
- AC-URLSCHEME-66: Given `/portfolio`, when Barbot requests it, then the site answers 404, and the mapping shows that URL listed as receiving no destination.
- AC-URLSCHEME-67: Given the mapping and the v1 route code, when the two are compared, then every URL shape that code can serve appears in the mapping exactly once.
- AC-URLSCHEME-68: Given `/learn/javascript/typescript`, when Barbot requests it, then it is permanently redirected to `/articles/c/typescript` and not to `/articles/c/javascript`; and the article URL `/learn/javascript/typescript/s/completes-with` reaches `/articles/c/typescript/completes-with`.
- AC-URLSCHEME-69: Given an image URL under `/learn`, when Barbot requests it, then the site answers 404 and never 410.

Ordering

- AC-URLSCHEME-81: Given the site still answers not to index, when Nina checks the deployment plan, then no redirect from the v1 address space is live on the published domain.

## Dependencies

- Depends on: bootstrap-robusta-build — satisfied, `84c3587`. The site exists as a deployable shell at 4/4 static pages and carries the root layout this design's routes render under.
- Depends on: content-source for the real `getArticleIndex`. Not satisfied, and not blocking: this story ships the fixture implementation and the signature.
- Depends on: migrate-learn-content for the two frontmatter locale corrections the mapping's article rows are computed after.
- Blocks: migrate-learn-content, which ships the redirects and the real corpus, and seo-excellence, which derives canonicals, hreflang and the sitemap from this scheme.
- Sequenced with: robusta-landing-page, which lifts the site-wide noindex, and retire-robusta-v1, which is when the redirects go live.

## Out of scope

- Canonical tags, hreflang, sitemap, `robots.txt`, structured data and internal linking — seo-excellence computes them from this scheme.
- The tag page. `/articles/t/{tag}` is a reserved address and nothing else: no route, no params, no page copy, no redirect target. Whether a tag ever gets a page is a later story's question, and the reservation is what keeps that question cheap.
- The rendering of the landing page, the rolls and the articles. This story produces URLs and route files, not page copy.
- How articles reach the site — content-source. This design names the seam and ships fixtures behind it.
- The redirects as shipped code on the live domain, and the content move — migrate-learn-content.
- Which of the five articles existing only under `public/learn` get republished, and where the 73 images under `public/learn/**/images` end up. The mapping states what their URLs do in the meantime, which is a different question.
- The v1 site's own routing debt, including its README documenting the article discriminant as `p` where the code uses `s`.

## Decisions

- 2026-07-31 — `typescript` is a flat category of its own: the article `apps/robusta/content/blog/javascript/typescript/completes-with.md` is served at `/articles/c/typescript/completes-with`, and the v1 category path `javascript/typescript` maps to `/articles/c/typescript` rather than up to `javascript`. Pourquoi : arbitration of Gap 1, against its proposition — the same arbitration as Gap 1 of the story, read twice; an article carries at most one category and `typescript` is the one this article claims, the one-article roll being accepted knowingly. Impact : the sections above still read `/articles/c/javascript/{slug}` for that article and send `javascript/typescript` to `/articles/c/javascript` in the mapping; rewriting them belongs to designman.
- 2026-07-31 — The tag rule stands on its own condition and its enumeration is dropped: a v1 tag URL reaches the category page of the same name when that category has a page and the blog home otherwise, and the split is recomputed from the corpus by `v1UrlMap` rather than fixed in prose — three tags to a category page and eleven to the blog home on today's corpus. A page carries at most one category and any number of tags; a tag is therefore never promoted to a category to make a redirect land, and a page of tags is not mandatory now but must stay possible later. Pourquoi : arbitration of Gap 2, which reframes the entry rather than picking a branch — the decision's own condition settles the enumeration, and a redirect onto a 404 is worse than the soft 404 the decision was written to avoid. Impact : the story's decision of 2026-07-30 and its definition of done still state six tags and eight, and correcting them belongs to storyman.
- 2026-07-31 — The discriminant set is `l`, `c`, `p`, `t`, and `/articles/t/{tag}` is reserved now. No tag page is built and no tag route ships with this story; the segment is spoken for, `buildUrl` and `parseUrl` know its shape, and no article slug and no category may ever take the value `t`. Pourquoi : the arbitration of Gap 2 makes a tag page a page this scheme must be able to grow, and reserving the segment costs one line where reopening the scheme later costs a second redirect on the eleven tag addresses plus whatever slug has taken `t` in the meantime. Impact : the Interfaces section declares three discriminant constants, the reserved-segment reasoning of the route table and R-URLSCHEME-11 read `l`, `c` or `p`, and AC-URLSCHEME-04 exercises `p` and `c` only; the rewrite belongs to designman.
- 2026-07-31 — BR-PYRAMID-9 is recorded — "An article carries at most one category and any number of tags" — and `Tag` enters `ubiquitous-language.md` in the same pass. Pourquoi : arbitration of Gap 2, applied by `bulkman resolve` as delegated registrar after the four tests; `/articles/c/{category}/{slug}` is unambiguous only if a category is singular, so the whole scheme rests on it, and a constraint the scheme cannot survive losing belongs in the registry rather than in one story's decisions. Impact : the Business Rules (cited) section cites BR-PYRAMID-1 and BR-PYRAMID-7 and now has a third rule to cite.
- 2026-07-31 — `Content root` enters `ubiquitous-language.md`: the single segment under which a site publishes its content section, named by the site configuration. Pourquoi : lgtm on the proposition of Gap 3 — the glossary already carries Discriminant and Blog roll, and the content root is what separates them from the site's editorial vocabulary. Impact : the story's Documentation updates owes the matching bullet, which is storyman's to add.
- 2026-07-31 — The documentation plan gains a new architecture document `packages/pyramids-routing/routing.archi.md`, the child entry in `root.archi.md` and the package line in the Packages section of `CLAUDE.md`. Pourquoi : lgtm on the proposition of Gap 4, unconditional now that Open Question 1 chose a new workspace — the repository's convention is one `.archi.md` per package, and a base package invisible to the architecture document is a package the next site will not know it may reuse. Impact : the story's Documentation updates carries none of the three bullets, which is storyman's to add.
- 2026-07-31 — The discriminant contract lives in a new workspace, `packages/pyramids-routing`, published as `@robusta/pyramids-routing`, with no dependency of its own and a slot at the head of `build:deps`. Pourquoi : lgtm on the proposition of Open Question 1 — `pyramids-helpers` is a v1-era grab-bag with a React peer, `react-icons`, `tailwind-merge` and a DaisyUI dev dependency, and a second site should be able to take the scheme without inheriting the v1 helper surface. Impact : the Interfaces section already describes the package as created; what changes is that the choice is settled rather than open.
- 2026-07-31 — The 73 image URLs published under `public/learn/**/images` fall through to 404 rather than answering 410, and Gone stays scoped to document URLs. Pourquoi : lgtm on the proposition of Open Question 2 — where those images end up on the v2 site is migrate-learn-content's deliverable, and asserting a deliberate retirement for an image about to be republished at another URL is the one thing 410 should not be used for.
- 2026-07-31 — The roll size is a constant of 12, `ROLL_SIZE` in the site configuration, and not a per-site knob: "Approve, no roll size : make it fix with a constant parameter of 12". Pourquoi : arbitration of the point raised at validation — the real corpus of 11 articles produces no roll page at 12, and rather than lower the value to make pagination visible today, the value is fixed and the shape is exercised on the fixture corpus alone until the twelfth article arrives. `UrlScheme.rollSize` stays a parameter, so `urlSet` is testable at any value; what is constant is what the site supplies. Impact : R-URLSCHEME-7 and the Constraints section state the fixed value, and the story's definition of done, which reads "at the roll size of `seopyramids.config.ts`", is storyman's to correct.
- 2026-07-31 — Status DRAFT to APPROVED, validated by the human after a walkthrough of the interfaces, the route table and the mapping. Pourquoi : the four points raised at validation were weighed and three of them stand as designed — the single-article `typescript` roll, the redirects staying dormant while the shell is `noindex`, and the unverified `next.config.ts` import chain, which carries a stated fallback. Only the roll size produced a change, recorded above. Implementation may start.
- 2026-07-31 — `next.config.ts` does not import the routing modules, and the emitted JSON is the design rather than a contingency: `tsconfig.routing.json` compiles them to the gitignored `.routing-dist/`, `scripts/emit-redirects.mjs` writes `src/routing/v1-url-map.generated.json`, the config reads it with `node:fs`, and the app's `build` and `dev` scripts emit it first. Pourquoi : the first implementation found two independent blockers and neither is fixable from configuration — Next compiles the config to CJS and registers its `require.extensions['.ts']` hook after module resolution has already failed on the repository's `.js`-suffixed local imports, and the chain dies again on a `SyntaxError` at `robusta-build-wordmark.png`, a bundler-only PNG import that `seopyramids.config.ts` resolves. The generated file is committed because R-URLSCHEME-14 asks for a mapping reviewable before any redirect ships, and a diff is exactly that. Impact : the design's stated fallback becomes the interface; no requirement changes, and the mapping module stays free of Next and React imports, which is what made the fallback cost one script.
- 2026-07-31 — The middleware matcher excludes `/_next` as well as `/learn`: `'/((?!learn/|learn$|_next/)(?=[^?]*[A-Z]).*)'`. Pourquoi : the matcher as designed would have shipped the site broken. Build assets live under `/_next/static/{buildId}/` and a build ID contains uppercase letters — this build's was `MCEymiDwC1K1U9y1TRjFa` — so every one of them would have been 308-redirected to a lowercase path that does not exist. The rule generalises past this one namespace: a case-normalising rule must exclude every namespace whose paths are case-significant, and the build output is one of them. Impact : R-URLSCHEME-10 is unchanged; the matcher and the reason recorded beside it are.
- 2026-07-31 — `src/routing/scheme.ts` owns the content root, the two locales and `ROLL_SIZE`, and `seopyramids.config.ts` reads them into `blogConfig` — the inverse of the direction this design first stated. Pourquoi : forced by the same PNG import, which puts every module reachable from the site configuration out of reach of anything that is not webpack, while `next.config.ts`, `emit-redirects.mjs` and `check-route-table.mjs` all need the scheme from exactly there. Impact : none on the guarantees — `articles` is still written exactly once in site-owned code, `ROLL_SIZE` is still exported from `seopyramids.config.ts`, `blogConfig.contentRoot` still exists; only the source and the reader swap.
- 2026-07-31 — The mapping's row counts are corrected against the emitted map: twenty-eight category rows and not seven, the development leftovers and the v1 landing shipping as `none` rows rather than sitting outside the mapping, and thirty-one article rows on today's fixture. Ninety-nine rows in total — 83 permanent, 6 gone, 10 none. Pourquoi : the counts did not survive the document's own acceptance criteria. AC-URLSCHEME-62 requires `/learn/fr/javascript/page/2` to have a destination, so a declared category path is seven paths across two locales in two forms; AC-URLSCHEME-67 requires every shape the v1 code can serve to be listed exactly once, and `none` is the destination for a shape deliberately given none. The article rows exceed eleven because the mapping is a function of the article index and the fixture corpus must force three roll pages: the fillers carry a `fixture-` prefix so they are self-labelling in the JSON, and they leave with the fixture when content-source supplies the real index. Impact : the mapping section states the per-class counts and the total; no rule and no destination changes.
- 2026-07-31 — AC-URLSCHEME-01 and 25 are rewritten against an uncategorised fixture article, and AC-URLSCHEME-26 and 27 against `/articles/c/privacy/leaving-gmail`. Pourquoi : all four used `/articles/leaving-gmail`, which AC-URLSCHEME-06 contradicts — `leaving-gmail` claims the category `privacy`, so it lives under it and the bare URL is never produced. The uncategorised fixture is what the implementation exercises. Impact : the criteria now name URLs the site actually serves; nothing about the scheme changes.
- 2026-07-31 — AC-URLSCHEME-04 and 05, and the tails of R-URLSCHEME-11 and 12, name the offending article by slug and locale rather than the offending file. Pourquoi : `ArticleIndexEntry` carries no path, so the build cannot name a file — and the fixture corpus is one module, so there is no file to name. Impact : carrying the source path on each entry is worth doing when content-source supplies the real index, which the `article-index.ts` interface now records as a note; the two criteria tighten back to naming the file that day.
