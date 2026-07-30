# Architecture: design-system

**Last updated:** 2026-04-27

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-design-system` is the **brand layer** of the monorepo —
the hand-drawn sketchnote visual language for robusta.build. Unlike
`pyramids-themes` (pure JS-side design tokens) and `pyramids-layouts`
(generic UI primitives), this package bundles three things that travel
together: (1) the brand CSS (paper, ink, sketch palette + typography),
(2) the brand assets (Crystal Tux mascot SVGs, the wordmark PNG), and
(3) presentational React components that render those assets against
that CSS. All three ship from a single workspace package so consumers
import the brand as one unit.

## Diagram

```
┌──────────── @robusta/pyramids-design-system ────────────┐
│                                                         │
│  CSS (root of package, imported via subpath exports)    │
│  ├ colors_and_type.css   — vars: --paper / --ink /      │
│  │                         --font-sans / --t-h1 / ...   │
│  └ sketch.css            — .sk-box / .sk-btn /          │
│                            .sk-callout / .sk-arrow-right│
│                                                         │
│  ASSETS (root/assets/, imported via subpath exports)    │
│  ├ crystal-tux*.svg                                     │
│  ├ crystal-tux.png                                      │
│  └ robusta-build-wordmark.png                           │
│                                                         │
│  TS COMPONENTS (src/, built to dist/)                   │
│  ├ src/index.ts (barrel)                                │
│  │                                                      │
│  │   ┌────── primitives/ (stable, reusable) ──────┐     │
│  │   │ BrandLogo · SkButton · SkCallout            │     │
│  │   │ SkTag · SkInput · SkArrowRight              │     │
│  │   └─────────────────────────────────────────────┘     │
│  │                                                      │
│  │   ┌────── marketing/ (page-level surfaces) ────┐     │
│  │   │ Hero · SiteHeader · SiteFooter              │     │
│  │   │ ServicesGrid · FlowDiagram                  │     │
│  │   │ PrinciplesList · NotesPreview · CTA         │     │
│  │   └─────────────────────────────────────────────┘     │
│                                                         │
│  All TS components are RSC-safe (no 'use client').      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
                apps/robusta · apps/dakar · apps/intel-demo
                consume CSS + assets + components
