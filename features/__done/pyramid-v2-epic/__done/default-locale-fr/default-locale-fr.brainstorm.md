# Brainstorm : Le français devient la Locale par défaut de robusta.build

**Date :** 2026-10-08
**Feature :** default-locale-fr
**Infix :** DEFAULTLOCALE
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Sources lues : la story (ACTIVE, OQ-DEFAULTLOCALE-2 répondue `lgtm (boss)`), `decisions-and-questions.md`, l'epic (À faire, décisions du 2026-10-06), `business-rules.md` et `ubiquitous-language.md` tels que commités, et dans `apps/robusta-build` : `src/routing/`, `src/seopyramids.config.ts`, `scripts/emit-v1-map.mjs` et `prerender-pages.mjs`, `src/routes/`, `src/router.tsx`, `NotFoundPage`, `NavigationFailure`, `ArticleView`, `NotesSection`, `src/page-data/` et leurs specs.

## Ce que la lecture du code établit

- Le changement tient en deux valeurs de `urlScheme` (`src/routing/scheme.ts`). Le reste les lit déjà : la table de routes et le prerender (`contentUrls`), `<html lang>` (`__root.tsx`), le flux de notes de `/` et son lien « all articles », `blogConfig`. AC-1 à AC-4 et les deux premiers cas d'AC-6 suivent sans autre code.
- La racine de la Site configuration écrit `defaultLocale` et `otherLocales` en dur, et rien ne la lit.
- Le piège de la v1 map est confirmé par simulation sur le corpus réel. Régénérée avec `fr` par défaut sans autre changement, elle passe de 82 à 87 lignes : 19 adresses v1 perdues (`/learn/fr/…`), 24 inventées (`/learn/en/…`). Quatre endroits de `v1-url-map.ts` décrivent v1 avec les Locales du schéma v2 : la liste des Locales de `v1UrlMap`, `v1Path`, `articleRows` et `tagRows`.
- Avec les Locales de v1 figées (`en` par défaut, `fr`), la même simulation rend 82 lignes, mêmes `from` et même issue dans le même ordre, et chaque destination permanente est une URL que le site construit.
- Les six traductions de d5d763d sont écartées à la lecture du corpus (`published: false`) : ni l'index, ni la table de routes, ni `findTranslation` ne les voient. Avec `fr` par défaut, le site compte 21 URL de contenu : 7 sans marqueur, 14 sous `/l/en`.
- Texte de page encore anglais : `NotFoundPage` (aussi `defaultNotFoundComponent` du router), la fin d'`ArticleView` (« Filed in », « Also in », l'`aria-label` « Ways on from this article »), `NavigationFailure` (`defaultErrorComponent`), le placeholder de `/`, la chrome de `NotesSection`, `RoutePlaceholder`, le titre du site.

---

## Challenge des Acceptance Criteria

- AC-DEFAULTLOCALE-1 : testable (dérivation `urlSet`, fichiers prérendus, `check-route-table`), suffisant, en langage métier.
- AC-DEFAULTLOCALE-2 : testable et suffisant ; le compte de 21 URL tient la non-régression du corpus.
- AC-DEFAULTLOCALE-3 : testable sur le HTML prérendu. `404.html` est un seul document : servi pour une adresse inconnue sous `/l/en`, il déclare `fr` lui aussi. C'est conforme, aucun test ne doit y attendre `en`.
- AC-DEFAULTLOCALE-4 : testable. Insuffisant : trois articles français pour quatre places, rien n'interdit de compléter par un article anglais (P2).
- AC-DEFAULTLOCALE-5 : testable par comparaison avec la map commitée, et c'est lui qui attrape le piège. Insuffisant sur la langue de destination d'une adresse v1 non marquée qui menait à des pages anglaises (P4).
- AC-DEFAULTLOCALE-6 : testable, mais trois cas indépendants dans un seul AC : un échec ne dit pas lequel. À scinder en trois. Le cas `web` a son miroir français, `theory` (P3).
- Manque : aucun AC ne porte la Resolution d'OQ-DEFAULTLOCALE-2 (P5).

Cas limites métier proposés à storyman :

