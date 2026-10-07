# Design: The v2 site on TanStack Start, served as files from Netlify

**Last update:** 2026-10-06
**Feature:** tanstack-start-migration
**Infix:** TANSTACK
**Status:** IMPLEMENTED (2026-10-07, commit 7caa131)
**Sources:** [story](tanstack-start-migration.story.md), [brainstorm](tanstack-start-migration.brainstorm.md), [epic](../pyramid-v2.epic.md), [article-page design](../article-page/article-page.design.md), [seo-url-scheme design](../seo-url-scheme/seo-url-scheme.design.md)

## Goal

`apps/robusta-build` leaves Next.js for TanStack Start on Vite 8. `vite build` prerenders `/`, every URL of `urlSet` and a not-found document into `dist/client`, and Netlify publishes that directory and nothing else: no function, no redirect rule, no code on a served request. A hydrated page navigates client-side by fetching data files two static server functions wrote at build, so the content source stays a build-time input (BR-PYRAMID-7). The why, the settled decisions and the scope are in the [story](tanstack-start-migration.story.md).

## Ubiquitous Language

Terms used as `ubiquitous-language.md` defines them: Site, Site configuration, Article, Published article, Category, Slug, Locale, Translation identifier, Content source, Content root, Asset root, Discriminant, Canonical URL, Page copy, Design token, Build chain, Clean checkout, Green set.

Canonical URL is used for the form the scheme produces and nothing more. Its glossary entry still says every other form redirects to it permanently; the story routes that correction to epicman through its Documentation updates.

Prerender, data file, not-found document and branch deploy are technical terms of the framework and the host, not domain terms, and are used in that sense only.

## Business Rules (cited)

- BR-PYRAMID-1 — The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source.
- BR-PYRAMID-2 — A site built on the version 2 base must not track visitor intents.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-6 — A site's design tokens must come from its design system alone.
- BR-PYRAMID-7 — A site must not read its content source while serving a request.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.
- BR-PYRAMID-11 — robusta.build must have no locale other than French.

BR-PYRAMID-11 is not satisfied by the corpus this story ships on (8 English, 3 French, `en` by default); items 3 and 4 of the epic's À faire bring the site into line after this story. Nothing here hard-codes a locale: the document language and every default come from `urlScheme`, so the switch to `fr` needs no change to what this design builds. OQ-TANSTACK-12 covers the two AC that exercise English pages.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Packages of app `@robusta/robusta-build`. No loop.

                    package `routes` [new]
       ┌────────────┬────────┴─────┬──────────────────┐
       │ library    │ library      │ library          │ library
       ↓            ↓              ↓                  ↓
  package       package       package            package
  `article`     `landing`     `components`       `page-data` [new]
  [modified]    [modified]    [modified]          │         │
       │                           ↑              │ library │ library
       └──────────library──────────┘              ↓         ↓
                                              package    package
                                              `content`  `routing`

  `content` and `routing` are the site's packages under `src/`, unchanged.
  `routes` and `landing` also read `routing`: arrows omitted.
