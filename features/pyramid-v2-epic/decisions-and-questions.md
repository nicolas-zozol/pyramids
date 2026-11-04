# Questions et décisions : pyramid-v2, batch B1

**Date :** 2026-11-04
**Branche :** epic/robusta-v2
**Requête :** `boss prepare pyramid-v2-epic batch B1` — chaque story de B1 jusqu'au design approuvé par boss, sans code. Mode rloq : une entrée `ask` reste à Nicolas.

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche de l'epic pyramid-v2 nommée dans la requête et portant ses runs précédents. HEAD `a859736`, arbre propre.
- Batch B1, sous le lock : aucun batch au-dessus. prepare : aucun code.
- État lu :
  - blog-rolls : story ACTIVE, brainstorm présent, design DRAFT → fold des réponses (story et brainstorm), puis Phase 5 depuis le fold.
  - glossary-refresh : story ACTIVE, ni brainstorm ni design → fold des réponses, puis Phase 4.
  - drop-section-default-copy : story ACTIVE, design DRAFT, pas de brainstorm → fold des réponses, puis Phase 5 depuis le fold.
- Réponses à intégrer : toutes les entrées `ask` du batch ont une Resolution de Nicolas, recopiée par `bulkman resolve`. default-locale-at-root livrée (`83e6cef`, BR-PYRAMID-14) change les adresses de glossary-refresh et de blog-rolls.

## D1 : stories, fold des réponses