```

## Key Components

### Primitives (`src/primitives/`)

| Component         | File                          | Responsibility                                                        |
|-------------------|-------------------------------|-----------------------------------------------------------------------|
| `BrandLogo`       | `BrandLogo.tsx`               | 💪 + 🏗 emoji + scanned wordmark PNG. Sizes: `compact` / `full` / `mark`. `wordmarkSrc` prop accepts a string or imported asset URL. |
| `SkButton`        | `SkButton.tsx`                | Wraps `.sk-btn` / `.sk-btn--primary` / `.sk-btn--ghost`.              |
| `SkCallout`       | `SkCallout.tsx`               | Wraps `.sk-callout` (speech-bubble framing).                          |
| `SkTag`           | `SkTag.tsx`                   | Wraps `.sk-tag` family. `tone`: `default` / `pink` / `blue` / `green`.|
| `SkInput`         | `SkInput.tsx`                 | Renders `.sk-input-wrap > .sk-input` — separate wrapper + input style props. |
| `SkArrowRight`    | `SkArrowRight.tsx`            | Hand-drawn rightward arrow (CSS background SVG).                      |

### Marketing surfaces (`src/marketing/`)

| Component         | File                          | Responsibility                                                        |
|-------------------|-------------------------------|-----------------------------------------------------------------------|
| `Hero`            | `Hero.tsx`                    | Headline + subtitle + dual CTA + mascot.                              |
| `SiteHeader`      | `SiteHeader.tsx`              | Top nav: logo, nav links, primary CTA.                                |
| `SiteFooter`      | `SiteFooter.tsx`              | 4-column footer with brand block + 3 link columns + bottom line.      |
| `ServicesGrid`    | `ServicesGrid.tsx`            | 3-column "what we do" cards with sticker offset + wobbly border.      |
| `FlowDiagram`     | `FlowDiagram.tsx`             | Horizontal numbered-step flow on dotted-grid paper background.        |
| `PrinciplesList`  | `PrinciplesList.tsx`          | 2-column checkmark + key + sub list.                                  |
| `NotesPreview`    | `NotesPreview.tsx`            | 2-column blog-post preview rows with date + title + tag.              |
| `CTA`             | `CTA.tsx`                     | Closing CTA: mascot + headline + email input + button + footnote.    |

Every marketing surface accepts its content as props with **defaults that
match the original `ui_kits/marketing/*.jsx` prototype copy** — so consumers
that don't override anything see the prototype out of the box.

## Public API

```ts
// import '@robusta/pyramids-design-system/colors_and_type.css';
// import '@robusta/pyramids-design-system/sketch.css';
// import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png';
// import tuxSvg   from '@robusta/pyramids-design-system/assets/crystal-tux.svg';

import {
  // primitives
  BrandLogo,    type BrandLogoProps,
  SkButton,     type SkButtonProps,
  SkCallout,    type SkCalloutProps,
  SkTag,        type SkTagProps, type SkTagTone,
  SkInput,      type SkInputProps,
  SkArrowRight, type SkArrowRightProps,
  // marketing
  Hero,           type HeroProps,
  SiteHeader,     type SiteHeaderProps,     type NavLink,
  SiteFooter,     type SiteFooterProps,     type FooterColumn,
  ServicesGrid,   type ServicesGridProps,   type ServiceItem,
  FlowDiagram,    type FlowDiagramProps,    type FlowStep,
  PrinciplesList, type PrinciplesListProps, type Principle,
  NotesPreview,   type NotesPreviewProps,   type NotePost,
  CTA,            type CTAProps,
} from '@robusta/pyramids-design-system';
```

## Subpath exports map

```
.                                            → dist/index.{js,d.ts}     (barrel)
./sketch.css                                 → ./sketch.css
./colors_and_type.css                        → ./colors_and_type.css
./assets/crystal-tux.svg                     → ./assets/crystal-tux.svg
./assets/crystal-tux.png                     → ./assets/crystal-tux.png
./assets/crystal-tux-head.svg                → ./assets/crystal-tux-head.svg
./assets/crystal-tux-waving.svg              → ./assets/crystal-tux-waving.svg
./assets/crystal-tux-thinking.svg            → ./assets/crystal-tux-thinking.svg
./assets/robusta-build-wordmark.png          → ./assets/robusta-build-wordmark.png
```

## Dependencies

- **Depends on:** `react` only. No workspace-level dependency.
- **Used by:** (intended) `apps/robusta` (smoke test page added in this
  iteration; live home-page rebuild deferred to a follow-up feature),
  later `apps/dakar` and `apps/intel-demo`.
- **Build:** `tsc → dist/`. Runs as the **third** step in `yarn build:deps`,
  immediately after `pyramids-themes` and before `pyramids-layouts`. The
  CSS and assets are not produced by `tsc`; they ship as static files at
  the package root and are exposed via the `exports` map.

## Notes / Gotchas

- **The `colors_and_type.css` `@import` line loads IBM Plex Sans / IBM Plex
  Mono / Caveat from Google Fonts.** This contradicts the `README.md`'s
  stated stack of Caveat / Kalam / Architects Daughter / JetBrains Mono.
  See `decisions-and-questions.md` Flag F1. Components read CSS variables,
  so the rendered family is whatever the CSS resolves to. **Either edit
  the CSS or edit the README** before adding more components.
- **`BrandLogo.wordmarkSrc` defaults to a hard-coded fallback string** that
  is unlikely to resolve. Consumers MUST pass an imported asset URL:
  ```ts
  import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png';
  <BrandLogo wordmarkSrc={typeof wordmark === 'string' ? wordmark : wordmark.src} />
  ```
  The reason: `tsc` with `rootDir: src` cannot reach `../assets/` and we
  don't ship a custom `.d.ts` for PNG modules. Pushing the asset import to
  the consumer side is also more flexible — apps may provide their own
  wordmark.
- **Marketing components are server components.** None mark `'use client'`.
  Wiring up the booking flow / form submit happens at the consumer-app level
  via a thin client wrapper.
- **The `<button>` tags inside `SkButton` don't have `onClick` handlers** —
  they're presentational. Consumers wrap the button (or the component
  containing it) in a `'use client'` parent if they need browser behavior.
- **Defaults preserve the prototype copy** for marketing components. This
  is intentional so the visual demo matches what's been signed off in
  `preview/*.html`. Consumers should override every text-bearing prop for
  real production pages.
- **`crystal-tux.png` and `crystal-tux.svg` are duplicates** in different
  formats. Prefer the SVG. The PNG is kept for callers that genuinely need
  raster (e.g. OG-image rendering pipelines).
- **`robusta-build-wordmark.png` is 1603×312** — heavier than ideal. A
  vectorized SVG version is a worthwhile follow-up. Tracked as flag F2 in
  `decisions-and-questions.md`.
- **`preview/*.html` and `ui_kits/marketing/*.jsx` are NOT shipped** in the
  npm tarball. They live only in the source repo as historical reference
  / Storybook-equivalent specimens. The `package.json#files` whitelist
  enforces this.
- **No tests.** This package is a presentational TSX layer; the only
  meaningful "test" is `yarn workspace @robusta/pyramids-design-system run
  build` succeeding. Visual regression should happen at the consumer-app
  level (or via a future Storybook integration of `preview/`).
