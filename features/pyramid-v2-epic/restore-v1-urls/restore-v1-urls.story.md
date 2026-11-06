# Story : Ramener les adresses v1 en redirections permanentes

**Dernière mise à jour :** 2026-11-06
**Feature :** restore-v1-urls
**Infix :** RESTOREV1
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que les adresses v1 que la recherche et les liens externes connaissent encore mènent à leur page v2, **afin de** récupérer ce trafic au lieu de le perdre sur une 404.

## Contexte & objectif

tanstack-start-migration a abandonné les adresses v1 le 2026-10-06 : tout `/learn…` répond 404 depuis. Nicolas : « on peut abandonner ces vieilles URL. On verra à la fin si on peut les ramener par un autre format. » La fin de l'epic est là, et le site est indexé sur www.robusta.build depuis le 2026-11-05.

La v1 map (`apps/robusta-build/src/routing/v1-url-map.ts`, R-URLSCHEME-14 et 28) est toujours calculée depuis l'index des articles et régénérée à chaque build dans `v1-url-map.generated.json`. Rien ne la sert. La story la sert, sur l'offre Free de Netlify, sans fonction : des règles de redirection statiques, générées par la build depuis la map, à côté des trois règles déjà présentes dans `netlify.toml`.

Si Nicolas refuse le retour (OQ-RESTOREV1-1), la story devient un nettoyage : la v1 map, son spec, `emit-v1-map.mjs`, le JSON généré, le script `emit:v1-map` et la section « The v1 mapping » du README partent, et les adresses v1 restent en 404. retire-robusta-v1 vient après et n'active rien.

## Ce que la v1 map sert

82 adresses v1 :

- 67 permanentes, en 301 vers leur page v2 : 30 accueils et categories du blog, 14 articles, 14 tags, 9 fichiers markdown bruts
- 5 Gone, en 410 : quatre fichiers markdown dont le contenu n'existe plus dans le corpus, et tout autre `/learn/…` qu'aucune ligne ne réclame
- 10 sans destination, en 404 comme aujourd'hui : `/portfolio`, `/fr/portfolio`, `/`, les images v1, les pages de roll que v1 n'a jamais générées, les restes de développement

## Acceptance Criteria

- AC-RESTOREV1-1 : Given une adresse v1 que la map mène à une page v2, When un visiteur ou un robot la demande sur www.robusta.build, Then il reçoit une redirection permanente vers cette page, en un seul saut, et la page répond 200.
- AC-RESTOREV1-2 : Given une adresse v1 marquée Gone par la map, When on la demande, Then elle répond 410 ; Given une adresse v1 sans destination, Then elle répond 404 avec la page introuvable, comme aujourd'hui.
- AC-RESTOREV1-3 : Given les pages v2 et les redirections `/en…` existantes, When les redirections v1 sont servies, Then aucune adresse v2 ne change de réponse.
- AC-RESTOREV1-4 : Given un article qui change de category ou un nouvel article, When le site est construit, Then les redirections servies suivent la map sans édition à la main ; une redirection dont la destination n'est pas une page construite fait échouer la build.
- AC-RESTOREV1-5 : Given les cas limites, When on les demande, Then un article français que v1 publiait sans marqueur de Locale mène à sa page française ; `/learn/fr/blockchain/`, avec sa barre finale, mène à la même page que sans ; `/learn/tag/DeFi`, avec sa casse v1, a sa destination ; un fichier markdown brut v1 mène à la page de son article.

## Boundaries

### HTTP API of app `@robusta/robusta-build` — modified

```
GET <adresse v1 permanente>   → 301, Location : la page v2 de la map, déjà canonique
GET <adresse v1 Gone>         → 410
GET <adresse v1 sans destination> → 404, 404.html (inchangé)
GET <toute adresse v2>, /en…  → inchangé
```

Servi par l'hébergeur seul : aucune fonction, aucune lecture du corpus à la requête (BR-PYRAMID-7).

## Open Questions & Gaps

- OQ-RESTOREV1-1 : Les adresses v1 reviennent-elles en redirections permanentes vers leur page v2, ou restent-elles en 404 avec la v1 map supprimée ?
- Proposition : elles reviennent, les 67 en 301 et les 5 Gone en 410, par des règles de redirection Netlify que la build génère depuis la map. Avant de répondre, Nicolas lit la Search Console, filtre `/learn` : rapport Pages, ligne « Introuvable (404) » ; Performances sur 16 mois ; Liens, pages les plus liées. Aucune impression et aucun lien externe : elles restent en 404 et la map part.
- Rationale : la map est écrite et testée, et 82 règles statiques ne coûtent rien sur l'offre Free. Un seul lien externe vers un article v1 suffit à les payer. Google oublie une 404 en quelques semaines : attendre réduit ce qu'il reste à récupérer. Des pages HTML à redirection meta sont écartées : Google les lit moins bien qu'un 301.
- Resolution:

- OQ-RESTOREV1-2 : Le retour des adresses v1 fait-il règle pour tout le site, une adresse d'article publiée menant toujours à l'article même après un changement de titre, ou reste-t-il un rattrapage de v1 ?
- Proposition : un rattrapage de v1. La règle validée le 2026-07-30 (« un site doit continuer à servir un article à chaque adresse sous laquelle il l'a publié ») reste non enregistrée, et un titre renommé change toujours l'URL sans redirection.
- Rationale : aucun article n'a changé de titre depuis go-live. Enregistrer la règle obligerait chaque renommage à produire sa redirection, un mécanisme que personne n'a demandé.
- Resolution:

## Documentation updates

- change la section « The v1 mapping » in `apps/robusta-build/README.md` — why: elle dit que rien ne sert la map et que toute adresse v1 répond 404.
- change la ligne « tout autre GET : adresses v1… » de la HTTP API et la description de `emit:v1-map` in `apps/robusta-build/robusta-build.archi.md` — why: les adresses v1 répondent 301 ou 410, et la build lit la map.
