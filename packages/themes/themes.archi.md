# Architecture: themes

**Last updated:** 2026-04-28

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-themes` is the JS-side **design-token** package: a flat
named palette (`pyramidsColors`) and a typed `PyramidsTheme` shape with
per-site overrides. The default `standardPyramidsTheme` defines every
slot; `robustaTheme` and `dakarTheme` patch a few keys on top via a
deep-merge `getTheme(site)`. This is **separate from the apps' DaisyUI /
Tailwind theme** (which lives in each app's `tailwind.config.ts`) — the
package targets non-Tailwind use cases (inline styles, CSS variables,
SSR-rendered prosemirror, etc.).

## Diagram

```
┌────────────────── @robusta/pyramids-themes ──────────────────┐
│                                                              │
│                    src/index.ts (barrel)                     │
│                            │                                 │
│        ┌───────────────────┴───────────────────┐             │
│        ▼                                       ▼             │
│   src/colors/                            src/themes/         │
│   ├ pyramidsColors          standardPyramidsTheme   ◄── base │
│   │   (palette + alpha())          │                         │
│   │                          ┌─────┴─────┐                   │
│   │                          ▼           ▼                   │
│   │                     dakarTheme   robustaTheme            │
│   │                     (Partial)    (Partial)               │
│   │                                                          │
│   │                          getTheme(site) deep-merges      │
│   │                          standard + site override        │
│   │                                                          │
│   └──── colors used by every theme via pyramidsColors        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    apps/robusta · apps/dakar
                    (consume PyramidsTheme directly)
```

## Key Components

| Component                  | File                                  | Responsibility                                                                |
|----------------------------|---------------------------------------|-------------------------------------------------------------------------------|
| `pyramidsColors`           | `src/colors/pyramidsColors.ts`        | Flat named palette (`almostBlack`, `darkerBlue`, `lightGrey`, …) + helper `alpha(color, 0.6)` to append a hex alpha byte. |
| `PyramidsTheme` (interface)| `src/themes/standard.ts`              | Typed slots: `text`, `buttonPrimary/Secondary/Cancel`, `link`, `menu`, `background`, `table`, `separation`, `ctaPrimary/Secondary/Other`, `card`, `panel`. |
| `standardPyramidsTheme`    | `src/themes/standard.ts`              | Default palette mapping (used as the merge base for every site).              |
| `robustaTheme`             | `src/themes/robusta-theme.ts`         | `Partial<PyramidsTheme>` — only overrides `background.body`.                  |
| `dakarTheme`               | `src/themes/dakar-theme.ts`           | `Partial<PyramidsTheme>` — overrides `background.body` and `ctaPrimary`.      |
| `getTheme(site)`           | `src/themes/get-theme.ts`             | Deep-merge resolver: `standard ⊕ siteOverrides` for each named slot.          |

### `pyramidsColors` palette

```
almostBlack    #010122
darkerBlue     #0E0E2B
darkBlue       #01013D
otherDarkBlue  #0E0E2B   (alias of darkerBlue)
white          #FFFFFF
almostWhite    #FDF9FF
lightGrey      #E9E5F4
alphaGrey6     rgba(255, 255, 255, 0.6)
darkGrey       #53536E
black          #000

alpha(color, opacity) → returns `${color}${hex(opacity*255)}`
```

## Public API (`src/index.ts`)

```
export * from './colors';                                 // pyramidsColors
export { PyramidsTheme, standardPyramidsTheme } from './themes/standard';
```

## Interfaces

```
┌──────────────────────────────────────────────────────────────────┐
│ PyramidsTheme                                                    │
├──────────────────────────────────────────────────────────────────┤
│ main: string                                                     │
│ opposite: string                                                 │
│ text:        { main, secondary, opposite, filledText }           │
│ buttonPrimary / buttonSecondary / buttonCancel: { text, bg }     │
│ link:        { standardLinkColor }                               │
│ menu:        { menuLinkColor, …SelectedBackgroundColor,          │
│                …SelectedColor }                                  │
│ background:  { body, hero, panelBackground, boxShadow }          │
│ table:       { rowSeparator }                                    │
│ separation:  { border, secondary, hr }                           │
│ ctaPrimary / ctaSecondary / ctaOther: { text, bg }               │
│ card:        { text, bg, borderColor, boxShadow }                │
│ panel:       { text, bg, borderColor, boxShadow }                │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow — `getTheme`

```
getTheme('dakar')
        │
        ▼
   baseTheme    = standardPyramidsTheme
   overrides    = dakarTheme
        │
        ▼
   { ...base, ...overrides,
     text:          { ...base.text,         ...overrides.text         },
     buttonPrimary: { ...base.buttonPrimary,...overrides.buttonPrimary},
     ... (one explicit shallow-merge per named slot) ... }
        │
        ▼
   PyramidsTheme  (fully populated, override wins per leaf key)
```

The merge is **manual one-level deep** — no library — so adding a new slot
to `PyramidsTheme` requires also adding a `{...base.X, ...overrides.X}`
entry in `getTheme.ts`. Forgetting it means the override silently no-ops.

## Dependencies

- **Depends on:** `react` only (declared, but the source has no React imports — it's pure data).
- **Used by:**
  - `pyramids-layouts` (declares it as a workspace peer)
  - `pyramids-ctas` (workspace peer)
  - `apps/robusta`, `apps/dakar` (consume `PyramidsTheme` and `pyramidsColors`)
- **Build:** `tsc` → `dist/`. Built second in `yarn build:deps` (after `helpers`, before `layouts`/`ctas`).

## Notes / Gotchas

- **`getTheme` is not exported.** `src/index.ts` only re-exports
  `pyramidsColors`, `PyramidsTheme` (the type), and
  `standardPyramidsTheme`. Apps that want a per-site palette have to
  deep-import or call the function locally — flag if you need it on the
  public surface.
- **`getTheme` is not exhaustive.** It deep-merges every slot **except
  `card`**. A `siteOverride.card` will be dropped on the floor. None of
  the current site overrides set `card`, so the bug is latent — but worth
  fixing the next time someone touches it.
- **Types vs shipped exports.** `getTheme.ts`, `dakar-theme.ts`, and
  `robusta-theme.ts` exist in the build output (`tsc` compiles all `.ts`
  under `src/`) but they are not re-exported through the barrel. Whether
  consumers can deep-import them depends on the Vercel/Next bundler — keep
  the barrel as the only stable surface.
- **Disconnected from DaisyUI.** This package's `PyramidsTheme` is **not**
  the source of truth for the apps' Tailwind/DaisyUI palette (those are
  hard-coded in each app's `tailwind.config.ts` — Robusta's `primary`
  `#921514`, etc.). The two systems live in parallel; touching one does
  not move the other.
- **`alpha` returns a string with no validation.** Calling
  `alpha('#01013D', 0.6)` yields `'#01013D99'`. Passing an
  `rgb(...)` value would silently produce garbage — only feed it hex.
- **`darkerBlue` and `otherDarkBlue` are the same value (`#0E0E2B`).**
  Likely a leftover from a prior split — pick one before adding usage.
- **Inline literal hexes in `standardPyramidsTheme`.** Some slots use
  `pyramidsColors.almostBlack`, others use raw `'#01013D'` or `'#FFFFFF'`.
  These should align with palette names eventually so the palette is the
  single source of truth.