- Phase : story (commit `426b679`)
- blog-rolls (`storyman update avec brainstorm`) : OQ-BLOGROLLS-1 et 2, Gap-BLOGROLLS-3 à 5 intégrés ; adresses `en` sans préfixe (`/articles…`, `/en/articles…` en 301) ; Dep 1 ferme, drop-section-default-copy avant blog-rolls. Aucune entrée nouvelle.
- glossary-refresh : Gap-GLOSSARY-1 et 2, OQ-GLOSSARY-3 intégrés ; AC-GLOSSARY-1, 2 et 7 réécrits pour la Locale par défaut sans marqueur ; exemple de Gap-GLOSSARY-1 inversé (`/en` vers `/`). La BR des stale translations reste une suite de la story, pour epicman après livraison. Aucune entrée nouvelle.
- drop-section-default-copy : OQ-SECTIONCOPY-1 et 2 intégrés ; AC-SECTIONCOPY-3 aligné sur Gap-SECTIONCOPY-3 du design (absente, `null` ou `''` : pas d'élément) ; AC-SECTIONCOPY-5 ne parle plus d'une Section de blog-rolls. Aucune entrée nouvelle.
- Commit cité par les stories pour default-locale-at-root : `2fbc7be` (implémentation), `83e6cef` étant son submit. Laissé tel quel.

## D2 : designs de drop-section-default-copy et blog-rolls, approbation

- Phase : design
- drop-section-default-copy : `designman update` plie Gap-SECTIONCOPY-3 (Nicolas) et OQ-SECTIONCOPY-4 (`lgtm (designman)`), aligne les AC réécrits et les Dependencies (blog-rolls après, sans nouvelle Section). Aucun contrat changé, aucune entrée nouvelle.
- blog-rolls : `designman update` plie OQ-BLOGROLLS-7 (`lgtm (designman)`, package `src/listing`), cite les décisions de la story, passe les adresses `en` sans préfixe (routes `/{-$locale}/articles…`, vérifiées sur `apps/robusta-build/src/routing`). Aucune signature changée, aucune entrée nouvelle.
- Contrôle boss : chaque AC des deux stories cité mot pour mot, `## Boundaries` rempli, aucune entrée `ask` en attente dans story, brainstorm ou design → APPROVED (validated by boss).

## D3 : brainstorm de glossary-refresh, tri des entrées

- Phase : brainstorm (`glossary-refresh.brainstorm.md`)
- Gap-GLOSSARY-4 (`Workspace` et `Green set` hors de la story, contredisent `Module`) : `ask`, il change ce que la story livre et le « mot pour mot » d'AC-GLOSSARY-7. Resolution vide ; les agents suivants supposent la Proposition.
- Gap-GLOSSARY-5 (`Build chain` contre la lecture des CSS et assets du design system par robusta.build) : `ask`, contradiction entre un document et le code, jamais tranchée en faveur du code. Resolution vide ; Proposition supposée.
- Conséquence rloq : glossary-refresh va jusqu'à son design DRAFT et s'y arrête.

## D4 : design de glossary-refresh, laissé DRAFT

- Phase : design (`glossary-refresh.design.md`)
- OQ-GLOSSARY-6 (exemple `/en/articles/c/theory` dans l'entrée `Canonical URL`, ou la règle seule) : `decide`, signée `lgtm (designman)`, sans contradiction avec AC-GLOSSARY-2 ; pliée par `designman update`.
- Contrôle : AC-GLOSSARY-1 à 7 cités mot pour mot, `## Boundaries` rempli.
- Statut : DRAFT, Gap-GLOSSARY-4 et 5 du brainstorm restant `ask` pour Nicolas (rloq). Une réponse, puis `boss prepare pyramid-v2-epic batch B1` : `storyman update glossary-refresh avec brainstorm`, `designman update`, approbation.

---

# Run 2 : `boss pyramid-v2-epic batch B1`

**Date :** 2026-11-04
**Requête :** `boss pyramid-v2-epic batch B1` — chaque story de B1 codée et soumise, une après l'autre : drop-section-default-copy, blog-rolls, glossary-refresh. Mode rloq.

## D5 : branche, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche attendue. HEAD `7b3b62d`, arbre propre. B1 est le premier batch : le lock le laisse passer.
- État lu :
  - drop-section-default-copy : design APPROVED, aucune entrée en attente → Phase 6.
  - blog-rolls : design APPROVED, aucune entrée en attente → Phase 6, après drop-section-default-copy (Dep 1).
  - glossary-refresh : design DRAFT, Gap-GLOSSARY-4 et 5 répondus `lgtm (Nicolas, 2026-11-04)` dans le brainstorm → `storyman update avec brainstorm`, `designman update`, Phase 5.
- Parallèle : les documents de glossary-refresh avancent pendant l'implémentation de drop-section-default-copy ; fichiers disjoints, le code reste linéaire.

## D6 : glossary-refresh, fold et approbation

- Phase : story et design
- `storyman update avec brainstorm` : Gap-GLOSSARY-4 et 5 (Nicolas) pliés ; seule la phrase du Contexte change, aucun AC réécrit ; entrées retirées du brainstorm. Aucune entrée nouvelle.
- `designman update` : la ligne du Goal qui disait les Propositions en attente cite leur retenue ; aucun contrat changé, aucune entrée nouvelle.
- Contrôle boss : AC-GLOSSARY-1 à 7 cités mot pour mot, `## Boundaries` rempli, aucune entrée `ask` en attente → APPROVED (validated by boss).

## D7 : drop-section-default-copy, implémentée et soumise

- Phase : code et submit
- tddman : commit `3b16c72`. Tests du design system 209/209, `yarn build:deps` vert, tests de robusta-build 490/490, lint et `yarn build:robusta` verts, `tsc --noEmit` de `apps/robusta` vert. Pages prérendues avant/après : même texte lisible sur les 34 documents, seul le `<div>` vide de la ligne de version quitte le pied de page (AC-SECTIONCOPY-4).
- Décisions de tddman, sans effet sur la direction : le second rendu d'une section sans liste passe chaque prop de texte à `''` ; la `readableTexts` du site lit aussi `placeholder`, `aria-label` et `title`.
- submit : commit `2662cc4`, design IMPLEMENTED, story SUBMITTED, item retiré du ROADMAP, epicman update (nouvel item B4 surface-identifiers).

## D8 : blog-rolls, implémentée

- Phase : code (commit `bc568f7`). tddman interrompu par la limite d'API, repris sur le même arbre.
- Checker : tests de robusta-build 552/552, lint, `tsc --noEmit` et `yarn build:robusta` verts (33 pages, 69 fichiers de données dont 13 roll pages et 3 locale rolls). AC-BLOGROLLS-3 prouvé sur fixture ; les 404 lus dans `dist` (fichiers absents), sans draft deploy, l'hébergeur ne changeant pas.
- Décisions de tddman, sans effet sur la direction : un roll vide ne rend que son h1 ; `getLocaleRolls` rend `[]` pour une Locale sans article. La page copy des pages de listing (`ListingCopy` en, fr, es) est écrite par tddman : à relire par Nicolas.
