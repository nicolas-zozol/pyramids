# Design: Migrate the learn articles onto the v2 site

**Last update:** 2026-08-01
**Feature:** migrate-learn-content
**Infix:** MIGRATELEARN
**Status:** APPROVED (2026-08-01)
**Sources:** [story](migrate-learn-content.story.md) · [brainstorm](migrate-learn-content.brainstorm.md) · [epic](../pyramid-v2.epic.md) · [seo-url-scheme design](../seo-url-scheme/seo-url-scheme.design.md) · [content-source design](../content-source/content-source.design.md) · [business-rules.md](../../../business-rules.md) · [ubiquitous-language.md](../../../ubiquitous-language.md)

## Goal

Produce the converted corpus at `apps/robusta-build/content/articles` — eleven articles, their frontmatter translated into the v2 schema, their images beside them — and let the machinery that already exists light up on it. The reader shipped with content-source, the URL scheme and the route table shipped with seo-url-scheme, and the v1 mapping is a function of the article index rather than a table.

The deliverable is a transformation and its verification. Three pieces of new machinery come with it, each answering something the empty corpus was hiding: image references resolve to nothing, three French article rows point at URLs v1 never served, and the landing page shows a design system's default posts. Article rendering is not among them — it left this design on 2026-08-01 and became a story of its own. Why the migration matters at all, and what an indexed URL costs, are in the [story](migrate-learn-content.story.md).

## Decisions

Six arbitrations landed on 2026-08-01 and are folded into the body below. Recorded here because four of them changed what this design builds.

- 2026-08-01 — Article rendering does not enter this story. It becomes a story of its own at `features/pyramid-v2-epic/article-page/`, and this design ships the corpus, the conversion, the images and the redirects while the four article routes keep the `RoutePlaceholder` seo-url-scheme gave them. Consequence carried rather than hidden: the story's definition of done requires every v1 article to be readable on the v2 site, and this design does not meet that bullet — the bullet moves to the new story, which storyman writes. See [What leaves with article rendering](#what-leaves-with-article-rendering).
- 2026-08-01 — Images sit beside their article under `content/articles/**/images`, and a build step copies them into `public/`, against the split tree this design first proposed. One tree for an author, working previews in a markdown editor, and a self-contained corpus. The cost is accepted knowingly: a copy script, a generated subtree under `public/` that git ignores, and one more step before `next build` — the step joins `emit:redirects`, which the site already runs ahead of the build for the same class of reason.
- 2026-08-01 — This story builds and mounts the whole NotesPreview section, on the home page as it stands today, rather than delivering the feed alone. It carries out the story's decision of 2026-07-30 literally, and robusta-landing-page inherits a working section instead of a receipt to honour. That the section lands on a placeholder page is accepted: it is fed by real articles and survives the page being rebuilt around it.
- 2026-08-01 — `apps/robusta-build` gains a vitest setup in this story, and both specs live there. It ends a base package holding a test that reaches into an app, and it widens this story into test infrastructure knowingly: seo-excellence has a sitemap and structured data to assert and would have needed the setup anyway.
- 2026-08-01 — `Asset root` goes to the registrar for `ubiquitous-language.md`: the URL prefix under which a site publishes the files its articles reference; it is not the content root, it carries no page, and a site names its own. The glossary entry is epicman's to write; this design uses the term in that sense and writes in no glossary.
- 2026-08-01 — Two bullets go to the story's Documentation updates plan: change `apps/robusta-build/robusta-build.archi.md`, and change `packages/pyramids-content/content.archi.md`, that second file being owed by content-source's own plan and not yet written. The plan is storyman's file and this design writes nothing in it. What the first bullet has to cover moved with the arbitrations — the asset root, the copy step, the middleware exclusion and the notes section, and no article page.
- 2026-08-01 — Status DRAFT to APPROVED, all six arbitrations of the day folded and none left open. Approved without a walkthrough, as seo-url-scheme and content-source were: the two designs of this epic that reached a build each came back with corrections the document could not have found on its own, so the build is the check that matters and what it teaches returns here as dated entries. Implementation may start.

## Ubiquitous Language

Terms are used in the sense `ubiquitous-language.md` gives them: article, published article, category, tag, slug, locale, translation identifier, blog roll, landing page, content source, content root, discriminant, canonical URL, indexable page, page copy, site configuration, clean checkout, green set, build chain.

Three consequences:

- Category is flat and comes from the frontmatter, and the glossary already settles the one hard case: "_v1_ declared nested paths such as `javascript/typescript`; on v2 such a path names its leaf." That is what turns `categoryPath: 'javascript/typescript'` into `category: typescript` and creates the single-article `typescript` category, and it is a glossary consequence rather than a new decision.
- Translation identifier is the glossary's "durable value shared by the locale versions of one article". This design says what the four files write in it, not what the term means; the link that reads it goes to `article-page`.
- Asset root is the one term this design needs and the glossary does not carry yet. It is used below in the sense the decision of 2026-08-01 fixed, and epicman records it.

## Business Rules (cited)

Cited verbatim from `business-rules.md`, under the epic's Infix:

- BR-PYRAMID-1 — The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-7 — A site must not read its content source while serving a request.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.
- BR-PYRAMID-10 — A site publishes an article only if that article declares itself published.

What each one decides here:

BR-PYRAMID-5 carries two obligations at once. It is what the copy arbitration rests on: a move would empty the tree `apps/robusta` renders, and the green set names every site the repository claims to ship, `@robusta/build` included, so the copy is what keeps `yarn build:robusta` producing its 42 pages for the remaining length of the epic. It is also the constraint the new copy step has to meet — the step is inside the app's own `build` script, so the green set runs it, and its output is generated rather than committed, so it must produce a correct tree on a checkout that carries none.

