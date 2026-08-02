# Design: Article page of the v2 site

**Last update:** 2026-08-02
**Feature:** article-page
**Infix:** ARTICLEPAGE
**Status:** APPROVED (2026-08-02)
**Sources:** [story](article-page.story.md), [epic](../pyramid-v2.epic.md), [content-source design](../content-source/content-source.design.md), [migrate-learn-content design](../migrate-learn-content/migrate-learn-content.design.md)

## Goal

Replace the `RoutePlaceholder` of the four article routes with one rendered article: cover, title, date, author, tags, category, body, and the two ways out — the category page and the other locale. The pieces exist and none of them is wired to a page: `getArticleBody` is called by nothing, `entry.image` is read by nothing, and `resolveAssetUrl` is exported, tested and called by no production module.

The reading contract widens twice on the way, and neither widening is a wiring job. It carries no author at all, while the story asks for one on every article. And `readArticleBody` runs remark over the raw markdown and nothing else, so the body it returns carries the author's own `./images/…` references while the files are published under `/article-images/…`. Nine of the eleven articles carry body images. Resolving them is the substance of this design.

## Decisions

- 2026-08-02 — The image convention of `CLAUDE.md` — "Use `next/image` with WebP, explicit `sizes`, descriptive `alt`" — is nuanced where it lives, and this design writes nothing there. A docman pass rewrites the rule as it stands: `next/image` governs the images a site composes in JSX, `sizes` belongs to the `fill` case, a static or dynamic import carries its own dimensions and asks for none, and a body derived from markdown falls outside the convention. What that settles here is R-ARTICLEPAGE-26, which reads as a breach of the rule as written and is in fact the only thing the sanitizer leaves possible.
- 2026-08-02 — Two statements on the sanitizer corrected against the installed pipeline, the status held at APPROVED because no contract moves. Raw HTML is dropped whole rather than cleaned attribute by attribute, and `class` does survive on the `code` of a fenced block, as `language-*`. Neither correction changes an interface: the module CSS stays element-name based, and the body still carries no class the site authored. The corpus audit that goes with it sits in Technical Constraints — six raw-HTML nodes over two articles, all inline emphasis, nothing substantial lost.
- 2026-08-02 — Status DRAFT to APPROVED, the last arbitration folded and none left open. Approved without a walkthrough, as seo-url-scheme, content-source and migrate-learn-content were, the interfaces below having been re-read against the codebase first; what the build teaches returns here as dated entries. Implementation may start, by tddman.
- 2026-08-02 — The measure recorded after the fact, the status held at APPROVED. `2e014fb` added `--measure: 68ch` to `colors_and_type.css` and the page holds its `<main>` to it, while this design said nothing about the width a body is read at. The silence was not a wrong sentence but a missing one: R-ARTICLEPAGE-62 enumerated colour, size, spacing and radius, a measure is in none of the four, and a page declaring `max-width: 68ch` would therefore have passed a requirement written to forbid exactly that. The enumeration is kept — it is what scopes the requirement to token-bearing values rather than to `16 / 9` or `0 auto` — and gains the fifth category.
- 2026-08-02 — The boundary the design system's growth passed through is an interface constraint, stated as R-ARTICLEPAGE-67. A value the system names nowhere leaves BR-PYRAMID-6 no third option: either the system gains the name, or the page cannot express the value at all. So the page may cause the design system to gain a token, never a component — R-ARTICLEPAGE-63 already carried the component half, and the token half being unwritten is why one token looked like a breach of scope rather than the only legal move. Whether the story's definition of done should read that a token and a component are not the same growth is the story's own call, and storyman's; this design states only what the page's interface may require of the system.
- 2026-08-02 — Gap 1 closed by fact rather than by arbitration, and the section removed with it. The Articles section of `apps/robusta-build/README.md` now tells a publisher that HTML written in a body renders as its text alone and that emphasis is written in markdown, which is what the gap asked for; docman delivered it in `8a2d183`, widening the bullet's why as the proposition suggested. A gap whose substance has landed is not a pending arbitration.

