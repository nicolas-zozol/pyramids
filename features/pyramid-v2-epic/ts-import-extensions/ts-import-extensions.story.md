# Story : imports TypeScript à leur vraie extension sur la v2

**Dernière mise à jour :** 2026-10-31
**Feature :** ts-import-extensions
**Infix :** TSIMPORTS
**Status :** ACTIVE

## Story

**En tant que** développeur du site v2, humain ou agent, **je veux** écrire un import local avec l'extension du fichier qu'il désigne, `./foo.ts` ou `./Bar.tsx`, **afin de** lire dans l'import le fichier réellement présent, et non un `.js` qui n'existe qu'après compilation.

## Contexte & objectif

La règle actuelle impose `.js` à tout import local (CLAUDE.md, `.cursor/rules/monorepo.mdc`). Elle vient d'un temps où `tsc` ne réécrivait aucun specifier : la source devait nommer le fichier émis. TypeScript 5.7, installé à la racine, réécrit dans sa sortie JS un import relatif en `.ts` ou `.tsx` vers `.js` (`rewriteRelativeImportExtensions`). Node 22.18 exécute un `.ts` par type stripping et ne fait aucune correspondance `.js` → `.ts` : pour lui, un import en `.js` désigne un fichier absent.

Sur la v2, la règle est aussi un contrôle de build : `check:source` fait échouer `build` sur un import local sans `.js` (R-TANSTACK-11), l'arbre de routes excepté, et le générateur de routes écrit des `.js` (R-TANSTACK-06). La story renverse ces deux points et fait entrer l'arbre de routes dans le contrôle, rien d'autre de tanstack-start-migration. Le design system, lui, ne contrôle pas ses imports, et `tsc` y laisse passer `.js` comme l'absence d'extension : il reçoit son propre contrôle, dans ses specs, car un module ne dépend pas d'un script d'app.

Périmètre : `apps/robusta-build` et `packages/robusta-design-system`. `tsc` y émet du JS à trois endroits, qui doivent rester justes :

- `dist/` du design system, que robusta-build et `apps/robusta` consomment ;
- `.test-build`, où `tsc -p tsconfig.test.json` compile les specs du design system pour `node --test` ;
- `.routing-dist`, où `compile:seams` compile les seams de routing et de contenu pour les scripts `.mjs` du site.

Le retrait de `compile:seams` et de `.routing-dist` est un item séparé du ROADMAP, après cette story : le type stripping de Node refuse une partie de la syntaxe TypeScript du site, et cinq scripts lisent `.routing-dist`.

Vite et vitest compilent le reste du site sans `tsc`. Hors périmètre, et toujours en `.js` : `apps/robusta` (v1, en retrait, pas de refactoring), `apps/dakar` (`extensionAlias` de `next.config.ts`) et les autres modules de `packages/`.

Le diff touche presque tous les fichiers TS du périmètre. Il ne change aucun comportement et arrive seul dans son commit.

## Acceptance Criteria

