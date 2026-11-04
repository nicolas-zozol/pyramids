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
