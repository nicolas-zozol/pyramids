# Design: Responsive pass over the robusta design system

**Last update:** 2026-10-06
**Feature:** design-system-responsive
**Infix:** RESPONSIVE
**Status:** APPROVED (2026-10-06 — validated by Nicolas)
**Sources:** [story](design-system-responsive.story.md), [epic](../pyramid-v2.epic.md), [article-page design](../article-page/article-page.design.md), [design-system archi](../../../packages/robusta-design-system/design-system.archi.md), [robusta-landing-page story](../robusta-landing-page/robusta-landing-page.story.md)

## Progress — APPROVED 86%

```
 WIP  Requirements         █████████████████░░░  34/38
 WIP  Acceptance Criteria  ███████████████░░░░░  10/13
```

## Goal

`packages/robusta-design-system` renders eight marketing surfaces whose layout lives in inline `style` objects, whose type is 35 `fontSize` literals reading no token, and whose four calls to action nest an anchor inside a button. It carries no `@media`, no `clamp()`, no `minmax()` and no viewport unit — verified across `colors_and_type.css` and `sketch.css`, which contain none of the four. This design states the contracts that change: the token surface of a fluid type scale, the class names that become the layout override surface, the two component signatures, the error ramp, and the one place the breakpoints are written.

No component and no surface is added. Everything below is a token, a class or a prop.

Amendement du 2026-10-06 : `Hero`, `ServicesGrid` et `BrandLogo` cessent de rendre un texte qu'aucune prop n'atteint — la légende et le texte alternatif de la mascotte du `Hero`, la ligne « see how it works » des cartes, la tagline de la variante `full` du logo. C'est la décision du 2026-10-06 de la [story](design-system-responsive.story.md), qui accepte Gap-LANDING-10 de robusta-landing-page.

## Decisions

- 2026-08-07 — The scale wins over the rendering it replaces: fourteen font-size literals collapse onto the ten steps below, the closing-CTA headline joins the hero headline at `--t-display`, and the 17/18/19/21 band collapses onto `--t-lead`, so a few surfaces render a couple of pixels away from today's at the widest viewport. Pourquoi : keeping every literal takes fourteen steps, which is not a scale, and would contradict the definition of done asking that no surface declare a size of its own; the clause of the story on the widest viewport speaks of composition, and composition does not move. Arbitration of Open Question 1, accepted as proposed.
- 2026-08-07 — The eight surface class blocks and the naming rule are documented in the Component vocabulary section of `packages/robusta-design-system/README.md`, where the `.sk-*` classes are already listed. Pourquoi : the class names are a public override surface, and a consumer that cannot read them can override nothing, while the list that already answers the same question for the primitives makes the addition one bullet rather than a new section. Arbitration of Gap 1, accepted as proposed. The bullet belongs to the Documentation updates of the story, which storyman is writing in parallel — this design names the location and writes nothing there.
- 2026-10-06 — Les specs du package tournent sur `node:test` (Node 22) : `tsc` les compile via `tsconfig.test.json` vers `.test-build/`, `node --test` les lance, sans dépendance nouvelle. Le passage à vitest, convention du repo, reste ouvert une fois `yarn.lock` libéré par la session tanstack-start-migration, au prix d'une ligne d'import par spec. Pourquoi : ajouter vitest écrit dans `yarn.lock`, que cette session tient. Décision de l'éditeur.
- 2026-10-06 — `storyman refine design-system-responsive` crée la section, y reprend AC-RESPONSIVE-01 à 12 verbatim et ajoute un AC pour le texte de page — par exemple : étant donné `Hero`, `ServicesGrid` et `BrandLogo` rendus avec toutes leurs props de texte, quand Barbot lit la page, textes alternatifs compris, aucun mot du prototype ne lui parvient, et une annotation vide ne laisse ni légende ni flèche. Ce design cite ensuite la section. Why: un AC naît dans la story et le design le cite ; sans lui, R-RESPONSIVE-101 à 107 n'ont aucun critère d'acceptation validé par l'éditeur. Réf : Gap-RESPONSIVE-3.

## Ubiquitous Language

Terms used as `ubiquitous-language.md` defines them: Design system, Design token, Site, Landing page, Page copy, Workspace, Build chain, Clean checkout, Green set.

Two terms are named here and not coined here.

