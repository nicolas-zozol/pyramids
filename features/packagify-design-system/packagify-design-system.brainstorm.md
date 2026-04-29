# Brainstorm: packagify-design-system

**Date:** 2026-04-27
**Mode:** Autonomous (boss). Decisions made in-line, no human pause.

The user already provided a detailed scope brief in the boss invocation (the
"Current state", "Scope guidance", "What done looks like", and "Things to flag"
sections). This brainstorm answers the 14 brainstorm axes against that brief
with the simplest viable choice per axis.

---

## 1. Problem definition

`packages/robusta-design-system/` currently exists as a **flat scratch folder**
holding raw CSS, asset files, prototype `.jsx` components loaded via
`<script>` tags, and preview HTML pages. It is **not** a yarn workspace, has
no `package.json`, and cannot be imported by `apps/robusta` or `apps/dakar`.

**What we want:** a real workspace package — `@robusta/pyramids-design-system`
— that (a) ships the two CSS files as importable subpath entries, (b) ships
the assets (SVG mascots + wordmark PNG) as importable static resources, and
(c) optionally ports the 9 prototype JSX components to TS modules, with a
clear line drawn between "stable primitives" and "marketing surfaces".

**Why now:** `apps/robusta` already has `@robusta/pyramids-themes`,
`pyramids-ctas`, `pyramids-layouts` etc. as dependencies. Adding the
design-system package unblocks the live home page rebuild (a separate
follow-up feature).

---

## 2. Audience

- **Primary:** the developer wiring `apps/robusta` (and later `apps/dakar`,
  `apps/intel-demo`) to consume the design system.
- **Secondary:** Claude Code agents working on visual surfaces — they need
  the README and `archi.md` to know what to import.
- **Out of scope:** end-users of the deployed sites (they see the result, not
  the package).

---

## 3. Use cases / core flows

| Flow                                              | Importance |
|---------------------------------------------------|------------|
| `import '@robusta/pyramids-design-system/sketch.css'` in `apps/robusta`'s root layout | must |
| `import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png'` from a server component | must |
| `import { BrandLogo } from '@robusta/pyramids-design-system'` from any page | must |
| Storybook-style preview pages remain runnable in the workspace            | nice-to-have |
| Versioned publish to a private registry                                   | out of scope (later) |

---

## 4. Scope (KISS first)

**In scope (this iteration):**

1. Create `package.json`, `tsconfig.json`, `src/`, `dist/` build pipeline
   identical to the `pyramids-themes` shape.
2. Re-export both CSS files via the `exports` field as importable subpath
   entries.
3. Re-export assets via `exports` so consumers can `import` them.
4. Port the 9 prototype JSX components to `.tsx` modules with explicit
   `interface FooProps`. Drop the inline `IBM Plex Sans` and use the
   design-system CSS variables. Resolve assets via ES `import` (Next.js
   handles the static asset import).
5. Split components into `primitives/` (truly reusable: `BrandLogo`,
   `SkButton`, `SkCallout`, `SkTag`, `SkInput`) vs. `marketing/` (page-level:
   `Hero`, `ServicesGrid`, `FlowDiagram`, `PrinciplesList`, `NotesPreview`,
   `CTA`, `SiteHeader`, `SiteFooter`).
6. Hook into root `package.json`'s `build:deps` chain in the right order.
7. Update README; add `design-system.archi.md`.
8. **Validation:** add a throwaway test page in `apps/robusta` (e.g.
   `apps/robusta/src/app/_design-test/page.tsx`) that imports the CSS and
   one component; confirm `yarn build:robusta` succeeds. Don't wire it into
   navigation.

**Out of scope (deferred):**

- Wiring the new components into the live home page (`apps/robusta/src/app/page.tsx`).
- Touching DaisyUI / `packages/themes` palettes.
- Deleting `apps/robusta-design/` v0 prototype.
- Rewriting the wordmark PNG as SVG (**flag** in d&q).
- De-duplicating `crystal-tux.png` vs. `crystal-tux.svg` (**flag**).
- Storybook integration (preview pages stay as-is, internal docs only).

---

