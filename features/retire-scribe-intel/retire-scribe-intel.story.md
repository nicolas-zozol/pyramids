# Story : Supprimer scribe-intel du dépôt

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-scribe-intel
**Infix :** RETIRESCRIBE
**Status :** SUBMITTED (2026-11-06, commit d4ddbb3)

## Story

En tant que mainteneur du dépôt, je veux supprimer le SDK de télémétrie scribe-intel, son collecteur, sa stack d'observabilité et sa démo, afin que le workspace ne contienne plus que ce que le green set construit et que la documentation cesse de décrire du code mort.

## Contexte & objectif

`packages/scribe-intel`, deprecated depuis le 2026-10-31, ne compilait plus, pas plus que son seul client `services/scribe-intel-collector` ; aucun site n'en dépendait (BR-PYRAMID-2 pour le site v2). Nicolas a décidé la suppression le 2026-11-06, par une story hors de l'epic pyramid-v2. Le code reste relisible dans l'historique git, au parent de d4ddbb3.

## Livré

### Requirements

- R-RETIRESCRIBE-01 : `packages/scribe-intel`, `services/scribe-intel-collector`, `services/scribe-intel-backend` et `apps/intel-demo` n'ont plus aucun fichier suivi par git ; leur contenu se relit au commit parent par `git show`.
- R-RETIRESCRIBE-02 : `workspaces` du manifeste racine ne porte plus `services/*` ; `apps/*`, `packages/*`, les scripts et les `devDependencies` ne changent pas.
- R-RETIRESCRIBE-03 : aucun fichier suivi n'est supprimé hors des quatre dossiers, et aucun manifeste du green set ne change, sauf le repli d'AC-RETIRESCRIBE-6 sur `apps/dakar/package.json`.
- R-RETIRESCRIBE-21 : `yarn.lock`, régénéré par yarn, ne porte plus `@robusta/scribe-intel` ni `@robusta/scribe-intel-collector`, et `yarn install --immutable` passe depuis un clean checkout.
- R-RETIRESCRIBE-22 : le bloc `packageExtensions` de `.yarnrc.yml` reste à l'octet ; son commentaire nomme le Vite 6.4.3 hissé par le `vitest` 3 de `packages/helpers` et ne cite plus le collecteur.
- R-RETIRESCRIBE-23 : `yarn build:deps`, `yarn build:robusta` et `yarn build:dakar` passent depuis un clean checkout (BR-PYRAMID-5) ; la build du site v2 ne charge que son Vite 8.
- R-RETIRESCRIBE-41 : `netlify-ignore.spec.ts` couvre « a directory without manifest » avec `apps/no-manifest/src/main.ts` à ses deux occurrences ; chaque cas garde son verdict, le premier compte toujours 2 dossiers surveillés.
- R-RETIRESCRIBE-42 : les tests du site v2 (717) et du design system (209) passent ; `yarn lint` ne rapporte plus que les 6 erreurs de `packages/ctas`, `packages/helpers` et `packages/layouts`.
- R-RETIRESCRIBE-61 : hors de `features/`, de la section Done de `ROADMAP.md`, de `yarn.lock` et de `.yarn/releases`, plus rien ne décrit scribe-intel, son collecteur, sa stack, sa démo ni la télémétrie comme présents ni ne les prescrit, selon le plan « Documentation updates » de la story ; BR-PYRAMID-2 ne change pas.

### Acceptance Criteria

