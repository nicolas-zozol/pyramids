# Design: imports TypeScript à leur vraie extension sur la v2

**Last update:** 2026-10-31
**Feature:** ts-import-extensions
**Infix:** TSIMPORTS
**Status:** APPROVED (2026-10-31 — validated by boss)
**Sources:** [story](ts-import-extensions.story.md), [brainstorm](ts-import-extensions.brainstorm.md), [epic](../pyramid-v2.epic.md), [tanstack-start-migration](../__done/tanstack-start-migration/tanstack-start-migration.design.md)

## Goal

Les imports locaux de `apps/robusta-build` et `packages/robusta-design-system` nomment le `.ts` ou le `.tsx` présent ; les trois configurations `tsc` qui émettent réécrivent ces specifiers en `.js`, celle du site en `noEmit` les accepte, et le générateur de routes écrit l'extension du fichier de route. Le build du site et les tests du design system refusent tout specifier local qui ne nomme pas un fichier présent. Le design renverse la clause `.js` de R-TANSTACK-06 et R-TANSTACK-11 ; le design archivé de tanstack-start-migration n'est pas modifié. Le pourquoi : [story](ts-import-extensions.story.md).

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

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn build:robusta` à la racine, et le build Netlify par `netlify.toml`. `build` lance `check:source` (`node scripts/check-source.mjs`) en premier, avant `compile:seams`.

- exit 0 — stdout `source: no directive, every local import names its file`.
- exit 1 — stderr : l'en-tête `The source breaks the site’s import and directive rules:`, inchangé, puis une ligne par offence, `  <path>:<line> <reason>`, `<path>` depuis la racine de l'app, `<line>` celle du specifier.

Les `reason` :

```
'use client' directive                                            unchanged
'use server' directive                                            unchanged
local import '<specifier>' names no source file, expected '<expected>'
local import '<specifier>' names no source file                   no candidate found
```

Exemple :

```
  src/routes/-heads.spec.tsx:16 local import '../page-data/index.js' names no source file, expected '../page-data/index.ts'
  src/a/Foo.tsx:4 local import './Bar.ts' names no source file, expected './Bar.tsx'
  src/a/b.ts:2 local import '../routing/url-scheme' names no source file, expected '../routing/url-scheme/index.ts'
```

### library API of package `scripts` in app `@robusta/robusta-build` — modified

Client code : `scripts/check-source.spec.ts`.

```ts
type SourceFile = { path: string; text: string }; // unchanged, path from the app root
type Offence = { path: string; line: number; reason: string }; // unchanged

/** offences of the sources; every local specifier resolves among `files` alone, never on disk */
function sourceOffences(files: SourceFile[]): Offence[];
```

Garanties :

- Signature inchangée, sens élargi : `files` est l'univers de résolution. `main` lui passe chaque `.ts` et `.tsx` de `src`, l'arbre de routes compris ; un spec qui teste un import `.ts` accepté passe aussi le fichier visé.
- `@/x` se résout en `src/x`, un specifier relatif depuis le dossier de l'importeur.
- Fonction pure : aucune lecture disque, la résolution et le specifier attendu viennent de `files`.

```ts
import { sourceOffences } from './check-source.mjs';

