# Brainstorm : default-locale-at-root

**Date :** 2026-11-03
**Participants :** bsman (autonomous)
**Infix :** ROOTLOCALE
**Source :** `features/pyramid-v2-epic/default-locale-at-root/default-locale-at-root.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

OQ-ROOTLOCALE-1 (301 de l'hébergeur depuis `/en…`) et OQ-ROOTLOCALE-2 (BR-PYRAMID-14) sont pliées dans la story : ce brainstorm les tient pour acquises.

---

## Challenge des Acceptance Criteria

Verdict par AC :

- AC-ROOTLOCALE-1 : testable sur un deploy, en langage métier. Insuffisant sur deux points : l'en-tête de `/` n'est pas décrit, alors que le loader racine ne lit aujourd'hui aucune `PageUrl` à `/` et n'y donnerait aucun lien de Locale ; « seule adresse » ignore le jumeau `.html` que l'hébergeur sert pour toute page (Gap-ROOTLOCALE-3).
- AC-ROOTLOCALE-2 : testable au build, chiffré, suffisant. Même réserve sur « n'existe qu'à une adresse » (Gap-ROOTLOCALE-3).
- AC-ROOTLOCALE-3 : testable sur un deploy. Ne dit pas ce que reçoit une ancienne adresse `/en…` dont la forme sans préfixe n'existe pas.
- AC-ROOTLOCALE-4 : testable, précis. Couvre les liens de `fr` et `es` vers `en`, pas le sens inverse depuis une page sans préfixe, ni après une navigation client.
- AC-ROOTLOCALE-5 : testable par diff du JSON. Incomplet : la ligne v1 `/` garde son issue `none`, mais sa raison, « the v2 site redirects it to the landing page of its default Locale », devient fausse.
- AC-ROOTLOCALE-6 : testable, mais regroupe six cas limites ; à garder tel quel, chaque cas étant vérifiable seul. Ne dit pas ce que répond `/en…` sous `vite dev`, où la règle de l'hébergeur ne s'applique pas.

Cas limites métier proposés à storyman :

- E1, les liens de Locale d'une page sans préfixe : Given `/` et `/articles/c/privacy/leaving-gmail`, prérendues ou atteintes par une navigation client depuis `/fr`, When un visiteur lit l'en-tête, Then la page porte `lang="en"`, `/` lie `/fr` et `/es`, et l'article lie `/fr/articles/c/privacy/quitter-gmail`.
- E2, une ancienne adresse sans page anglaise : Given `theory`, revendiquée par `fr` seule, When un visiteur ouvre `/en/articles/c/theory`, Then il reçoit la 301 de l'hébergeur vers `/articles/c/theory`, puis la page 404 anglaise.
- E3, l'ancien préfixe en développement : Given le site sous `vite dev`, When on ouvre `/en` ou `/en/articles`, Then la réponse est la page 404 anglaise : la 301 n'existe que chez l'hébergeur, et aucune page n'est rendue sous `/en`.
- E4, la racine dans la v1 map : Given la v1 map régénérée, When on lit la ligne `/`, Then elle reste `none` et sa raison dit que le site v2 sert sa landing page anglaise à cette même adresse.

Aucune Business Rule nouvelle : la story applique BR-PYRAMID-14 et respecte BR-PYRAMID-1, BR-PYRAMID-7 et BR-ROBUSTA-1.

---

## 1. Rôle du produit

Le site v2 change de forme d'URL pour sa seule Locale par défaut. Ce n'est ni une nouvelle page, ni un changement de contenu, ni le travail SEO (hreflang, x-default, canonical link) qui reste à seo-excellence.

**Décision (autonome):** périmètre limité au schéma d'URL, aux liens qui en découlent, à la règle de l'hébergeur et à la v1 map régénérée.

**Rationale:** BR-PYRAMID-14 fixe la forme ; tout le reste découle de `buildUrl`.

---

## 2. Public cible

- Visiteurs et crawlers : une page anglaise à une adresse, sans redirection à l'entrée.
- L'éditeur (Nicolas) : la racine est la vitrine ; il a refusé `/` en 301.
- Les stories en attente : blog-rolls, glossary-refresh, seo-excellence et restore-v1-urls, qui récrivent leurs adresses `en` après celle-ci.

**Décision (autonome):** l'éditeur est le persona décisif ; le site est `noindex`, aucun moteur ne garde d'adresse `/en…`.

**Rationale:** sans audience indexée, le coût de migration est nul aujourd'hui.

---

## 3. Problème central

**Problème :** `/` répond 301 vers `/en`, donc la page d'accueil du site n'est pas à la racine et le premier contact passe par une redirection.

**Décision (autonome):** servir la Locale par défaut sans marqueur, comme la story le décide.

**Rationale:** BR-PYRAMID-14 l'impose ; c'est aussi ce que disent déjà les entrées `Locale` et `Canonical URL` du glossaire.

---

## 4. Proposition de valeur

- La racine est la landing page anglaise, en 200.
- Une seule forme construite par page ; l'ancienne forme `/en…` mène en 301 à la nouvelle.
- Rien ne tourne à la requête : tout reste prérendu (BR-PYRAMID-7), la règle de redirection est statique chez l'hébergeur.

**Options considérées :**

- Rewrite 200 de `/` vers `/en` : écarté par la story, il crée une copie.
- Statu quo préfixé : refusé par l'éditeur le 2026-11-01.

**Décision (autonome):** aucune alternative retenue.

**Rationale:** la story et BR-PYRAMID-14 ont tranché.

---

## 5. Périmètre fonctionnel

Dedans :

- `buildUrl` sans préfixe pour `en` ; `parseUrl` lit une adresse sans préfixe comme une page `en`.
- Le prerender écrit la landing anglaise à la racine et le contenu anglais sous `articles/` ; la garde de `check-route-table` qui refuse un `index.html` à la racine s'inverse.
- `netlify.toml` : la règle `/` → `/en` disparaît, deux règles 301 sans `force` la remplacent, `/en` vers `/` et `/en/*` vers `/:splat`.
- Le loader racine, l'en-tête, la page 404 et l'état d'échec de navigation, qui suivent `buildUrl`.
- La v1 map régénérée, ligne `/` comprise (E4).

Dehors :

- hreflang, x-default, canonical link : seo-excellence.
- Le service des redirections v1 : restore-v1-urls.
- Les jumeaux `.html` de l'hébergeur (Gap-ROOTLOCALE-3).
- Les routes de listing que blog-rolls récrit ensuite.

**Décision (autonome):** les deux règles 301 sont écrites à la main dans `netlify.toml`, et la spec qui vérifie aujourd'hui la règle de `/` vérifie leur cible contre `buildUrl`.

**Rationale:** deux lignes stables ne justifient pas un générateur ; la spec existante garde le lien avec le schéma.

---

## 6. Fonctionnalités essentielles

### Feature : la Locale par défaut sans préfixe dans le schéma

**Capability :** `buildUrl` émet `/`, `/articles…` pour `en` et `/fr…`, `/es…` pour les autres ; `parseUrl` lit les deux formes ; `landingPages` et `urlSet` suivent sans changer de signature.

**Acceptance Criteria :** AC-ROOTLOCALE-2, AC-ROOTLOCALE-6 (testables, suffisants)
- Proposed to storyman : E3.

**Test Approach :** tests unitaires vitest de `build-url`, `parse-url`, `url-set` et de l'aller-retour canonique ; `canonical-round-trip.spec.ts` couvre `/en…` lu puis reconstruit sans préfixe (OQ-ROOTLOCALE-4).

---

### Feature : la landing page anglaise à la racine

**Capability :** `/` sert en 200 la landing page `en`, prérendue à la racine de `dist/client` ; plus aucune page sous `/en`.

**Acceptance Criteria :** AC-ROOTLOCALE-1, AC-ROOTLOCALE-2 (« seule adresse » : Gap-ROOTLOCALE-3)
- Proposed to storyman : E1.

**Test Approach :** `check-route-table` sur la build (fichiers écrits, `index.html` attendu à la racine, aucun fichier sous `en/`) ; vérification HTTP sur un draft deploy Netlify (`npx netlify-cli deploy`, jamais `--prod`).

---

### Feature : la redirection de l'ancien préfixe

**Capability :** `/en`, `/en/` et `/en/…` reçoivent une 301 de l'hébergeur vers la même page sans préfixe ; une page qui n'existe pas en anglais finit en 404 après la redirection.

**Acceptance Criteria :** AC-ROOTLOCALE-3, AC-ROOTLOCALE-6
- Proposed to storyman : E2.

**Test Approach :** spec sur `netlify.toml` (règles, cibles égales à `buildUrl`) ; `curl -I` sur le draft deploy pour `/en`, `/en/`, `/en/articles/c/blockchain` et `/en/articles/c/theory`.

---

### Feature : les liens et le chrome

**Capability :** wordmark, liens de Locale, lien « tous les articles », fin d'article, page 404 et état d'échec de navigation mènent à la forme sans préfixe ; le loader racine reconnaît `/` et `/articles…` comme pages `en`, avec leurs counterparts.

**Acceptance Criteria :** AC-ROOTLOCALE-4 (insuffisant dans le sens `en` → autres Locales)
- Proposed to storyman : E1.

**Test Approach :** tests de composants (`chrome.spec.tsx`, `NotFoundPage`, `FailedNavigationPage`) et un test du loader racine sur `/` et sur un article sans préfixe ; contrôle des liens dans le HTML prérendu.

---

### Feature : la v1 map régénérée

**Capability :** `emit:v1-map` régénère les 82 lignes ; seules les destinations anglaises et la raison de la ligne `/` changent.

**Acceptance Criteria :** AC-ROOTLOCALE-5
- Proposed to storyman : E4.

**Test Approach :** `v1-url-map.spec.ts` et diff du JSON commité : mêmes sources, même ordre, mêmes issues.

---

## 7. Cas limites critiques

Les cas que les AC ne couvrent pas sont E1 à E4, dans le challenge ci-dessus. Vérifiés et sans risque :

- Aucune adresse v1 ne commence par `/articles` : la v1 map ne partage aucune source avec le contenu anglais sans préfixe.
- `/en/*` ne capture pas une adresse comme `/enterprise` : la règle porte sur le segment `en` entier.
- Un slug ou une Category égal à un code de Locale reste sous `/articles/…`, donc sans collision avec `/fr` ou `/es`.

**Décision (autonome):** E2 accepte deux réponses successives, 301 puis 404, plutôt qu'une règle par page.

**Rationale:** une règle générique suit le schéma ; une règle par page devrait suivre le corpus.

---

## 8. Contraintes non fonctionnelles

- Tout reste prérendu, aucune fonction Netlify (BR-PYRAMID-7).
- Le site reste `noindex`.
- Aucun coût : le draft deploy de la branche epic ne consomme pas de crédit ; aucun déploiement de production.
- La build chain aboutit depuis un clean checkout (BR-PYRAMID-5).

**Décision (autonome):** aucune contrainte nouvelle.

**Rationale:** la story change des chemins, pas l'architecture de service.

---

## 9. Dépendances externes

- Netlify : redirections de `netlify.toml` sans `force`, Pretty URLs actif (barre finale en 301, déjà en place).
- TanStack Router 1.170.41 et TanStack Start 1.168.60 : la table de routes doit servir une Locale sans segment.

**Décision (autonome):** aucune nouvelle dépendance ; la table de routes s'exprime avec la version installée (OQ-ROOTLOCALE-5).

**Rationale:** le routeur installé sait déjà décrire un segment absent.

---

## 10. Risques majeurs

- Technique : une table de routes qui accepte un segment de Locale optionnel peut rendre `/en/articles` ou `/de` en développement. Mitigation : E3, et le site ne prérend que la liste dérivée.
- Technique : le loader racine ne connaît que les adresses que `parseUrl` lit ; un oubli laisse `/` sans liens de Locale. Mitigation : E1.
- Planning : blog-rolls récrit les mêmes routes de listing ; l'epic l'ordonne après B0.
- Produit : changer un jour de Locale par défaut déplacera des URL. Prix accepté par la story.
- Configuration : une Locale dont le code vaudrait le content root casserait BR-PYRAMID-1. Aucun cas aujourd'hui (`articles`, `en`, `fr`, `es`) ; designman peut en faire une violation du schéma.

**Décision (autonome):** aucun risque bloquant.

**Rationale:** chaque risque a une mitigation testable dans la story.

---

## 11. Boundaries

La table de routes a deux formes possibles :

```
  Path A, one route set (chosen)       Path B, two route sets

  routes/<optional locale>/...         routes/...          → /, /articles...
      → /, /articles...                routes/$locale/...  → /fr, /es...
      → /fr, /es...                    7 route files twice
  7 route files, as today
```

**Décision (autonome):** un seul jeu de routes, la Locale par défaut lue par l'absence de préfixe (OQ-ROOTLOCALE-5). La forme exacte du segment revient à designman.

**Rationale:** dupliquer les sept fichiers dupliquerait aussi les gardes de `prerender-pages.mjs` et de `check-route-table.mjs`.

Vue d'ensemble, packages de l'app `@robusta/robusta-build` :

```
  Arrow = depends on, from client code to the API it uses.
  Nothing points into an app, no loop.

  package `routes` [modified]   package `chrome`     scripts [modified]
  package `page-data`           package `landing`    (prerender-pages,
  package `components`                                check-route-table)
      │                             │                     │
      └────────library──────────────┴──────library────────┘
                                    ↓
           package `url-scheme` in package `routing` [modified]
```

Hors figure, autre zoom : l'HTTP API de l'app, servie par Netlify.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /` — 200, la landing page `en` · avant : 301 vers `/en`
- `GET /articles…` — 200, les 14 URL de contenu `en` · avant : 404
- `GET /en`, `GET /en/…` — 301 de l'hébergeur vers la même page sans préfixe ; une page absente en anglais finit en 404 · avant : 200
- `GET /fr…`, `GET /es`, et la 301 de `/{fr|es}/` — inchangés
- `GET /l/…`, `GET /de`, `GET /es/articles…` et toute adresse inconnue — 404, la page 404 anglaise, retour vers `/` · avant : retour vers `/en`

### library API of package `url-scheme` in package `routing` — modified

Client code : `routing` (`counterparts`, `content-urls`, `v1-url-map`), `page-data`, `chrome`, `landing`, `components`, `routes` et le loader racine, les scripts sur `.routing-dist`.

```ts
type UrlScheme, PageUrl // unchanged

/** no prefix for the default Locale: `/`, `/articles…` */
function buildUrl(scheme: UrlScheme, page: PageUrl): string;

/** an unprefixed path is a page of the default Locale; a path marked with
 *  the default Locale reads as that same page, its canonical form unmarked */
function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;
```

`landingPages`, `urlSet` et `validateArticles` gardent leur signature ; leurs URL changent par `buildUrl` seul. Dépendances inchangées : `url-scheme` n'importe rien hors de son répertoire.

---

## Open Questions & Gaps

---

## Next Steps

- Arbitrer Gap-ROOTLOCALE-3.
- `storyman update default-locale-at-root avec brainstorm` : plier E1 à E4 dans les AC, la réponse à Gap-ROOTLOCALE-3 et les deux entrées signées.
- `designman` : la forme du segment de Locale optionnel dans TanStack Router, le loader racine sur `/`, l'inversion de la garde `index.html` de `check-route-table`, les deux règles de `netlify.toml`.
