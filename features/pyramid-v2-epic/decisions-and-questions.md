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
