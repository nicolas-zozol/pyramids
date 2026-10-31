# Architecture: corpus-reader

**Last updated:** 2026-10-31
**Kind:** package

## Parent

- [robusta-build](../../../robusta-build.archi.md)

## Overview

Le package `corpus-reader`, dans le package `content` de l'app `@robusta/robusta-build`, est le contrat de lecture d'un corpus de fichiers markdown : un `CorpusSpec` devient l'index d'articles qu'un site prérend, le corps HTML d'un article, les assets que ses articles référencent, publiés, et les notices de traduction. Il ne porte aucune valeur d'un site : la racine du corpus, l'endroit où se lit la Locale, les exclusions et le répertoire des assets sont des champs du `CorpusSpec` que le site déclare dans `src/content/corpus.ts`. Un `ArticleEntry` est structurellement un `AddressableArticle` de `url-scheme`, sans import entre les deux packages. Le package n'importe rien hors de son répertoire, et `src/self-contained-packages.spec.ts` échoue sur un import qui en sort. Il tourne en Node pur, au prérendu et dans les scripts de build ; l'import protection du client l'exclut avec tout `src/content`. Une lecture par racine de corpus et par copie chargée du module, mémoïsée sur la promesse, et un résultat gelé. Les violations sont retournées, jamais levées : le site décide qu'une liste non vide fait échouer la build. Les notices de traduction ne font rien échouer et ne retirent aucun article de l'index.

## Boundaries

### library API of package `corpus-reader` in package `content`

Client code : `content` (`corpus.ts` pour le type `CorpusSpec`, `article-index.ts`), `scripts/copy-article-images.mjs` et `scripts/check-translations.mjs`, sur sa copie compilée sous `.routing-dist`.

```ts
type CorpusSpec;          // root, localeFrom, exclude?, assets?
type AssetSpec, LocaleSource, ArticleBody;
type ArticleEntry;        // path, slug, locale, translationId?, original?, …
type OriginalDeclaration; // locale, fingerprint
type CorpusRead;          // articles, violations, translationNotices,
                          // unpublished; all frozen
type CorpusViolation;     // eight codes, malformed-original included
type TranslationNotice;   // stale-translation, untracked-pair,
                          // missing-original

/** published articles only, newest first then by path */
function readCorpus(corpus: CorpusSpec): Promise<CorpusRead>;

/** remark to HTML, every image reference resolved, raw HTML dropped */
function readArticleBody(
  corpus: CorpusSpec,
  entry: ArticleEntry,
): Promise<ArticleBody>;

/** mirrors the referenced files into assets.publishDir, emptied first */
function copyCorpusAssets(corpus: CorpusSpec): Promise<readonly string[]>;

/** the URL a reference is served at; external references pass through */
function resolveAssetUrl(
  corpus: CorpusSpec,
  entry: ArticleEntry,
  reference: string,
): string;

/** the v1 derivation, frozen: slugify 1.6.6, lower and strict */
function articleSlug(title: string, locale: string): string;

/** one line naming the file a publisher has to open */
function describeViolation(violation: CorpusViolation): string;

/** one line naming the translation, its original and the fingerprint to copy */
function describeTranslationNotice(notice: TranslationNotice): string;
```

- Champs exigés d'un article, sinon violation nommant le fichier : `title`, `date` en `YYYY-MM-DD`, `author`, la Locale, `published: true` booléen et un excerpt, le bloc du corps avant son premier `---`. Le schéma complet est dans la section Articles de `apps/robusta-build/README.md`.
- `published` vaut exactement `true` : absent, l'article est laissé de côté et nommé dans `unpublished` ; toute autre valeur est une violation.
- Un article sans `original` est son propre original. Une déclaration mal formée est la violation `malformed-original`.
- L'empreinte est les 12 premiers caractères hexadécimaux du SHA-256 du titre, de l'excerpt et du corps markdown brut, chaque suite de blancs lue comme une espace. `stale-translation` quand l'empreinte de l'original diffère de celle déclarée, `untracked-pair` quand plus d'une version d'un même `translationId` ne déclare pas d'original, `missing-original` quand l'original déclaré n'est pas publié.
- Une référence d'image se résout contre la place de l'article dans le corpus, jamais contre son URL ; une référence qui ne désigne aucun fichier du corpus est la violation `unresolved-asset`. Un `CorpusSpec` sans `assets` ne juge aucune référence et ne publie aucun fichier.

## Dependencies

- Depends on : `gray-matter` (frontmatter et excerpt), `remark` et `remark-html` (le corps), `unist-util-visit` (les références d'image d'un corps), `slugify` épinglé à 1.6.6 (le slug figé), `node:crypto` (l'empreinte), `node:fs` et `node:path`. Ni React, ni framework. Les versions sont déclarées dans le manifeste de l'app.
- Used by : `content`, et les scripts `copy-article-images.mjs` et `check-translations.mjs`.
- Build : compilé avec le site par Vite, pour le prérendu, et par `compile:seams` sous `.routing-dist` pour les scripts.
