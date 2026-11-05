# Design: les pages de listing de robusta.build

**Last update:** 2026-11-04
**Feature:** blog-rolls
**Infix:** BLOGROLLS
**Status:** IMPLEMENTED (2026-11-04, commit bc568f7)
**Sources:** [story](blog-rolls.story.md), [brainstorm](blog-rolls.brainstorm.md), [epic](../../pyramid-v2.epic.md), [drop-section-default-copy](../drop-section-default-copy/drop-section-default-copy.design.md), [multilingual-site](../../multilingual-site/multilingual-site.design.md), [default-locale-at-root](../default-locale-at-root/default-locale-at-root.design.md)

## Goal

Les quatre routes de listing rendent leur blog roll depuis l'index lu au build : un `h1` du site, la liste par `NotesPreview`, la pagination lue dans le jeu d'URL, et un head tiré de modèles de la page copy. Le pied de page gagne une colonne : l'accueil du blog et les Categories publiées de la Locale. Le pourquoi : [story](blog-rolls.story.md).

Le design suit les décisions de la story : la liste par `NotesPreview` sans surtitre ni titre, aucune Section nouvelle du design system ; une seule colonne de pied de page ; drop-section-default-copy livrée d'abord ; aucun fil d'Ariane ; l'accueil du blog de la Locale par défaut construit même vide, aucun pour une autre Locale sans article.

## Boundaries

```
  Packages de l'app `@robusta/robusta-build`. Flèche : client code ──→ API,
  toutes library. Aucune boucle.

                         routes [modified]
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
      listing [new] ──→ page-data [modified]  chrome [modified]
        │      │             │                │       │
        │      │             ↓                │       │
        │      │          content             │       │
        │      ↓                              │       │
        │    seopyramids.config [modified] ←──┘       │
        ↓                                             │
      url-scheme [modified], dans routing ←───────────┘
        ↑
      scripts [modified], par .routing-dist

  page-data lit aussi url-scheme ; listing lit aussi components (SiteLink).
  components [modified] perd RoutePlaceholder.
  Autre zoom : listing et chrome ──→ module `@robusta/pyramids-design-system`,
  inchangé.
```

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers. `en`, la Locale par défaut, sans préfixe ; `{locale}` vaut `fr` ou `es` (BR-PYRAMID-14).

- `GET /articles`, `GET /{locale}/articles` — 200, première page de l'accueil du blog : `/articles` et `/fr/articles` aujourd'hui.
- `GET /articles/c/{category}`, `GET /{locale}/articles/c/{category}` — 200, première page du roll de la Category : 11 aujourd'hui, 5 sous `/articles`, 6 sous `/fr/articles` dont `theory` ; `/articles/c/theory` répond 404.
- `GET /articles/p/{n}`, `GET /articles/c/{category}/p/{n}` et leurs formes `/{locale}/…` — 200 de `n = 2` à la dernière page, aucune aujourd'hui ; 404 par `404.html` pour `n = 1` et au-delà de la dernière, sans règle : aucun fichier n'y est écrit.
- `GET /es/articles…` — 404, inchangé tant que `es` ne publie rien.
- `GET /en/articles…` — 301 de l'hébergeur vers la forme sans préfixe, inchangé (`netlify.toml`).
- Le head d'une page de listing : `<title>` et `description` de `listingHead`, par-dessus ceux de la racine ; `robots: noindex, nofollow` reste celui de la racine.
- `GET` sur tout document — le pied de page porte la colonne de la Locale du document : aucune sous `/es`, celle de `en` sur `404.html`. Le lien d'en-tête vers une autre Locale ne change pas : depuis `/p/{n}`, `counterpartsOf` mène à la première page du même roll, ou à la landing page : de `/articles/p/2` à `/fr/articles`.
- `GET /__tsr/staticServerFnCache/{sha1}.json` — 16 fichiers de plus : un par page de listing (13) et un par Locale pour le pied de page (3), 69 au total aujourd'hui.

### CLI API of app `@robusta/robusta-build` — modified

Client code : `yarn build`, la build Netlify.

