# Design: Bootstrap the v2 site workspace

**Last update:** 2026-07-31
**Feature:** bootstrap-robusta-build
**Infix:** BOOTSTRAP
**Status:** APPROVED
**Sources:** [story](bootstrap-robusta-build.story.md) · [brainstorm](bootstrap-robusta-build.brainstorm.md) · [epic](../pyramid-v2.epic.md) · [root.archi.md](../../../root.archi.md) · [business-rules.md](../../../business-rules.md) · [ubiquitous-language.md](../../../ubiquitous-language.md)

## Goal

Create `apps/robusta-build`, the v2 site: a workspace that installs, builds from a clean checkout and deploys, holding its own site configuration and wired to `@robusta/pyramids-design-system` alone. Its single rendered surface is a placeholder home page whose only job is to exercise the wiring end to end — the CSS subpaths, one asset subpath, one design-system component and the design tokens. Why this comes first is in the [story](bootstrap-robusta-build.story.md); six later stories of the epic land on this workspace.

Two things beyond the workspace itself land here, because this story owns the root layout: the three brand faces move to `next/font` self-hosting, and the design system's Google Fonts `@import` is neutralised in favour of a token indirection.

## Ubiquitous Language

Terms are used in the sense `ubiquitous-language.md` gives them: site, site configuration, design system, design token, page copy, content source, locale, workspace, build chain, watcher, telemetry, intent, landing page.

Two consequences worth stating, because they read like synonyms and are not:

- The placeholder home page is not a landing page. A landing page is a marketing surface built from the design system and carrying page copy; the placeholder carries none, and building the landing page is robusta-landing-page's story.
- The design system is `@robusta/pyramids-design-system` and nothing else. `pyramids-themes` is a second colour source and is not this site's design system; `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` are deprecated presentational packages, not design systems.

The story's word "shell" — the site as it stands before it carries content — is used in prose only, never in a requirement. It names a transient state rather than a durable concept, so it is not proposed for the glossary.

"Green set" and "clean checkout" are used in the sense `root.archi.md` gives them. Their glossary entries are pending upstream: Gap 1 of [pyramid-v2.epic.md](../pyramid-v2.epic.md) carries them, and nothing here waits on that.

## Business Rules (cited)

Cited verbatim from `business-rules.md`, under the epic's Infix:

- BR-PYRAMID-2 — A site built on the version 2 base must not track visitor intents.
- BR-PYRAMID-3 — Each site must carry its own design system, which no other site may reuse.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-6 — A site's design tokens must come from its design system alone.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.

## Interfaces

### `apps/robusta-build/package.json` — the workspace manifest

Created. Name `@robusta/robusta-build`, private, `type: module`. Its dependency declaration is the contract, not a formality: a workspace declares every package it imports, and nothing more.

- `dependencies`: `@robusta/pyramids-design-system` at `workspace:*`, `next`, `react`, `react-dom`
- `devDependencies`: `tailwindcss` 4, `@tailwindcss/postcss`, `typescript`, `@types/*`
- absent on purpose: `daisyui`, `@robusta/pyramids-layouts`, `@robusta/pyramids-links`, `@robusta/pyramids-ctas`, `@robusta/pyramids-themes`, `@robusta/pyramids-helpers`, `@robusta/scribe-intel`
- `scripts`: `build` (`next build`), `dev`, `start`, `lint`

`react` and `react-dom` state `^19.1.1`, the version every workspace converged on; `next` states the major already resolved in the tree, so the site introduces no second Next major.

### `apps/robusta-build/src/seopyramids.config.ts` — the site configuration

Created. The type is declared locally, per the story's decision of 2026-07-30; where it permanently lives is content-source's call.

```ts
export interface BlogConfig {
  defaultLocale: string;
  otherLocales: string[];
  debugImagePath: boolean;
  mandatoryKeywords: string[];
  rollSize: number;
  author?: string;
  getCategories: () => Promise<string[][]>;
}

interface SeoPyramidsConfig {
  domain: string;
  siteName: string;
  siteTitle: string;
  mission?: string;
  logo: string;
  defaultLocale: string;
  otherLocales: string[];
  blogConfig: BlogConfig;
}

export function getSeoPyramidsConfig(): SeoPyramidsConfig;
```

