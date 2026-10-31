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
