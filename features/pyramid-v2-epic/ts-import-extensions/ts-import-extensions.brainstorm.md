# Brainstorm : imports TypeScript à leur vraie extension sur la v2

**Date :** 2026-10-31
**Feature :** ts-import-extensions
**Infix :** TSIMPORTS
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Sources lues

La story et son `decisions-and-questions.md` ; R-TANSTACK-06 et R-TANSTACK-11 du design de tanstack-start-migration ; `business-rules.md`, `ubiquitous-language.md`, `root.archi.md`, `ROADMAP.md`. Code : `scripts/check-source.mjs` et son spec, `src/self-contained-packages.spec.ts`, `src/routes/-heads.spec.tsx`, `src/routeTree.gen.ts`, `vite.config.ts`, `vitest.config.ts`, les deux `tsconfig` du site, ceux du design system, son `package.json` et `package-contract.spec.tsx`, `removeExt` de `@tanstack/router-generator`.

OQ-TSIMPORTS-1 de la story est tranchée (`lgtm (boss)`) : le retrait de `compile:seams` reste hors périmètre.

## Faits vérifiés

Essais dans un projet jetable, avec le `tsc` 5.7.3 du dépôt et le Vite 8.3.2 du site.

- Avec `rewriteRelativeImportExtensions`, `tsc` réécrit `./a.ts` et `./B.tsx` en `./a.js` et `./B.js` dans le JS émis : import statique, re-export, `import()` littéral. Sous `moduleResolution` `Node`, `Bundler` et `NodeNext`, sans `allowImportingTsExtensions`.
- Il ne réécrit pas les `.d.ts` : `export { B } from './B.tsx'` et `typeof import("./a.ts")` y restent. Un client en `Node`, `Bundler` ou `NodeNext` les résout vers `B.d.ts` et `a.d.ts` sans erreur.
- `tsc` accepte un import en `.js`, qu'il résout vers le `.ts`, et une extension TS fausse : `./B.ts` résout vers `B.tsx` sans erreur.
- Vite 8 refuse `./B.ts` quand seul `B.tsx` existe (`Could not resolve './B.ts' in src/main.ts`, sans ligne). Il résout un `.js` vers le `.ts`.
- Un `import()` à specifier calculé est réécrit à l'exécution par un helper que `tsc` injecte dans le JS émis.
- `addExtensions: true` fait écrire au générateur de routes l'extension du fichier source. L'arbre actuel importe déjà `./router.tsx`, sous `addExtensions: 'js'`.
- `check-source.mjs` lit le texte ligne à ligne. Il voit les douze imports cités dans les chaînes de `self-contained-packages.spec.ts`, et ne voit pas le chemin passé à `vi.mock` dans `-heads.spec.tsx`.
- Les seams que compile `tsconfig.routing.json` et le design system n'ont aucun import par alias `@/`.
- Le design system ne contrôle pas l'extension de ses imports. Sous `moduleResolution: Node`, `tsc` y accepte aussi un import sans extension, qui ne casse qu'au chargement par `node --test`, sans ligne.

## Acceptance Criteria challenge

### Verdicts

- AC-TSIMPORTS-1 : testable, par relecture et par le contrôle. Un trou : les chemins de `vi.mock`, que le contrôle ne lit pas. L'arbre de routes suit par `addExtensions: true`.
- AC-TSIMPORTS-2 : juste pour le JS des trois sorties, faux pour les `.d.ts` de `dist/` avec `tsc` 5.7.3 (Gap-TSIMPORTS-1).
- AC-TSIMPORTS-3 : testable et suffisant. Le Green set comprend `yarn build:robusta-v1`, donc l'autre client de `dist/`. « Les mêmes pages » se mesure : 34 fichiers HTML et 53 fichiers de données sous `dist/client` (`root.archi.md`). BR-PYRAMID-5 porte la clause du Clean checkout, pas celle des pages.
- AC-TSIMPORTS-4 : testable. Côté design system, il demande un contrôle propre au module, `tsc` laissant passer `.js`. Insuffisant sur l'extension TS fausse.
- AC-TSIMPORTS-5 : testable par `git show --stat`. L'arbre régénéré et les imports cités dans les specs comptent comme specifiers ; la documentation part dans le commit du land.
- AC-TSIMPORTS-6 : testable cas par cas dans les specs du contrôle. « Nomme son `index.ts` » oblige le contrôle à regarder le disque pour écrire son message.

