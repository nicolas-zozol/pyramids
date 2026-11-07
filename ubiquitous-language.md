# Ubiquitous Language

Le vocabulaire partagé de Pyramids.

## Produit

Pyramid : L'ensemble des modules qui peuvent servir à plusieurs sites (BR-PYRAMID-12). Ce n'est pas un site.

Site : Un domaine déployé, robusta.build ou dakar.surf. Un site porte un design system, qu'il peut partager avec d'autres sites (BR-PYRAMID-3). Ce qu'il est seul à utiliser lui appartient, schéma d'URL et lecture du corpus compris (BR-PYRAMID-12), sauf son design system, qui reste un module même quand il est seul à l'employer (BR-PYRAMID-13).

Site configuration : La source de vérité propre à chaque site : domaine, nom du site, logo, Locale par défaut et autres Locales, réglages du blog, contact, et la page copy de chaque Locale. Elle vit dans `src/seopyramids.config.ts`, à l'intérieur du site.

Design system : Chaque site en porte un (BR-PYRAMID-3). C'est l'identité visuelle d'un site : les tokens de couleur et de typographie, les assets de marque, et les primitives et les sections construites dessus. Un design system est un module, que plusieurs sites peuvent partager en tout ou en partie.

Section : Un bloc pleine largeur d'une page, rendu par un composant du design system : `SiteHeader`, `Hero`, `ServicesGrid`, `FlowDiagram`, `PrinciplesList`, `NotesPreview`, `CTA`, `SiteFooter`. Une section est faite de primitives, et son texte est la page copy que le site lui passe (BR-PYRAMID-8). La partie d'un article qu'ouvre un titre `h2` n'est pas une section.

Design token : Une valeur visuelle nommée (couleur, police, espacement), exposée comme variable CSS et consommée par les composants. Les tokens sont le seul moyen admis pour qu'un composant connaisse une couleur.

Breakpoint : Une largeur d'écran à partir de laquelle la mise en page d'une section change. Le design system d'un site les fixe ; celui de robusta.build en a cinq, `sm`, `md`, `lg`, `xl` et `2xl` : 40, 48, 64, 80 et 96rem. 320 px, la largeur minimale que tiennent les sections, n'en est pas un.

Landing page : La page d'accueil d'une Locale, faite de sections et distincte de toute page de contenu. Chaque Locale a la sienne, même sans article publié : `/` est celle de la Locale par défaut, `en` sur robusta.build, et chaque autre Locale a la sienne à son marqueur, `/fr`, `/es`.

Page copy : Le texte qu'un visiteur lit sur une page, fourni par le site qui la publie. Un texte dessiné dans un asset de marque, comme le wordmark, n'en est pas : il appartient au design system.

RB Compound : Le nom sous lequel robusta.build présente le workflow Compound et l'offre de services de Nicolas aux équipes et aux responsables techniques qui produisent du logiciel avec des agents IA, en deux versions : open source et gratuite, ou complète, seulement avec un accompagnement payant.

## Contenu

Article : Un contenu écrit publié sur un site, adressé par son slug. C'est le terme v2. La _v1_ appelait la même chose un post et la servait sous `/learn`.

Published article : Un article qu'un site sert, ce qu'il ne fait que si l'article se déclare publié (BR-PYRAMID-10) ; un article qui ne le fait pas est écrit et conservé, et n'a pas de page.

Category : La classification à laquelle appartient un article. Un article en revendique au plus une (BR-PYRAMID-9), ce qui rend une category lisible dans l'adresse d'un article, et une category tient en exactement un segment : les categories ne s'imbriquent pas. Chaque category a sa propre page. La _v1_ déclarait des chemins imbriqués comme `javascript/typescript` ; en v2, un tel chemin désigne sa feuille.

Tag : Une classification qu'un article peut porter librement, en nombre quelconque, à côté de la seule category qu'il peut revendiquer (BR-PYRAMID-9). Un tag est une métadonnée : il n'a pas de page propre aujourd'hui, et le schéma d'URL réserve une adresse pour la page de tag qu'il doit pouvoir accueillir.

Blog roll : La liste paginée d'articles affichée sur une page de category ou sur l'accueil du blog. Sa longueur par page est la roll size, une constante de 12 et non un réglage par site : une site configuration expose la valeur, elle ne la choisit pas.

