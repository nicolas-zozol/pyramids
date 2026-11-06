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

## D4 : brainstorm

- bsman : tests verts (717 site, 209 design system), `yarn lint` rouge aujourd'hui (64 erreurs, 58 dans `packages/scribe-intel`, 6 dans ctas, helpers, layouts). Après suppression la racine hisse le Vite 6.4.3 du vitest de helpers ; `packageExtensions` reste nécessaire. Les imports non déclarés de dakar ne viennent pas du collecteur : OQ-RETIRESCRIBE-3 (D3) ne devrait pas servir.
- OQ-RETIRESCRIBE-2 du brainstorm (fixture `apps/no-manifest/src/main.ts`) signée `lgtm (bsman)`, ne contredit aucun AC.
- D5 — atw Gap-RETIRESCRIBE-1 — retire-scribe-intel.brainstorm.md — retained: AC-RETIRESCRIBE-4 réduit, aucune erreur de lint sous un dossier supprimé et aucune erreur nouvelle ; les 6 erreurs des modules de dakar restent hors périmètre. Set aside: corriger ces 6 erreurs dans la story. Confidence: high.

## D6 : design

- designman : DRAFT, 9 R-, AC-RETIRESCRIBE-1 à 6 cités, `## Boundaries` rempli. Relève aussi `root.archi.md` (paragraphe de la règle de déclaration des imports, qui cite `@opentelemetry/api` de `packages/scribe-intel`) absent du plan de documentation : ajouté par `storyman update`.
- D7 — atw Gap-RETIRESCRIBE-1 — retire-scribe-intel.design.md — retained: l'entrée Done de retire-robusta-design dans `ROADMAP.md` reste telle quelle, la section Done de `ROADMAP.md` devient une exception de la recherche d'AC-RETIRESCRIBE-5. Set aside: réécrire ce bilan daté. Confidence: high.
- `storyman update` : AC-RETIRESCRIBE-5 exclut la section Done de `ROADMAP.md` ; note de `root.archi.md` ajoutée au plan. `designman update` plie Gap-RETIRESCRIBE-1, recopie AC-5. Aucune nouvelle entrée.
- Contrôle boss : AC-RETIRESCRIBE-1 à 6 cités mot pour mot, `## Boundaries` rempli, aucune entrée en attente. APPROVED, validated by boss atw.

## D8 : implémentation

- codeman, choisi plutôt que tddman : suppression pure, une fixture renommée. 56 fichiers suivis supprimés et leurs restes non suivis, `services/` et son glob retirés, `yarn.lock` −156 entrées, commentaire de `packageExtensions` seul réécrit (Vite 6.4.3 hissé par le vitest 3 de helpers), fixture `apps/no-manifest/src/main.ts`. Repli de dakar non appliqué. Confidence: high.
- Par codeman : `build:deps`, `build:robusta` (33 pages, Vite 8.3.2 seul), `build:dakar` verts ; design system 209/209 ; lint 6 erreurs, identiques à la référence moins scribe-intel (référence mesurée 63/57, le design dit 64/58) ; workspaces identiques avec les restes sur disque.
- Vérifié par boss : `yarn install --immutable` vert, tests du site 717/717.

## D9 : submit

- `storyman submit` : 4 étapes sur 4, epicman sans objet (story hors epic). docman (`README.md`, `.cursor/rules/typescript.mdc`), archiman (`root.archi.md`, `robusta-build.archi.md`), design IMPLEMENTED, story SUBMITTED, item et section « Hors epic » retirés de ROADMAP.md. Recherche d'AC-RETIRESCRIBE-5 : seule l'entrée Done de retire-robusta-design reste, exclue (D7). Commit de clôture exécuté par boss.
- Laissés à Nicolas : volet Netlify et Vercel d'AC-RETIRESCRIBE-6 après le push ; `protobufjs` encore nommé dans `root.archi.md` (Toolchain) et le commentaire `enableScripts` de `.yarnrc.yml`, hors plan de la story ; écarts antérieurs relevés par archiman.
