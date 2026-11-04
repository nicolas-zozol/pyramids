# Story : Les pages de listing de robusta.build

**Dernière mise à jour :** 2026-11-04
**Feature :** blog-rolls
**Infix :** BLOGROLLS
**Status :** ACTIVE

## Story

**En tant que** lecteur de robusta.build, **je veux** parcourir les articles d'une Locale, tous ou ceux d'une Category, **afin de** trouver ce qui m'intéresse au-delà des quatre derniers articles de la landing page.

## Contexte & objectif

Les 13 pages de listing du site affichent un `RoutePlaceholder` : leur titre et leur adresse. Ce sont l'accueil du blog et 5 pages de Category de `en`, sous `/articles` (la Locale par défaut se sert sans préfixe, BR-PYRAMID-14), et l'accueil du blog et 6 pages de Category de `fr`, sous `/fr/articles`. Le lien de Category de chaque page article et le lien « tous les articles » de la Section de notes des landing pages y mènent pourtant. Le pied de page n'a aucune colonne de liens depuis robusta-landing-page, qui la laissait à cette story.

Item 1 de l'epic depuis le 2026-10-06 (Gap-LANDING-11, Gap-SEOEXCELLENCE-17) : aucun item ne rendait ces pages, et un roll est de la page copy, pas une déclaration. seo-excellence attend cette story pour ses critères des pages de listing, go-live pour qu'aucune page de listing ne s'ouvre vide à l'indexation.

La roll size est la constante de 12 que la Site configuration expose sans la choisir (`blogConfig.rollSize`). Avec 8 articles anglais et 9 français, datés de 2019 à 2022, aucun roll n'a de page 2 aujourd'hui. Une Category se nomme par `getCategoryLabel`, dans la Locale de la page. Le site fournit la page copy (BR-PYRAMID-8), le design system les valeurs (BR-PYRAMID-6), et le contenu n'est lu qu'au build (BR-PYRAMID-7).

## Partage avec seo-excellence