BR-PYRAMID-7 kills the obvious way to serve the images. A route handler reading `content/articles/**/images` on request would be the smallest change and is not available: the corpus is read at build time and at no other time. The images therefore become ordinary static files before the build starts, and the reference in the markdown is resolved during the build.

BR-PYRAMID-8 governs one surface here rather than two. The landing page's notes section takes its posts from the site's index — `NotesPreview` ships four `DEFAULT_POSTS` and default `eyebrow`, `title` and `allLinkLabel` strings, which are page copy in a design system and must never reach a served page. The article page's copy was the second surface and left with article rendering.

BR-PYRAMID-10 is already satisfied and the design records why: all eleven files carry `published: true` since 2026-08-01, verified against `apps/robusta/content/blog`. That discharges the ordering obligation content-source's design placed on `retire-robusta-v1` — there is no longer a flag to check before the redirects go live — and it is what makes the eight raw-markdown rows redirect rather than answer Gone.

BR-PYRAMID-1 decides where the images are published. The asset root is a segment of its own, `/article-images`, outside the content section: an image URL under `/articles/c/{category}/` would sit inside a shape the scheme reserves for pages, and a site that has to look at the filesystem to know whether `/articles/c/blockchain/images` is a page or a file is exactly what the rule forbids.

## The conversion

Eleven files, verified against `apps/robusta/content/blog` on 2026-08-01. Every count below is measured, not carried over.

Mode, per the arbitration of 2026-08-01: copy. The files are written into `apps/robusta-build/content/articles`, the v1 tree stays where it is, and `retire-robusta-v1` deletes it rather than merging it back.

### The target tree

`content/articles` mirrors the v1 folder layout, so a converted file sits at the same relative path as its source — `blockchain/ledger-versus-metamask.md`, `javascript/typescript/completes-with.md`. The folder carries no meaning on v2, the category being frontmatter, but keeping the mirror makes the source of a converted file findable by name and the byte comparison below a one-to-one match rather than a lookup. The images travel into the same tree, at the same relative paths, and the traversal ignores them: `markdownFiles` keeps files whose name ends in `.md` and nothing else, so no `exclude` entry is needed for them.

### What changes in a file

- `categoryPath` becomes `category`, the last segment of the declared path. Ten files convert one to one: `blockchain` ×4, `javascript` ×3, `privacy`, `theory`, `web`. `javascript/typescript/completes-with.md` declares `categoryPath: 'javascript/typescript'` and becomes `category: typescript`, per the arbitration of 2026-07-31, which is what creates the single-article `typescript` category.
- The declared locale of `blockchain/yield-farming.md` and `javascript/why-migration-gatsby-next.md` becomes `en`. Both are English pieces declaring `fr`, and the correction takes the split from 6/5 to 8/3, per the decision of 2026-07-30. Neither slug moves: `articleSlug` was run at both locales on both titles and returns the same value, `slugify` reaching no locale-specific charmap on an unaccented title.
- `translationId` is added to four files, in two pairs — `yield-farming` on `blockchain/yield-farming.md` and `blockchain/yield-farming-fr.md`, `gatsby-to-nextjs` on `javascript/why-migration-gatsby-next.md` and `javascript/pourquoi-migration-gatsby-next-js.md`. The value is a hand-picked subject name: locale-neutral, lowercase, and authored rather than derived. What makes it durable is that nothing computes it and nothing checks it against a path — the schema's only rule is that two published articles of one locale may not share one, so a title change, a category change, a file move or a pinned slug all leave it untouched. The other seven articles carry none.
- The cover image of `javascript/typescript/completes-with.md` becomes `../images/stop.png`. It reads `./images/stop.png` today and there is no `javascript/typescript/images` directory: `stop.png` sits in `javascript/images`. It is the third data defect of the same class as the two locales, and the only one of the 44 referenced image paths that resolves to no file. It is a frontmatter key, so correcting it costs no body byte.

### What travels unchanged

- `title`, `date`, `tags`, `image`, `author`, `public`, and any other key a file carries. A field the v2 schema does not name is ignored by the index and costs nothing in the file.
- `published: true`, on all eleven.
- `featured`, on the eight articles declaring `true` and the one declaring `false`. The story's decision of 2026-07-30 says seven; the corpus says eight — `ledger-versus-metamask`, `start-coding-blockchain`, `yield-farming-fr`, `yield-farming`, `completes-with`, `why-migration-gatsby-next`, `quel-second-langage`, `easy-automation-with-sonoff`. Correcting the story is storyman's. Nothing tests the count, because nothing reads the field: it travels in the file and enters the index the day a page picks a featured set.
- The markdown body, byte for byte. Nothing below rewrites a body, which is what makes the verification cheap.
- The slug, which is derived rather than written: `articleSlug(title, locale)` unless a file pins `slug`, and no file does. The eleven values are the ones every row of the v1 mapping was computed from.

### The images

44 distinct paths are referenced across the eleven articles — cover images and body images together — out of 73 image files under `content/blog`. The 29 unreferenced images stay behind with `apps/robusta`, the whole `security/` and `prompt/` folders included; git holds them and the tree is not deleted until `retire-robusta-v1`.

The 44 files travel into `content/articles`, beside the articles that reference them, at their corpus-relative paths. Six directories after the `stop.png` correction: `images`, `blockchain/images`, `javascript/images`, `privacy/images`, `theory/images`, `web/images`.

