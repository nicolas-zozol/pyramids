# Story : imports TypeScript à leur vraie extension sur la v2

**Dernière mise à jour :** 2026-10-31
**Feature :** ts-import-extensions
**Infix :** TSIMPORTS
**Status :** SUBMITTED (2026-10-31, commit 6423560)

## Story

**En tant que** développeur du site v2, humain ou agent, **je veux** écrire un import local avec l'extension du fichier qu'il désigne, `./foo.ts` ou `./Bar.tsx`, **afin de** lire dans l'import le fichier réellement présent, et non un `.js` qui n'existe qu'après compilation.

## Contexte & objectif

La règle `.js` datait d'un `tsc` qui ne réécrivait aucun specifier ; TypeScript 5.7 réécrit `.ts` et `.tsx` en `.js` dans le JS qu'il émet (`rewriteRelativeImportExtensions`). Sur `apps/robusta-build` et `packages/robusta-design-system`, un import local nomme désormais le fichier présent, et chaque workspace refuse le reste ; `apps/robusta`, `apps/dakar` et les autres modules restent en `.js`. Aucun comportement ne change.

## Livré

Commit `6423560`, seul dans son commit. 464 tests du site v2, 99 du design system, lint et `tsc --noEmit` du site, `build:deps`, `build:robusta`, `build:robusta-v1` et `build:dakar` verts, rejoués en Clean checkout. `dist/client` : 159 fichiers, 34 HTML et 53 fichiers de données, identiques à la référence d'avant la story au timestamp de prérendu près ; v1 map de 82 lignes et arbre de routes inchangés par la build. Aucun specifier `.ts`/`.tsx` ni alias dans le JS de `dist/`, `.test-build` et `.routing-dist`.

### Requirements

- R-TSIMPORTS-01 : `packages/robusta-design-system/tsconfig.json` active `rewriteRelativeImportExtensions`, dont `tsconfig.test.json` hérite ; le JS émis dans `dist/` et `.test-build` ne nomme que des `.js`.
- R-TSIMPORTS-02 : `apps/robusta-build/tsconfig.routing.json` active `rewriteRelativeImportExtensions` et reste sans `paths` ; les chemins `.routing-dist/*.js` des scripts `.mjs` ne changent pas.
- R-TSIMPORTS-03 : `apps/robusta-build/tsconfig.json`, en `noEmit`, active `allowImportingTsExtensions`.
- R-TSIMPORTS-04 : `vite.config.ts` passe `router: { addExtensions: true }` au plugin Start ; `src/routeTree.gen.ts`, régénéré, importe chaque fichier de route par son `.tsx`. Renverse la clause `.js` de R-TANSTACK-06 ; `@/*` par `resolve.tsconfigPaths` reste.
- R-TSIMPORTS-21 : sous `src` des deux workspaces, chaque specifier local, relatif ou `@/`, d'un import, d'un re-export, d'un `import()` ou d'un `typeof import()` littéral, ou d'un chemin de `vi.mock`, nomme l'extension du fichier importé, et un import de dossier son `index.ts`. Un asset (`.css`, `.css?url`, `.json`, image, police) et un vrai `.mjs` gardent leur extension. Les configs Vite et `scripts/*.spec.ts` n'importent que de vrais `.mjs` : rien à y réécrire.
- R-TSIMPORTS-22 : les imports cités en chaîne dans `src/self-contained-packages.spec.ts` passent en `.ts`, comme le code qu'ils imitent. Aucun contrôle ne les lit (R-TSIMPORTS-41) ; `escapingImports` ignore l'extension et garde son sens.
- R-TSIMPORTS-41 : `scripts/check-source.mjs` lit les specifiers dans l'arbre syntaxique de `typescript` : déclarations d'import et d'export, `import()` et `typeof import()` à littéral, premier argument littéral de `vi.mock`, `vi.doMock`, `vi.importActual` et `vi.importMock`. Une chaîne, un commentaire ou un `new URL(…, import.meta.url)` n'est pas un import. Le refus des directives garde sa lecture par ligne.
- R-TSIMPORTS-42 : un specifier local est accepté si, query retirée, il finit par une extension d'asset ou par `.mjs`, ou s'il nomme exactement, casse comprise, un `.ts` ou un `.tsx` des sources lues ; sinon c'est une offence. L'arbre de routes n'est plus excepté. Renverse R-TANSTACK-11 pour les imports ; l'en-tête de `check-source.mjs` cite ce design et R-TSIMPORTS-41 à 43.
- R-TSIMPORTS-43 : le specifier attendu est le premier candidat présent parmi les sources lues : le chemin privé de son extension `.js`, `.ts` ou `.tsx`, complété en `.ts` puis `.tsx`, puis le chemin tel quel suivi de `/index.ts` puis `/index.tsx`. Sans candidat, l'offence n'en nomme aucun.
- R-TSIMPORTS-61 : `src/import-specifiers.spec.ts` lit les sources par `moduleSources()` et n'importe aucun composant : il nomme un import cassé même quand celui-ci empêche les autres specs de charger.
- R-TSIMPORTS-62 : il applique la lecture et la règle de R-TSIMPORTS-41 à 43 aux specifiers relatifs, le module n'ayant pas d'alias, dans son propre code : un module ne dépend pas d'un script d'app.

