# Architecture: root (@robusta/pyramids)

**Last updated:** 2026-11-04
**Kind:** project

## Children

- [helpers](packages/helpers/helpers.archi.md)
- [themes](packages/themes/themes.archi.md)
- [layouts](packages/layouts/layouts.archi.md)
- [links](packages/links/links.archi.md)
- [ctas](packages/ctas/ctas.archi.md)
- [scribe-intel](packages/scribe-intel/scribe-intel.archi.md)
- [design-system](packages/robusta-design-system/design-system.archi.md)
- [robusta-build](apps/robusta-build/robusta-build.archi.md)
- the other apps and the services have no `.archi.md` yet

## Overview

Pyramids is a yarn-workspaces monorepo whose purpose is to build several SEO content sites from one shared base instead of rewriting a site each time. The shared base is a set of small modules, and what a single site uses belongs to that site (BR-PYRAMID-12). `apps/robusta` and `apps/dakar` are Next.js App Router sites with React Server Components and ISR, deployed on Vercel; `apps/robusta-build`, the v2 robusta site, is TanStack Start on Vite, prerendered at build and served as files by Netlify. Each site carries its own content and a design system, which several sites may share (BR-PYRAMID-3). Two sites are live — robusta.build, served by `apps/robusta-build` and closed to indexing until go-live, and dakar.surf — plus a demo app for the telemetry SDK.

The project is in a v2 restart (see `features/pyramid-v2-epic/pyramid-v2.epic.md`). The v1 site `apps/robusta` is considered unmaintainable; v2 rebuilds the robusta site from scratch, reuses only its markdown content, simplifies the SEO URL scheme, and gives the site a real design system generated with Claude Design. Only the robusta site is in scope for v2.

## Apps, modules, packages

- apps/robusta-build (`@robusta/robusta-build`) — robusta.build version 2, served at robusta.build by the Netlify project `robusta-build`, in three Locales, `en` by default, `fr` and `es` (BR-ROBUSTA-1): an `en` page carries no Locale prefix, a `fr` or `es` page sits under the prefix of its Locale (BR-PYRAMID-14). TanStack Start on Vite 8: `vite build` prerenders the landing page of each Locale, the `en` one at `/`, a 404 page and every URL the v2 scheme derives from the corpus into `dist/client`, and Netlify publishes that directory as files, with no function and two redirect rules in 301, `/en` to `/` and `/en/*` to the same path unprefixed. A prerendered page hydrates and navigates client-side, on data files three static server functions write at build. Tailwind 4 with a token bridge, three self-hosted faces from Fontsource. Each page declares its head through the site's `seo` package: title, description, canonical URL, hreflang and share preview, plus structured data on article and landing pages; the build writes `sitemap.xml` and `robots.txt` and audits the heads, and every page carries `noindex` until go-live flips `INDEXING_OPEN`. `/`, `/fr` and `/es` are the landing pages, design-system sections fed by the page copy of their Locale in the site configuration; the seventeen articles, eleven migrated from v1 and six French translations, render as article pages; the blog home and the Category rolls of each Locale render as listing pages. A header and a footer, from the site's `chrome` package, wrap every page; the header links to the same page in each other Locale, or to that Locale's landing page. The v2 URL scheme and the corpus reader are packages of the site, `url-scheme` and `corpus-reader`, and its one workspace dependency is the design system.
- apps/robusta (`@robusta/build`) — robusta.build version 1, a Next.js site on Vercel: blog under `/learn`, portfolio, prosemirror editor. Its README owns the v1 routing scheme, which the v2 site does not inherit. Declared a thrash by the epic. Its markdown content under `content/blog` was copied onto the v2 site on 2026-08-01 and the tree is frozen since; `retire-robusta-v1` deletes it rather than merging it back.
- apps/dakar (`@robusta/dakar`) — dakar.surf, the surf guide. Next.js on Vercel with a `[locale]` segment, spots pages and MapLibre maps, on `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`. Out of v2 scope.
- apps/intel-demo — Vite front + Express server demo of the scribe-intel SDK. Not deployed as a content site.
- apps/robusta-design — v0 design prototype (prompt, uploads, HTML). Superseded by `packages/robusta-design-system`, not yet removed.
- packages/helpers — cross-cutting utilities (style/`twCss`, router, theme, react, time, arrays, debug). `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` depend on it.
- packages/themes — JS-side design tokens (`pyramidsColors`, `PyramidsTheme`, per-site overrides). Separate from each Next app's DaisyUI/Tailwind palette.
- packages/layouts, packages/links, packages/ctas — the shared presentational libraries: structural primitives, `next/link` wrappers with server/client navigators, call-to-action widgets.
- packages/robusta-design-system (`@robusta/pyramids-design-system`) — the design system of robusta.build, a module other sites may share (BR-PYRAMID-3, BR-PYRAMID-13): CSS tokens (`colors_and_type.css`, `sketch.css`), brand assets, HTML previews, 6 React primitives and 8 marketing sections. The sections render their internal links through the `linkComponent` the site supplies, and the module depends on no router.
- packages/scribe-intel — telemetry and product-analytics SDK over OpenTelemetry. No site depends on it, the v2 site by rule (BR-PYRAMID-2); `services/scribe-intel-collector` does.
- services/scribe-intel-collector, services/scribe-intel-backend — the receiving end of the telemetry SDK: an Express + OTel collector exporting to a docker-compose Loki/Tempo/Prometheus stack.

