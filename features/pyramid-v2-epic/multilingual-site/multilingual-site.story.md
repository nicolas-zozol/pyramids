# Story : robusta.build en trois langues, l'anglais par défaut

**Dernière mise à jour :** 2026-10-31
**Feature :** multilingual-site
**Infix :** MULTILINGUAL
**Status :** LANDED (2026-10-31, commit fb4803b)

## Story

**En tant qu'**éditeur de robusta.build, **je veux** servir le site en anglais, en français et en espagnol, chaque page sous le préfixe de sa Locale, et suivre les traductions de chaque article, **afin de** publier RB Compound pour un public international sans qu'une traduction dérive en silence de son original.

## Contexte & objectif

Le 2026-10-25, BR-ROBUSTA-1 remplace BR-PYRAMID-11 : robusta.build sert ses pages en `en`, Locale par défaut, `fr` et `es`, et sa landing page présente RB Compound, une offre de services en deux versions, open source et gratuite, ou complète et seulement avec un accompagnement payant. Toutes les Locales portent un préfixe, la Locale par défaut comprise, pour qu'un changement de Locale par défaut ne déplace plus aucune URL ; la story défait en partie default-locale-fr. En prérequis, `@robusta/pyramids-routing` et `@robusta/pyramids-content`, que seul ce site utilisait, sont devenus des packages du site (BR-PYRAMID-12).

## Livré

Prérequis en commit à part, `05cb2c5` ; design system `2346f83` ; site `fb4803b`. Site 455 tests, design system 87 ; lint, `tsc`, `build:deps`, `build:robusta` et `build:robusta-v1` verts.

### Requirements

