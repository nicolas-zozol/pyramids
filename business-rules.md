# Règles métier

## PYRAMID — construire des sites SEO sur la base partagée

- BR-PYRAMID-1 — L'URL d'une page doit indiquer le type de page qu'elle adresse, pour qu'un site puisse la résoudre sans consulter sa content source.
- BR-PYRAMID-2 — Un site construit sur la base v2 ne doit pas suivre les intents de ses visiteurs.
- BR-PYRAMID-3 — Chaque site doit porter un design system. Ce design system peut être réutilisé par plusieurs sites, soit directement, soit par une forme d'héritage ou de composition.
- BR-PYRAMID-5 — La build chain d'un site doit aboutir depuis un clean checkout du dépôt sur la branche main.
- BR-PYRAMID-6 — Les design tokens et les breakpoints d'un site doivent provenir de son seul design system.
- BR-PYRAMID-7 — Un site ne doit pas lire sa content source pendant qu'il sert une requête.
- BR-PYRAMID-8 — Un site doit fournir la page copy de chaque page qu'il publie ; son design system ne doit fournir aucune page copy.
- BR-PYRAMID-9 — Un article porte au plus une category et un nombre quelconque de tags.
- BR-PYRAMID-10 — Un site ne publie un article que si cet article se déclare publié.
- BR-PYRAMID-12 — Un module doit pouvoir servir à plusieurs sites construits sur la pyramid ; ce qu'un seul site utilise appartient à ce site.
- BR-PYRAMID-13 — Le design system d'un site peut rester un module même quand ce site est le seul à l'utiliser.
- BR-PYRAMID-14 — Un site doit servir les pages de sa Locale par défaut sans marqueur de Locale dans leur URL.

BR-PYRAMID-4 est retiré : cet identifiant n'est jamais réutilisé.

BR-PYRAMID-11 est retiré, remplacé par BR-ROBUSTA-1 : cet identifiant n'est jamais réutilisé.

## ROBUSTA — le site robusta.build

robusta.build est un des sites de la base Pyramids.

- BR-ROBUSTA-1 — robusta.build doit servir ses pages dans plusieurs locales, l'anglais étant sa locale par défaut.
