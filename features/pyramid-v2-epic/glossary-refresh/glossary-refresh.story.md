# Story : le glossaire d'accord avec le site multilingue

**Dernière mise à jour :** 2026-11-04
**Feature :** glossary-refresh
**Infix :** GLOSSARY
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que `ubiquitous-language.md` dise ce que le site fait depuis multilingual-site et default-locale-at-root, **afin que** le design de seo-excellence calcule ses canonical URLs et son hreflang sur des termes justes.

## Contexte & objectif

multilingual-site, livré le 2026-10-31 (`fb4803b`), retire le discriminant `l`, rapatrie le schéma d'URL et la lecture du corpus dans le site (BR-PYRAMID-12), remplace `siteTitle` et `mission` par une page copy par Locale et suit les traductions. Il préfixait aussi chaque page par sa Locale, `en` comprise ; default-locale-at-root, soumise le 2026-11-03 (`2fbc7be`), a retiré ce préfixe à la Locale par défaut (BR-PYRAMID-14) : `/` est la landing page `en`, son contenu vit sous `/articles…`, `fr` et `es` gardent `/fr` et `/es`, et l'hébergeur répond 301 de `/en` et `/en/*` vers la forme sans préfixe.

L'entrée `Locale` dit de nouveau vrai sur la Locale par défaut sans marqueur. Le reste du glossaire décrit encore quatre discriminants, une base partagée qui lit le corpus, un titre de site et une mission, et une `Canonical URL` dont toute autre forme redirige, alors que le site en sert la plupart en 404.

La story regroupe trois items de l'epic : multilingual-glossary, canonical-url-glossary, en attente depuis le 2026-10-07, et la moitié glossaire de rb-compound-positioning, l'entrée `RB Compound`. Refaire `documentation/geo-questions.md` autour de ce terme reste à rb-compound-positioning.

Le glossaire décrit la base v2. Il ne cite la v1 que là où il le fait déjà, comme pour `Article` ; dakar.surf, obsolète, reste un exemple de site et sera migré quand il le faudra. Le livrable est le seul fichier `ubiquitous-language.md` : aucun code ne change. L'entrée `Section`, qui remplace le mot « surface » depuis `a859736`, reste telle quelle, comme toute entrée que la story ne cite pas. Pour `Workspace`, `Green set` et `Build chain`, la story suit les Propositions de Gap-GLOSSARY-4 et Gap-GLOSSARY-5, en attente dans `glossary-refresh.brainstorm.md`.

## Acceptance Criteria

