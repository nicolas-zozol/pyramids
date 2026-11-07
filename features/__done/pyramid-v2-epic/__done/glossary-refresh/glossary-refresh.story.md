# Story : le glossaire d'accord avec le site multilingue

**Dernière mise à jour :** 2026-11-04
**Feature :** glossary-refresh
**Infix :** GLOSSARY
**Status :** DONE (2026-11-05, commit 3ca46f9 sur main)

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que `ubiquitous-language.md` dise ce que le site fait depuis multilingual-site et default-locale-at-root, **afin que** le design de seo-excellence calcule ses canonical URLs et son hreflang sur des termes justes.

## Contexte & objectif

Le glossaire décrivait encore quatre discriminants, une base partagée qui lit le corpus, un titre de site, une mission et une `Canonical URL` dont toute autre forme redirige. La story regroupe trois items de l'epic, multilingual-glossary, canonical-url-glossary et l'entrée `RB Compound` de rb-compound-positioning : douze entrées réécrites, quatre créées, aucun code changé.

## Livré

### Requirements

- R-GLOSSARY-01: `Pyramid` est l'ensemble des modules qui peuvent servir à plusieurs sites ; ce n'est pas un site (BR-PYRAMID-12).
- R-GLOSSARY-02: `Site` est un domaine déployé, robusta.build ou dakar.surf ; il porte un design system qu'il peut partager (BR-PYRAMID-3), et ce qu'il est seul à utiliser lui appartient, schéma d'URL et lecture du corpus compris (BR-PYRAMID-12), sauf son design system, qui reste un module même quand il est seul à l'employer (BR-PYRAMID-13).
- R-GLOSSARY-03: `Site configuration` porte le domaine, le nom du site, le logo, la Locale par défaut et les autres, les réglages du blog, le contact et la page copy de chaque Locale ; elle vit dans `src/seopyramids.config.ts`, dans le site ; ni titre de site ni mission.
- R-GLOSSARY-04: `Design system` commence par « Chaque site en porte un » (BR-PYRAMID-3), garde l'identité visuelle qu'il décrit aujourd'hui, et dit qu'il est un module que plusieurs sites peuvent partager.
- R-GLOSSARY-05: `Landing page` est la page d'accueil d'une Locale, faite de sections et distincte de toute page de contenu ; chaque Locale a la sienne, même sans article publié ; `/` est celle de la Locale par défaut, `en` sur robusta.build, et chaque autre Locale a la sienne à son marqueur, `/fr`, `/es`.
- R-GLOSSARY-06: `RB Compound` est le nom sous lequel robusta.build présente le workflow Compound et l'offre de services de Nicolas aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, en deux versions : open source et gratuite, ou complète, seulement avec un accompagnement payant. L'entrée ne dit pas la version open source disponible et ne lie aucun dépôt ; `Compound` seul n'a pas d'entrée.
- R-GLOSSARY-21: `Locale` : la Locale par défaut ne porte aucun marqueur dans l'URL (BR-PYRAMID-14), chaque autre Locale porte le sien en premier segment, `/fr`, `/es`.
- R-GLOSSARY-22: `Content source` est une arborescence de fichiers markdown que le site déclare et lit ; la phrase de BR-PYRAMID-7 (lue à la build, une fois par processus, jamais pendant une requête) reste.
- R-GLOSSARY-23: `Discriminant` en compte trois, `c`, `p` et `t`, mots réservés du schéma d'URL du site ; `t` réserve l'adresse d'une page de tag sans la construire ; la raison du prérendu et la phrase v1 restent. Ni `l`, ni base partagée.
- R-GLOSSARY-24: `Canonical URL` est la forme que produit le schéma, la seule que le site construit pour une page : sans préfixe pour une page de la Locale par défaut, et `/` seule finit par une barre. L'entrée dit ce que reçoit chaque autre forme, sans nommer Netlify ni son réglage : redirection permanente de l'hébergeur pour `/en`, `/en/…` et une barre finale, `/fr/` compris ; pour une majuscule, redirection permanente quand la forme minuscule existe, 404 sinon ; 404 pour une page un explicite, une adresse sous `/l/` ou une Locale que le site ne déclare pas. Une redirection ne promet pas de page : sa cible peut répondre 404 ; l'entrée énonce cette règle sans exemple, `/en/articles/c/theory` reste dans AC-GLOSSARY-2 et les cas limites, puisqu'un slug du corpus rendrait la définition fausse au prochain article publié. Le jumeau `.html` n'y figure pas. La dernière phrase, sur la canonicité, reste.
- R-GLOSSARY-25: `Original` est la version publiée d'un article dont une autre version est la traduction ; un article qui ne se déclare la traduction d'aucun autre est son propre original, y compris quand deux versions partagent un translation identifier sans original déclaré ; une traduction dont l'original n'est pas publié reste servie, sans lien vers lui.
- R-GLOSSARY-26: `Stale translation` est une traduction publiée dont l'original a changé de titre, d'excerpt ou de corps depuis qu'elle a été déclarée à jour ; elle reste publiée et la build la signale. Un changement de category, de tags, de date, de couverture ou de blancs seuls n'en fait pas une, une traduction non publiée non plus (BR-PYRAMID-10).
- R-GLOSSARY-41: `Workspace` est l'ensemble du code et de la documentation du projet (Gap-GLOSSARY-4) ; plus de package yarn, de bibliothèque partagée ni de service.
- R-GLOSSARY-42: `Module` a son propre manifeste de build, des apps ou d'autres modules en dépendent, et il vit sous `packages/` ; l'entrée renvoie à `CLAUDE.md`, vocabulaire des composants, où app, module et package sont définis.
- R-GLOSSARY-43: `Build chain` est la reconstruction ordonnée des modules, qui doit aboutir avant la build de tout site ; « package » y désigne un répertoire d'une app ou d'un module ; un site ne lit d'un module que ce que son manifeste exporte, construit ou non (Gap-GLOSSARY-5).
- R-GLOSSARY-44: `Green set` est l'ensemble nommé des apps et des modules qui doivent se construire depuis un clean checkout : la build chain plus chaque site que le dépôt prétend livrer ; aucun service (Gap-GLOSSARY-4).
- R-GLOSSARY-61: aucune entrée ne donne de marqueur à la Locale par défaut, ne compte `l` parmi les discriminants, ne nomme `siteTitle`, un titre de site ni `mission`, ni ne prête le schéma d'URL ou la lecture du corpus à une base partagée.
- R-GLOSSARY-62: l'empreinte, la contrepartie et la paire non suivie, termes de code, n'entrent pas au glossaire ; dakar.surf n'ajoute aucune exception à une entrée ; aucune BR n'est créée.

