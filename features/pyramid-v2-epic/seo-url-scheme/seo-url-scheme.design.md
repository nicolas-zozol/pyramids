# Design: SEO URL scheme of the v2 site

**Last update:** 2026-07-31
**Feature:** seo-url-scheme
**Infix:** URLSCHEME
**Status:** DRAFT
**Sources:** [story](seo-url-scheme.story.md) · [brainstorm](seo-url-scheme.brainstorm.md) · [epic](../pyramid-v2.epic.md) · [root.archi.md](../../../root.archi.md) · [business-rules.md](../../../business-rules.md) · [ubiquitous-language.md](../../../ubiquitous-language.md) · [v1 routing](../../../apps/robusta/README.md)

## Goal

Give `apps/robusta-build` the URL scheme the story fixes — `/`, `/articles`, `/articles/p/{n}`, `/articles/c/{category}`, `/articles/c/{category}/p/{n}`, `/articles/c/{category}/{slug}`, `/articles/{slug}`, any of them prefixed by `/l/{locale}` — as three artefacts: a discriminant contract in the shared base, an App Router route table in the site that pregenerates every content URL, and the mapping from the v1 address space onto it. Why the scheme is shaped this way is in the [story](seo-url-scheme.story.md); this document says what is built and where it lives.

The scheme is settled and not reopened here. Two things this design adds on top of it: the route table is the single source of the URL set, and the v1 mapping is a function of the article index rather than a hand-kept table.

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
  rollSize: number;
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
- `parseUrl` returns `undefined` for anything outside the content section. It does not claim `/`, `/pricing` or any future marketing page — only the content root and the locale prefix in front of it.
- Canonicality is the fixed point of the pair: `p` is canonical when `buildUrl(scheme, parseUrl(scheme, p)) === p`. Where it differs, `p` is a redirect source and the built value is its target. The page-one form, the marked default locale, the trailing slash and the uppercase variant all fall out of that one rule instead of four hand-written families.
- `urlSet` derives every URL the site must produce from the article set alone: the blog home, its roll pages, one category page per category an article claims, its roll pages, and one URL per article. Never a tag URL. It is the only place a page count is computed from `rollSize`.
- `AddressableArticle.category` is one optional string and not a list — BR-PYRAMID-9 stated in the type, so a corpus growing a second category on one article fails to compile rather than growing a second address for it.
- `TAG_DISCRIMINANT` reserves a segment and builds nothing. `buildUrl` emits `/articles/t/{tag}` and `parseUrl` recognises it, so the shape is spoken for and testable; `urlSet` never returns a `tag` page, no route file matches `t`, and a request for one answers 404 like any URL the route table does not produce. That gap is the design, not an oversight: no tag page ships with this story, and reserving the segment now costs one constant where reopening the scheme later costs a second redirect on the fourteen indexed tag URLs plus whatever slug has taken `t` in the meantime.
- `validateArticles` returns violations, it does not throw. The caller decides that a non-empty result fails the build, which is what the site does.

`urlSet` and `validateArticles` take articles, never a declared category list. That is deliberate: v1 declares seven category paths through its site configuration — `blockchain`, `blockchain/ethers-js`, `blockchain/solidity`, `web`, `javascript`, `javascript/typescript`, `javascript/react` — while its eleven articles claim six categories: `blockchain`, `javascript`, `typescript`, `privacy`, `theory` and `web`. Three declared paths no article claims, and two claimed categories are declared nowhere, which is how `/learn/privacy/s/leaving-gmail` and `/learn/theory/s/quel-second-langage` came to be pregenerated and then refused at request time. Two of eleven articles are unreachable on the live v1 site because of it.

### `apps/robusta-build/src/seopyramids.config.ts` — the content root

Modified. `blogConfig` gains one field, next to `rollSize`, which is the only place the word `articles` is written as a value:

```ts
export interface BlogConfig {
  contentRoot: string; // 'articles'
  // unchanged: defaultLocale, otherLocales, debugImagePath, mandatoryKeywords, rollSize, author, getCategories
}
```

In `blogConfig` rather than at the top level because the content root sits with the roll size and the locales the scheme reads, and because it is a property of the content section and not of the site's identity.

