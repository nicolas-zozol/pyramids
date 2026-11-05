# Story : Le registre GEO de robusta.build autour de RB Compound

**Dernière mise à jour :** 2026-11-05
**Feature :** rb-compound-positioning
**Infix :** RBCOMPOUND
**Status :** SUBMITTED (2026-11-05, commit cd83f06)

## Story

En tant que publisher de robusta.build, je veux que `documentation/geo-questions.md` liste les questions que posent à un answer engine les acheteurs de RB Compound, afin que les prochains articles du site soient écrits pour ceux que la landing page vise.

## Contexte & objectif

Le registre visait un dirigeant de PME de Toulouse et de la Haute-Garonne alors que, depuis le 2026-10-25, la landing page s'adresse aux équipes qui construisent du logiciel avec des agents et met en avant RB Compound. Le registre vise désormais cet acheteur, en anglais et en français, et ne garde des PME qu'un reliquat couvert par le corpus. Le schéma open source de la page copy annonçait quatre agents : il en compte trois dans les trois Locales, comme le veut la décision d'epic du 2026-10-26.

## Livré

### Requirements

- R-RBCOMPOUND-01: le paragraphe du client visé nomme les équipes et les responsables techniques qui produisent du logiciel avec des agents IA, mot pour mot d’après la page copy.
- R-RBCOMPOUND-02: il nomme les deux versions : open source et gratuite, pas encore publiée, avec trois agents, epicman, storyman et designman, et complète, livrée seulement avec un accompagnement payant.
- R-RBCOMPOUND-03: il nomme ce sur quoi repose l'expérience : le workflow Compound, qui a construit robusta.build v2, et les stories livrées de l'epic pyramid-v2.
- R-RBCOMPOUND-04: sa seule source citée est la Site configuration, `apps/robusta-build/src/seopyramids.config.ts` ; ni `documentation/google-business-profile.md`, ni le titre de site disparu, ni un lectorat blockchain.
- R-RBCOMPOUND-21: la section ouvre le registre, porte la majorité des entrées et couvre à elle seule les cinq types ; le jeu candidat est celui de l'axe 5 du brainstorm plus la question de R-RBCOMPOUND-28, que le mode `questions` confirme.
- R-RBCOMPOUND-22: chaque question porte sur une pratique que Compound applique et que robusta.build v2 a éprouvée : documents d'abord, design approuvé, tests d'abord.
- R-RBCOMPOUND-23: n'entrent pas une question de classement d'outils IA, une question qui nomme un outil tiers absent du workflow (Claude Code est le seul admis), ni une question de marque à laquelle la landing page répond.
- R-RBCOMPOUND-24: une question dont le guide fait installer ou lancer la version open source porte le verdict `à écrire ; attend extract-compound-plugin` ; une définition, un listicle ou un comparatif portent `à écrire` sans attente, et aucun ne prévoit de lien vers un dépôt.
- R-RBCOMPOUND-25: aucune question ni aucun verdict ne présente la version complète comme disponible sans accompagnement.
- R-RBCOMPOUND-26: chaque entrée nomme l'article de sa propre langue ; une entrée que seul un article de l'autre langue couvre nomme `aucun`, verdict `à écrire ; traduction de <article>`. Aujourd'hui aucun article ne couvre RB Compound : toutes les entrées portent `aucun — à écrire`.
- R-RBCOMPOUND-27: chaque question RB Compound tient en deux entrées, l'anglaise puis la française juste après, aucune en espagnol (OQ-RBCOMPOUND-7 dans la story). Le compte de 5 à 15 porte sur les entrées : avec au plus trois entrées PME, la section tient au plus six questions, douze entrées.
- R-RBCOMPOUND-28: « How to get a development team started with AI coding agents? » entre, avec sa version française : `comment`, `guide`, `aucun`, `à écrire` ; R-RBCOMPOUND-24 et R-RBCOMPOUND-25 s'y appliquent.
- R-RBCOMPOUND-41: la section suit la section RB Compound, en français, et ne garde que les questions qu'un article publié ou en brouillon couvre déjà, au plus trois : aujourd'hui « Agence web ou développeur freelance : que choisir pour une PME ? » en premier, puis « Quelles alternatives à Gmail pour une entreprise ? », couverte par `privacy/quitter-gmail.md`.
- R-RBCOMPOUND-42: le brouillon `web/agence-web-ou-freelance.md` garde son verdict `brouillon, non publié` et ce qu'il attend : les tarifs de Nicolas, une anecdote réelle et une couverture (BR-PYRAMID-10).
- R-RBCOMPOUND-43: aucune ligne du fichier, titres compris, ne nomme Toulouse ni la Haute-Garonne, ni « région ».
- R-RBCOMPOUND-44: les huit autres questions PME et les trois questions blockchain sortent du registre.
- R-RBCOMPOUND-61: chaque article publié, une paire de traductions comptant pour un, répond à une question du registre ou figure sous `## Articles publiés sans question` ; aujourd'hui 9 articles, Gmail sous une question, 8 sans question.
- R-RBCOMPOUND-62: un article sans question se nomme par le nom de son fichier français sans extension, comme le fait le registre actuel ; les trois articles blockchain portent leur constat après le nom : `ledger-contre-metamask` et `yield-farming-fr` à auditer, `outillage-solidity` à réécrire, l'article recommandant Truffle et Ganache, abandonnés par Consensys en 2023.
- R-RBCOMPOUND-63: un brouillon ne figure jamais sous `## Articles publiés sans question`.
- R-RBCOMPOUND-81: `## Contrôle mensuel` ne porte aucun contrôle ; son paragraphe dit le contrôle ouvert depuis le merge de `epic/robusta-v2` sur `main`, la build de production servant ses pages indexables depuis le 2026-11-05, et garde le format d'un contrôle : la date, puis pour chaque question les moteurs qui citent robusta.build et les pages qu'ils citent à la place.
- R-RBCOMPOUND-101: dans les trois Locales, le titre du schéma open source compte trois agents, selon le bloc de `## Boundaries`.
- R-RBCOMPOUND-102: les étapes 1 à 4 restent inchangées ; l'étape 5 garde son `n` et son `label`, et son `sub` ne nomme aucun agent Compound : l'agent de code du lecteur prend le relais au design approuvé, selon le bloc de `## Boundaries`.
- R-RBCOMPOUND-103: `eyebrow` et `caveat` du schéma open source, le schéma de la version complète et le reste de la page copy restent inchangés.
- R-RBCOMPOUND-104: le test du schéma open source de `seopyramids.config.spec.ts` attend `epicman`, `storyman`, `designman`, `DRAFT`, `APPROVED` et rien d'autre ; son intitulé ne nomme plus tddman.

