# Architecture: root (@robusta/pyramids)

**Last updated:** 2026-10-07
**Kind:** project

## Children

- [routing](packages/pyramids-routing/routing.archi.md)
- [content](packages/pyramids-content/content.archi.md)
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

Pyramids is a yarn-workspaces monorepo whose purpose is to build several SEO content sites from one shared base instead of rewriting a site each time. The shared base is a set of small packages and a content pipeline that turns markdown files into rendered, indexable pages. `apps/robusta` and `apps/dakar` are Next.js App Router sites with React Server Components and ISR, deployed on Vercel; `apps/robusta-build`, the v2 robusta site, is TanStack Start on Vite, prerendered at build and served as files by Netlify. On top of that base, each site brings its own design system and its own content. Two sites are live — robusta.build, served by `apps/robusta-build`, and dakar.surf — plus a demo app for the telemetry SDK.

The project is in a v2 restart (see `features/pyramid-v2-epic/pyramid-v2.epic.md`). The v1 site `apps/robusta` is considered unmaintainable; v2 rebuilds the robusta site from scratch, reuses only its markdown content, simplifies the SEO URL scheme, and gives the site a real design system generated with Claude Design. Only the robusta site is in scope for v2.

## Apps, modules, packages

- apps/robusta-build (`@robusta/robusta-build`) — robusta.build version 2, served at robusta.build by the Netlify project `robusta-build`. TanStack Start on Vite 8: `vite build` prerenders `/`, a 404 page and every URL the v2 scheme derives from the corpus into `dist/client`, and Netlify publishes that directory as files, with no function and no redirect rule. A prerendered page hydrates and navigates client-side, on data files two static server functions write at build. Tailwind 4 with a token bridge, three self-hosted faces from Fontsource, `noindex` on every page. The eleven migrated articles render as article pages; the listing routes and the home are placeholders. Its workspace dependencies are three: the design system, `pyramids-routing` and `pyramids-content`.
- apps/robusta (`@robusta/build`) — robusta.build version 1, a Next.js site on Vercel: blog under `/learn`, portfolio, prosemirror editor. Its README owns the v1 routing scheme, which the v2 site does not inherit. Declared a thrash by the epic. Its markdown content under `content/blog` was copied onto the v2 site on 2026-08-01 and the tree is frozen since; `retire-robusta-v1` deletes it rather than merging it back.
- apps/dakar (`@robusta/dakar`) — dakar.surf, the surf guide. Next.js on Vercel with a `[locale]` segment, spots pages and MapLibre maps, on `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`. Out of v2 scope.
- apps/intel-demo — Vite front + Express server demo of the scribe-intel SDK. Not deployed as a content site.
- apps/robusta-design — v0 design prototype (prompt, uploads, HTML). Superseded by `packages/robusta-design-system`, not yet removed.
- packages/pyramids-routing — the v2 URL scheme as pure string functions: the discriminants `l`, `c`, `p` and `t`, plus `buildUrl`, `parseUrl`, `urlSet` and `validateArticles`. It depends on nothing and holds no site's content root, so a second site can adopt the scheme without inheriting anything else.
- packages/pyramids-content — the reading contract of the v2 base, added 2026-08-01: a tree of markdown files becomes an article index (`readCorpus`, `readArticleBody`, `articleSlug`, `describeViolation`) and the images those articles reference become published assets (`copyCorpusAssets`, `resolveAssetUrl`). It owns the article schema and the seven violation codes, and owns no site's tree — the corpus root, the locale source, the exclusions and the asset directory are fields of the `CorpusSpec` the site declares. It depends on `gray-matter`, `remark` and `slugify`, on no React and no Next and on no other package here, and builds second in `build:deps`, right behind `pyramids-routing`.
- packages/helpers — cross-cutting utilities (style/`twCss`, router, theme, react, time, arrays, debug). `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` depend on it.
- packages/themes — JS-side design tokens (`pyramidsColors`, `PyramidsTheme`, per-site overrides). Separate from each Next app's DaisyUI/Tailwind palette.
- packages/layouts, packages/links, packages/ctas — the shared presentational libraries: structural primitives, `next/link` wrappers with server/client navigators, call-to-action widgets.
- packages/robusta-design-system — the robusta site's own design system: CSS tokens (`colors_and_type.css`, `sketch.css`), brand assets, HTML previews, 6 React primitives and 8 marketing surfaces.
- packages/scribe-intel — telemetry and product-analytics SDK over OpenTelemetry. No site depends on it, the v2 site by rule (BR-PYRAMID-2); `services/scribe-intel-collector` does.
- services/scribe-intel-collector, services/scribe-intel-backend — the receiving end of the telemetry SDK: an Express + OTel collector exporting to a docker-compose Loki/Tempo/Prometheus stack.

## Diagram

```
  Arrow = depends on, through a library API. Nothing points into an app.

  app robusta-build       app robusta (v1)           app dakar
  TanStack Start, Vite 8  Next 15, RSC + ISR         Next 15, MapLibre
  Netlify, static files   Vercel, retiring           Vercel
     │        │              │         │                │
     │        └──────────┐   │         └──────────┐     │
     ↓                   ↓   ↓                    ↓     ↓
  module routing      module design-system     module layouts · links · ctas
  module content                               DaisyUI classes, deprecated
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
        │           v2: @robusta/pyramids-content, one traversal per
        │               corpus root per process; the images the
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
             v2 discriminants: l, c, p, t                   ──→ Netlify
```

Each site holds its per-site truth in `src/seopyramids.config.ts`: domain, site name and title, mission, logo, default and other locales, and the blog configuration (roll size, mandatory keywords, author, category resolver).

## Data Flow — build chain

