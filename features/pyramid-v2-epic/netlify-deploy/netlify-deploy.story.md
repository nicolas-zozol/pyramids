# Story : Règle d'ignore Netlify sur les dépendances du site, et retour arrière

**Dernière mise à jour :** 2026-11-05
**Feature :** netlify-deploy
**Infix :** NETLIFY
**Status :** ACTIVE

## Story

En tant que Nicolas, éditeur des sites Robusta, je veux que la build de branche suive les dépendances réelles du site et savoir revenir à la production précédente, afin que l'aperçu de la branche d'epic serve toujours le code à jour et qu'une production défectueuse se répare sans rebuild.

## Contexte & objectif

Le reste de la story d'origine est livré par tanstack-start-migration et go-live. Le projet Netlify `robusta-build` (site `abbf74fc-c1ce-4eb9-b69b-0d4d0954d649`) est relié à `nicolas-zozol/pyramids`, construit `main` en production et `epic/robusta-v2` en déploiement de branche. www.robusta.build est servi par Netlify et indexable depuis le 2026-11-05, DNS chez Hover, et `robusta-build.netlify.app/*` répond 301 vers www. Les réglages du dashboard sont décrits dans la section Deployment de `apps/robusta-build/README.md`. La CLI tourne hors du dépôt, par `npx netlify-cli`, avec le jeton dans la configuration utilisateur et jamais dans un fichier du dépôt ; un déploiement depuis la CLI est un draft deploy, jamais `--prod` (CLAUDE.md, §Netlify CLI).

L'équipe reste sur l'offre Free, décision du 2026-11-04 : 300 crédits par mois, 15 par déploiement de production, aucun pour une build de branche. Depuis FIX-PYRAMID-1 (`1e587e5`), la production construit toujours : `CACHED_COMMIT_REF` est le dernier commit construit sur n'importe quelle branche, et ne peut donc pas servir à juger une production. Seules les builds de branche gardent un `git diff` sur une liste de chemins écrite à la main. Un module ajouté aux dépendances du site et oublié dans cette liste ferait servir à l'aperçu de `epic/robusta-v2` du code périmé, sans rien signaler. Décision du 2026-11-05 : même sans crédit en jeu, les builds de branche suivent désormais les dépendances workspace de `@robusta/robusta-build` au lieu de cette liste, pour que l'aperçu reste juste ; la production construit toujours, le court-circuit de FIX-PYRAMID-1 reste en tête de la règle.

Le périmètre se limite au projet `robusta-build`. L'anneau `stable` (un projet par site client, branche de production `stable`, promotion par `git push origin main:stable`) attendra le premier site client ; robusta reste le canari sur `main`.

## Acceptance Criteria

- AC-NETLIFY-4 : Étant donné une build de branche, quand le commit ne touche que des workspaces dont le site ne dépend pas, même indirectement (dakar, v1, les packages de base), ou que des documents hors du code comme `features/` et `ROADMAP.md`, alors Netlify saute la build. Quand il touche le site, un workspace dont le site dépend ou un fichier racine de la chaîne de build, alors Netlify construit, y compris pour un module ajouté aux dépendances du site après cette story, sans que personne retouche la règle. Une build de production construit toujours, quel que soit le commit.
- AC-NETLIFY-5 : Étant donné un déploiement de production défectueux, quand Nicolas revient au déploiement précédent, alors le site sert de nouveau la version d'avant sans rebuild, et le README du site explique comment faire.
- AC-NETLIFY-6 : Étant donné les cas limites, quand ils se présentent, alors une ref inconnue ou absente fait construire la build de branche ; une ref en cache venue de la production, alors que la branche porte du code pas encore sur `main`, fait construire elle aussi ; un retour à un déploiement antérieur à go-live referme tout le site à l'indexation, et le README le signale.

## Boundaries

### CLI API de la règle d'ignore Netlify — modifiée

Client code : la clé `[build] ignore` de `apps/robusta-build/netlify.toml`. Elle garde en tête `[ "$CONTEXT" = production ] && exit 1;` et appelle cette règle au lieu du `git diff --quiet` sur les chemins écrits à la main. Le nom de la commande et son emplacement dans le dépôt sont laissés au design.

- invocation : sur une build de branche seulement ; la règle reçoit le workspace du site, `@robusta/robusta-build`, et compare `$CACHED_COMMIT_REF` et `$COMMIT_REF`
- exit 0 : rien n'a changé dans le site, dans les workspaces dont il dépend directement ou non, ni dans la chaîne de build racine ; Netlify saute la build
- exit non nul : un de ces fichiers a changé, ou une ref est inconnue ; Netlify construit
- stdout : une ligne qui dit pourquoi

Inchangés : le site, ses packages et les scripts racine.

## Documentation updates

- change le paragraphe sur la règle d'ignore de la section Deployment de `apps/robusta-build/README.md` — pourquoi : les builds de branche suivent les dépendances du site, plus une liste de chemins.
- change la section Deployment de `apps/robusta-build/README.md` — pourquoi : revenir à la production précédente sans rebuild, et rappeler qu'un déploiement antérieur à go-live referme l'indexation.
