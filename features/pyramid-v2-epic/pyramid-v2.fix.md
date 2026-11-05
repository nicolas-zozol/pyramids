# Fix : Pyramid v2

**Dernière mise à jour :** 2026-11-05
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
