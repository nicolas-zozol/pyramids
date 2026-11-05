# Brainstorm : go-live

**Date :** 2026-11-04
**Participants :** bsman (autonomous)
**Infix :** GOLIVE
**Source :** `features/pyramid-v2-epic/go-live/go-live.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Constats vérifiés le 2026-11-04

- Netlify ajoute `X-Robots-Tag: noindex` aux deploy previews et aux anciens déploiements de branche, jamais au déploiement le plus récent d'une branche (documentation Netlify, « Search engine indexing »). Lu en direct : `https://epic-robusta-v2--robusta-build.netlify.app/en` répond 200 sans `X-Robots-Tag`. AC-GOLIVE-3 ne tient donc que si la build elle-même reste fermée hors production.
- Netlify expose à la build la variable en lecture seule `CONTEXT` : `production`, `deploy-preview`, `branch-deploy` ou `dev`. Une build locale ne la porte pas.
- `https://robusta-build.netlify.app/` répond 200, sans redirection vers `https://www.robusta.build` ; l'apex `robusta.build` répond 301 vers `www`. Ouverte, la production le serait donc aussi sous le sous-domaine Netlify.
- `/robots.txt` répond 404 en production : seo-excellence le livre.
- La directive `noindex, nofollow` est posée par le head de la route racine, `src/routes/__root.tsx`. Ce head tourne au prérendu et à nouveau dans le navigateur, à l'hydratation et à chaque navigation client.

## Challenge des Acceptance Criteria

- AC-GOLIVE-1 : testable sur la build, en langage métier. Suffisant pour la page HTML prérendue, muet sur ce que lit un crawler qui exécute les scripts : le head recalculé dans le navigateur doit déclarer la même chose (cas limite 1).
- AC-GOLIVE-2 : testable et suffisant ; les trois exemples couvrent les catégories de pages fermées. Il hérite de la définition d'`Indexable page` et de la dérivation de seo-excellence, sans rien redéfinir.
- AC-GOLIVE-3 : nécessaire, le constat Netlify ci-dessus le confirme : sans lui, le déploiement de branche de `epic/robusta-v2` s'ouvrirait dès le commit de go-live. « Un déploiement » laisse dehors la build locale et le draft deploy du CLI, qui ne sont pas la production (cas limite 2).
- AC-GOLIVE-4 : en langage métier, mais vérifiable seulement après le merge sur `main` et après l'inscription de la propriété par seo-excellence (décision du 2026-07-30). Il se vérifie à `storyman done`, pas au submit.
- AC-GOLIVE-5 : trois cas limites dans un seul AC. Chacun est testable, mais un échec ne dit pas lequel a cassé ; le découpage en trois AC est proposé à storyman. Le retour arrière tient par construction : un déploiement d'avant go-live porte `noindex` dans ses fichiers.

Cas limites métier proposés à storyman :

1. Given une page indexable de la production, When un crawler qui exécute les scripts la lit, ou y arrive par une navigation client, Then elle se déclare toujours indexable ; et une page d'un déploiement hors production reste non indexable dans les mêmes conditions.
2. Given une build qui n'est pas celle de la production Netlify, une build locale ou un draft deploy du CLI compris, When un crawler lit ses pages, Then aucune ne se déclare indexable.
3. Given la production ouverte, When un crawler lit une page sous `robusta-build.netlify.app`, Then il est renvoyé en 301 vers la même page sous `https://www.robusta.build` (selon OQ-GOLIVE-2).
4. Given un déploiement hors production, When un crawler lit son `/robots.txt`, Then celui-ci ne bloque rien, pour que le crawler lise le `noindex` de chaque page au lieu d'indexer des URL sans contenu.

Aucune règle métier : la story change la configuration d'un site, pas la politique de l'entreprise.

---

## 1. Product Role

**Problème :** le site v2 est en ligne mais invisible aux moteurs ; seo-excellence prépare des pages déclarables sans les ouvrir.

**Décision (autonome):** go-live est un interrupteur de build : en production, chaque page que seo-excellence déclare indexable s'ouvre ; partout ailleurs, rien. Ce n'est ni une étape SEO (titres, sitemap, canonical restent à seo-excellence), ni une migration d'hébergement, ni une redirection des adresses v1.

**Rationale :** séparer « ce qui est indexable » de « quand on ouvre » garde go-live minuscule et réversible.

---

## 2. Target Audience

**Décision (autonome):** deux lecteurs. Les crawlers des moteurs de recherche et des answer engines, qui lisent le head et les en-têtes HTTP. Nicolas, éditeur, qui merge sur `main` et contrôle le résultat dans la console webmaster.

