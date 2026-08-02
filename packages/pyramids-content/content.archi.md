# Architecture: content

**Last updated:** 2026-08-02

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-content` is the reading contract of the version 2 base: how a tree of markdown files becomes the article index a site pregenerates from, and how the files those articles reference become published assets. It is the second package of the v2 base, next to `@robusta/pyramids-routing`, and the two meet without importing each other — an `ArticleEntry` is structurally an `AddressableArticle`.

What it deliberately does not own is any site's tree. The corpus root, where the locale is read from, which paths are not articles and where assets are published are all fields of the `CorpusSpec` the caller supplies, so no path, content root, category or locale value of any site appears in this package. The base calls back into nothing: a site declares data and reads results.

Two properties carry the design, and both are answers to defects the v1 reader lives with:

- One traversal per corpus root per process, memoized on the promise rather than on a flag, so a second caller arriving before the first read completes awaits the same read instead of seeing a half-filled index.
- Violations are returned, never thrown. The reader reports everything a corpus does wrong at once, and the site decides that a non-empty list fails the build.

## Diagram

```
┌───────────────────────── @robusta/pyramids-content ──────────────────────────┐
│                                                                              │
│  src/contract.ts ── CorpusSpec   root · localeFrom · exclude? · assets?      │
│         │           AssetSpec    publishDir · urlPrefix                      │
│         │           ArticleEntry · ArticleBody · CorpusRead                  │
│         │           CorpusViolation   seven codes, never thrown              │
│         ▼                                                                    │
│  src/markdown-files.ts ── the declared root and nothing above it             │
│         │                 a file, ending in .md, matching no exclusion       │
│         ▼                                                                    │
│  src/read-file-entry.ts ── one file against the schema                       │
│         │     ├── src/article-slug.ts    slugify, frozen derivation          │
│         │     └── src/asset-reference.ts every image reference, resolved     │
│         ▼                                                                    │
│  src/read-corpus.ts ── one traversal per root per process, result frozen     │
│         │              published only, newest first, then by path            │
│         │                                                                    │
│     ┌───┴───────────────┬─────────────────────┬──────────────────────┐       │
│     ▼                   ▼                     ▼                      ▼       │
│  read-article-body  copy-corpus-assets  describe-violation   resolveAssetUrl  │
│  remark → html      corpus →            violation → a line   a reference →    │
│  one body, on ask   publishDir          naming the file      the URL it is    │
│  images resolved    the site owns                            served at        │
│                     that directory                                            │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                    apps/robusta-build — src/content/*, scripts/*
```

## Key Components

- `src/contract.ts` — the contract stated as data: `CorpusSpec` (root, where the locale is read from, exclusions, the optional asset spec), `AssetSpec` (the directory the copy step owns and the URL prefix it is published under), `ArticleEntry`, `ArticleBody`, `CorpusRead` and the seven `CorpusViolation` codes.
- `src/markdown-files.ts` — the traversal: one recursive `readdir` inside the declared root, no path above it ever enumerated. A file is an article by an explicit rule — it is a file, its name ends in `.md`, and its path matches none of the declared exclusions — so a directory named `draft.md` is a directory and `notes.md.bak` is not markdown.
- `src/read-file-entry.ts` — one file against the schema: the required fields, the excerpt, the published flag, the locale, and the image references. Validation runs on every file the corpus holds, the unpublished ones included, so a `published` flag added later cannot reveal a violation that was sitting there.
- `src/article-slug.ts` — `articleSlug(title, locale)`, the v1 derivation kept frozen: `slugify` pinned at 1.6.6, `lower` and `strict`, the locale folded to lowercase before it reaches the charmap. Every row of the v1-to-v2 mapping was computed from what it returns, and the eleven migrated articles are addressed by it.
- `src/read-corpus.ts` — `readCorpus`, the memoized traversal. It publishes only articles declaring `published: true`, sorts them newest first and then by path so one corpus always produces one list, freezes what it returns, and prints one line per traversal naming the counts and the files left out for want of a published flag.
- `src/read-article-body.ts` — `readArticleBody`, the one place a body is rendered, through `remark` and `remark-html`. It takes an entry rather than a slug, so the file is resolved by the traversal that already found it and answering what articles exist never costs a render. The HTML it returns is servable as is: every image reference the body carries has been through `resolveAssetUrl`, applied to the syntax tree before serialization rather than to the output string, so the one resolution rule keeps one implementation. remark-html sanitizes by default and that default is kept — raw HTML written in a body is dropped whole, a stage before the sanitizer, so an `<img>` tag reaches neither the resolver nor the page.
- `src/asset-reference.ts` — the one resolution rule, shared by what the site publishes and what a page links to: an article-relative reference is joined onto the article's own directory inside the corpus and normalised. External, protocol-relative and site-absolute references pass through. `resolveAssetUrl` is the public form, and it has three callers: `read-file-entry.ts` validates through it, `copy-corpus-assets.ts` publishes through it, and `read-article-body.ts` links through it.
- `src/copy-corpus-assets.ts` — `copyCorpusAssets`, which mirrors into `assets.publishDir` the files the published articles reference, at their corpus-relative paths, and returns those paths for the caller to log.
- `src/describe-violation.ts` — one line per violation, naming the file a publisher has to open. The base never throws; the site turns these lines into its build failure.

## Public API (`src/index.ts`)

```ts
import {
  // functions
  articleSlug,
  copyCorpusAssets,
  describeViolation,
  readArticleBody,
  readCorpus,
  resolveAssetUrl,
  // types
  type ArticleBody,
  type ArticleEntry,
  type AssetSpec,
  type CorpusRead,
  type CorpusSpec,
  type CorpusViolation,
  type LocaleSource,
} from '@robusta/pyramids-content';
```

## Interfaces

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Types                                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ CorpusSpec  = { root, localeFrom, exclude?, assets? }                        │
│ LocaleSource = 'frontmatter' | { pathSegment: number }                       │
│ AssetSpec   = { publishDir, urlPrefix }                                      │
│                                                                              │
│ ArticleEntry = { path, slug, locale, category?, title, date, author,         │
│                  tags, excerpt, image?, translationId? }                     │
│ ArticleBody  = { html }                                                      │
│ CorpusRead   = { articles, violations, unpublished }   all frozen            │
│                                                                              │
│ CorpusViolation.code =                                                       │
│   missing-corpus-root · unreadable-frontmatter · missing-field               │
│   · malformed-date · non-boolean-published · duplicate-translation-id        │
│   · unresolved-asset                                                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ Functions                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ readCorpus(corpus: CorpusSpec) → Promise<CorpusRead>                         │
│ readArticleBody(corpus: CorpusSpec, entry: ArticleEntry)                     │
│   → Promise<ArticleBody>                                                     │
│ copyCorpusAssets(corpus: CorpusSpec) → Promise<readonly string[]>            │
│ resolveAssetUrl(corpus: CorpusSpec, entry: ArticleEntry, reference: string)  │
│   → string                                                                   │
│ articleSlug(title: string, locale: string) → string                          │
│ describeViolation(violation: CorpusViolation) → string                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

## The schema, on a corpus of markdown files

- Required, or the file is a violation naming itself: `title`, `date` as a `YYYY-MM-DD` calendar day, `author`, the locale wherever the spec says it is read from, `published: true` as a boolean, and an excerpt — the block of the body before its first `---` separator.
- Optional: `category` (one, and the URL scheme is what forbids it from nesting), `tags`, `image`, `translationId`, and `slug`, which pins the derived value.
- Derived: the slug, from the title and the locale. A field the schema does not name is ignored and costs nothing in the file.
- Absent and empty are the same thing: a field declared empty is a field not declared.

## Data Flow — the index

```
CorpusSpec (the site's data)
        │
        ▼
markdownFiles ── the root, recursively; .md, minus the exclusions
        │
        ▼
readFileEntry ── frontmatter · excerpt · published · locale · assets
        │                    │
        │                    └──► violations, accumulated and returned
        ▼
readCorpus ── published, newest first, frozen, memoized per root per process
        │
        ├──► the site's article index ──► urlSet ──► generateStaticParams
        └──► readArticleBody(entry)   ──► one page's copy
```

## Data Flow — the assets

```
an article's image reference        the published site
  ./images/vpn.png                    /article-images/blockchain/images/vpn.png
        │                                        ▲
        ▼                                        │
corpusAssetPath(article.path, reference)         │  urlPrefix + the same path
  blockchain/images/vpn.png ─────────────────────┘
        │
        ├── read-file-entry: names no file of the corpus → unresolved-asset
        ├── copyCorpusAssets: copy it into publishDir, at that same path
        └── readArticleBody: rewrite it on the tree, so the body links to it
```

The URL is derived from the file's place in the corpus, never from the page's place in the URL scheme, which is what lets an article change category without moving a single image. Validation resolves against the corpus and not against the published tree, so it runs on a clean checkout before the copy step has produced anything.

## Tests

98 tests in seven spec files next to the source, run with `yarn workspace @robusta/pyramids-content run test`. `test/corpus-fixture.ts` builds a corpus on disk per test, so no spec reads a real site's tree — the specs that check a site's own corpus live in that site.

- `src/read-corpus.spec.ts`, `src/corpus-traversal.spec.ts`, `src/read-article-body.spec.ts`, `src/article-slug.spec.ts`, `src/locale-from-path.spec.ts`, `src/describe-violation.spec.ts` — the reading contract, module by module.
- `src/corpus-assets.spec.ts` — the asset half: reference extraction, resolution, the violation, and the copy step owning the directory it writes.

## Dependencies

- Depends on: `gray-matter` (frontmatter and excerpt), `remark` and `remark-html` (the body), `unist-util-visit` (the image references of a body, on the tree), `slugify` pinned at 1.6.6 (the frozen slug). No React, no Next, no framework.
- Used by: `apps/robusta-build` — `src/content/corpus.ts` (the site's one `CorpusSpec`), `src/content/article-index.ts` (the index, the body, the resolved URL and the fatal violation), and `scripts/copy-article-images.mjs` (the asset copy, run before `next build`).
- Build: `tsc` → `dist/`. Second step of `yarn build:deps`, right after `pyramids-routing`. Watcher: `yarn w:content`.

## Notes / Gotchas

- Do not change `articleSlug`. A slug that moves breaks an indexed URL, and the v1-to-v2 redirect map was computed from the values it produces. `slugify` stays pinned, and the locale is folded to lowercase before it reaches the charmap because that is what the v1 reader did.
- No site path is written here. A literal corpus root, category or locale value inside this package is the base growing into one site's vocabulary; the review that catches it is a grep.
- `readCorpus` memoizes the promise, keyed on the resolved root. The memo is per process, which under `next build` means one per static-generation worker — forked workers share no memory, so the traversal count follows the worker count rather than being one for the whole build. A rejected read stays memoized: a corpus that fails to read fails the build, and reading it twice only produces the failure twice.
- The result is frozen, entries and tag lists included. Every caller shares one read, so a caller sorting the list in place would corrupt the next one's index.
- Violations never throw, and `missing-corpus-root` is one of them: a root that does not exist is reported like a missing title, so a caller has one failure path instead of two.
- `published` is exactly `true`. Absent leaves the article out silently and the read names the file; anything else is a violation, so `published: "true"` cannot unpublish an article by a typo.
- `copyCorpusAssets` owns `assets.publishDir` and removes it before writing. Point it at a directory that holds anything else and that thing is deleted.
- A site declaring no `assets` gets no asset behaviour at all: no reference is judged, no file is published, `resolveAssetUrl` returns the reference untouched, and a rendered body therefore carries the references its author wrote.
- Raw HTML written in a body renders as its text alone, and nothing reports it. `sanitize: true` is remark-html's default and is kept, which sets `allowDangerousHtml = false`, and an `html` node then produces nothing at all — so `<b>C</b>` reaches the page as `C`, element and attributes gone together. This is a rule for whoever writes an article, and a site's README is where a publisher meets it; enabling `allowDangerousHtml` to recover a vanished tag is what the contract forbids.
- The excerpt is content, not a field: `gray-matter` cuts the body at its first `---`. An article whose body carries no separator declares no excerpt and is a violation.
- Local imports inside the package end in `.js`, as everywhere in this repository. Consumers import the package by name, so no extension question crosses the boundary.
