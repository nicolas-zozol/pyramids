# Story : Passe responsive sur le design system robusta

**Dernière mise à jour :** 2026-10-07
**Feature :** design-system-responsive
**Infix :** RESPONSIVE
**Status :** ACTIVE

## Story

En tant qu'éditeur de robusta.build, je veux que les surfaces du design system tiennent sur un téléphone et que ses calls to action soient de vrais liens, afin de publier la première page destinée au public sans que le site ait à rapiécer son propre design system.

## Contexte & objectif

`packages/robusta-design-system` a été validé à l'œil, sur desktop, un composant à la fois. Avant cette story, il ne portait aucun `@media`, aucun `clamp()`, aucun `minmax()` ni aucune unité de viewport, et sa mise en page vivait dans des styles inline qu'une feuille de style ne surcharge pas sans `!important` — ce que BR-PYRAMID-6 interdit au site consommateur, qui ajoute des noms et jamais des valeurs. La réparation est dans le package ou nulle part. L'arbitrage du 2026-07-30, sur le Gap 1 de `robusta-landing-page.brainstorm.md`, tient en une phrase : le responsive est OBLIGATOIRE. Avec l'indexation mobile-first, c'est un défaut SEO autant qu'un défaut d'usage.

C'est l'item 1 du À faire de l'epic et l'item 1 du Next de la ROADMAP, parce qu'il bloque robusta-landing-page, la première page du site v2 destinée à être indexée et lue par un inconnu. Les autres défauts du même package voyagent avec lui : aucun ne vaut un second passage sur les mêmes fichiers.

## Ce que la story répare

- Mise en page. Le hero était une grille fixe `1.3fr 1fr` avec un titre de 88 px et 48 px de marge latérale, le footer une grille fixe à quatre colonnes, les services un `repeat(3, 1fr)`. Sur un écran de 390 px, la page défilait de côté et rognait.
- Typographie. L'échelle était figée en pixels, `--t-h1: 56px` à tous les viewports, et aucune surface ne la lisait : 35 littéraux `fontSize` inline dans les huit surfaces et `BrandLogo`, si bien qu'une échelle fluide ne changeait rien tant que les surfaces ne la consommaient pas. La page article, livrée le 2026-08-02, hérite de l'échelle et ne pouvait ni la changer ni la contourner : une échelle fluide s'écrit dans le fichier du design system, dans celui d'aucun site (BR-PYRAMID-6).
- Calls to action. Chacun imbriquait un `<a>` dans un `<button>` — quatre, dans `Hero`, `CTA` et `SiteHeader` —, ce qui est du HTML invalide, un échec WCAG 4.1.2 et un lien peu fiable pour un crawler. Les trois colonnes de liens du footer rendaient `href="#"`, `FooterColumn.items` étant de simples chaînes sans place pour une destination.
- Couleur d'erreur. Le design system n'en livrait aucune, d'où l'absence de `--destructive` dans le token bridge du site v2, qui le disait à trois endroits. Décision du 2026-07-31 : le design system décide la valeur, le site l'aliase et ne crée rien.
- Texte de page. `Hero`, `ServicesGrid` et la variante `full` de `BrandLogo` rendaient du texte du prototype quelles que soient leurs props, ce que BR-PYRAMID-8 interdit (décision du 2026-10-06).

## Acceptance Criteria

Ada développe le site, Barbot le visite, Tux le construit depuis un Clean checkout.

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

## Definition of done

- Les huit surfaces marketing tiennent à `sm` (640 px), `md` (768 px) et `xl` (1280 px) sans texte rogné ni défilement latéral, et gardent leur composition actuelle à la plus grande largeur. 320 px est un plancher, pas un breakpoint : rien n'y défile de côté non plus.
- Les breakpoints vivent à un seul endroit du CSS du package et le README les nomme ; un site consommateur n'en choisit jamais.
- Une preview pleine page sous `preview/` montre les huit surfaces composées, aux largeurs ci-dessus. C'est le spécimen visuel ; les preuves automatiques sont les specs `node:test` du package (décision du 2026-10-06 du design doc).
- La mise en page d'une surface ne vit plus dans des styles inline : un site consommateur la surcharge depuis une feuille de style sans `!important`.
- L'échelle typographique est fluide, écrite une fois dans `colors_and_type.css`, et les surfaces rendent leur texte à travers elle : aucune surface ne déclare de taille de police propre.
- `SkButton` prend un `href` optionnel et rend une ancre quand il en reçoit un, les `FooterColumn.items` portent un libellé et une destination, et chaque call to action du package rend un seul élément interactif, sans autre imbriqué. Les deux changements sont additifs et aucun consommateur existant ne casse (décision du 2026-07-30).
- Le design system livre une rampe d'erreur de trois tons, `--brand-error`, `--brand-error-soft` et `--brand-error-deep`, et le token bridge du site v2, `apps/robusta-build/src/styles/globals.css`, aliase `--destructive` sur la base au lieu de consigner son absence.
- Le package gagne des tokens, des classes et des props ; il ne gagne ni composant ni surface (décision du 2026-08-02).
- Aucune surface ni primitive du package ne porte de directive `'use client'` ni `'use server'`, et aucune ne lit le viewport en JavaScript : tout le responsive est en CSS.
- Le Green set reste vert depuis un Clean checkout (BR-PYRAMID-5) : dakar 23/23, robusta 42/42, robusta-build 23 pages prérendues, et la page article rend comme avant.
- Hors périmètre : la landing page elle-même, son texte et sa composition (robusta-landing-page) ; l'affirmation périmée du README sur la font stack (font-stack-readme, item 5) ; le poids du wordmark (vectorize-wordmark).

