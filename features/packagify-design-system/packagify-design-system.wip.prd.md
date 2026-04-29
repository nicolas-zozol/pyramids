# PRD: packagify-design-system

**Status:** APPROVED (boss auto-approved for implementation)
**Date:** 2026-04-27
**Owner:** boss agent
**Branch:** feat/packagify-design-system

## 1. Goal

Transform `packages/robusta-design-system/` from a flat scratch folder into
a real `@robusta/pyramids-design-system` yarn-workspace package consumable
by Next.js 15 apps in this monorepo.

## 2. Non-goals

- Wiring the new components into `apps/robusta`'s live home page (separate
  follow-up).
- Touching `packages/themes/` or DaisyUI palettes.
- Removing `apps/robusta-design/` v0 prototype.
- Vectorizing `robusta-build-wordmark.png`.
- De-duplicating `crystal-tux.png` vs `.svg`.
- Storybook integration.

## 3. Requirements

| ID  | Requirement                                                                                       | State |
|-----|---------------------------------------------------------------------------------------------------|-------|
| R1  | Create `packages/robusta-design-system/package.json` with name `@robusta/pyramids-design-system`, version `1.0.0`, build/clean/lint/watch scripts mirroring `pyramids-themes`. | TODO |
| R2  | Create `packages/robusta-design-system/tsconfig.json` with `jsx: "react-jsx"`, `outDir: "dist"`, strict mode. | TODO |
| R3  | `package.json#exports` map exposes:<br/>• `.` → `dist/index.js` + `dist/index.d.ts`<br/>• `./sketch.css` → `./sketch.css`<br/>• `./colors_and_type.css` → `./colors_and_type.css`<br/>• `./assets/*` → `./assets/*` | TODO |
| R4  | `package.json#files` whitelists `["dist", "*.css", "assets", "README.md"]`. Excludes `preview/`, `ui_kits/`, `uploads/`, `SKILL.md`. | TODO |
| R5  | Create `src/index.ts` re-exporting from `src/primitives/index.ts` and `src/marketing/index.ts`. | TODO |
| R6  | Port `BrandLogo.jsx` → `src/primitives/BrandLogo.tsx`. Drop `window.ROBUSTA_WORDMARK_SRC`; import the wordmark via `import wordmark from '../../assets/robusta-build-wordmark.png'` (pass through `next/image` from caller side; component renders a plain `<img>` with explicit width/height). Accept `interface BrandLogoProps { size?: 'compact' \| 'full' \| 'mark'; className?: string; }`. | TODO |
| R7  | Port `SiteHeader.jsx` → `src/marketing/SiteHeader.tsx`. Make nav items + CTA label props-driven with defaults matching the prototype. | TODO |
| R8  | Port `Hero.jsx` → `src/marketing/Hero.tsx`. Mascot path imported via ES import. Accept eyebrow/title/subtitle/primary-CTA/secondary-CTA/footnote as props with the prototype's content as defaults. | TODO |
| R9  | Port `ServicesGrid.jsx` → `src/marketing/ServicesGrid.tsx`. Define `interface ServiceItem` and accept `services?: ServiceItem[]` with the prototype's three services as default. | TODO |
| R10 | Port `FlowDiagram.jsx` → `src/marketing/FlowDiagram.tsx`. Define `interface FlowStep`, accept `steps?: FlowStep[]` and a `caveat` prop with defaults from the prototype. | TODO |
| R11 | Port `PrinciplesList.jsx` → `src/marketing/PrinciplesList.tsx`. Define `interface Principle`, accept `principles?: Principle[]` with defaults. | TODO |
| R12 | Port `NotesPreview.jsx` → `src/marketing/NotesPreview.tsx`. Define `interface NotePost`, accept `posts?: NotePost[]` with defaults. | TODO |
| R13 | Port `CTA.jsx` → `src/marketing/CTA.tsx`. Accept title/subtitle/CTA/footnote/email-placeholder as props with defaults. | TODO |
| R14 | Port `SiteFooter.jsx` → `src/marketing/SiteFooter.tsx`. Accept `columns?: FooterColumn[]` and `tagline` as props with defaults. | TODO |
| R15 | Add primitives that the marketing components don't use directly but consumers will: `SkButton.tsx`, `SkCallout.tsx`, `SkTag.tsx`, `SkInput.tsx`. Each is a thin presentational wrapper around the existing `.sk-*` CSS class with typed props (`variant?: 'primary' \| 'ghost'` for button; `tone?: 'pink' \| 'blue' \| 'green'` for tag; etc.). | TODO |
| R16 | All ported components: drop inline `fontFamily: "'IBM Plex Sans', ..."`. Use `var(--font-sans)`, `var(--font-display)`, `var(--font-mono)` from the CSS. | TODO |
| R17 | All ported components are server-components-safe (no `'use client'` directive). | TODO |
| R18 | Root `package.json` `build:deps` script updated to include `@robusta/pyramids-design-system` between `pyramids-themes` and `pyramids-layouts`. | TODO |
| R19 | Add a smoke-test page at `apps/robusta/src/app/_design-test/page.tsx` that imports the CSS files, the wordmark asset, and renders `<BrandLogo size="full" />`. Not wired into navigation. | TODO |
| R20 | `yarn install` succeeds from repo root. `yarn workspace @robusta/pyramids-design-system run build` succeeds. | TODO |
| R21 | Append a "Install / Import" section atop the existing `README.md`. Keep the brand voice intact below. | TODO |
| R22 | Create `packages/robusta-design-system/design-system.archi.md` matching the format of `themes.archi.md`. | TODO |
| R23 | Single `feat(design-system): ...` commit on `feat/packagify-design-system`. No `Co-Authored-By` line. | TODO |
| R24 | Sync tracking docs (brainstorm, PRD, decisions-and-questions) to `dev` via fine-grained tracking commit. | TODO |