- `node scripts/check-route-table.mjs`, dernière étape de `yarn build` — exit 1 quand les fichiers de données diffèrent du compte dû, qui inclut désormais les pages de listing et le pied de page. Inchangés : exit 1 sur une page de listing dérivée et non écrite, ou écrite autour d'un rendu qui a levé, libellé de Category manquant compris.
- stdout de succès : `… 69 data files written (17 article pages, 3 notes feeds, 33 counterparts, 13 roll pages, 3 locale rolls).`
- `expectedDataFiles({ landings, content })` rend `{ articles, notesFeeds, counterparts, rollPages, localeRolls }` : `rollPages` compte les pages `blog-home` et `category` de `content`, `localeRolls` les landing pages.

### library API of package `url-scheme` in package `routing` — modified

Client code : `page-data`, `listing`, `chrome`, `routes`.

```ts
type PageUrl; // unchanged

/** new — a page of a roll: a blog home or a Category page */
type RollUrl = Extract<PageUrl, { kind: 'blog-home' } | { kind: 'category' }>;
```

### library API of package `page-data` in app `@robusta/robusta-build` — modified

Client code : `routes`, les quatre routes de listing et la route racine ; `listing`, pour le type.

```ts
type NotePost; // design system, unchanged
type RollUrl;  // url-scheme, new

type RollPage = {
  locale: string;
  /** absent on a blog home */
  category?: string;
  /** newest first, ROLL_SIZE at most */
  posts: NotePost[];
  /** absent on the first page; on page 2, the first page, without /p/ */
  previousUrl?: string;
  /** absent on the last page */
  nextUrl?: string;
};

interface PageData {
  /** new — one page of a roll, a data file per page at prerender. At build, throws naming the page when the URL set does not hold it. */
  getRollPage(call: { data: RollUrl }): Promise<RollPage>;
  /** new — the first page of each roll of a Locale, blog home first; empty when the Locale publishes no article. A data file per Locale. */
  getLocaleRolls(call: { data: { locale: string } }): Promise<RollUrl[]>;
  // getArticlePage, getNotesFeed, getCounterparts unchanged
}
```

Garanties :

- Un post de `RollPage` est un `NotePost` : titre, URL canonique de l'article, date dans la Locale de la page avec jour, mois abrégé et année ; ni excerpt ni couverture, que `NotePost` ne porte pas. Son `tag` est le slug de sa Category sur un accueil du blog, comme pour `getNotesFeed`, et manque sur un roll de Category ou pour un article sans Category (BR-PYRAMID-9).
- Pages voisines et premières pages se lisent dans le jeu d'URL de `contentUrls()`, jamais recalculées (R-URLSCHEME-22). Les articles sont ceux de l'index, donc publiés (BR-PYRAMID-10), une traduction obsolète comprise.
- `getLocaleRolls` suit le jeu d'URL : Categories dans son ordre, par slug, et `[]` pour une Locale sans article publié, Locale par défaut comprise, dont l'accueil du blog vide reste construit (AC-BLOGROLLS-6).
- Le validateur de `getRollPage` refuse une entrée qui n'est pas une `RollUrl` à page entière ; celui de `getLocaleRolls`, une entrée dont `locale` n'est pas une chaîne.

Client code, dans `src/routes/__root.tsx` :

```ts
handler: async ({ location }) => {
  const page = parseUrl(urlScheme, location.pathname);
  const locale = page?.locale ?? urlScheme.defaultLocale;
  const [counterparts, rolls] = await Promise.all([
    page === undefined ? [] : getCounterparts({ data: page }),
    getLocaleRolls({ data: { locale } }),
  ]);
  return { locale, counterparts, rolls };
},
```

### library API of package `listing` in app `@robusta/robusta-build` — new

Client code : `routes`, les quatre routes de listing. Entrée `src/listing/index.ts`, à côté de `article` et `landing` : `components` ne garde que les pièces que plusieurs sortes de page partagent.

```ts
type RollPage, RollUrl;

/** the h1, the roll by NotesPreview, then the nav between the pages of the roll when it has another page */
function ListingPage(props: { page: RollPage }): JSX.Element;
/** the route head: title and description from the head model of the page's Locale and kind, filled with the Category label and, from page 2, the page number */
function listingHead(page: RollUrl): {
  meta: [{ title: string }, { name: 'description'; content: string }];
};
```

Garanties :

