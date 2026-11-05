# Brainstorm : multilingual-site

**Date :** 2026-10-25
**Participants :** bsman (autonome)
**Infix :** MULTILINGUAL
**Source :** `features/pyramid-v2-epic/multilingual-site/multilingual-site.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Acquis, non rediscutés ici : OQ-MULTILINGUAL-1 à 4 de la story, et le prérequis qui rapatrie `pyramids-routing` et `pyramids-content` en packages du site (BR-PYRAMID-12), le design system restant un module (BR-PYRAMID-13).

## Challenge des Acceptance Criteria

Verdict par AC :

- AC-MULTILINGUAL-1 : testable sur la sortie de build (`check-route-table` compte déjà les fichiers), suffisant. La notation `/en/` des landing pages contredit la règle des URL du site, voir OQ-MULTILINGUAL-6.
- AC-MULTILINGUAL-2 : testable seulement sur un déploiement : la redirection est une règle Netlify, que ni vitest ni `vite dev` n'exécutent. Même réserve `/en/` que AC-1.
- AC-MULTILINGUAL-3 : testable, en langage métier. Insuffisant : il ne couvre que les trois landing pages, pas l'en-tête et le pied de page des pages d'article et de category (proposition P1).
- AC-MULTILINGUAL-4 : testable. Il manque le wordmark de l'en-tête, qui mène aujourd'hui à `/` (P2), et la contrepartie d'une page de blog roll au-delà de la première (P3).
- AC-MULTILINGUAL-5 : testable, mais « l'original change » n'est pas défini : quels changements rendent une traduction obsolète (P5, P6). Il ne dit rien d'une paire dont aucune version ne se déclare traduction, qui est l'état des huit paires actuelles (P4).
- AC-MULTILINGUAL-6 : testable et précis, rien à ajouter.
- AC-MULTILINGUAL-7 : testable. Il manque le cas d'une category qui gagne une Locale (P7).

Cas limites proposés à storyman :

- P1 : Given `/fr/articles/c/blockchain` ou un article français, When un visiteur le lit, Then l'en-tête et le pied de page sont la page copy française, sous `lang="fr"`.
- P2 : Given une page sous `/fr/`, When le visiteur clique le wordmark de l'en-tête, Then il arrive sur la landing page française, et non sur `/`, qui le mènerait à l'anglais.
- P3 : Given une page de blog roll au-delà de la première, `/fr/articles/p/2`, When le visiteur suit le lien anglais de l'en-tête, Then il arrive sur la première page du même blog roll en anglais si elle existe, sur la landing page anglaise sinon.
- P4 : Given deux versions publiées reliées par un translation identifier, dont aucune ne se déclare traduction de l'autre, When le site est construit, Then la build signale la paire comme non suivie en nommant les deux versions, et les deux restent publiées.
- P5 : Given un original dont seuls les tags, la date, la category ou l'image de couverture changent, When le site est construit, Then aucune de ses traductions n'est signalée obsolète.
- P6 : Given une traduction déclarée à jour, When son traducteur la corrige elle-même, Then elle reste à jour : la déclaration porte sur le texte de l'original.
- P7 : Given le premier article anglais publié dans la category `theory`, When le site est construit, Then `/en/articles/c/theory` existe avec un libellé de category anglais, et le lien anglais de `/fr/articles/c/theory` y mène ; sans libellé anglais fourni par la page copy, la build échoue en nommant la category et la Locale (BR-PYRAMID-8).

Aucune Business Rule nouvelle : BR-ROBUSTA-1 porte la politique, et « une traduction obsolète reste publiée » est une règle éditoriale déjà écrite dans la story.

---

## 1. Rôle du produit

**Décision (autonome):** la feature sert robusta.build en trois Locales préfixées et suit, à la build, la fraîcheur de chaque traduction. Elle n'est ni un outil de traduction, ni une détection de langue, ni le travail SEO multilingue (hreflang, x-default, sitemap : seo-excellence), ni l'écriture du contenu RB Compound.

**Rationale:** la story borne déjà ce périmètre ; le rappeler évite que le calcul des contreparties (axe 11) dérive vers hreflang.

---

## 2. Public cible

- L'éditeur, Nicolas, seul auteur et seul traducteur : c'est lui qui lit le signalement des traductions obsolètes.
- Les lecteurs internationaux de RB Compound, en anglais d'abord.
- Les crawlers, plus tard : le site sert aujourd'hui `noindex, nofollow` sur chaque page.

**Décision (autonome):** concevoir le signalement pour un éditeur unique qui lit la sortie de build, sans tableau de bord ni workflow de revue.

**Rationale:** un seul traducteur, 17 articles ; un outil de suivi serait sans lecteur.

---

## 3. Problème central

**Problème :** le site sert le français sans marqueur et l'anglais sous `/l/en`, alors que BR-ROBUSTA-1 fait de l'anglais la Locale par défaut ; et rien ne dit quand une traduction a décroché de son original.

**Décision (autonome):** traiter les deux ensemble, schéma préfixé et fraîcheur des traductions, comme la story le fait.

**Rationale:** passer à trois Locales multiplie les traductions ; la dérive silencieuse devient le risque principal du contenu.

---

## 4. Proposition de valeur

- Un schéma uniforme : chaque Locale a son préfixe, changer de Locale par défaut ne déplace plus aucune URL ; seule la cible de `/` change.
- Un signalement à la build, jamais une dépublication.
- Rien ne tourne à la requête : tout reste prérendu (BR-PYRAMID-7).

**Décision (autonome):** aucune alternative retenue, la story a tranché.

**Rationale:** le site étant `noindex`, déplacer toutes les URL maintenant ne coûte rien en référencement ; après go-live, ce serait une migration.

---

## 5. Périmètre fonctionnel

Dans le périmètre, en plus de la story :

- la contrepartie de chaque page dans chaque autre Locale, calculée à la build, que l'en-tête consomme et que seo-excellence réutilisera pour hreflang ;
- un ajout optionnel à l'API de `SiteHeader` dans le design system, voir Gap-MULTILINGUAL-5 ;
- le texte de la page 404 en anglais, son lien de retour menant à `/en`.

Hors périmètre : une 404 par Locale, la détection de langue, une commande de redéclaration (le signalement imprime la valeur à recopier), les articles espagnols.

**Décision (autonome):** la contrepartie calcule les seuls vrais équivalents ; le repli vers la landing page est une règle de l'en-tête, pas du calcul.

**Rationale:** hreflang ne doit lister que de vrais équivalents ; un calcul qui mêle le repli serait inutilisable par seo-excellence.

---

## 6. Fonctionnalités clés

### Feature : packages `routing` et `content` dans le site

**Capability :** le code des deux modules devient des packages de `apps/robusta-build`, sans changement de comportement ; les scripts Node pur l'atteignent par `compile:seams` (`tsconfig.routing.json`, sortie `.routing-dist/`), qui compile déjà `src/routing` et `src/content` pour eux.

**Acceptance Criteria :** AC-MULTILINGUAL-1 (partie clean checkout).

**Test Approach :** les 78 et 98 specs déplacées passent dans `yarn workspace @robusta/robusta-build run test` ; la build du commit intermédiaire sert les mêmes 30 URL et la même v1 map, comparées à l'état actuel.

---

### Feature : schéma préfixé

**Capability :** `buildUrl` préfixe toute Locale, la Locale par défaut comprise ; le discriminant `l` et la forme sans marqueur disparaissent ; l'arbre de routes passe de `articles/…` et `l/$locale/…` à `$locale/…`.

**Acceptance Criteria :** AC-MULTILINGUAL-1, AC-MULTILINGUAL-7.

**Test Approach :** specs de `buildUrl`, `parseUrl` et `canonical-round-trip` réécrites sur les formes préfixées ; `check-route-table` vérifie 14 URL sous `/en/`, 16 sous `/fr/`, aucune sous `/es/articles`, et les trois landing pages.

---

### Feature : redirection de `/`

**Capability :** `/` répond 301 vers la landing page anglaise, par une règle Netlify. Aucune page n'est prérendue à `/` : un `index.html` à la racine masquerait la règle.

**Acceptance Criteria :** AC-MULTILINGUAL-2.

**Test Approach :** une spec vérifie que la règle figure dans la configuration publiée et qu'aucun `index.html` n'est écrit à la racine ; un `curl` sur le branch deploy vérifie le 301 de `/` et le 404 de `/articles/c/blockchain` et `/l/en/articles`.

---

### Feature : page copy par Locale

**Capability :** la Site configuration porte un bloc de page copy par Locale, typé de sorte qu'une Locale incomplète ne compile pas ; en-tête, pied de page, sections, libellés de category, fin d'article et `<html lang>` suivent la Locale de la page.

**Acceptance Criteria :** AC-MULTILINGUAL-3, AC-MULTILINGUAL-4 (fin d'article) ; proposés : P1, P7.

**Test Approach :** specs de rendu de `LandingPage`, `Header`, `Footer` et `ArticleView` dans chaque Locale ; spec sur `/es` : aucune section de notes.

---

### Feature : sélecteur de Locale et versions d'un article

**Capability :** l'en-tête lie chaque autre Locale, nommée dans sa langue et marquée de son `lang`, vers la contrepartie de la page ou sa landing page ; un article lie toutes ses autres versions publiées, et non plus une seule (`findTranslation` rend aujourd'hui la première trouvée).

**Acceptance Criteria :** AC-MULTILINGUAL-4, AC-MULTILINGUAL-7 ; proposés : P2, P3.

**Test Approach :** specs du calcul des contreparties sur un corpus de fixture (article traduit, traduction sans original publié, category d'une seule Locale, blog roll page 2) ; spec de rendu de l'en-tête sur `leaving-gmail` et `quitter-gmail`.

---

### Feature : original et traduction obsolète

**Capability :** une traduction déclare, dans son frontmatter, la Locale de son original et l'empreinte du texte de cet original (titre, excerpt, corps) au moment où le traducteur l'a déclarée à jour. La lecture du corpus recalcule l'empreinte ; un écart produit un signalement, distinct des violations, qui nomme la traduction, son original et la nouvelle empreinte à recopier. Les huit traductions actuelles sont déclarées à jour dans le même changement.

**Acceptance Criteria :** AC-MULTILINGUAL-5, AC-MULTILINGUAL-7 ; proposés : P4, P5, P6.

**Test Approach :** specs de `readCorpus` sur des corpus de fixture : original modifié, métadonnées seules modifiées, traduction modifiée, paire non suivie, original non publié ; la build du site réel ne signale rien après la déclaration initiale.

---

### Feature : destinations de la v1 map

**Capability :** `v1UrlMap` produit les mêmes 82 lignes, destinations construites par le nouveau `buildUrl`.

**Acceptance Criteria :** AC-MULTILINGUAL-6.

**Test Approach :** `v1-url-map.spec.ts` et le diff de `v1-url-map.generated.json` : seules les destinations changent.

---

## 7. Cas limites critiques

**Décision (autonome):** P1 à P7 ci-dessus. Un cas reste assumé sans proposition : une traduction dont l'original est supprimé du corpus se comporte comme si l'original était non publié (AC-MULTILINGUAL-7), et le signalement nomme l'original manquant.

**Rationale:** supprimer ou dépublier un original produisent le même effet visible ; un seul comportement suffit.

---

## 8. Contraintes non fonctionnelles

- Aucune exécution à la requête (BR-PYRAMID-7) : contreparties, signalement et page copy sont résolus à la build.
- Empreinte calculée sur le contenu des fichiers, jamais sur l'historique git : une build depuis un clean checkout donne le même résultat (BR-PYRAMID-5), un clone superficiel de Netlify compris.
- Accessibilité : chaque lien de Locale porte `lang` et `hreflang`, comme le lien de traduction actuel d'`ArticleView`.
- Coût de build négligeable : 17 empreintes.

**Décision (autonome):** empreinte de contenu, plutôt qu'une date de mise à jour déclarée sur l'original.

**Rationale:** une date dépend d'une mise à jour manuelle que l'éditeur peut oublier, ce qui recrée la dérive silencieuse que la story veut supprimer ; l'empreinte ne dépend de rien.

---

## 9. Dépendances externes

- Netlify : la règle de `/` est la première redirection du site, alors que `netlify.toml` et le README affirment « no redirect rule » ; Pretty URLs reste activé. Le prérequis retire `packages/pyramids-routing` et `packages/pyramids-content` de la règle `ignore`.
- TanStack Start : un paramètre `$locale` en tête de l'arbre ; le prérendu ne construit que la liste dérivée, donc `/de` ou `/es/articles` répondent 404 sans garde dans le routeur.
- OQ-PYRAMID-4 de l'epic décide le texte de la page copy anglaise. La mécanique n'en dépend pas.

**Décision (autonome):** si OQ-PYRAMID-4 n'est pas tranchée à l'implémentation, la page copy anglaise traduit la page copy française actuelle, et `es` la traduit à son tour.

**Rationale:** la mécanique se livre et se teste sans attendre le texte ; réécrire trois blocs de page copy plus tard reste une édition de contenu.

---

## 10. Risques majeurs

- seo-excellence travaille en parallèle sur le même schéma : son design doit partir du schéma préfixé et du calcul de contreparties de cette story, pas de l'état actuel.
- `vite dev` n'applique pas les règles Netlify : `/` y répond 404. Raccourci accepté, le développeur ouvre `/en`.
- Bruit du signalement : toute édition du texte d'un original signale ses traductions, coquille comprise. Accepté : non bloquant, et une redéclaration coûte une ligne.
- Page copy espagnole traduite sans relecture native.

**Décision (autonome):** 301 pour `/`, et non 302.

**Rationale:** sans détection de langue, la redirection est fixe ; même si la Locale par défaut changeait, la landing page anglaise mise en cache resterait une page valide.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Packages of app `@robusta/robusta-build`. No loop.

  package `routes` [modified] ──library──→ package `chrome` [modified]
      │
      │ library
      ↓
  package `page-data` [modified]
      │                         │
      │ library                 │ library
      ↓                         ↓
  package `routing` [modified]  package `content` [modified]

  Build scripts reach `routing` and `content` by library too.
  `routing` and `content` import each other nowhere.
```