Shape identical to `apps/robusta` and `apps/dakar` — same field names, same optionality — so a later story can lift the type into a package without touching a call site. Values: domain `https://www.robusta.build`, siteName `Robusta Build`, siteTitle and mission carried over from v1 unchanged, defaultLocale `en`, otherLocales `['fr']`, blogConfig with `rollSize: 12`, `author: 'Nicolas Zozol'`, `mandatoryKeywords: ['robusta build', 'freelance']`, `debugImagePath: false`, `defaultLocale: 'en'`, `otherLocales: ['fr']`. `getCategories` resolves to an empty list until content-source lands — an empty result, never a throw and never a stub that reads a content source.

`logo` is an absolute URL composed from `domain` and the design system's wordmark URL, never a `public/` path: no brand asset is copied into the repository.

### `apps/robusta-build/src/design-system/assets.ts` — the asset URL seam

Created. Settles, once for the whole site, the typing the design system's README and the v1 smoke page both work around by hand:

```ts
export const wordmarkSrc: string;
```

The module imports `@robusta/pyramids-design-system/assets/robusta-build-wordmark.png` and exposes the resolved URL as a plain string. Every consumer — the site configuration's `logo`, the home page's `<BrandLogo wordmarkSrc={…}>` — reads this export. The defensive `typeof wordmark === 'string' ? wordmark : wordmark.src` shape appears exactly once in the site.

`BrandLogo`'s own `wordmarkSrc` default is `/_next/static/media/robusta-build-wordmark.png`, a hardcoded path that is wrong for any consumer, so the site always passes the prop explicitly. The package is not changed for it.

### `apps/robusta-build/src/app/layout.tsx` — the root layout

Created. Four contracts, and each is the reason this story owns the file.

Document language. `<html lang={getSeoPyramidsConfig().defaultLocale}>` — read from the site configuration, never hardcoded, because seo-url-scheme's `/l/{locale}` prefix is written against that same value.

Fonts. Three `next/font/google` loaders, whose weights mirror the query string being removed from the design system's CSS:

```ts
const ibmPlexSans = IBM_Plex_Sans({ variable: '--font-ibm-plex-sans', subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });
const ibmPlexMono = IBM_Plex_Mono({ variable: '--font-ibm-plex-mono', subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });
const caveat       = Caveat({       variable: '--font-caveat',        subsets: ['latin'], weight: ['600', '700'],               display: 'swap' });
```

Their `.variable` classes go on `<html>`, the same element `:root` addresses, so the three custom properties are in scope for the design system's token definitions. `next/font/google` self-hosts the faces at build time: the loaded page issues no request to a third party, which is what the story's decision of 2026-07-30 buys.

Robots. `export const metadata: Metadata` carries `robots: { index: false, follow: false }` at the root, so it covers every page the site will ever add rather than the home page alone. Removing it is an acceptance criterion of robusta-landing-page, not a chore anyone may do silently.

CSS load order, which is a contract and not a preference:

```ts
import './globals.css';                                        // Tailwind 4 entry
import '@robusta/pyramids-design-system/colors_and_type.css';  // tokens + element styles
import '@robusta/pyramids-design-system/sketch.css';           // .sk-* primitives, depends on the tokens
```

`sketch.css` after `colors_and_type.css` because it reads its variables. Both after the Tailwind entry: they carry unlayered rules on `html`, `body`, `h1`, `h2`, `h3`, `p`, `code` and `pre`, and Tailwind 4 emits preflight inside `@layer base`.

### `apps/robusta-build/src/app/globals.css` — the Tailwind entry and the token bridge

Created. Holds `@import 'tailwindcss';` and nothing else that carries a value. Any name the site has to introduce for a third-party token layer — shadcn's `--background`, `--foreground`, `--primary` and siblings — is declared here as an alias of a design-system token and never as a literal colour, so the site adds a name, never a source (BR-PYRAMID-6). Shape of the bridge, whenever the first such name is needed:

```css
--background: var(--paper);
--foreground: var(--ink-soft);
--primary:    var(--brand-primary);
```

The site defines no `--font-*`, no `--t-*` and no `--sp-*`: those come from the package.

### `apps/robusta-build/src/app/page.tsx` — the placeholder home page

