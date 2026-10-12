# Story : La landing page de robusta.build

**Dernière mise à jour :** 2026-10-08
**Feature :** robusta-landing-page
**Infix :** LANDING
**Status :** ACTIVE

## Story

En tant qu'éditeur de robusta.build, je veux une page d'accueil v2 composée des surfaces du design system robusta et portant le pitch de Robusta Build, afin que le site présente l'offre aux PME de la région, sans le CV obsolète et sans balisage marketing propre au site.

## Contexte & objectif

La page d'accueil v1 écrit tout à la main dans le site : pitch, logos clients, grille de compétences, aperçu du portfolio, CV en ligne, articles mis en avant (`apps/robusta/src/app/page.tsx` → `src/components/freelance/`). La v2 fait le pari inverse : une composition des surfaces marketing de `@robusta/pyramids-design-system`, alimentées par props. C'est la première preuve qu'un site est habillé par son propre design system (BR-PYRAMID-3), et la page que les sites suivants copieront.

Le texte reprend une partie triée du pitch v1, réécrite en français pour un dirigeant de PME (décisions du 2026-10-06). Le CV ne passe pas, il est hors périmètre de l'epic. Chaque surface prend désormais tout son texte en props, avec celui du prototype pour défaut ; cette story le remplace partout par celui de Robusta Build, rangé dans la configuration du site (BR-PYRAMID-8).

Le terrain est prêt depuis le 2026-10-07. tanstack-start-migration a livré le site sur TanStack Start, prérendu au build, sans `'use client'` ni `'use server'`, `<html lang>` suivant la Locale de la route. design-system-responsive a livré des surfaces qui tiennent de 320 à 1536 px, des calls to action en vraies ancres et le texte de `Hero` en props. Depuis le 2026-10-06, robusta.build est servi par ce site sur Netlify, sous `noindex` : un visiteur qui tape l'adresse lit aujourd'hui la page de démonstration du shell, autour de la section de notes que migrate-learn-content y a montée.

Cette story livre `/` sous `robots: noindex`, comme le reste du site : la levée revient à go-live, après seo-excellence et blog-rolls (décision du 2026-10-06). Elle touche le design system sur un point : ses surfaces laissent le site rendre leurs liens internes, qui passent ainsi par le router TanStack (décision du 2026-10-08). Hors périmètre : les pages de listing (blog-rolls), le schéma d'URL, le SEO au-delà du titre et de la description de `/` (seo-excellence), le retrait des textes par défaut des surfaces, l'A/B testing que la configuration rend possible, et `apps/robusta`, que retire-robusta-v1 retirera.

## Composition

Dans l'ordre :

- SiteHeader : le wordmark, qui mène à `/`, et l'appel au contact ; aucun lien de navigation
- Hero : la tagline « Sites web rapides et applications sur mesure » en eyebrow, le titre qui porte les vingt ans d'expérience, les deux appels au contact (e-mail, LinkedIn), et en note Toulouse, la zone desservie et les rendez-vous sur place ; la légende et le texte alternatif de la mascotte passent par `annotation` et `mascotAlt`
- PrinciplesList : la façon de travailler, et les références en texte : Renault, le BCG, les startups
- NotesPreview : la section de notes héritée de migrate-learn-content, les quatre articles publiés les plus récents ; son sur-titre, son titre et son lien « tous les articles » réécrits en français, à la première personne
- CTA : le bloc de contact final, sans formulaire
- SiteFooter : marque, tagline, copyright ; aucune colonne de liens avant blog-rolls

SiteHeader et SiteFooter viennent de la route racine et habillent toutes les pages du site ; `/` n'apporte que les quatre surfaces du milieu. ServicesGrid et FlowDiagram restent hors de la première version (décision du 2026-07-30).

## Acceptance Criteria