- AC-RETIRESCRIBE-1 : Given le dépôt après la story, When on liste les workspaces yarn et les fichiers suivis par git, Then ni `@robusta/scribe-intel` ni `@robusta/scribe-intel-collector` n'apparaissent dans `yarn workspaces list`, `git ls-files` ne liste plus rien sous les quatre dossiers de « Ce qui part », et `git show <parent>:packages/scribe-intel/package.json` montre encore le module.
- AC-RETIRESCRIBE-2 : Given un clean checkout, When on lance `yarn install` puis `yarn install --immutable`, Then les deux passent, `yarn.lock` ne porte plus d'entrée pour les workspaces supprimés, et `packageExtensions` reste dans `.yarnrc.yml`, avec un commentaire qui ne cite plus le collecteur.
- AC-RETIRESCRIBE-3 : Given le green set, When on lance `yarn build:deps`, `yarn build:robusta` et `yarn build:dakar`, Then les trois passent : dakar trouve toujours `remark`, `remark-html` et `gray-matter`, et le site v2 se construit sur son propre Vite 8.
- AC-RETIRESCRIBE-4 : Given les suites de tests et le lint, When on lance les tests du site, ceux du design system et `yarn lint`, Then les deux suites sont vertes, et le test de la règle `ignore` de Netlify couvre toujours « un dossier sans manifeste » avec la fixture `apps/no-manifest/src/main.ts` ; `yarn lint` ne signale plus aucune erreur sous un dossier supprimé et n'en ajoute aucune, les 6 erreurs de `packages/ctas`, `packages/helpers` et `packages/layouts` restant hors périmètre.
- AC-RETIRESCRIBE-5 : Given le dépôt après la story, When on lance `git grep -iE "scribe-intel|intel-demo|opentelemetry|telemetry|télémétrie"` hors de `features/`, de la section Done de `ROADMAP.md`, de `yarn.lock` et de `.yarn/releases`, Then plus rien ne décrit ces dossiers ni la télémétrie comme présents ni ne les prescrit, seul l'item `ROADMAP.md` de cette story restant jusqu'à son retrait par `storyman submit` ; BR-PYRAMID-2 reste inchangée.
- AC-RETIRESCRIBE-6 : Given les cas limites, When on les rejoue, Then le poste qui a fait la suppression, relancé en `yarn install` sans nettoyer les sorties ignorées par git (`dist/`, `node_modules/`, `yarn-error.log`), liste les mêmes workspaces qu'un clean checkout ; au push du commit de suppression, Netlify construit le site v2 au lieu de sauter la build, parce que le commit touche `package.json` et `yarn.lock`, et ce déploiement passe ; Vercel reconstruit dakar sur une install propre et la build passe sans déclaration nouvelle dans `apps/dakar/package.json` ; si elle casse malgré tout, ses imports manquants y sont déclarés, aux versions que résout déjà `yarn.lock`.

## Boundaries

### library API of module `@robusta/scribe-intel` — supprimée

Client code : app `@robusta/scribe-intel-collector` et app `apps/intel-demo/front`, supprimées dans la même story ; l'HTTP API du collecteur (`POST /api/logs`, `/api/metrics`) part avec son seul client, ce module. Aucune app ni aucun module du green set n'en était client. Aucune API conservée n'est modifiée ; seule la liste des workspaces du manifeste racine change.

## Décisions

- 2026-11-06 — `services/scribe-intel-backend` (Loki, Tempo, Prometheus) part dans la même story. Pourquoi : il n'alimentait que le collecteur.
- 2026-11-06 — `packageExtensions` reste dans `.yarnrc.yml`, seul son commentaire change. Pourquoi : sans lui, `@tanstack/start-plugin-core` serait hissé et lierait le Vite 6.4.3 de la racine.
- 2026-11-06 — Les 6 erreurs de lint de `packages/ctas`, `packages/helpers` et `packages/layouts` restent hors périmètre. Pourquoi : elles précèdent la story et ne touchent pas scribe-intel.
- 2026-11-06 — La section Done de `ROADMAP.md` et les documents de `features/` restent à l'octet, exclus de la recherche d'AC-RETIRESCRIBE-5. Pourquoi : ce sont des archives.
- 2026-11-06 — Repli dakar d'AC-RETIRESCRIBE-6 non appliqué : `build:dakar` passe sans déclaration nouvelle. Les imports non déclarés de dakar (`remark`, `remark-html`, `gray-matter`) restent une dette acceptée.
- 2026-11-06 — Le volet Netlify et Vercel d'AC-RETIRESCRIBE-6 se constate au push du commit de suppression.

## Documentation updates

- changed the Children list, the Overview, the module list, the dependency figure, the green set paragraph, the compile failure note and the OpenTelemetry line in `root.archi.md`
- changed the import declaration rule note in `root.archi.md` (Notes / Gotchas)
- changed the Vite paragraph in `root.archi.md`
- changed the Vite line and the « Hors dépendances » line in `apps/robusta-build/robusta-build.archi.md`
- changed the `services/*` line and the « standalone demos » of the `apps/*` line in `README.md`
- changed the `packageExtensions` comment in `.yarnrc.yml`
- removed the « Open telemetry » section of `.cursor/rules/typescript.mdc`
