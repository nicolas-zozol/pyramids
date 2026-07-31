# Design: Content source of the v2 site

**Last update:** 2026-07-31
**Feature:** content-source
**Infix:** CONTENTSOURCE
**Status:** APPROVED (2026-07-31)
**Sources:** [story](content-source.story.md) · [brainstorm](content-source.brainstorm.md) · [epic](../pyramid-v2.epic.md) · [seo-url-scheme design](../seo-url-scheme/seo-url-scheme.design.md) · [root.archi.md](../../../root.archi.md) · [business-rules.md](../../../business-rules.md) · [ubiquitous-language.md](../../../ubiquitous-language.md)

## Goal

Replace the fixture implementation behind `apps/robusta-build/src/content/article-index.ts` with a real reader: a base package that turns a directory of markdown files into an article list and, on demand, into one article's rendered body, plus the frontmatter schema that decides which files are articles at all.

The source is settled — markdown stays, on the measurement of 2026-07-31 — and this document does not reopen it. What it owes is the reading contract, its owner and the schema. Why markdown, and what v1 costs, are in the [story](content-source.story.md).

## Ubiquitous Language

Terms are used in the sense `ubiquitous-language.md` gives them: site, site configuration, article, published article, translation identifier, category, tag, blog roll, slug, locale, content source, content root, page copy, workspace, build chain, clean checkout.

Three consequences:

- Content root is the URL segment `articles`, not a directory. The directory this design reads is the **corpus root**, a filesystem path the site declares, and the two are deliberately different words for different things: the site could rename either without touching the other.
- Category is flat and comes from the frontmatter. A file sitting under `javascript/typescript/` whose frontmatter claims `typescript` claims `typescript`; the folder is decoration, and the reader never derives a category from a path.
- Published article and translation identifier are glossary terms, and this document does not restate them. What the schema adds is how a file carries them: the `published` field is how an article declares itself published, and `translationId` is where it writes its translation identifier.

## Business Rules (cited)

Cited verbatim from `business-rules.md`, under the epic's Infix:

- BR-PYRAMID-7 — A site must not read its content source while serving a request.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-10 — A site publishes an article only if that article declares itself published.

BR-PYRAMID-7 is the rule the reading contract exists to satisfy, and it is already met by construction: `seo-url-scheme` shipped a route table where every content route declares `dynamic = 'force-static'` and `dynamicParams = false`, and `getArticleIndex` is reached only from `generateStaticParams`, from page bodies at build time and from `scripts/emit-redirects.mjs`. This design keeps it met by not adding a caller: the reader stays a function of the build, the site's binding is the only entry point, and no route gains a runtime path to it. The one thing that could break the rule is a page rendering an article body on request, which is why the body is a second build-time call and not a lazy loader.

BR-PYRAMID-8 is why the reader hands over more than metadata. The index deliberately carries no body; the article page's copy has to come from somewhere, and this design says where — the site's own corpus, through `getArticleBody`, with the design system supplying none of it.

BR-PYRAMID-10 is the rule this design raised to the registrar rather than wrote: epicman recorded it on 2026-07-31, once `Published article` was in the glossary, and the identifier is the registrar's. R-CONTENTSOURCE-42 is what realizes it, and the schema's `published` field is how a file declares itself published. No rule is created here.

## Interfaces

### `@robusta/pyramids-content` — the reading contract

Created, as `packages/pyramids-content`, published as `@robusta/pyramids-content` and second in `build:deps` behind `pyramids-routing`. It holds the corpus traversal, the frontmatter schema, the per-process memo, the frozen slug derivation and the markdown-to-HTML rendering of one body.

It refuses to hold: the corpus path of any site, the content root, any category or locale value, any page copy, any React or Next import, and any knowledge of the URL scheme. `ArticleEntry` is structurally an `AddressableArticle` of `@robusta/pyramids-routing`, which is how the two contracts meet without depending on each other — the site passes the index to `validateArticles` and `urlSet`, and neither package imports the other. That separation is why the reader is its own workspace: `pyramids-routing` stays at zero dependencies, and a second site can take the URL scheme without inheriting `gray-matter` and `remark`.

