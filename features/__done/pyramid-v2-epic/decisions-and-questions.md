# Questions et décisions : pyramid-v2, batch B1

**Date :** 2026-11-04
**Branche :** epic/robusta-v2
**Requête :** `boss prepare pyramid-v2-epic batch B1` — chaque story de B1 jusqu'au design approuvé par boss, sans code. Mode rloq : une entrée `ask` reste à Nicolas.

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche de l'epic pyramid-v2 nommée dans la requête et portant ses runs précédents. HEAD `a859736`, arbre propre.
- Batch B1, sous le lock : aucun batch au-dessus. prepare : aucun code.
- État lu :
  - blog-rolls : story ACTIVE, brainstorm présent, design DRAFT → fold des réponses (story et brainstorm), puis Phase 5 depuis le fold.
  - glossary-refresh : story ACTIVE, ni brainstorm ni design → fold des réponses, puis Phase 4.
  - drop-section-default-copy : story ACTIVE, design DRAFT, pas de brainstorm → fold des réponses, puis Phase 5 depuis le fold.
- Réponses à intégrer : toutes les entrées `ask` du batch ont une Resolution de Nicolas, recopiée par `bulkman resolve`. default-locale-at-root livrée (`83e6cef`, BR-PYRAMID-14) change les adresses de glossary-refresh et de blog-rolls.

## D1 : stories, fold des réponses

