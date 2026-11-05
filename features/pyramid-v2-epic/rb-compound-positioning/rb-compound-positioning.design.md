# Design: le registre GEO de robusta.build autour de RB Compound

**Last update:** 2026-11-05
**Feature:** rb-compound-positioning
**Infix:** RBCOMPOUND
**Status:** DRAFT
**Sources:** [story](rb-compound-positioning.story.md), [brainstorm](rb-compound-positioning.brainstorm.md), [epic](../pyramid-v2.epic.md)

## Goal

Réécrire `documentation/geo-questions.md` par le mode `questions` du skill `geo-article` (`.claude/skills/geo-article/SKILL.md`), pour que le registre vise l'acheteur de RB Compound et ne garde des PME qu'un reliquat couvert par le corpus. Aucun code, aucune build ne change. Le pourquoi : [story](rb-compound-positioning.story.md).

Le design suit les Propositions encore ouvertes d'OQ-RBCOMPOUND-1 et OQ-RBCOMPOUND-2 (story), de Gap-RBCOMPOUND-4 et OQ-RBCOMPOUND-6 (brainstorm).

## Boundaries

Aucune API touchée : ni app, ni module, ni package. Le seul artefact est `documentation/geo-questions.md`. Son contrat est le format que lisent les modes `write` (étape 1, recherche d'une question au registre) et `audit` du skill `geo-article` ; il reste inchangé.

### format du registre `documentation/geo-questions.md` — inchangé

Client code : skill `geo-article`, modes `write` et `audit`.

Une entrée, une puce :

```
- « <question> » — <type>, <format> — <article | aucun> — <verdict>[ ; <attente> | : <constat>]
```

- `<type>` : `meilleur`, `versus`, `alternatives`, `comment`, `définition`, en français quelle que soit la langue de la question.
- `<format>` : `listicle`, `comparatif` ou `guide`, celui que le skill associe au type.
- `<article>` : chemin relatif à `apps/robusta-build/content/articles`, extension `.md` comprise, dans la langue de la question ; sinon `aucun`.
- `<verdict>` : `couvert`, `à auditer`, `à réécrire`, `à écrire`, ou `brouillon, non publié` pour un article qui ne se déclare pas publié (BR-PYRAMID-10). Le complément nomme ce qu'attend l'entrée ou le constat qui fonde le verdict.
- Une puce sans guillemets « » n'est pas une entrée.

Sections, dans l'ordre :

- `# Questions GEO — robusta.build`, puis le paragraphe du client visé et la ligne `Format d'une entrée : question — type, format — article — verdict.`
- `## RB Compound` : la section principale, questions en anglais.
- `## PME` : la section secondaire, questions en français.
- `## Articles publiés sans question` : une puce par article.
- `## Contrôle mensuel` : nom lu par le skill, inchangé.

## Technical Constraints

- Markdown sans frontmatter, une entrée par ligne, aucun retour à la ligne dans une entrée.
- Prose du registre en français, écrite avec le skill `deslop` ; les questions RB Compound sont des citations en anglais, entre « ».
- Aucun chiffre, prix, classement ou version sans source.
- Un article se nomme par son fichier ; une paire de traductions se reconnaît à son `translationId` commun.

## Requirements

### Client visé

- R-RBCOMPOUND-01: le paragraphe du client visé nomme les équipes et les responsables techniques qui produisent du logiciel avec des agents IA, mot pour mot d’après la page copy.
- R-RBCOMPOUND-02: il nomme les deux versions : open source et gratuite, pas encore publiée, et complète, livrée seulement avec un accompagnement payant ; quand il compte les agents de la version open source, il en nomme quatre, epicman, storyman, designman et tddman (Gap-RBCOMPOUND-4).
- R-RBCOMPOUND-03: il nomme ce sur quoi repose l'expérience : le workflow Compound, qui a construit robusta.build v2, et les stories livrées de l'epic pyramid-v2.
- R-RBCOMPOUND-04: sa seule source citée est la Site configuration, `apps/robusta-build/src/seopyramids.config.ts` ; ni `documentation/google-business-profile.md`, ni le titre de site disparu, ni un lectorat blockchain.

### Section RB Compound

- R-RBCOMPOUND-21: la section ouvre le registre, porte la majorité des questions, en anglais, Locale par défaut (OQ-RBCOMPOUND-2), et couvre à elle seule les cinq types ; le jeu candidat est celui de l'axe 5 du brainstorm, que le mode `questions` confirme.
- R-RBCOMPOUND-22: chaque question porte sur une pratique que Compound applique et que robusta.build v2 a éprouvée : documents d'abord, design approuvé, tests d'abord.
- R-RBCOMPOUND-23: n'entrent pas une question de classement d'outils IA, une question qui nomme un outil tiers absent du workflow (Claude Code est le seul admis), la question du démarrage d'une équipe avec des agents IA (OQ-RBCOMPOUND-6), ni une question de marque à laquelle la landing page répond.
- R-RBCOMPOUND-24: une question dont le guide fait installer ou lancer la version open source porte le verdict `à écrire ; attend extract-compound-plugin` ; une définition, un listicle ou un comparatif portent `à écrire` sans attente, et aucun ne prévoit de lien vers un dépôt.
- R-RBCOMPOUND-25: aucune question ni aucun verdict ne présente la version complète comme disponible sans accompagnement.
- R-RBCOMPOUND-26: une question anglaise que seul un article français couvre nomme `aucun`, verdict `à écrire`, l'article français cité dans le complément comme source de la traduction.

### Section PME

- R-RBCOMPOUND-41: la section suit la section RB Compound, en français (OQ-RBCOMPOUND-2), et ne garde que les questions qu'un article publié ou en brouillon couvre déjà, au plus trois (OQ-RBCOMPOUND-1) : aujourd'hui « Agence web ou développeur freelance : que choisir pour une PME ? » en premier, puis « Quelles alternatives à Gmail pour une entreprise ? », couverte par `privacy/quitter-gmail.md`.
- R-RBCOMPOUND-42: le brouillon `web/agence-web-ou-freelance.md` garde son verdict `brouillon, non publié` et ce qu'il attend : les tarifs de Nicolas, une anecdote réelle et une couverture (BR-PYRAMID-10).
- R-RBCOMPOUND-43: aucune ligne du fichier, titres compris, ne nomme Toulouse ni la Haute-Garonne, ni « région ».
- R-RBCOMPOUND-44: les huit autres questions PME et les trois questions blockchain sortent du registre.

### Corpus

- R-RBCOMPOUND-61: chaque article publié, une paire de traductions comptant pour un, répond à une question du registre ou figure sous `## Articles publiés sans question` ; aujourd'hui 9 articles, Gmail sous une question, 8 sans question.
- R-RBCOMPOUND-62: un article sans question se nomme par le nom de son fichier français sans extension, comme le fait le registre actuel ; les trois articles blockchain portent leur constat après le nom : `ledger-contre-metamask` et `yield-farming-fr` à auditer, `outillage-solidity` à réécrire, l'article recommandant Truffle et Ganache, abandonnés par Consensys en 2023.
- R-RBCOMPOUND-63: un brouillon ne figure jamais sous `## Articles publiés sans question`.

### Contrôle mensuel

- R-RBCOMPOUND-81: `## Contrôle mensuel` ne porte aucun contrôle ; son paragraphe dit le contrôle ouvert depuis le merge de `epic/robusta-v2` sur `main`, la build de production servant ses pages indexables depuis le 2026-11-05, et garde le format d'un contrôle : la date, puis pour chaque question les moteurs qui citent robusta.build et les pages qu'ils citent à la place.

## Acceptance Criteria

- AC-RBCOMPOUND-1 : Given le registre réécrit, When Nicolas lit son client visé, Then il y trouve l'acheteur de RB Compound tel que le dit la page copy, équipes et responsables techniques qui produisent du logiciel avec des agents IA, ses deux versions, et ce sur quoi repose l'expérience : le workflow Compound, qui a construit robusta.build v2, et les stories livrées de l'epic pyramid-v2 ; la Site configuration est la seule source citée.
- AC-RBCOMPOUND-2 : Given le registre, When on compte ses questions, Then il en porte de 5 à 15, la section RB Compound en tête et majoritaire, les cinq types couverts sur l'ensemble du registre, chaque entrée au format du skill : question, type et format, article ou « aucun », verdict ; `## Contrôle mensuel` reste vide, ouvert au merge de `epic/robusta-v2` sur `main`.
- AC-RBCOMPOUND-3 : Given une question candidate sur laquelle Nicolas n'a ni construit ni mesuré quelque chose, When le registre est écrit, Then elle n'y entre pas : ni un classement d'outils IA, ni un outil tiers absent du workflow (Claude Code est le seul admis ; ni Superpowers, ni spec-kit, ni Cursor), ni la question du démarrage d'une équipe avec des agents IA tant que Nicolas n'a pas accompagné une première équipe (OQ-RBCOMPOUND-6 dans le brainstorm).
- AC-RBCOMPOUND-4 : Given les questions des PME, When le registre est écrit, Then elles restent dans une section secondaire, réduite aux questions qu'un article publié ou en brouillon couvre déjà, au plus trois (OQ-RBCOMPOUND-1) ; le brouillon `web/agence-web-ou-freelance.md` y reste nommé avec ce qu'il attend, hors des articles publiés ; aucune ligne du registre, titre de cette section compris, ne nomme Toulouse ni la Haute-Garonne : la zone locale vit dans `documentation/google-business-profile.md`. Les trois questions blockchain sortent du registre.
- AC-RBCOMPOUND-5 : Given les questions RB Compound, When on lit leur langue, Then elles sont écrites en anglais, Locale par défaut, et les questions PME restent en français (OQ-RBCOMPOUND-2) ; une question nomme l'article de sa propre langue, et une question anglaise que seul un article français couvre nomme « aucun », verdict « à écrire », l'article français cité comme source de la traduction.
- AC-RBCOMPOUND-6 : Given le corpus publié, When on le confronte au registre, Then chaque article publié répond à une question ou figure dans « Articles publiés sans question », nommé par son fichier français, une paire de traductions comptant pour un seul article ; les articles blockchain y conservent leur constat, dont Truffle et Ganache, abandonnés en 2023, que recommande l'article sur Solidity.
- AC-RBCOMPOUND-7 : Given les cas limites, When le registre est écrit, Then une question dont le guide fait installer ou lancer la version open source garde le verdict « à écrire » et attend extract-compound-plugin, aucun article ne liant de dépôt avant sa publication, alors qu'une définition, un listicle ou un comparatif s'écrivent dès maintenant ; aucune question ne présente la version complète comme disponible sans accompagnement ; une question de marque comme « What is RB Compound? » n'entre pas, la landing page y répond et n'est pas un article.

Cas limites à vérifier, à la relecture :

- « What is RB Compound? » absente : la landing page y répond.
- « How to get a development team started with AI coding agents? » absente (OQ-RBCOMPOUND-6).
- Une question qui nomme Superpowers, spec-kit ou Cursor absente ; une question qui nomme Claude Code admise.
- La question de guide qui fait lancer les agents open source attend extract-compound-plugin ; la définition, le listicle et le comparatif n'attendent rien.
- `quitter-gmail.md` et `leaving-gmail.md` comptent pour un article, nommé par le fichier français sous la question PME.
- Le brouillon `agence-web-ou-freelance.md` sous sa question, jamais parmi les articles publiés sans question.
- Recherche dans le fichier : ni « Toulouse », ni « Haute-Garonne », ni « région », ni `google-business-profile`, ni « ethers.js ».

## Dependencies

- Depends on : aucune dépendance ouverte ; l'entrée `RB Compound` du glossaire est livrée par glossary-refresh.
- Blocks : le premier mode `write` d'un article RB Compound, qui choisit sa Category. La question de guide qui fait lancer les agents attend extract-compound-plugin, sans bloquer la livraison du registre.