```ts
export type LocaleSource = 'frontmatter' | { pathSegment: number };

/** What a site declares about its own tree. Data — the base calls back into nothing. */
export interface CorpusSpec {
  /** Directory holding the articles, relative to the process working directory. */
  root: string;
  localeFrom: LocaleSource;
  /** Path suffixes that are not articles — `.brief.md`, `example.md`. */
  exclude?: readonly string[];
}

export interface ArticleEntry {
  /** Source file, relative to the corpus root: what a build failure names. */
  path: string;
  slug: string;
  locale: string;
  category?: string;
  title: string;
  /** `YYYY-MM-DD`. */
  date: string;
  tags: readonly string[];
  excerpt: string;
  /** As declared in the frontmatter, unresolved. */
  image?: string;
  translationId?: string;
}

export interface ArticleBody {
  html: string;
}

export type CorpusViolation =
  | { code: 'missing-corpus-root'; root: string }
  | { code: 'unreadable-frontmatter'; path: string; detail: string }
  | { code: 'missing-field'; path: string; field: 'title' | 'date' | 'locale' | 'excerpt' }
  | { code: 'malformed-date'; path: string; date: string }
  | { code: 'non-boolean-published'; path: string; value: string }
  | { code: 'duplicate-translation-id'; path: string; translationId: string; locale: string };

export interface CorpusRead {
  /** Published, valid, newest first. */
  articles: readonly ArticleEntry[];
  violations: readonly CorpusViolation[];
  /** Paths of the files read and left out for want of `published: true`. */
  unpublished: readonly string[];
}

/** One traversal per corpus root per process; concurrent callers share one promise. */
export function readCorpus(corpus: CorpusSpec): Promise<CorpusRead>;

/** The one place an article body is rendered. Takes the entry, so no second lookup. */
export function readArticleBody(corpus: CorpusSpec, entry: ArticleEntry): Promise<ArticleBody>;

export function describeViolation(violation: CorpusViolation): string;

/** slugify 1.6.6, `lower` and `strict`, frozen: a slug that moves breaks an indexed URL. */
export function articleSlug(title: string, locale: string): string;
```

Two functions rather than one, and the split is the whole cost argument. A single interface returning complete articles would either render every body to answer "what articles exist" — 5.2 ms an article, six workers, the curve the measurement drew at 200 articles — or return articles whose body is empty and hope the caller knows which. The index answers the cheap question cheaply; the body is an explicit second call at the one call site that needs it, the article page. `readArticleBody` takes the entry and not a slug, so the file is resolved once, by the traversal that already found it.

No `findBySlug`, no `rollPage`, no `categories`. They are `filter`, `slice` and `map` over a list the caller already holds, and a package function would only hide them; the roll's page count is `urlSet`'s, in `pyramids-routing`, and stays the single derivation.

`readCorpus` never throws on content. A corpus root that does not exist is a violation like a missing title, so the caller has one failure path instead of two — the shape `validateArticles` already set in `pyramids-routing`, where violations are returned and the caller decides they are fatal.

### `apps/robusta-build/src/content/corpus.ts` — where this site's articles live

Created. A leaf module, for the same reason `src/routing/scheme.ts` is one: `scripts/emit-redirects.mjs` reaches the article index outside the webpack pipeline, and anything reachable from `seopyramids.config.ts` is out of its reach because the site configuration resolves a bundler-only PNG. So the corpus spec is declared here and `seopyramids.config.ts` reads it, never the other way round.

```ts
export const corpus: CorpusSpec = {
  root: 'content/articles',
  localeFrom: 'frontmatter',
};
```

`content/articles` sits outside `public/` on purpose: v1 published its markdown files under `public/learn`, and the thirteen raw `.md` URLs that produced are rows in the v1 mapping today, six of them answering Gone. A corpus under `public/` republishes that mistake.

### `apps/robusta-build/src/content/article-index.ts` — the seam, kept

Modified. The signature survives; the entry widens.

