# Design: les sections du design system ne rendent que le texte du site

**Last update:** 2026-11-04
**Feature:** drop-section-default-copy
**Infix:** SECTIONCOPY
**Status:** IMPLEMENTED (2026-11-04, commit 3b16c72)
**Sources:** [story](drop-section-default-copy.story.md), [epic](../pyramid-v2.epic.md), [robusta-landing-page](../robusta-landing-page/robusta-landing-page.design.md), [blog-rolls](../blog-rolls/blog-rolls.story.md)

## Goal

Les 34 props de texte des huit sections et de `BrandLogo` perdent leur défaut : absente, `null` ou vide, une prop de texte ne rend pas l'élément qui la porte, et une liste absente ne rend aucun item. Un spec du design system rend chaque export du module sans texte et échoue sur tout texte qu'il ne reçoit pas, section future comprise. Le garde d'AC-LANDING-2 du site cesse de lire les défauts qu'on retire. Le pourquoi : [story](drop-section-default-copy.story.md).

Props optionnelles, types inchangés : une prop oubliée laisse un vide, sans faire échouer la compilation.

## Boundaries

```
  Arrow = client code ──→ API it uses, labelled with the API kind. No loop.

  app `@robusta/robusta-build`          app `@robusta/build`
  [modified]
            │ library                   library │
            ↓                                   │
  module `@robusta/pyramids-design-system` ←────┘
  [modified]
```

### library API of module `@robusta/pyramids-design-system` — modified

Client code : app `@robusta/robusta-build`, packages `landing` et `chrome`, puis la page de listing de blog-rolls, qui rend `NotesPreview` sans `eyebrow`, `title` ni `allLinkLabel` ; app `@robusta/build`, par `src/app/_design-test/page.tsx` seule.

Types et signatures inchangés : `HeroProps`, `SiteHeaderProps`, `SiteFooterProps`, `ServicesGridProps`, `FlowDiagramProps`, `PrinciplesListProps`, `NotesPreviewProps`, `CTAProps`, `BrandLogoProps`, et les types d'item `NavLink`, `FooterColumn`, `FooterLink`, `ServiceItem`, `FlowStep`, `Principle`, `NotePost`. Chaque prop de texte reste optionnelle ; les champs de texte d'un item restent requis et se rendent tels que le site les passe.

Garanties :

- Absente, `null` ou `''`, une prop de texte ne rend pas son élément ; absente, une liste vaut `[]` et ne rend aucun item. Aucun texte du module n'atteint un lecteur, textes alternatifs et placeholder compris, sauf la marque : les glyphes 💪 🏗 et le texte alternatif « Robusta Build » du wordmark.
- Déjà conditionnels, inchangés : `primaryCtaLabel`, `secondaryCtaLabel`, `ctaLabel` et leur bouton, `footnote`, `annotation` et sa flèche, `subtitle` et `emailPlaceholder` de `CTA`, `caveat` et sa mascotte, `allLinkLabel`, `tagline` de `BrandLogo`, `moreLabel` d'une carte.
- Deviennent conditionnels, les 15 éléments rendus vides aujourd'hui (AC-SECTIONCOPY-3) : `eyebrow`, flèche comprise, `title` et `subtitle` de `Hero` ; `eyebrow` et `title` de `ServicesGrid`, `FlowDiagram`, `PrinciplesList` et `NotesPreview` ; `title` de `CTA` ; `tagline`, `copyright` et `versionLine` de `SiteFooter`.
- `mascotAlt` absent écrit `alt=""` : la mascotte reste, décorative.
- Restent rendus, vides s'il le faut, avec leurs marges : les conteneurs `__head`, `__actions`, `__form`, `nav`, `__list`, `__steps`, `__items` et `__bottom`. Un `NotesPreview` sans `eyebrow`, `title` ni `allLinkLabel` ne rend aucun `h2`, et sa tête vide garde sa marge basse au-dessus de la liste.
- Inchangés : le lockup de `BrandLogo`, les destinations `#book`, `#audit` et `#notes`, `homeHref`, l'`id` de `FlowDiagram`, les `id` `work` et `notes`, le `#` d'un `NotePost` sans `href`, `mascotSrc` et `wordmarkSrc`.
- Aucune erreur levée : une section se rend quelles que soient les props absentes.

Client code, dans un second site :

```tsx
import { Hero } from '@robusta/pyramids-design-system';

// no eyebrow, subtitle, footnote nor caption rendered; the mascot is decorative, alt=""
<Hero
  title={copy.hero.title}
  primaryCtaLabel={copy.hero.contactLabel}
  primaryCtaHref={`mailto:${contact.email}`}
  mascotSrc={heroMascotSrc}
/>;
```

