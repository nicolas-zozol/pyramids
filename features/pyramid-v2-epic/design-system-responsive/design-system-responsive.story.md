# Story : Responsive pass over the robusta design system

**Dernière mise à jour :** 2026-10-06
**Feature :** design-system-responsive
**Infix :** RESPONSIVE
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want the design system's surfaces to hold on a phone and its calls to action to be real links, so that the first page meant for the public can be shipped without the site patching its own design system.

## Contexte & objectif

`packages/robusta-design-system` was validated by eye, on a desktop, one component at a time. It carries no `@media`, no `clamp()`, no `minmax()` and no viewport unit anywhere, and its layout lives in inline styles a stylesheet cannot override without `!important` — which BR-PYRAMID-6 forbids the consuming site from doing at all, since a site adds names and never values. The repair is in the package or it is nowhere. The arbitration of 2026-07-30, on Gap 1 of `robusta-landing-page.brainstorm.md`, is one sentence: responsive is MANDATORY. Mobile-first indexing makes it an SEO defect as much as a usability one.

This is item 1 of the epic's À faire and item 1 of the ROADMAP's Next because it blocks robusta-landing-page, which is the first page of the v2 site meant to be indexed and read by a stranger. Three more defects of the same package travel with it, and none of them is worth a second pass over the same files.

## What is broken today

- Layout. The hero is a fixed `1.3fr 1fr` grid with an 88 px headline and 48 px of side padding, the footer a fixed four-column grid, the services a `repeat(3, 1fr)`. On a 390 px screen the page scrolls sideways and clips.
- Type. The scale is frozen in pixels, `--t-h1: 56px` at every viewport, and no surface reads it: 35 inline `fontSize` literals across the eight surfaces and `BrandLogo`, so a fluid scale changes nothing until the surfaces consume it. The article page, landed on 2026-08-02, inherits the scale and could neither change it nor work around it — a fluid scale is written in the design system's own file and in no site's (BR-PYRAMID-6).
- Calls to action. Every one nests an `<a>` inside a `<button>` — four of them, in `Hero`, `CTA` and `SiteHeader` — which is invalid HTML, a WCAG 4.1.2 failure and unreliable as a followed link for a crawler. The footer's three link columns render `href="#"`, `FooterColumn.items` being plain strings with nowhere to carry a destination.
- Error colour. The design system ships none, which is why the v2 site's token bridge carries no `--destructive` and says so in three places. Decision of 2026-07-31: the design system decides the value, the site aliases it and coins nothing.

## Acceptance Criteria

Ada développe le site, Barbot le visite, Tux le construit depuis un Clean checkout.

- AC-RESPONSIVE-01: Given the eight surfaces composed as a full page, when Barbot loads it at 320, 640, 768 and 1280 px, then nothing scrolls sideways at any width and no text is clipped. Realizes R-RESPONSIVE-26, 27 and 28.
- AC-RESPONSIVE-02: Given that page at 1280 px and above, when Ada compares it with what the package renders today, then each surface keeps its composition, the sizes the collapse onto the scale moved being the only difference she finds. Realizes R-RESPONSIVE-07 and 29.
- AC-RESPONSIVE-03: Given the hero headline, when Barbot narrows the viewport from 1280 to 320 px, then its size shrinks continuously rather than in steps. Realizes R-RESPONSIVE-01.
- AC-RESPONSIVE-04: Given any text a surface renders, when Ada inspects its computed size, then it traces to a `--t-*` step and to no literal declared by a component or by `sketch.css`. Realizes R-RESPONSIVE-03.
- AC-RESPONSIVE-05: Given the hero, the closing CTA and the header, when a crawler reads the page, then each call to action is one anchor carrying its destination, and no anchor sits inside a button. Realizes R-RESPONSIVE-41 and 42.
- AC-RESPONSIVE-06: Given the three `SkButton` calls of the v1 `_design-test` page, none of which passes an `href`, when Tux builds, then each renders a button, the page compiles unchanged and the build stays green. Realizes R-RESPONSIVE-41, 45 and 84.
- AC-RESPONSIVE-07: Given a footer column carrying one item with a destination and one without, when Barbot reads the footer, then the first is a followable anchor and the second is text carrying no anchor and no `#`. Realizes R-RESPONSIVE-43.
- AC-RESPONSIVE-08: Given Ada overriding a surface's layout from the site's own stylesheet with a selector carrying one class more than the package's, when the page renders, then her rule wins and she writes no `!important`. Realizes R-RESPONSIVE-22, 23 and 24.
- AC-RESPONSIVE-09: Given a shadcn component rendering `bg-destructive`, when Barbot loads the page, then the colour resolves, and the site's stylesheet declares no colour literal. Realizes BR-PYRAMID-6 and R-RESPONSIVE-61 and 64.
- AC-RESPONSIVE-10: Given a clean checkout, when Tux runs the green set, then dakar builds 23/23, robusta 42/42 and robusta-build 25/25, and the article page renders as it did. Realizes BR-PYRAMID-5 and R-RESPONSIVE-84.
- AC-RESPONSIVE-11: Given the package's CSS, when Ada searches it for a breakpoint width, then each of the five appears once and no sixth width appears anywhere. Realizes R-RESPONSIVE-21.
- AC-RESPONSIVE-12: Given a surface rendered from a server component of the v2 site, when Tux builds, then no surface carries `'use client'` and the site gains no client bundle from the design system. Realizes R-RESPONSIVE-82.
- AC-RESPONSIVE-13 : Étant donné `Hero`, `ServicesGrid` et la variante `full` de `BrandLogo` rendus avec toutes leurs props de texte (`annotation`, `mascotAlt`, `moreLabel` et `moreHref` de chaque carte, `tagline`), quand Barbot lit la page, textes alternatifs compris, alors aucun mot du prototype ne lui parvient, et une annotation vide ne laisse ni légende ni flèche ; rendus sans aucune de ces props, ils gardent le rendu d'aujourd'hui, même texte au même endroit. Réalise BR-PYRAMID-8 et R-RESPONSIVE-101 à 107.