## 5. Existing-stack alignment

| Constraint                                         | Resolution                                                    |
|----------------------------------------------------|---------------------------------------------------------------|
| Yarn workspaces, `packages/*` glob                 | Workspace auto-discovered; just create `package.json`.        |
| TS local imports must end `.js`                    | New `.tsx` files use `./foo.js` form per repo policy.         |
| No `React.FC`                                      | Plain functions + explicit `interface FooProps`.              |
| Avoid raw Tailwind colors                          | Components use CSS variables from `colors_and_type.css` only. |
| RSC-first, mark `'use client'` only when needed    | All ported components are presentational — no client hooks.   |
| `tsc → dist/`, `main`, `types`                     | Mirror `pyramids-themes/package.json` and `tsconfig.json`.    |
| Build order in `build:deps`                        | After `helpers`+`themes`, before `layouts`/`ctas`/`links`.    |

---

## 6. Architecture sketch

```
@robusta/pyramids-design-system
├── package.json           — name, exports map, build script
├── tsconfig.json          — mirrors pyramids-themes
├── README.md              — keep existing brand docs, add install/import section
├── design-system.archi.md — new (matches sibling packages' format)
├── src/
│   ├── index.ts           — barrel: primitives + marketing + assets
│   ├── primitives/
│   │   ├── index.ts
│   │   ├── BrandLogo.tsx
│   │   ├── SkButton.tsx
│   │   ├── SkCallout.tsx
│   │   ├── SkTag.tsx
│   │   ├── SkInput.tsx
│   │   └── SkArrowRight.tsx     (a div with className, but typed)
│   ├── marketing/
│   │   ├── index.ts
│   │   ├── Hero.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── FlowDiagram.tsx
│   │   ├── PrinciplesList.tsx
│   │   ├── NotesPreview.tsx
│   │   ├── CTA.tsx
│   │   ├── SiteHeader.tsx
│   │   └── SiteFooter.tsx
│   └── assets/
│       └── (re-exported from package root via exports map; source files stay in /assets)
├── assets/                — unchanged: SVGs + PNGs, exposed via exports map
├── colors_and_type.css    — unchanged content, exposed via exports map
├── sketch.css             — unchanged content, exposed via exports map
├── preview/               — unchanged, NOT published, visible in repo only
└── ui_kits/               — kept as historical reference, not imported by new src/
```

The `dist/` output of `tsc` only contains the compiled `src/`. The CSS and
asset files are referenced in `package.json#files` and `package.json#exports`
so they ship with the package without needing to copy them into `dist/`.

---

## 7. Naming inventory

