# Brainstorm : netlify-deploy

**Date :** 2026-11-05
**Participants :** bsman (autonomous)
**Infix :** NETLIFY
**Source :** `features/pyramid-v2-epic/__done/netlify-deploy/netlify-deploy.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Constats vérifiés le 2026-11-05

- `apps/robusta-build/netlify.toml`, clé `[build] ignore` : `[ "$CONTEXT" = production ] && exit 1;` puis `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF` sur `apps/robusta-build`, `packages/robusta-design-system`, `package.json`, `yarn.lock`, `.yarnrc.yml`, `.nvmrc` (FIX-PYRAMID-1). `.yarn/releases/yarn-4.17.1.cjs`, binaire commité, n'y figure pas ; un changement de version passe aussi par `.yarnrc.yml`.
- Le site a une seule dépendance workspace, `@robusta/pyramids-design-system`, qui n'en a aucune. Le site ne lit aucun fichier hors de son workspace : le corpus est sous `apps/robusta-build/content/articles`, les mentions de `apps/robusta` dans `src/routing/v1-url-map.ts` sont des commentaires.
- `yarn build:robusta` lance `yarn build:deps`, qui construit helpers, themes, design-system, layouts, links et ctas, puis le site. Cinq de ces six modules ne sont pas des dépendances du site. Le glossaire définit Build chain comme « la reconstruction ordonnée des modules, qui doit aboutir avant la build de tout site » ; BR-PYRAMID-5 parle de « la build chain d'un site ».
- Documentation Netlify : `CACHED_COMMIT_REF` est « le dernier commit construit avant la build courante » ; une build sans cache reçoit `CACHED_COMMIT_REF` égal à `COMMIT_REF`. Ce que devient la variable après une build échouée ou annulée n'est pas documenté.
- Documentation Netlify : un retour arrière, Publish deploy sur un déploiement réussi, est instantané et ne coûte aucun crédit. Avec la publication automatique active, la production suivante déclenchée par git l'écrase ; Lock to stop auto publishing l'empêche, et une production construite pendant le verrou ne coûte ses 15 crédits que si elle est publiée. Sur l'offre Free, un déploiement est supprimé après 30 jours, sauf le déploiement publié, la dernière production réussie et la dernière build réussie de chaque branche.

## Challenge des Acceptance Criteria

- AC-NETLIFY-4 : testable sur un dépôt git de fixture, en langage métier. Deux faiblesses. « Le commit » est ambigu : Netlify construit la tête d'un push et compare deux refs, donc ce qui compte est l'ensemble des changements depuis la dernière build (cas limite 1). « Un fichier racine de la chaîne de build » contredit les packages de base : la chaîne que lance `yarn build:robusta` les construit, alors que l'AC fait sauter un commit qui ne touche qu'eux (Gap-NETLIFY-1). La clause « un module ajouté aux dépendances du site » est le cœur de la story ; elle doit valoir pour un ajout indirect, par le design system, que la fixture doit couvrir.
- AC-NETLIFY-5 : en langage métier, mais incomplet. Sans verrou de publication, le merge suivant sur `main` écrase le retour arrière (cas limite 4). La fenêtre de retour est de 30 jours sur l'offre Free (cas limite 5). Testable seulement sur la production réelle (OQ-NETLIFY-3).
- AC-NETLIFY-6 : trois cas limites dans un AC, testables (les deux premiers sur fixture, le troisième à la lecture du README). Il manque les refs égales (cas limite 2), et le cas symétrique de sa deuxième clause : la production porte du code que la branche n'a pas encore, puis la branche merge `main` (cas limite 3).

Cas limites métier proposés à storyman :

1. Given une build de branche dont le push porte plusieurs commits, When un seul d'entre eux, pas le dernier, touche le site, Then Netlify construit : la règle juge tous les changements arrivés depuis la dernière build, pas le seul commit de tête.
2. Given une build de branche dont la ref en cache est égale au commit construit (build sans cache, relance d'une build depuis le dashboard), When la règle s'exécute, Then Netlify construit.
3. Given une production de `main` qui porte du code du site absent du déploiement de la branche d'epic, When la branche d'epic merge `main` sans autre changement du site, Then la build de branche construit, et l'aperçu sert le code mergé.
4. Given une production revenue au déploiement précédent, When `main` reçoit un merge, Then le nouveau déploiement ne remplace pas le retour arrière tant que Nicolas n'a pas déverrouillé la publication, et le README dit comment verrouiller puis déverrouiller.
5. Given un déploiement de production défectueux dont le précédent a plus de 30 jours, When Nicolas veut revenir en arrière, Then le README dit que ce déploiement n'existe plus et que la réparation passe par un revert sur `main`, qui coûte une production.

Aucune règle métier : la story change la configuration d'un déploiement, pas la politique de l'entreprise. BR-PYRAMID-5 est concernée par Gap-NETLIFY-1, sans être modifiée.

---

## 1. Product Role

**Problème :** la règle d'ignore des builds de branche repose sur une liste de chemins écrite à la main ; le retour arrière de la production n'est écrit nulle part.

**Décision (autonome):** la story livre une règle d'ignore qui lit le graphe des workspaces du site, et une procédure de retour arrière dans le README. Elle n'est ni une CI, ni un outil de déploiement, ni une économie de crédits : la production construit toujours, une build de branche est gratuite.

**Rationale :** l'enjeu est la justesse de l'aperçu de `epic/robusta-v2` et la réparation rapide d'une production, pas le coût.

---

## 2. Target Audience

**Décision (autonome):** Nicolas seul, développeur et éditeur, qui lit le log Netlify et le README ; les agents Compound, qui ajoutent des dépendances au site sans penser à `netlify.toml`.

**Rationale :** le risque vient d'un ajout de module par un agent ou par Nicolas, la règle doit tenir sans mémoire humaine.

---

## 3. Core Problem

**Problème :** un module ajouté aux dépendances du site et oublié dans la liste ferait servir à l'aperçu un code périmé, sans signal. Une production défectueuse ne se répare aujourd'hui que par un revert et une nouvelle production.

**Décision (autonome):** traiter les deux, la règle d'abord ; le retour arrière ne coûte que de la documentation.

**Rationale :** le premier défaut est silencieux, le second coûte 15 crédits et un délai de build au pire moment.

---

## 4. Unique Value Proposition

**Options considérées :**
- Garder la liste écrite à la main, complétée : zéro code, mais la même dérive au prochain module.
- Surveiller tout `packages/*` en plus du site : générique, mais construit sur chaque commit des packages de base, et contredit AC-NETLIFY-4.
- Lire le graphe des workspaces du site : seule option où l'ajout d'un module ne demande rien.

**Décision (autonome):** lire le graphe des workspaces.

**Rationale :** c'est la décision du 2026-11-05 de la story, et la seule qui tient sans qu'on retouche la règle.

---

## 5. Functional Scope

**Dans le périmètre :**
- la règle d'ignore des builds hors production : site, workspaces dont il dépend directement ou non (`dependencies`, `devDependencies` et `peerDependencies` au protocole `workspace:`, puisque la build installe et utilise les trois), fichiers racine de la chaîne de build ;
- toute build hors production, build de branche ou deploy preview, avec la même règle ;
- la section Deployment du README : la règle, le retour arrière, le verrou de publication, la fenêtre de 30 jours, la fermeture de l'indexation par un déploiement d'avant go-live.

**Hors périmètre :** l'anneau `stable` et tout autre projet Netlify, une CI, l'API Netlify, un jeton dans l'environnement de build, un retour arrière par le CLI.

**Décision (autonome):** le graphe se lit au commit construit seulement. Un graphe qui change modifie le manifeste du site ou d'une de ses dépendances, fichier déjà surveillé : l'ancien graphe n'a pas à être relu.

**Rationale :** la lecture la plus simple qui ne rate aucun cas.

---

## 6. Core Features

### Feature : Règle d'ignore sur le graphe des workspaces

**Capability :** sur une build hors production, Netlify saute la build quand rien n'a changé entre la ref en cache et le commit construit dans le site, ses workspaces dépendants ou la chaîne de build racine ; il construit sinon, et sur toute ref inconnue, absente ou égale. La production construit toujours, le court-circuit de FIX-PYRAMID-1 restant en tête.

**Acceptance Criteria :** AC-NETLIFY-4, AC-NETLIFY-6 (clauses 1 et 2), testables.
- Proposé à storyman : cas limites 1, 2 et 3.

**Test Approach :** tests vitest de la règle sur un dépôt git de fixture créé dans un dossier temporaire : commit de documentation seul, commit dakar ou v1, commit d'un package de base, commit du site, du design system, d'un fichier racine, ajout d'une dépendance workspace directe puis indirecte, push de plusieurs commits, ref inconnue, vide et égale, merge de `main` après une production. Puis, sur `epic/robusta-v2`, deux commits réels lus dans le log Netlify : un commit de documentation sauté, un commit du site construit.

---

### Feature : Retour arrière de la production

**Capability :** Nicolas revient au déploiement de production précédent depuis le dashboard, Publish deploy, et verrouille la publication automatique ; il revient en avant en publiant le déploiement corrigé et en déverrouillant. Le README le décrit, avec la fenêtre de 30 jours et la fermeture de l'indexation par un déploiement d'avant go-live.

**Acceptance Criteria :** AC-NETLIFY-5, AC-NETLIFY-6 (clause 3), testables sur la production réelle et à la lecture du README.
- Proposé à storyman : cas limites 4 et 5.

**Test Approach :** relecture de la section Deployment ; répétition en direct selon OQ-NETLIFY-3.

---

## 7. Critical Edge Cases

Les cinq cas limites proposés à storyman, plus deux qui tiennent par construction :

- un commit qui retire une dépendance workspace modifie un manifeste surveillé, la build construit ;
- un clone sans l'historique de la ref en cache donne une ref inconnue, la build construit.

**Décision (autonome):** toute erreur de la règle, git ou lecture d'un manifeste, fait construire.

**Rationale :** une build de branche est gratuite ; un aperçu périmé est le seul défaut que la story combat.

---

## 8. Non-Functional Constraints

**Décision (autonome):**
- aucune dépendance npm : la règle n'utilise que git et les modules intégrés de Node, quel que soit le moment où Netlify l'exécute par rapport à l'installation ;
- aucun réseau, aucun jeton ;
- une ligne sur stdout qui dit pourquoi, lisible dans le log Netlify ;
- coût inchangé : la production construit toujours, 15 crédits par merge sur `main` ; un retour arrière ne coûte rien.

**Rationale :** la règle tourne avant toute installation et ne doit jamais échouer pour une raison étrangère au dépôt.

---

## 9. External Dependencies

- Netlify : `CONTEXT`, `CACHED_COMMIT_REF`, `COMMIT_REF` ; l'historique git du clone ; Node dans l'image de build au moment de l'ignore.
- Dashboard Netlify : Publish deploy, Lock to stop auto publishing, Unlock to start auto publishing.
- Offre Free : rétention de 30 jours, retour arrière sans crédit.
- yarn 4 : les manifestes et le champ `workspaces` du `package.json` racine, qui décrivent le graphe.

---

## 10. Major Risks

- Sémantique de `CACHED_COMMIT_REF` après une build échouée ou annulée : non documentée. Si elle avance sur l'échec, un commit de documentation qui suit une build ratée du site serait sauté. Le cas limite 2 donne le remède, une relance depuis le dashboard ; le comportement se vérifie sur les premières builds de branche.
- Cas limite 3 : `CACHED_COMMIT_REF` vaut pour tout le site, toutes branches confondues, comme l'a montré FIX-PYRAMID-1. Sans API ni jeton, le design doit trouver un critère tiré de git seul, par exemple construire quand la ref en cache n'est pas dans l'historique propre de la branche.
- Chaîne de build plus large que le graphe : Gap-NETLIFY-1.
- Procédure de retour arrière jamais exécutée : OQ-NETLIFY-3.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Netlify is outside the repo; nothing inside points into an app, no loop.

  Netlify build (CONTEXT, CACHED_COMMIT_REF, COMMIT_REF)
      │                                    │
      │ CLI ([build] ignore)               │ CLI ([build] command)
      ↓                                    ↓
  app `@robusta/robusta-build`         repository root `@robusta/pyramids`
  [modified: netlify-deploy]           [modified: netlify-deploy]
      │
      │ library
      ↓
  module `@robusta/pyramids-design-system`
```

La règle lit les manifestes des workspaces, sans en appeler aucun : ce n'est pas une API. Le second bloc suit la Proposition de Gap-NETLIFY-1, l'emplacement de la règle celle d'OQ-NETLIFY-2.

### CLI API of package `scripts` in app `@robusta/robusta-build` — new

Client code : la clé `[build] ignore` de `apps/robusta-build/netlify.toml`, après `[ "$CONTEXT" = production ] && exit 1;`. Nom de la commande laissé au design, à côté de `check-source.mjs` et des autres scripts de build du site.

- invocation : le nom du workspace du site, `@robusta/robusta-build` ; lit `CACHED_COMMIT_REF` et `COMMIT_REF`
- exit 0 : rien n'a changé dans le site, ses workspaces dépendants ni la chaîne de build racine ; Netlify saute la build
- exit 1 : un de ces fichiers a changé, une ref est inconnue, absente ou égale, la ref en cache ne permet pas de juger la branche (cas limite 3), ou la règle a échoué ; Netlify construit
- stdout : une ligne, `build:` ou `skip:` suivi de la raison (premier fichier changé et son workspace, ref en cause, nombre de workspaces surveillés)

### CLI API of repository root `@robusta/pyramids` — modified

Client code : la clé `[build] command` de `netlify.toml`, et une build locale.

- `yarn build:robusta` · modifié — construit le site et ses seules dépendances workspace, dans l'ordre des dépendances · était `yarn build:deps`, six modules, puis le site
- `yarn build:deps` · inchangé, toujours utilisé par `build:robusta-v1` et `build:dakar`

---

## Open Questions & Gaps

## Next Steps

- `storyman update netlify-deploy avec brainstorm` : les cinq cas limites, la reformulation de « le commit » dans AC-NETLIFY-4, et les trois entrées une fois arbitrées.
- designman sur netlify-deploy : le critère git du cas limite 3, la liste des fichiers racine de la chaîne de build (`.yarn/releases` compris), le nom de la commande.
- Après le commit sur `epic/robusta-v2` : lire dans le log Netlify un commit de documentation sauté et un commit du site construit, et observer `CACHED_COMMIT_REF` après une build échouée ou annulée.
- À `storyman done` : la répétition du retour arrière, selon OQ-NETLIFY-3.