- Breakpoint, on the five widths the story's decision of 2026-08-07 fixed. The glossary does not carry it yet; recording it is epicman's as registrar, which that decision already states. This design uses the term and the widths as decided.
- Measure, the line length a body of text is held at — the design system's own vocabulary, defined in `packages/robusta-design-system/README.md` where `--measure` lives, as `article-page.design.md` already recorded. It is untouched here.

## Business Rules (cited)

- BR-PYRAMID-3 — Each site must carry its own design system, which no other site may reuse.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-6 — A site's design tokens must come from its design system alone.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.

## Boundaries

### `SkButton` — an optional destination

```ts
type SkButtonBase = {
  variant?: 'primary' | 'ghost' | 'default';
  children: ReactNode;
};

type SkButtonAsButton = SkButtonBase &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { href?: never };

type SkButtonAsAnchor = SkButtonBase &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { href: string };

export type SkButtonProps = SkButtonAsButton | SkButtonAsAnchor;
```

Given an `href` it renders `<a href=… class="sk-btn …">`; given none, the `<button class="sk-btn …">` it renders today. The class list is computed identically in both branches, and the rest props are forwarded to whichever element is rendered — anchor attributes on the anchor branch, button attributes on the button branch, which is what the union buys over a single widened interface.

No CSS change is needed for the anchor branch. `.sk-btn` already declares `display: inline-flex` and `text-decoration: none`, so an anchor carrying it renders as the button does.

Two consequences to hold.

- `SkButtonProps` stops being an `interface` and becomes a type alias over a union. `interface X extends SkButtonProps` is no longer legal; nothing in the repository writes that, and nothing outside the repository consumes this package, which is workspace-only.
- The four nested-anchor call sites — `Hero` twice, `CTA` once, `SiteHeader` once — pass their existing `*CtaHref` prop to `SkButton` and drop the inner `<a>`. The props of those three surfaces do not move: `primaryCtaHref`, `secondaryCtaHref` and `ctaHref` already exist and already carry the destination.

`variant` is untouched. The `.sk-btn--secondary` class `sketch.css` carries stays unreachable through the component; that gap predates this story and is not its business.

### `SiteFooter` — a footer link is a label and a destination

```ts
export interface FooterLink {
  label: string;
  /** Absent when no destination is known: renders as text, never as an anchor. */
  href?: string;
}

export interface FooterColumn {
  h: string;
  items: FooterLink[];
}
```

An item carrying an `href` renders an anchor. An item carrying none renders its label as text, inside the same list item, with no anchor element at all — not an `<a>` without `href`, which is focusable by nothing and followable by no crawler, and not the `href="#"` the twelve items render today.

The optional destination is what makes the package's own defaults honest. `DEFAULT_COLUMNS` declares twelve labels and the package knows none of the site's URLs (BR-PYRAMID-8), so the defaults declare no destination and render as text; a site supplying `columns` supplies real links.

The additive constraint costs nothing here, verified rather than assumed: `SiteFooter` has no call site in the repository. The only consumers of the package are `apps/robusta-build`, which imports `NotesPreview`, `BrandLogo`, `SkCallout` and `SkTag`, and `apps/robusta`, whose `_design-test` page imports `BrandLogo`, `SkButton` and `SkTag`. `apps/dakar` imports the package nowhere. So the widening of `items` breaks no compiling call site, and `SkButton`'s union keeps the three `_design-test` calls valid as written.

### `Hero`, `ServicesGrid`, `BrandLogo` — le texte de page passe par des props

API library du module `@robusta/pyramids-design-system`, modifiée par l'amendement du 2026-10-06. Client code : package `landing` de l'app `@robusta/robusta-build` (robusta-landing-page).

Le code de `4963dc0` n'a aucune des cinq entrées ci-dessous : `Hero` écrit sa légende et `alt="crystal tux"` en dur, la carte de `ServicesGrid` écrit « see how it works » dans un `div`, `BrandLogo` écrit « senior engineering, hand-built. » sous sa variante `full`.

Types :

