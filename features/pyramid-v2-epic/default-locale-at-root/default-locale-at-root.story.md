# Story : la page anglaise à la racine, sans redirection

**Dernière mise à jour :** 2026-11-03
**Feature :** default-locale-at-root
**Infix :** ROOTLOCALE
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** servir la landing page anglaise à la racine du site, en 200 et à sa propre adresse, et le contenu anglais sans préfixe de Locale, **afin qu'**aucune redirection ni copie ne s'interpose entre un visiteur ou un moteur de recherche et la page canonique.

## Contexte & objectif

Depuis multilingual-site (LANDED le 2026-10-31, `fb4803b`), chaque page porte le préfixe de sa Locale, `en` comprise, et `/` répond 301 vers `/en` par l'unique règle de `netlify.toml`. Ce préfixe a été choisi par le brainstorm de multilingual-site, sans arbitrage humain, pour qu'un changement de Locale par défaut ne déplace aucune URL. Le 2026-11-01, Nicolas le refuse : la racine doit être la page anglaise, sans redirection ni copie, et c'est elle la canonical URL. La story passe en priorité.

La Locale par défaut se sert donc sans préfixe : `/` est la landing page `en`, le contenu anglais vit sous `/articles/…`, `fr` et `es` gardent `/fr` et `/es`. La règle est au registre : BR-PYRAMID-14, un site sert les pages de sa Locale par défaut sans marqueur de Locale dans leur URL. Aucune page n'est générée sous `/en` : `/en`, `/en/` et les adresses sous `/en/` reçoivent une redirection permanente (301) de l'hébergeur vers la même page sans préfixe. Prix accepté : changer un jour de Locale par défaut déplacera des URL. Écarté : un rewrite 200 de `/` vers `/en`, qui crée une copie, ou sort la landing anglaise de son préfixe alors que ses articles y restent. Le site est encore `noindex` : aucun moteur ne garde d'adresse `/en…`.

Le glossaire décrit déjà ce schéma : `Locale` laisse la Locale par défaut sans marqueur, `Canonical URL` fait rediriger une Locale par défaut marquée. BR-PYRAMID-1 tient sans discriminant de Locale, une Locale ne pouvant valoir ni le content root ni l'asset root. Un seul jeu de routes sert toutes les Locales, la Locale par défaut lue par l'absence de préfixe ; la forme du segment revient au design. Une adresse `/en…` se lit comme la page anglaise sans préfixe, sa forme canonique, ce qui fixe la cible des 301. Les jumeaux `.html` que l'hébergeur sert en 200 pour toute page restent hors périmètre : le README les accepte déjà (§One URL per page), et le canonical link qui les traite revient à seo-excellence. La story ne rouvre pas multilingual-site ; hreflang et x-default restent à seo-excellence.

## Acceptance Criteria

- AC-ROOTLOCALE-1 : Given le site publié sur un deploy Netlify, When un visiteur ou un crawler ouvre `/`, Then il reçoit en 200, sans aucune redirection, la landing page anglaise, `lang="en"`, avec sa page copy RB Compound ; `/` est la seule adresse que le site construit pour cette page, le jumeau `.html` de l'hébergeur mis à part, et `/fr` et `/es` restent les landing pages française et espagnole.
- AC-ROOTLOCALE-2 : Given le corpus publié, When le site est construit, Then le contenu anglais est servi sans préfixe et le français sous `/fr` : `/articles/c/privacy/leaving-gmail` et `/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répondent 200, le site compte toujours 30 URL de contenu, 14 sous `/articles/…` et 16 sous `/fr/articles/…`, et aucune page n'est publiée sous `/en` : chaque page anglaise n'existe qu'à une adresse construite par le site, jumeau `.html` de l'hébergeur mis à part.
- AC-ROOTLOCALE-3 : Given une ancienne adresse anglaise préfixée, When un visiteur ouvre `/en`, `/en/` ou `/en/articles/c/blockchain`, Then il reçoit une redirection permanente vers la même page sans préfixe, `/` ou `/articles/c/blockchain`, servie par l'hébergeur.
- AC-ROOTLOCALE-4 : Given une page du site, When un visiteur suit ses liens, Then chaque lien vers une page anglaise mène à sa forme sans préfixe : le wordmark d'une page anglaise et le lien « tous les articles » de `/` mènent à `/` et `/articles`, le lien anglais de l'en-tête de `/fr/articles/c/blockchain` à `/articles/c/blockchain` et celui de `/es` à `/`, `quitter-gmail` lie `leaving-gmail` sous `/articles/…` ; dans l'autre sens, `/` lie `/fr` et `/es`, et `leaving-gmail` lie `/fr/articles/c/privacy/quitter-gmail`, que la page soit prérendue ou atteinte par une navigation client depuis `/fr` ; enfin la page 404 comme l'état d'échec de navigation renvoient vers `/`.
- AC-ROOTLOCALE-5 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes 82 adresses v1 dans le même ordre avec la même issue (67 permanentes, 5 Gone, 10 sans destination), et seules changent les destinations anglaises, `/learn` menant à `/articles` et `/learn/fr/blockchain` toujours à `/fr/articles/c/blockchain`, et la raison de la ligne `/`, qui reste sans destination et dit que le site v2 sert sa landing page anglaise à cette même adresse.
- AC-ROOTLOCALE-6 : Given les cas limites, When le site est construit puis servi, Then `theory`, revendiquée par `fr` seule, n'a de page que sous `/fr`, `/articles/c/theory` répond 404, `/en/articles/c/theory` y mène par la 301 de l'hébergeur puis reçoit la page 404 anglaise, et le lien anglais de `/fr/articles/c/theory` mène à `/` ; `/es/articles` répond 404 tant qu'aucun article espagnol n'est publié ; `/fr/` et `/es/` reçoivent toujours la redirection permanente de l'hébergeur vers la forme sans barre finale, et `/` n'en reçoit aucune ; une adresse sous `/l/` ou une Locale que le site ne déclare pas, comme `/de`, reçoit la page 404 anglaise ; sous `vite dev`, `/` sert aussi la landing page anglaise, et `/en` comme `/en/articles` reçoivent la page 404 anglaise, la 301 n'existant que chez l'hébergeur.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses.

  routes · page-data · chrome · landing · components · scripts
      │
      └──library──→  package `url-scheme` in package `routing` [modified]
```