The reference in the markdown keeps the form it is authored in. Both forms occur and both survive: `./images/x.png` in every body and in ten frontmatters, `../images/styled-logo.png` in the cover of `javascript/styled-components.md`, which points at the shared `images` folder at the corpus root. Resolution happens during the build, against the article's own path inside the corpus:

- an absolute or external reference passes through untouched;
- otherwise the reference is joined onto the article's directory and normalised, giving a corpus-relative path — `blockchain/ledger-versus-metamask.md` plus `./images/vpn.png` gives `blockchain/images/vpn.png`, published at `/article-images/blockchain/images/vpn.png`;
- a reference that escapes the corpus root, or that resolves to a file the corpus does not hold, is a violation naming the article and the reference, and fails the build.

Validation resolves against the corpus and not against the published tree, which is what lets it run on a clean checkout before the copy step has produced anything, and what makes `yarn emit:redirects` the first thing that fails.

v1 did this differently and the difference is the point. Its `validateFrontMatter` strips `./` and the `images` prefix and prepends a slash, so `./images/aave-small.png` becomes `/aave-small.png` and no such file exists — every cover image is broken on v1 today. Its body images work only because `public/learn/**/s/images` is a hand-kept mirror positioned to make `./images/` resolve from the article URL `/learn/{categoryPath}/s/{slug}`, and that mirror has already drifted: 73 files on each side, four names the corpus holds and the mirror does not — `blockchain/images/dao-state.jpeg`, `blockchain/images/tool-adoption.jpeg`, `javascript/images/promo-gatsby-vs-next-small.png`, `prompt/images/meta-prompt-diagram.png` — and four the mirror holds and the corpus does not, all four under `web/images`. Deriving the URL from the file's place in the corpus rather than from the page's place in the URL scheme is what stops the same drift here, and it is what lets an article change category without moving a single image.

`theory/images/M87.jpg` is the one referenced file carrying an uppercase letter. It is a body image of `quel-second-langage.md` — `![Trou noir M87](./images/M87.jpg)` sits in the prose, so renaming it would edit a body and cost the byte comparison below. That is why the middleware grows an exclusion rather than the file a new name; the cover of that same article is `./images/all-languages-2021-small.png` and needs nothing.

### The copy step

The corpus is not under `public/`, so the referenced files are mirrored into it before the build. The step owns the subtree it writes.

- Name: `apps/robusta-build/public/article-images/`, the asset root's own segment. `.gitignore` names it at the repository root, next to `apps/robusta-build/.routing-dist/`, which is generated for the same reason.
- What it copies: the files the published articles reference, and only those — the same set validation computed. An image that no published article references is not published, which keeps a public directory from filling with files nobody asked for and keeps an unpublished article's images out of the served site.
- Stale files: the step removes the directory before writing it. The tree is generated in full on every run, so a renamed, re-pathed or deleted image cannot survive as a stale public file — the failure mode the v1 mirror is living proof of.
- Clean checkout: the directory is in no checkout, so the step creates it. It depends on no committed artefact and reads only the corpus (BR-PYRAMID-5).
- Where it runs: between `emit:redirects` and `next build`, in both the `build` and the `dev` script. It reuses the compile `emit:redirects` already performs, reading the site's `corpus` declaration from `.routing-dist/content/corpus.js` exactly as `emit-redirects.mjs` does. `next build` collects `public/` when it starts, so the ordering is not a preference.
- It is not a watcher. An image added during a `next dev` session reaches the site on the next `yarn copy:assets`, which the dev script runs at startup.

## Interfaces

Seven groups: the base package, the three site modules it changes, the landing surface it creates, the home page it mounts into, and the build files that carry them.

### `@robusta/pyramids-content` — the asset spec, the copy and one violation

Modified. `CorpusSpec` gains the asset declaration, one violation code is added, and two functions are exported. `readCorpus`, `readArticleBody` and `ArticleEntry` keep their shapes.

```ts
/** Where a site publishes the files its articles reference. Data, like the rest of CorpusSpec. */
export interface AssetSpec {
  /** Directory the copy step writes, relative to the process working directory. It owns that directory. */
  publishDir: string;
  /** The URL prefix that directory is published under. */
  urlPrefix: string;
}

export interface CorpusSpec {
  root: string;
  localeFrom: LocaleSource;
  exclude?: readonly string[];
  assets?: AssetSpec;
}

export type CorpusViolation =
  // unchanged: missing-corpus-root, unreadable-frontmatter, missing-field,
  // malformed-date, non-boolean-published, duplicate-translation-id
  | { code: 'unresolved-asset'; path: string; reference: string };

/** The URL an article-relative reference resolves to; absolute and external pass through. */
export function resolveAssetUrl(
  corpus: CorpusSpec,
  entry: ArticleEntry,
  reference: string,
): string;

/**
 * Mirrors into `assets.publishDir` the files the published articles reference, at their
 * corpus-relative paths. Removes the directory first. Returns those paths, for the caller to log.
 */
export function copyCorpusAssets(corpus: CorpusSpec): Promise<readonly string[]>;
```

`unresolved-asset` is raised inside `readCorpus`, which is where it costs nothing: `readFileEntry` already holds the whole file, gray-matter having read it to extract the excerpt, so scanning it for image references is a regular expression over a string in memory and not a markdown parse. Answering what articles exist still renders no body (R-CONTENTSOURCE-06). Validation runs over unpublished files too, so an image deleted while an article is out of the index does not surface the day the flag comes back, and it runs only when the corpus declares `assets` — a site that names no asset root publishes no files and the base does not judge its references.

