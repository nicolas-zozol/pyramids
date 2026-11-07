# Brainstorm : Bootstrap the v2 site workspace

**Date :** 2026-07-29
**Feature :** bootstrap-robusta-build
**Infix :** BOOTSTRAP
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Sources read: the story, `pyramid-v2.epic.md` (Décisions structurantes of 2026-07-29), `root.archi.md`, `ubiquitous-language.md`, `business-rules.md`, the project `CLAUDE.md`, the sibling stories unblock-build and seo-url-scheme, and the code: root `package.json`, both existing `seopyramids.config.ts`, `apps/robusta/tailwind.config.ts`, the sources of the five shared packages, and commit `6fb8d72` on `feat/packagify-design-system`.

## Requirements

Workspace and build chain

- R-BOOTSTRAP-1 — `apps/robusta-build` is a workspace of the monorepo, named `@robusta/robusta-build`, installed and built alongside the others.
- R-BOOTSTRAP-2 — The root exposes a build script and a dev script for the v2 site, next to `build:robusta` and `dev:robusta`.
- R-BOOTSTRAP-3 — The site resolves every workspace package it depends on through that package's build output, never its sources.
- R-BOOTSTRAP-4 — The build chain builds `@robusta/pyramids-design-system` before the site builds.

Site configuration

- R-BOOTSTRAP-5 — The site holds its per-site truth in `src/seopyramids.config.ts`: domain `https://www.robusta.build`, siteName `Robusta Build`, the v1 siteTitle and mission carried over unchanged, defaultLocale `en`, otherLocales `fr`, and a blog configuration carrying the v1 roll size and author.
- R-BOOTSTRAP-6 — The logo of the site configuration resolves to the design system's wordmark through the package's assets subpath, and no brand asset is copied into `public/`.
- R-BOOTSTRAP-7 — The category resolver of the blog configuration stays empty until content-source lands.

Design system and styling

- R-BOOTSTRAP-8 — `@robusta/pyramids-design-system` is this site's design system, and no other site reuses it. Cites BR-PYRAMID-3, "Each site must carry its own design system, which no other site may reuse."
- R-BOOTSTRAP-9 — The design system's CSS and assets reach the site through the package's exports map subpaths, with no copy step.
- R-BOOTSTRAP-10 — The site defines no design token of its own: every colour, font and spacing value it renders resolves to a design-system token.
- R-BOOTSTRAP-11 — The site declares no DaisyUI dependency and renders no DaisyUI class.
- R-BOOTSTRAP-12 — A shared package whose rendered classes are DaisyUI classes is not wired into the site.
- R-BOOTSTRAP-13 — The site's stylesheet generation covers every source that contributes a class the site renders, the shared packages it consumes included.

The shell

- R-BOOTSTRAP-14 — The site serves a root layout that carries the document language from the site configuration's default locale and loads the design system's CSS.
- R-BOOTSTRAP-15 — The site serves a placeholder home page rendering at least one design-system component, one design-system asset, and the token-driven typography and colours.
- R-BOOTSTRAP-16 — The shell is not indexable for as long as its home page is a placeholder.
- R-BOOTSTRAP-17 — No telemetry client and no intent client is wired into the site. Cites the epic's BR-PYRAMID-2, "A site built on the version 2 base must not track visitor intents" — see Gap 1 on the registry's divergent wording.

Deployment

- R-BOOTSTRAP-18 — The site builds green from a clean checkout and is served from a deployed URL.
- R-BOOTSTRAP-19 — The shell is deployed as its own Vercel project on a preview domain; robusta.build keeps pointing at the v1 site.

## Business rules

Rules in play, cited not created: BR-PYRAMID-3 (one design system per site) governs R-BOOTSTRAP-8, and the epic's BR-PYRAMID-2 (no visitor-intent tracking) governs R-BOOTSTRAP-17. The registry and the epic disagree on what BR-PYRAMID-2 says — Gap 1.

