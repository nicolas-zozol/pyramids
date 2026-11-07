# Story : Retirer le site v1 `apps/robusta`

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-robusta-v1
**Infix :** RETIREV1
**Status :** DONE (2026-11-06, commit 5645867 sur main)

## Story

En tant que mainteneur du dépôt, je veux supprimer l'app `apps/robusta` (`@robusta/build`), son corpus figé et tout ce qui la nomme, afin que le dépôt ne construise, ne teste et ne documente plus un site que plus personne ne sert.

## Contexte & objectif

Depuis le 2026-11-05, la v2 sert www.robusta.build sur Netlify, et les adresses v1 reviennent en 301 ou 410 par le `_redirects` de restore-v1-urls, tiré de la v1 map du site v2. Le site v1 ne servait plus rien. Il restait pourtant dans le green set, dans les scripts racine et dans la documentation.

## Livré

`apps/robusta` a disparu de git (731 fichiers suivis) et du disque. `@robusta/build` n'apparaît plus dans `yarn.lock` (−855/+9 lignes). Les scripts `build:robusta-v1`, `dev:robusta-v1`, `dev:dev` et `concurrently` sont partis. Rien sous `packages/` n'a changé hors des `*.archi.md`.

Relire la v1 : articles, 18 brouillons de `content/blog-unpublished`, CV de `public/nicolas` et routing v1 (son README) se relisent par `git show 6c57bc3:apps/robusta/<chemin>`, 6c57bc3 étant la tête de `main` au 2026-11-06.

### Requirements

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

### Acceptance Criteria

- AC-RETIREV1-1 : Given le dépôt après la livraison, When on liste les fichiers suivis, le disque et le manifeste racine, Then `apps/robusta` n'existe ni dans git ni sur le disque, `@robusta/build` n'apparaît plus dans `yarn.lock`, et `package.json` ne porte plus `build:robusta-v1`, `dev:robusta-v1`, `dev:dev` ni `concurrently`.
- AC-RETIREV1-2 : Given un clean checkout, When on lance le green set, `yarn install --immutable`, `yarn build:deps`, `yarn build:dakar` et `yarn build:robusta`, Then tout est vert, dakar produit ses 23 pages, et aucun fichier sous `packages/` n'est supprimé.
- AC-RETIREV1-3 : Given la build du site v2 avant et après la livraison, When on compare `dist/client/_redirects` et `v1-url-map.generated.json`, Then ils sont identiques à l'octet, 77 règles dans `_redirects` et 83 lignes dans la v1 map, et la suite de tests du site v2 est verte sans `corpus-freeze.spec.ts`.
- AC-RETIREV1-4 : Given la livraison soumise, When on cherche `apps/robusta` (hors `apps/robusta-build`), `@robusta/build`, `build:robusta-v1`, `dev:robusta-v1` et `dev:dev` dans `CLAUDE.md`, les README, les `*.archi.md` (`design-system.archi.md` compris), `.cursor/rules`, `.yarnrc.yml`, la section Next de `ROADMAP.md` et le code de `apps/robusta-build`, Then rien ne les nomme, sauf une référence `6c57bc3:apps/robusta/…` ; les journaux datés de l'epic, `decisions-and-questions.md`, les documents des features et `__done/` gardent leurs mentions.
- AC-RETIREV1-5 : Given un lecteur qui cherche un article, un brouillon jamais publié, le CV ou le routing v1, When il lit la story livrée, Then elle cite 6c57bc3, et `git show 6c57bc3:apps/robusta/<chemin>` rend le fichier.
- AC-RETIREV1-6 : Given les cas limites, When on les rejoue, Then un reste non suivi de `apps/robusta` (`node_modules`, `.next`, `tsconfig.tsbuildinfo`) ne survit pas, un `git rm -r` seul ne suffisant pas ; la racine hisse le Vite 5 de `services/scribe-intel-collector`, la build v2 ne charge que Vite 8 et le `packageExtensions` de `.yarnrc.yml` est conservé ; un changement sous `apps/dakar` seul donne toujours `skip` à la règle `ignore` de Netlify, tandis que le commit de livraison, qui change `package.json` et `yarn.lock`, donne `build` et son deploy preview sert les mêmes 77 règles.

