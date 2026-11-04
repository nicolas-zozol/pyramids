# Story : les sections du design system ne rendent que le texte du site

**Dernière mise à jour :** 2026-11-04
**Feature :** drop-section-default-copy
**Infix :** SECTIONCOPY
**Status :** ACTIVE

## Story

**En tant qu'**éditeur d'un site qui affiche les sections de `@robusta/pyramids-design-system` (`Hero`, `SiteHeader`, `CTA`…), **je veux** qu'une section n'affiche que le texte que mon site lui passe, **afin qu'**une prop oubliée ne publie jamais le texte du prototype sous le nom de mon site.

## Contexte & objectif

BR-PYRAMID-8 : un site fournit la page copy de chaque page qu'il publie, son design system n'en fournit aucune. Or chaque prop de texte des huit sections du module, et la `tagline` de `BrandLogo`, prend pour défaut le texte du prototype `ui_kits/marketing` : un `Hero` rendu sans props annonce « we build software you can still maintain in five years. » et « currently booking q3 · 2 slots left this quarter ».

robusta.build passe toutes ces props depuis sa Site configuration (R-LANDING-83), donc rien ne se voit aujourd'hui. Depuis la réécriture de BR-PYRAMID-3, le 2026-10-25, un second site peut rendre ces sections, et une prop qu'il oublierait publierait le prototype. Le retrait des défauts est décidé depuis le 2026-10-08 (OQ-LANDING-15, story robusta-landing-page). Une prop oubliée laisse un vide, sans faire échouer la compilation : les props restent optionnelles, car requises, elles obligeraient un site à passer `''` pour chaque élément qu'il masque et casseraient la page `_design-test` de la v1, qu'on ne modifie plus.

Restent hors du retrait : le texte dessiné dans un asset de marque, qui n'est pas de la page copy (glossaire, R-LANDING-42), soit le texte alternatif « Robusta Build » du wordmark et les glyphes 💪 🏗 ; les destinations par défaut des calls to action, qui ne sont pas du texte lu (BR-PYRAMID-8), un call to action sans libellé n'étant de toute façon pas rendu ; le prototype lui-même, `ui_kits/marketing/*.jsx` et `preview/*.html`, que `package.json#files` ne livre pas. Côté site, le test de garde d'AC-LANDING-2 (`apps/robusta-build/src/landing/LandingPage.spec.tsx`) tire sa liste de textes interdits d'un rendu des sections sans props : cette liste sera vide après la story, et le test doit continuer à protéger AC-LANDING-2.

## Acceptance Criteria

- AC-SECTIONCOPY-1 : Given un site qui rend une section sans lui passer l'une de ses props de texte, When un visiteur lit la page, textes alternatifs compris, Then aucun mot du prototype ne lui parvient et l'élément qui aurait porté ce texte n'est pas rendu.
- AC-SECTIONCOPY-2 : Given les huit sections et `BrandLogo` en variante `full`, When on les rend sans aucune prop de texte, Then le seul texte lisible est la marque : les glyphes 💪 🏗 et le texte alternatif du wordmark.
- AC-SECTIONCOPY-3 : Given un site qui passe une prop de texte, When la section se rend, Then elle rend ce texte comme aujourd'hui ; vide, `''` ou `null`, une prop de texte se rend comme absente et son élément n'est pas rendu, y compris pour les 15 props qui rendent aujourd'hui un élément vide, dont le surtitre et le titre de `NotesPreview`.
- AC-SECTIONCOPY-4 : Given robusta.build, When il est construit après la story, Then ses pages prérendues ne changent pas d'un mot (seul le `<div>` vide de la ligne de version quitte le pied de page), et ses tests refusent toujours un texte du prototype sur ses landing pages (AC-LANDING-2).
- AC-SECTIONCOPY-5 : Given une section ajoutée plus tard au design system, When elle porte un texte par défaut, Then les tests du design system échouent.
- AC-SECTIONCOPY-6 : Given les cas limites, When on les rejoue, Then une liste absente (liens de navigation, colonnes de pied de page, cartes, étapes, principes, articles) ne rend aucun item ; un `Hero` sans titre ne rend pas de `h1` vide ; une mascotte sans `mascotAlt` est décorative, `alt=""` ; la page `_design-test` de `apps/robusta`, non routée, compile encore et perd la tagline du prototype ; le prototype `ui_kits/marketing` garde son texte.

## Boundaries

### library API of module `@robusta/pyramids-design-system` — modified

Client code : app `@robusta/robusta-build`, packages `landing` et `chrome`, puis la page de listing de blog-rolls, qui rend `NotesPreview` sans surtitre ni titre ; app `@robusta/build`, par sa page `src/app/_design-test/page.tsx` seule.

Props de texte qui perdent leur défaut, 34 sur neuf composants ; types et signatures inchangés, chaque prop reste optionnelle ; absente, `null` ou `''`, elle ne rend pas son élément, et une liste absente ne rend aucun item :

- `Hero` — `eyebrow`, `title`, `subtitle`, `primaryCtaLabel`, `secondaryCtaLabel`, `footnote`, `mascotAlt`, `annotation`
- `SiteHeader` — `links`, `ctaLabel`
- `SiteFooter` — `tagline`, `columns`, `copyright`, `versionLine`
- `ServicesGrid` — `eyebrow`, `title`, `services`, dont le `moreLabel` « see how it works » de chaque carte
- `FlowDiagram` — `eyebrow`, `title`, `steps`, `caveat`
- `PrinciplesList` — `eyebrow`, `title`, `principles`
- `NotesPreview` — `eyebrow`, `title`, `allLinkLabel`, `posts`
- `CTA` — `title`, `subtitle`, `emailPlaceholder`, `ctaLabel`, `footnote`
- `BrandLogo` — `tagline`

Inchangés : le texte alternatif du wordmark et les glyphes du lockup ; les destinations par défaut `#book`, `#audit` et `#notes`, `homeHref` et l'`id` de `FlowDiagram`.

## Documentation updates

- change le paragraphe sur les props de texte in `packages/robusta-design-system/README.md` — why: il dit que chaque prop a pour défaut le texte du prototype.
- change l'Overview et les Boundaries in `packages/robusta-design-system/design-system.archi.md` — why: même affirmation ; une prop de texte absente n'y rend plus rien.
- remplace « surface » par « section » (glossaire, Section) in `packages/robusta-design-system/README.md`, `design-system.archi.md`, `SKILL.md`, les commentaires de `packages/robusta-design-system/src`, `root.archi.md`, `apps/robusta-build/README.md` et `robusta-build.archi.md` — why: le terme a changé le 2026-10-31 ; « surface » au sens d'API ou de surcharge reste.

## Dependencies

- Aucune dépendance bloquante : la story se code dès son design APPROVED.
- blog-rolls, même batch B1, dépend de cette story, qui doit être livrée avant elle (Gap-BLOGROLLS-3) : blog-rolls ne passe à `NotesPreview` ni surtitre ni titre, et n'ajoute aucune section au design system (OQ-BLOGROLLS-1).