- AC-TSIMPORTS-1 : Given les sources TypeScript du site et du design system, configs Vite, specs de `scripts/` et chemins de `vi.mock` compris, When on relit leurs imports locaux, Then chacun nomme l'extension du fichier présent, `.ts` ou `.tsx`, aucun ne finit en `.js`, et l'arbre de routes généré suit la même règle.
- AC-TSIMPORTS-2 : Given le design system buildé, ses specs compilées et les seams du site compilés, When on lit le JS émis dans `dist/`, `.test-build` et `.routing-dist`, Then aucun specifier ne désigne un `.ts` ou un `.tsx` ; les `.d.ts` de `dist/` gardent les specifiers `.ts` et `.tsx` de la source et ses deux clients, `@robusta/robusta-build` et `@robusta/build`, passent leur type-check ; les scripts `.mjs` qui importent `.routing-dist` n'ont pas changé.
- AC-TSIMPORTS-3 : Given un Clean checkout (BR-PYRAMID-5), When on lance le Green set, les tests et le lint du site et du design system, et `tsc --noEmit` sur le site, Then tout passe, et `dist/client` porte les mêmes fichiers et les mêmes pages prérendues qu'avant la story.
- AC-TSIMPORTS-4 : Given un import local écrit en `.js`, ou sans extension, sous le `src` du site ou du design system, arbre de routes généré compris, When on lance le build du site ou les tests du design system, Then ils échouent en nommant le fichier, la ligne et, quand le fichier visé existe, le specifier attendu ; le refus des directives `'use client'` et `'use server'` ne change pas.
- AC-TSIMPORTS-5 : Given le commit de la story, When on le relit, Then il ne contient que des specifiers d'import, arbre de routes régénéré compris, la configuration TypeScript et celle du générateur de routes, le contrôle des imports du site et ses specs, le spec qui contrôle les imports du design system, et aucun fichier hors périmètre ; la documentation vient au submit.
- AC-TSIMPORTS-6 : Given les cas limites, When on les rejoue, Then un `.ts` qui importe un `.tsx`, ou l'inverse, prend l'extension du fichier importé et non celle de l'importeur, et une extension fausse (`./Bar.ts` pour `Bar.tsx`) fait échouer le build ou les tests de son workspace en nommant le fichier ; un chemin de `vi.mock` en `.js` est refusé comme un import en `.js` ; un import par alias `@/…`, un re-export et un `import()` dynamique suivent la même règle, et aucun alias n'apparaît dans un fichier que `tsc` émet ; un import d'asset (`.css`, `.css?url`, `.json`) ou d'un vrai `.mjs` garde son extension ; un import de dossier comme `./url-scheme` reste refusé et nomme son `index.ts`.

## Boundaries

```
  app `@robusta/robusta-build`          app `@robusta/build`
  [modified]
            │ library                   library │
            ↓                                   │
  module `@robusta/pyramids-design-system` ←────┘
  [modified]
```

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn build:robusta` à la racine, et le build Netlify par `netlify.toml`.

- `build` — exit 1 sur un import local sous `src` écrit en `.js` ou sans extension, ou un chemin de `vi.mock` en `.js`, arbre de routes généré compris, au lieu d'un import local sans `.js`. Chaque offence nomme fichier, ligne et, quand le fichier visé existe, le specifier attendu. Ses autres refus ne changent pas.

### CLI API of module `@robusta/pyramids-design-system` — modified

Client code : `yarn workspace @robusta/pyramids-design-system run test`.

- `test` — exit 1 sur un import local sous `src` écrit en `.js`, sans extension, ou nommant un fichier absent (`./Bar.ts` pour `Bar.tsx`), en nommant fichier et ligne. Ses autres refus ne changent pas.

### library API of module `@robusta/pyramids-design-system` — modified

Client code : l'app `@robusta/robusta-build` (`moduleResolution: Bundler`) et l'app `@robusta/build` (`Node`).

- Exports et types de `dist/index.d.ts` inchangés, `dist/*.js` garde des specifiers en `.js`. Les `.d.ts` émis gardent les specifiers `.ts` et `.tsx` de la source, que les deux clients résolvent vers les `.d.ts` voisins.

## Documentation updates

- change §Imports TypeScript in `CLAUDE.md` — why : la règle devient double, vraie extension sur `apps/robusta-build` et `packages/robusta-design-system`, `.js` sur `apps/robusta`, `apps/dakar` et les autres modules ; la section reste en français et concise.
- change la règle d'import in `.cursor/rules/monorepo.mdc` — why : CLAUDE.md en tire ses conventions, même partage.
- change la phrase « Two things bite newcomers » in `README.md` — why : sa première règle, `.js` partout, devient double.
- change §Conventions in `root.archi.md` — why : elle impose `.js` partout et cite le refus de `check-source.mjs`.
- change §build in `apps/robusta-build/robusta-build.archi.md` — why : `build` refuse un import en `.js` ou sans extension, au lieu d'un import sans `.js`.
- change `check:source` et la phrase sur l'arbre de routes in `apps/robusta-build/README.md` — why : elles décrivent le suffixe `.js`.
- change §Tests in `packages/robusta-design-system/design-system.archi.md` — why : ses specs refusent désormais un import local en `.js`, sans extension ou à extension fausse.

## Dependencies

- Dep 1 : multilingual-site, sur les mêmes fichiers, landée le 2026-10-31 (commit `4fcd16f`) — levée.
