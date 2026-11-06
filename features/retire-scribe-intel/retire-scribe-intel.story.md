# Story : Supprimer scribe-intel du dépôt

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-scribe-intel
**Infix :** RETIRESCRIBE
**Status :** ACTIVE

## Story

En tant que mainteneur du dépôt, je veux supprimer le SDK de télémétrie scribe-intel, son collecteur, sa stack d'observabilité et sa démo, afin que le workspace ne contienne plus que ce que le green set construit et que la documentation cesse de décrire du code mort.

## Contexte & objectif

`packages/scribe-intel` est deprecated depuis le 2026-10-31 ; il ne compile pas, et `services/scribe-intel-collector`, son seul client, non plus. Aucun site n'en dépend : le site v2 par règle (BR-PYRAMID-2), dakar par fait. Nicolas a décidé la suppression le 2026-11-06, par une story hors de l'epic pyramid-v2 (décisions du 2026-07-29, du 2026-10-31 et du 2026-11-06 de `features/pyramid-v2-epic/pyramid-v2.epic.md`, item « Hors epic » du `ROADMAP.md`).

Le code supprimé reste relisible dans l'historique git. Le risque tient à l'install. La racine hisse aujourd'hui le Vite 5.4.18 du collecteur ; après la suppression, elle hisse le Vite 6.4.3 du `vitest` 3 de `packages/helpers`, et le Vite 8 du site reste sous `apps/robusta-build/node_modules`. `packageExtensions` de `.yarnrc.yml` reste nécessaire : sans lui, `@tanstack/start-plugin-core` est hissé à la racine et lie ce Vite 6.

dakar importe sans les déclarer `remark`, `remark-html` et `gray-matter`. Leur copie racine vient d'`apps/robusta-build`, que la suppression ne touche pas : ils restent hissés, et cette dette reste hors de la story (risque accepté le 2026-11-06).

## Ce qui part

- `packages/scribe-intel` : le module, son `scribe-intel.archi.md` et son `cursor_rule/`.
- `services/scribe-intel-collector` : le workspace qui dépend du module.
- `services/scribe-intel-backend` : la stack docker-compose Loki, Tempo et Prometheus que le collecteur alimente, sans `package.json`.
- `apps/intel-demo` : la démo, qui n'est pas un workspace.
- `services/` ne contient alors plus rien : le dossier et le glob `services/*` du manifeste racine partent avec.
- La fixture « un dossier sans manifeste » de `apps/robusta-build/scripts/netlify-ignore.spec.ts` devient `apps/no-manifest/src/main.ts`, à ses deux occurrences (fixture de base et `it.each`), contenu inchangé.
- Les documents de `features/` qui citent ces dossiers restent tels quels : ce sont des archives.

## Acceptance Criteria

- AC-RETIRESCRIBE-1 : Given le dépôt après la story, When on liste les workspaces yarn et les fichiers suivis par git, Then ni `@robusta/scribe-intel` ni `@robusta/scribe-intel-collector` n'apparaissent dans `yarn workspaces list`, `git ls-files` ne liste plus rien sous les quatre dossiers de « Ce qui part », et `git show <parent>:packages/scribe-intel/package.json` montre encore le module.
- AC-RETIRESCRIBE-2 : Given un clean checkout, When on lance `yarn install` puis `yarn install --immutable`, Then les deux passent, `yarn.lock` ne porte plus d'entrée pour les workspaces supprimés, et `packageExtensions` reste dans `.yarnrc.yml`, avec un commentaire qui ne cite plus le collecteur.
- AC-RETIRESCRIBE-3 : Given le green set, When on lance `yarn build:deps`, `yarn build:robusta` et `yarn build:dakar`, Then les trois passent : dakar trouve toujours `remark`, `remark-html` et `gray-matter`, et le site v2 se construit sur son propre Vite 8.
- AC-RETIRESCRIBE-4 : Given les suites de tests et le lint, When on lance les tests du site, ceux du design system et `yarn lint`, Then les deux suites sont vertes, et le test de la règle `ignore` de Netlify couvre toujours « un dossier sans manifeste » avec la fixture `apps/no-manifest/src/main.ts` ; `yarn lint` ne signale plus aucune erreur sous un dossier supprimé et n'en ajoute aucune, les 6 erreurs de `packages/ctas`, `packages/helpers` et `packages/layouts` restant hors périmètre.
- AC-RETIRESCRIBE-5 : Given le dépôt après la story, When on lance `git grep -iE "scribe-intel|intel-demo|opentelemetry|telemetry|télémétrie"` hors de `features/`, `yarn.lock` et `.yarn/releases`, Then plus rien ne décrit ces dossiers ni la télémétrie comme présents ni ne les prescrit, seul l'item `ROADMAP.md` de cette story restant jusqu'à son retrait par `storyman submit` ; BR-PYRAMID-2 reste inchangée.
- AC-RETIRESCRIBE-6 : Given les cas limites, When on les rejoue, Then le poste qui a fait la suppression, relancé en `yarn install` sans nettoyer les sorties ignorées par git (`dist/`, `node_modules/`, `yarn-error.log`), liste les mêmes workspaces qu'un clean checkout ; au push du commit de suppression, Netlify construit le site v2 au lieu de sauter la build, parce que le commit touche `package.json` et `yarn.lock`, et ce déploiement passe ; Vercel reconstruit dakar sur une install propre et la build passe sans déclaration nouvelle dans `apps/dakar/package.json` ; si elle casse malgré tout, ses imports manquants y sont déclarés, aux versions que résout déjà `yarn.lock`.

## Boundaries

### library API of module `@robusta/scribe-intel` — supprimée

Client code : app `@robusta/scribe-intel-collector`, supprimée dans la même story, dont l'HTTP API (`POST /api/logs`, `/api/metrics`) part avec son seul client, ce module. Aucune app ni aucun module du green set n'en est client. Aucune API conservée n'est modifiée ; seule la liste des workspaces du manifeste racine change.

## Documentation updates

- change the Children list (`scribe-intel` link, « les autres apps et les services »), the Overview sentence on the demo app, the module list, the dependency figure, the green set paragraph, the compile failure note and the OpenTelemetry line in `root.archi.md` — why: ces parties décrivent des workspaces supprimés.
- change the Vite paragraph in `root.archi.md` — why: la racine hisse désormais le Vite 6.4.3 du `vitest` 3 de `packages/helpers`, plus le Vite 5 du collecteur.
- change the Vite line and the « Hors dépendances » line in `apps/robusta-build/robusta-build.archi.md` — why: le Vite hissé à la racine est le 6.4.3 du `vitest` de `packages/helpers`, et `@robusta/scribe-intel` n'existe plus.
- change the `services/*` line and the « standalone demos » of the `apps/*` line in `README.md` — why: le dossier et la démo n'existent plus.
- change the `packageExtensions` comment in `.yarnrc.yml` — why: il explique le besoin par le Vite du collecteur ; c'est maintenant le Vite 6.4.3 du `vitest` 3 de `packages/helpers`.
- remove the « Open telemetry » section of `.cursor/rules/typescript.mdc` — why: elle prescrit un wrapper de télémétrie qui n'existe nulle part dans le dépôt.