- R-MULTILINGUAL-01 : le code de `packages/pyramids-routing/src` passe dans `src/routing/url-scheme/`, celui de `packages/pyramids-content/src` dans `src/content/corpus-reader/`, dans un commit à part et avant tout changement de schéma ; ce commit sert les mêmes 30 URL de contenu, le même corpus et la même v1 map qu'aujourd'hui (BR-PYRAMID-12).
- R-MULTILINGUAL-02 : leurs specs, 78 et 98, suivent leur code et passent dans `yarn workspace @robusta/robusta-build run test`.
- R-MULTILINGUAL-03 : les deux workspaces disparaissent : répertoires, dépendances `workspace:*` du site, étapes de `build:deps`, watchers `w:routing` et `w:content`, chemins de la règle `ignore` de `netlify.toml`, spécificateur `@robusta/pyramids-content` d'`importProtection`. Le design system reste la seule dépendance workspace du site (BR-PYRAMID-13). `routing.archi.md` et `content.archi.md` suivent leur code, inchangés, pour archiman.
- R-MULTILINGUAL-04 : `tsconfig.routing.json` inclut `src/routing/url-scheme` et `src/routing/counterparts.ts` ; les scripts importent `.routing-dist/…` et plus aucun module par son nom.
- R-MULTILINGUAL-05 : `url-scheme` et `corpus-reader` n'importent rien hors de leur répertoire ; le content root, la racine du corpus et les Locales ne s'écrivent que dans `src/routing/scheme.ts` et `src/content/corpus.ts`. Une spec échoue sur un import qui sort de l'un des deux répertoires.
- R-MULTILINGUAL-21 : `buildUrl` préfixe toute page de `/{locale}`, la Locale par défaut comprise ; la landing page d'une Locale est `/{locale}`, sans barre finale ; `l` n'est plus un discriminant (BR-ROBUSTA-1, BR-PYRAMID-1).
- R-MULTILINGUAL-22 : `parseUrl` lit les formes préfixées avec ses tolérances actuelles et rend `undefined` pour tout premier segment qui n'est pas une Locale connue.
- R-MULTILINGUAL-23 : `landingPages` rend les trois landing pages ; `urlSet` rend toujours la seule section de contenu, et une Locale autre que la Locale par défaut n'y a d'accueil de blog que si elle porte un article.
- R-MULTILINGUAL-24 : `urlScheme` déclare `en` par défaut, puis `fr` et `es` ; `Locale` est l'union de ces trois valeurs.
- R-MULTILINGUAL-25 : sept fichiers de route sous `src/routes/$locale/`, la landing et les six formes de contenu, remplacent `routes/index.tsx`, `routes/articles/**` et `routes/l/**` ; `prerender-pages` vérifie ces sept fichiers et prérend les landing pages, `/404`, puis les URL de contenu, et rien à `/`.
- R-MULTILINGUAL-26 : `/` répond 301 vers `/en` par la règle de `netlify.toml`, dont l'en-tête cesse d'affirmer « no redirect rule ». Une spec vérifie que la cible de la règle vaut `buildUrl` de la landing page de la Locale par défaut ; `check-route-table` échoue si `dist/client/index.html` existe.
- R-MULTILINGUAL-27 : `check-route-table` compare les pages HTML écrites, `404.html` exclue, aux landing pages plus les URL de contenu ; il attend un fichier de données par article, par flux de notes demandé et par page portant une `PageUrl`.
- R-MULTILINGUAL-28 : la page 404 est en anglais, texte constant, `lang="en"`, et son lien de retour mène à la landing page de la Locale par défaut.
- R-MULTILINGUAL-41 : `pageCopy` porte un bloc complet par Locale ; une Locale ou un texte manquant échoue au typecheck (BR-PYRAMID-8).
- R-MULTILINGUAL-42 : `<html lang>`, en-tête, pied de page, landing page, titres des placeholders, fin d'article, titre et description de repli de chaque page suivent la Locale de la page ; `siteTitle` et `mission` cèdent la place à `pageCopy[locale].head`.
- R-MULTILINGUAL-43 : un libellé de Category se lit par `getCategoryLabel` seul ; sans libellé dans la Locale de la page, la build échoue en nommant la Category et la Locale.
- R-MULTILINGUAL-44 : la page copy anglaise est écrite sur le positionnement RB Compound, offre de services aux équipes et responsables techniques qui produisent du logiciel avec des agents IA ; `fr` et `es` la traduisent section pour section, schémas compris, et la page copy française tournée vers les PME de Toulouse disparaît. Les noms d'agents, `rloq` et `APPROVED` restent tels quels dans les trois Locales.
- R-MULTILINGUAL-45 : la landing page d'une Locale demande le flux de notes de sa Locale, quatre au plus ; un flux vide ne rend aucune section, ce qui est le cas d'`es`.
- R-MULTILINGUAL-46 : `FlowDiagram` gagne `id`, optionnel, `approach` par défaut ; une spec du design system couvre l'`id` passé et le défaut (BR-PYRAMID-13).
- R-MULTILINGUAL-47 : `LandingPage` rend `Hero`, deux `FlowDiagram`, `PrinciplesList`, `NotesSection` et `CTA`, dans cet ordre ; chaque texte des deux schémas vient de `landing.openSource` ou `landing.complete`, aucun défaut du prototype ne s'affiche (R-LANDING-83, BR-PYRAMID-8). Le CTA reste le contact, e-mail et LinkedIn, qui mène à l'accompagnement.
- R-MULTILINGUAL-48 : chaque schéma décrit le workflow tel qu'il existe (§Code Routine de Compound), une étape par stade, ses agents nommés. Version open source : l'epic par epicman, la story par storyman, le design par designman, sa validation, DRAFT → APPROVED, puis l'implémentation test-first par tddman ; ni codeman, ni docman, ni archiman. Version complète : la story, le brainstorm par bsman, le design et sa validation, l'implémentation par tddman ou codeman, la documentation par docman et archiman. Le caveat du premier dit la version gratuite et pas encore publiée ; celui du second dit que boss enchaîne le pipeline, piloté par le slang comme rloq, et que cette version n'existe qu'avec un accompagnement personnalisé payant.
- R-MULTILINGUAL-49 : `PrinciplesList` reste, réorientée : chaque principe énonce une règle que le workflow applique dans ses deux versions, la documentation avant le code, une story par feature avec ses critères d'acceptation, des contrats écrits avant le code, un glossaire employé par chaque document ; jamais un résultat promis.
- R-MULTILINGUAL-50 : chaque `href` du rendu des trois landing pages, en-tête et pied de page compris, est le `mailto:` du contact, `contact.linkedIn` ou un chemin que `buildUrl` produit ; une spec le vérifie. Aucun lien ne mène donc à un dépôt ni à une page du plugin open source ; l'ajouter le jour de sa publication change la page copy et cette spec (item 15 de l'epic).
- R-MULTILINGUAL-61 : `counterpartsOf` applique les règles du bloc `routing` et ne rend que de vrais équivalents.
- R-MULTILINGUAL-62 : le loader racine obtient la Locale et les contreparties de chaque page par `parseUrl` puis `getCounterparts`, au prérendu ; le 404 n'en a aucune.
- R-MULTILINGUAL-63 : le wordmark mène à la landing page de la Locale de la page ; l'en-tête porte un lien par autre Locale, libellé par le `localeName` de cette Locale et marqué de son `lang` et `hreflang`, vers la contrepartie ou, à défaut, la landing page de cette Locale.
- R-MULTILINGUAL-64 : `ArticlePage.versions` liste toutes les autres versions publiées, tirées de `counterpartsOf` ; `ArticleView` les lie toutes, sa fin d'article rédigée dans la Locale de l'article.
- R-MULTILINGUAL-65 : `SiteHeader` gagne `homeHref` et `NavLink.locale`, optionnels ; une spec du design system couvre les deux, une autre le balisage inchangé sans eux.
- R-MULTILINGUAL-81 : une traduction déclare `original: { locale, fingerprint }` dans son frontmatter ; un article sans cette déclaration est son propre original.
- R-MULTILINGUAL-82 : l'empreinte suit la définition du bloc `corpus-reader`, calculée sur le contenu des fichiers seul (BR-PYRAMID-5).
- R-MULTILINGUAL-83 : une déclaration mal formée est une violation `malformed-original`, qui fait échouer la build.
- R-MULTILINGUAL-84 : `readCorpus` rend les notices `stale-translation`, `untracked-pair` et `missing-original` à part des violations ; aucune ne bloque ni ne dépublie un article (BR-PYRAMID-10 inchangée).
- R-MULTILINGUAL-85 : `check:translations` imprime chaque notice avec la valeur à recopier, une fois par build, et sort en 0.
- R-MULTILINGUAL-86 : les huit traductions actuelles déclarent leur original dans le même changement : les six fichiers français traduits par `a3408ff` déclarent `en`, `blockchain/yield-farming.md` et `javascript/why-migration-gatsby-next.md` déclarent `fr`. Une spec sur le corpus réel n'attend aucune notice.
- R-MULTILINGUAL-101 : `v1-url-map.generated.json` est régénéré ; mêmes 82 lignes, même ordre, mêmes issues, seules changent les destinations et les champs `defaultLocale` et `otherLocales` de l'en-tête.