## Definition of done

- The eight marketing surfaces hold at `sm` (640 px), `md` (768 px) and `xl` (1280 px) with no text clipped and nothing scrolling sideways, and keep their present composition at the widest. 320 px is a floor and not a breakpoint: nothing scrolls sideways there either.
- The breakpoints live in one place in the package's CSS and the README names them; a consuming site never chooses one.
- A full-page preview under `preview/` shows the eight surfaces composed, at the widths above — the package has no test of any kind and its preview sheets are per-component.
- The layout of a surface no longer lives in inline styles: a consuming site can override it from a stylesheet without `!important`.
- The type scale is fluid, written once in `colors_and_type.css`, and the surfaces render their type through it — no surface declares a font size of its own.
- `SkButton` takes an optional `href` and renders an anchor when given one, `FooterColumn.items` carry a label and a destination, and every call to action of the package renders one interactive element with none nested inside it. Both changes are additive and no existing consumer breaks (decision of 2026-07-30).
- The design system ships an error ramp of three — a base, its wash and its pressed tone — and the v2 site's token bridge aliases `--destructive` onto the base instead of recording its absence.
- The package gains tokens, classes and props; it gains no new component and no new surface (decision of 2026-08-02).
- The surfaces stay server-component-safe: no `'use client'`, and no viewport read in JavaScript.
- The green set stays green from a clean checkout (BR-PYRAMID-5): dakar 23/23, robusta 42/42, robusta-build 25/25, with the article page and the `_design-test` smoke page of v1 still rendering.
- Does not cover the landing page itself, its copy or its composition (robusta-landing-page); the README's stale font-stack claim (font-stack-readme, item 5); the weight of the wordmark (vectorize-wordmark).

## Boundaries

Le contrat de référence est la section Boundaries de [`design-system-responsive.design.md`](design-system-responsive.design.md) : types, rendu, défauts et client code y sont, la story ne les recopie pas.

### API library du module `@robusta/pyramids-design-system` — modifiée

Client code : app `@robusta/robusta-build` (package `landing` et pont de tokens), app `@robusta/build` (page `_design-test`).

- `SkButtonProps` — un `href` optionnel : une ancre avec, un bouton sans.
- `FooterColumn.items` — des `FooterLink`, un libellé et une destination optionnelle.
- `HeroProps`, `ServiceItem`, `BrandLogoProps` — le texte de page passe par `annotation`, `mascotAlt`, `moreLabel` / `moreHref` et `tagline`.
- CSS — l'échelle `--t-*` devient fluide et gagne `--t-display` et `--t-lead`, la rampe `--brand-error` apparaît, et les classes `sk-<surface>__<part>` deviennent la surface de surcharge de la mise en page.

## Décisions