- AC-LANDING-1 : Given le site construit, When un visiteur ouvre `/`, Then il lit dans cet ordre l'en-tête, le hero, les principes, les notes, le bloc de contact et le pied de page, tous rendus par le design system, et plus rien de la démonstration du shell.
- AC-LANDING-2 : Given la page `/`, When un visiteur la lit, textes alternatifs compris, Then chaque mot est celui de Robusta Build, en français, à la première personne et au nom de Nicolas, et un lecteur d'écran la lit en français ; aucun texte du prototype (« we build software », « small team. long memory. », « this is crystal tux. », « what we publish. », « the system you're reading is itself. »…) ne lui parvient.
- AC-LANDING-3 : Given le hero et les principes, When un dirigeant de PME les lit, Then il y trouve la tagline en eyebrow, les vingt ans d'expérience dans un titre qui parle de son entreprise, Renault, le BCG et les startups, Toulouse avec la zone desservie et les rendez-vous sur place ; il n'y trouve ni la spécialité EVM, ni Toptal, ni Oracle, ni « remote », ni seuil de chiffre d'affaires, ni disponibilité datée.
- AC-LANDING-4 : Given n'importe quelle page du site, article compris, When le visiteur suit le wordmark ou l'appel au contact de l'en-tête, ou sur `/` un appel au contact du hero ou du bloc final ou un lien de la section de notes, Then le wordmark le ramène à `/` et chaque lien de la section de notes l'amène sur sa page, l'un et l'autre sans recharger toute la page, et chaque appel au contact l'amène sur un e-mail à Nicolas ou sur son profil LinkedIn, sans formulaire ni champ à remplir.
- AC-LANDING-5 : Given le site v2, When on le parcourt en entier, Then aucun CV n'est joignable : ni page, ni PDF, ni document intégré, ni lien vers un profil CV externe, Toptal compris.
- AC-LANDING-6 : Given JavaScript désactivé, When `/` est lu, Then le pitch, les références et le contact sont lisibles, chaque lien mène encore à sa page, et la page porte un titre et une description qu'aucune autre page ne partage.
- AC-LANDING-7 : Given les cas limites métier, When on les rejoue, Then sans article publié la page n'a pas de section de notes, plutôt qu'une section vide ou les articles d'exemple du design system, et avec moins de quatre articles elle montre ceux qui existent ; livrée avant go-live, la page reste fermée aux moteurs de recherche comme le reste du site, son lien « tous les articles » pouvant encore mener à une page de listing sans contenu propre ; à 320 px, l'adresse e-mail et le titre le plus long ne débordent pas et ne sont pas coupés.

## Boundaries

```
  Flèche = dépend de, du code client vers l'API utilisée.
  Packages de l'app `@robusta/robusta-build`, aucune boucle.

                        package `routes` [modified]
                         ┌───────────┴───────────┐
                         │ library               │ library
                         ↓                       ↓
                 package `landing`       package `chrome`
                 [modified]              [new]
                         │                       │
                         └───────────┬───────────┘
                                     │ library
             ┌───────────────────────┼──────────────────────┐
             ↓                       ↓                      ↓
  package `design-system`   package `components`   `seopyramids.config`
  [modified]                                       [modified]

  `routes` lit aussi `seopyramids.config`, pour la tête de `/` : flèche omise.
  `landing` et `chrome` utilisent aussi le module `@robusta/pyramids-design-system` [modified], d'un autre zoom : flèche omise.
```

### library API of module `@robusta/pyramids-design-system` — modified

Client code : les packages `landing` et `chrome` de l'app.

- les surfaces qui rendent un lien interne · modified — le site leur fournit le composant qui rend ces liens ; sur les pages de cette story, le wordmark de `SiteHeader` et les liens de `NotesPreview`, et de même pour toute autre surface
- le package ne dépend ni de TanStack ni d'aucun router, et aucun composant ne porte `'use client'` ni `'use server'`
- le reste se consomme tel que design-system-responsive l'a livré : `SkButton.href`, `FooterLink`, `annotation` et `mascotAlt` dans `HeroProps`

### library API of package `landing` in app `@robusta/robusta-build` — modified

Client code : la route `/`.

- `LandingPage` · new — Hero, PrinciplesList, NotesPreview et CTA dans l'ordre de la Composition, leur texte lu dans la configuration du site, leurs liens internes rendus par le router
- `NotesSection` · modified — sur-titre, titre et lien « tous les articles » en français, lus dans la configuration du site, ses liens rendus par le router ; sélection et flux inchangés

### library API of package `chrome` in app `@robusta/robusta-build` — new

Client code : la route racine, qui en habille toutes les pages du site.

- `Header` — SiteHeader alimenté par la configuration du site : wordmark vers `/` par le router, appel au contact
- `Footer` — SiteFooter alimenté par la configuration du site : marque, tagline, copyright, aucune colonne

### library API of the site configuration `seopyramids.config` in app `@robusta/robusta-build` — modified

- type `SeoPyramidsConfig` · modified
  - `contact` — new ; l'e-mail et le profil LinkedIn, source unique de la route de contact
  - la page copy de `/`, de l'en-tête et du pied de page — new ; tout le texte que ces surfaces affichent, textes alternatifs compris
  - le titre et la description de `/` — new ; écrits depuis le pitch, propres à `/`

### library API of package `design-system` in app `@robusta/robusta-build` — modified

- `heroMascotSrc`, `ctaMascotSrc` — new ; `crystal-tux.svg` et `crystal-tux-waving.svg`, résolus par les exports du package

### HTTP API of app `@robusta/robusta-build` — modified

- `GET /` — 200, la landing page prérendue au build, son titre et sa description propres, `<html lang>` de la Locale par défaut, sous `robots: noindex` comme tout le site jusqu'à go-live
- toute autre page — statut et contenu inchangés, désormais entre l'en-tête et le pied de page du site