One candidate rule surfaced, raised as Open Question 4 rather than asserted: a site's design tokens must come from its design system alone. It passes the four tests — the publisher can decide it, "design token", "design system" and "site" are all in `ubiquitous-language.md`, it states what must hold with no mechanism and no sequencing, and it is a single invariant. Two other candidates were considered and dropped: "a site never reads a package's sources, only its build output" is an engineering convention, not a business constraint, and belongs in `root.archi.md` where it already sits; "a site workspace must be deployable from the day it is created" is a process statement that expires, so it fails the declarative test.

---

## 1. Product Role

What this story produces is a landing strip, not a site. `apps/robusta-build` is the workspace every later v2 story lands on: it exists, it installs, it builds, it deploys, and it renders one page that proves its own wiring. Six of the eight stories of the epic declare a dependency on it.

What it is not: a rewrite of `apps/robusta` (the v1 is retired, not repaired), a design-system showcase (the package carries its own previews), a content site (no article, no route scheme, no landing page), and not a place where the DaisyUI-to-shadcn migration of the shared packages gets improvised.

**Décision (autonome):** The deliverable is an empty but deployable Next.js site workspace whose only rendered surface is a placeholder home page that exercises the design-system wiring end to end — CSS subpath, asset subpath and one component.

**Rationale:** A shell that renders nothing proves that Next.js builds, which nobody doubted; a shell that renders the wiring proves the one thing this story exists to de-risk.

---

## 2. Target Audience

The users of this deliverable are not visitors. They are, in order: the six downstream v2 stories that need a site to land on, the publisher who has to see the brand render before trusting the design system, and whoever later opens the repo and needs to know which app is the real one.

Maturity and constraints: a single-maintainer monorepo on yarn 1, where the build chain is currently broken from a clean checkout (unblock-build) and the design system sits in an unmerged commit. Any wiring that only works on the machine where it was written is worthless here.

**Décision (autonome):** Optimise for the downstream stories: the shell's value is measured by how little seo-url-scheme, content-source and robusta-landing-page have to undo when they arrive.

**Rationale:** The placeholder page has one real reader — the next story that deletes it — so its job is to leave a correct skeleton behind, not a nice page.

---

## 3. Core Problem

Two problems, and the second is the one worth the brainstorm.

The stated problem is sequencing: nothing in the v2 epic can be verified because there is no v2 site. Every story after item 3 is a plan.

The unstated problem is the collision the epic recorded but did not resolve. On 2026-07-29 the epic decided the v2 site drops DaisyUI for shadcn, noted that the reach "belongs to epicman", and left it there. This story is where the reach is discovered, because `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` render DaisyUI classes. Without the DaisyUI plugin those classes do not error — they silently resolve to nothing, or worse, partially resolve against shadcn's own semantic tokens. Reading the sources gives the exact damage:

- `pyramids-ctas` — all four components are DaisyUI-skinned: `btn btn-primary` in `SimplePhoneCta`, `link link-hover` in `CtaLink`, `bg-accent text-accent-content` in `FatCta`. The design system already ships `SkButton` and a `CTA` marketing surface.
- `pyramids-links` — the three standard links (`SimpleLink`, `PageLink`, `NeutralLink`) all render `link`, `link-primary`, `link-hover` or `text-primary`. Only the two navigators are class-neutral (`flex space-x-4`). The valuable part — the `next/link` wrapper deciding `target`, `rel`, `noopener` and `nofollow` for external links — is logic worth salvaging under a different skin.
- `pyramids-layouts` — five of six components are plain Tailwind (`TwoColumns`, `SimpleGridLayout`, `GridCardWithSeparation`, `EmptyLine`, `SimpleCardComponent`); only `HighligthCard` needs DaisyUI (`badge badge-primary`). `SimpleGridLayout` carries a latent defect independent of DaisyUI: it interpolates `gap-${gap}`, a class Tailwind's scanner cannot see, so the gap only renders when that literal appears elsewhere.
- `pyramids-themes` — a second, JS-side colour system whose robusta values duplicate what `colors_and_type.css` already owns as CSS variables.
- `pyramids-helpers` — Tailwind-agnostic utilities, reusable as-is. Its one DaisyUI-bound export is `theme/DesignSystem.tsx`, a swatch demo page whose name collides with the glossary term.

**Décision (autonome):** The story treats the shadcn decision as a scoping problem, not a migration: the shell wires only what renders correctly without DaisyUI, and records the verdict on each shared package so the downstream stories inherit it instead of rediscovering it.

