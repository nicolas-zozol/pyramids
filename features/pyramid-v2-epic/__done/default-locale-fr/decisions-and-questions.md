# Questions et décisions : default-locale-fr

**Date :** 2026-10-08
**Branche :** epic/robusta-v2
**Requête :** `boss default-locale-fr rloq` — pipeline complet jusqu'au land, arrêt sur la première OQ pertinente, aucun commit (Nicolas commite lui-même). Précision reçue en cours de route : boss avance seul tant qu'il peut trancher ; une Gap ou une OQ pertinente l'arrête, et il la rend avec sa Resolution vide (au plus 4 en tête du rapport).

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche et commits

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, la branche attendue pour une story de l'epic pyramid-v2. Aucun commit : la requête l'interdit, boss s'arrête là où il commiterait et donne le message proposé dans son rapport.
- Working tree : les renommages stagés vers `__done/`, la réécriture de `business-rules.md` et `ubiquitous-language.md` et le refine de `robusta-landing-page.story.md` viennent d'autres sessions. Boss n'y touche pas. Les citations de BR se font sur `git show HEAD:business-rules.md` (BR-PYRAMID-11 : « robusta.build must have no locale other than French »).

## D1 : point d'entrée

- Phase : état
- Choix : la story existe (ACTIVE, AC présents), aucun brainstorm : le pipeline reprend à bsman, sans `storyman refine` préalable.

## D2 : OQ-DEFAULTLOCALE-2 répondue `lgtm (boss)`

- Phase : tri des OQ de la story
- Choix : non pertinente. Une page qui déclare `lang="fr"` et affiche « page not found » est un défaut ; passer en français la page 404 et la fin de la page article est la pratique attendue, petite et réversible.

## D3 : brainstorm, OQ-DEFAULTLOCALE-3 répondue `lgtm (boss)`

- Phase : tri des OQ du brainstorm
- Choix : non pertinente. `NavigationFailure` a le même défaut que la 404 (texte anglais sous `lang="fr"`) ; deux lignes de texte, réversibles. Elle passe en français avec la 404.
- Décisions autonomes de bsman gardées telles quelles : Locales de v1 figées dans `v1-url-map.ts` (82 lignes, seules les destinations changent), lignes de tag en Locale `en` de v1 (P4), texte français constant en fin de page article avec `lang="fr"` sur le bloc, racine de la Site configuration lue de `urlScheme`. Aucune ne change la direction de la feature : la v1 map est dormante jusqu'à restore-v1-urls, qui réexaminera ses destinations.

## D4 : story affinée, aucune OQ nouvelle

- Phase : refine après brainstorm
- storyman a replié OQ-DEFAULTLOCALE-2 et 3, P1 à P5, scindé l'ancien AC-6 (7 AC) et ajouté une section « Direction retenue ». Aucune entrée ouverte : rien à trier, le pipeline continue au design.

## D5 : design approuvé par boss

- Phase : design
- designman n'a ouvert aucune entrée : 11 R- en trois groupes (Locales du site, v1 map, texte de page), constante `V1_LOCALES` dans `v1-url-map.ts`, nouveau composant sans état `FailedNavigationPage({ href })` pour tester l'état d'échec sans DOM.
- Choix : DRAFT → APPROVED par boss, aucune OQ pertinente en attente.
- Constat reporté, non bloquant : la v1 map tire ses lignes d'article de l'index ; quand translate-english-articles publiera une traduction, la spec de R-24 échouera sur des adresses v1 que v1 n'a jamais publiées. Le sort de ces lignes revient à translate-english-articles ou restore-v1-urls (Dependencies du design).

## D6 : implémentation, aucun commit

- Phase : implémentation (tddman, LFG fast)
- Résultat : 110 tests verts sur 17 fichiers (92 avant, 18 nouveaux), lint propre, `yarn build:deps` puis `yarn build:robusta` à 0. `dist/client` : 21 URL de contenu (7 sans marqueur, 14 sous `/l/en`), aucun répertoire `l/fr`, `404.html` en `lang="fr"`. v1 map régénérée : 82 lignes, diff limité à 66 `to` et aux deux Locales de l'en-tête.
- Bloc `## Progress` écrit par boss : 18/18.
- Commit : non exécuté, la requête l'interdit. Message proposé dans le rapport final.
- Décisions de tddman gardées : specs v1 dans un nouveau `routing/v1-url-map.spec.ts` ; apostrophe typographique et espace insécable dans le texte français ; quatre lignes de `v1-url-map.ts` déjà hors Prettier à HEAD laissées telles quelles.

## D7 : glossaire et registre non touchés

- Phase : avant land
- Choix : rien à écrire dans `ubiquitous-language.md` ni `business-rules.md`. Les entrées `Locale` et `Site configuration` sont génériques, aucune ne nomme `en` ; BR-PYRAMID-11 est déjà au registre à HEAD. epicman n'est donc pas appelé en greffier.
- Écart avec le working tree : la réécriture française non commitée de `business-rules.md` (autre session) retire BR-PYRAMID-1, 2, 7 et 11. Les documents de cette feature citent la version de HEAD. Le land vérifie le bloc Business Rules de l'epic contre `git show HEAD:business-rules.md`, pas contre le working tree.

## D8 : land, aucun commit

- Phase : land (storyman land : docman, archiman, design IMPLEMENTED, story LANDED, ROADMAP, epicman)
- Résultat : 5 étapes sur 5. Le statut des deux documents porte « implémentation non commitée, dans le working tree » à la place d'un sha. Liste des BR de l'epic intacte (10 entrées, conforme à HEAD).
- Green set rejoué après le land : 110 tests, lint propre, `yarn build:deps` et `yarn build:robusta` à 0, 21 URL de contenu, seul `l/en` sous `dist/client/l`.
- archiman a refait pointer vers `__done/` les chemins `Design:` de 10 en-têtes (`router.tsx`, `page-data/index.ts`, `ArticleView.tsx`, `NotesSection.tsx`, `design-system/assets.ts`, `styles/globals.css`, les 4 scripts). Ces chemins ne tiennent qu'avec les renommages stagés de l'autre session : les deux partent dans le même commit, ou les renommages avant.

## D9 : écarts laissés ouverts, non pertinents

- `CLAUDE.md` dit encore « 92 tests » pour robusta-build (110 aujourd'hui) et que `seopyramids.config.ts` « définit » les Locales (il les lit de `scheme.ts` sur robusta-build). Fichier d'instructions de Nicolas : boss ne le modifie pas.
- `apps/robusta-build/README.md` ne dit pas que la 404, l'état d'échec de navigation et la fin de page article sont en français sur toutes les pages. Une phrase, à reprendre au prochain passage de docman.
- archiman check : les packages `components` et `routing` n'ont pas de fichier d'entrée, donc pas d'en-tête ; R-DEFAULTLOCALE-01, 02, 41 et 42 n'apparaissent dans aucun en-tête. Question de convention, sans effet sur la feature : laissée à archiman.
- doneman cassera plus tard les chemins `default-locale-fr.design.md` des en-têtes d'`ArticleView.tsx` et `v1-url-map.ts` : relancer archiman après doneman.