```

Unchanged and not listed: the library APIs of `@robusta/pyramids-routing`, `@robusta/pyramids-content` and `@robusta/pyramids-design-system`; packages `content` (`article-index`, `article-lookup`, `corpus`) and `routing` (`scheme`, `content-urls`, `v1-url-map`) of the site; `ArticleProse` and its CSS Module; `RoutePlaceholder`; `seopyramids.config.ts`; the token bridge; `scripts/copy-article-images.mjs`; the root scripts `yarn build:robusta` and `yarn dev:robusta`.

Deleted: `src/app/**`, `src/middleware.ts`, `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`.

### HTTP API of app `@robusta/robusta-build` — modified

Client code: browsers and crawlers. Netlify serves the files of `apps/robusta-build/dist/client` and runs nothing; no `/_serverFn/*` path exists on the deploy.

- `GET /` and every URL of `urlSet` — 200, the prerendered `<path>.html` (`index.html` for `/`), `noindex`, `<html lang>` of the page's locale
- `GET /__tsr/staticServerFnCache/{sha1}.json` · new — 200, one data file per article page and one for the notes feed, fetched by a hydrated page on client navigation
- `GET /assets/{hashed file}` · new — 200, scripts, stylesheets, the three faces, the wordmark · was `/_next/static/…`
- `GET /article-images/{path}` — 200, the file, case-significant
- `GET` a v1 address — one of the 66 permanent rows, one of the 6 Gone rows, any other `/learn` path — 404, `404.html` · was 308 or 410
- `GET` an explicit page one or a marked default locale — 404, `404.html` · was 308
- `GET` a page URL with a trailing slash — 301 to the canonical form, from the host · was 308
- `GET` a page URL carrying an uppercase letter — 301 to its lowercase form when that file exists, 404 otherwise, from the host · was 308
- `GET` a page's canonical path plus `.html` — 200, the same document, from the host
- any other `GET` — 404, `404.html`, which loads no client script

### library API of package `page-data` in app `@robusta/robusta-build` — new

Client code: package `routes`, from route loaders. The entry `src/page-data/index.ts` exports the two functions and the types, and nothing that reads: an export that called a seam outside a handler would keep `src/content` alive in the client bundle.

Types:

```ts
type ArticleKey = {
  locale: string;
  slug: string;
};

type ArticlePage = {
  article: ArticleIndexEntry; // title, author, date, tags, locale, category
  html: string; // the body, every reference resolved
  coverUrl?: string; // absent when the article declares no cover
  translation?: TranslationLink; // absent when no published pair exists
  // … categoryUrl, writtenDate
};

type TranslationLink = {
  url: string;
  locale: string;
  label: string; // the language naming itself, computed at build
};

type NotesFeedRequest = {
  locale: string;
  limit: number;
};
```

`NotePost` is the design system's type, cited and not redeclared.

Interfaces:

```ts
interface PageData {
  /** At build, throws naming the key when no article matches. On the deploy,
   *  rejects when the build wrote no file for that key. */
  getArticlePage(call: { data: ArticleKey }): Promise<ArticlePage>;
  /** The newest published articles of one locale, newest first. */
  getNotesFeed(call: { data: NotesFeedRequest }): Promise<NotePost[]>;
}
```

Both are `createServerFn({ method: 'GET' })` with a validator on their input and `staticFunctionMiddleware` as their last middleware. Their handlers call the site's seams — `findArticle`, `getArticleBody`, `getAssetUrl`, `findTranslation`, `notesFeed` — and nothing else reaches `src/content`. `notesFeed` moves here from package `landing`, unchanged in what it selects.

Rules:

- A handler runs at prerender only, and each distinct input leaves one file in the client output. The deploy runs neither function: in a production browser the middleware replaces the call by a fetch of that file.
- Every string whose text depends on the runtime's Intl data is in the payload, computed at build: `writtenDate` and `translation.label`. Node's ICU and a browser's may not agree, and hydration must render the markup the prerender wrote.
- Under the fallback of R-TANSTACK-66 the two signatures stay, implemented on JSON modules a build script writes; no route and no component changes.

Client code, in package `routes`:

```ts
import { getArticlePage } from '@/page-data/index.js';

export const Route = createFileRoute('/l/$locale/articles/c/$category/$slug')({
  loader: ({ params }) =>
    getArticlePage({ data: { locale: params.locale, slug: params.slug } }),
  component: LocalisedCategorisedArticlePage,
});
```

### library API of package `routes` in app `@robusta/robusta-build` — new

Client code: TanStack Start, which mounts the route tree the generator writes to `src/routeTree.gen.ts`, through `getRouter()` in `src/router.tsx`. File names are the generator's convention; the paths are the contract.

- root route `__root.tsx` · new — renders the document. `<html lang>` reads `useParams({ strict: false }).locale`, falling back to `urlScheme.defaultLocale`, at prerender and after every client navigation. Its `head` carries the site title and mission from `getSeoPyramidsConfig()`, `robots` `noindex, nofollow`, and four stylesheet links in this order: `src/styles/fonts.css`, `src/styles/globals.css`, `@robusta/pyramids-design-system/colors_and_type.css`, `@robusta/pyramids-design-system/sketch.css`. It renders `<HeadContent />`, and `<Scripts />` on every document except the not-found one.
- `/` · new — loader `getNotesFeed({ data: { locale: urlScheme.defaultLocale, limit: 4 } })`; renders the placeholder home and `NotesSection`.
- `/404` · new — renders `NotFoundPage`; prerendered to `404.html`.
- four article routes · new — `/articles/$slug`, `/articles/c/$category/$slug` and their `/l/$locale` mirrors. Loader `getArticlePage`, the locale from the param or `urlScheme.defaultLocale`; component `ArticleView`.
- eight listing routes and the locale landing · new — `/articles`, `/articles/p/$n`, `/articles/c/$category`, `/articles/c/$category/p/$n`, their `/l/$locale` mirrors, and `/l/$locale`. No loader; `RoutePlaceholder` from the params and `buildUrl`.
- `getRouter()` · new — the generated tree, `NotFoundPage` as `defaultNotFoundComponent`, and a `defaultErrorComponent` that turns a failed client navigation into one full load of the target address (R-TANSTACK-84).

No route module imports `src/content`, `src/routing/content-urls.ts` or `@robusta/pyramids-content`.

### library API of package `article` in app `@robusta/robusta-build` — modified

Client code: the four article routes.

```ts
interface ArticleViewProps {
  page: ArticlePage;
}