### Cas limites proposés à storyman

- Given un import qui nomme `./Bar.ts` alors que le fichier est `Bar.tsx`, ou l'inverse, When on lance le build du site ou les tests du design system, Then ils échouent en nommant le fichier. Vite le fait déjà pour le site. Dans le design system rien ne le refuse et `dist/` resterait juste, les deux s'émettant en `./Bar.js` : seul le lecteur est trompé, ce que la story veut supprimer.
- Given un spec du site qui mocke un module local, When on lance le build du site, Then un chemin de `vi.mock` en `.js` échoue comme un import local en `.js`.

---

## 1. Rôle du produit

Une convention d'écriture des imports locaux et le contrôle qui la tient, sur `apps/robusta-build` et `packages/robusta-design-system`. Ni un changement de comportement du site, ni l'exécution directe des `.ts` par Node (OQ-TSIMPORTS-1, item séparé).

**Décision (autonome):** une seule règle sur les deux workspaces, un import local nomme le fichier présent, refusée au build du site et aux tests du design system.

Rationale : une règle sans contrôle revient à `.js` dès qu'un agent applique celle des autres workspaces.

---

## 2. Public cible

Les développeurs du site v2, humains et surtout agents : ils écrivent la plupart des imports, appliquent CLAUDE.md à la lettre, et travaillent aussi sur `apps/robusta` et `apps/dakar`, qui gardent `.js`.

**Décision (autonome):** l'agent est le persona de référence ; l'offence nomme le specifier attendu quand le fichier visé existe.

Rationale : la règle devient double dans le dépôt, et l'erreur du build est l'endroit où l'agent la rencontre.

---

## 3. Problème

Un import en `.js` nomme un fichier absent de la source : le lecteur, l'éditeur ou l'agent qui suit le chemin ne trouve rien, Node 22.18 non plus. La règle venait d'un `tsc` qui ne réécrivait aucun specifier ; 5.7 lève cette contrainte.

**Décision (autonome):** le problème traité est la lisibilité de l'import ; l'exécution des sources sans compilation n'en fait pas partie.

Rationale : le type stripping de Node refuse une partie de la syntaxe TS du site (OQ-TSIMPORTS-1).

---

## 4. Proposition de valeur

Options considérées :

- Garder `.js` : rien à faire, l'import nomme toujours un fichier absent.
- Imports sans extension : acceptés par Vite et `Bundler`, mais le JS émis vers `.routing-dist` et `.test-build` ne charge plus sous Node.
- Vraie extension : l'éditeur, Vite, `tsc` et Node résolvent tous le specifier vers le même fichier.

**Décision (autonome):** vraie extension, comme la story.

Rationale : c'est la seule option où specifier et fichier coïncident partout.

---

## 5. Périmètre fonctionnel

Dedans :

- les imports locaux des sources TS des deux workspaces, specs, `scripts/*.spec.ts` et configs Vite comprises, chemins de `vi.mock` et imports cités dans les specs inclus ;
- l'arbre de routes généré, par `addExtensions: true` ;
- les quatre configurations `tsc` : les trois qui émettent (`dist/`, `.test-build`, `.routing-dist`) réécrivent, celle du site, en `noEmit`, accepte les extensions TS ;
- le contrôle du site et un contrôle du design system.

Dehors : `apps/robusta`, `apps/dakar` et les autres modules ; le retrait de `compile:seams` ; les chemins `.routing-dist/*.js` des scripts `.mjs` ; la plage de version de TypeScript dans les manifestes.

**Décision (autonome):** le contrôle du site cesse d'excepter l'arbre de routes généré.

Rationale : sous `addExtensions: true` l'arbre suit la règle, et un générateur qui change de comportement à une mise à jour fait alors échouer le build au lieu de passer inaperçu.

---

## 6. Fonctionnalités clés

### Feature : imports à leur vraie extension

Capability : chaque import local des deux workspaces nomme le `.ts` ou le `.tsx` présent ; un asset ou un vrai `.mjs` garde son extension.

Acceptance Criteria : AC-TSIMPORTS-1, AC-TSIMPORTS-5, AC-TSIMPORTS-6.
- Proposé à storyman : le chemin de `vi.mock` (cas limite ci-dessus).

Test Approach : les deux contrôles passent sur tout `src` ; `tsc --noEmit` sur le site ; relecture du diff, réduit aux specifiers et aux configurations.

