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

Le glossaire décrit la base v2. Il ne cite la v1 que là où il le fait déjà, comme pour `Article` ; dakar.surf, obsolète, reste un exemple de site et sera migré quand il le faudra. Le livrable est le seul fichier `ubiquitous-language.md` : aucun code ne change. L'entrée `Section`, qui remplace le mot « surface » depuis `a859736`, reste telle quelle, comme toute entrée que la story ne cite pas.

## Acceptance Criteria

- AC-GLOSSARY-1 : Given le schéma d'URL du site, When un lecteur lit `Locale`, `Discriminant` et `Landing page`, Then la Locale par défaut ne porte aucun marqueur dans l'URL et chaque autre Locale porte le sien en premier segment (`/fr`, `/es`) ; les discriminants sont trois, `c`, `p` et `t`, et appartiennent au schéma du site, plus à une base partagée ; chaque Locale a sa landing page, `/` étant celle de la Locale par défaut, `en` sur robusta.build.
- AC-GLOSSARY-2 : Given ce que le site sert, When un lecteur lit `Canonical URL`, Then la forme que produit le schéma est la seule que le site construit pour une page, sans préfixe pour une page de la Locale par défaut, et l'entrée dit ce que reçoit une autre forme : la redirection permanente de l'hébergeur pour `/en`, `/en/…`, une barre finale ou une majuscule ; un 404 pour une page un explicite, une adresse sous `/l/` ou une Locale que le site ne déclare pas. Le jumeau `.html` que l'hébergeur sert en 200 reste hors de l'entrée : la balise canonique de seo-excellence le traite.
- AC-GLOSSARY-3 : Given BR-PYRAMID-3, 12 et 13, When un lecteur lit `Pyramid`, `Module`, `Site`, `Design system`, `Content source` et `Build chain`, Then la pyramid est l'ensemble des modules qui peuvent servir à plusieurs sites ; un module a son propre manifeste de build, des apps ou d'autres modules en dépendent, et il vit sous `packages/` (CLAUDE.md, vocabulaire des composants) ; un site porte un design system qu'il peut partager, et ce qu'il est seul à utiliser lui appartient, schéma d'URL et lecture du corpus compris ; `Design system` commence par « Chaque site en porte un » ; la content source est une arborescence que le site déclare et lit ; `Build chain` reconstruit des modules, « package » désignant un répertoire d'une app ou d'un module.
- AC-GLOSSARY-4 : Given la site configuration de robusta.build, When un lecteur lit `Site configuration`, Then elle porte le domaine, le nom du site, le logo, la Locale par défaut et les autres, les réglages du blog, le contact et la page copy de chaque Locale, sans titre de site ni mission.
- AC-GLOSSARY-5 : Given le suivi des traductions, When un lecteur lit `Original` et `Stale translation`, Then l'original est la version d'un article dont une autre version est la traduction, et un article qui ne se déclare la traduction d'aucun autre est son propre original ; une stale translation est une traduction dont l'original a changé de titre, d'excerpt ou de corps depuis qu'elle a été déclarée à jour : elle reste publiée, et la build la signale.
- AC-GLOSSARY-6 : Given les décisions du 2026-10-25 et du 2026-10-26, When un lecteur lit `RB Compound`, Then c'est le nom sous lequel robusta.build présente le workflow Compound et l'offre de services de Nicolas aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, en deux versions : open source et gratuite, ou complète, seulement avec un accompagnement payant.
- AC-GLOSSARY-7 : Given les cas limites, When un lecteur relit tout le glossaire, Then aucune entrée ne donne de marqueur à la Locale par défaut, ne compte `l` parmi les discriminants, ne nomme `siteTitle` ni `mission`, ni ne prête le schéma ou le corpus à une base partagée ; l'empreinte, la contrepartie et la paire non suivie, termes de code, n'y entrent pas ; dakar.surf n'ajoute aucune exception ; la story ne crée aucune règle métier ; les entrées que la story ne cite pas restent mot pour mot.

## Boundaries

Aucune API touchée : la story ne modifie que `ubiquitous-language.md`, ni code ni contrat.

## Documentation updates

- change les entrées `Locale`, `Discriminant`, `Landing page`, `Canonical URL`, `Pyramid`, `Site`, `Design system`, `Content source`, `Site configuration` et `Build chain` de `ubiquitous-language.md` — why: état livré par multilingual-site et default-locale-at-root, BR-PYRAMID-3, 12, 13 et 14.
- create les termes `Original`, `Stale translation`, `RB Compound` et `Module` dans `ubiquitous-language.md` — why: suivi des traductions, positionnement de la landing page, BR-PYRAMID-12 et 13.

## Dependencies

- multilingual-site, dont la story décrit l'état : LANDED le 2026-10-31 (`fb4803b`) — levée.
- default-locale-at-root, qui retire le préfixe de la Locale par défaut : SUBMITTED le 2026-11-03 (`2fbc7be`) — levée.
- Débloque : le design de seo-excellence, dont la Dep 3 attend `Canonical URL` et qui déclare hreflang sur `Locale` ; la seconde moitié de rb-compound-positioning ; l'enregistrement par epicman, sous PYRAMID et à son numéro, de la règle « Un site doit publier une stale translation qui se déclare publiée », une fois `Stale translation` au glossaire, donc après la livraison de cette story.
