# Questions et décisions : default-locale-at-root

**Date :** 2026-11-03
**Branche :** epic/robusta-v2
**Requête :** `boss atw default-locale-at-root` — pipeline complet jusqu'au submit, un commit par étape, jamais de push. Mode atw : boss tranche les entrées `ask`.

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche attendue pour une story de l'epic pyramid-v2. HEAD `a61e377`.
- Working tree sale, hors run : `ROADMAP.md`, `pyramid-v2.epic.md`, `ubiquitous-language.md`, les stories netlify-deploy et seo-excellence, `blog-rolls/`, `drop-section-default-copy/`, `glossary-refresh/`, `pyramid-v2.bulk.md`. Jamais commités par ce run ; staging par chemin.
- État : story ACTIVE, absente des batches de l'epic (story nommée directement, hors lock), ni brainstorm ni design → Phase 3 (fold des réponses), puis Phase 4.

## D1 : OQ-ROOTLOCALE-1 et 2, réponses de Nicolas

- Phase : story
- Réponses : `lgtm` sur les deux Propositions. `/en…` répond 301 vers la forme sans préfixe ; la règle « Un site doit servir les pages de sa Locale par défaut sans marqueur de Locale dans leur URL » est enregistrée sous PYRAMID.
- Suite : `epicman update` pour enregistrer la BR au registre (greffier), puis `storyman update` pour plier les deux réponses dans le corps.

## D2 : BR-PYRAMID-14, et BR-PYRAMID-5 touchée par epicman

- Phase : story
- epicman enregistre BR-PYRAMID-14 au registre, place la story seule dans un batch B0 en tête d'À faire (epic et `ROADMAP.md`), trace la décision qui défait celle du 2026-10-25.
- epicman a aussi plié OQ-PYRAMID-3 (`Resolution: lgtm` venu des changements non commités de l'autre session) : BR-PYRAMID-5 perd « sur la branche main ». Hors run : boss ne commite que le hunk BR-PYRAMID-14 de `business-rules.md` ; le hunk BR-PYRAMID-5 reste dans le working tree, à confirmer par Nicolas.
- Epic et `ROADMAP.md` : modifiés, non commités.

## D3 : brainstorm, tri des entrées

- Phase : brainstorm (`default-locale-at-root.brainstorm.md`)
- D3a — atw Gap-ROOTLOCALE-3 — default-locale-at-root.brainstorm.md — retained: la Proposition, le jumeau `.html` que Netlify sert en 200 reste hors des AC, la story le précise dans AC-ROOTLOCALE-1 et 2, le canonical link reste à seo-excellence. Set aside: supprimer le jumeau (réglage d'hébergeur pour tout le site, hors schéma, contraire au README §One URL per page). Confidence: high.
- OQ-ROOTLOCALE-4 (`parseUrl` lit `/en…` comme la page sans préfixe) et OQ-ROOTLOCALE-5 (un seul jeu de routes) : `decide`, signées `lgtm (bsman)`, aucune contradiction avec un AC. Laissées telles quelles.
- Suite : `storyman update avec brainstorm` plie E1 à E4 et les trois entrées.