### Acceptance Criteria

- AC-GLOSSARY-1 : Given le schéma d'URL du site, When un lecteur lit `Locale`, `Discriminant` et `Landing page`, Then la Locale par défaut ne porte aucun marqueur dans l'URL et chaque autre Locale porte le sien en premier segment (`/fr`, `/es`) ; les discriminants sont trois, `c`, `p` et `t`, et appartiennent au schéma du site, plus à une base partagée ; chaque Locale a sa landing page, même sans article publié, `/` étant celle de la Locale par défaut, `en` sur robusta.build.
- AC-GLOSSARY-2 : Given ce que le site sert, When un lecteur lit `Canonical URL`, Then la forme que produit le schéma est la seule que le site construit pour une page, sans préfixe pour une page de la Locale par défaut, et `/` est la seule qui finit par une barre ; l'entrée dit ce que reçoit une autre forme : la redirection permanente de l'hébergeur pour `/en`, `/en/…` et une barre finale, `/fr/` compris ; pour une majuscule, la redirection permanente quand la forme minuscule existe, un 404 sinon ; un 404 pour une page un explicite, une adresse sous `/l/` ou une Locale que le site ne déclare pas. Une redirection ne promet pas de page : `/en/articles/c/theory`, category que seule `fr` revendique, mène à un 404. Le jumeau `.html` que l'hébergeur sert en 200 reste hors de l'entrée : la balise canonique de seo-excellence le traite.
- AC-GLOSSARY-3 : Given BR-PYRAMID-3, 12 et 13, When un lecteur lit `Pyramid`, `Module`, `Site`, `Design system`, `Content source`, `Build chain`, `Workspace` et `Green set`, Then la pyramid est l'ensemble des modules qui peuvent servir à plusieurs sites ; un module a son propre manifeste de build, des apps ou d'autres modules en dépendent, et il vit sous `packages/` (CLAUDE.md, vocabulaire des composants) ; un site porte un design system qu'il peut partager, et ce qu'il est seul à utiliser lui appartient, schéma d'URL et lecture du corpus compris, sauf le design system, qui reste un module même quand un seul site l'emploie (BR-PYRAMID-13) ; `Design system` commence par « Chaque site en porte un » ; la content source est une arborescence que le site déclare et lit ; `Build chain` reconstruit des modules, « package » désignant un répertoire d'une app ou d'un module, et un site ne lit d'un module que ce que son manifeste exporte, construit ou non (Gap-GLOSSARY-5) ; `Workspace` est l'ensemble du code et de la documentation du projet, et `Green set` l'ensemble nommé des apps et des modules qui doivent se construire depuis un clean checkout, sans service (Gap-GLOSSARY-4).
- AC-GLOSSARY-4 : Given la site configuration de robusta.build, When un lecteur lit `Site configuration`, Then elle porte le domaine, le nom du site, le logo, la Locale par défaut et les autres, les réglages du blog, le contact et la page copy de chaque Locale, sans titre de site ni mission.
- AC-GLOSSARY-5 : Given le suivi des traductions, When un lecteur lit `Original` et `Stale translation`, Then l'original est la version publiée d'un article dont une autre version est la traduction, et un article qui ne se déclare la traduction d'aucun autre est son propre original, y compris quand deux versions partagent un translation identifier sans original déclaré ; une traduction dont l'original n'est pas publié reste servie, sans lien vers lui ; une stale translation est une traduction publiée dont l'original a changé de titre, d'excerpt ou de corps depuis qu'elle a été déclarée à jour : elle reste publiée, et la build la signale ; un changement de category, de tags, de date, de couverture ou de blancs seuls n'en fait pas une, une traduction non publiée non plus.
- AC-GLOSSARY-6 : Given les décisions du 2026-10-25 et du 2026-10-26, When un lecteur lit `RB Compound`, Then c'est le nom sous lequel robusta.build présente le workflow Compound et l'offre de services de Nicolas aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, en deux versions : open source et gratuite, ou complète, seulement avec un accompagnement payant ; l'entrée ne dit pas la version open source disponible et ne lie aucun dépôt.
- AC-GLOSSARY-7 : Given les cas limites, When un lecteur relit tout le glossaire, Then aucune entrée ne donne de marqueur à la Locale par défaut, ne compte `l` parmi les discriminants, ne nomme `siteTitle` ni `mission`, ni ne prête le schéma ou le corpus à une base partagée ; l'empreinte, la contrepartie et la paire non suivie, termes de code, n'y entrent pas ; dakar.surf n'ajoute aucune exception ; la story ne crée aucune règle métier ; les entrées que la story ne cite pas restent mot pour mot.

