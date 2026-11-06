# Architecture: design-system

**Last updated:** 2026-11-06
**Kind:** module

## Parent

- [root](../../root.archi.md)

## Overview

`@robusta/pyramids-design-system` est le design system du site robusta.build (BR-PYRAMID-3) : son langage visuel sketchnote dessiné à la main, livré en un seul module — deux feuilles de style de Design tokens et de classes, les assets de marque, six primitives React et huit sections marketing rendues contre ces feuilles. Le site robusta.build est le seul à l'utiliser (BR-PYRAMID-13) et tire de lui tous ses Design tokens (BR-PYRAMID-6). Le module ne fournit aucune Page copy : chaque texte qu'un composant rend est une prop sans défaut, et l'élément qui la porte n'est rendu que si le site la passe (BR-PYRAMID-8). Les composants sont présentationnels : ni état, ni gestionnaire d'événement, ni contexte React, ni import de router, ni directive `'use client'` ou `'use server'`, ni lecture du viewport en JavaScript ; tout le responsive est en CSS. Ce n'est ni `pyramids-themes`, les tokens JS des sites DaisyUI, ni une bibliothèque de composants génériques.

## Apps, modules, packages

- package `primitives` — `src/primitives/` : `BrandLogo`, le lockup 💪 🏗 et le wordmark, et `SkButton`, `SkCallout`, `SkTag`, `SkInput`, `SkArrowRight`, chacune rendue sur une classe `.sk-*` de `sketch.css`. `SkLink.tsx` porte `SkLinkProps` et `SkLinkComponent`, le contrat du composant de lien d'un site, et `PlainLink`, l'ancre rendue sans lui, code interne.
- package `marketing` — `src/marketing/` : `Hero`, `SiteHeader`, `SiteFooter`, `ServicesGrid`, `FlowDiagram`, `PrinciplesList`, `NotesPreview` et `CTA`, les sections d'une page marketing, composées des primitives. Leur mise en page est dans `sketch.css`, sous une classe par élément ; leur racine prend `className` et `style`, et les six qui rendent une ancre prennent `linkComponent`.
- `colors_and_type.css` — les Design tokens dans `:root` et les styles d'élément, de `html` à `pre`. Aucune police chargée.
- `sketch.css` — les classes `.sk-*` des primitives, la mise en page des huit sections, puis la section responsive.
- `fonts.css` — IBM Plex Sans, IBM Plex Mono et Caveat depuis Google Fonts, pour un consommateur sans build ; le site robusta ne le charge pas.
- `assets/` — Crystal Tux en quatre poses SVG, la pose de base aussi en PNG, et le wordmark `robusta-build-wordmark.png`, 1603×312.
- `preview/` — les planches HTML du système, dont `marketing-page.html`, les huit sections en une page à redimensionner depuis 320 px ; `ui_kits/marketing/`, le prototype JSX des sections ; `uploads/`, les images sources ; `SKILL.md`, le skill de la marque. Aucun n'est livré : `package.json#files` s'arrête à `dist`, `*.css`, `assets` et `README.md`.
- `src/test-support/` — le rendu statique et `readableText`, le texte qu'un lecteur en reçoit, puis la lecture des fichiers livrés et celle des sources de `src/`, pour les specs ; hors build.

## Diagram

```
  Arrow = depends on. Packages and stylesheets of module
  `@robusta/pyramids-design-system`. No loop.

  src/index.ts  the library API, re-exports both packages
       │                     │
       ↓                     ↓
  `marketing` ──────────→ `primitives`
  8 sections              6 primitives
       │                     │
       │ class names         │ class names
       ↓                     ↓
  sketch.css  .sk-* rules, section layout, the five @media widths
       │
       │ var(--…)
       ↓
  colors_and_type.css  tokens in :root, element styles

  Omitted: both packages → colors_and_type.css, inline var(--…).
  fonts.css stands apart, linked first by a consumer with no build.
```

## Boundaries

### library API of module `@robusta/pyramids-design-system`

Client code : les packages `landing`, `chrome`, `components`, `page-data`, `article`, `listing`, `routes` et `design-system` de l'app `@robusta/robusta-build`, et sa Site configuration.

Composants, depuis `.` :

- `BrandLogo` — le lockup ; `size` vaut `compact`, `full` ou `mark`, `tagline` n'est rendue que par `full`, et seulement passée. `wordmarkSrc` est à passer : son défaut, `/_next/static/media/robusta-build-wordmark.png`, ne résout nulle part, et le module n'importe aucun de ses propres assets.
- `SkButton` — une ancre `.sk-btn` avec `href`, rendue par `linkComponent` s'il est passé, un `<button>` sans gestionnaire sinon ; `SkButtonProps` est une union de types, pas une `interface`, dont la branche bouton refuse `linkComponent`.
- `SkCallout`, `SkTag`, `SkInput`, `SkArrowRight` — une classe `.sk-*` chacune ; `SkTag` prend `tone`, `default`, `pink`, `blue` ou `green`.
- `Hero`, `SiteHeader`, `SiteFooter`, `ServicesGrid`, `FlowDiagram`, `PrinciplesList`, `NotesPreview`, `CTA` — chaque texte rendu, texte alternatif et placeholder compris, est une prop sans défaut ; seule la marque est fixe, le texte alternatif du wordmark et les glyphes 💪 🏗. Absente, `null` ou `''`, une prop de texte ne rend pas son élément ; une liste absente ne rend aucun item, son conteneur restant rendu ; `mascotAlt` absent écrit `alt=""`, la mascotte décorative. Aucune erreur levée, quelles que soient les props absentes. Chaque call to action est une ancre vers `primaryCtaHref`, `secondaryCtaHref` ou `ctaHref`. Le champ e-mail de `CTA` n'envoie rien : le site branche l'envoi dans un composant à lui.
- `SiteHeader` — `homeHref` est la cible du wordmark, `/` sans elle ; un `NavLink` qui porte `locale` l'écrit en `lang` et `hrefLang` de son ancre.
- `FlowDiagram` — `id` est celui de sa section, `approach` sans lui ; deux schémas d'une même page en portent deux distincts.
- `linkComponent` — `SiteHeader`, `SiteFooter`, `Hero`, `CTA`, `NotesPreview` et `ServicesGrid` le prennent ; il rend chacune de leurs ancres, celles de leurs `SkButton` comprises, avec le `href`, la `className` et les enfants qu'aurait portés l'ancre. Sans lui, une `<a>`. `PrinciplesList` et `FlowDiagram` ne rendent aucune ancre.
- Types de données : `NavLink`, `FooterColumn`, `FooterLink`, `ServiceItem`, `FlowStep`, `Principle`, `NotePost`, et les props de chaque composant. Un `FooterLink` et la ligne de lien d'une carte de `ServicesGrid`, `moreLabel` et `moreHref`, rendent une ancre avec un `href`, leur libellé en texte sans.
- Types du lien : `SkLinkProps`, les attributs d'une ancre, `href` requis ; `SkLinkComponent`, le composant React qui les reçoit. Aucun export d'exécution ne les accompagne.

