# Story : Passe responsive sur le design system robusta

**Dernière mise à jour :** 2026-10-07
**Feature :** design-system-responsive
**Infix :** RESPONSIVE
**Status :** LANDED (2026-10-07, commit 2848cb7)

## Story

En tant qu'éditeur de robusta.build, je veux que les surfaces du design system tiennent sur un téléphone et que ses calls to action soient de vrais liens, afin de publier la première page destinée au public sans que le site ait à rapiécer son propre design system.

## Contexte & objectif

`packages/robusta-design-system` n'avait aucun comportement responsive : grilles fixes, échelle typographique en pixels que 35 littéraux inline ignoraient, mise en page en styles inline qu'un site ne surcharge pas sans `!important`, calls to action en `<a>` dans un `<button>`, aucune couleur d'erreur, et du texte du prototype rendu quelles que soient les props. La réparation était dans le package ou nulle part (BR-PYRAMID-6), et elle bloquait robusta-landing-page, première page du site v2 destinée au public. Livré par `4963dc0`, `04e70d6` et `dbb1107`, prouvé par les 54 specs `node:test` du package, la preview `preview/marketing-page.html` validée à 320, 640, 768 et 1280 px, et le Green set vert depuis un Clean checkout.

## Livré

### Requirements

- R-RESPONSIVE-01: Every `--t-*` step of `colors_and_type.css` is a `clamp()` whose value moves with the viewport, and no step is a fixed length.
- R-RESPONSIVE-02: The scale keeps its eight step names and gains `--t-display` and `--t-lead`; no step is renamed and none is removed.
- R-RESPONSIVE-03: No component and no rule of the package declares a font size. Every rendered size reads a `--t-*` step — the 35 inline `fontSize` literals and the three `font-size` literals of `sketch.css` included.
- R-RESPONSIVE-04: `BrandLogo`'s emoji glyph sizes stay dimensions of the lockup, computed from the wordmark's ratio, and read no step of the scale.
- R-RESPONSIVE-05: No step's minimum falls below 12 px, and `--t-body`'s minimum stays at or above 16 px.
- R-RESPONSIVE-06: `--measure`, the three `--lh-*` and the nine `--sp-*` keep their names and their present values.
- R-RESPONSIVE-07: Two literals sharing a role share a step, and a size the collapse moves follows the step rather than the literal it replaced, at every viewport including the widest.
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
- R-RESPONSIVE-41: `SkButton` takes an optional `href`, renders an anchor when given one and a button when not, and forwards the attributes of whichever element it renders.
- R-RESPONSIVE-42: Every call to action the package renders is one interactive element, with no interactive element nested inside it.
- R-RESPONSIVE-43: A footer item carries a label and an optional destination; with a destination it renders an anchor, without one it renders its label as text and no anchor element.
- R-RESPONSIVE-44: The package's default footer columns declare no destination, the package knowing no site's URL. Realizes BR-PYRAMID-8.
- R-RESPONSIVE-45: Every call site of the package that compiles today compiles unchanged.
- R-RESPONSIVE-61: The design system ships an error ramp of three in the shape of its brand ramps — `--brand-error`, `--brand-error-soft`, `--brand-error-deep`. Realizes BR-PYRAMID-6.
- R-RESPONSIVE-62: The base reads at 4.5:1 or better as text on `--paper`, and `--paper` reads at 4.5:1 or better on the base.
- R-RESPONSIVE-63: No component of the package consumes the error ramp; it exists so a consumer can name it.
- R-RESPONSIVE-64: The v2 token bridge aliases `--destructive` onto the base and `--destructive-foreground` onto `--paper`, exposes both through `@theme inline`, and coins no value. Realizes BR-PYRAMID-6.
- R-RESPONSIVE-81: The package gains tokens, classes and props, and gains no component and no surface.
- R-RESPONSIVE-82 : Aucune surface ni primitive ne porte de directive `'use client'` ni `'use server'`, et aucune ne lit le viewport en JavaScript : tout le responsive est en CSS.
- R-RESPONSIVE-83: The package's dependencies do not change, and it renders images as `<img>` sized by CSS.
- R-RESPONSIVE-84 : Le Green set se construit depuis un Clean checkout : dakar 23/23, robusta 42/42, et robusta-build prérend ses 23 pages ; la page article v2 rend comme avant. Réalise BR-PYRAMID-5.
- R-RESPONSIVE-85: The only site file this story touches is the v2 token bridge, and it touches it with aliases alone. Realizes BR-PYRAMID-3 and BR-PYRAMID-6.
- R-RESPONSIVE-101 : Tout texte que rend une surface ou `BrandLogo`, texte alternatif compris, passe par une prop qu'un site peut remplacer, hors la marque : le texte alternatif du wordmark et les glyphes 💪 et 🏗 du lockup. Réalise BR-PYRAMID-8.
- R-RESPONSIVE-102 : `Hero` lit sa légende dans `annotation` ; une `annotation` vide retire du DOM la légende et sa flèche.
- R-RESPONSIVE-103 : L'image de la mascotte du `Hero` porte toujours un attribut `alt`, lu dans `mascotAlt` ; un `mascotAlt` vide rend la mascotte décorative.
- R-RESPONSIVE-104 : Une carte de `ServicesGrid` lit sa ligne de lien dans `moreLabel` et `moreHref` : une ancre avec les deux, du texte sans ancre ni `#` avec le libellé seul, rien sans libellé.
- R-RESPONSIVE-105 : La variante `full` de `BrandLogo` lit sa tagline dans `tagline`, aucune autre variante ne la rend, et une `tagline` vide retire la ligne.
- R-RESPONSIVE-106 : Une prop de texte absente prend pour défaut le texte du prototype qu'elle remplace : un composant rendu sans elle rend le texte d'aujourd'hui, au même endroit.
- R-RESPONSIVE-107 : Les cartes par défaut de `ServicesGrid` portent le libellé du prototype et aucune destination, le package ne connaissant l'URL d'aucun site. Réalise BR-PYRAMID-8.

