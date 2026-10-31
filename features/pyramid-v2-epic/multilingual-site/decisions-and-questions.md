# Questions et décisions : multilingual-site

**Date :** 2026-10-25
**Branche :** epic/robusta-v2
**Requête :** `boss multilingual-site, mode rloq` — pipeline jusqu'au land, arrêt sur la première OQ pertinente, aucun commit (Nicolas commite lui-même).

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, commits, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche attendue pour une story de l'epic pyramid-v2. Aucun commit, aucun push.
- Working tree de départ : modifications non commitées de Nicolas sur `CLAUDE.md`, `ROADMAP.md`, `business-rules.md`, `ubiquitous-language.md`, l'epic et le skill geo-article ; la story est non suivie. Instantané (status et diff) pris dans le scratchpad avant toute écriture.
- Hors périmètre de boss : `features/pyramid-v2-epic/seo-excellence/` (un storyman y tourne), `business-rules.md`.

## D1 : résolutions OQ-MULTILINGUAL-1 à 4

- Phase : story
- Constat : les quatre OQ portent `Resolution: lgtm` de Nicolas, non encore intégrées au corps.
- Choix : `storyman refine` les intègre avant le brainstorm.

- Résultat : storyman a intégré les quatre résolutions (Contexte, AC-4 réécrit autour du lien de Locale dans l'en-tête, cas limite ajouté à AC-7) et supprimé la section Open Questions & Gaps, vide. Aucune nouvelle OQ.

## D2 : OQ-PYRAMID-4 de l'epic, pertinente

- Phase : story
- Constat : la page copy anglaise dépend d'OQ-PYRAMID-4 (`pyramid-v2.epic.md`), Resolution vide : réécrire la landing page autour de RB Compound dans cette story, ou non.
- Tri : pertinente. Elle change le texte visible des trois landing pages, et la requête interdit de trancher seul un tel point.
- Choix : elle ne bloque ni le brainstorm ni le design, qui portent la mécanique. Boss la remonte au rapport ; son effet sur l'implémentation est réévalué au design.

## D3 : brainstorm, tri des entrées

- Phase : brainstorm (`multilingual-site.brainstorm.md`)
- Gap-MULTILINGUAL-5 (deux props optionnelles de `SiteHeader` : adresse d'accueil, Locale par lien) : non pertinent, `lgtm (boss)`. Ajout rétrocompatible, facile à défaire, et seule manière propre de faire mener le logo à la landing page de la Locale ; le design system reste un module (BR-PYRAMID-13).
- OQ-MULTILINGUAL-6 (`/en` ou `/en/`) : pertinente. La forme devient la Canonical URL publiée par seo-excellence, difficile à changer après go-live, et la story écrite par Nicolas dit `/en/`. Resolution laissée vide.
- Décisions affirmées par bsman et acceptées sans entrée : 301 par règle Netlify sur `/`, obsolescence par empreinte du texte de l'original, contrepartie de Locale calculée dans `page-data`, liens vers toutes les autres versions d'un article, 404 en anglais.
- Choix : `storyman refine` intègre P1 à P7 et Gap-5, sans trancher OQ-6.

## D4 : point d'arrêt rloq

- Constat : deux entrées pertinentes en attente, OQ-MULTILINGUAL-6 (brainstorm) et OQ-PYRAMID-4 (epic).
- Choix : arrêt après le refine du brainstorm, avant le design. OQ-6 change le schéma d'URL que le design fixe (Boundaries HTTP, `buildUrl`, règle Netlify, v1 map) ; OQ-PYRAMID-4 change le texte visible des trois landing pages. Aucune n'est tranchée par boss.
- Résultat du refine : P1 à P7 et Gap-5 intégrés à la story (AC-2 à AC-5 et AC-7, bloc du design system dans les Boundaries, Documentation updates, Dependencies). Aucune nouvelle entrée. OQ-6 et OQ-PYRAMID-4 citées dans Dependencies.
- Reprise : une fois OQ-6 et OQ-PYRAMID-4 tranchées, relancer la même requête ; boss repart d'un `storyman refine` qui intègre les réponses, puis du design.

## D5 : reprise du 2026-10-26, résolutions OQ-MULTILINGUAL-6 et OQ-PYRAMID-4

- Phase : story
- Constat : Nicolas a tranché les deux entrées (Resolution: lgtm). Requête : `boss multilingual-site, mode rloq, reprise`, aucun commit.
- Choix : `epicman update` intègre OQ-PYRAMID-4 dans l'epic (décision datée du 2026-10-26, item 1 d'À faire, entrée retirée) ; `storyman refine` intègre les deux résolutions dans la story, en parallèle.
- Résultat : AC-1, AC-2, AC-3, AC-4, AC-7 et le bloc HTTP passent aux landing pages `/en`, `/fr`, `/es` sans barre finale, `/{en|fr|es}/` en 301 ; AC-3 exige une landing page `/en` sur RB Compound, `fr` et `es` ses traductions. Dependencies allégées des deux entrées.
- Restent hors de boss : le brainstorm et `seo-excellence.story.md` citent encore OQ-PYRAMID-4 (seo-excellence, à reprendre à son refine).

## D6 : OQ-MULTILINGUAL-7, pertinente

- Phase : story
- Constat : storyman ouvre OQ-MULTILINGUAL-7 : que propose RB Compound au visiteur, à quel lecteur, vers quel appel à l'action. Aucune source du dépôt ne le dit.
- Tri : pertinente. Elle fixe le texte visible des trois landing pages et peut changer la forme de la page copy (sections, note sur Toulouse). Resolution laissée vide.
- Choix : designman écrit quand même le design en DRAFT, la mécanique (prérequis, schéma préfixé, redirections, suivi des traductions) n'en dépend pas ; il suppose la Proposition là où la forme de la page copy en dépend. Le design reste DRAFT tant qu'OQ-7 est ouverte (rloq).

## D7 : design en DRAFT, point d'arrêt rloq

- Phase : design (`multilingual-site.design.md`)
- Résultat : designman écrit le design en DRAFT, sans entrée Open Questions & Gaps. Prérequis dans `src/routing/url-scheme/` et `src/content/corpus-reader/`, commit à part ; `pageCopy: Record<Locale, PageCopy>` ; frontmatter `original: { locale, fingerprint }` ; `counterpartsOf` dans `src/routing/counterparts.ts` plutôt que dans `page-data` (atteignable par les scripts Node) ; une règle `[[redirects]]` `/` → `/en` ; termes UL `Original` et `Stale translation`.
- Tri : aucune nouvelle entrée pertinente. Le déplacement de `counterpartsOf` hors de `page-data` est interne et facile à défaire.
- Choix : le design reste DRAFT. OQ-MULTILINGUAL-7 (story) est ouverte et pertinente ; la forme de la landing copy en suppose la Proposition (`hero.note` gardé). Pas d'approbation par boss, pas d'implémentation, prérequis compris.
- Reprise : Nicolas tranche OQ-7 et approuve le design (ou l'amende) ; relancer la même requête, boss repart d'un `storyman refine` qui intègre OQ-7, d'un `designman update` si la forme de la landing copy change, puis de l'implémentation.

## D8 : reprise du 2026-10-26, résolution d'OQ-MULTILINGUAL-7

- Phase : story
- Constat : Nicolas a tranché OQ-7 : RB Compound, offre de services en deux offres, version open source gratuite (epicman, storyman, designman) et version complète, uniquement accompagnée. Requête : `boss multilingual-site, mode rloq, reprise`, aucun commit.
- Choix : `storyman refine` intègre la résolution dans la story, `epicman update` journalise la décision dans l'epic, en parallèle.
- Résultat story : Contexte réécrit (deux offres, deux `FlowDiagram`, workflow décrit tel qu'il existe, sans chiffre ni prix ni promesse, CTA e-mail et LinkedIn) ; AC-3 réécrit ; cas limite ajouté à AC-7 (aucun lien vers un dépôt du plugin non publié) ; puce `FlowDiagram` dans les Boundaries du design system ; puce de Documentation updates pour la composition de la landing. Entrée OQ-7 et section Open Questions retirées. Aucune nouvelle entrée.
- Résultat epic : décision du 2026-10-26 dans Décisions structurantes ; item 15 `extract-compound-plugin`, non prioritaire, sans story ; item 1 et puce HTTP API alignés sur `/en` sans barre finale (OQ-6).
- Lien vers le plugin : tranché par boss, non pertinent. La landing dit que la version open source n'est pas publiée et ne lie aucun dépôt ; le lien s'ajoutera par la page copy à la publication (item 15). Suit la suggestion de Nicolas, facile à défaire.

## D9 : ROADMAP.md non touché

- Constat : epicman signale que l'item 15 irait aussi dans `ROADMAP.md` (skill `roadmap`, mode `add`).
- Choix : pas d'édition. `ROADMAP.md` porte des modifications non commitées de Nicolas, et l'item est non prioritaire ; l'À faire de l'epic suffit. Proposé au rapport.

## D10 : design mis à jour, toujours DRAFT

- Phase : design (`multilingual-site.design.md`)
- Résultat : `LandingCopy` gagne `openSource` et `complete` (type `FlowCopy`) ; `hero.note` supprimé ; ordre Hero, deux `FlowDiagram`, PrinciplesList réorientée, notes, CTA ; `FlowDiagramProps.id` optionnel, `approach` par défaut ; R-46 à R-51 ajoutés, R-44 réécrit (spec des `href` permis, spec sans chiffre dans la landing copy).
- Tri : OQ-MULTILINGUAL-8 (la version open source inclut-elle implémentation et documentation ?) pertinente : elle fixe le périmètre visible de l'offre gratuite et celui d'extract-compound-plugin. Resolution laissée vide.
- Remarque, non tranchée : R-51 interdit toute « durée » ; il exclut aussi une mention biographique comme « vingt ans de logiciel » du hero actuel. À préciser par Nicolas à la relecture du DRAFT s'il veut garder ce fait.

## D11 : point d'arrêt

- Choix : arrêt à l'approbation. Le design n'est pas APPROVED par Nicolas, la requête interdit à boss de l'approuver, et OQ-8 est ouverte (rloq). Aucune implémentation, prérequis compris. Aucun commit.
- Reprise : Nicolas tranche OQ-8 et passe le design à APPROVED ; relancer la même requête, boss repart d'un `designman update` qui intègre OQ-8, puis de l'implémentation (prérequis d'abord, commit à part).

## 2026-10-26 — boss multilingual-site, étape 1 (prérequis), rloq

- Branche : `epic/robusta-v2`, conforme. Seul `CLAUDE.md` portait des modifications non commitées de Nicolas, conservées.
- Périmètre : R-MULTILINGUAL-01 à 05 seulement, aucun changement de schéma. Arrêt avant commit, à la demande de Nicolas.
- Référence avant déplacement : 147 + 78 + 98 tests, design system 75, 32 fichiers HTML prérendus dans `apps/robusta-build/dist/client`.
- Agent : codeman, pas tddman. Le prérequis est un déplacement sans comportement nouveau ; seule la spec de R-MULTILINGUAL-05 est écrite test-first.
- R-MULTILINGUAL-04 : `tsconfig.routing.json` inclut `src/routing/url-scheme` ; `src/routing/counterparts.ts` n'existe pas encore, il y entrera avec son étape.
- Les chaînes de log au build (préfixe `[pyramids-content]`) restent telles quelles : aucun changement de comportement.
- `CLAUDE.md` : éditions ciblées sur `build:deps`, les watchers, les commandes de test et la phrase sur les specs du corpus. Les modifications de Nicolas restent dans le même fichier : le commit proposé les embarque, sauf `git add -p`.
- Docs restantes (README du site, `root.archi.md`, `robusta-build.archi.md`, ROADMAP) : laissées à docman et archiman au land, selon le plan de la story.
- Résultat vérifié par boss : site 330 tests (147 + 78 + 98 + 7 de la spec R-MULTILINGUAL-05, `apps/robusta-build/src/self-contained-packages.spec.ts`), design system 75, lint et `tsc --noEmit` du site verts, `build:deps`, `build:robusta`, `build:robusta-v1` verts. Les 32 fichiers HTML prérendus sont les mêmes, au même contenu une fois les hash d'asset et l'horodatage TanStack normalisés ; la v1 map est inchangée.
- Ajout de codeman, accepté : `@source not` sur les deux répertoires dans `src/styles/globals.css`. Sans lui, Tailwind lisait le mot `visible` d'un titre de spec déplacée et générait une utility de plus. Directive de scan, aucune valeur : BR-PYRAMID-6 non touchée.
- La spec R-05 autorise les specs à importer `src/test-support`, où le design place `corpus-fixture.ts`.
- `apps/robusta`, `apps/dakar`, `services` et les autres modules ne référencent aucun des deux workspaces (git grep vide).
- Index git : `git mv` a indexé les renommages ; le reste n'est pas indexé. Rien n'est commité.
- Aucune OQ pertinente.

## 2026-10-30 — boss multilingual-site, implémentation de la suite, rloq

- Branche : `epic/robusta-v2`, conforme, working tree propre au départ (HEAD `05cb2c5`).
- Requête : implémenter les cinq groupes restants du design APPROVED, test-first, sans commit, sans `## Progress` ni passage en IMPLEMENTED, sans land.
- Découpage : un tddman par groupe, l'un après l'autre (même branche, mêmes tests). Ordre : schéma préfixé, page copy, contreparties, original et traduction obsolète ; la v1 map est vérifiée en dernier.
- R-MULTILINGUAL-101 suit le schéma : `v1-url-map.spec.ts` affirme les destinations calculées par `buildUrl`, et `build` régénère le JSON par `emit:v1-map`. Les attentes de la spec changent donc avec le premier groupe ; le contrôle des 82 lignes (ordre, issues, en-tête) se fait en fin de parcours.
- R-MULTILINGUAL-04 se clôt avec `counterparts.ts`, au troisième groupe.

### Groupe 1 : schéma préfixé et redirection (tddman)

- Résultat : R-21 à R-28 faits, R-45 (flux de notes par Locale) livré au passage, R-101 suivi. Site 350 tests, design system 75, lint, `tsc --noEmit` et `build:robusta` verts ; 34 pages HTML : `en.html`, `fr.html`, `es.html`, `404.html`, 14 sous `en/`, 16 sous `fr/`, rien sous `es/`, aucun `index.html`.
- Wordmark encore vers `/` jusqu'au groupe 3 (`homeHref`, R-63, R-65) : `lgtm (boss)`. État transitoire d'un working tree non commité, la spec des `href` l'admet derrière un TODO que le groupe 3 retire.
- Ligne `/` de la v1 map : son `why` disait « the v2 landing serves the same URL », faux depuis la règle 301. Reformulé par boss en « the v2 site redirects it to the landing page of its default Locale » : texte d'une destination `none`, que R-101 laisse changer ; issue et compte inchangés. `lgtm (boss)`.
- Page 404 et `FailedNavigationPage` : lien de retour vers `/en` (`buildUrl` de la landing par défaut) plutôt que `/`, pour éviter le saut 301 et marcher sous `vite dev`. Conforme à R-28.

### Groupe 2 : page copy par Locale (tddman)

- Résultat : R-41 à R-49 faits, R-50 ouvert jusqu'au wordmark du groupe 3. Site 383 tests, design system 80, lint, `tsc --noEmit`, `build:deps`, `build:robusta`, `build:robusta-v1` verts. `/en`, `/fr`, `/es` : `lang` à la Locale, `id="open-source"` et `id="complete"`, aucun `approach`, notes sur `en` et `fr`, aucune sur `es`.
- Page copy : textes rédigés par boss dans le scratchpad (`page-copy.md`), recopiés tels quels par tddman. Faits seulement : le workflow de §Code Routine, ses agents, « vingt ans de logiciel » ; ni prix, ni promesse, ni lien vers le plugin. Espagnol au tutoiement.
- Gap, R-43 : le design dit que `getCategoryLabel` fait échouer la build par `failOnError`. Faux : l'erreur levée sous une frontière Suspense est journalisée, et la page s'écrit en 200 avec un repli de rendu client vide (`<!--$!-->`). tddman ajoute à `check-route-table` un échec sur toute page qui porte ce repli ; le journal du prérendu nomme la Category et la Locale. Comportement conforme à AC-7, seul le mécanisme diffère. `lgtm (boss)` ; la phrase du design est à corriger au land.
- `FailedNavigationPage` restait en français sur toutes les Locales, et `PageCopy` n'a aucun champ pour lui. Tranché par boss : anglais constant, `lang="en"`, comme la 404 (R-28) ; page d'erreur rare, facile à défaire. `lgtm (boss)`.
- Typographie française : espace insécable (U+00A0) avant les deux-points de la page copy `fr`, comme l'ancien préfixe de fin d'article. Les autres Locales n'en ont pas. `lgtm (boss)`.

### Groupe 3 : contreparties et sélecteur de Locale (tddman)

- Résultat : R-61 à R-65 faits ; R-04, R-27 et R-50 clos. Site 409 tests, design system 87, lint, `tsc --noEmit`, `build:deps`, `build:robusta`, `build:robusta-v1` verts ; 33 pages, 53 fichiers de données (17 articles, 3 flux de notes, 33 contreparties).
- Bug corrigé au passage : la route racine restait montée entre deux navigations client, son loader ne se relançait pas, et `<html lang>` comme l'en-tête gardaient la Locale de la première page. `shouldReload: true` et `staleReloadMode: 'blocking'` sur la route racine ; une spec navigue de `/en` à `/fr/articles/c/theory`.
- Séparateur entre plusieurs versions d'un article : « , ». Aucun article n'a trois versions aujourd'hui. `lgtm (boss)`.
- Gap de rédaction : la contrainte technique dit que `counterparts.ts` ne s'atteint que depuis le handler de `getCounterparts`, alors que R-64 le fait aussi atteindre par `getArticlePage`, côté serveur. À reformuler au land : « ne s'atteint que depuis les handlers de `page-data`, jamais depuis du code client ». `lgtm (boss)`.

### Groupe 4 : original et traduction obsolète (tddman)

- Résultat : R-81 à R-86 faits. Les huit traductions déclarent leur original (bloc `original:` du frontmatter seul, empreintes calculées par le code) ; `check:translations` imprime `translations: no notice` sur le corpus réel. Preuve manuelle, annulée octet pour octet : un mot changé dans `privacy/leaving-gmail.md` produit une notice `stale-translation` sur `quitter-gmail.md` avec l'empreinte à recopier.
- `untracked-pair` à trois versions ou plus : la notice liste les versions sans déclaration, lecture littérale de « plus d'une version sans `original` ». `lgtm (boss)`.
- Cycle (en déclare fr, fr déclare en) : aucune notice `untracked-pair`, chaque côté reste comparé à l'autre. Mauvais usage qu'une édition humaine seule produit. `lgtm (boss)`.

### Vérification finale par boss

- Site 455 tests (41 fichiers), design system 87, lint et `tsc --noEmit` verts ; `build:deps`, `build:robusta`, `build:robusta-v1` (42/42 pages) verts.
- `dist/client` : `en.html`, `fr.html`, `es.html`, `404.html`, 14 pages sous `en/`, 16 sous `fr/`, rien sous `es/`, ni `index.html`, ni `articles/`, ni `l/` ; `lang` à la Locale, `404.html` en `en`. 53 fichiers de données.
- `netlify.toml` : une règle `[[redirects]]` `/` → `/en`, 301, sans `force`.
- v1 map contre HEAD : 82 lignes, même ordre, mêmes issues (67/5/10), en-tête `en` puis `fr`, `es` ; seuls changent les destinations et le `why` de la ligne `/`.
- Octet nul littéral dans `read-corpus.ts`, présent depuis HEAD : git traitait le fichier comme binaire. Remplacé par l'échappement `\u0000`, même chaîne ; les 178 tests de `src/content` restent verts.
- Aucune OQ pertinente : arrêt sur implémentation verte. Reste hors de portée locale : AC-2, à vérifier sur un branch deploy.
