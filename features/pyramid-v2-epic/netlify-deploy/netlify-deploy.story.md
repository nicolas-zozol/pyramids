# Story : Déployer le site v2 depuis le projet Netlify robusta-build

**Dernière mise à jour :** 2026-10-06
**Feature :** netlify-deploy
**Infix :** NETLIFY
**Status :** ACTIVE

## Story

En tant que Nicolas, éditeur des sites Robusta, je veux le projet Netlify `robusta-build` relié à ce dépôt et pilotable depuis mon poste en ligne de commande, afin de déployer le site v2 sans repasser par le dashboard et sans dépenser de crédit sur un commit qui ne le concerne pas.

## Contexte & objectif

Le projet Netlify `robusta-build` existe déjà, dans une équipe en offre Free, mais il est périmé : relié à l'ancien dépôt `nicolas-zozol/robusta-build`, dernier déploiement le 2025-01-14 (l'ancien site Next), domaine `www.robusta.build` déclaré, aucune variable d'environnement. Le DNS de robusta.build pointe toujours sur Vercel, donc Netlify ne sert rien en public. Cette story n'y touche pas : la bascule du domaine appartient à go-live.

tanstack-start-migration a écrit `apps/robusta-build/netlify.toml` et attend ce projet pour son premier déploiement de branche `dev`. Cette story livre ce dont ce déploiement dépend : le projet relié et réglé, la clé et la CLI utilisables depuis le dépôt, et une règle d'ignore qui suit le graphe des workspaces au lieu d'une liste de chemins écrite à la main, où un package ajouté aux dépendances du site et oublié dans la liste ne se déploierait jamais.

Les crédits comptent : un déploiement de production en coûte 15, sur 300 par mois et par équipe en Free, avec un plafond strict qui met tous les sites de l'équipe en pause. Un brouillon publié depuis la CLI n'en coûte aucun.

## Réglages du projet robusta-build

- dépôt `nicolas-zozol/pyramids`, à la place de `nicolas-zozol/robusta-build`
- package directory `apps/robusta-build`, base directory vide
- commande de build et publish directory vides au dashboard : `netlify.toml` les porte
- branche de production `main`, déploiements de branche pour `dev` seule
- Pretty URLs actif
- aucune variable d'environnement au dashboard, en particulier ni `NODE_VERSION`, ni `COREPACK_*`, ni `YARN_VERSION`
- le domaine `www.robusta.build` reste déclaré tel quel

## Acceptance Criteria

- AC-NETLIFY-1 : Étant donné le projet `robusta-build`, quand Nicolas ouvre ses réglages, alors il lit chacun des réglages listés plus haut, et un push sur l'ancien dépôt `nicolas-zozol/robusta-build` ne déclenche plus aucun build.
- AC-NETLIFY-2 : Étant donné un poste où la clé Netlify est installée, quand Nicolas lance la CLI Netlify dans le dépôt, alors elle s'authentifie sans connexion interactive et se rattache au projet `robusta-build` ; ni la clé ni le dossier `.netlify/` qu'écrit ce rattachement n'apparaissent dans `git status`.
- AC-NETLIFY-3 : Étant donné le site construit en local, quand Nicolas publie un brouillon depuis la CLI, alors Netlify rend une URL de brouillon qui sert le site, le solde de crédits de l'équipe ne bouge pas et le déploiement de production reste celui d'avant.
- AC-NETLIFY-4 : Étant donné la règle d'ignore du site, quand un commit ne touche que des workspaces dont le site ne dépend pas, même indirectement, ou que des documents hors du code comme `features/` et `ROADMAP.md`, alors Netlify saute le build ; quand il touche le site, un workspace dont il dépend ou un fichier racine de la chaîne de build, alors Netlify construit, y compris pour un package ajouté aux dépendances du site après cette story, sans que personne ait retouché la règle.
- AC-NETLIFY-5 : Étant donné un déploiement de production défectueux, quand Nicolas revient au déploiement précédent, alors le site sert de nouveau la version d'avant sans rebuild, et le README du site dit comment faire.
- AC-NETLIFY-6 : Étant donné les cas limites, quand Nicolas les rencontre, alors une clé absente ou révoquée fait échouer la CLI sur une erreur d'authentification sans rien publier ; la CLI lancée dans un dossier non rattaché ne crée jamais un second projet ; tant que `main` ne porte pas le site TanStack (aujourd'hui 139 commits derrière `dev`, sans `netlify.toml`), relier le dépôt ne publie rien en production ; une branche autre que `main` et `dev` ne déclenche aucun build ; robusta.build continue de répondre depuis Vercel.

