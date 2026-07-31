# Story : Landing page of robusta.build

**Dernière mise à jour :** 2026-07-29
**Feature :** robusta-landing-page
**Infix :** LANDING
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want the home page of the v2 site assembled from the robusta design system and carrying the pitch already written for v1, so that the site states the offer without the obsolete resume and without marketing markup of its own.

## Contexte & objectif

The v1 home page hand-writes everything inside the site: pitch, client logos, skills grid, portfolio preview, web resume, featured posts (`apps/robusta/src/app/page.tsx` → `src/components/freelance/`). The v2 landing page takes the opposite bet — a composition of the marketing surfaces of `@robusta/pyramids-design-system`, each fed by props. It is the first real proof that a site is dressed by its own design system (BR-PYRAMID-3), and the page every later site will be copied from.

The copy is an editorial reprise, not a rewrite: the claims of the v1 pitch move over, the resume does not (Hors scope of the epic). The surfaces ship with the prototype's copy as defaults; this story is what replaces those defaults with robusta's own words.

Nothing is implementable before `apps/robusta-build` exists (item 3 of the epic) and before the design-system package reaches `dev` — the packagified workspace lives only on `feat/packagify-design-system`, and `packages/robusta-design-system/` on `dev` is still a bare folder of CSS and assets. The canonical font stack stays open at epic level (Open Question 1 of `pyramid-v2.epic.md`); it is not re-opened here, and whatever the epic settles arrives through the package's CSS.

## Surfaces and the copy they carry

- Hero — the pitch headline: who Nicolas is, the experience claim, the availability line
- ServicesGrid, FlowDiagram, PrinciplesList — what is on offer, and how an engagement runs
- CTA — the contact route (email, LinkedIn), in place of the contact bits scattered across v1
- SiteHeader, SiteFooter — navigation and footer of the v2 site
- NotesPreview — left out of this story, see Open Question 3

## Definition of done

- `/` of `apps/robusta-build` renders a complete landing page composed only of design-system surfaces; the site adds no marketing markup of its own
- every surface shows robusta's copy, passed through props — none of the prototype defaults reaches a visitor
- the v1 pitch is carried over: the experience claim, the named references (Renault, BCG, the startups), the Toptal screening and the Oracle certification, the contact route
- no resume anywhere on the v2 site: no page, no link, no PDF
- the page renders as a server component and survives the site's build
- does not cover the article list (migrate-learn-content), the URL scheme (seo-url-scheme), nor SEO work beyond the page's own title and description (seo-excellence)
- does not touch `apps/robusta`, which keeps serving until it is retired

## Décisions

- 2026-07-29 — The landing page speaks in the first person singular of a named freelance, and the surfaces' default "we" copy is rewritten accordingly. Pourquoi : robusta.build sells one named engineer and the pitch's credibility rests on his own record; a visitor who reads "small team" and then meets one person has been mis-sold.
- 2026-07-29 — The v1 social proof survives as text inside Hero and PrinciplesList; logo wall, skills grid and portfolio grid are out of this story. Pourquoi : a new surface means changing the design-system package, which is its own story; the references survive as words, only the images are lost.
- 2026-07-29 — NotesPreview is left out of this story and added by migrate-learn-content, once real articles exist. Pourquoi : a landing page advertising notes that 404 costs more than a landing page with no notes section.
- 2026-07-30 — ServicesGrid and FlowDiagram stay out of the first release and the page ships with five surfaces; they are added once three services and an engagement sequence are written down. Pourquoi : arbitration of Gap 3 of `robusta-landing-page.brainstorm.md` — the two surfaces describe a productised offer (a paid audit, an embedded engagement, a scoped rebuild, a five-step intake) that nothing in the record has ever described, and shipping it would break R-LANDING-4 and put pricing and duration claims in front of buyers nobody has agreed to honour.
- 2026-07-30 — The site may pass fragments that use design-system class names only, and may wrap a surface in a bare element to carry an `id`; it may not define a class, a colour, a font or a spacing value. Pourquoi : arbitration of Open Question 3 of `robusta-landing-page.brainstorm.md` — the class vocabulary belongs to the design system, so the site chooses which emphasis applies rather than inventing an appearance, and an anchor target is navigation plumbing rather than marketing markup.
- 2026-07-30 — The hero headline is drafted from the claims R-LANDING-6 fixes, in the brand voice — lowercase, plain, no superlative — along the lines of "twenty years of shipping software that outlives the project that paid for it", with the subtitle carrying the fullstack and EVM specialism and the footnote carrying Toulouse and remote in place of the prototype's slot-scarcity line. Pourquoi : arbitration of Open Question 4 of `robusta-landing-page.brainstorm.md` — the v1 pitch is one heading of nouns with no headline, and this is the only claim in R-LANDING-6 that cannot be lifted verbatim from v1.

## Documentation updates

- change the README of `apps/robusta-build` — why: the landing page is the reference example of a site consuming its own design system, and the next site starts by copying it
- change the "Install / Import" section of `packages/robusta-design-system/README.md` — why: it describes the consumer setup in the abstract and can now point at a real consumer
- change the robusta.build entry of `root.archi.md` — why: the v2 site stops being an empty shell and gets its first public page

## Dependencies

- Dep 1: item 3 bootstrap-robusta-build — the `apps/robusta-build` workspace, its config and its wiring to the packages. Blocks implementation only; brainstorm and design can proceed.
- Dep 2: item 1 merge-design-system — `@robusta/pyramids-design-system` must be on `dev`, where the directory has today neither `package.json` nor `src/`.
- Dep 3: item 2 unblock-build, inherited through item 3 — without it the site does not build end to end, so nothing can be accepted in a browser.
- Dep 4: item 7 migrate-learn-content — for the notes section alone, which Open Question 3 proposes to postpone to that story.