`getCategories` stays declared and stops being read by anything: the category URL set comes from the articles. Removing the field belongs to content-source, which owns the shape of the pipeline; leaving a second source of categories wired to a route is what this design refuses.

### `apps/robusta-build/src/routing/scheme.ts` — the site's scheme instance

Created. One export, built once from the site configuration, so no route composes a `UrlScheme` of its own:

```ts
export const urlScheme: UrlScheme;
```

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

Rules per class are in the mapping section below.

### `apps/robusta-build/next.config.ts` — the permanent redirects

Modified. `async redirects()` returns the `permanent` rows of `v1UrlMap(...)`, plus the two canonical-form families:

- `/l/{defaultLocale}/:path*` to `/:path*`
- `/articles/p/1` to `/articles`, `/articles/c/:category/p/1` to `/articles/c/:category`, and their `/l/:locale`-prefixed forms

Every rule states `permanent: true`, which Next emits as 308. Google treats 308 as a permanent redirect exactly as it treats 301, and 308 is what `permanent` means in this API; `statusCode: 301` exists if a specific tool ever requires it.

`redirects()` is evaluated at build time and compiled into the platform's routing layer, ahead of the filesystem. That is what lets the eight `.md` rules answer for files the v2 site does not carry.

### `apps/robusta-build/src/app/learn/[...path]/route.ts` — the Gone handler

Created. `redirects()` cannot answer anything that is not a redirect, so the 410 needs its own mechanism, and a route handler is the cheapest one that is not middleware. It answers 410 for any document URL under `/learn` that no redirect claimed, and reads nothing at all — no content source, no article index, no filesystem.

`/learn` itself never reaches it: a redirect claims it first. Neither does any URL a redirect rule matches. What remains is the retired namespace, which is the whole point.

Gone is scoped to documents. The 73 image URLs published under `public/learn/**/images` answer 404 and not 410: a path carrying an `images` segment falls through instead of being declared retired. Where those images end up on the v2 site is migrate-learn-content's deliverable, and asserting a deliberate retirement for an image about to be republished at another URL is the one thing 410 should not be used for.

### `apps/robusta-build/src/middleware.ts` — case normalization

Created, and it is the only middleware the site carries. Its matcher restricts it to paths that contain an uppercase letter and excludes `/learn`, so it is not invoked on normal traffic at all, and the v1 mapping keeps matching the addresses as they were published — `/learn/tag/DeFi` included. A matched path is 308-redirected to its lowercase form.

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

Non-default locales, mirroring the seven above under `l/[locale]/`, with `locale` taken from `otherLocales` and never from `defaultLocale` — which is what makes `/l/en/...` a redirect rather than a page. `l/[locale]/page.tsx` is the locale-prefixed landing: it is part of the shape, and its param set is empty until robusta-landing-page supplies landing copy in another locale, so it emits nothing today.

Every one of these files declares `dynamic = 'force-static'` and `dynamicParams = false`, and gets its params from `urlSet(urlScheme, await getArticleIndex())` filtered by kind. Three consequences, and they are the requirements this table exists to satisfy:

- `dynamicParams = false` makes a URL the table does not produce answer 404 instead of being resolved on demand. `/articles/p/999` is a 404, not an empty roll.
- `force-static` makes `searchParams` resolve to an empty object, so no content route can read a search parameter even by accident.
- One derivation feeds every route, so the v1 failure mode — a pregenerated URL a second list then refuses — has no place to occur. `parseUrl` is used at build time, in the mapping and in tests, never while serving.

Whether `revalidate` stays `false` is content-source's call and changes none of the above.

The site's route folder `articles/` and `blogConfig.contentRoot` are two site-owned statements of the same value, and a build-time assertion ties them: every URL `urlSet` produces is served by the table, checked by comparing the generated route list against the built output. The alternative — a `[root]` dynamic segment whose only param is the configured value — buys configuration purity that one site does not need, at the cost of a route tree nobody can read.

### What discriminates what