## Diagram

```
  Arrow = depends on, through a library API. Nothing points into an app.

  app robusta-build       app robusta (v1)           app dakar
  TanStack Start, Vite 8  Next 15, RSC + ISR         Next 15, MapLibre
  Netlify, static files   Vercel, retiring           Vercel
     │                       │         │                │
     └───────────────────┐   │         └──────────┐     │
                         ↓   ↓                    ↓     ↓
                      module design-system     module layouts · links · ctas
                                               DaisyUI classes, deprecated
                                                     │
                                                     ↓
                                               module themes · helpers

  app scribe-intel-collector ──library──→ module scribe-intel, used by no site

  Also: app robusta (v1) → module themes, directly.
  Not workspaces, left out: apps/intel-demo, apps/robusta-design,
  services/scribe-intel-backend.
```

Modules build to `dist/`, and apps consume the built artefacts, never the TS sources.

## Data Flow — a content site

```
  content markdown
    v1  apps/robusta/content/blog             frozen, copied from
    v2  apps/robusta-build/content/articles
        │
        ↓
  build-time read   v1: the site's own parser: categories, slugs, roll
        │           v2: the site's package corpus-reader, one traversal
        │               per corpus root per process; the images the
        │               articles reference mirrored into public/
        ↓
  render  ←── src/seopyramids.config.ts: domain, siteName, locales, roll
        │ ←── modules: design system; layouts · links · ctas on Next
        │
        ├──→ Next: apps/robusta, apps/dakar
        │    App Router, RSC, static generation + ISR      ──→ Vercel
        │    v1 discriminants: locale, page, s
        │
        └──→ v2: apps/robusta-build
             TanStack Start prerender in vite build, then hydration
             data files from the static server functions
             v2: Locale prefix except en, then c, p, t     ──→ Netlify
```

Each site holds its per-site truth in `src/seopyramids.config.ts`: domain, site name and title, mission, logo, default and other locales, and the blog configuration (roll size, author, and on the Next sites mandatory keywords and a category resolver). On the v2 site, the blog configuration adds the content root, and the page copy of each Locale and the contact replace the site title and the mission.

## Data Flow — build chain

```
  yarn build:deps, tsc, each module to dist/, in this order:
    helpers → themes → design-system → layouts → links → ctas
        │
        ├──→ yarn build:robusta      vite build, every page prerendered
        │                            into dist/client, then the
        │                            route-table check, sitemap.xml and
        │                            robots.txt, the SEO check
        ├──→ yarn build:robusta-v1   next build
        └──→ yarn build:dakar        next build
```

Apps resolve packages through their compiled `dist/`. A package change is invisible to a running app until it is rebuilt, so `yarn dev:dev` runs the watchers alongside the v1 dev server.