**Rationale :** aucun visiteur humain ne voit de différence ; la story ne livre rien d'affiché.

---

## 3. Core Problem

**Problème :** ouvrir l'indexation sans ouvrir la 404, une page sans contenu propre, ni un déploiement de branche que Netlify laisse indexable.

**Décision (autonome):** le problème central est le second : le code de go-live est commité sur `epic/robusta-v2`, dont le déploiement de branche est public et sans `X-Robots-Tag`. L'ouverture dépend donc de deux conditions réunies : la page est indexable selon seo-excellence, et la build est celle de la production.

**Rationale :** la première condition est déjà livrée par seo-excellence ; la seconde est tout l'apport de go-live.

---

## 4. Unique Value Proposition

**Options considérées :**
- Supprimer `noindex` de la racine : ouvre aussi la 404 et toute page oubliée, et le déploiement de branche.
- Protéger les déploiements hors production par mot de passe ou visibilité privée Netlify : hors dépôt, dépend de l'offre, et ne règle pas la production.
- Un en-tête `X-Robots-Tag` écrit par la build dans un `_headers` hors production : un second mécanisme à garder d'accord avec le head.
- Ouvrir chaque page indexable, et seulement dans la build de production : une condition de plus dans la déclaration robots que seo-excellence pose déjà.

**Décision (autonome):** la dernière.

**Rationale :** fermé par défaut partout, ouvert par une seule condition lue au build, sans configuration Netlify hors dépôt.

---

## 5. Functional Scope

**Décision (autonome):**
- Dedans : la condition « build de production » dans la déclaration robots de chaque page ; la redirection du sous-domaine Netlify de production si OQ-GOLIVE-2 est retenue ; les mises à jour de documentation listées par la story.
- Dehors : ce que chaque page déclare, le sitemap, `robots.txt`, les canonical URLs, l'audit et l'inscription à la console (seo-excellence) ; les adresses v1 (restore-v1-urls) ; le passage en offre Personal (Dep 2, action de Nicolas) ; la protection par mot de passe des déploiements hors production.

**Rationale :** go-live ne touche qu'une condition et, au plus, une règle de redirection.

---

## 6. Core Features

### Feature : Ouverture en production

**Capability :** dans la build dont `CONTEXT` vaut `production`, une page que seo-excellence déclare indexable se déclare indexable et suivable ; toute autre page garde `noindex, nofollow`.

**Acceptance Criteria :** AC-GOLIVE-1, AC-GOLIVE-2 (de la story), testables.
- Proposé à storyman : cas limite 1 (crawler qui exécute les scripts).

**Test Approach :** tests unitaires vitest de la déclaration robots, production et hors production, sur une page indexable, la 404 et une page sans déclaration ; l'audit de build de seo-excellence lancé avec `CONTEXT=production`, qui doit compter autant de pages ouvertes que d'entrées au sitemap.

---

### Feature : Fermeture hors production

**Capability :** toute build dont `CONTEXT` ne vaut pas `production`, ou ne porte pas la variable, déclare chaque page non indexable, la page indexable comprise.

**Acceptance Criteria :** AC-GOLIVE-3, testable.
- Proposé à storyman : cas limites 2 et 4.

**Test Approach :** le même test unitaire sans `CONTEXT` et avec `branch-deploy` ; après le commit sur `epic/robusta-v2`, lecture du head d'une page article du déploiement de branche (`curl`), qui doit porter `noindex`.

---

### Feature : Production sous un seul hôte

**Capability :** `robusta-build.netlify.app` renvoie en 301 vers la même page sous `https://www.robusta.build`, pour qu'aucune copie ouverte ne vive sous un second hôte. Retenue sous réserve d'OQ-GOLIVE-2.

**Acceptance Criteria :** aucun AC de la story ne la couvre.
- Proposé à storyman : cas limite 3.

**Test Approach :** `curl -I` sur le sous-domaine Netlify après le déploiement de production, et sur `www` pour vérifier l'absence de boucle.

---

### Feature : Contrôle après merge

**Capability :** Nicolas soumet `/sitemap.xml` dans la console webmaster et vérifie qu'aucune URL listée n'est signalée bloquée.

**Acceptance Criteria :** AC-GOLIVE-4, testable après merge seulement.

**Test Approach :** vérification manuelle dans la console, au moment de `storyman done`.

---

### Feature : Cas limites de cycle de vie