- P1 : Given les six traductions françaises non publiées, When le site est construit, Then aucune n'a d'adresse, aucune n'apparaît dans la section de notes de `/`, aucun article anglais ne s'y lie par « Also in », et le site compte toujours 21 URL de contenu.
- P2 : Given trois articles français publiés et une section de notes de quatre places, When un visiteur ouvre `/`, Then elle liste les trois articles français et aucun article anglais.
- P3 : Given `theory`, une category que seuls des articles français revendiquent, When le site est construit, Then `/articles/c/theory` répond 200 et `/l/en/articles/c/theory` répond 404.
- P4 : Given une adresse v1 non marquée qui menait à des pages anglaises, `/learn` ou `/learn/tag/web`, When la v1 map est régénérée, Then elle mène à la page anglaise encore publiée, `/l/en/articles` et `/l/en/articles/c/web`, pas au blog roll français.
- P5 : Given la page 404 et la fin d'une page article, article anglais sous `/l/en` compris, When un visiteur les lit, Then leur texte est en français et se déclare en français ; le nom de langue du lien de traduction reste écrit dans sa propre langue.

Business Rules : aucune nouvelle. La story est la première des deux étapes vers BR-PYRAMID-11 (« robusta.build must have no locale other than French ») ; `en` la viole encore jusqu'à translate-english-articles, ce que l'epic consigne déjà. BR-PYRAMID-10 tient (les traductions restent non publiées), BR-PYRAMID-8 aussi (le texte français de la 404 et de la fin d'article est celui du site), BR-PYRAMID-7 aussi (tout est calculé au build).

---

## 1. Rôle produit

Donner aux pages françaises leur adresse définitive avant que go-live ouvre l'indexation : `fr` Locale par défaut sans marqueur, `en` seule autre Locale.

Ce n'est pas : traduire ou dépublier les articles anglais (translate-english-articles), servir une redirection (restore-v1-urls), réécrire le texte de `/`, des pages de liste ou des métadonnées (robusta-landing-page, blog-rolls, seo-excellence), modifier `@robusta/pyramids-routing` ou `@robusta/pyramids-content`.

**Décision (autonome):** le périmètre de la story, plus le texte de la 404 et de la fin de page article (OQ-DEFAULTLOCALE-2).

Rationale : la Locale par défaut est une valeur que le site fournit aux deux packages, aucun n'a à bouger.

---

## 2. Public cible

- L'éditeur (Nicolas), qui veut des adresses définitives.
- Les items en aval : translate-english-articles publie à l'adresse finale, seo-excellence calcule ses balises sur `fr` sans marqueur, restore-v1-urls part de la map régénérée.
- Lecteurs et crawlers, à partir de go-live seulement : le site est en `noindex`.

**Décision (autonome):** aucune transition côté visiteur.

Rationale : `noindex` et aucune redirection ; un ancien `/l/fr/…` qui répond 404 ne coûte rien aujourd'hui.

---

## 3. Problème central

Le site est français depuis le 2026-10-06 mais déclare `en` par défaut : chaque page française porte `/l/fr`. Une adresse changée après go-live coûte une redirection et du référencement ; avant, rien.

**Décision (autonome):** faire le changement seul, sans attendre les traductions.

Rationale : chaque traduction publiée ensuite paraît directement à son adresse finale.

---

## 4. Proposition de valeur

Options considérées :

- Maintenant, avant translate-english-articles : gratuit ; 14 URL anglaises passent sous `/l/en` jusqu'à leur remplacement.
- Après translate-english-articles : les traductions paraîtraient d'abord sous `/l/fr`, puis changeraient d'adresse.
- À go-live : le site n'a aucun mécanisme de redirection (décision du 2026-10-06).

**Décision (autonome):** maintenant, dans l'ordre de l'epic (item 1 avant l'item 2).

Rationale : la seule option où aucune adresse ne change deux fois.

---

## 5. Périmètre fonctionnel

Dedans :

- les deux valeurs de `urlScheme` ;
- la racine de la Site configuration lue du schéma, comme `blogConfig` ;
- la v1 map : Locales de v1 figées, puis régénération ;
- le texte français de `NotFoundPage` et de la fin d'`ArticleView`, `aria-label` compris ;
- les specs qui écrivent en dur `/l/fr`, `en` par défaut ou « Filed in » ;
- les trois sections du README que la story nomme.

Dehors : `NavigationFailure` (OQ-DEFAULTLOCALE-3), la chrome et les dates courtes anglaises de la section de notes (robusta-landing-page), `RoutePlaceholder` (blog-rolls), titre et description du site (seo-excellence), l'entrée `Canonical URL` du glossaire (item 8 de l'epic).

**Décision (autonome):** la racine de la Site configuration lit `urlScheme` au lieu d'être corrigée en dur.

Rationale : deux sources pour une valeur finissent par diverger ; rien ne la lit, donc rien ne casse.

---

## 6. Fonctionnalités clés

### Feature : `fr` Locale par défaut

Capability : les pages françaises sont servies sans marqueur, les anglaises sous `/l/en` ; `/l/fr/…` n'est plus construit et répond 404, comportement livré par tanstack-start-migration. Les liens de traduction suivent, `articleUrl` lisant le schéma.

Acceptance Criteria : AC-DEFAULTLOCALE-1, AC-DEFAULTLOCALE-2, AC-DEFAULTLOCALE-6 ; P1 et P3 proposés.

Test Approach : spec `migrated-corpus` sur les 21 URL attendues, réécrites depuis les AC ; `check-route-table` au build, qui tient le prerender contre la dérivation, donc aucun fichier sous `dist/client/l/fr` ; spec `article-page` pour la paire yield farming.

---

### Feature : `<html lang>` des documents

Capability : tout document sans marqueur, `/` et `404.html` compris, déclare `fr` ; sous `/l/en`, `en`. Aucun code : `__root.tsx` lit déjà la Locale par défaut du schéma.

Acceptance Criteria : AC-DEFAULTLOCALE-3.

Test Approach : assertion sur le HTML prérendu de `index.html`, `404.html` et d'une page sous `/l/en`.

---

### Feature : notes de `/`

Capability : la section de notes lit les articles de la Locale par défaut, son lien « all articles » mène à `/articles`. Aucun code au-delà du schéma.

Acceptance Criteria : AC-DEFAULTLOCALE-4 ; P2 proposé.

Test Approach : spec `notes-feed` (trois articles français, aucun anglais), spec `NotesSection` (lien vers `/articles`).

---

### Feature : v1 map régénérée

Capability : les adresses v1 se calculent avec les Locales de v1, `en` par défaut et `fr`, figées dans `v1-url-map.ts` comme le reste de l'inventaire v1 (`V1_DECLARED_CATEGORY_PATHS`, `V1_TAG_URLS`). Seules les destinations lisent le schéma v2. Une ligne garde la langue de sa source : une adresse v1 non marquée mène à la page anglaise tant qu'elle est publiée, `/learn/fr/…` à la page française.

Options considérées :

- Dériver les adresses v1 du schéma v2 : le piège, 87 lignes.
- Figer les Locales de v1 : 82 lignes, vérifié par simulation.
- Pour les tags, destination dans la Locale par défaut v2 : `/learn/tag/web` mènerait au blog roll français, faute de category `web` française.

**Décision (autonome):** figer les Locales de v1 ; les lignes de tag prennent la Locale par défaut de v1, `en`.

Rationale : une adresse v1 est un fait passé, indépendant de la configuration du site v2, et une ligne doit mener au même contenu, pas à un blog roll dans une autre langue.

Acceptance Criteria : AC-DEFAULTLOCALE-5 ; P4 proposé.

Test Approach : une spec compare les paires (`from`, issue) de la map régénérée à celles de la map commitée avant le changement, 82 dans l'ordre ; une autre exige que chaque destination permanente appartienne à l'ensemble d'URL construit. La spec existante « only the French ones twice » échoue si le piège revient. À la revue, le diff du JSON ne touche que les `to` et l'en-tête.

---

### Feature : texte français de la 404 et de la fin de page article

Capability : `NotFoundPage` et la fin d'`ArticleView` (« Filed in », « Also in », `aria-label`) passent en français sur toutes les pages article, anglaises comprises. Le bloc de fin porte `lang="fr"`, pour que le texte français d'une page anglaise soit déclaré comme tel. Le nom de langue du lien de traduction reste écrit dans sa propre langue (« English », « français »), comme aujourd'hui.

Options considérées :

- Texte qui suit la Locale de l'article : un dictionnaire à deux Locales pour une Locale que l'item 2 retire.

**Décision (autonome):** texte français constant, `lang="fr"` sur le bloc de fin.

Rationale : un attribut plutôt qu'un mécanisme de traduction, sur des pages anglaises non indexées et en sursis.

Acceptance Criteria : aucun dans la story ; P5 proposé.

Test Approach : specs `NotFoundPage` et `ArticleView` (texte, `lang` du bloc de fin).

---

## 7. Cas limites critiques

P1 à P5, au § Challenge des Acceptance Criteria.

**Décision (autonome):** aucun autre cas.

Rationale : P4 est le seul qu'aucun test existant n'attraperait : une destination dans la mauvaise langue passerait telle quelle à restore-v1-urls. P1 est déjà tenu par le compte de 21 URL, P2, P3 et P5 par les specs listées.

---

## 8. Contraintes non fonctionnelles

- Aucun coût à l'exécution : tout reste prérendu, Netlify ne sert que des fichiers (BR-PYRAMID-7).
- `noindex` reste ; c'est go-live qui le lève.
- Aucune redirection, ni de `/l/fr/…` ni des adresses v1 : décision du 2026-10-06.
- Build inchangé : même nombre de pages, 21 URL de contenu plus `/` et `/404`.

**Décision (autonome):** aucune contrainte nouvelle.

Rationale : le changement déplace des adresses, il n'en ajoute ni n'en retire.

---

## 9. Dépendances externes

Netlify sert `404.html` pour `/l/fr/…` sans configuration : `netlify.toml` ne change pas. `Intl` (dates, nom de langue) est déjà utilisé.

**Décision (autonome):** aucune dépendance nouvelle.

Rationale : rien à brancher.

---

## 10. Risques majeurs

- Specs mises à jour par rechercher-remplacer, qui figeraient n'importe quelle sortie. Parade : les attentes viennent des AC et de la map commitée avant le changement, jamais de la sortie régénérée.
- Retour du piège de la v1 map : tenu par les deux specs de la feature et par « only the French ones twice ».
- Langues mêlées sous `lang="fr"` jusqu'aux items en aval : placeholder anglais de `/`, chrome et dates de la section de notes, pages de liste. Accepté : `noindex`, et chaque morceau a son item.
- Quand translate-english-articles videra `otherLocales`, les lignes v1 qui mènent à `/l/en/…` n'auront plus de destination construite. La spec « chaque destination permanente est construite » le signalera ; où elles mènent alors est la question que l'epic donne à restore-v1-urls.
- Documents écrits sur `en` par défaut : seo-excellence (sa Dep 2), robusta-landing-page (affinée en parallèle), le bloc HTTP de l'epic. Ils suivent à leur prochain passage, epicman au land.

**Décision (autonome):** aucun risque bloquant.

Rationale : chaque risque a sa parade ou son propriétaire en aval.

---

## 11. Boundaries

L'API HTTP de l'app `@robusta/robusta-build` est le bloc de la story ; rien à y ajouter. Les library API de `@robusta/pyramids-routing` et `@robusta/pyramids-content` ne changent pas, ni le sens des dépendances : l'app dépend des deux modules, `scripts/emit-v1-map.mjs` et `scripts/prerender-pages.mjs` lisent le package `routing` compilé. La Site configuration (`getSeoPyramidsConfig`) change de valeurs, pas de forme.

### library API of package `routing` in app `@robusta/robusta-build` — modified

Client code : les routes, `page-data`, `landing`, `scripts/emit-v1-map.mjs`, `scripts/prerender-pages.mjs`.

```ts
urlScheme    // modified : 'fr' Locale par défaut, 'en' seule autre Locale
v1UrlMap     // modified : adresses v1 calculées avec les Locales de v1, destinations avec urlScheme
V1_LOCALES   // new, nom indicatif : les Locales de v1, 'en' par défaut puis 'fr', figées
```

---

## Open Questions & Gaps

- OQ-DEFAULTLOCALE-3 : Le texte anglais de `NavigationFailure`, l'état d'erreur du router, passe-t-il aussi en français dans cette story ?
- Proposition : oui, ses deux lignes, avec la 404.
- Rationale : même défaut que la 404, une page `lang="fr"` en anglais ; la Resolution d'OQ-DEFAULTLOCALE-2 dit « rien d'autre » sans l'avoir nommé, et aucun item de l'epic ne le porte.
- Resolution: lgtm (boss)

---

## Next Steps

- `storyman refine default-locale-fr` : replier la Resolution d'OQ-DEFAULTLOCALE-2 en AC (P5), reprendre P1 à P4, scinder AC-DEFAULTLOCALE-6.
- Arbitrer OQ-DEFAULTLOCALE-3.
- `designman` : R- de la v1 map (Locales de v1 figées, langue de destination) et des deux specs de garde ; il peut partir sans attendre le refine.
- tddman, puis `storyman land`.
