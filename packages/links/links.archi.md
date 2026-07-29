# Architecture: links

**Last updated:** 2026-04-28

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-links` is the link-component library for the SeoPyramids
sites. It packages three flavours of `next/link` wrappers
(`SimpleLink`, `PageLink`, `NeutralLink`) plus two **navigator** components
that highlight the active page — one for **server components**
(`PageLinkNavigator`, the active path is passed in) and one for
**client components** (`ClientPageLinkNavigator`, which calls
`usePathname()`). The split mirrors the RSC/Client boundary in Next.js 15
and is the most distinctive design choice of this package.

## Diagram

```
┌─────────────────────────── @robusta/pyramids-links ───────────────────────────┐
│                                                                               │
│                         src/index.ts (barrel)                                 │
│                                  │                                            │
│       ┌──────────────────────────┼──────────────────────────┐                 │
│       ▼                          ▼                          ▼                 │
│  client-link/              server-link/                standard/              │
│       │                          │                          │                 │
│  ClientPageLinkNavigator   PageLinkNavigator           SimpleLink             │
│  ('use client')            (RSC, takes pathname)       PageLink               │
│       │                          │                     NeutralLink            │
│       │                          │                          ▲                 │
│       └──────────► PageLink ◄────┘                          │                 │
│                       (the actual rendered list item)       │                 │
│                                                             │                 │
│       SimpleLink and NeutralLink share `SimpleLinkProps` ───┘                 │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                  next/link · pyramids-helpers (twCss, mergeCss)
```

## Key Components

### Navigators (the package's main reason to exist)

| Component                    | File                                             | Boundary    | How it knows the active page                     |
|------------------------------|--------------------------------------------------|-------------|--------------------------------------------------|
| `PageLinkNavigator`          | `src/server-link/PageLinkNavigator.tsx`          | server (RSC)| `currentPathName` prop passed by the parent      |
| `ClientPageLinkNavigator`    | `src/client-link/ClientPageLinkNavigator.tsx`    | client      | `usePathname()` from `next/navigation` (`'use client'`) |

Both render a horizontal `flex space-x-4` row of `PageLink`s.
`ClientPageLinkNavigator` also prepends the literal text `Other demos :`
(legacy of its original use site).

### Standard links (the building blocks)

| Component       | File                              | Visual / behaviour                                                                              |
|-----------------|-----------------------------------|-------------------------------------------------------------------------------------------------|
| `SimpleLink`    | `src/standard/SimpleLink.tsx`     | DaisyUI `link link-primary`. Auto-detects `http*` and renders `target="_blank"` + `rel="noopener noreferrer nofollow"` (or just `noopener noreferrer` if `dofollow`). |
| `PageLink`      | `src/standard/PageLink.tsx`       | If `active` → bold `text-primary` span. Else `link link-neutral` to `href`. Used by both navigators. |
| `NeutralLink`   | `src/standard/NeutralLink.tsx`    | Underlined neutral link with hover-undo. Reuses `SimpleLinkProps`.                              |

## Public API (`src/index.ts`)

```
export * from './client-link';   // ClientPageLinkNavigator
export * from './server-link';   // PageLinkNavigator
export * from './standard';      // SimpleLink, PageLink, NeutralLink
```

## Interfaces

```
┌──────────────────────────────────────────────────────────────────┐
│ SimpleLinkProps                                                  │
├──────────────────────────────────────────────────────────────────┤
│ href?: string                                                    │
│ children: ReactNode                                              │
│ className?: string                                               │
│ dofollow?: boolean                                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ PageLinkProps                                                    │
├──────────────────────────────────────────────────────────────────┤
│ name: string                                                     │
│ href: string                                                     │
│ active: boolean                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ PageLinkNavigatorProps  (server variant)                         │
├──────────────────────────────────────────────────────────────────┤
│ pages: { name: string; href: string }[]                          │
│ currentPathName: string                                          │
│ className?: string                                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ClientPageLinkNavigatorProps  (client variant)                   │
├──────────────────────────────────────────────────────────────────┤
│ pages: { name: string; href: string }[]                          │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow — picking the active page

```
RSC tree (server):
   <PageLinkNavigator pages={…} currentPathName={params.pathname} />
                                         │
                                         ▼
                          PageLink active={…} for each entry
                                         │
                       active ? <span class="text-primary"> : <Link>


Client tree (use client):
   <ClientPageLinkNavigator pages={…} />
                  │
                  ▼
            usePathname()  ──► returns current URL
                  │
                  ▼
                          PageLink active={…} for each entry
```

The split is not stylistic — it's structural. RSC has no `usePathname`
hook, so the server variant **requires** the parent to thread the path
explicitly. The client variant relies on the App Router hook.

## Dependencies

- **Depends on:**
  - `react` (19 RC)
  - `next/link` and `next/navigation` (peer — host apps are Next.js)
  - `@robusta/pyramids-helpers` (`mergeCss`, `twCss`)
  - `react-icons` (declared but unused in the current source)
- **Used by:**
  - `apps/robusta` (`@robusta/build`)
  - `apps/dakar` (`@robusta/dakar`)
  - `pyramids-ctas` (peer in workspace; both are link-flavoured component libs)
- **Build:** `tsc` → `dist/`. Built after `helpers` in `yarn build:deps`.

## Notes / Gotchas

- **`SimpleLink` outbound links are `nofollow` by default.** Pass `dofollow`
  to allow PageRank to flow through. Internal links never get a `rel`.
- **`ClientPageLinkNavigator` hardcodes the prefix `Other demos :`.** If you
  reuse it on a real site that's a leak from the original demo. Likely needs
  a `prefix` prop or removal before shipping somewhere new.
- **`NeutralLink` uses `text-dark-500` / `text-dark-700`** which are not
  standard Tailwind colors and not part of the project's DaisyUI palette
  either — they likely render as whatever Tailwind treats as unknown
  (no rule applied) unless a custom palette in the host app defines them.
  Flag before depending on it.
- **`PageLink` doesn't accept a `className`** — restyling requires a wrapper.
- All link components are written with `React.FC` or arrow components without
  `JSX.Element` annotations. Project convention prefers plain functions
  without `FC`. Don't refactor unless asked (commit-size policy).
- The package depends on `daisyui` only as a `devDependency` for theme
  classnames (`link-primary`, `link-neutral`) — apps must include DaisyUI in
  their own Tailwind build.