```ts
interface HeroProps {
  /** Caption beside the mascot. Empty ('' or null): no caption, no doodle arrow. */
  annotation?: ReactNode;
  /** Alt text of the mascot. Empty: the mascot is decorative, alt="". */
  mascotAlt?: string;
  mascotSrc?: string;
  // … eyebrow, title, subtitle, CTA labels and hrefs, footnote: unchanged
}

interface ServiceItem {
  title: string;
  /** Label of the card's link line. Absent or empty: no line. */
  moreLabel?: string;
  /** Absent: the label renders as text, never as an anchor. */
  moreHref?: string;
  // … time, body, tag, tagTone: unchanged
}

interface BrandLogoProps {
  size?: 'compact' | 'full' | 'mark';
  /** Rendered by the `full` variant alone. Empty: no tagline line. */
  tagline?: string;
  // … wordmarkSrc, style, className: unchanged
}
```

Rendu :

- `annotation` vide : ni `sk-hero__annotation` ni `sk-hero__doodle` dans le DOM — retirés, pas masqués en CSS. La légende ne dépend pas de `mascotSrc`, comme aujourd'hui.
- `mascotAlt` : l'`<img>` de la mascotte porte toujours un attribut `alt` ; vide, il vaut `alt=""` et la mascotte est décorative, comme celles de `FlowDiagram` et de `CTA`.
- `moreLabel` et `moreHref` : avec les deux, la ligne est une ancre `sk-services-grid__more` ; avec le libellé seul, le même élément non interactif qu'aujourd'hui, sans ancre ni `#` ; sans libellé, pas de ligne. La carte n'est pas interactive, l'ancre n'est donc imbriquée dans rien (R-RESPONSIVE-42). Le couple `*Label` / `*Href` est la convention du package (`primaryCtaLabel` / `primaryCtaHref`, `allLinkLabel` / `allLinkHref`) ; il est porté par la carte parce que chaque service mène à sa propre page.
- `tagline` : les variantes `compact` et `mark` ne la rendent pas, même passée.

Défauts — le texte du prototype, comme pour toutes les props de texte des surfaces (`design-system.archi.md`, « Defaults preserve the prototype copy ») :

- `annotation` — « this is crystal tux. » et « she lives here. », sur deux lignes ;
- `mascotAlt` — « crystal tux » ;
- `tagline` — « senior engineering, hand-built. » ;
- `moreLabel` — pas de défaut de prop : les trois cartes de `DEFAULT_SERVICES` portent « see how it works » et aucun `moreHref`, le package ne connaissant l'URL d'aucun site, comme pour `DEFAULT_COLUMNS`.

Un site qui ne passe rien obtient le rendu d'aujourd'hui ; un site qui passe tout ne reçoit plus un mot du prototype. C'est ce second cas que BR-PYRAMID-8 exige et qu'AC-LANDING-2 de robusta-landing-page vérifie sur `/`.

La marque reste fixe et rendue même quand toutes les props sont passées : le texte alternatif « Robusta Build » du wordmark, équivalent textuel de l'actif de marque que le package fournit (BR-PYRAMID-3), et les deux glyphes 💪 et 🏗 du lockup (R-RESPONSIVE-04). Ce n'est pas du texte de page.

Client code, dans le package `landing` :

```tsx
import { Hero } from '@robusta/pyramids-design-system';
import tux from '@robusta/pyramids-design-system/assets/crystal-tux.svg';

<Hero
  eyebrow="Sites web rapides et applications sur mesure"
  mascotSrc={tux}
  mascotAlt="Crystal Tux, la mascotte de Robusta Build"
  annotation=""
/>;
```

### The type scale — ten steps, all fluid

Written once in `colors_and_type.css`, in `:root`. The eight existing names keep their names and their roles; two are added.

- `--t-display` — new. The single largest text of a surface: the hero headline, the closing-CTA headline.
- `--t-h1` — a section headline. Four surfaces render one.
- `--t-h2`, `--t-h3`, `--t-h4` — unchanged roles. The element rules of the same file keep reading them.
- `--t-lead` — new. Text one step above running text: an intro paragraph, an eyebrow, a nav label, a button label.
- `--t-body` — running text, the readable floor.
- `--t-small` — captions, side notes, footer links.
- `--t-tiny` — the smallest labels.
- `--t-code` — monospace.

Every step is a `clamp(min, preferred, max)` and no step is a fixed length. The maximum is the value the role renders at today on a wide viewport; the minimum is the value at the 320 px floor; the preferred term is viewport-relative, which is the only fluid mechanism available to a stylesheet that ships as plain CSS.