- AC-GLOSSARY-1 : Given le schéma d'URL du site, When un lecteur lit `Locale`, `Discriminant` et `Landing page`, Then la Locale par défaut ne porte aucun marqueur dans l'URL et chaque autre Locale porte le sien en premier segment (`/fr`, `/es`) ; les discriminants sont trois, `c`, `p` et `t`, et appartiennent au schéma du site, plus à une base partagée ; chaque Locale a sa landing page, même sans article publié, `/` étant celle de la Locale par défaut, `en` sur robusta.build.
- AC-GLOSSARY-2 : Given ce que le site sert, When un lecteur lit `Canonical URL`, Then la forme que produit le schéma est la seule que le site construit pour une page, sans préfixe pour une page de la Locale par défaut, et `/` est la seule qui finit par une barre ; l'entrée dit ce que reçoit une autre forme : la redirection permanente de l'hébergeur pour `/en`, `/en/…` et une barre finale, `/fr/` compris ; pour une majuscule, la redirection permanente quand la forme minuscule existe, un 404 sinon ; un 404 pour une page un explicite, une adresse sous `/l/` ou une Locale que le site ne déclare pas. Une redirection ne promet pas de page : `/en/articles/c/theory`, category que seule `fr` revendique, mène à un 404. Le jumeau `.html` que l'hébergeur sert en 200 reste hors de l'entrée : la balise canonique de seo-excellence le traite.
- AC-GLOSSARY-3 : Given BR-PYRAMID-3, 12 et 13, When un lecteur lit `Pyramid`, `Module`, `Site`, `Design system`, `Content source`, `Build chain`, `Workspace` et `Green set`, Then la pyramid est l'ensemble des modules qui peuvent servir à plusieurs sites ; un module a son propre manifeste de build, des apps ou d'autres modules en dépendent, et il vit sous `packages/` (CLAUDE.md, vocabulaire des composants) ; un site porte un design system qu'il peut partager, et ce qu'il est seul à utiliser lui appartient, schéma d'URL et lecture du corpus compris, sauf le design system, qui reste un module même quand un seul site l'emploie (BR-PYRAMID-13) ; `Design system` commence par « Chaque site en porte un » ; la content source est une arborescence que le site déclare et lit ; `Build chain` reconstruit des modules, « package » désignant un répertoire d'une app ou d'un module, et un site ne lit d'un module que ce que son manifeste exporte, construit ou non (Gap-GLOSSARY-5) ; `Workspace` est l'ensemble du code et de la documentation du projet, et `Green set` l'ensemble nommé des apps et des modules qui doivent se construire depuis un clean checkout, sans service (Gap-GLOSSARY-4).
- AC-GLOSSARY-4 : Given la site configuration de robusta.build, When un lecteur lit `Site configuration`, Then elle porte le domaine, le nom du site, le logo, la Locale par défaut et les autres, les réglages du blog, le contact et la page copy de chaque Locale, sans titre de site ni mission.
- AC-GLOSSARY-5 : Given le suivi des traductions, When un lecteur lit `Original` et `Stale translation`, Then l'original est la version publiée d'un article dont une autre version est la traduction, et un article qui ne se déclare la traduction d'aucun autre est son propre original, y compris quand deux versions partagent un translation identifier sans original déclaré ; une traduction dont l'original n'est pas publié reste servie, sans lien vers lui ; une stale translation est une traduction publiée dont l'original a changé de titre, d'excerpt ou de corps depuis qu'elle a été déclarée à jour : elle reste publiée, et la build la signale ; un changement de category, de tags, de date, de couverture ou de blancs seuls n'en fait pas une, une traduction non publiée non plus.
- AC-GLOSSARY-6 : Given les décisions du 2026-10-25 et du 2026-10-26, When un lecteur lit `RB Compound`, Then c'est le nom sous lequel robusta.build présente le workflow Compound et l'offre de services de Nicolas aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, en deux versions : open source et gratuite, ou complète, seulement avec un accompagnement payant ; l'entrée ne dit pas la version open source disponible et ne lie aucun dépôt.
- AC-GLOSSARY-7 : Given les cas limites, When un lecteur relit tout le glossaire, Then aucune entrée ne donne de marqueur à la Locale par défaut, ne compte `l` parmi les discriminants, ne nomme `siteTitle` ni `mission`, ni ne prête le schéma ou le corpus à une base partagée ; l'empreinte, la contrepartie et la paire non suivie, termes de code, n'y entrent pas ; dakar.surf n'ajoute aucune exception ; la story ne crée aucune règle métier ; les entrées que la story ne cite pas restent mot pour mot.

## Boundaries

Aucune API touchée : la story ne modifie que `ubiquitous-language.md`, ni code ni contrat.

## Documentation updates

- change les entrées `Locale`, `Discriminant`, `Landing page`, `Canonical URL`, `Pyramid`, `Site`, `Design system`, `Content source`, `Site configuration` et `Build chain` de `ubiquitous-language.md` — why: état livré par multilingual-site et default-locale-at-root, BR-PYRAMID-3, 12, 13 et 14.
- change les entrées `Workspace` et `Green set` de `ubiquitous-language.md` — why: elles définissent encore un module comme une bibliothèque partagée et un workspace comme un package yarn, contre `Module` (Gap-GLOSSARY-4).
- create les termes `Original`, `Stale translation`, `RB Compound` et `Module` dans `ubiquitous-language.md` — why: suivi des traductions, positionnement de la landing page, BR-PYRAMID-12 et 13.

## Dependencies

- multilingual-site, dont la story décrit l'état : LANDED le 2026-10-31 (`fb4803b`) — levée.
- default-locale-at-root, qui retire le préfixe de la Locale par défaut : SUBMITTED le 2026-11-03 (`2fbc7be`) — levée.
- Débloque : le design de seo-excellence, dont la Dep 3 attend `Canonical URL` et qui déclare hreflang sur `Locale` ; la seconde moitié de rb-compound-positioning ; l'enregistrement par epicman, sous PYRAMID et à son numéro, de la règle « Un site doit publier une stale translation qui se déclare publiée », une fois `Stale translation` au glossaire, donc après la livraison de cette story.