Hors figure, autre zoom : le module `@robusta/pyramids-design-system` [modified], dont `chrome` est le client.

**Décision (autonome):** le calcul des contreparties vit dans `page-data`, qui connaît déjà le schéma et le corpus (`findTranslation`) ; `routing` reste le schéma pur.

**Rationale:** mettre le calcul dans `routing` l'obligerait à connaître les translation identifiers, donc le corpus.

### HTTP API of app `@robusta/robusta-build` — modified

Ce qui diffère du bloc de la story :

- `GET /` — 301 vers la landing page anglaise, sans `index.html` à la racine
- `GET /{en|fr|es}` — la forme de la landing page dépend d'OQ-MULTILINGUAL-6
- `GET /404` et toute adresse inconnue — 404, `404.html` en anglais, `lang="en"`, retour vers `/en`

### library API of package `routing` in app `@robusta/robusta-build` — modified

- `UrlScheme` (existant) — modifié : plus de forme sans marqueur ; une Locale ne peut valoir ni le content root ni l'asset root
- `buildUrl`, `parseUrl` (existants) — produisent et lisent les formes préfixées ; `parseUrl` rejette `/articles…` et `/l/…`
- `LOCALE_DISCRIMINANT` (existant) — supprimé

### library API of package `content` in app `@robusta/robusta-build` — modified