```
  yarn build:deps, tsc, each module to dist/, in this order:
    routing → content → helpers → themes → design-system
            → layouts → links → ctas
        │
        ├──→ yarn build:robusta      vite build, every page prerendered
        │                            into dist/client, then the
        │                            route-table check
        ├──→ yarn build:robusta-v1   next build
        └──→ yarn build:dakar        next build
```

Apps resolve packages through their compiled `dist/`. A package change is invisible to a running app until it is rebuilt, so `yarn dev:dev` runs the watchers alongside the dev server.

The green set — what must build from a clean checkout, in this order: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta-v1`, `yarn build:robusta` (BR-PYRAMID-5). `apps/dakar` produces 23/23 static pages and `apps/robusta` 42/42. `apps/robusta-build` writes 23 HTML files — the 21 content URLs the eleven articles derive, `index.html` and `404.html` — and 12 data files, one per article and one for the notes feed. A second `yarn install` leaves `yarn.lock` byte-identical.

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
- Local TypeScript imports must end with `.js` even though the source is `.ts`/`.tsx`. Flag a non-conforming import, do not silently rewrite it. `apps/robusta-build` fails its build on one (`scripts/check-source.mjs`); `apps/dakar` resolves them under webpack through `experimental.extensionAlias` in its `next.config.ts`.
- No site's build runs eslint: `eslint.ignoreDuringBuilds: true` in both `next.config.ts`, and `apps/robusta-build` lints outside its build. A green build says nothing about lint. Run `yarn lint` explicitly.
- The v1 article corpus is `apps/robusta/content/blog`, 11 articles — arbitrated 2026-07-29, and it is what the v1 code actually reads. The 13 articles of `apps/robusta/public/learn` are not the corpus: 8 are common to both trees, 5 exist only there and fall outside the arbitrated set. Those 5 did not travel and what becomes of them is an editorial call, not a migration question — decided 2026-07-29 by the migrate-learn-content story.
- The two corpora are a copy, and the copy is frozen. The eleven articles were copied into `apps/robusta-build/content/articles` on 2026-08-01 rather than moved, so `apps/robusta` keeps rendering the tree it reads; no article is edited under `content/blog` afterwards. `apps/robusta-build/src/content/corpus-freeze.spec.ts` holds the eleven markdown bodies byte for byte between the two trees and is the only thing enforcing it — it says nothing about frontmatter, which the conversion deliberately diverged. It dies with the tree, in `retire-robusta-v1`.
- `packages/robusta-design-system` reached `dev` on 2026-07-30 through the merge `c0f98fe`, item 1 of the pyramid-v2 epic. The raw Claude Design output — CSS, assets, previews — was already there; the merge added what turns the folder into a workspace: `package.json` with its CSS and asset subpath exports, `src/`, `tsconfig.json` and its archi doc. It now builds inside `yarn build:deps`, between `pyramids-themes` and `pyramids-layouts`.
- Two parallel colour systems coexist: `pyramids-themes` (JS tokens) and each Next app's `tailwind.config.ts` DaisyUI palette. Changing one does not move the other, and the design system adds a third, CSS-variable-based one.
- DaisyUI stays out of the v2 site: `apps/robusta-build` declares neither `daisyui` nor `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`, which render DaisyUI classes, and the epic decided on 2026-07-29 that its components come from shadcn on Tailwind 4. `apps/robusta` and `apps/dakar` stay on DaisyUI.
- The two build failures recorded during the design-system work were fixed on 2026-07-30 by the unblock-build story. Both were declaration defects, not code defects: no source file was changed. What they turned out to be is worth keeping, because the diagnosis generalises.
- `Next.js build worker exited with code: 1 and signal: null` names no cause. Read the prerender error printed above it, never the worker-exit line itself. Here the real error was a prerender failure on `/500`: `TypeError: Cannot read properties of null (reading 'useContext')`, thrown by `StyleRegistry` inside `styled-jsx`. Cause: two React copies inside `apps/robusta`. The app rendered with the release candidate `19.0.0-rc-66855b96-20241106` while `styled-jsx`, transitive through Next, resolved its own nested `react@19.1.1` — so `useContext` ran on the React that was not driving the render and got a null dispatcher. A caret over a release candidate admits any stable 19.x, which is what let the resolver place a different React per subtree. Fixed by converging every workspace on React 19.1.1 stable: after a clean install exactly one React resolves, and the same build produces 42/42 static pages.
- Meeting that worker-exit message on another app: look for a duplicate copy of a package holding process-wide state — React first — before anything else.
- Same defect class, second instance: `apps/robusta/vite.config.ts` failed type-check because `vite-tsconfig-paths` bound to a `vite@5` hoisted out of `services/scribe-intel-collector` while vitest used `vite@6`. Fixed by `apps/robusta` declaring `vite` itself, plus `yarn dedupe vite rollup`.
- The rule those two share, and the one to apply first: a package that imports something declares it, and a package that holds process-wide state must resolve to exactly one copy per graph. `pyramids-links` and `pyramids-ctas` import `next/*`; `pyramids-layouts` and `pyramids-ctas` import `@robusta/pyramids-helpers`; `packages/scribe-intel` imports `@opentelemetry/api` in three files. None of them declared it. All of them do now — as a peer where the copy must come from the host, so no resolver is authorised to place a second one in a subtree.
- `packages/scribe-intel` and `services/scribe-intel-collector` do not compile, and did not before that work either: `tsc` fails on source-level type errors — `VisitorHori` does not implement `Visitor`, and `intent.spec.ts` imports a `createIntelInstance` that no longer exists. They install cleanly, sit outside the green set, and are deliberately left unrepaired.