### Acceptance Criteria

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

- `build` — `check:source` (`scripts/check-source.mjs`) sort en 1 sur un import local sous `src` écrit en `.js`, sans extension ou à extension fausse, ou un chemin de `vi.mock` en `.js`, arbre de routes généré compris. Chaque offence s'écrit `<path>:<line> local import '<specifier>' names no source file, expected '<expected>'`, sans `expected` quand aucun fichier ne correspond. Ses autres refus ne changent pas.

### CLI API of module `@robusta/pyramids-design-system` — modified

Client code : `yarn workspace @robusta/pyramids-design-system run test`.

- `test` — sort en 1 quand `src/import-specifiers.spec.ts` trouve un import local sous `src` écrit en `.js`, sans extension, ou nommant un fichier absent (`./Bar.ts` pour `Bar.tsx`), avec fichier et ligne. Ses autres refus ne changent pas.

### library API of module `@robusta/pyramids-design-system` — modified

Client code : l'app `@robusta/robusta-build` (`moduleResolution: Bundler`) et l'app `@robusta/build` (`Node`).

- Exports et types de `dist/index.d.ts` inchangés ; `dist/**/*.js` ne nomme que des `.js`. Les `.d.ts` émis gardent les specifiers `.ts` et `.tsx` de la source, que les deux clients résolvent vers les `.d.ts` voisins.

## Décisions

- 2026-10-31 — Les `.d.ts` de `dist/` gardent les specifiers `.ts` et `.tsx` de la source, sans réécriture. Pourquoi : `tsc` 5.7.3 ne réécrit que le JS, et les deux clients résolvent `./B.tsx` vers `B.d.ts` (Gap-TSIMPORTS-1, lgtm de Nicolas).
- 2026-10-31 — Le retrait de `compile:seams` et de `.routing-dist` est un item séparé, drop-compile-seams. Pourquoi : le type stripping de Node refuse une partie de la syntaxe TypeScript du site, et le commit devait rester sans changement de comportement (OQ-TSIMPORTS-1, lgtm de boss).
- 2026-10-31 — L'arbre de routes entre dans le contrôle, et le générateur écrit `.tsx` (`addExtensions: true`). Renverse la clause `.js` de R-TANSTACK-06 et R-TANSTACK-11 ; le design archivé de tanstack-start-migration n'est pas modifié.
- 2026-10-31 — `check-source.mjs` lit les specifiers dans l'arbre syntaxique de `typescript`, et refuse aussi une extension fausse. Pourquoi : un import sur plusieurs lignes, un `vi.mock` ou un `import()` échappaient à une lecture par ligne.
- 2026-10-31 — Le design system porte son propre contrôle, `src/import-specifiers.spec.ts`. Pourquoi : un module ne dépend pas d'un script d'app.
- 2026-10-31 — Le script `lint` du design system sort en 127, eslint absent de ses devDependencies, avant comme après la story : non corrigé, relevé en design-system-lint.

## Documentation updates

- changed §Imports TypeScript in `CLAUDE.md` : vraie extension sur `apps/robusta-build` et `packages/robusta-design-system`, `.js` sur `apps/robusta`, `apps/dakar` et les autres modules.
- changed la règle d'import in `.cursor/rules/monorepo.mdc`, même partage ; le fichier élagué au passage (stack, `packages/imagine` disparu).
- changed la phrase « Two things bite newcomers » in `README.md`.
- changed §Notes / Gotchas in `root.archi.md` : deux règles d'import, et le contrôle de chaque workspace.
- changed §CLI API `build` et §Dependencies in `apps/robusta-build/robusta-build.archi.md` : refus d'un import qui ne nomme pas son `.ts` ou `.tsx`, `typescript` lu par `check-source.mjs`.
- changed l'arbre de routes et `check:source` in `apps/robusta-build/README.md`.
- changed §Build et §Tests in `packages/robusta-design-system/design-system.archi.md` : règle d'import, 99 tests dans douze specs, `src/import-specifiers.spec.ts`.

## Dependencies

- Dep 1 : multilingual-site, landée le 2026-10-31 (commit `4fcd16f`) — levée.
