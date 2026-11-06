# Story : Retirer le prototype v0 `apps/robusta-design`

**Dernière mise à jour :** 2026-11-06
**Feature :** retire-robusta-design
**Infix :** RETIREDESIGN
**Status :** ACTIVE

## Story

En tant que mainteneur du dépôt, je veux supprimer `apps/robusta-design` afin que le dépôt ne garde plus de traces d'une direction visuelle abandonnée, et que la documentation ne décrive que ce qui existe.

## Contexte & objectif

`apps/robusta-design` contient le brief de la refonte (`prompt.md`), une copie du CV v1 (`uploads/resume.html`) et la maquette v0 (`v0/`, neuf fichiers HTML, JSX et CSS). Ce n'est pas un workspace : aucun `package.json`, rien ne l'installe, ne le construit ni ne l'importe. `packages/robusta-design-system` l'a remplacé le 2026-04-29 (packagify-design-system, qui avait déjà sorti cette suppression de son périmètre).

La v0 suit une direction éditoriale (Newsreader, papier chaud, encre violette) que le design system n'a pas reprise : il est parti sur le style croquis, IBM Plex et Caveat. Le site v2 a aussi écarté une partie du contenu de la v0. Sa landing ne nomme ni Toptal, ni Oracle, ni un CV, ni une disponibilité datée (AC-LANDING-3).

Story indépendante de retire-robusta-v1, qui reste la dernière de B5. Git garde tout ce qui est supprimé : d58e879 (« add Claude design system »), dernier commit qui modifie le dossier et déjà sur `main`, le porte tel qu'il sera supprimé. Une fusion de l'epic par squash ou rebase ne le perd donc pas.

Le test de la règle de build Netlify (`netlify-ignore.spec.ts`) prend ce chemin comme exemple de dossier sans manifeste. Il passe sur `apps/intel-demo`, dossier réel sans `package.json` : le dépôt simulé du test copie le vrai, et le verdict testé ne change pas.

## Ce que le dossier contient, et où cela vit ailleurs

- `prompt.md`, le brief : positionnement, parcours (Swaap, BCG, Diool, Nauto), open source (Masala Parser), communauté (Toulouse JUG, Stack Overflow), contact. Le positionnement est remplacé par celui de la landing v2 (rb-compound-positioning). Le parcours et Masala Parser ne figurent ni dans le design system ni dans `apps/robusta-build` ; seul `apps/robusta` en garde une version, que retire-robusta-v1 supprimera.
- `uploads/resume.html` : une ancienne copie de `apps/robusta/public/nicolas/resume.html`, qui a divergé depuis.
- `v0/` : la page prototype, les données `data.jsx`, les illustrations `hero-diagram.jsx`, `post-figures.jsx` et `thumbs.jsx`, dessinées dans la direction éditoriale abandonnée, et `tweaks-panel.jsx`, un outil de réglage de prototype. Le design system n'en a rien repris ; ses huit sections marketing, `FlowDiagram` compris, sont dessinées à neuf.
- `.DS_Store`, non suivi, ignoré par `.gitignore`.

## Acceptance Criteria

- AC-RETIREDESIGN-1 : Given le dépôt après la livraison, When on liste les fichiers suivis puis on lance `yarn install --immutable` et `yarn build:robusta`, Then `apps/robusta-design` n'a plus aucun fichier suivi, l'install réussit sans modifier `yarn.lock` et la build reste verte.
- AC-RETIREDESIGN-2 : Given la livraison soumise, When on cherche `apps/robusta-design` dans `CLAUDE.md`, `root.archi.md`, les README, `ROADMAP.md` et l'À faire de l'epic, Then rien ne le nomme ; le journal daté de l'epic, les documents Compound de cette feature et ceux sous `__done/` gardent leurs mentions.
- AC-RETIREDESIGN-3 : Given l'epic fusionnée dans `main`, par squash ou rebase compris, When un lecteur lance depuis `main` `git show d58e879:apps/robusta-design/prompt.md`, Then le brief s'affiche ; la story livrée cite d58e879.
- AC-RETIREDESIGN-4 : Given le diff de la livraison, When on liste ses fichiers, Then aucun n'est sous `packages/robusta-design-system` ni sous `apps/robusta-build/src` ; le `tweaks-panel.jsx` homonyme du design system reste intact.
- AC-RETIREDESIGN-5 : Given la suite de tests du site, When on lance `yarn workspace @robusta/robusta-build run test`, Then elle est verte, et un changement sous `apps/intel-demo`, dossier sans manifeste, donne toujours `skip`.
- AC-RETIREDESIGN-6 : Given le checkout local avec son `.DS_Store` non suivi, When la suppression est faite, Then `apps/robusta-design` n'existe plus sur le disque ; un `git rm -r` seul ne suffit pas.

## Boundaries

Aucune API touchée : le dossier n'est pas un workspace, rien n'en dépend, et le graphe des workspaces yarn ne change pas.

## Open Questions & Gaps

- OQ-RETIREDESIGN-1 : Supprime-t-on tout `apps/robusta-design`, brief compris, ou garde-t-on le brief, seul endroit du dépôt v2 où figurent le parcours et l'open source ?
- Proposition : tout supprimer ; la story livrée cite le dernier commit qui porte le brief, qu'on relit avec `git show`.
- Rationale : le positionnement du brief est dépassé par la landing v2, et le rétablir coûte une commande git. Le garder dans le design system y mettrait du contenu biographique qu'aucun client du module ne lit.
- Resolution:

## Documentation updates

- change la liste « Apps et modules » de `CLAUDE.md` — why: elle décrit `apps/robusta-design`, supprimé.
- change `root.archi.md` : la liste des apps, la figure du green set et le paragraphe « Hors du set » — why: les trois nomment le dossier supprimé.