Created. A server component rendering the wordmark through `BrandLogo`, one further design-system primitive, and text taking its family and colour from the tokens. No page copy: no pitch, no navigation, no article, no call to action. It exists to be deleted by robusta-landing-page, and its value is measured by how little that story has to undo.

### `packages/robusta-design-system/colors_and_type.css` — the one package modification

Modified. Two edits, and the seam between the site and the package is entirely here.

Line 6, removed:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Caveat:wght@600;700&display=swap');
```

Replaced by a comment stating the contract: the package owns the families and their fallback order, the consuming site supplies the loaded face through three custom properties, and a consumer that supplies nothing still resolves a valid family.

The type-family block, before:

```css
  --font-sans:    'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-script:  'Caveat', cursive;
  --font-mono:    'IBM Plex Mono', ui-monospace, Menlo, monospace;
```

after:

```css
  --font-sans:    var(--font-ibm-plex-sans, 'IBM Plex Sans'), system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-script:  var(--font-caveat, 'Caveat'), cursive;
  --font-mono:    var(--font-ibm-plex-mono, 'IBM Plex Mono'), ui-monospace, Menlo, monospace;
```

`--font-display`, `--font-hand` and `--font-annot` are aliases of `--font-sans` and follow with no edit. Nothing else in the file moves.

The three slots `--font-ibm-plex-sans`, `--font-ibm-plex-mono` and `--font-caveat` are the package's published consumer contract. The design token stays `--font-sans`: its name, its family order and its fallbacks are the package's, and the site never assigns it. What the site supplies is a face, not a token — which is why BR-PYRAMID-6 holds through this seam and would not hold if the site redefined `--font-sans` in its own stylesheet.

Consequence outside this story, and it is real: `apps/robusta/src/app/_design-test/page.tsx` is the only other consumer of these stylesheets. It loads no `next/font`, so after this change it renders the fallback stacks — `system-ui` for sans, `cursive` for script — instead of the webfonts. Its build stays green and no route is affected; the page is private (`_`-prefixed) and belongs to a site the epic retires.

### Root `package.json` — the new scripts

Modified, next to the existing pair:

- `"build:robusta-build": "yarn build:deps && yarn workspace @robusta/robusta-build run build"`
- `"dev:robusta-build": "yarn workspace @robusta/robusta-build run dev"`

`build:deps` rather than a site-specific subset: the green set is defined in `root.archi.md` as `build:deps` followed by each site, and a per-site subset drifts the day a later story declares another package. `build:deps` already builds the design system, between `pyramids-themes` and `pyramids-layouts`, so no ordering changes. `w:design-system` already exists and is the watcher a developer runs alongside `dev:robusta-build`.

### The deployment contract

The site is a Vercel project of its own, on a preview domain, leaving robusta.build on the v1 project. Root directory `apps/robusta-build`, install command `yarn install` at the repository root, build command `yarn build:robusta-build`, Node 22 to match `engines`. Creating the project is the account owner's — see Gap 1.

## Technical Constraints

- Yarn 4.17.1 with `nodeLinker: node-modules`, Node 22, corepack honouring `packageManager`. Plug'n'Play is deliberately unused: `tsc`, `next build` and vitest all read the on-disk layout.
- Intra-monorepo edges state the workspace protocol (`"@robusta/pyramids-design-system": "workspace:*"`). These packages are published nowhere, so a version range the resolver could take to the registry is a clean-checkout 404 instead of a local resolution.
- A workspace declares every package it imports, and a package holding process-wide state — React first — resolves to exactly one copy per graph. This is what unblock-build was: both failures were declaration defects, not code defects. React and `react-dom` are declared at `^19.1.1`, the single version the whole tree converges on; no release candidate anywhere.
- Apps consume built artefacts, never sources. The design system reaches the site through `dist/`, its CSS and assets through the exports map subpaths. A package edit is invisible until it is rebuilt or a watcher is running.
- Local TypeScript imports end with `.js` even though the source is `.ts`/`.tsx`.
- Tailwind 4 in this workspace while `apps/robusta` and `apps/dakar` stay on Tailwind 3. The two majors are devDependencies of sibling workspaces and no runtime shares them, so this is not the duplicate-copy class of failure — but it does mean two PostCSS pipelines coexist, and Tailwind 4's is `@tailwindcss/postcss` with a CSS-first configuration, not a `tailwind.config.ts`.
- Tailwind 4 emits `@layer theme, base, components, utilities`, preflight sitting in `base`. The design system's stylesheets are unlayered, and unlayered rules outrank any layered rule regardless of source order — so `html`, `body` and the heading styles the package's own previews were validated against are what renders. Import order is set anyway, so the outcome does not depend on that single fact.
- The design system's components render inline `style` objects and its own `.sk-*` and `highlight-*` classes from `sketch.css`. Not one Tailwind utility class. The site's Tailwind source scanning therefore has no reason to reach into `packages/robusta-design-system` — the classes it needs come from a stylesheet, not from a scanner.
- No component in the package carries `'use client'` and none uses a hook. Every one is server-component-safe, so the placeholder page needs no client boundary and stays statically generated.
- The wordmark is a 1603×312 PNG. On a page whose only content is that image, it is the largest contentful paint; vectorising it is item 10 of the epic, not this story.

## Requirements

R-BOOTSTRAP-1 to 19 keep the brainstorm's numbering. R-BOOTSTRAP-13 is restated against what the code turned out to be, R-BOOTSTRAP-18 is split along the machine/human line. The block from 21 carries what the story's decisions of 2026-07-30 added after the brainstorm.

Workspace and build chain

- R-BOOTSTRAP-1: `apps/robusta-build` is a workspace of the monorepo, named `@robusta/robusta-build`, installed and built alongside the others.
- R-BOOTSTRAP-2: The root exposes a build script and a dev script for the v2 site, next to `build:robusta` and `dev:robusta`.
- R-BOOTSTRAP-3: The site resolves every workspace package it depends on through that package's build output, never its sources.
- R-BOOTSTRAP-4: The build chain builds `@robusta/pyramids-design-system` before the site builds.

Site configuration

- R-BOOTSTRAP-5: The site holds its per-site truth in `src/seopyramids.config.ts`: domain `https://www.robusta.build`, siteName `Robusta Build`, the v1 siteTitle and mission carried over unchanged, defaultLocale `en`, otherLocales `fr`, and a blog configuration carrying the v1 roll size and author.
- R-BOOTSTRAP-6: The logo of the site configuration resolves to the design system's wordmark through the package's assets subpath, and no brand asset is copied into `public/`.
- R-BOOTSTRAP-7: The category resolver of the blog configuration returns an empty result until content-source lands, and reads no content source.
- R-BOOTSTRAP-29: The site declares the site-configuration type locally, in the field-for-field shape the two existing sites use.

