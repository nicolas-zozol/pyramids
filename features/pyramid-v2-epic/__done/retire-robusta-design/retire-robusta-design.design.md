# Design: retirer le prototype v0 `apps/robusta-design` et garder son brief

**Last update:** 2026-11-06
**Feature:** retire-robusta-design
**Infix:** RETIREDESIGN
**Status:** IMPLEMENTED (2026-11-06, commit 3331afc)
**Sources:** [story](retire-robusta-design.story.md), [brainstorm](retire-robusta-design.brainstorm.md), [epic](../../pyramid-v2.epic.md)

## Goal

Le brief `apps/robusta-design/prompt.md` passe par `git mv`, à l'octet près, dans `documentation/author-brief.md` ; `v0/`, `uploads/` et le `.DS_Store` non suivi sont supprimés, et `apps/robusta-design` disparaît de git et du disque. Le cas « a directory without manifest » de `netlify-ignore.spec.ts` passe sur `apps/intel-demo` ; `CLAUDE.md` et `root.archi.md` cessent de nommer le dossier. Le pourquoi : [story](retire-robusta-design.story.md).

## Boundaries

Aucune API créée ni modifiée. `apps/robusta-design` n'est ni une app ni un module : pas de `package.json`, aucune dépendance entrante ni sortante. `documentation/` n'est lu par aucune build. Le graphe des workspaces yarn et `yarn.lock` ne changent pas. Aucune frontière entre apps, modules ou packages ne bouge.

Fichiers touchés :

- `apps/robusta-design/prompt.md` → `documentation/author-brief.md` — déplacé par `git mv`, contenu inchangé. Le brief ne cite aucun fichier du dossier ni le nom `apps/robusta-design`.
- `apps/robusta-design/` — le reste est supprimé : les dix fichiers suivis (`uploads/resume.html`, les neuf fichiers de `v0/`), sans copie ailleurs, et le `.DS_Store` non suivi. Le dossier n'existe plus ensuite.
- `apps/robusta-build/scripts/netlify-ignore.spec.ts` — internal code du package `scripts` de l'app `robusta-build`. Dans le dépôt simulé de `monorepo()`, l'entrée `apps/robusta-design/brief.md` devient `apps/intel-demo/front/src/main.ts`, fichier suivi du vrai dépôt ; la ligne `['a directory without manifest', …]` du `it.each` prend le même chemin. Aucun `package.json` n'est ajouté sous `apps/intel-demo` dans le dépôt simulé. L'API library `ignoreVerdict` de `netlify-ignore.mjs` ne change pas.
- `CLAUDE.md` — la ligne `apps/robusta-design` de la liste « Apps et modules » disparaît.
- `root.archi.md` — trois mentions : l'entrée de la liste « Apps, modules, packages », la ligne « Not workspaces, left out » de la figure, la phrase « Hors du set » du green set.

Les deux derniers suivent le plan « Documentation updates » de la story, exécuté par docman. `ROADMAP.md` (item 10) et l'À faire de l'epic sont retirés par `storyman submit`. `README.md` décrit déjà `documentation/*` : rien à y ajouter.

Hors du diff : `packages/robusta-design-system`, dont son `ui_kits/marketing/tweaks-panel.jsx` homonyme, et `apps/robusta-build/src`.

## Technical Constraints

- Le dossier est hors de la vue de yarn : le glob `apps/*` des workspaces ignore un dossier sans `package.json`. Sa suppression ne modifie pas `yarn.lock`, ce que `yarn install --immutable`, le `YARN_FLAGS` de `apps/robusta-build/netlify.toml`, vérifie.
- `git log --follow` repose sur la détection de renommage. Un renommage exact (contenu identique) est toujours apparié, quelle que soit la taille du commit et la valeur de `diff.renameLimit` : le commit squashé de l'epic garde donc le lien. Aucune édition du brief dans la livraison, ni dans le reste de l'epic avant la fusion.
- `git diff d58e879 HEAD -- apps/robusta-design` est vide et d58e879 est un ancêtre de `main` : il porte `prompt.md`, `v0/` et `uploads/` tels qu'ils sont déplacés ou supprimés.
- `.DS_Store` est ignoré (`.gitignore`, ligne 33) : `git rm -r apps/robusta-design` laisse le dossier sur le disque. La suppression finit par un `rm -rf apps/robusta-design`, après le `git mv`.
- Règle `ignore` de Netlify : le commit de livraison touche `apps/robusta-build/scripts`, donc un branch deploy construit.