- blog-rolls : ce que le lecteur voit sur une page de listing (titre, roll, liens entre les pages d'un roll) et toute sa page copy, titre et description du head compris, comme une landing page porte les siens ; la colonne du pied de page. Aucun fil d'Ariane.
- seo-excellence : ce que la page déclare (canonical URL, hreflang, indexabilité, sitemap, aperçu de partage, données structurées) et le fil d'Ariane, d'une page article comme de chaque page d'un roll de Category : accueil du blog puis Category. L'accueil du blog n'en montre pas.
- go-live : l'ouverture à l'indexation. Jusque-là, une page de listing reste `noindex` comme le reste du site.

## Acceptance Criteria

- AC-BLOGROLLS-1 : Given une Locale qui publie des articles, When un visiteur ouvre son accueil du blog, Then il lit sous un titre de la page copy les articles publiés de cette Locale et d'elle seule, du plus récent au plus ancien, 12 au plus, chacun avec son titre, sa date année comprise et le libellé de sa Category, sans excerpt ni couverture, chacun menant à sa page article ; la page se lit et se parcourt sans JavaScript, et plus aucune page de listing ne montre de placeholder ni son adresse.
- AC-BLOGROLLS-2 : Given une page article qui revendique une Category, When le visiteur suit son lien de Category, Then il arrive sur le roll de cette Category dans la Locale de l'article, titré par son libellé dans cette Locale, qui ne liste que les articles de cette Locale qui la revendiquent, sans répéter ce libellé sur chacun ; le lien « tous les articles » d'une landing page mène de même à l'accueil du blog de sa Locale, `/articles` depuis `/`.
- AC-BLOGROLLS-3 : Given un roll de plus de 12 articles, When un visiteur le parcourt, Then la première page, sans `/p/` dans son adresse, montre les 12 plus récents, la page `/p/{n}` les 12 suivants, sous le même titre ; chaque page lie la précédente et la suivante quand elles existent, la précédente de `/p/2` étant la première page à son adresse sans `/p/`, et `/p/1` comme toute page au-delà de la dernière répond 404 ; depuis `/p/{n}`, changer de Locale par l'en-tête mène à la première page du même roll dans l'autre Locale, de `/articles/p/2` à `/fr/articles` par exemple, ou à sa landing page quand ce roll n'y existe pas ; tant qu'aucune Locale ne dépasse 12 articles, c'est prouvé sur un corpus de fixture.
- AC-BLOGROLLS-4 : Given toute page de listing, When un visiteur ou un moteur de recherche la lit, Then chaque texte vient de la page copy de sa Locale, sans un mot du prototype du design system ; son titre et sa description de head viennent d'un modèle par Locale et par sorte de page, accueil du blog ou roll de Category, que complètent le libellé de la Category et, dès la page 2, le numéro de page, et aucune autre page du site ne les partage, d'une autre Locale ou d'un autre rang du même roll.
- AC-BLOGROLLS-5 : Given une page d'une Locale qui publie des articles, When le visiteur lit le pied de page, Then il y trouve une seule colonne, titrée dans la page copy : l'accueil du blog puis chaque Category que revendique un article publié de cette Locale, libellée dans sa langue et rangée par ordre alphabétique de libellé, chaque lien menant à sa page.
- AC-BLOGROLLS-6 : Given les cas limites métier, When le site est reconstruit, Then une Category revendiquée par une seule Locale n'a de roll que dans celle-ci (`theory`, sous `/fr` seulement, `/articles/c/theory` répondant 404), et le pied de page des autres Locales ne la lie pas ; un article publié sans Category (BR-PYRAMID-9) figure sur l'accueil du blog de sa Locale sans libellé de Category, et sur aucun roll de Category ; une traduction signalée obsolète et toujours publiée reste dans les rolls de sa Locale ; une Locale autre que la Locale par défaut et sans article publié, `es` aujourd'hui, n'a ni accueil du blog ni colonne de liens, et `/es/articles` répond 404 ; la Locale par défaut garde son accueil du blog même vide, `/articles` montrant alors son titre et aucun article ; le premier article espagnol publié crée `/es/articles` et la page de sa Category, et sans libellé espagnol de cette Category la build échoue en nommant la Category et la Locale ; un article qui cesse de se déclarer publié quitte chaque roll (BR-PYRAMID-10), et une Category dont c'était le seul article perd sa page et son lien de pied de page, même si son libellé reste dans la page copy ; un roll qui repasse à 12 articles ou moins perd sa page `/p/2`, qui répond 404, et sa première page ne lie plus de page suivante.

## Boundaries

```
  Packages de l'app `@robusta/robusta-build`.
  Flèche = dépend de, du code client vers l'API (library). Aucune boucle.

                 routes [modified]
          ┌──────────┼──────────────┐
          ↓          ↓              ↓
     page-data     chrome      seopyramids.config
     [modified]    [modified] ──→ [modified]

  components [modified] perd RoutePlaceholder, que plus rien n'utilise.
```

Le design system ne change pas. La liste d'articles est rendue par `NotesPreview`, seule Section du design system qui affiche des articles, sans surtitre ni titre ; le `h1` de la page et les liens entre les pages d'un roll sont du balisage du site sur les tokens du design system, comme la page article. Où vit la vue d'un roll, et où le pied de page lit les Categories d'une Locale, c'est au design de le dire.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers. `en` sans préfixe, `{locale}` vaut `fr` ou `es` (BR-PYRAMID-14).

- `GET /articles`, `GET /articles/c/{category}`, `GET /{locale}/articles`, `GET /{locale}/articles/c/{category}` · modifiés — 200 avec le roll de la page au lieu du placeholder ; 13 pages aujourd'hui, 6 sous `/articles`, 7 sous `/fr/articles`
- `GET /articles/p/{n}`, `GET /articles/c/{category}/p/{n}` et leurs formes `/{locale}/…` · modifiés — construites dès qu'un roll dépasse 12 articles, aucune aujourd'hui ; 404 pour `n` = 1 et au-delà de la dernière page
- `GET /en/articles…` · inchangé — 301 de l'hébergeur vers la forme sans préfixe
- `GET` sur tout document · modifié — le pied de page porte la colonne de liens de sa Locale

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, Nicolas.

- `yarn build` · modifié — son contrôle de la route table couvre les pages de listing ; sortie non nulle sur une page de listing manquante, ou rendue en repli faute du libellé d'une Category dans sa Locale

### library API of package `page-data` in app `@robusta/robusta-build` — modified

Client code : package `routes`, les quatre routes de listing.

```ts
type PageUrl, NotePost // déjà connus
type RollPage

interface PageData {
  /** une page de blog roll ou de roll de Category : ses articles, du plus récent au plus ancien, 12 au plus, et ses pages voisines ; un fichier de données par page, écrit au prérendu */
  getRollPage(call: { data: PageUrl }): Promise<RollPage>;
}
```

### library API of package `chrome` in app `@robusta/robusta-build` — modified

- `Footer` · modifié — rend une colonne de liens, titrée dans la page copy, pour une Locale qui publie, aucune sinon ; ce qu'il reçoit en plus de la Locale, le design le dira

### library API of package `seopyramids.config` in app `@robusta/robusta-build` — modified

- `PageCopy` · modifié — `listing` porte, par Locale, les modèles du titre et de la description du head de chaque sorte de page de listing, son titre visible, les libellés des liens entre les pages d'un roll, le titre de la colonne du pied de page et son lien vers l'accueil du blog ; `getCategoryLabel` reste la seule source du libellé d'une Category

### library API of package `components` in app `@robusta/robusta-build` — modified

- `RoutePlaceholder` · retiré — les quatre routes de listing étaient ses seuls clients

## Documentation updates

- change la section Routing de `apps/robusta-build/README.md` (« What they render », le pied de page, le compte des pages et des fichiers de données) — why: les quatre routes de listing rendent leur roll et non plus `RoutePlaceholder`, et le pied de page a une colonne de liens.

## Dependencies

- Dep 1 : drop-section-default-copy, même batch B1, livrée avant blog-rolls. La liste d'articles se rend sans surtitre ni titre sous le titre de la page, et n'affiche ni titre vide ni texte du prototype qu'une fois les textes par défaut retirés des Sections.
- multilingual-site, dont les rolls suivent le schéma préfixé et la page copy par Locale : levée, LANDED le 2026-10-31 (`fb4803b`).
- default-locale-at-root, qui sert la Locale par défaut sans préfixe : levée, SUBMITTED le 2026-11-03 (`2fbc7be`).
