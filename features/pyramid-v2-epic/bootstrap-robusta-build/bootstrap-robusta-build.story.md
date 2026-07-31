# Story : Bootstrap the v2 site workspace

**Dernière mise à jour :** 2026-07-31
**Feature :** bootstrap-robusta-build
**Infix :** BOOTSTRAP
**Status :** LANDED (2026-07-31, commit 84c3587)

## Story

As the publisher of the Robusta sites, I want a new site workspace `apps/robusta-build` wired to its configuration, to its design system and to the shared packages, so that every later v2 story has a deployable site to land on instead of a plan.

## Contexte & objectif

`apps/robusta-build` exists: a workspace whose only workspace dependency is `@robusta/pyramids-design-system`, carrying its own site configuration and a placeholder home page whose job is to exercise the wiring end to end. It joined the green set on 2026-07-31 at 4/4 static pages, alongside dakar at 23/23 and robusta at 42/42.

Two things beyond the workspace landed here, because this story owns the root layout: the three brand faces moved to `next/font` self-hosting, and the design system's Google Fonts `@import` left its token stylesheet. Six later stories of the epic land on this workspace.

## Livré

### Requirements

- R-BOOTSTRAP-1 : `apps/robusta-build` is a workspace of the monorepo, named `@robusta/robusta-build`, installed and built alongside the others.
- R-BOOTSTRAP-2 : The root exposes a build script and a dev script for the v2 site, next to `build:robusta` and `dev:robusta`.
- R-BOOTSTRAP-3 : The site resolves every workspace package it depends on through that package's build output, never its sources.
- R-BOOTSTRAP-4 : The build chain builds `@robusta/pyramids-design-system` before the site builds.
- R-BOOTSTRAP-5 : The site holds its per-site truth in `src/seopyramids.config.ts`: domain `https://www.robusta.build`, siteName `Robusta Build`, the v1 siteTitle and mission carried over unchanged, defaultLocale `en`, otherLocales `fr`, and a blog configuration carrying the v1 roll size and author.
- R-BOOTSTRAP-6 : The logo of the site configuration resolves to the design system's wordmark through the package's assets subpath, and no brand asset is copied into `public/`.
- R-BOOTSTRAP-7 : The category resolver of the blog configuration returns an empty result until content-source lands, and reads no content source.
- R-BOOTSTRAP-29 : The site declares the site-configuration type locally, in the field-for-field shape the two existing sites use.
- R-BOOTSTRAP-8 : `@robusta/pyramids-design-system` is this site's design system, and no other site reuses it. Realizes BR-PYRAMID-3.
- R-BOOTSTRAP-9 : The design system's CSS and assets reach the site through the package's exports map subpaths, with no copy step.
- R-BOOTSTRAP-10 : The site defines no design token of its own: every colour, font and spacing value it renders resolves to a design-system token. Realizes BR-PYRAMID-6.
- R-BOOTSTRAP-11 : The site declares no DaisyUI dependency and renders no DaisyUI class.
- R-BOOTSTRAP-12 : A shared package whose rendered classes are DaisyUI classes is not wired into the site.
- R-BOOTSTRAP-13 : The site's stylesheet generation covers every source that contributes a class the site's own code renders; the design system contributes none, its components rendering only inline styles and classes its own stylesheets define.
- R-BOOTSTRAP-25 : The site takes Tailwind 4 with a CSS-first configuration, and the two v1 apps stay on Tailwind 3.
- R-BOOTSTRAP-26 : The design system's element styles are what renders where they and Tailwind's preflight address the same element.
- R-BOOTSTRAP-27 : A token name the site introduces for a third-party layer is declared as an alias of a design-system token and never as a literal value. Realizes BR-PYRAMID-6.
- R-BOOTSTRAP-21 : The site self-hosts IBM Plex Sans, IBM Plex Mono and Caveat through `next/font`, at the weights the design system's stylesheet requested, and loads no font from a third party at view time.
- R-BOOTSTRAP-22 : The design system keeps owning the type tokens — their family names, order and fallbacks — and takes the loaded face from the consuming site through named custom properties; a consumer supplying none still resolves a valid family. Realizes BR-PYRAMID-6.
- R-BOOTSTRAP-23 : The change to the design system's stylesheet leaves `apps/robusta` and `apps/dakar` building green and changes no route of either.
- R-BOOTSTRAP-14 : The site serves a root layout that carries the document language from the site configuration's default locale and loads the design system's CSS.
- R-BOOTSTRAP-15 : The site serves a placeholder home page rendering at least one design-system component, one design-system asset, and the token-driven typography and colours.
- R-BOOTSTRAP-30 : The site renders no page copy it has not written itself, and in particular none of the default copy the design system's marketing surfaces carry. Realizes BR-PYRAMID-8.
- R-BOOTSTRAP-16 : The site is not indexable for as long as its home page carries no page copy, and the directive sits at the root rather than on the page.
- R-BOOTSTRAP-17 : No telemetry client and no intent client is wired into the site. Realizes BR-PYRAMID-2.
- R-BOOTSTRAP-28 : The site normalises the design system's asset URL in one module, and no page repeats that read.
- R-BOOTSTRAP-24 : The site declares every package it imports, states the workspace protocol on intra-monorepo edges, and resolves exactly one copy of React at `19.1.1`.
- R-BOOTSTRAP-18 : The site builds green from a clean checkout of the repository, as part of the green set. Realizes BR-PYRAMID-5.

