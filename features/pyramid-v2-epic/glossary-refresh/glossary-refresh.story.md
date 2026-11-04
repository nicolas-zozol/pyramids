# Story : le glossaire d'accord avec le site multilingue

**Dernière mise à jour :** 2026-10-31
**Feature :** glossary-refresh
**Infix :** GLOSSARY
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que `ubiquitous-language.md` dise ce que le site fait depuis multilingual-site, **afin que** le design de seo-excellence calcule ses canonical URLs et son hreflang sur des termes justes.

## Contexte & objectif

multilingual-site, livré le 2026-10-31 (`fb4803b`), préfixe chaque page par sa Locale, `en` comprise, retire le discriminant `l`, rapatrie le schéma d'URL et la lecture du corpus dans le site (BR-PYRAMID-12), remplace `siteTitle` et `mission` par une page copy par Locale et suit les traductions. docman a proposé les entrées de glossaire correspondantes sans les écrire : le glossaire décrit encore une Locale par défaut sans marqueur, quatre discriminants, une base partagée qui lit le corpus, et une `Canonical URL` dont toute autre forme redirige.

La story regroupe trois items de l'epic : multilingual-glossary, canonical-url-glossary, en attente depuis le 2026-10-07, et la moitié glossaire de rb-compound-positioning, l'entrée `RB Compound`. Refaire `documentation/geo-questions.md` autour de ce terme reste à rb-compound-positioning.

Le livrable est le seul fichier `ubiquitous-language.md` : aucun code ne change.

## Acceptance Criteria

- AC-GLOSSARY-1 : Given le schéma d'URL du site, When un lecteur lit `Locale`, `Discriminant` et `Landing page`, Then chaque Locale porte son marqueur en premier segment de l'URL, la Locale par défaut comprise (`/en`, `/fr`, `/es`) ; les discriminants sont trois, `c`, `p` et `t`, et appartiennent au schéma du site, plus à une base partagée ; chaque Locale a sa landing page, et `/` n'en est pas une.
- AC-GLOSSARY-2 : Given ce que le site sert, When un lecteur lit `Canonical URL`, Then la forme que produit le schéma, préfixe de Locale compris, reste la seule sous laquelle une page est servie, et l'entrée dit ce que reçoit une autre forme : la redirection permanente de l'hébergeur pour `/`, une barre finale ou une majuscule, un 404 pour une page un explicite, une adresse sans préfixe de Locale ou sous `/l/` (Gap-GLOSSARY-1).
- AC-GLOSSARY-3 : Given BR-PYRAMID-3, 12 et 13, When un lecteur lit `Pyramid`, `Module`, `Site`, `Design system`, `Content source` et `Build chain`, Then la pyramid est l'ensemble des modules qui peuvent servir à plusieurs sites ; un module a son propre manifeste de build, des apps ou d'autres modules en dépendent, et il vit sous `packages/` (CLAUDE.md, vocabulaire des composants) ; un site porte un design system qu'il peut partager, et ce qu'il est seul à utiliser lui appartient, schéma d'URL et lecture du corpus compris ; `Design system` commence par « Chaque site en porte un » ; la content source est une arborescence que le site déclare et lit ; `Build chain` reconstruit des modules, « package » désignant un répertoire d'une app ou d'un module.
- AC-GLOSSARY-4 : Given la site configuration de robusta.build, When un lecteur lit `Site configuration`, Then elle porte le domaine, le nom du site, le logo, la Locale par défaut et les autres, les réglages du blog, le contact et la page copy de chaque Locale, sans titre de site ni mission.
- AC-GLOSSARY-5 : Given le suivi des traductions, When un lecteur lit `Original` et `Stale translation`, Then l'original est la version d'un article dont une autre version est la traduction, et un article qui ne se déclare la traduction d'aucun autre est son propre original ; une stale translation est une traduction dont l'original a changé de titre, d'excerpt ou de corps depuis qu'elle a été déclarée à jour : elle reste publiée, et la build la signale.
- AC-GLOSSARY-6 : Given les décisions du 2026-10-25 et du 2026-10-26, When un lecteur lit `RB Compound`, Then c'est le nom sous lequel robusta.build présente le workflow Compound et l'offre de services de Nicolas aux équipes et responsables techniques qui produisent du logiciel avec des agents IA, en deux versions : open source et gratuite, ou complète, seulement avec un accompagnement payant.
- AC-GLOSSARY-7 : Given les cas limites, When un lecteur relit tout le glossaire, Then aucune entrée ne laisse une Locale par défaut sans marqueur, ne compte `l` parmi les discriminants, ne nomme `siteTitle` ni `mission`, ni ne prête le schéma ou le corpus à une base partagée ; l'empreinte, la contrepartie et la paire non suivie, termes de code, n'y entrent pas ; dakar.surf, resté en v1, n'ajoute aucune exception (Gap-GLOSSARY-2) ; aucune règle métier n'est créée (OQ-GLOSSARY-3) ; les entrées que la story ne cite pas restent mot pour mot.

