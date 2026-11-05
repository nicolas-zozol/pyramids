# Design: La landing page de robusta.build

**Last update:** 2026-10-08
**Feature:** robusta-landing-page
**Infix:** LANDING
**Status:** IMPLEMENTED (2026-10-15, commit 79b4eb0)
**Sources:** [story](robusta-landing-page.story.md), [brainstorm](robusta-landing-page.brainstorm.md), [epic](../../pyramid-v2.epic.md), [design-system-responsive](../design-system-responsive/design-system-responsive.design.md), [tanstack-start-migration](../tanstack-start-migration/tanstack-start-migration.design.md), [default-locale-fr](../default-locale-fr/default-locale-fr.design.md)

## Goal

`/` remplace la démonstration du shell par la landing page : `Hero`, `PrinciplesList`, la section de notes et `CTA`, nourris par la page copy française que porte désormais la Site configuration. `SiteHeader` et `SiteFooter` habillent toutes les pages depuis la route racine. Le design system gagne une prop, `linkComponent`, par laquelle le site rend les ancres des surfaces avec `SiteLink`, donc par le router TanStack. Le pourquoi est dans la [story](robusta-landing-page.story.md).

## Ubiquitous Language

Termes du glossaire, version de HEAD : Landing page, Page copy, Site configuration, Design system, Design token, Locale, Published article, Category, Slug, Green set. Breakpoint s'emploie comme le définit la décision du 2026-10-08 de la story : les cinq largeurs de `sketch.css`, `sm`, `md`, `lg`, `xl` et `2xl` ; 320 px est le plancher des surfaces, pas un Breakpoint. « Appel au contact » est le terme de la story, hors glossaire.

## Business Rules (cited)

Version de HEAD de `business-rules.md`.

- BR-PYRAMID-3 — Each site must carry its own design system, which no other site may reuse.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-6 — Les design tokens et les breakpoints d'un site doivent provenir de son seul design system.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses (library).
  Packages of app `@robusta/robusta-build`. No loop.

                      `routes` [modified]
            ┌──────────────────┼────────────────────┐
            ↓                  ↓                    ↓
  `landing` [modified]  `chrome` [new]     `page-data` [modified]
      │         │         │        │
      │         └────┬────┘        │
      │              ↓             │
      │   `components` [modified]  │
      └─────────────┬──────────────┘
                    ↓
      Site configuration [modified]
                    │
                    ↓
       `design-system` [modified]

  Omitted: `landing` and `chrome` → `design-system` and `routing`;
  `routes` → Site configuration, for the head of `/`. Module
  `@robusta/pyramids-design-system` [modified], used by `landing`,
  `chrome` and `components`, is another zoom.
```

### library API of module `@robusta/pyramids-design-system` — modified

Client code : les packages `landing`, `chrome` et `components` de l'app `@robusta/robusta-build` ; `apps/robusta` (`src/app/_design-test/page.tsx`), qui ne passe aucun composant de lien.

```ts
type AnchorHTMLAttributes, ComponentType; // react

/** new — what a surface hands its link component: an anchor's attributes */
type SkLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** new — the component a site supplies to render the anchors of the surfaces */
type SkLinkComponent = ComponentType<SkLinkProps>;

// modified — each gains linkComponent?: SkLinkComponent, a plain <a> if absent
interface SiteHeaderProps, SiteFooterProps, HeroProps, CTAProps,
  NotesPreviewProps, ServicesGridProps;