- `/articles/c/...` against `/articles/{slug}`: `c` is a static segment and outranks the dynamic sibling, so a category URL never reaches the article route. `/articles/c` on its own would match `[slug]` with the value `c`, which `dynamicParams = false` turns into a 404 because no such slug is ever generated — and `validateArticles` fails the build before it could be.
- `/articles/c/{category}/p/{n}` against `/articles/c/{category}/{slug}`: five segments against four, and `p` is a static segment under `[category]`, so the router separates them structurally. The genuine ambiguity is a slug literally named `p`, which would claim `/articles/c/{category}/p` and read as a truncated roll URL to a human, a link checker and a crawler alike. What forbids it is `validateArticles`: a slug or a category equal to `l`, `c`, `p` or `t` returns a `reserved-segment` violation and the build fails naming the file. The four discriminants are reserved words at every level of the scheme, which is also what keeps the locale prefix unambiguous.
- `/articles/t/{tag}` against nothing: the segment discriminates no route today, because no route carries it. It is reserved all the same — `validateArticles` refuses `t` as a slug and as a category — so the tag page the scheme must stay able to grow finds its address free instead of taken by an article published in the meantime. Reserved is not unwritten: nothing under `t` is built, served or redirected by this story.
- Nesting is what would break this, and it is dropped. A category is exactly one segment, so the tail after `/c/{category}` is either one segment (a slug) or exactly two (`p` and a number). `validateArticles` returns `nested-category` on a category containing a slash, so the corpus cannot reintroduce the case the router could not decide.

## The v1 to v2 mapping

Structure: a rule per class of v1 URL, applied by `v1UrlMap` to the article index. Rows are generated where the article index determines them, and enumerated where the v1 inventory does — the raw markdown files, the tag URLs and the declared category paths cannot be derived from anything v2 holds.

Two inputs the rules depend on and this story does not own. The slug does not change: v1 derives it from the title through `immutableSlugify`, which the code forbids changing, and v2 keeps that slug. The locale does change on two articles: migrate-learn-content's decision of 2026-07-30 corrects `yield-farming.md` and `why-migration-gatsby-next.md`, which are English pieces declaring `locale: "fr"`, so the real split is 8 English and 3 French and the mapping is computed after that correction.

Rules per class:

- Blog home. `/learn` to `/articles`, `/learn/fr` to `/l/fr/articles`. Two rows.
- Blog roll pages. `/learn/page/{n}` to `/articles/p/{n}`, the locale-marked form to `/l/{locale}/articles/p/{n}`, and `{n}` of 1 to the bare roll URL. A pattern with no live row: v1 never generated one, its corpus of 11 articles never reaching the roll size of 12.
- Category pages. `/learn/{categoryPath}` and `/learn/{categoryPath}/page/{n}` to `/articles/c/{category}` when an article claims that category, and to `/articles` when none does. `{categoryPath}` is one of the seven paths v1 declares, and `{category}` is its last segment: v2 categories are flat, so a nested v1 path maps to its leaf and not to its head — `javascript/typescript` reaches `/articles/c/typescript`. Seven rows, whose destinations `v1UrlMap` recomputes from the article index rather than reading them here; on the corpus of today `blockchain`, `web`, `javascript` and `javascript/typescript` reach a category page, and `blockchain/ethers-js`, `blockchain/solidity` and `javascript/react` reach the blog home, no article having ever claimed them. The page number is dropped: every v2 category roll is one page on this corpus.
- Articles. `/learn/{categoryPath}/s/{slug}` and its locale-marked form to the article's v2 URL, `/l/{locale}/` prefix included when the locale is not the default. Eleven rows, all carrying a category, so all of the form `/articles/c/{category}/{slug}`. One row is where the v1 path and the v2 category part ways: `/learn/javascript/typescript/s/completes-with` reaches `/articles/c/typescript/completes-with`, the article claiming `typescript` and nothing else. Two other rows — `/learn/privacy/s/leaving-gmail` and `/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere` — answer 404 on the live v1 site today because their category is declared nowhere; they are mapped anyway, since a redirect on a URL that currently fails costs one row and recovers whatever was indexed before the configuration drifted.
- Tag pages. `/learn/tag/{tag}` to `/articles/c/{tag}` when an article claims a category of that name, and to `/articles` otherwise; the tag itself stays metadata with no page. Fourteen rows, and the split between the two destinations belongs to `v1UrlMap`, computed from the corpus, not to this prose: on the corpus of today three tags reach a category page — `javascript`, `blockchain`, `web` — and eleven reach the blog home. A tag is never promoted to a category to make a redirect land: an article carries at most one category (BR-PYRAMID-9), and the address a tag page would take is `/articles/t/{tag}`, reserved and unbuilt. `/learn/tag/{tag}/page/{n}` maps to the same destination and has no live row, no tag reaching the roll size.
- Raw markdown. The thirteen `.md` files published under `public/learn` are keyed by file name and not by slug, so they are enumerated. Eight redirect permanently to the v2 URL of the article whose content travels — `blockchain/s/ledger-versus-metamask.md`, `blockchain/s/start-coding-blockchain.md`, `blockchain/s/yield-farming-fr.md`, `javascript/s/completes-with.md`, `javascript/s/styled-components.md`, `privacy/leaving-gmail.md`, `theory/quel-second-langage.md`, `web/easy-automation-with-sonoff.md`. Five answer 410 Gone, their content existing nowhere in the corpus: `javascript/s/completes-with-fr.md`, `javascript/s/es6-7.md`, `javascript/s/javascript-build.md`, `javascript/s/redux-en.md`, `theory/solid-principles.md`. This settles the count the story could not: eight and five, not one and twelve. `completes-with-fr.md` is the one judgement call inside the class — it is the French version of an article that does travel, but the French text does not, and a redirect to a page in another language is read as a soft 404, which is exactly what the arbitration of 2026-07-30 chose 410 to avoid. Should migrate-learn-content republish any of the five, its row moves from `gone` to `permanent` and nothing else changes.
- Images. The 73 files under `public/learn/**/images` receive no rule and answer 404, the Gone handler letting any path with an `images` segment fall through. They are a migrate-learn-content deliverable, not a retirement.
- Portfolio. `/portfolio` and `/fr/portfolio` are listed with destination `none`, per the arbitration of 2026-07-30. They emit no rule and answer 404. `/fr/portfolio` has no route in the v1 code and survives from an earlier site; it is listed all the same, because the arbitration named it.
- Everything else under `/learn`. Gone. The section is retired as a whole, so the exception list is empty rather than enumerated, and a crawler drops the URL cleanly instead of reading a redirect to an unrelated page as a soft 404.
- Development leftovers. `/prosemirror/*`, `/test/*` and `/_design-test` receive no rule and are out of the mapping, having no editorial value — the brainstorm's scope line.

