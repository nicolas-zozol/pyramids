# Story : SEO excellence sur le site v2

**Dernière mise à jour :** 2026-11-04
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Status :** SUBMITTED (2026-11-04, commit 93f6770)

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que chaque page du site v2 déclare à un moteur de recherche exactement ce qu'elle est, dans sa Locale, et rien de plus, **afin que** le contenu soit trouvé pour ce qu'il vaut et que le site ne se lise jamais comme fabriqué pour des robots.

## Contexte & objectif

Avant cette story, la racine déclarait `noindex` et la page copy de sa Locale sur toute page : ni canonical URL, ni hreflang, ni sitemap, ni `robots.txt`, ni données structurées, cinq corps d'article avec un second titre de premier niveau, et `mandatoryKeywords` dans la Site configuration. Chaque page de robusta.build, en `en`, `fr` et `es`, déclare désormais ce qu'elle est ; le site reste fermé à l'indexation jusqu'à go-live, qui n'a que `INDEXING_OPEN` à basculer.

## Ce que « pas agressif » veut dire ici

- Aucun terme n'est ajouté à une page parce que le site veut se classer dessus. Ce que la page dit est ce qu'elle déclare.
- Une page sans contenu propre n'est pas indexable, ni listée au sitemap, ni proposée en Related article.
- Un lien interne existe pour un lecteur qui le suivrait ; un bloc de liens est omis plutôt que rembourré.
- Les données structurées décrivent ce que la page affiche, jamais plus.

## Livré

### Requirements