## Décisions

- 2026-07-29 — La page parle à la première personne du singulier, au nom d'un ingénieur nommé ; le « we » par défaut des surfaces est réécrit. Pourquoi : Robusta Build vend une personne nommée, et sa crédibilité tient à son parcours ; un visiteur qui lit « petite équipe » puis rencontre une seule personne a été trompé. Confirmé le 2026-10-06 pour la page française.
- 2026-07-29 — La preuve sociale v1 survit en texte dans Hero et PrinciplesList ; mur de logos, grille de compétences et portfolio sortent de la story. Pourquoi : une nouvelle surface change le package du design system, ce qui est une autre story ; les références survivent en mots. Restreinte le 2026-10-06 à Renault, au BCG et aux startups.
- 2026-07-30 — ServicesGrid et FlowDiagram restent hors de la première version, jusqu'à ce que trois services et un déroulé d'engagement soient écrits. Pourquoi : Gap 3 du brainstorm ; ces surfaces décrivent une offre packagée (audit payant, engagement intégré, refonte cadrée, prise en charge en cinq étapes) que rien n'a jamais décrite, avec des prix et des durées que personne ne s'est engagé à tenir.
- 2026-07-30 — Le site peut passer des fragments qui n'utilisent que des noms de classe du design system, et envelopper une surface dans un élément nu pour porter un `id` ; il ne définit ni classe, ni couleur, ni police, ni espacement. Pourquoi : Open Question 3 du brainstorm ; le vocabulaire de classes appartient au design system, et une ancre relève de la navigation.
- 2026-07-30 — Le titre du hero suit la voix de la marque : minuscules, simple, sans superlatif. Pourquoi : Open Question 4 du brainstorm. Le reste de cette décision (titre anglais, EVM en sous-titre, « remote » en note) est remplacé le 2026-10-06.
- 2026-10-06 — Robusta Build se présente avec la tagline « Sites web rapides et applications sur mesure », telle quelle, sur sa fiche Google Business Profile et sur le site v2. Pourquoi : une ligne nomme les deux offres ; « progiciel », jugé daté, a cédé la place à « applications sur mesure », gardé en sachant qu'un profane peut entendre « application mobile ».
- 2026-10-06 — robusta.build passe entièrement en français, et Robusta Build devient une entreprise locale qui aide les entreprises de sa région à grandir : des PME d'au moins 500 000 € de chiffre d'affaires, que des logiciels adaptés à leur activité font passer le million. Pourquoi : décision de l'éditeur, consignée aussi dans l'epic. Impact : `/` est en français, et les arguments choisis en juillet pour une page anglaise sont retriés plus bas.
- 2026-10-06 — La tagline va telle quelle dans l'eyebrow du Hero, et le titre reste une ligne à part qui porte l'expérience. Pourquoi : l'eyebrow dit ce que la page vend, le titre dit pourquoi faire confiance à celui qui le vend, et le parcours est le seul argument qu'un concurrent ne peut pas copier.
- 2026-10-06 — La page garde la première personne et nomme Nicolas. Restent : les vingt ans, dans un titre qui parle de l'entreprise du client ; Renault, le BCG et les startups ; Toulouse en note, avec la zone desservie et les rendez-vous sur place à la place de « remote ». Sortent : la spécialité EVM, la sélection Toptal, la certification Oracle et le seuil de chiffre d'affaires. Pourquoi : un dirigeant de PME vérifie que la personne est réelle, proche, et a livré pour des entreprises sérieuses ; EVM, Toptal et Oracle parlent à un recruteur technique, et « remote » contredit la promesse locale. La fiche Google Business Profile (`documentation/google-business-profile.md`) fait les mêmes coupes et garde le seuil pour la prospection.
- 2026-10-06 — La légende du `Hero` et le nom accessible de sa mascotte passent par deux props de `HeroProps`, `annotation` et `mascotAlt` ; une annotation vide masque la légende et sa flèche. Pourquoi : Gap-LANDING-10, `lgtm` — le `Hero` affichait « this is crystal tux. she lives here. » quelles que soient ses props, et BR-PYRAMID-8 interdit au design system tout texte de page. Livré par design-system-responsive le 2026-10-07, avec le texte de `ServicesGrid` et du `BrandLogo` complet.
- 2026-10-06 — Les pages de listing (accueils de blog, pages de catégorie et leurs suites) reviennent à un item de l'epic, `blog-rolls`, placé avant go-live, le même que demande Gap-SEOEXCELLENCE-17. Pourquoi : Gap-LANDING-11, `lgtm` — sans lui, la moitié des pages du site seraient vides le jour où il s'ouvre aux moteurs de recherche. Impact : cette story livre le lien « tous les articles » vers une page de listing encore placeholder, et un pied de page sans colonne de liens.
- 2026-10-06 — Le `robots: noindex` ne se lève pas dans cette story : un item à part, `go-live`, placé après seo-excellence et blog-rolls, ouvre les pages aux moteurs de recherche ; c'est l'item qu'OQ-SEOEXCELLENCE-19 propose aussi. Pourquoi : OQ-LANDING-12, `lgtm` — lever plus tôt ferait indexer des pages vides. La bascule de robusta.build sur Netlify, que go-live devait porter, a eu lieu le 2026-10-06 avec tanstack-start-migration.
- 2026-10-06 — SiteHeader et SiteFooter habillent toutes les pages du site depuis la route racine, réécrite par tanstack-start-migration, et pas `/` seule. Pourquoi : OQ-LANDING-13, `lgtm` — la plupart des visiteurs arriveront sur un article depuis un moteur de recherche, et un article n'offre aujourd'hui aucun chemin vers le pitch ni vers le contact.
- 2026-10-08 — `Breakpoint` entre dans `ubiquitous-language.md`, sur les cinq largeurs de design-system-responsive (40, 48, 64, 80 et 96rem), avant que designman n'écrive le design de cette story ; AC-LANDING-7 garde « 320 px », plancher des surfaces et pas un breakpoint. Une règle l'accompagne, qu'epicman enregistre avec l'entrée : « Les breakpoints d'un site doivent venir de son design system seul. » Pourquoi : Gap-LANDING-14, `lgtm`, et la règle demandée par Nicolas ; sans nom, le design citerait des nombres nus qui dériveraient de ceux du package. La règle passe les tests du registre une fois le terme au glossaire, et prolonge BR-PYRAMID-6 : le greffier peut l'y fondre plutôt que d'ouvrir un numéro.
- 2026-10-08 — BR-PYRAMID-8 fait foi dans sa version de HEAD : « Un site doit fournir la page copy de chaque page qu'il publie ; son design system ne doit fournir aucune page copy. » Seule exception : un texte dessiné, le wordmark de `BrandLogo`, est un asset de marque et pas de la page copy. La page copy du site vit dans sa configuration. Pourquoi : OQ-LANDING-15 ; Nicolas ne voit aucun texte qu'un design system aurait à fournir, et une page copy rangée dans la configuration se change ou se teste en A/B sans toucher à un composant. Impact : epicman reporte l'exception dans la définition de Page copy, et la page copy dans celle de Site configuration ; les textes anglais que les surfaces gardent par défaut contreviennent à la règle, et leur retrait, qui modifie le design system, revient à un item à part que cette story n'attend pas, AC-LANDING-2 protégeant ses pages.
- 2026-10-08 — Les liens internes que rendent les surfaces du design system, le wordmark de l'en-tête, les liens de la section de notes et tout autre, changent de page par le router TanStack du site, comme `SiteLink`, sans recharger la page. Pourquoi : OQ-LANDING-16, Proposition refusée : « On utilise le top de la technologie et on s'appuie sur Tanstack pour faire un bon routing. » Impact : le design system laisse le site fournir le composant qui rend ses liens internes, sans dépendre de TanStack ni d'aucun router ; l'exception que R-TANSTACK-47 laissait à cette story se ferme.