Hors figure, autre zoom : l'HTTP API de l'app, servie par Netlify.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /` — 200, la landing page `en`, sa canonical URL · avant : 301 vers `/en`, règle de `netlify.toml`
- `GET /articles…` — 200, les 14 URL de contenu `en` · avant : 404, servies sous `/en/articles…`
- `GET /en` et `GET /en/…` — 301 de l'hébergeur vers la même page sans préfixe ; une page absente en anglais finit en 404 · avant : 200
- `GET /fr`, `/es`, `/fr/articles…`, et `/{fr|es}/` en 301 de l'hébergeur — inchangés
- `GET /l/…`, `/de`, `/es/articles…` et toute adresse inconnue — 404, la page 404 anglaise, retour vers `/` · avant : retour vers `/en`

### library API of package `url-scheme` in package `routing` — modified

```ts
type UrlScheme, PageUrl // unchanged

/** no prefix for the default Locale: `/`, `/articles…` */
function buildUrl(scheme: UrlScheme, page: PageUrl): string;

/** an unprefixed path is a page of the default Locale; a path marked with
 *  the default Locale reads as that same page, its canonical form unmarked */
function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;
```

## Documentation updates

- change l'introduction, §Routing, §The route table, §One URL per page, §The v1 mapping, la commande `dev` de §Commands et §Deployment dans `apps/robusta-build/README.md` — why: `en` sans préfixe, `/` en 200 sans règle de redirection, `/en…` en 301 vers la page sans préfixe, destinations `en` de la v1 map.
- change `apps/robusta-build/robusta-build.archi.md`, `apps/robusta-build/src/routing/url-scheme/url-scheme.archi.md` et `root.archi.md`, via archiman — why: ils disent chaque Locale préfixée et `/` en 301 vers `/en`.
- change l'en-tête de `apps/robusta-build/netlify.toml` — why: il décrit la règle de `/`, retirée.
- change « chacune sous son préfixe » dans `CLAUDE.md` — why: la Locale par défaut n'en porte plus.

## Dependencies

- Dep 1 : multilingual-site, dont la story change le schéma : LANDED le 2026-10-31 (`fb4803b`) — levée.
- Débloque : glossary-refresh, dont AC-GLOSSARY-1, 2 et 7 imposent une Locale par défaut marquée et sont à réécrire ; la règle de Gap-GLOSSARY-1 tient, son exemple « `/` vers `/en` » devient faux.
- Débloque : blog-rolls, dont l'accueil du blog `en` passe de `/en/articles` à `/articles`, exemple de Gap-BLOGROLLS-5 compris ; à implémenter après cette story, les deux réécrivant les mêmes routes de listing.
- Débloque : seo-excellence, dont le contexte dit encore « toutes préfixées, `/` redirigeant vers `/en/` » ; les landing pages d'OQ-SEOEXCELLENCE-21 deviennent `/`, `/fr` et `/es`, et le x-default désigne la version `en` sans préfixe (OQ-SEOEXCELLENCE-22).
- Débloque : restore-v1-urls, dont la v1 map d'entrée change de destinations `en`.
