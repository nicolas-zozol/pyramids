# Design: retirer le prototype v0 `apps/robusta-design`

**Last update:** 2026-11-06
**Feature:** retire-robusta-design
**Infix:** RETIREDESIGN
**Status:** DRAFT
**Sources:** [story](retire-robusta-design.story.md), [brainstorm](retire-robusta-design.brainstorm.md), [epic](../pyramid-v2.epic.md)

## Goal

Le dossier `apps/robusta-design` disparaît en entier, brief compris, de git et du disque ; le cas « a directory without manifest » de `netlify-ignore.spec.ts` passe sur `apps/intel-demo` ; `CLAUDE.md` et `root.archi.md` cessent de le nommer. Le design suit la Proposition d'OQ-RETIREDESIGN-1, encore ouverte dans la [story](retire-robusta-design.story.md) : tout supprimer, la story livrée citant d58e879. Le pourquoi : [story](retire-robusta-design.story.md).

## Boundaries

Aucune API créée ni modifiée. `apps/robusta-design` n'est ni une app ni un module : pas de `package.json`, aucune dépendance entrante ni sortante. Le graphe des workspaces yarn et `yarn.lock` ne changent pas. Aucune frontière entre apps, modules ou packages ne bouge.

Fichiers touchés :

- `apps/robusta-design/` — supprimé : les onze fichiers suivis (`prompt.md`, `uploads/resume.html`, les neuf fichiers de `v0/`) et le `.DS_Store` non suivi.
- `apps/robusta-build/scripts/netlify-ignore.spec.ts` — internal code du package `scripts` de l'app `robusta-build`. Dans le dépôt simulé de `monorepo()`, l'entrée `apps/robusta-design/brief.md` devient `apps/intel-demo/front/src/main.ts`, fichier suivi du vrai dépôt ; la ligne `['a directory without manifest', …]` du `it.each` prend le même chemin. Aucun `package.json` n'est ajouté sous `apps/intel-demo` dans le dépôt simulé. L'API library `ignoreVerdict` de `netlify-ignore.mjs` ne change pas.
- `CLAUDE.md` — la ligne `apps/robusta-design` de la liste « Apps et modules » disparaît.
- `root.archi.md` — trois mentions : l'entrée de la liste « Apps, modules, packages », la ligne « Not workspaces, left out » de la figure, la phrase « Hors du set » du green set.

Les deux derniers suivent le plan « Documentation updates » de la story, exécuté par docman. `ROADMAP.md` (item 10) et l'À faire de l'epic sont retirés par `storyman submit`.

Hors du diff : `packages/robusta-design-system`, dont son `ui_kits/marketing/tweaks-panel.jsx` homonyme, et `apps/robusta-build/src`.

## Technical Constraints

- Le dossier est hors de la vue de yarn : le glob `apps/*` des workspaces ignore un dossier sans `package.json`. Sa suppression ne modifie pas `yarn.lock`, ce que `yarn install --immutable`, le `YARN_FLAGS` de `apps/robusta-build/netlify.toml`, vérifie.
- `.DS_Store` est ignoré (`.gitignore`, ligne 33) : `git rm -r apps/robusta-design` laisse le dossier sur le disque. La suppression finit par un `rm -rf apps/robusta-design`.
- Règle `ignore` de Netlify : le commit de livraison touche `apps/robusta-build/scripts`, donc un branch deploy construit.
- `git diff d58e879 HEAD -- apps/robusta-design` est vide et d58e879 est un ancêtre de `main` : il porte le dossier tel qu'il est supprimé.

## Requirements

- R-RETIREDESIGN-01 : `apps/robusta-design` n'a plus aucun fichier suivi et n'existe plus sur le disque du checkout.
- R-RETIREDESIGN-02 : la livraison ne modifie ni `yarn.lock` ni aucun fichier sous `packages/robusta-design-system` ou `apps/robusta-build/src`, et le green set reste vert (BR-PYRAMID-5).
- R-RETIREDESIGN-21 : le cas « a directory without manifest » de `netlify-ignore.spec.ts` prend un chemin sous `apps/intel-demo` et garde le verdict `skip` ; le premier test compte toujours 2 dossiers surveillés.
- R-RETIREDESIGN-41 : `CLAUDE.md` et `root.archi.md` ne nomment plus `apps/robusta-design`, selon le plan « Documentation updates » de la story.
- R-RETIREDESIGN-42 : la story livrée cite d58e879 comme commit qui porte le brief, lisible par `git show d58e879:apps/robusta-design/prompt.md`.

## Acceptance Criteria

- AC-RETIREDESIGN-1 : Given le dépôt après la livraison, When on liste les fichiers suivis puis on lance `yarn install --immutable` et `yarn build:robusta`, Then `apps/robusta-design` n'a plus aucun fichier suivi, l'install réussit sans modifier `yarn.lock` et la build reste verte.
- AC-RETIREDESIGN-2 : Given la livraison soumise, When on cherche `apps/robusta-design` dans `CLAUDE.md`, `root.archi.md`, les README, `ROADMAP.md` et l'À faire de l'epic, Then rien ne le nomme ; le journal daté de l'epic, les documents Compound de cette feature et ceux sous `__done/` gardent leurs mentions.
- AC-RETIREDESIGN-3 : Given l'epic fusionnée dans `main`, par squash ou rebase compris, When un lecteur lance depuis `main` `git show d58e879:apps/robusta-design/prompt.md`, Then le brief s'affiche ; la story livrée cite d58e879.
- AC-RETIREDESIGN-4 : Given le diff de la livraison, When on liste ses fichiers, Then aucun n'est sous `packages/robusta-design-system` ni sous `apps/robusta-build/src` ; le `tweaks-panel.jsx` homonyme du design system reste intact.
- AC-RETIREDESIGN-5 : Given la suite de tests du site, When on lance `yarn workspace @robusta/robusta-build run test`, Then elle est verte, et un changement sous `apps/intel-demo`, dossier sans manifeste, donne toujours `skip`.
- AC-RETIREDESIGN-6 : Given le checkout local avec son `.DS_Store` non suivi, When la suppression est faite, Then `apps/robusta-design` n'existe plus sur le disque ; un `git rm -r` seul ne suffit pas.

Edge cases to test:

- Une recherche du nom attrape `robusta-design-system` : la vérification d'AC-RETIREDESIGN-2 exclut ce suffixe, `git grep -P "robusta-design(?!-system)"`.

## Dependencies

- Depends on : aucune. Indépendante de retire-robusta-v1, dernière story de B5.
