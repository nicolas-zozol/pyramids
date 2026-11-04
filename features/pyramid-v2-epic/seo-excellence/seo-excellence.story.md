# Story : SEO excellence sur le site v2

**Dernière mise à jour :** 2026-11-04
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que chaque page du site v2 déclare à un moteur de recherche exactement ce qu'elle est, dans sa Locale, et rien de plus, **afin que** le contenu soit trouvé pour ce qu'il vaut et que le site ne se lise jamais comme fabriqué pour des robots.

## Contexte & objectif

L'epic porte une intention SEO : les bonnes pratiques, jamais l'agressivité. Aucune règle métier n'en sort ; cette story en fait des critères vérifiables.

Lu dans le code le 2026-11-04 : la racine déclare `robots: noindex, nofollow` et, sur toute page, le titre et la description de la page copy de sa Locale ; seules la landing page et les pages de listing posent les leurs (robusta-landing-page, blog-rolls), une page article partage donc ceux de sa Locale. Ni canonical URL, ni hreflang, ni sitemap, ni `robots.txt`, ni données structurées. Quatre corps d'article déclarent un second `h1` (`yield-farming`, `easy-automation-with-sonoff`, `yield-farming-fr`, `quel-second-langage`), et `mandatoryKeywords: ['robusta build', 'freelance']` est toujours dans la Site configuration. article-page a laissé exprès deux sujets à cette story : le bloc de Related articles en fin d'article et ces titres.

La story livre sur le site que multilingual-site et default-locale-at-root ont construit : robusta.build en trois Locales (BR-ROBUSTA-1), `en` par défaut et servie sans préfixe (BR-PYRAMID-14), `fr` et `es` sous `/fr` et `/es`. `/` est la landing page `en`, pas une redirection. L'hébergeur répond 301 de `/en…` vers la forme sans préfixe et d'une barre finale vers la forme sans barre, et sert en 200 le jumeau `.html` de chaque page (Gap-ROOTLOCALE-3). Un article n'existe que dans les Locales où une version publiée existe (BR-PYRAMID-10). Une canonical URL est la forme que le schéma construit, au sens de l'entrée `Canonical URL` du glossaire, sur `https://www.robusta.build`. blog-rolls rend chaque page de listing, titre et description compris ; cette story déclare le reste. Le site met en avant RB Compound ; cette story n'écrit aucun texte pour lui, elle déclare la page copy existante (OQ-PYRAMID-4 de l'epic). Le site reste fermé à l'indexation jusqu'à go-live.

Hors périmètre : SEO hors site, fiche Google Business Profile comprise ; Core Web Vitals ; toute analytics (BR-PYRAMID-2) ; `<html lang>`, le schéma d'URL et les redirections de l'hébergeur (multilingual-site, default-locale-at-root) ; la suppression du jumeau `.html`, réglage d'hébergeur ; la page copy, titres et descriptions des landing pages et des pages de listing compris ; le rendu des rolls (blog-rolls) ; l'ouverture à l'indexation (go-live) ; les adresses v1 (restore-v1-urls).

## Ce que « pas agressif » veut dire ici

- Aucun terme n'est ajouté à une page parce que le site veut se classer dessus. Ce que la page dit est ce qu'elle déclare.
- Une page sans contenu propre n'est pas indexable, ni listée au sitemap, ni proposée en Related article.
- Un lien interne existe pour un lecteur qui le suivrait ; un bloc de liens est omis plutôt que rembourré.
- Les données structurées décrivent ce que la page affiche, jamais plus.

## Acceptance Criteria

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

  routes · page-data · scripts de build
      │
      ├──library──→  package `routing`
      │
      └──library──→  package `content` [modified]
