# Story : La landing page de robusta.build

**Dernière mise à jour :** 2026-10-15
**Feature :** robusta-landing-page
**Infix :** LANDING
**Status :** DONE (2026-11-05, commit d55cc7a sur main)

## Story

En tant qu'éditeur de robusta.build, je veux une page d'accueil v2 composée des surfaces du design system robusta et portant le pitch de Robusta Build, afin que le site présente l'offre aux PME de la région, sans le CV obsolète et sans balisage marketing propre au site.

## Contexte & objectif

`/` compose les surfaces marketing de `@robusta/pyramids-design-system`, nourries par la page copy française que porte la Site configuration : première preuve qu'un site est habillé par son propre design system (BR-PYRAMID-3, BR-PYRAMID-8), et modèle des sites suivants. L'en-tête et le pied de page habillent toutes les pages depuis la route racine. Le site reste sous `robots: noindex` jusqu'à go-live ; les pages de listing (blog-rolls), le SEO au-delà du titre et de la description de `/` (seo-excellence) et le retrait des textes par défaut des surfaces sont hors périmètre.

## Composition

Dans l'ordre :

- SiteHeader : le wordmark, qui mène à `/`, et l'appel au contact ; aucun lien de navigation
- Hero : la tagline « Sites web rapides et applications sur mesure » en eyebrow, le titre qui porte les vingt ans d'expérience, les deux appels au contact (e-mail, LinkedIn), et en note Toulouse, la zone desservie et les rendez-vous sur place ; la légende et le texte alternatif de la mascotte passent par `annotation` et `mascotAlt`
- PrinciplesList : la façon de travailler, et les références en texte : Renault, le BCG, les startups
- NotesPreview : les quatre articles publiés les plus récents ; sur-titre, titre et lien « tous les articles » en français, à la première personne
- CTA : le bloc de contact final, sans formulaire
- SiteFooter : marque, tagline, copyright ; aucune colonne de liens avant blog-rolls

SiteHeader et SiteFooter viennent de la route racine ; `/` n'apporte que les quatre surfaces du milieu. ServicesGrid et FlowDiagram restent hors de la première version.

## Livré

### Requirements

