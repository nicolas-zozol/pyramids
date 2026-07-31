# Story : Bootstrap the v2 site workspace

**Dernière mise à jour :** 2026-07-29
**Feature :** bootstrap-robusta-build
**Infix :** BOOTSTRAP
**Status :** ACTIVE

## Story

As the publisher of the Robusta sites, I want a new site workspace `apps/robusta-build` wired to its configuration, to its design system and to the shared packages, so that every later v2 story has a deployable site to land on instead of a plan.

## Contexte & objectif

`apps/robusta-build` does not exist. The v2 site is a new workspace, not a refactor of `apps/robusta`: the v1 site and the base grew into each other, so v2 restarts and v1 is retired once the v2 serves the same content (decision of 2026-07-29 in the epic). This story creates that workspace and nothing else — an empty but deployable shell, with the wiring proven by a build that goes green.

What a site brings of its own is its configuration, its design system and its content. Here only the first two are in scope: `src/seopyramids.config.ts` filled with the robusta.build values, and `@robusta/pyramids-design-system` as this site's design system, which no other site reuses (BR-PYRAMID-3). Telemetry stays out and no intent client is wired in (BR-PYRAMID-2). Everything structural — layouts, links, CTAs, helpers, themes — is borrowed from the shared packages, always through their build output and never their sources.

Two items block implementation, not design: the design system package only exists on `feat/packagify-design-system` (commit `6fb8d72`, item 1 of the epic), and the two recorded build failures of item 2 make any end-to-end verification meaningless until they are lifted.

## Site configuration

The per-site truth to fill in `src/seopyramids.config.ts`, same shape as the two existing sites:

- domain `https://www.robusta.build`, siteName `Robusta Build`
- siteTitle and mission carried over from v1 unchanged; the pitch is revisited by robusta-landing-page, not here
- logo taken from the design system's wordmark through the package's assets subpath, not copied into `public/`
- defaultLocale `en`, otherLocales `fr` — the second locale is what the `/l/{locale}/` segment of seo-url-scheme exists for
- blogConfig with the v1 roll size and author; the category resolver stays empty until content-source lands

## Definition of done

- `apps/robusta-build` is a workspace of the monorepo, installed and built alongside the others, with its own build and dev scripts at the root next to `build:robusta` and `dev:robusta`
- the site holds its `src/seopyramids.config.ts` with the values above
- the site consumes the shared packages and the design system through their build output, never their sources
- the design system's CSS and assets reach the site through the package's exports map subpaths (`/colors_and_type.css`, `/sketch.css`, `/assets/*`), with no copy step
- the shell renders a root layout and a placeholder home page showing the design tokens applied — enough to see the fonts, colours and one brand asset, nothing more
- the build of the site completes green, and the shell is served from a deployed URL
- no telemetry and no intent client is wired in
- does not cover the route scheme (seo-url-scheme), the content pipeline (content-source, migrate-learn-content) nor the real landing page (robusta-landing-page): the home page here is a placeholder meant to be replaced

## Décisions

- 2026-07-29 — The v2 shell is served from its own Vercel project on a preview domain; the robusta.build domain moves over only when retire-robusta-v1 happens. Pourquoi : the shell has no content, so pointing the live domain at it would replace a working site with an empty one; a preview URL is enough to prove deployability.
- 2026-07-29 — The new site's workspace is named `@robusta/robusta-build`, the v1 name is left alone, and no rename follows the retirement of v1. Pourquoi : two workspaces cannot share a name, and a later rename would churn every script and import for no gain.
- 2026-07-29 — The v2 site drops DaisyUI and is built on shadcn/ui: "Use shadCN, no more DaisyUI". Pourquoi : arbitration of Open Question 3, against the proposition that kept the Tailwind and DaisyUI layer. Réf : structuring decision of 2026-07-29 in `pyramid-v2.epic.md` — the shared packages `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` render DaisyUI classes, so the consequence runs well past this story and is arbitrated at epic level.
- 2026-07-30 — `apps/robusta-build` self-hosts IBM Plex Sans, IBM Plex Mono and Caveat through `next/font` in its root layout, and the design system's Google Fonts `@import` is neutralised; the change lands in this story, which owns that layout. Pourquoi : arbitration C7 of `pyramid-v2.bulk.md`, merging Open Question 3 of this story's brainstorm with Open Question 2 of `robusta-landing-page.brainstorm.md` — it removes the page's only third party, its only privacy exposure and its worst render-blocking request in one move, and it is exactly the app-level configuration the epic's decision of 2026-04-27 delegated to the consuming site. The proposition that kept the `@import` and deferred to measurements is dropped.
- 2026-07-30 — The v2 site declares the site-configuration shape locally for now; where the type of the per-site truth belongs — a shared package or each site — is settled by content-source, the story that needs the category resolver. Pourquoi : arbitration of Gap 2 of `bootstrap-robusta-build.brainstorm.md` — the shape is the contract between the base and a site, so it is base-level vocabulary, but choosing its home before knowing what content-source needs from the resolver would fix the wrong interface.
- 2026-07-30 — The v2 site takes Tailwind 4 with shadcn and the two v1 apps stay on 3: "All for tailwind 4 and shadcn ; never deal with old stuff, too costly in the long run". Pourquoi : arbitration of Open Question 1 of `bootstrap-robusta-build.brainstorm.md` — pinning the workspace that becomes the main app to the outgoing major buys a migration later on the site that matters most; the tailwind-merge 2 mismatch of `pyramids-helpers` is avoided rather than fixed, shadcn's own `cn()` being used where class merging is needed.

## Documentation updates

- create `apps/robusta-build/README.md` — why: a site documents its own configuration and, later, its route scheme; the v1 README must not become the reference for v2
- create `apps/robusta-build/robusta-build.archi.md` and register it in the Children of `root.archi.md` — why: the v2 site becomes the main app of the repo and has no architecture doc today
- change `root.archi.md` — why: the diagram, the Key Components and the gotcha stating that `apps/robusta-build` does not exist yet all become false
- change the Apps list and the Commands section of `CLAUDE.md` — why: the new build and dev scripts are the entry point for anyone working in the repo

## Dependencies

- Dep 1: merge-design-system (item 1 of the epic) — the design system package lives only on `feat/packagify-design-system`, commit `6fb8d72`; nothing to wire the site to until it reaches `dev`
- Dep 2: unblock-build (item 2) — `pyramids-links` fails `tsc` in a fresh worktree for want of a `next` peer dependency, which breaks the build chain the new site depends on; the `apps/robusta` worker crash makes a green build unprovable
- Dep 3: the deployment target of Open Question 1 — creating the Vercel project needs the account owner