### Acceptance Criteria

Les sept validés le 2026-10-31, AC-MULTILINGUAL-2 sur un deploy Netlify CLI (alias `dev`).

- AC-MULTILINGUAL-1 : Given le corpus publié et un clean checkout du dépôt, sans les workspaces `pyramids-routing` et `pyramids-content`, When le site est construit et testé, Then la build aboutit, et chaque URL de contenu commence par la Locale de sa page : `/en/articles/c/privacy/leaving-gmail` et `/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répondent 200, le site compte toujours 30 URL de contenu, 14 sous `/en/…` et 16 sous `/fr/…`, et `/en`, `/fr` et `/es` sont les trois landing pages, sans barre finale.
- AC-MULTILINGUAL-2 : Given le site publié sur un branch deploy, When un visiteur ou un crawler ouvre `/`, Then il reçoit une redirection permanente (301) vers `/en`, et `/en/`, `/fr/` ou `/es/` une redirection permanente vers la même adresse sans barre finale ; une ancienne adresse sans préfixe ou sous `/l/en`, comme `/articles/c/blockchain` ou `/l/en/articles`, répond 404, sans redirection. Les redirections sont servies par l'hébergeur : `vite dev` ne les applique pas.
- AC-MULTILINGUAL-3 : Given une page de chaque Locale, landing page, page de category ou article, When un visiteur l'ouvre, Then son document déclare `<html lang>` à la Locale du préfixe, et tout ce qu'il lit, en-tête, pied de page, sections et libellés de category, est la page copy de cette Locale, fournie par le site (BR-PYRAMID-8) : `/fr/articles/c/blockchain` et un article français sont entièrement en français. La landing page `/en` présente RB Compound, l'offre de services aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, et non plus une offre aux PME de Toulouse : deux schémas séparés montrent la version open source, epicman, storyman, designman et tddman, et la version complète, proposée seulement avec un accompagnement ; la page dit que la version open source n'est pas encore publiée, ne cite ni prix ni promesse de résultat, et son appel à l'action mène au contact e-mail et LinkedIn. `/fr` et `/es` en sont les traductions, mêmes sections et même propos, titre et description de la page compris. La section de notes de `/fr` liste les quatre articles français les plus récents, celle de `/en` les anglais, et `/es` n'en a pas tant qu'aucun article espagnol n'est publié.
- AC-MULTILINGUAL-4 : Given une page du site, When un visiteur la lit, Then le wordmark de l'en-tête mène à la landing page de sa Locale, jamais à `/` ; l'en-tête propose un lien vers chaque autre Locale, nommé et prononcé dans sa propre langue, qui mène à la même page dans cette Locale si elle existe, à sa landing page sinon, et une page de blog roll au-delà de la première, `/fr/articles/p/2`, mène à la première page du même blog roll. Une version d'article se déclare dans sa Locale, sa fin d'article est rédigée dans cette Locale, et elle lie chacune de ses autres versions publiées : `leaving-gmail` et `quitter-gmail` se lient l'un à l'autre, et depuis chacun le lien espagnol de l'en-tête mène à `/es`.
- AC-MULTILINGUAL-5 : Given une traduction déclarée à jour de son original, When le titre, l'excerpt ou le corps de l'original change ensuite, Then la build signale la traduction obsolète en nommant la traduction et son original, avec de quoi la redéclarer à jour, et elle reste publiée ; une fois redéclarée, le signalement cesse. Un changement des seuls tags, date, category ou image de couverture de l'original ne signale rien, et une correction de la traduction elle-même la laisse à jour. Chaque article connaît son original : lui-même s'il n'est la traduction d'aucun autre, sinon la version d'une autre Locale reliée par le même translation identifier. Les huit paires actuelles sont déclarées à jour dans le même changement : la build du corpus réel ne signale rien.
- AC-MULTILINGUAL-6 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes 82 adresses v1 dans le même ordre avec la même issue (67 permanentes, 5 Gone, 10 sans destination), seules les destinations changent, chacune une URL que le site construit dans la langue de la page v1 : `/learn` mène à `/en/articles`, `/learn/fr/blockchain` à `/fr/articles/c/blockchain`.
- AC-MULTILINGUAL-7 : Given les cas limites, When le site est construit, Then une category revendiquée par une seule Locale n'a de page que dans celle-ci (`theory` sous `/fr/…` seulement, `/en/articles/c/theory` répond 404, et depuis `/fr/articles/c/theory` le lien anglais de l'en-tête mène à `/en`) ; le premier article anglais publié dans `theory` crée `/en/articles/c/theory` sous un libellé anglais, vers lequel mène alors ce lien, et sans libellé anglais dans la page copy la build échoue en nommant la category et la Locale ; deux versions reliées par un translation identifier, dont aucune ne se déclare traduction de l'autre, sont signalées comme paire non suivie et restent publiées ; une traduction dont l'original n'est pas publié, ou a quitté le corpus, est servie dans sa Locale sans lien vers l'original, et le signalement nomme l'original manquant ; `/es/articles` répond 404 tant qu'aucun article espagnol n'est publié ; aucun lien des trois landing pages ne mène à un dépôt ou à une page du plugin open source tant qu'il n'est pas publié ; une adresse inconnue reçoit la page 404 en anglais, `lang="en"`, dont le lien de retour mène à la landing page anglaise.

## Boundaries

Packages de l'app `@robusta/robusta-build` [modified] :

```
  routes · page-data · chrome · landing · scripts de build
      │
      ├──library──→  package `routing` [modified]   url-scheme [new], counterparts [new]
      │
      └──library──→  package `content` [modified]   corpus-reader [new]
