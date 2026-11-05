# Story : Règle d'ignore Netlify sur les dépendances du site, et retour arrière

**Dernière mise à jour :** 2026-11-05
**Feature :** netlify-deploy
**Infix :** NETLIFY
**Status :** ACTIVE

## Story

En tant que Nicolas, éditeur des sites Robusta, je veux que la build de branche suive les dépendances réelles du site et savoir revenir à la production précédente, afin que l'aperçu de la branche d'epic serve toujours le code à jour et qu'une production défectueuse se répare sans rebuild.

## Contexte & objectif

Le reste de la story d'origine est livré par tanstack-start-migration et go-live. Le projet Netlify `robusta-build` (site `abbf74fc-c1ce-4eb9-b69b-0d4d0954d649`) est relié à `nicolas-zozol/pyramids`, construit `main` en production et `epic/robusta-v2` en déploiement de branche. www.robusta.build est servi par Netlify et indexable depuis le 2026-11-05, DNS chez Hover, et `robusta-build.netlify.app/*` répond 301 vers www. Les réglages du dashboard sont décrits dans la section Deployment de `apps/robusta-build/README.md`. La CLI tourne hors du dépôt, par `npx netlify-cli`, avec le jeton dans la configuration utilisateur et jamais dans un fichier du dépôt ; un déploiement depuis la CLI est un draft deploy, jamais `--prod` (CLAUDE.md, §Netlify CLI).

L'équipe reste sur l'offre Free, décision du 2026-11-04 : 300 crédits par mois, 15 par déploiement de production, aucun pour une build de branche, et un déploiement supprimé après 30 jours sauf le publié et le dernier réussi. Depuis FIX-PYRAMID-1 (`1e587e5`), la production construit toujours : `CACHED_COMMIT_REF` est le dernier commit construit sur n'importe quelle branche, et ne peut donc pas servir à juger une production. Les builds hors production gardent un `git diff` sur une liste de chemins écrite à la main, où manque déjà `.yarn/releases`. Un module ajouté aux dépendances du site et oublié dans cette liste ferait servir à l'aperçu de `epic/robusta-v2` du code périmé, sans rien signaler. Décision du 2026-11-05 : les builds hors production, build de branche ou deploy preview, suivent désormais le graphe des modules dont dépend `@robusta/robusta-build` ; la production construit toujours, le court-circuit de FIX-PYRAMID-1 reste en tête de la règle. Git seul ne dit pas ce que sert l'aperçu de branche, et la règle n'interroge pas l'API Netlify, qui demanderait un jeton dans la build : le seul cas qu'elle ne voit pas est documenté (AC-NETLIFY-6).

`yarn build:robusta` reste tel quel, `build:deps` compris : il construit aussi cinq modules de base dont le site ne dépend pas, et dont la sortie n'entre pas dans le site. La règle ne les surveille pas. Le retour arrière est livré par le README seul : la répétition sur www.robusta.build reste à Nicolas, hors de cette story.

Le périmètre se limite au projet `robusta-build`. L'anneau `stable` (un projet par site client, branche de production `stable`, promotion par `git push origin main:stable`) attendra le premier site client ; robusta reste le canari sur `main`.

## Acceptance Criteria

- AC-NETLIFY-4 : Étant donné une build hors production, quand les changements arrivés depuis la dernière build ne touchent que des apps ou modules dont le site ne dépend pas, même indirectement (dakar, v1, les modules de base), ou que des documents hors du code comme `features/` et `ROADMAP.md`, alors Netlify saute la build. Quand un seul de ces commits, même pas le dernier du push, touche le site, un module dont il dépend directement ou non, ou un fichier racine de l'installation (`package.json`, `yarn.lock`, `.yarnrc.yml`, `.yarn/releases`, `.nvmrc`), alors Netlify construit, y compris pour un module ajouté aux dépendances du site, directement ou par le design system, après cette story, sans que personne retouche la règle. Une build de production construit toujours, quel que soit le commit.
- AC-NETLIFY-5 : Étant donné un déploiement de production défectueux, quand Nicolas suit le README du site, alors il sait publier le déploiement précédent sans rebuild, verrouiller la publication automatique pour que le merge suivant sur `main` n'écrase pas ce retour, puis revenir en avant en publiant le déploiement corrigé et en déverrouillant.
- AC-NETLIFY-6 : Étant donné les cas limites, quand ils se présentent, alors une ref inconnue, absente ou égale au commit construit (build sans cache, relance depuis le dashboard) fait construire ; une ref en cache venue de la production, alors que la branche porte du code pas encore sur `main`, fait construire ; une branche d'epic qui reçoit `main` par un commit de merge, ou par un push qui s'arrête sur la tête de `main`, après une production portant du code du site qu'elle n'avait pas, fait construire ; seule exception acceptée, une branche qui prend `main` en fast-forward et ajoute dans le même push un commit sans code voit sa build sautée et son aperçu rester périmé : le README demande de merger `main` par `git merge --no-ff main`, et renvoie, pour un aperçu périmé, à une relance depuis le dashboard, qui fait construire ; une erreur de la règle fait construire ; un retour à un déploiement antérieur à go-live referme tout le site à l'indexation, et le README le signale ; un déploiement précédent de plus de 30 jours n'existe plus, et le README renvoie alors à un revert sur `main`, qui coûte une production.

## Boundaries

### CLI API of package `scripts` in app `@robusta/robusta-build` — new

Client code : la clé `[build] ignore` de `apps/robusta-build/netlify.toml`. Elle garde en tête `[ "$CONTEXT" = production ] && exit 1;` et appelle cette règle au lieu du `git diff --quiet` sur les chemins écrits à la main. La règle vit dans `apps/robusta-build/scripts`, à côté de `check-source.mjs`, avec sa spec vitest ; son nom est laissé au design.

- invocation : sur une build hors production seulement ; la règle reçoit le nom du site, `@robusta/robusta-build`, et compare `$CACHED_COMMIT_REF` et `$COMMIT_REF`
- exit 0 : rien n'a changé dans le site, dans les modules dont il dépend directement ou non, ni dans les fichiers racine de l'installation ; Netlify saute la build
- exit non nul : un de ces fichiers a changé, une ref est inconnue, absente ou égale, la ref en cache ne permet pas de juger la branche, ou la règle a échoué ; Netlify construit
- stdout : une ligne qui dit pourquoi

Inchangés : le reste du site, ses dépendances et les scripts racine, `yarn build:robusta` et `yarn build:deps` compris.

## Documentation updates

- change le paragraphe sur la règle d'ignore de la section Deployment de `apps/robusta-build/README.md` — pourquoi : les builds hors production suivent le graphe des dépendances du site, plus une liste de chemins ; un commit sur les seuls modules de base est sauté ; on merge `main` dans la branche d'epic par `git merge --no-ff main`, et un aperçu resté périmé (fast-forward de `main` suivi d'un commit sans code) se reconstruit par une relance depuis le dashboard.
- change la section Deployment de `apps/robusta-build/README.md` — pourquoi : revenir à la production précédente sans rebuild, verrouiller puis déverrouiller la publication automatique, la fenêtre de 30 jours, et rappeler qu'un déploiement antérieur à go-live referme l'indexation.