- `ArticleEntry` (existant) — modifié : porte la Locale de son original et l'empreinte déclarée, quand l'article est une traduction
- `CorpusRead` (existant) — modifié : gagne la liste des traductions signalées, obsolètes ou non suivies, à côté de `violations`, qui seules font échouer la build
- empreinte du texte d'un article — nouveau : rend la valeur que le traducteur recopie

### library API of package `page-data` in app `@robusta/robusta-build` — modified

- contreparties d'une page — nouveau : pour une page et chaque autre Locale, l'URL du vrai équivalent ou rien
- `ArticlePage` (existant) — modifié : `translation` devient la liste des autres versions publiées ; chaque payload de page porte ses contreparties, que l'en-tête lit
- `getNotesFeed` (existant) — appelé par Locale, `/es` n'en demande pas tant qu'aucun article espagnol n'est publié

### library API of package `chrome` in app `@robusta/robusta-build` — modified

- `Header` (existant) — modifié : reçoit la Locale et les contreparties de la page, rend le sélecteur de Locale et la page copy de cette Locale
- `Footer` (existant) — modifié : rend la page copy de la Locale de la page

### library API of module `@robusta/pyramids-design-system` — modified

Client code : package `chrome`.

- `SiteHeader` (existant) — gagne une adresse d'accueil pour le wordmark, `/` par défaut
- `NavLink` (existant) — gagne une Locale optionnelle, rendue en `lang` et `hreflang`