```

Hors figure, autre zoom : le module `@robusta/pyramids-design-system` [modified], dont `chrome` et `landing` sont les clients.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /` — 301 vers `/en`, unique règle `[[redirects]]` de `netlify.toml`, sans `force` · avant : 200, la landing page française
- `GET /{en|fr|es}` — 200, la landing page de la Locale, page copy RB Compound
- `GET /{en|fr|es}/` — 301 de l'hébergeur vers la forme sans barre finale
- `GET /{en|fr}/articles…` — 200, 30 URL de contenu, 14 et 16 · avant : `fr` sans marqueur, `en` sous `/l/en`
- `GET /es/articles…`, `GET /articles…`, `GET /l/…` et toute adresse inconnue — 404, `404.html` en anglais, retour vers `/en`

### library API of package `url-scheme` in package `routing` — new

- `UrlScheme`, `buildUrl`, `parseUrl`, `urlSet`, `validateArticles`, repris de `@robusta/pyramids-routing` ; `landingPages` nouveau ; `LOCALE_DISCRIMINANT` supprimé
- chaque URL commence par sa Locale ; la landing page d'une Locale s'écrit `/{locale}`, sans barre finale

### library API of package `routing` in app `@robusta/robusta-build` — modified

- `urlScheme` : `en` par défaut, puis `fr` et `es` ; `Locale`, l'union des trois
- `counterpartsOf`, nouveau, dans `counterparts.ts` : la même page dans chaque autre Locale, jamais de repli ; atteint par les handlers de `page-data` seuls

