# Brainstorm : retire-scribe-intel

**Date :** 2026-11-06
**Participants :** bsman (autonomous)
**Infix :** RETIRESCRIBE
**Source :** `features/retire-scribe-intel/retire-scribe-intel.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Constats vérifiés dans le dépôt

Essais sur une copie des manifestes sans `services/*` ni `packages/scribe-intel`, dans le scratchpad ; rien n'a été modifié dans le dépôt.

- Hoisting : la racine hisse aujourd'hui le `vite@5.4.18` du collecteur. Après la suppression, elle hisse le `vite@6.4.3` du `vitest@3.0.6` de `packages/helpers` ; le Vite 8.3.2 du site reste sous `apps/robusta-build/node_modules`. Deux majeures de Vite au lieu de trois.
- `packageExtensions` reste nécessaire : sans lui, `@tanstack/start-plugin-core` est hissé à la racine et lie le Vite 6 hissé. Le commentaire de `.yarnrc.yml` doit citer ce Vite 6 de `vitest` 3, plus le collecteur.
- dakar importe sans les déclarer `remark`, `remark-html`, `gray-matter`, `@robusta/pyramids-helpers` et `daisyui`. Aucun ne vient du collecteur : les trois premiers sont hissés depuis `apps/robusta-build` (15.0.1, 16.0.1, 4.0.3), `pyramids-helpers` est le lien workspace, `daisyui` une devDependency racine. Tous restent hissés après la suppression : le repli de AC-RETIRESCRIBE-6 sur `apps/dakar/package.json` ne devrait pas servir.
- `yarn.lock` : 167 entrées partent (OpenTelemetry, express, axios, jsdom, uuid, ts-node, vite 5, vite-node 1, esbuild 0.21…), 10 se refusionnent. `yarn install --immutable` passe ensuite. Aucun module du green set n'importe un paquet qui quitte le lock.
- Dossiers fantômes : `git rm` laisse les sorties ignorées (`packages/scribe-intel/dist`, `yarn-error.log`, `services/scribe-intel-collector/{dist,node_modules}`, `apps/intel-demo/front/{node_modules,yarn-error.log}`). Recréés dans la copie, ils n'apparaissent pas dans `yarn workspaces list` : un dossier sans `package.json` n'est pas un workspace.
- `apps/intel-demo/front/package.json` existe, un niveau sous le glob `apps/*` : jamais un workspace.
- Références hors de `features/` : `root.archi.md` (Children, Overview, liste des modules, figure, green set, Dependencies, Vite, échec de compilation), `apps/robusta-build/robusta-build.archi.md` (Vite, Hors dépendances), `README.md` (`services/*`, et « standalone demos » sur `apps/*`), `.yarnrc.yml`, `.cursor/rules/typescript.mdc` (§Open telemetry), `package.json` racine (`services/*`), `apps/robusta-build/scripts/netlify-ignore.spec.ts` (fixture), `ROADMAP.md` (l'item de cette story). Rien dans `.eslintignore`, `.gitignore`, `netlify.toml`, `tsconfig`, `features/__chore/` ni de config Vercel.
- La fixture `apps/intel-demo/front/src/main.ts` vit dans un dépôt git temporaire que la spec crée : le test passe encore après la suppression, seul le nom est à changer, à ses deux occurrences (la fixture de base et le `it.each`).
- Lignes de base : tests du site 717/717, du design system 209/209. `yarn lint` échoue aujourd'hui avec 64 erreurs, dont 58 dans `packages/scribe-intel` et 6 hors de lui : 3 dans `packages/ctas`, 2 dans `packages/helpers`, 1 dans `packages/layouts`.

---

## Challenge des Acceptance Criteria

- AC-RETIRESCRIBE-1 : testable. Imprécis sur « n'existent plus » : sur le poste qui fait la suppression, les sorties ignorées gardent les dossiers sur disque. Proposé à storyman : Then `git ls-files` ne liste plus rien sous les quatre dossiers, et `git show <parent>:packages/scribe-intel/package.json` le montre encore.
- AC-RETIRESCRIBE-2 : testable, suffisant.
- AC-RETIRESCRIBE-3 : testable. La clause sur `remark`, `remark-html` et `gray-matter` tient, mais pour une autre raison que celle du Contexte : leur copie racine vient du site v2, pas du collecteur (constats).
- AC-RETIRESCRIBE-4 : contredit par le code : `yarn lint` reste rouge après la suppression, sur 6 erreurs des modules de dakar (Gap-RETIRESCRIBE-1).
- AC-RETIRESCRIBE-5 : testable si la recherche est nommée. Proposé à storyman : la recherche est `git grep -iE "scribe-intel|intel-demo|opentelemetry|telemetry|télémétrie"` hors de `features/`, `yarn.lock` et `.yarn/releases`, et l'item `ROADMAP.md` de cette story compte jusqu'à son retrait par `storyman submit`.
- AC-RETIRESCRIBE-6 : testable, mais trois contrôles sans lien dans un même AC (dossiers fantômes, `packageExtensions`, repli dakar). Accepté tel quel : le découper n'ajoute aucun test.

Cas limites métier proposés à storyman :

- Given le commit de suppression poussé, When Netlify évalue sa règle `ignore`, Then il construit le site v2 au lieu de sauter la build, parce que le commit touche `package.json` et `yarn.lock`, et ce déploiement passe.
- Given le commit de suppression poussé, When Vercel reconstruit dakar sur son install propre, Then la build passe sans déclaration nouvelle dans `apps/dakar/package.json`.
- Given le poste de développement qui a fait la suppression, When on relance `yarn install` sans nettoyer les sorties ignorées, Then la liste des workspaces est celle d'un clean checkout.

---

## 1. Rôle du produit

**Décision (autonome):** une suppression de code mort et de sa documentation. Ce n'est ni une migration de la télémétrie ni un remplacement : aucun site ne suit ses visiteurs (BR-PYRAMID-2).

**Rationale:** aucun site n'est client du SDK.

---

## 2. Public cible

**Décision (autonome):** le mainteneur du dépôt et les agents qui lisent l'architecture ; aucun visiteur des sites n'est touché.

**Rationale:** rien de ce qui part n'est déployé.

---

## 3. Problème central

**Problème :** un module et un service qui ne compilent pas restent dans le set installé, imposent leur Vite 5 à la racine et sont décrits comme présents par la documentation.

**Décision (autonome):** retirer les quatre dossiers et chaque mention qui les décrit comme présents.

**Rationale:** l'historique git garde le code relisible.

---

## 4. Proposition de valeur

**Décision (autonome):** un workspace qui ne contient que le green set, une install plus légère de 167 entrées de lock, une majeure de Vite en moins, et 58 erreurs de lint en moins.

**Rationale:** mesuré sur la copie d'essai.

---

## 5. Périmètre fonctionnel

**Décision (autonome):** dedans, « Ce qui part » de la story, le glob `services/*`, le plan de documentation, la fixture. Dehors, les documents de `features/`, les imports non déclarés de dakar, les 6 erreurs de lint des modules de dakar.

**Rationale:** la dette d'imports de dakar ne dépend pas du collecteur ; risque accepté le 2026-11-06.

---

## 6. Capacités essentielles

### Capacité : retrait des workspaces

**Capability :** supprimer les quatre dossiers, le glob `services/*`, et régénérer `yarn.lock`.

**Acceptance Criteria :** AC-RETIRESCRIBE-1, AC-RETIRESCRIBE-2, AC-RETIRESCRIBE-6
- Proposé à storyman : Given le poste qui a fait la suppression, When on relance `yarn install` sans nettoyer les sorties ignorées, Then la liste des workspaces est celle d'un clean checkout.

**Test Approach :** `yarn workspaces list`, `git ls-files`, `yarn install` puis `yarn install --immutable` sur un clone propre.

### Capacité : green set intact

**Capability :** les trois builds et les deux suites de tests passent sans le collecteur.

**Acceptance Criteria :** AC-RETIRESCRIBE-3, AC-RETIRESCRIBE-4
- Proposé à storyman : Given le commit poussé, When Netlify et Vercel reconstruisent, Then les deux déploiements passent.

**Test Approach :** `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`, tests du site et du design system, `yarn lint` comparé à la ligne de base ; `yarn why vite` montre le Vite 8 du site.

### Capacité : documentation et configuration à jour

**Capability :** plus rien hors de `features/` ne décrit scribe-intel comme présent ; la fixture de `netlify-ignore.spec.ts` prend un nom neutre (OQ-RETIRESCRIBE-2) ; le §Open telemetry de `.cursor/rules/typescript.mdc` est retiré entier, car il prescrit un wrapper qui n'existe pas.

**Acceptance Criteria :** AC-RETIRESCRIBE-4, AC-RETIRESCRIBE-5, AC-RETIRESCRIBE-6

**Test Approach :** la recherche nommée dans le challenge de AC-RETIRESCRIBE-5, relue à la main pour BR-PYRAMID-2.

---

## 7. Cas limites critiques

Voir le challenge des AC. Le seul cas qui change une décision est le lint (Gap-RETIRESCRIBE-1).

---

## 8. Contraintes non fonctionnelles

**Décision (autonome):** une seule contrainte, l'install reproductible : le lock régénéré est commité et passe `--immutable`, que Netlify et Vercel appliquent en CI.

**Rationale:** Yarn 4 active les installs immuables en CI.

---

## 9. Dépendances externes

**Décision (autonome):** Netlify et Vercel, par leurs builds déclenchées au push. La stack docker-compose Loki, Tempo et Prometheus n'est lancée par aucun environnement du dépôt.

**Rationale:** aucune config de déploiement ne la cite.

---

## 10. Risques majeurs

- Un import non déclaré qui viendrait du collecteur : écarté, aucun import du green set ne pointe vers un paquet qui quitte le lock.
- Un ordre de hoisting différent sur Vercel : faible, le lock fixe les versions ; le déploiement dakar le confirme.
- La dette d'imports non déclarés de dakar reste, hors de cette story.

---

## 11. Boundaries

Toutes les API qui partent ont leurs seuls clients dans les dossiers supprimés. Aucune API du green set n'est modifiée.

### library API of module `@robusta/scribe-intel` — supprimée

Client code : app `@robusta/scribe-intel-collector`, supprimée.

Exports de `src/index.ts` : `Telemetry`, `Tracer`, `setupTelemetry`, `Logger`, `IntelLog`, `intelLogSchema`, `IntelMetrics`.

### HTTP API of app `@robusta/scribe-intel-collector` — supprimée

Client code : module `@robusta/scribe-intel` (son client HTTP), supprimé.

- `POST /api/logs`, `/api/metrics` : réception des logs et métriques, export vers la stack `services/scribe-intel-backend`.

---

## Open Questions & Gaps


---

## Next Steps

- `storyman update retire-scribe-intel avec brainstorm` : intégrer les cas limites et les reformulations de AC-RETIRESCRIBE-1 et -5, plier OQ-RETIRESCRIBE-2, et appliquer la Resolution de Gap-RETIRESCRIBE-1.
- Dans la même passe, compléter le plan de documentation : le lien Children `scribe-intel` et la phrase « les autres apps et les services » de `root.archi.md`, la phrase de l'Overview sur l'app de démo, « standalone demos » de la ligne `apps/*` du `README.md` ; les lignes Vite de `root.archi.md` et `robusta-build.archi.md` et le commentaire de `.yarnrc.yml` citent le Vite 6.4.3 hissé par le `vitest` 3 de `packages/helpers`.
- Corriger le Contexte de la story : la copie racine de `remark`, `remark-html` et `gray-matter` vient de `apps/robusta-build`, que la suppression ne touche pas.
- `designman` ensuite, puis l'implémentation.