Design system and styling

- R-BOOTSTRAP-8: `@robusta/pyramids-design-system` is this site's design system, and no other site reuses it. Realizes BR-PYRAMID-3.
- R-BOOTSTRAP-9: The design system's CSS and assets reach the site through the package's exports map subpaths, with no copy step.
- R-BOOTSTRAP-10: The site defines no design token of its own: every colour, font and spacing value it renders resolves to a design-system token. Realizes BR-PYRAMID-6.
- R-BOOTSTRAP-11: The site declares no DaisyUI dependency and renders no DaisyUI class.
- R-BOOTSTRAP-12: A shared package whose rendered classes are DaisyUI classes is not wired into the site.
- R-BOOTSTRAP-13: The site's stylesheet generation covers every source that contributes a class the site's own code renders; the design system contributes none, its components rendering only inline styles and classes its own stylesheets define.
- R-BOOTSTRAP-25: The site takes Tailwind 4 with a CSS-first configuration, and the two v1 apps stay on Tailwind 3.
- R-BOOTSTRAP-26: The design system's element styles are what renders where they and Tailwind's preflight address the same element.
- R-BOOTSTRAP-27: A token name the site introduces for a third-party layer is declared as an alias of a design-system token and never as a literal value. Realizes BR-PYRAMID-6.

Fonts

