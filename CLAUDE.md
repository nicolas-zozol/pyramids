# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

`@robusta/pyramids` — a yarn-workspaces monorepo that powers multiple SEO content sites from a shared component/library base. Deployed on Vercel using Next.js (App Router) with React Server Components and ISR. TypeScript is the default everywhere. Some packages (telemetry, services) target Node + Express.

The three workspace roots are:

- `apps/*` — deployable Next.js sites and standalone front/server demos
- `packages/*` — shared libraries consumed by the apps (built to `dist/`)
- `services/*` — backend services (Express collector + docker-compose observability stack)

## Apps

- `@robusta/robusta-build` — `apps/robusta-build`. robusta.build version 2, and where new work goes. Tailwind 4 with shadcn, its own design system, no DaisyUI. It carries the v2 route table over a fixture corpus — 62 static pages, every one of them a placeholder. Real page copy arrives with robusta-landing-page and migrate-learn-content. See its own README and `robusta-build.archi.md`.
- `@robusta/build` — `apps/robusta`. robusta.build version 1: blog under `/learn`, portfolio, prosemirror. Being retired — do not add to it, and do not refactor it.
- `@robusta/dakar` — `apps/dakar`. dakar.surf, the surf guide. Uses MapLibre, has a `[locale]` segment and spot pages. Live, and out of the v2 scope.
- intel-demo — `apps/intel-demo`. Vite front + server demo for the scribe-intel SDK. Not a workspace: it carries no `package.json`.

Each Next.js app has a `src/seopyramids.config.ts` that defines `domain`, `siteName`, `defaultLocale`, `otherLocales`, blog roll size, etc. — that's the per-site source of truth.

`apps/robusta` documents the v1 routing scheme (locale, `page`, `s` discriminants for ISR) in its own README. Preserve that structure when editing v1; the v2 scheme is its own — discriminants `l`, `c`, `p`, `t` under a site-named content root — and is documented in the Routing section of `apps/robusta-build/README.md`.

## Packages

Packages publish their compiled output (`main: dist/index.js`, `types: dist/index.d.ts`), so **apps consume the built artefacts, not the TS sources**. Any change to a package needs a rebuild (or a watcher) before the consuming app sees it.

- `pyramids-routing` — the v2 URL scheme as pure string functions: the discriminants `l`, `c`, `p`, `t`, plus `buildUrl`, `parseUrl`, `urlSet`, `validateArticles`. No dependency, no React, no Next; first in `build:deps`. Holds no site's content root.
- `pyramids-helpers` — react/router/style/theme/time/array helpers (incl. `twCss` merge)
- `pyramids-themes` — DaisyUI theme + colors
- `robusta-design-system` — published as `@robusta/pyramids-design-system`: CSS tokens, brand assets, 6 sketch primitives and 8 marketing surfaces. Belongs to the robusta site alone; no other site reuses it.
- `pyramids-layouts` — cards / columns / grid / spacers
- `pyramids-links` — `client-link`, `server-link`, `standard`
- `pyramids-ctas` — CTA buttons (`fat`, `linkedin`, `phone`, `cta-link`)
- `scribe-intel` — telemetry/intent/visitor SDK (OpenTelemetry-based)

## Services

- `services/scribe-intel-collector` — Express + OTel + Prometheus exporter (vite-node for dev)
- `services/scribe-intel-backend` — docker-compose stack (Loki, Tempo, Prometheus) with the corresponding configs

## Commands

Run from the repo root unless noted.

### Install / clean

Node 22 (`.nvmrc`) and yarn 4.17.1, declared by `packageManager` in the root manifest and activated by corepack — run `corepack enable` once, and never assume a globally installed yarn. `.yarnrc.yml` sets `nodeLinker: node-modules`, so the on-disk layout that `tsc`, `next build` and vitest expect is the one produced; unknown CLI options are errors under yarn 4, not warnings.

```bash
yarn install         # install everything
yarn clean           # rm -rf packages/*/dist and root node_modules
yarn clean:install   # clean then reinstall
```

### Build packages (required before/during app builds)

```bash
yarn build:deps      # builds routing → helpers → themes → design-system → layouts → links → ctas in order
yarn build:robusta-build  # build:deps then `next build` for apps/robusta-build (v2)
yarn build:robusta   # build:deps then `next build` for apps/robusta (v1)
yarn build:dakar     # build:deps then `next build` for apps/dakar
```

### Dev servers

```bash
yarn dev:robusta-build  # apps/robusta-build with Next.js + Turbopack
yarn dev:robusta     # apps/robusta with Next.js + Turbopack
yarn dev:dakar       # apps/dakar with Next.js + Turbopack
yarn dev:dev         # concurrent: links + layouts + ctas + helpers watchers, plus dev:robusta
```

When editing shared package code while a dev server is running, keep the watcher up — without it, the app keeps consuming the old `dist/`. Individual watchers: `yarn w:routing`, `w:helpers`, `w:themes`, `w:design-system`, `w:layouts`, `w:ctas`, `w:links`, `w:deps`.

### Lint / format

```bash
yarn lint            # eslint over packages/**/src/**/*.{ts,tsx}
```

Each Next.js app also has its own `next lint`. Note: `next.config.ts` in both apps sets `eslint.ignoreDuringBuilds: true`, so lint is **not gated by the build** — run it explicitly.

