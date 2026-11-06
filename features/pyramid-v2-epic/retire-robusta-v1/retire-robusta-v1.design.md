# Design: retirer le site v1 `apps/robusta`

**Last update:** 2026-11-06
**Feature:** retire-robusta-v1
**Infix:** RETIREV1
**Status:** APPROVED (2026-11-06 — validated by boss)
**Sources:** [story](retire-robusta-v1.story.md), [brainstorm](retire-robusta-v1.brainstorm.md), [epic](../pyramid-v2.epic.md)

## Goal

L'app `@robusta/build` disparaît de git, du disque, des workspaces et de `yarn.lock`, avec les trois scripts racine qui la lançaient et `concurrently`. Le site v2 perd ses deux dernières lectures de `apps/robusta` (`corpus-freeze.spec.ts`, la lecture d'arbre de `article-slug.spec.ts`) et le cas v1 de `netlify-ignore.spec.ts` ; ses commentaires citent la v1 au commit 6c57bc3. Le pourquoi : [story](retire-robusta-v1.story.md).

## Boundaries

Une seule API change. Aucune API de module : `pyramids-layouts`, `-links`, `-ctas`, `-themes`, `-helpers` et `-design-system` perdent un client, et aucune app ni aucun module ne dépendait de `@robusta/build`.

### CLI API of app `@robusta/pyramids` (scripts racine) — modified

Client code : le mainteneur, les agents, Netlify (`yarn build:robusta`).

- Retirés : `yarn build:robusta-v1`, `yarn dev:robusta-v1`, `yarn dev:dev`. Après la livraison, chacun sort en erreur, yarn ne trouvant plus le script.
- Inchangés : `build:deps`, `build:dakar`, `build:robusta`, `dev:robusta`, `dev:dakar`, `lint`, `clean`, `clean:install`, `yarn:install`, `w:*`, `w:deps`.
- Green set (BR-PYRAMID-5) : `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`, sortie 0 chacun, depuis un clean checkout.
- `workspaces` (`apps/*`, `services/*`, `packages/*`) inchangé : `@robusta/build` en sort par la suppression du dossier.
- `devDependencies` : seul `concurrently` part ; `daisyui` reste pour dakar.

Fichiers touchés, internal code :

- `apps/robusta/` — supprimé en entier, 731 fichiers suivis et les restes non suivis, sans copie : corpus, 18 brouillons, CV (brouillons : décidé le 2026-11-06, voir la [story](retire-robusta-v1.story.md)).
- `package.json`, `yarn.lock` — trois scripts et `concurrently` en moins ; lockfile régénéré par yarn, jamais édité à la main.
- `.yarnrc.yml` — le bloc `packageExtensions` reste à l'octet ; son commentaire nomme le Vite 5 que hisse `services/scribe-intel-collector` au lieu du Vite 6 de `apps/robusta`.
- `apps/robusta-build/src/content/corpus-freeze.spec.ts` — supprimé.
- `apps/robusta-build/src/content/corpus-reader/article-slug.spec.ts` — `V1_CORPUS` et la lecture de l'arbre partent. `V1_SLUGS` reste le contrat et porte pour chaque article le `title` et la `locale` lus à `6c57bc3:apps/robusta/content/blog/<chemin>` ; le describe « the slugs of the migrated corpus » dérive chaque slug de ces littéraux. Le corpus v2 ne les fournit pas : deux Locales y ont été corrigées. Les imports qui ne servaient qu'à la lecture (`node:fs`, `node:path`, `node:url`, `gray-matter`) partent.
- `apps/robusta-build/scripts/netlify-ignore.spec.ts` — `monorepo()` perd `apps/robusta/package.json` et `apps/robusta/src/index.ts` ; le `it.each` perd `['the v1 site', …]`. Le motif `'apps/robusta-*'` du test des workspaces reste : il n'est pas la v1. L'API library `ignoreVerdict` de `netlify-ignore.mjs` ne change pas.
- Commentaires réécrits en `6c57bc3:apps/robusta/<chemin>`, sans autre changement de texte ni de code :
  - `src/routing/v1-url-map.ts` : `src/logic/categories/robusta-categories.ts` et `src/app/learn/[...path]/page.tsx:59` ;
  - `src/content/corpus-reader/article-slug.ts` : `src/logic/posts.ts` ;
  - `src/content/migrated-corpus.spec.ts` : `content/blog`.
- Documentation : le plan « Documentation updates » de la story, exécuté par docman. `ROADMAP.md` item 9 est retiré par `storyman submit`.