### Acceptance Criteria

- AC-RESPONSIVE-01 : Étant donné les huit surfaces composées en une page complète, quand Barbot la charge à 320, 640, 768 et 1280 px, alors rien ne défile de côté à aucune largeur et aucun texte n'est rogné. Réalise R-RESPONSIVE-26, 27 et 28.
- AC-RESPONSIVE-02 : Étant donné cette page à 1280 px et au-delà, quand Ada la compare au rendu du package avant cette story, alors chaque surface garde sa composition, et les seules différences qu'elle trouve sont les tailles que le rabattement sur l'échelle a déplacées. Réalise R-RESPONSIVE-07 et 29.
- AC-RESPONSIVE-03 : Étant donné le titre du hero, quand Barbot réduit le viewport de 1280 à 320 px, alors sa taille diminue en continu, pas par paliers. Réalise R-RESPONSIVE-01.
- AC-RESPONSIVE-04 : Étant donné tout texte qu'une surface rend, quand Ada inspecte sa taille calculée, alors elle remonte à un pas `--t-*` et à aucun littéral déclaré par un composant ou par `sketch.css`. Réalise R-RESPONSIVE-03.
- AC-RESPONSIVE-05 : Étant donné le hero, le CTA de clôture et l'en-tête, quand un crawler lit la page, alors chaque call to action est une seule ancre portant sa destination, et aucune ancre ne se trouve dans un bouton. Réalise R-RESPONSIVE-41 et 42.
- AC-RESPONSIVE-06 : Étant donné un `SkButton` appelé sans `href`, quand Barbot lit la page, alors il trouve un bouton ; et étant donné les appels du package qui compilaient avant cette story, quand Tux construit le Green set, alors chacun compile inchangé. Réalise R-RESPONSIVE-41 et 45.
- AC-RESPONSIVE-07 : Étant donné une colonne de footer portant un item avec destination et un item sans, quand Barbot lit le footer, alors le premier est une ancre qu'il peut suivre et le second un texte sans ancre ni `#`. Réalise R-RESPONSIVE-43.
- AC-RESPONSIVE-08 : Étant donné Ada qui surcharge la mise en page d'une surface depuis la feuille de style du site, avec un sélecteur portant une classe de plus que celui du package, quand la page rend, alors sa règle l'emporte et elle n'écrit aucun `!important`. Réalise R-RESPONSIVE-22, 23 et 24.
- AC-RESPONSIVE-09 : Étant donné un composant shadcn qui rend `bg-destructive`, quand Barbot charge la page, alors la couleur se résout, et la feuille de style du site ne déclare aucun littéral de couleur. Réalise BR-PYRAMID-6 et R-RESPONSIVE-61 et 64.
- AC-RESPONSIVE-10 : Étant donné un Clean checkout, quand Tux lance le Green set, alors dakar construit 23/23, robusta 42/42 et robusta-build prérend ses 23 pages, et la page article rend comme avant. Réalise BR-PYRAMID-5 et R-RESPONSIVE-84.
- AC-RESPONSIVE-11 : Étant donné le CSS du package, quand Ada y cherche une largeur de breakpoint, alors chacune des cinq apparaît une fois et aucune sixième largeur n'apparaît nulle part. Réalise R-RESPONSIVE-21.
- AC-RESPONSIVE-12 : Étant donné les surfaces et les primitives du package, quand Ada en lit les sources, alors aucune ne porte de directive `'use client'` ni `'use server'`, et aucune ne lit le viewport en JavaScript : tout le responsive est en CSS. Réalise R-RESPONSIVE-82.
- AC-RESPONSIVE-13 : Étant donné `Hero`, `ServicesGrid` et la variante `full` de `BrandLogo` rendus avec toutes leurs props de texte (`annotation`, `mascotAlt`, `moreLabel` et `moreHref` de chaque carte, `tagline`), quand Barbot lit la page, textes alternatifs compris, alors aucun mot du prototype ne lui parvient, et une annotation vide ne laisse ni légende ni flèche ; rendus sans aucune de ces props, ils gardent le rendu d'aujourd'hui, même texte au même endroit. Réalise BR-PYRAMID-8 et R-RESPONSIVE-101 à 107.

