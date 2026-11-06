# Fix : Pyramid v2

**Dernière mise à jour :** 2026-11-06
**Owner :** pyramid-v2.epic.md
**Infix :** PYRAMID
**Status :** OPEN
**Grain :** BATCH

## FIX-PYRAMID-1 — Règle `ignore` : production comparée à la dernière build de branche (P0)

### Problem

Un merge sur `main` qui apporte du code du site doit lancer la build de production. Le 2026-11-05, la production de `688d6c0` est annulée et www.robusta.build sert toujours la production d'octobre, en `noindex`.

### Context

    e57501b : build de branche epic/robusta-v2 du 2026-11-04 20:43, devient CACHED_COMMIT_REF
       │
       ▼
    main 04e70d6 ─► 688d6c0 : fast-forward de 55 commits, code de 4 stories inclus
       │
       ▼
    ignore : git diff --quiet e57501b 688d6c0 -- <chemins du site>
       │       688d6c0 ne touche que des documents ► code 0
       ▼
    annulées : production 6aec2b720f1b38e1a85eca30, branche 6aec2b6d62e06ebfef1bbdc1

Message Netlify, au stage « checking build content for changes » : « Canceled build due to no content change ». Cause probable, non vérifiée : `CACHED_COMMIT_REF` est le dernier commit construit sur le site, quelle que soit la branche, et non la dernière production. Le diff ne voit que `688d6c0`, les 55 commits arrivés sur `main` lui échappent.

### Intended fix

En production, la décision de sauter la build ne se fonde plus sur la dernière build de branche : un merge sur `main` qui apporte du code du site construit toujours.

### Resolution proposal

- En production, ne jamais sauter (`[ "$CONTEXT" = "production" ] && exit 1`), ou une clé `ignore` propre à `[context.production]` ; coût : 15 crédits par commit dakar ou v1 sur `main`.
- Lire par l'API Netlify le commit de la dernière production : écartée, car il faut un jeton dans l'environnement de build et un appel réseau qui peut échouer.
- Couper les builds de branche pour que `CACHED_COMMIT_REF` reste la production : écartée, car les déploiements de `epic/robusta-v2` disparaîtraient.
- Contrainte : la règle générique de netlify-deploy compare les mêmes refs, et son AC-NETLIFY-4 veut sauter un commit qui ne touche pas le site, production comprise.

- Resolution: lgtm (Nicolas, 2026-11-05) — en production, ne jamais sauter ; les branches gardent le diff.
- Fixed: 2026-11-05 — `netlify.toml` : `[ "$CONTEXT" = production ] && exit 1;` avant le diff. Production → exit 1, branche sur `e57501b..688d6c0` → exit 0 ; 677 tests du site verts.

## FIX-PYRAMID-2 — Octet NUL brut dans l'id de match du HTML prérendu (P3)

### Problem

Le HTML prérendu de robusta.build v2 ne devrait contenir aucun octet nul. L'id de match `__root__` du script de déshydratation inline porte un NUL (0x00) brut au lieu d'un échappement.

### Context

    $ curl -s https://www.robusta.build/articles | grep -a -c $'\x00'
    1
    matches:$R[11]=[$R[12]={i:"__root__\x00",u:…,s:"success",…

    routeur : id de match "__root__" + NUL
       │
       ▼
    sérialiseur seroval : octet écrit brut, non échappé ─► script inline du HTML prérendu
                                                               │
                                                               ▼
    hydratation client : id lu ≠ id écrit ? ◄─ parseur HTML : U+0000 remplacé par U+FFFD

Dans la trace, `\x00` note l'octet brut. Même résultat sur `/fr/articles`, et déjà sur la production précédente de `5a5f23d` : les chores B4 du 2026-11-06 n'en sont pas la cause. `grep` lit la page comme binaire. Le site s'affiche et reste indexé ; non mesuré : mismatch d'hydratation, loader rejoué, rejet par un crawler ou un validateur strict.

### Intended fix

Le HTML prérendu ne contient plus aucun octet nul brut, et la build échoue si un octet nul y réapparaît.

### Resolution proposal

- À instruire d'abord : trouver l'origine du NUL (format de l'id de match de TanStack Router ou Start, ou seroval) et vérifier si une montée des paquets `@tanstack` l'échappe déjà.
- À défaut : une étape après le prérendu, dans `scripts/prerender-pages.mjs` ou `check-seo.mjs`, qui fait échouer la build sur un NUL brut.
- Contrainte : un échappement n'est sûr qu'à l'intérieur d'une chaîne JS ; le vérifier avant de réécrire l'octet.
- Contrainte : mesurer dans le navigateur si un mismatch d'hydratation se produit réellement avant de choisir.

- Resolution: lgtm (Nicolas, 2026-11-06) — enquête d'abord : origine, version récente de @tanstack, mesure de l'hydratation, puis correction proposée.
- Fixed: 2026-11-06 — `@tanstack/router-core` 1.171.35 (react-router 1.170.42, react-start 1.168.61, start-static-server-functions 1.167.40) encode le `/` des ids de match en `#` : 0 NUL sur les 34 pages. `check-seo.mjs` fait échouer la build sur un NUL brut. Mesuré dans Chromium avant et après : aucune divergence d'hydratation. 717 tests du site verts.
