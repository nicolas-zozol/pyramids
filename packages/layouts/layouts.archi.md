# Architecture: layouts

**Last updated:** 2026-04-28

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-layouts` is a tiny React component library of structural
primitives — columns, cards, a responsive grid, a vertical spacer — used by
`apps/robusta` and `apps/dakar` to compose pages without re-implementing the
same Tailwind containers each time. Components are purely presentational
(no state, no effects), and depend on `pyramids-helpers` for `twCssAll`.
The package builds to `dist/` via `tsc`; apps need `yarn build:deps` to see
changes.

## Diagram

```
┌────────────────────── @robusta/pyramids-layouts ──────────────────────┐
│                                                                       │
│                       src/index.ts (barrel)                           │
│                              │                                        │
│   ┌──────────────┬───────────┼────────────┬──────────────┐            │
│   ▼              ▼           ▼            ▼              ▼            │
│ columns/       cards/      grid/      spacers/                        │
│   │              │           │            │                           │
│ TwoColumn   SimpleCard   SimpleGrid   EmptyLine                       │
│             Highlightable Layout                                      │
│             GridCardWithSeparation                                    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                @robusta/pyramids-helpers (twCssAll)
                @robusta/pyramids-themes  (DaisyUI tokens — peer)
```

## Key Components

| Component                  | File                                              | Responsibility                                                                |
|----------------------------|---------------------------------------------------|-------------------------------------------------------------------------------|
| `TwoColumn`                | `src/columns/TwoColumns.tsx`                      | Stacks-on-mobile / 50–50 on `lg`. Accepts `leftClassName`, `rightClassName`.  |
| `SimpleCardComponent`      | `src/cards/SimpleCardComponent.tsx`               | White rounded card with optional named hover **effects** (border/scale/reverse/fadeUp/shadowPop/reveal). Composes via `twCssAll`. |
| `HighlightableCard`        | `src/cards/HighligthCard.tsx`                     | Title + content card with optional `highlight` badge in the corner.           |
| `GridCardWithSeparation`   | `src/cards/GridCardWithSeparation.tsx`            | Single-column `grid` of items. ⚠️ Has a broken `gridTemplateColumns: "repeat( 1fr))"` template. |
| `SimpleGridLayout`         | `src/grid/SimpleGridLayout.tsx`                   | Responsive auto-fit grid: `repeat(auto-fit, minmax(${maxWidth}px, 1fr))`. Default `itemMaximumWidth=350`, `gap=4`. |
| `EmptyLine`                | `src/spacers/EmptyLine.tsx`                       | Vertical padding spacer. Inline by default; `block` flag switches to block.   |

### `SimpleCardComponent` — effects map

```
border      hover:ring-4 hover:ring-indigo-300       (700 ms)
scale       hover:scale-105                          (700 ms)
reverse     hover:rotate-180                         (700 ms)
fadeUp      hover:-translate-y-1 hover:opacity-100   (300 ms, baseline opacity-90)
shadowPop   hover:shadow-xl                          (700 ms)
reveal      opacity-90 → 100 on hover                (700 ms)
```

Either `effect` (single) or `effects` (array) — both are concatenated, so
combining them is supported.

## Public API (`src/index.ts`)

```
export * from './columns/index';   // TwoColumn
export * from './cards/index';     // SimpleCardComponent, HighlightableCard, GridCardWithSeparation
export * from './spacers/index';   // EmptyLine
export * from './grid/index';      // SimpleGridLayout
```

## Interfaces

```
┌──────────────────────────────────────────────────────────────────┐
│ TwoColumnProps                                                   │
├──────────────────────────────────────────────────────────────────┤
│ leftContent: ReactNode                                           │
│ rightContent: ReactNode                                          │
│ className?: string                                               │
│ leftClassName?: string                                           │
│ rightClassName?: string                                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SimpleCardProps                                                  │
├──────────────────────────────────────────────────────────────────┤
│ children: string | ReactNode                                     │
│ className?: string                                               │
│ effect?: EffectKey                                               │
│ effects?: EffectKey[]                                            │
│ EffectKey = 'border' | 'scale' | 'reverse' | 'fadeUp'            │
│           | 'shadowPop' | 'reveal'                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ HighlightableCardProps                                           │
├──────────────────────────────────────────────────────────────────┤
│ title: string                                                    │
│ content: string | ReactNode                                      │
│ highlight?: boolean                                              │
│ highlightClass?: string                                          │
│ highlightText: string                                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ GridLayoutProps  (used by SimpleGridLayout & GridCardWith…)      │
├──────────────────────────────────────────────────────────────────┤
│ items: ReactNode[]                                               │
│ itemMaximumWidth?: number   // SimpleGridLayout only             │
│ gap?: number                                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ EmptyLineProps                                                   │
├──────────────────────────────────────────────────────────────────┤
│ small?: boolean                                                  │
│ size?: number   // multiplier on base padding                    │
│ block?: boolean                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

Pure presentation — no state, no effects, no fetches. Each component takes
props (children / `ReactNode[]`) and returns JSX. Style composition flows
through `twCssAll` (and ad-hoc template literals for the cards that pre-date
that helper).

## Dependencies

- **Depends on:**
  - `react` (19 RC)
  - `@robusta/pyramids-themes` (workspace peer — DaisyUI tokens like `badge-primary`)
  - `@robusta/pyramids-helpers` (workspace peer — `twCssAll`; not declared in `package.json`, resolved via hoisting)
- **Used by:**
  - `apps/robusta` (`@robusta/build`)
  - `apps/dakar` (`@robusta/dakar`)
  - `pyramids-ctas` (declares it as a dep though the source doesn't import it directly today)
- **Build:** `tsc` → `dist/`. Built after `themes` in `yarn build:deps`.

## Notes / Gotchas

- **`GridCardWithSeparation` is broken.** Its `gridTemplateColumns` is
  `"repeat( 1fr))"` — invalid CSS, browser ignores it; the grid collapses to a
  single column. Either fix or remove. The `gap` prop is also declared but
  never applied.
- Cards use raw colors (`bg-white`, `bg-yellow-100`, `text-gray-700`) instead
  of DaisyUI tokens. This contradicts the project's "DaisyUI tokens only"
  rule. Worth flagging when extending.
- All components are written with `React.FC` / `FC` — the project's React rule
  prefers plain functional components without `FC`. Don't refactor unless
  asked (project policy: refactors blow up commit size).
- `helpers` is *not* declared in `package.json` but is imported by
  `SimpleCardComponent`. It works through workspace hoisting; declare it
  explicitly if dependency hygiene matters.
- Responsive choice is hard-coded to `lg` (≥1024 px) for `TwoColumn`. The
  project convention is `mob:` (mobile-first reverse breakpoint) — kept here
  for backwards compatibility; don't blindly migrate.
- `EmptyLine` computes padding in `rem` based on a 16 px root. If the host
  app changes `font-size` on `:root`, the spacer scales with it.