## Ubiquitous Language

Terms used here as `ubiquitous-language.md` defines them: Article, Published article, Category, Tag, Slug, Locale, Translation identifier, Content root, Asset root, Page copy. No term is missing — this design coins none and needs none.

Two terms are deliberately not this design's. Canonical URL and Indexable page belong to the URL scheme and to seo-excellence; the site is `robots: noindex` until robusta-landing-page lifts it. Related articles is defined in the glossary and owned: `seo-excellence.story.md` claims it explicitly ("Each article page links to its category page and offers related articles as the glossary defines them"), and its brainstorm carries the relatedness rule and the cap. This design renders no related block and leaves the end of the article free for one.

Measure, used below for the line length the body is held to, is the design system's own vocabulary and not the content glossary's — `packages/robusta-design-system/README.md` defines it where the token lives. It is named here, not coined here.

## Business Rules (cited)

- BR-PYRAMID-6 — A site's design tokens must come from its design system alone.
- BR-PYRAMID-7 — A site must not read its content source while serving a request.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.

## Interfaces

### `@robusta/pyramids-content` — the author is a field of the contract

```ts
interface ArticleEntry {
  // …unchanged fields…
  /** Read from the frontmatter. Required, like the title and the date. */
  author: string;
}

type CorpusViolation =
  | { code: 'missing-field'; path: string; field: 'title' | 'date' | 'locale' | 'excerpt' | 'author' }
  // …the six other codes, unchanged…
```

Required and not optional: an article declaring no author is a `missing-field` violation carrying `'author'`, no entry is indexed for it, and the site's build fails on it exactly as it fails on a missing title. A page that renders an author when there happens to be one meets no definition of done asking for the author preserved.

Two things follow, and neither is a new mechanism.

- `describeViolation` gains no case. Its `missing-field` line names `violation.field`, so widening the enumerated field is the whole change and the message reads unchanged.
- `ArticleEntry` stays structurally an `AddressableArticle` of `@robusta/pyramids-routing`. That contract names the fields it addresses on; a required field it does not name changes nothing for it, and neither package imports the other.

The two articles of the corpus declaring no author — `privacy/leaving-gmail.md` and `web/easy-automation-with-sonoff.md` — are given `author: Nicolas Zozol`, the value the nine others carry. The contract is what this design states; correcting the corpus to meet it is implementation work.

### `@robusta/pyramids-content` — body references resolved

```ts
readArticleBody(corpus: CorpusSpec, entry: ArticleEntry): Promise<ArticleBody>
```

Signature unchanged, `ArticleBody` unchanged. What widens is the contract of `html`: every image reference the rendered body carries is passed through `resolveAssetUrl(corpus, entry, reference)` before the HTML is serialized.

Invariants:

- The returned `html` carries no article-relative reference. What a page receives is servable as-is.
- External, protocol-relative and site-absolute references pass through untouched — `isExternalReference` already draws that line, and ten of the eleven articles link external images.
- A `CorpusSpec` declaring no `assets` is unaffected: `resolveAssetUrl` returns the reference, so a site publishing no asset renders exactly what it renders today.
- Resolution applies to the syntax tree before serialization, never by a second pass over the output string. The one resolution rule keeps one implementation.

This belongs in the base and not in the site. `asset-reference.ts` documents itself as "the one resolution rule, shared by what the site publishes and what a page links to", and this is the third caller it was written for — `read-file-entry.ts` validates through it, `copy-corpus-assets.ts` publishes through it, and nothing linked through it yet. `readArticleBody` already takes both arguments the resolver needs. A site doing it instead would restate the rule over an HTML string, which is the drift the resolver exists to prevent.

The cover stays outside this. `ArticleEntry.image` is documented as "as declared in the frontmatter, unresolved" — a deliberate contract, and the page resolves it. The body is a rendered artefact rather than a declared field, which is why the two are resolved in different places.

