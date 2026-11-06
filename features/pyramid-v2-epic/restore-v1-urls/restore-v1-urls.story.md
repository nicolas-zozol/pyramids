# Story : Ramener les adresses v1 en redirections permanentes

**Dernière mise à jour :** 2026-11-06
**Feature :** restore-v1-urls
**Infix :** RESTOREV1
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que les adresses v1 que la recherche et les liens externes connaissent encore mènent à leur page v2, **afin de** récupérer ce trafic au lieu de le perdre sur une 404.

## Contexte & objectif

tanstack-start-migration a abandonné les adresses v1 le 2026-10-06 : tout `/learn…` répond 404 depuis. Nicolas : « on peut abandonner ces vieilles URL. On verra à la fin si on peut les ramener par un autre format. » La fin de l'epic est là, et le site est indexé sur www.robusta.build depuis le 2026-11-05.

La v1 map (`apps/robusta-build/src/routing/v1-url-map.ts`, R-URLSCHEME-14 et 28) est toujours calculée depuis l'index des articles et régénérée à chaque build dans `v1-url-map.generated.json`. Rien ne la sert. La story la sert, sur l'offre Free de Netlify, sans fonction : la build traduit la map en règles de redirection statiques, dans un fichier `_redirects` qu'elle écrit dans `dist/client` après `vite build`. Netlify lit ce fichier avant `netlify.toml`, qui garde ses trois règles écrites à la main.

Si Nicolas refuse le retour (OQ-RESTOREV1-1), la story devient un nettoyage : la v1 map, son spec, `emit-v1-map.mjs`, le JSON généré, le script `emit:v1-map` et la section « The v1 mapping » du README partent, et les adresses v1 restent en 404. retire-robusta-v1 vient après et n'active rien.

## Ce que la v1 map sert

83 lignes, dans l'ordre de la map, qui est l'ordre de priorité des règles :

- 67 permanentes, en 301 vers leur page v2 : 30 accueils et categories du blog, 14 articles, 14 tags, 9 fichiers markdown bruts
- 11 sans destination. Les cinq situées sous `/learn` deviennent des règles 404 vers la page introuvable, placées avant la règle Gone : les trois pages de roll que v1 n'a jamais générées, et les images v1. La ligne des images se scinde en ses deux formes v1, `/learn/images/:file` et `/learn/:category/s/images/:file`, parce que Netlify n'accepte pas de joker au milieu d'un chemin ; la map passe de 82 à 83 lignes. Les six hors de `/learn` (`/`, `/portfolio`, `/fr/portfolio`, les restes de développement) n'ont pas de règle : elles répondent déjà par leur page v2 ou 404.
- 5 Gone, en 410 avec la page introuvable : quatre fichiers markdown dont le contenu n'existe plus dans le corpus, puis tout autre `/learn/…`, en dernier

Le 410 n'est pas documenté par Netlify pour une règle statique : la story suit la Proposition d'OQ-RESTOREV1-3 du brainstorm, constatée sur un draft deploy, et dit 404 si Netlify sert 404.

## Acceptance Criteria

