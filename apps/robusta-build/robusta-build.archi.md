# Architecture: robusta-build

**Last updated:** 2026-07-31

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/robusta-build` is the version 2 site of robusta.build, created by the `bootstrap-robusta-build` story as a deployable shell. It builds, it deploys, it renders the design system — and it carries no page copy. Everything a visitor would read is the subject of later stories: the landing page, the URL scheme, the content source, the migrated articles.

The shell exists to settle the wiring once, so that the stories after it argue about content and routes rather than about how a token reaches a page. What it fixes: which design system the site consumes, in what order its stylesheets load, how a brand asset resolves to a URL, where the per-site truth lives, and how a webfont reaches the browser without a third-party request.

It supersedes `apps/robusta`, which the epic retires.

## Diagram

```
┌──────────────────────── apps/robusta-build ────────────────────────┐
│                                                                    │
│  src/seopyramids.config.ts ── domain · locales · blogConfig        │
│         │                     (getCategories → [] until            │
│         │                      content-source lands)               │
│         ▼                                                          │
│  src/app/layout.tsx ─── next/font/google ──► --font-ibm-plex-sans  │
│         │                (3 faces, self-hosted)  --font-ibm-plex-mono
│         │                                        --font-caveat     │
│         │                                                          │
│         │  CSS load order is a contract:                           │
│         │    1. ./globals.css        (tailwind 4 + token bridge)   │
│         │    2. …/colors_and_type.css (tokens, unlayered)          │
│         │    3. …/sketch.css          (.sk-* primitives)           │
│         ▼                                                          │
│  src/app/page.tsx ── placeholder, deleted by robusta-landing-page  │
│         │                                                          │
│         └──► src/design-system/assets.ts ── the asset URL seam     │
│                     │                                              │
└─────────────────────┼──────────────────────────────────────────────┘
                      ▼
        @robusta/pyramids-design-system  (workspace:*)
          exports: ./colors_and_type.css · ./sketch.css
                   ./assets/* · components
```

## Key Components

- `src/seopyramids.config.ts` — the per-site source of truth: domain, site name and title, mission, logo, default and other locales, and `blogConfig` (roll size, mandatory keywords, author, category resolver). `getCategories` returns an empty array and never throws, until `content-source` decides how articles reach the site.
- `src/app/layout.tsx` — loads the three stylesheets in their contractual order, self-hosts the three brand faces through `next/font/google`, and puts their custom properties on `<html>` so they are in scope where `:root` tokens are defined. Declares `robots: { index: false, follow: false }` at the root, covering every page the site will ever add.
- `src/app/globals.css` — the Tailwind 4 entry plus the token bridge: shadcn's expected names aliased onto design-system tokens, every entry an alias and none a literal.
- `src/design-system/assets.ts` — the single seam that normalises what the bundler returns for an imported asset. Next hands back a `StaticImageData`, other pipelines hand back a string.
- `src/app/page.tsx` — a placeholder that exercises the wiring end to end and is meant to be deleted by `robusta-landing-page`.

## Data Flow — a rendered page

```
seopyramids.config.ts ──► layout metadata (title, description, robots)
                     │
next/font (3 faces) ──┼──► --font-* custom properties on <html>
                     │              │
design system CSS ───┴──────────────┴──► :root tokens resolve
                                              │
                                              ▼
                                    server components render
                                              │
                                              ▼
                                   static generation (62 pages)
```

No client boundary: no design-system component carries `'use client'`, so the whole page stays a server component and prerenders.

## Dependencies

- Depends on: `@robusta/pyramids-design-system` and `@robusta/pyramids-routing` (both `workspace:*`) — the two workspace dependencies. Next 15.5.3, React 19.1.1, Tailwind 4.
- Deliberately not depended on: `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`, which render DaisyUI classes and are deprecated by the shadcn decision. And `packages/scribe-intel`, because BR-PYRAMID-2 forbids the v2 base from tracking visitor intents.
- Used by: nothing. It is a deployable site.

## Notes / Gotchas

- `experimental.extensionAlias` in `next.config.ts` is what makes the repository's `.js`-suffixed local imports resolve under webpack. `moduleResolution: "Bundler"` makes them pass `tsc`, which is not the same thing — without the alias the build fails at compile with `Module not found: Can't resolve '../seopyramids.config.js'`. `apps/dakar` carries the same declaration.
- The stylesheet order is load-bearing. Tailwind 4 emits its preflight inside `@layer base`; the design system's element rules are unlayered and therefore win. Reordering the three imports silently changes what renders.
- Do not link `@robusta/pyramids-design-system/fonts.css` here. It is the opt-in Google Fonts path for consumers with no build step — the package's own `preview/*.html` pages. Loading it alongside `next/font` fetches every face twice and reintroduces the third-party request this site removed.
- `BrandLogo` ships a hardcoded `/_next/static/media/…` default for its wordmark, which is wrong for every consumer. Always pass `wordmarkSrc` explicitly.
- The token bridge has no `--destructive`: the design system ships no error colour. A shadcn component using `bg-destructive` will render with an unresolved variable, which is deliberate and loud. The fix belongs to the design system, not to this site.
