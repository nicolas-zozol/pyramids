# Architecture: root (@robusta/pyramids)

**Last updated:** 2026-08-02

## Parent

_None — this is the root._

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

Pyramids is a yarn-workspaces monorepo whose purpose is to build several SEO content sites from one shared base instead of rewriting a site each time. The shared base is: a Vercel + Next.js App Router backbone with React Server Components and ISR, a set of small React packages (layouts, links, CTAs, helpers, themes), and a content pipeline that turns markdown files into rendered, indexable pages. On top of that base, each site brings its own design system and its own content. Today two sites exist — robusta.build and dakar.surf — plus a demo app for the telemetry SDK.

The project is in a v2 restart (see `features/pyramid-v2-epic/pyramid-v2.epic.md`). The v1 site `apps/robusta` is considered unmaintainable; v2 rebuilds the robusta site from scratch, reuses only its markdown content, simplifies the SEO URL scheme, and gives the site a real design system generated with Claude Design. Only the robusta site is in scope for v2.

## Diagram

```
┌──────────────────────────── @robusta/pyramids (yarn workspaces) ────────────────────────────┐
│                                                                                             │
│   apps/                          packages/                        services/                 │
│   ┌───────────────────┐          ┌──────────────────────┐         ┌─────────────────────┐   │
│   │ robusta-build (v2)│          │ robusta-design-system│         │ scribe-intel-       │   │
│   │ robusta.build     │◄─────────│ (tokens + primitives)│         │ collector (Express) │   │
│   │ Next 15 + shadcn  │          ├──────────────────────┤         └──────────┬──────────┘   │
│   ├───────────────────┤          │ helpers              │                    │              │
│   │ robusta   (v1)    │          │ themes               │                    ▼              │
│   │ (retiring)        │◄─────────│ layouts   (deprec.)  │         ┌─────────────────────┐   │
│   │ Next 15, RSC/ISR  │          │ links     (deprec.)  │         │ scribe-intel-backend│   │
│   ├───────────────────┤          │ ctas      (deprec.)  │         │ Loki · Tempo ·      │   │
│   │ dakar     (live)  │◄─────────│ scribe-intel  (SDK)  │────────►│ Prometheus (docker) │   │
│   │ dakar.surf        │          │ routing   (v2 URLs)  │         └─────────────────────┘   │
│   │ Next 15 + MapLibre│          │ content   (v2 corpus)│                                   │
│   ├───────────────────┤          └──────────────────────┘                                   │
│   │ intel-demo (Vite) │                                                                     │
│   ├───────────────────┤                                                                     │
│   │ robusta-design    │                                                                     │
│   │ (v0 prototype)    │                                                                     │
│   └───────────────────┘                                                                     │
│                                                                                             │
│   packages build to dist/ ──► apps consume the built artefacts, never the TS sources        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                                   Vercel (RSC + ISR)
```

## Key Components

