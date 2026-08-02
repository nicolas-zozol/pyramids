# Architecture: routing

**Last updated:** 2026-08-02

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/pyramids-routing` is the discriminant contract of the version 2 URL scheme, written as pure string functions. It owns the four discriminants — `l` for the locale, `c` for a category, `p` for a roll page, `t` reserved for a tag page — the shapes built from them, and the derivation of the URL set a site pregenerates.

What it deliberately does not own is any site's editorial vocabulary. The content root is a field of the `UrlScheme` the caller supplies — `articles` for robusta.build, another word for another site — so the value appears nowhere in this package.

Zero runtime dependencies, no React import and no Next import. It therefore takes the first slot of `yarn build:deps`, and a second site can adopt the scheme without inheriting the v1 helper surface.

The idea the package turns on: **canonicality is the fixed point of `buildUrl` and `parseUrl`**. A path is canonical when building the parse of it returns the path itself; where the two differ, the path is a redirect source and the built value is its target. The four non-canonical families — an explicit page one, a marked default locale, a trailing slash, an uppercase segment — fall out of that single rule instead of four hand-written redirect tables. `buildUrl` cannot represent any of them, so no link, sitemap entry or redirect target can emit one.

## Diagram

```
┌───────────────────────── @robusta/pyramids-routing ──────────────────────────┐
│                                                                              │
│  src/discriminants.ts ── l · c · p · t   (RESERVED_SEGMENTS)                 │
│          │               isReservedSegment(segment)                          │
│          ▼                                                                   │
│  src/scheme.ts ── UrlScheme           contentRoot · locales · rollSize       │
│          │        PageUrl             landing · blog-home · category         │
│          │                            · tag · article                        │
│          │        AddressableArticle  slug · locale · category?              │
│          │        SchemeViolation     five codes, never thrown               │
│          │                                                                   │
│     ┌────┴───────────────┬──────────────────┬─────────────────────┐          │
│     ▼                    ▼                  ▼                     ▼          │
│  build-url.ts        parse-url.ts       url-set.ts     validate-articles.ts  │
│  PageUrl → path      path → PageUrl     corpus → the   corpus → violations   │
│  canonical only      tolerant read      URL set        the build stopper     │
│     │                    │                                                   │
│     └────────────────────┘                                                   │
│     canonicality = the fixed point of the pair                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                       apps/robusta-build — src/routing/*
```

## Key Components

- `src/discriminants.ts` — `l`, `c`, `p`, `t`, the `RESERVED_SEGMENTS` list they form, and `isReservedSegment`. They are reserved at every level of the scheme, which is what keeps the locale prefix unambiguous and what forbids an article slug named `p`.
- `src/scheme.ts` — the types the rest of the package speaks in: `UrlScheme` (the site's content root, locales and roll size), `PageUrl` (the five page kinds), `AddressableArticle`, `SchemeViolation`.
- `src/build-url.ts` — `buildUrl` emits the canonical form and nothing else: page one is the roll's own URL, the default locale carries no prefix. A roll page below 1 or non-integer throws.
- `src/parse-url.ts` — `parseUrl` reads the content section and returns `undefined` for everything else, so the parser never claims a URL the scheme does not own. It is tolerant exactly where `buildUrl` is strict — trailing slash, letter case, explicit page one, marked default locale — which is what makes canonicality a fixed point rather than a list of special cases.
- `src/url-set.ts` — `urlSet` derives every content URL of a corpus: per locale, the blog roll pages, then each claimed category's roll pages in alphabetical order, then the articles by slug. Roll pages are computed from `rollSize`, and a locale earns a blog home by holding an article — the default locale always has one. It is the single derivation a site pregenerates from, so no second list can accept or refuse a URL at request time.
- `src/validate-articles.ts` — `validateArticles` returns the violations a corpus commits against the scheme and never throws; the caller decides that a non-empty result fails the build.

## Public API (`src/index.ts`)

```ts
import {
  // discriminants
  LOCALE_DISCRIMINANT,    // 'l'
  CATEGORY_DISCRIMINANT,  // 'c'
  ROLL_PAGE_DISCRIMINANT, // 'p'
  TAG_DISCRIMINANT,       // 't'
  RESERVED_SEGMENTS,
  isReservedSegment,
  // functions
  buildUrl,
  parseUrl,
  urlSet,
  validateArticles,
  // types
  type UrlScheme,
  type PageUrl,
  type AddressableArticle,
  type SchemeViolation,
} from '@robusta/pyramids-routing';
```

## Interfaces

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Types                                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ UrlScheme = { contentRoot, defaultLocale, otherLocales, rollSize }           │
│                                                                              │
│ PageUrl =                                                                    │
│   | { kind: 'landing';    locale }                                           │
│   | { kind: 'blog-home';  locale; page }                                     │
│   | { kind: 'category';   locale; category; page }                           │
│   | { kind: 'tag';        locale; tag; page }                                │
│   | { kind: 'article';    locale; category?; slug }                          │
│                                                                              │
│ AddressableArticle = { slug, locale, category? }                             │
│                                                                              │
│ SchemeViolation.code =                                                       │
│   reserved-segment · duplicate-slug · nested-category                        │
│   · unknown-locale · non-canonical-segment                                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ Functions                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ buildUrl(scheme: UrlScheme, page: PageUrl) → string                          │
│ parseUrl(scheme: UrlScheme, path: string) → PageUrl | undefined              │
│ urlSet(scheme: UrlScheme, articles: readonly AddressableArticle[])           │
│   → PageUrl[]                                                                │
│ validateArticles(scheme: UrlScheme, articles: readonly AddressableArticle[]) │
│   → SchemeViolation[]                                                        │
│ isReservedSegment(segment: string) → boolean                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

## The shapes, on a scheme whose content root is `articles`

- `/articles` — page one of the blog roll, and `/articles/p/{n}` for n ≥ 2.
- `/articles/c/{category}` — page one of a category roll, and `/articles/c/{category}/p/{n}` for n ≥ 2.
- `/articles/c/{category}/{slug}` — an article claiming a category; `/articles/{slug}` — an article claiming none.
- `/articles/t/{tag}` — representable by `buildUrl` and readable by `parseUrl`, produced by `urlSet` never: the address is reserved so a tag page stays possible, and no route serves it.
- `/l/{locale}` in front of any of the above, for a locale that is not the default one.

## Data Flow — canonicality as a fixed point

```
a path a visitor or a crawler holds
        │
        ▼
   parseUrl(scheme, path) ──► undefined  ── outside the content section:
        │                                   the scheme claims nothing
        ▼
   buildUrl(scheme, page)
        │
        ├── equals the path      ──► canonical: serve it
        └── differs from it      ──► the path is a redirect source,
                                     the built value is its target
```

The four families that fall out, and where each is answered on the site: an explicit `/p/1` and a marked default locale by `redirects()` in `next.config.ts`, a trailing slash by `trailingSlash: false`, letter case by the site's middleware.

## Data Flow — the URL set

```
article index (slug · locale · category?)
        │
        ▼
validateArticles ──► violations ──► the caller fails the build
        │  (none)
        ▼
   urlSet ──► PageUrl[]  ──► generateStaticParams of every route
        │                 ──► buildUrl for links, redirect targets, the v1 map
```

## Tests

78 tests in five spec files next to the source, run with `yarn workspace @robusta/pyramids-routing run test` (the workspace declares a `test` script; most workspaces here do not).

- `src/build-url.spec.ts`, `src/parse-url.spec.ts`, `src/url-set.spec.ts`, `src/validate-articles.spec.ts` — one file per module.
- `src/canonical-round-trip.spec.ts` — the round trip as a property over generated inputs across three schemes and every page kind, with each of the four non-canonical families applied as a mutation over every applicable page. It is what makes the fixed point a guarantee rather than a set of examples.

## Dependencies

- Depends on: nothing at runtime. No dependency, no peer dependency, no React, no Next; `typescript` and `vitest` in `devDependencies` and nothing else. It introduces no second copy of anything.
- Used by: `apps/robusta-build` — `src/routing/scheme.ts` (the site's one `UrlScheme`), `src/routing/content-urls.ts` (the derivation every route pregenerates from), `src/routing/v1-url-map.ts` (redirect targets) and `scripts/check-route-table.mjs`.
- Build: `tsc` → `dist/`. First step of `yarn build:deps`, before `pyramids-content`, because it depends on nothing and the site needs its `dist/` before `next build`. Watcher: `yarn w:routing`.

## Notes / Gotchas

- The content root is never written here. A literal `articles` inside this package is the base growing into one site's editorial vocabulary, and the review that catches it is a grep.
- `parseUrl` is a build-time tool — the v1 mapping, the tests, any future canonicality check. Requests are discriminated by the App Router's static segments, never by this parser, so the two cannot disagree at runtime.
- `AddressableArticle.category` is one optional string and never a list: BR-PYRAMID-9 stated in the type. A corpus growing a second category on an article fails to compile instead of quietly growing a second address.
- `validateArticles` returns and never throws. Failing the build is the caller's decision, which is what lets a tool report every violation of a corpus at once.
- `urlSet` returns no tag page — the segment is reserved and served by nothing — and no landing page, whose copy belongs to the site.
- `rollSize` is a parameter of `UrlScheme` so the derivation stays testable at any value. The value is fixed at 12 by the site, in `apps/robusta-build/src/routing/scheme.ts`.
- A slug or a category is lowercase ASCII words joined by single hyphens; anything else returns `non-canonical-segment`. The first accented French slug is therefore a decision, not an accident.
- Local imports inside the package end in `.js`, as everywhere in this repository. Consumers import the package by name, so no extension question crosses the boundary.