### `apps/robusta-build/src/content/article-index.ts` — one function added

```ts
getAssetUrl(entry: ArticleIndexEntry, reference: string): string
```

Wraps `resolveAssetUrl(corpus, entry, reference)`, and is the seam the cover is resolved through. Symmetric with `getArticleBody`, which exists for the same reason: `corpus.ts` is a leaf that `seopyramids.config.ts` reads, and a component importing it would make it a second entry point into the corpus declaration. No module under `src/article` imports `corpus`, `readArticleBody` or `resolveAssetUrl` — it calls `getArticleBody` and `getAssetUrl`. The body needs no seam of its own: `readArticleBody` resolves its references inside the base.

### `apps/robusta-build/src/content/article-lookup.ts` — new

```ts
findArticle(locale: string, slug: string): Promise<ArticleIndexEntry>
findTranslation(entry: ArticleIndexEntry): Promise<ArticleIndexEntry | undefined>
```

Both read `getArticleIndex()`, which is where the fatal-violation check lives; `ArticleIndexEntry` is the alias `article-index.ts` already exports for the base's `ArticleEntry`, and this module defines no type of its own.

- `findArticle` throws naming the locale and the slug when the index carries no such article. It cannot happen through a request — `dynamicParams = false` and `generateStaticParams` derive from the same index — so the failure is a build failure and never a not-found page.
- Lookup is on locale and slug alone. `validateArticles` refuses two articles sharing a slug within a locale, so the category param of the two categorised routes identifies nothing the slug does not.
- `findTranslation` returns the published article of another locale sharing `entry.translationId`, and `undefined` when the entry declares none or when no pair exists. The scheme declares two locales, `en` and `fr`, and `duplicate-translation-id` refuses two articles sharing an identifier within one locale, so at most one entry can match. Seven of the eleven articles have no pair; the story requires no dead link, and `undefined` is what renders none.

The module stays free of React and of the design system: `tsconfig.routing.json` includes `src/content` whole and compiles it with plain `tsc` for `emit-redirects.mjs`, with no `jsx` option.

### `apps/robusta-build/src/article/ArticleView.tsx` — new

```ts
interface ArticleViewProps {
  locale: string;
  slug: string;
}
export async function ArticleView({ locale, slug }: ArticleViewProps)
```

The single place the four routes converge. An async server component: it calls `findArticle`, then `getArticleBody`, `getAssetUrl` for the cover and `findTranslation`, and builds both links. Everything the four route files used to differ on is a param shape; everything they share is here.

The `<article>` sits in a `<main>` centred and held to `var(--measure)`, the design system's line-length token. That is the whole of this view's layout: the page is a column of text at a readable measure, and every other value it declares is a spacing or radius token, a ratio, or a position.

It renders, in one `<article>` carrying `lang` set to the article's locale: the cover, the title as the page's `h1`, the date, the author, the tags, the category link, the body, and the other-locale link. The author renders unconditionally — the contract guarantees one, and a build carrying an article without one produces no page at all.

### `apps/robusta-build/src/article/ArticleProse.tsx` — new

```ts
interface ArticleProseProps {
  html: string;
}
export function ArticleProse({ html }: ArticleProseProps)
```

The one boundary where the body HTML reaches the DOM, through `dangerouslySetInnerHTML`, and the site's only use of it. It is what Next.js documents for a markdown body — its own `blog-starter` example renders one this way, in a server component, with a CSS Module for the typography — and not what is left when nothing better can be done. The string is safe by construction on three counts: it is produced at build time from a corpus committed to this repository, remark-html 16 by default both drops raw HTML and sanitizes what markdown produced, and nothing user-supplied reaches it.

It also carries the class the stylesheet scopes on — which is the whole reason the body needs a container element rather than a fragment.

### `apps/robusta-build/src/article/ArticleProse.module.css` — new