## Boundaries

### CLI API de la règle d'ignore Netlify — nouveau

Client code : le build Netlify, par la clé `[build] ignore` de `apps/robusta-build/netlify.toml`, qui l'appelle au lieu du `git diff --quiet` sur huit chemins écrits à la main. Le nom de la commande et son emplacement dans le dépôt sont laissés au design.

- invocation : la règle reçoit le workspace du site, ici `@robusta/robusta-build`, et compare les deux refs que Netlify fournit, `$CACHED_COMMIT_REF` et `$COMMIT_REF`
- exit 0 : rien n'a changé dans le site, dans les workspaces dont il dépend directement ou non, ni dans la chaîne de build racine ; Netlify saute le build
- exit 1 : un de ces fichiers a changé, ou une ref est inconnue ; Netlify construit
- stdout : une ligne qui dit pourquoi

Inchangés et non listés : le site lui-même, ses packages et les scripts racine.

## Open Questions & Gaps

- OQ-NETLIFY-1 : Quel périmètre de déploiement cette story livre-t-elle, alors que robusta.build est aujourd'hui le seul site sur Netlify ?
- Proposition : Le projet `robusta-build`, la clé et la CLI côté dépôt, la règle d'ignore générique et le retour arrière. L'anneau `stable` (un projet par site client, branche de production `stable`, promotion par `git push origin main:stable`, publication automatique coupée au besoin) attend le premier site client ; robusta reste le canari sur `main`.
- Rationale : avec un seul site, une branche `stable` ne protège personne et doublerait les déploiements de production à 15 crédits, alors que la règle d'ignore sert dès maintenant, dakar et les packages v1 vivant dans le même dépôt.
- Resolution:

- OQ-NETLIFY-2 : La CLI Netlify s'installe-t-elle sur le poste avec la clé, par le projet Ubuntu System, ou comme dépendance de développement du dépôt ?
- Proposition : Sur le poste, par Ubuntu System, avec la clé ; le dépôt n'en dépend pas et le README du site donne la version attendue, `netlify-cli` 27 sur Node 22.13 ou plus.
- Rationale : en dépendance du dépôt, elle ajouterait des centaines de paquets à `yarn.lock`, et chaque changement de `yarn.lock` relance le build du site.
- Resolution:

## Documentation updates

- change la section Deployment de `apps/robusta-build/README.md` — pourquoi : le projet `robusta-build` et ses réglages, la clé attendue hors du dépôt, le brouillon depuis la CLI, la règle d'ignore et le retour arrière.
- change la section Commands de `CLAUDE.md` — pourquoi : un agent doit savoir publier un brouillon, gratuit, plutôt que pousser sur `main`, à 15 crédits.

## Dependencies

- Dep 1 : la clé Netlify, un personal access token, et la CLI installées sur le poste par le projet Ubuntu System, hors de ce dépôt. Pyramids n'en attend qu'une CLI authentifiée, la clé lue dans `NETLIFY_AUTH_TOKEN` ou dans la configuration utilisateur de la CLI, jamais dans un fichier du dépôt. AC-NETLIFY-2 et AC-NETLIFY-3 l'attendent ; AC-NETLIFY-1 se fait au dashboard sans elle.
- Dep 2 : tanstack-start-migration attend cette story, pas l'inverse. Le projet réglé ici lève sa Dep 2, et son AC-TANSTACK-6 vérifie sur lui le premier déploiement de branche `dev`. Cette story ne change de son `netlify.toml` que la clé `ignore` (R-TANSTACK-101) ; le premier déploiement de production suit le merge de tanstack-start-migration sur `main`.
