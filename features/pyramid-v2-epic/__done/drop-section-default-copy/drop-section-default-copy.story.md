# Story : les sections du design system ne rendent que le texte du site

**Dernière mise à jour :** 2026-11-04
**Feature :** drop-section-default-copy
**Infix :** SECTIONCOPY
**Status :** DONE (2026-11-05, commit 3b16c72 sur main)

## Story

**En tant qu'**éditeur d'un site qui affiche les sections de `@robusta/pyramids-design-system` (`Hero`, `SiteHeader`, `CTA`…), **je veux** qu'une section n'affiche que le texte que mon site lui passe, **afin qu'**une prop oubliée ne publie jamais le texte du prototype sous le nom de mon site.

## Contexte & objectif

BR-PYRAMID-8 interdit au design system toute page copy, or ses huit sections et la `tagline` de `BrandLogo` prenaient pour défaut le texte du prototype `ui_kits/marketing`. robusta.build passe toutes ces props (R-LANDING-83), mais un second site, permis par BR-PYRAMID-3 depuis le 2026-10-25, aurait publié le prototype pour chaque prop oubliée. Retrait décidé le 2026-10-08 (OQ-LANDING-15).

## Livré

### Requirements

- R-SECTIONCOPY-01 : `Hero`, `SiteHeader`, `SiteFooter`, `ServicesGrid`, `FlowDiagram`, `PrinciplesList`, `NotesPreview`, `CTA` et `BrandLogo` ne portent plus aucun texte du prototype, ni défaut de prop ni constante `DEFAULT_*` de texte ; les commentaires qui annoncent un défaut du prototype sont réécrits (BR-PYRAMID-8).
- R-SECTIONCOPY-02 : absente, `null` ou `''`, une prop de texte ne rend pas l'élément qui la porte, les quinze éléments rendus aujourd'hui sans condition compris (Boundaries).
- R-SECTIONCOPY-03 : une liste absente vaut `[]` : aucun item, son conteneur restant rendu.
- R-SECTIONCOPY-04 : `mascotAlt` absent écrit `alt=""` sur la mascotte de `Hero`.
- R-SECTIONCOPY-05 : le lockup, les destinations, les `id`, `mascotSrc` et `wordmarkSrc` ne changent pas ; `ui_kits/marketing/` et `preview/` ne sont pas touchés.
- R-SECTIONCOPY-21 : `readableText` lit les text nodes, puis les `alt`, `placeholder`, `aria-label` et `title` non vides de tout élément.
- R-SECTIONCOPY-22 : `src/page-copy.spec.tsx` parcourt les exports de `src/index.ts`, liste tirée de l'import et non écrite à la main ; un export sans rendu dans le spec le fait échouer en le nommant (BR-PYRAMID-8).
- R-SECTIONCOPY-23 : chaque export y a deux rendus : sans aucune prop de texte, mais avec les props non textuelles qui font paraître chaque élément (`mascotSrc`, destinations), `BrandLogo` en `full`, `compact` et `mark` ; puis avec chaque liste portant un item aux champs de texte vides. Le texte lisible de chacun est la marque, ou une valeur que le rendu passe lui-même, comme le numéro d'une étape.
- R-SECTIONCOPY-24 : les specs qui lisent un défaut du prototype passent leur texte, ou prouvent son absence : ceux de `Hero`, `BrandLogo`, `ServicesGrid`, `SiteFooter` et `SiteHeader`, puis `calls-to-action` et `link-component`, dont les ancres naissent aujourd'hui des libellés et des liens par défaut.
- R-SECTIONCOPY-41 : `src/landing/LandingPage.spec.tsx` garde AC-LANDING-2 par inventaire : chaque texte lisible des trois landing pages, en-tête et pied de page compris, est une valeur de la page copy de sa Locale, le `localeName` d'une autre Locale, `contact.email`, le titre ou la date d'une note de son feed, le numéro d'une étape, ou la marque. La liste tirée du rendu des sections sans props et son seuil `> 20` disparaissent ; l'expression des phrases du prototype reste. Aucune liste figée des textes du prototype n'entre dans le site.
- R-SECTIONCOPY-42 : le code de `landing` et `chrome` ne change pas, ses props vides `footnote`, `emailPlaceholder` et `versionLine` comprises. Seul `src/chrome/chrome.spec.tsx` suit le pied de page : sa ligne du bas n'a plus que le `<div>` du copyright.
- R-SECTIONCOPY-43 : chaque document prérendu de `dist/client` garde son texte lisible mot pour mot ; son balisage ne perd que le `<div>` vide de la ligne de version.

### Acceptance Criteria