```ts
export type ArticleIndexEntry = ArticleEntry;

export function getArticleIndex(): Promise<readonly ArticleIndexEntry[]>;
export function getArticleBody(entry: ArticleIndexEntry): Promise<ArticleBody>;
```

- `getArticleIndex` keeps its name, takes no argument and still returns a promise of a list. Every existing call site — `content-urls.ts`, the fourteen route files through it, `v1-url-map.ts`, `emit-redirects.mjs` — compiles unchanged.
- The return type narrows to `readonly`. `validateArticles`, `urlSet` and `v1UrlMap` all already declare `readonly` parameters, so nothing breaks, and v1's third defect — a shared mutable array every caller could sort in place — has no place to occur.
- `ArticleIndexEntry` becomes an alias of the base's `ArticleEntry` rather than a second declaration. The name the route table imports does not move; the type has one definition.
- The entry widens with `path`, `tags`, `excerpt`, `image` and `translationId`. `path` is what the story asks for: a build failure names `blockchain/ledger-versus-metamask.md` instead of a slug and a locale. The other four follow one criterion — the index carries what a listing can show without opening a body. A blog roll shows a title, a date, an excerpt and an image; related articles are chosen on categories and tags; neither may cost a render. `title` and `date` were already there for exactly that reason.
- `getArticleBody` is added, and it is where BR-PYRAMID-8's page copy comes from. Called by the article page and by nothing else.

`getArticleIndex` is also the single place a violation becomes fatal. It calls `readCorpus(corpus)`, and a non-empty `violations` throws with one line per violation through `describeViolation`. Every consumer passes through this function, `emit-redirects.mjs` included, so a corpus that breaks the schema fails `yarn emit:redirects` before `next build` starts — the earliest possible failure, with the file named. The alternative, validating inside `contentUrls`, would let the redirect emitter run on a corpus the site refuses.

`fixture-articles.ts` is deleted.

### `apps/robusta-build/src/routing/content-urls.ts` — violations that name a file

Modified, one function. `describe(violation)` becomes `describe(violation, articles)`: `SchemeViolation` carries a slug, the index now carries a path, and the message the publisher reads names the file. This closes what the seo-url-scheme design recorded as a limit — AC-URLSCHEME-04 and 05 tighten back to naming the file the day the real index arrives, and this is that day.

### `apps/robusta-build/src/seopyramids.config.ts` — `getCategories` removed

Modified. `getCategories` leaves `BlogConfig` and leaves the configuration object. It has been read by nothing since `seo-url-scheme`: the category URL set is derived from what articles claim, in `urlSet`, and a second statement of the same set could only disagree with the first. Removing it also removes the last executable resolver from the site configuration, which becomes data end to end.

`blogConfig` gains nothing in exchange. The corpus root lives in `corpus.ts` for the reachability reason above, and `seopyramids.config.ts` reads it there if it ever needs to display it.

## Technical Constraints

