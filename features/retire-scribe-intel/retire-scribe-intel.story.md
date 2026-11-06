# Story : Supprimer scribe-intel du dépôt

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-scribe-intel
**Infix :** RETIRESCRIBE
**Status :** ACTIVE

## Story

En tant que mainteneur du dépôt, je veux supprimer le SDK de télémétrie scribe-intel, son collecteur, sa stack d'observabilité et sa démo, afin que le workspace ne contienne plus que ce que le green set construit et que la documentation cesse de décrire du code mort.

## Contexte & objectif

`packages/scribe-intel` est deprecated depuis le 2026-10-31 ; il ne compile pas, et `services/scribe-intel-collector`, son seul client, non plus. Aucun site n'en dépend : le site v2 par règle (BR-PYRAMID-2), dakar par fait. Nicolas a décidé la suppression le 2026-11-06, par une story hors de l'epic pyramid-v2 (décisions du 2026-07-29, du 2026-10-31 et du 2026-11-06 de `features/pyramid-v2-epic/pyramid-v2.epic.md`, item « Hors epic » du `ROADMAP.md`).

Le code supprimé reste relisible dans l'historique git. Le risque tient à l'install : la racine hisse aujourd'hui le Vite 5 du collecteur, `packageExtensions` de `.yarnrc.yml` est commenté par rapport à lui, et dakar compte sur le hoisting racine pour `remark`, `remark-html` et `gray-matter`, qu'il ne déclare pas (risque accepté le 2026-11-06).

## Ce qui part

- `packages/scribe-intel` : le module, son `scribe-intel.archi.md` et son `cursor_rule/`.
- `services/scribe-intel-collector` : le workspace qui dépend du module.
- `services/scribe-intel-backend` : la stack docker-compose Loki, Tempo et Prometheus que le collecteur alimente, sans `package.json`.
- `apps/intel-demo` : la démo, qui n'est pas un workspace.
- `services/` ne contient alors plus rien : le dossier et le glob `services/*` du manifeste racine partent avec.
- Les documents de `features/` qui citent ces dossiers restent tels quels : ce sont des archives.

## Acceptance Criteria

- AC-RETIRESCRIBE-1 : Given le dépôt après la story, When on liste les workspaces yarn et les dossiers du dépôt, Then ni `@robusta/scribe-intel` ni `@robusta/scribe-intel-collector` n'apparaissent, les quatre dossiers de « Ce qui part » n'existent plus, et le commit qui précède la suppression les montre encore.
- AC-RETIRESCRIBE-2 : Given un clean checkout, When on lance `yarn install` puis `yarn install --immutable`, Then les deux passent, et `yarn.lock` ne porte plus d'entrée pour les workspaces supprimés.
- AC-RETIRESCRIBE-3 : Given le green set, When on lance `yarn build:deps`, `yarn build:robusta` et `yarn build:dakar`, Then les trois passent : dakar trouve toujours `remark`, `remark-html` et `gray-matter`, et le site v2 se construit sur son propre Vite 8.
- AC-RETIRESCRIBE-4 : Given les suites de tests et le lint, When on lance les tests du site, ceux du design system et `yarn lint`, Then tout est vert, et le test de la règle `ignore` de Netlify couvre toujours « un dossier sans manifeste », avec une fixture qui ne nomme aucun dossier supprimé.
- AC-RETIRESCRIBE-5 : Given la documentation et la configuration hors de `features/`, When on cherche `scribe-intel`, `intel-demo` ou la télémétrie, Then plus rien ne les décrit comme présents ni ne les prescrit ; BR-PYRAMID-2 reste inchangée.
- AC-RETIRESCRIBE-6 : Given les cas limites, When on les rejoue, Then les sorties ignorées par git (`dist/`, `node_modules/`, `yarn-error.log`) ne laissent aucun dossier fantôme qui redeviendrait un workspace ; `packageExtensions` reste dans `.yarnrc.yml`, et son commentaire ne cite plus le collecteur ; si la build de dakar casse malgré tout, ses imports manquants sont déclarés dans `apps/dakar/package.json`, aux versions que résout déjà `yarn.lock`.

## Boundaries

### library API of module `@robusta/scribe-intel` — supprimée

Client code : app `@robusta/scribe-intel-collector`, supprimée dans la même story. Aucune app ni aucun module du green set n'en est client. Aucune API conservée n'est modifiée ; seule la liste des workspaces du manifeste racine change.

## Documentation updates

- change the module list, the dependency figure, the green set paragraph, the Vite paragraph, the compile failure note and the OpenTelemetry line in `root.archi.md` — why: ces parties décrivent des workspaces supprimés.
- change the Vite line and the « Hors dépendances » line in `apps/robusta-build/robusta-build.archi.md` — why: la racine ne hisse plus le Vite 5 du collecteur, et `@robusta/scribe-intel` n'existe plus.
- change the `services/*` line in `README.md` — why: le dossier n'existe plus.
- change the `packageExtensions` comment in `.yarnrc.yml` — why: il explique le besoin par le Vite du collecteur.
- change the « Open telemetry » section of `.cursor/rules/typescript.mdc` — why: elle prescrit un wrapper de télémétrie qui n'existe nulle part dans le dépôt.
