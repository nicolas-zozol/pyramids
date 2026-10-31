# Story : imports TypeScript à leur vraie extension sur la v2

**Dernière mise à jour :** 2026-10-31
**Feature :** ts-import-extensions
**Infix :** TSIMPORTS
**Status :** ACTIVE

## Story

**En tant que** développeur du site v2, humain ou agent, **je veux** écrire un import local avec l'extension du fichier qu'il désigne, `./foo.ts` ou `./Bar.tsx`, **afin de** lire dans l'import le fichier réellement présent, et non un `.js` qui n'existe qu'après compilation.

## Contexte & objectif

La règle actuelle impose `.js` à tout import local (CLAUDE.md, `.cursor/rules/monorepo.mdc`). Elle vient d'un temps où `tsc` ne réécrivait aucun specifier : la source devait nommer le fichier émis. TypeScript 5.7, installé à la racine, réécrit dans sa sortie un import relatif en `.ts` ou `.tsx` vers `.js` (`rewriteRelativeImportExtensions`). Node 22.18 exécute un `.ts` par type stripping et ne fait aucune correspondance `.js` → `.ts` : pour lui, un import en `.js` désigne un fichier absent.

Sur la v2, la règle est aussi un contrôle de build : `check:source` fait échouer `build` sur un import local sans `.js` (R-TANSTACK-11), et le générateur de routes écrit des `.js` (R-TANSTACK-06). La story renverse ces deux points, rien d'autre de tanstack-start-migration.

Périmètre : `apps/robusta-build` et `packages/robusta-design-system`. `tsc` y émet du JS à trois endroits, qui doivent rester justes :

- `dist/` du design system, que robusta-build et `apps/robusta` consomment ;
- `.test-build`, où `tsc -p tsconfig.test.json` compile les specs du design system pour `node --test` ;
- `.routing-dist`, où `compile:seams` compile les seams de routing et de contenu pour les scripts `.mjs` du site.

Vite et vitest compilent le reste du site sans `tsc`. Hors périmètre, et toujours en `.js` : `apps/robusta` (v1, en retrait, pas de refactoring), `apps/dakar` (`extensionAlias` de `next.config.ts`) et les autres modules de `packages/`.

Le diff touche presque tous les fichiers TS du périmètre. Il ne change aucun comportement et arrive seul dans son commit.

## Acceptance Criteria

- AC-TSIMPORTS-1 : Given les sources TypeScript du site et du design system, configs Vite et specs de `scripts/` comprises, When on relit leurs imports locaux, Then chacun nomme l'extension du fichier présent, `.ts` ou `.tsx`, aucun ne finit en `.js`, et l'arbre de routes généré suit la même règle.
- AC-TSIMPORTS-2 : Given le design system buildé, ses specs compilées et les seams du site compilés, When on lit le JS et les `.d.ts` émis dans `dist/`, `.test-build` et `.routing-dist`, Then aucun specifier ne désigne un `.ts` ou un `.tsx`, et les scripts `.mjs` qui importent `.routing-dist` n'ont pas changé.
- AC-TSIMPORTS-3 : Given un Clean checkout, When on lance le Green set, les tests et le lint du site et du design system, et `tsc --noEmit` sur le site, Then tout passe, et le site prérend les mêmes pages qu'avant la story (BR-PYRAMID-5).
- AC-TSIMPORTS-4 : Given un import local écrit en `.js`, ou sans extension, sous le `src` du site ou du design system, When on lance le build du site ou les tests du design system, Then ils échouent en nommant le fichier et la ligne ; le refus des directives `'use client'` et `'use server'` ne change pas.
- AC-TSIMPORTS-5 : Given le commit de la story, When on le relit, Then il ne contient que des specifiers d'import, la configuration TypeScript et celle du générateur de routes, le contrôle des imports et ses specs, et aucun fichier hors périmètre.
- AC-TSIMPORTS-6 : Given les cas limites, When on les rejoue, Then un `.ts` qui importe un `.tsx`, ou l'inverse, prend l'extension du fichier importé et non celle de l'importeur ; un import par alias `@/…`, un re-export et un `import()` dynamique suivent la même règle, et aucun alias n'apparaît dans un fichier que `tsc` émet ; un import d'asset (`.css`, `.css?url`, `.json`) ou d'un vrai `.mjs` garde son extension ; un import de dossier comme `./url-scheme` reste refusé et nomme son `index.ts`.

## Boundaries

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn build:robusta` à la racine, et le build Netlify par `netlify.toml`.

- `build` — exit 1 sur un import local sous `src` écrit en `.js` ou sans extension, au lieu d'un import local sans `.js`. Ses autres refus ne changent pas.

La library API du module `@robusta/pyramids-design-system` ne change pas : `dist/` garde ses exports, ses types et des specifiers en `.js`.

## Open Questions & Gaps

- OQ-TSIMPORTS-1 : Une fois les imports en `.ts`, retire-t-on `compile:seams` et `.routing-dist` dans une story suivante, les scripts du site chargeant alors les seams directement par Node ?
- Proposition : oui, comme item séparé du ROADMAP après celle-ci, pas dans cette story.
- Rationale : Node 22.18 chargerait les seams sans compilation, mais le type stripping refuse une partie de la syntaxe TypeScript (enums, parameter properties, imports de types non marqués `type`) et cinq scripts lisent `.routing-dist` ; le faire ici casserait le « sans changement de comportement ».
- Resolution:

## Documentation updates

- change §TS imports — extension rule in `CLAUDE.md` — why : la règle devient double, vraie extension sur `apps/robusta-build` et `packages/robusta-design-system`, `.js` sur `apps/robusta`, `apps/dakar` et les autres modules.
- change la règle d'import in `.cursor/rules/monorepo.mdc` — why : CLAUDE.md en tire ses conventions, même partage.
- change `check:source` et la phrase sur l'arbre de routes in `apps/robusta-build/README.md` — why : elles décrivent le suffixe `.js`.

## Dependencies

- Dep 1 : multilingual-site landée, ou au moins son implémentation close. Elle est à 97 % (`fb4803b`) sur les mêmes fichiers : passée avant elle, cette story entrerait en conflit avec presque chacun.