- Next 15 App Router with RSC on Vercel. The reader runs in the build, inside server components and across forked static-generation workers with no shared memory, so the per-process memo is the only cache that exists and the traversal count follows the worker count. Measured on v1: six workers on a ten-CPU machine, 62 calls, 56 served from the memo.
- `yarn emit:redirects` runs the reader in its own Node process before `next build`, so a v2 build reads the corpus seven times at today's worker count, not six. At 5.2 ms an article this is arithmetic, not a problem; it is stated so the next measurement is not surprised.
- `next.config.ts` cannot import site modules, and nothing here tries. The config reads `v1-url-map.generated.json`; `scripts/emit-redirects.mjs` writes it after `tsc -p tsconfig.routing.json` compiles the routing and content modules to plain ESM. The new package must therefore be resolvable and runnable outside webpack: `tsconfig.routing.json` uses `moduleResolution: "Node"`, which reads `main` from the package manifest, exactly as it already does for `@robusta/pyramids-routing`. `tsconfig.routing.json` gains no include — `src/content` is already in it.
- The package is ESM (`"type": "module"`) like every other. `remark` and `remark-html` are ESM-only, `gray-matter` is CJS and is consumed through its default export; both work under Node 22 without a bundler, which is what `emit-redirects.mjs` needs.
- Local TypeScript imports end in `.js` inside the package as everywhere else. The package is consumed by name, so no extension question crosses the boundary.
- Apps consume built `dist/`, so `@robusta/pyramids-content` takes the second slot of `build:deps`, behind `pyramids-routing` and before any site builds, and a developer editing it needs `w:content` like any other package (BR-PYRAMID-5).
- The corpus root is resolved against `process.cwd()`, which is the app directory under `next build`, under `next dev` and under `yarn workspace … run emit:redirects` alike — the same assumption `next.config.ts` and `check-route-table.mjs` already make. A read from any other working directory produces `missing-corpus-root` naming the path, rather than an empty corpus.
- Node 22's `readdir` with `recursive: true` is the traversal. It descends the declared root and nothing above it; v1's `traverseDir('', …)` over `process.cwd()` with an empty callback body — 8,024 files, 781 directories, 167 ms per cache miss, growing with `node_modules` — has no counterpart here.
- The memo is a promise, never a flag. `let pending: Map<string, Promise<CorpusRead>>` keyed by the resolved root: the second caller awaits the first caller's promise and receives the same complete result. v1 raises `postsGenerated = true` before the parsing it guards completes, so a concurrent caller would receive a partially-filled array; `generateMetadata` and the page component of one route are exactly that pair. A rejected read stays memoized: a corpus that fails to read fails the build, and reading it twice would only produce the same failure twice.
- slugify stays at 1.6.6 with `lower` and `strict`. It is the one dependency whose behaviour must not move: every row of the v1 mapping was computed from slugs it produced.
- The `published` flags must land before the redirects do, and that ordering binds `retire-robusta-v1`. Nine of the eleven migrated articles carry no `published` field today — verified against `apps/robusta/content/blog`, where only `theory/quel-second-langage.md` and `javascript/styled-components.md` declare it. An article the index does not carry has no article row in the mapping and answers Gone at its v1 addresses, so turning the redirects on before those nine flags are settled would answer Gone on nine indexed URLs. `retire-robusta-v1` owns that ordering and must check the flags before it acts; this design leaves the redirects dormant and the flags to the publisher.

## The frontmatter schema

What an article declares, on top of what it already carries today (`title`, `tags`, `locale`, `date`, `image`, `author`, `featured`):

- `published` — the article enters the index only if this is exactly `true`. Absent means unpublished: the file is read, left out, and its path listed in `CorpusRead.unpublished` so the build log names it. Present with a non-boolean value is a violation, so `published: "true"` cannot silently unpublish an article.
- `translationId` — a free identifier shared by the locale versions of one article. Two published articles of the same locale sharing one is a violation. That an article *should* carry it when a translation exists is not machine-detectable — nothing in a file says its counterpart exists — so validation catches the misuse and `migrate-learn-content` fills the four affected files.
- `category` replaces v1's `categoryPath`, one flat segment, optional. Whether it matches the folder the file sits in is not checked: the URL never derives from the path, and `javascript/typescript/completes-with.md` claiming `typescript` is the arbitrated case.
- `slug` — optional. Present, it pins the slug; absent, the slug is `articleSlug(title, locale)`. v1 derives from the title and then overwrites any declared slug, so the migrated articles keep exactly the slugs the v1 mapping was computed from, and the day a title has to change the pin is already there.
- `title`, `date` and `locale` are required on a published article, `date` as `YYYY-MM-DD`. `locale` is required rather than defaulted to the site's: v1 defaults it, and a file that forgets it lands silently in the default locale.
- The excerpt is the article's opening block, before its separator, and is required. It is a string split and not a render, which is what keeps a blog roll cheap.
- Fields the schema does not name are ignored by the index. `author`, `featured` and `keywords` travel with the file and reach the index the day a page needs them; widening the entry is seo-excellence's or the landing page's business, not a schema change.

Validation runs inside the read, once per process, over every markdown file under the corpus root — unpublished files included, so a flag added by hand later cannot reveal a violation that was sitting there. It returns violations and never throws; `getArticleIndex` decides they are fatal, before any page is generated.

