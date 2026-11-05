# Story : Le registre GEO de robusta.build autour de RB Compound

**Dernière mise à jour :** 2026-11-05
**Feature :** rb-compound-positioning
**Infix :** RBCOMPOUND
**Status :** ACTIVE

## Story

En tant que publisher de robusta.build, je veux que `documentation/geo-questions.md` liste les questions que posent à un answer engine les acheteurs de RB Compound, afin que les prochains articles du site soient écrits pour ceux que la landing page vise.

## Contexte & objectif

Le registre vise encore un dirigeant de PME de Toulouse et de la Haute-Garonne, avec les développeurs blockchain en lectorat secondaire parce que le titre du site les nommait. Depuis le 2026-10-25, robusta.build met en avant RB Compound, et la page copy des trois Locales, réécrite par multilingual-site, s'adresse aux équipes et aux responsables techniques qui produisent du logiciel avec des agents IA. Le titre `Freelance ethers.js, solidity, web, blockchain` a disparu de la Site configuration.

RB Compound existe en deux versions (décision du 2026-10-26) : une version open source et gratuite, pas encore publiée, avec trois agents, epicman, storyman et designman, et une version complète, livrée seulement avec un accompagnement payant. Le schéma open source de la page copy en annonce quatre, tddman en plus : la décision d'epic fait foi, et la story corrige ce schéma dans les trois Locales (Nicolas, 2026-11-05). L'accompagnement se fait en anglais comme en français, jamais en espagnol. Le corpus compte 9 articles publiés et un brouillon ; aucun ne traite de RB Compound ni des agents IA.

La story porte sur ce fichier (décision du 2026-10-31), plus cette correction du schéma open source. Le registre se reconstruit par le mode `questions` du skill `geo-article`, qui fixe le nombre de questions, les cinq types, le format par type, le verdict et la section `## Contrôle mensuel`. Hors la correction de la page copy, le livrable est un document. Les questions RB Compound portent sur des pratiques que Compound applique et que robusta.build v2 a éprouvées : documents d'abord, design approuvé, tests d'abord.

## Acceptance Criteria

- AC-RBCOMPOUND-1 : Given le registre réécrit et la page copy corrigée, When Nicolas lit le client visé du registre puis le schéma open source de la landing page dans les trois Locales, Then il trouve l'acheteur de RB Compound tel que le dit la page copy, équipes et responsables techniques qui produisent du logiciel avec des agents IA, ses deux versions, la version open source avec trois agents, epicman, storyman et designman, aux deux endroits, et ce sur quoi repose l'expérience : le workflow Compound, qui a construit robusta.build v2, et les stories livrées de l'epic pyramid-v2 ; aucune étape du schéma open source ne nomme tddman ni un autre agent Compound, et la Site configuration reste la seule source que cite le registre.
- AC-RBCOMPOUND-2 : Given le registre, When on compte ses questions, Then il en porte de 5 à 15, la section RB Compound en tête et majoritaire, les cinq types couverts sur l'ensemble du registre, chaque entrée au format du skill : question, type et format, article ou « aucun », verdict ; `## Contrôle mensuel` reste vide, ouvert au merge de `epic/robusta-v2` sur `main`.
- AC-RBCOMPOUND-3 : Given une question candidate sur laquelle Nicolas n'a ni construit ni mesuré quelque chose, When le registre est écrit, Then elle n'y entre pas : ni un classement d'outils IA, ni un outil tiers absent du workflow (Claude Code est le seul admis ; ni Superpowers, ni spec-kit, ni Cursor) ; la question du démarrage d'une équipe, « How to get a development team started with AI coding agents? », celle de l'acheteur de l'accompagnement, y entre dès maintenant.
- AC-RBCOMPOUND-4 : Given les questions des PME, When le registre est écrit, Then elles restent dans une section secondaire, réduite aux questions qu'un article publié ou en brouillon couvre déjà, au plus trois, la première étant « Agence web ou développeur freelance : que choisir pour une PME ? » ; le brouillon `web/agence-web-ou-freelance.md` y reste nommé avec ce qu'il attend, hors des articles publiés ; aucune ligne du registre, titre de cette section compris, ne nomme Toulouse ni la Haute-Garonne : la zone locale vit dans `documentation/google-business-profile.md`. Les trois questions blockchain sortent du registre.
- AC-RBCOMPOUND-5 : Given les questions du registre, When on lit leur langue, Then chaque question RB Compound est écrite en anglais et en français, aucune en espagnol, et les questions PME restent en français ; chaque version nomme l'article de sa propre langue, et une version que seul un article de l'autre langue couvre nomme « aucun », verdict « à écrire », cet article cité comme source de la traduction.
- AC-RBCOMPOUND-6 : Given le corpus publié, When on le confronte au registre, Then chaque article publié répond à une question ou figure dans « Articles publiés sans question », nommé par son fichier français, une paire de traductions comptant pour un seul article ; les articles blockchain y conservent leur constat, dont Truffle et Ganache, abandonnés en 2023, que recommande l'article sur Solidity.
- AC-RBCOMPOUND-7 : Given les cas limites, When le registre est écrit, Then une question dont le guide fait installer ou lancer la version open source garde le verdict « à écrire » et attend extract-compound-plugin, aucun article ne liant de dépôt avant sa publication, alors qu'une définition, un listicle ou un comparatif s'écrivent dès maintenant ; aucune question ne présente la version complète comme disponible sans accompagnement ; une question de marque comme « What is RB Compound? » n'entre pas, la landing page y répond et n'est pas un article.

## Boundaries

Aucune API touchée : le type de la page copy ne change pas, seuls ses textes. La story réécrit `documentation/geo-questions.md`, que lisent les modes `write` et `audit` du skill `geo-article` ; le format d'entrée reste celui du skill. Elle corrige le schéma de la version open source dans la page copy des trois Locales, `apps/robusta-build/src/seopyramids.config.ts`. Hors périmètre : `documentation/google-business-profile.md`, qui reste la fiche locale (décision du 2026-11-04), le reste de la page copy, schéma de la version complète compris, les articles, le skill lui-même, extract-compound-plugin et la Category des futurs articles RB Compound.

## Open Questions & Gaps

- OQ-RBCOMPOUND-7 : Une question RB Compound posée en anglais et en français tient-elle en deux entrées, chacune avec son article et son verdict, ou en une seule ?
- Proposition : deux entrées, la française juste après l'anglaise ; le compte de 5 à 15 porte sur les entrées.
- Rationale : le skill veut une entrée par question, avec un seul article et un seul verdict, et les deux langues n'ont pas les mêmes articles.
- Resolution: lgtm (storyman)