## Boundaries

Aucune API touchée : la story ne modifie que `ubiquitous-language.md`, ni code ni contrat.

## Décisions

- 2026-10-31 — la story absorbe multilingual-glossary, canonical-url-glossary et l'entrée `RB Compound` de rb-compound-positioning. Pourquoi : découpage de l'epic en batches, décision de Nicolas.
- 2026-11-04 — `Workspace` et `Green set` réécrits pour ne plus contredire `Module` (Gap-GLOSSARY-4), `Build chain` admet qu'un site lise les CSS et assets d'un module tels qu'écrits (Gap-GLOSSARY-5). Pourquoi : Propositions retenues par Nicolas.
- 2026-11-04 — `Canonical URL` énonce la règle sans l'exemple `/en/articles/c/theory`. Pourquoi : un slug du corpus rendrait la définition fausse au prochain article publié.

## Documentation updates

- changed les entrées `Locale`, `Discriminant`, `Landing page`, `Canonical URL`, `Pyramid`, `Site`, `Design system`, `Content source`, `Site configuration` et `Build chain` in `ubiquitous-language.md`
- changed les entrées `Workspace` et `Green set` in `ubiquitous-language.md`
- created les termes `Original`, `Stale translation`, `RB Compound` et `Module` in `ubiquitous-language.md`

## Dependencies

- multilingual-site (`fb4803b`) et default-locale-at-root (`2fbc7be`) — levées.
- Débloque : le design de seo-excellence (`Canonical URL`, `Locale`) ; la seconde moitié de rb-compound-positioning ; l'enregistrement par epicman, sous PYRAMID, de la règle « Un site doit publier une stale translation qui se déclare publiée », `Stale translation` étant désormais au glossaire.