### Acceptance Criteria

- AC-RBCOMPOUND-1 : Given le registre réécrit et la page copy corrigée, When Nicolas lit le client visé du registre puis le schéma open source de la landing page dans les trois Locales, Then il trouve l'acheteur de RB Compound tel que le dit la page copy, équipes et responsables techniques qui produisent du logiciel avec des agents IA, ses deux versions, la version open source avec trois agents, epicman, storyman et designman, aux deux endroits, et ce sur quoi repose l'expérience : le workflow Compound, qui a construit robusta.build v2, et les stories livrées de l'epic pyramid-v2 ; aucune étape du schéma open source ne nomme tddman ni un autre agent Compound, et la Site configuration reste la seule source que cite le registre.
- AC-RBCOMPOUND-2 : Given le registre, When on compte ses questions, Then il en porte de 5 à 15, la section RB Compound en tête et majoritaire, les cinq types couverts sur l'ensemble du registre, chaque entrée au format du skill : question, type et format, article ou « aucun », verdict ; `## Contrôle mensuel` reste vide, ouvert au merge de `epic/robusta-v2` sur `main`.
- AC-RBCOMPOUND-3 : Given une question candidate sur laquelle Nicolas n'a ni construit ni mesuré quelque chose, When le registre est écrit, Then elle n'y entre pas : ni un classement d'outils IA, ni un outil tiers absent du workflow (Claude Code est le seul admis ; ni Superpowers, ni spec-kit, ni Cursor) ; la question du démarrage d'une équipe, « How to get a development team started with AI coding agents? », celle de l'acheteur de l'accompagnement, y entre dès maintenant.
- AC-RBCOMPOUND-4 : Given les questions des PME, When le registre est écrit, Then elles restent dans une section secondaire, réduite aux questions qu'un article publié ou en brouillon couvre déjà, au plus trois, la première étant « Agence web ou développeur freelance : que choisir pour une PME ? » ; le brouillon `web/agence-web-ou-freelance.md` y reste nommé avec ce qu'il attend, hors des articles publiés ; aucune ligne du registre, titre de cette section compris, ne nomme Toulouse ni la Haute-Garonne : la zone locale vit dans `documentation/google-business-profile.md`. Les trois questions blockchain sortent du registre.
- AC-RBCOMPOUND-5 : Given les questions du registre, When on lit leur langue, Then chaque question RB Compound est écrite en anglais et en français, aucune en espagnol, et les questions PME restent en français ; chaque version nomme l'article de sa propre langue, et une version que seul un article de l'autre langue couvre nomme « aucun », verdict « à écrire », cet article cité comme source de la traduction.
- AC-RBCOMPOUND-6 : Given le corpus publié, When on le confronte au registre, Then chaque article publié répond à une question ou figure dans « Articles publiés sans question », nommé par son fichier français, une paire de traductions comptant pour un seul article ; les articles blockchain y conservent leur constat, dont Truffle et Ganache, abandonnés en 2023, que recommande l'article sur Solidity.
- AC-RBCOMPOUND-7 : Given les cas limites, When le registre est écrit, Then une question dont le guide fait installer ou lancer la version open source garde le verdict « à écrire » et attend extract-compound-plugin, aucun article ne liant de dépôt avant sa publication, alors qu'une définition, un listicle ou un comparatif s'écrivent dès maintenant ; aucune question ne présente la version complète comme disponible sans accompagnement ; une question de marque comme « What is RB Compound? » n'entre pas, la landing page y répond et n'est pas un article.