function ArticleView({ page }: ArticleViewProps): ReactElement;
```

Synchronous, and reads nothing: it imports nothing from `content`, `routing` or `@robusta/pyramids-routing`, every URL arriving in the payload. Markup as today, `lang` on `<article>` included. The cover is a plain `<img src={coverUrl} alt="">`, loaded eagerly, filling the 16:9 box it has today; no box renders without a `coverUrl`. Both links go through `SiteLink`. `next/image` and `next/link` leave the file.

### library API of package `landing` in app `@robusta/robusta-build` — modified

Client code: the `/` route.

```ts
interface NotesSectionProps {
  posts: NotePost[];
  /** the blog home "all articles" targets; the default locale when absent */
  locale?: string;
}
```

`NotesSection` becomes synchronous and renders the posts it receives. `notesFeed` leaves for package `page-data`.

### library API of package `components` in app `@robusta/robusta-build` — modified

Client code: packages `routes` and `article`.

```ts
interface SiteLinkProps {
  href: string; // a URL buildUrl produced
  hrefLang?: string;
  lang?: string;
  children: ReactNode;
}
```

- `SiteLink` · new — the one place a built URL becomes a router link. The router's `Link` types `to` against the route tree; the site's URLs come from `buildUrl`, the single builder of the scheme (BR-PYRAMID-1), so the seam takes the string and no route path is composed anywhere else.
- `NotFoundPage` · new, no props — the site's own not-found copy (BR-PYRAMID-8) and a plain anchor to `/`. It is rendered on a document that loads no script, so it holds no router state.

### CLI API of app `@robusta/robusta-build` — modified

Client code: the root scripts, unchanged, and Netlify's build.

- `build` — in order: `check:source`, `compile:seams`, `emit:v1-map`, `copy:assets`, `vite build` with prerender, then `scripts/check-route-table.mjs`. Exit 1 on: a directive or an unsuffixed import (R-TANSTACK-11), a corpus or scheme violation, route files diverging from the content root (R-TANSTACK-23), an import-protection violation, any prerendered page answering other than 2xx, a route-table difference, a data-file count difference.
- `dev` — `compile:seams`, `emit:v1-map`, `copy:assets`, `vite dev`. On the dev server the two functions run per call and read the corpus; that is development, not a served request.
- `test` — `vitest run`, the 38 specs, unchanged.
- `lint` · modified — eslint over `src` under an app-level configuration with no `next` preset · was `next lint`.
- `compile:seams` · new — `tsc -p tsconfig.routing.json` into `.routing-dist`, the compile `emit:redirects` used to carry.
- `emit:v1-map` · renamed from `emit:redirects` — `scripts/emit-v1-map.mjs` writes `src/routing/v1-url-map.generated.json`, committed and reviewable (R-URLSCHEME-14); nothing in the build reads it.
- `check:source` · new — `scripts/check-source.mjs`, exit 1 listing file and line of each offence.
- `start` · removed. `vite preview` is not a script either: it serves through the Start server, which the deploy does not run.

`scripts/check-route-table.mjs` · modified — reads `dist/client/**/*.html` instead of Next's prerender manifest, `index.html` and `404.html` excepted, and counts the files of `dist/client/__tsr/staticServerFnCache`. Stdout on success, one line: the content URLs built and the data files written. Exit 1 listing each URL built but not derived, derived but not built, and the expected and actual data-file counts.

`scripts/prerender-pages.mjs` · new, library API, client code `vite.config.ts` and `scripts/check-route-table.mjs`:

```ts
/** `/`, `/404`, then every URL contentUrls derives, built with buildUrl.
 *  Throws naming the content root and the missing route files when the
 *  route tree and urlScheme.contentRoot diverge (R-URLSCHEME-30). */