// modified — the anchor branch gains linkComponent?: SkLinkComponent,
// the button branch linkComponent?: never
type SkButtonProps;
```

Garanties :

- Chaque ancre que rendent ces six surfaces est un élément `linkComponent`, qui reçoit les `href`, `className` et `children` que la surface aurait posés sur `<a>` : wordmark et liens de navigation de `SiteHeader`, items de `SiteFooter`, ligne de lien d'une carte de `ServicesGrid`, lien « all » et notes de `NotesPreview`, et l'ancre de chaque `SkButton` qu'elles rendent.
- Sans `linkComponent`, chaque surface rend le balisage d'aujourd'hui. `PrinciplesList` et `FlowDiagram`, sans ancre, ne changent pas.
- Injection par prop seulement : aucun contexte React, aucun import de router.
- Exports d'exécution inchangés : `SkLinkProps` et `SkLinkComponent` sont des types, et le composant de lien par défaut reste du code interne. `package-contract.spec.tsx` garde sa liste.

Client code, dans le package `chrome` :

```tsx
import { SiteHeader } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.js';

<SiteHeader
  wordmarkSrc={wordmarkSrc}
  links={[]}
  ctaLabel={pageCopy.header.contactLabel}
  ctaHref={`mailto:${contact.email}`}
  linkComponent={SiteLink}
/>
```

### library API of package `components` in app `@robusta/robusta-build` — modified

```ts
/** modified — props widened: SiteLink is the site's SkLinkComponent */
function SiteLink(props: SkLinkProps): JSX.Element;
```

- Une URL du site devient un `Link` du router, `activeOptions` exact inchangé ; `className` et les autres attributs passent au `Link`.
- Une URL `https:` ou `mailto:` devient une ancre simple, sans résolution de route : c'est le comportement du `Link` de TanStack (voir Technical Constraints).
- Les appels existants, `ArticleView`, ne changent pas.

### library API of package `chrome` in app `@robusta/robusta-build` — new

```ts
/** SiteHeader from the Site configuration: wordmark to /, contact, no nav */
function Header(): JSX.Element;

/** SiteFooter from the Site configuration: tagline, copyright, no column */
function Footer(): JSX.Element;
```

Câblage, chaque prop de texte passée, vide pour masquer :

- `SiteHeader` — `wordmarkSrc` ; `links` ← `[]` ; `ctaLabel` ← `pageCopy.header.contactLabel` ; `ctaHref` ← `mailto:` de `contact.email` ; `linkComponent` ← `SiteLink`.
- `SiteFooter` — `wordmarkSrc` ; `tagline` ← `pageCopy.tagline` ; `columns` ← `[]` ; `copyright` ← `pageCopy.footer.copyright` ; `versionLine` ← `''`.
- Chacun se déclare `lang` de la Locale par défaut sur un élément nu, sans classe ni style, comme la fin de page d'`ArticleView` : une page `/l/en/…` les lit en français.

Client code, dans `src/routes/__root.tsx`, le reste de `RootDocument` inchangé :

```tsx
<body>
  <Header />
  {children}
  <Footer />
  {isNotFoundDocument ? null : <Scripts />}
</body>
```

### library API of package `landing` in app `@robusta/robusta-build` — modified

```ts
type NotePost; // module @robusta/pyramids-design-system, unchanged

interface LandingPageProps {
  /** the default Locale's notes feed, newest first; empty: no notes section */
  posts: NotePost[];
}

/** new — a <main>: Hero, PrinciplesList, NotesSection, CTA, in this order */
function LandingPage(props: LandingPageProps): JSX.Element;