Feuilles de style, sous-chemins de `exports`, chargées une fois par site dans cet ordre :

- `colors_and_type.css` — papier et encre ; les rampes `--brand-primary`, `--brand-secondary`, `--brand-accent` et `--brand-error`, chacune en base, `-soft` et `-deep` ; les familles `--font-sans`, `--font-script` et `--font-mono` ; l'échelle `--t-*`, dix pas en `clamp()` de 320 à 1536 px ; `--lh-*`, `--sp-1` à `--sp-9`, `--r-*`, `--measure` à 68ch ; les surligneurs `.highlight-*`. Chaque famille lit `--font-ibm-plex-sans`, `--font-ibm-plex-mono` ou `--font-caveat`, puis le nom de la face, puis une pile système ; le site robusta ne pose aucune de ces propriétés et auto-héberge les faces sous ces noms.
- `sketch.css` — les classes `.sk-*` ; la mise en page des sections sous `.sk-<section>`, `.sk-<section>__<part>` et `--<modifier>`, en spécificité d'une classe et sans `!important`, qu'un sélecteur du site portant une classe de plus surcharge quel que soit l'ordre de chargement ; 40, 48, 64, 80 et 96rem, chacune dans un seul `@media (min-width)`, la base étant la mise en page étroite.

Assets, sous `./assets/` : `crystal-tux.svg` et `crystal-tux.png`, deux illustrations distinctes sous le même nom, `crystal-tux-head.svg`, `crystal-tux-waving.svg`, `crystal-tux-thinking.svg`, `robusta-build-wordmark.png`. Le bundler du site résout l'import en URL hachée, une chaîne sous Vite.

## Dependencies

- Depends on : `react` seul, en peer `^19.1.1` ; aucun autre module du dépôt, aucune dépendance runtime.
- Used by : l'app `@robusta/robusta-build` — `Hero`, `FlowDiagram`, `PrinciplesList`, `CTA`, `NotesPreview` et `NotePost` dans `landing`, `SiteHeader`, `NavLink`, `SiteFooter` et `FooterColumn` dans `chrome`, `SkLinkProps` dans `components`, dont `SiteLink` est le composant de lien du site, `NotePost` dans `page-data`, `Principle` et `FlowStep` dans la Site configuration, `SkTag` dans `article`, `NotesPreview` et `NotePost` dans `listing`, les deux feuilles de style liées par `src/routes/__root.tsx`, le wordmark, `crystal-tux.svg` et `crystal-tux-waving.svg` dans `design-system`. `apps/dakar` ne l'importe pas.
- Lint : le script `lint`, eslint sur `src`, avec eslint 8.57.0 dans ses devDependencies, la version de la racine.
- Build : `tsc` compile `src/` vers `dist/`, troisième étape de `yarn build:deps`, entre `pyramids-themes` et `pyramids-layouts` ; `yarn w:design-system` ne surveille que le TypeScript. Un import local de `src/` nomme le `.ts` ou le `.tsx` qu'il importe ; `tsc` le réécrit en `.js` dans le JS émis (`rewriteRelativeImportExtensions`), les `.d.ts` de `dist/` gardent l'extension de la source. Les feuilles de style et les assets sont servis depuis la racine du module par la map `exports`, sans copie : un serveur de dev voit une modification CSS sans rebuild.
- Tests : 209 tests `node:test` dans quatorze specs à côté des sources, par `yarn workspace @robusta/pyramids-design-system run test`, qui les compile avec `tsconfig.test.json` vers `.test-build/` puis lance `node --test`. Les specs rendent les composants en arbre d'éléments avec `react` seul et lisent les feuilles de style livrées ; `src/package-contract.spec.tsx` échoue sur un composant exporté en plus, une taille de police inline hors glyphes du lockup, une directive, une lecture du viewport, un import de router ou un contexte React, un composant qui lit `--brand-error`, ou une dépendance autre que `react` en peer ; `src/page-copy.spec.tsx`, sur un export de `src/index.ts` sans rendu dans le spec, ou qui rend un texte lisible que le spec ne lui passe pas, la marque exceptée, en nommant l'export et le texte ; `src/import-specifiers.spec.ts`, sur un specifier relatif qui ne nomme pas le `.ts` ou le `.tsx` présent, avec le fichier et la ligne.
