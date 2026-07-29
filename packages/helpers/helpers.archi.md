# Architecture: helpers

**Last updated:** 2026-04-28

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-helpers` is the cross-cutting utility belt of the monorepo:
small, mostly stateless helpers used by every other package and by the apps.
It groups seven independent micro-modules — `style`, `router`, `theme`,
`react`, `time`, `arrays`, `debug` — each behind its own barrel
(`src/<area>/index.ts`) and re-exported from `src/index.ts`. The defining
quirk: helpers like `immutableSlugify` and `getRouterPath` carry global
guarantees (URL stability, no server-action accidents) — touch them
carefully.

## Diagram

```
┌──────────────────────── @robusta/pyramids-helpers ────────────────────────┐
│                                                                           │
│                          src/index.ts (barrel)                            │
│                                  │                                        │
│   ┌───────┬───────────┬──────────┼─────────┬──────────┬───────────────┐   │
│   ▼       ▼           ▼          ▼         ▼          ▼               ▼   │
│ style/  router/    theme/     react/    time/      arrays/         debug/ │
│  │        │          │          │         │          │               │    │
│  │        │          │          │         │          │               │    │
│  ├ mergeCss        DesignSystem useInView TimeDiffered uniqueBy   showBool│
│  ├ twCss           (preview)    (IO obs.) (delayed    uniqueValues        │
│  ├ twCssAll                               render)                         │
│  │                                                                        │
│  ├ setRouterPath / getRouterPath  (module-level mutable state)            │
│  ├ immutableSlugify (slugify@1.6.6 — DO NOT CHANGE)                       │
│  └ RouteParams<T>  (Next.js 15 async params type)                         │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              tailwind-merge · slugify · react · IntersectionObserver
```

## Key Components

| Module    | File                                | Responsibility                                                                              |
|-----------|-------------------------------------|---------------------------------------------------------------------------------------------|
| `style`   | `src/style/merge-css.ts`            | `mergeCss(...classes)` — flattens, dedupes, joins class names.                              |
| `style`   | `src/style/tw-css.ts`               | `twCss(s1, s2)` / `twCssAll(...lists)` — `mergeCss` + `tailwind-merge` to resolve conflicts.|
| `router`  | `src/router/router-path.ts`         | Module-level `routerPath` getter/setter (avoids server-action cost — see comment).          |
| `router`  | `src/router/route-params.ts`        | `RouteParams<T>` interface for Next 15 async route params (`params: Promise<T>`).           |
| `router`  | `src/router/immutable-slugify.ts`   | URL-stable slugifier. Locked to `slugify@1.6.6` because changing it would invalidate URLs.  |
| `theme`   | `src/theme/DesignSystem.tsx`        | Visual smoke-test page rendering all DaisyUI tokens (base/primary/secondary/neutral/accent).|
| `react`   | `src/react/use-in-view.ts`          | `useInView(options)` — IntersectionObserver hook returning `{ref, isVisible}`. Once-only.   |
| `time`    | `src/time/TimeDiffered.tsx`         | Delays children render via `setTimeout` + wraps with `<!--googleoff/on-->` to dodge SEO.    |
| `arrays`  | `src/arrays/unique.ts`              | `uniqueBy(arrays, key)` (Map-backed) and `uniqueValues(array)` (Set-backed).                |
| `debug`   | `src/debug/show-bool.ts`            | `showBool(label, b)` — pretty boolean for dev logs.                                         |

## Public API (`src/index.ts`)

```
export * from './time/index';     // TimeDiffered
export * from './style/index';    // mergeCss, twCss, twCssAll
export * from './theme/index';    // DesignSystem
export * from './router/index';   // setRouterPath, getRouterPath, RouteParams, immutableSlugify
export * from './debug/index';    // showBool
export * from './react/index';    // useInView
export * from './arrays/index';   // uniqueBy, uniqueValues
```

## Interfaces

```
┌──────────────────────────────────────────────────────────────────┐
│ Style                                                            │
├──────────────────────────────────────────────────────────────────┤
│ mergeCss(...classes: ClassNameValue[]) → string                  │
│ twCss(s1: ClassNameValue, s2: ClassNameValue) → string           │
│ twCssAll(...classLists: ClassNameValue[]) → string               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Router                                                           │
├──────────────────────────────────────────────────────────────────┤
│ setRouterPath<T extends string>(path: T) → void                  │
│ getRouterPath<T extends string>() → T                            │
│ immutableSlugify(text: string, locale: string) → string          │
│ RouteParams<T> = { params: Promise<T> }                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ React                                                            │
├──────────────────────────────────────────────────────────────────┤
│ useInView(options?: IntersectionObserverInit)                    │
│   → { ref: RefObject<HTMLDivElement>, isVisible: boolean }       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Arrays                                                           │
├──────────────────────────────────────────────────────────────────┤
│ uniqueBy<T, K extends keyof T>(arrays: T[][], key: K) → T[]      │
│ uniqueValues<T>(array: T[]) → T[]                                │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow — `style` (canonical example)

```
caller:  twCss('text-primary', extraClasses)
            │
            ▼
        mergeCss(s1)  ──► flatten + dedupe tokens of s1
        mergeCss(s2)  ──► flatten + dedupe tokens of s2
            │
            ▼
        twMerge(s1', s2')   (tailwind-merge resolves conflicting
                             utilities, e.g. p-2 vs p-4)
            │
            ▼
         final string
```

## Tests

Vitest specs live next to source:

- `src/arrays/unique-by.spec.ts`
- `src/style/merge.spec.ts`

Run from this workspace (`yarn workspace @robusta/pyramids-helpers test`).
There is no root-level test target.

## Dependencies

- **Depends on:**
  - `react` (19 RC) — used by `useInView`, `TimeDiffered`, `DesignSystem`
  - `react-icons` (declared but currently unused in source)
  - `tailwind-merge` — backbone of `twCss`
  - `slugify` (pinned `1.6.6`) — `immutableSlugify`
- **Used by:**
  - `pyramids-ctas` (`twCss`, `mergeCss`)
  - `pyramids-layouts`, `pyramids-links` (style/router helpers)
  - both Next.js apps (`apps/robusta`, `apps/dakar`)
- **Build:** `tsc` → `dist/`. Built first by `yarn build:deps` (every other package transitively imports it).

## Notes / Gotchas

- **`immutableSlugify` must not change.** Source explicitly warns that altering it would force redirects across every published page. Slugify is pinned to `1.6.6`.
- **`router-path.ts` holds module-level mutable state** (`let routerPath`). Header comment says `'use server'` would force this to be a server action and bill per call — leave it as plain module state. Treat it as request-scoped only at your own risk; in RSC each render shares the module instance per process.
- **`useInView` and `TimeDiffered` are `'use client'`** — only safe inside client components.
- **`TimeDiffered` is intentionally SEO-hostile**: wraps content in `<!--googleoff: all-->` and delays render so bots and crawlers won't see it. Used to hide email/phone from scrapers.
- **`DesignSystem`** is a developer aid, not a production component — it dumps every theme token to the page. Useful to drop on a `/test` route while debugging colors.
- `mergeCss` does dedupe twice (once via `Set`, once via array) — second pass is redundant but harmless.
