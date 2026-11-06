# Story : Retirer le site v1 `apps/robusta`

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-robusta-v1
**Infix :** RETIREV1
**Status :** ACTIVE

## Story

En tant que mainteneur du dépôt, je veux supprimer l'app `apps/robusta` (`@robusta/build`), son corpus figé et tout ce qui la nomme, afin que le dépôt ne construise, ne teste et ne documente plus un site que plus personne ne sert.

## Contexte & objectif

www.robusta.build pointe sur Netlify depuis le 2026-11-05 : la v2 sert la production, et les adresses v1 reviennent en 301 ou 410 par le `_redirects` de restore-v1-urls, livrée le 2026-11-06. Ce `_redirects` vient de la v1 map de `apps/robusta-build`, qui ne lit rien sous `apps/robusta` ; le site v1 ne sert donc plus rien, mais il reste dans le green set, dans les scripts racine et dans la documentation.

Le corpus `apps/robusta/content/blog` a été copié et non déplacé par migrate-learn-content, puis gelé par un test qui compare les deux arbres. Il est supprimé, pas refondu dans le corpus v2, et ce test part avec lui. Débrancher `pyramids-layouts`, `pyramids-links` et `pyramids-ctas` revient ici à supprimer leur client v1 : les trois packages restent, `apps/dakar` les consomme et doit continuer à builder (décision du 2026-07-31). Aucune redirection n'est activée ni modifiée.

## Ce qui part, ce qui reste lisible

- Part : tout `apps/robusta`, sur git et sur le disque, avec son entrée de `yarn.lock` et les dépendances qu'il était seul à tirer ; les scripts racine `build:robusta-v1`, `dev:robusta-v1` et `dev:dev` ; `corpus-freeze.spec.ts` ; dans `article-slug.spec.ts`, la boucle qui lit l'arbre v1, la table des slugs restant le contrat ; le cas « the v1 site » du dépôt simulé de `netlify-ignore.spec.ts`, qui copie le vrai dépôt.
- Reste : `build:deps` construit toujours les trois packages DaisyUI pour dakar ; la v1 map et le `_redirects`, inchangés.
- Relisible : tout le contenu supprimé, par `git show 6c57bc3:apps/robusta/<chemin>`, 6c57bc3 étant la tête de `main` au 2026-11-06. Le routing v1 du README v1 ne déménage pas : la section « The v1 mapping » de `apps/robusta-build/README.md` décrit déjà l'espace d'adresses v1, et pointe vers ce commit pour le reste. Les commentaires de `v1-url-map.ts` qui citent un fichier source v1 le citent au même commit.
- Hors dépôt, pour Nicolas : supprimer le projet Vercel de `apps/robusta` s'il existe encore, une fois la livraison sur `main`. Le projet Vercel de `apps/dakar` ne change pas. Aucun AC ne porte cette action.

## Acceptance Criteria

- AC-RETIREV1-1 : Given le dépôt après la livraison, When on liste les fichiers suivis, le disque et le manifeste racine, Then `apps/robusta` n'existe ni dans git ni sur le disque, `@robusta/build` n'apparaît plus dans `yarn.lock`, et `package.json` ne porte plus `build:robusta-v1`, `dev:robusta-v1` ni `dev:dev`.
- AC-RETIREV1-2 : Given un clean checkout, When on lance le green set, `yarn install --immutable`, `yarn build:deps`, `yarn build:dakar` et `yarn build:robusta`, Then tout est vert, dakar produit ses 23 pages, et aucun fichier sous `packages/` n'est supprimé.
- AC-RETIREV1-3 : Given la build du site v2 avant et après la livraison, When on compare `dist/client/_redirects` et `v1-url-map.generated.json`, Then ils sont identiques à l'octet, 77 règles et 83 lignes, et la suite de tests du site v2 est verte sans `corpus-freeze.spec.ts`.
- AC-RETIREV1-4 : Given la livraison soumise, When on cherche `apps/robusta` (hors `apps/robusta-build`), `@robusta/build`, `build:robusta-v1` et `dev:dev` dans `CLAUDE.md`, les README, les `*.archi.md`, `.cursor/rules`, `.yarnrc.yml`, la section Next de `ROADMAP.md` et le code de `apps/robusta-build`, Then rien ne les nomme, sauf une référence `6c57bc3:apps/robusta/…` ; les journaux datés de l'epic, `decisions-and-questions.md`, les documents des features et `__done/` gardent leurs mentions.
- AC-RETIREV1-5 : Given un lecteur qui cherche un article, le CV ou le routing v1, When il lit la story livrée, Then elle cite 6c57bc3, et `git show 6c57bc3:apps/robusta/<chemin>` rend le fichier.
- AC-RETIREV1-6 : Given les cas limites, When on les rejoue, Then un reste non suivi de `apps/robusta` (`node_modules`, `.next`, `tsconfig.tsbuildinfo`) ne survit pas, un `git rm -r` seul ne suffisant pas ; la build v2 ne charge toujours qu'une majeure de Vite alors que la v1 ne hisse plus Vite 6 à la racine ; un changement sous `apps/dakar` donne toujours `skip` à la règle `ignore` de Netlify.

