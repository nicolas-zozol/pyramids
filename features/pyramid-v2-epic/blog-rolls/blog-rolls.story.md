# Story : Les pages de listing de robusta.build

**Dernière mise à jour :** 2026-11-05
**Feature :** blog-rolls
**Infix :** BLOGROLLS
**Status :** SUBMITTED (2026-11-04, commit bc568f7)

## Story

**En tant que** lecteur de robusta.build, **je veux** parcourir les articles d'une Locale, tous ou ceux d'une Category, **afin de** trouver ce qui m'intéresse au-delà des quatre derniers articles de la landing page.

## Contexte & objectif

Les 13 pages de listing affichaient un `RoutePlaceholder`, alors que le lien de Category de chaque page article et le lien « tous les articles » des landing pages y menaient, et le pied de page n'avait aucune colonne de liens. Item 1 de l'epic depuis le 2026-10-06 (Gap-LANDING-11, Gap-SEOEXCELLENCE-17) : seo-excellence l'attendait pour ses critères des pages de listing, go-live pour qu'aucune ne s'ouvre vide à l'indexation.

## Partage avec seo-excellence

- blog-rolls : ce que le lecteur voit sur une page de listing (titre, roll, liens entre les pages d'un roll) et toute sa page copy, titre et description du head compris ; la colonne du pied de page. Aucun fil d'Ariane.
- seo-excellence : ce que la page déclare (canonical URL, hreflang, indexabilité, sitemap, aperçu de partage, données structurées) et le fil d'Ariane, d'une page article comme de chaque page d'un roll de Category : accueil du blog puis Category. L'accueil du blog n'en montre pas.
- go-live : l'ouverture à l'indexation. Jusque-là, une page de listing reste `noindex` comme le reste du site.

## Livré

### Requirements

- R-BLOGROLLS-01 : `url-scheme` exporte `RollUrl`, la `PageUrl` d'une page de roll.
- R-BLOGROLLS-02 : `getRollPage` rend les articles de la page `n` d'un roll, tranche de `ROLL_SIZE` des articles de sa Locale, ceux de sa Category sur un roll de Category, du plus récent au plus ancien, lus au build (BR-PYRAMID-7, BR-PYRAMID-10).
- R-BLOGROLLS-03 : la date d'un post porte jour, mois abrégé et année, écrits dans la Locale de la page ; son `tag`, slug de la Category, n'existe que sur un accueil du blog et pour un article qui en revendique une (BR-PYRAMID-9).
- R-BLOGROLLS-04 : `previousUrl` et `nextUrl` sont les pages `n - 1` et `n + 1` du même roll prises dans le jeu d'URL et construites par `buildUrl` ; la précédente de la page 2 est la première page, sans `/p/`.
- R-BLOGROLLS-05 : au build, `getRollPage` lève en nommant la page quand le jeu d'URL ne la porte pas.
- R-BLOGROLLS-06 : `getLocaleRolls` rend la première page de chaque roll de la Locale prise dans le jeu d'URL, accueil du blog d'abord, et `[]` pour une Locale sans article publié.
- R-BLOGROLLS-21 : un package `src/listing`, entrée `index.ts`, exporte `ListingPage` et `listingHead`.
- R-BLOGROLLS-22 : `ListingPage` rend dans un `<main>` le `h1` du roll, puis `NotesPreview` sans surtitre, titre ni lien vers tous les articles, les Categories nommées par `getCategoryLabel` dans la Locale de la page.
- R-BLOGROLLS-23 : la pagination est un `nav` nommé par la page copy, qui lie la page précédente et la suivante quand elles existent ; un roll d'une seule page n'en a pas.
- R-BLOGROLLS-24 : le `h1` et la pagination ne portent que des valeurs du design system, `var(--…)` en style inline comme `ArticleView`, et aucune classe hors de lui (BR-PYRAMID-6).
- R-BLOGROLLS-25 : `listingHead` rend le head de la route, `title` puis `description` : le modèle de la Locale et de la sorte de page, `{category}` rempli par le libellé, et dès la page 2 `pageSuffix`, `{page}` rempli, ajouté au titre et à la description.
- R-BLOGROLLS-26 : les quatre routes de listing, sous `/{-$locale}/articles`, chargent `getRollPage`, posent le head de `listingHead` et rendent `ListingPage` ; `RoutePlaceholder` et son spec disparaissent.
- R-BLOGROLLS-27 : chaque texte lisible d'une page de listing, en-tête et pied de page compris, est une valeur de la page copy de sa Locale, un libellé de Category, le titre ou la date d'un article du roll, le `localeName` d'une autre Locale, `contact.email` ou la marque : l'inventaire de R-SECTIONCOPY-41, étendu aux pages de listing (BR-PYRAMID-8).
- R-BLOGROLLS-41 : `PageCopy.listing` devient `ListingCopy`, rempli pour `en`, `fr` et `es`, et le commentaire de `PageCopy.head` exclut les pages de listing.
- R-BLOGROLLS-42 : chaque modèle de head est une phrase de la langue de sa Locale, et chaque modèle de Category porte `{category}` : `articles` et les quatre libellés que `en` et `fr` partagent donnent des heads distincts.
- R-BLOGROLLS-61 : le loader de la route racine charge `rolls` par `getLocaleRolls` pour la Locale de la page, la Locale par défaut hors du schéma et sur la 404, et `RootDocument` le passe à `Footer`.
- R-BLOGROLLS-62 : `Footer` rend une colonne quand `rolls` n'est pas vide : l'accueil du blog puis chaque Category, rangées par ordre alphabétique de libellé dans la Locale ; sinon aucune.
- R-BLOGROLLS-63 : ni `Footer`, ni `ListingPage`, ni `listingHead` ne rattrapent l'erreur de `getCategoryLabel`.
- R-BLOGROLLS-81 : `expectedDataFiles` compte un fichier par page de listing du jeu d'URL et un par landing page pour le pied de page ; la ligne de succès et le message d'écart nomment ces deux sources.

### Acceptance Criteria

- AC-BLOGROLLS-1 : Given une Locale qui publie des articles, When un visiteur ouvre son accueil du blog, Then il lit sous un titre de la page copy les articles publiés de cette Locale et d'elle seule, du plus récent au plus ancien, 12 au plus, chacun avec son titre, sa date année comprise et le libellé de sa Category, sans excerpt ni couverture, chacun menant à sa page article ; la page se lit et se parcourt sans JavaScript, et plus aucune page de listing ne montre de placeholder ni son adresse.
- AC-BLOGROLLS-2 : Given une page article qui revendique une Category, When le visiteur suit son lien de Category, Then il arrive sur le roll de cette Category dans la Locale de l'article, titré par son libellé dans cette Locale, qui ne liste que les articles de cette Locale qui la revendiquent, sans répéter ce libellé sur chacun ; le lien « tous les articles » d'une landing page mène de même à l'accueil du blog de sa Locale, `/articles` depuis `/`.
- AC-BLOGROLLS-3 : Given un roll de plus de 12 articles, When un visiteur le parcourt, Then la première page, sans `/p/` dans son adresse, montre les 12 plus récents, la page `/p/{n}` les 12 suivants, sous le même titre ; chaque page lie la précédente et la suivante quand elles existent, la précédente de `/p/2` étant la première page à son adresse sans `/p/`, et `/p/1` comme toute page au-delà de la dernière répond 404 ; depuis `/p/{n}`, changer de Locale par l'en-tête mène à la première page du même roll dans l'autre Locale, de `/articles/p/2` à `/fr/articles` par exemple, ou à sa landing page quand ce roll n'y existe pas ; tant qu'aucune Locale ne dépasse 12 articles, c'est prouvé sur un corpus de fixture.
- AC-BLOGROLLS-4 : Given toute page de listing, When un visiteur ou un moteur de recherche la lit, Then chaque texte vient de la page copy de sa Locale, sans un mot du prototype du design system ; son titre et sa description de head viennent d'un modèle par Locale et par sorte de page, accueil du blog ou roll de Category, que complètent le libellé de la Category et, dès la page 2, le numéro de page, et aucune autre page du site ne les partage, d'une autre Locale ou d'un autre rang du même roll.
- AC-BLOGROLLS-5 : Given une page d'une Locale qui publie des articles, When le visiteur lit le pied de page, Then il y trouve une seule colonne, titrée dans la page copy : l'accueil du blog puis chaque Category que revendique un article publié de cette Locale, libellée dans sa langue et rangée par ordre alphabétique de libellé, chaque lien menant à sa page.
- AC-BLOGROLLS-6 : Given les cas limites métier, When le site est reconstruit, Then une Category revendiquée par une seule Locale n'a de roll que dans celle-ci (`theory`, sous `/fr` seulement, `/articles/c/theory` répondant 404), et le pied de page des autres Locales ne la lie pas ; un article publié sans Category (BR-PYRAMID-9) figure sur l'accueil du blog de sa Locale sans libellé de Category, et sur aucun roll de Category ; une traduction signalée obsolète et toujours publiée reste dans les rolls de sa Locale ; une Locale autre que la Locale par défaut et sans article publié, `es` aujourd'hui, n'a ni accueil du blog ni colonne de liens, et `/es/articles` répond 404 ; la Locale par défaut garde son accueil du blog même vide, `/articles` montrant alors son titre et aucun article ; le premier article espagnol publié crée `/es/articles` et la page de sa Category, et sans libellé espagnol de cette Category la build échoue en nommant la Category et la Locale ; un article qui cesse de se déclarer publié quitte chaque roll (BR-PYRAMID-10), et une Category dont c'était le seul article perd sa page et son lien de pied de page, même si son libellé reste dans la page copy ; un roll qui repasse à 12 articles ou moins perd sa page `/p/2`, qui répond 404, et sa première page ne lie plus de page suivante.

## Boundaries

```
  Packages de l'app `@robusta/robusta-build`. Flèche : client code ──→ API,
  toutes library. Aucune boucle.

                 routes [modified]
          ┌──────────┼──────────────┐
          ↓          ↓              ↓
    listing [new] ─→ page-data    chrome [modified]
          │          [modified]     │
          ↓                         ↓
    seopyramids.config [modified], url-scheme [modified]

  components [modified] perd RoutePlaceholder. Le design system ne change pas.
```

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers. `en` sans préfixe, `{locale}` vaut `fr` ou `es` (BR-PYRAMID-14).

- `GET /articles`, `GET /articles/c/{category}` et leurs formes `/{locale}/…` · modifiés — 200 avec le roll de la page : 13 pages, 6 sous `/articles`, 7 sous `/fr/articles` dont `theory`
- `GET …/p/{n}` · modifiés — construites de `n = 2` à la dernière page, aucune aujourd'hui ; 404 par `404.html` pour `n = 1` et au-delà
- `GET` sur tout document · modifié — le pied de page porte la colonne de liens de sa Locale : aucune sous `/es`, celle de `en` sur `404.html`
- `GET /__tsr/staticServerFnCache/{sha1}.json` · modifié — un fichier par page de listing et un par Locale pour le pied de page, 69 au total

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, Nicolas.

- `yarn build` · modifié — `check-route-table` compte `rollPages` et `localeRolls` ; exit 1 sur un écart, une page de listing manquante ou rendue en repli faute d'un libellé de Category

### library API of package `page-data` in app `@robusta/robusta-build` — modified

Client code : package `routes`, les quatre routes de listing et la route racine.

```ts
type RollPage; // locale, category?, posts: NotePost[], previousUrl?, nextUrl?

interface PageData {
  getRollPage(call: { data: RollUrl }): Promise<RollPage>;                      // new
  getLocaleRolls(call: { data: { locale: string } }): Promise<RollUrl[]>;     // new
}
```

### library API of package `listing` in app `@robusta/robusta-build` — new

- `ListingPage({ page: RollPage })` — le `h1`, le roll par `NotesPreview`, puis le `nav` entre les pages du roll
- `listingHead(page: RollUrl)` — `title` et `description` de la route

### library API of package `url-scheme` in package `routing` — modified

- `RollUrl` · nouveau — `Extract<PageUrl, { kind: 'blog-home' } | { kind: 'category' }>`

### library API of package `chrome` in app `@robusta/robusta-build` — modified

- `Footer({ locale, rolls: RollUrl[] })` · modifié — une colonne quand `rolls` n'est pas vide, aucune sinon

### library API of the Site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

- `PageCopy.listing` · modifié — devient `ListingCopy` : `blogTitle`, `head` (`blogHome`, `category`, `pageSuffix`), `pagination` et `footer` ; `getCategoryLabel` reste la seule source du libellé d'une Category

### library API of package `components` in app `@robusta/robusta-build` — modified

- `RoutePlaceholder` · retiré avec son spec

## Décisions

- 2026-11-04 — Le roll est rendu par `NotesPreview`, sans surtitre ni titre, dans un nouveau package `listing` ; le `h1` et la pagination sont du balisage du site sur les tokens du design system. Pourquoi : `NotesPreview` est la seule Section qui affiche des articles, et le design system ne change pas.
- 2026-11-04 — Un roll vide ne rend que son `h1`, sans `NotesPreview`. Pourquoi : `/articles` reste construite pour la Locale par défaut même sans article (AC-BLOGROLLS-6).
- 2026-11-04 — La page copy de `ListingCopy` en `en`, `fr` et `es` a été rédigée à l'implémentation : heads « Articles by Nicolas Zozol, Robusta Build » et « {category}: articles by Nicolas Zozol », `pageSuffix` « (page {page}) » ou « (página {page}) », pagination « newer articles » et « older articles », pied de page « all articles », « tous les articles », « todos los artículos ». Validée par Nicolas le 2026-11-04, lgtm sans correction (listing-copy-review, `0f16932`).
- 2026-11-04 — AC-BLOGROLLS-3 est prouvé sur un corpus de fixture, aucune Locale ne dépassant 12 articles ; les 404 de `/p/1`, des pages au-delà de la dernière, de `/articles/c/theory` et de `/es/articles` sont prouvés par l'absence de leur fichier dans `dist`, sans draft deploy.

## Documentation updates

- changed la section Routing in `apps/robusta-build/README.md` : les routes de listing rendent `ListingPage`, le pied de page a sa colonne de liens, 69 fichiers de données.
- changed l'Overview, les packages `routes`, `page-data`, `listing`, `chrome`, `components`, la Site configuration, le diagramme et les API HTTP et CLI in `apps/robusta-build/robusta-build.archi.md`.
- changed les Boundaries et les clients (`RollUrl`, `listing`) in `apps/robusta-build/src/routing/url-scheme/url-scheme.archi.md`.

## Dependencies

- drop-section-default-copy, livrée avant blog-rolls pour rendre `NotesPreview` sans surtitre ni titre : levée, SUBMITTED le 2026-11-04 (`3b16c72`).
- multilingual-site : levée, LANDED le 2026-10-31 (`fb4803b`).
- default-locale-at-root : levée, SUBMITTED le 2026-11-03 (`2fbc7be`).