- R-LANDING-21 : le package exporte les types `SkLinkProps` et `SkLinkComponent` ; `SiteHeader`, `SiteFooter`, `Hero`, `CTA`, `NotesPreview`, `ServicesGrid` et la branche ancre de `SkButton` acceptent `linkComponent`.
- R-LANDING-22 : chaque ancre de ces six surfaces, celles de leurs `SkButton` comprises, est rendue par `linkComponent` avec les `href`, `className` et `children` qu'elle aurait portés ; sans `linkComponent`, le balisage d'aujourd'hui.
- R-LANDING-23 : le package n'importe aucun router et n'appelle pas `createContext` ; ses exports d'exécution ne changent pas ; `yarn build:robusta-v1` reste vert sans modifier `apps/robusta` (BR-PYRAMID-5).
- R-LANDING-41 : `contact` porte l'e-mail et le profil LinkedIn de Nicolas ; chaque appel au contact du site y lit sa destination, et l'adresse affichée est `contact.email` lui-même.
- R-LANDING-42 : `pageCopy` porte toute la page copy de `/`, de l'en-tête et du pied de page, textes alternatifs compris, en texte brut (BR-PYRAMID-8). Seule exception : le wordmark de `BrandLogo` et son texte alternatif, asset de marque.
- R-LANDING-43 : le texte suit AC-LANDING-2 et AC-LANDING-3, en français, à la première personne, au nom de Nicolas ; il part de la description de `documentation/google-business-profile.md`, qui fait les mêmes coupes.
- R-LANDING-44 : `pageCopy.landing.head` porte le titre et la description de `/`, écrits depuis le pitch, différents de `siteTitle` et de `mission`.
- R-LANDING-45 : `pageCopy.categoryLabels` donne un libellé français à chaque Category revendiquée par un Published article de la Locale par défaut ; une spec le vérifie sur le corpus réel.
- R-LANDING-61 : `RootDocument` rend `Header` avant et `Footer` après le contenu de chaque document : `/`, articles, placeholders, 404, état d'échec de navigation.
- R-LANDING-62 : `Header` et `Footer` suivent le câblage du package `chrome` : aucun lien de navigation, aucune colonne, aucune ligne de version, wordmark vers `/` par `SiteLink`.
- R-LANDING-63 : `Header` et `Footer` se déclarent `lang` de la Locale par défaut, sur un élément nu sans classe ni style : une page d'une autre Locale les lit en français.
- R-LANDING-81 : la route `/` rend `LandingPage` et déclare `pageCopy.landing.head` dans son `head` ; la démonstration du shell (`BrandLogo`, `SkCallout`, styles inline) disparaît.
- R-LANDING-82 : `LandingPage` rend un `<main>` composé des seules surfaces du design system, `Hero`, `PrinciplesList`, `NotesSection`, `CTA`, dans cet ordre (BR-PYRAMID-3).
- R-LANDING-83 : chaque prop de texte de chaque surface que rendent `landing` et `chrome` est passée, depuis `pageCopy` ou vide pour masquer ; aucune ne garde son défaut (BR-PYRAMID-8).
- R-LANDING-84 : `Hero` porte deux appels au contact, l'e-mail puis LinkedIn ; `CTA` un seul, l'adresse vers l'e-mail, sans champ. `/` ne porte ni `<form>` ni `<input>`, et chaque contrôle mène à une destination qui existe.
- R-LANDING-85 : `NotesSection` ne rend rien sur un flux vide ; sinon ses textes viennent de `pageCopy.landing.notes`, ses liens passent par `SiteLink` (l'exception que R-TANSTACK-47 laissait à cette story se ferme), et le tag d'une note est le libellé de sa Category, absent quand `categoryLabels` n'en a pas.
- R-LANDING-86 : `getNotesFeed` écrit la date d'une note dans la Locale du flux, au build, en UTC.
- R-LANDING-101 : `landing` et `chrome` ne posent ni classe hors du design system, ni style inline, ni `@media`, ni variante responsive Tailwind : à chaque Breakpoint, la mise en page est celle des surfaces (BR-PYRAMID-6).
- R-LANDING-102 : aucune page du site ne mène à un CV : ni `<iframe>`, ni lien vers un `.pdf`, ni lien vers un profil CV, `toptal.com/resume` compris ; une spec le vérifie sur la page copy, le rendu de `/` et le corpus.

### Acceptance Criteria

Les sept validés par Nicolas le 2026-10-15.

- AC-LANDING-1 : Given le site construit, When un visiteur ouvre `/`, Then il lit dans cet ordre l'en-tête, le hero, les principes, les notes, le bloc de contact et le pied de page, tous rendus par le design system, et plus rien de la démonstration du shell.
- AC-LANDING-2 : Given la page `/`, When un visiteur la lit, textes alternatifs compris, Then chaque mot est celui de Robusta Build, en français, à la première personne et au nom de Nicolas, et un lecteur d'écran la lit en français ; aucun texte du prototype (« we build software », « small team. long memory. », « this is crystal tux. », « what we publish. », « the system you're reading is itself. »…) ne lui parvient.
- AC-LANDING-3 : Given le hero et les principes, When un dirigeant de PME les lit, Then il y trouve la tagline en eyebrow, les vingt ans d'expérience dans un titre qui parle de son entreprise, Renault, le BCG et les startups, Toulouse avec la zone desservie et les rendez-vous sur place ; il n'y trouve ni la spécialité EVM, ni Toptal, ni Oracle, ni « remote », ni seuil de chiffre d'affaires, ni disponibilité datée.
- AC-LANDING-4 : Given n'importe quelle page du site, article compris, When le visiteur suit le wordmark ou l'appel au contact de l'en-tête, ou sur `/` un appel au contact du hero ou du bloc final ou un lien de la section de notes, Then le wordmark le ramène à `/` et chaque lien de la section de notes l'amène sur sa page, l'un et l'autre sans recharger toute la page, et chaque appel au contact l'amène sur un e-mail à Nicolas ou sur son profil LinkedIn, sans formulaire ni champ à remplir.
- AC-LANDING-5 : Given le site v2, When on le parcourt en entier, Then aucun CV n'est joignable : ni page, ni PDF, ni document intégré, ni lien vers un profil CV externe, Toptal compris.
- AC-LANDING-6 : Given JavaScript désactivé, When `/` est lu, Then le pitch, les références et le contact sont lisibles, chaque lien mène encore à sa page, et la page porte un titre et une description qu'aucune autre page ne partage.
- AC-LANDING-7 : Given les cas limites métier, When on les rejoue, Then sans article publié la page n'a pas de section de notes, plutôt qu'une section vide ou les articles d'exemple du design system, et avec moins de quatre articles elle montre ceux qui existent ; livrée avant go-live, la page reste fermée aux moteurs de recherche comme le reste du site, son lien « tous les articles » pouvant encore mener à une page de listing sans contenu propre ; à 320 px, l'adresse e-mail et le titre le plus long ne débordent pas et ne sont pas coupés.