**Rationale:** Migrating five shared packages that `apps/robusta` and `apps/dakar` still consume is an epic-level item, and doing it inside a bootstrap story would make a keystone deliverable hostage to a refactor nobody scoped.

---

## 4. Unique Value Proposition

The alternative was never "some other framework". It was: copy `apps/robusta` and delete, or refactor `apps/robusta` in place.

- Copy and delete — starts from a site carrying ProseMirror, a resume, a GitHub calendar, DaisyUI, a `globals.css` remapping DaisyUI's oklch variables, and an unexplained build-worker crash. Every deletion is a judgement call about code nobody wants to read.
- Refactor in place — explicitly rejected by the epic: the v1 site and the base grew into each other, which is why v2 exists.

**Décision (autonome):** Create the workspace empty and add only what a requirement asks for, carrying nothing over from v1 except the configuration values and, later, the markdown corpus.

**Rationale:** The single reason v2 exists is that v1 accumulated coupling nobody could name; starting from an empty workspace is the only option that does not import that coupling by default.

---

## 5. Functional Scope

In scope: the workspace and its root scripts, the site configuration, the design-system wiring, the styling foundation that replaces DaisyUI, a root layout, a placeholder home page, and a deployment on a preview domain.

Out of scope, and each already owned elsewhere: the route scheme (seo-url-scheme), the content pipeline (content-source, migrate-learn-content), the real landing page (robusta-landing-page), metadata and sitemap beyond the shell's own noindex (seo-excellence), the DaisyUI-to-shadcn migration of the shared packages (epic), the domain switch (retire-robusta-v1), telemetry and intent tracking (dormant by the epic's decision).

The reuse verdict, which is scope and not implementation detail:

`@robusta/pyramids-design-system`
: Wired. The site's design system, its only declared workspace dependency.

`pyramids-helpers`
: Not wired here, reusable later. The shell renders nothing that needs it, and shadcn's own `cn()` covers what `twCss` would have done. `immutable-slugify` and `route-params` become useful in seo-url-scheme.

`pyramids-layouts`
: Not wired here. Five of its six components would work, but they are thin flex and grid wrappers that Tailwind covers directly, and wiring a package to render nothing costs a dependency and a class-scanning rule for no gain.

`pyramids-links`
: Not wired. Its standard links are DaisyUI-skinned. Its external-link logic is worth re-expressing under the v2 skin, which is seo-url-scheme's business, not this story's.

`pyramids-ctas`
: Not wired, and superseded for this site by the design system's `SkButton` and `CTA`.

`pyramids-themes`
: Not wired, and not expected to be. It is a second source of colour for a site whose design system already owns its palette.

**Décision (autonome):** The shell declares `@robusta/pyramids-design-system` as its only workspace dependency; the four other shared packages are left undeclared with the reason recorded above.

**Rationale:** Declaring a dependency the shell does not render is dead weight that the next story inherits as an implicit endorsement, and three of the four would render incorrectly the day someone did use them.

---

## 6. Core Features

### Feature: The site workspace and its place in the build chain

**Capability:** `apps/robusta-build` is a yarn workspace named `@robusta/robusta-build`, with root build and dev scripts, and the design-system package built before it.

**Acceptance Criteria:**
- Given a clean checkout, When `yarn install` then the v2 build script runs, Then the design system compiles first and the site build completes with no manual step.
- Given the v1 workspace `@robusta/build` still exists, When both are installed, Then no workspace name collides and `build:robusta` keeps building the v1 site.
- Given a developer runs the v2 dev script, When a design-system source changes with its watcher running, Then the running site picks the change up from the rebuilt output.

**Test Approach:** Build from a fresh git worktree, which is the condition under which the repo is known to fail today; assert both site builds from the same clean state.

---

### Feature: The site configuration

**Capability:** `src/seopyramids.config.ts` carries the robusta.build per-site truth in the shape the two existing sites use.