Hors du diff : tout `packages/` sauf ses `*.archi.md`, les manifestes de `apps/dakar`, `services/` et `apps/intel-demo`, `v1-url-map.generated.json`, `netlify.toml`, toute redirection.

## Technical Constraints

- `apps/robusta/.gitignore` ignore `node_modules`, `.next`, `*.tsbuildinfo`, `next-env.d.ts` et `.DS_Store` : `git rm -r apps/robusta` laisse le dossier sur le disque, la suppression finit par `rm -rf apps/robusta`. `yarn install` retire ensuite le lien `node_modules/@robusta/build`.
- `yarn.lock` se régénère par `yarn install` (yarn 4.17.1 par `yarnPath`), puis `yarn install --immutable` doit passer : c'est le `YARN_FLAGS` de `apps/robusta-build/netlify.toml`. L'install d'essai du brainstorm donne 855 lignes en moins, `@robusta/build` et `next@15.1.8` disparus.
- Hoisting après la livraison : la racine hisse le Vite 5.4.18 de `services/scribe-intel-collector` ; le vitest 3 de `pyramids-helpers` et `scribe-intel` garde un Vite 6 imbriqué ; `@tanstack/start-plugin-core`, `react-start`, `react-start-rsc` et `router-plugin` résolvent Vite 8.3.2. Sans `packageExtensions`, `start-plugin-core` hissé lierait le Vite 5 racine : le bloc reste nécessaire.
- La plage peer `next ^15.1.8` de `pyramids-links` et `-ctas` reste satisfaite par le Next 15.5.3 de dakar. Les imports non déclarés de dakar (`remark`, `remark-html`, `gray-matter`) restent résolus par les copies hissées que déclare le site v2.
- `INSTALL_FILES` de `netlify-ignore.mjs` contient `package.json` et `yarn.lock` : le commit de livraison donne `build` sur un branch deploy. Un changement sous `apps/dakar` seul reste `skip`.
- `emit:v1-map` ne lit rien sous `apps/robusta` : `_redirects` et `v1-url-map.generated.json` sortent de la v1 map du site v2. Comparaison à l'octet contre une build de 6c57bc3.
- 6c57bc3 est la tête de `main` et d'`origin/main` : les références `6c57bc3:apps/robusta/…` ne dépendent d'aucune branche de travail.
- Le projet Vercel de `apps/robusta` est débranché ou supprimé depuis le 2026-11-06, avant le merge sur `main` : aucun push ne lance de build sur un dossier absent. Celui de `apps/dakar` reste branché. Hors dépôt, aucun R- ne le porte.

## Requirements

- R-RETIREV1-01 : `apps/robusta` n'a plus aucun fichier suivi et n'existe plus sur le disque du checkout, restes non suivis compris ; son contenu part sans copie ailleurs dans le dépôt.
- R-RETIREV1-02 : aucun fichier sous `packages/` n'est supprimé, et seuls les `*.archi.md` y changent ; les manifestes de `apps/dakar`, `services/` et `apps/intel-demo` ne changent pas.
- R-RETIREV1-21 : `package.json` ne porte plus `build:robusta-v1`, `dev:robusta-v1`, `dev:dev` ni `concurrently` ; ses autres scripts et dépendances ne changent pas.
- R-RETIREV1-22 : `yarn.lock`, régénéré par yarn, ne contient plus `@robusta/build` ni ce que seule la v1 tirait ; `yarn install --immutable` passe depuis un clean checkout, et le green set est vert, dakar à 23 pages (BR-PYRAMID-5).
- R-RETIREV1-23 : `packageExtensions` de `.yarnrc.yml` est conservé à l'octet, son commentaire nomme le Vite 5 hissé de `services/scribe-intel-collector`, et la build v2 ne charge que Vite 8.
- R-RETIREV1-41 : `corpus-freeze.spec.ts` est supprimé, et aucun fichier de `apps/robusta-build` ne lit plus sous `apps/robusta`.
- R-RETIREV1-42 : `article-slug.spec.ts` garde ses onze slugs littéraux et les dérive de titres et Locales littéraux, ceux de la v1 à 6c57bc3, sans lire de fichier.
- R-RETIREV1-43 : `netlify-ignore.spec.ts` perd le cas « the v1 site » et les fichiers `apps/robusta/*` de son dépôt simulé ; ses autres cas gardent leur verdict, le premier compte toujours 2 dossiers surveillés.
- R-RETIREV1-44 : `dist/client/_redirects` (77 règles) et `v1-url-map.generated.json` (83 lignes de map) sont identiques à l'octet avant et après la livraison, et `yarn workspace @robusta/robusta-build run test` est vert.
- R-RETIREV1-61 : les quatre commentaires de `v1-url-map.ts`, `article-slug.ts` et `migrated-corpus.spec.ts` qui nomment un fichier v1 le citent en `6c57bc3:apps/robusta/<chemin>`.
- R-RETIREV1-81 : la documentation vivante du périmètre d'AC-RETIREV1-4 ne nomme plus la v1 ni ses scripts, selon le plan « Documentation updates » de la story ; les journaux datés, `decisions-and-questions.md`, les documents des features et `__done/` gardent leurs mentions.
- R-RETIREV1-82 : la story livrée cite 6c57bc3 comme commit où se relisent articles, brouillons, CV et routing v1, par `git show 6c57bc3:apps/robusta/<chemin>`.