R-BOOTSTRAP-19 — the site served from its own Vercel project on a preview domain — is not delivered: see Gap 1.

### Acceptance Criteria

- AC-BOOTSTRAP-01 : Given Tux on a clean checkout, when he runs `yarn install` then `yarn build:robusta-build`, then the design system compiles before the site and the site build completes with no manual step. Realizes BR-PYRAMID-5.
- AC-BOOTSTRAP-02 : Given the v1 workspace `@robusta/build` still exists, when both are installed, then no workspace name collides and `build:robusta` still builds the v1 site.
- AC-BOOTSTRAP-03 : Given Tux runs the whole green set from that same clean state, when `build:dakar` and `build:robusta` run after `build:robusta-build`, then all three sites build green.
- AC-BOOTSTRAP-04 : Given the installed tree, when React is resolved from the new site, then exactly one copy answers, at `19.1.1`.
- AC-BOOTSTRAP-05 : Given Ada runs `dev:robusta-build` with `w:design-system` alongside, when she edits a design-system source, then the running site picks the change up from the rebuilt output.
- AC-BOOTSTRAP-21 : Given the site configuration, when the site reads it, then domain is `https://www.robusta.build`, siteName is `Robusta Build`, defaultLocale is `en` and otherLocales is `['fr']`.
- AC-BOOTSTRAP-22 : Given the logo value, when the home page renders, then it resolves through the design system's assets subpath and no brand file exists under `public/`.
- AC-BOOTSTRAP-23 : Given no content source exists yet, when the blog configuration's category resolver is called, then it returns an empty result without throwing and reads nothing from disk.
- AC-BOOTSTRAP-24 : Given the root layout imports both stylesheets through their subpaths, when the site builds, then both resolve and the emitted stylesheet carries the design system's custom properties.
- AC-BOOTSTRAP-25 : Given the wordmark is imported through its asset subpath, when the site builds, then the asset is emitted with a hashed URL and no file was copied into the repository.
- AC-BOOTSTRAP-26 : Given a design-system component is rendered from a server component, when the page is generated, then it renders with no client boundary.
- AC-BOOTSTRAP-27 : Given the site's manifest, when its dependencies are inspected, then DaisyUI, the three deprecated presentational packages, `pyramids-themes` and `scribe-intel` appear nowhere. Realizes BR-PYRAMID-2 and BR-PYRAMID-3.
- AC-BOOTSTRAP-41 : Given Tailwind's preflight and the design system's element styles both load, when the home page renders, then the design system's typography and paper background win.
- AC-BOOTSTRAP-42 : Given the site renders no shadcn component yet, when the built stylesheet is read, then any third-party token name it defines resolves to a design-system token and no literal colour appears in the site's own CSS. Realizes BR-PYRAMID-6.
- AC-BOOTSTRAP-43 : Given the home page is loaded, when its network requests are listed, then none goes to a font CDN and the three families are served from the site's own origin.
- AC-BOOTSTRAP-44 : Given a consumer that loads the design system's CSS and supplies none of the three face properties, when a heading renders, then `--font-sans` still resolves to a valid family and no rule is broken. Realizes BR-PYRAMID-6.
- AC-BOOTSTRAP-45 : Given the design system's stylesheet has changed, when `build:robusta` and `build:dakar` run, then both stay green and produce the same route tables as their baselines.
- AC-BOOTSTRAP-61 : Given the site configuration's default locale, when the root layout renders, then the document language is set from it rather than hardcoded.
- AC-BOOTSTRAP-62 : Given the home page, when it is fetched, then it shows the wordmark, the token typography and the brand colours, carries no article and no navigation, and renders none of the prototype copy the design system's surfaces default to. Realizes BR-PYRAMID-8.
- AC-BOOTSTRAP-63 : Given Barbot fetches any page of the site, when the response is read, then it says not to index, and the directive comes from the root layout rather than from the page.