**Acceptance Criteria:**
- Given the configuration, When the site reads it, Then domain is `https://www.robusta.build`, siteName is `Robusta Build`, defaultLocale is `en` and otherLocales is `['fr']`.
- Given the logo value, When the home page renders it, Then it resolves through the design system's assets subpath and no brand file exists under `public/`.
- Given no content source exists yet, When the blog configuration is read, Then its category resolver returns an empty set without throwing.

**Test Approach:** A unit test asserting the configuration's values and that the logo path is not a `public/` URL, plus rendering the home page against it.

---

### Feature: The design-system wiring

**Capability:** CSS, assets and components reach the site through the package's exports map, with no copy step.

**Acceptance Criteria:**
- Given the root layout imports `colors_and_type.css` and `sketch.css` through their subpaths, When the site builds, Then both resolve and the produced stylesheet carries the design-system custom properties.
- Given the home page imports the wordmark through its asset subpath, When the site builds, Then the asset is emitted with a hashed URL and no file was copied into the repo.
- Given a design-system component is rendered from a server component, When the page is statically generated, Then it renders without a client boundary.

**Test Approach:** Build-output inspection — assert the token custom properties appear in the emitted CSS and the wordmark in the emitted assets; one rendering test asserting no `use client` is required.

---

### Feature: The styling foundation

**Capability:** Tailwind without DaisyUI, shadcn initialised, and shadcn's semantic tokens aliased to design-system tokens so the design system stays the single source of colour and type.

**Acceptance Criteria:**
- Given the site's dependencies, When they are inspected, Then DaisyUI appears nowhere and no DaisyUI class is rendered by the site's own code.
- Given shadcn's token layer, When a shadcn component is added later and rendered, Then its background, foreground and primary resolve to design-system values and not to shadcn's default base colour.
- Given the design system's CSS and Tailwind's base layer both load, When the home page renders, Then the design system's typography wins over Tailwind's preflight rather than being reset by it.

**Test Approach:** Dependency assertion plus a visual check of the placeholder page against the design system's own HTML previews; the token aliasing is checked by reading the computed value of a shadcn variable in the built stylesheet.

---

### Feature: The placeholder shell

**Capability:** A root layout and a home page that render the brand and nothing else, and that announce themselves as not indexable.

**Acceptance Criteria:**
- Given the site configuration's default locale, When the root layout renders, Then the document language is set from it rather than hard-coded.
- Given the home page, When it is fetched, Then it shows the wordmark, the token typography and the brand colours, and carries no pitch, no article and no navigation.
- Given the shell is deployed, When a crawler fetches any page, Then the response tells it not to index.

**Test Approach:** One end-to-end fetch of the deployed URL asserting the rendered brand and the noindex directive.

---

### Feature: The deployment

**Capability:** The shell is served from its own Vercel project on a preview domain, leaving robusta.build on the v1 site.

**Acceptance Criteria:**
- Given the shell is deployed, When its preview URL is fetched, Then the home page renders as it does locally.
- Given the deployment exists, When robusta.build is fetched, Then the v1 site still answers.
- Given a build fails, When the deployment runs, Then nothing on robusta.build changes.

**Test Approach:** Manual verification of both URLs after the first deploy; thereafter the Vercel build status is the signal.

---

## 7. Critical Edge Cases

- CSS ordering. `sketch.css` sets global element styles and Tailwind's preflight resets them. Whichever loads last wins, and the design system's previews were validated without Tailwind in the page. Décision (autonome): the design-system CSS loads after Tailwind's base layer, so the validated visual is what renders.
- Silent DaisyUI degradation. `badge`, `btn`, `link` become inert class names rather than errors, while `text-primary` and `bg-accent` keep resolving against shadcn's tokens. A partially-styled component is harder to notice than a broken one, which is the whole argument for not wiring those packages at all.
- Asset import typing. The wordmark subpath returns a file path from the exports map but a `StaticImageData` under Next.js; the branch's own smoke test handles both shapes defensively, which says the typing is unsettled. The shell must settle it once rather than repeat the defensive read.
- The wordmark is a 1603×312 PNG (epic item 9). On a page whose only content is that image, it is the largest contentful paint.
- Fonts arrive by a Google Fonts `@import` inside the design system's CSS: a render-blocking third-party request on every page, and a build that depends on a CDN at view time.
- Two Tailwind majors in one yarn 1 tree if the v2 site moves to Tailwind 4 while the two v1 apps stay on 3 — the same hoisting class of failure that unblock-build exists to fix.
- The React version pinned by v1 is a release candidate (`19.0.0-rc-66855b96-20241106`) and the design system declares it as a peer range. A stable React 19 satisfies that range, so the shell can take stable React without touching the package; the peer range stays looser than it should be.
- `build:race` at the root points at a `@robusta/race` workspace that does not exist. Not this story's job, but the next person adding a root build script will copy it.