## Boundaries

### CLI API of app `@robusta/pyramids` (scripts racine) — modified

- Retirés : `yarn build:robusta-v1`, `yarn dev:robusta-v1`, `yarn dev:dev`.
- Inchangés : `build:deps`, `build:dakar`, `build:robusta`, `dev:robusta`, `dev:dakar`, les watchers `w:*`.
- Green set : `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`.

Aucune API de module ne change : `pyramids-layouts`, `-links`, `-ctas`, `-themes` et `-design-system` perdent un client, et rien ne dépendait de l'app `@robusta/build`.

## Open Questions & Gaps

- OQ-RETIREV1-1 : Les 18 brouillons d'articles jamais publiés de la v1 : les supprimer sans copie, ou les garder dans `documentation/` pour les publier un jour en v2 ?
- Proposition : les supprimer sans copie ; ils restent relisibles par `git show 6c57bc3:apps/robusta/content/blog-unpublished/<chemin>`.
- Rationale : rien ne les lit, ils pèsent 7 Mo avec leurs images, et un brouillon repris en v2 se réécrit au schéma v2 de toute façon.
- Resolution:

- OQ-RETIREV1-2 : Le CV de `public/nicolas` (PDF, pages HTML, icônes) part-il sans copie, comme la maquette v0 ?
- Proposition : oui, sans copie, relisible au commit 6c57bc3.
- Rationale : le portfolio est refait sur le design system (2026-07-30) et le parcours de l'auteur vit déjà dans `documentation/author-brief.md`.
- Resolution: lgtm (storyman)

- OQ-RETIREV1-3 : `dev:dev` lançait les watchers avec le serveur v1 : le supprimer avec `concurrently`, son seul utilisateur ?
- Proposition : supprimer les deux ; les watchers `w:*` restent lançables un par un.
- Rationale : sans v1 le script n'a plus de serveur à lancer, et dakar n'en a jamais eu.
- Resolution: lgtm (storyman)

## Documentation updates

- change la liste « Apps et modules », les commandes, la ligne vitest et la convention d'import de `CLAUDE.md` — why: `apps/robusta` et ses scripts n'existent plus.
- change le résumé, le green set et la phrase sur `dev:dev` de `README.md` — why: même raison.
- change l'introduction et le green set de `apps/robusta-build/README.md` — why: le routing v1 se relit au commit 6c57bc3, la section v1 mapping reste.
- change `root.archi.md` : liste des apps, figure du flux de contenu, green set et décompte de pages, Vite hissé, corpus v1 figé, DaisyUI — why: le corpus v1 et le gel n'existent plus.
- change `apps/robusta-build/robusta-build.archi.md` — why: plus aucun test du site ne lit une autre app.
- change les consommateurs listés dans les archi de `packages/ctas`, `layouts`, `links`, `helpers` et `themes` — why: `apps/dakar` reste leur seul client app.
- change `.cursor/rules/monorepo.mdc` — why: il présente `apps/robusta` comme site actif.
- change les paragraphes Vercel de la section Next de `ROADMAP.md` — why: seul `apps/dakar` reste sur Vercel.