Prettier config lives in `prettier.config.js` (single quotes, semi, trailing comma all, printWidth 80, tailwindcss plugin, proseWrap always).

### Tests

Vitest is set up in `apps/robusta`, `packages/scribe-intel`, `packages/helpers`, `packages/pyramids-routing`, and `services/scribe-intel-collector`. Only `packages/pyramids-routing` declares a `test` script (`yarn workspace @robusta/pyramids-routing run test`, 78 tests); elsewhere, invoke vitest from the workspace itself:

```bash
yarn workspace @robusta/build exec vitest run            # apps/robusta
yarn workspace @robusta/scribe-intel exec vitest run     # packages/scribe-intel
```

There is no root-level `yarn test`.

## Conventions enforced in this repo

These come from `.cursor/rules/*.mdc` and apply to all generated code.

### TS imports — extension rule (critical)

In TypeScript files, **local imports must end with `.js`** even though the source is `.ts` / `.tsx`:

```ts
import dotenv from 'dotenv';                       // package — no extension
import { getOpenAiKey } from '../api/get-key.js';  // local — `.js` even though it's get-key.ts
```

`apps/dakar/next.config.ts` enables this via `experimental.extensionAlias`. If you touch a file with a non-`.js` local import, **flag it but do not silently rewrite it** — that's the project policy.

### React / Next.js

- Functional components only; never `React.FC`. Define `interface FooProps` and a plain function.
- Favor named exports; file name = component name in PascalCase (`Header.tsx`).
- Use directories in lowercase-with-dashes.
- Prefer RSC + ISR over client components. Limit client-side state.
- Use Effector when a single user action would require coordinating >3 related `useState` hooks or sharing state across siblings without prop-drilling dispatch.
- Do **not** refactor existing component code for style/lint — that explodes diff size. Only modify what's required for the task.

### Styling

Which rule applies depends on the site.

`apps/robusta-build`, the v2 site, does not use DaisyUI. Its colours, type, spacing and radii come from `@robusta/pyramids-design-system` and from nowhere else — BR-PYRAMID-6 in `business-rules.md`. The site may add a name, never a value: `src/app/globals.css` aliases the names a third-party token layer expects onto design-system tokens, and every entry there is an alias. Components come from shadcn on Tailwind 4. Do not reach for `pyramids-layouts`, `pyramids-links` or `pyramids-ctas` from this site — they render DaisyUI classes and the shadcn decision deprecates them.

The rest of this section governs `apps/robusta` and `apps/dakar`, which are on DaisyUI and stay there.

Stick to DaisyUI semantic tokens. Avoid `bg-red-500` / `text-blue-700`-style raw Tailwind colors:

- `primary` — main action / UI position (Robusta primary is `#921514`)
- `secondary` — brand color (Robusta `#00F4CF`, "violet" in the rules even though hex is teal — follow the hex)
- `accent` — CTAs (`#02284c`)
- `neutral` — cancel / close
- `base-100/200/300` — white / light grey / grey

Always pair a `bg-*` with the matching `text-*-content`. Use `gaps`, not margins, for spacing inside lists/collections.

For a non-trivial component, expose `extraClasses?: string` and merge with `twCss(...)` from `pyramids-helpers`.

### Responsive — `mob` breakpoint

Tailwind config adds a `mob` breakpoint (= `max: md`, the inverse of `sm`). Prefer `mob:hidden`, `mob:flex-col`, etc. Use `sm` and `lg`; ignore `md`/`xl`/`2xl` unless already present (don't strip them).

### Server actions / Zod (`*.action.ts`, `*.zod.ts`)

- Action files start with `'use server'` and use `next-safe-action` (`createSafeActionClient().schema(...).action(...)`).
- Zod schemas live in `src/models/validation/*.zod.ts` and are **shared between client and server** (single source of truth).
- Compose small schemas; don't put DB internals in the action return shape.
- Client side: call via `useAction` from `next-safe-action/hooks`.
- Tests: vitest, mock `getServerSession` etc. via `vi.mocked`.

### Telemetry

Not on the v2 site. BR-PYRAMID-2 states that a site built on the version 2 base must not track visitor intents, so `apps/robusta-build` wires no telemetry client and depends on `@robusta/scribe-intel` nowhere. Do not add one there, whatever the section below says.

On `apps/robusta` and `apps/dakar`: `@robusta/scribe-intel` exposes a `Telemetry` class (log/error/component) wrapping OpenTelemetry. Add `Telemetry.component(...)` at the top of pages / components / functions where logging is wanted, and use `Telemetry.log` / `Telemetry.error` consistently.

### Other

- MongoDB: never put methods on Mongoose models — keep them as data, use separate Domain Objects.
- Use `nuqs` for URL search-param state.
- Use `next/image` with WebP, explicit `sizes`, descriptive `alt`. Component-local images live next to the component; only put genuine public assets in `public/`.
- Avoid `any` — use `unknown` or precise types. Prefer interfaces over `type` for object shapes.
- TypeScript path alias resolution in tests: vitest configs use `vite-tsconfig-paths`.

## Git

- Default branch: `main`. Active development on `dev`.
- Commit style: prefixed `feat(scope):`, `fix(scope):`, `chore(scope):` (see recent log: `feat(design):`, `feat(home):`, `fix(spots):`).
- NEVER COMMIT nor PUSH if I don't say it