- Phase : story (commit `426b679`)
- blog-rolls (`storyman update avec brainstorm`) : OQ-BLOGROLLS-1 et 2, Gap-BLOGROLLS-3 à 5 intégrés ; adresses `en` sans préfixe (`/articles…`, `/en/articles…` en 301) ; Dep 1 ferme, drop-section-default-copy avant blog-rolls. Aucune entrée nouvelle.
- glossary-refresh : Gap-GLOSSARY-1 et 2, OQ-GLOSSARY-3 intégrés ; AC-GLOSSARY-1, 2 et 7 réécrits pour la Locale par défaut sans marqueur ; exemple de Gap-GLOSSARY-1 inversé (`/en` vers `/`). La BR des stale translations reste une suite de la story, pour epicman après livraison. Aucune entrée nouvelle.
- drop-section-default-copy : OQ-SECTIONCOPY-1 et 2 intégrés ; AC-SECTIONCOPY-3 aligné sur Gap-SECTIONCOPY-3 du design (absente, `null` ou `''` : pas d'élément) ; AC-SECTIONCOPY-5 ne parle plus d'une Section de blog-rolls. Aucune entrée nouvelle.
- Commit cité par les stories pour default-locale-at-root : `2fbc7be` (implémentation), `83e6cef` étant son submit. Laissé tel quel.

## D2 : designs de drop-section-default-copy et blog-rolls, approbation

- Phase : design
- drop-section-default-copy : `designman update` plie Gap-SECTIONCOPY-3 (Nicolas) et OQ-SECTIONCOPY-4 (`lgtm (designman)`), aligne les AC réécrits et les Dependencies (blog-rolls après, sans nouvelle Section). Aucun contrat changé, aucune entrée nouvelle.
- blog-rolls : `designman update` plie OQ-BLOGROLLS-7 (`lgtm (designman)`, package `src/listing`), cite les décisions de la story, passe les adresses `en` sans préfixe (routes `/{-$locale}/articles…`, vérifiées sur `apps/robusta-build/src/routing`). Aucune signature changée, aucune entrée nouvelle.
- Contrôle boss : chaque AC des deux stories cité mot pour mot, `## Boundaries` rempli, aucune entrée `ask` en attente dans story, brainstorm ou design → APPROVED (validated by boss).

## D3 : brainstorm de glossary-refresh, tri des entrées

- Phase : brainstorm (`glossary-refresh.brainstorm.md`)
- Gap-GLOSSARY-4 (`Workspace` et `Green set` hors de la story, contredisent `Module`) : `ask`, il change ce que la story livre et le « mot pour mot » d'AC-GLOSSARY-7. Resolution vide ; les agents suivants supposent la Proposition.
- Gap-GLOSSARY-5 (`Build chain` contre la lecture des CSS et assets du design system par robusta.build) : `ask`, contradiction entre un document et le code, jamais tranchée en faveur du code. Resolution vide ; Proposition supposée.
- Conséquence rloq : glossary-refresh va jusqu'à son design DRAFT et s'y arrête.

## D4 : design de glossary-refresh, laissé DRAFT

- Phase : design (`glossary-refresh.design.md`)
- OQ-GLOSSARY-6 (exemple `/en/articles/c/theory` dans l'entrée `Canonical URL`, ou la règle seule) : `decide`, signée `lgtm (designman)`, sans contradiction avec AC-GLOSSARY-2 ; pliée par `designman update`.
- Contrôle : AC-GLOSSARY-1 à 7 cités mot pour mot, `## Boundaries` rempli.
- Statut : DRAFT, Gap-GLOSSARY-4 et 5 du brainstorm restant `ask` pour Nicolas (rloq). Une réponse, puis `boss prepare pyramid-v2-epic batch B1` : `storyman update glossary-refresh avec brainstorm`, `designman update`, approbation.

---

# Run 2 : `boss pyramid-v2-epic batch B1`

**Date :** 2026-11-04
**Requête :** `boss pyramid-v2-epic batch B1` — chaque story de B1 codée et soumise, une après l'autre : drop-section-default-copy, blog-rolls, glossary-refresh. Mode rloq.

## D5 : branche, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche attendue. HEAD `7b3b62d`, arbre propre. B1 est le premier batch : le lock le laisse passer.
- État lu :
  - drop-section-default-copy : design APPROVED, aucune entrée en attente → Phase 6.
  - blog-rolls : design APPROVED, aucune entrée en attente → Phase 6, après drop-section-default-copy (Dep 1).
  - glossary-refresh : design DRAFT, Gap-GLOSSARY-4 et 5 répondus `lgtm (Nicolas, 2026-11-04)` dans le brainstorm → `storyman update avec brainstorm`, `designman update`, Phase 5.
- Parallèle : les documents de glossary-refresh avancent pendant l'implémentation de drop-section-default-copy ; fichiers disjoints, le code reste linéaire.

## D6 : glossary-refresh, fold et approbation

- Phase : story et design
- `storyman update avec brainstorm` : Gap-GLOSSARY-4 et 5 (Nicolas) pliés ; seule la phrase du Contexte change, aucun AC réécrit ; entrées retirées du brainstorm. Aucune entrée nouvelle.
- `designman update` : la ligne du Goal qui disait les Propositions en attente cite leur retenue ; aucun contrat changé, aucune entrée nouvelle.
- Contrôle boss : AC-GLOSSARY-1 à 7 cités mot pour mot, `## Boundaries` rempli, aucune entrée `ask` en attente → APPROVED (validated by boss).

## D7 : drop-section-default-copy, implémentée et soumise

- Phase : code et submit
- tddman : commit `3b16c72`. Tests du design system 209/209, `yarn build:deps` vert, tests de robusta-build 490/490, lint et `yarn build:robusta` verts, `tsc --noEmit` de `apps/robusta` vert. Pages prérendues avant/après : même texte lisible sur les 34 documents, seul le `<div>` vide de la ligne de version quitte le pied de page (AC-SECTIONCOPY-4).
- Décisions de tddman, sans effet sur la direction : le second rendu d'une section sans liste passe chaque prop de texte à `''` ; la `readableTexts` du site lit aussi `placeholder`, `aria-label` et `title`.
- submit : commit `2662cc4`, design IMPLEMENTED, story SUBMITTED, item retiré du ROADMAP, epicman update (nouvel item B4 surface-identifiers).

## D8 : blog-rolls, implémentée

- Phase : code (commit `bc568f7`). tddman interrompu par la limite d'API, repris sur le même arbre.
- Checker : tests de robusta-build 552/552, lint, `tsc --noEmit` et `yarn build:robusta` verts (33 pages, 69 fichiers de données dont 13 roll pages et 3 locale rolls). AC-BLOGROLLS-3 prouvé sur fixture ; les 404 lus dans `dist` (fichiers absents), sans draft deploy, l'hébergeur ne changeant pas.
- Décisions de tddman, sans effet sur la direction : un roll vide ne rend que son h1 ; `getLocaleRolls` rend `[]` pour une Locale sans article. La page copy des pages de listing (`ListingCopy` en, fr, es) est écrite par tddman : à relire par Nicolas.

## D9 : blog-rolls soumise, glossary-refresh implémentée

- blog-rolls, submit : commit `ab90ca6`, design IMPLEMENTED, story SUBMITTED, epicman update (nouvel item B4 listing-copy-review pour la page copy des pages de listing).
- glossary-refresh, code : codeman plutôt que tddman, la story ne touche que `ubiquitous-language.md`, sans test à écrire. Commit `3ca46f9` : 12 entrées réécrites, 4 créées (RB Compound, Original, Stale translation, Module). AC-GLOSSARY-1 à 7 vérifiés sur le fichier.
- Hors du design : l'entrée `Category` (« Chaque category a sa propre page ») et une entrée « Blog home » proposée par docman restent une suite, le design gardant les autres entrées mot pour mot.

## D10 : glossary-refresh soumise, fin du batch B1

- submit : design IMPLEMENTED, story SUBMITTED, item et titre de B1 retirés du ROADMAP, epicman update. B1 est vide ; B2 seo-excellence et B3 rb-compound-positioning n'attendent plus glossary-refresh.
- Gap-PYRAMID-5, écrit par epicman dans l'epic (reformuler `Stale translation` pour enregistrer BR-PYRAMID-15) : `ask`, il touche le registre des BR. Resolution vide, pour Nicolas ; boss n'écrit pas l'epic.
- Le run s'arrête après B1, comme la requête le demande (`batch B1`).

## D11 : batch B2, branche, état de départ

- Requête : `boss atw pyramid-v2-epic batch B2`. Mode atw : boss tranche les entrées `ask`, signées `lgtm (boss atw)`, jusqu'au submit de chaque story.
- Branche : `epic/robusta-v2`, celle de l'epic pyramid-v2 depuis B1 ; boss y reste.
- Verrou : B1 vidé le 2026-11-04, B2 passe au code.
- seo-excellence : story ACTIVE, brainstorm du 2026-10-06 déjà plié le 2026-10-25, pas de design. Reprise à l'étape `storyman update avec brainstorm`, avec les événements de la requête.
- go-live : ligne « story à écrire » du batch ; storyman l'écrit. OQ-LANDING-12 et OQ-SEOEXCELLENCE-19 sont répondues `lgtm` (décision de l'epic du 2026-10-06) : rien à trancher.
- Le bulk `pyramid-v2.bulk.md` porte encore OQ-SEOEXCELLENCE-21 ; boss ne l'écrit pas, il sera périmé jusqu'au prochain `bulkman` de Nicolas.
- `pyramid-v2.epic.md` et `ROADMAP.md` portent le journal d'epicman non commité ; boss ne les commite pas.

## D12 : stories de seo-excellence et go-live

- seo-excellence, `storyman update avec brainstorm` : OQ-SEOEXCELLENCE-22 et 23 pliées ; Contexte, AC-1, 2, 4 et 7 réécrits sur le schéma de default-locale-at-root ; fil d'Ariane des pages de roll (Gap-BLOGROLLS-4) dans AC-4 ; page `n` d'un roll en AC-7 ; toutes les Dependencies levées. OQ-SEOEXCELLENCE-21 reformulée, Resolution vide.
- go-live : story écrite par storyman, 5 AC, aucune entrée. Dep 2 : passer l'équipe Netlify en offre Personal avant le merge sur `main`, action de Nicolas hors dépôt.
- D12a — atw OQ-SEOEXCELLENCE-21 — seo-excellence.story.md — retained: la Proposition, chaque landing page (`/`, `/fr`, `/es`) déclare Robusta Build comme organisation, aucune entreprise locale. Set aside: une entreprise locale sur `/fr` seule, ou l'organisation sur `/` seule. Confidence: high.

## D13 : brainstorm de go-live

- bsman : Netlify ne pose pas `X-Robots-Tag: noindex` sur le dernier déploiement d'une branche (`epic-robusta-v2--robusta-build.netlify.app` répond 200 sans l'en-tête) : la build reste fermée hors production, par `CONTEXT`. `robusta-build.netlify.app` répond 200 sans redirection.
- OQ-GOLIVE-1 : `decide`, signée `lgtm (bsman)`, gardée.
- D13a — atw OQ-GOLIVE-2 — go-live.brainstorm.md — retained: la Proposition, un 301 forcé dans `netlify.toml` limité à l'hôte `robusta-build.netlify.app`, vers la même page sous `https://www.robusta.build`. Set aside: la copie ouverte rattachée par la seule canonical URL. Confidence: medium.