## Boundaries

Aucune API ne change de forme : ni type, ni signature, ni package. Deux contrats changent de contenu.

- `documentation/geo-questions.md`, lu par les modes `write` et `audit` du skill `geo-article` : 14 entrées, dont 12 RB Compound (six questions, l'anglaise puis la française) et 2 PME, puis `## Articles publiés sans question` (8 articles) et `## Contrôle mensuel`, vide.
- `getPageCopy(locale).landing.openSource` dans `apps/robusta-build/src/seopyramids.config.ts`, rendu par le package `landing` : `title` à trois agents et `steps[4].sub` à l'agent de code du lecteur, dans les trois Locales ; types `FlowCopy` et `FlowStep` inchangés.
- Hors périmètre : `documentation/google-business-profile.md`, le reste de la page copy, schéma de la version complète compris, les articles, le skill `geo-article`, extract-compound-plugin et la Category des futurs articles RB Compound.

## Décisions

- 2026-10-31 — la story se réduit au registre `documentation/geo-questions.md`. Pourquoi : décision de Nicolas ; l'entrée `RB Compound` du glossaire passe à glossary-refresh.
- 2026-11-05 — la version open source compte trois agents, epicman, storyman et designman ; le schéma open source de la page copy est corrigé dans les trois Locales. Pourquoi : la décision d'epic du 2026-10-26 fait foi (Nicolas).
- 2026-11-05 — l'étape 5 `code` du schéma open source est tenue par l'agent de code du lecteur, sans agent Compound nommé (OQ-RBCOMPOUND-8). Pourquoi : décision de Nicolas.
- 2026-11-05 — une question RB Compound tient en deux entrées, l'anglaise puis la française juste après ; le compte de 5 à 15 porte sur les entrées (OQ-RBCOMPOUND-7, `lgtm (storyman)`). Pourquoi : le skill veut une entrée par question, avec un seul article et un seul verdict, et les deux langues n'ont pas les mêmes articles.
- 2026-11-05 — le paragraphe du client visé cite la page copy mot pour mot, « les équipes et les responsables techniques qui construisent du logiciel avec des agents », là où R-RBCOMPOUND-01 paraphrase « produisent ... avec des agents IA ». Pourquoi : AC-RBCOMPOUND-1 demande l'acheteur tel que le dit la page copy.

## Dependencies

- La question de guide qui fait installer ou lancer la version open source attend extract-compound-plugin, dans ses deux entrées, sans bloquer le registre.
- Le premier mode `write` d'un article RB Compound attend le choix de sa Category.