- R-BOOTSTRAP-21: The site self-hosts IBM Plex Sans, IBM Plex Mono and Caveat through `next/font`, at the weights the design system's stylesheet requested, and loads no font from a third party at view time.
- R-BOOTSTRAP-22: The design system keeps owning the type tokens — their family names, order and fallbacks — and takes the loaded face from the consuming site through named custom properties; a consumer supplying none still resolves a valid family. Realizes BR-PYRAMID-6.
- R-BOOTSTRAP-23: The change to the design system's stylesheet leaves `apps/robusta` and `apps/dakar` building green and changes no route of either.

The shell

- R-BOOTSTRAP-14: The site serves a root layout that carries the document language from the site configuration's default locale and loads the design system's CSS.
- R-BOOTSTRAP-15: The site serves a placeholder home page rendering at least one design-system component, one design-system asset, and the token-driven typography and colours.
- R-BOOTSTRAP-30: The site renders no page copy it has not written itself, and in particular none of the default copy the design system's marketing surfaces carry. Realizes BR-PYRAMID-8.
- R-BOOTSTRAP-16: The site is not indexable for as long as its home page carries no page copy, and the directive sits at the root rather than on the page.
- R-BOOTSTRAP-17: No telemetry client and no intent client is wired into the site. Realizes BR-PYRAMID-2.
- R-BOOTSTRAP-28: The site normalises the design system's asset URL in one module, and no page repeats that read.

Platform and deployment

- R-BOOTSTRAP-24: The site declares every package it imports, states the workspace protocol on intra-monorepo edges, and resolves exactly one copy of React at `19.1.1`.
- R-BOOTSTRAP-18: The site builds green from a clean checkout of the repository, as part of the green set. Realizes BR-PYRAMID-5.
- R-BOOTSTRAP-19: The site is served from its own Vercel project on a preview domain, and robusta.build keeps answering from the v1 site.

R-BOOTSTRAP-18 as the brainstorm wrote it bundled two claims of different natures. The clean-checkout build is machine-verifiable and belongs to the implementation. The live preview URL is not: it needs a Vercel project only the account owner can create, so R-BOOTSTRAP-19 is verified by a human opening two URLs, once.

## Acceptance Criteria

Cast: Tux clones the repository onto a machine that has never built it; Ada develops with a watcher running; Barbot is a crawler; Nina is the publisher checking the deployment.

Build chain

- AC-BOOTSTRAP-01: Given Tux on a clean checkout, when he runs `yarn install` then `yarn build:robusta-build`, then the design system compiles before the site and the site build completes with no manual step. Realizes BR-PYRAMID-5.
- AC-BOOTSTRAP-02: Given the v1 workspace `@robusta/build` still exists, when both are installed, then no workspace name collides and `build:robusta` still builds the v1 site.
- AC-BOOTSTRAP-03: Given Tux runs the whole green set from that same clean state, when `build:dakar` and `build:robusta` run after `build:robusta-build`, then all three sites build green.
- AC-BOOTSTRAP-04: Given the installed tree, when React is resolved from the new site, then exactly one copy answers, at `19.1.1`.
- AC-BOOTSTRAP-05: Given Ada runs `dev:robusta-build` with `w:design-system` alongside, when she edits a design-system source, then the running site picks the change up from the rebuilt output.

Configuration and design-system wiring

- AC-BOOTSTRAP-21: Given the site configuration, when the site reads it, then domain is `https://www.robusta.build`, siteName is `Robusta Build`, defaultLocale is `en` and otherLocales is `['fr']`.
- AC-BOOTSTRAP-22: Given the logo value, when the home page renders, then it resolves through the design system's assets subpath and no brand file exists under `public/`.
- AC-BOOTSTRAP-23: Given no content source exists yet, when the blog configuration's category resolver is called, then it returns an empty result without throwing and reads nothing from disk.
- AC-BOOTSTRAP-24: Given the root layout imports both stylesheets through their subpaths, when the site builds, then both resolve and the emitted stylesheet carries the design system's custom properties.
- AC-BOOTSTRAP-25: Given the wordmark is imported through its asset subpath, when the site builds, then the asset is emitted with a hashed URL and no file was copied into the repository.
- AC-BOOTSTRAP-26: Given a design-system component is rendered from a server component, when the page is generated, then it renders with no client boundary.
- AC-BOOTSTRAP-27: Given the site's manifest, when its dependencies are inspected, then DaisyUI, the three deprecated presentational packages, `pyramids-themes` and `scribe-intel` appear nowhere. Realizes BR-PYRAMID-2 and BR-PYRAMID-3.