- **Package name:** `@robusta/pyramids-design-system`
- **Workspace path:** `packages/robusta-design-system/` (kept — directory rename
  is out of scope and breaks the user's working tree)
- **Subpath exports:**
  - `.` — barrel (TS components)
  - `./sketch.css`
  - `./colors_and_type.css`
  - `./assets/crystal-tux.svg`, `./assets/crystal-tux-head.svg`,
    `./assets/crystal-tux-waving.svg`, `./assets/crystal-tux-thinking.svg`
  - `./assets/crystal-tux.png`
  - `./assets/robusta-build-wordmark.png`
- **Component naming:** keep the legacy names from `ui_kits/marketing/`. Prefix
  the primitives with `Sk-` (matches the CSS class `.sk-*` convention) so
  `SkButton`, `SkCallout`, `SkTag`, `SkInput` sit next to the existing
  `.sk-btn`, `.sk-callout` CSS — this is consistent and immediately
  recognizable. `BrandLogo` keeps its name (it's already brand-prefixed).
- **Marketing kit:** keep names as-is. They're project-specific to robusta.build
  in current content, but the structural skeleton is reusable.

---

## 8. Tradeoffs / alternatives considered

### A. Where to put assets

| Option                                            | Pros                                           | Cons                                                       | Pick |
|---------------------------------------------------|------------------------------------------------|------------------------------------------------------------|------|
| Keep assets at `packages/.../assets/`, expose via `exports` | One source of truth; consumer `import`s like any other static asset; Next.js handles hashing | Requires correct `files` + `exports` config | ✅ |
| Copy assets into `dist/assets/` at build time     | Cleaner publish artifact                       | Adds a copy step (cp / esbuild plugin / postbuild script); duplicates content | ❌ |
| Require apps to copy them to `public/`            | Zero coupling                                  | Manual copy = drift on every asset change                  | ❌ |

→ **Pick option 1.** It is what `pyramids-themes` does for its `dist/index.js`
output, and Next.js 15 supports static asset imports from `node_modules` out
of the box.

### B. CSS shipping mechanism

| Option                                    | Pros                                    | Cons                                                  | Pick |
|-------------------------------------------|-----------------------------------------|-------------------------------------------------------|------|
| Two separate subpath imports              | Caller controls order; matches current `<link>` order in `preview/` | Caller must remember to import both | ✅ |
| Single combined `index.css` that `@import`s both | One import line                         | Hides the layering; harder to swap one out            | ❌ |
| Inject via a JS component that adds `<link>` | Works in non-Next bundlers              | RSC-incompatible; CSS-in-JS pitfalls                  | ❌ |

→ **Pick option 1.** Document in README that consumers must
`import '@robusta/pyramids-design-system/colors_and_type.css'` first, then
`./sketch.css`.

### C. Fonts

| Option                                                       | Pros                              | Cons                                    | Pick |
|--------------------------------------------------------------|-----------------------------------|-----------------------------------------|------|
| Keep `@import url(fonts.googleapis.com)` at the top of `colors_and_type.css` | Zero work; fonts auto-load        | Network dependency at runtime; not optimal for `next/font` | ✅ (this iteration) |
| Strip the `@import` and document `next/font` setup in README | Best perf                         | Forces caller setup; brittle if missed  | ❌ |
| Provide a `<DesignSystemFonts />` component                   | Explicit                          | RSC sometimes hoists `<link>` weirdly  | ❌ |

→ **Pick option 1** for now. Note the existing CSS already imports IBM Plex
Sans / Plex Mono / Caveat (which contradicts the README's claim of Caveat /
Kalam / Architects Daughter / JetBrains Mono — flag it). Migration to
`next/font` is a deferred follow-up.

### D. Marketing components — port or skip?

| Option                                                | Pros                                       | Cons                                                | Pick |
|-------------------------------------------------------|--------------------------------------------|-----------------------------------------------------|------|
| Port all 9 to `.tsx` with prop interfaces             | Apps can consume immediately; ships value  | Higher diff size; some are content-coupled         | ✅ |
| Port only the primitives, leave marketing as JSX docs | Smaller diff                               | Defeats the purpose of "packagify"                 | ❌ |
| Port all 9 + carve out non-reusable parts as props    | Cleanest API                               | Risk over-engineering; user said "let brainstorm decide" | partial ✅ |

→ **Pick option 1, with prop-driven content.** Each marketing component
takes its content (services list, posts list, principles list, etc.) as
props with sensible defaults that match the current robusta.build pitch.
Consumers can override per app.

### E. `'use client'` directive

The current JSX components use **no** state, **no** event handlers (except
forms — `<button>` with no `onClick`), **no** refs, **no** browser APIs.
They are pure presentational. **Decision:** ship them as **server
components**. No `'use client'` directive. The `<button>` tags don't need
client interactivity at this stage — wiring up the booking flow is a
separate concern (an app-level `'use client'` form wrapper would call them).

### F. Component output: TSX vs MDX vs raw HTML

→ **TSX.** The user's brief says "ported to .tsx modules". Done.

---

## 9. Visual / DX

- README gets a top-level **Install** section with code blocks for CSS import,
  asset import, and component import.
- `design-system.archi.md` follows the same shape as `themes.archi.md` (parent
  link, overview, diagram, key components table, public API, dependencies,
  notes/gotchas).
- A short "smoke test page" goes into `apps/robusta/src/app/_design-test/page.tsx`
  but is left out of any nav. Confirms the Next 15 build picks up the package.

---

## 10. Risks

| Risk                                                              | Severity | Mitigation                                                    |
|-------------------------------------------------------------------|----------|---------------------------------------------------------------|
| `exports` map not picked up by Next.js 15 / Webpack               | Medium   | Test by importing CSS in the smoke-test page during this iter |
| The dual `crystal-tux.png` / `.svg` confuses consumers            | Low      | Flag in d&q; pick `.svg` as canonical, keep `.png` as fallback|
| The 1603×312 wordmark PNG is heavy                                | Low      | Flag for follow-up SVG conversion                             |
| Inline `IBM Plex Sans` in old JSX contradicts README              | Low      | When porting, drop hard-coded `IBM Plex Sans` and use vars; flag in d&q |
| TS strict mode catches issues in ported code                      | Low      | Will fix or weaken types case-by-case                         |
| `dist/` has no compiled `src/index.js` if `tsc` finds no `.ts`    | Critical | Make sure `src/index.ts` exists with at least a re-export     |
| `package.json#files` excludes css → not shipped                   | High     | Whitelist explicitly: `["dist", "*.css", "assets"]`           |

---

## 11. Open questions (autonomously resolved)

| Q                                                       | Decision                                                                                         |
|---------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Use `react@19.0.0-rc-...` like siblings?                | **Yes.** Match exact pin from `pyramids-themes`.                                                 |
| Add `peerDependencies` for `react`?                     | **Yes**, in addition to `dependencies`, so RSC trees pick the consumer's React.                  |
| Versioning strategy?                                    | **`1.0.0`**, matching every sibling.                                                             |
| Should preview/ ship in npm publish?                    | **No.** Excluded via `files` whitelist.                                                          |
| Should `ui_kits/` ship?                                 | **No.** Historical only; excluded via `files`.                                                   |
| Should the README be rewritten?                         | **Append, don't rewrite.** Keep the brand voice intact; add an "Install / Import" section atop. |
| `tsconfig.json#jsx` value?                              | **`"react-jsx"`** (Next.js 15 / React 19 idiom). `themes` uses `"react"` because it has no JSX — we have JSX, so the auto runtime is correct. |
| Do tests get added?                                     | **No.** This package is data + presentational TSX; no behavior to unit-test. Smoke test = build success. |

---

## 12. Acceptance criteria

1. `yarn install` from repo root succeeds with the new workspace.
2. `yarn workspace @robusta/pyramids-design-system run build` produces
   `dist/index.js`, `dist/index.d.ts`, and per-component `.js`/`.d.ts`.
3. `yarn build:deps` runs the new package's build in the correct order.
4. From `apps/robusta`, an `import` of any of:
   - `@robusta/pyramids-design-system/sketch.css`
   - `@robusta/pyramids-design-system/colors_and_type.css`
   - `@robusta/pyramids-design-system/assets/robusta-build-wordmark.png`
   - `@robusta/pyramids-design-system` (TSX components)
   resolves successfully and `yarn build:robusta` completes.
5. README has clear install + import examples.
6. `design-system.archi.md` exists, in the format of the seven sibling archi files.
7. `decisions-and-questions.md` lists all material decisions, including the
   four flags (font mismatch, wordmark PNG size, dup tux, inline `IBM Plex Sans`).
8. Single feature commit, no `Co-Authored-By`, prefix `feat(design-system):`.

---

## 13. Effort / phasing

| Step                                          | Est. tool calls |
|-----------------------------------------------|-----------------|
| `package.json` + `tsconfig.json`              | 2               |
| Add `src/index.ts` + barrel + primitives (5)  | 5–7             |
| Marketing components (8)                      | 8               |
| Smoke-test page in `apps/robusta`             | 1               |
| Run `yarn install` + build                    | 2–3             |
| README append, archi file                     | 2               |
| Build-order wire-up in root `package.json`    | 1               |
| Sync to develop + commit                      | 3               |

→ One session. ~25 file writes / edits.

---

## 14. Definition of done

The package builds, the test page imports CSS+asset+component and the
robusta app builds, README and archi file are updated, decisions are logged,
and a single `feat(design-system): ...` commit lands on
`feat/packagify-design-system`. Tracking docs are synced to `dev`.