What emits what: `permanent` rows become `redirects()` entries in `next.config.ts`; `gone` is the namespace rule of the `/learn` route handler, which needs no enumeration to be right; `none` rows emit nothing and exist to be read.

The mapping is enumerated from the v1 route code, which is what the code actually serves. Checking it against the indexed set of Search Console is migrate-learn-content's, whose decision of 2026-07-30 already fixes that pass as a verification and not an input.

## Technical Constraints

- Next 15 App Router with RSC on Vercel. Static segments, catch-all segments and `generateStaticParams` are what make the scheme pregenerable; reading a search parameter is what would break it, and `dynamic = 'force-static'` removes the possibility rather than forbidding it.
- Routing order puts `redirects()` from `next.config.ts` ahead of the filesystem, which is why redirects answer for `.md` URLs the site does not carry. The case-normalising middleware and the v1 mapping are kept disjoint by the middleware matcher — it excludes `/learn` — so nothing in this design depends on the relative order of middleware and configuration redirects.
- `next.config.ts` is loaded outside the webpack pipeline, so `experimental.extensionAlias` does not apply to it. The config importing `v1-url-map.ts` and, through it, the article index is the one seam to verify on the first build; if the config loader cannot follow the import chain, the fallback is a build script emitting the rows as JSON that the config reads. The mapping module itself stays free of Next and React imports so that fallback costs one script and no redesign.
- Local TypeScript imports end in `.js` even though the source is `.ts`. This holds inside the site and inside the new package; the package is consumed by its name, so no extension question crosses the boundary.
- Apps consume built artefacts. `@robusta/pyramids-routing` takes a slot in `build:deps` before the site builds, and depends on nothing, so the slot is free — first in the chain. `apps/robusta-build` declares it at `workspace:*`, its second workspace dependency after the design system, and a developer editing it needs the watcher like any other package.
- Node 22, yarn 4.17.1, `nodeLinker: node-modules`, React 19.1.1. The new package declares no dependency at all, so it introduces no second copy of anything.
- The shell carries `robots: { index: false, follow: false }` in its root layout, site-wide, until robusta-landing-page lifts it. Every route this story ships is therefore built, served and unindexable. That is fine for the routes and fatal for the redirects: sending the indexed v1 URLs to targets that say not to index trades indexed pages for de-indexed ones. The redirects go live on robusta.build only once the flag is lifted, which sequences them with retire-robusta-v1 and not with this story.
- The corpus is 11 articles at a roll size of 12, so pagination produces no URL at all on the real content, and six categories, one of which — `typescript` — holds a single article, a roll the arbitration of 2026-07-31 accepted knowingly. The fixture corpus has to force at least three pages, or the shape ships unexercised.
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
- R-URLSCHEME-7: A blog roll is paginated by the roll-page discriminant carrying the page number. The number of articles per page is the roll size of the site configuration and never appears in a URL.
- R-URLSCHEME-8: The first page of a blog roll is addressed by the roll's own URL, on the blog home as on a category page; the explicit page-one form redirects to it permanently.
- R-URLSCHEME-9: A page in a non-default locale carries the locale discriminant at the head of its URL. The default locale carries no marker, and the marked form of a default-locale URL redirects permanently to the unmarked one.
- R-URLSCHEME-10: A page is reachable at exactly one URL. Any other form that would serve the same content — explicit page one, marked default locale, trailing slash, letter case — redirects permanently to it.
- R-URLSCHEME-11: The discriminant segments `l`, `c`, `p` and `t` are reserved words at every level: no article slug and no category may take one of those values, whether or not a page is served under the segment, and the build fails naming the offending file.
- R-URLSCHEME-12: An article slug is unique within its locale across the whole site, and the build fails naming both files on a collision.
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

