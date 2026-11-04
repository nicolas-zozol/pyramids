# Architecture: url-scheme

**Last updated:** 2026-11-04
**Kind:** package

## Parent

- [robusta-build](../../../robusta-build.archi.md)

## Overview

Le package `url-scheme`, dans le package `routing` de l'app `@robusta/robusta-build`, est le schéma d'URL v2 écrit en fonctions pures sur des chaînes : les discriminants `c` pour une Category, `p` pour une page de roll et `t`, réservé à une page de tag, les formes construites à partir d'eux, et la dérivation de l'ensemble des URL qu'un site prérend. Il ne porte aucune valeur d'un site : le content root, les Locales et la roll size arrivent par le `UrlScheme` que l'appelant fournit, et le site déclare le sien dans `src/routing/scheme.ts`. La Locale par défaut n'a aucun marqueur : sa landing page est `/` et son contenu `/{contentRoot}…` ; une autre Locale est le premier segment, `/{locale}` et `/{locale}/{contentRoot}…`. Une Locale n'a pas de discriminant. La canonicité est le point fixe de `buildUrl` et `parseUrl` : un chemin est canonique quand construire son parse redonne le chemin, et la valeur construite est sa forme canonique. `buildUrl` n'émet que cette forme ; `parseUrl` lit aussi une barre finale, une majuscule, une page un explicite et la Locale par défaut marquée, `/{defaultLocale}…`. Le package n'importe rien hors de son répertoire, ni React, ni `node:*`, et `src/self-contained-packages.spec.ts` échoue sur un import qui en sort : le client et les scripts en Node pur exécutent le même code. Les formes d'URL du site sont listées dans la section Routing de `apps/robusta-build/README.md`.

## Boundaries

### library API of package `url-scheme` in package `routing`

Client code : les fichiers de `routing`, `page-data`, `chrome`, `landing`, `listing`, `components` et `routes`, le loader de la route racine et la route de layout `{-$locale}` compris, et `scripts/prerender-pages.mjs` et `scripts/check-route-table.mjs`, sur sa copie compilée sous `.routing-dist`.

```ts
type UrlScheme;          // contentRoot, defaultLocale, otherLocales, rollSize
type PageUrl;            // landing, blog-home, category, tag, article
type RollUrl;            // the PageUrl of a roll page: blog-home or category
type AddressableArticle; // slug, locale, one category at most
type SchemeViolation;    // reserved-segment, duplicate-slug, nested-category,
                         // unknown-locale, non-canonical-segment

/** the canonical form only, the default Locale unmarked; throws on a roll
 *  page below 1 */
function buildUrl(scheme: UrlScheme, page: PageUrl): string;

/** unprefixed: a page of the default Locale; `/{other}…`: a page of that
 *  Locale; `/{default}…`: the same page as its unprefixed form; else undefined */
function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined;

/** the Locale an optional first route segment designates; undefined when it
 *  marks the default Locale or names no Locale; strict on case */
function localeOfSegment(
  scheme: UrlScheme,
  segment: string | undefined,
): string | undefined;

/** one landing per known Locale, the default one first */
function landingPages(scheme: UrlScheme): PageUrl[];

/** per Locale: the blog roll, each claimed Category's roll, the articles;
 *  never a tag page, never a landing */
function urlSet(
  scheme: UrlScheme,
  articles: readonly AddressableArticle[],
): PageUrl[];

/** never throws: the caller decides that a violation fails the build */
function validateArticles(
  scheme: UrlScheme,
  articles: readonly AddressableArticle[],
): SchemeViolation[];

/** true for c, p and t, which no slug and no Category may take */
function isReservedSegment(segment: string): boolean;
```

- Les constantes `CATEGORY_DISCRIMINANT`, `ROLL_PAGE_DISCRIMINANT`, `TAG_DISCRIMINANT` et `RESERVED_SEGMENTS` sont exportées avec ces fonctions.
- `urlSet` donne toujours un accueil de blog à la Locale par défaut ; une autre Locale en reçoit un quand elle porte un article. Les pages de roll se calculent depuis `rollSize`, et seul `urlSet` compte des pages.
- Un slug ou une Category est fait de mots ASCII minuscules joints par un tiret ; toute autre forme donne `non-canonical-segment`.

## Dependencies

- Depends on : rien.
- Used by : `routing` (`scheme.ts` pour le type `UrlScheme`, `content-urls.ts`, `counterparts.ts`, `v1-url-map.ts`), `page-data`, `chrome`, `landing`, `listing` (`listing-head.ts` pour le type `RollUrl`), `components`, `routes`, et les scripts `prerender-pages.mjs` et `check-route-table.mjs`.
- Build : compilé avec le site par Vite, et par `compile:seams` sous `.routing-dist` pour les scripts.
