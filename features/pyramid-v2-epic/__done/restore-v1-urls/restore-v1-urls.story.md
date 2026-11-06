# Story : Ramener les adresses v1 en redirections permanentes

**Dernière mise à jour :** 2026-11-06
**Feature :** restore-v1-urls
**Infix :** RESTOREV1
**Status :** DONE (2026-11-06, commit 624f3cc sur main)

## Story

**En tant qu'**éditeur de robusta.build, **je veux** que les adresses v1 que la recherche et les liens externes connaissent encore mènent à leur page v2, **afin de** récupérer ce trafic au lieu de le perdre sur une 404.

## Contexte & objectif

tanstack-start-migration avait abandonné les adresses v1 le 2026-10-06 : tout `/learn…` répondait 404. La build traduit désormais la v1 map en règles Netlify statiques, écrites dans `dist/client/_redirects` après `vite build`, sur l'offre Free, sans fonction.

## Livré

### Requirements

- R-RESTOREV1-01 : `scripts/emit-redirects.mjs` calcule `v1UrlMap(urlScheme, await getArticleIndex())` et écrit `dist/client/_redirects` ; le script `build` de `package.json` le lance après `emit-site-files.mjs` et avant `check-seo.mjs`.
- R-RESTOREV1-02 : une règle par ligne servie, dans l'ordre de la map : toutes les lignes `permanent` et `gone`, et les lignes `none` situées sous `/learn` ; la règle de `/learn/:path*` est la dernière du fichier.
- R-RESTOREV1-03 : `permanent` donne un 301 vers `to`, `gone` un 410 vers `/404.html`, `none` sous `/learn` un 404 vers `/404.html` ; aucune règle forcée.
- R-RESTOREV1-04 : `from` est recopié dans sa casse ; un `/:name*` final devient `/*`, les autres placeholders restent.
- R-RESTOREV1-05 : `netlify.toml` garde ses trois règles ; son commentaire d'en-tête nomme `_redirects`, que la build écrit et que Netlify lit avant lui. `dev` ne change pas.
- R-RESTOREV1-21 : une destination `permanent` qui n'est pas une page construite de `dist/client` fait sortir le script en 1, une ligne par ligne fautive, sans écrire `_redirects` (AC-RESTOREV1-4).
- R-RESTOREV1-22 : une source qu'aucune forme Netlify n'exprime, et l'absence de `404.html`, sont des défauts du même format.
- R-RESTOREV1-23 : sans défaut, le script écrit sur stdout sa ligne de compte : 77 règles, 67 permanentes, 5 Gone, 5 not found sur le corpus réel.
- R-RESTOREV1-41 : `imageRows()` rend deux lignes, `/learn/images/:file` et `/learn/:category/s/images/:file`, les deux formes des dossiers d'images de v1 ; `V1_INVENTORY` et les comptes de `v1-url-map.spec.ts` passent à 83 lignes, 67/5/11 ; `v1-url-map.generated.json` est régénéré.
- R-RESTOREV1-42 : la `note` de la ligne `/learn/:path*` dit qu'elle est servie par la dernière règle de `_redirects` ; l'en-tête de `emit-v1-map.mjs` ne dit plus que rien ne sert la map.
- R-RESTOREV1-43 : `v1UrlMap`, `V1MappingRow` et `V1Destination` gardent leur forme ; aucune redirection n'est écrite pour un article v2 renommé.
- R-RESTOREV1-61 : avant le merge, un draft deploy est éprouvé par une passe manuelle de `curl -I` sur une adresse de chaque classe des edge cases : statut, `Location`, puis 200 sur la destination.
- R-RESTOREV1-62 : après le merge, le double saut depuis `robusta-build.netlify.app` est constaté en production, à `storyman done`.

### Acceptance Criteria

