# Design: règle d'ignore Netlify sur les dépendances du site, et retour arrière

**Last update:** 2026-11-05
**Feature:** netlify-deploy
**Infix:** NETLIFY
**Status:** IMPLEMENTED (2026-11-05, commit e44ac86)
**Sources:** [story](netlify-deploy.story.md), [brainstorm](netlify-deploy.brainstorm.md), [epic](../../pyramid-v2.epic.md), [FIX-PYRAMID-1](../../pyramid-v2.fix.md)

## Goal

Un script Node sans dépendance, `apps/robusta-build/scripts/netlify-ignore.mjs`, remplace le `git diff --quiet` sur des chemins écrits à la main dans `[build] ignore` : sur une build hors production, il surveille le site, chaque module dont il dépend directement ou non, lus dans les manifestes au commit construit, et les fichiers racine de l'installation. La production construit toujours, le court-circuit de FIX-PYRAMID-1 restant en tête. Le retour arrière est livré par la section Deployment du README. Le pourquoi : [story](netlify-deploy.story.md).

## Boundaries

Le site et ses modules n'appellent rien de nouveau : la règle lit leurs manifestes sans en importer aucun. Une seule API naît.

### CLI API of package `scripts` in app `@robusta/robusta-build` — new

Client code : la clé `[build] ignore` de `apps/robusta-build/netlify.toml`, exécutée par Netlify à la racine du dépôt (base directory vide).

- invocation : `node apps/robusta-build/scripts/netlify-ignore.mjs <site>`, `<site>` étant le nom du manifeste du site, `@robusta/robusta-build`. Lit `CACHED_COMMIT_REF` et `COMMIT_REF` dans l'environnement, et l'historique git du répertoire courant.
- exit 0 : la ref en cache est jugeable, et aucun commit de la plage `CACHED_COMMIT_REF..COMMIT_REF` ne touche un chemin surveillé ; Netlify saute la build.
- exit 1 : un commit de la plage touche un chemin surveillé ; ou une ref est absente, vide, inconnue du clone ou égale à l'autre ; ou la ref en cache n'est pas sur l'historique de premier parent de `COMMIT_REF` ; ou la règle a échoué (git, manifeste illisible, site introuvable, motif de `workspaces` non compris). Netlify construit. Un crash non rattrapé sort aussi non nul.
- stdout : une ligne, `skip: <raison>` ou `build: <raison>`. La raison nomme le premier chemin changé et son app ou module, ou la ref en cause, ou le message d'erreur, et le nombre de répertoires surveillés. Rien sur stderr hors crash.

Chemins surveillés, lus au `COMMIT_REF` :

- le répertoire du site ;
- le répertoire de chaque module atteint depuis le manifeste du site, transitivement, par `dependencies`, `devDependencies`, `peerDependencies` et `optionalDependencies`, une dépendance comptant dès que son nom est celui d'un manifeste de `workspaces`, quelle que soit sa plage ;
- les fichiers racine de l'installation : `package.json`, `yarn.lock`, `.yarnrc.yml`, `.yarn/releases`, `.nvmrc`.

Export de bibliothèque, pour la spec seule (client code : `netlify-ignore.spec.ts`) :

```ts
type IgnoreInput = {
  repo: string;        // répertoire du dépôt git
  site: string;        // '@robusta/robusta-build'
  cachedRef?: string;  // CACHED_COMMIT_REF
  commitRef?: string;  // COMMIT_REF
};
type IgnoreVerdict = { build: boolean; reason: string };

/** Never throws: any failure is a build verdict whose reason carries the error. */
function ignoreVerdict(input: IgnoreInput): IgnoreVerdict;
```

Client code, `netlify.toml` :

```toml
ignore = "[ \"$CONTEXT\" = production ] && exit 1; node apps/robusta-build/scripts/netlify-ignore.mjs @robusta/robusta-build"
```

Inchangés : `yarn build:robusta` et `yarn build:deps`, la clé `[build] command`, le reste de `netlify.toml`, le site et ses modules.

## Technical Constraints