The contract on the components is the other half, and it is what makes the scale worth writing: no component of the package declares a font size. That covers the 35 inline `fontSize` literals — 34 in the eight surfaces and one in `BrandLogo`'s tagline — and the three `font-size` literals of `sketch.css`, on `.sk-btn`, `.sk-input` and `.sk-tag`. Nothing in `src/` reads `var(--t-…)` today; after this story nothing declares a size instead.

`BrandLogo`'s emoji glyph sizes are not in that count and stay as they are. `emojiStyle(h)` computes `fontSize` from a height tuned against the wordmark's 1603×312 ratio so the two marks and the image read as one lockup: those are dimensions of a mark, not type, and the grep that finds 36 `fontSize` occurrences finds 35 literals for exactly that reason.

Fourteen distinct literals collapse onto these ten steps, so some values move. Where two literals share a role they share a step: the closing-CTA headline joins the hero headline at `--t-display`, and the 17/18/19/21 band collapses onto `--t-lead`. At the widest viewport a few surfaces therefore render a couple of pixels away from today's, which is what having a scale costs and what the decision of 2026-08-07 accepts. The ten steps are the scale; nothing here is a candidate.

`--measure`, the three `--lh-*` and the nine `--sp-*` keep their names and their values. The README's typography section states a 19 px body against a 16 px `--t-body`; the rewrite of that section, already in the story's documentation plan, is where that sentence is settled.

### The breakpoints — five widths, one place

The package switches at the Tailwind default set shadcn sits on: 40rem, 48rem, 64rem, 80rem, 96rem — 640, 768, 1024, 1280 and 1536 px. It imports no Tailwind theme and inherits nothing; it restates the five values, which is why the story records them as a decision.

They live in one responsive section of `sketch.css`, one `@media (min-width: …)` block per width, holding the rules of every surface that switches there. A width appears in the file once and a sixth width appears nowhere. The rules are mobile-first: the base rule set is the narrow one, and each block widens it.

No `--bp-*` custom property ships. A media query cannot read a custom property, so a token named for a breakpoint would not work where its name promises — a trap, not an interface. The widths are named by the README and by the `@media` preludes, and a consuming site on Tailwind 4 writes `md:` and lands on the same 48 rem by construction.

320 px is a floor and not a breakpoint: no rule keys on it, and it is the width at which the base rule set must already hold.

### The layout override surface — class names, not inline styles

Today a surface's layout is inline `style`, which no stylesheet beats without `!important`, and `className` reaches the root element alone. The mechanism that replaces it has three parts.

- Every element of a surface that carries layout carries a stable class name, and the layout moves into `sketch.css` under those names. The naming rule is the one `.sk-btn--primary` already follows, extended with a part separator: `sk-<surface>` for the block, `sk-<surface>__<part>` for a part, `--<modifier>` for a variant. The block name is the kebab-case of the component name, so the eight are `sk-hero`, `sk-site-header`, `sk-site-footer`, `sk-services-grid`, `sk-flow-diagram`, `sk-principles-list`, `sk-notes-preview` and `sk-cta`.
- The package's layout rules are written at single-class specificity and carry no `!important`. A consuming site overrides one by writing a selector with one class more, and wins regardless of load order — which matters, because the v2 site loads its own `globals.css` before the package's two stylesheets and would lose a tie. Order-independence is the property being bought; "without `!important`" is the story's requirement and follows from it.
- The `className` and `style` props of each surface root stay, `style` merging last as the per-instance escape hatch. No surface gains a `classNames` prop for its parts: the class names are the override surface, documented in the Component vocabulary section of the package README beside the `.sk-*` primitives, and duplicating them as React props would be a second one.

The layout joins `sketch.css` rather than a new stylesheet. The two-file import order is documented as a contract in `apps/robusta-build/README.md`, in the package README, in `SKILL.md` and in every preview sheet; a new file a consumer can forget renders the surfaces unstyled, which is a silent and total failure, where a contract that cannot be partially satisfied cannot fail that way.

### The error ramp

Three tokens in the brand block of `colors_and_type.css`, in the shape `--brand-primary` / `-soft` / `-deep` already has:

- `--brand-error` — the base.
- `--brand-error-soft` — the wash, the highlighter tint of the base.
- `--brand-error-deep` — the pressed tone.