- AC-RESTOREV1-1 : Given une adresse v1 que la map mène à une page v2, When un visiteur ou un robot la demande sur www.robusta.build, Then il reçoit une redirection permanente vers cette page, en un seul saut, et la page répond 200.
- AC-RESTOREV1-2 : Given une adresse v1 marquée Gone par la map, un fichier markdown retiré ou une adresse `/learn/…` qu'aucune ligne ne réclame, When on la demande, Then elle répond 410 avec la page introuvable ; Given une adresse v1 sans destination, image v1 et page de roll v1 sous `/learn` comprises, Then elle répond 404 avec la page introuvable, et non 410.
- AC-RESTOREV1-3 : Given les pages v2 et les redirections `/en…` existantes, When les redirections v1 sont servies, Then aucune adresse v2 ne change de réponse.
- AC-RESTOREV1-4 : Given un article qui change de category ou un nouvel article, When le site est construit, Then les redirections servies suivent la map sans édition à la main ; une redirection dont la destination n'est pas une page construite fait échouer la build.
- AC-RESTOREV1-5 : Given les cas limites, When on les demande, Then un article français que v1 publiait sans marqueur de Locale mène à sa page française ; `/learn/fr/blockchain/`, avec sa barre finale, mène à la même page que sans ; `/learn/tag/DeFi` a sa destination, `/learn/tag/defi` répond comme une adresse Gone ; un fichier markdown brut v1 mène à la page de son article ; un article v1 dépublié ou renommé laisse la build aboutir, et ses adresses v1 répondent comme une adresse Gone ; une adresse v1 demandée sur `robusta-build.netlify.app` aboutit en 200 à sa page sur www.robusta.build, en deux redirections permanentes.

## Boundaries

```
  Flèche = dépend de, du code client vers l'API qu'il utilise.
  Packages de l'app `@robusta/robusta-build`.

  build ──CLI──→ package `scripts` [modified: emit-redirects.mjs]
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

### CLI API of package `scripts` — new step of `build`: `emit-redirects.mjs`

```
lancé par `yarn build`, après emit-site-files.mjs, avant check-seo.mjs
  lit      la v1 map, les pages de dist/client
  écrit    dist/client/_redirects, une règle par ligne servie, dans l'ordre de la map
  stdout   redirects: <n> rules (<p> permanent, <g> gone, <x> not found) → dist/client/_redirects
  exit 1   <from>: destination <to> is not a built page
           <from>: no Netlify form for this source
           404.html: not built, the gone and not-found rules have no page
```

## Décisions

- 2026-11-06 — Les adresses v1 reviennent, 67 en 301 et 5 Gone en 410, par des règles statiques générées depuis la map (OQ-RESTOREV1-1, Nicolas). Pourquoi : la map est écrite et testée, et des règles statiques ne coûtent rien sur l'offre Free.
- 2026-11-06 — Rattrapage de v1, pas une règle du site : aucune BR, un article v2 renommé change d'URL sans redirection (OQ-RESTOREV1-2). Pourquoi : personne n'a demandé de redirection à chaque renommage.
- 2026-11-06 — La ligne image de la map se scinde en `/learn/images/:file` et `/learn/:category/s/images/:file` : 82 → 83 lignes. Pourquoi : Netlify n'accepte pas de joker au milieu d'un chemin.
- 2026-11-06 — Le 410 est servi par Netlify Free, constaté sur le draft deploy `6aedc75fdb5c4d20e5c56dd6` (OQ-RESTOREV1-3) : le repli en 404 n'a pas servi. Pourquoi : Netlify ne documente pas le 410 pour une règle statique.
- 2026-11-06 — R-RESTOREV1-62 constaté en production, sur le deploy Netlify de 624f3cc : `https://robusta-build.netlify.app/learn/blockchain/page/2` fait deux redirections et aboutit en 200 sur `https://www.robusta.build/articles/c/blockchain`. Même passe : `/learn/blockchain/page/2`, `/learn/fr/blockchain`, `/learn/blockchain/s/ledger-versus-metamask.md`, `/learn/tag/DeFi` et `/en` en 301 vers leur page, `/learn/javascript/s/es6-7.md` en 410, `/learn/page/2` en 404, `/articles` en 200.

## Documentation updates

- changed la section « The v1 mapping » in `apps/robusta-build/README.md` : 83 lignes, 67/5/11, et les règles servies par `emit-redirects.mjs`
- changed la ligne `build` de la section « Commands » in `apps/robusta-build/README.md`
- changed le publish directory et les règles de redirection de la section « Deployment » in `apps/robusta-build/README.md`
- changed le dernier point de « One URL per page » in `apps/robusta-build/README.md`
- changed la présentation in `apps/robusta-build/robusta-build.archi.md`
- changed la description de `v1UrlMap` dans le package `routing` in `apps/robusta-build/robusta-build.archi.md`
- changed le package `scripts`, les commandes `build` et `dev` in `apps/robusta-build/robusta-build.archi.md`
- changed la HTTP API in `apps/robusta-build/robusta-build.archi.md` : une ligne pour les adresses v1
- changed la ligne Hébergement in `apps/robusta-build/robusta-build.archi.md`
- changed la ligne robusta-build, le schéma de build et le green set in `root.archi.md` : les règles v1 de `_redirects`