- Netlify exécute la commande d'ignore après le clone et avant l'installation des dépendances, avec le Node de l'image de build, pas forcément celui de `.nvmrc`. Le script n'importe que des modules `node:` présents depuis Node 18 (`node:child_process`, `node:fs`, `node:path`, `node:url`) : ni `typescript` comme `check-source.mjs`, ni `fs.glob`. Aucun réseau, aucun jeton, aucun `git fetch`. Sans `node` dans l'image, le shell sort 127 et la build tourne.
- Exit 0 annule la build, tout autre code la lance. Hors production, `[ "$CONTEXT" = production ]` échoue, `&&` court-circuite, `;` enchaîne : le code de sortie de la commande est celui du script.
- `CACHED_COMMIT_REF` est le dernier commit construit sur n'importe quelle branche, dans n'importe quel contexte (FIX-PYRAMID-1) ; il vaut `COMMIT_REF` sur une build sans cache et sur une relance depuis le dashboard. Sa valeur après une build échouée ou annulée n'est pas documentée. Le clone ne garantit aucune profondeur d'historique : une ref absente du clone est une erreur git, donc une build.
- Git seul ne dit pas quel commit le déploiement de branche sert. La ref en cache est jugeable quand elle est sur l'historique de premier parent de `COMMIT_REF` : un merge de `main` dans la branche, premier parent sur la branche, fait construire quand la ref en cache vient de la production. Seule exception acceptée (AC-NETLIFY-6) : une branche qui prend `main` en fast-forward et ajoute dans le même push un commit sans code trouve la ref en cache, la production de `main`, sur son historique de premier parent : sa build est sautée et son aperçu reste périmé. Après un fast-forward, la production de `main` et la build précédente de la branche ont la même forme dans git ; seule l'API Netlify les distingue, avec un jeton que la story exclut.
- La plage `CACHED_COMMIT_REF..COMMIT_REF` se juge commit par commit, merges et commits arrivés par un second parent compris, sans la simplification d'historique que git applique par défaut à un log limité à des chemins.
- Le champ `workspaces` du `package.json` racine porte aujourd'hui `apps/*`, `services/*` et `packages/*`. Le script comprend un chemin exact et `<dossier>/*` ; un dossier sans `package.json` n'est pas un workspace yarn (`apps/robusta-design`, `services/scribe-intel-backend`). Tout autre motif est une erreur, donc une build. Les manifestes se lisent dans les objets git du `COMMIT_REF`, jamais dans l'arbre de travail.
- Yarn 4 lie une dépendance au workspace yarn qui porte son nom même sans protocole `workspace:` (transparent workspaces, réglage par défaut) : le graphe rattache donc une dépendance par son nom, quelle que soit sa plage, et pas par le seul protocole `workspace:`.
- La spec crée ses dépôts de fixture sous `os.tmpdir()` et isole git de la configuration de la machine : identité de commit, nom de branche par défaut, signature des commits. Elle tourne dans `yarn workspace @robusta/robusta-build run test`, `vitest.config.ts` incluant déjà `scripts/**/*.spec.ts`.

## Requirements

### Règle d'ignore

- R-NETLIFY-01 : `apps/robusta-build/scripts/netlify-ignore.mjs` porte la CLI et l'export `ignoreVerdict` de §Boundaries, avec sa spec vitest `netlify-ignore.spec.ts` à côté ; `main()` ne fait que lire l'environnement et `process.argv`, écrire la ligne et sortir.
- R-NETLIFY-02 : les chemins surveillés sont le répertoire du site, ceux des modules qu'il atteint transitivement par les quatre champs de dépendances, et les cinq fichiers racine de l'installation, lus au `COMMIT_REF` ; un module ajouté au site ou au design system est surveillé sans retouche de la règle.
- R-NETLIFY-03 : la règle saute la build quand aucun commit de `CACHED_COMMIT_REF..COMMIT_REF` ne touche un chemin surveillé, et la lance dès qu'un seul le fait, quelle que soit sa place dans le push.
- R-NETLIFY-04 : une ref absente, vide, inconnue du clone ou égale à l'autre fait construire.
- R-NETLIFY-05 : une ref en cache absente de l'historique de premier parent de `COMMIT_REF` fait construire.
- R-NETLIFY-06 : toute erreur fait construire, avec exit 1 et la ligne `build:` qui la nomme ; `ignoreVerdict` ne lève jamais.
- R-NETLIFY-07 : le script n'importe que des modules `node:` et n'appelle que `git`, sans réseau ni jeton.