`resolveAssetUrl` and `copyCorpusAssets` share one resolution rule, which is the reason the copy lives in the base rather than in the app's script: the path a reference names and the URL it is served at have to be computed the same way or the tree and the markup disagree.

`ArticleEntry` is not widened. `author` and `featured` were going in for the article page, which read one and would have picked from the other; both fields travel in the file, unread, and the entry grows the day a page needs them — which is what content-source's design said it would.

`readArticleBody` does not rewrite the image references of the body it renders. No page renders a body in this story, so a body-relative `src` costs nothing today; rewriting it through `resolveAssetUrl` is the first thing `article-page` does.

### `apps/robusta-build/src/content/corpus.ts` — the asset declaration

Modified, one field.

```ts
export const corpus: CorpusSpec = {
  root: 'content/articles',
  localeFrom: 'frontmatter',
  assets: { publishDir: 'public/article-images', urlPrefix: '/article-images' },
};
```

The markdown is not under `public/` and the copied images are, which is the split content-source's design asks for: v1 published its markdown at `/learn/**/*.md` and those thirteen URLs are rows of the mapping today, five of them answering Gone. An image has no such problem — it is meant to be fetched.

### `apps/robusta-build/src/middleware.ts` — the asset root is case-significant

Modified, one string.

```ts
export const config = {
  matcher: ['/((?!learn/|learn$|_next/|article-images/)(?=[^?]*[A-Z]).*)'],
};
```

Without the exclusion, `/article-images/theory/images/M87.jpg` is matched by the case-normalising middleware, 308-redirected to a lowercase path that does not exist, and shows as a broken image. This is the same failure the decision of 2026-07-31 recorded for `/_next`, and it confirms the rule that decision generalised: a case-normalising rule must exclude every namespace whose paths are case-significant. A filesystem is one.

### `apps/robusta-build/src/routing/v1-url-map.ts` — article rows lose the locale segment

Modified, one internal function; `v1UrlMap`, the three exported constants and the row shape are untouched.

`articleRows` builds its source path with `v1Path(scheme, article.locale, …)`, which prefixes the locale for a non-default one. v1 does not: `apps/robusta/src/app/learn/[...path]/page.tsx:59` emits `path: [...post.categories, 's', post.slug]` for every article regardless of locale, and every blog route is `force-static`, so `/learn/fr/...` 404s on the live site and `/learn/{category}/s/{slug}` is what v1 published for a French article as much as for an English one.

With the fixture corpus the defect was invisible. With the real corpus it costs three rows: the three French articles would be mapped at `/learn/fr/{category}/s/{slug}`, which nothing ever published, while their true addresses `/learn/blockchain/s/provenance-des-rendements-du-yield-farming-dans-la-blockchain`, `/learn/javascript/s/pourquoi-jai-migre-de-gatsby-vers-nextjs` and `/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere` would fall through to the `/learn/:path*` namespace rule and answer 410 Gone. Three indexed article URLs retired by accident is exactly what the story's definition of done forbids, and the locale corrections above are what make it real — they take the split to 8 English and 3 French.

The rule becomes: an article row's source is the unmarked v1 path, whatever the article's locale, and a non-default-locale article gets a second row at the locale-marked form. The destination is the same v2 URL in both cases. Listing the marked form costs three rows and matches what the category class already does, AC-URLSCHEME-62 requiring `/learn/fr/javascript/page/2` to have a destination.

### `apps/robusta-build/src/landing` — the notes feed and the section

Created, two files, one directory. They sit outside `src/content` on purpose: `tsconfig.routing.json` includes `src/content` whole, and anything it compiles must not reach the design system — the same constraint that keeps `seopyramids.config.ts` out of the emitter's reach, for the same bundler-only wordmark PNG. `src/landing` also names what `robusta-landing-page` takes over.

```ts
// src/landing/notes-feed.ts
import type { NotePost } from '@robusta/pyramids-design-system';

/** The site's own copy for the landing page's notes section (BR-PYRAMID-8). */
export function notesFeed(locale: string, limit: number): Promise<NotePost[]>;
```

The newest `limit` published articles of that locale, each mapped onto a `NotePost`: `title` from the entry, `href` from `buildUrl`, `tag` from the category, `date` formatted from the entry's `YYYY-MM-DD` into the short lowercase form the design system's own examples use. `tagTone` is left unset so the default tone applies — assigning a tone per category is a visual decision and belongs with the prose surface, not with a migration. Selection ignores `featured` deliberately: the decision of 2026-07-30 leaves the publisher to re-pick the featured set once someone decides what a featured article is for, and newest-first is what a preview of notes means until then.

```tsx
// src/landing/NotesSection.tsx
/** NotesPreview fed by this site's articles. Every string it renders is the site's. */
export async function NotesSection({ locale }: { locale?: string }): Promise<ReactElement>;
```

It awaits `notesFeed(locale ?? urlScheme.defaultLocale, 4)` and passes the posts to `NotesPreview`, together with the site's own `eyebrow`, `title`, `allLinkLabel` and an `allLinkHref` of `buildUrl(urlScheme, { kind: 'blog-home', locale, page: 1 })` — `/articles`, a URL of the set rather than the design system's `#notes` anchor. Four posts because the surface is a two-column grid and four is what fills it; the count is the call site's and not the component's.

### `apps/robusta-build/src/app/page.tsx` — mounting the section

Modified. The home page is the placeholder `bootstrap-robusta-build` shipped for `robusta-landing-page` to delete; mounting means the placeholder gains `<NotesSection />` below its existing wiring demonstration, and the component function becomes `async`. It stays a server component and stays statically generated: `NotesPreview` carries no `'use client'`, and the index is read in the build (BR-PYRAMID-7).