- AC-SECTIONCOPY-1 : Given un site qui rend une section sans lui passer l'une de ses props de texte, When un visiteur lit la page, textes alternatifs compris, Then aucun mot du prototype ne lui parvient et l'élément qui aurait porté ce texte n'est pas rendu.
- AC-SECTIONCOPY-2 : Given les huit sections et `BrandLogo` en variante `full`, When on les rend sans aucune prop de texte, Then le seul texte lisible est la marque : les glyphes 💪 🏗 et le texte alternatif du wordmark.
- AC-SECTIONCOPY-3 : Given un site qui passe une prop de texte, When la section se rend, Then elle rend ce texte comme aujourd'hui ; vide, `''` ou `null`, une prop de texte se rend comme absente et son élément n'est pas rendu, y compris pour les 15 props qui rendent aujourd'hui un élément vide, dont le surtitre et le titre de `NotesPreview`.
- AC-SECTIONCOPY-4 : Given robusta.build, When il est construit après la story, Then ses pages prérendues ne changent pas d'un mot (seul le `<div>` vide de la ligne de version quitte le pied de page), et ses tests refusent toujours un texte du prototype sur ses landing pages (AC-LANDING-2).
- AC-SECTIONCOPY-5 : Given une section ajoutée plus tard au design system, When elle porte un texte par défaut, Then les tests du design system échouent.
- AC-SECTIONCOPY-6 : Given les cas limites, When on les rejoue, Then une liste absente (liens de navigation, colonnes de pied de page, cartes, étapes, principes, articles) ne rend aucun item ; un `Hero` sans titre ne rend pas de `h1` vide ; une mascotte sans `mascotAlt` est décorative, `alt=""` ; la page `_design-test` de `apps/robusta`, non routée, compile encore et perd la tagline du prototype ; le prototype `ui_kits/marketing` garde son texte.

## Boundaries

### library API of module `@robusta/pyramids-design-system` — modified

Client code : app `@robusta/robusta-build`, packages `landing` et `chrome`, puis la page de listing de blog-rolls, qui rend `NotesPreview` sans surtitre ni titre ; app `@robusta/build`, par sa page `src/app/_design-test/page.tsx` seule.

Props de texte sans défaut, 34 sur neuf composants ; types et signatures inchangés, chaque prop reste optionnelle ; absente, `null` ou `''`, elle ne rend pas son élément, et une liste absente ne rend aucun item :

- `Hero` — `eyebrow`, `title`, `subtitle`, `primaryCtaLabel`, `secondaryCtaLabel`, `footnote`, `mascotAlt`, `annotation`
- `SiteHeader` — `links`, `ctaLabel`
- `SiteFooter` — `tagline`, `columns`, `copyright`, `versionLine`
- `ServicesGrid` — `eyebrow`, `title`, `services`, dont le `moreLabel` de chaque carte
- `FlowDiagram` — `eyebrow`, `title`, `steps`, `caveat`
- `PrinciplesList` — `eyebrow`, `title`, `principles`
- `NotesPreview` — `eyebrow`, `title`, `allLinkLabel`, `posts`
- `CTA` — `title`, `subtitle`, `emailPlaceholder`, `ctaLabel`, `footnote`
- `BrandLogo` — `tagline`

Inchangés : le texte alternatif du wordmark et les glyphes du lockup ; les destinations par défaut `#book`, `#audit` et `#notes`, `homeHref` et l'`id` de `FlowDiagram`.

Package `test-support` du module : `readableText` lit aussi `placeholder`, `aria-label` et `title`. CLI `test` du module : exit 1 quand `src/page-copy.spec.tsx` trouve un texte non passé ou un export sans rendu.

## Décisions

- 2026-11-04 — Une prop oubliée laisse un vide, sans faire échouer la compilation : les props restent optionnelles. Pourquoi : requises, elles obligeraient un site à passer `''` pour chaque élément masqué et casseraient `_design-test` de la v1 (OQ-SECTIONCOPY-1).
- 2026-11-04 — Les destinations par défaut `#book`, `#audit` et `#notes` restent. Pourquoi : une destination n'est pas de la page copy (BR-PYRAMID-8, OQ-SECTIONCOPY-2).
- 2026-11-04 — Vide, `''` ou `null`, une prop de texte masque son élément comme une prop absente, les 15 éléments rendus vides compris. Pourquoi : une prop vide et une prop absente ne doivent pas diverger (Gap-SECTIONCOPY-3).
- 2026-11-04 — Le site prouve l'absence du prototype par l'inventaire des textes qu'il fournit, pas par une liste figée. Pourquoi : une liste figée recopierait le prototype dans le site (OQ-SECTIONCOPY-4).
- 2026-11-04 — R-SECTIONCOPY-01 à 03 remplacent R-RESPONSIVE-44, 106 et 107 dans les en-têtes de package du design system.
- 2026-11-04 — Le renommage « surface » → « section » s'arrête aux documents. `SKILL.md` garde « surface » au sens d'interface à construire ; les commentaires et les identifiants (`SURFACES`, `SURFACE_BLOCKS`) de `packages/robusta-design-system/src` restent, à reprendre par un fix.

## Documentation updates

- changed le paragraphe sur les props de texte in `packages/robusta-design-system/README.md` : une prop absente ne rend rien, et `src/page-copy.spec.tsx` garde la règle.
- changed l'Overview, les Boundaries et la ligne Tests (209 tests, quatorze specs) in `packages/robusta-design-system/design-system.archi.md`.
- changed « surface » en « section » in `packages/robusta-design-system/README.md`, `apps/robusta-build/README.md`, `root.archi.md` et `apps/robusta-build/robusta-build.archi.md`.
- changed le pied de page sans ligne de version, le package `test-support` et le refus du CLI `test` in `apps/robusta-build/robusta-build.archi.md`.

## Dependencies

- blog-rolls attendait cette story pour rendre `NotesPreview` sans surtitre ni titre (Gap-BLOGROLLS-3) : levée.