## Boundaries

```
  Flèche = dépend de, du code client vers l'API utilisée (library).
  Packages de l'app `@robusta/robusta-build`, aucune boucle.

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

  Omises : `landing` et `chrome` → `design-system` et `routing` ;
  `routes` → Site configuration, pour la tête de `/`. Le module
  `@robusta/pyramids-design-system` [modified], utilisé par `landing`,
  `chrome` et `components`, est d'un autre zoom.
```

### library API of module `@robusta/pyramids-design-system` — modified

Client code : les packages `landing`, `chrome` et `components` de l'app ; `apps/robusta`, qui ne passe aucun composant de lien.

```ts
type SkLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }; // new
type SkLinkComponent = ComponentType<SkLinkProps>;                             // new

// modified — chacune gagne linkComponent?: SkLinkComponent, une <a> simple si absent
interface SiteHeaderProps, SiteFooterProps, HeroProps, CTAProps, NotesPreviewProps, ServicesGridProps;
type SkButtonProps; // branche ancre : linkComponent?: SkLinkComponent
```

Injection par prop seulement : ni contexte React, ni router.

### library API of package `components` in app `@robusta/robusta-build` — modified

```ts
function SiteLink(props: SkLinkProps): JSX.Element; // le SkLinkComponent du site
```

### library API of package `chrome` in app `@robusta/robusta-build` — new

```ts
function Header(): JSX.Element; // SiteHeader : wordmark vers / par SiteLink, appel au contact, aucun lien de navigation
function Footer(): JSX.Element; // SiteFooter : tagline, copyright, aucune colonne
```

### library API of package `landing` in app `@robusta/robusta-build` — modified

```ts
type NotePost;
interface LandingPageProps { posts: NotePost[] }

function LandingPage(props: LandingPageProps): JSX.Element;             // new
function NotesSection(props: NotesSectionProps): JSX.Element | null;    // modified, null sur un flux vide
```

### library API of the Site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

```ts
interface SeoPyramidsConfig {
  contact: Contact;   // new — email, linkedIn
  pageCopy: PageCopy; // new — tagline, header, footer, landing (head, hero, principles, notes, cta), categoryLabels
}
```

### library API of package `design-system` in app `@robusta/robusta-build` — modified

```ts
const heroMascotSrc: string; // new — crystal-tux.svg
const ctaMascotSrc: string;  // new — crystal-tux-waving.svg
```

### library API of package `page-data` in app `@robusta/robusta-build` — modified

```ts
getNotesFeed(call: { data: NotesFeedRequest }): Promise<NotePost[]>; // date d'une note écrite dans la Locale du flux
```

### HTTP API of app `@robusta/robusta-build` — modified

- `GET /` — 200, la landing page prérendue au build, son titre et sa description propres, `<html lang>` de la Locale par défaut, sous `robots: noindex` comme tout le site jusqu'à go-live ; ni `<form>` ni `<input>`
- toute autre page — statut et contenu inchangés, désormais entre l'en-tête et le pied de page du site

## Décisions