## D14 : design de seo-excellence, tri des entrées

- designman : DRAFT, 32 R-, package `seo` nouveau, scripts `emit-site-files.mjs` et `check-seo.mjs`. L'indexation reste fermée par une constante de build `INDEXING_OPEN`, `false` ; go-live la rend vraie en production seule.
- OQ-SEOEXCELLENCE-35 : `decide`, signée `lgtm (designman)`.
- D14a — atw Gap-SEOEXCELLENCE-31 — seo-excellence.design.md — retained: la Proposition, corriger les cinq corps à second `h1` (dont `leaving-gmail`, titre setext vérifié dans le corpus) dans les deux arbres, un seul commit. Set aside: s'en tenir aux quatre de la story. Confidence: high.
- D14b — atw OQ-SEOEXCELLENCE-34 — seo-excellence.design.md — retained: la Proposition, `og:locale` en `en_US`, `fr_FR`, `es_ES`. Set aside: le code de Locale seul. Confidence: high.
- D14c — atw OQ-SEOEXCELLENCE-33 — seo-excellence.design.md — retained: la Proposition, un `h2` et une liste de liens, et les textes de page copy proposés en trois Locales. Set aside: `NotesPreview` avec date et image. Confidence: medium. Ces textes sont rédigés par un agent : à relire avec listing-copy-review.
- D14d — atw OQ-SEOEXCELLENCE-32 — seo-excellence.design.md — retained: la Proposition, le `<title>` d'un article est son titre seul. Set aside: un suffixe du nom du site. Confidence: medium.
- `designman update` : les cinq entrées pliées, aucun contrat changé, aucune entrée nouvelle. Contrôle boss : AC-SEOEXCELLENCE-1 à 7 cités mot pour mot, `## Boundaries` rempli → APPROVED (validated by boss atw).

## D15 : design de go-live