## Boundaries

Aucune API touchée : la story ne modifie que `ubiquitous-language.md`, ni code ni contrat.

## Open Questions & Gaps

### Gaps

- Gap-GLOSSARY-1 : `Canonical URL` dit que toute autre forme d'une page y redirige en permanent, mais le site en sert la plupart en 404. L'entrée suit-elle le site ?
- Proposition : oui. Une autre forme n'est jamais servie comme une page à part : elle redirige quand l'hébergeur le fait (`/` vers `/en`, barre finale, casse) et répond 404 sinon.
- Rationale : le 404 est décidé depuis le 2026-10-06 (OQ-TANSTACK-8) et vérifié sur deploy par multilingual-site ; tout rediriger rouvrirait des redirections que l'epic a refusées. `/en.html`, servi en 200, relève de la balise canonique de seo-excellence.
- Resolution:lgtm

- Gap-GLOSSARY-2 : réécrites sur robusta.build, `Locale` et `Site configuration` deviennent fausses pour dakar.surf, resté en v1. Le glossaire décrit-il la seule v2 ?
- Proposition : oui. Il décrit la base v2 et ne cite la v1 que là où il le fait déjà, comme pour `Article` ; dakar.surf reste un exemple de site, sans exception ajoutée.
- Rationale : dakar.surf est hors du périmètre v2 et aucune story de l'epic ne le touche ; une exception par entrée alourdirait le glossaire pour rien.
- Resolution:lgtm ; dakar.surf est obsolete et sera migré quand necessaire

### Open Questions

- OQ-GLOSSARY-3 : faut-il enregistrer la règle « Un site doit publier une stale translation qui se déclare publiée » ?
- Proposition : oui, sous PYRAMID, par epicman, une fois `Stale translation` au glossaire ; le numéro est le sien.
- Rationale : les quatre tests passent : l'éditeur en décide, elle tient sur des termes du glossaire, dit ce qui vaut et reste seule sur son thème. Elle fixe une tolérance que le site applique déjà sans qu'aucune règle l'impose : une traduction en retard reste lue plutôt que retirée.
- Resolution: lgtm

## Documentation updates

- change les entrées `Locale`, `Discriminant`, `Landing page`, `Canonical URL`, `Pyramid`, `Site`, `Design system`, `Content source`, `Site configuration` et `Build chain` de `ubiquitous-language.md` — why: état livré par multilingual-site, BR-PYRAMID-3, 12 et 13.
- create les termes `Original`, `Stale translation`, `RB Compound` et `Module` dans `ubiquitous-language.md` — why: suivi des traductions, positionnement de la landing page, BR-PYRAMID-12 et 13.

## Dependencies

- multilingual-site, dont la story décrit l'état : LANDED le 2026-10-31 (`fb4803b`) — levée.
- Débloque : le design de seo-excellence, dont la Dep 3 attend `Canonical URL` et qui déclare hreflang sur `Locale` ; la seconde moitié de rb-compound-positioning ; l'enregistrement de la règle d'OQ-GLOSSARY-3 si elle est acceptée.
