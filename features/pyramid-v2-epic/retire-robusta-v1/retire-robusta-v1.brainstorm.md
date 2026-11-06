# Brainstorm : retire-robusta-v1

**Date :** 2026-11-06
**Participants :** bsman (autonomous)
**Infix :** RETIREV1
**Source :** `features/pyramid-v2-epic/retire-robusta-v1/retire-robusta-v1.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Ce brainstorm suit la Proposition de l'entrée encore ouverte de la story, OQ-RETIREV1-1 : les 18 brouillons de `content/blog-unpublished` partent sans copie, relisibles au commit 6c57bc3. OQ-RETIREV1-2 (le CV part sans copie) et OQ-RETIREV1-3 (`dev:dev` et `concurrently` partent) sont signées et acquises.

Vérifié dans le dépôt le 2026-11-06 :

- 6c57bc3 est la tête de `main` et de `origin/main`, et `git show 6c57bc3:apps/robusta/README.md` rend le fichier.
- `apps/robusta` : 731 fichiers suivis, dont 124 sous `content` (84 dans `blog`, 40 dans `blog-unpublished`, soit 18 brouillons `.md` et leurs images, 7 Mo) et 481 sous `public` (319 pour `nicolas`, 2,6 Mo). Restes non suivis sur le disque : `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, des `.DS_Store`. Aucun `.env`.
- `yarn build:dakar` : 23/23 pages, avec la v1 encore présente.
- `dist/client/_redirects` : 77 règles plus une ligne de commentaire, 78 lignes. `v1-url-map.generated.json` : 83 lignes de map (`rows`), 624 lignes de fichier.
- Install d'essai sans `apps/robusta` ni `concurrently`, sur une copie du dépôt : `yarn.lock` perd 855 lignes et en ré-indexe 9, `@robusta/build` et `next@15.1.8` disparaissent. La racine hisse alors le Vite 5.4.18 de `services/scribe-intel-collector` ; le vitest 3 de `pyramids-helpers` et `scribe-intel` garde un Vite 6.4.3 imbriqué ; `@tanstack/start-plugin-core`, `react-start`, `react-start-rsc` et `router-plugin` du site v2 résolvent tous Vite 8.3.2.

---

## Acceptance Criteria challenge

- AC-RETIREV1-1 : testable, suffisant. « Ni sur le disque » couvre les restes non suivis.
- AC-RETIREV1-2 : testable, nombre exact (23/23 vérifié). Le langage est celui du mainteneur, la persona de la story.
- AC-RETIREV1-3 : testable, nombres exacts mais ambigus : « 77 règles et 83 lignes » mélange deux fichiers. Proposé à storyman : « 77 règles dans `_redirects`, 83 lignes dans la v1 map ».
- AC-RETIREV1-4 : testable, incomplet sur deux points. La liste cherchée omet `dev:robusta-v1`, que `CLAUDE.md` nomme. `packages/robusta-design-system/design-system.archi.md` nomme `@robusta/build` deux fois (la page `_design-test` de v1 était un client du design system) et manque au plan de Documentation updates ; sans lui, AC-4 échoue.
- AC-RETIREV1-5 : testable. Il nomme l'article, le CV et le routing v1, pas les brouillons qui partent sans copie (OQ-RETIREV1-1 de la story).
- AC-RETIREV1-6 : testable. Le cas Vite tient (vérifié ci-dessus), mais la racine ne devient pas vide de Vite : elle passe au Vite 5 de `services/scribe-intel-collector`. Le `packageExtensions` de `.yarnrc.yml` reste donc nécessaire ; seul son commentaire, qui nomme `apps/robusta`, change.

Cas limites métier proposés à storyman :

