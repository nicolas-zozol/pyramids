# Architecture: ctas

**Last updated:** 2026-07-30

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-ctas` is a small React component library exposing reusable
"call to action" widgets used across the SeoPyramids sites (`apps/robusta`,
`apps/dakar`, etc.). It bundles three families of CTAs — a fat banner button,
an inline link CTA, and a click-to-call phone CTA — styled via DaisyUI tokens
and merged through `twCss`/`mergeCss` from `pyramids-helpers`. The package
publishes its compiled artefacts (`dist/index.js`, `dist/index.d.ts`); apps
must `yarn build:deps` (or run a watcher) before changes propagate.

## Diagram

```
┌────────────────────────────── @robusta/pyramids-ctas ──────────────────────────────┐
│                                                                                    │
│                              src/index.ts (barrel)                                 │
│                                       │                                            │
│       ┌───────────────────────────────┼───────────────────────────────┐            │
│       ▼                               ▼                               ▼            │
│   src/fat/                        src/cta-link/                   src/phone/       │
│   ├─ FatCta.tsx                   └─ CtaLink.tsx                  └─ SimplePhoneCta │
│   └─ FatLinkedIn.tsx                                                               │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
                │                            │                            │
                ▼                            ▼                            ▼
       react-icons/fa             next/link + mergeCss          react-icons/fi
       twCss (helpers)            (helpers)                     (no helper deps)
```

## Key Components

| Component         | File                              | Responsibility                                                                 |
|-------------------|-----------------------------------|--------------------------------------------------------------------------------|
| `FatCta`          | `src/fat/FatCta.tsx`              | Large accent-coloured anchor button. Hard-coded LinkedIn href. Accepts children, `center`, `className`. |
| `FatLinkedIn`     | `src/fat/FatLinkedIn.tsx`         | Convenience wrapper around `FatCta` with the LinkedIn label + phone icon.      |
| `CtaLink`         | `src/cta-link/CtaLink.tsx`        | Inline `next/link`-based CTA with optional `uppercase`, `out`, `dofollow`. Uses `mergeCss`. |
| `SimplePhoneCTA`  | `src/phone/SimplePhoneCta.tsx`    | `tel:` anchor styled as `btn btn-primary` with optional preceding label.       |

## Data Flow

```
host app                               pyramids-ctas
─────────                              ─────────────
<FatLinkedIn center />        ────►    FatLinkedIn → FatCta → <a href="linkedin…">
<CtaLink href="/x">Go</CtaLink> ──►    CtaLink → next/link
<SimplePhoneCTA phoneNumber/>  ───►    <a href={`tel:${phoneNumber}`}>
```

No internal state, no effects. Purely presentational components.

## Interfaces

```
┌─────────────────────────────────────────────────────────┐
│ FatCtaProps                                             │
├─────────────────────────────────────────────────────────┤
│ center: boolean                                         │
│ children: ReactNode                                     │
│ className?: string                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FatLinkedInProps                                        │
├─────────────────────────────────────────────────────────┤
│ center: boolean                                         │
│ className?: string                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CtaLinkProps  (declared as SimpleLinkProps in source)   │
├─────────────────────────────────────────────────────────┤
│ href?: string                                           │
│ children: ReactNode                                     │
│ className?: string                                      │
│ out?: boolean                                           │
│ dofollow?: boolean                                      │
│ uppercase?: boolean                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PhoneCTAProps                                           │
├─────────────────────────────────────────────────────────┤
│ phoneNumber: string                                     │
│ label?: string                                          │
│ className?: string                                      │
└─────────────────────────────────────────────────────────┘
```

## Public API (`src/index.ts`)

```
export * from './phone/index';     // SimplePhoneCTA
export * from './fat/index';       // FatCta, FatLinkedIn
export * from './cta-link/index';  // CtaLink
```

## Dependencies

- **Depends on:**
  - `react` (peer, `^19.1.1` — the host site's copy is the one that runs; never a bundled dependency)
  - `next/link` (peer, `^15.1.8` — host apps are Next.js; the range spans `apps/robusta` on 15.1.8 and `apps/dakar` on 15.5.3. `next` is also a devDependency, `^15.5.3`, which is what this package's own `tsc` resolves that import against — it never reaches a site, which consumes `dist/`)
  - `react-icons` (`fa`, `fi` icon sets)
  - `@robusta/pyramids-themes` (DaisyUI tokens — `bg-accent`, `text-accent-content`, `btn-primary`)
  - `@robusta/pyramids-helpers` (`twCss`, `mergeCss`)
- **Used by:**
  - `apps/robusta` (`@robusta/build`)
  - `apps/dakar` (`@robusta/dakar`)
- **Build:** `tsc` → `dist/`. Triggered transitively by `yarn build:deps` (root) after `themes` and `layouts`.

## Notes / Gotchas

- `FatCta` has a hard-coded LinkedIn URL (`https://www.linkedin.com/in/robustacode/`). It is not configurable via props — `FatLinkedIn` simply provides the matching label.
- `SimplePhoneCTA` uses raw Tailwind colors (`text-gray-700`, `text-white`) which contradicts the project's "DaisyUI tokens only" rule; flag before extending.
- An empty `src/linkedin/` directory exists but has no source files — likely a stale folder.
- `CtaLink` and `SimplePhoneCTA` are written with `React.FC`, which the project conventions discourage in new code; keep as-is unless asked to refactor.