- `h1` : `listing.blogTitle` sur l'accueil du blog, le libellé de la Category sur son roll, le même sur chaque page du roll.
- `NotesPreview` reçoit les posts, chaque `tag` remplacé par `getCategoryLabel(locale, tag)`, et `linkComponent={SiteLink}`, sans `eyebrow`, `title` ni `allLinkLabel`. Elle ne rend alors ni surtitre ni `h2` (R-SECTIONCOPY-02) ; sa tête vide reste rendue avec sa marge basse, conteneur que drop-section-default-copy garde.
- La pagination est un `nav` nommé par `pagination.navLabel` : `newerLabel` vers `previousUrl`, `olderLabel` vers `nextUrl`, chacun s'il existe. Aucun fil d'Ariane : seo-excellence le porte (story, §Partage avec seo-excellence).
- Rien ne rattrape l'erreur de `getCategoryLabel`.

Client code, dans `src/routes/$locale/articles/c/$category/p/$n.tsx` :

```tsx
import { ListingPage, listingHead } from '@/listing/index.ts';
import { getRollPage } from '@/page-data/index.ts';

// rollAt(params): the RollUrl the params name, `page: Number(params.n)`
export const Route = createFileRoute('/{-$locale}/articles/c/$category/p/$n')({
  head: ({ params }) => listingHead(rollAt(params)),
  loader: ({ params }) => getRollPage({ data: rollAt(params) }),
  component: () => <ListingPage page={Route.useLoaderData()} />,
});
```

### library API of package `chrome` in app `@robusta/robusta-build` — modified

Client code : la route racine.

```ts
/** SiteFooter in the page copy of `locale`, with one column when `rolls` is not empty */
function Footer(props: { locale: string; rolls: RollUrl[] }): JSX.Element; // `rolls` new
```

Garanties :

- La colonne : titre `listing.footer.title`, l'accueil du blog sous `listing.footer.blogHomeLabel`, puis chaque Category sous son libellé, rangées par ordre alphabétique de libellé selon la collation de la Locale ; chaque item a son `href` par `buildUrl`.
- `rolls` vide : `columns={[]}`, comme aujourd'hui. Tagline, copyright, `versionLine=""` et `Header` ne changent pas.
- Rien ne rattrape l'erreur de `getCategoryLabel`.

Client code, dans `RootDocument` :

```tsx
const { locale, counterparts, rolls } = Route.useLoaderData();
// …
<Header locale={locale} counterparts={counterparts} />
{children}
<Footer locale={locale} rolls={rolls} />
```

### library API of the Site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

Client code : `listing`, `chrome`, `routes` ; `landing` et `article`, inchangés.

```ts
interface PageCopy {
  listing: ListingCopy; // was { blogTitle: string }
  /** every page of the Locale but its landing page and its listing pages */
  head: { title: string; description: string }; // shape unchanged
  // … unchanged
}

interface ListingCopy {
  /** h1 of every page of the blog home's roll — unchanged */
  blogTitle: string;
  /** `{category}` stands for the Category label, `{page}` for the page number */
  head: {
    blogHome: { title: string; description: string };
    category: { title: string; description: string };
    /** appended to the title and to the description from page 2 on */
    pageSuffix: string;
  };
  pagination: { navLabel: string; newerLabel: string; olderLabel: string };
  footer: { title: string; blogHomeLabel: string };
}
```

`getPageCopy` et `getCategoryLabel` ne changent pas ; `getCategoryLabel` reste la seule source du libellé d'une Category.

### library API of package `components` in app `@robusta/robusta-build` — modified

- `RoutePlaceholder` · retiré avec son spec : les quatre routes de listing étaient ses seuls clients.

## Technical Constraints

