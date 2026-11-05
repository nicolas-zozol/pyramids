# Story : Règle d'ignore Netlify sur les dépendances du site, et retour arrière

**Dernière mise à jour :** 2026-11-05
**Feature :** netlify-deploy
**Infix :** NETLIFY
**Status :** SUBMITTED (2026-11-05, commit e44ac86)

## Story

En tant que Nicolas, éditeur des sites Robusta, je veux que la build de branche suive les dépendances réelles du site et savoir revenir à la production précédente, afin que l'aperçu de la branche d'epic serve toujours le code à jour et qu'une production défectueuse se répare sans rebuild.

## Contexte & objectif

Le projet Netlify `robusta-build` construit `main` en production et `epic/robusta-v2` en déploiement de branche, sur l'offre Free. Les builds hors production gardaient un `git diff` sur une liste de chemins écrite à la main, où manquait déjà `.yarn/releases` : un module oublié faisait servir du code périmé à l'aperçu. Elles suivent désormais le graphe des modules dont dépend `@robusta/robusta-build`, et le README dit comment revenir à la production précédente.

## Livré

### Requirements

- R-NETLIFY-01 : `apps/robusta-build/scripts/netlify-ignore.mjs` porte la CLI et l'export `ignoreVerdict` de §Boundaries, avec sa spec vitest `netlify-ignore.spec.ts` à côté ; `main()` ne fait que lire l'environnement et `process.argv`, écrire la ligne et sortir.
- R-NETLIFY-02 : les chemins surveillés sont le répertoire du site, ceux des modules qu'il atteint transitivement par les quatre champs de dépendances, et les cinq fichiers racine de l'installation, lus au `COMMIT_REF` ; un module ajouté au site ou au design system est surveillé sans retouche de la règle.
- R-NETLIFY-03 : la règle saute la build quand aucun commit de `CACHED_COMMIT_REF..COMMIT_REF` ne touche un chemin surveillé, et la lance dès qu'un seul le fait, quelle que soit sa place dans le push.
- R-NETLIFY-04 : une ref absente, vide, inconnue du clone ou égale à l'autre fait construire.
- R-NETLIFY-05 : une ref en cache absente de l'historique de premier parent de `COMMIT_REF` fait construire.
- R-NETLIFY-06 : toute erreur fait construire, avec exit 1 et la ligne `build:` qui la nomme ; `ignoreVerdict` ne lève jamais.
- R-NETLIFY-07 : le script n'importe que des modules `node:` et n'appelle que `git`, sans réseau ni jeton.
- R-NETLIFY-21 : `[build] ignore` garde `[ "$CONTEXT" = production ] && exit 1;` en tête et appelle le script à la place du `git diff --quiet`.
- R-NETLIFY-41 : la section Deployment du README dit aussi qu'on merge `main` dans la branche d'epic par `git merge --no-ff main`, et qu'un aperçu resté périmé se reconstruit par une relance depuis le dashboard.

### Acceptance Criteria

- AC-NETLIFY-4 : Étant donné une build hors production, quand les changements arrivés depuis la dernière build ne touchent que des apps ou modules dont le site ne dépend pas, même indirectement (dakar, v1, les modules de base), ou que des documents hors du code comme `features/` et `ROADMAP.md`, alors Netlify saute la build. Quand un seul de ces commits, même pas le dernier du push, touche le site, un module dont il dépend directement ou non, ou un fichier racine de l'installation (`package.json`, `yarn.lock`, `.yarnrc.yml`, `.yarn/releases`, `.nvmrc`), alors Netlify construit, y compris pour un module ajouté aux dépendances du site, directement ou par le design system, après cette story, sans que personne retouche la règle. Une build de production construit toujours, quel que soit le commit.
- AC-NETLIFY-5 : Étant donné un déploiement de production défectueux, quand Nicolas suit le README du site, alors il sait publier le déploiement précédent sans rebuild, verrouiller la publication automatique pour que le merge suivant sur `main` n'écrase pas ce retour, puis revenir en avant en publiant le déploiement corrigé et en déverrouillant.
- AC-NETLIFY-6 : Étant donné les cas limites, quand ils se présentent, alors une ref inconnue, absente ou égale au commit construit (build sans cache, relance depuis le dashboard) fait construire ; une ref en cache venue de la production, alors que la branche porte du code pas encore sur `main`, fait construire ; une branche d'epic qui reçoit `main` par un commit de merge, ou par un push qui s'arrête sur la tête de `main`, après une production portant du code du site qu'elle n'avait pas, fait construire ; seule exception acceptée, une branche qui prend `main` en fast-forward et ajoute dans le même push un commit sans code voit sa build sautée et son aperçu rester périmé : le README demande de merger `main` par `git merge --no-ff main`, et renvoie, pour un aperçu périmé, à une relance depuis le dashboard, qui fait construire ; une erreur de la règle fait construire ; un retour à un déploiement antérieur à go-live referme tout le site à l'indexation, et le README le signale ; un déploiement précédent de plus de 30 jours n'existe plus, et le README renvoie alors à un revert sur `main`, qui coûte une production.