The body's typography, as descendant selectors under one container class. Not utility classes: the body carries exactly one class the site did not put there — `language-*` on the `code` of a fenced block — and nothing else survives, so every other element is addressable only by name from an ancestor. Descendant selectors over a container are also what Tailwind 4 documents for HTML a site does not author, and the reason its own answer for that case is a plugin this site cannot take.

The module addresses elements by name and never `language-*`. A class selector written in a `.module.css` is hashed to a local name and would not match a class the renderer emitted, so reaching for that one takes `:global(…)` — which this story has no reason to spend. The class is left in the DOM untouched, where a later story can pick it up: syntax highlighting is in no story of this epic, and this design adds none.

It covers what the design system does not. `colors_and_type.css` styles `h1`–`h4`, `p`, `code` and `pre` at element level, unlayered, so the body's headings and paragraphs are already right. It says nothing about `ul`, `ol`, `li`, `blockquote`, `a`, `img`, `hr` or `table` — six articles carry lists, one carries a blockquote, ten carry links — and its inline-`code` rule draws a border and a background inside `pre`, which the module neutralises for `pre code`.

Every value it declares is a `var(--…)` of the design system. The site adds a name, never a value (BR-PYRAMID-6), the same contract `globals.css` states for the token bridge.

### The four route files

- `src/app/articles/[slug]/page.tsx`
- `src/app/articles/c/[category]/[slug]/page.tsx`
- `src/app/l/[locale]/articles/[slug]/page.tsx`
- `src/app/l/[locale]/articles/c/[category]/[slug]/page.tsx`

`dynamic = 'force-static'`, `dynamicParams = false` and their `generateStaticParams` are unchanged. Each keeps its param shape and its locale — `urlScheme.defaultLocale` for the two unprefixed files, the `locale` param for the two others — and renders `<ArticleView />`. `RoutePlaceholder` and `buildUrl` leave these four files; `RoutePlaceholder` stays in use by the other ten routes.

## Technical Constraints

