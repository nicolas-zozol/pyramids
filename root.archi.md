# Architecture: root (@robusta/pyramids)

**Last updated:** 2026-07-30

## Parent

_None — this is the root._

## Children

- [helpers](packages/helpers/helpers.archi.md)
- [themes](packages/themes/themes.archi.md)
- [layouts](packages/layouts/layouts.archi.md)
- [links](packages/links/links.archi.md)
- [ctas](packages/ctas/ctas.archi.md)
- [scribe-intel](packages/scribe-intel/scribe-intel.archi.md)
- [design-system](packages/robusta-design-system/design-system.archi.md)
- apps and services have no `.archi.md` yet

## Overview

Pyramids is a yarn-workspaces monorepo whose purpose is to build several SEO content sites from one shared base instead of rewriting a site each time. The shared base is: a Vercel + Next.js App Router backbone with React Server Components and ISR, a set of small React packages (layouts, links, CTAs, helpers, themes), and a content pipeline that turns markdown files into rendered, indexable pages. On top of that base, each site brings its own design system and its own content. Today two sites exist — robusta.build and dakar.surf — plus a demo app for the telemetry SDK.

The project is in a v2 restart (see `features/pyramid-v2-epic/pyramid-v2.epic.md`). The v1 site `apps/robusta` is considered unmaintainable; v2 rebuilds the robusta site from scratch, reuses only its markdown content, simplifies the SEO URL scheme, and gives the site a real design system generated with Claude Design. Only the robusta site is in scope for v2.

## Diagram

```
┌──────────────────────────── @robusta/pyramids (yarn workspaces) ────────────────────────────┐
│                                                                                             │
│   apps/                          packages/                        services/                 │
│   ┌───────────────────┐          ┌──────────────────────┐         ┌─────────────────────┐   │
│   │ robusta   (v1)    │          │ helpers              │         │ scribe-intel-       │   │
│   │ robusta.build     │◄─────────│ themes               │         │ collector (Express) │   │
│   │ Next 15, RSC/ISR  │          │ layouts              │         └──────────┬──────────┘   │
│   ├───────────────────┤          │ links                │                    │              │
│   │ dakar     (live)  │◄─────────│ ctas                 │                    ▼              │
│   │ dakar.surf        │          │ scribe-intel  (SDK)  │────────►┌─────────────────────┐   │
│   │ Next 15 + MapLibre│          │                      │         │ scribe-intel-backend│   │
│   ├───────────────────┤          ├──────────────────────┤         │ Loki · Tempo ·      │   │
│   │ intel-demo (Vite) │◄─────────│ robusta-design-system│         │ Prometheus (docker) │   │
│   ├───────────────────┤          │ (per-site tokens +   │         └─────────────────────┘   │
│   │ robusta-design    │          │  primitives)         │                                   │
│   │ (v0 prototype)    │          └──────────────────────┘                                   │
│   └───────────────────┘                                                                     │
│                                                                                             │
│   packages build to dist/ ──► apps consume the built artefacts, never the TS sources        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                                   Vercel (RSC + ISR)
```

## Key Components

- apps/robusta (`@robusta/build`) — robusta.build, the v1 Next.js site: blog under `/learn`, portfolio, prosemirror editor. Its README owns the current routing scheme. Declared a thrash by the epic; kept for its markdown content under `content/blog`.
- apps/dakar (`@robusta/dakar`) — dakar.surf, the surf guide. Next.js with a `[locale]` segment, spots pages and MapLibre maps. Out of v2 scope but shares the same packages.
- apps/intel-demo — Vite front + Express server demo of the scribe-intel SDK. Not deployed as a content site.
- apps/robusta-design — v0 design prototype (prompt, uploads, HTML). Superseded by `packages/robusta-design-system`, not yet removed.
- packages/helpers — cross-cutting utilities (style/`twCss`, router, theme, react, time, arrays, debug). Everything else depends on it.
- packages/themes — JS-side design tokens (`pyramidsColors`, `PyramidsTheme`, per-site overrides). Separate from each app's DaisyUI/Tailwind palette.
- packages/layouts, packages/links, packages/ctas — the shared presentational libraries: structural primitives, `next/link` wrappers with server/client navigators, call-to-action widgets.
- packages/robusta-design-system — the robusta site's own design system: CSS tokens (`colors_and_type.css`, `sketch.css`), brand assets, HTML previews, 6 React primitives and 8 marketing surfaces.
- packages/scribe-intel — telemetry and product-analytics SDK over OpenTelemetry. Deliberately unused by the v2 site.
- services/scribe-intel-collector, services/scribe-intel-backend — the receiving end of the telemetry SDK: an Express + OTel collector exporting to a docker-compose Loki/Tempo/Prometheus stack.

## Data Flow — a content site