Mounting is English-only. `/l/fr` is a route file whose `generateStaticParams` derives from `landingParams`, and `urlSet` produces no landing URL, so the French landing pregenerates nothing and there is no page to mount into. The same component takes `locale="fr"` the day robusta-landing-page gives that page copy.

What `robusta-landing-page` inherits: a working section, its feed, its copy and its test. It owes nothing back. When it deletes the placeholder it carries one import and one element across, and it is free to rewrite the three strings in the voice it chooses — they are the site's copy, not a contract.

Accepted consequence of the two arbitrations together: the section links to article URLs that answer 200 with a `RoutePlaceholder` until `article-page` lands. It is dormant like everything else here — the site answers `robots: noindex`, and the v1 site still serves the domain.

### `apps/robusta-build/scripts/copy-article-images.mjs` and the package scripts

Created, plus four script lines.

```
"copy:assets": "node scripts/copy-article-images.mjs",
"dev":         "yarn emit:redirects && yarn copy:assets && next dev --turbopack",
"build":       "yarn emit:redirects && yarn copy:assets && next build && node scripts/check-route-table.mjs",
"test":        "vitest run"
```

The script imports `corpus` from `.routing-dist/content/corpus.js` and `copyCorpusAssets` from `@robusta/pyramids-content`, then logs the count the way `emit-redirects.mjs` logs its rows. It carries no logic of its own: what to copy and where is the base's, and `corpus.ts` is where the site says it.

`vitest.config.ts` joins it at the app root, in the shape `packages/pyramids-content` and `packages/pyramids-routing` already use, plus the `vite-tsconfig-paths` plugin `apps/robusta` uses — the app's specs import through the `@/*` alias and through `.js`-suffixed local paths, and the plugin is what resolves the first while Vite resolves the second.

```ts
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { include: ['src/**/*.spec.ts'], environment: 'node' },
});
```

`vitest` and `vite-tsconfig-paths` enter `devDependencies`. Nothing at the repository root gains a `test` script: there is none today and this story is not the place to invent one.

## What leaves with article rendering

The arbitration of 2026-08-01 removed a whole surface from this design. What it took, so nothing below quietly assumes it:

- `src/content/article-view.ts` and the `ArticleView` contract. Not created here.
- The four article route files — `articles/[slug]`, `articles/c/[category]/[slug]` and their `l/[locale]` twins. They keep `RoutePlaceholder` and are not touched. Their `generateStaticParams` are untouched too, which is why the URL set does not move.
- Cover image resolution. The cover reference is validated and its file is published — a broken cover fails the build, and `/article-images/theory/images/all-languages-2021-small.png` is served — but nothing displays it. `ArticleEntry.image` stays as declared, unresolved.
- The category link and the translation link. `translationId` still lands on the four files and the duplicate check still runs; the page that turns an identifier into a link is `article-page`'s.
- `author` on the index, and with it the site-configuration fallback. `blogConfig.author` keeps the value it has and gains no reader.
- The retired identifiers: R-MIGRATELEARN-41, 42 and 43, and AC-MIGRATELEARN-41 and 42. The numbers are not reused.

## Technical Constraints

- Next 15 App Router with RSC on Vercel, and everything above runs in the build. Nothing added here is reachable from a request path: the asset resolution happens inside `readCorpus`, the copy happens before `next build` starts, and the notes feed is read from a statically generated page (BR-PYRAMID-7).
- Files under `public/` are served ahead of nothing and behind the route table, so the asset root must not collide with a generated URL. `/article-images/**` matches no route file and no `urlSet` output, which is what makes it safe; `/articles/c/{category}/images/**` would not be.
- `scripts/emit-redirects.mjs` runs the reader outside webpack, through `tsconfig.routing.json`, and reaches `src/content`. The new `AssetSpec` is data on `corpus.ts`, a leaf module, so the emitter keeps compiling; `src/landing` is outside the include list and must stay there, since it imports the design system.
- `@robusta/pyramids-content` is rebuilt before the site sees any of this, apps consuming `dist/` and not sources (BR-PYRAMID-5). A developer editing it needs `w:content`, and the copy script imports the package by name, so it reads `dist/` like everything else.
- The corpus root and the asset directory are both resolved against `process.cwd()`, which is the app directory under `next build`, `next dev`, `yarn workspace … run emit:redirects`, `copy:assets` and `vitest` alike — which is what lets the app's specs read the site's own `corpus` declaration instead of rebuilding one.
- An image inside a rendered markdown body would reach a page as a plain `<img>` through `dangerouslySetInnerHTML`, with no `sizes`, no WebP conversion and no lazy loading. No page renders a body here, so the question is inherited rather than answered: whether the article images deserve `next/image` is `article-page`'s and seo-excellence's, and answering it means rewriting bodies or replacing remark's HTML with a component pipeline.
- `slugify` stays at 1.6.6 with `lower` and `strict`. The eleven slugs are its output and every row of the mapping was computed from them.
- The site carries `robots: { index: false, follow: false }` site-wide until robusta-landing-page lifts it, and the redirects stay dormant on a domain the v1 site still serves. Nothing this story lands goes live.

## Verification

Two specs, both under `apps/robusta-build/src/content`, with different lifetimes — which is why they are two files and not two `describe` blocks.