- remark-html 16.0.1 defaults to `sanitize: true`, and that one flag does two different things. Verified by running the real pipeline — `remark().use(remarkHtml)` — over a probe body against the installed packages.
- Raw HTML is dropped whole, not cleaned attribute by attribute. `sanitize: true` sets `allowDangerousHtml = false`, and `mdast-util-to-hast` returns nothing at all for an `html` node, so a raw fragment never reaches the sanitizer. In the probe, an `<img>` carrying `src alt class style loading width height` and an `<Image>` tag disappeared entirely, element and attributes together, while the image written in markdown survived as `<img src="./images/cover.png" alt="a cover" title="titled">`. The schema's tagName allowlist does not apply here: `b` is on it, and `<b>C</b>` still renders as `C`. An author who writes HTML in an article gets nothing, and no error says so.
- The sanitizer schema then governs what markdown itself produced. `alt`, `title`, `width` and `height` pass on any element, `src` and `href` pass with relative values, and `class`, `style` and `loading` pass on none — except `code`, where the schema allows `['className', /^language-./]`. A fenced block therefore reaches the DOM as `<pre><code class="language-js">`. Two consequences run through this design: the body cannot be styled by utility classes, and no attribute can be added to a body image after rendering.
- This is also where the site's image convention stops — it governs what the site composes in JSX, and a body derived from markdown is outside it.
- `@tailwindcss/typography` is not a dependency of `apps/robusta-build`, and must not become one. It is present in `apps/dakar` and `apps/robusta`, which are the DaisyUI sites. Its `prose` classes ship their own type scale and colour ramp, which is a second source of design tokens and what BR-PYRAMID-6 forbids.
- `tsconfig.routing.json` compiles `src/routing/scheme.ts`, `v1-url-map.ts`, `content-urls.ts` and `src/content` whole, with plain `tsc` and no `jsx`, so `emit-redirects.mjs` can run outside the webpack pipeline. Anything placed under `src/content` stays React-free and design-system-free — the same constraint that put `src/landing` outside it.
- The design system's type scale is fixed pixels: `--t-h1: 56px`, `--t-h2: 40px`, `--t-body: 16px`, with no `clamp()` and no media query. The article page inherits it at every viewport and can neither change it, since it adds nothing to the design system, nor work around it, since coining a value is what BR-PYRAMID-6 forbids. A fluid scale is written in `@theme`, which is the design system's file and no site's, so the debt is located rather than deferred: it belongs to design-system-responsive, item 1 of the epic.
- The same file carries the measure, `--measure: 68ch`, added by `2e014fb` while this page was built: the system named no line length, and the article page is the most text-heavy page the site serves, so its body ran the full viewport on a wide screen. In `ch` and not `px`, against the habit of every other length in the file and on purpose — a measure written in pixels stops being a measure the moment the type scale moves, and the bullet above is the debt that will move it. The two facts sit in one file because they are one subject.
- The cover renders through `next/image` with `fill` and an explicit `sizes`, inside a container of fixed aspect ratio, from the URL `resolveAssetUrl` computes. Next.js documents another path — `await import()` of the file in a server component, which returns a module carrying `width`, `height` and `blurDataURL` — and it does not hold on this corpus. The variable part of the path spans a variable number of segments (`privacy/images/gmail.png`, `javascript/images/stop.png`, `images/styled-logo.png`), so the static prefix can only be `content/articles`, and the bundler context that produces covers the whole tree recursively — the eleven markdown files included, which Next's webpack config has no rule for and would fail to parse. Narrowing it takes `webpackInclude`, which the webpack bundled with Next 15.5 carries and the Turbopack binary of the same version does not — it knows `webpackIgnore` alone, and `next dev --turbopack` is this app's dev command. Independently, an imported module is emitted under `/_next/static/media`, which would take the cover out of the asset root while the body images of the same article stay in it, and publish each of the eleven covers twice.
- `public/article-images` is git-ignored and produced in full by `yarn copy:assets`, which the app's `build` and `dev` scripts run before Next starts. The cover's URL is therefore a string computed at build time, with no intrinsic dimensions to read — which is what `fill` and `sizes` answer.
- Next 15.5, React 19, Node 22. Every article page is produced at build; the image optimizer reads files under `public/` and never `content/articles`, so serving a cover engages nothing BR-PYRAMID-7 forbids.
- The root layout sets `<html lang>` to the site's default locale, and App Router allows `<html>` in the root layout only, where the locale is unknown. The three French articles therefore sit in an English document. `lang` on the article element corrects the content that this story renders; the document-level attribute is not this story's to move.
- The corpus as it stands: 11 published articles, 8 English and 3 French, 2 translation pairs, 11 covers, 9 articles with body images, 5 with fenced code, 6 with lists, 1 with a blockquote, none with a table. 44 image files, all PNG or JPEG, none WebP. Nine articles declare an author, two declare none.
- Raw HTML in the corpus, audited by parsing all eleven articles and visiting every `html` node rather than by grep: six nodes over two articles, every one of them inline emphasis on a word or a letter. `javascript/styled-components.md` carries `<b>C</b>` at line 27 and `<b>exactly</b>` at line 81; `theory/quel-second-langage.md` carries `<u>le</u>` at line 217. Rendered, each keeps its text and loses its emphasis: `Break the C of CSS`, `is exactly to avoid`, `clairement le langage à la mode`. The `<a className=…>` and `<div className=…>` fragments of `styled-components.md` sit inside fenced `jsx` blocks, render as code and never take the raw-HTML path. No other article contains raw HTML. The migrated corpus therefore loses nothing substantial to the renderer, and this is not a risk to lift before shipping.

## Requirements

Rendering:

- R-ARTICLEPAGE-01: The four article routes render one shared view, and each route file keeps only its param shape, its `generateStaticParams` and its static flags.
- R-ARTICLEPAGE-02: An article page renders the title, the date, the author, the tags and the category its index entry carries, and the body of that article.
- R-ARTICLEPAGE-03: The excerpt is rendered nowhere on its own — `readArticleBody` already returns it as the opening block of the body.
- R-ARTICLEPAGE-04: The body HTML reaches the DOM at one boundary, and that boundary is the site's only `dangerouslySetInnerHTML`.
- R-ARTICLEPAGE-05: The article's content is wrapped in an element whose `lang` states the article's locale.
- R-ARTICLEPAGE-06: A slug the index does not carry fails the build naming the locale and the slug, and no page renders a not-found state.
- R-ARTICLEPAGE-07: `ArticleEntry` carries a required `author`, read from the frontmatter; an article declaring none is a `missing-field` violation carrying `author`, indexes no entry and fails the build, as a missing title does.
- R-ARTICLEPAGE-08: Every article of the corpus declares an author, the two carrying none being given `Nicolas Zozol`.

Images:

- R-ARTICLEPAGE-21: `readArticleBody` returns HTML whose every article-relative image reference is resolved through `resolveAssetUrl`, and whose external, protocol-relative and site-absolute references are untouched.
- R-ARTICLEPAGE-22: The cover is resolved through `resolveAssetUrl` from `entry.image`, which the reading contract carries unresolved, and is served from the asset root rather than imported through the bundler. The site calls it through one seam, and no component reaches the corpus declaration.
- R-ARTICLEPAGE-23: The cover renders through `next/image` with `fill` and an explicit `sizes`, inside a container of fixed aspect ratio.
- R-ARTICLEPAGE-24: The cover carries an empty `alt`. The corpus declares no alt text for it, and repeating the title beside the `h1` announces the same words twice.
- R-ARTICLEPAGE-25: An article declaring no cover renders neither a cover nor an empty container in its place.
- R-ARTICLEPAGE-26: Body images render as the `<img>` remark emits, carrying the alt text their author wrote. An image written as raw HTML rather than as markdown renders nothing at all.
- R-ARTICLEPAGE-27: The body is rendered with remark-html's default sanitizing behaviour, and that default is not relaxed: raw HTML written in an article renders as its text alone, and `allowDangerousHtml` is not enabled to recover it.

Navigation:

- R-ARTICLEPAGE-41: An article claiming a category links to the first roll page of that category, in the article's locale, through `buildUrl`.
- R-ARTICLEPAGE-42: An article claiming no category renders no category link.
- R-ARTICLEPAGE-43: An article links to its other-locale version only when a published article of another locale shares its translation identifier, and renders no such link otherwise.
- R-ARTICLEPAGE-44: Both links are `next/link`.

Styling and scope:

- R-ARTICLEPAGE-61: The body's typography is a CSS Module scoped on the container class and addressing elements by name, covering the elements the design system leaves unstyled and neutralising its inline-`code` rule inside `pre`.
- R-ARTICLEPAGE-62: Every colour, size, spacing, radius and measure the page renders resolves to a custom property of `@robusta/pyramids-design-system`, and the page declares no literal of its own. Realizes BR-PYRAMID-6.
- R-ARTICLEPAGE-63: The page adds no component to the design system, and imports none of `pyramids-layouts`, `pyramids-links` or `pyramids-ctas`.
- R-ARTICLEPAGE-64: `@tailwindcss/typography` is not added to the site.
- R-ARTICLEPAGE-65: Every string the page renders that is not the article's own content is the site's. Realizes BR-PYRAMID-8.
- R-ARTICLEPAGE-66: No article page reads the corpus while serving a request. Realizes BR-PYRAMID-7.
- R-ARTICLEPAGE-67: A value the page needs and no design-system token names is added to the design system as a token, never declared by the page as a literal and never answered by a component. The line length the body is held to is that case, and the only one this page raises. Realizes BR-PYRAMID-6.

