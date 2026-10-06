# Story : La landing page de robusta.build

**Dernière mise à jour :** 2026-10-06
**Feature :** robusta-landing-page
**Infix :** LANDING
**Status :** ACTIVE

## Story

En tant qu'éditeur de robusta.build, je veux une page d'accueil v2 composée des surfaces du design system robusta et portant le pitch de Robusta Build, afin que le site présente l'offre aux PME de la région, sans le CV obsolète et sans balisage marketing propre au site.

## Contexte & objectif

La page d'accueil v1 écrit tout à la main dans le site : pitch, logos clients, grille de compétences, aperçu du portfolio, CV en ligne, articles mis en avant (`apps/robusta/src/app/page.tsx` → `src/components/freelance/`). La v2 fait le pari inverse : une composition des surfaces marketing de `@robusta/pyramids-design-system`, alimentées par props. C'est la première preuve qu'un site est habillé par son propre design system (BR-PYRAMID-3), et la page que les sites suivants copieront.

Le texte reprend une partie triée du pitch v1, réécrite en français pour un dirigeant de PME (décisions du 2026-10-06). Le CV ne passe pas, il est hors périmètre de l'epic. Les surfaces livrent le texte du prototype par défaut ; cette story le remplace par celui de Robusta Build (BR-PYRAMID-8).

Aujourd'hui `/` sert encore la démonstration de câblage du shell, autour de la section de notes que migrate-learn-content y a montée. Cette story livre `/` sous `robots: noindex`, comme le reste du site : la levée revient à go-live, après seo-excellence et blog-rolls (décision du 2026-10-06). Hors périmètre : les pages de listing (blog-rolls), le schéma d'URL, le SEO au-delà du titre et de la description de `/` (seo-excellence), et `apps/robusta`, qui sert jusqu'à son retrait.

## Composition

Dans l'ordre :

- SiteHeader : le wordmark, qui mène à `/`, et l'appel au contact ; aucun lien de navigation
- Hero : la tagline « Sites web rapides et applications sur mesure » en eyebrow, le titre qui porte les vingt ans d'expérience, les deux appels au contact (e-mail, LinkedIn), et en note Toulouse, la zone desservie et les rendez-vous sur place ; la légende et le texte alternatif de la mascotte passent par `annotation` et `mascotAlt`
- PrinciplesList : la façon de travailler, et les références en texte : Renault, le BCG, les startups
- NotesPreview : la section de notes héritée de migrate-learn-content, les quatre articles publiés les plus récents, titres réécrits à la première personne
- CTA : le bloc de contact final, sans formulaire
- SiteFooter : marque, tagline, copyright ; aucune colonne de liens avant blog-rolls

SiteHeader et SiteFooter viennent de la route racine et habillent toutes les pages du site ; `/` n'apporte que les quatre surfaces du milieu. ServicesGrid et FlowDiagram restent hors de la première version (décision du 2026-07-30).

## Acceptance Criteria

- AC-LANDING-1 : Given le site construit, When un visiteur ouvre `/`, Then il lit dans cet ordre l'en-tête, le hero, les principes, les notes, le bloc de contact et le pied de page, tous rendus par le design system, et plus rien de la démonstration du shell.
- AC-LANDING-2 : Given la page `/`, When un visiteur la lit, textes alternatifs compris, Then chaque mot est celui de Robusta Build, en français, à la première personne et au nom de Nicolas ; aucun texte du prototype (« we build software », « small team. long memory. », « this is crystal tux. », « what we publish. »…) ne lui parvient.
- AC-LANDING-3 : Given le hero et les principes, When un dirigeant de PME les lit, Then il y trouve la tagline en eyebrow, les vingt ans d'expérience dans un titre qui parle de son entreprise, Renault, le BCG et les startups, Toulouse avec la zone desservie et les rendez-vous sur place ; il n'y trouve ni la spécialité EVM, ni Toptal, ni Oracle, ni « remote », ni seuil de chiffre d'affaires, ni disponibilité datée.
- AC-LANDING-4 : Given n'importe quelle page du site, article compris, When le visiteur suit le wordmark ou l'appel au contact de l'en-tête, ou sur `/` un appel au contact du hero ou du bloc final, Then le wordmark le ramène à `/`, et chaque appel au contact l'amène sur un e-mail à Nicolas ou sur son profil LinkedIn, sans formulaire ni champ à remplir.
- AC-LANDING-5 : Given le site v2, When on le parcourt en entier, Then aucun CV n'est joignable : ni page, ni PDF, ni document intégré, ni lien vers un profil CV externe, Toptal compris.
- AC-LANDING-6 : Given JavaScript désactivé, When `/` est lu, Then le pitch, les références et le contact sont lisibles, et la page porte un titre et une description qu'aucune autre page ne partage.
- AC-LANDING-7 : Given les cas limites métier, When on les rejoue, Then sans article publié la page n'a pas de section de notes, plutôt qu'une section vide ou les articles d'exemple du design system ; livrée avant go-live, la page reste fermée aux moteurs de recherche comme le reste du site, son lien « tous les articles » pouvant encore mener à une page de listing sans contenu propre ; à 320 px, l'adresse e-mail et le titre le plus long ne débordent pas et ne sont pas coupés.

