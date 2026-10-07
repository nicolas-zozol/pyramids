# Architecture: robusta-build

**Last updated:** 2026-10-07
**Kind:** app

## Parent

- [root](../../root.archi.md)

## Overview

`@robusta/robusta-build` est le site version 2 de robusta.build, sur TanStack Start et Vite 8, publié par Netlify. `vite build` prérend dans `dist/client` la page d'accueil, la page 404 et chaque URL de contenu que le corpus dérive, et Netlify publie ce dossier tel quel : aucune fonction, aucune règle de redirection, aucun code exécuté sur une requête servie. Une page prérendue s'hydrate puis navigue côté client, et ses données arrivent en fichiers que deux server functions statiques écrivent au prérendu : la Content source n'est lue qu'au build (BR-PYRAMID-7). Les onze articles migrés s'affichent en pages article ; les pages de liste et la landing de Locale rendent un placeholder, `/` une page de démonstration que robusta-landing-page remplace. Chaque document porte `noindex`. Le site ne sert pas les adresses v1 : leur correspondance est écrite, et rien ne la sert. Il ne porte aucun web service.

## Apps, modules, packages

- package `routes` — `src/routes/**`, `src/router.tsx` et l'arbre généré `src/routeTree.gen.ts`. La route racine rend le document : `<html lang>` d'après la Locale de la route, `noindex`, les quatre feuilles de style dans l'ordre que fixe `src/routes/__root.tsx`, et aucun script sur la page 404. Les quatre routes article et `/` chargent leurs données par `page-data` ; les huit routes de liste et la landing de Locale rendent `RoutePlaceholder` depuis leurs params. `getRouter()` pose `NotFoundPage` et `NavigationFailure` par défaut.
- package `page-data` — `getArticlePage` et `getNotesFeed`, deux server functions dont le dernier middleware est `staticFunctionMiddleware`, seul chemin d'une route vers `content`. Exécutées au prérendu seulement, elles laissent un fichier par entrée sous `dist/client/__tsr/staticServerFnCache`. Chaque texte qui dépend d'Intl, la date écrite et le nom de la langue, est calculé au build.
- package `article` — `ArticleView` rend un `ArticlePage` sans rien lire, chaque URL arrivant calculée ; `ArticleProse` porte l'unique `dangerouslySetInnerHTML` du site, sous son CSS Module.
- package `landing` — `NotesSection`, le `NotesPreview` du design system nourri des posts qu'il reçoit, chaque texte affiché fourni par le site (BR-PYRAMID-8).
- package `components` — `SiteLink`, seul endroit où une URL de `buildUrl` devient un lien du router ; `NotFoundPage` ; `NavigationFailure`, qui recharge une fois l'adresse d'une navigation client échouée, puis affiche l'état d'erreur ; `RoutePlaceholder`.
- package `content` — la déclaration du corpus, `corpus.ts` : racine `content/articles`, Locale lue dans le frontmatter, Asset root `public/article-images` servi sous `/article-images`. Ses accès : `getArticleIndex`, seul endroit où une violation du corpus devient fatale, `getArticleBody`, `getAssetUrl`, `findArticle`, `findTranslation`. L'import protection du build l'interdit côté client.
- package `routing` — `urlScheme` et `ROLL_SIZE` dans `scheme.ts`, seul endroit où `articles` est écrit ; `contentUrls`, la dérivation unique des URL de contenu ; `v1UrlMap`, la correspondance v1, écrite dans `v1-url-map.generated.json` et lue par rien.
- package `design-system` — `wordmarkSrc`, l'URL sous laquelle Vite publie le wordmark du design system.
- package `styles` — `fonts.css`, les trois polices auto-hébergées depuis Fontsource, et `globals.css`, l'entrée Tailwind 4 et le pont de tokens : les noms qu'attend shadcn, `--destructive` sur `--brand-error` compris, tous des alias de tokens du design system (BR-PYRAMID-6).
- package `scripts` — les étapes Node du build : `check-source.mjs` sur le source de `src`, puis, sur `routing` et `content` compilés sous `.routing-dist`, `prerender-pages.mjs`, la liste de prérendu que lit `vite.config.ts`, `check-route-table.mjs`, `emit-v1-map.mjs` et `copy-article-images.mjs`.
- `src/seopyramids.config.ts` — la Site configuration ; les quatre valeurs de sa section de contenu viennent de `routing`.

## Diagram

