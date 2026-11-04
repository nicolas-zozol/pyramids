# Brainstorm : les pages de listing de robusta.build

**Date :** 2026-10-31
**Feature :** blog-rolls
**Infix :** BLOGROLLS
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Sources lues

La story ; drop-section-default-copy et seo-excellence (story et brainstorm), même epic ; `pyramid-v2.epic.md`, `business-rules.md`, `ubiquitous-language.md`. Code : les quatre routes de listing, `__root.tsx`, `page-data`, `chrome`, `landing/NotesSection.tsx`, `seopyramids.config.ts`, `routing/url-scheme/url-set.ts`, `routing/counterparts.ts`, `scripts/check-route-table.mjs`, le corpus ; `NotesPreview`, `SiteFooter` et leurs styles dans `sketch.css`.

Les deux entrées ouvertes de la story, OQ-BLOGROLLS-1 et OQ-BLOGROLLS-2, sont challengées ci-dessous et non tranchées : le corps suit leurs Propositions.

## Faits vérifiés

- 13 pages de listing : l'accueil du blog et 5 Categories sous `/en`, l'accueil du blog et 6 Categories sous `/fr`, `theory` sous `/fr` seulement. 8 articles `en` et 9 `fr` publiés ; `agence-web-ou-freelance` (`fr`, `web`, daté du 2026-10-25) est en `published: false`.
- Les dates vont du 2019-05-24 au 2022-01-20. `shortDate`, dans `notes-feed.ts`, écrit le jour et le mois, sans l'année.
- `NotesPreview` rend toujours son surtitre et son titre `h2`, même vides, et le texte du prototype quand ils manquent. Son titre est un `h2`, sa section porte `id="notes"`, la liste passe sur deux colonnes au-dessus de `sm`. Il n'a ni excerpt ni couverture.
- `urlSet` construit toujours l'accueil du blog de la Locale par défaut ; une autre Locale ne le gagne qu'avec un article. C'est le seul endroit qui calcule un nombre de pages depuis la roll size. Il range les Categories par slug.
- `counterpartsOf` envoie la page `n` d'un roll vers la page 1 du même roll dans les autres Locales.
- `Footer` est rendu par la route racine, avec la seule Locale, et passe `columns={[]}`.
- `categoryLabels` : 5 libellés `en`, 6 `fr`, aucun `es`. `getCategoryLabel` lève une erreur sur un libellé absent ; la build échoue par le contrôle du repli Suspense de `check-route-table` (décision de l'epic du 2026-10-30).
- `PageCopy.listing` ne porte que `blogTitle` (`articles`, `articles`, `artículos`). Toute page hors landing partage le titre `Robusta Build` et la description de la racine.
- `check-route-table` compte les fichiers de données dus par source : pages article, notes feeds, counterparts.

## Acceptance Criteria challenge

### Verdicts

- AC-BLOGROLLS-1 : testable sur le HTML prérendu, sans le bundle client. Insuffisant sur la date, sans année sur un corpus de quatre ans (cas 1), et sur l'article sans Category (cas 3).
- AC-BLOGROLLS-2 : testable, en langage métier. Muet sur le libellé de Category que chaque article répéterait sur la page qui porte déjà ce libellé en titre (cas 2).
- AC-BLOGROLLS-3 : testable sur un corpus de fixture. Il manque l'adresse de la première page depuis la page 2 (cas 5) et le roll qui rétrécit (cas 4).
- AC-BLOGROLLS-4 : testable par un spec sur le head de chaque page dérivée. Plus strict qu'AC-SEOEXCELLENCE-6, qui ne compare qu'au sein d'une Locale : il tient si chaque modèle est une phrase de sa langue, `articles` et quatre libellés de Category s'écrivant pareil en `en` et en `fr`. « Sans un mot du prototype » ne peut pas reposer sur la liste du test de garde d'AC-LANDING-2, tirée d'un rendu sans props, que drop-section-default-copy vide.
- AC-BLOGROLLS-5 : testable sur le rendu de `Footer`. L'ordre des Categories n'est pas dit (décision en axe 6).
- AC-BLOGROLLS-6 : testable, sur le corpus réel pour `theory`, `es` et l'article non publié (`agence-web-ou-freelance` n'apparaît nulle part), sur fixture pour le reste. Contredit le schéma pour la Locale par défaut (Gap-BLOGROLLS-5).