- apps/robusta-build (`@robusta/robusta-build`) — robusta.build version 2, created on 2026-07-31 as a deployable shell: it renders the design system and carries no page copy. Tailwind 4 with a token bridge, three self-hosted faces, `robots: noindex` until it has something to say. It carries the v2 URL scheme since 2026-07-31 — fourteen route files, a case-normalising middleware, its own README holding the reference — and serves the eleven migrated articles since 2026-08-01, at 25 static pages. Its workspace dependencies are three: the design system, `pyramids-routing` and `pyramids-content`.
- apps/robusta (`@robusta/build`) — robusta.build, the v1 Next.js site: blog under `/learn`, portfolio, prosemirror editor. Its README owns the v1 routing scheme, which the v2 site does not inherit. Declared a thrash by the epic. Its markdown content under `content/blog` was copied onto the v2 site on 2026-08-01 and the tree is frozen since; `retire-robusta-v1` deletes it rather than merging it back.
- apps/dakar (`@robusta/dakar`) — dakar.surf, the surf guide. Next.js with a `[locale]` segment, spots pages and MapLibre maps. Out of v2 scope but shares the same packages.
- apps/intel-demo — Vite front + Express server demo of the scribe-intel SDK. Not deployed as a content site.
- apps/robusta-design — v0 design prototype (prompt, uploads, HTML). Superseded by `packages/robusta-design-system`, not yet removed.
- packages/pyramids-routing — the v2 URL scheme as pure string functions: the discriminants `l`, `c`, `p` and `t`, plus `buildUrl`, `parseUrl`, `urlSet` and `validateArticles`. It depends on nothing and holds no site's content root, so a second site can adopt the scheme without inheriting anything else.
- packages/pyramids-content — the reading contract of the v2 base, added 2026-08-01: a tree of markdown files becomes an article index (`readCorpus`, `readArticleBody`, `articleSlug`, `describeViolation`) and the images those articles reference become published assets (`copyCorpusAssets`, `resolveAssetUrl`). It owns the article schema and the seven violation codes, and owns no site's tree — the corpus root, the locale source, the exclusions and the asset directory are fields of the `CorpusSpec` the site declares. It depends on `gray-matter`, `remark` and `slugify`, on no React and no Next and on no other package here, and builds second in `build:deps`, right behind `pyramids-routing`.
- packages/helpers — cross-cutting utilities (style/`twCss`, router, theme, react, time, arrays, debug). Every other package depends on it, `pyramids-routing` and `pyramids-content` excepted.
- packages/themes — JS-side design tokens (`pyramidsColors`, `PyramidsTheme`, per-site overrides). Separate from each app's DaisyUI/Tailwind palette.
- packages/layouts, packages/links, packages/ctas — the shared presentational libraries: structural primitives, `next/link` wrappers with server/client navigators, call-to-action widgets.
- packages/robusta-design-system — the robusta site's own design system: CSS tokens (`colors_and_type.css`, `sketch.css`), brand assets, HTML previews, 6 React primitives and 8 marketing surfaces.
- packages/scribe-intel — telemetry and product-analytics SDK over OpenTelemetry. Deliberately unused by the v2 site.
- services/scribe-intel-collector, services/scribe-intel-backend — the receiving end of the telemetry SDK: an Express + OTel collector exporting to a docker-compose Loki/Tempo/Prometheus stack.

## Data Flow — a content site

```
content markdown ── v1  apps/robusta/content/blog        (frozen, copied from)
        │           v2  apps/robusta-build/content/articles
        │                     │
        │                     └── read by @robusta/pyramids-content:
        │                         one traversal per corpus root per process,
        │                         and the images the articles reference
        │                         mirrored into public/ before the build
        ▼
  build-time parsing ── categories, slugs, blog roll
        │
        ▼
  Next.js App Router (RSC)  ◄── seopyramids.config.ts  (domain, siteName, locales, rollSize)
        │                   ◄── packages: layouts · links · ctas · helpers · design system
        ▼
  static generation + ISR  ── routes carry explicit discriminants, so pregeneration
        │                     never needs runtime searchParams. Two schemes coexist:
        │                     v1 (apps/robusta)       locale, page, s
        │                     v2 (apps/robusta-build) l, c, p, t
        ▼
      Vercel
```

Each site holds its per-site truth in `src/seopyramids.config.ts`: domain, site name and title, mission, logo, default and other locales, and the blog configuration (roll size, mandatory keywords, author, category resolver).

## Data Flow — build chain

```
yarn build:deps
   routing ──► content ──► helpers ──► themes ──► design-system ──► layouts ──► links ──► ctas
                                                                      (tsc, each to dist/)
        │
        ▼
yarn build:robusta / build:dakar ──► next build
```

Apps resolve packages through their compiled `dist/`. A package change is invisible to a running app until it is rebuilt, so `yarn dev:dev` runs the watchers alongside the dev server.