`migrated-corpus.spec.ts` leaves `packages/pyramids-content/src` in the same commit that creates it here; it is moved, not duplicated. In the package it reached across two workspace boundaries into `apps/robusta/content/blog` to hold the reader against real content. In the app it reads the site's own corpus through the site's own `corpus` declaration, which is both shorter and stricter — a change to `corpus.ts` now moves the test. Three of its five expectations survive, two flip, four are added:

- survives: eleven published articles, no violation, no unpublished path.
- survives: the eleven slugs, unchanged.
- survives: an excerpt and an image on every article.
- flips: `category === undefined` on every article becomes six flat categories claimed — `blockchain` ×4, `javascript` ×3, `privacy`, `theory`, `typescript`, `web` — and no category containing a slash.
- flips: the 6/5 locale split becomes 8/3.
- added: exactly four articles carry a translation identifier, forming two pairs, each pair holding one `en` and one `fr`.
- added: every image reference of the corpus resolves to a file inside the corpus, cover images included — which is `violations` being empty read a second way, and worth its own assertion because it is the one class the empty corpus could never have raised.
- added: the copy step publishes exactly the referenced set, and republishing after a file is renamed leaves nothing behind.
- added: the URL set derived from the corpus is the 21 URLs below, so a slug or a category that moves is caught in the app rather than in the build.

`corpus-freeze.spec.ts` is created, and it is the answer to both "prove the conversion lost nothing" and "what enforces the freeze". It walks the eleven pairs of files and compares the markdown body — everything after the closing frontmatter delimiter — byte for byte between `apps/robusta/content/blog` and `apps/robusta-build/content/articles`. Byte-level comparison is wanted, and it is wanted here rather than as a one-off script: it is the only assertion that catches an article silently altered by the copy, and the same assertion turns red the moment anyone edits an article on either side of the freeze.

What it does not do is worth saying plainly:

- Frontmatter is excluded, since diverging frontmatter is the whole point of the conversion. A publisher editing the title of a v1 article breaks nothing that turns red — the freeze on frontmatter rests on discipline and on `retire-robusta-v1` deleting the tree, and nothing enforces it.
- It dies with the v1 tree. `retire-robusta-v1` deletes `apps/robusta/content/blog` and this spec goes with it, in the same commit, which is why it is its own file.
- It reaches into another app, which the corpus spec now stops doing. That asymmetry is the point: a freeze between two trees cannot live in one of them alone, and this one is written to be deleted.

A third file joins them the day something else needs it: `notes-feed` has no spec of its own, its behaviour being read off the same index the corpus spec pins, and its section is checked in the build output.

Beyond the specs, `scripts/check-route-table.mjs` already compares the prerender manifest against the derived URL set after every build, so a URL pregenerated that the site then refuses, or the reverse, fails without a new check.

## What lights up

Numbers computed from the shipped code against the converted corpus, not estimated. A reader can check each one. The four arbitrations of 2026-08-01 moved none of them, and the reason is worth stating rather than assuming: `urlSet` derives from the article index, every `generateStaticParams` derives from `urlSet`, and the mapping derives from the index too — what article rendering took away is what a page body renders, not what a route pregenerates or what a redirect points at.

The URL set goes from 1 to 21. `urlSet` over an empty corpus produces a single content URL, `/articles`, which is why the site prerenders three routes today — that one, `/`, and `/_not-found`. Over the eleven articles it produces:

- 2 blog homes: `/articles` and `/l/fr/articles`.
- 8 category pages: `blockchain`, `javascript`, `privacy`, `typescript` and `web` in English, `blockchain`, `javascript` and `theory` in French. Six categories across two locales, `blockchain` and `javascript` claimed in both.
- 11 article pages, 8 English and 3 French. They are prerendered and they show a route description, which is `article-page`'s to replace.
- 0 roll pages, in either locale. Eight articles and three articles against a roll size of 12, and the largest category holds four. `/articles/p/{n}` is produced by nothing until the twelfth published English article arrives, exactly as the decision of 2026-07-31 accepted.

So 23 prerendered routes against three, the landing page and `/_not-found` added to the 21. The story's figure of five counts the build summary's route lines rather than prerendered routes; the number `check-route-table.mjs` compares is the 21.

The asset root goes from nothing to 44 files in 6 directories, published under `/article-images/`, all of them generated and none of them committed.

`v1-url-map.generated.json` goes from 68 rows to 82 — 66 permanent, 6 gone, 10 none — against 99 in the fixture era, the difference being the twenty `fixture-` filler article rows that leave with the fixtures. Per class:

- blog home: 2 permanent. Unchanged.
- blog roll pages: 2 none. Unchanged, v1 having generated none.
- category pages: 28 permanent, unchanged in count and changed in destination. 12 of them now reach a category page where all 28 fell back to the blog home on the empty corpus — `blockchain`, `web`, `javascript` and `javascript/typescript` in English, `blockchain` and `javascript` in French, each in its bare and its paginated form. The remaining 16 still reach the blog home: `blockchain/ethers-js`, `blockchain/solidity` and `javascript/react` are declared by v1 and claimed by no article, and `web`, `typescript` and the three unclaimed ones have no French counterpart.
- articles: 14 permanent where there were 0 — 11 at the unmarked v1 path plus 3 at the locale-marked form of the French articles. `/learn/javascript/typescript/s/completing-a-rxjs-observable-with-another` reaches `/articles/c/typescript/completing-a-rxjs-observable-with-another` and not `javascript`.
- tag pages: 14 permanent and 1 none, unchanged in count. 3 now reach a category page — `web`, `blockchain` and `javascript` — where all 14 fell back to the blog home. `/learn/tag/DeFi` keeps its capitals and reaches the blog home, `defi` being no category.
- raw markdown: 8 permanent and 5 gone, where the empty corpus made all 13 Gone. All eleven articles declaring themselves published is what turns those eight rows back into redirects.
- images, portfolio, development leftovers, the `/learn` namespace: 1 none, 2 none, 4 none, 1 gone. Unchanged — the v1 image wildcard stays a `none`, its files being republished at addresses that share no shape with `/learn/**/images/**`.

