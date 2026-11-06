# Story : Retirer le prototype v0 `apps/robusta-design` et garder son brief

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-robusta-design
**Infix :** RETIREDESIGN
**Status :** SUBMITTED (2026-11-06, commit 3331afc)

## Story

En tant que mainteneur du dépôt, je veux supprimer la maquette v0 de `apps/robusta-design` et ranger son brief dans `documentation/`, afin que le dépôt ne garde plus de traces d'une direction visuelle abandonnée, que la documentation ne décrive que ce qui existe, et que le parcours de l'auteur reste disponible.

## Contexte & objectif

`apps/robusta-design` n'était pas un workspace : le brief de la refonte, une copie du CV v1 et la maquette v0, dans une direction éditoriale que `packages/robusta-design-system` n'a pas reprise. La maquette est supprimée ; le brief est gardé, seul endroit du dépôt v2 qui porte le parcours de l'auteur, source d'une future page « À propos ».

## Où le contenu est allé

- `prompt.md` : déplacé à l'octet près dans `documentation/author-brief.md` ; `git log --follow` remonte jusqu'à d58e879.
- `uploads/resume.html` et les neuf fichiers de `v0/` : supprimés sans copie. d58e879 (« add Claude design system »), déjà sur `main`, les porte tels qu'ils ont été supprimés : `git show d58e879:apps/robusta-design/<chemin>`.
- `.DS_Store`, non suivi : supprimé du disque. Le dossier n'existe plus.

## Livré

### Requirements

- R-RETIREDESIGN-01 : `apps/robusta-design` n'a plus aucun fichier suivi et n'existe plus sur le disque du checkout ; `v0/` et `uploads/` sont supprimés sans copie ailleurs.
- R-RETIREDESIGN-02 : la livraison ne modifie ni `yarn.lock` ni aucun fichier sous `packages/robusta-design-system` ou `apps/robusta-build/src`, et le green set reste vert (BR-PYRAMID-5).
- R-RETIREDESIGN-21 : le cas « a directory without manifest » de `netlify-ignore.spec.ts` prend un chemin sous `apps/intel-demo` et garde le verdict `skip` ; le premier test compte toujours 2 dossiers surveillés.
- R-RETIREDESIGN-41 : `CLAUDE.md` et `root.archi.md` ne nomment plus `apps/robusta-design`, selon le plan « Documentation updates » de la story.
- R-RETIREDESIGN-42 : `documentation/author-brief.md` naît d'un `git mv` de `apps/robusta-design/prompt.md`, identique à l'octet à `d58e879:apps/robusta-design/prompt.md`, et `git log --follow` sur ce fichier remonte jusqu'à d58e879.
- R-RETIREDESIGN-43 : la story livrée cite d58e879 comme commit qui porte `v0/` et `uploads/`, relisibles par `git show d58e879:<chemin>`.

### Acceptance Criteria

- AC-RETIREDESIGN-1 : Given le dépôt après la livraison, When on liste les fichiers suivis puis on lance `yarn install --immutable` et `yarn build:robusta`, Then `apps/robusta-design` n'a plus aucun fichier suivi, `v0/` et `uploads/` sont supprimés sans copie ailleurs, l'install réussit sans modifier `yarn.lock` et la build reste verte.
- AC-RETIREDESIGN-2 : Given la livraison soumise, When on cherche `apps/robusta-design` dans `CLAUDE.md`, `root.archi.md`, les README, `ROADMAP.md`, l'À faire de l'epic et `documentation/author-brief.md`, Then rien ne le nomme ; le journal daté de l'epic, les documents Compound de cette feature et ceux sous `__done/` gardent leurs mentions.
- AC-RETIREDESIGN-3 : Given l'epic fusionnée dans `main`, par squash ou rebase compris, When un lecteur ouvre `documentation/author-brief.md`, Then son contenu est identique à l'octet à `d58e879:apps/robusta-design/prompt.md`, et `git log --follow` sur ce fichier remonte jusqu'à d58e879 ; `v0/` et `uploads/` se relisent par `git show d58e879:<chemin>`, et la story livrée cite d58e879.
- AC-RETIREDESIGN-4 : Given le diff de la livraison, When on liste ses fichiers, Then aucun n'est sous `packages/robusta-design-system` ni sous `apps/robusta-build/src` ; le `tweaks-panel.jsx` homonyme du design system reste intact.
- AC-RETIREDESIGN-5 : Given la suite de tests du site, When on lance `yarn workspace @robusta/robusta-build run test`, Then elle est verte, et un changement sous `apps/intel-demo`, dossier sans manifeste, donne toujours `skip`.
- AC-RETIREDESIGN-6 : Given le checkout local avec son `.DS_Store` non suivi, When la suppression est faite, Then `apps/robusta-design` n'existe plus sur le disque ; un `git rm -r` seul ne suffit pas.

## Boundaries

Aucune API touchée : le dossier n'était pas un workspace, rien n'en dépendait, et le graphe des workspaces yarn ne change pas. `documentation/` n'est lu par aucune build. Seul code touché : le dépôt simulé de `apps/robusta-build/scripts/netlify-ignore.spec.ts`, qui prend `apps/intel-demo/front/src/main.ts` comme dossier sans manifeste.

## Décisions

- 2026-11-06 — Le brief est gardé, contre la Proposition de tout supprimer (OQ-RETIREDESIGN-1, tranchée par Nicolas). Pourquoi : le parcours, Masala Parser et le Toulouse JUG n'existent nulle part ailleurs en v2, et la landing les exclut exprès (AC-LANDING-3).
- 2026-11-06 — Nom `documentation/author-brief.md`, déplacé par `git mv` sans édition (boss). Pourquoi : un renommage exact garde `git log --follow`, même après une fusion par squash.
- 2026-11-06 — Le test Netlify passe sur `apps/intel-demo`, dossier réel sans `package.json` (OQ-RETIREDESIGN-2, `lgtm (storyman)`). Pourquoi : le dépôt simulé copie le vrai, et le verdict testé ne change pas.

## Documentation updates

- changed la liste « Apps et modules » de `CLAUDE.md` : la ligne `apps/robusta-design` retirée.
- changed `root.archi.md` : la liste des apps, la figure du green set et le paragraphe « Hors du set » ne nomment plus le dossier.