## What changes when the fixtures leave

`v1-url-map.generated.json` is regenerated from the real index, and its `fixture-` rows go — 99 rows today, computed over a fixture corpus of 44 articles, 33 of them fillers. Two consequences, both stated rather than discovered:

- Article rows follow the index. `articleRows` maps the articles it is given, and `rawMarkdownRows` answers Gone for a slug the index does not carry. An article without `published: true` is therefore an article whose v1 addresses answer Gone once the redirects go live. Nine of the eleven carry no flag today, and the redirects stay dormant until `retire-robusta-v1`, so nothing is lost in the meantime — provided the flags land first, which is the obligation the constraints above place on that story.
- The site's own build stops exercising roll pagination. The real corpus is 11 articles at a roll size of 12, and the fixtures were the only thing producing `/articles/p/{n}`. The shape stays exercised by the 78 tests of `pyramids-routing` and by this package's fixture corpora, and stops being exercised by `next build` until the twelfth published article arrives.

## Requirements

The brainstorm's `R-CONTENTSOURCE-1` to `18` are provisional and not carried over: several of them rest on nested categories, which the glossary and BR-PYRAMID-9 have since ruled out. Numbering restarts here, by category.

The reading contract:

- R-CONTENTSOURCE-01: The site obtains its articles through one call, and no route, script or page builds a second list.
- R-CONTENTSOURCE-02: The corpus is read at build time only; serving a request touches no file. Realizes BR-PYRAMID-7.
- R-CONTENTSOURCE-03: A process reads a corpus at most once, and two callers arriving before that read completes both receive the complete result.
- R-CONTENTSOURCE-04: The reader enumerates the declared corpus root and descends only inside it; no path outside it is enumerated, stated or read.
- R-CONTENTSOURCE-05: A file is an article by an explicit rule — a `.md` extension and none of the corpus's declared exclusions — never by a substring test on its path.
- R-CONTENTSOURCE-06: Answering the article list renders no article body; a body is rendered when one page asks for that one article.
- R-CONTENTSOURCE-07: The list a caller receives cannot be mutated by that caller.
- R-CONTENTSOURCE-08: An article's page copy — its body and its excerpt — comes from the site's own corpus through the reader, and from nowhere else. Realizes BR-PYRAMID-8.
- R-CONTENTSOURCE-09: Every article the reader returns names its source file, and every message about an article names that file.

Ownership:

- R-CONTENTSOURCE-21: The reading contract belongs to the shared base and carries no site's editorial vocabulary: no corpus path, no content root, no category, no locale value.
- R-CONTENTSOURCE-22: Where a site's articles live, and where a locale is read from in that tree, are declared by the site as data; the base calls back into no site-supplied function.
- R-CONTENTSOURCE-23: The base package holds no React and no Next import and runs under plain Node, so the same reader serves the route table, the page bodies and the redirect emitter.
- R-CONTENTSOURCE-24: A tree that carries the locale in its path uses the same contract with no code forked into the site, proved on a fixture corpus of that shape.
- R-CONTENTSOURCE-25: The package takes its slot in the build chain before any site builds, and sites consume its built output. Realizes BR-PYRAMID-5.

The schema:

- R-CONTENTSOURCE-41: A published article declares a title, a date as `YYYY-MM-DD`, a locale and an excerpt; a file missing any of them is a violation naming the file and the field.
- R-CONTENTSOURCE-42: An article is published only if its frontmatter declares `published: true`; a file that does not is read, left out of the index and named in the build output. Realizes BR-PYRAMID-10.
- R-CONTENTSOURCE-43: A `published` value that is not a boolean is a violation, so no article is unpublished by a typo.
- R-CONTENTSOURCE-44: An article translated into another locale carries a translation identifier shared with that version; two published articles of one locale sharing an identifier is a violation.
- R-CONTENTSOURCE-45: An article's slug is the one its frontmatter pins, or the frozen slugify of its title, and no change to the reader moves a published slug.
- R-CONTENTSOURCE-46: The category an article claims comes from its frontmatter and never from the folder it sits in.
- R-CONTENTSOURCE-47: Validation returns violations and never throws; the site decides a non-empty result fails the build, and it fails before a page is generated.
- R-CONTENTSOURCE-48: A declared corpus root that does not exist is a violation naming the path, not an empty corpus.