- AC-URLSCHEME-01: Given the URL `/articles/leaving-gmail`, when the site resolves it, then it serves an article page and reads no article set to decide that. Realizes BR-PYRAMID-1.
- AC-URLSCHEME-02: Given an article claiming the category `javascript`, when the site is built, then it is served at `/articles/c/javascript/{slug}` and at no URL repeating the content root.
- AC-URLSCHEME-03: Given an article claiming no category, when the site is built, then it is served at `/articles/{slug}`.
- AC-URLSCHEME-04: Given a fixture article whose slug is `l`, `c`, `p` or `t`, or a fixture category taking one of those four values, when Tux builds, then the build fails and names the offending file.
- AC-URLSCHEME-05: Given two fixture articles of the same locale sharing a slug, when Tux builds, then the build fails and names both files.
- AC-URLSCHEME-06: Given a fixture corpus where no article claims `solidity`, when the site is built, then no URL exists for that category; and given one article claiming `privacy` with no configuration mentioning it, then `/articles/c/privacy` exists and serves it.
- AC-URLSCHEME-07: Given a fixture article claiming the category `typescript`, when the site is built, then it is served at `/articles/c/typescript/{slug}` and under no other category, whatever folder its source file sits in. Realizes BR-PYRAMID-9.

Pagination and locale

- AC-URLSCHEME-21: Given a fixture roll of 30 articles at a roll size of 12, when the site is built, then `/articles`, `/articles/p/2` and `/articles/p/3` are produced and no other roll URL exists.
- AC-URLSCHEME-22: Given `/articles/p/1`, when Barbot requests it, then it is permanently redirected to `/articles`; and the same holds for `/articles/c/{category}/p/1` against `/articles/c/{category}`.
- AC-URLSCHEME-23: Given `/articles/p/999` on that roll, when Barbot requests it, then the site answers 404 and never an empty roll.
- AC-URLSCHEME-24: Given a French fixture article, when the site is built, then it is served under `/l/fr/` and no unmarked form of it exists.
- AC-URLSCHEME-25: Given `/l/en/articles/leaving-gmail` where `en` is the default locale, when Barbot requests it, then it is permanently redirected to `/articles/leaving-gmail`.
- AC-URLSCHEME-26: Given a reader whose browser prefers French arriving at `/articles/leaving-gmail`, when the page is served, then no redirect to a locale occurs.
- AC-URLSCHEME-27: Given `/Articles/Leaving-Gmail` and `/articles/leaving-gmail/`, when Barbot requests either, then both are permanently redirected to `/articles/leaving-gmail`. Realizes R-URLSCHEME-10.

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
