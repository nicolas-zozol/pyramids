# packagify-design-system

**Branch:** feat/packagify-design-system
**Status:** DONE
**Date:** 2026-04-27

## What was built

`packages/robusta-design-system/` is now a real yarn-workspace package
named **`@robusta/pyramids-design-system`** (version 1.0.0). It builds
via `tsc` to `dist/` and exposes its CSS, assets, and TS components to
consumer apps.

### Public surface

- **CSS subpath imports:**
  - `@robusta/pyramids-design-system/colors_and_type.css`
  - `@robusta/pyramids-design-system/sketch.css`
- **Asset subpath imports:** all 6 assets under `assets/` (5 SVGs + the
  wordmark PNG, plus `crystal-tux.png`).
- **Component imports** from the package root barrel:
  - **Primitives:** `BrandLogo`, `SkButton`, `SkCallout`, `SkTag`,
    `SkInput`, `SkArrowRight`
  - **Marketing:** `Hero`, `SiteHeader`, `SiteFooter`, `ServicesGrid`,
    `FlowDiagram`, `PrinciplesList`, `NotesPreview`, `CTA`
- **All components are server-component-safe** (no `'use client'`).
- **All marketing components accept content as props** with defaults that
  match the original `ui_kits/marketing/*.jsx` prototype copy.

### Build wiring

- Root `package.json#scripts.build:deps` now includes the new package,
  positioned after `pyramids-themes` and before `pyramids-layouts`.
- `apps/robusta/package.json` declares `@robusta/pyramids-design-system: 1.0.0`
  as a dependency.
- A smoke-test page at `apps/robusta/src/app/_design-test/page.tsx` validates
  CSS + asset + component import resolution. The leading `_` keeps it
  outside Next.js routing.

### Verification

- `yarn install` — succeeded (16.30s).
- `yarn workspace @robusta/pyramids-design-system run build` — succeeded.
  `dist/index.{js,d.ts}` plus per-component `.js`/`.d.ts` produced under
  `dist/primitives/` and `dist/marketing/`.

### Pre-existing issues (NOT fixed, NOT introduced)

- `pyramids-links` `tsc` build fails in fresh worktrees due to
  `next/link` / `next/navigation` resolution — needs `next` declared as
  a peerDependency in `packages/links/package.json`.
- `apps/robusta` `next build` crashes during static page generation
  (Next.js build worker exit code 1) — pre-existing on `dev` independent
  of this feature.

Both are flagged in `decisions-and-questions.md` as F5 / F6.

## Key decisions

See `decisions-and-questions.md` for the full log. Highlights:

- **Q1** — Package name: `@robusta/pyramids-design-system` (matches the
  `pyramids-*` family).
- **Q3** — CSS shipped as **two separate subpath exports**, not a combined
  index. Caller controls the import order.
- **Q4** — Assets stay at `packages/.../assets/` and ship via `exports`
  map. No copy step.
- **Q5** — All 9 prototype components ported, with prop-driven content
  and prototype copy as defaults.
- **Q6** — Components split into `primitives/` (stable) and `marketing/`
  (page-level surfaces). `Sk-` prefix matches `.sk-*` CSS class convention.
- **Q7** — Server-component-safe. No `'use client'`.
- **Q12** — Inline `IBM Plex Sans` removed during port. Components read
  CSS variables instead. Visual is unchanged because the shipped CSS
  already loads IBM Plex Sans.

## Flags for follow-up

- **F1** — Font mismatch: README says Caveat / Kalam / Architects Daughter
  / JetBrains Mono; CSS actually loads IBM Plex Sans / Plex Mono / Caveat.
  User must decide which is canonical.
- **F2** — Wordmark PNG is heavy (1603×312). Vectorize as SVG follow-up.
- **F3** — `crystal-tux.png` and `crystal-tux.svg` are duplicates. Pick
  the SVG as canonical.
- **F4** — Inline `IBM Plex Sans` was silently removed during port. Visual
  result is identical when `colors_and_type.css` is loaded.
- **F5** — `pyramids-links` `tsc` build is brittle (latent monorepo bug).
- **F6** — `apps/robusta` `next build` worker crash (pre-existing).

## How to test

1. Pull `feat/packagify-design-system` and run `yarn install` from the repo
   root.
2. `yarn workspace @robusta/pyramids-design-system run build` should produce
   a populated `dist/`.
3. (Once F5/F6 are fixed) `yarn dev:robusta` and visit
   `http://localhost:3000/_design-test` — should not be reachable (private
   folder) but the build should succeed.
4. Inspect the smoke-test page source at
   `apps/robusta/src/app/_design-test/page.tsx` for the canonical import
   pattern.

## Deferred to next features

- Wiring the new components into `apps/robusta`'s live home page
  (`src/app/page.tsx`).
- Vectorizing the wordmark PNG.
- Aligning the README font stack with the actual CSS @import.
- Fixing F5 / F6 monorepo build issues.
- Storybook integration of `preview/*.html`.