## Acceptance Criteria

- AC-RETIREV1-1 : Given le dépôt après la livraison, When on liste les fichiers suivis, le disque et le manifeste racine, Then `apps/robusta` n'existe ni dans git ni sur le disque, `@robusta/build` n'apparaît plus dans `yarn.lock`, et `package.json` ne porte plus `build:robusta-v1`, `dev:robusta-v1`, `dev:dev` ni `concurrently`.
- AC-RETIREV1-2 : Given un clean checkout, When on lance le green set, `yarn install --immutable`, `yarn build:deps`, `yarn build:dakar` et `yarn build:robusta`, Then tout est vert, dakar produit ses 23 pages, et aucun fichier sous `packages/` n'est supprimé.
- AC-RETIREV1-3 : Given la build du site v2 avant et après la livraison, When on compare `dist/client/_redirects` et `v1-url-map.generated.json`, Then ils sont identiques à l'octet, 77 règles dans `_redirects` et 83 lignes dans la v1 map, et la suite de tests du site v2 est verte sans `corpus-freeze.spec.ts`.
- AC-RETIREV1-4 : Given la livraison soumise, When on cherche `apps/robusta` (hors `apps/robusta-build`), `@robusta/build`, `build:robusta-v1`, `dev:robusta-v1` et `dev:dev` dans `CLAUDE.md`, les README, les `*.archi.md` (`design-system.archi.md` compris), `.cursor/rules`, `.yarnrc.yml`, la section Next de `ROADMAP.md` et le code de `apps/robusta-build`, Then rien ne les nomme, sauf une référence `6c57bc3:apps/robusta/…` ; les journaux datés de l'epic, `decisions-and-questions.md`, les documents des features et `__done/` gardent leurs mentions.
- AC-RETIREV1-5 : Given un lecteur qui cherche un article, un brouillon jamais publié, le CV ou le routing v1, When il lit la story livrée, Then elle cite 6c57bc3, et `git show 6c57bc3:apps/robusta/<chemin>` rend le fichier.
- AC-RETIREV1-6 : Given les cas limites, When on les rejoue, Then un reste non suivi de `apps/robusta` (`node_modules`, `.next`, `tsconfig.tsbuildinfo`) ne survit pas, un `git rm -r` seul ne suffisant pas ; la racine hisse le Vite 5 de `services/scribe-intel-collector`, la build v2 ne charge que Vite 8 et le `packageExtensions` de `.yarnrc.yml` est conservé ; un changement sous `apps/dakar` seul donne toujours `skip` à la règle `ignore` de Netlify, tandis que le commit de livraison, qui change `package.json` et `yarn.lock`, donne `build` et son deploy preview sert les mêmes 77 règles.

Edge cases to test:

- La recherche d'AC-RETIREV1-4 attrape `apps/robusta-build` et le motif de workspaces `'apps/robusta-*'` de `netlify-ignore.spec.ts`, qui ne nomment pas la v1 : `git grep -P 'apps/robusta(?!-)'`, une ligne `6c57bc3:apps/robusta/…` étant conforme.
- Un article dont la Locale a été corrigée en v2 (`blockchain/yield-farming.md`, `fr` en v1, `en` en v2) : `article-slug.spec.ts` dérive son slug de la Locale v1, et le slug ne bouge pas.
- Un brouillon jamais publié se relit : `git show 6c57bc3:apps/robusta/content/blog-unpublished/<chemin>` rend le fichier.

## Dependencies

- Depends on : restore-v1-urls et retire-robusta-design, livrées le 2026-11-06. Hors dépôt, fait le 2026-11-06 : le projet Vercel de la v1 débranché ou supprimé.
- Blocks : la clôture de l'epic, dont c'est le dernier item de B5.