### Cas limites proposés à storyman

1. Given un roll dont les articles couvrent plusieurs années, When le lecteur le parcourt, Then chaque date porte son année.
2. Given un roll de Category, When le lecteur le parcourt, Then aucun article n'y répète le libellé de la Category qui titre la page.
3. Given un article publié qui ne revendique aucune Category (BR-PYRAMID-9), When le site est reconstruit, Then il figure sur l'accueil du blog de sa Locale sans libellé de Category, et sur aucun roll de Category.
4. Given un roll qui repasse à 12 articles ou moins, When le site est reconstruit, Then sa page `/p/2` répond 404 et sa première page ne lie plus de page suivante.
5. Given la page `/p/2` d'un roll, When le lecteur suit le lien de la page précédente, Then il arrive sur la première page, à son adresse sans `/p/` ; `/p/1` répond 404 (décisions de l'epic du 2026-10-06).
6. Given une traduction signalée obsolète et toujours publiée, When le site est reconstruit, Then elle reste dans les rolls de sa Locale.
7. Given la page 2 d'un roll, When le lecteur change de Locale par l'en-tête, Then il arrive sur la première page du même roll dans l'autre Locale, ou sur sa landing page quand ce roll n'y existe pas.
8. Given une Category dont le libellé reste dans la page copy d'une Locale alors qu'aucun de ses articles publiés ne la revendique plus, When le site est reconstruit, Then le pied de page de cette Locale ne la lie pas.

### Les questions ouvertes de la story

OQ-BLOGROLLS-1 : la Proposition tient. `NotesPreview` porte déjà date, titre, Category et lien, chaque texte passé par le site. Ce qu'elle entraîne :

- le roll ne montre ni excerpt ni couverture, que la section n'a pas ;
- le `h1` de la page est du balisage du site, la section n'ayant qu'un `h2` ; lui donner un niveau de titre toucherait le design system et ferait se croiser les Boundaries du batch B1 ;
- la section rend son surtitre et son titre même vides : Gap-BLOGROLLS-3.

Écartés : tout en balisage du site, qui referait la liste ; une nouvelle section, contraire à la décision de l'epic du 2026-08-02.

OQ-BLOGROLLS-2 : la Proposition tient, l'en-tête portant déjà le contact et un lien par autre Locale. Deux précisions : la colonne se dérive des Categories publiées, jamais de la table des libellés (cas 8) ; la page 404 montre la colonne de la Locale que la route racine lui attribue.

### Partage avec seo-excellence

- Tient : blog-rolls écrit la page copy des pages de listing, head compris ; seo-excellence déclare canonical URL, hreflang, indexabilité, sitemap, aperçu et données structurées ; la racine garde `noindex` jusqu'à go-live. Un seul `h1` par page (AC-SEOEXCELLENCE-6) tient avec le `h1` du site et la liste sans titre.
- Tient : ce que seo-excellence attend de blog-rolls existe, à savoir les rolls rendus pour AC-SEOEXCELLENCE-2, 3 et 7, et la page de Category vers laquelle pointe le fil d'Ariane d'un article.
- Ne tient pas : le fil d'Ariane d'une page de listing, que la story confie à seo-excellence et qu'aucun de ses AC ne livre (Gap-BLOGROLLS-4).

### Cohérence avec drop-section-default-copy

- Boundaries disjointes sous la Proposition d'OQ-BLOGROLLS-1 : blog-rolls ne touche aucun fichier du design system. AC-SECTIONCOPY-5 et la ligne de Dependencies, qui parlent d'une section que blog-rolls créerait ou étendrait, couvrent le cas où OQ-BLOGROLLS-1 serait tranchée autrement.
- Comportements liés : la liste ne se rend proprement sans surtitre ni titre qu'après drop-section-default-copy (Gap-BLOGROLLS-3).
- AC-SECTIONCOPY-3 dit qu'une prop vide masque son élément « comme aujourd'hui » : faux pour le surtitre et le titre de `NotesPreview`.