## 4. Architecture

```
packages/robusta-design-system/
├── package.json         (NEW)
├── tsconfig.json        (NEW)
├── README.md            (PREPENDED)
├── design-system.archi.md (NEW)
├── colors_and_type.css  (UNCHANGED)
├── sketch.css           (UNCHANGED)
├── assets/              (UNCHANGED, exposed via exports map)
├── ui_kits/             (UNCHANGED, unpublished)
├── preview/             (UNCHANGED, unpublished)
├── uploads/             (UNCHANGED, unpublished)
├── SKILL.md             (UNCHANGED, unpublished)
└── src/                 (NEW)
    ├── index.ts
    ├── primitives/
    │   ├── index.ts
    │   ├── BrandLogo.tsx
    │   ├── SkButton.tsx
    │   ├── SkCallout.tsx
    │   ├── SkTag.tsx
    │   ├── SkInput.tsx
    │   └── SkArrowRight.tsx
    └── marketing/
        ├── index.ts
        ├── Hero.tsx
        ├── SiteHeader.tsx
        ├── SiteFooter.tsx
        ├── ServicesGrid.tsx
        ├── FlowDiagram.tsx
        ├── PrinciplesList.tsx
        ├── NotesPreview.tsx
        └── CTA.tsx
```

## 5. Public API

```ts
// from '@robusta/pyramids-design-system'
export { BrandLogo, type BrandLogoProps } from './primitives/BrandLogo.js';
export { SkButton,  type SkButtonProps  } from './primitives/SkButton.js';
export { SkCallout, type SkCalloutProps } from './primitives/SkCallout.js';
export { SkTag,     type SkTagProps     } from './primitives/SkTag.js';
export { SkInput,   type SkInputProps   } from './primitives/SkInput.js';
export { SkArrowRight } from './primitives/SkArrowRight.js';

export { Hero,            type HeroProps            } from './marketing/Hero.js';
export { SiteHeader,      type SiteHeaderProps      } from './marketing/SiteHeader.js';
export { SiteFooter,      type SiteFooterProps      } from './marketing/SiteFooter.js';
export { ServicesGrid,    type ServicesGridProps,    type ServiceItem    } from './marketing/ServicesGrid.js';
export { FlowDiagram,     type FlowDiagramProps,     type FlowStep       } from './marketing/FlowDiagram.js';
export { PrinciplesList,  type PrinciplesListProps,  type Principle      } from './marketing/PrinciplesList.js';
export { NotesPreview,    type NotesPreviewProps,    type NotePost       } from './marketing/NotesPreview.js';
export { CTA,             type CTAProps             } from './marketing/CTA.js';
```

## 6. Acceptance criteria

(matches AC list in brainstorm §12)

1. `yarn install` from repo root succeeds with the new workspace.
2. `yarn workspace @robusta/pyramids-design-system run build` produces
   `dist/index.js`, `dist/index.d.ts`.
3. `yarn build:deps` includes the new package in the chain.
4. `apps/robusta/src/app/_design-test/page.tsx` imports CSS, asset, and
   `<BrandLogo />` — and `yarn build:robusta` completes.
5. README's new "Install / Import" section explains the consumer setup.
6. `design-system.archi.md` exists.
7. `decisions-and-questions.md` lists material decisions including the
   four flags.
8. Single `feat(design-system): ...` commit.

## 7. Progress

| Requirement                | Status |
|----------------------------|--------|
| R1  package.json           | TODO   |
| R2  tsconfig.json          | TODO   |
| R3  exports map            | TODO   |
| R4  files whitelist        | TODO   |
| R5  src/index.ts           | TODO   |
| R6  BrandLogo              | TODO   |
| R7  SiteHeader             | TODO   |
| R8  Hero                   | TODO   |
| R9  ServicesGrid           | TODO   |
| R10 FlowDiagram            | TODO   |
| R11 PrinciplesList         | TODO   |
| R12 NotesPreview           | TODO   |
| R13 CTA                    | TODO   |
| R14 SiteFooter             | TODO   |
| R15 primitives             | TODO   |
| R16 drop inline IBM Plex   | TODO   |
| R17 server-safe            | TODO   |
| R18 build:deps wire-up     | TODO   |
| R19 smoke-test page        | TODO   |
| R20 yarn install / build   | TODO   |
| R21 README append          | TODO   |
| R22 archi.md               | TODO   |
| R23 single commit          | TODO   |
| R24 sync to dev            | TODO   |