Styling and fonts

- AC-BOOTSTRAP-41: Given Tailwind's preflight and the design system's element styles both load, when the home page renders, then the design system's typography and paper background win.
- AC-BOOTSTRAP-42: Given the site renders no shadcn component yet, when the built stylesheet is read, then any third-party token name it defines resolves to a design-system token and no literal colour appears in the site's own CSS. Realizes BR-PYRAMID-6.
- AC-BOOTSTRAP-43: Given the home page is loaded, when its network requests are listed, then none goes to a font CDN and the three families are served from the site's own origin.
- AC-BOOTSTRAP-44: Given a consumer that loads the design system's CSS and supplies none of the three face properties, when a heading renders, then `--font-sans` still resolves to a valid family and no rule is broken. Realizes BR-PYRAMID-6.
- AC-BOOTSTRAP-45: Given the design system's stylesheet has changed, when `build:robusta` and `build:dakar` run, then both stay green and produce the same route tables as their baselines.

The shell

- AC-BOOTSTRAP-61: Given the site configuration's default locale, when the root layout renders, then the document language is set from it rather than hardcoded.
- AC-BOOTSTRAP-62: Given the home page, when it is fetched, then it shows the wordmark, the token typography and the brand colours, carries no article and no navigation, and renders none of the prototype copy the design system's surfaces default to. Realizes BR-PYRAMID-8.
- AC-BOOTSTRAP-63: Given Barbot fetches any page of the site, when the response is read, then it says not to index, and the directive comes from the root layout rather than from the page.

Deployment

- AC-BOOTSTRAP-81: Given Nina opens the preview URL after the first deploy, when the home page loads, then it renders as it does locally.
- AC-BOOTSTRAP-82: Given the new project exists, when Nina fetches robusta.build, then the v1 site still answers, and a failed build on the new project changes nothing there.

## Dependencies

- Depends on: Dep 1 of the story, merge-design-system — satisfied, `c0f98fe` on `dev`, with the package's slot in `build:deps` already taken.
- Depends on: Dep 2 of the story, unblock-build — satisfied, `d9199ad`. The green set today is `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`; this story adds `build:robusta-build` to it.
- Depends on: Dep 3 of the story, the Vercel project — not satisfied, see Gap 1. It gates R-BOOTSTRAP-19 and nothing else: everything from R-BOOTSTRAP-1 to 18 is verifiable locally.
- Blocks: seo-url-scheme, content-source, robusta-landing-page, migrate-learn-content, seo-excellence — items 2, 3, 5, 6 and 7 of the epic's À faire.

## Out of scope

- `apps/dakar`, which is live and untouched, and `apps/robusta`, retired by the epic and not refactored. The only edit reaching them is the design system's stylesheet, and AC-BOOTSTRAP-45 is what keeps it honest.
- `pyramids-layouts`, `pyramids-links`, `pyramids-ctas` and `pyramids-themes`. The v2 site consumes none of them; removing them is item 13 of the epic and out of the epic's reach besides.
- The design system's missing responsive behaviour — no `@media`, no `clamp()`, no viewport unit in any of the eight marketing surfaces — and the anchor nested inside a button in every one of its calls to action. Both are real, both belong to design-system-responsive, item 4 of the epic. The placeholder home page renders no marketing surface and no call to action, so neither blocks this story.
- The route scheme (seo-url-scheme), the content pipeline (content-source, migrate-learn-content), the landing page (robusta-landing-page), and metadata, sitemap and structured data beyond the root noindex (seo-excellence).
- The domain switch, which is retire-robusta-v1.

## Open Questions & Gaps

### Gaps