- AC-RESTOREV1-1 : Given une adresse v1 que la map mène à une page v2, When un visiteur ou un robot la demande sur www.robusta.build, Then il reçoit une redirection permanente vers cette page, en un seul saut, et la page répond 200.
- AC-RESTOREV1-2 : Given une adresse v1 marquée Gone par la map, un fichier markdown retiré ou une adresse `/learn/…` qu'aucune ligne ne réclame, When on la demande, Then elle répond 410 avec la page introuvable (OQ-RESTOREV1-3 du brainstorm) ; Given une adresse v1 sans destination, image v1 et page de roll v1 sous `/learn` comprises, Then elle répond 404 avec la page introuvable, comme aujourd'hui, et non 410.
- AC-RESTOREV1-3 : Given les pages v2 et les redirections `/en…` existantes, When les redirections v1 sont servies, Then aucune adresse v2 ne change de réponse.
- AC-RESTOREV1-4 : Given un article qui change de category ou un nouvel article, When le site est construit, Then les redirections servies suivent la map sans édition à la main ; une redirection dont la destination n'est pas une page construite fait échouer la build.
- AC-RESTOREV1-5 : Given les cas limites, When on les demande, Then un article français que v1 publiait sans marqueur de Locale mène à sa page française ; `/learn/fr/blockchain/`, avec sa barre finale, mène à la même page que sans ; `/learn/tag/DeFi`, avec sa casse v1, a sa destination, et `/learn/tag/defi`, que v1 n'a jamais publié, répond 410 ; un fichier markdown brut v1 mène à la page de son article ; un article v1 dépublié ou dont le titre change laisse la build aboutir, et son adresse v1 comme son fichier markdown brut répondent 410, sans redirection vers un nouveau slug ; une adresse v1 demandée sur `robusta-build.netlify.app` aboutit en 200 à sa page sur www.robusta.build, en deux redirections permanentes.

## Boundaries

```
  Flèche = dépend de, du code client vers l'API qu'il utilise.
  Packages de l'app `@robusta/robusta-build`.

  build ──CLI──→ package `scripts` [modified]
                   │ library
                   ↓
                 package `routing` [modified: lignes images de la v1 map]

  Netlify lit dist/client/_redirects, écrit par `scripts`.
```

### HTTP API of app `@robusta/robusta-build` — modified

```
GET <adresse v1 permanente>[/]        → 301, Location : la page v2 de la map, déjà canonique
GET <fichier markdown v1 Gone>        → 410, 404.html
GET /learn/page/:n, /learn/fr/page/:n,
    /learn/tag/:tag/page/:n,
    /learn/images/:file,
    /learn/:category/s/images/:file   → 404, 404.html
GET /learn/<tout le reste>            → 410, 404.html
GET robusta-build.netlify.app/<v1>    → 301 sur cet hôte, puis 301 vers www
GET <toute adresse v2>, /en…          → inchangé
```

Servi par l'hébergeur seul, depuis `dist/client/_redirects` : aucune fonction, aucune lecture du corpus à la requête (BR-PYRAMID-7). La query string suit le 301. Sous `vite dev`, aucune règle : une adresse v1 répond par la page 404.

### CLI API of package `scripts` — new step of `build`

```
lancé par `yarn build` après `vite build`
  lit      la v1 map, les pages de dist/client
  écrit    dist/client/_redirects, une règle par ligne servie, dans l'ordre de la map
  exit 1   une ligne par défaut : <from>: destination <to> is not a built page
```

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

- change la section « The v1 mapping » in `apps/robusta-build/README.md` — why: elle dit que rien ne sert la map et que toute adresse v1 répond 404, et compte 82 lignes dont 10 sans destination.
- change la commande `build` et les règles de redirection de la section Deployment in `apps/robusta-build/README.md` — why: la build écrit `dist/client/_redirects`, que Netlify lit avant `netlify.toml`.
- change la présentation in `apps/robusta-build/robusta-build.archi.md` — why: elle dit « trois règles de redirection » et « le site ne sert pas les adresses v1 ».
- change la description de `v1UrlMap` dans le package `routing` in `apps/robusta-build/robusta-build.archi.md` — why: la map n'est plus « lue par rien ».
- change le package `scripts`, la commande `build` et la description de `emit:v1-map` in `apps/robusta-build/robusta-build.archi.md` — why: une étape de build écrit les règles depuis la map et échoue sur une destination non construite.
- change la ligne « tout autre GET : adresses v1… » de la HTTP API in `apps/robusta-build/robusta-build.archi.md` — why: les adresses v1 répondent 301, 410 ou 404 selon leur ligne.
- change la ligne Hébergement in `apps/robusta-build/robusta-build.archi.md` — why: Netlify publie aussi les règles v1 de `_redirects`.
