# Story : Le registre GEO de robusta.build autour de RB Compound

**Dernière mise à jour :** 2026-11-05
**Feature :** rb-compound-positioning
**Infix :** RBCOMPOUND
**Status :** ACTIVE

## Story

En tant que publisher de robusta.build, je veux que `documentation/geo-questions.md` liste les questions que posent à un answer engine les acheteurs de RB Compound, afin que les prochains articles du site soient écrits pour ceux que la landing page vise.

## Contexte & objectif

Le registre vise encore un dirigeant de PME de Toulouse et de la Haute-Garonne, avec les développeurs blockchain en lectorat secondaire parce que le titre du site les nommait. Depuis le 2026-10-25, robusta.build met en avant RB Compound, et la page copy des trois Locales, réécrite par multilingual-site, s'adresse aux équipes et aux responsables techniques qui produisent du logiciel avec des agents IA. Le titre `Freelance ethers.js, solidity, web, blockchain` a disparu de la Site configuration.

RB Compound existe en deux versions (décision du 2026-10-26) : une version open source et gratuite, epicman, storyman et designman, pas encore publiée, et une version complète, livrée seulement avec un accompagnement payant. Aucun article du corpus ne traite aujourd'hui de ce sujet.

La story se limite à ce fichier (décision du 2026-10-31). Le registre se reconstruit par le mode `questions` du skill `geo-article`, qui fixe le nombre de questions, les cinq types, le format par type, le verdict et la section `## Contrôle mensuel`. Le livrable est un document, sans code.

## Acceptance Criteria

- AC-RBCOMPOUND-1 : Given le registre réécrit, When Nicolas lit son client visé, Then il y trouve l'acheteur de RB Compound tel que le dit la page copy, équipes et responsables techniques qui produisent du logiciel avec des agents IA, et ses deux versions ; la Site configuration est la seule source citée, et ni Toulouse ni la Haute-Garonne n'y figurent.
- AC-RBCOMPOUND-2 : Given le registre, When on compte ses questions, Then il en porte de 5 à 15, la section RB Compound en tête et majoritaire, les cinq types couverts, chaque entrée au format du skill : question, type et format, article ou « aucun », verdict.
- AC-RBCOMPOUND-3 : Given une question candidate sur laquelle Nicolas n'a ni construit ni mesuré quelque chose, comme un classement d'outils IA qu'il n'utilise pas, When le registre est écrit, Then elle n'y entre pas.
- AC-RBCOMPOUND-4 : Given les questions des PME, When le registre est écrit, Then elles restent dans une section secondaire, réduite aux questions qu'un article publié ou en brouillon couvre déjà, au plus trois (OQ-RBCOMPOUND-1) ; les trois questions blockchain sortent du registre (OQ-RBCOMPOUND-3).
- AC-RBCOMPOUND-5 : Given les questions RB Compound, When on lit leur langue, Then elles sont écrites en anglais, Locale par défaut, et les questions PME restent en français (OQ-RBCOMPOUND-2) ; une question nomme l'article de sa propre langue.
- AC-RBCOMPOUND-6 : Given le corpus publié, When on le confronte au registre, Then chaque article publié répond à une question ou figure dans « Articles publiés sans question », une paire de traductions comptant pour un seul article ; les articles blockchain y conservent leur constat, dont les outils abandonnés que recommande l'article sur Solidity.
- AC-RBCOMPOUND-7 : Given les cas limites, When le registre est écrit, Then une question dont la meilleure réponse est la version open source garde le verdict « à écrire » et attend extract-compound-plugin, aucun article ne liant de dépôt avant sa publication ; aucune question ne présente la version complète comme disponible sans accompagnement ; le brouillon `web/agence-web-ou-freelance.md` reste nommé avec ce qu'il attend, hors des articles publiés ; `## Contrôle mensuel` reste vide, ouvert au merge de `epic/robusta-v2` sur `main`.

## Boundaries

Aucune API touchée. La story réécrit `documentation/geo-questions.md`, que lit le skill `geo-article` ; le format d'entrée reste celui du skill. Hors périmètre : `documentation/google-business-profile.md`, qui reste la fiche locale (décision du 2026-11-04), la page copy, les articles et le skill lui-même.

## Open Questions & Gaps

- OQ-RBCOMPOUND-1 : Les questions des PME toulousaines restent-elles au registre, réduites en section secondaire, ou en sortent-elles entièrement ?
- Proposition : elles restent en section secondaire, réduites aux questions qu'un article publié ou en brouillon couvre déjà, au plus trois, et la première est « Agence web ou développeur freelance : que choisir pour une PME ? ».
- Rationale : la décision du 2026-10-25 garde les PME comme l'un des positionnements sans les mettre en avant, et le brouillon `agence-web-ou-freelance.md` attend déjà des tarifs et une anecdote ; les sept questions « à écrire » restantes pousseraient à écrire pour un public que la landing page ne vise plus.
- Resolution:

- OQ-RBCOMPOUND-2 : En quelle langue écrire les questions RB Compound : en anglais, Locale par défaut, ou en français, pour un accompagnement vendu d'abord en France ?
- Proposition : en anglais pour RB Compound, en français pour les PME, dont le marché est Toulouse.
- Rationale : BR-ROBUSTA-1 fait de l'anglais la Locale par défaut, la page copy est écrite d'abord en anglais, et les équipes qui utilisent des agents IA posent souvent leurs questions en anglais ; la langue du marché que vise l'accompagnement payant, seul Nicolas la connaît.
- Resolution:

- OQ-RBCOMPOUND-3 : Les trois questions blockchain sortent-elles du registre, leurs articles passant dans « Articles publiés sans question » avec leur constat ?
- Proposition : oui. Les trois articles restent publiés, et le constat sur Truffle et Ganache, abandonnés en 2023, reste écrit à côté de l'article sur Solidity.
- Rationale : le skill ne retient que les questions d'un acheteur du site, et le titre qui justifiait ce lectorat a quitté la Site configuration.
- Resolution: lgtm (storyman)