- Given le commit de livraison sur un branch deploy Netlify, When la règle `ignore` le juge, Then elle donne `build`, `package.json` et `yarn.lock` ayant changé, et le deploy preview sert les mêmes 77 règles.
- Given un lecteur qui cherche un brouillon jamais publié de la v1, When il lit la story livrée, Then `git show 6c57bc3:apps/robusta/content/blog-unpublished/<chemin>` rend le fichier.
- Given la racine qui hisse désormais le Vite 5 de `services/scribe-intel-collector`, When on construit le site v2, Then il ne charge que Vite 8, et le `packageExtensions` de `.yarnrc.yml` est conservé.

---

## 1. Product Role

Problème : le dépôt construit, teste et documente un site que plus personne ne sert depuis le 2026-11-05.

**Décision (autonome):** une story de suppression pure. Elle retire `apps/robusta`, son corpus figé et ses mentions, et ne crée ni ne déplace aucun code.

**Rationale:** le `_redirects` vient de la v1 map du site v2, qui ne lit rien sous `apps/robusta` (vérifié : aucun script `emit-*` ni `check-*` ne l'atteint).

---

## 2. Target Audience

Problème : qui subit le site v1 resté en place.

**Décision (autonome):** une seule persona, le mainteneur du dépôt, Nicolas, et les agents qui lisent `CLAUDE.md`, `.cursor/rules` et les archi. Aucun visiteur : les adresses v1 sont déjà servies par le site v2.

**Rationale:** la livraison ne change rien à ce que sert www.robusta.build.

---

## 3. Core Problem

Problème : la v1 coûte encore à chaque install et chaque build. Elle tire 855 lignes de `yarn.lock` (Next 15.1.8, prosemirror, `@masala`, `vite-tsconfig-paths`), fixe le Vite hissé à la racine, garde deux tests du site v2 qui lisent une autre app, et la documentation la présente comme active.

**Décision (autonome):** supprimer, pas archiver dans le dépôt. Tout reste relisible au commit 6c57bc3.

**Rationale:** git est l'archive ; une copie dans `documentation/` serait un second corpus à tenir.

---

## 4. Unique Value Proposition

Options considérées :

- Supprimer `apps/robusta` en entier, garder les trois packages DaisyUI pour dakar : la portée de la story.
- Supprimer aussi `pyramids-layouts`, `-links`, `-ctas` : exclu par la décision du 2026-07-31 de l'epic, dakar étant hors du périmètre v2.

**Décision (autonome):** la première.

**Rationale:** BR-PYRAMID-12 fait de dakar le propriétaire de ce qu'il est seul à utiliser, mais rapatrier les trois modules dans dakar revient à migrer un site que l'epic a décidé de ne pas toucher.

---

## 5. Functional Scope

Dedans :

- `apps/robusta`, suivi et non suivi ; son entrée de `yarn.lock` et ce qu'il était seul à tirer ; `concurrently` à la racine.
- Les scripts racine `build:robusta-v1`, `dev:robusta-v1`, `dev:dev`.
- `corpus-freeze.spec.ts` ; la boucle de `article-slug.spec.ts` qui lit l'arbre v1 ; le cas « the v1 site » et les deux fichiers `apps/robusta/*` du dépôt simulé de `netlify-ignore.spec.ts`.
- Les commentaires du code v2 qui nomment un fichier v1 : `v1-url-map.ts` (deux), `article-slug.ts` (un) et `migrated-corpus.spec.ts` (un), réécrits au commit 6c57bc3.
- Le commentaire de `.yarnrc.yml`, réattribué au Vite 5 de `services/scribe-intel-collector`.

Dehors :

- Les trois packages DaisyUI et `pyramids-themes`, qui restent ; aucune API de module ne change.
- La plage de peer `next ^15.1.8` de `pyramids-links` et `-ctas` : elle reste satisfaite par le 15.5.3 de dakar.
- Les manifestes de `apps/dakar`, `services/` et `apps/intel-demo`.
- Toute redirection.

**Décision (autonome):** les lignes `public/robots.txt`, `public/sitemap.xml` et `public/sitemap-0.xml` du `.gitignore` racine restent, comme `.vercel`.

**Rationale:** inoffensives, hors de la liste de AC-RETIREV1-4, et `.vercel` sert encore le projet de dakar.

---

## 6. Core Features

### Feature: suppression de l'app v1

Capability : `apps/robusta` disparaît de git, du disque et de `yarn.lock` ; `yarn install` régénère le lockfile.

Acceptance Criteria : AC-RETIREV1-1, AC-RETIREV1-6 (premier cas).

Test Approach : `git ls-files apps/robusta` vide, `test ! -e apps/robusta`, `grep @robusta/build yarn.lock` vide, puis `yarn install --immutable` depuis un clean checkout.

---

### Feature: green set sans la v1

Capability : le green set perd `build:robusta-v1` et reste vert ; dakar garde ses 23 pages.

Acceptance Criteria : AC-RETIREV1-2, AC-RETIREV1-6 (deuxième cas).

- Proposé à storyman : Given la racine qui hisse le Vite 5 de `services/scribe-intel-collector`, When on construit le site v2, Then il ne charge que Vite 8.

Test Approach : green set depuis un clean checkout, décompte des pages dakar dans la sortie de `next build`, résolution de `vite` depuis les plugins TanStack du site v2.

---

### Feature: adresses v1 inchangées, tests v2 sans lecture inter-app

Capability : `_redirects` et la v1 map restent identiques à l'octet ; la suite vitest du site v2 ne lit plus aucune autre app.

Acceptance Criteria : AC-RETIREV1-3, AC-RETIREV1-6 (troisième cas).

- Proposé à storyman : Given le commit de livraison sur un branch deploy, When la règle `ignore` le juge, Then elle donne `build` et le preview sert les mêmes 77 règles.

Test Approach : `cmp` de `dist/client/_redirects` et de `v1-url-map.generated.json` entre 6c57bc3 et la livraison ; `yarn workspace @robusta/robusta-build run test` ; `netlify-ignore.spec.ts` vert sans son cas v1.

---

### Feature: documentation sans site v1

Capability : la documentation vivante ne présente plus la v1 ; les journaux gardent leurs mentions ; tout reste relisible à 6c57bc3.

Acceptance Criteria : AC-RETIREV1-4, AC-RETIREV1-5.

- Proposé à storyman : Given un lecteur qui cherche un brouillon v1, When il lit la story livrée, Then `git show 6c57bc3:apps/robusta/content/blog-unpublished/<chemin>` rend le fichier.

Test Approach : `git grep` des termes de AC-4, `dev:robusta-v1` compris, sur le périmètre de AC-4 ; `git show` d'un article, du CV, d'un brouillon et du README v1.

---

## 7. Critical Edge Cases

Problème : les cas que les AC ne couvrent pas.

- Le commit de livraison change des install files : Netlify le construit sur un branch deploy. Proposé à storyman (section Acceptance Criteria challenge).
- La racine change de Vite hissé, de 6 à 5. Couvert par AC-6, à préciser.
- dakar importe `remark`, `remark-html` et `gray-matter` sans les déclarer ; après la livraison, seul le site v2 les déclare, aux mêmes plages, et ils restent hissés à la racine. `daisyui` reste une devDependency racine. Voir OQ-RETIREV1-5.
- Le projet Vercel de la v1, s'il est encore relié au dépôt, construira un dossier absent à chaque push sur `main`. Voir OQ-RETIREV1-4.

**Décision (autonome):** aucun cas de validation d'entrée ; seuls les trois cas proposés à storyman sont métier.

**Rationale:** les deux derniers points dépendent d'un arbitrage ou d'un état hors dépôt.

---

## 8. Non-Functional Constraints

- BR-PYRAMID-5 : le green set aboutit depuis un clean checkout ; il perd un membre, la règle ne change pas.
- Install plus courte : 855 lignes de lockfile en moins, Next 15.1.8 et ses binaires `@next/swc` compris.
- Aucun coût ni risque de production : www.robusta.build ne dépend d'aucun fichier supprimé.

**Décision (autonome):** aucune mesure de temps d'install ou de build dans les AC.

**Rationale:** le gain est un effet, pas un contrat.

---

## 9. External Dependencies

- Netlify : la règle `ignore` et la build de production ; inchangées.
- Vercel : le projet de dakar, inchangé ; celui de la v1, à supprimer par Nicolas (OQ-RETIREV1-4).
- yarn 4.17.1 : régénère `yarn.lock` ; Netlify l'installe en `--immutable`.

**Décision (autonome):** aucune dépendance nouvelle.

**Rationale:** la story ne fait que retirer.

---

## 10. Major Risks

- Hoisting : le Vite racine passe de 6 à 5. Couvert par le `packageExtensions` en place et par AC-6 ; vérifié par l'install d'essai.
- Dépendances fantômes de dakar : sa build tient parce que le site v2 déclare `remark`, `remark-html` et `gray-matter`. Le jour où le site v2 en lâche une, `build:dakar` casse dans le green set, pas en production.
- `pyramids-themes` n'a plus aucun import dans le dépôt : `layouts` et `ctas` le déclarent sans l'importer, et la v1 le déclarait aussi sans l'importer. Hors de la story ; candidat au ROADMAP.
- Lien de relecture : 6c57bc3 est déjà sur `origin/main`, aucune réécriture d'historique ne le perd.

**Décision (autonome):** aucune mitigation nouvelle dans la story.

**Rationale:** chaque risque est soit couvert par un AC, soit hors de la portée fixée par l'epic.

---

## 11. Boundaries

Une seule frontière change, celle que la story décrit déjà. La livraison retire aussi la dernière lecture inter-app du site v2 : `corpus-freeze.spec.ts` et la boucle de `article-slug.spec.ts` sont ses seuls fichiers qui atteignent `apps/robusta`. Aucune flèche ne pointait vers `@robusta/build` : rien n'en dépendait.

### CLI API of app `@robusta/pyramids` (scripts racine) — modified

- Retirés : `yarn build:robusta-v1`, `yarn dev:robusta-v1`, `yarn dev:dev`.
- Inchangés : `build:deps`, `build:dakar`, `build:robusta`, `dev:robusta`, `dev:dakar`, `lint`, `clean`, les watchers `w:*` et `w:deps`.
- Green set : `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`.
- Workspaces : `apps/*`, `services/*`, `packages/*` inchangés ; `apps/robusta` en sort par sa suppression.

Les modules `pyramids-layouts`, `-links`, `-ctas`, `-themes` et `-design-system` perdent un client, sans changement d'API.

**Décision (autonome):** aucun bloc de module.

**Rationale:** aucune API de module ne change, et le skill boundaries ne liste que le nouveau ou le modifié.

---

## Open Questions & Gaps

- OQ-RETIREV1-4 : Le projet Vercel de la v1 : le supprimer avant le merge sur `main`, pour qu'aucun push ne lance une build sur un dossier absent, ou après, comme prévu ?
- Proposition : le supprimer, ou le détacher du dépôt, avant le merge ; celui de dakar ne bouge pas.
- Rationale : www.robusta.build pointe sur Netlify depuis le 2026-11-05 ; seul Nicolas sait si ce projet existe encore et sert une autre adresse.
- Resolution:

---

## Next Steps

- `storyman update retire-robusta-v1 avec brainstorm` : préciser AC-3 (« 77 règles dans `_redirects`, 83 lignes dans la v1 map »), ajouter `dev:robusta-v1` à AC-4, ajouter `design-system.archi.md` au plan de Documentation updates, nommer les brouillons dans AC-5, préciser le cas Vite de AC-6, reprendre les trois cas limites proposés, plier OQ-RETIREV1-5.
- designman : lister les quatre commentaires du code v2 à réécrire au commit 6c57bc3 et le commentaire de `.yarnrc.yml`.
- ROADMAP, hors epic : candidat sur `pyramids-themes`, qu'aucun fichier n'importe plus.
