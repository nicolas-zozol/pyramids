# Questions et décisions : ts-import-extensions

**Date :** 2026-10-31
**Branche :** epic/robusta-v2
**Requête :** `lfg boss ts-import-extensions` — pipeline complet jusqu'au submit (`storyman land`), un commit par étape, jamais de push.

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche attendue pour une story de l'epic pyramid-v2. Working tree propre, HEAD `4fcd16f`.
- État : story ACTIVE, ni brainstorm ni design → départ en Phase 4 (brainstorm).

## D1 : OQ-TSIMPORTS-1, retrait de `compile:seams`

- Phase : story
- Tri : non pertinente pour cette story, tranchée par boss à la demande de Nicolas.
- Choix : `lgtm (boss)` sur la Proposition. Le retrait de `compile:seams` et de `.routing-dist` est un item séparé du ROADMAP, après celle-ci. Le garder ici casserait AC-TSIMPORTS-5 (commit sans changement de comportement) et le type stripping de Node refuse une partie de la syntaxe TS du site.

## D2 : brainstorm, tri des entrées

- Phase : brainstorm (`ts-import-extensions.brainstorm.md`)
- Gap-TSIMPORTS-1 (les `.d.ts` de `dist/` gardent `./B.tsx`, `tsc` 5.7.3 ne réécrit que le JS ; vérifié aussi par boss sur un projet jouet) : pertinente. Elle change le texte de la library API du design system, contredit la Boundary de la story, AC-TSIMPORTS-2 et la vérification « aucun `.ts`/`.tsx` dans les `.d.ts` émis » de la requête. Resolution laissée vide.
- Choix : la suite assume la Proposition (specifiers `.ts`/`.tsx` acceptés dans les `.d.ts`, les deux clients de `dist/` passent leur type-check). L'alternative, une réécriture des `.d.ts` après `tsc` dans le build du module, reste ouverte pour Nicolas ; elle s'ajoute sans défaire le reste.
- Décisions affirmées par bsman et acceptées sans entrée : le route tree généré n'est plus exempté du contrôle (`addExtensions: true`), le design system porte son propre contrôle dans une spec, aucun bump de version, `root.archi.md` et `robusta-build.archi.md` ajoutés au plan de documentation.
- Cas limites retenus : extension TS fausse (`./Bar.ts` pour `Bar.tsx`) refusée, chemin `vi.mock` en `.js` refusé.

## D3 : item ROADMAP drop-compile-seams

- Phase : story
- Constat : OQ-TSIMPORTS-1 tranchée en item séparé, aucun item n'existait.
- Choix : boss ajoute `drop-compile-seams` aux Loose ends de `ROADMAP.md`, pas à Next : c'est une dette technique, sans effet visible, qui ne doit pas passer devant blog-rolls.

## D4 : design, approbation

- Phase : design (`ts-import-extensions.design.md`)
- Tri : aucune entrée ouverte par designman. Gap-TSIMPORTS-1 reste ouvert dans le brainstorm, assumé par le design.
- Décisions de designman acceptées sans entrée : `check-source.mjs` lit les specifiers dans l'arbre syntaxique de `typescript` (déjà requis au build par `compile:seams`), plus par regex ; une extension fausse est refusée par le site ; `vi.mock` et voisins sont lus ; le design system porte son propre contrôle, `src/import-specifiers.spec.ts`.
- Choix : DRAFT → APPROVED, `validated by boss`.

## D5 : Gap-TSIMPORTS-1, réponse de Nicolas

- Phase : reprise en Phase 6
- Réponse : `lgtm (Nicolas, 2026-10-31)`, inscrite dans le brainstorm. Les `.d.ts` de `dist/` gardent leurs specifiers `.ts`/`.tsx`.
- Suite : story (AC-TSIMPORTS-2, Boundary) et design (library API) affirment déjà la Proposition. Aucun `storyman update` ni `designman update`.