Nothing goes live. The site answers `robots: noindex` until robusta-landing-page lifts it and the redirects switch on with retire-robusta-v1, so the whole of the above ships dormant, on a domain the v1 site still serves.

## Requirements

The corpus

- R-MIGRATELEARN-01: The eleven articles of `apps/robusta/content/blog` are copied into `apps/robusta-build/content/articles`, and no file is removed from the v1 tree.
- R-MIGRATELEARN-02: A converted article's markdown body is byte-identical to its source; only frontmatter differs between the two files.
- R-MIGRATELEARN-03: `apps/robusta/content/blog` is frozen from the day of the copy: no article is edited there, and `retire-robusta-v1` deletes it rather than merging it back.
- R-MIGRATELEARN-04: An article claims one flat category, the last segment of the path v1 declared. Realizes the glossary's Category.
- R-MIGRATELEARN-05: An article's declared locale is the language the article is written in.
- R-MIGRATELEARN-06: The four articles forming the two translated pairs share a translation identifier within their pair, authored rather than derived from any slug, file name or date; the other seven carry none.
- R-MIGRATELEARN-07: Every other frontmatter key a source file carries is present with the same value in its copy.
- R-MIGRATELEARN-08: An article's slug after conversion is the one the v1 mapping was computed from, the locale corrections included.
- R-MIGRATELEARN-09: Every migrated article declares itself published. Realizes BR-PYRAMID-10.

The images

- R-MIGRATELEARN-21: Every image an article references travels with it and is served by the v2 site; an image no article references does not travel.
- R-MIGRATELEARN-22: An image reference keeps in the file the article-relative form it is authored in; the site resolves it during the build and rewrites no file.
- R-MIGRATELEARN-23: A reference resolving to a file the corpus does not hold, or to a path outside the corpus, is a violation naming the article and the reference, and fails the build before a page is generated.
- R-MIGRATELEARN-24: An image is addressed under an asset root of its own, outside every shape the URL scheme reserves for a page. Realizes BR-PYRAMID-1.
- R-MIGRATELEARN-25: No image is served by reading the content source at request time. Realizes BR-PYRAMID-7.
- R-MIGRATELEARN-26: A URL whose path is case-significant is not case-normalised, and the asset root is such a namespace.
- R-MIGRATELEARN-27: An image referenced by an article sits beside it in the corpus, and the corpus is the single tree an author edits.
- R-MIGRATELEARN-28: The asset directory is produced in full by the build and belongs to no other writer, so no file a previous build produced survives a rename or a deletion.
- R-MIGRATELEARN-29: The asset directory is generated rather than committed, and the build produces it from a clean checkout. Realizes BR-PYRAMID-5.

The landing page

- R-MIGRATELEARN-44: The landing page's notes section takes its posts from the site's published articles, and no default of the design system supplies its copy. Realizes BR-PYRAMID-8.
- R-MIGRATELEARN-45: That section is mounted on the home page the site serves today, and robusta-landing-page carries it across rather than building it.

R-MIGRATELEARN-41, 42 and 43 are retired: article rendering left this design on 2026-08-01 and they go with it. The numbers are not reused.

The mapping and the delivery

- R-MIGRATELEARN-61: An article row's source is the URL the v1 build generated for that article, which carries no locale segment whatever the article's locale.
- R-MIGRATELEARN-62: The mapping is regenerated from the real index and committed; no row mentions a fixture slug.
- R-MIGRATELEARN-63: No redirect from the v1 address space is live while the site answers not to index.
- R-MIGRATELEARN-81: The green set keeps building from a clean checkout, `@robusta/build` included, from this story's commit until `retire-robusta-v1`. Realizes BR-PYRAMID-5.
- R-MIGRATELEARN-82: A site's corpus is verified in that site's own workspace; the shared base holds no test reaching into an app, the freeze between the two corpora excepted.

## Acceptance Criteria

Cast: Nina is the publisher; Ada develops the site; Tux builds from a clean checkout; Barbot is a crawler.