### Feature : sortie compilée en `.js`

Capability : le JS émis vers `dist/`, `.test-build` et `.routing-dist` ne nomme que des `.js` ; les scripts `.mjs` du site chargent `.routing-dist` sans changement.

Acceptance Criteria : AC-TSIMPORTS-2, à reformuler pour les `.d.ts` (Gap-TSIMPORTS-1).

Test Approach : recherche de `.ts'` et `.tsx'` dans le JS des trois sorties après build ; type-check de `@robusta/robusta-build` et de `@robusta/build` contre le nouveau `dist/`.

### Feature : contrôle des imports

Capability : le build du site et les tests du design system échouent sur un import local en `.js`, sans extension ou visant un dossier, en nommant fichier, ligne et, quand le fichier existe, le specifier attendu.

Acceptance Criteria : AC-TSIMPORTS-4, AC-TSIMPORTS-6.
- Proposé à storyman : l'extension TS fausse (cas limite ci-dessus).

Test Approach : table de cas dans les specs des deux contrôles (relatif, alias, re-export, `import()`, multi-ligne, asset, `.mjs`, dossier, directives) ; une fois, un import en `.js` planté dans chaque workspace, pour voir échouer le vrai `build` et le vrai `test`.

### Feature : non-régression

Capability : le dépôt construit et prérend exactement ce qu'il construisait avant.

Acceptance Criteria : AC-TSIMPORTS-3.

Test Approach : Green set depuis un Clean checkout, tests et lint des deux workspaces ; liste des fichiers de `dist/client` et diff des HTML prérendus, avant et après.

---

## 7. Cas limites critiques

- Extension TS fausse : `tsc` l'accepte, Vite la refuse, le design system ne la voit pas. Proposé à storyman.
- Chemin de `vi.mock` en `.js` : Vite le résout vers le `.ts`, rien n'échoue, le contrôle ne le lit pas. Proposé à storyman.
- Imports cités dans une chaîne de spec : le contrôle textuel les lit comme des imports. Ceux de `self-contained-packages.spec.ts` passent en `.ts` avec le reste ; `escapingImports` ignore l'extension, le spec garde son sens.
- `.d.ts` du design system : ils gardent les specifiers `.ts` et `.tsx` (Gap-TSIMPORTS-1).
- `import()` à specifier calculé dans un fichier émis par `tsc` : réécrit par le helper injecté. Aucun dans les seams ni dans le design system.
- Alias `@/` dans un seam : `tsc` ne le réécrit ni avant ni après la story, et les scripts `.mjs` échouent déjà à le charger. Aucune régression.

**Décision (autonome):** les deux premiers cas sont proposés à storyman ; les autres sont des conséquences connues, sans AC.

Rationale : seuls ces deux-là laissent passer un import qui contredit AC-TSIMPORTS-1 sans que rien n'échoue.

---

## 8. Contraintes non fonctionnelles

- Aucun changement de comportement : mêmes pages, mêmes données, même JS dans `dist/`.
- Un commit isolé, que la relecture réduit à des specifiers et des configurations (AC-TSIMPORTS-5).
- Le build du site garde sa durée : le contrôle reste une lecture des sources.

**Décision (autonome):** aucune nouvelle dépendance ni étape de build.

Rationale : les deux contrôles tiennent dans un script et dans des specs qui existent déjà.

---

## 9. Dépendances externes

- TypeScript 5.7.3, fixé par le lockfile. Avant 5.7, `rewriteRelativeImportExtensions` est une option inconnue et `tsc` échoue : la plage `^5` des manifestes peut rester.
- `@tanstack/router-generator`, par `router: { addExtensions: true }` du plugin Start.
- Vite 8.3.2 et vitest 5, qui résolvent les `.ts` et `.tsx` explicites.
- Node 22.18, qui n'exécute ici que du JS émis.

**Décision (autonome):** aucune montée de version.

Rationale : les versions installées font tout ce que la story demande.

---

## 10. Risques majeurs

- Conflits : 107 fichiers touchés. multilingual-site est landée et la story est seule en cours ; le commit est mécanique et court.
- Règle double pour les agents : jusqu'au commit du land, CLAUDE.md et `root.archi.md` prescrivent `.js` partout. Le build de la v2 refuse l'ancien style, et la fenêtre tient dans la pipeline boss.
- Documentation incomplète : `root.archi.md` (§Conventions) et `robusta-build.archi.md` (§build) énoncent la règle `.js` et manquent au plan Documentation updates de la story. archiman les reprend au land, mais le plan doit les nommer.
- `.d.ts` du design system : Gap-TSIMPORTS-1.