### Configuration Netlify

- R-NETLIFY-21 : `[build] ignore` garde `[ "$CONTEXT" = production ] && exit 1;` en tête et appelle le script à la place du `git diff --quiet` ; le commentaire au-dessus de la clé décrit la nouvelle règle. `yarn build:robusta`, `yarn build:deps` et le reste de `netlify.toml` ne changent pas.

### README

- R-NETLIFY-41 : la section Deployment de `apps/robusta-build/README.md`, réécrite par docman selon le plan Documentation updates de la story, dit aussi qu'on merge `main` dans la branche d'epic par un commit de merge (`git merge --no-ff main`), et qu'un aperçu resté périmé par l'exception de AC-NETLIFY-6 se reconstruit par une relance depuis le dashboard.

## Acceptance Criteria

- AC-NETLIFY-4 : Étant donné une build hors production, quand les changements arrivés depuis la dernière build ne touchent que des apps ou modules dont le site ne dépend pas, même indirectement (dakar, v1, les modules de base), ou que des documents hors du code comme `features/` et `ROADMAP.md`, alors Netlify saute la build. Quand un seul de ces commits, même pas le dernier du push, touche le site, un module dont il dépend directement ou non, ou un fichier racine de l'installation (`package.json`, `yarn.lock`, `.yarnrc.yml`, `.yarn/releases`, `.nvmrc`), alors Netlify construit, y compris pour un module ajouté aux dépendances du site, directement ou par le design system, après cette story, sans que personne retouche la règle. Une build de production construit toujours, quel que soit le commit.
- AC-NETLIFY-5 : Étant donné un déploiement de production défectueux, quand Nicolas suit le README du site, alors il sait publier le déploiement précédent sans rebuild, verrouiller la publication automatique pour que le merge suivant sur `main` n'écrase pas ce retour, puis revenir en avant en publiant le déploiement corrigé et en déverrouillant.
- AC-NETLIFY-6 : Étant donné les cas limites, quand ils se présentent, alors une ref inconnue, absente ou égale au commit construit (build sans cache, relance depuis le dashboard) fait construire ; une ref en cache venue de la production, alors que la branche porte du code pas encore sur `main`, fait construire ; une branche d'epic qui reçoit `main` par un commit de merge, ou par un push qui s'arrête sur la tête de `main`, après une production portant du code du site qu'elle n'avait pas, fait construire ; seule exception acceptée, une branche qui prend `main` en fast-forward et ajoute dans le même push un commit sans code voit sa build sautée et son aperçu rester périmé : le README demande de merger `main` par `git merge --no-ff main`, et renvoie, pour un aperçu périmé, à une relance depuis le dashboard, qui fait construire ; une erreur de la règle fait construire ; un retour à un déploiement antérieur à go-live referme tout le site à l'indexation, et le README le signale ; un déploiement précédent de plus de 30 jours n'existe plus, et le README renvoie alors à un revert sur `main`, qui coûte une production.

Edge cases to test :

- un push de trois commits dont seul le premier touche le site : build
- un commit qui ne touche qu'un module de base (`packages/helpers`), `apps/dakar` ou `apps/robusta` : skip ; un commit qui ne touche que `features/` et `ROADMAP.md` : skip
- un module ajouté aux dépendances du design system, puis un commit qui ne touche que ce module : build aux deux commits
- un commit qui ne touche que `.yarn/releases` : build
- une ref en cache vide, inconnue du dépôt, ou égale au commit construit : build
- une ref en cache prise sur `main` alors que la branche a divergé avec du code du site : build
- une branche qui merge `main` par un commit de merge, `main` portant du code du site absent de la branche, sans autre changement : build
- une branche qui prend `main` en fast-forward et ajoute dans le même push un commit sans code : skip, l'exception acceptée
- un manifeste illisible ou un motif de `workspaces` non compris : build, la ligne nomme l'erreur