```
content markdown (apps/robusta/content/blog for v1 — see the gotchas)
        │
        ▼
  build-time parsing ── categories, slugs, blog roll
        │
        ▼
  Next.js App Router (RSC)  ◄── seopyramids.config.ts  (domain, siteName, locales, rollSize)
        │                   ◄── packages: layouts · links · ctas · helpers · design system
        ▼
  static generation + ISR  ── routes carry explicit discriminants (locale, page, p)
        │                     so pregeneration never needs runtime searchParams
        ▼
      Vercel
```

Each site holds its per-site truth in `src/seopyramids.config.ts`: domain, site name and title, mission, logo, default and other locales, and the blog configuration (roll size, mandatory keywords, author, category resolver).

## Data Flow — build chain

```
yarn build:deps
   helpers ──► themes ──► design-system ──► layouts ──► links ──► ctas   (tsc, each to dist/)
        │
        ▼
yarn build:robusta / build:dakar ──► next build
```

Apps resolve packages through their compiled `dist/`. A package change is invisible to a running app until it is rebuilt, so `yarn dev:dev` runs the watchers alongside the dev server.

The green set — what must build from a clean checkout, in this order: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`. Verified end to end on 2026-07-30 from a wiped tree: dakar produced 23/23 static pages on a route table identical to its baseline, robusta 42/42, and a second `yarn install` left `yarn.lock` byte-identical. `apps/robusta-build` joins the set the day `bootstrap-robusta-build` creates it.

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
- The v1 article corpus is `apps/robusta/content/blog`, 11 articles — arbitrated 2026-07-29, and it is what the v1 code actually reads. The 13 articles of `apps/robusta/public/learn` are not the corpus: 8 are common to both trees, 5 exist only there and fall outside the arbitrated set. What becomes of those 5 is still open in the migrate-learn-content story.
- The v2 restart target `apps/robusta-build` does not exist yet — the epic names it, nothing has been created.
- `packages/robusta-design-system` reached `dev` on 2026-07-30 through the merge `c0f98fe`, item 1 of the pyramid-v2 epic. The raw Claude Design output — CSS, assets, previews — was already there; the merge added what turns the folder into a workspace: `package.json` with its CSS and asset subpath exports, `src/`, `tsconfig.json` and its archi doc. It now builds inside `yarn build:deps`, between `pyramids-themes` and `pyramids-layouts`.
- Two parallel colour systems coexist: `pyramids-themes` (JS tokens) and each app's `tailwind.config.ts` DaisyUI palette. Changing one does not move the other, and the design system adds a third, CSS-variable-based one.
- DaisyUI is on its way out of the v2 site: the epic decided on 2026-07-29 that `apps/robusta-build` uses shadcn instead. Nothing has moved yet, and the reach is wide — `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` all render DaisyUI classes, and the Styling section of `CLAUDE.md` still mandates DaisyUI tokens. Treat both statements as live until that is worked through.
- The two build failures recorded during the design-system work were fixed on 2026-07-30 by the unblock-build story. Both were declaration defects, not code defects: no source file was changed. What they turned out to be is worth keeping, because the diagnosis generalises.
- `Next.js build worker exited with code: 1 and signal: null` names no cause. Read the prerender error printed above it, never the worker-exit line itself. Here the real error was a prerender failure on `/500`: `TypeError: Cannot read properties of null (reading 'useContext')`, thrown by `StyleRegistry` inside `styled-jsx`. Cause: two React copies inside `apps/robusta`. The app rendered with the release candidate `19.0.0-rc-66855b96-20241106` while `styled-jsx`, transitive through Next, resolved its own nested `react@19.1.1` — so `useContext` ran on the React that was not driving the render and got a null dispatcher. A caret over a release candidate admits any stable 19.x, which is what let the resolver place a different React per subtree. Fixed by converging every workspace on React 19.1.1 stable: after a clean install exactly one React resolves, and the same build produces 42/42 static pages.
- Meeting that worker-exit message on another app: look for a duplicate copy of a package holding process-wide state — React first — before anything else.
- Same defect class, second instance: `apps/robusta/vite.config.ts` failed type-check because `vite-tsconfig-paths` bound to a `vite@5` hoisted out of `services/scribe-intel-collector` while vitest used `vite@6`. Fixed by `apps/robusta` declaring `vite` itself, plus `yarn dedupe vite rollup`.
- The rule those two share, and the one to apply first: a package that imports something declares it, and a package that holds process-wide state must resolve to exactly one copy per graph. `pyramids-links` and `pyramids-ctas` import `next/*`; `pyramids-layouts` and `pyramids-ctas` import `@robusta/pyramids-helpers`; `packages/scribe-intel` imports `@opentelemetry/api` in three files. None of them declared it. All of them do now — as a peer where the copy must come from the host, so no resolver is authorised to place a second one in a subtree.
- `packages/scribe-intel` and `services/scribe-intel-collector` do not compile, and did not before that work either: `tsc` fails on source-level type errors — `VisitorHori` does not implement `Visitor`, and `intent.spec.ts` imports a `createIntelInstance` that no longer exists. They install cleanly, sit outside the green set, and are deliberately left unrepaired.