## D6 : commit du refactoring

- Phase : implémentation
- Relecture : 115 fichiers. 104 ne changent que des specifiers (vérifié par normalisation `.ts`/`.tsx` → `.js` contre HEAD). Les autres : `check-source.mjs` et son spec, l'arbre de routes régénéré, les specifiers cités de `self-contained-packages.spec.ts`, les trois `tsconfig`, `vite.config.ts`, `moduleSources()` et `import-specifiers.spec.ts` du design system. Rien hors périmètre.
- `verify.sh` vert : build:deps, build:robusta (34 HTML), build:robusta-v1, build:dakar, 464 tests du site, 99 du design system, lint du site, `tsc --noEmit`.
- JS émis : 0 specifier `.ts`/`.tsx` ni alias dans `dist/` (18 js), `.test-build` (32) et `.routing-dist` (45). Identique aux références après normalisation des guillemets, sauf `test-support/package-files.js` (`moduleSources()` ajouté). `dist/client` : 159 fichiers, identiques aux références au timestamp `u:` du prérendu près.
- Choix : le bloc Progress et les fichiers Compound restent hors du commit (AC-TSIMPORTS-5) ; le land retire le bloc.
- Commit : `6423560`.

## D7 : Clean checkout (AC-TSIMPORTS-3)

- Worktree détaché dans le scratchpad au commit `6423560`, aucun `node_modules` ni `dist` dans son ascendance, retiré ensuite ; la branche n'a pas bougé.
- `yarn install` à neuf, puis build:deps, build:dakar, build:robusta-v1, build:robusta : verts. 464 tests du site, 99 du design system, lint du site, `tsc --noEmit` : verts. `dist/client` : 159 fichiers, 34 HTML, 53 fichiers de données, identiques aux références au timestamp près. Aucun fichier suivi modifié par la build (v1 map et arbre de routes inchangés).
- Le `lint` du design system sort en 127 (`command not found: eslint`) : défaut antérieur à la story, eslint absent de ses devDependencies. Hors périmètre, non corrigé : Loose end au land.
- Choix : AC-TSIMPORTS-3 tenu, à cette exception connue près. Bloc Progress à 100 %.

## D8 : land (`storyman submit`)

- Les cinq étapes sont faites. `land` est l'alias de `submit` : la story passe en SUBMITTED, pas LANDED (grammaire actuelle de storyman, LANDED se lit SUBMITTED).
- docman : CLAUDE.md, `.cursor/rules/monorepo.mdc`, README.md, `apps/robusta-build/README.md`. Il a aussi élagué de monorepo.mdc la stack périmée et le paragraphe sur `packages/imagine`, qui n'existe plus : accepté.
- archiman : les trois `*.archi.md` et l'en-tête de `packages/robusta-design-system/src/index.ts` (commentaire seul ; 99 tests du design system rejoués, verts).
- epicman : puce dans Fait, décision du 2026-10-31 qui renverse la clause `.js` de R-TANSTACK-06 et R-TANSTACK-11, phrase `dist/` corrigée, À faire 9 drop-compile-seams (débloqué) et 10 design-system-lint, Loose end design-system-lint au ROADMAP.
- Laissé tel quel : « Landed » dans la liste des stories de l'epic, comme ses voisines ; Gap-TSIMPORTS-1 reste dans le brainstorm avec sa Resolution remplie, à la demande de Nicolas.
- Écarts d'archiman check non traités (en-têtes de code, hors périmètre du land) : R-TSIMPORTS-04 absent de l'en-tête de `src/router.tsx`, R-TSIMPORTS-21 cité côté design system seulement, `check:source` absent du bloc CLI de `robusta-build.archi.md`, en-tête de `test-support/package-files.ts` sans `moduleSources()`.
- Commit : `docs(pyramid-v2): land ts-import-extensions`, message court plutôt que celui, trop long, proposé par storyman.