/** modified — same props, null when `posts` is empty */
function NotesSection(props: NotesSectionProps): JSX.Element | null;
```

Câblage, chaque prop de texte passée, vide pour masquer :

- `Hero` — `eyebrow` ← `pageCopy.tagline` ; `title`, `subtitle`, `footnote`, `mascotAlt`, `annotation` ← `hero.title`, `hero.subtitle`, `hero.note`, `hero.mascotAlt`, `hero.annotation` ; appel primaire ← `hero.emailLabel` vers `mailto:` ; appel secondaire ← `hero.linkedInLabel` vers `contact.linkedIn` ; `mascotSrc` ← `heroMascotSrc` ; `linkComponent` ← `SiteLink`.
- `PrinciplesList` — `eyebrow`, `title`, `principles` ← `principles.*`.
- `NotesPreview`, par `NotesSection` — `eyebrow`, `title`, `allLinkLabel` ← `notes.*` ; `allLinkHref` ← le blog home de la Locale, inchangé ; `posts` ← le flux, le `tag` d'une note remplacé par `pageCopy.categoryLabels[tag]` et retiré quand la Category n'a pas de libellé ; `linkComponent` ← `SiteLink`.
- `CTA` — `title`, `subtitle`, `footnote` ← `cta.*` ; `emailPlaceholder` ← `''` ; `ctaLabel` ← `contact.email` ; `ctaHref` ← `mailto:` ; `mascotSrc` ← `ctaMascotSrc` ; `linkComponent` ← `SiteLink`.

`hero`, `principles`, `notes` et `cta` sont les champs de `pageCopy.landing`. `landing` peut envelopper un texte dans un fragment qui n'emploie que des noms de classe du design system (décision du 2026-07-30), jamais autre chose.

Client code, la route `/` :

```tsx
const { title, description } = getSeoPyramidsConfig().pageCopy.landing.head;
const feed = { locale: urlScheme.defaultLocale, limit: 4 };

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title }, { name: 'description', content: description }],
  }),
  loader: () => getNotesFeed({ data: feed }),
  component: () => <LandingPage posts={Route.useLoaderData()} />,
});
```

### library API of the Site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

Client code : `routes`, `landing`, `chrome`.

```ts
type Principle; // module @robusta/pyramids-design-system, { k, v }, unchanged

interface SeoPyramidsConfig {
  siteTitle: string;   // unchanged — the title of every page but `/`
  mission?: string;    // unchanged — the description of every page but `/`
  contact: Contact;    // new
  pageCopy: PageCopy;  // new
  // … domain, siteName, logo, Locales, blogConfig unchanged
}

interface Contact {
  email: string;     // shown as is; `mailto:` is derived from it
  linkedIn: string;  // absolute https URL of the profile
}

interface PageCopy {
  tagline: string;                        // hero eyebrow and footer tagline
  header: { contactLabel: string };
  footer: { copyright: string };
  landing: LandingCopy;
  categoryLabels: Record<string, string>; // Category slug → tag label
}

interface LandingCopy {
  head: { title: string; description: string };
  hero: HeroCopy;
  principles: PrinciplesCopy;
  notes: NotesCopy;
  cta: CtaCopy;
}
```

Une chaîne par texte affiché :

- `HeroCopy` — `title`, `subtitle`, `emailLabel`, `linkedInLabel`, `note` (Toulouse, la zone desservie, les rendez-vous sur place), `mascotAlt`, `annotation`.
- `PrinciplesCopy` — `eyebrow`, `title`, `principles: Principle[]`.
- `NotesCopy` — `eyebrow`, `title`, `allLinkLabel`.
- `CtaCopy` — `title`, `subtitle`, `footnote`.

Garanties :

- Texte brut : ni balise, ni JSX, ni nom de classe ; `seopyramids.config.ts` reste un module de données sans React. Tous les champs sont requis, un texte manquant échoue au typecheck.
- L'adresse e-mail n'est écrite qu'une fois, dans `contact.email`.
- Page copy de la Locale par défaut seule : `/l/$locale/` reste un placeholder, hors périmètre.

### library API of package `design-system` in app `@robusta/robusta-build` — modified

```ts
/** new — `crystal-tux.svg`, at the URL Vite publishes it under */
const heroMascotSrc: string;