## Acceptance Criteria

Nina publishes, Ada develops the site, Tux builds from a clean checkout, Barbot visits.

- AC-ARTICLEPAGE-01: Given the eleven published articles, when Tux builds, then each answers at its canonical URL with its title, its date, its author and its body, and no article page renders a `RoutePlaceholder`. Realizes R-ARTICLEPAGE-01 and 02.
- AC-ARTICLEPAGE-02: Given `javascript/pourquoi-migration-gatsby-next-js.md`, whose body references `./images/promo-gatsby-vs-next.png` and whose text links an image on another host, when Barbot loads the page, then the first is fetched under the asset root and answers 200, and the second is fetched unchanged. Realizes R-ARTICLEPAGE-21.
- AC-ARTICLEPAGE-03: Given a corpus whose `CorpusSpec` declares no assets, when its body is rendered, then every reference is what its author wrote. Realizes R-ARTICLEPAGE-21.
- AC-ARTICLEPAGE-04: Given the two translated pairs, when Barbot reads either side, then a link leads to the other locale's page; and given `theory/quel-second-langage.md`, which declares no translation identifier, then the page carries no such link. Realizes R-ARTICLEPAGE-43.
- AC-ARTICLEPAGE-05: Given `privacy/leaving-gmail.md`, which claims `privacy`, when Barbot reads it, then a link leads to `/articles/c/privacy`; and given an article claiming no category, then the page carries no category link. Realizes R-ARTICLEPAGE-41 and 42.
- AC-ARTICLEPAGE-06: Given a built article page, when Barbot requests it, then no file under `content/articles` is read. Realizes BR-PYRAMID-7.
- AC-ARTICLEPAGE-07: Given a rendered article page on a wide viewport, when Ada inspects its computed styles, then every colour, font size, spacing and the width the body is held to traces to a custom property of the design system; the page's own CSS declares no literal, and the one value the system did not name is a token the system gained rather than a component. Realizes BR-PYRAMID-6, R-ARTICLEPAGE-62 and 67.
- AC-ARTICLEPAGE-08: Given an article body carrying a fenced code block, a bullet list and a blockquote, when Barbot reads it, then each is styled, and no inline-code box is drawn inside the code block. Realizes R-ARTICLEPAGE-61.
- AC-ARTICLEPAGE-09: Given a French article, when Barbot reads it with a screen reader, then its content is announced as French. Realizes R-ARTICLEPAGE-05.
- AC-ARTICLEPAGE-10: Given an article whose excerpt is its opening paragraph, when Barbot reads the page, then that paragraph appears once. Realizes R-ARTICLEPAGE-03.
- AC-ARTICLEPAGE-11: Given Nina deleting an image an article still references, when Tux builds, then the build fails naming the file, and no page is produced carrying a broken image.
- AC-ARTICLEPAGE-12: Given an article cover stored as PNG, when Barbot loads the page on a browser accepting WebP, then the optimizer serves WebP. Realizes R-ARTICLEPAGE-23.
- AC-ARTICLEPAGE-13: Given Nina writing an article whose frontmatter declares no author, when Tux builds, then the build fails naming the file and the missing field, and no page is produced for it. Realizes R-ARTICLEPAGE-07.
- AC-ARTICLEPAGE-14: Given `theory/quel-second-langage.md`, whose body carries `<u>le</u>` in mid-sentence, when Barbot reads the page, then the sentence reads `clairement le langage à la mode`, with no underline and no markup shown. Realizes R-ARTICLEPAGE-27.

## Dependencies

- Depends on: migrate-learn-content, landed 2026-08-01 — the corpus and the asset root. Nothing is pending.
- Blocks: seo-excellence, which is held on an article page carrying content of its own, and which owns the related-articles block this design leaves room for.
- Not held on design-system-responsive: this page ships before item 1 of the epic, and owes it the fluid type scale it inherits fixed.
