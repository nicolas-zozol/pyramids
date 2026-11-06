# Design: supprimer scribe-intel du dépôt

**Last update:** 2026-11-06
**Feature:** retire-scribe-intel
**Infix:** RETIRESCRIBE
**Status:** APPROVED (2026-11-06 — validated by boss atw)
**Sources:** [story](retire-scribe-intel.story.md), [brainstorm](retire-scribe-intel.brainstorm.md)

## Goal

Les quatre dossiers de « Ce qui part » quittent git, le glob `services/*` quitte le manifeste racine, et `yarn.lock` est régénéré sans les deux workspaces yarn `@robusta/scribe-intel` et `@robusta/scribe-intel-collector`. Côté site v2, seul le nom d'une fixture de `netlify-ignore.spec.ts` change. Le pourquoi : [story](retire-scribe-intel.story.md).

## Boundaries

Deux API partent avec leurs seuls clients. Aucune API du green set n'est créée ni modifiée.

```
  Arrow = depends on, from client code to the API it uses.
  Every box is deleted; nothing of the green set points into them.

  app `intel-demo`        app `scribe-intel-collector`
  [deleted]               [deleted]
      │                       │                  ↑
      │ library               │ library          │ HTTP
      ↓                       ↓                  │
  module `scribe-intel` [deleted] ───────────────┘
```

### library API of module `@robusta/scribe-intel` — supprimée

Client code : app `@robusta/scribe-intel-collector` (workspace yarn) et app `apps/intel-demo/front` (hors workspaces yarn), supprimées toutes deux.

- Exports de `src/index.ts`, tous retirés : `Telemetry`, `Tracer`, `setupTelemetry`, `Logger`, `IntelLog`, `intelLogSchema`, `IntelMetrics`.

### HTTP API of app `@robusta/scribe-intel-collector` — supprimée