## Boundaries

Le contrat de référence est la section Boundaries de [`design-system-responsive.design.md`](design-system-responsive.design.md) : types, rendu, défauts et client code y sont, la story ne les recopie pas.

### API library du module `@robusta/pyramids-design-system` — modifiée

Client code : app `@robusta/robusta-build`, son package `landing` et son token bridge `src/styles/globals.css`.

- `SkButtonProps` — un `href` optionnel : une ancre avec, un bouton sans.
- `FooterColumn.items` — des `FooterLink`, un libellé et une destination optionnelle.
- `HeroProps`, `ServiceItem`, `BrandLogoProps` — le texte de page passe par `annotation`, `mascotAlt`, `moreLabel` / `moreHref` et `tagline`.
- CSS — l'échelle `--t-*` devient fluide et gagne `--t-display` et `--t-lead`, la rampe `--brand-error` apparaît, et les classes `sk-<surface>__<part>` deviennent la surface de surcharge de la mise en page.

## Décisions

- 2026-08-07 — Le package adopte l'échelle de breakpoints sur laquelle repose shadcn, le jeu par défaut de Tailwind : `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem — 640, 768, 1024, 1280 et 1536 px. Pourquoi : `apps/robusta-build` est en Tailwind 4 avec shadcn, donc un `md:` du site et un `@media` d'une surface basculent à la même largeur plutôt qu'à deux largeurs voisines. Le package est en CSS pur et n'importe aucun thème Tailwind : il reprend ces valeurs, ce qui en fait une décision à consigner et non un héritage. Arbitrage du Gap 1, qui a fixé les largeurs — « use modern standard, if possible those of shadcn » ; l'artefact de preuve vient de la proposition : une preview pleine page sous `preview/` plus le build du site v2.
- 2026-08-07 — Les breakpoints sont fixés à un seul endroit du CSS du package et nommés par son README, et `ubiquitous-language.md` gagne `Breakpoint` sur les valeurs ci-dessus. Pourquoi : BR-PYRAMID-6 interdit à un site d'en inventer un, donc chaque story suivante cite ces largeurs, et sans nom elles se citent en nombres nus et dérivent. L'entrée du glossaire revient à epicman, greffier, jamais à cette story. Arbitrage du Gap 2, accepté tel que proposé.
- 2026-08-07 — Le design system livre une rampe d'erreur de la forme de ses rampes de marque : un rouge qui s'accorde avec l'encre et le papier, sa teinte douce et sa teinte profonde, et le bridge v2 aliase `--destructive` sur la base. Pourquoi : la décision du 2026-07-31 demandait au design system de fixer la valeur avant qu'un composant en ait besoin, et s'aligner sur les rampes existantes ne coûte rien et évite un second passage. Arbitrage de l'Open Question 1, acceptée telle que proposée.
- 2026-08-07 — Les classes primitives `.sk-*` et les huit blocs de surface sont documentés ensemble dans la section Component vocabulary du README, règle de nommage comprise. Pourquoi : le Gap 1 de `design-system-responsive.design.md` a fait des noms de classe des surfaces une surface publique de surcharge — c'est ainsi qu'un site surcharge une mise en page sans `!important` — et aucun lieu du plan de documentation ne les documentait : un consommateur qui ne peut pas lire les noms ne surcharge rien. Arbitrage de ce gap, accepté tel que proposé ; le design doc reste la référence du mécanisme.
- 2026-10-06 — Le design system cesse de rendre du texte de page qui lui est propre : `HeroProps` gagne `annotation` et `mascotAlt`, une annotation vide masquant la légende et sa flèche, et le même défaut est corrigé dans `ServicesGrid` (« see how it works ») et dans la variante `full` de `BrandLogo`. Pourquoi : BR-PYRAMID-8 interdit tout texte de page à un design system, or `Hero` rendait « this is crystal tux. she lives here. » et le texte alternatif « crystal tux » quelles que soient ses props, donc AC-LANDING-2 ne pouvait pas tenir, et la correction coûte le moins pendant que cette story a `Hero.tsx` ouvert. Arbitrage du Gap-LANDING-10 de `robusta-landing-page.story.md`, accepté tel que proposé (`lgtm`).
- 2026-10-06 — Le design est amendé pour le texte de page (R-RESPONSIVE-101 à 107 : `annotation` et `mascotAlt` de `Hero`, `moreLabel` et `moreHref` des cartes de `ServicesGrid`, `tagline` de la variante `full` de `BrandLogo`) et repasse en DRAFT pour la réapprobation de l'éditeur. Pourquoi : l'implémentation part d'un design approuvé, et le WIP de `4963dc0`, antérieur à l'amendement, ne porte aucune de ces props ; il sera confronté au design une fois réapprouvé. Constat des sources, qui clôt Gap-RESPONSIVE-1.
- 2026-10-07 — Le site v2 prérend 23 pages, 21 URLs de contenu plus `/` et `/404` : AC-RESPONSIVE-10 et la Definition of done attendent 23 pages prérendues au lieu de 25/25 ; dakar 23/23 et robusta 42/42 ne bougent pas. Pourquoi : le site a quitté Next.js pour TanStack Start sur Netlify (`af89ec1`). Arbitrage de l'éditeur.
- 2026-10-07 — Aucune surface ni primitive du package ne porte `'use client'` ni `'use server'`, et tout le responsive est en CSS ; la story ne parle plus de server component ni de client bundle. Pourquoi : le site v2 est prérendu puis hydraté, sans server component, donc le design system est dans son bundle client, et son build échoue sur l'une ou l'autre directive sous `src`. Arbitrage de l'éditeur.
- 2026-10-07 — La page `_design-test` de v1 cesse de servir de preuve, dans les AC comme dans les Boundaries : c'est un dossier privé de Next, jamais une route, dont le build ne vérifie que les types. AC-RESPONSIVE-06 garde son objet. Arbitrage de l'éditeur.
- 2026-10-07 — Le token bridge du site v2 est `apps/robusta-build/src/styles/globals.css`, et non plus `src/app/globals.css`. Constat des sources après `af89ec1`.
- 2026-10-07 — Le package a ses propres tests : 54 specs `node:test`, vertes ce jour ; la Definition of done ne dit plus le contraire. Pourquoi : décision du 2026-10-06 du design doc. Arbitrage de l'éditeur.