Clean-ups:

- R-CONTENTSOURCE-61: The site configuration states no category set; the categories that carry a page are derived from what articles claim.
- R-CONTENTSOURCE-62: The site builds from its corpus and from nothing else — no fixture article ships in a site build.
- R-CONTENTSOURCE-63: The v1 mapping is regenerated from the real index, and an article the index does not carry has no article row in it.

## Acceptance Criteria

Cast: Nina is the publisher; Ada develops the site; Tux builds from a clean checkout; Barbot is a crawler.

- AC-CONTENTSOURCE-01: Given a corpus of markdown articles, when Tux builds, then every published article appears in the index exactly once with the fields of `ArticleEntry`, newest first, and no article body is rendered.
- AC-CONTENTSOURCE-02: Given a full build of the site across its static-generation workers, when it completes, then the corpus was traversed once per process and never more, and the count is visible in the build output.
- AC-CONTENTSOURCE-03: Given two callers asking for the index before the first read resolves, when both settle, then both receive the same complete list and neither receives a partially-filled one. Realizes R-CONTENTSOURCE-03.
- AC-CONTENTSOURCE-04: Given a corpus root beside directories holding thousands of files, when the index is read, then nothing outside the corpus root is enumerated or stat'ed.
- AC-CONTENTSOURCE-05: Given a corpus holding `notes.md.bak`, a directory named `draft.md`, a `.DS_Store` and a declared exclusion `example.md`, when the index is read, then none of them is an article and no violation is raised for them.
- AC-CONTENTSOURCE-06: Given a served page of the built site, when Barbot requests it, then no file of the corpus is read. Realizes BR-PYRAMID-7.
- AC-CONTENTSOURCE-07: Given an article page, when it is generated, then its body comes from `getArticleBody` over that article's file, and the design system supplies none of its copy. Realizes BR-PYRAMID-8.
- AC-CONTENTSOURCE-21: Given a dakar-shaped fixture corpus — `content/{locale}/guide/{slug}.md`, locale in the path, `.brief.md` companions beside the articles — when it is read through the same package with its own `CorpusSpec`, then every article is returned with its locale and no code is forked into a site. Realizes R-CONTENTSOURCE-24.
- AC-CONTENTSOURCE-22: Given a clean checkout, when Tux runs the green set, then `@robusta/pyramids-content` builds in `build:deps` before the sites and every site of the set builds. Realizes BR-PYRAMID-5.
- AC-CONTENTSOURCE-23: Given `yarn emit:redirects`, which runs outside the webpack pipeline, when Ada runs it, then it reads the real corpus and writes the mapping without a bundler.
- AC-CONTENTSOURCE-41: Given an article whose frontmatter has no title, when Tux builds, then the build fails naming that file and the missing field, and no page has been generated. Realizes R-CONTENTSOURCE-41 and 47.
- AC-CONTENTSOURCE-42: Given the eleven migrated articles of which two declare `published: true`, when Tux builds, then the site serves those two, the build output names the nine left out, and the build succeeds. Realizes R-CONTENTSOURCE-42.
- AC-CONTENTSOURCE-43: Given an article declaring `published: "true"`, when Tux builds, then the build fails naming the file, rather than the article disappearing from the site.
- AC-CONTENTSOURCE-44: Given two published English articles carrying the same translation identifier, when Tux builds, then the build fails naming both files; and given an English and a French article sharing one, then the build passes.
- AC-CONTENTSOURCE-45: Given the migrated corpus, when the index is read, then every slug equals the one the v1 mapping was computed from; and given an article pinning `slug` in its frontmatter, then that value is used unchanged.
- AC-CONTENTSOURCE-46: Given an article claiming `typescript` while sitting under `javascript/typescript/`, when the site is built, then it is served at `/articles/c/typescript/{slug}` and no violation is raised about its folder.
- AC-CONTENTSOURCE-47: Given a corpus root that does not exist, when Tux builds, then the build fails naming the path it looked for. Realizes R-CONTENTSOURCE-48.
- AC-CONTENTSOURCE-48: Given an article whose slug is `l`, `c`, `p` or `t`, when Tux builds, then the build fails naming the file that carries it — the tightening AC-URLSCHEME-04 deferred to this story.
- AC-CONTENTSOURCE-61: Given the site configuration, when Ada reads it, then it declares no category set and no executable resolver, and the categories carrying a page are those the articles claim.
- AC-CONTENTSOURCE-62: Given the real index, when the mapping is regenerated, then no row mentions a `fixture-` slug and every published article has its v1 article row.