## Documentation updates

- change the intro, « Where the truth of this site lives » and the « What they render » paragraph of `apps/robusta-build/README.md` — why: `/` cesse d'être un placeholder, la page copy rejoint la configuration du site, la landing devient l'exemple de référence d'un site qui consomme son propre design system, et l'en-tête et le pied de page habillent toutes les pages depuis la route racine
- change the « Import — components » section of `packages/robusta-design-system/README.md` — why: son exemple rend les surfaces avec le texte du prototype et des liens en ancres simples ; la landing est un vrai consommateur qui passe tout son texte et son composant de lien
- change the robusta.build entry of `root.archi.md`, the description of `/` and the package list of `apps/robusta-build/robusta-build.archi.md`, and the `@robusta/robusta-build` entry of `CLAUDE.md` — why: tous décrivent encore la page d'accueil comme un placeholder, et le package `chrome` est nouveau

## Dependencies

- Dep 3 : items 1 default-locale-fr et 2 translate-english-articles — `/` ne se déclare en français et sa section de notes ne montre des articles français qu'après le premier ; le second porte de trois à neuf les articles que la section peut montrer (BR-PYRAMID-11). Bloque la livraison, pas le design.
- Dep 4 : item 9 breakpoint-glossary — `Breakpoint` au glossaire et la règle sur les breakpoints au registre, écrits par epicman une fois arbitrées les modifications non commitées du glossaire. Bloque le design.
- Levées : Dep 1 design-system-responsive et Dep 2 tanstack-start-migration, landées le 2026-10-07 ; bootstrap-robusta-build, merge-design-system, unblock-build et migrate-learn-content, livrées avant.