const offences = sourceOffences([
  { path: 'src/a.ts', text: "import { b } from './b.js';" },
  { path: 'src/b.ts', text: 'export const b = 1;' },
]);
// [{ path: 'src/a.ts', line: 1,
//    reason: "local import './b.js' names no source file, expected './b.ts'" }]
```

### CLI API of module `@robusta/pyramids-design-system` — modified

Client code : `yarn workspace @robusta/pyramids-design-system run test`.

- `test` — exit 1 quand `src/import-specifiers.spec.ts` échoue ; son message d'assertion liste `src/<path>:<line> <reason>`, même grammaire de `reason` que le site. Ses autres refus ne changent pas.

### library API of package `test-support` in module `@robusta/pyramids-design-system` — modified

Client code : `src/import-specifiers.spec.ts`.

```ts
/** every `.ts` and `.tsx` of `src`, specs and test support included, keyed by path from `src` */
function moduleSources(): Record<string, string>;
```

`componentSources()` ne change pas : il exclut specs et test support, que `tsc -p tsconfig.test.json` compile et que `node --test` charge.

### library API of module `@robusta/pyramids-design-system` — modified

Client code : l'app `@robusta/robusta-build` (`moduleResolution: Bundler`) et l'app `@robusta/build` (`Node`).

- Exports et types de `dist/index.d.ts` inchangés ; `dist/**/*.js` ne nomme que des `.js`.
- Les `.d.ts` de `dist/` gardent les specifiers `.ts` et `.tsx` de la source (`export * from './primitives/index.ts'`), que les deux clients résolvent vers le `.d.ts` voisin.

## Technical Constraints

- TypeScript 5.7.3, fixé par le lockfile ; les manifestes gardent `^5`. `rewriteRelativeImportExtensions` (5.7+) ne réécrit que le JS émis et que les specifiers relatifs. Un `.ts` par alias dans un fichier émis est une erreur (TS2877), et sans `paths` un alias ne résout pas (TS2307) : aucun alias n'atteint `dist/`, `.test-build` ni `.routing-dist`.
- `allowImportingTsExtensions` exige `noEmit` ou `emitDeclarationOnly` : il ne va que dans `apps/robusta-build/tsconfig.json`. Les trois configurations qui émettent prennent `rewriteRelativeImportExtensions`, qui s'en passe.
- Aucune configuration `tsc` ne contrôle la règle : toutes acceptent un import en `.js` et une extension TS fausse (`./B.ts` résout `B.tsx`), et sous `Node` un import sans extension. Les deux contrôles portent la règle.
- Vite 8.3.2 et vitest 5 résolvent un `.ts` ou un `.tsx` explicite, chemins de `vi.mock` compris ; Vite refuse une extension fausse sans nommer la ligne.
- `@tanstack/router-generator` 1.167.40 : `addExtensions: true` garde tel quel le chemin du fichier de route (`removeExt`). `dev` et `build` régénèrent l'arbre.
- `check-source.mjs` tourne en Node pur avant `compile:seams` : il n'importe que `node:*` et `typescript` (CJS, import par défaut), déjà en devDependency du site et du design system. L'analyse syntaxique des 99 sources de `src` prend environ 0,1 s.
- Node 22.18 n'exécute ici que du JS émis : `.routing-dist` par les scripts `.mjs`, `.test-build` par `node --test`.

## Requirements

### Configurations TypeScript et générateur de routes

- R-TSIMPORTS-01 : `packages/robusta-design-system/tsconfig.json` active `rewriteRelativeImportExtensions`, dont `tsconfig.test.json` hérite ; le JS émis dans `dist/` et `.test-build` ne nomme que des `.js`.
- R-TSIMPORTS-02 : `apps/robusta-build/tsconfig.routing.json` active `rewriteRelativeImportExtensions` et reste sans `paths` ; les chemins `.routing-dist/*.js` des scripts `.mjs` ne changent pas.
- R-TSIMPORTS-03 : `apps/robusta-build/tsconfig.json`, en `noEmit`, active `allowImportingTsExtensions`.
- R-TSIMPORTS-04 : `vite.config.ts` passe `router: { addExtensions: true }` au plugin Start ; `src/routeTree.gen.ts`, régénéré, importe chaque fichier de route par son `.tsx`. Renverse la clause `.js` de R-TANSTACK-06 ; `@/*` par `resolve.tsconfigPaths` reste.

### Specifiers

- R-TSIMPORTS-21 : sous `src` des deux workspaces, chaque specifier local, relatif ou `@/`, d'un import, d'un re-export, d'un `import()` ou d'un `typeof import()` littéral, ou d'un chemin de `vi.mock`, nomme l'extension du fichier importé, et un import de dossier son `index.ts`. Un asset (`.css`, `.css?url`, `.json`, image, police) et un vrai `.mjs` gardent leur extension. Les configs Vite et `scripts/*.spec.ts` n'importent que de vrais `.mjs` : rien à y réécrire.
- R-TSIMPORTS-22 : les imports cités en chaîne dans `src/self-contained-packages.spec.ts` passent en `.ts`, comme le code qu'ils imitent. Aucun contrôle ne les lit (R-TSIMPORTS-41) ; `escapingImports` ignore l'extension et garde son sens.

### Contrôle du site

- R-TSIMPORTS-41 : `scripts/check-source.mjs` lit les specifiers dans l'arbre syntaxique de `typescript` : déclarations d'import et d'export, `import()` et `typeof import()` à littéral, premier argument littéral de `vi.mock`, `vi.doMock`, `vi.importActual` et `vi.importMock`. Une chaîne, un commentaire ou un `new URL(…, import.meta.url)` n'est pas un import. Le refus des directives garde sa lecture par ligne.
- R-TSIMPORTS-42 : un specifier local est accepté si, query retirée, il finit par une extension d'asset ou par `.mjs`, ou s'il nomme exactement, casse comprise, un `.ts` ou un `.tsx` des sources lues ; sinon c'est une offence. L'arbre de routes n'est plus excepté. Renverse R-TANSTACK-11 pour les imports ; l'en-tête de `check-source.mjs` cite ce design et R-TSIMPORTS-41 à 43.
- R-TSIMPORTS-43 : le specifier attendu est le premier candidat présent parmi les sources lues : le chemin privé de son extension `.js`, `.ts` ou `.tsx`, complété en `.ts` puis `.tsx`, puis le chemin tel quel suivi de `/index.ts` puis `/index.tsx`. Sans candidat, l'offence n'en nomme aucun.

### Contrôle du design system

- R-TSIMPORTS-61 : `src/import-specifiers.spec.ts` lit les sources par `moduleSources()` et n'importe aucun composant : il nomme un import cassé même quand celui-ci empêche les autres specs de charger.
- R-TSIMPORTS-62 : il applique la lecture et la règle de R-TSIMPORTS-41 à 43 aux specifiers relatifs, le module n'ayant pas d'alias, dans son propre code : un module ne dépend pas d'un script d'app.

## Acceptance Criteria

- AC-TSIMPORTS-1 : Given les sources TypeScript du site et du design system, configs Vite, specs de `scripts/` et chemins de `vi.mock` compris, When on relit leurs imports locaux, Then chacun nomme l'extension du fichier présent, `.ts` ou `.tsx`, aucun ne finit en `.js`, et l'arbre de routes généré suit la même règle.
- AC-TSIMPORTS-2 : Given le design system buildé, ses specs compilées et les seams du site compilés, When on lit le JS émis dans `dist/`, `.test-build` et `.routing-dist`, Then aucun specifier ne désigne un `.ts` ou un `.tsx` ; les `.d.ts` de `dist/` gardent les specifiers `.ts` et `.tsx` de la source et ses deux clients, `@robusta/robusta-build` et `@robusta/build`, passent leur type-check ; les scripts `.mjs` qui importent `.routing-dist` n'ont pas changé.
- AC-TSIMPORTS-3 : Given un Clean checkout (BR-PYRAMID-5), When on lance le Green set, les tests et le lint du site et du design system, et `tsc --noEmit` sur le site, Then tout passe, et `dist/client` porte les mêmes fichiers et les mêmes pages prérendues qu'avant la story.
- AC-TSIMPORTS-4 : Given un import local écrit en `.js`, ou sans extension, sous le `src` du site ou du design system, arbre de routes généré compris, When on lance le build du site ou les tests du design system, Then ils échouent en nommant le fichier, la ligne et, quand le fichier visé existe, le specifier attendu ; le refus des directives `'use client'` et `'use server'` ne change pas.
- AC-TSIMPORTS-5 : Given le commit de la story, When on le relit, Then il ne contient que des specifiers d'import, arbre de routes régénéré compris, la configuration TypeScript et celle du générateur de routes, le contrôle des imports du site et ses specs, le spec qui contrôle les imports du design system, et aucun fichier hors périmètre ; la documentation vient au submit.
- AC-TSIMPORTS-6 : Given les cas limites, When on les rejoue, Then un `.ts` qui importe un `.tsx`, ou l'inverse, prend l'extension du fichier importé et non celle de l'importeur, et une extension fausse (`./Bar.ts` pour `Bar.tsx`) fait échouer le build ou les tests de son workspace en nommant le fichier ; un chemin de `vi.mock` en `.js` est refusé comme un import en `.js` ; un import par alias `@/…`, un re-export et un `import()` dynamique suivent la même règle, et aucun alias n'apparaît dans un fichier que `tsc` émet ; un import d'asset (`.css`, `.css?url`, `.json`) ou d'un vrai `.mjs` garde son extension ; un import de dossier comme `./url-scheme` reste refusé et nomme son `index.ts`.

Référence d'AC-TSIMPORTS-3, relevée avant la story : 34 fichiers HTML sous `dist/client` (3 landing pages, 30 URL de contenu, `404.html`), 53 fichiers de données, une v1 map de 82 lignes ; 455 tests du site, 87 du design system. Pour AC-TSIMPORTS-5, `moduleSources()` compte avec le spec du design system.

Edge cases to test :

- un `.ts` qui importe un `.tsx` prend `.tsx`, et l'inverse ;
- `./Bar.ts` pour `Bar.tsx` est refusé avec `expected './Bar.tsx'`, sur le site comme dans le design system ;
- un chemin de `vi.mock` ou un `typeof import()` en `.js` est refusé comme un import ;
- un alias `@/…`, un re-export et un `import()` littéral suivent la même règle ;
- `.css`, `.css?url`, `.json` et un vrai `.mjs` passent tels quels ;
- `./url-scheme` est refusé avec `expected './url-scheme/index.ts'` ;
- un import cité dans une chaîne ou un commentaire n'est pas lu ;
- un import sur plusieurs lignes est nommé à la ligne de son specifier ;
- un arbre de routes en `.js` fait échouer `check:source` ;
- dans le design system, un import sans extension d'un composant fait échouer `package-contract.spec.tsx` au chargement, et `import-specifiers.spec.ts` le nomme par fichier et ligne.

## Dependencies

- Depends on : multilingual-site, landée le 2026-10-31 (commit `4fcd16f`).
- Blocks : drop-compile-seams (`ROADMAP.md`), qui ferait charger les seams `.ts` par les scripts `.mjs`.