---

## Open Questions & Gaps

- Gap-MULTILINGUAL-5: La story sort `@robusta/pyramids-design-system` du périmètre et ses Boundaries ne le listent pas, mais AC-4 et P2 le touchent : `SiteHeader` lie le wordmark à `/` en dur, que la story redirige vers l'anglais, et `NavLink` ne porte aucune Locale, donc un lien « Español » est prononcé dans la langue de la page par un lecteur d'écran.
- Proposition: deux ajouts optionnels à l'API de `SiteHeader`, une adresse d'accueil (`/` par défaut) et une Locale par lien ; le design system reste un module (BR-PYRAMID-13), ses autres usages ne changent pas ; storyman ajoute le bloc du module aux Boundaries de la story.
- Rationale: sans le premier ajout, cliquer le logo sur une page française mène à l'anglais ; contourner `SiteHeader` dans le site dupliquerait une surface du design system.
- Resolution: lgtm (boss)

- OQ-MULTILINGUAL-6: La landing page d'une Locale s'adresse-t-elle `/en` ou `/en/` ?
- Proposition: `/en`, sans barre finale, comme toute URL que `buildUrl` produit ; `/` redirige vers `/en`, et `/en/` reçoit le 301 que Netlify sert déjà vers la forme sans barre ; storyman réécrit AC-1, AC-2 et le bloc HTTP de la story.
- Rationale: le site n'a aucune URL canonique à barre finale (README, One URL per page) ; `/en/` ferait de la landing page la seule exception, et cette forme deviendra la Canonical URL que seo-excellence publie, difficile à changer après go-live.
- Resolution: lgtm

---

## Next Steps

- Nicolas arbitre Gap-MULTILINGUAL-5 et OQ-MULTILINGUAL-6.
- `storyman refine multilingual-site` : P1 à P7, le bloc du design system et la forme des landing pages.
- `designman` : noms de l'original, de l'empreinte et de la traduction obsolète pour `ubiquitous-language.md`, forme du frontmatter, code de la règle Netlify.