```
  Arrow = depends on. Packages of app `@robusta/robusta-build`. No loop.

                            `routes`
          ┌─────────────┬───────┴─────┬───────────────┐
          ↓             ↓             ↓               ↓
      `article`     `landing`   `components`     `page-data`
          │                           ↑            │      │
          └───────────────────────────┘            ↓      │
                                               `routing`  │
                                                   │      │
                                                   ↓      ↓
                                                  `content`

  Omitted: `routes` and `landing` → `routing`; `article` → `page-data`,
  a type only; `routes` → `design-system`, `styles` and the site config.
  `scripts`, outside src/, runs `routing` and `content` compiled.
```

## Boundaries

```
  Arrow = from client code to the API it uses.

    browsers, crawlers          root scripts, Netlify build
            │                                │
            │ HTTP                           │ CLI
            ↓                                ↓
  ┌─────────────── app `@robusta/robusta-build` ───────────────┐
  │ HTTP: the files of dist/client, no code run on a request   │
  │ CLI:  build · dev · test · lint                            │
  └────────────────────────────────────────────────────────────┘
```

### HTTP API of app `@robusta/robusta-build`

Client code : navigateurs et crawlers. Netlify sert les fichiers de `apps/robusta-build/dist/client` et n'exécute rien.

- `GET /` et chaque URL de `urlSet` — 200, le `<path>.html` prérendu (`index.html` pour `/`), `noindex`, `<html lang>` de la Locale de la page
- `GET /__tsr/staticServerFnCache/{sha1}.json` — 200, les données d'une page article ou du flux de notes, qu'une page hydratée récupère en navigation côté client
- `GET /assets/{fichier haché}` — 200, scripts, feuilles de style, polices, wordmark
- `GET /article-images/{path}` — 200, le fichier ; le chemin est sensible à la casse
- `GET` une URL de page avec un slash final — 301 de l'hébergeur vers la forme canonique
- `GET` une URL portant une majuscule — 301 de l'hébergeur vers sa forme en minuscules quand ce fichier existe, 404 sinon
- `GET` un chemin canonique suivi de `.html` — 200, le même document
- tout autre `GET`, adresses v1, page un explicite et Locale par défaut marquée comprises — 404, `404.html`, qui ne charge aucun script client

### CLI API of app `@robusta/robusta-build`

Client code : `yarn build:robusta` et `yarn dev:robusta` à la racine, et le build Netlify par `netlify.toml`.

- `build` — `check:source`, `compile:seams`, `emit:v1-map`, `copy:assets`, `vite build` avec le prérendu, puis `scripts/check-route-table.mjs`. Exit 1 sur une directive `'use client'` ou `'use server'`, un import local sans suffixe `.js`, une violation du corpus ou du scheme, des fichiers de route qui ne suivent pas la Content root, une violation d'import protection, une page prérendue hors 2xx, une différence entre les pages écrites et la dérivation, ou un nombre de fichiers de données autre que le nombre d'articles plus un.
- `dev` — `compile:seams`, `emit:v1-map`, `copy:assets`, puis `vite dev` ; les deux server functions s'y exécutent à chaque appel et lisent le corpus.
- `test` — `vitest run`, sur les specs de `src` et de `scripts`.
- `lint` — eslint sur `src`, qu'aucun build n'exécute.

## Dependencies

- Depends on : les modules `@robusta/pyramids-routing`, `@robusta/pyramids-content` et `@robusta/pyramids-design-system`, en `workspace:*` et lus dans leur `dist/` ; TanStack Start, soit `@tanstack/react-start`, `@tanstack/react-router` et `@tanstack/start-static-server-functions` en versions exactes, montées ensemble ; React 19 ; Vite 8, Tailwind 4 par `@tailwindcss/vite`, vitest 5 ; Fontsource pour IBM Plex Sans, IBM Plex Mono et Caveat ; Node 22.12 ou plus.
- Vite : la copie 8 du site est sous `apps/robusta-build/node_modules`, la racine hisse Vite 6 pour les autres workspaces, et `packageExtensions` dans `.yarnrc.yml` lie `@tanstack/react-start-rsc` à la copie du site.
- Hébergement : le projet Netlify `robusta-build`, qui publie `dist/client` sans fonction ; sa configuration est dans `netlify.toml` et dans la section Deployment du README.
- Hors dépendances : `next`, `@netlify/vite-plugin-tanstack-start`, `pyramids-layouts`, `pyramids-links` et `pyramids-ctas`, qui rendent des classes DaisyUI, `@robusta/scribe-intel` (BR-PYRAMID-2), `@tailwindcss/typography` (BR-PYRAMID-6).
- Tests : `src/content/corpus-freeze.spec.ts` lit `apps/robusta/content/blog`, seul fichier du site qui atteint une autre app.
- Used by : rien, c'est une app déployée.
