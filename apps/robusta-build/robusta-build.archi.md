# Architecture: robusta-build

**Last updated:** 2026-08-02

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/robusta-build` is the version 2 site of robusta.build. It was created by `bootstrap-robusta-build` as a deployable shell — it built, it deployed, it rendered the design system and carried nothing to read — and it has grown two layers since: the v2 URL scheme on 2026-07-31, and the migrated article corpus on 2026-08-01.

What it is today: a statically generated site of 25 pages, addressing eleven articles under the URL scheme `@robusta/pyramids-routing` defines, reading them at build time through `@robusta/pyramids-content`, publishing the images they reference under an asset root of its own, and mapping the whole v1 address space onto its own for the day the domain switches. The landing page carries one real section, the notes preview, fed by those articles.

What it deliberately still does not carry: page copy. The article routes render a route placeholder rather than an article — reading an article is `article-page` — and the home page is a wiring demonstration `robusta-landing-page` deletes. The site is `robots: noindex` site-wide until that story lifts the flag, and the v1 redirects stay dormant until `retire-robusta-v1` switches them on.

It supersedes `apps/robusta`, which the epic retires.

## Diagram

```
┌──────────────────────────── apps/robusta-build ─────────────────────────────┐
│                                                                             │
│  content/articles/**.md ── 11 articles · 2 locales · 6 categories           │
│      + **/images/*      ── the 44 files they reference                      │
│         │                                                                   │
│         │  src/content/corpus.ts ── CorpusSpec: root · localeFrom · assets  │
│         ▼                                                                   │
│  src/content/article-index.ts ── readCorpus, and the one place a corpus     │
│         │                        violation fails the build                  │
│         ▼                                                                   │
│  src/routing/content-urls.ts ── validateArticles + urlSet                   │
│         │                       the single derivation: 21 content URLs      │
│         ├──────────────────────────────┬────────────────────────────────┐   │
│         ▼                              ▼                                ▼   │
│  src/app/** ── 14 route files    src/routing/v1-url-map.ts     src/landing/ │
│  generateStaticParams, all       → v1-url-map.generated.json   NotesSection │
│  force-static, dynamicParams     82 rows: 66 permanent,        → notes-feed │
│  false                           6 gone, 10 none                            │
│         │                              │                                    │
│         │                              ├──► redirects() in next.config.ts   │
│         │                              └──► src/app/learn/[...path] → 410   │
│         ▼                                                                   │
│  src/middleware.ts ── lowercases a path carrying an uppercase letter,       │
│                       excluding /learn, /_next and /article-images          │
│                                                                             │
│  src/app/layout.tsx ─── next/font/google ──► --font-ibm-plex-sans           │
│         │                (3 faces, self-hosted)  --font-ibm-plex-mono       │
│         │                                        --font-caveat              │
│         │  CSS load order is a contract:                                    │
│         │    1. ./globals.css        (tailwind 4 + token bridge)            │
│         │    2. …/colors_and_type.css (tokens, unlayered)                   │
│         │    3. …/sketch.css          (.sk-* primitives)                    │
│         ▼                                                                   │
│  src/app/page.tsx ── placeholder + <NotesSection />                         │
│         │                                                                   │
│         └──► src/design-system/assets.ts ── the asset URL seam              │
│                     │                                                       │
└─────────────────────┼───────────────────────────────────────────────────────┘
                      ▼
        @robusta/pyramids-design-system   @robusta/pyramids-routing
          ./colors_and_type.css             l · c · p · t · buildUrl
          ./sketch.css · ./assets/*         parseUrl · urlSet
          components                      @robusta/pyramids-content
                                            readCorpus · copyCorpusAssets
```

## Key Components

- `src/seopyramids.config.ts` — the per-site source of truth: domain, site name and title, mission, logo, default and other locales, and `blogConfig`. The content section's four values are read from `src/routing/scheme.ts`, so the route table and the site configuration cannot state different ones.
- `src/routing/scheme.ts` — the site's one `UrlScheme` instance and `ROLL_SIZE`, the constant 12. `articles` is written here and nowhere else; a leaf module, because `next.config.ts` and the build scripts reach it without touching the site configuration and its bundler-only wordmark import.
- `src/routing/content-urls.ts` — the single derivation every route pregenerates from: `validateArticles` then `urlSet` over the article index, split by page kind and by locale scope. A corpus breaking the scheme fails the build here, naming the file.
- `src/routing/v1-url-map.ts` and `v1-url-map.generated.json` — the v1 address space mapped onto this one as a rule per class of v1 URL applied to the index. The generated file is committed so the mapping is reviewable in a diff: 82 rows, 66 permanent, 6 gone, 10 none.
- `src/content/corpus.ts` — where this site's articles live and where the files they reference are published, declared as data: root `content/articles`, locale from the frontmatter, asset root `public/article-images` served under `/article-images`. A leaf module for the same reason `scheme.ts` is one.
- `src/content/article-index.ts` — the seam the route table imports: `getArticleIndex` over `readCorpus`, and the one place a corpus violation becomes fatal. Called from `generateStaticParams`, from page bodies at build time and from `scripts/emit-redirects.mjs`, and from nothing else (BR-PYRAMID-7).
- `src/app/**` — fourteen route files, seven for the default locale and seven mirroring them under `l/[locale]`, every one `dynamic = 'force-static'` with `dynamicParams = false`. Plus `src/app/learn/[...path]/route.ts`, the 410 handler of the retired v1 namespace, which reads nothing.
- `src/components/RoutePlaceholder.tsx` — what the content routes render until the stories that own their copy arrive. An article page shows its kind, its URL and its params.
- `src/middleware.ts` — the only middleware the site carries: case normalisation, the one non-canonical family Next does not answer for free.
- `src/landing/NotesSection.tsx` and `src/landing/notes-feed.ts` — the design system's `NotesPreview` fed by the four newest published articles of the locale, with every string it renders supplied by the site (BR-PYRAMID-8). It sits outside `src/content` because `tsconfig.routing.json` compiles that directory whole and nothing it compiles may reach the design system.
- `src/app/layout.tsx` — loads the three stylesheets in their contractual order, self-hosts the three brand faces through `next/font/google`, and declares `robots: { index: false, follow: false }` at the root.
- `src/app/globals.css` — the Tailwind 4 entry plus the token bridge: shadcn's expected names aliased onto design-system tokens, every entry an alias and none a literal.
- `src/design-system/assets.ts` — the single seam that normalises what the bundler returns for an imported asset. Next hands back a `StaticImageData`, other pipelines hand back a string.
- `src/app/page.tsx` — the wiring placeholder `robusta-landing-page` deletes, carrying one real section: `<NotesSection />`, which survives the page being rebuilt around it.
- `scripts/` — three build scripts: `emit-redirects.mjs` writes the generated JSON `next.config.ts` reads, `copy-article-images.mjs` mirrors the referenced images into the asset root, and `check-route-table.mjs` compares the prerender manifest with the derivation after `next build`.

## Data Flow — from the corpus to the built site

```
yarn build  (apps/robusta-build)
   │
   ├─ emit:redirects ── tsc -p tsconfig.routing.json → .routing-dist/
   │                    then emit-redirects.mjs → v1-url-map.generated.json
   │                    the earliest failure: a corpus violation stops here
   │
   ├─ copy:assets ───── copyCorpusAssets → public/article-images/**
   │                    44 files, the directory removed and rewritten in full
   │
   ├─ next build ────── generateStaticParams ← content-urls.ts ← the index
   │                    redirects() ← the generated JSON
   │                    25 static pages, 23 HTML files
   │
   └─ check-route-table.mjs ── prerender manifest ≡ the 21 content URLs
```

The 23 HTML files are the 21 content URLs — 2 blog homes, 8 category pages, 11 articles — plus the landing page and `/_not-found`. No roll page is produced in either locale: 8 English articles and 3 French against a roll size of 12.

## Data Flow — a rendered page

```
seopyramids.config.ts ──► layout metadata (title, description, robots)
                     │
next/font (3 faces) ──┼──► --font-* custom properties on <html>
                     │              │
design system CSS ───┴──────────────┴──► :root tokens resolve
                                              │
article index (build time only) ──────────────┤
                                              ▼
                                    server components render
                                              │
                                              ▼
                                   static generation (25 pages)
```

No client boundary: no design-system component carries `'use client'`, so the whole page stays a server component and prerenders — the notes section included, which is why reading the index costs no request (BR-PYRAMID-7).

## Dependencies

- Depends on: `@robusta/pyramids-design-system`, `@robusta/pyramids-routing` and `@robusta/pyramids-content` (all `workspace:*`) — the three workspace dependencies. Next 15.5.3, React 19.1.1, Tailwind 4.
- Deliberately not depended on: `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`, which render DaisyUI classes and are deprecated by the shadcn decision. And `packages/scribe-intel`, because BR-PYRAMID-2 forbids the v2 base from tracking visitor intents.
- Used by: nothing. It is a deployable site.
- Tests: vitest, `yarn workspace @robusta/robusta-build run test` — 28 tests in `src/content`, the corpus specs living in the app rather than in the base package.

## Notes / Gotchas

- `experimental.extensionAlias` in `next.config.ts` is what makes the repository's `.js`-suffixed local imports resolve under webpack. `moduleResolution: "Bundler"` makes them pass `tsc`, which is not the same thing — without the alias the build fails at compile with `Module not found: Can't resolve '../seopyramids.config.js'`. `apps/dakar` carries the same declaration.
- `next.config.ts` reads generated JSON rather than importing the routing modules, because it cannot import them: Next loads it outside webpack, and the chain would die either on a `.js`-suffixed local import or on the design system's bundler-only PNG. That is what `emit:redirects` exists for.
- The asset root is generated, never committed: `public/article-images/` is in `.gitignore` next to `.routing-dist/`, and `copy:assets` removes it and rewrites it in full on every run, so no renamed or deleted image survives as a stale public file. It runs before `next build`, which collects `public/` when it starts — the ordering is not a preference. It is not a watcher either: an image added during a `next dev` session reaches the site on the next `yarn copy:assets`.
- The middleware matcher excludes `/article-images` for the same reason it excludes `/_next`: a filesystem is case-significant, and the asset root republishes the corpus's own file names — `theory/images/M87.jpg` is the one carrying an uppercase letter. A case-normalising rule must exclude every namespace whose paths are case-significant.
- The image URL is derived from the file's place in the corpus, not from the page's place in the URL scheme, so an article can change category without moving a single image. v1 did the opposite with a hand-kept `public/learn/**` mirror, and that mirror had already drifted by eight files.
- `src/content/corpus-freeze.spec.ts` reaches into `apps/robusta`, which no other file here does. It holds the eleven markdown bodies byte for byte across the two trees and is the only thing enforcing the freeze; frontmatter is excluded, so a v1 frontmatter edit turns nothing red. It dies with the v1 tree, in `retire-robusta-v1`.
- The stylesheet order is load-bearing. Tailwind 4 emits its preflight inside `@layer base`; the design system's element rules are unlayered and therefore win. Reordering the three imports silently changes what renders.
- Do not link `@robusta/pyramids-design-system/fonts.css` here. It is the opt-in Google Fonts path for consumers with no build step — the package's own `preview/*.html` pages. Loading it alongside `next/font` fetches every face twice and reintroduces the third-party request this site removed.
- `BrandLogo` ships a hardcoded `/_next/static/media/…` default for its wordmark, which is wrong for every consumer. Always pass `wordmarkSrc` explicitly.
- `NotesPreview` ships four `DEFAULT_POSTS` and default headings. They are page copy in a design system and must reach no served page (BR-PYRAMID-8), so `NotesSection` supplies every string, its own included.
- The token bridge has no `--destructive`: the design system ships no error colour. A shadcn component using `bg-destructive` will render with an unresolved variable, which is deliberate and loud. The fix belongs to the design system, not to this site.