**Capability :** un retour arrière referme, une page qui perd son contenu se referme seule, une adresse v1 reste 404 et fermée.

**Acceptance Criteria :** AC-GOLIVE-5.
- Proposé à storyman : le découper en trois AC, un par cas.

**Test Approach :** le retour arrière se prouve par lecture d'un déploiement d'avant go-live (déjà en `noindex`) ; la page sans contenu par un test de la dérivation de seo-excellence, avec la condition de production active ; l'adresse v1 par le test de la 404.

---

## 7. Critical Edge Cases

**Décision (autonome):** les quatre cas proposés plus haut, et trois cas tenus sans travail :
- un draft deploy du CLI lancé avec un contexte de production serait ouvert ; ses canonical URLs nomment `www.robusta.build`, la copie se rattache à la production. CLAUDE.md interdit déjà `--prod`.
- le sitemap d'un déploiement hors production liste les URL de `www` : il n'ouvre rien.
- un « retry deploy » d'un commit d'avant go-live reconstruit sans la condition, donc fermé.

**Rationale :** ce qui tient par construction n'appelle ni code ni test de plus.

---

## 8. Non-Functional Constraints

**Décision (autonome):**
- Cohérence : la condition de production est fixée au build et lue à l'identique par le prérendu et par le bundle client, sinon le head recalculé à l'hydratation refermerait la page pour un crawler qui exécute les scripts.
- Coût : une production ouverte attire les crawlers, et chaque requête consomme des crédits Netlify ; l'offre Personal avec recharge automatique (Dep 2) couvre ce risque.
- Conformité : aucune mesure ajoutée, BR-PYRAMID-2 tient ; la console webmaster ne livre rien au visiteur.

**Rationale :** le seul risque technique réel est la divergence entre HTML prérendu et head client.

---

## 9. External Dependencies

**Décision (autonome):**
- Netlify : la variable `CONTEXT` et le comportement documenté de `X-Robots-Tag`.
- La console webmaster où robusta.build est une propriété vérifiée, inscription portée par seo-excellence.
- seo-excellence (Dep 1) : la déclaration d'indexabilité par page.
- L'offre Netlify Personal (Dep 2), avant le merge.

**Rationale :** go-live n'ajoute aucune dépendance de code.

---

## 10. Major Risks

**Décision (autonome):**
- Le déploiement de branche s'ouvre : levé par la condition de production, vérifié par `curl` après le commit.
- Le head client diverge du HTML prérendu : levé par une condition fixée au build, couvert par le cas limite 1.
- Merge avant que seo-excellence soit sur la branche : impossible tant que les deux restent sur `epic/robusta-v2`, mergée d'un bloc.
- Crédits Netlify épuisés par les crawlers, ce qui mettrait en pause les sites de l'équipe : Dep 2.
- Une copie ouverte sous `robusta-build.netlify.app` : OQ-GOLIVE-2.

**Rationale :** chaque risque a un contrôle nommé ou une dépendance déjà inscrite.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Nothing points into an app, no loop.

  Netlify build (sets CONTEXT)         crawlers
      │                                   │
      │ CLI                               │ HTTP
      ↓                                   ↓
  app `@robusta/robusta-build` [modified: go-live]
```

La déclaration robots par page vit dans le package que le design de seo-excellence choisira ; go-live y ajoute une entrée, la condition de production, sans créer de package.

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, et une build locale.

- `yarn build:robusta` · modifié — lit `CONTEXT` ; `production` ouvre les pages indexables, toute autre valeur ou son absence garde tout fermé. Codes de sortie inchangés.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers.

- `GET` sur une page indexable, build de production · modifié — 200, son head la déclare indexable · était `noindex, nofollow`. Toute autre page, et toute page d'une build hors production, garde cette directive.
- `GET https://robusta-build.netlify.app/{path}` · modifié, selon OQ-GOLIVE-2 — 301 vers `https://www.robusta.build/{path}` · était 200.

---

## Open Questions & Gaps

## Next Steps

- `storyman update go-live avec brainstorm` : les quatre cas limites, le découpage d'AC-GOLIVE-5 et la portée « build » d'AC-GOLIVE-3, plus l'arbitrage d'OQ-GOLIVE-2 et le pli d'OQ-GOLIVE-1.
- designman sur go-live, après le design de seo-excellence, qui nomme le package de la déclaration robots.
- Après le commit sur `epic/robusta-v2` : `curl` du déploiement de branche, qui doit rester en `noindex`.
- À `storyman done`, après le merge et Dep 2 : AC-GOLIVE-4 dans la console webmaster.