---

## 1. Rôle du produit

L'accueil du blog et les rolls de Category de chaque Locale qui publie, paginés par 12, et la colonne de liens du pied de page. Ce n'est ni la déclaration SEO de ces pages (seo-excellence), ni une recherche, ni des pages de tag, ni un changement du design system.

**Décision (autonome):** un roll liste les articles publiés d'une Locale, tous ou ceux d'une Category, du plus récent au plus ancien ; aucune autre sélection (featured, tags).

Rationale : c'est ce que promettent les deux liens qui y mènent déjà.

---

## 2. Public cible

Le lecteur arrivé par le lien de Category d'un article ou par « tous les articles » d'une landing page, qui lit une seule Locale ; après go-live, celui qui vient d'un moteur de recherche. Second persona : Nicolas éditeur, qui publie un article et attend que rolls et pied de page suivent sans code, sauf le libellé d'une Category nouvelle dans chaque Locale où elle paraît.

**Décision (autonome):** le lecteur d'une Locale est la référence ; aucun roll ne mêle les Locales.

Rationale : chaque Locale vit sous son préfixe et l'en-tête change de Locale.

---

## 3. Problème

13 pages liées depuis chaque article et chaque landing page affichent leur titre et leur adresse. Le lecteur qui suit une Category tombe dans une impasse, et le pied de page ne lie rien.

**Décision (autonome):** le problème traité est la navigation dans le corpus d'une Locale ; la découverte (Related articles) reste à seo-excellence.

Rationale : AC-SEOEXCELLENCE-5 porte déjà les Related articles.

---

## 4. Proposition de valeur

Options considérées :

- Retirer les liens vers les pages de listing : l'article perd sa sortie, et une Category n'a plus sa page, contre le glossaire (« Chaque category a sa propre page »).
- Une seule page de tous les articles : même défaut pour les Categories.
- Rendre les rolls depuis l'index lu au build : URL, roll size et index existent déjà.

**Décision (autonome):** rendre les rolls depuis l'index.

Rationale : il ne manque que le rendu, sans coût à l'exécution (BR-PYRAMID-7).

---

## 5. Périmètre fonctionnel

Dedans : les quatre routes de listing, leur page copy head comprise, la pagination, la colonne du pied de page, le retrait de `RoutePlaceholder`.

Dehors : tout ce que la page déclare et le fil d'Ariane (seo-excellence) ; les pages de tag (décision de seo-excellence du 2026-07-29) ; excerpt et couverture dans le roll (suite de la Proposition d'OQ-BLOGROLLS-1) ; la section de notes des landing pages, dates comprises ; toute modification du design system ; l'ouverture à l'indexation (go-live).

**Décision (autonome):** le périmètre de la story, sans ajout.

Rationale : le partage avec seo-excellence tient, à un point près (Gap-BLOGROLLS-4).

---

## 6. Fonctionnalités clés

### Feature : accueil du blog