## Boundaries

```
  Flèche = dépend de, du code client vers l'API utilisée.

  app `@robusta/robusta-build` [modified]
      │
      └── library ──→ module `@robusta/pyramids-design-system`
                      [modified, par design-system-responsive]
```

### library API of module `@robusta/pyramids-design-system` — modified

Client code : package `landing` de l'app. Les deux props ci-dessous, `SkButton.href` et `FooterLink` viennent de design-system-responsive et sont consommés tels quels.

- type `HeroProps` · modified
  - `annotation` — new ; la légende près de la mascotte, vide elle disparaît avec sa flèche
  - `mascotAlt` — new ; le nom accessible de la mascotte

### library API of package `landing` in app `@robusta/robusta-build` — modified

Client code : la route `/`.

- `LandingPage` · new — Hero, PrinciplesList, NotesPreview et CTA dans l'ordre de la Composition, tout le texte fourni par le site
- `NotesSection` · modified — titres à la première personne ; sélection et flux inchangés

### library API of package `chrome` in app `@robusta/robusta-build` — new

Client code : la route racine, qui en habille toutes les pages du site.

- `Header` — SiteHeader alimenté par le site : wordmark vers `/`, appel au contact
- `Footer` — SiteFooter alimenté par le site : marque, tagline, copyright

### library API of the site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

- type `SeoPyramidsConfig` · modified
  - `contact` — new ; l'e-mail et le profil LinkedIn, source unique de la route de contact
  - `description` — new ; la description de `/`, écrite depuis le pitch

### library API of package `design-system` in app `@robusta/robusta-build` — modified

- `heroMascotSrc`, `ctaMascotSrc` — new ; `crystal-tux.svg` et `crystal-tux-waving.svg`, résolus par les exports du package

### HTTP API of app `@robusta/robusta-build` — modified

- `GET /` — 200, la landing page, prérendue au build, sous `robots: noindex` comme tout le site jusqu'à go-live
- toute autre page — statut et contenu inchangés, désormais entre l'en-tête et le pied de page du site

## Décisions