- Server functions statiques de TanStack Start (`staticFunctionMiddleware`) : le handler ne tourne qu'au prérendu, et chaque entrée distincte écrit un fichier sous `__tsr/staticServerFnCache`, que lit une navigation client hydratée. `getLocaleRolls` écrit donc un fichier par Locale, la 404 partageant celui de `en`.
- Le segment optionnel `{-$locale}` est résolu par la route `/{-$locale}` (`localeOfSegment`) : `params.locale` est toujours une Locale du site, la Locale par défaut quand le segment manque, et `/en/…` n'atteint aucune route. Une route de listing ne relit pas le chemin.
- L'environnement client ne peut pas importer `src/content/**` (`importProtection`) : `listing` et `chrome` ne reçoivent leurs données que par `page-data`, et n'en importent que des types.
- Le loader racine se relance à chaque navigation client (`shouldReload`, `staleReloadMode: 'blocking'`) : ses deux appels partent en parallèle.
- Un libellé de Category manquant fait échouer la build par le rendu (décision de l'epic du 2026-10-30) : sous une frontière Suspense, la page sort avec le repli `<!--$!-->` que `check-route-table` refuse, le log du prérendu nommant la Category et la Locale. Une Category du pied de page a toujours sa page de roll, rendue sous une telle frontière : le contrôle la voit, quel que soit le sort de l'erreur levée dans le shell.
- `check-route-table.mjs` ne lit que `routing` et `content`, compilés sous `.routing-dist` : il compte les nouveaux fichiers depuis `contentUrls()` et `landingPages()`, jamais depuis `page-data` ni `seopyramids.config`, dont l'import PNG exige le bundler.
- Dates par `Intl.DateTimeFormat` en UTC depuis la date calendaire, comme `notes-feed` : le fuseau de la machine de build les décalerait d'un jour.
- Netlify sert `404.html` pour tout chemin sans fichier, et `dist/client` est réécrit à chaque build : une page `/p/2` qui disparaît ne laisse rien derrière elle.
- Aucun `'use client'` ni `'use server'` sous `src` ; imports locaux à leur vraie extension `.ts` ou `.tsx`, que `check:source` vérifie.
- Le site lit le design system par son `dist/` : ses tests ne voient drop-section-default-copy qu'après `yarn build:deps`.

## Requirements

### Données des rolls

- R-BLOGROLLS-01 : `url-scheme` exporte `RollUrl`, la `PageUrl` d'une page de roll.
- R-BLOGROLLS-02 : `getRollPage` rend les articles de la page `n` d'un roll, tranche de `ROLL_SIZE` des articles de sa Locale, ceux de sa Category sur un roll de Category, du plus récent au plus ancien, lus au build (BR-PYRAMID-7, BR-PYRAMID-10).
- R-BLOGROLLS-03 : la date d'un post porte jour, mois abrégé et année, écrits dans la Locale de la page ; son `tag`, slug de la Category, n'existe que sur un accueil du blog et pour un article qui en revendique une (BR-PYRAMID-9).
- R-BLOGROLLS-04 : `previousUrl` et `nextUrl` sont les pages `n - 1` et `n + 1` du même roll prises dans le jeu d'URL et construites par `buildUrl` ; la précédente de la page 2 est la première page, sans `/p/`.
- R-BLOGROLLS-05 : au build, `getRollPage` lève en nommant la page quand le jeu d'URL ne la porte pas.
- R-BLOGROLLS-06 : `getLocaleRolls` rend la première page de chaque roll de la Locale prise dans le jeu d'URL, accueil du blog d'abord, et `[]` pour une Locale sans article publié.

### Page de listing

- R-BLOGROLLS-21 : un package `src/listing`, entrée `index.ts`, exporte `ListingPage` et `listingHead`.
- R-BLOGROLLS-22 : `ListingPage` rend dans un `<main>` le `h1` du roll, puis `NotesPreview` sans surtitre, titre ni lien vers tous les articles, les Categories nommées par `getCategoryLabel` dans la Locale de la page.
- R-BLOGROLLS-23 : la pagination est un `nav` nommé par la page copy, qui lie la page précédente et la suivante quand elles existent ; un roll d'une seule page n'en a pas.
- R-BLOGROLLS-24 : le `h1` et la pagination ne portent que des valeurs du design system, `var(--…)` en style inline comme `ArticleView`, et aucune classe hors de lui (BR-PYRAMID-6).
- R-BLOGROLLS-25 : `listingHead` rend le head de la route, `title` puis `description` : le modèle de la Locale et de la sorte de page, `{category}` rempli par le libellé, et dès la page 2 `pageSuffix`, `{page}` rempli, ajouté au titre et à la description.
- R-BLOGROLLS-26 : les quatre routes de listing, sous `/{-$locale}/articles`, chargent `getRollPage`, posent le head de `listingHead` et rendent `ListingPage` ; `RoutePlaceholder` et son spec disparaissent.
- R-BLOGROLLS-27 : chaque texte lisible d'une page de listing, en-tête et pied de page compris, est une valeur de la page copy de sa Locale, un libellé de Category, le titre ou la date d'un article du roll, le `localeName` d'une autre Locale, `contact.email` ou la marque : l'inventaire de R-SECTIONCOPY-41, étendu aux pages de listing (BR-PYRAMID-8).

### Page copy

- R-BLOGROLLS-41 : `PageCopy.listing` devient `ListingCopy`, rempli pour `en`, `fr` et `es`, et le commentaire de `PageCopy.head` exclut les pages de listing.
- R-BLOGROLLS-42 : chaque modèle de head est une phrase de la langue de sa Locale, et chaque modèle de Category porte `{category}` : `articles` et les quatre libellés que `en` et `fr` partagent donnent des heads distincts.

### Pied de page

- R-BLOGROLLS-61 : le loader de la route racine charge `rolls` par `getLocaleRolls` pour la Locale de la page, la Locale par défaut hors du schéma et sur la 404, et `RootDocument` le passe à `Footer`.
- R-BLOGROLLS-62 : `Footer` rend une colonne quand `rolls` n'est pas vide : l'accueil du blog puis chaque Category, rangées par ordre alphabétique de libellé dans la Locale ; sinon aucune.
- R-BLOGROLLS-63 : ni `Footer`, ni `ListingPage`, ni `listingHead` ne rattrapent l'erreur de `getCategoryLabel`.

### Contrôle de build

- R-BLOGROLLS-81 : `expectedDataFiles` compte un fichier par page de listing du jeu d'URL et un par landing page pour le pied de page ; la ligne de succès et le message d'écart nomment ces deux sources.

## Acceptance Criteria

- AC-BLOGROLLS-1 : Given une Locale qui publie des articles, When un visiteur ouvre son accueil du blog, Then il lit sous un titre de la page copy les articles publiés de cette Locale et d'elle seule, du plus récent au plus ancien, 12 au plus, chacun avec son titre, sa date année comprise et le libellé de sa Category, sans excerpt ni couverture, chacun menant à sa page article ; la page se lit et se parcourt sans JavaScript, et plus aucune page de listing ne montre de placeholder ni son adresse.
- AC-BLOGROLLS-2 : Given une page article qui revendique une Category, When le visiteur suit son lien de Category, Then il arrive sur le roll de cette Category dans la Locale de l'article, titré par son libellé dans cette Locale, qui ne liste que les articles de cette Locale qui la revendiquent, sans répéter ce libellé sur chacun ; le lien « tous les articles » d'une landing page mène de même à l'accueil du blog de sa Locale, `/articles` depuis `/`.
- AC-BLOGROLLS-3 : Given un roll de plus de 12 articles, When un visiteur le parcourt, Then la première page, sans `/p/` dans son adresse, montre les 12 plus récents, la page `/p/{n}` les 12 suivants, sous le même titre ; chaque page lie la précédente et la suivante quand elles existent, la précédente de `/p/2` étant la première page à son adresse sans `/p/`, et `/p/1` comme toute page au-delà de la dernière répond 404 ; depuis `/p/{n}`, changer de Locale par l'en-tête mène à la première page du même roll dans l'autre Locale, de `/articles/p/2` à `/fr/articles` par exemple, ou à sa landing page quand ce roll n'y existe pas ; tant qu'aucune Locale ne dépasse 12 articles, c'est prouvé sur un corpus de fixture.
- AC-BLOGROLLS-4 : Given toute page de listing, When un visiteur ou un moteur de recherche la lit, Then chaque texte vient de la page copy de sa Locale, sans un mot du prototype du design system ; son titre et sa description de head viennent d'un modèle par Locale et par sorte de page, accueil du blog ou roll de Category, que complètent le libellé de la Category et, dès la page 2, le numéro de page, et aucune autre page du site ne les partage, d'une autre Locale ou d'un autre rang du même roll.
- AC-BLOGROLLS-5 : Given une page d'une Locale qui publie des articles, When le visiteur lit le pied de page, Then il y trouve une seule colonne, titrée dans la page copy : l'accueil du blog puis chaque Category que revendique un article publié de cette Locale, libellée dans sa langue et rangée par ordre alphabétique de libellé, chaque lien menant à sa page.
- AC-BLOGROLLS-6 : Given les cas limites métier, When le site est reconstruit, Then une Category revendiquée par une seule Locale n'a de roll que dans celle-ci (`theory`, sous `/fr` seulement, `/articles/c/theory` répondant 404), et le pied de page des autres Locales ne la lie pas ; un article publié sans Category (BR-PYRAMID-9) figure sur l'accueil du blog de sa Locale sans libellé de Category, et sur aucun roll de Category ; une traduction signalée obsolète et toujours publiée reste dans les rolls de sa Locale ; une Locale autre que la Locale par défaut et sans article publié, `es` aujourd'hui, n'a ni accueil du blog ni colonne de liens, et `/es/articles` répond 404 ; la Locale par défaut garde son accueil du blog même vide, `/articles` montrant alors son titre et aucun article ; le premier article espagnol publié crée `/es/articles` et la page de sa Category, et sans libellé espagnol de cette Category la build échoue en nommant la Category et la Locale ; un article qui cesse de se déclarer publié quitte chaque roll (BR-PYRAMID-10), et une Category dont c'était le seul article perd sa page et son lien de pied de page, même si son libellé reste dans la page copy ; un roll qui repasse à 12 articles ou moins perd sa page `/p/2`, qui répond 404, et sa première page ne lie plus de page suivante.

Edge cases to test :

- un roll de fixture de 25 articles : 12 sur la première page, 12 sur `/p/2`, 1 sur `/p/3` ; la précédente de `/p/2` est la première page, `/p/3` n'a pas de suivante ;
- le même roll ramené à 12 articles : plus de `/p/2` dans le jeu d'URL, et la première page n'a pas de `nav` ;
- des articles datés de 2019 à 2022 : chaque date du roll porte son année ;
- un roll de Category : aucun post n'y porte de libellé ;
- `theory` : un roll sous `/fr` seulement, `/articles/c/theory` en 404, et le pied de page `en` ne lie pas `théorie` ;
- un article publié sans Category : sur l'accueil du blog sans libellé, sur aucun roll de Category ;
- une traduction obsolète publiée reste dans ses rolls ; `agence-web-ou-freelance`, non publié, n'est dans aucun ;
- une Category dont le seul article est dépublié, son libellé gardé dans la page copy : ni page, ni lien de pied de page ;
- `en` sans article de fixture : `/articles` construite, son `h1` et aucun post ni `nav`, et aucune colonne de pied de page ;
- `es` sans article : ni accueil du blog, ni colonne ; un article `es` de fixture crée `/es/articles` et la page de sa Category, et sans libellé `es` le rendu lève en nommant la Category et la Locale ;
- le pied de page `fr` range `vie privée` après `typescript` ; celui de `404.html` porte la colonne de `en` ;
- depuis `/p/2`, l'en-tête mène à la première page du même roll dans l'autre Locale, de `/articles/p/2` à `/fr/articles`, ou à sa landing page ;
- deux pages de listing, toutes Locales et tous rangs confondus, n'ont ni le même titre ni la même description de head : `/articles` et `/fr/articles` diffèrent alors que `blogTitle` vaut `articles` dans les deux.

## Dependencies

- Depends on : drop-section-default-copy, même batch B1, livrée avant blog-rolls (story, Dep 1). Absente, `null` ou `''`, une prop de texte d'une Section n'y rend pas son élément (R-SECTIONCOPY-02) : `NotesPreview` sans `eyebrow` ni `title` ne rend ni surtitre ni `h2`. Sans elle, la page de listing montrerait le texte du prototype sous son `h1`. R-BLOGROLLS-27 reprend l'inventaire de R-SECTIONCOPY-41.
- Blocks : seo-excellence, ses critères des pages de listing et le fil d'Ariane des pages de Category ; go-live.
- multilingual-site : levée, LANDED le 2026-10-31 (`fb4803b`).
- default-locale-at-root : levée, SUBMITTED le 2026-11-03 (`2fbc7be`). `buildUrl` sert déjà `en` sans préfixe : `previousUrl`, `nextUrl` et les liens du pied de page en héritent.