- R-SEOEXCELLENCE-01 : `pageHead` est le seul producteur des balises SEO du head. Les sept routes de page le reçoivent par `landingHead`, `listingHead` ou `articleHead` ; la route racine reste inchangée.
- R-SEOEXCELLENCE-02 : titre et description : `landing.head` de la Locale pour une landing page, les modèles de `listingHead` pour une page de listing, et pour un article son titre seul, sans nom de site ajouté, et `getExcerptText` de son excerpt, entier, sans troncature.
- R-SEOEXCELLENCE-03 : la canonical URL d'une page est `absoluteUrl(buildUrl(urlScheme, page))` ; le jumeau `.html` sert le même document, donc déclare la canonical URL de sa page (BR-PYRAMID-14).
- R-SEOEXCELLENCE-04 : les versions d'une page : `ArticlePage.versions` pour un article, les deux autres landing pages pour une landing page, `RollPage.versions` pour une page de roll ; `pageHead` en tire hreflang et x-default selon ses garanties (BR-ROBUSTA-1).
- R-SEOEXCELLENCE-05 : l'aperçu de partage : `og:type` `article` sur une page article, posé par `shareType`, et `website` ailleurs, `og:title` et `og:description` égaux au titre et à la description, `og:url` égal à la canonical URL, `og:locale` `en_US`, `fr_FR` ou `es_ES` selon la Locale, correspondance fixe écrite dans `src/seo`, alors que `inLanguage` et `<html lang>` gardent le code de la Locale, `og:image` absolu sur la couverture d'un article qui en déclare une, sur aucune autre page.
- R-SEOEXCELLENCE-21 : `isIndexable` est la règle unique : une landing page et une page article le sont, une page de roll l'est quand `articlesListedBy` n'est pas vide, une page de tag ne l'est jamais. Une page sans `PageUrl`, la 404, n'a pas de déclaration.
- R-SEOEXCELLENCE-22 : `RollPage.indexable` vient de `isIndexable` au build ; `RollPage.versions` est `versionsOf` restreint aux pages indexables et construites, si bien qu'aucun hreflang ne nomme une page non indexable.
- R-SEOEXCELLENCE-23 : le `robots` d'une page déclarée est `robotsOf(indexable)`. `INDEXING_OPEN` vaut `false` : chaque page sort `noindex, nofollow`, et une page indexable se reconnaît dans la build à sa canonical URL, que seule une déclaration indexable porte.
- R-SEOEXCELLENCE-24 : une route qui ne pose aucun head garde le `noindex, nofollow` de la racine et n'est pas au sitemap.
- R-SEOEXCELLENCE-25 : `INDEXING_OPEN` est écrit une fois, dans `src/seo/indexing.ts`, et rien d'autre ne décide de l'ouverture : go-live n'a qu'elle à changer. Le second paramètre de `robotsOf` ne sert qu'aux tests ; aucun code de production ne le passe.
- R-SEOEXCELLENCE-41 : `emit-site-files.mjs` passe à `sitemapEntries` `landingPages` puis `contentUrls`, dans cet ordre ; `sitemapEntries` garde cet ordre, garde les pages que `isIndexable` accepte, publiées seulement puisque l'index ne porte qu'elles (BR-PYRAMID-10), et les écrit au build, jamais sur une requête (BR-PYRAMID-7).
- R-SEOEXCELLENCE-42 : `lastmod` : pour un article, `updated` s'il existe, `date` sinon ; pour une landing page ou une page de roll, le plus récent de ces mêmes dates parmi `articlesListedBy` ; absent quand la page ne liste aucun article.
- R-SEOEXCELLENCE-43 : `robotsTxt` autorise tout et nomme `absoluteUrl('/sitemap.xml')` : l'asset root et `/learn` restent lisibles.
- R-SEOEXCELLENCE-44 : `SITE_ORIGIN` et `NOTES_FEED_SIZE` sont écrits dans `src/routing/scheme.ts` ; la Site configuration lit le premier, la route de la landing page et `articlesListedBy` le second.
- R-SEOEXCELLENCE-61 : une page article déclare `articleData` — `headline`, `datePublished`, `dateModified` seulement si `updated` existe, `author` comme `Person` nommée, `inLanguage`, `image` absolue sous l'asset root quand la couverture existe — et `breadcrumbData(articleTrail(page))`.
- R-SEOEXCELLENCE-62 : `articleTrail` : l'accueil du blog de la Locale, libellé `listing.blogTitle`, puis la Category, libellée par `getCategoryLabel`, quand l'article en revendique une, puis le titre de l'article sans lien. `ArticleView` le rend dans un `nav` nommé `breadcrumb.navLabel`, une liste ordonnée, chaque lien par `SiteLink`, le dernier élément en texte marqué `aria-current="page"`.
- R-SEOEXCELLENCE-63 : une page d'un roll de Category rend et déclare `rollTrail` : l'accueil du blog, puis la Category, en texte sur la page 1 et liée à la page 1 dès la page 2. L'accueil du blog ne rend ni ne déclare de fil d'Ariane.
- R-SEOEXCELLENCE-64 : chaque landing page déclare `organizationData` : `siteName`, sa propre canonical URL, `contact.email` et `contact.linkedIn` en `sameAs`. Aucune page ne déclare `LocalBusiness`, d'adresse ni de zone.
- R-SEOEXCELLENCE-65 : une page article montre `article.updatedPrefix` et `writtenUpdated` dans un `<time dateTime>` à côté de la date de publication, seulement quand l'article déclare `updated`, écrite au build dans sa Locale et en UTC comme `writtenDate`.
- R-SEOEXCELLENCE-66 : la vue et la déclaration lisent la même valeur — `articleTrail`, `rollTrail`, le titre, les dates, l'auteur, la couverture — de sorte qu'aucune donnée structurée ne porte un champ que la page n'affiche pas. Fil d'Ariane et bloc de Related articles ne stylent qu'en tokens du design system (BR-PYRAMID-6) et ne lisent que la page copy de leur Locale (BR-PYRAMID-8) ; le design system ne gagne aucun composant.
- R-SEOEXCELLENCE-81 : `ArticlePage.related` est `findRelated(article, 3)`, dont la règle vit dans `relatedAmong`, chaque article réduit à son titre et à sa canonical URL.
- R-SEOEXCELLENCE-82 : `ArticleView` termine la page sur un bloc titré `article.relatedTitle` en `h2`, une liste de liens par `SiteLink` vers les titres, sans date ni image, après le `nav` de fin de page ; aucun bloc quand `related` est vide.
- R-SEOEXCELLENCE-101 : `updated` est un champ optionnel du frontmatter, `YYYY-MM-DD`, entre guillemets ou lu comme timestamp YAML, comparé au jour calendaire comme `date`.
- R-SEOEXCELLENCE-102 : les cinq corps qui déclarent un titre de premier niveau sont corrigés dans `content/articles` et dans `apps/robusta/content/blog`, dans un même commit : `leaving-gmail`, titré en setext, et `easy-automation-with-sonoff` perdent le titre qui répète le leur ; `yield-farming` et `yield-farming-fr` descendent le leur au deuxième niveau, libellé gardé ; `quel-second-langage` descend tout son arbre d'un niveau. `quitter-gmail`, `domotique-facile-avec-sonoff` et `yield-farming` redéclarent le fingerprint de leur original dans ce commit.
- R-SEOEXCELLENCE-121 : `BlogConfig` perd `mandatoryKeywords`, et aucune page ne déclare de mot-clé.
- R-SEOEXCELLENCE-122 : `PageCopy` gagne `article.relatedTitle`, `article.updatedPrefix` et `breadcrumb.navLabel` pour `en`, `fr` et `es` : `relatedTitle` « Related articles », « Articles liés », « Artículos relacionados » ; `updatedPrefix` « Updated on », « Mis à jour le », « Actualizado el » ; `breadcrumb.navLabel` « Breadcrumb », « Fil d'Ariane », « Ruta de navegación ».
- R-SEOEXCELLENCE-141 : `check-seo.mjs` échoue, en nommant la page, sur : un titre ou une description absent ou partagé avec une autre page de la même `<html lang>` ; une page portant une canonical URL absente du sitemap, ou une entrée du sitemap sans page construite qui la déclare canonique ; un `href` interne qui ne mène ni à une page construite ni à un fichier de `dist/client` ; un `alternate` qui mène à une page non construite ou qui ne lui rend pas le lien ; un nombre de `<h1>` autre que un.
- R-SEOEXCELLENCE-142 : il échoue aussi quand le `robots` d'une page diffère de `robotsOf` appliqué à la présence de sa canonical URL, `INDEXING_OPEN` lu dans `.routing-dist` : tant qu'il vaut `false`, aucune page ne porte `index`.
- R-SEOEXCELLENCE-143 : aucun fichier ni balise de vérification n'est livré : robusta.build est vérifié dans la console webmaster par un enregistrement DNS, hors du dépôt (BR-PYRAMID-2).