```

Les packages `routing` et `content` sont ceux que multilingual-site a rapatriés de `@robusta/pyramids-routing` et `@robusta/pyramids-content` (BR-PYRAMID-12). Où vivent les déclarations dans le site, c'est au design de le dire, sur TanStack Start.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers et plateformes sociales.

- `GET /sitemap.xml` · nouveau — 200, les pages indexables des trois Locales sous leur forme canonique, datées quand le contenu le permet, généré au build
- `GET /robots.txt` · nouveau — 200, nomme le sitemap, n'interdit rien
- `GET` sur toute page, jumeau `.html` compris · modifié — son head déclare titre, description, canonical URL, indexabilité, liens hreflang, x-default et aperçu de partage ; une page article ajoute ses données structurées et montre fil d'Ariane et Related articles ; une page d'un roll de Category montre et déclare son fil d'Ariane ; une landing page ajoute l'organisation

### library API of package `content` in app `@robusta/robusta-build` — modified

Client code : `page-data`, scripts de build.

- `ArticleEntry` · modifié — gagne une date de mise à jour optionnelle, lue dans un champ `updated` du frontmatter
- `readCorpus(corpus)` · modifié — refuse une date de mise à jour malformée comme il refuse un `date` malformé

### library API of package `seopyramids.config` in app `@robusta/robusta-build` — modified

- `BlogConfig` · modifié — perd `mandatoryKeywords`

## Décisions

- 2026-07-29 — Pas de routes de tag : les tags restent des métadonnées qui choisissent les Related articles, la navigation passe par les Categories. Pourquoi : découpé par tag, le corpus donne des pages d'un ou deux articles, la page mince que la story refuse (R-URLSCHEME-31 réserve `/articles/t/{tag}` sans rien y servir).
- 2026-07-29 — `mandatoryKeywords` quitte la configuration v2. Pourquoi : il colle les deux mêmes termes commerciaux à chaque article quel que soit son sujet, le motif agressif que l'epic écarte.
- 2026-07-30 — « Une page indexable porte un contenu propre » reste un critère de la story, pas une règle métier. Pourquoi : c'est la définition même d'`Indexable page` au glossaire ; BR-PYRAMID-4 est retiré.
- 2026-07-30 — Une Category qui ne contient qu'un article est indexable. Pourquoi : sinon ses articles ne sont joignables que depuis l'accueil du blog, et la page montre quelque chose de réel.
- 2026-07-30 — L'aperçu de partage se limite au titre, à la description, à l'image, à la canonical URL et à la langue, tirés de valeurs que la page calcule déjà. Pourquoi : rien à rédiger ni à entretenir.
- 2026-07-30 — La date du sitemap vient d'un champ `updated` optionnel du frontmatter, à défaut de la date de publication ; une page qui liste des articles prend la plus récente. Pourquoi : c'est la seule date que le contenu possède, un horodatage de fichier ne veut rien dire après un checkout de CI.
- 2026-07-30 — La seule mesure gardée est l'inscription du site dans la console webmaster d'un moteur de recherche, vérifiée par DNS ou fichier statique. Pourquoi : elle ne livre aucun code au visiteur et n'identifie personne (BR-PYRAMID-2).
- 2026-10-06 — blog-rolls rend l'accueil du blog et les rolls de Category, avant cette story. Pourquoi : un roll est de la page copy, l'intégrer ici doublerait la story.
- 2026-10-06 — La racine garde `noindex` par défaut et chaque page indexable se déclare indexable ; les pages s'ouvrent à go-live. Pourquoi : supprimer la directive de la racine ouvrirait aussi la 404, et chaque canonical URL nomme `https://www.robusta.build`, qui sert v1 jusqu'à la bascule.
- 2026-10-25 — Les quatre corps qui déclarent un second `h1` sont corrigés dans l'arbre v2 et dans l'arbre v1 figé, dans un même commit, pour que `corpus-freeze.spec.ts` garde les copies identiques. Pourquoi : BR-ROBUSTA-1 garde les articles anglais sur le site, `yield-farming` et `easy-automation-with-sonoff` ne partent plus ; v1 a le même défaut, et exempter des fichiers affaiblirait le seul contrôle de la copie.
- 2026-10-25 — Retour du multilingue : chaque page déclare la langue de sa Locale et ses versions publiées dans les autres Locales. Pourquoi : BR-ROBUSTA-1 remplace la décision du 2026-10-06 d'une seule Locale `fr`, sans version alternative.
- 2026-11-04 — Le x-default désigne la version `en` d'une page, sans préfixe ; une page sans version `en` n'en déclare pas. Pourquoi : pointer vers `/` enverrait le lecteur sur une page qui ne traite pas le même sujet.
- 2026-11-04 — Une page qui ne liste aucun article daté figure au sitemap sans date. Pourquoi : la date est facultative au sitemap, et la seule qu'on pourrait poser serait inventée.
- 2026-11-04 — Le jumeau `.html` reste servi ; il déclare la canonical URL de sa page. Pourquoi : le supprimer est un réglage d'hébergeur pour tout le site, et l'epic a confié son canonical link à cette story le 2026-11-03.
- 2026-11-04 — Le fil d'Ariane s'étend à chaque page d'un roll de Category, accueil du blog puis Category ; l'accueil du blog n'en a pas. Pourquoi : blog-rolls n'en rend aucun et le confie à cette story.
- 2026-11-04 — La page `n` d'un roll a pour versions la page `n` du même roll dans les autres Locales, pas la page 1 que donne `counterpartsOf`. Pourquoi : une page 1 ne rendrait pas le lien, et la réciprocité d'AC-SEOEXCELLENCE-6 échouerait dès qu'une page 2 existe.
- 2026-11-04 — Chaque landing page, `/`, `/fr` et `/es`, déclare Robusta Build comme organisation, avec le nom et le contact qu'elle affiche ; aucune page ne déclare d'entreprise locale, et la fiche Google Business Profile reste hors story (OQ-SEOEXCELLENCE-21). Pourquoi : les landing pages mettent en avant RB Compound et ne montrent aucune zone, et `/fr` et `/es` affichent la même organisation que `/`.

## Documentation updates

- change l'Overview et la ligne de Site configuration de `root.archi.md` — why: l'Overview décrit une chaîne qui produit des pages indexables alors que le site déclare `noindex` sans sitemap, et la ligne nomme encore les mandatory keywords que la story retire.
- create une section SEO dans `apps/robusta-build/README.md`, à côté de la section Routing — why: ce qu'une page déclare, hreflang, x-default et canonical URL du jumeau `.html` compris, et ce que le site refuse de faire, c'est ce que le prochain site recopie.
- change la ligne Site web de `documentation/google-business-profile.md` — why: elle dit que les données structurées de `/` déclarent le même nom, la même zone et le même contact que la fiche ; chaque landing page déclare désormais Robusta Build comme organisation, sans zone (OQ-SEOEXCELLENCE-21).

## Dependencies

- Aucune dépendance ouverte.
- Levées : multilingual-site (LANDED, `fb4803b`), default-locale-at-root (SUBMITTED, `2fbc7be`), blog-rolls (SUBMITTED, `bc568f7`, `ab90ca6`), canonical-url-glossary, absorbé par glossary-refresh (SUBMITTED, `3ca46f9`, entrée `Canonical URL` réécrite), tanstack-start-migration (DONE, `9396d94`), default-locale-fr (LANDED le 2026-10-08), robusta-landing-page (LANDED, `79b4eb0`), migrate-learn-content (`0282952`) et article-page (`3ab28e7`) ; translate-english-articles, remplacé par multilingual-site, n'en est plus une.
