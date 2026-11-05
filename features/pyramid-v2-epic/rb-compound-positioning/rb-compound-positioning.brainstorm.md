# Brainstorm : le registre GEO de robusta.build autour de RB Compound

**Date :** 2026-11-05
**Participants :** bsman (autonome)
**Infix :** RBCOMPOUND
**Source :** `rb-compound-positioning.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Hypothèses de travail, données par la requête : les Propositions d'OQ-RBCOMPOUND-1 (questions PME en section secondaire, au plus trois, déjà couvertes par un article publié ou en brouillon) et d'OQ-RBCOMPOUND-2 (questions RB Compound en anglais, questions PME en français), dans la story. OQ-RBCOMPOUND-3 est signée `lgtm (storyman)`. extract-compound-plugin est hors périmètre.

État vérifié le 2026-11-05 :

- Corpus : 17 fichiers publiés, soit 9 articles, 8 paires de traductions et `theory/quel-second-langage.md` seul. Un brouillon, `web/agence-web-ou-freelance.md` (`published: false`). Aucun article sur RB Compound ni sur les agents IA.
- Site configuration : la page copy des trois Locales vise « teams and technical leads who build software with agents », présente les deux versions et ne lie aucun dépôt. Toulouse n'y figure que dans le copyright du pied de page ; ni ethers.js ni PME.
- Registre actuel : 13 questions, 10 PME et 3 blockchain, client visé tiré aussi de `documentation/google-business-profile.md`.

## Acceptance Criteria challenge

- AC-RBCOMPOUND-1 : testable (lecture du paragraphe, recherche de « Toulouse » et « Haute-Garonne », sources citées). Suffisant. La description de la version open source se heurte à une contradiction entre la page copy et la décision du 2026-10-26 : Gap-RBCOMPOUND-4.
- AC-RBCOMPOUND-2 : testable par comptage. « Les cinq types couverts » se lit sur tout le registre, comme le skill le dit du registre. Avec au plus trois questions PME, la section RB Compound en porte au moins trois pour atteindre cinq et rester majoritaire ; le jeu candidat de l'axe 5 couvre les cinq types dans la seule section RB Compound.
- AC-RBCOMPOUND-3 : en langage métier, mais seul Nicolas peut le vérifier : rien dans le registre ne dit sur quoi repose l'expérience. Voir la proposition E3.
- AC-RBCOMPOUND-4 : testable. Deux questions PME passent le filtre aujourd'hui : « Agence web ou développeur freelance » (brouillon) et « Quelles alternatives à Gmail pour une entreprise ? » (`privacy/quitter-gmail.md`, publié). Les huit autres n'ont aucun article et sortent.
- AC-RBCOMPOUND-5 : testable. Il manque le cas où une question anglaise n'a qu'un article français : proposition E2.
- AC-RBCOMPOUND-6 : testable. Attendu : Gmail répond à une question, les huit autres articles vont dans « Articles publiés sans question », les trois blockchain avec leur constat.
- AC-RBCOMPOUND-7 : testable, mais il regroupe quatre vérifications indépendantes. storyman peut le découper sans en changer le sens.

Cas limites métier proposés à storyman :

- E1 : Given une question candidate de marque, comme « What is RB Compound? », When le registre est écrit, Then elle n'y entre pas : la landing page y répond, et une landing page n'est pas un article.
- E2 : Given une question RB Compound en anglais à laquelle seul un article français répond, When le registre est rafraîchi, Then l'entrée nomme « aucun », verdict « à écrire », l'article français cité comme source de la traduction.
- E3 : Given le registre réécrit, When Nicolas vérifie AC-RBCOMPOUND-3, Then le paragraphe du client visé nomme ce sur quoi repose l'expérience : le workflow Compound, qui a construit robusta.build v2, et les stories livrées de l'epic pyramid-v2.
- E4 : Given le registre, When on y cherche « Toulouse » ou « Haute-Garonne », Then aucune ligne ne les porte, titre de la section PME compris ; la zone locale vit dans `documentation/google-business-profile.md`.
- E5 : Given une question candidate qui nomme un outil tiers, When le registre est écrit, Then elle n'entre que si Nicolas utilise cet outil dans le workflow, comme Claude Code (OQ-RBCOMPOUND-5).

---

## 1. Product Role

**Problème :** le registre oriente les prochains articles vers un public que la landing page ne vise plus.

**Décision (autonome):** le registre est la liste des questions que l'acheteur de RB Compound pose à un answer engine, en tête, et un reliquat PME en section secondaire. Ce n'est ni un plan éditorial daté, ni une fiche locale, ni la page copy.

**Rationale :** le skill `geo-article` en fait le point d'entrée des modes `write` et `audit` ; tout article futur part de lui.

---

## 2. Target Audience

**Problème :** deux publics, l'un mis en avant (décision du 2026-10-25), l'autre conservé sans l'être.

**Décision (autonome):** client visé : les équipes et les responsables techniques qui produisent du logiciel avec des agents IA, déjà sur un agent de code et qui cherchent une méthode. Deux entrées : la version open source et gratuite, pas encore publiée, et la version complète, seulement avec un accompagnement payant. Lectorat du reliquat : les dirigeants de PME, sans zone nommée (E4).

**Rationale :** la page copy dit mot pour mot ce public, et AC-RBCOMPOUND-1 en fait la seule source.

---

## 3. Core Problem

**Problème :** un answer engine cite les pages qui répondent directement à une question, au format attendu. Sans question RB Compound au registre, aucun article ne se prépare pour l'acheteur de l'accompagnement, et les moteurs n'ont rien à citer de robusta.build sur le sujet.

**Décision (autonome):** le problème traité est l'orientation des articles, pas leur écriture : la story livre le registre, les articles viennent après, un par mode `write`.

**Rationale :** décision du 2026-10-31, la story se limite à ce fichier.

---

## 4. Unique Value Proposition

**Options considérées :**

- Questions génériques sur l'IA (classements d'outils, comparatifs de modèles) : volume de recherche élevé, mais aucune expérience propre, exclues par AC-RBCOMPOUND-3.
- Questions sur la pratique que Nicolas applique : documents d'abord, design approuvé, tests d'abord.

**Décision (autonome):** les questions RB Compound portent sur des pratiques que Compound applique et que robusta.build v2 a éprouvées : une vingtaine de stories livrées, chacune avec sa story, son design approuvé et son code écrit par agent.

**Rationale :** le skill dit qu'un moteur cite ce qu'il ne trouve pas ailleurs, l'expérience montrée ; c'est le seul avantage du site face aux docs des éditeurs.

---

## 5. Functional Scope

Dans le périmètre :

- `documentation/geo-questions.md`, réécrit par le mode `questions` du skill.
- Section RB Compound en tête, en anglais (OQ-RBCOMPOUND-2) ; section PME en français, deux questions aujourd'hui (OQ-RBCOMPOUND-1) ; « Articles publiés sans question » ; « Contrôle mensuel » vide.

Hors périmètre : `documentation/google-business-profile.md`, la page copy, les articles, le skill, extract-compound-plugin, la Category des futurs articles RB Compound.

Jeu candidat pour la section RB Compound, à confirmer par le mode `questions` :

- « What is spec-driven development with AI coding agents? » — définition, guide — aucun — à écrire
- « What are the best practices to build software with AI agents in a team? » — meilleur, listicle — aucun — à écrire
- « Test-first or code-first with AI coding agents? » — versus, comparatif — aucun — à écrire
- « What are the alternatives to vibe coding for a software team? » — alternatives, listicle — aucun — à écrire
- « How to make Claude Code write the tests before the code? » — comment, guide — aucun — à écrire, attend extract-compound-plugin

**Décision (autonome):** cinq questions RB Compound, deux PME, sept au total. Une question n'attend extract-compound-plugin que si son guide fait installer ou lancer les agents de la version open source ; une définition, un listicle ou un comparatif s'écrivent dès maintenant, sans lien vers un dépôt. La question sur le démarrage d'une équipe, qui vise l'accompagnement, dépend d'OQ-RBCOMPOUND-6.

**Rationale :** un registre court et tenu vaut mieux qu'un registre gonflé ; le skill exclut les questions sans expertise légitime.

Dans « Articles publiés sans question », un article se nomme par son fichier français, comme le fait le registre actuel, et `quel-second-langage` par son seul fichier.

---

## 6. Core Features

### Feature : Client visé RB Compound

**Capability :** le paragraphe d'en-tête dit l'acheteur et les deux versions, d'après la seule Site configuration, sans zone locale.

**Acceptance Criteria :** AC-RBCOMPOUND-1 (testable, sous réserve de Gap-RBCOMPOUND-4)
- Proposé à storyman : E3, E4.

**Test Approach :** relecture par Nicolas ; recherche de « Toulouse », « Haute-Garonne » et de `google-business-profile` dans le fichier, attendue vide.

---

### Feature : Section RB Compound

**Capability :** questions en anglais, cinq types couverts, chaque entrée au format du skill, verdicts « à écrire » et attente d'extract-compound-plugin quand elle s'applique.

**Acceptance Criteria :** AC-RBCOMPOUND-2, AC-RBCOMPOUND-3, AC-RBCOMPOUND-5, AC-RBCOMPOUND-7
- Proposé à storyman : E1, E2, E5.

**Test Approach :** comptage des entrées et des types ; relecture de chaque question par Nicolas contre AC-RBCOMPOUND-3 ; vérification qu'aucune entrée ne présente la version complète sans accompagnement ni ne nomme de dépôt.

---

### Feature : Section PME secondaire

**Capability :** les questions PME couvertes par un article publié ou en brouillon, en français, au plus trois.

**Acceptance Criteria :** AC-RBCOMPOUND-4, AC-RBCOMPOUND-5, AC-RBCOMPOUND-7 (le brouillon reste nommé avec ce qu'il attend)

**Test Approach :** pour chaque entrée, l'article nommé existe sous `apps/robusta-build/content/articles` et dans la langue de la question.

---

### Feature : Rapprochement avec le corpus

**Capability :** chaque article publié répond à une question ou figure dans « Articles publiés sans question », une paire comptant pour un article ; les articles blockchain gardent leur constat.

**Acceptance Criteria :** AC-RBCOMPOUND-6

**Test Approach :** liste des fichiers `published: true` groupés par `translationId`, confrontée au registre : 9 articles attendus, Gmail sous une question, 8 sans question.

---

## 7. Critical Edge Cases

**Décision (autonome):** les cas E1 à E5 de la section Acceptance Criteria challenge. Les autres cas de la story (brouillon, version complète, dépôt non publié, contrôle mensuel vide, paires de traductions) sont déjà couverts par AC-RBCOMPOUND-6 et AC-RBCOMPOUND-7.

**Rationale :** les cas manquants viennent tous du passage à une langue et à un public nouveaux : questions de marque, articles d'une autre langue, preuve de l'expérience, zone locale, outils tiers.

---

## 8. Non-Functional Constraints

**Décision (autonome):**

- Honnêteté de l'offre : aucune question ni verdict ne laisse croire que la version complète s'obtient sans accompagnement, ni qu'un dépôt open source est publié (décision du 2026-10-26).
- Aucun chiffre, prix ou classement sans source dans le registre.
- Texte français du registre écrit avec le skill `deslop` ; les questions RB Compound restent des citations en anglais.
- Coût nul : aucun code, aucune build touchée.

**Rationale :** un registre qui promet ce que l'offre ne donne pas produirait des articles qu'il faudrait réécrire.

---

## 9. External Dependencies

- Answer engines (ChatGPT, Perplexity, Gemini, Claude) : interrogés à la main par Nicolas pour le contrôle mensuel, en anglais pour la section RB Compound.
- extract-compound-plugin, dans un autre dépôt : seul déclencheur du guide qui l'attend.
- Merge de `epic/robusta-v2` sur `main` : ouvre la build de production indexable (go-live) et le premier contrôle.

**Décision (autonome):** aucune dépendance ne bloque la livraison du registre.

**Rationale :** le registre se livre seul ; les dépendances ne portent que sur ce qui le suit.

---

## 10. Major Risks

- Registre sans article : les cinq questions RB Compound sont « à écrire ». Le site n'est cité qu'une fois les articles publiés, et le skill compte en mois.
- Langue du marché : l'accompagnement se vend peut-être d'abord en France, en français ; risque accepté par OQ-RBCOMPOUND-2.
- Blog roll en décalage : la section « what I write » de la landing page montre les derniers articles, aucun sur RB Compound, tant que le premier n'est pas publié.
- Category absente : aucune Category existante (`blockchain`, `javascript`, `privacy`, `theory`, `web`) ne convient à un article sur les agents IA ; le premier mode `write` devra en créer une, avec son libellé dans la page copy (BR-PYRAMID-8, BR-PYRAMID-9).

**Décision (autonome):** aucun risque ne change le périmètre ; le dernier est confié au premier mode `write`.

**Rationale :** ces risques portent sur les articles, que la story exclut.

---

## 11. Boundaries

**Décision (autonome):** aucune API créée ni modifiée. Le registre est un document que lisent les modes `write` et `audit` du skill `geo-article` ; son format d'entrée, « question — type, format — article — verdict », reste celui du skill. Aucun bloc ni figure.

**Rationale :** la story ne touche ni app, ni module, ni package, comme le dit sa section Boundaries.

---

## Open Questions & Gaps

### Gaps

- Gap-RBCOMPOUND-4 : La version open source compte quatre agents avec tddman dans la page copy, trois sans lui dans la décision d'epic du 2026-10-26 et la story : laquelle fait foi ?
- Proposition : la page copy, qu'un requirement de multilingual-site a fixée : epicman, storyman, designman et tddman. epicman corrige la décision du 2026-10-26, storyman le Contexte de la story ; le registre décrit les versions d'après la page copy.
- Rationale : AC-RBCOMPOUND-1 fait de la Site configuration la seule source, et R-MULTILINGUAL-48 nomme tddman dans le schéma open source ; le contenu du plugin, seul Nicolas le fixe.
- Resolution:

### Open Questions

- OQ-RBCOMPOUND-6 : La question « How to get a development team started with AI coding agents? », qui vise l'accompagnement, entre-t-elle au registre dès maintenant ?
- Proposition : non, tant que Nicolas n'a pas accompagné une première équipe ; elle entre au premier rafraîchissement qui suit.
- Rationale : c'est la question de l'acheteur payant, mais AC-RBCOMPOUND-3 exige une expérience construite ou mesurée, et seul Nicolas sait s'il a déjà accompagné une équipe.
- Resolution:

## Next Steps

- `storyman update rb-compound-positioning avec brainstorm` : reprendre E1 à E5, le découpage éventuel d'AC-RBCOMPOUND-7, et la réponse à Gap-RBCOMPOUND-4.
- `epicman update pyramid-v2-epic` sur la décision du 2026-10-26, si Gap-RBCOMPOUND-4 retient la page copy.
- designman, puis le mode `questions` du skill `geo-article` sur le jeu candidat de l'axe 5.
- Au premier mode `write` d'un article RB Compound : choisir sa Category et son libellé.