Slug : L'identifiant stable d'un article ou d'une category, utilisable tel quel dans une URL. Un slug ne change jamais une fois publié — le changer casse des URL indexées.

Locale : La langue dans laquelle une page est servie. Un site a une Locale par défaut, qui ne porte aucun marqueur dans l'URL (BR-PYRAMID-14), et zéro ou plusieurs autres Locales, qui portent chacune le sien en premier segment, `/fr`, `/es`.

Translation identifier : La valeur durable que partagent les versions d'un même article dans chaque locale, et qui permet de les relier entre elles.

Original : La version publiée d'un article dont une autre version est la traduction. Un article qui ne se déclare la traduction d'aucun autre est son propre original, y compris quand deux versions partagent un translation identifier sans original déclaré. Une traduction dont l'original n'est pas publié reste servie, sans lien vers lui.

Stale translation : Une traduction qui se déclare publiée dont l'original a changé de titre, d'excerpt ou de corps depuis qu'elle a été déclarée à jour. Un site la publie (BR-PYRAMID-15), et la build la signale. Un changement de category, de tags, de date, de couverture ou de blancs seuls n'en fait pas une, une traduction non publiée non plus (BR-PYRAMID-10).

Content source : L'origine des articles d'un site : une arborescence de fichiers markdown que le site déclare et lit. Elle est lue pendant la build d'un site, une fois par processus de build, et jamais pendant qu'un site sert une requête (BR-PYRAMID-7).

Content root : Le segment unique sous lequel un site publie son contenu, nommé par la site configuration. `articles` pour robusta.build ; un autre site nomme le sien.

Asset root : Le préfixe d'URL sous lequel un site publie les fichiers que ses articles référencent. Ce n'est pas le content root : il ne porte aucune page, il adresse des fichiers et non des pages, et chaque site nomme le sien.

Discriminant : Un segment d'URL qui indique quel type de page suit. Le schéma d'URL du site en compte trois : `c` pour une category, `p` pour une page de roll, et `t`, qui réserve l'adresse d'une page de tag sans la construire. Ce sont des mots réservés du schéma d'URL du site, et ils existent pour que les pages puissent être prégénérées à la build au lieu d'être résolues au runtime. La _v1_ utilisait la locale, `page` pour le blog roll et `s` pour un post.

Canonical URL : La forme d'une URL que produit le schéma, la seule que le site construit pour une page : sans préfixe pour une page de la Locale par défaut, et sans barre finale, sauf `/`. Une autre forme reçoit une redirection permanente de l'hébergeur pour `/en`, `/en/…` et une barre finale, `/fr/` compris ; pour une majuscule, une redirection permanente quand la forme minuscule existe, un 404 sinon ; un 404 pour une première page de roll explicite, une adresse sous `/l/` ou une Locale que le site ne déclare pas. Une redirection ne promet pas de page : sa cible peut répondre 404. La canonicité est la propriété d'être cette forme, pas un second terme.

Indexable page : Une page qu'un site propose aux moteurs de recherche. Une page est indexable quand elle est adressée par une URL qui lui est propre et porte un contenu qui lui est propre ; une page qui ne fait que router, rediriger, ou répéter ce qu'une autre page contient déjà ne l'est pas.

Related articles : Les articles qu'un site propose à un lecteur à la fin d'un article, choisis parmi les published articles de la même locale d'après les categories et les tags qu'ils partagent. Un article qui n'a rien de pertinent à proposer n'a pas de related articles, et l'ensemble est alors vide.

## Livraison

Workspace : L'ensemble du code et de la documentation du projet.

Module : Du code qui a son propre manifeste de build et dont des apps ou d'autres modules dépendent ; il vit sous `packages/`. App, module et package sont définis dans `CLAUDE.md`, vocabulaire des composants.

Build chain : La reconstruction ordonnée des modules, qui doit aboutir avant la build de tout site. « Package » y désigne un répertoire d'une app ou d'un module. Un site ne lit d'un module que ce que son manifeste exporte, construit ou non.

Clean checkout : Un checkout sans aucune dépendance installée ni build output nulle part dans son ascendance. Un worktree git à côté d'un dépôt déjà installé n'en est pas un.

Green set : L'ensemble nommé des apps et des modules qui doivent se construire depuis un clean checkout : la build chain plus chaque site que le dépôt prétend livrer.