- designman : DRAFT, 7 R-. `INDEXING_OPEN` lu au build par un `define` de Vite ; 301 forcé de `robusta-build.netlify.app` vers `www` dans `netlify.toml`. OQ-GOLIVE-3 (`decide`, `lgtm (designman)`) pliée.
- Vérifié par designman dans la doc Netlify et la source de netlify-cli 27.16.2 : un `netlify deploy` ou `netlify build` du CLI construit avec `CONTEXT=production` ; seul un build des serveurs Netlify pose `NETLIFY=true`.
- D15a — atw Gap-GOLIVE-4 — go-live.design.md — retained: la Proposition, ouvrir seulement quand `NETLIFY=true` et `CONTEXT=production` ; la story est corrigée par `storyman update`. Set aside: documenter `--context deploy-preview`, qui laisse AC-GOLIVE-3 à la discipline de qui lance la commande. Confidence: high.
- Reste ouvert, signalé : un `netlify deploy --remote` (build distant d'un draft) n'est pas documenté ; le README de go-live l'exclut des commandes de draft.
- `designman update` et `storyman update` : Gap-GOLIVE-4 plié dans le design et la story, aucun contrat changé. Contrôle boss : AC-GOLIVE-1 à 7 cités mot pour mot, `## Boundaries` rempli → APPROVED (validated by boss atw).

## D16 : seo-excellence implémentée

- tddman : commit `93f6770`. Contrôle boss : tests de robusta-build 666/666 (552 avant), lint vert, `yarn build:robusta` vert : sitemap de 33 pages indexables, `seo: 34 pages checked, 33 indexable and all in the sitemap; indexing closed`, 69 fichiers de données inchangés. Head prérendu de `leaving-gmail` lu : titre seul, `noindex, nofollow`, canonical, hreflang `en`, `fr`, x-default, Open Graph `en_US`, deux JSON-LD.
- Tests v1 (`apps/robusta`, vitest sans script) : 22/71 rouges, tous dans les helpers prosemirror et `learn-segments`, sans environnement DOM ; étrangers à la story, qui ne change que cinq corps d'article v1.
- Décisions de tddman, sans effet sur la direction : JSON-LD par `head().scripts` (le typage de `head().meta` refuse `script:ld+json`), `shareType` pour `og:type`, `robotsOf(indexable, open)`, prop `url` de `ListingPage`. Repliées dans le design par `designman update` avant submit.
- tddman a lancé un `git stash` puis l'a dépilé aussitôt : `ROADMAP.md` et l'epic sont revenus inchangés.
- submit : design IMPLEMENTED, story SUBMITTED, README (section SEO), `google-business-profile.md`, trois archi et l en-tête de `router.tsx` ; epicman update (Fait, item B2 webmaster-console, listing-copy-review élargi). `ROADMAP.md` et l epic restent non commités. Écarts relevés par archiman check, non corrigés : voir le rapport.

## D17 : go-live implémentée

- tddman : commit `6182d17`. Contrôle boss : tests de robusta-build 677/677, lint vert, build locale fermée (`indexing closed`, aucune page `index, follow`). tddman a prouvé la build `NETLIFY=true CONTEXT=production` : 33 pages `index, follow`, égales au sitemap, la 404 en `noindex`, même valeur dans le bundle client.
- Draft deploy CLI, alias `dev`, sans `--prod` : `https://dev--robusta-build.netlify.app`, build « indexing closed » ; curl de boss sur `leaving-gmail` : 200, `noindex, nofollow` (AC-GOLIVE-3).
- Décisions de tddman, sans effet sur la direction : la valeur du `define` vient d'un helper `scripts/netlify-build-define.mjs`, testable ; `marked-locale-redirect.spec.ts` ne compte plus que les règles de chemin.
- Restent après le merge sur `main`, à `storyman done` : AC-GOLIVE-4 (console webmaster) et AC-GOLIVE-7 vérifié en direct (301 de `robusta-build.netlify.app`).
- submit : design IMPLEMENTED, story SUBMITTED, deux README, `CLAUDE.md`, skill geo-article, archi de robusta-build et en-tête de `check-seo.mjs` ; epicman update (go-live en Fait, retiré de B2). `ROADMAP.md` et l epic restent non commités. B2 ne garde que webmaster-console, action de Nicolas hors dépôt.

# Run 4 : `boss prepare pyramid-v2-epic batch B3`

**Date :** 2026-11-05
**Requête :** `boss prepare pyramid-v2-epic batch B3` — chaque story de B3 jusqu'au design approuvé par boss, sans code. Mode rloq : une entrée `ask` reste à Nicolas.

## D18 : batch B3, branche, état de départ

- Branche : `epic/robusta-v2`, celle de l'epic pyramid-v2 depuis B1 ; boss y reste. HEAD `be08af6`, arbre propre.
- prepare : aucun code, le verrou ne joue pas.
- rb-compound-positioning : ligne « story à écrire » du batch ; storyman l'écrit.
- extract-compound-plugin : hors du run, sur instruction de la requête (autre dépôt, « on fera ça plus tard ») ; aucune story écrite.

## D19 : story de rb-compound-positioning, tri des entrées

- Phase : story (`rb-compound-positioning.story.md`, ACTIVE, AC-RBCOMPOUND-1 à 7)
- OQ-RBCOMPOUND-1 (les questions PME restent-elles en section secondaire) : `ask`, il change ce que le registre livre. Resolution vide ; les agents suivants supposent la Proposition.
- OQ-RBCOMPOUND-2 (langue des questions RB Compound) : `ask`, le marché visé par l'accompagnement payant n'est connu que de Nicolas. Resolution vide ; les agents suivants supposent la Proposition.
- OQ-RBCOMPOUND-3 (sortie des questions blockchain) : `decide`, signée `lgtm (storyman)`, conforme à AC-RBCOMPOUND-4 ; boss n'y touche pas.
- Relevé par storyman, hors périmètre : `.claude/skills/geo-article/SKILL.md` pointe encore `packages/pyramids-content/src/contract.ts`, devenu un package du site avec multilingual-site.

## D20 : brainstorm de rb-compound-positioning, tri et fold

- Phase : brainstorm (`rb-compound-positioning.brainstorm.md`), puis `storyman update avec brainstorm`
- Gap-RBCOMPOUND-4 (version open source : quatre agents avec tddman dans la page copy, trois dans la décision d'epic du 2026-10-26) : `ask`, contradiction entre deux documents. Vérifié : `seopyramids.config.ts` nomme bien tddman. Resolution vide ; la story suit la Proposition (la page copy fait foi). La correction de l'epic revient à epicman, après réponse.
- OQ-RBCOMPOUND-5 (outils tiers nommés) : `decide`, signée `lgtm (bsman)`, pliée dans AC-RBCOMPOUND-3.
- OQ-RBCOMPOUND-6 (question sur le démarrage d'une équipe) : `ask`, seul Nicolas sait s'il a déjà accompagné une équipe. Resolution vide ; AC-RBCOMPOUND-3 suit la Proposition.
- storyman : OQ-RBCOMPOUND-3 et 5 pliées, E1 à E5 intégrés aux AC, AC-7 allégé ; aucune entrée nouvelle.

## D21 : design de rb-compound-positioning, laissé DRAFT

- Phase : design (`rb-compound-positioning.design.md`, DRAFT, 18 R-, aucune entrée nouvelle)
- Fold `designman update` non lancé : aucune Resolution remplie en attente dans story, brainstorm ou design, les deux signatures d'agent étant déjà pliées par storyman.
- Contrôle boss : AC-RBCOMPOUND-1 à 7 cités mot pour mot, `## Boundaries` rempli.
- Reste DRAFT : quatre entrées `ask` en attente, OQ-RBCOMPOUND-1 et 2 (story), Gap-RBCOMPOUND-4 et OQ-RBCOMPOUND-6 (brainstorm).
- Vérifié : go-live (`6182d17`) est sur `origin/main`, le contrôle mensuel est donc ouvert (R-RBCOMPOUND-81) ; la story garde « ouvert au merge » dans AC-RBCOMPOUND-2, sans contradiction.

## D22 : reprise de rb-compound-positioning, réponses de Nicolas pliées dans la story

- Phase : `boss prepare pyramid-v2-epic batch B3`, reprise après D21 ; branche `epic/robusta-v2`.
- Réponses de Nicolas écrites dans les sources (le bulk `pyramid-v2.bulk.md` est périmé et ne les porte pas) : OQ-RBCOMPOUND-1 lgtm ; OQ-RBCOMPOUND-2, questions RB Compound en anglais et en français, aucune en espagnol ; Gap-RBCOMPOUND-4, trois agents (epicman, storyman, designman), la page copy est corrigée ; OQ-RBCOMPOUND-6, la question du démarrage d'une équipe entre au registre.
- `storyman update avec brainstorm` : les quatre entrées pliées ; AC-RBCOMPOUND-1, 3, 4 et 5 réécrits ; la correction du schéma open source de la page copy (trois Locales) entre au périmètre, aucune mise à jour de documentation.
- OQ-RBCOMPOUND-7 (une question bilingue tient en deux entrées) : `decide`, signée `lgtm (storyman)`, conforme à AC-RBCOMPOUND-2 et 5 ; boss n'y touche pas.
- Relevé par storyman pour le code à venir : `apps/robusta-build/src/seopyramids.config.spec.ts:259-272` attend tddman dans le schéma open source.

## D23 : design de rb-compound-positioning, plié, laissé DRAFT

- Phase : design, `designman update` (fold des réponses de D22 et de OQ-RBCOMPOUND-7) ; 24 R-, dont R-RBCOMPOUND-27, 28 et le groupe R-101 à 104 (schéma open source de la page copy, test `seopyramids.config.spec.ts`).
- Contrôle boss : AC-RBCOMPOUND-1 à 7 cités mot pour mot, `## Boundaries` rempli.
- OQ-RBCOMPOUND-8 (le schéma open source garde-t-il une cinquième étape `code` sans agent nommé) : `ask`, il change ce que le visiteur lit sur la landing page. Resolution vide ; R-101, R-102 et les Boundaries suivent la Proposition (cinq étapes, « three agents, from epic to code. »).
- Reste DRAFT : une entrée `ask` en attente, rloq.
- OQ-RBCOMPOUND-7 signée `lgtm (storyman)`, pliée dans le design ; le corps de la story la prendra au prochain `storyman update`.

## D24 : design de rb-compound-positioning, plié, APPROVED

- Phase : `boss prepare pyramid-v2-epic batch B3`, reprise après D23 ; branche `epic/robusta-v2`.
- OQ-RBCOMPOUND-8 : `lgtm (Nicolas, 2026-11-05)`, la Proposition est retenue (cinq étapes, l'étape 5 `code` tenue par l'agent de code du lecteur, « three agents, from epic to code. »). `designman update` l'a pliée ; aucun contrat changé, aucune entrée nouvelle, la section Open Questions & Gaps du design est vide et retirée.
- Contrôle boss : AC-RBCOMPOUND-1 à 7 cités mot pour mot, `## Boundaries` rempli, aucune entrée `ask` en attente dans la story, le brainstorm ni le design. Design passé en APPROVED (validated by boss).
- OQ-RBCOMPOUND-7 (story), signée `lgtm (storyman)` : signature d'agent, pas de `storyman update` lancé pour elle seule ; elle se plie au prochain passage de storyman. Le design la suit déjà.
- extract-compound-plugin (B3) : « pas de story » par décision d'epic du 2026-10-26, autre dépôt ; rien à préparer.
- Arrêt : `prepare`, aucun code.

## D25 : rb-compound-positioning codé, `boss atw pyramid-v2-epic batch B3`

- Phase : implémentation (tddman, LFG fast) ; branche `epic/robusta-v2`. Mode atw : aucune entrée `ask` en attente dans la story, le brainstorm ni le design, rien à décider.
- Lock : B3 est le premier batch d'À faire, rien au-dessus. extract-compound-plugin laissé hors du run : « pas de story », autre dépôt, non prioritaire.
- Page copy, trois Locales : titre du schéma open source à trois agents, étape 5 `code` tenue par l'agent de code du lecteur, valeurs du bloc Boundaries. Test `seopyramids.config.spec.ts` : epicman, storyman, designman, DRAFT, APPROVED, plus rien.
- Registre `documentation/geo-questions.md` : 14 entrées, 12 RB Compound (6 questions, anglais puis français, cinq types), 2 PME, 8 articles publiés sans question.
- Écart relevé : le client visé cite la page copy mot pour mot, « les équipes et les responsables techniques qui construisent du logiciel avec des agents », là où R-RBCOMPOUND-01 paraphrase « produisent ... avec des agents IA ». AC-RBCOMPOUND-1 veut l'acheteur « tel que le dit la page copy » : la citation fait foi. Confidence: high.
- `prettier --check` échoue sur le registre (`proseWrap: 'always'` couperait les entrées) ; déjà le cas avant la story. Laissé tel quel, hand-off à Nicolas.
- Vérifié : test 677/677 (59 fichiers), lint vert, `yarn build:robusta` vert (33 pages, 0 violation).

## D26 : rb-compound-positioning SUBMITTED

- Phase : `storyman submit`, 5 étapes sur 5 ; design IMPLEMENTED (cd83f06), story SUBMITTED, OQ-RBCOMPOUND-7 pliée, item ROADMAP retiré, epic mis à jour (B3 : reste extract-compound-plugin).
- archiman : date de `robusta-build.archi.md`, paire Design/Requirements content-source ajoutée à l'en-tête de `routing/scheme.ts`.
- Hand-offs laissés à Nicolas : prettier sur le registre ; webmaster-console encore au ROADMAP (B2) ; JSDoc de `v1-url-map.ts` ; exemple blockchain dans `.claude/skills/geo-article/SKILL.md:49` ; aucun item roadmap pour écrire les articles RB Compound.
- Fin du run : batch B3 nommé, aucune autre story à coder.

## D27 : netlify-deploy, story et brainstorm, `boss atw netlify-deploy`

- Requête : `boss atw netlify-deploy`, branche `epic/robusta-v2`. Mode atw : boss tranche les entrées `ask`, signées `lgtm (boss atw)`, jusqu'au submit.
- Lock : netlify-deploy est en B4 ; B3 ne porte plus aucune story (extract-compound-plugin : « pas de story », autre dépôt). Rien ne la retient.
- Story : réécrite par storyman le 2026-11-05, OQ-NETLIFY-3 (`lgtm (Nicolas, 2026-11-05)`) pliée : la règle suit les dépendances du site sur les seules builds de branche, la production construit toujours. Commit `1904296`.
- D27a — atw Gap-NETLIFY-1 — netlify-deploy.brainstorm.md — retained: `yarn build:robusta` reste tel quel, `build:deps` compris ; la règle suit le seul graphe du site et saute un commit qui ne touche que les packages de base. Set aside: la Proposition, réduire `build:robusta` aux dépendances du site (scripts racine, CLAUDE.md et BR-PYRAMID-5 touchés, hors périmètre de la story). Confidence: medium.
- D27b — atw OQ-NETLIFY-2 — netlify-deploy.brainstorm.md — retained: la Proposition, la règle dans `apps/robusta-build/scripts` avec sa spec vitest. Set aside: un script à la racine du dépôt. Confidence: high.
- D27c — atw OQ-NETLIFY-3 (brainstorm) — netlify-deploy.brainstorm.md — retained: relecture du README seule ; la répétition sur www.robusta.build reste à Nicolas. Set aside: la Proposition, une répétition en production pendant le run, qui changerait ce que sert www.robusta.build. Confidence: high.

## D28 : netlify-deploy, design

- designman : `apps/robusta-build/scripts/netlify-ignore.mjs`, spec vitest à côté ; git et modules `node:` seuls ; la ref en cache n'est jugée que si elle est sur l'historique de premier parent de `COMMIT_REF`.
- D28a — atw Gap-NETLIFY-1 — netlify-deploy.design.md — retained: la Proposition, accepter qu'un fast-forward de `main` dans la branche d'epic suivi d'un commit sans code saute la build de branche ; le README demande `git merge --no-ff main` et renvoie à une relance depuis le dashboard. Set aside: lire la dernière production par l'API Netlify, avec un jeton que la story exclut. Confidence: high. AC-NETLIFY-6 est resserré par `storyman update` pour dire cette exception.
- OQ-NETLIFY-2 (design), signée `lgtm (designman)` : toute dépendance des quatre champs au nom d'un workspace entre au graphe ; ne contredit aucun AC.
- Contrôle boss : AC-NETLIFY-4 à 6 cités mot pour mot, `## Boundaries` rempli, aucune entrée en attente. Design APPROVED (validated by boss atw).

## D29 : netlify-deploy codé et SUBMITTED

- tddman (LFG fast) : `apps/robusta-build/scripts/netlify-ignore.mjs` et sa spec (39 tests), clé `ignore` de `netlify.toml`, court-circuit de production gardé en tête. Commit `e44ac86`.
- Vérifié par boss : test 716/716 (60 fichiers), lint vert, `yarn build:robusta` vert (33 pages, indexing closed). Chaîne `ignore` lancée par `sh -c` : production → exit 1 ; branche `e57501b..688d6c0` → skip ; `cd83f06^..cd83f06` → build ; deploy-preview docs seuls → skip ; commit dakar seul (clone jetable) → skip en branche, build en production ; ref inconnue, absente ou égale → build.
- `storyman submit` : 5 étapes sur 5, design IMPLEMENTED, story SUBMITTED, item ROADMAP retiré, epic mis à jour ; epicman ajoute l'item `rollback-rehearsal` (B4, sans story).
- Hand-offs laissés à Nicolas : répétition du retour arrière sur www.robusta.build ; libellés du dashboard du README non vérifiés en direct ; date de go-live du README (`6182d17`, 2026-11-04) contre l'ouverture de l'indexation du 2026-11-05 dans la story.

## D30 : restore-v1-urls, `boss new story restore-v1-urls until design`

- Requête : `boss new story restore-v1-urls until design`, branche `epic/robusta-v2`, mode rloq. Nicolas l'a demandée comme `boss prepare restore-v1-urls`, que boss refuse sur une story qui n'existe pas encore : la story est créée par storyman, puis le run s'arrête au design.
- Arrêt retenu : celui de prepare, design approuvé par boss si aucune entrée `ask` n'est en attente, sinon DRAFT. Écarté : `until design` lu à la lettre, qui laisse toujours le design en DRAFT. Motif : l'intention écrite par l'appelant. Confidence: medium.
- Lock : non évalué, aucun code dans ce run.
- Story : storyman, deux entrées `ask` (OQ-RESTOREV1-1, retour ou non ; OQ-RESTOREV1-2, rattrapage v1 ou règle de site). Tri de boss : `ask` toutes deux, gardées. Commit `117ccf6`.
- Brainstorm : bsman, OQ-RESTOREV1-3 `ask` (410 non documenté sur Netlify Free), OQ-RESTOREV1-4 et 5 signées `lgtm (bsman)` ; aucune ne contredit un AC de la story. Puis `storyman update avec brainstorm`.
- Conséquence rloq : trois `ask` en attente, la story s'arrête au design DRAFT.
- Design : designman, `scripts/emit-redirects.mjs` écrit `dist/client/_redirects` (77 règles, aucune forcée) ; map scindée sur la ligne image, 83 lignes. OQ-RESTOREV1-6 signée `lgtm (designman)`, pliée par `designman update`. Contrôle boss : AC-RESTOREV1-1 à 5 cités mot pour mot, `## Boundaries` rempli. Design laissé en DRAFT : OQ-RESTOREV1-1, 2 et 3 en attente.
- Écart relevé, non bloquant : le plan Documentation updates de la story place la liste des étapes de `build` dans la section « Deployment » du README, qui la porte dans « Commands ». À corriger au submit.

## D31 : restore-v1-urls, `boss restore-v1-urls`

- Requête : `boss restore-v1-urls`, branche `epic/robusta-v2`, mode rloq. Reprise du run D30, arrêté au design DRAFT sur trois `ask`.
- Réponses : OQ-RESTOREV1-1, 2 et 3 signées `lgtm (Nicolas, 2026-11-06)`. `storyman update avec brainstorm` les plie (AC-RESTOREV1-2 et 5 gagnent le repli 404 si Netlify Free ne sert pas le 410) et corrige le plan Documentation updates : étapes de `build` dans « Commands » du README. `designman update` recopie les AC, retire la dépendance à OQ-RESTOREV1-1. Aucune nouvelle entrée. Commit `bc8b333`.
- Lock : restore-v1-urls est en B5 ; B3 et B4 ne portent aucune story (« pas de story » ou corvées), comme en D30 pour netlify-deploy. Rien ne la retient. Confidence: high.
- Design : AC-RESTOREV1-1 à 5 cités mot pour mot, `## Boundaries` rempli, aucun `ask` en attente. APPROVED, validated by boss. Commit `5a682d5`.
- tddman (LFG fast) : `scripts/emit-redirects.mjs` et sa spec (12 tests), étape de `build` entre emit-site-files et check-seo, ligne image de la v1 map scindée (83 lignes, 67/5/11), en-tête de `netlify.toml`. Hors liste du design : le filtre de `migrated-corpus.spec.ts` exclut la nouvelle ligne `/learn/:category/s/images/:file`. Commit `467beaa`.
- Vérifié par boss : test 731/731, lint vert, `build:deps` et `build:robusta` verts, `redirects: 77 rules (67 permanent, 5 gone, 5 not found)`.
- Draft deploy `6aedc75fdb5c4d20e5c56dd6`, https://dev--robusta-build.netlify.app, `--no-build`, jamais `--prod` : Netlify Free sert le 410, corps identique à `404.html` ; le repli 404 d'OQ-RESTOREV1-3 ne sert pas. Les 53 règles 301 sans placeholder : un saut, destination 200. 404 pour les pages de roll et les images v1. `/learn/tag/DeFi` 301, `/learn/tag/defi` 410. Pages v2 et `/en…` inchangées. Aucun résultat ne contredit un AC.
- Double saut depuis `robusta-build.netlify.app` : constatable en production seulement, après merge (R-RESTOREV1-62, à `storyman done`).
- `storyman submit` : 5 étapes sur 5. docman (README : « Commands » et « Deployment »), archiman (`robusta-build.archi.md`, en-tête de `scheme.ts`, `archiman root`), design IMPLEMENTED, story SUBMITTED (AC-RESTOREV1-2 et 5 sans le repli 404, réglé par le draft deploy), item 8 retiré de ROADMAP.md, epicman : restore-v1-urls en Fait, liée sous « Stories de l'epic ». Commit de clôture exécuté par boss.
- Laissés à Nicolas : termes UL « V1 map » et « Gone » proposés par docman, non écrits ; en-tête de `emit-v1-map.mjs` sans ligne Design: et `V1_RAW_MARKDOWN_URLS` sans commentaire, relevés par archiman, antérieurs à la story.

## D32 : retire-robusta-design, `boss new story retire-robusta-design until design`

- Requête : `boss new story retire-robusta-design until design`, branche `epic/robusta-v2`, mode rloq. Nicolas l'a demandée comme `boss prepare retire-robusta-design` ; la story n'existait pas, prepare l'aurait refusée.
- Arrêt retenu : celui de prepare, comme en D30, design approuvé par boss si aucune entrée `ask` n'est en attente, sinon DRAFT. Confidence: high.
- Lock : non évalué, aucun code dans ce run.
- Story : storyman, depuis la ligne « story à écrire » de B5. OQ-RETIREDESIGN-1 `ask` (tout supprimer ou garder le brief `prompt.md`), gardée en attente ; OQ-RETIREDESIGN-2 signée `lgtm (storyman)` (la fixture de `netlify-ignore.spec.ts` passe sur `apps/intel-demo`), ne contredit aucun AC. Commit `6571829`.
- Brainstorm : bsman, aucune entrée. AC-3 cite d58e879, déjà sur `main` ; AC-4 découpé en trois AC testables. Commit `1c4aebb`. `storyman update avec brainstorm` : AC-RETIREDESIGN-1 à 6, OQ-RETIREDESIGN-2 pliée. Commit `45a0bf0`.
- Design : designman, aucune entrée ; fold sans objet, le design ne porte aucune Resolution. Contrôle : AC-RETIREDESIGN-1 à 6 cités mot pour mot, `## Boundaries` rempli.
- Conséquence rloq : OQ-RETIREDESIGN-1 en attente, le design reste DRAFT. À la réponse de Nicolas, `boss retire-robusta-design` reprend en Phase 5.

## D33 : retire-robusta-design, `boss retire-robusta-design`

- Requête : `boss retire-robusta-design`, branche `epic/robusta-v2`, mode rloq. Reprise du run D32, arrêté au design DRAFT sur OQ-RETIREDESIGN-1.
- Réponse : OQ-RETIREDESIGN-1 résolue par Nicolas contre la Proposition : le brief est gardé. Nom retenu par boss : `documentation/author-brief.md`, contenu identique à l'octet, déplacé par `git mv`. Confidence: high.
- `storyman update` plie la réponse : titre et Contexte, AC-RETIREDESIGN-1 (`v0/` et `uploads/` supprimés sans copie), 2 (`documentation/author-brief.md` ne nomme pas `apps/robusta-design`) et 3 (brief identique à `d58e879:apps/robusta-design/prompt.md`, `git log --follow` jusqu'à d58e879) réécrits. Aucune nouvelle entrée. Commit `5ce4cef`.
- Brainstorm non mis à jour : il suit l'ancienne Proposition ; document jetable, la story fait foi.
- `designman update` : Goal, Boundaries, R-RETIREDESIGN-42 (déplacement à l'octet) et nouveau R-RETIREDESIGN-43 (story livrée cite d58e879 pour `v0/` et `uploads/`). Aucune nouvelle entrée. Contrôle boss : AC-RETIREDESIGN-1 à 6 cités mot pour mot, `## Boundaries` rempli. APPROVED, validated by boss.
- Lock : B3 et B4 ne portent aucune story, comme en D31. Rien ne retient B5. Confidence: high.
- codeman : `git mv` du brief vers `documentation/author-brief.md` (rename 100 %, `git log --follow` atteint d58e879), `git rm -r` de `v0/` et `uploads/`, `rm -rf` du dossier, fixture de `netlify-ignore.spec.ts` sur `apps/intel-demo/front/src/main.ts`. Commit `3331afc`.
- Vérifié par boss : test 731/731, lint vert, `yarn.lock` inchangé, `build:robusta` vert (34 pages vérifiées, 33 indexables).
- `storyman submit` : 5 étapes sur 5. docman (`CLAUDE.md`), archiman (`root.archi.md`), design IMPLEMENTED, story SUBMITTED citant d58e879, item 10 retiré de ROADMAP.md, epicman : retire-robusta-design en Fait, B5 ne garde que retire-robusta-v1. Commit de clôture exécuté par boss.
- Laissés à Nicolas : versions de Node incohérentes (`CLAUDE.md` 22.12, `README.md` 22.18, `.nvmrc` 22), relevées par docman ; paragraphe Overview de `root.archi.md` lu comme de l'historique, relevé par archiman.

## D34 : retire-robusta-v1, `boss new story retire-robusta-v1 until design`

- Requête : `boss new story retire-robusta-v1 until design`, branche `epic/robusta-v2`, mode rloq. Nicolas l'a demandée comme `boss prepare retire-robusta-v1` ; la story n'existait pas, prepare l'aurait refusée.
- Arrêt retenu : celui de prepare, comme en D32, design approuvé par boss si aucune entrée `ask` n'est en attente, sinon DRAFT. Confidence: high.
- Lock : non évalué, aucun code dans ce run.
- Story : storyman, depuis la ligne « story à écrire » de B5. OQ-RETIREV1-1 `ask` (les 18 brouillons jamais publiés supprimés sans copie ou gardés dans `documentation/`), en attente ; OQ-RETIREV1-2 (CV de `public/nicolas` sans copie) et 3 (`dev:dev` et `concurrently` supprimés) signées `lgtm (storyman)`, ne contredisent aucun AC. Commit `d769778`.
- Brainstorm : bsman. Nombres vérifiés (dakar 23 pages, 77 règles, 83 lignes de v1 map) ; essai d'install sans v1 : la racine hisse le Vite 5 de `services/scribe-intel-collector`, `packageExtensions` reste. OQ-RETIREV1-4 `ask` (projet Vercel v1 supprimé ou détaché avant le merge sur `main`), en attente ; OQ-RETIREV1-5 (imports non déclarés de dakar laissés tels quels) signée `lgtm (bsman)`. Commit `eb7096e`.
- `storyman update avec brainstorm` : AC-3 à 6 précisés (`dev:robusta-v1`, `design-system.archi.md`, brouillons, Vite 5, deploy preview), OQ-2, 3 et 5 pliées. Commit `3adc8eb`.
- Design : designman, AC-RETIREV1-1 à 6 cités mot pour mot, `## Boundaries` rempli, 12 R-. OQ-RETIREV1-6 (`article-slug.spec.ts` garde sa table en littéraux lus à 6c57bc3) signée `lgtm (designman)`, pliée par `designman update`. Commit `3cc5888`.
- Conséquence rloq : OQ-RETIREV1-1 et 4 en attente, le design reste DRAFT. À la réponse de Nicolas, `boss retire-robusta-v1` reprend en Phase 5.

## D35 : retire-robusta-v1, `boss retire-robusta-v1`

- Requête : `boss retire-robusta-v1`, branche `epic/robusta-v2`, mode rloq. Reprise du run D34, arrêté au design DRAFT sur OQ-RETIREV1-1 et 4.
- Réponses de Nicolas, sur les Propositions : OQ-RETIREV1-1, les 18 brouillons v1 supprimés sans copie ; OQ-RETIREV1-4, projet Vercel v1 débranché ou supprimé avant le merge, fait le 2026-11-06, celui de dakar reste branché.
- `storyman update avec brainstorm` plie les deux réponses, entrées retirées, AC inchangés ; `designman update` passe les deux mentions au passé, aucun contrat ne change. Aucune nouvelle entrée. Commit `f186e29`.
- Contrôle boss : AC-RETIREV1-1 à 6 cités mot pour mot, `## Boundaries` rempli, aucune entrée `ask` en attente. APPROVED, validated by boss.
- Lock : retire-robusta-v1 est la seule story restante de B5, B3 et B4 ne portent aucune story à coder dans ce run. Confidence: high.
- codeman, choisi plutôt que tddman : suppressions et une table de test passée en littéraux, aucun comportement nouveau. Commit `f1fdcca` : `apps/robusta` supprimé (731 fichiers suivis, restes non suivis compris), 3 scripts et `concurrently` retirés, `yarn.lock` −855 lignes, `corpus-freeze.spec.ts` supprimé, `article-slug.spec.ts` en littéraux lus à 6c57bc3, cas v1 retiré de `netlify-ignore.spec.ts`, 4 commentaires en `6c57bc3:apps/robusta/…`, commentaire de `packageExtensions` seul réécrit. Confidence: high.
- Vérifié par boss : `yarn install --immutable` vert, test 717/717 (60 fichiers), lint vert, `_redirects` (77 règles) et `v1-url-map.generated.json` (83 lignes) identiques à l'octet à une build de HEAD prise avant le changement, rien sous `packages/` supprimé. Par codeman : `build:robusta` vert (34 pages, 33 indexables), `build:dakar` vert (23 pages), racine sur Vite 5.4.18, plugins TanStack sur Vite 8.3.2.
- `storyman submit` : 5 étapes sur 5. docman (`CLAUDE.md`, `README.md`, `apps/robusta-build/README.md`, `.cursor/rules/monorepo.mdc`), archiman (`root.archi.md`, `robusta-build.archi.md`, archi des 6 modules, en-têtes de 3 packages de robusta-build), design IMPLEMENTED, story SUBMITTED citant 6c57bc3, item 9 retiré de ROADMAP.md, epicman : B5 sorti d'À faire, B3 et B4 restent, epic non archivé.
- ROADMAP.md, phrase Vercel de la section Next : docman et storyman ne l'écrivent pas, AC-RETIREV1-4 la vise. Corrigée par boss par le skill roadmap, `apps/dakar` seul nommé. Confidence: high.
- Laissés à Nicolas : volet deploy preview d'AC-RETIREV1-6 après le push (verdict `build`, 77 règles servies) ; Contexte et deux lignes Hors scope de l'epic nomment encore `apps/robusta`, hors AC-4 (`epicman pyramid-v2-epic`) ; écarts antérieurs relevés par archiman (`pyramids-themes` sans client, imports non déclarés de dakar).