### library API of package `corpus-reader` in package `content` — new

- `readCorpus`, `readArticleBody`, `articleSlug`, `describeViolation`, `copyCorpusAssets`, `resolveAssetUrl`, repris de `@robusta/pyramids-content`
- `ArticleEntry.original` (`{ locale, fingerprint }`), violation `malformed-original`, `CorpusRead.translationNotices` (`stale-translation`, `untracked-pair`, `missing-original`) et `describeTranslationNotice`, nouveaux

### library API of packages `content`, `page-data` et Site configuration in app `@robusta/robusta-build` — modified

- `getTranslationNotices` nouveau, `findTranslation` supprimé
- `getCounterparts` nouveau ; `ArticlePage.versions` remplace `translation`
- `pageCopy: Record<Locale, PageCopy>`, lu par `getPageCopy` et `getCategoryLabel` seuls ; `siteTitle` et `mission` supprimés

### CLI API of app `@robusta/robusta-build` — new

- `check:translations` : une ligne par notice, exit 0 ; exit 1 sur une violation du corpus. `build` l'enchaîne.

### library API of module `@robusta/pyramids-design-system` — modified

- `SiteHeaderProps.homeHref`, `NavLink.locale` et `FlowDiagramProps.id`, optionnels ; sans eux, le balisage d'avant

## Décisions