## Documentation updates

- change la section typography de `packages/robusta-design-system/README.md` — why: l'échelle devient fluide, et la phrase qui promettait que cette échelle allait bouger est ce qui bouge. L'affirmation périmée sur la font stack, dans la même section, reste en place : elle appartient à font-stack-readme.
- create un paragraphe responsive sous Visual foundations dans le même README — why: un consommateur ne lit pas dans les composants les largeurs que le package tient ni les breakpoints où il bascule ; dire qu'il s'agit du jeu par défaut de Tailwind sur lequel repose shadcn, repris en CSS pur et non importé.
- change la section palette du même README — why: la rampe d'erreur et son usage.
- change la section Component vocabulary du même README — why: les classes primitives `.sk-*` y sont déjà listées, et les huit blocs de surface avec leur règle de nommage deviennent une surface publique de surcharge qu'un consommateur doit pouvoir lire.
- change `packages/robusta-design-system/design-system.archi.md` — why: le bloc CSS de son diagramme, les lignes `SkButton` et `SiteFooter` de ses tables de composants, et le gotcha qui dit les boutons présentationnels.
- change la section Styling de `apps/robusta-build/README.md` et le gotcha `--destructive` de `apps/robusta-build/robusta-build.archi.md` — why: les deux consignent l'absence de couleur d'erreur comme voulue, et elle cesse d'être absente.

## Dependencies

- Dep 1 : aucune bloquante. Le travail tient dans `packages/robusta-design-system`, sur `dev` et dans `build:deps` depuis le 2026-07-30, entre `pyramids-themes` et `pyramids-layouts`.
- Dep 2 : cette story est elle-même la Dep 1 de robusta-landing-page, dont elle bloque l'implémentation.