### Acceptance Criteria

- AC-SEOEXCELLENCE-1 : Given toute page indexable, When un moteur de recherche ou une plateforme sociale la lit, Then il y trouve un titre et une description qui lui sont propres (celle d'un article est son excerpt, entier, en texte brut), une canonical URL qui la nomme sous sa forme canonique, la langue de sa Locale, un aperçu de partage construit sur ces mêmes valeurs, un lien hreflang vers chacune de ses versions publiées en `en`, `fr` et `es`, elle-même comprise, et un x-default vers sa version `en`, sans préfixe, quand elle en a une ; il n'y trouve aucun mot-clé ajouté par la Site configuration.
- AC-SEOEXCELLENCE-2 : Given une page sans contenu propre (la page 404) ou une page qui ne déclare rien de son indexation, When le site est construit, Then cette page se déclare non indexable et le sitemap l'omet, alors que landing pages, pages de listing et pages article sont indexables ; aucune canonical URL, aucun lien hreflang ni aucune entrée du sitemap ne nomme une forme que l'hébergeur redirige (`/en…`, une barre finale) ni un jumeau `.html`, et ce jumeau déclare la canonical URL de sa page. Jusqu'à go-live, aucune page n'est ouverte à l'indexation.
- AC-SEOEXCELLENCE-3 : Given le site construit, When un crawler lit `/sitemap.xml` et `/robots.txt`, Then le sitemap liste exactement les pages indexables des trois Locales, articles publiés seulement (BR-PYRAMID-10), chacune datée quand le contenu donne une date : la date de mise à jour d'un article s'il en déclare une, sa date de publication sinon, et pour une page qui liste des articles la plus récente d'entre elles ; une page qui ne liste aucun article daté, comme `/es` tant qu'aucun article espagnol n'est publié, y figure sans date ; `robots.txt` nomme le sitemap et ne bloque rien de ce qu'il liste, ni l'asset root qui sert les couvertures.
- AC-SEOEXCELLENCE-4 : Given une page article, une page d'un roll de Category ou une landing page, When un lecteur ou un crawler la lit, Then une page article montre un fil d'Ariane (accueil du blog, Category, article) libellé dans sa Locale et la date de mise à jour quand l'article en déclare une, et déclare en données structurées l'article (titre, date de publication, date de mise à jour, auteur, langue, couverture en URL absolue sous l'asset root) et ce fil d'Ariane ; chaque page d'un roll de Category montre et déclare le fil d'Ariane accueil du blog puis Category, et l'accueil du blog n'en montre pas ; chaque landing page, `/`, `/fr` et `/es`, déclare Robusta Build comme organisation, avec le nom et le contact qu'elle affiche, et aucune page ne déclare d'entreprise locale (OQ-SEOEXCELLENCE-21) ; aucune donnée structurée ne porte un champ que sa page n'affiche pas.
- AC-SEOEXCELLENCE-5 : Given un article, When sa page est construite, Then elle lie sa page de Category et se termine sur ses Related articles de la même Locale, trois au plus, ou sans bloc quand il n'en a aucun.
- AC-SEOEXCELLENCE-6 : Given la build de production, When on la vérifie, Then aucune page n'a de titre ou de description absent ou partagé avec une autre page de sa Locale, chaque page indexable est au sitemap et chaque entrée du sitemap est une page construite, aucun lien interne n'est cassé, chaque lien hreflang mène à une page construite qui le lui rend, et chaque page porte exactement un titre de premier niveau ; un échec nomme la page. Le résultat se lit dans la console webmaster d'un moteur de recherche, où robusta.build est une propriété vérifiée, et rien n'est livré au visiteur.
- AC-SEOEXCELLENCE-7 : Given les cas limites métier, When le site est reconstruit, Then un article qui cesse de se déclarer publié quitte le sitemap, et aucun bloc de Related articles, fil d'Ariane ou lien hreflang d'une autre page ne le cible ; une traduction est canonique à elle-même, jamais à son original, et une traduction signalée obsolète garde ses liens hreflang tant qu'elle est publiée ; une page publiée dans une seule Locale (la Category `theory`, un article sans traduction) ne déclare aucun hreflang, et une page sans version `en` ne déclare pas de x-default ; la seconde page d'un roll est canonique à elle-même, jamais à la première, et ses versions sont la même page du même roll dans les autres Locales quand elle est construite, jamais leur première page ; un article sans date de mise à jour ne déclare de date de modification nulle part ; un corps qui répète son titre en titre de premier niveau ne l'affiche qu'une fois, et un corps qui titre ses sections au premier niveau les garde un niveau plus bas ; une Category qui ne contient qu'un article reste indexable ; une page sans image propre partage un aperçu sans image plutôt qu'une image par défaut.

## Boundaries

```
  Packages de l'app `@robusta/robusta-build` [modified]

  routes · scripts de build (emit-site-files, check-seo)
      │
      ├──library──→  article · listing · landing [modified]
      │                  │
      │                  └──library──→  package `seo` [new]
      │
      ├──library──→  package `page-data` [modified]
      │
      ├──library──→  package `routing` [modified]
      │
      └──library──→  package `content`, `corpus-reader` compris [modified]
```

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers et plateformes sociales.

- `GET /sitemap.xml` · nouveau — 200, les pages indexables des trois Locales sous leur forme canonique, `lastmod` quand le contenu le permet, écrit au build
- `GET /robots.txt` · nouveau — 200, nomme le sitemap, n'interdit rien
- `GET` sur toute page, jumeau `.html` compris · modifié — son head déclare titre, description, `robots`, canonical URL, hreflang, x-default et aperçu de partage ; une page article ajoute `BlogPosting` et `BreadcrumbList` et montre fil d'Ariane et Related articles ; une page d'un roll de Category montre et déclare son fil d'Ariane ; une landing page ajoute `Organization`

### library API of package `seo` in app `@robusta/robusta-build` — new

Client code : `article`, `listing`, `landing`, scripts de build.

- `pageHead`, `isIndexable`, `INDEXING_OPEN`, `robotsOf`
- `articleData`, `breadcrumbData`, `organizationData`
- `absoluteUrl`, `sitemapEntries`, `sitemapXml`, `robotsTxt`

### library API of package `content` in app `@robusta/robusta-build` — modified

Client code : `page-data`, scripts de build.

- `ArticleEntry` · modifié — gagne `updated` optionnel, lu dans le frontmatter
- `readCorpus(corpus)` · modifié — refuse un `updated` malformé comme un `date` malformé
- `getExcerptText`, `findRelated`, `relatedAmong` · nouveaux

### library API of package `seopyramids.config` in app `@robusta/robusta-build` — modified

- `BlogConfig` · modifié — perd `mandatoryKeywords`
- `PageCopy` · modifié — gagne `article.relatedTitle`, `article.updatedPrefix`, `breadcrumb.navLabel`

## Décisions

- 2026-07-29 — Pas de routes de tag : les tags choisissent les Related articles, la navigation passe par les Categories. Pourquoi : découpé par tag, le corpus donne des pages d'un ou deux articles.
- 2026-07-29 — `mandatoryKeywords` quitte la configuration v2. Pourquoi : il collait les deux mêmes termes commerciaux à chaque article, le motif agressif que l'epic écarte.
- 2026-07-30 — « Une page indexable porte un contenu propre » reste un critère de la story, pas une règle métier. Pourquoi : c'est la définition d'`Indexable page` au glossaire ; BR-PYRAMID-4 est retiré.
- 2026-07-30 — Une Category qui ne contient qu'un article est indexable. Pourquoi : sinon ses articles ne sont joignables que depuis l'accueil du blog.
- 2026-07-30 — La date du sitemap vient d'un champ `updated` optionnel du frontmatter, à défaut de la date de publication. Pourquoi : un horodatage de fichier ne veut rien dire après un checkout de CI.
- 2026-07-30 — La seule mesure gardée est l'inscription du site dans la console webmaster d'un moteur de recherche, vérifiée par DNS. Pourquoi : elle ne livre aucun code au visiteur (BR-PYRAMID-2).
- 2026-10-06 — La racine garde `noindex` par défaut et chaque page indexable se déclare indexable ; les pages s'ouvrent à go-live. Pourquoi : chaque canonical URL nomme `https://www.robusta.build`, qui servait v1 jusqu'à la bascule.
- 2026-10-25 — Les corps à second `h1` sont corrigés dans l'arbre v2 et dans l'arbre v1 figé, dans un même commit. Pourquoi : `corpus-freeze.spec.ts` garde les copies identiques.
- 2026-11-04 — Le x-default désigne la version `en` d'une page ; une page sans version `en` n'en déclare pas. Pourquoi : `/` ne traite pas le même sujet.
- 2026-11-04 — Le jumeau `.html` reste servi et déclare la canonical URL de sa page. Pourquoi : le supprimer est un réglage d'hébergeur pour tout le site.
- 2026-11-04 — La page `n` d'un roll a pour versions la page `n` du même roll dans les autres Locales, pas la page 1 que donne `counterpartsOf`. Pourquoi : la réciprocité d'AC-SEOEXCELLENCE-6 échouerait dès qu'une page 2 existe.
- 2026-11-04 — Chaque landing page déclare Robusta Build comme organisation ; aucune page ne déclare d'entreprise locale, la fiche Google Business Profile reste hors story (OQ-SEOEXCELLENCE-21). Pourquoi : les landing pages mettent en avant RB Compound et ne montrent aucune zone.
- 2026-11-04 — Les textes `relatedTitle`, `updatedPrefix` et `breadcrumb.navLabel` en `en`, `fr` et `es` ont été rédigés à l'implémentation. À relire par Nicolas avec listing-copy-review.
- 2026-11-04 — L'inscription de robusta.build dans une console webmaster, par un enregistrement TXT chez Hover, reste à faire hors du dépôt : c'est la dernière phrase d'AC-SEOEXCELLENCE-6.

## Documentation updates

- created la section SEO in `apps/robusta-build/README.md` : ce qu'une page déclare, la règle d'indexabilité, `INDEXING_OPEN`, le sitemap, `robots.txt` et l'audit `check-seo.mjs` ; `mandatoryKeywords` retiré, champ `updated` ajouté.
- changed l'Overview, la ligne `apps/robusta-build`, la ligne Site configuration, la build chain et le green set in `root.archi.md`.
- changed l'Overview, le package `routes`, le nouveau package `seo`, `page-data`, `article`, `listing`, `landing`, `content`, `routing`, les scripts, le diagramme et les API HTTP et CLI in `apps/robusta-build/robusta-build.archi.md`.
- changed `ArticleEntry` et son `updated` in `apps/robusta-build/src/content/corpus-reader/corpus-reader.archi.md`.
- changed la ligne Site web in `documentation/google-business-profile.md` : chaque landing page déclare Robusta Build comme organisation, sans zone.