## Boundaries

Le contrat de référence est la section Boundaries de [`design-system-responsive.design.md`](design-system-responsive.design.md).

### API library du module `@robusta/pyramids-design-system` — modifiée

Client code : app `@robusta/robusta-build`, son package `landing` et son token bridge `src/styles/globals.css`.

- `SkButtonProps` — alias de type sur une union : avec `href`, une ancre ; sans, un bouton.
- `FooterLink` — nouveau type exporté, un libellé et une destination optionnelle ; `FooterColumn.items` en porte.
- `HeroProps`, `ServiceItem`, `BrandLogoProps` — le texte de page passe par `annotation`, `mascotAlt`, `moreLabel` / `moreHref` et `tagline`, avec le texte du prototype pour défaut.
- CSS — l'échelle `--t-*` est fluide et gagne `--t-display` et `--t-lead`, la rampe `--brand-error` / `-soft` / `-deep` apparaît, les cinq breakpoints vivent dans une seule section de `sketch.css`, et les classes `sk-<surface>__<part>` sont la surface de surcharge de la mise en page.

## Décisions

- 2026-08-07 — Le package bascule aux cinq largeurs du jeu par défaut de Tailwind sur lequel repose shadcn — `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem —, reprises en CSS pur sans thème importé, écrites une fois dans `sketch.css` et nommées par le README. Pourquoi : un `md:` du site et un `@media` d'une surface basculent à la même largeur, et BR-PYRAMID-6 interdit au site d'en inventer une.
- 2026-08-07 — `ubiquitous-language.md` gagne `Breakpoint` sur ces cinq largeurs ; l'entrée revient à epicman, greffier, jamais à cette story. Pas encore écrite au land du 2026-10-07 : le fichier portait des modifications non commitées d'une autre session. Pourquoi : sans nom, les largeurs se citent en nombres nus et dérivent.
- 2026-08-07 — Le design system livre une rampe d'erreur de la forme de ses rampes de marque, et le bridge v2 aliase `--destructive` sur la base. Pourquoi : la décision du 2026-07-31 demandait au design system de fixer la valeur avant qu'un composant en ait besoin.
- 2026-08-07 — Les classes `.sk-*` et les huit blocs de surface sont documentés ensemble dans la section Component vocabulary du README. Pourquoi : les noms de classe sont une surface publique de surcharge, et un consommateur qui ne peut pas les lire ne surcharge rien.
- 2026-10-06 — Le design system cesse de rendre du texte de page qui lui est propre : `Hero`, `ServicesGrid` et la variante `full` de `BrandLogo` le prennent en props. Pourquoi : BR-PYRAMID-8 l'interdit, et AC-LANDING-2 ne pouvait pas tenir ; Gap-LANDING-10 accepté (`lgtm`).
- 2026-10-06 — Les specs du package tournent sur `node:test`, sans dépendance nouvelle ; le passage à vitest reste ouvert. Pourquoi : ajouter vitest écrivait dans `yarn.lock`, alors tenu par tanstack-start-migration.
- 2026-10-07 — Le Green set attend 23 pages prérendues pour robusta-build, et aucune surface ni primitive ne porte `'use client'` ni `'use server'`. Pourquoi : le site v2 est passé sur TanStack Start (`af89ec1`), prérendu puis hydraté, et son build échoue sur l'une ou l'autre directive. Arbitrage de l'éditeur.

## Documentation updates

- changed les sections typography, palette et Component vocabulary de `packages/robusta-design-system/README.md`, et créé sa sous-section responsive : échelle fluide, breakpoints, rampe d'erreur, blocs `.sk-<surface>` comme surface de surcharge. L'affirmation sur la font stack reste à font-stack-readme.
- changed `packages/robusta-design-system/design-system.archi.md`, réécrit en français, et l'en-tête de package de `src/index.ts`
- changed la ligne du package `styles` de `apps/robusta-build/robusta-build.archi.md`, et créé l'en-tête de package de `src/styles/globals.css`
- changed la section Styling de `apps/robusta-build/README.md`, déjà alignée sur l'alias `--destructive` au land de tanstack-start-migration