---

## 8. Non-Functional Constraints

- Determinism. The build must succeed from a fresh worktree, not from a tree that happens to have the right package hoisted. This is inherited from unblock-build and is the reason that story precedes this one.
- Privacy and compliance. No telemetry, no intent client, no analytics means no consent surface and no personal data — a genuine simplification the shell should not spend, since the epic keeps intents out of the v2 base.
- Indexing. A placeholder served from a live URL is exactly the kind of thin page the epic's SEO intent exists to prevent. The shell declares itself not indexable and the directive is removed by the story that gives the page real content.
- Cost. A second Vercel project on the same account, building an empty site, is negligible.
- Performance. The shell's entire weight is one stylesheet, one PNG and one Google Fonts request, which makes it a usable baseline for later Core Web Vitals work.

**Décision (autonome):** The noindex directive lives in the root layout's metadata so it covers the whole shell, and its removal becomes an explicit acceptance criterion of robusta-landing-page.

**Rationale:** Put on the page, it gets copied into the next page; put at the root and made someone's removal criterion, it cannot be forgotten silently.

---

## 9. External Dependencies

- Vercel — a second project and a preview domain, which needs the account owner. The story's Dep 3 points at an "Open Question 1" the story no longer carries; the epic's decision of 2026-07-29 (own project, preview domain, domain switch deferred to retire-robusta-v1) is that arbitration.
- The unmerged branch `feat/packagify-design-system`, commit `6fb8d72`. Item 1 of the epic, a git operation with no story and no owner date. Nothing here is implementable before it lands.
- unblock-build, item 2. Its outcome determines whether the shell can trust a clean install, and what "recent version of Next" resolves to.
- npm registry — Tailwind, shadcn's CLI and the Radix primitives its components pull in.
- Google Fonts CDN, at view time, through the design system's CSS.

**Décision (autonome):** The shell takes the Next and React versions unblock-build settles on rather than copying v1's pinned release candidate, and does not pin its own.

**Rationale:** Two stories choosing a Next version independently is how the current hoisting failure was produced.

---

## 10. Major Risks

- The shadcn decision has no rationale recorded beyond the arbitration itself, and its reach across the shared packages is assigned to epicman and not yet done. Risk: this story becomes the de facto place where that migration is improvised. Mitigation: the reuse verdict of Axis 5, which scopes rather than migrates.
- A green build on an empty page proves very little. Risk: the keystone is declared done while the wiring that matters is untested. Mitigation: the placeholder must exercise the CSS subpath, the asset subpath and a component — which is why those are acceptance criteria rather than nice-to-haves.
- The placeholder home page is one edit away from becoming the landing page, and robusta-landing-page is a separate story. Risk: scope drifts into content and pitch. Mitigation: the page carries no copy at all, and its noindex is another story's removal criterion.
- Tailwind major split across the monorepo, in a repo already broken by hoisting. Open Question 1.
- The design-system merge is gated on a human with no story attached. Risk: this story stays designed and unimplementable indefinitely.
- The business-rule registry contradicts the epic on the rule this story's own definition of done cites. Gap 1.

---

## Next Steps

- Arbitrate the entries above, most usefully through `bulkman` on the epic, since Gap 1 and Open Question 2 both resolve at epic level rather than in this story.
- Run designman on this story once Gap 1 is settled, so the design doc cites a rule that means what it says.
- Merge `feat/packagify-design-system` (item 1) and land unblock-build (item 2) before implementation; neither is blocked by this brainstorm.
- Fold the reuse verdict of Axis 5 into the story, and the epic-level consequence of Open Question 2 into the epic's À faire, once arbitrated.