function prerenderPages(): Promise<{ path: string }[]>;
```

It reads the compiled seams under `.routing-dist`, as the other scripts do.

### Build configuration of app `@robusta/robusta-build` — new

`vite.config.ts`, read by Vite. Plugins `tanstackStart`, `viteReact`, `tailwindcss`, with `resolve.tsconfigPaths: true` for `@/*`. `build.outDir` is not overridden, so the client output is `dist/client`. Options of `tanstackStart`:

- `prerender` — `enabled: true`, `autoStaticPathsDiscovery: false`, `crawlLinks: false`, `autoSubfolderIndex: false`, `failOnError: true`
- `pages` — `await prerenderPages()`
- `router` — `addExtensions: 'js'`
- `importProtection.client` — `specifiers` `@robusta/pyramids-content`, `gray-matter`, `remark`; `files` `**/src/content/**`

### Netlify configuration of app `@robusta/robusta-build` — new

`apps/robusta-build/netlify.toml`, read by Netlify's build from the package directory. Paths are relative to the base directory, the repository root.

- `[build] command` — prints `node --version`, `yarn --version` and `yarn config get yarnPath`, then runs `yarn build:robusta`
- `[build] publish` — `apps/robusta-build/dist/client`
- `[build] ignore` — `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF --` over `apps/robusta-build`, `packages/pyramids-routing`, `packages/pyramids-content`, `packages/robusta-design-system`, `package.json`, `yarn.lock`, `.yarnrc.yml`, `.nvmrc`. Exit 0 skips the build; a change exits 1 and an unknown ref 128, and both build.
- `[build.environment] YARN_FLAGS` — `--immutable`
- nothing else: no `[functions]`, `[[redirects]]`, `[[headers]]` or `[[plugins]]`, no `NODE_VERSION`, no corepack variable

Site settings, made in the Netlify UI (Dep 2): package directory `apps/robusta-build`, base directory unset, production branch `main`, branch deploys for `epic/robusta-v2`, Pretty URLs on, no build variable.

## Technical Constraints

TanStack Start, verified on 2026-10-06 against the published sources of `@tanstack/start-plugin-core` 1.171.49, `@tanstack/start-static-server-functions` 1.167.39 and `@tanstack/react-router` 1.170.41, and the docs in [TanStack/router](https://github.com/TanStack/router/tree/main/docs/start/framework/react/guide).

- Versions: `@tanstack/react-start` 1.168.60 peers `vite >=7` and requires Node `>=22.12.0`; the static-functions package peers `@tanstack/react-start ^1.168.60` and is marked experimental. The family releases several times a week, hence exact versions moved together.
- Prerender (`prerender.ts`): a non-empty `pages` list replaces the default `[{ path: '/' }]`, so `/` is prerendered only because it is listed. Each page is requested with a trailing slash, redirects are followed up to `maxRedirects`, and any non-2xx answer throws; `failOnError` defaults to true and `retryCount` to 0. With `autoSubfolderIndex: false`, `/articles/c/web` is written as `articles/c/web.html` and `/` as `index.html`. An unmatched path answers 404 and fails the build, which is why the not-found document is a real `/404` route.
- [Static server functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions): during prerender, with `NODE_ENV` production and `TSS_CLIENT_OUTPUT_DIR` set by the plugin, the server branch writes `{clientOutputDir}/__tsr/staticServerFnCache/{sha1(functionId + '__' + input JSON with sorted keys)}.json`. In a production browser the client branch fetches that path and parses it as JSON without checking the status: a file the build did not write gets Netlify's `404.html`, the parse throws, the loader rejects. The function id is SHA-256 of the module path and the export name, stable from one build to the next while both stay. The first load reads the loader data embedded in the prerendered HTML and fetches nothing.
- [Import protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection) is experimental, on by default, `error` at build. The Start compiler replaces a handler by an RPC stub in the client build and prunes the imports only the handler used, which is what lets `page-data` import the seams at top level.
- Not-found hydration: a fully prerendered site hydrated its 404 document into an empty page ([TanStack/router#5427](https://github.com/TanStack/router/issues/5427)), closed on 2026-08-04 by the loader rewrite of PR #7805, which documents no option for it. The design does not depend on that fix: the not-found document loads no client entry, and what the host sent is what the reader sees.
- A stale route chunk: `lazyRouteComponent` reloads the document once when a dynamic import fails with a module-not-found error, guarded by `sessionStorage`. A missing data file has no such handling, hence the router's default error component of R-TANSTACK-84.
- `useParams({ strict: false })` reads the params of every matched route from any component, the root included ([path params](https://tanstack.com/router/latest/docs/framework/react/guide/path-params)).
- The route generator's `addExtensions` accepts an extension string; `'js'` keeps the generated imports in line with the repository's rule.

Toolchain.

- npm on 2026-10-06: `@vitejs/plugin-react` 6.1.2 peers `vite ^8`; `vite` 8.3.3; `vitest` 5.0.3 peers `vite ^6.4 || ^7 || ^8` and needs Node `^22.12`; `@tailwindcss/vite` 4.3.3 peers `vite ^5.2 || ^6 || ^7 || ^8`; Fontsource 5.3.0.
- The root hoists `vite` 6.4.3 and `vitest` 3.0.6 for `apps/robusta` and five workspaces, and `services/scribe-intel-collector` already nests `vite` 5. The site's `vite` 8 lands under `apps/robusta-build/node_modules`. Yarn's node-modules linker keeps a declared peer bound to the dependent's copy, and `@tanstack/react-start`, `@tanstack/start-plugin-core` and `@tanstack/router-plugin` declare `vite` as an optional peer, so each resolves the site's. The defect class unblock-build fixed is an undeclared import, and only an enumeration after a clean install proves its absence. `packageExtensions` is the lever because it adds the missing peer to one package; a root `resolutions` would force one `vite` major on every workspace and break `apps/robusta`.
- Node 22.12 or later: `.nvmrc` reads `22`, which Netlify resolves to the latest 22.x; a local Node below 22.12 fails TanStack Start's engine check. The root `engines.node: "22.x"` admits it, and yarn 4 enforces no engines.
- Vite resolves a `.js` import from a TypeScript file to its `.ts` or `.tsx` source, so `extensionAlias` has no successor. `resolve.tsconfigPaths` is built into Vite 8.
- `next.config.ts` read the v1 map as JSON because Next's config loader could not follow the `.js`-suffixed imports. That reason dies with it; `.routing-dist` stays because the plain-Node scripts and `prerender-pages.mjs` need the seams compiled.
- `public/article-images` is filled by `copy:assets` before `vite build`, which copies `public/` into `dist/client`. The prerender runs in the build process with the app directory as working directory, which is what `corpus.root` resolves against.
- Fonts: IBM Plex Sans and Caveat come from the variable files of `@fontsource-variable/*`, the files Google served `next/font`, the static cuts of `@fontsource/*` drawing weight 600 differently; the site's `src/styles/fonts.css` declares one `@font-face` per weight over each variable file, as `next/font` did. IBM Plex Mono keeps `@fontsource/ibm-plex-mono`'s `latin-<weight>.css`. All three are declared as `'IBM Plex Sans'`, `'IBM Plex Mono'` and `'Caveat'` with `font-display: swap`, and Vite bundles the woff2 files into `dist/client/assets`. `colors_and_type.css` falls back to exactly those names when `--font-ibm-plex-sans`, `--font-ibm-plex-mono` and `--font-caveat` are unset, the case its header documents. `next/font`'s size-adjusted fallback face is lost, so the text shifts once while the faces load; AC-TANSTACK-3 compares after they have.
- The cover loses WebP, as the decision of 2026-10-06 accepts. The `<img>` keeps its box's ratio, so the page does not shift when the cover arrives.

Netlify, verified on 2026-10-06 against [manage dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies.md), [monorepos](https://docs.netlify.com/build/configure-builds/monorepos.md), [ignore builds](https://docs.netlify.com/build/configure-builds/ignore-builds.md), [redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options.md), the [yarn berry install command](https://github.com/yarnpkg/berry/blob/master/packages/plugin-essentials/sources/commands/install.ts), and requests to [trailing-slash-guide-pretty-url-enabled.netlify.app](https://trailing-slash-guide-pretty-url-enabled.netlify.app).

- Monorepo: with a package directory and no base, Netlify installs and builds at the repository root, reads `.nvmrc` there, finds `netlify.toml` in the package directory, and reads `publish` relative to the root.
- Yarn: the build image runs `corepack enable` itself, so corepack's shim reads `packageManager` and fetches yarn 4.17.1 into Netlify's cache directory, outside the repository; that is not the Vercel failure, where the cache sat inside the repository under the root `"type": "module"`. Yarn 4 then hands over to the `yarnPath` binary. Netlify documents `--ignore-optional` as the default of `YARN_FLAGS`, which yarn 4 rejects as an unknown option; `--immutable` replaces it and is what a CI install should assert anyway. The `--cache-folder` Netlify adds is accepted: yarn 4 downgrades it to a warning when `CI.NETLIFY` is set. Netlify requires `nodeLinker: node-modules`, which `.yarnrc.yml` sets.
- Static answers, with Pretty URLs on: `/x` serves `x.html` with 200; `/x/` answers 301 to `/x`, also when a directory `x/` sits beside `x.html`, which is the case of every category page and of `/articles`; `/x.html` answers 200; an uppercase path answers 301 to its lowercase form when that file exists and 404 when it does not; a `404.html` at the publish root answers every unmatched path with status 404. With Pretty URLs off, `/x/` would answer 200, so they stay on. The lowercase redirect cannot be switched off for static files ([forum](https://answers.netlify.com/t/89469)); an exact-case file such as `M87.jpg` is matched before any lowercasing is tried, which R-TANSTACK-104 confirms on the deploy.
- With `autoSubfolderIndex: false` the only layout left is `.html` files, so every page also answers at its path plus `.html`. A redirect rule cannot remove it, the story ships none, and the site is `noindex` until seo-excellence declares canonical tags.
- Ignore rule: it runs from the base directory, with Bash. Rebuilding the same commit gives two equal refs and is skipped; a build hook is never skipped.
- Credits on Free: a production deploy costs 15 of 300 a month, a branch deploy none, and a spent balance pauses every site of the team.

## Requirements

### Toolchain

- R-TANSTACK-01: The site builds with Vite 8 and TanStack Start, and its own manifest declares `vite`, `@vitejs/plugin-react`, `@tanstack/react-start`, `@tanstack/start-static-server-functions`, `@tailwindcss/vite`, `vitest`, `@fontsource-variable/ibm-plex-sans`, `@fontsource/ibm-plex-mono` and `@fontsource-variable/caveat`.
- R-TANSTACK-02: `next`, `@tailwindcss/postcss` and `vite-tsconfig-paths` leave the site's manifest; `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`, and the `next` plugin and `.next/types` entries of `tsconfig.json` leave the site.
- R-TANSTACK-03: The TanStack packages are declared at exact versions and are upgraded together.
- R-TANSTACK-04: After a clean install, every resolution of `vite` from the site's build and test graph lands on the site's 8.x copy, while `apps/robusta` and the packages keep the hoisted 6.4.3; a package importing `vite` without declaring it gets the peer through `packageExtensions`, never through a root `resolutions` (BR-PYRAMID-5).
- R-TANSTACK-05: The green set completes from a clean checkout, `apps/dakar` at 23/23 and `apps/robusta` at 42/42 pages as before.
- R-TANSTACK-06: Local imports keep their `.js` suffix and Vite resolves them; the generated route tree carries `.js` suffixes; `@/*` resolves through Vite's `resolve.tsconfigPaths`.
- R-TANSTACK-07: Tailwind 4 runs through `@tailwindcss/vite`, and `globals.css` moves to `src/styles/globals.css` with its token bridge unchanged (BR-PYRAMID-6).
- R-TANSTACK-08: The site's 38 specs run unchanged under the site's own vitest.
- R-TANSTACK-09: `emit:redirects` becomes `emit:v1-map`, writing the same committed JSON; `v1-url-map.ts` and the specs reading it stay, and nothing in the build reads the JSON.
- R-TANSTACK-10: `lint` runs eslint over `src` with no `next` preset, and `start` is removed.
- R-TANSTACK-11: `build` fails on a `'use client'`, a `'use server'` or a relative import without its `.js` suffix anywhere in `src`, the generated route tree excepted.

### Prerender

- R-TANSTACK-21: Prerender runs with `autoStaticPathsDiscovery`, `crawlLinks` and `autoSubfolderIndex` off and `failOnError` on, on the page list `/`, `/404` and every URL of `urlSet` as `contentUrls` derives it, and on no other page.
- R-TANSTACK-22: Every page is written under `dist/client` as its canonical path plus `.html`, `/` as `index.html` and `/404` as `404.html`.
- R-TANSTACK-23: The build fails before Vite starts, naming the content root and the missing route files, when the route tree and `urlScheme.contentRoot` diverge (R-URLSCHEME-30).
- R-TANSTACK-24: The route-table check compares the written `.html` files, `index.html` and `404.html` excepted, with the derived URL set, and fails the build on any difference (AC-URLSCHEME-42).
- R-TANSTACK-25: The route-table check fails the build when the number of data files differs from the number of article URLs plus one.
- R-TANSTACK-26: An article added to the corpus gets its page, its data file and its place in the route-table check from the same derivation, with no code change.

### Document and routes

- R-TANSTACK-41: The route tree holds the root route, `/`, `/404`, the twelve content routes and the locale landing, at the paths of today's route files; `src/app`, `src/middleware.ts` and the `/learn` handler are deleted, not ported.
- R-TANSTACK-42: The root route sets `<html lang>` from the `locale` param of the matched route, and from `urlScheme.defaultLocale` when the route has none, at prerender and after every client navigation; no locale is written as a literal (BR-PYRAMID-11).
- R-TANSTACK-43: Every document's head carries the title and the mission of the site configuration and `robots` `noindex, nofollow`, the not-found document included.
- R-TANSTACK-44: The root head links the font stylesheet, then `globals.css`, `colors_and_type.css` and `sketch.css` in that order.
- R-TANSTACK-45: IBM Plex Sans 300 to 700, IBM Plex Mono 400 to 600 and Caveat 600 and 700 come from Fontsource's latin files, served by the deploy with `font-display: swap`; the site sets no `--font-*` property, and a page issues no third-party request (BR-PYRAMID-6).
- R-TANSTACK-46: No route reads content: an article route's loader calls `getArticlePage`, the `/` loader calls `getNotesFeed`, and every other route renders from its params.
- R-TANSTACK-47: A link between two pages of the site goes through `SiteLink` with a URL `buildUrl` produced, and no route path is composed elsewhere (BR-PYRAMID-1). The links `NotesPreview` renders in the notes section of the placeholder home are the one exception: the design-system surface renders its own `<a>` from a `buildUrl` URL, so they load their target in full; robusta-landing-page, which rebuilds the home, owns them.
- R-TANSTACK-48: `ArticleView` renders an `ArticlePage` in today's markup; the cover is a plain `<img>` with an empty `alt`, loaded eagerly in the 16:9 box, and an article declaring no cover renders no box.
- R-TANSTACK-49: The site wires no telemetry client (BR-PYRAMID-2) and imports nothing from `next`.
- R-TANSTACK-50: `src/design-system/assets.ts` keeps `wordmarkSrc: string` and drops its `StaticImageData` branch.

### Page data

- R-TANSTACK-61: `getArticlePage` and `getNotesFeed` are server functions whose last middleware is `staticFunctionMiddleware`, and they are the only path from a route to `src/content` and `@robusta/pyramids-content`.
- R-TANSTACK-62: Both run at prerender only and leave one data file per distinct input in the client output; the deploy runs neither, and a hydrated page reaches their results as files (BR-PYRAMID-7).
- R-TANSTACK-63: Every string whose text depends on Intl data is computed into the payload at build.
- R-TANSTACK-64: Import protection denies `@robusta/pyramids-content`, `gray-matter`, `remark` and the files of `src/content` in the client environment, and the build fails on a violation.
- R-TANSTACK-65: `notesFeed` moves from package `landing` to package `page-data`, unchanged in what it selects, and `NotesSection` renders the posts it receives.
- R-TANSTACK-66: If the static functions fail the English-to-French walk of R-TANSTACK-104 on the deploy, `page-data` keeps both signatures and switches to JSON modules a build script writes from the same seams before `vite build`, git-ignored and loaded lazily through `import.meta.glob`; a missing key rejects as a missing data file does. No route and no component changes.

### Not-found and failure

- R-TANSTACK-81: The `/404` route renders `NotFoundPage`, and Netlify serves its `404.html` with status 404 for any path matching no file.
- R-TANSTACK-82: The not-found document runs no client entry: the root route omits `<Scripts />` when `/404` is the matched route. The `modulepreload` hints `<HeadContent />` emits may still download the entry, which never executes, so nothing replaces the not-found page once loaded.
- R-TANSTACK-83: `NotFoundPage` is the router's default not-found component.
- R-TANSTACK-84: A client navigation whose route chunk or data file fails to load ends in one full load of the target address; a second failure at the same address in the same tab renders the site's error state, which only a defect reaches.

### Netlify deployment

- R-TANSTACK-101: `apps/robusta-build/netlify.toml` carries the build command, the publish directory, the ignore rule and `YARN_FLAGS`, and no function, redirect, header or plugin section.
- R-TANSTACK-102: The Netlify site has package directory `apps/robusta-build`, no base directory, production branch `main`, branch deploys for `epic/robusta-v2`, Pretty URLs on and no build variable.
- R-TANSTACK-103: `@netlify/vite-plugin-tanstack-start` is not a dependency, and the deploy summary lists no function.
- R-TANSTACK-104: The following are recorded on the first deploy, a production deploy of `main`, then on the branch deploy of `epic/robusta-v2`: the install on Node 22 with yarn 4.17.1 from `.yarn/releases`, no function, an unknown article URL answering 404 with the not-found page still on screen after load, the English-to-French walk — the English yield-farming article, its other-locale link, then the French article's category link — fetching only files, which decides the fallback of R-TANSTACK-66 rather than AC-TANSTACK-2 (OQ-TANSTACK-13), `M87.jpg` answering 200, and the host's answers to a trailing slash and an uppercase letter.
- R-TANSTACK-105: The Deployment section of the site's README records the first green deploy, which settles AC-BOOTSTRAP-81.

## Acceptance Criteria

- AC-TANSTACK-1 : Étant donné un Clean checkout, quand Tux lance le Green set, alors les cinq builds aboutissent, `apps/dakar` et `apps/robusta` produisent les pages qu'ils produisaient avant et les 38 tests du site passent ; le site v2 écrit `/`, chaque URL de `urlSet` et la page 404 en HTML complet, le titre, l'auteur et le corps d'un article lisibles JavaScript désactivé ; la vérification de la table des routes fait toujours échouer le build à la moindre différence (AC-URLSCHEME-42) ; et le source du site ne porte aucun `'use client'`, aucun `'use server'` ni aucun import local sans son suffixe `.js`.
- AC-TANSTACK-2 : Étant donné l'article français sur le yield farming ouvert dans un navigateur, quand Barbot suit son lien de category vers `/l/fr/articles/c/blockchain` puis revient à l'article par le bouton retour, alors chaque page s'affiche sans rechargement complet, l'article avec son titre et son corps, et chaque requête reçoit un fichier du déploiement — page, script, feuille de style, image ou donnée écrite au build — aucune n'exécutant de code serveur ni ne lisant `content/articles` (BR-PYRAMID-7).
- AC-TANSTACK-3 : Étant donné des captures de référence de `/` et des onze articles à 375, 768 et 1280 px, prises sur le build Next avant que cette story ne change le moindre code, quand Ada compare les mêmes pages sur le nouveau build une fois les polices chargées, alors elles s'affichent à l'identique : les trois polices viennent du site lui-même sans aucune requête tierce, chaque Design token vient du design system, chaque page porte `noindex`, et aucun client de Telemetry n'est livré.
- AC-TANSTACK-4 : Étant donné une adresse que le build Next redirige ou déclare Gone — une des 66 lignes v1 permanentes, une des six lignes Gone, tout autre chemin `/learn`, `/articles/p/1`, ou une Locale par défaut marquée comme `/l/en/articles/c/web/{slug}` — quand Barbot la demande, alors elle répond 404 avec la page 404, et le déploiement ne porte aucune règle de redirection.
- AC-TANSTACK-7 : Étant donné les cas limites, quand Barbot ou Nina les rencontrent, alors une URL inconnue, sous la Content root ou ailleurs, répond 404 avec la page 404 toujours à l'écran une fois les scripts exécutés, jamais la page d'accueil avec un 200 ; une URL portant une majuscule ou un slash final n'est jamais servie comme une page avec un 200, tandis que `/article-images/theory/images/M87.jpg` répond 200 à sa casse exacte ; un article qu'aucune autre page ne lie est prérendu quand même, si bien qu'un article ajouté par Nina se construit sans changement de code ; un article qui ne déclare aucune couverture, une fixture de test puisque chaque article migré en déclare une, n'affiche aucun cadre de couverture vide ; un lecteur dont l'onglet était ouvert avant un déploiement atteint toujours la page qu'un lien vise, par un chargement complet s'il le faut, jamais une page d'erreur ; un commit qui ne touche que `apps/dakar` ne déclenche aucun déploiement de production du site v2.
- AC-TANSTACK-8 : Étant donné les pages de la Locale française — les trois articles français et toutes les autres pages sous `/l/fr` — quand le site est construit, alors leurs documents déclarent `lang="fr"` ; et étant donné l'article français sur le yield farming ouvert dans un navigateur, quand Barbot suit son lien de category, alors la langue du document reste `fr`, sans rechargement.

Edge cases to test:

- `/articles/c/web/an-article-that-does-not-exist`, opened with JavaScript on: status 404, and the not-found page is still on screen once the page has loaded.
- A path outside every shape of the scheme, such as `/about`: the same answer.
- A Gone row, a permanent row, and `/learn` itself: 404 with the not-found page, no `Location` header.
- `/articles/p/1`, `/articles/c/web/p/1` and `/l/en/articles/c/web/{slug}`: 404.
- An article URL with a trailing slash: 301 to the canonical form, never a page with 200.
- An article URL with an uppercase letter in its category: 301 to the lowercase form, never a page with 200 under the uppercase address.
- `/article-images/theory/images/M87.jpg`: 200 at its exact case.
- One of the five articles that no chain of links from `/` reaches: prerendered, with its data file.
- A fixture article declaring no cover, rendered through `ArticleView`: no cover box in the markup.
- A tab opened before a deploy that renamed a route chunk, then a link followed: the target page renders, through a full load.
- An article Nina adds to the corpus: its page, its data file and its route-table entry appear with no code change.
- The French yield-farming article reached by its other-locale link, then the browser's back button: the document reads `fr`, then `en` again, without a reload.
- A commit on `main` touching `apps/dakar` alone: the ignore rule skips the build, no production deploy.

## Dependencies

- Depends on: design-system-responsive landed, so the reference screenshots of AC-TANSTACK-3 measure this story alone (story Dep 1); the Netlify site created by Nicolas with the settings of R-TANSTACK-102 (story Dep 2).
- Blocks: the designs of robusta-landing-page and seo-excellence (story Dep 3); default-locale-fr, item 3 of the epic's À faire, which is proved on the URLs this story ships.