**Décision (autonome):** aucun risque bloquant ; seul le Gap attend un arbitrage.

Rationale : les autres risques ont leur parade dans la story ou dans le land.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Nothing points into an app, no loop.

  app `@robusta/robusta-build`          app `@robusta/build`
  [modified]
            │                                   │
            │ library                   library │
            ↓                                   │
  module `@robusta/pyramids-design-system` ←────┘
  [modified]
```

**Décision (autonome):** le design system porte son propre contrôle, dans un spec à lui, à côté de `package-contract.spec.tsx` qui refuse déjà directives et imports de router ; aucun module partagé avec le site.

Rationale : un module ne dépend pas d'un script d'app, et un module pour une règle de dix lignes coûterait un manifeste et une place dans `build:deps`. Le spec n'importe pas les composants : un import cassé au chargement reste nommé par fichier et ligne.

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn build:robusta` à la racine, et le build Netlify par `netlify.toml`.

- `build` — exit 1 sur un import local sous `src` écrit en `.js` ou sans extension, et sur un chemin de `vi.mock` en `.js`, l'arbre de routes généré compris. Chaque offence sur stderr : fichier, ligne et, quand le fichier visé existe, le specifier attendu (`./url-scheme` → `./url-scheme/index.ts`). Le refus des directives ne change pas ; la ligne de succès sur stdout change de libellé.

### CLI API of module `@robusta/pyramids-design-system` — modified

Client code : `yarn workspace @robusta/pyramids-design-system run test`, et `yarn build:deps` pour `build`.

- `test` — exit 1 sur un import local sous `src` écrit en `.js`, sans extension, ou nommant un fichier absent (`./Bar.ts` pour `Bar.tsx`), en nommant fichier et ligne. Ses autres refus ne changent pas.
- `build` — `dist/*.js` garde des specifiers en `.js`.

### library API of module `@robusta/pyramids-design-system` — modified

Client code : l'app `@robusta/robusta-build` (`moduleResolution: Bundler`) et l'app `@robusta/build` (`Node`).

- Exports et types de `dist/index.d.ts` inchangés. Les `.d.ts` émis gardent les specifiers `.ts` et `.tsx` de la source, que les deux clients résolvent vers les `.d.ts` voisins (Gap-TSIMPORTS-1).

---

## Open Questions & Gaps

- Gap-TSIMPORTS-1: AC-TSIMPORTS-2 et la phrase de la story « `dist/` garde ses exports, ses types et des specifiers en `.js` » supposent que `tsc` réécrit les `.d.ts`. `tsc` 5.7.3 ne réécrit que le JS : `dist/index.d.ts` portera `export * from './primitives/index.ts'`.
- Proposition: accepter les specifiers `.ts` et `.tsx` dans les `.d.ts`. AC-TSIMPORTS-2 devient « aucun specifier du JS émis dans `dist/`, `.test-build` et `.routing-dist` ne désigne un `.ts` ou un `.tsx`, les deux clients de `dist/` passent leur type-check, et les scripts `.mjs` qui importent `.routing-dist` n'ont pas changé » ; la phrase de la story suit.
- Rationale: vérifié sous `Node` et `Bundler`, les résolutions des deux clients : un `.d.ts` qui importe `./B.tsx` se résout vers `B.d.ts`. Réécrire les `.d.ts` ajouterait une étape au build du module pour un défaut qu'aucun client ne voit ; sortir le design system du périmètre laisserait deux règles dans le code v2.
- Resolution: lgtm (Nicolas, 2026-10-31)

## Next Steps

- `storyman update ts-import-extensions avec brainstorm` : les deux cas limites, AC-TSIMPORTS-2 et la phrase sur `dist/` selon Gap-TSIMPORTS-1, `root.archi.md` et `robusta-build.archi.md` au plan Documentation updates.
- `designman` : la forme des deux contrôles (lecture textuelle, résolution sur disque pour le message et l'extension fausse), les options des quatre configurations `tsc`, le libellé des offences ; R-TANSTACK-06 et R-TANSTACK-11 renversés.
