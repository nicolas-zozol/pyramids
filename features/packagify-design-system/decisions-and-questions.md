# Questions & Decisions: packagify-design-system

**Date:** 2026-04-27
**Status:** In Progress
**Branch:** feat/packagify-design-system
**Worktree:** /Users/nicolaszozol/code/robusta/boss-packagify-design-system

> This file logs all decisions made autonomously by Claude (boss agent).
> Review these after implementation. If you disagree with a choice, ask
> Claude to redo that part.

---

## Task Selection

**Chosen:** packagify-design-system
**Source:** user invocation `boss lfg` with detailed scope brief in the
prompt body. The brief lays out current state, monorepo conventions,
scope guidance, "done" criteria, and "things to flag rather than fix".
No idea-file was provided; the brief is the idea file in spirit.

---

## Q1: Package name

**Phase:** Naming
**Chosen:** `@robusta/pyramids-design-system` | **Confidence:** High
**Rationale:** The user's brief listed three candidates and asked the
naming agent to decide:
- `@robusta/pyramids-design-system` — captures the role (palette + primitives
  + assets + brand), consistent with `pyramids-themes` (data only) /
  `pyramids-ctas` (one component family).
- `@robusta/pyramids-sketch` — implementation-flavored. The hand-drawn skin
  is *one* visual choice; the package's job is broader.
- `@robusta/pyramids-brand` — narrow; "brand" reads marketing-only.

The chosen name is the most literal description of the package's role and
sits comfortably in the `pyramids-*` family.

**Alternatives:**
- `pyramids-sketch` — Pros: short, evocative | Cons: brittle, reads like a skin
- `pyramids-brand` — Pros: short | Cons: too narrow

**Impact if wrong:** Low — rename is a `find/replace` + a `package.json` edit.
Worth doing now since the import strings propagate to every consumer file.

---

## Q2: Don't rename the directory

**Phase:** Naming
**Chosen:** Keep directory at `packages/robusta-design-system/` even though
the package name is `@robusta/pyramids-design-system`. | **Confidence:** Medium
**Rationale:** Directory and package-name are separately namespaced in this
repo (e.g. `packages/themes/` ≠ `@robusta/pyramids-themes`,
`packages/links/` ≠ `@robusta/pyramids-links`). The existing dir
`packages/robusta-design-system/` is already in the user's working state,
and renaming it would force every untracked file to move. Aligning the dir
to `pyramids-design-system` is a future cleanup we'd do uniformly across all
package dirs (or not at all). Boss does not unilaterally normalize.
**Alternatives:**
- Rename to `packages/pyramids-design-system/` — Pros: dir = package name | Cons: breaks user's working state, inconsistent with siblings
**Impact if wrong:** Low — rename later via `git mv`.

---

## Q3: CSS shipping — two subpath exports

**Phase:** Concept
**Chosen:** Ship `colors_and_type.css` and `sketch.css` as **separate
subpath exports** under the `exports` map. | **Confidence:** High
**Rationale:** Matches the current order in `preview/*.html` (colors first,
sketch second) and makes the layering explicit. Consumers do:
```ts
import '@robusta/pyramids-design-system/colors_and_type.css';
import '@robusta/pyramids-design-system/sketch.css';
```
Next.js 15 supports CSS imports from `node_modules` for app-router projects.
**Alternatives:**
- Single combined `index.css` — Cons: hides ordering, harder to swap one
- JS-rendered `<link>` component — Cons: SSR/RSC quirks, defeats the purpose
**Impact if wrong:** Low — easy to add a barrel `index.css` later if needed.

---

## Q4: Assets shipping — `exports` map, not copy

**Phase:** Concept
**Chosen:** Keep assets at `packages/.../assets/` (no copy to `dist/`),
expose them via the package's `exports` map. | **Confidence:** High
**Rationale:** Next.js 15 statically analyzes `import wordmark from
'@robusta/pyramids-design-system/assets/robusta-build-wordmark.png'` from
RSC and produces a hashed URL. No build step needed, no drift between source
and shipped asset. The `package.json#files` array whitelists `assets/` so
assets ship in the npm tarball.
**Alternatives:**
- Copy to `dist/assets/` via postbuild — Cons: extra step, duplicate content
- Require apps to copy to `public/` — Cons: drift on every asset change
**Impact if wrong:** Medium — if Next can't resolve, fall back to a copy step.

---

## Q5: Marketing components — port all 9 with prop-driven content

**Phase:** Concept
**Chosen:** Port all 9 prototype components to `.tsx` with explicit `interface
FooProps` where each component accepts its content (e.g. `services: ServiceItem[]`,
`posts: NotePost[]`, `principles: Principle[]`, `cta: CtaContent`) with sensible
defaults that match robusta.build's current pitch. | **Confidence:** Medium-High
**Rationale:** The user's "What done looks like" said "(a) ported to .tsx modules
with proper interfaces, or (b) explicitly carved out". (a) ships more value and
(per the brief) "the structural skeleton is reusable" across robusta + dakar +
intel-demo. Defaults preserve the existing prototype output exactly so visual
parity is maintained for the smoke test.
**Alternatives:**
- Port primitives only, leave marketing as historical JSX — Pros: smaller diff
  | Cons: defeats the packagify goal