One prefix because every colour ramp in that file lives under it, and a second prefix invented for a single ramp would be the only one of its kind. The role is semantic, and the semantic name is the consumer's to write, which is the aliasing direction BR-PYRAMID-6 mandates.

The value is the design system's to decide (decision of 2026-07-31), and what constrains it is contrast, not taste: a red that sits with the ink and the paper, reading at 4.5:1 or better as text on `--paper`, with `--paper` reading at 4.5:1 or better on top of it.

No component of the package consumes the ramp, and that is the point — the system settles the value before a component needs one.

### `apps/robusta-build/src/app/globals.css` — the bridge stops recording an absence

Four lines, all aliases, no literal:

- `--destructive: var(--brand-error)` and `--destructive-foreground: var(--paper)` in `:root`.
- `--color-destructive` and `--color-destructive-foreground` in `@theme inline`, which is how Tailwind 4 emits `bg-destructive` and its siblings.

The comment block declaring the two names deliberately absent goes with them. This is the only site file this story touches.

### `preview/` — one full-page sheet

One sheet under `preview/` composing the eight surfaces as a page, framed by its own `<style>` and carrying `<meta name="viewport" content="width=device-width, initial-scale=1">`. It cannot link `_card.css`, which pins the body to 700 px with `overflow: hidden` — a frame for a specimen card, not for a page shown at three widths — and it is deliberately unlike `ui_kits/marketing/index.html`, which pins the viewport to 1280.

It restates the surfaces' markup in plain HTML and can drift from the TSX. It is the visual specimen, not a test: the tests are the package's unit specs on its rendering and its stylesheets, run by `node:test` (Node 22) after `tsc` compiles them through `tsconfig.test.json` into `.test-build/`, with no new dependency (decision of 2026-10-06). What makes it worth writing is that the layout it shows is the real one — the class names and the stylesheet the sheet links are what the components render, now that the layout has left the TSX. `preview/` is excluded by `package.json#files`, so the sheet ships nowhere.

## Technical Constraints

- The package is `packages/robusta-design-system`, published as `@robusta/pyramids-design-system`, `type: module`, built by `tsc` to `dist/` and consumed as build output. It is the third step of `yarn build:deps`, between `pyramids-themes` and `pyramids-layouts`.
- `tsc` compiles `src/` only. The CSS and the assets ship as static files at the package root and reach a consumer through the `exports` map in subpaths, with no copy step into `dist/`. A CSS edit therefore needs no rebuild and no watcher — under `nodeLinker: node-modules` a workspace resolves through a symlink, so a running dev server sees the edited file — while a `.tsx` edit needs `yarn w:design-system`, which runs `tsc --watch` and watches no CSS.
- Local TypeScript imports end with `.js` though the source is `.ts` / `.tsx`. The barrels and the cross-component imports of this package already follow it.
- Functional components only, never `React.FC`; an `interface FooProps` and a plain function; named exports. `SkButtonProps` becoming a type alias is the one exception the union forces, and it is a props type rather than a component.
- Server-component-safe: no `'use client'` anywhere, and no viewport read in JavaScript. Every responsive behaviour is CSS, which is also what keeps the surfaces usable from a React Server Component of the v2 site.
- The package depends on `react` alone, at peer `^19.1.1`, and gains no dependency here. It cannot use `next/image`: images stay `<img>` sized by CSS.
- A media query cannot read a CSS custom property, and the package ships plain CSS through no PostCSS step, so `@custom-media` is unavailable too. The five widths are literals in five `@media` preludes and nowhere else.
- BR-PYRAMID-6 — a site's design tokens come from its design system alone. The consuming site aliases a name onto a token and coins no value, which is why `--destructive` has to exist here before the bridge can name it, and why the fluid scale is written in `colors_and_type.css` and in no site's file. BR-PYRAMID-3 keeps the package robusta's alone; BR-PYRAMID-8 keeps the package's default copy out of what a site publishes, and is why a default footer item declares no destination.
- BR-PYRAMID-5 — the green set stays green from a clean checkout: dakar 23/23, robusta 42/42, robusta-build 25/25 static pages. The v1 `_design-test` page and the v2 article page are the two rendered proofs; the article page reads `--t-*` through the element rules of `colors_and_type.css` and through `ArticleProse.module.css`, so a scale change reaches it without it changing.
- React n'émet pas un attribut qui vaut `undefined`, et émet `alt=""` pour une chaîne vide. `mascotAlt` a donc une chaîne pour défaut et n'atteint jamais l'`<img>` en `undefined` : c'est ce qui tient l'attribut `alt` de R-RESPONSIVE-103.
- Node 22, yarn 4.17.1, React 19.1.1 stable everywhere, TypeScript 5. `next.config.ts` sets `eslint.ignoreDuringBuilds: true` in both Next apps, so `yarn lint` is run explicitly and is not gated by a build.