- AC-MIGRATELEARN-01: Given the converted corpus, when Tux builds, then eleven published articles are indexed with no violation and no unpublished path, and their slugs are the eleven the v1 mapping was computed from. Realizes BR-PYRAMID-10.
- AC-MIGRATELEARN-02: Given each of the eleven pairs of files, when their markdown bodies are compared, then they are byte-identical, and given an article edited under `apps/robusta/content/blog` afterwards, then that comparison fails. Realizes R-MIGRATELEARN-02 and 03.
- AC-MIGRATELEARN-03: Given `javascript/typescript/completes-with.md`, when the site is built, then it claims `typescript`, is addressed at `/articles/c/typescript/completing-a-rxjs-observable-with-another`, and no violation is raised about the folder it sits in.
- AC-MIGRATELEARN-04: Given the converted corpus, when the index is read, then it splits into eight English and three French articles, and the slugs of the two corrected files are unchanged.
- AC-MIGRATELEARN-05: Given the converted corpus, when translation identifiers are read, then exactly four articles carry one, forming two pairs, each pair holding one English and one French article.
- AC-MIGRATELEARN-21: Given the built site, when Barbot requests `/article-images/blockchain/images/aave-small.png` and `/article-images/images/styled-logo.png`, the cover of `styled-components.md` in the corpus's shared folder, then both are served, and the 44 files the corpus references are all reachable the same way. Realizes R-MIGRATELEARN-21 and 22.
- AC-MIGRATELEARN-22: Given `quel-second-langage.md`, whose body references `./images/M87.jpg`, when Barbot requests that image, then it is served and never redirected to a lowercase path. Realizes R-MIGRATELEARN-26.
- AC-MIGRATELEARN-23: Given an article referencing an image the corpus does not hold, when Tux builds, then `yarn emit:redirects` fails naming the article's file and the reference, and no page and no asset have been produced. Realizes R-MIGRATELEARN-23.
- AC-MIGRATELEARN-24: Given the built site, when Barbot follows every image reference the corpus carries, then none answers 404 or 410.
- AC-MIGRATELEARN-25: Given the built site, when a request is served, then no file of `content/articles` is read. Realizes BR-PYRAMID-7.
- AC-MIGRATELEARN-26: Given a built site, when Ada renames an image in the corpus, fixes the reference and builds again, then the asset directory holds the new name and not the old one. Realizes R-MIGRATELEARN-28.
- AC-MIGRATELEARN-27: Given a clean checkout, when Tux builds the site, then the asset directory is created by the build, holds the 44 referenced files, and appears in no diff. Realizes R-MIGRATELEARN-29.
- AC-MIGRATELEARN-43: Given the home page the site serves, when Barbot requests `/`, then it carries a notes section listing the four newest published English articles, each linking to that article's v2 URL, and none of the design system's default posts and none of its default headings appears. Realizes BR-PYRAMID-8 and R-MIGRATELEARN-45.
- AC-MIGRATELEARN-61: Given the converted corpus, when the site is built, then the URL set holds 21 URLs — 2 blog homes, 8 category pages, 11 articles, no roll page — and the prerender manifest matches it exactly.
- AC-MIGRATELEARN-62: Given `/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere`, the address v1 generated for a French article, when Barbot requests it, then it is permanently redirected to `/l/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere` and never answers Gone; and no row of the mapping carries a `/learn/fr/` source that v1 never published. Realizes R-MIGRATELEARN-61.
- AC-MIGRATELEARN-63: Given the regenerated mapping, when Nina reads it, then it holds 82 rows — 66 permanent, 6 gone, 10 none — no row mentions a fixture slug, and each of the thirteen raw markdown URLs redirects or answers Gone as its article's presence in the index decides.
- AC-MIGRATELEARN-64: Given each of the fourteen tag URLs and each of the twenty-eight declared category rows, when Barbot requests them, then each reaches a 200 in exactly one hop, twelve category rows and three tag rows landing on a category page rather than on the blog home.
- AC-MIGRATELEARN-81: Given a clean checkout at this story's commit, when Tux runs the green set, then every workspace of it builds, `@robusta/build` producing its 42 pages from `content/blog`. Realizes BR-PYRAMID-5.
- AC-MIGRATELEARN-82: Given the deployed site, when Nina checks it, then it still answers not to index and no redirect from the v1 address space is live. Realizes R-MIGRATELEARN-63.
- AC-MIGRATELEARN-83: Given the repository at this story's commit, when Ada runs the tests of `@robusta/pyramids-content`, then no spec of that package reads a file of any app; and running the tests of `@robusta/robusta-build` verifies the site's corpus against the site's own declaration. Realizes R-MIGRATELEARN-82.

AC-MIGRATELEARN-41 and 42 are retired with the article page. The numbers are not reused.

## Dependencies

- Depends on: `content-source` — satisfied, `82c154f`. The reader, the schema and the corpus root ship; this story fills the directory and widens the corpus spec by the asset declaration.
- Depends on: `seo-url-scheme` — satisfied, `acfbc0a`. The route table, `urlSet` and `v1UrlMap` ship; this story corrects one internal rule of the mapping and one middleware matcher.
- Blocks: `article-page`, the story the arbitration of 2026-08-01 created. It renders the eleven articles this story publishes, resolves their covers and body images through `resolveAssetUrl`, turns a translation identifier into a link, and widens `ArticleEntry` with `author`.
- Blocks: `seo-excellence`, whose sitemap, canonicals, hreflang and internal linking all read a corpus that has to exist first, and whose assertions now have a vitest setup to live in.
- Blocks: `retire-robusta-v1`, which turns the redirects on, deletes `apps/robusta/content/blog` and takes `corpus-freeze.spec.ts` with it. The ordering obligation content-source placed on it is discharged: all eleven articles declare themselves published.
- Sequenced with: `robusta-landing-page`, which lifts the site-wide noindex and inherits the notes section this story mounts.

## Out of scope

- Rendering an article page — `article-page`, per the arbitration of 2026-08-01. With it go the prose typography of an article, the resolution of body image references, the category and translation links, and the `author` fallback.
- Rewriting or updating the prose of any article, however dated.
- The five articles existing only under `apps/robusta/public/learn`, and the 29 unreferenced images under `content/blog`. Their five raw markdown URLs keep answering 410.
- Anything under `apps/robusta/public/images`, per the epic's decision of 2026-07-29.
- The blog home and category pages' listings, which keep rendering `RoutePlaceholder` and gain articles when someone gives them copy.
- Sitemap, structured data, canonicals, hreflang and internal linking — seo-excellence.
- Retiring `apps/robusta`, deleting `content/blog` and turning the redirects on — retire-robusta-v1.
- The Search Console pass, which the decision of 2026-07-30 fixed as a verification against the shipped map and not an input to it.