- Port without defaults, force consumers to pass content — Pros: cleanest API
  | Cons: more work for the next consumer; doesn't preserve the visual demo
**Impact if wrong:** Medium — refactor to remove defaults later is cheap.

---

## Q6: Component split — primitives vs marketing

**Phase:** Concept
**Chosen:** Split into `src/primitives/` (genuinely reusable: `BrandLogo`,
`SkButton`, `SkCallout`, `SkTag`, `SkInput`, `SkArrowRight`) and
`src/marketing/` (page-level surfaces: `Hero`, `ServicesGrid`, `FlowDiagram`,
`PrinciplesList`, `NotesPreview`, `CTA`, `SiteHeader`, `SiteFooter`).
| **Confidence:** High
**Rationale:** Primitives are stable across apps. Marketing surfaces are
content-coupled to robusta.build today but structurally reusable. Two
folders make the stability boundary explicit. Both groups are re-exported
from the root barrel `src/index.ts`.

The `Sk*` prefix matches the `.sk-*` CSS class convention (`.sk-btn`,
`.sk-callout`, `.sk-tag`, `.sk-input`) so `<SkButton>` ↔ `.sk-btn` is the
obvious mapping.

**Alternatives:**
- Single flat `components/` — Pros: simpler import paths | Cons: muddies
  what's stable vs experimental
- Three folders (`primitives/` / `marketing/` / `brand/`) — Pros: extra
  granularity for `BrandLogo` | Cons: over-engineering for one component
**Impact if wrong:** Low — moving a file between folders is two edits.

---

## Q7: All components are server components (no `'use client'`)

**Phase:** Concept
**Chosen:** No component is marked `'use client'` in this iteration.
| **Confidence:** High
**Rationale:** None of the 9 prototypes use `useState`, refs, event handlers,
or browser APIs. They are pure presentational. Next.js 15 RSC default is
server-render, which is what we want. The `<button>` tags don't need
client interactivity yet — wiring up the booking flow is a separate
app-level concern (the app would wrap them in a client form wrapper).
**Alternatives:**
- Mark `Hero`, `CTA`, `SiteHeader` `'use client'` proactively — Cons:
  unnecessary client bundle bloat
**Impact if wrong:** Low — adding `'use client'` later is one line.

---

## Q8: Fonts — leave Google Fonts `@import` in CSS

**Phase:** Concept
**Chosen:** Keep the existing `@import url('https://fonts.googleapis.com/css2?...')`
at the top of `colors_and_type.css`. Document in README that consumers can
optionally migrate to `next/font` for better perf. | **Confidence:** Medium
**Rationale:** Zero-work, works today, matches the current preview pages.
**Migration to `next/font` is a deferred follow-up** because:
1. The CSS file has to stay valid for non-Next consumers.
2. `next/font` swaps require app-level config; can't be done from the package.
**Alternatives:**
- Strip `@import` and require app to set up `next/font` — Cons: brittle
- Provide a `<DesignSystemFonts />` JSX wrapper — Cons: SSR ordering issues
**Impact if wrong:** Low — followup PR can switch to `next/font`.

---

## Q9: `tsconfig.jsx` set to `"react-jsx"` (not `"react"` like themes)