## Requirements

Type:

- R-RESPONSIVE-01: Every `--t-*` step of `colors_and_type.css` is a `clamp()` whose value moves with the viewport, and no step is a fixed length.
- R-RESPONSIVE-02: The scale keeps its eight step names and gains `--t-display` and `--t-lead`; no step is renamed and none is removed.
- R-RESPONSIVE-03: No component and no rule of the package declares a font size. Every rendered size reads a `--t-*` step — the 35 inline `fontSize` literals and the three `font-size` literals of `sketch.css` included.
- R-RESPONSIVE-04: `BrandLogo`'s emoji glyph sizes stay dimensions of the lockup, computed from the wordmark's ratio, and read no step of the scale.
- R-RESPONSIVE-05: No step's minimum falls below 12 px, and `--t-body`'s minimum stays at or above 16 px.
- R-RESPONSIVE-06: `--measure`, the three `--lh-*` and the nine `--sp-*` keep their names and their present values.
- R-RESPONSIVE-07: Two literals sharing a role share a step, and a size the collapse moves follows the step rather than the literal it replaced, at every viewport including the widest.

Layout:

- R-RESPONSIVE-21: The package switches at 40rem, 48rem, 64rem, 80rem and 96rem and at no other width, each restated once in one responsive section of `sketch.css`, the package importing no Tailwind theme. Realizes BR-PYRAMID-6.
- R-RESPONSIVE-22: Every element of a surface that carries layout carries a stable class name, and the layout is declared in `sketch.css` under those names rather than in an inline `style`.
- R-RESPONSIVE-23: The package's layout rules are written at single-class specificity and carry no `!important`, so a site selector carrying one class more overrides one whatever the load order.
- R-RESPONSIVE-24: The class names follow one naming rule, are documented in the Component vocabulary section of the package README, and are not duplicated as React props; the `className` and `style` props of each surface root stay, `style` merging last.
- R-RESPONSIVE-25: The story adds no stylesheet: the layout lives in `sketch.css`, and the import order the consuming sites declare does not change.
- R-RESPONSIVE-26: No surface renders more columns below `md` than above it, and every multi-column composition reaches a single column at or before the 320 px floor.
- R-RESPONSIVE-27: A surface's horizontal padding reads the spacing scale and narrows below `md`.
- R-RESPONSIVE-28: From 320 px upward, no surface overflows the viewport horizontally and no text is clipped.
- R-RESPONSIVE-29: At the widest breakpoint and above, the eight surfaces keep the composition they render today.
- R-RESPONSIVE-30: `preview/` carries one sheet composing the eight surfaces as a full page, framed independently of `_card.css` and declaring a device-width viewport.

Interactive elements:

- R-RESPONSIVE-41: `SkButton` takes an optional `href`, renders an anchor when given one and a button when not, and forwards the attributes of whichever element it renders.
- R-RESPONSIVE-42: Every call to action the package renders is one interactive element, with no interactive element nested inside it.
- R-RESPONSIVE-43: A footer item carries a label and an optional destination; with a destination it renders an anchor, without one it renders its label as text and no anchor element.
- R-RESPONSIVE-44: The package's default footer columns declare no destination, the package knowing no site's URL. Realizes BR-PYRAMID-8.
- R-RESPONSIVE-45: Every call site of the package that compiles today compiles unchanged.

Colour:

- R-RESPONSIVE-61: The design system ships an error ramp of three in the shape of its brand ramps — `--brand-error`, `--brand-error-soft`, `--brand-error-deep`. Realizes BR-PYRAMID-6.
- R-RESPONSIVE-62: The base reads at 4.5:1 or better as text on `--paper`, and `--paper` reads at 4.5:1 or better on the base.
- R-RESPONSIVE-63: No component of the package consumes the error ramp; it exists so a consumer can name it.
- R-RESPONSIVE-64: The v2 token bridge aliases `--destructive` onto the base and `--destructive-foreground` onto `--paper`, exposes both through `@theme inline`, and coins no value. Realizes BR-PYRAMID-6.

Scope:

- R-RESPONSIVE-81: The package gains tokens, classes and props, and gains no component and no surface.
- R-RESPONSIVE-82: Every surface stays server-component-safe: no `'use client'`, and no viewport read in JavaScript.
- R-RESPONSIVE-83: The package's dependencies do not change, and it renders images as `<img>` sized by CSS.
- R-RESPONSIVE-84: The green set builds from a clean checkout — dakar 23/23, robusta 42/42, robusta-build 25/25 — with the v2 article page and the v1 `_design-test` page still rendering. Realizes BR-PYRAMID-5.
- R-RESPONSIVE-85: The only site file this story touches is the v2 token bridge, and it touches it with aliases alone. Realizes BR-PYRAMID-3 and BR-PYRAMID-6.

Texte de page :

- R-RESPONSIVE-101 : Tout texte que rend une surface ou `BrandLogo`, texte alternatif compris, passe par une prop qu'un site peut remplacer, hors la marque : le texte alternatif du wordmark et les glyphes 💪 et 🏗 du lockup. Réalise BR-PYRAMID-8.
- R-RESPONSIVE-102 : `Hero` lit sa légende dans `annotation` ; une `annotation` vide retire du DOM la légende et sa flèche.
- R-RESPONSIVE-103 : L'image de la mascotte du `Hero` porte toujours un attribut `alt`, lu dans `mascotAlt` ; un `mascotAlt` vide rend la mascotte décorative.
- R-RESPONSIVE-104 : Une carte de `ServicesGrid` lit sa ligne de lien dans `moreLabel` et `moreHref` : une ancre avec les deux, du texte sans ancre ni `#` avec le libellé seul, rien sans libellé.
- R-RESPONSIVE-105 : La variante `full` de `BrandLogo` lit sa tagline dans `tagline`, aucune autre variante ne la rend, et une `tagline` vide retire la ligne.
- R-RESPONSIVE-106 : Une prop de texte absente prend pour défaut le texte du prototype qu'elle remplace : un composant rendu sans elle rend le texte d'aujourd'hui, au même endroit.
- R-RESPONSIVE-107 : Les cartes par défaut de `ServicesGrid` portent le libellé du prototype et aucune destination, le package ne connaissant l'URL d'aucun site. Réalise BR-PYRAMID-8.

## Acceptance Criteria

Ada develops the site, Barbot visits, Tux builds from a clean checkout.

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

Cas limites à tester :

- `Hero` avec `annotation=""`, puis avec `annotation={null}` : ni légende ni flèche dans le HTML rendu.
- `Hero` avec `mascotSrc` et sans `mascotAlt` : `alt="crystal tux"` ; avec `mascotAlt=""` : l'attribut `alt=""` est présent — jamais une `<img>` sans `alt`.
- `Hero`, `ServicesGrid` et `BrandLogo size="full"` rendus sans aucune prop de texte : le même texte au même endroit qu'avant l'amendement ; la page `_design-test` de v1 garde la tagline de son `BrandLogo`.
- Les trois rendus avec toutes leurs props de texte, `annotation` vide et des `services` sans `moreLabel` : ni « this is crystal tux. », ni « she lives here. », ni `alt="crystal tux"`, ni « see how it works », ni « senior engineering, hand-built. » dans le HTML ; la marque — 💪, 🏗 et `alt="Robusta Build"` — y reste. AC-LANDING-2 de robusta-landing-page repose sur ce cas.
- Trois cartes, la première avec `moreLabel` et `moreHref`, la deuxième avec `moreLabel` seul, la troisième sans : une ancre, du texte sans ancre ni `#`, aucune ligne.
- `BrandLogo` en variante `compact` ou `mark` avec une `tagline` passée : pas de tagline rendue.

## Dependencies

- Depends on: nothing blocking. The package has been on `dev` and inside `build:deps` since 2026-07-30.
- Blocks: robusta-landing-page, item 2 of the epic's À faire.