### library API of package `test-support` in module `@robusta/pyramids-design-system` — modified

Client code : les specs du module, `src/page-copy.spec.tsx` d'abord.

```ts
type StaticNode; // unchanged

/** What a reader receives from the tree: its text nodes, then the non-empty alt, placeholder, aria-label and title of its elements. */
function readableText(nodes: StaticNode[]): string[];
```

Était : le `alt` des seules images. `textNodes`, `byClass`, `byTag` et `attribute` ne changent pas.

### CLI API of module `@robusta/pyramids-design-system` — modified

Client code : `yarn workspace @robusta/pyramids-design-system run test`.

- exit 1 quand `src/page-copy.spec.tsx` échoue : un export de `src/index.ts` rend un texte lisible que son rendu ne lui passe pas, la marque exceptée, et l'assertion nomme l'export et le texte ; ou un export n'a pas de rendu dans le spec, et l'assertion le nomme.
- Ses autres refus ne changent pas.

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn workspace @robusta/robusta-build run test`.

- exit 1 quand une landing page, en-tête et pied de page compris, porte un texte lisible que le site ne fournit pas ; l'assertion nomme la Locale et le texte.
- exit 1, inchangé, sur une phrase du prototype dans la page.

## Technical Constraints

- `test` compile par `tsc -p tsconfig.test.json` puis lance `node --test` sur `.test-build/**/*.spec.js` : un spec à la racine de `src` est chargé comme `package-contract.spec.tsx`. Pas de DOM : `renderStatic` appelle chaque composant avec `react` seul.
- `import * as designSystem from './index.ts'` ne porte que les exports d'exécution, les 14 composants, types effacés : c'est la liste que parcourt le garde, comme `package-contract.spec.tsx`.
- React DOM n'écrit pas un attribut qui vaut `undefined` : sans `alt=""` explicite, la mascotte n'aurait pas d'`alt`, et un lecteur d'écran lirait son nom de fichier.
- Le site lit le module par son build output, `exports` vers `dist/` : ses tests et sa build ne voient la story qu'après `yarn build:deps`.
- Imports locaux à leur vraie extension `.ts` ou `.tsx`, dans le module comme dans le site ; `src/import-specifiers.spec.ts` et `check:source` refusent un `.js`.

## Requirements

### Sections

- R-SECTIONCOPY-01 : `Hero`, `SiteHeader`, `SiteFooter`, `ServicesGrid`, `FlowDiagram`, `PrinciplesList`, `NotesPreview`, `CTA` et `BrandLogo` ne portent plus aucun texte du prototype, ni défaut de prop ni constante `DEFAULT_*` de texte ; les commentaires qui annoncent un défaut du prototype sont réécrits (BR-PYRAMID-8).
- R-SECTIONCOPY-02 : absente, `null` ou `''`, une prop de texte ne rend pas l'élément qui la porte, les quinze éléments rendus aujourd'hui sans condition compris (Boundaries).
- R-SECTIONCOPY-03 : une liste absente vaut `[]` : aucun item, son conteneur restant rendu.
- R-SECTIONCOPY-04 : `mascotAlt` absent écrit `alt=""` sur la mascotte de `Hero`.
- R-SECTIONCOPY-05 : le lockup, les destinations, les `id`, `mascotSrc` et `wordmarkSrc` ne changent pas ; `ui_kits/marketing/` et `preview/` ne sont pas touchés.

### Garde du design system

- R-SECTIONCOPY-21 : `readableText` lit les text nodes, puis les `alt`, `placeholder`, `aria-label` et `title` non vides de tout élément.
- R-SECTIONCOPY-22 : `src/page-copy.spec.tsx` parcourt les exports de `src/index.ts`, liste tirée de l'import et non écrite à la main ; un export sans rendu dans le spec le fait échouer en le nommant (BR-PYRAMID-8).
- R-SECTIONCOPY-23 : chaque export y a deux rendus : sans aucune prop de texte, mais avec les props non textuelles qui font paraître chaque élément (`mascotSrc`, destinations), `BrandLogo` en `full`, `compact` et `mark` ; puis avec chaque liste portant un item aux champs de texte vides. Le texte lisible de chacun est la marque, ou une valeur que le rendu passe lui-même, comme le numéro d'une étape.
- R-SECTIONCOPY-24 : les specs qui lisent un défaut du prototype passent leur texte, ou prouvent son absence : ceux de `Hero`, `BrandLogo`, `ServicesGrid`, `SiteFooter` et `SiteHeader`, puis `calls-to-action` et `link-component`, dont les ancres naissent aujourd'hui des libellés et des liens par défaut.

### Site

- R-SECTIONCOPY-41 : `src/landing/LandingPage.spec.tsx` garde AC-LANDING-2 par inventaire : chaque texte lisible des trois landing pages, en-tête et pied de page compris, est une valeur de la page copy de sa Locale, le `localeName` d'une autre Locale, `contact.email`, le titre ou la date d'une note de son feed, le numéro d'une étape, ou la marque. La liste tirée du rendu des sections sans props et son seuil `> 20` disparaissent ; l'expression des phrases du prototype reste. Aucune liste figée des textes du prototype n'entre dans le site.
- R-SECTIONCOPY-42 : le code de `landing` et `chrome` ne change pas, ses props vides `footnote`, `emailPlaceholder` et `versionLine` comprises. Seul `src/chrome/chrome.spec.tsx` suit le pied de page : sa ligne du bas n'a plus que le `<div>` du copyright.
- R-SECTIONCOPY-43 : chaque document prérendu de `dist/client` garde son texte lisible mot pour mot ; son balisage ne perd que le `<div>` vide de la ligne de version.

## Acceptance Criteria

- AC-SECTIONCOPY-1 : Given un site qui rend une section sans lui passer l'une de ses props de texte, When un visiteur lit la page, textes alternatifs compris, Then aucun mot du prototype ne lui parvient et l'élément qui aurait porté ce texte n'est pas rendu.
- AC-SECTIONCOPY-2 : Given les huit sections et `BrandLogo` en variante `full`, When on les rend sans aucune prop de texte, Then le seul texte lisible est la marque : les glyphes 💪 🏗 et le texte alternatif du wordmark.
- AC-SECTIONCOPY-3 : Given un site qui passe une prop de texte, When la section se rend, Then elle rend ce texte comme aujourd'hui ; vide, `''` ou `null`, une prop de texte se rend comme absente et son élément n'est pas rendu, y compris pour les 15 props qui rendent aujourd'hui un élément vide, dont le surtitre et le titre de `NotesPreview`.
- AC-SECTIONCOPY-4 : Given robusta.build, When il est construit après la story, Then ses pages prérendues ne changent pas d'un mot (seul le `<div>` vide de la ligne de version quitte le pied de page), et ses tests refusent toujours un texte du prototype sur ses landing pages (AC-LANDING-2).
- AC-SECTIONCOPY-5 : Given une section ajoutée plus tard au design system, When elle porte un texte par défaut, Then les tests du design system échouent.
- AC-SECTIONCOPY-6 : Given les cas limites, When on les rejoue, Then une liste absente (liens de navigation, colonnes de pied de page, cartes, étapes, principes, articles) ne rend aucun item ; un `Hero` sans titre ne rend pas de `h1` vide ; une mascotte sans `mascotAlt` est décorative, `alt=""` ; la page `_design-test` de `apps/robusta`, non routée, compile encore et perd la tagline du prototype ; le prototype `ui_kits/marketing` garde son texte.

Référence d'AC-SECTIONCOPY-4 : le texte lisible des 34 documents de `dist/client` (3 landing pages, 30 URL de contenu, `404.html`), relevé avant et après la story, est identique.

Edge cases to test :

- une liste absente, liens, colonnes, cartes, étapes, principes ou articles, ne rend aucun item, son conteneur restant ;
- un `Hero` sans `title` ne rend aucun `h1` ; sans `eyebrow`, ni l'eyebrow ni sa flèche ;
- un `NotesPreview` sans `eyebrow`, `title` ni `allLinkLabel` ne rend aucun `h2` ni texte au-dessus de ses articles, sa tête vide restant ;
- la mascotte d'un `Hero` sans `mascotAlt` est rendue avec `alt=""` ;
- un `CTA` sans `emailPlaceholder` ne rend aucun champ, et un placeholder compte comme texte lisible ;
- `BrandLogo` `full` sans `tagline` ne rend que le lockup, et `_design-test` de `apps/robusta` compile ;
- une prop vide passée par le site, comme `versionLine=""`, masque son élément comme une prop absente ;
- un export ajouté au module sans rendu dans le garde fait échouer les tests en le nommant ;
- un libellé par défaut posé sur un item, et non sur la section, fait échouer les tests ;
- le commit ne touche ni `ui_kits/marketing/` ni `preview/`.

## Dependencies

- Depends on : aucune.
- Blocks : blog-rolls, même batch B1, livrée après cette story (Gap-BLOGROLLS-3) : sa page de listing rend `NotesPreview` sans surtitre ni titre, et elle n'ajoute aucune section au design system (OQ-BLOGROLLS-1).