/** new — `crystal-tux-waving.svg`, at the URL Vite publishes it under */
const ctaMascotSrc: string;
```

Importés par les exports `./assets/*` du package, comme `wordmarkSrc` ; rien n'est copié sous `public/`.

### library API of package `page-data` in app `@robusta/robusta-build` — modified

```ts
/** same signature; NotePost.date written as the feed's Locale writes it */
getNotesFeed(call: { data: NotesFeedRequest }): Promise<NotePost[]>;
```

- La date d'une note est formatée au build par `Intl`, en UTC depuis la date du calendrier, comme `writtenDate` : « 13 déc. » en `fr`, « Dec 13 » en `en`. Aujourd'hui, `dec 13` s'affiche sur une page française.
- Sélection, ordre, `href` et `tag`, le slug de la Category, inchangés.

### HTTP API of app `@robusta/robusta-build` — modified

Le bloc de la [story](robusta-landing-page.story.md#boundaries), tel quel. En plus :

- `GET /` — `<title>` et `description` de `pageCopy.landing.head`, `robots` `noindex, nofollow` hérité de la route racine ; ni `<form>` ni `<input>` ; chaque lien porte son `href` dans le HTML prérendu.
- Tout document, 404 et état d'échec de navigation compris, porte `<header class="sk-site-header">` avant son contenu et `<footer class="sk-site-footer">` après.
- Aucune page prérendue en plus ni en moins, aucun fichier de données en plus : `check-route-table` passe tel quel.

## Technical Constraints

- `@tanstack/react-router` 1.170.41 : un `Link` dont le `to` porte `http:`, `https:`, `mailto:` ou `tel:` rend une ancre simple sans résoudre de route ; tout autre schéma est bloqué et rendu sans `href`. `contact` ne porte que des URL `https:` et une adresse rendue en `mailto:`.
- `HeadContent` garde, pour `title` et pour chaque `meta` nommé, la valeur du match le plus profond : le `head` de `/` remplace titre et description et hérite `robots`.
- Pas de contexte React dans le design system : `apps/robusta` importe l'index du package depuis un server component Next, où `createContext` n'existe pas hors d'un module `'use client'`. Un contexte casserait `yarn build:robusta-v1`, donc le Green set (BR-PYRAMID-5) ; la prop tient dans les deux runtimes, sans directive.
- Le document 404 ne charge aucun script : `Header` et `Footer` y rendent des ancres que le navigateur suit en rechargeant la page.
- Specs du design system : `node --test`, rendu par `renderStatic`, qui appelle les composants fonction en place ; un composant de lien sonde suffit à vérifier qu'aucune `<a>` n'échappe à `linkComponent`. Specs du site : vitest en `environment: 'node'`, `SiteLink` sous `renderInRouter`. « Sans recharger toute la page » (AC-LANDING-4) et les 320 px (AC-LANDING-7) ne s'observent que dans un navigateur : Barbot, sur le build.
- Le site lit le `dist/` du design system : `yarn build:deps`, ou le watcher `w:design-system`, avant que `landing` et `chrome` voient `linkComponent`.
- Sous `apps/robusta-build/src` et dans le design system : imports locaux en `.js`, aucun `'use client'` ni `'use server'` (`check-source`, `package-contract.spec.tsx`).

## Requirements

R-LANDING-1 à 16 sont ceux du brainstorm du 2026-07-29 ; ce design numérote à partir de 21. R-LANDING-11, que cite l'epic, est tenu par R-LANDING-84.

### Design system

- R-LANDING-21 : le package exporte les types `SkLinkProps` et `SkLinkComponent` ; `SiteHeader`, `SiteFooter`, `Hero`, `CTA`, `NotesPreview`, `ServicesGrid` et la branche ancre de `SkButton` acceptent `linkComponent`.
- R-LANDING-22 : chaque ancre de ces six surfaces, celles de leurs `SkButton` comprises, est rendue par `linkComponent` avec les `href`, `className` et `children` qu'elle aurait portés ; sans `linkComponent`, le balisage d'aujourd'hui.
- R-LANDING-23 : le package n'importe aucun router et n'appelle pas `createContext` ; ses exports d'exécution ne changent pas ; `yarn build:robusta-v1` reste vert sans modifier `apps/robusta` (BR-PYRAMID-5).

### Site configuration

- R-LANDING-41 : `contact` porte l'e-mail et le profil LinkedIn de Nicolas ; chaque appel au contact du site y lit sa destination, et l'adresse affichée est `contact.email` lui-même.
- R-LANDING-42 : `pageCopy` porte toute la page copy de `/`, de l'en-tête et du pied de page, textes alternatifs compris, en texte brut (BR-PYRAMID-8). Seule exception : le wordmark de `BrandLogo` et son texte alternatif, asset de marque.
- R-LANDING-43 : le texte suit AC-LANDING-2 et AC-LANDING-3, en français, à la première personne, au nom de Nicolas ; il part de la description de `documentation/google-business-profile.md`, qui fait les mêmes coupes.
- R-LANDING-44 : `pageCopy.landing.head` porte le titre et la description de `/`, écrits depuis le pitch, différents de `siteTitle` et de `mission`.
- R-LANDING-45 : `pageCopy.categoryLabels` donne un libellé français à chaque Category revendiquée par un Published article de la Locale par défaut ; une spec le vérifie sur le corpus réel.

### Chrome

- R-LANDING-61 : `RootDocument` rend `Header` avant et `Footer` après le contenu de chaque document : `/`, articles, placeholders, 404, état d'échec de navigation.
- R-LANDING-62 : `Header` et `Footer` suivent le câblage du package `chrome` : aucun lien de navigation, aucune colonne, aucune ligne de version, wordmark vers `/` par `SiteLink`.
- R-LANDING-63 : `Header` et `Footer` se déclarent `lang` de la Locale par défaut, sur un élément nu sans classe ni style : une page d'une autre Locale les lit en français.

### Landing

- R-LANDING-81 : la route `/` rend `LandingPage` et déclare `pageCopy.landing.head` dans son `head` ; la démonstration du shell (`BrandLogo`, `SkCallout`, styles inline) disparaît.
- R-LANDING-82 : `LandingPage` rend un `<main>` composé des seules surfaces du design system, `Hero`, `PrinciplesList`, `NotesSection`, `CTA`, dans cet ordre (BR-PYRAMID-3).
- R-LANDING-83 : chaque prop de texte de chaque surface que rendent `landing` et `chrome` est passée, depuis `pageCopy` ou vide pour masquer ; aucune ne garde son défaut (BR-PYRAMID-8).
- R-LANDING-84 : `Hero` porte deux appels au contact, l'e-mail puis LinkedIn ; `CTA` un seul, l'adresse vers l'e-mail, sans champ. `/` ne porte ni `<form>` ni `<input>`, et chaque contrôle mène à une destination qui existe.
- R-LANDING-85 : `NotesSection` ne rend rien sur un flux vide ; sinon ses textes viennent de `pageCopy.landing.notes`, ses liens passent par `SiteLink` (l'exception que R-TANSTACK-47 laissait à cette story se ferme), et le tag d'une note est le libellé de sa Category, absent quand `categoryLabels` n'en a pas.
- R-LANDING-86 : `getNotesFeed` écrit la date d'une note dans la Locale du flux, au build, en UTC.

### Garde-fous

- R-LANDING-101 : `landing` et `chrome` ne posent ni classe hors du design system, ni style inline, ni `@media`, ni variante responsive Tailwind : à chaque Breakpoint, la mise en page est celle des surfaces (BR-PYRAMID-6).
- R-LANDING-102 : aucune page du site ne mène à un CV : ni `<iframe>`, ni lien vers un `.pdf`, ni lien vers un profil CV, `toptal.com/resume` compris ; une spec le vérifie sur la page copy, le rendu de `/` et le corpus.

## Acceptance Criteria

- AC-LANDING-1 : Given le site construit, When un visiteur ouvre `/`, Then il lit dans cet ordre l'en-tête, le hero, les principes, les notes, le bloc de contact et le pied de page, tous rendus par le design system, et plus rien de la démonstration du shell.
- AC-LANDING-2 : Given la page `/`, When un visiteur la lit, textes alternatifs compris, Then chaque mot est celui de Robusta Build, en français, à la première personne et au nom de Nicolas, et un lecteur d'écran la lit en français ; aucun texte du prototype (« we build software », « small team. long memory. », « this is crystal tux. », « what we publish. », « the system you're reading is itself. »…) ne lui parvient.
- AC-LANDING-3 : Given le hero et les principes, When un dirigeant de PME les lit, Then il y trouve la tagline en eyebrow, les vingt ans d'expérience dans un titre qui parle de son entreprise, Renault, le BCG et les startups, Toulouse avec la zone desservie et les rendez-vous sur place ; il n'y trouve ni la spécialité EVM, ni Toptal, ni Oracle, ni « remote », ni seuil de chiffre d'affaires, ni disponibilité datée.
- AC-LANDING-4 : Given n'importe quelle page du site, article compris, When le visiteur suit le wordmark ou l'appel au contact de l'en-tête, ou sur `/` un appel au contact du hero ou du bloc final ou un lien de la section de notes, Then le wordmark le ramène à `/` et chaque lien de la section de notes l'amène sur sa page, l'un et l'autre sans recharger toute la page, et chaque appel au contact l'amène sur un e-mail à Nicolas ou sur son profil LinkedIn, sans formulaire ni champ à remplir.
- AC-LANDING-5 : Given le site v2, When on le parcourt en entier, Then aucun CV n'est joignable : ni page, ni PDF, ni document intégré, ni lien vers un profil CV externe, Toptal compris.
- AC-LANDING-6 : Given JavaScript désactivé, When `/` est lu, Then le pitch, les références et le contact sont lisibles, chaque lien mène encore à sa page, et la page porte un titre et une description qu'aucune autre page ne partage.
- AC-LANDING-7 : Given les cas limites métier, When on les rejoue, Then sans article publié la page n'a pas de section de notes, plutôt qu'une section vide ou les articles d'exemple du design system, et avec moins de quatre articles elle montre ceux qui existent ; livrée avant go-live, la page reste fermée aux moteurs de recherche comme le reste du site, son lien « tous les articles » pouvant encore mener à une page de listing sans contenu propre ; à 320 px, l'adresse e-mail et le titre le plus long ne débordent pas et ne sont pas coupés.

Edge cases to test:

- Aucun article publié dans la Locale par défaut : `/` n'a ni section de notes vide, ni notes d'exemple du design system.
- Trois articles français publiés, l'état d'aujourd'hui : trois notes, aucune place vide.
- La note de `theory/quel-second-langage.md` porte le libellé français de `theory`, jamais le slug ; une Category sans libellé donne une note sans tag.
- Une note de décembre s'affiche « 13 déc. », jamais « dec 13 ».
- Sur la page 404, servie sans script : en-tête et pied de page présents, le wordmark mène à `/`.
- Sur une page `/l/en/…` : `<html lang="en">`, l'en-tête et le pied de page lus en français.
- Le lien « tous les articles » mène à `/articles`, placeholder qui répond 200.
- Le lien vers l'accueil de `toptal.com` dans le corps de `theory/quel-second-langage.md` n'est pas un CV et reste.

## Dependencies

- Depends on : default-locale-fr, landée et non commitée, dans le working tree — `fr` par défaut, `<html lang="fr">` sur `/`, flux de notes français. Ce design s'écrit par-dessus.
- Depends on : `Breakpoint` au glossaire et BR-PYRAMID-6 étendue aux breakpoints (Dep 4 de la story, levée le 2026-10-15).
- translate-english-articles : de trois à neuf articles français ; la spec de R-LANDING-45 échoue tant qu'une Category nouvelle, `web` ou `privacy`, n'a pas son libellé.
- Blocks : blog-rolls (colonnes du pied de page ; `categoryLabels` est le libellé qu'une page de Category reprendra), seo-excellence (le `head` de `/` est posé ici, le reste lui revient), go-live.