## Boundaries

### CLI API of package `scripts` in app `@robusta/robusta-build` — new

Client code : la clé `[build] ignore` de `apps/robusta-build/netlify.toml`, exécutée à la racine du dépôt avant l'installation.

- invocation : `node apps/robusta-build/scripts/netlify-ignore.mjs @robusta/robusta-build`, sur une build hors production seulement ; lit `CACHED_COMMIT_REF` et `COMMIT_REF`
- exit 0 : aucun commit de la plage ne touche un chemin surveillé ; Netlify saute la build
- exit 1 : un chemin surveillé a changé, une ref est absente, inconnue, égale ou hors de l'historique de premier parent, ou la règle a échoué ; Netlify construit
- stdout : une ligne, `skip: <raison>` ou `build: <raison>`

Inchangés : `yarn build:robusta` et `yarn build:deps`, la clé `[build] command` et le reste de `netlify.toml`.

## Décisions

- 2026-11-04 — L'équipe reste sur l'offre Free. Pourquoi : 15 crédits par production, aucun pour une build de branche, suffisant pour le rythme actuel.
- 2026-11-05 — Les builds hors production suivent le graphe des modules du site ; la production construit toujours, le court-circuit de FIX-PYRAMID-1 reste en tête. Pourquoi : `CACHED_COMMIT_REF` ne permet pas de juger une production (OQ-NETLIFY-3).
- 2026-11-05 — `yarn build:robusta` reste tel quel, `build:deps` compris ; un commit sur les seuls modules de base est sauté. Pourquoi : leur sortie n'entre pas dans le site (Gap-NETLIFY-1 du brainstorm, `lgtm (boss atw)`).
- 2026-11-05 — La règle vit dans `apps/robusta-build/scripts` avec sa spec vitest. Pourquoi : à côté de `check-source.mjs`, testée par le `test` du site (OQ-NETLIFY-2).
- 2026-11-05 — Aucun appel à l'API Netlify ; le fast-forward de `main` suivi d'un commit sans code est une exception acceptée. Pourquoi : l'API demanderait un jeton dans la build (Gap-NETLIFY-1 du design, `lgtm (boss atw)`).
- 2026-11-05 — Le retour arrière est livré par le README seul ; la répétition sur www.robusta.build reste à Nicolas. Pourquoi : une répétition change la production (OQ-NETLIFY-3 du brainstorm, `lgtm (boss atw)`).
- 2026-11-05 — Périmètre limité au projet `robusta-build` ; l'anneau `stable` attend le premier site client.

## Documentation updates

- changed le paragraphe sur la règle d'ignore de la section Deployment de `apps/robusta-build/README.md` : graphe des dépendances du site, `git merge --no-ff main`, relance depuis le dashboard pour un aperçu périmé
- created la sous-section « Rolling back production » de `apps/robusta-build/README.md` : publier le déploiement précédent, verrouiller puis déverrouiller, fenêtre de 30 jours, déploiement antérieur à go-live qui referme l'indexation
- changed le package `scripts`, la CLI API et l'hébergement de `apps/robusta-build/robusta-build.archi.md` (archiman)