## Dependencies

- Depends on: `seo-url-scheme` — satisfied, landed 2026-07-31. It shipped the seam, the route table and `validateArticles`, whose shape the validation here follows.
- Depends on: nothing else. The corpus can be a fixture until `migrate-learn-content` moves the real files in.
- Blocks: `migrate-learn-content`, which moves the eleven articles into `content/articles`, corrects the two frontmatter locales, and fills `published` and `translationId`; and `seo-excellence`, whose sitemap and structured data read this index.
- Sequenced with: `retire-robusta-v1`, which turns the redirects on and must verify first that the `published` flags landed — the obligation stated in the Technical Constraints.

## Out of scope

- Moving the articles, their images and their frontmatter values — `migrate-learn-content`. This design defines the schema and the corpus root; it fills no file.
- How an article's images are served. The index carries `image` as declared, unresolved: the corpus is outside `public/`, and where those files land is the migration's deliverable.
- Repairing `apps/robusta`. Its dead traversal and its flag-before-the-work memo are recorded in the story, and the constraints above say what v2 does instead. No v1 file is touched.
- An artefact cached across build workers. The story weighed it at roughly 6.3 s per build for a corpus twenty times today's and declined.
- Rendering, typography and article layout; search; tags as a browsable axis; related-article computation.

## Decisions

- 2026-07-31 — The reading contract is its own workspace: `packages/pyramids-content`, published as `@robusta/pyramids-content`, second in `build:deps` behind `pyramids-routing`. Folding it into `pyramids-routing` would have spent that package's zero-dependency property to save a manifest. The v2 base is two packages, and the URL scheme stays takeable on its own.
- 2026-07-31 — `Published article` and `Translation identifier` enter `ubiquitous-language.md`, recorded by epicman as registrar. They are glossary terms here, not local definitions; `Published article` also closes a word the glossary already used without defining, in its Related articles entry.
- 2026-07-31 — "A site publishes an article only if that article declares itself published" is raised to epicman as registrar to be recorded as a business rule, after the four tests and after `Published article` lands in the glossary. The registrar recorded it the same day as BR-PYRAMID-10, which the Business Rules section now cites; the identifier was never this document's to assign.
- 2026-07-31 — The index carries published articles only, as designed: an article without the flag is left out, and its v1 addresses answer Gone once the redirects go live. The nine migrated articles carrying no flag are settled by hand before `retire-robusta-v1` turns the redirects on, and that story must check the flags before it acts — an obligation, not a note, recorded in the Technical Constraints where its reader is.
- 2026-07-31 — Four bullets enter the story's Documentation updates plan: create `packages/pyramids-content/content.archi.md`; change `root.archi.md` for the package's child entry in Key Components; change `CLAUDE.md` for the package line, the `build:deps` order and the watcher list; change `apps/robusta-build/README.md` and `robusta-build.archi.md`, which both state that `blogConfig.getCategories` returns an empty array until this story decides. The plan is storyman's file, and this design writes nothing in it.
- 2026-07-31 — Status DRAFT to APPROVED, all five arbitrations of the day folded and none left open. Approved without a walkthrough, deliberately: the previous design of this epic was approved after one and the first build still found three things the document had wrong, so the build is the check that matters and the corrections come back as dated entries. Implementation may start.