The green set — what must build from a clean checkout, in this order: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`, `yarn build:robusta-build`. Verified end to end on 2026-07-30 from a wiped tree: dakar produced 23/23 static pages on a route table identical to its baseline, robusta 42/42, and a second `yarn install` left `yarn.lock` byte-identical. `apps/robusta-build` joined it on 2026-07-31, producing 4/4 static pages; it produced 62/62 on the fixture corpus the v2 URL scheme shipped with, and produces 25/25 since the eleven articles landed on 2026-08-01 — 23 HTML pages, being the 21 content URLs the corpus derives plus the landing page and `/_not-found`. dakar and robusta are unchanged at 23/23 and 42/42, which is what copying the corpus rather than moving it protects.

Inside the set but install-only, never built by it: `packages/scribe-intel`, `services/scribe-intel-collector`. Outside it entirely, and outside yarn's view: `apps/robusta-design`, `apps/intel-demo` and `services/scribe-intel-backend` carry no `package.json` at all, so despite the `apps/*` glob they are not workspaces — nothing installs or builds them.

## Dependencies

- Depends on: Next.js 15 App Router, React 19, Tailwind + DaisyUI, TypeScript, Vercel for hosting, OpenTelemetry for the telemetry path, MapLibre for dakar.
- Used by: the deployed sites robusta.build and dakar.surf.
- Build: yarn 4 workspaces, `tsc` per package, `next build` per app. There is no root-level test script — vitest runs per workspace.
- Toolchain: the root manifest declares `packageManager: "yarn@4.17.1"` and `engines.node: ">=22 <23"`; `.yarnrc.yml` declares `nodeLinker: node-modules` — Plug'n'Play is deliberately not used, because `tsc`, `next build` and vitest all read the on-disk layout — plus `enableGlobalCache` (no zero-install, the cache stays out of git) and `enableScripts` (sharp, esbuild, @parcel/watcher and protobufjs build native binaries at install time). `.nvmrc` carries the same Node major for humans. Install is `yarn install`, with corepack honouring `packageManager`: nothing here assumes a globally installed yarn.
- Workspace cross-references state the workspace protocol (`"@robusta/pyramids-helpers": "workspace:*"`). These packages are published nowhere, so an intra-monorepo edge the resolver could answer from the registry is an edge that fails a clean checkout with a 404 instead of resolving locally.

## Notes / Gotchas

- Apps consume built artefacts, not sources. Any package edit needs a rebuild or a running watcher.
- Local TypeScript imports must end with `.js` even though the source is `.ts`/`.tsx`. Flag a non-conforming import, do not silently rewrite it.
- `eslint.ignoreDuringBuilds: true` in both apps: a green build says nothing about lint. Run `yarn lint` explicitly.
- The v1 article corpus is `apps/robusta/content/blog`, 11 articles — arbitrated 2026-07-29, and it is what the v1 code actually reads. The 13 articles of `apps/robusta/public/learn` are not the corpus: 8 are common to both trees, 5 exist only there and fall outside the arbitrated set. Those 5 did not travel and what becomes of them is an editorial call, not a migration question — decided 2026-07-29 by the migrate-learn-content story.
- The two corpora are a copy, and the copy is frozen. The eleven articles were copied into `apps/robusta-build/content/articles` on 2026-08-01 rather than moved, so `apps/robusta` keeps rendering the tree it reads; no article is edited under `content/blog` afterwards. `apps/robusta-build/src/content/corpus-freeze.spec.ts` holds the eleven markdown bodies byte for byte between the two trees and is the only thing enforcing it — it says nothing about frontmatter, which the conversion deliberately diverged. It dies with the tree, in `retire-robusta-v1`.
- `apps/robusta-build` needs `experimental.extensionAlias` in its `next.config.ts`, like `apps/dakar`. `moduleResolution: "Bundler"` makes the repository's `.js`-suffixed local imports pass `tsc`, which says nothing about webpack: without the alias the build fails at compile with `Module not found: Can't resolve '../seopyramids.config.js'`.
- `next.config.ts` cannot import application code, in this repository more firmly than in most. Next loads it outside webpack and resolves its imports before the `require.extensions['.ts']` hook it registers, so the repository's `.js`-suffixed local imports resolve to files that do not exist — and independently, any chain reaching a bundler-only asset such as the design system's PNG wordmark dies there too. What the config needs from the application is emitted by a build script and read as data: `apps/robusta-build` compiles its routing modules with `tsconfig.routing.json` and reads the JSON `scripts/emit-redirects.mjs` writes.
- A case-normalising middleware must exclude every namespace whose paths are case-significant. `apps/robusta-build` excludes `/learn`, so the v1 mapping keeps matching addresses as they were published; `/_next`, without which every hashed asset under `/_next/static/{buildId}/` — a build ID carries uppercase letters — would be 308'd to a path that does not exist; and `/article-images`, the asset root, which republishes the corpus's own file names and holds `theory/images/M87.jpg`.
- `packages/robusta-design-system` reached `dev` on 2026-07-30 through the merge `c0f98fe`, item 1 of the pyramid-v2 epic. The raw Claude Design output — CSS, assets, previews — was already there; the merge added what turns the folder into a workspace: `package.json` with its CSS and asset subpath exports, `src/`, `tsconfig.json` and its archi doc. It now builds inside `yarn build:deps`, between `pyramids-themes` and `pyramids-layouts`.
- Two parallel colour systems coexist: `pyramids-themes` (JS tokens) and each app's `tailwind.config.ts` DaisyUI palette. Changing one does not move the other, and the design system adds a third, CSS-variable-based one.
- DaisyUI is on its way out of the v2 site: the epic decided on 2026-07-29 that `apps/robusta-build` uses shadcn instead. Nothing has moved yet, and the reach is wide — `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` all render DaisyUI classes, and the Styling section of `CLAUDE.md` still mandates DaisyUI tokens. Treat both statements as live until that is worked through.
- The two build failures recorded during the design-system work were fixed on 2026-07-30 by the unblock-build story. Both were declaration defects, not code defects: no source file was changed. What they turned out to be is worth keeping, because the diagnosis generalises.
- `Next.js build worker exited with code: 1 and signal: null` names no cause. Read the prerender error printed above it, never the worker-exit line itself. Here the real error was a prerender failure on `/500`: `TypeError: Cannot read properties of null (reading 'useContext')`, thrown by `StyleRegistry` inside `styled-jsx`. Cause: two React copies inside `apps/robusta`. The app rendered with the release candidate `19.0.0-rc-66855b96-20241106` while `styled-jsx`, transitive through Next, resolved its own nested `react@19.1.1` — so `useContext` ran on the React that was not driving the render and got a null dispatcher. A caret over a release candidate admits any stable 19.x, which is what let the resolver place a different React per subtree. Fixed by converging every workspace on React 19.1.1 stable: after a clean install exactly one React resolves, and the same build produces 42/42 static pages.
- Meeting that worker-exit message on another app: look for a duplicate copy of a package holding process-wide state — React first — before anything else.
- Same defect class, second instance: `apps/robusta/vite.config.ts` failed type-check because `vite-tsconfig-paths` bound to a `vite@5` hoisted out of `services/scribe-intel-collector` while vitest used `vite@6`. Fixed by `apps/robusta` declaring `vite` itself, plus `yarn dedupe vite rollup`.
- The rule those two share, and the one to apply first: a package that imports something declares it, and a package that holds process-wide state must resolve to exactly one copy per graph. `pyramids-links` and `pyramids-ctas` import `next/*`; `pyramids-layouts` and `pyramids-ctas` import `@robusta/pyramids-helpers`; `packages/scribe-intel` imports `@opentelemetry/api` in three files. None of them declared it. All of them do now — as a peer where the copy must come from the host, so no resolver is authorised to place a second one in a subtree.
- `packages/scribe-intel` and `services/scribe-intel-collector` do not compile, and did not before that work either: `tsc` fails on source-level type errors — `VisitorHori` does not implement `Visitor`, and `intent.spec.ts` imports a `createIntelInstance` that no longer exists. They install cleanly, sit outside the green set, and are deliberately left unrepaired.