- 2026-07-29 — La page parle à la première personne du singulier, au nom de Nicolas ; le « we » par défaut des surfaces est réécrit. Pourquoi : Robusta Build vend une personne nommée, et un visiteur qui lit « petite équipe » puis rencontre une seule personne a été trompé. Confirmé le 2026-10-06 pour la page française.
- 2026-07-29 — La preuve sociale v1 survit en texte dans Hero et PrinciplesList ; mur de logos, grille de compétences et portfolio sortent. Pourquoi : une nouvelle surface modifie le design system, ce qui est une autre story. Restreinte le 2026-10-06 à Renault, au BCG et aux startups.
- 2026-07-30 — ServicesGrid et FlowDiagram restent hors de la première version, jusqu'à ce que trois services et un déroulé d'engagement soient écrits. Pourquoi : ces surfaces décrivent une offre packagée, avec des prix et des durées que personne ne s'est engagé à tenir.
- 2026-07-30 — Le site peut passer des fragments qui n'utilisent que des noms de classe du design system, et envelopper une surface dans un élément nu pour porter un `id` ; il ne définit ni classe, ni couleur, ni police, ni espacement. Pourquoi : le vocabulaire de classes appartient au design system.
- 2026-07-30 — Le titre du hero suit la voix de la marque : minuscules, simple, sans superlatif. Le reste de cette décision (titre anglais, EVM, « remote ») est remplacé le 2026-10-06.
- 2026-10-06 — robusta.build passe entièrement en français, et Robusta Build devient une entreprise locale qui aide les PME de sa région, d'au moins 500 000 € de chiffre d'affaires, à passer le million avec des logiciels adaptés. Pourquoi : décision de l'éditeur, consignée dans l'epic.
- 2026-10-06 — La tagline « Sites web rapides et applications sur mesure » va telle quelle dans l'eyebrow du Hero et sur la fiche Google Business Profile ; le titre reste une ligne à part qui porte l'expérience. Pourquoi : l'eyebrow dit ce que la page vend, le titre pourquoi faire confiance à celui qui le vend.
- 2026-10-06 — Restent : les vingt ans, Renault, le BCG, les startups, Toulouse avec la zone desservie et les rendez-vous sur place. Sortent : la spécialité EVM, Toptal, Oracle, « remote » et le seuil de chiffre d'affaires. Pourquoi : un dirigeant de PME vérifie que la personne est réelle, proche, et a livré pour des entreprises sérieuses ; la fiche Google Business Profile fait les mêmes coupes.
- 2026-10-06 — `annotation` et `mascotAlt` dans `HeroProps` ; une annotation vide masque la légende et sa flèche. Pourquoi : Gap-LANDING-10, BR-PYRAMID-8. Livré par design-system-responsive le 2026-10-07.
- 2026-10-06 — Les pages de listing reviennent à blog-rolls, avant go-live : le lien « tous les articles » mène encore à un placeholder et le pied de page n'a pas de colonne. Pourquoi : Gap-LANDING-11.
- 2026-10-06 — Le `robots: noindex` se lève à go-live, après seo-excellence et blog-rolls. Pourquoi : OQ-LANDING-12, lever plus tôt ferait indexer des pages vides.
- 2026-10-06 — SiteHeader et SiteFooter habillent toutes les pages depuis la route racine. Pourquoi : OQ-LANDING-13, la plupart des visiteurs arrivent sur un article.
- 2026-10-08 — `Breakpoint` désigne les cinq largeurs de design-system-responsive (40, 48, 64, 80 et 96rem) ; 320 px est le plancher des surfaces, pas un Breakpoint. Pourquoi : Gap-LANDING-14. Enregistré le 2026-10-15 : `Breakpoint` au glossaire et BR-PYRAMID-6 étendue aux breakpoints.
- 2026-10-08 — BR-PYRAMID-8 fait foi ; seule exception, le wordmark de `BrandLogo`, asset de marque. La page copy du site vit dans sa configuration ; le retrait des textes par défaut des surfaces revient à un item à part. Pourquoi : OQ-LANDING-15.
- 2026-10-08 — Les liens internes des surfaces changent de page par le router TanStack ; le site fournit au design system le composant qui rend ses liens, `linkComponent`, sans que le package dépende d'un router. Pourquoi : OQ-LANDING-16. Une prop plutôt qu'un contexte React, qui casserait `yarn build:robusta-v1`.

## Documentation updates

- changed the intro, « Where the truth of this site lives » and « What they render » of `apps/robusta-build/README.md` : `/` est la landing page, la page copy et `contact` vivent dans la Site configuration, `Header` et `Footer` habillent toutes les pages, `SiteLink` sert de `linkComponent`
- changed « Import — components » of `packages/robusta-design-system/README.md` : l'exemple passe le texte en props et `linkComponent`
- changed the `@robusta/robusta-build` entry of `CLAUDE.md`, the robusta.build entry of `root.archi.md`, and the description of `/`, the package list and the diagram of `apps/robusta-build/robusta-build.archi.md` : `/` n'est plus un placeholder, le package `chrome` est nouveau
- changed the Boundaries of `packages/robusta-design-system/design-system.archi.md` : `linkComponent`, `SkLinkProps` et `SkLinkComponent`

## Dependencies

- Dep 3 : default-locale-fr et translate-english-articles — levée.
- Dep 4 : breakpoint-glossary — levée le 2026-10-15 (commit 66792ec).
