# Ubiquitous Language

Le vocabulaire partagé de Pyramids.

## Produit

Pyramid : La base réutilisable qui transforme du contenu et un design system en
site SEO déployable. Ce n'est pas un site en soi ; c'est ce à partir de quoi
plusieurs sites sont construits.

Site : Un domaine déployé construit sur la pyramid — robusta.build, dakar.surf.
Un site possède son contenu, son design system et sa configuration ; il emprunte
tout le reste.

Site configuration : La source de vérité propre à chaque site : domaine, nom et
titre du site, mission, logo, locale par défaut, autres locales, réglages du
blog, et la page copy que le site ne tire pas de ses articles. Elle vit dans `src/seopyramids.config.ts`, à l'intérieur du site.

Design system : L'identité visuelle d'un site : les tokens de couleur et de
typographie, les assets de marque, et les primitives et surfaces de page
construites dessus. Un design system par site ; les sites ne les partagent pas.

Design token : Une valeur visuelle nommée (couleur, police, espacement), exposée
comme variable CSS et consommée par les composants. Les tokens sont le seul
moyen admis pour qu'un composant connaisse une couleur.

Breakpoint : Une largeur d'écran à partir de laquelle la mise en page d'une
surface change. Le design system d'un site les fixe ; celui de robusta.build en
a cinq, `sm`, `md`, `lg`, `xl` et `2xl` : 40, 48, 64, 80 et 96rem. 320 px, la
largeur minimale que tiennent les surfaces, n'en est pas un.

Landing page : La page d'accueil d'un site, construite à partir de son design
system. C'est une surface marketing, distincte de toute page de contenu.

Page copy : Le texte qu'un visiteur lit sur une page, fourni par le site qui la
publie. Un texte dessiné dans un asset de marque, comme le wordmark, n'en est
pas : il appartient au design system.

## Contenu

Article : Un contenu écrit publié sur un site, adressé par son slug. C'est le
terme v2. La _v1_ appelait la même chose un post et la servait sous `/learn`.

Published article : Un article qu'un site sert, ce qu'il ne fait que si
l'article se déclare publié (BR-PYRAMID-10) ; un article qui ne le fait pas est
écrit et conservé, et n'a pas de page.

Category : La classification à laquelle appartient un article. Un article en
revendique au plus une (BR-PYRAMID-9), ce qui rend une category lisible dans
l'adresse d'un article, et une category tient en exactement un segment : les
categories ne s'imbriquent pas. Chaque category a sa propre page. La _v1_
déclarait des chemins imbriqués comme `javascript/typescript` ; en v2, un tel
chemin désigne sa feuille.

Tag : Une classification qu'un article peut porter librement, en nombre
quelconque, à côté de la seule category qu'il peut revendiquer (BR-PYRAMID-9).
Un tag est une métadonnée : il n'a pas de page propre aujourd'hui, et le schéma
d'URL réserve une adresse pour la page de tag qu'il doit pouvoir accueillir.

Blog roll : La liste paginée d'articles affichée sur une page de category ou sur
l'accueil du blog. Sa longueur par page est la roll size, une constante de 12 et
non un réglage par site : une site configuration expose la valeur, elle ne la
choisit pas.

Slug : L'identifiant stable d'un article ou d'une category, utilisable tel quel
dans une URL. Un slug ne change jamais une fois publié — le changer casse des
URL indexées.

Locale : La langue dans laquelle une page est servie. Un site a une locale par
défaut, qui ne porte aucun marqueur dans l'URL, et zéro ou plusieurs autres
locales, qui en portent un.

Translation identifier : La valeur durable que partagent les versions d'un même
article dans chaque locale, et qui permet de les relier entre elles.

Content source : L'origine des articles d'un site — aujourd'hui, des fichiers
markdown livrés avec le site, dans une arborescence que le site déclare et que
la base partagée sait lire. Elle est lue pendant la build d'un site, une fois
par processus de build, et jamais pendant qu'un site sert une requête
(BR-PYRAMID-7).

Content root : Le segment unique sous lequel un site publie sa section de
contenu, nommé par la site configuration. `articles` pour robusta.build ; un
autre site nomme le sien.

Asset root : Le préfixe d'URL sous lequel un site publie les fichiers que ses
articles référencent. Ce n'est pas le content root : il ne porte aucune page, il
adresse des fichiers et non des pages, et chaque site nomme le sien.

Discriminant : Un segment d'URL qui indique quel type de page suit. Le jeu v2 en
compte quatre — `l` pour la locale, `c` pour une category, `p` pour une page de
roll, et `t`, qui réserve l'adresse d'une page de tag que le schéma garde
possible sans la construire. Ils appartiennent à la base partagée, ce sont des
mots réservés à chaque niveau du schéma, et ils existent pour que les pages
puissent être prégénérées à la build au lieu d'être résolues au runtime. La _v1_
utilisait la locale, `page` pour le blog roll et `s` pour un post.

Canonical URL : La forme unique d'une URL sous laquelle un site sert une page —
celle que produit le schéma lui-même. Toute autre forme qui adresse la même
page, comme une première page de roll explicite, une locale par défaut marquée,
un slash final ou une casse différente, y redirige de façon permanente. La
canonicité est la propriété d'être cette forme, pas un second terme.

Indexable page : Une page qu'un site propose aux moteurs de recherche. Une page
est indexable quand elle est adressée par une URL qui lui est propre et porte un
contenu qui lui est propre ; une page qui ne fait que router, rediriger, ou
répéter ce qu'une autre page contient déjà ne l'est pas.

Related articles : Les articles qu'un site propose à un lecteur à la fin d'un
article, choisis parmi les published articles de la même locale d'après les
categories et les tags qu'ils partagent. Un article qui n'a rien de pertinent à
proposer n'a pas de related articles, et l'ensemble est alors vide.

## Livraison

Workspace : Un package yarn du monorepo. Trois sortes : une app (un site
déployable ou une démo), un module (une bibliothèque partagée), un service (un
processus backend).

Build chain : La reconstruction ordonnée des packages partagés, qui doit aboutir
avant la build de tout site. Un site ne lit jamais les sources d'un package,
seulement son build output.

Clean checkout : Un checkout sans aucune dépendance installée ni build output
nulle part dans son ascendance. Un worktree git à côté d'un dépôt déjà installé
n'en est pas un.

Green set : L'ensemble nommé des workspaces qui doivent se construire depuis un
clean checkout : la build chain plus chaque site que le dépôt prétend livrer.
