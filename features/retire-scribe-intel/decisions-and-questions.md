# Questions et décisions : retire-scribe-intel

**Date :** 2026-11-06
**Branche :** feat/retire-scribe-intel, créée depuis `epic/robusta-v2` à `792130b`
**Requête :** `boss atw new story retire-scribe-intel` — story hors epic, jusqu'au submit. Mode atw : boss tranche les entrées `ask` par délégation de Nicolas.

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, état de départ

- Story hors de l'epic pyramid-v2 : branche attendue `feat/retire-scribe-intel`, créée depuis `epic/robusta-v2` (HEAD `792130b`, arbre propre), comme le demande la requête. `main` est à `5645867`, en retard d'un commit de docs sur l'epic.
- Le journal vit dans `features/retire-scribe-intel/`, la story n'appartenant à aucune epic. Confidence: high.

## D1 : story

- storyman, Infix RETIRESCRIBE, 6 AC. Découvert par boss : `services/scribe-intel-backend` (docker-compose Loki, Tempo, Prometheus), non nommé dans la requête ; porté par OQ-RETIRESCRIBE-1.
- OQ-RETIRESCRIBE-2 (`packageExtensions` gardé, commentaire réécrit) signée `lgtm (storyman)`, ne contredit aucun AC.
- D2 — atw OQ-RETIRESCRIBE-1 — retire-scribe-intel.story.md — retained: la stack `services/scribe-intel-backend` part dans la même story. Set aside: la garder dans le dépôt. Confidence: high.
- D3 — atw OQ-RETIRESCRIBE-3 — retire-scribe-intel.story.md — retained: si dakar casse, déclarer ses imports manquants dans `apps/dakar/package.json` aux versions de `yarn.lock`. Set aside: arrêter la story. Confidence: medium.