Vérifié au submit : `yarn install --immutable` vert ; tests du site v2 verts, 60 fichiers et 717 tests (731 avec `corpus-freeze.spec.ts`) ; lint vert ; `yarn build:robusta` vert, 34 pages dont 33 indexables, 77 règles (67 permanentes, 5 gone, 5 not found), `_redirects` et v1 map identiques à l'octet à une build de HEAD d'avant la livraison ; `yarn build:dakar` vert, 23 pages ; la racine hisse Vite 5.4.18, la build v2 ne charge que Vite 8.3.2.

Vérifié après le push du 2026-11-06 (5645867, `origin/main` = `origin/epic/robusta-v2`), volet Netlify d'AC-RETIREV1-6 : le deploy de branche `epic/robusta-v2` a été construit et le deploy de production sur `main` est prêt. Sur www.robusta.build, `/` et `/articles` rendent 200, `/learn/blockchain/page/2` un 301 vers `/articles/c/blockchain`, `/learn/javascript/s/es6-7.md` un 410, `/learn/page/2` un 404 et `/en` un 301 vers `/`. Le `_redirects` local était identique à l'octet (77 règles) avant le push.

## Boundaries

### CLI API of app `@robusta/pyramids` (scripts racine) — modified

- Retirés : `yarn build:robusta-v1`, `yarn dev:robusta-v1`, `yarn dev:dev`.
- Inchangés : `build:deps`, `build:dakar`, `build:robusta`, `dev:robusta`, `dev:dakar`, `lint`, `clean`, les watchers `w:*`.
- Green set : `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`.

Aucune API de module ne change : `pyramids-layouts`, `-links`, `-ctas`, `-themes` et `-design-system` perdent un client, et rien ne dépendait de l'app `@robusta/build`.

## Décisions

- 2026-07-31 — `pyramids-layouts`, `-links` et `-ctas` restent : `apps/dakar` les consomme. Pourquoi : les supprimer sort du périmètre de la story.
- 2026-11-06 — Le corpus, les 18 brouillons et le CV partent sans copie. Pourquoi : rien ne les lit, un brouillon repris en v2 se réécrit au schéma v2, et 6c57bc3 les garde.
- 2026-11-06 — `dev:dev` et `concurrently` partent ; les watchers `w:*` restent lançables un par un. Pourquoi : `concurrently` n'avait pas d'autre utilisateur.
- 2026-11-06 — `article-slug.spec.ts` garde ses slugs en littéraux, titres et Locales lus à 6c57bc3. Pourquoi : deux Locales ont été corrigées en v2, le corpus v2 ne peut pas servir de source.
- 2026-11-06 — Les manifestes de `apps/dakar` ne bougent pas : ses imports non déclarés (`remark`, `remark-html`, `gray-matter`) restent résolus par les copies hissées du site v2. Pourquoi : une casse future se verrait dans le green set.
- 2026-11-06 — Hors dépôt : Nicolas a débranché ou supprimé le projet Vercel de `apps/robusta` avant le merge sur `main` ; celui de `apps/dakar` reste branché.

## Documentation updates

- changed la liste « Apps et modules », les commandes, la ligne vitest et la convention d'import de `CLAUDE.md`
- changed le résumé, le green set et la phrase sur `dev:dev` de `README.md`
- changed l'introduction (routing v1 relu au commit 6c57bc3), le green set, la liste des tests et la règle `ignore` Netlify de `apps/robusta-build/README.md`
- changed `root.archi.md` : liste des apps, figures, green set et décompte de pages, Vite hissé, corpus v1 figé retiré, DaisyUI
- changed les dépendances de `apps/robusta-build/robusta-build.archi.md` (Vite 5 hissé, aucun test ne lit une autre app)
- changed les consommateurs listés dans les archi de `packages/ctas`, `layouts`, `links`, `helpers` et `themes`
- changed le Client code et le Used by de `packages/robusta-design-system/design-system.archi.md`
- changed `.cursor/rules/monorepo.mdc`
- changed le paragraphe Vercel de la section Next de `ROADMAP.md` : seul `apps/dakar` reste nommé