## Requirements

- R-RETIREDESIGN-01 : `apps/robusta-design` n'a plus aucun fichier suivi et n'existe plus sur le disque du checkout ; `v0/` et `uploads/` sont supprimés sans copie ailleurs.
- R-RETIREDESIGN-02 : la livraison ne modifie ni `yarn.lock` ni aucun fichier sous `packages/robusta-design-system` ou `apps/robusta-build/src`, et le green set reste vert (BR-PYRAMID-5).
- R-RETIREDESIGN-21 : le cas « a directory without manifest » de `netlify-ignore.spec.ts` prend un chemin sous `apps/intel-demo` et garde le verdict `skip` ; le premier test compte toujours 2 dossiers surveillés.
- R-RETIREDESIGN-41 : `CLAUDE.md` et `root.archi.md` ne nomment plus `apps/robusta-design`, selon le plan « Documentation updates » de la story.
- R-RETIREDESIGN-42 : `documentation/author-brief.md` naît d'un `git mv` de `apps/robusta-design/prompt.md`, identique à l'octet à `d58e879:apps/robusta-design/prompt.md`, et `git log --follow` sur ce fichier remonte jusqu'à d58e879.
- R-RETIREDESIGN-43 : la story livrée cite d58e879 comme commit qui porte `v0/` et `uploads/`, relisibles par `git show d58e879:<chemin>`.

## Acceptance Criteria

- AC-RETIREDESIGN-1 : Given le dépôt après la livraison, When on liste les fichiers suivis puis on lance `yarn install --immutable` et `yarn build:robusta`, Then `apps/robusta-design` n'a plus aucun fichier suivi, `v0/` et `uploads/` sont supprimés sans copie ailleurs, l'install réussit sans modifier `yarn.lock` et la build reste verte.
- AC-RETIREDESIGN-2 : Given la livraison soumise, When on cherche `apps/robusta-design` dans `CLAUDE.md`, `root.archi.md`, les README, `ROADMAP.md`, l'À faire de l'epic et `documentation/author-brief.md`, Then rien ne le nomme ; le journal daté de l'epic, les documents Compound de cette feature et ceux sous `__done/` gardent leurs mentions.
- AC-RETIREDESIGN-3 : Given l'epic fusionnée dans `main`, par squash ou rebase compris, When un lecteur ouvre `documentation/author-brief.md`, Then son contenu est identique à l'octet à `d58e879:apps/robusta-design/prompt.md`, et `git log --follow` sur ce fichier remonte jusqu'à d58e879 ; `v0/` et `uploads/` se relisent par `git show d58e879:<chemin>`, et la story livrée cite d58e879.
- AC-RETIREDESIGN-4 : Given le diff de la livraison, When on liste ses fichiers, Then aucun n'est sous `packages/robusta-design-system` ni sous `apps/robusta-build/src` ; le `tweaks-panel.jsx` homonyme du design system reste intact.
- AC-RETIREDESIGN-5 : Given la suite de tests du site, When on lance `yarn workspace @robusta/robusta-build run test`, Then elle est verte, et un changement sous `apps/intel-demo`, dossier sans manifeste, donne toujours `skip`.
- AC-RETIREDESIGN-6 : Given le checkout local avec son `.DS_Store` non suivi, When la suppression est faite, Then `apps/robusta-design` n'existe plus sur le disque ; un `git rm -r` seul ne suffit pas.

Edge cases to test:

- Une recherche du nom attrape `robusta-design-system` : la vérification d'AC-RETIREDESIGN-2 exclut ce suffixe, `git grep -P "robusta-design(?!-system)"`.
- Le commit de livraison montre le brief comme renommage et non comme ajout plus suppression : `git show -M --summary` affiche `rename apps/robusta-design/prompt.md => documentation/author-brief.md (100%)`.

## Dependencies

- Depends on : aucune. Indépendante de retire-robusta-v1, dernière story de B5.