Client code : module `@robusta/scribe-intel` (`fetch` vers l'URL du collecteur), supprimé.

- `POST /api/logs`, `POST /api/metrics` : réception des logs et des métriques, export vers la stack `services/scribe-intel-backend`, qui ne sert à rien d'autre.

Fichiers touchés, internal code :

- `packages/scribe-intel/` (32 fichiers suivis), `services/scribe-intel-collector/` (13), `services/scribe-intel-backend/` (5), `apps/intel-demo/` (6) : supprimés par `git rm -r`. `services/` ne garde aucun fichier suivi.
- `package.json` : `workspaces` passe à `["apps/*", "packages/*"]`. Scripts et `devDependencies` inchangés.
- `yarn.lock` : régénéré par `yarn install`, jamais édité à la main.
- `.yarnrc.yml` : le bloc `packageExtensions` reste à l'octet ; son commentaire nomme le Vite 6.4.3 du `vitest` 3 de `packages/helpers`, hissé à la racine, au lieu du Vite 5.4.18 du collecteur.
- `apps/robusta-build/scripts/netlify-ignore.spec.ts` : `apps/intel-demo/front/src/main.ts` devient `apps/no-manifest/src/main.ts` dans `monorepo()` et dans le `it.each`, contenu `'// Not a workspace\n'` et libellé `'a directory without manifest'` inchangés. L'API library `ignoreVerdict` de `netlify-ignore.mjs` ne change pas.
- Documentation : le plan « Documentation updates » de la story, exécuté par docman. L'item `ROADMAP.md` de la story part au `storyman submit`.

Hors du diff : les autres dossiers de `packages/` et de `apps/`, `apps/dakar/package.json` sauf le repli d'AC-RETIRESCRIBE-6, `netlify-ignore.mjs`, `netlify.toml`, `.eslintignore`, `.gitignore`, les documents de `features/`, la section Done de `ROADMAP.md`, `business-rules.md`.

## Technical Constraints

- `git rm -r` laisse sur le disque les sorties ignorées : `packages/scribe-intel/{dist,yarn-error.log}`, `services/scribe-intel-collector/{dist,node_modules,yarn-error.log}`, `apps/intel-demo/front/{node_modules,yarn-error.log}`. Aucun de ces dossiers n'a de `package.json` à la racine d'un glob `workspaces`, donc aucun n'est un workspace yarn. AC-RETIRESCRIBE-6 se vérifie avec ces restes présents ; un `rm -rf` ne vient qu'après.
- yarn 4.17.1 par `yarnPath`. `YARN_FLAGS = "--immutable"` sur Netlify (`apps/robusta-build/netlify.toml`) ; Yarn 4 active l'install immuable en CI, donc sur Vercel aussi. Le lock régénéré est commité dans le même commit que la suppression. Essai du brainstorm : 167 entrées partent (OpenTelemetry, express, axios, jsdom, vite 5, vite-node 1…), 10 se refusionnent.
- Hoisting après la suppression : la racine hisse le Vite 6.4.3 du `vitest` 3.0.6 de `packages/helpers` ; le Vite 8.3.2 du site reste sous `apps/robusta-build/node_modules`. Sans `packageExtensions`, `@tanstack/start-plugin-core` serait hissé et lierait ce Vite 6. Contrôle : `yarn why vite`.
- dakar importe sans les déclarer `remark` (15.0.1), `remark-html` (16.0.1) et `gray-matter` (4.0.3), hissés depuis `apps/robusta-build`, que la suppression ne touche pas. Repli d'AC-RETIRESCRIBE-6 : les déclarer dans `apps/dakar/package.json` aux versions que résout déjà `yarn.lock`.
- `INSTALL_FILES` de `netlify-ignore.mjs` contient `package.json` et `yarn.lock` : le commit de suppression donne `build` sur un branch deploy.
- `yarn lint` (`eslint 'packages/**/src/**/*.{ts,tsx}'`) sort en erreur avant et après. Ligne de base mesurée le 2026-11-06 : 64 erreurs, 58 sous `packages/scribe-intel`, 3 sous `packages/ctas`, 2 sous `packages/helpers`, 1 sous `packages/layouts`. La vérification compare la liste des erreurs, pas le code de sortie.

## Requirements

- R-RETIRESCRIBE-01 : `packages/scribe-intel`, `services/scribe-intel-collector`, `services/scribe-intel-backend` et `apps/intel-demo` n'ont plus aucun fichier suivi par git ; leur contenu se relit au commit parent par `git show`.
- R-RETIRESCRIBE-02 : `workspaces` du manifeste racine ne porte plus `services/*` ; `apps/*`, `packages/*`, les scripts et les `devDependencies` ne changent pas.
- R-RETIRESCRIBE-03 : aucun fichier suivi n'est supprimé hors des quatre dossiers, et aucun manifeste du green set ne change, sauf le repli d'AC-RETIRESCRIBE-6 sur `apps/dakar/package.json`.
- R-RETIRESCRIBE-21 : `yarn.lock`, régénéré par yarn, ne porte plus `@robusta/scribe-intel` ni `@robusta/scribe-intel-collector`, et `yarn install --immutable` passe depuis un clean checkout.
- R-RETIRESCRIBE-22 : le bloc `packageExtensions` de `.yarnrc.yml` reste à l'octet ; son commentaire nomme le Vite 6.4.3 hissé par le `vitest` 3 de `packages/helpers` et ne cite plus le collecteur.
- R-RETIRESCRIBE-23 : `yarn build:deps`, `yarn build:robusta` et `yarn build:dakar` passent depuis un clean checkout (BR-PYRAMID-5) ; la build du site v2 ne charge que son Vite 8.
- R-RETIRESCRIBE-41 : `netlify-ignore.spec.ts` couvre « a directory without manifest » avec `apps/no-manifest/src/main.ts` à ses deux occurrences ; chaque cas garde son verdict, le premier compte toujours 2 dossiers surveillés.
- R-RETIRESCRIBE-42 : les tests du site v2 (717) et du design system (209) passent ; `yarn lint` ne rapporte plus que les 6 erreurs de `packages/ctas`, `packages/helpers` et `packages/layouts`.
- R-RETIRESCRIBE-61 : hors de `features/`, de la section Done de `ROADMAP.md`, de `yarn.lock` et de `.yarn/releases`, plus rien ne décrit scribe-intel, son collecteur, sa stack, sa démo ni la télémétrie comme présents ni ne les prescrit, selon le plan « Documentation updates » de la story ; BR-PYRAMID-2 ne change pas.

## Acceptance Criteria

- AC-RETIRESCRIBE-1 : Given le dépôt après la story, When on liste les workspaces yarn et les fichiers suivis par git, Then ni `@robusta/scribe-intel` ni `@robusta/scribe-intel-collector` n'apparaissent dans `yarn workspaces list`, `git ls-files` ne liste plus rien sous les quatre dossiers de « Ce qui part », et `git show <parent>:packages/scribe-intel/package.json` montre encore le module.
- AC-RETIRESCRIBE-2 : Given un clean checkout, When on lance `yarn install` puis `yarn install --immutable`, Then les deux passent, `yarn.lock` ne porte plus d'entrée pour les workspaces supprimés, et `packageExtensions` reste dans `.yarnrc.yml`, avec un commentaire qui ne cite plus le collecteur.
- AC-RETIRESCRIBE-3 : Given le green set, When on lance `yarn build:deps`, `yarn build:robusta` et `yarn build:dakar`, Then les trois passent : dakar trouve toujours `remark`, `remark-html` et `gray-matter`, et le site v2 se construit sur son propre Vite 8.
- AC-RETIRESCRIBE-4 : Given les suites de tests et le lint, When on lance les tests du site, ceux du design system et `yarn lint`, Then les deux suites sont vertes, et le test de la règle `ignore` de Netlify couvre toujours « un dossier sans manifeste » avec la fixture `apps/no-manifest/src/main.ts` ; `yarn lint` ne signale plus aucune erreur sous un dossier supprimé et n'en ajoute aucune, les 6 erreurs de `packages/ctas`, `packages/helpers` et `packages/layouts` restant hors périmètre.
- AC-RETIRESCRIBE-5 : Given le dépôt après la story, When on lance `git grep -iE "scribe-intel|intel-demo|opentelemetry|telemetry|télémétrie"` hors de `features/`, de la section Done de `ROADMAP.md`, de `yarn.lock` et de `.yarn/releases`, Then plus rien ne décrit ces dossiers ni la télémétrie comme présents ni ne les prescrit, seul l'item `ROADMAP.md` de cette story restant jusqu'à son retrait par `storyman submit` ; BR-PYRAMID-2 reste inchangée.
- AC-RETIRESCRIBE-6 : Given les cas limites, When on les rejoue, Then le poste qui a fait la suppression, relancé en `yarn install` sans nettoyer les sorties ignorées par git (`dist/`, `node_modules/`, `yarn-error.log`), liste les mêmes workspaces qu'un clean checkout ; au push du commit de suppression, Netlify construit le site v2 au lieu de sauter la build, parce que le commit touche `package.json` et `yarn.lock`, et ce déploiement passe ; Vercel reconstruit dakar sur une install propre et la build passe sans déclaration nouvelle dans `apps/dakar/package.json` ; si elle casse malgré tout, ses imports manquants y sont déclarés, aux versions que résout déjà `yarn.lock`.

Edge cases to test:

- Le poste de la suppression garde `apps/intel-demo/front/node_modules` sous le glob `apps/*` : `apps/intel-demo` n'a pas de `package.json`, la liste des workspaces yarn est celle d'un clean checkout.
- Le commit de suppression ne touche aucun dossier surveillé du site v2, seulement `package.json` et `yarn.lock` : le verdict Netlify est `build`, pas `skip`.
- `git grep` ne sait pas exclure une section : la recherche d'AC-RETIRESCRIBE-5 sort l'entrée Done de retire-robusta-design dans `ROADMAP.md`, qui nomme `apps/intel-demo`. Elle reste à l'octet, comme les documents de `features/`.