Capability : sous un titre de la page copy, les articles publiés de la Locale, 12 au plus, chacun avec titre, date, libellé de Category et lien. Rendu par `NotesPreview` sans surtitre ni titre, sous un `h1` du site (Proposition d'OQ-BLOGROLLS-1).

Acceptance Criteria : AC-BLOGROLLS-1, AC-BLOGROLLS-6 (`es`)
- Proposés à storyman : cas 1, 3, 6.

Test Approach : tests vitest de `page-data` sur le corpus de fixture (filtre de Locale, ordre, 12 au plus) ; rendu statique de la page, ancres présentes sans bundle client ; `check-route-table` (pages construites égales aux pages dérivées, aucune page en repli Suspense).

---

### Feature : roll de Category

Capability : la même liste, limitée aux articles de la Locale qui revendiquent la Category, titrée par son libellé dans la Locale.

**Décision (autonome):** sur un roll de Category, un article ne porte pas le libellé de sa Category.

Rationale : la page le porte déjà en titre, et `NotePost` masque un tag vide.

Acceptance Criteria : AC-BLOGROLLS-2, AC-BLOGROLLS-6 (`theory`, article dépublié)
- Proposés à storyman : cas 2, 8.

Test Approach : mêmes tests de `page-data` ; sur la build réelle, `theory` sous `/fr` seulement et `agence-web-ou-freelance` dans aucun roll.

---

### Feature : pagination

Capability : la première page sans `/p/`, puis `/p/{n}` par tranche de 12, chaque page liant la précédente et la suivante.

**Décision (autonome):** les pages voisines se lisent dans le jeu d'URL de `urlSet`, jamais recalculées ; le `h1` reste le même sur chaque page du roll, le numéro de page n'entrant que dans le head ; les libellés des liens parlent de temps (plus récents, plus anciens), dans la page copy.

Rationale : `urlSet` est l'unique calcul du nombre de pages (R-URLSCHEME-22), et un roll va du plus récent au plus ancien.

Acceptance Criteria : AC-BLOGROLLS-3
- Proposés à storyman : cas 4, 5, 7.

Test Approach : fixture de 25 articles dans une Locale (première page, `/p/2`, `/p/3`, liens), puis de 12 (plus de `/p/2`) ; `check-route-table` sur le compte des pages.

---

### Feature : page copy des pages de listing

Capability : titre visible, titre et description du head, libellés de pagination, tous dans la page copy de la Locale ; un head propre à chaque page, page 2 comprise.

**Décision (autonome):** un modèle par Locale et par sorte de page, complété du libellé de Category et du numéro de page (OQ-BLOGROLLS-6).

Rationale : 13 textes écrits à la main pour des pages qui naissent et disparaissent avec les articles.

Acceptance Criteria : AC-BLOGROLLS-4

Test Approach : un spec sur le head de chaque page dérivée, titres et descriptions tous distincts ; la garde contre le texte du prototype reprend le mécanisme que drop-section-default-copy donnera au test d'AC-LANDING-2.

---

### Feature : colonne du pied de page

Capability : sur toute page d'une Locale qui publie, une colonne titrée dans la page copy, qui lie l'accueil du blog puis chaque Category publiée de la Locale ; aucune colonne ailleurs (Proposition d'OQ-BLOGROLLS-2).

**Décision (autonome):** les Categories viennent du jeu d'URL, rangées par ordre alphabétique de leur libellé dans la Locale.

Rationale : chaque lien vise alors une page construite, et le lecteur lit des libellés, pas des slugs (`vie privée` après `typescript` en `fr`).

Acceptance Criteria : AC-BLOGROLLS-5, AC-BLOGROLLS-6
- Proposé à storyman : cas 8.

Test Approach : `chrome.spec.tsx` sur des Categories de fixture ; sur la build réelle, pied de page `en` sans `théorie`, pied de page `es` sans colonne.

---

## 7. Cas limites critiques

Les huit cas proposés à storyman plus haut. Les deux qui engagent le plus : la date sans année (cas 1), visible dès aujourd'hui sur un corpus de 2019 à 2022, et la Category gardée dans la table des libellés après le départ de son dernier article (cas 8), qui donnerait un lien vers une 404.

**Décision (autonome):** les cas 1 à 8 entrent dans les AC ; la Locale par défaut sans article attend Gap-BLOGROLLS-5.

Rationale : chacun se teste sur fixture ou sur le corpus réel.

---

## 8. Contraintes non fonctionnelles

- Prérendu : la page se lit et se parcourt sans JavaScript ; aucune lecture du corpus à la requête (BR-PYRAMID-7).
- Valeurs du design system seulement, pour le `h1` et la pagination (BR-PYRAMID-6) ; tout texte vient du site (BR-PYRAMID-8).
- Articles publiés seulement (BR-PYRAMID-10).
- Aucune télémétrie (BR-PYRAMID-2).
- `noindex` hérité de la racine jusqu'à go-live ; blog-rolls ne déclare rien.
- Coût : 13 fichiers de données de rolls et ceux du pied de page, sans image ; aucun coût d'hébergement.

**Décision (autonome):** la pagination est une `nav` libellée par la page copy.

Rationale : le seul repère qu'un lecteur d'écran trouve entre deux pages d'un roll.

---

## 9. Dépendances externes

Aucune nouvelle. Server functions statiques de TanStack Start, déjà en place pour les pages article et les counterparts ; Netlify, qui publie `dist/client` ; le module `@robusta/pyramids-design-system`, inchangé.

**Décision (autonome):** aucune bibliothèque ajoutée, pagination comprise.

Rationale : `urlSet` calcule déjà les pages.

---

## 10. Risques majeurs

- Ordre du batch : livré avant drop-section-default-copy, blog-rolls montre un titre vide ou le texte du prototype (Gap-BLOGROLLS-3).
- Pagination prouvée sur fixture seulement : le 13e article d'une Locale crée `/p/2` d'un coup. Atténué par `check-route-table`.
- Pages de listing minces à go-live, des titres sans excerpt : seo-excellence les tient pour indexables (décision du 2026-07-30 sur une Category d'un article).
- Deux formats de date si le roll prend l'année et la section de notes non.

**Décision (autonome):** aucun risque bloquant hors Gap-BLOGROLLS-3.

Rationale : les autres sont couverts par un contrôle de build ou par une décision déjà prise.

---

## 11. Boundaries

```
  Packages of app `@robusta/robusta-build`. Every arrow is library.
  Arrow = depends on, from client code to the API it uses. No loop.

                          routes [modified]
          ┌──────────────────┼─────────────────────┐
          ↓                  ↓                     ↓
    listing [new] ───→ page-data [modified]   chrome [modified]
          │                  │                     │
          │                  ↓                     │
          │           routing · content            │
          │                  ↑                     │
          │         scripts [modified]             │
          │                                        │
          └──────→ seopyramids.config [modified] ←─┘

  routes also reads seopyramids.config, for the heads.
  components [modified] loses RoutePlaceholder, which nothing uses.
```

`chrome` ne lit pas `page-data` : la route racine lui passe les Categories de la Locale, comme elle passe les counterparts à `Header`. Les noms marqués `[new]` sont provisoires, au design de les fixer.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /{locale}/articles`, `GET /{locale}/articles/c/{category}` · modifiés — 200 avec le roll ; 13 pages aujourd'hui
- `GET /{locale}/articles/p/{n}`, `GET /{locale}/articles/c/{category}/p/{n}` · modifiés — construites dès qu'un roll dépasse 12 articles ; 404 pour `n` = 1 et au-delà de la dernière page
- `GET /es/articles` · inchangé — 404 tant que `es` ne publie rien
- `GET` sur tout document · modifié — le pied de page porte la colonne de sa Locale
- fichiers de données du prérendu · modifiés — un par page de listing, plus ceux de la colonne du pied de page

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, Nicolas.

- `yarn build` · modifié — son contrôle de la route table compte les fichiers de données des rolls et du pied de page ; échoue en nommant la Category et la Locale quand une Category publiée n'a pas de libellé dans sa Locale

### library API of package `page-data` in app `@robusta/robusta-build` — modified

Client code : package `routes`, les quatre routes de listing et la route racine ; package `listing`, pour le type.

- `PageData` · modifié
  - `getRollPage` · nouveau — une page d'un roll : ses articles et ses pages voisines, lues dans le jeu d'URL
  - `getLocaleCategories` · nouveau — les Categories publiées d'une Locale, lues dans le même jeu d'URL ; un fichier de données par Locale
- `RollPage` · nouveau — ce que reçoit une page de listing ; ses articles sont des `NotePost`

### library API of package `listing` in app `@robusta/robusta-build` — new

Client code : package `routes`.

- `ListingPage` — le `h1`, la liste par `NotesPreview` sans surtitre ni titre, la pagination

### library API of package `chrome` in app `@robusta/robusta-build` — modified

Client code : la route racine.

- `Footer` · modifié — reçoit en plus de la Locale ses Categories publiées ; rend une colonne, ou aucune

### library API of package `seopyramids.config` in app `@robusta/robusta-build` — modified

Client code : packages `routes`, `listing`, `chrome`.

- `PageCopy` · modifié — `listing` porte, par Locale, les modèles du head, le titre visible de l'accueil du blog, les libellés de pagination, le titre de la colonne et le libellé de son lien vers l'accueil du blog
- `getCategoryLabel` · inchangé — seule source du libellé d'une Category

### library API of package `components` in app `@robusta/robusta-build` — modified

- `RoutePlaceholder` · retiré — plus aucun client

---

## Open Questions & Gaps

### Gaps

- Gap-BLOGROLLS-3 : La liste d'articles du design system rend un titre vide, ou celui du prototype s'il manque ; blog-rolls attend-il le retrait des textes par défaut des sections ?
- Proposition : oui. blog-rolls dépend de drop-section-default-copy et ne passe à la liste ni surtitre ni titre, que cette story cesse de rendre quand ils manquent ; l'« ordre libre » de drop-section-default-copy devient « avant blog-rolls ».
- Rationale : livré avant, blog-rolls choisirait entre un `h2` vide sous le titre de la page et un surtitre écrit pour remplir la section ; toucher la section ferait se croiser les Boundaries du batch.
- Resolution: lgtm

- Gap-BLOGROLLS-4 : La story confie à seo-excellence le fil d'Ariane des pages de listing, qu'aucun de ses critères ne livre ; une page de Category montre-t-elle un fil d'Ariane ?
- Proposition : oui, livré par seo-excellence, dont le critère du fil d'Ariane s'étend aux pages de Category : accueil du blog puis Category, sur chaque page du roll. L'accueil du blog n'en montre pas, et blog-rolls n'en rend aucun.
- Rationale : le brainstorm de seo-excellence le prévoyait, et une donnée structurée de fil d'Ariane exige qu'il soit affiché ; sans lui, une page de Category ne lie l'accueil du blog que par le pied de page.
- Resolution: lgtm

- Gap-BLOGROLLS-5 : La story retire l'accueil du blog d'une Locale sans article, le schéma garde celui de la Locale par défaut ; un accueil du blog vide peut-il exister ?
- Proposition : oui, pour la Locale par défaut seule. La story suit le schéma, et son cas limite vise une Locale autre que la Locale par défaut ; vide, `/en/articles` montrerait son titre et aucun article.
- Rationale : le cas ne se produit pas tant que `en` publie 8 articles, et changer la règle déplacerait le jeu d'URL pour une page qu'aucun lien ne viserait.
- Resolution: lgtm

---

## Next Steps

- `bulkman pyramid-v2-epic` : Gap-BLOGROLLS-3 à 5 rejoignent OQ-BLOGROLLS-1 et 2 de la story dans le bulk du batch.
- `storyman update blog-rolls avec brainstorm` : les cas 1 à 8, la précision d'AC-BLOGROLLS-4 sur les modèles, les Boundaries (package `listing` nouveau, `components` modifié, CLI de build, deux fonctions de `page-data`), OQ-BLOGROLLS-6 replié, et Dependencies selon Gap-BLOGROLLS-3.
- `storyman update drop-section-default-copy` : AC-SECTIONCOPY-3, faux pour le surtitre et le titre de `NotesPreview` ; Dependencies selon Gap-BLOGROLLS-3 ; à son design, la tête de `NotesPreview` sans surtitre, titre ni lien, qui garde sa marge basse.
- `storyman update seo-excellence` : sa Dep 2 dit encore « pas encore de story » ; la clause d'AC-SEOEXCELLENCE-2 sur le placeholder n'a plus d'objet après blog-rolls ; le fil d'Ariane selon Gap-BLOGROLLS-4. À son design : un hreflang tiré de `counterpartsOf` envoie la page `n` vers une page 1, que la réciprocité d'AC-SEOEXCELLENCE-6 refusera dès qu'une page 2 existe.
- `designman blog-rolls`, sans attendre le bulk : il suit les Propositions.