- 2026-07-29 — La page parle à la première personne du singulier, au nom d'un ingénieur nommé ; le « we » par défaut des surfaces est réécrit. Pourquoi : Robusta Build vend une personne nommée, et sa crédibilité tient à son parcours ; un visiteur qui lit « petite équipe » puis rencontre une seule personne a été trompé. Confirmé le 2026-10-06 pour la page française.
- 2026-07-29 — La preuve sociale v1 survit en texte dans Hero et PrinciplesList ; mur de logos, grille de compétences et portfolio sortent de la story. Pourquoi : une nouvelle surface change le package du design system, ce qui est une autre story ; les références survivent en mots. Restreinte le 2026-10-06 à Renault, au BCG et aux startups.
- 2026-07-29 — NotesPreview arrive avec migrate-learn-content, une fois de vrais articles en place. Pourquoi : une section qui annonce des notes en 404 coûte plus qu'une page sans notes. Exécutée : la section est montée sur `/`, cette story la reprend.
- 2026-07-30 — ServicesGrid et FlowDiagram restent hors de la première version, jusqu'à ce que trois services et un déroulé d'engagement soient écrits. Pourquoi : Gap 3 du brainstorm ; ces surfaces décrivent une offre packagée (audit payant, engagement intégré, refonte cadrée, prise en charge en cinq étapes) que rien n'a jamais décrite, avec des prix et des durées que personne ne s'est engagé à tenir.
- 2026-07-30 — Le site peut passer des fragments qui n'utilisent que des noms de classe du design system, et envelopper une surface dans un élément nu pour porter un `id` ; il ne définit ni classe, ni couleur, ni police, ni espacement. Pourquoi : Open Question 3 du brainstorm ; le vocabulaire de classes appartient au design system, et une ancre relève de la navigation.
- 2026-07-30 — Le titre du hero suit la voix de la marque : minuscules, simple, sans superlatif. Pourquoi : Open Question 4 du brainstorm. Le reste de cette décision (titre anglais, EVM en sous-titre, « remote » en note) est remplacé le 2026-10-06.
- 2026-10-06 — Robusta Build se présente avec la tagline « Sites web rapides et applications sur mesure », telle quelle, sur sa fiche Google Business Profile et sur le site v2. Pourquoi : une ligne nomme les deux offres ; « progiciel », jugé daté, a cédé la place à « applications sur mesure », gardé en sachant qu'un profane peut entendre « application mobile ».
- 2026-10-06 — robusta.build passe entièrement en français, et Robusta Build devient une entreprise locale qui aide les entreprises de sa région à grandir : des PME d'au moins 500 000 € de chiffre d'affaires, que des logiciels adaptés à leur activité font passer le million. Pourquoi : décision de l'éditeur, consignée aussi dans l'epic. Impact : `/` est en français, et les arguments choisis en juillet pour une page anglaise sont retriés plus bas.
- 2026-10-06 — La tagline va telle quelle dans l'eyebrow du Hero, et le titre reste une ligne à part qui porte l'expérience. Pourquoi : l'eyebrow dit ce que la page vend, le titre dit pourquoi faire confiance à celui qui le vend, et le parcours est le seul argument qu'un concurrent ne peut pas copier.
- 2026-10-06 — La page garde la première personne et nomme Nicolas. Restent : les vingt ans, dans un titre qui parle de l'entreprise du client ; Renault, le BCG et les startups ; Toulouse en note, avec la zone desservie et les rendez-vous sur place à la place de « remote ». Sortent : la spécialité EVM, la sélection Toptal, la certification Oracle et le seuil de chiffre d'affaires. Pourquoi : un dirigeant de PME vérifie que la personne est réelle, proche, et a livré pour des entreprises sérieuses ; EVM, Toptal et Oracle parlent à un recruteur technique, et « remote » contredit la promesse locale. La fiche Google Business Profile (`documentation/google-business-profile.md`) fait les mêmes coupes et garde le seuil pour la prospection.
- 2026-10-06 — La légende du `Hero` et le nom accessible de sa mascotte passent par deux props que design-system-responsive ajoute à `HeroProps`, `annotation` et `mascotAlt` ; une annotation vide masque la légende et sa flèche. Le même item corrige le texte figé de `ServicesGrid` (« see how it works ») et de la variante complète de `BrandLogo`. Pourquoi : Gap-LANDING-10, `lgtm` — le `Hero` affichait « this is crystal tux. she lives here. » quelles que soient ses props, BR-PYRAMID-8 interdit au design system tout texte de page, le site n'a aucun contournement, et la correction coûte le moins tant que design-system-responsive n'a pas atterri.
- 2026-10-06 — Les pages de listing (accueils de blog, pages de catégorie et leurs suites) reviennent à un item de l'epic, `blog-rolls`, placé avant go-live : c'est le même item que seo-excellence demande (Gap-SEOEXCELLENCE-17). Sa première question : quelle surface affiche une liste, le design system n'ayant que NotesPreview. Pourquoi : Gap-LANDING-11, `lgtm` — sans lui, la moitié des pages du site seraient vides le jour où il s'ouvre aux moteurs de recherche. Impact : cette story livre le lien « tous les articles » de la section de notes vers une page de listing encore placeholder, et un pied de page sans colonne de liens.
- 2026-10-06 — Le `robots: noindex` ne se lève pas dans cette story : un item à part, `go-live`, placé après seo-excellence et blog-rolls, bascule robusta.build sur le déploiement Netlify et ouvre les pages aux moteurs de recherche d'un même mouvement ; c'est l'item qu'OQ-SEOEXCELLENCE-19 propose aussi. Cette story livre `/` sous `noindex`. Pourquoi : OQ-LANDING-12, `lgtm` — lever plus tôt ferait indexer des pages vides, et le déploiement Netlify servirait sous une seconde adresse les articles que robusta.build sert encore en v1. Impact : l'item 5 de l'epic et le ROADMAP, qui confient la levée à cette story, sont à corriger par epicman.
- 2026-10-06 — SiteHeader et SiteFooter habillent toutes les pages du site depuis la route racine que tanstack-start-migration réécrit, et pas `/` seule. Pourquoi : OQ-LANDING-13, `lgtm` — la plupart des visiteurs arriveront sur un article depuis un moteur de recherche, et un article n'offre aujourd'hui aucun chemin vers le pitch ni vers le contact.

## Documentation updates

- change the README of `apps/robusta-build` — why: la landing page devient l'exemple de référence d'un site qui consomme son propre design system, le site suivant commence par la copier, et l'en-tête et le pied de page habillent désormais toutes les pages depuis la route racine
- change the `noindex` sentence of the « The v1 mapping » section of `apps/robusta-build/README.md` and of `apps/robusta-build/robusta-build.archi.md` — why: les deux confient la levée du `noindex` à cette story, qui revient à go-live
- change the « Install / Import » section of `packages/robusta-design-system/README.md` — why: elle décrit le consommateur dans l'abstrait et peut désormais pointer un vrai
- change the robusta.build entry of `root.archi.md` and the `@robusta/robusta-build` entry of `CLAUDE.md` — why: les deux décrivent encore la page d'accueil comme un placeholder en attente de cette story

## Dependencies

- Dep 1 : item 1 design-system-responsive — toutes les surfaces de la page en viennent, avec `SkButton.href`, `FooterLink` et les props `annotation` et `mascotAlt` du `Hero` (décision du 2026-10-06). Sa story et son design, APPROVED le 2026-08-07, ne portent pas encore ces deux props. Bloque l'implémentation.
- Dep 2 : item 2 tanstack-start-migration — la route racine, qui portera l'en-tête et le pied de page de toutes les pages, la route `/` et les métadonnées changent de framework ; le design de cette story s'écrit après elle.
- Dep 3 : items 3 default-locale-fr et 4 translate-english-articles — la section de notes n'affiche des articles français qu'après eux (BR-PYRAMID-11).
- Levées : bootstrap-robusta-build, merge-design-system, unblock-build et migrate-learn-content, livrées.