The green set — what must build from a clean checkout, in this order: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta-v1`, `yarn build:robusta` (BR-PYRAMID-5). `apps/dakar` produces 23/23 static pages and `apps/robusta` 42/42. `apps/robusta-build` writes 34 HTML files — the 3 landing pages, the `en` one as `index.html` at the root, the 30 content URLs the seventeen articles derive and `404.html` — and 69 data files: one per article, one notes feed per landing page, one counterparts file per landing page and content URL, one roll page per blog home and Category page and one roll list per Locale, plus `sitemap.xml` and `robots.txt`. A second `yarn install` leaves `yarn.lock` byte-identical.

Inside the set but install-only, never built by it: `packages/scribe-intel`, `services/scribe-intel-collector`. Outside it entirely, and outside yarn's view: `apps/robusta-design`, `apps/intel-demo` and `services/scribe-intel-backend` carry no `package.json` at their root, so despite the `apps/*` glob they are not workspaces — nothing installs or builds them.

## Dependencies

- Depends on: React 19 and TypeScript everywhere; Next.js 15 App Router, Tailwind 3 + DaisyUI and Vercel for `apps/robusta` and `apps/dakar`; TanStack Start on Vite 8, Tailwind 4 and Netlify for `apps/robusta-build`; OpenTelemetry for the telemetry path; MapLibre for dakar.
- Used by: the deployed sites robusta.build and dakar.surf.
- Build: yarn 4 workspaces, `tsc` per package, `next build` for the two Next apps, `vite build` with the prerender for `apps/robusta-build`. There is no root-level test script — each workspace runs its own, vitest or, for the design system, `node --test`.
- Toolchain: the root manifest declares `packageManager: "yarn@4.17.1"` and `engines.node: "22.x"`, and TanStack Start needs 22.12 or later; `.yarnrc.yml` declares `nodeLinker: node-modules` — Plug'n'Play is not used, because `tsc`, `next build`, Vite and vitest read the on-disk layout and Netlify's build requires it — plus `enableGlobalCache` (no zero-install, the cache stays out of git), `enableScripts` (sharp, esbuild, @parcel/watcher and protobufjs build native binaries at install time), `yarnPath` and `packageExtensions`. `.nvmrc` carries the same Node major for humans. Install is `yarn install`, and the yarn that runs it is the binary committed at `.yarn/releases/yarn-4.17.1.cjs`, which `yarnPath` names: any yarn on the PATH delegates to it. Corepack is not needed, and a corepack cache inside the repository breaks the install, the root `"type": "module"` making Node load yarn's CommonJS bundle as an ES module: Vercel's corepack caches there, Netlify's build image enables corepack with a cache outside the repository (`apps/robusta-build/README.md`, Yarn on a build agent). `packageManager` remains the declared version, read by a corepack shim or an editor; `yarnPath` is what decides the binary.
- Two Vite majors: the root hoists Vite 6 for `apps/robusta` and the packages, and the v2 site's Vite 8 sits under `apps/robusta-build/node_modules`. `packageExtensions` declares the `vite` peer `@tanstack/react-start-rsc` omits, so the site's build binds its own copy and never the hoisted one.
- Workspace cross-references state the workspace protocol (`"@robusta/pyramids-helpers": "workspace:*"`). These packages are published nowhere, so an intra-monorepo edge the resolver could answer from the registry is an edge that fails a clean checkout with a 404 instead of resolving locally.

## Notes / Gotchas

- Apps consume built artefacts, not sources. Any package edit needs a rebuild or a running watcher.
- In `apps/robusta-build` and `packages/robusta-design-system`, a local TypeScript import, `@/` alias included, names the `.ts` or `.tsx` file itself, and a folder import its `index.ts`; the `tsc` configurations that emit rewrite those specifiers to `.js` (`rewriteRelativeImportExtensions`). An import in `.js`, without extension or with the wrong extension fails the site's build (`scripts/check-source.mjs`) or the design system's tests (`src/import-specifiers.spec.ts`).
- In `apps/robusta`, `apps/dakar` and the other modules, a local TypeScript import ends with `.js` even though the source is `.ts`/`.tsx`. Flag a non-conforming one, do not silently rewrite it. `apps/dakar` resolves them under webpack through `experimental.extensionAlias` in its `next.config.ts`.
- No site's build runs eslint: `eslint.ignoreDuringBuilds: true` in both `next.config.ts`, and `apps/robusta-build` lints outside its build. A green build says nothing about lint. Run `yarn lint` explicitly.
- The v1 article corpus is `apps/robusta/content/blog`, 11 articles — arbitrated 2026-07-29, and it is what the v1 code actually reads. The 13 articles of `apps/robusta/public/learn` are not the corpus: 8 are common to both trees, 5 exist only there and fall outside the arbitrated set. Those 5 did not travel and what becomes of them is an editorial call, not a migration question — decided 2026-07-29 by the migrate-learn-content story.
- The two corpora are a copy, and the copy is frozen. The eleven articles were copied into `apps/robusta-build/content/articles` on 2026-08-01 rather than moved, so `apps/robusta` keeps rendering the tree it reads. `apps/robusta-build/src/content/corpus-freeze.spec.ts` finds each of the eleven v1 articles at the same relative path in the v2 tree and holds their markdown bodies byte for byte, so a correction to one of those bodies lands in both trees; it is the only thing enforcing the freeze, and says nothing about frontmatter, which the conversion deliberately diverged, nor about the six French translations, which have no v1 counterpart. It dies with the tree, in `retire-robusta-v1`.
- `packages/robusta-design-system` reached `dev` on 2026-07-30 through the merge `c0f98fe`, item 1 of the pyramid-v2 epic. The raw Claude Design output — CSS, assets, previews — was already there; the merge added what turns the folder into a workspace: `package.json` with its CSS and asset subpath exports, `src/`, `tsconfig.json` and its archi doc. It now builds inside `yarn build:deps`, between `pyramids-themes` and `pyramids-layouts`.
- Two parallel colour systems coexist: `pyramids-themes` (JS tokens) and each Next app's `tailwind.config.ts` DaisyUI palette. Changing one does not move the other, and the design system adds a third, CSS-variable-based one.
- DaisyUI stays out of the v2 site: `apps/robusta-build` declares neither `daisyui` nor `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`, which render DaisyUI classes, and the epic decided on 2026-07-29 that its components come from shadcn on Tailwind 4. `apps/robusta` and `apps/dakar` stay on DaisyUI.
- The two build failures recorded during the design-system work were fixed on 2026-07-30 by the unblock-build story. Both were declaration defects, not code defects: no source file was changed. What they turned out to be is worth keeping, because the diagnosis generalises.
- `Next.js build worker exited with code: 1 and signal: null` names no cause. Read the prerender error printed above it, never the worker-exit line itself. Here the real error was a prerender failure on `/500`: `TypeError: Cannot read properties of null (reading 'useContext')`, thrown by `StyleRegistry` inside `styled-jsx`. Cause: two React copies inside `apps/robusta`. The app rendered with the release candidate `19.0.0-rc-66855b96-20241106` while `styled-jsx`, transitive through Next, resolved its own nested `react@19.1.1` — so `useContext` ran on the React that was not driving the render and got a null dispatcher. A caret over a release candidate admits any stable 19.x, which is what let the resolver place a different React per subtree. Fixed by converging every workspace on React 19.1.1 stable: after a clean install exactly one React resolves, and the same build produces 42/42 static pages.
- Meeting that worker-exit message on another app: look for a duplicate copy of a package holding process-wide state — React first — before anything else.
- Same defect class, second instance: `apps/robusta/vite.config.ts` failed type-check because `vite-tsconfig-paths` bound to a `vite@5` hoisted out of `services/scribe-intel-collector` while vitest used `vite@6`. Fixed by `apps/robusta` declaring `vite` itself, plus `yarn dedupe vite rollup`.
- The rule those two share, and the one to apply first: a package that imports something declares it, and a package that holds process-wide state must resolve to exactly one copy per graph. `pyramids-links` and `pyramids-ctas` import `next/*`; `pyramids-layouts` and `pyramids-ctas` import `@robusta/pyramids-helpers`; `packages/scribe-intel` imports `@opentelemetry/api` in three files. None of them declared it. All of them do now — as a peer where the copy must come from the host, so no resolver is authorised to place a second one in a subtree.
- `packages/scribe-intel` and `services/scribe-intel-collector` do not compile, and did not before that work either: `tsc` fails on source-level type errors — `VisitorHori` does not implement `Visitor`, and `intent.spec.ts` imports a `createIntelInstance` that no longer exists. They install cleanly, sit outside the green set, and are deliberately left unrepaired.