- Gap 1: The Vercel project for `apps/robusta-build` does not exist, and only the account owner can create it — Dep 3 of the story. Its name, its preview domain and its root-directory setting are therefore unknown, and R-BOOTSTRAP-19 with AC-BOOTSTRAP-81 and 82 cannot be verified by the implementation.
- Proposition: implement and verify R-BOOTSTRAP-1 to 18 without it, on a green build from a clean checkout; the account owner then creates the project with root directory `apps/robusta-build`, install `yarn install` at the repository root, build `yarn build:robusta-build`, Node 22, and checks the two URLs once.
- Rationale: splitting the two halves is what keeps the story implementable today — the machine-verifiable half is the whole wiring this story exists to prove, and the human half is one project creation and two page loads.
- Resolution: 2026-07-31, boss run — proposition accepted, and it is the only reading available: no agent holds Vercel credentials. R-BOOTSTRAP-1 to 18 are implemented and verified locally; R-BOOTSTRAP-19, AC-BOOTSTRAP-81 and AC-BOOTSTRAP-82 stay open and are the account owner's, with the project settings above as the handover.

- Gap 2: Two sections of `CLAUDE.md` instruct the opposite of this story, and the story's Documentation updates do not cover them. The Styling section mandates DaisyUI semantic tokens for every generated component, against R-BOOTSTRAP-11; the Telemetry section asks for `Telemetry.component(...)` at the top of pages and components, against R-BOOTSTRAP-17 and BR-PYRAMID-2. Both are read by whoever implements, so both will be followed unless scoped.
- Proposition: the story's Documentation updates gain a bullet — change the Styling and Telemetry sections of `CLAUDE.md` to scope their instructions to the v1 apps and state that `apps/robusta-build` takes Tailwind 4 with shadcn and wires no telemetry.
- Rationale: `root.archi.md` already flags the DaisyUI mandate as live-but-contradicted and leaves the correction unassigned; this story is the first one where the contradiction produces wrong code. Only storyman writes the story's plan, so the addition is proposed here rather than made.
- Resolution: 2026-07-31, boss run — proposition accepted and executed as documentation. `CLAUDE.md` is already in the story's plan for its Apps and Commands sections, and both contradicting sections are scoped in the same pass rather than left to produce wrong code in the next story. The story's plan itself is not edited: that is storyman's file, and the addition is recorded here and in `decisions-and-questions.md` for a later `storyman refine`.

### Open Questions

- Open Question 1: Does this story run `shadcn init`, or does the first story that needs a shadcn component do it?
- Proposition: not here. Wire Tailwind 4 and state the token bridge contract in `globals.css`, and leave `components.json`, `cn()`, `clsx` and `tailwind-merge` to the first story that adds a component.
- Rationale: Tailwind has to be in the page for AC-BOOTSTRAP-41 to mean anything, but `shadcn init` writes a default token palette that is a second source of colour — exactly what BR-PYRAMID-6 forbids — so running it before any component needs it buys a contradiction and no coverage.
- Resolution: 2026-07-31, boss run — proposition accepted on the toolchain, refused on the bridge. `shadcn init` is not run: no `components.json`, no `cn()`, no `clsx`, no `tailwind-merge`, no Radix, because nothing in the shell merges a class. But the alias bridge is written now rather than described, since it carries no value of its own — every name in it resolves to a design-system token — and it is what makes AC-BOOTSTRAP-42 checkable today instead of a promise. The first story adding a shadcn component runs the CLI against a token layer that already points at the design system, which is the ordering BR-PYRAMID-6 wants.

- Open Question 2: `apps/robusta/src/app/_design-test/page.tsx` loses its webfonts once the `@import` goes, since the v1 site loads no `next/font`. Accept the degradation, or delete the page in this story?
- Proposition: accept it and leave the page. Its own header says it exists so `build:robusta` exercises the package wiring, and after this story `build:robusta-build` does that better; deleting it belongs to retire-robusta-v1.
- Rationale: the page is private, routed nowhere and part of a site the epic retires, so its rendered fonts are worth nothing — while it still catches a broken exports map on the v1 side for free until v2 is deployed.
- Resolution: 2026-07-31, boss run — proposition accepted for the v1 page, and extended to a consumer the question missed. The 22 files of `packages/robusta-design-system/preview/` also `<link>` `../colors_and_type.css`, and the epic's decision of 2026-07-29 fixed the canonical font stack precisely because those previews are the validated visual. Losing their webfonts silently would contradict it, so the `@import` is not deleted but moved to an opt-in subpath, `@robusta/pyramids-design-system/fonts.css`, which the previews link and no site does. The token stylesheet carries no third-party request either way, which is what the story's decision asked for.