**Phase:** Concept
**Chosen:** `"jsx": "react-jsx"` (auto runtime). | **Confidence:** High
**Rationale:** `pyramids-themes/tsconfig.json` uses `"react"` because the
themes package contains zero JSX (it's pure data). This package has JSX in
all components — the modern auto-runtime (`"react-jsx"`) avoids the need to
`import React from 'react'` at the top of every file. Next.js 15 + React 19
expect this.
**Alternatives:**
- `"react"` (classic runtime) — Cons: requires `import React from 'react'`
  in every file
- `"preserve"` — Cons: leaves JSX in the output, breaks consumers
**Impact if wrong:** Low — flip a single tsconfig flag.

---

## Q10: `react` is both a `dependency` and a `peerDependency`

**Phase:** Concept
**Chosen:** Declare `react` as both. | **Confidence:** High
**Rationale:** Matches `pyramids-themes` and `pyramids-layouts` (both have
React in `dependencies`). Adding it as `peerDependencies` too is best
practice for a UI library — ensures the consumer's React copy is the one
that runs at runtime (avoids "two Reacts" hooks-of-rules error). With yarn
workspaces, the version is hoisted, so the dep + peer pair is a no-op at
install time but documents intent.
**Alternatives:**
- Peer only — Cons: `tsc` won't find React types during the package build
- Dep only — Cons: risk of duplicate React in the consumer
**Impact if wrong:** Low — adjust manifest if anyone complains.

---

## Q11: Build order — after `themes`, before `layouts`/`ctas`/`links`

**Phase:** Concept
**Chosen:** Insert `pyramids-design-system` build between `pyramids-themes`
and `pyramids-layouts` in `yarn build:deps`. | **Confidence:** Medium
**Rationale:** This package depends on `react` only (no workspace deps in
this iteration). It's safe at any position. Putting it just after
`pyramids-themes` reflects its **conceptual** position (foundational
visual layer) without yet having a code-level dependency. Future
iterations may add `pyramids-helpers` (for `twCss`) or `pyramids-themes`
(for `pyramidsColors`) — at which point the build-order is already correct.
**Alternatives:**
- Last in chain — Pros: zero risk | Cons: doesn't reflect intent
- First — Cons: misleading, suggests `helpers` depends on it
**Impact if wrong:** Low — a one-character `package.json` edit.

---

## Q12: Drop inline `IBM Plex Sans` in ported components — flag content mismatch

**Phase:** Implementation
**Chosen:** All 9 ported `.tsx` components use the design-system CSS
variables (`var(--font-sans)`, `var(--font-display)`, etc.) instead of the
inline `fontFamily: "'IBM Plex Sans', system-ui, ..."`. **Flag:** the README
claims Caveat / Kalam / Architects Daughter / JetBrains Mono, but
`colors_and_type.css` actually `@import`s IBM Plex Sans / Plex Mono / Caveat.
The CSS is the ground truth; the README's stated stack is aspirational.
| **Confidence:** Medium
**Rationale:** Per the user's "Things to flag rather than fix": "pick the
README's stated stack ... but call it out so the user can override". I'm
inverting that slightly because the **shipped CSS** is what the package
actually delivers — IBM Plex Sans + Caveat + Plex Mono. Flagging the README
mismatch and letting the user resolve it is the lower-risk move. Components
read the CSS variable, so whichever family the CSS imports is what renders.
**Alternatives:**
- Edit the CSS to import Caveat/Kalam/Architects Daughter/JetBrains Mono per
  the README — Pros: matches README | Cons: changes the visual look the user
  has been seeing in `preview/*.html`. Boss said don't change content
  silently.
**Impact if wrong:** Low — the user can edit one `@import` URL.

⚠️ **REVIEW** — content/visual decision. User must align README ↔ CSS at some point.

---

## Q13: Smoke-test page lives in `apps/robusta/src/app/_design-test/page.tsx`

**Phase:** Implementation
**Chosen:** Add a single Next.js page that imports CSS + asset + component
to validate the build. **Not** wired into navigation. The leading `_` in
`_design-test` is a Next.js convention for a private folder excluded from
routing. | **Confidence:** High
**Rationale:** Per AC #4 in brainstorm. Smallest possible validation that
the package wiring works in a real Next.js 15 build.

Wait — actually Next.js 15's underscore convention is for **private**
folders **not exposed** as routes. Reviewing the docs: `_folder` → not
included in routing. Acceptable.

**Alternatives:**
- A page wired into nav — Cons: pollutes the live site
- A vitest test — Cons: vitest doesn't exercise Next's CSS / static-asset
  pipelines
**Impact if wrong:** Low — page can be deleted in one command.

---

## Flag F1: Font stack mismatch (README vs CSS)

The README says: **Caveat / Kalam / Architects Daughter / JetBrains Mono**.
The CSS actually loads: **IBM Plex Sans / IBM Plex Mono / Caveat**.

This is a **content** decision the user must make:

- If the README is right → edit `@import url(...)` in `colors_and_type.css`
  to load Kalam + Architects Daughter, and rename the variables
  (`--font-hand`, `--font-annot`).
- If the CSS is right → edit the README's "typography" section to say IBM
  Plex Sans / Plex Mono / Caveat.

**Boss did not change either.** All ported components read CSS variables,
so they automatically follow whatever the CSS resolves to.

---

## Flag F2: Wordmark PNG is 1603×312 (heavy)

`assets/robusta-build-wordmark.png` is the brand wordmark, kept as a PNG.
A vector SVG version would scale better and reduce bundle size. **Not done
this iteration** — out of scope. Flag for a follow-up feature
`vectorize-wordmark` (a designer's task more than a code task).

---

## Flag F3: Duplicate Crystal Tux assets

`crystal-tux.png` and `crystal-tux.svg` are the same illustration in two
formats. The SVG should be canonical (smaller, scalable). The PNG is kept
for compat. **Not de-duped** this iteration — out of scope. New components
prefer the SVG; the PNG remains accessible via the `exports` map for any
caller that needs raster.

---

## Flag F4: Inline `IBM Plex Sans` removed during port

All 9 prototype JSX files had `fontFamily: "'IBM Plex Sans', system-ui, ..."`
inline. The ported `.tsx` components drop this and use the CSS variables
instead. This is a **silent normalization** during the port — the visual
result is identical when `colors_and_type.css` is loaded (because the CSS
already imports IBM Plex Sans). It diverges if the CSS is swapped for a
different font family without updating these inlines.

---

## Implementation log

(populated during Phase 5)