- 2026-10-26 — La landing page d'une Locale est `/en`, sans barre finale ; `/en/` reçoit le 301 de l'hébergeur. Pourquoi : OQ-MULTILINGUAL-6, aucune URL de `buildUrl` ne finit par une barre.
- 2026-10-30 — Un libellé de Category manquant fait échouer la build par `check-route-table`, qui refuse toute page portant le repli Suspense `<!--$!-->` ; le log du prérendu nomme la Category et la Locale. Pourquoi : levée sous une frontière Suspense, l'erreur de `getCategoryLabel` est journalisée et la page sort en 200, `failOnError` ne la voit pas.
- 2026-10-30 — `counterparts.ts` est atteint par les handlers de `page-data`, `getCounterparts` et `getArticlePage`, jamais par du code client. Pourquoi : `ArticlePage.versions` vient de `counterpartsOf` (R-MULTILINGUAL-64).
- 2026-10-30 — L'état d'échec de navigation est en anglais constant, `lang="en"`, comme la 404, et les deux renvoient vers `/en`. Pourquoi : `PageCopy` n'a aucun champ pour lui ; `/en` évite le saut 301 et marche sous `vite dev`.
- 2026-10-30 — La route racine recharge son loader à chaque navigation client (`shouldReload`, `staleReloadMode: 'blocking'`). Pourquoi : sans cela, `<html lang>` et l'en-tête gardaient la Locale de la première page.
- 2026-10-30 — `untracked-pair` liste les versions d'un translation identifier qui ne déclarent pas d'original ; un cycle de déclarations ne signale rien. Pourquoi : lecture littérale de R-MULTILINGUAL-84 ; un cycle ne naît que d'une édition humaine.
- 2026-10-31 — AC-MULTILINGUAL-2 vérifié sur https://dev--robusta-build.netlify.app : `/` en 301 vers `/en`, `/en/`, `/fr/` et `/es/` en 301 vers la forme sans barre, `/articles/c/blockchain`, `/l/en/articles` et `/articles` en 404, la 404 servie en anglais.

## Documentation updates

- changed §Routing, §The route table, §One URL per page, §The v1 mapping et §Deployment de `apps/robusta-build/README.md` : formes préfixées, sans discriminant `l`, `/` en 301 comme seule redirection, nouvelles destinations de la v1 map.
- changed §Articles, §Commands, la composition de la landing page, le décompte des fichiers (34 HTML, 53 fichiers de données) et la mention de BR-PYRAMID-3 dans `apps/robusta-build/README.md`.
- changed l'exemple et la description de `SiteHeader`, avec `homeHref`, `NavLink.locale` et `FlowDiagram.id`, dans `packages/robusta-design-system/README.md`.
- changed le commentaire de `build:deps` et la première phrase de `README.md` (BR-PYRAMID-3, BR-PYRAMID-12).
- checked `CLAUDE.md` : rien de faux ni de manquant, inchangé.
- changed `root.archi.md`, `apps/robusta-build/robusta-build.archi.md` et `packages/robusta-design-system/design-system.archi.md`, via archiman ; created `src/routing/url-scheme/url-scheme.archi.md` et `src/content/corpus-reader/corpus-reader.archi.md`, qui remplacent `routing.archi.md` et `content.archi.md`.
- change la définition d'`untracked-pair` dans §Articles de `apps/robusta-build/README.md` — why: la notice liste les versions qui ne déclarent pas d'original, pas seulement quand aucune ne le fait.
- change les entrées `Locale`, `Canonical URL` (même passe que canonical-url-glossary), `Pyramid`, `Discriminant`, `Content source`, `Design system`, `Site` et `Site configuration` de `ubiquitous-language.md` — why: Locales toutes préfixées, `l` hors du schéma, schéma et corpus hors de la base partagée, BR-PYRAMID-3, `siteTitle` et `mission` supprimés.
- create les termes `Original`, `Stale translation`, `RB Compound` et `Module` dans `ubiquitous-language.md` — why: suivi des traductions, landing page, BR-PYRAMID-12 et 13.

## Dependencies

- BR-PYRAMID-12 et BR-PYRAMID-13, au registre depuis le 2026-10-25 — levée.
- Débloque : seo-excellence (hreflang, sitemap et Canonical URL sur `counterpartsOf` et `landingPages`), restore-v1-urls (destinations régénérées), go-live, ts-import-extensions (sa Dep 1).
