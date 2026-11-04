# Brainstorm : glossary-refresh

**Date :** 2026-11-04
**Participants :** bsman (autonomous)
**Infix :** GLOSSARY
**Source :** `features/pyramid-v2-epic/glossary-refresh/glossary-refresh.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Gap-GLOSSARY-1, Gap-GLOSSARY-2 et OQ-GLOSSARY-3 sont pliées dans la story : ce brainstorm les tient pour acquises. La numérotation reprend à 4.

---

## Sources lues

- `ubiquitous-language.md`, `business-rules.md` (BR-PYRAMID-3, 12, 13, 14, BR-ROBUSTA-1)
- `apps/robusta-build/README.md` : Where the truth of this site lives, Articles, Routing, One URL per page, Styling
- `apps/robusta-build/src/seopyramids.config.ts`, `src/routing/url-scheme/url-scheme.archi.md`, `src/content/corpus-reader/translation-notices.ts`
- `packages/robusta-design-system/package.json` (exports)
- `CLAUDE.md`, vocabulaire des composants ; `pyramid-v2.epic.md`, décisions du 2026-10-25 et du 2026-10-26

## Faits vérifiés

- Discriminants : `c`, `p`, `t` seulement, dans `src/routing/url-scheme` du site ; `l` est un slug ordinaire (`parse-url.spec.ts`, `validate-articles.spec.ts`).
- Aucun `siteTitle` ni `mission` sous `apps/robusta-build/src`.
- Une majuscule reçoit une 301 seulement quand la forme minuscule est un fichier, sinon 404 ; `/en/{rest}` reçoit sa 301 même quand la cible n'est pas construite, puis 404.
- L'original est la version publiée de sa Locale sous le même `translationId` ; les notices de traduction ne portent que sur les articles publiés.
- L'empreinte couvre titre, excerpt et corps, chaque suite de blancs lue comme un espace : tags, date, category et couverture n'y entrent pas.
- Le site lit `colors_and_type.css`, `sketch.css` et les assets du design system tels qu'écrits à la racine du module ; seul le code passe par `dist/` (`tsc`).
- La page copy des trois Locales présente RB Compound en deux versions : open source, gratuite et pas encore publiée ; complète, avec un accompagnement payant.

---

## Challenge des Acceptance Criteria

Verdict par AC :

- AC-GLOSSARY-1 : testable à la lecture, en langage métier, conforme au README. Ne dit pas qu'une Locale sans article publié garde sa landing page (E4).
- AC-GLOSSARY-2 : testable, conforme à « One URL per page ». Insuffisant : « la redirection permanente pour une majuscule » n'est vrai que si la forme minuscule existe, et la 301 de `/en/…` ne garantit pas de page (E1 à E3).
- AC-GLOSSARY-3 : testable. Insuffisant sur l'exception de BR-PYRAMID-13 dans `Site` (E5). Ses nouveaux `Module` et « package » contredisent l'entrée `Workspace`, que la story ne cite pas (Gap-GLOSSARY-4), et la seconde phrase de `Build chain` est fausse pour les CSS et assets du design system (Gap-GLOSSARY-5).
- AC-GLOSSARY-4 : testable, conforme à la config et au README ; suffisant. Les Locales sont écrites dans `src/routing/scheme.ts` et lues par la config : « porte » reste juste.
- AC-GLOSSARY-5 : testable, conforme au README. Insuffisant : l'original non publié, la paire sans original déclaré, le changement hors empreinte et la traduction non publiée ne sont pas couverts (E6 à E9).
- AC-GLOSSARY-6 : testable, conforme à la page copy des trois Locales. Ne dit rien de la version open source encore non publiée (E10). `Compound` seul n'a pas d'entrée : aucun code ni contrat ne l'emploie.
- AC-GLOSSARY-7 : testable par recherche et par diff. « Les entrées que la story ne cite pas restent mot pour mot » dépend de Gap-GLOSSARY-4.

Cas limites métier proposés à storyman :

- E1, une ancienne adresse sans page : Given `theory`, revendiquée par `fr` seule, When un lecteur lit `Canonical URL`, Then `/en/articles/c/theory` reçoit la 301 vers `/articles/c/theory`, qui répond 404 : la redirection ne promet pas de page.
- E2, une majuscule sans forme minuscule construite : Given une adresse en majuscules dont la forme minuscule n'est pas construite, When un lecteur lit `Canonical URL`, Then elle reçoit un 404, pas une 301.
- E3, la barre finale de la racine : Given `/` et `/fr/`, When un lecteur lit `Canonical URL`, Then `/` est la seule canonical URL qui finit par une barre, et `/fr/` reçoit une 301 vers `/fr`.
- E4, une Locale sans article : Given `es`, qui ne publie aucun article, When un lecteur lit `Landing page`, Then `/es` est sa landing page, sans blog roll.
- E5, un design system qu'un seul site utilise : Given le design system de robusta.build, que robusta.build est seul à utiliser, When un lecteur lit `Site` et `Module`, Then il reste un module (BR-PYRAMID-13), seule exception à « ce qu'il est seul à utiliser lui appartient ».
- E6, un original non publié : Given une traduction dont l'original déclaré n'est pas publié ou a quitté le corpus, When un lecteur lit `Original` et `Stale translation`, Then l'original est une version publiée : la traduction reste servie, sans lien vers lui, et n'est pas une stale translation.
- E7, deux versions sans original déclaré : Given deux articles publiés qui partagent un translation identifier sans qu'aucun ne déclare d'original, When un lecteur lit `Original`, Then chacun est son propre original, et aucun ne peut être une stale translation.
- E8, un changement hors titre, excerpt et corps : Given un original dont seuls la category, les tags, la date, la couverture ou les blancs changent, When un lecteur lit `Stale translation`, Then sa traduction n'est pas une stale translation.
- E9, une traduction non publiée : Given une traduction qui ne se déclare pas publiée et dont l'original a changé, When un lecteur lit `Stale translation`, Then elle n'est pas servie (BR-PYRAMID-10) et la build ne la signale pas : une stale translation est publiée.
- E10, la version open source pas encore publiée : Given la version open source annoncée et non publiée, When un lecteur lit `RB Compound`, Then l'entrée nomme les deux versions que le site présente, sans dire l'une disponible ni lier de dépôt.

Aucune Business Rule nouvelle. La règle sur les stale translations publiées reste à epicman après livraison, comme le dit la story.

---

## 1. Rôle du produit

Remettre `ubiquitous-language.md` d'accord avec le site livré. Ce n'est ni une documentation du code, ni un registre de règles, ni le README.

**Décision (autonome):** livrable limité à `ubiquitous-language.md`, aucune entrée nouvelle hors des quatre que la story crée.

**Rationale:** seo-excellence et rb-compound-positioning attendent ces termes, rien d'autre.

---

## 2. Public cible

- Les agents Compound (storyman, designman, tddman), qui lisent le glossaire comme référence et le font gagner sur le skill boundaries.
- L'éditeur, Nicolas, qui arbitre les termes.

**Décision (autonome):** les agents sont le lecteur décisif ; une entrée fausse se propage dans chaque design.

**Rationale:** le design de seo-excellence calcule ses canonical URLs sur `Canonical URL` et `Locale`.

---

## 3. Problème central

**Problème :** le glossaire décrit quatre discriminants, une base partagée qui lit le corpus, un titre de site et une mission, et une `Canonical URL` dont toute autre forme redirige, alors que le site sert la plupart de ces formes en 404.

**Décision (autonome):** réécrire les entrées citées sur l'état livré et vérifié, rien de plus.

**Rationale:** chaque énoncé faux est vérifiable dans le README ou le code.

---

## 4. Proposition de valeur

Un vocabulaire juste avant le design de seo-excellence, au lieu d'une correction après coup dans un design déjà approuvé.

**Décision (autonome):** livrer avant le design de seo-excellence, comme le fait le batch B1.

**Rationale:** sa Dep 3 attend `Canonical URL`.

---

## 5. Périmètre fonctionnel

Dedans : les dix entrées modifiées et les quatre créées de la story, plus ce que décide Gap-GLOSSARY-4.

Dehors : le README, qui appelle encore « surfaces » les sections ; `documentation/geo-questions.md` (rb-compound-positioning) ; la BR des stale translations (epicman) ; dakar.surf.

**Décision (autonome):** `Original` et `Stale translation` dans la partie Contenu, `RB Compound` dans Produit, `Module` dans Livraison à côté de `Build chain`.

**Rationale:** chaque terme rejoint les entrées qui l'emploient.

---

## 6. Fonctionnalités clés

### Feature : Locale, Discriminant, Landing page

Capability : le schéma d'URL de BR-PYRAMID-14, trois discriminants du site, une landing page par Locale.

Acceptance Criteria : AC-GLOSSARY-1, AC-GLOSSARY-7
- Proposé à storyman : E4

Test Approach : relecture contre la section Routing du README ; recherche de `` `l` `` et de « base partagée » dans le glossaire, sans résultat.

---

### Feature : Canonical URL

Capability : la forme construite, et la réponse de l'hébergeur à chaque autre forme.

Acceptance Criteria : AC-GLOSSARY-2
- Proposé à storyman : E1, E2, E3

Test Approach : relecture contre « One URL per page » et `netlify.toml` ; les réponses ont été mesurées sur deploy par default-locale-at-root.

---

### Feature : Pyramid, Module, Site, Design system, Content source, Build chain

Capability : le découpage app, module, package de BR-PYRAMID-3, 12 et 13.

Acceptance Criteria : AC-GLOSSARY-3
- Proposé à storyman : E5 ; Gap-GLOSSARY-4 et Gap-GLOSSARY-5

Test Approach : relecture contre `CLAUDE.md` et les exports de `packages/robusta-design-system/package.json`.

---

### Feature : Site configuration

Capability : ce que porte `src/seopyramids.config.ts`.

Acceptance Criteria : AC-GLOSSARY-4

Test Approach : relecture contre l'objet de config ; recherche de `siteTitle` et `mission` dans le glossaire, sans résultat.

---

### Feature : Original, Stale translation

Capability : le suivi des traductions dans les termes de l'éditeur, sans empreinte, contrepartie ni paire non suivie.

Acceptance Criteria : AC-GLOSSARY-5, AC-GLOSSARY-7
- Proposé à storyman : E6, E7, E8, E9

Test Approach : relecture contre la section Articles du README et `translation-notices.ts`.

---

### Feature : RB Compound

Capability : le nom de l'offre que présente la landing page.

Acceptance Criteria : AC-GLOSSARY-6
- Proposé à storyman : E10

Test Approach : relecture contre la page copy `landing` des trois Locales.

---

### Feature : entrées non citées

Capability : le reste du glossaire inchangé.

Acceptance Criteria : AC-GLOSSARY-7

Test Approach : `git diff ubiquitous-language.md` ne touche que les entrées listées par la story et par la réponse à Gap-GLOSSARY-4.

---

## 7. Cas limites critiques

E1 à E10, dans le challenge des AC.

**Décision (autonome):** chaque cas devient une précision d'AC, aucun ne crée d'entrée de glossaire.

**Rationale:** AC-GLOSSARY-7 exclut les termes de code ; les cas se disent avec les termes existants.

---

## 8. Contraintes non fonctionnelles

- Langue : définitions en français, termes en anglais (CLAUDE.md, Documents Compound).
- Style : énoncer l'état en place, sans historique ; la v1 n'est citée que là où elle l'est déjà.

**Décision (autonome):** aucune autre contrainte.

**Rationale:** un fichier markdown sans consommateur programmatique.

---

## 9. Dépendances externes

Netlify, pour les réponses décrites dans `Canonical URL` : la règle de `netlify.toml` et les Pretty URLs du tableau de bord.

**Décision (autonome):** l'entrée dit « l'hébergeur », sans nommer Netlify ni son réglage.

**Rationale:** le glossaire décrit le site ; le README porte le détail de l'hébergeur.

---

## 10. Risques majeurs

- Une entrée qui redit le README dérive au prochain changement de schéma : les entrées gardent le comportement, pas les chiffres.
- `Workspace` laissé tel quel garde deux définitions de module dans le même fichier (Gap-GLOSSARY-4).

**Décision (autonome):** aucun compte d'URL, de fichier ou d'article dans les entrées.

**Rationale:** ces chiffres changent à chaque article publié.

---

## 11. Boundaries

Aucune boundary franchie ni créée : la story ne modifie que `ubiquitous-language.md`, ni code, ni API, ni contrat. Les termes app, module et package qu'elle définit sont ceux du skill boundaries, que le glossaire gagne s'ils divergent.

**Décision (autonome):** pas de bloc.

**Rationale:** aucun API nouveau ni modifié.

---

## Open Questions & Gaps

### Gaps

- Gap-GLOSSARY-4: `Workspace`, hors de la story, définit un module comme « une bibliothèque partagée » et un workspace comme un package yarn, contre les nouveaux `Module` et « package » : réécrire `Workspace` et `Green set`, ou les laisser contredire ?
- Proposition : ajouter `Workspace` et `Green set` aux entrées modifiées. `Workspace` reprend CLAUDE.md, l'ensemble du code et de la documentation du projet ; `Green set` devient l'ensemble nommé des apps et des modules qui doivent se construire depuis un clean checkout, la build chain plus chaque site que le dépôt prétend livrer. Le « service » disparaît, aucun n'existe.
- Rationale : la story prend `Module` dans CLAUDE.md ; garder `Workspace` met deux définitions de module dans le glossaire, que le skill boundaries fait gagner sur lui-même.
- Resolution:

- Gap-GLOSSARY-5: `Build chain` dit qu'un site ne lit d'un module que son build output, alors que robusta.build lit les CSS et assets du design system tels qu'écrits : corriger l'entrée, ou faire construire ces fichiers ?
- Proposition : l'entrée dit qu'un site ne lit d'un module que ce que son manifeste exporte, construit ou non ; le design system ne change pas.
- Rationale : les CSS et les SVG n'ont rien à compiler ; la règle utile est qu'un site ne passe jamais par les fichiers internes d'un module.
- Resolution:

---

## Next Steps

- `bulkman pyramid-v2-epic` : Gap-GLOSSARY-4 et 5 rejoignent le bulk du batch B1.
- `storyman update glossary-refresh avec brainstorm` : E1 à E10 dans AC-GLOSSARY-1, 2, 3, 5 et 6 ; Documentation updates et AC-GLOSSARY-7 selon Gap-GLOSSARY-4 ; `Build chain` selon Gap-GLOSSARY-5.
- `designman glossary-refresh`, sans attendre le bulk : il suit les Propositions.
- Hors story : le README de robusta-build appelle encore « surfaces » les sections du design system ; à reprendre par docman à la prochaine story qui le touche.