- 2026-08-07 — The package adopts the breakpoint scale shadcn sits on, which is Tailwind's default set: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem — 640, 768, 1024, 1280 and 1536 px. Pourquoi : `apps/robusta-build` is Tailwind 4 with shadcn, so a site writing `md:` and a surface's own `@media` switch at the same width rather than at two nearby ones. The package is plain CSS and imports no Tailwind theme: it restates those values, which is what makes this a decision to record and not an inheritance. Arbitration of Gap 1, which settled the widths — "use modern standard, if possible those of shadcn"; the proof artefact is carried over from the proposition, a full-page preview under `preview/` plus the v2 site's own build.
- 2026-08-07 — The breakpoints are fixed in one place in the package's CSS and named by its README, and `ubiquitous-language.md` gains `Breakpoint` on the values above. Pourquoi : BR-PYRAMID-6 forbids a site inventing one, so every later story cites these widths, and unnamed they get quoted as bare numbers and drift. The glossary entry is epicman's to record as registrar, never this story's to write. Arbitration of Gap 2, accepted as proposed.
- 2026-08-07 — The design system ships one error ramp of the shape its brand ramps already have: a red that sits with the ink and the paper, its wash and its pressed tone, with the v2 bridge aliasing `--destructive` onto the base. Pourquoi : the decision of 2026-07-31 asked the design system to settle the value before a component needs one, and matching the existing ramps costs nothing today and saves a second pass. Arbitration of Open Question 1, accepted as proposed.
- 2026-08-07 — The `.sk-*` primitive classes and the eight surface blocks are documented together in the README's Component vocabulary section, naming rule included. Pourquoi : Gap 1 of `design-system-responsive.design.md` made the surface class names a public override surface, which is how a site overrides a layout from a stylesheet without `!important`, and none of the five locations of the plan below documented them — a consumer who cannot read the names overrides nothing. Arbitration of that gap, accepted as proposed; the design doc stays the reference for the mechanism.
- 2026-10-06 — The design system stops rendering page copy of its own: `HeroProps` gains `annotation` and `mascotAlt`, an empty annotation hiding the caption and its arrow, and the same defect is fixed in `ServicesGrid` (« see how it works ») and in the full variant of `BrandLogo`. Pourquoi : BR-PYRAMID-8 forbids a design system any page copy, yet `Hero` renders « this is crystal tux. she lives here. » and the alt text « crystal tux » whatever props it receives, so AC-LANDING-2 cannot hold, and the fix costs least while this story still has `Hero.tsx` open. Arbitration of Gap-LANDING-10 in `robusta-landing-page.story.md`, accepted as proposed (`lgtm`).
- 2026-10-06 — Le design est amendé pour le texte de page (R-RESPONSIVE-101 à 107 : `annotation` et `mascotAlt` de `Hero`, `moreLabel` et `moreHref` des cartes de `ServicesGrid`, `tagline` de la variante `full` de `BrandLogo`) et repasse en DRAFT pour la réapprobation de l'éditeur. Pourquoi : l'implémentation part d'un design approuvé, et le WIP de `4963dc0`, antérieur à l'amendement, ne porte aucune de ces props ; il sera confronté au design une fois réapprouvé. Constat des sources, qui clôt Gap-RESPONSIVE-1.

## Documentation updates

- change the typography section of `packages/robusta-design-system/README.md` — the scale becomes fluid, and the sentence promising that this scale is going to move is what moves. The stale font-stack claim in the same section stays where it is: it belongs to font-stack-readme.
- create a responsive paragraph under Visual foundations in the same README — why: the widths the package holds, and the breakpoints it switches at, cannot be read off inline styles by a consumer; state that they are the Tailwind default set shadcn sits on, restated in plain CSS rather than imported.
- change the palette section of the same README — why: the error ramp and what it is for.
- change the Component vocabulary section of the same README — why: the `.sk-*` primitive classes are already listed there, and the eight surface blocks plus the naming rule become a public override surface a consumer has to be able to read.
- change `packages/robusta-design-system/design-system.archi.md` — why: the CSS block of its diagram, the `SkButton` and `SiteFooter` rows of its component tables, and the gotcha stating that the buttons are presentational.
- change the Styling section of `apps/robusta-build/README.md` and the `--destructive` gotcha of `apps/robusta-build/robusta-build.archi.md` — why: both record the absence of an error colour as deliberate, and it stops being absent.

## Dependencies

- Dep 1: none blocking. The work sits inside `packages/robusta-design-system`, which has been on `dev` and inside `build:deps` since 2026-07-30, between `pyramids-themes` and `pyramids-layouts`.
- Dep 2: this story is itself the dependency of robusta-landing-page (item 2 of À faire), whose own Dependencies section still numbers the epic items of an earlier ordering and does not name this one.