AC-BOOTSTRAP-81 and AC-BOOTSTRAP-82, both verifying the deployment, are not delivered: see Gap 1.

## Décisions

- 2026-07-29 — The v2 shell is served from its own Vercel project on a preview domain; the robusta.build domain moves over only when retire-robusta-v1 happens. Pourquoi : the shell has no content, so pointing the live domain at it would replace a working site with an empty one.
- 2026-07-29 — The new site's workspace is named `@robusta/robusta-build`, the v1 name is left alone, and no rename follows the retirement of v1. Pourquoi : two workspaces cannot share a name, and a later rename would churn every script and import for no gain.
- 2026-07-29 — The v2 site drops DaisyUI and is built on shadcn/ui: "Use shadCN, no more DaisyUI". Pourquoi : arbitration of Open Question 3 of the story. Réf : structuring decision of 2026-07-29 in `pyramid-v2.epic.md` — `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` render DaisyUI classes, so the consequence runs well past this story.
- 2026-07-30 — `apps/robusta-build` self-hosts IBM Plex Sans, IBM Plex Mono and Caveat through `next/font` in its root layout, and the design system's Google Fonts `@import` leaves the token stylesheet. Pourquoi : arbitration C7 of `pyramid-v2.bulk.md` — it removes the page's only third party, its only privacy exposure and its worst render-blocking request in one move, and it is exactly the app-level configuration the epic's decision of 2026-04-27 delegated to the consuming site.
- 2026-07-30 — The v2 site declares the site-configuration shape locally for now; where the type of the per-site truth belongs is settled by content-source, the story that needs the category resolver. Pourquoi : the shape is base-level vocabulary, but choosing its home before knowing what content-source needs from the resolver would fix the wrong interface.
- 2026-07-30 — The v2 site takes Tailwind 4 with shadcn and the two v1 apps stay on 3: "All for tailwind 4 and shadcn ; never deal with old stuff, too costly in the long run". Pourquoi : pinning the workspace that becomes the main app to the outgoing major buys a migration later on the site that matters most; the tailwind-merge 2 mismatch of `pyramids-helpers` is avoided rather than fixed.
- 2026-07-31 — `shadcn init` is not run, but the token bridge is written now in `src/app/globals.css`, as aliases only. Pourquoi : arbitration of Open Question 1 of the design doc — the CLI writes a default oklch palette, a second source of colour that BR-PYRAMID-6 forbids, while the bridge carries no value of its own and is what makes AC-BOOTSTRAP-42 checkable today instead of a promise. No `components.json`, no `cn()`, no `clsx`, no `tailwind-merge`, no Radix: nothing in the shell merges a class.
- 2026-07-31 — The Google Fonts `@import` is moved to an opt-in `@robusta/pyramids-design-system/fonts.css` subpath, not deleted; the package's 22 preview pages link it and no site does. Pourquoi : arbitration of Open Question 2 of the design doc, which had weighed only `apps/robusta/src/app/_design-test/page.tsx` — the previews are the design system's visual validation artefacts and the epic's decision of 2026-07-29 on the canonical font stack rests on them, so a plain deletion would silently break a validated visual. `colors_and_type.css` carries no third-party request either way, which is all the decision of 2026-07-30 asked for.
- 2026-07-31 — The root script keys stay `build:robusta-build` and `dev:robusta-build`, against the naming agent's `build:robusta.build`. Pourquoi : one spelling everywhere — directory, workspace, script — beats the readability gain of the dotted form, and the readability problem has a clean exit: the day `apps/robusta` is retired, `build:robusta` frees up.
- 2026-07-31 — Next stays on `^15.5.3` and React on `^19.1.1`; Next 16 is deliberately not taken. Pourquoi : 15.5.3 is already the copy hoisted in the tree, so the site introduces no second Next major and no second React — the exact defect class unblock-build had just removed. Moving the repository to Next 16 is a decision about three sites, not a side effect of bootstrapping one.
- 2026-07-31 — `apps/robusta-build/next.config.ts` declares `experimental.extensionAlias`, like `apps/dakar`. Pourquoi : found by a failed build after the implementation pass — the repository's `.js`-suffixed local imports pass `tsc` under `moduleResolution: "Bundler"`, which says nothing about webpack; without the alias `next build` fails on `Module not found: Can't resolve '../seopyramids.config.js'`.
- 2026-07-31 — The documentation pass went beyond the plan on `CLAUDE.md`, scoping its Styling and Telemetry sections as well. Pourquoi : arbitration of Gap 2 of the design doc — Styling mandated DaisyUI tokens for every generated component against R-BOOTSTRAP-11, Telemetry asked for `Telemetry.component(...)` against R-BOOTSTRAP-17 and BR-PYRAMID-2, and `CLAUDE.md` is read by whoever implements next. The plan below carries the four sections that shipped.
- 2026-07-31 — The story lands on its machine-verifiable half: R-BOOTSTRAP-1 to 18 implemented and verified locally, R-BOOTSTRAP-19 left to the account owner. Pourquoi : arbitration of Gap 1 of the design doc — no agent holds Vercel credentials, and the wiring this story exists to prove sits entirely in the local half. What remains is one project creation and two page loads, carried by Gap 1 below.
- 2026-07-31 — The placeholder `src/app/page.tsx` and the root `robots: { index: false, follow: false }` are debts carried to robusta-landing-page, which deletes the first and lifts the second as acceptance criteria of its own. Pourquoi : the shell must not be indexed while it carries no page copy, and the directive sits at the root so it covers every page the site adds rather than the home page alone — lifting it is a named criterion downstream, not a chore anyone may do silently.

## Open Questions & Gaps

- Gap 1: The Vercel project for `apps/robusta-build` does not exist, and only the account owner can create it. R-BOOTSTRAP-19, AC-BOOTSTRAP-81 and AC-BOOTSTRAP-82 are therefore unverified.
- Proposition: create the project with root directory `apps/robusta-build`, install command `yarn install` at the repository root, build command `yarn build:robusta-build`, Node 22 to match `engines`; then check once that the preview URL renders as it does locally and that robusta.build still answers from the v1 project.
- Rationale: everything else this story exists to prove is machine-verified locally; what is left is one project creation and two page loads.
- Resolution: j'ai un projet vercel pour https://vercel.com/nicoramas-projects/pyramids-robusta ; comment le consigner ? 

- Gap 2: The design system ships no error colour — `colors_and_type.css` has paper, ink, three brand ramps and their soft/deep variants, and nothing semantic for danger. The site's token bridge therefore omits `--destructive` and `--destructive-foreground`, so a shadcn component using `bg-destructive` will render an unresolved variable.
- Proposition: the design system decides an error colour before the first story that adds a component needing one; the site aliases it then, and coins nothing itself.
- Rationale: aliasing destructive onto a brand token would coin a semantic the design system never decided, and it would be silent — a wrong red nobody notices until a delete button ships. An unresolved variable is loud, which is why the omission is deliberate.
- Resolution: lgtm

## Documentation updates

Delivered in commit `a16b84f`.

- created `apps/robusta-build/README.md` — the site documents its own configuration; the v1 README is not the reference for v2
- created `apps/robusta-build/robusta-build.archi.md`, registered in the Children of `root.archi.md`
- changed `root.archi.md` — the diagram with the v2 site at the head of the apps column, the Key Components, the green set now ending on `build:robusta-build`, and the gotcha stating that `apps/robusta-build` does not exist yet replaced by the `experimental.extensionAlias` one
- changed the Apps list and the Commands section of `CLAUDE.md` — the new build and dev scripts are the entry point for anyone working in the repo, and the v2 site is where new work goes
- changed the Styling and Telemetry sections of `CLAUDE.md` — both instructed the opposite of what this story decides; Styling now says which rule governs which site, and Telemetry opens on the prohibition BR-PYRAMID-2 carries
