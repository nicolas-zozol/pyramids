# @robusta/robusta-build

The version 2 site of robusta.build, on TanStack Start and Vite 8. Every page is prerendered to HTML at build, then hydrated, and the browser navigates between pages client-side. Netlify serves the build output as files and runs no code on a request. `/`, `/fr` and `/es` are the landing pages of `en`, `fr` and `es`, each published article an article page, and each blog home and category page a roll of its Locale's articles.

The version 1 site lives in `apps/robusta`, whose README documents the v1 route scheme. The v2 scheme is the Routing section below.

## Where the truth of this site lives

`src/seopyramids.config.ts` — domain, site name, logo, default and other Locales, the blog configuration (content root, roll size, author), the contact and the page copy of each Locale. A per-site value is read from there, not hardcoded in a component.

`contact` holds the e-mail address and the LinkedIn profile URL every call to action leads to. `pageCopy` holds one block per Locale, `en`, `fr` and `es`; a missing Locale or text fails the typecheck. A block holds, in plain text and in its Locale, every text a page of that Locale displays, alternative text included: `localeName`, the Locale named in its own language; `head`, the title and description of the 404 page and of the failed-navigation state; `landing`, the head and the sections of the landing page; `listing`, the title, the head models, the pagination labels and the footer column of the listing pages; the header, the footer, the end of an article with its update label and its Related articles title, the breadcrumb label; and `categoryLabels`, the label of each category the Locale's published articles claim. `getPageCopy(locale)` and `getCategoryLabel(locale, category)` are the only read paths, and a category with no label in the page's Locale fails the build, naming the category and the Locale. The site passes every text prop of each design-system section it renders, from `pageCopy` or empty to hide the element (BR-PYRAMID-8).

What articles exist is answered by `src/content/article-index.ts`, at build time and at no other (BR-PYRAMID-7).

## Articles

The site publishes seventeen articles, the eleven migrated from v1 and six French translations, and a new article is a markdown file added the same way.

Where the file goes: anywhere under `content/articles`, at any depth. The tree mirrors v1's folders, but a folder carries no meaning: the category is a frontmatter field, and a file at the root of the corpus is as valid as one three directories down. Only `*.md` files are read.

What the frontmatter must carry, or the build fails naming the file:

- `title` — the article's title, and the source of its slug.
- `date` — `YYYY-MM-DD`. Quote it, or YAML reads it as a timestamp; the reader accepts both and compares the calendar day.
- `author` — the name the page shows. An article declaring none fails the build naming the file and the field.
- `locale` — `en`, `fr` or `es`, the three the site configuration declares.
- `published: true` — the boolean, not the string. An article that does not declare itself published is not served (BR-PYRAMID-10), and the build prints the paths it left out. Anything other than a boolean is a violation.
- An excerpt, which is not a field: it is the block of the body before its first `---` separator. An article without one is missing a required field.

What it may carry:

- `category` — exactly one segment, and categories do not nest (BR-PYRAMID-9). A v1 `categoryPath` of `javascript/typescript` becomes `typescript`. An article claiming none is addressed at `/{locale}/articles/{slug}`; one claiming a category gets `/{locale}/articles/c/{category}/{slug}`, and the category a page in that Locale.
- `updated` — the date of the last update, `YYYY-MM-DD`, read and checked like `date`. The page shows it beside the publication date, and it dates the article in its structured data and in the sitemap.
- `tags` — a list, any number of them. A tag has no page.
- `image` — the cover, a path relative to the article's own file.
- `translationId` — the value the Locale versions of one article share, so a page can link them. It is authored, not derived: lowercase, locale-neutral, a subject name. Two published articles of one Locale may not share one.
- `original` — on a translation only: `locale`, the Locale of its original, and `fingerprint`, quoted, the original's fingerprint when the translation was last declared up to date. The original is the published version of that Locale under the same `translationId`; an article declaring none is its own original. A declaration without a `translationId`, a `locale` or a `fingerprint`, with a fingerprint other than 12 lowercase hexadecimal characters, or naming the article's own Locale, fails the build.
- `slug` — pins the slug instead of deriving it. `featured` and any other key the schema does not name travel in the file and cost nothing; the index reads none of them.

The slug is derived, not written: `articleSlug(title, locale)`, the v1 derivation, frozen. Renaming a published article's title changes its URL, and the site serves no redirect.

A translation is stale when the fingerprint of its original differs from the one it declares, and it stays published. The fingerprint is the first 12 hexadecimal characters of the SHA-256 of the title, the excerpt and the raw markdown body, each run of whitespace read as one space: a change of tags, date, category or cover leaves it unchanged, and so does a reflow. `check:translations` prints one line per notice, then their count, and fails nothing:

- `stale-translation` — names the translation and its original, and gives the fingerprint to declare once the translation is updated.
- `untracked-pair` — two or more versions sharing a `translationId` declare no original; lists those versions with the fingerprint of each.
- `missing-original` — the declared original is not published or has left the corpus; the translation is served without a link to it.

Write the body in markdown only. HTML written in an article renders as its text alone, and nothing reports it: the renderer drops the tag whole, attributes included, so `<b>C</b>` reaches the page as `C` and an `<img>` tag as nothing. Emphasis is `**bold**` and `_italic_`, an image is `![alt](./images/file.png)`. The page's `h1` is the title: a body starts its headings at the second level. Two migrated articles carry three such fragments, inline emphasis that renders as plain text.

Images live beside their article, conventionally in an `images/` directory next to it, and are referenced relatively: `./images/vpn.png` from the body or the cover, `../images/shared.png` for the corpus-root folder. The reference is resolved against the article's own place in the corpus and published under the asset root: `blockchain/images/vpn.png` is served at `/article-images/blockchain/images/vpn.png`, so an article can change category without an image moving. A reference resolving to no file of the corpus is a violation and fails the build; an absolute or external URL passes through untouched.

`public/article-images/` is generated, git-ignored and owned by the `copy:assets` script, which removes it and rewrites it in full before every build and at the start of `yarn dev:robusta`. It publishes only what the published articles reference, 44 files. It is not a watcher: an image added mid-session reaches the site on the next run.

Where a mistake surfaces: `check:translations`, in `build`, and `emit:v1-map`, in `build` and `dev`, read the corpus and fail on a violation, naming the file. `yarn workspace @robusta/robusta-build run test` checks the corpus as it stands: what is published, the Locale split, the categories, the declared originals with no notice, and the byte-for-byte freeze against the v1 tree.

## Routing

The shapes, with `articles` as the content root this site names and `{locale}` one of `fr` and `es`. The default Locale, `en`, carries no prefix (BR-PYRAMID-14): its landing page is `/` and its content `/articles…`.

- `/{locale}` — the landing page of the Locale.
- `/{locale}/articles` — the blog roll, page one.
- `/{locale}/articles/p/{n}` — page n of that roll, n ≥ 2.
- `/{locale}/articles/c/{category}` — a category roll, page one, and `/{locale}/articles/c/{category}/p/{n}` for the rest.
- `/{locale}/articles/c/{category}/{slug}` — an article claiming a category, which most do.
- `/{locale}/articles/{slug}` — an article claiming none.
- `/{locale}/articles/t/{tag}` — reserved, and built by nothing.

No URL but `/` ends with a slash. A Locale other than `en` gets a blog roll only when it publishes an article, and a category has a page only in the Locales whose articles claim it: `/es/articles` is not built, and `theory` has a page under `/fr` alone.

Who owns what: the discriminants `c`, `p` and `t` and the shapes built from them live in `src/routing/url-scheme`, which holds no value of this site. `articles` and the three Locales, `en` first as the default, are written once in `src/routing/scheme.ts` and read from there by `src/seopyramids.config.ts`. The roll size is a constant of 12, not a per-site knob: `ROLL_SIZE`, in the same file. `src/routing/url-scheme` and `src/content/corpus-reader` import nothing outside their own directory, which `src/self-contained-packages.spec.ts` checks.

### The route table

The routes live under `src/routes`, in TanStack Router's file convention, and the generator writes `src/routeTree.gen.ts`, importing each route file by its `.tsx` name. Beside the root route `__root.tsx` and `/404`, the layout route `{-$locale}/route.tsx` and seven route files sit under `{-$locale}`, an optional Locale segment: the landing page `{-$locale}/index.tsx` and six content routes. The layout route resolves the segment with `localeOfSegment`: absent, it is `en`; `fr` or `es`, that Locale; any other value, `en` included, matches no route. The root route's loader reads the Locale of the address with `parseUrl`, the default Locale for an address outside the scheme, the page's counterparts with `getCounterparts`, and the first page of each roll of that Locale with `getLocaleRolls`. `<html lang>`, the header, the footer and the head of every page follow that Locale, at prerender and after every client navigation.

What they render: the two article routes render `src/article/ArticleView` from the payload their loader gets from `getArticlePage`; an article page shows its breadcrumb and its update date, ends in its own Locale, links every other published version of the article, then lists its Related articles, see SEO. The four listing routes render `ListingPage`, from `src/listing`, from the payload their loader gets from `getRollPage`: an `h1`, the blog title or the category label, the roll's articles by `NotesPreview`, newest first and 12 at most, each dated with its year and, on the blog home only, labelled with its category, then a `nav` to the newer and the older page when one exists; a Category roll shows its breadcrumb above the `h1`. Their head comes from `listingHead`: the `listing.head` model of the Locale and the kind of page, filled with the category label and, from page 2, the page number. `{-$locale}/index.tsx` renders `LandingPage`, from `src/landing`: `Hero`, the `FlowDiagram` of the open source version of RB Compound, `id="open-source"`, that of the complete version, `id="complete"`, `PrinciplesList`, the notes section and `CTA`, in that order, inside a `<main>`. The notes section shows the four newest articles of the page's Locale, from `getNotesFeed`, and is absent when that Locale publishes none, as `es` does. `/404` renders `NotFoundPage`, in English whatever the address, its link back leading to `/`.

The root document, `src/routes/__root.tsx`, renders `Header` before and `Footer` after every page, the 404 and the failed-navigation state included. Both come from `src/chrome` and read the page copy of the page's Locale. `Header` is `SiteHeader` with the wordmark to the landing page of that Locale, the contact call to action, and one link per other Locale, named in its own language and marked with its `lang` and `hreflang`: to the same page in that Locale when it exists, to its landing page otherwise, a roll page leading to page one of the same roll. `Footer` is `SiteFooter` with the tagline, the copyright and, when the Locale publishes an article, one link column: the blog home, then each category of the Locale, in alphabetical order of label. `es` gets none, and `404.html` the column of `en`.

The sections that render a link get `SiteLink`, from `src/components`, as their `linkComponent`: an internal link becomes a router `Link`, and an `https:` or `mailto:` URL stays a plain anchor.

`getArticlePage`, `getNotesFeed`, `getCounterparts`, `getRollPage` and `getLocaleRolls`, in `src/page-data`, are server functions marked static, and the only path from a route to the content. They run at prerender only and leave one JSON file per distinct input under `dist/client/__tsr/staticServerFnCache`. A prerendered page carries its own data; a hydrated page navigating client-side fetches the file. The build's import protection fails on a client import of `src/content`, `gray-matter` or `remark`.

A client navigation whose route chunk or data file fails to load ends, through `src/components/NavigationFailure.tsx`, in a full load of the target address; a second failure at the same address in the same tab renders the site's error state, `FailedNavigationPage`.

The prerender walks one list: the landing page of each Locale, `/` first, `/404`, then every URL `src/routing/content-urls.ts` derives, which is `urlSet(urlScheme, await getArticleIndex())`, built with `buildUrl` by `scripts/prerender-pages.mjs`. Link crawling and path discovery are off. Each page is written under `dist/client` as its canonical path plus `.html`, `/fr` as `fr.html` and `/404` as `404.html`, and `/` as `index.html`. A URL outside the list is not built and answers 404.

30 content URLs, derived from the seventeen articles: 2 blog homes, 11 category pages and 17 articles, 14 under `/articles` for the 8 English articles and 16 under `/fr/articles` for the 9 French ones. The build writes 34 HTML files, the 3 landing pages, those 30 and `404.html`, and 69 data files: one per article, one notes feed per landing page, one counterparts file per landing page and content URL, one roll page per blog home and category page, and one roll list per Locale for the footer. Three route files build no page: `{-$locale}/articles/$slug.tsx`, since every article claims a category, and the two roll-page routes, since no Locale reaches a roll size of 12.

Two build-time checks keep the route files and the configuration in line. `scripts/prerender-pages.mjs` fails the build, naming the content root and the missing files, when the layout route or one of the seven route files under `{-$locale}` does not exist. `scripts/check-route-table.mjs` runs after `vite build` and fails when a page was written around a render that threw, when the written `.html` files, `404.html` excepted and `index.html` read as `/`, differ from the landing pages plus the derivation, or when the data files differ from the count above.

### `/{locale}/articles/t/{tag}` is reserved and not built

No tag route ships, so `/articles/t/rxjs` answers 404 like a slug that does not exist. `validateArticles` keeps the address free: no slug and no category may take the value `c`, `p` or `t`, and no category may nest. A corpus breaking either rule fails the build naming the offending article.

### One URL per page

The site builds the canonical form of each page and nothing else. Beside the host rule of Deployment, `netlify.toml` holds two redirect rules, 301 without `force`, from a page marked with the default Locale to the same page unmarked: `/en` to `/`, `/en/{rest}` to `/{rest}`. No file exists under `en`, so they always apply, and a target the site does not build then answers 404. The other forms get what Netlify answers for a static deploy:

- An explicit page one, `/articles/p/1` or `/articles/c/{category}/p/1`, an address under `/l/{locale}`, and a Locale the site does not declare: not built, 404 with the not-found page.
- A trailing slash, `/fr/` included: 301 to the canonical form. `/` is a file and gets none.
- An uppercase letter: 301 to the lowercase form when that file exists, 404 otherwise. A file under `/article-images` answers at its exact case, `M87.jpg` included.
- The canonical path plus `.html`: 200, the same document.
- Any other path: `404.html`, with status 404. The not-found document loads no client script, so it stays on screen.

### The v1 mapping

`src/routing/v1-url-map.ts` maps the v1 address space onto this one as a rule per class of v1 URL applied to the article index, not as a hand-kept table: when an article changes category, the rows that mention it change without an edit. Its output, `src/routing/v1-url-map.generated.json`, is committed and reviewable: 82 rows over the real corpus, 67 permanent, 5 gone, 10 none.

The v1 addresses follow v1's locales, frozen in `V1_LOCALES`: `en` unmarked, `fr` under `/learn/fr`. Only the destinations read this site's scheme, each a page in the language of the v1 page: `/learn/fr/blockchain` leads to `/fr/articles/c/blockchain`, `/learn` to `/articles`, and a tag row to an English page. A French article of v1 contributes two permanent rows, its v1 path with no locale segment and the `/learn/fr` form, both leading to its address under `/fr`. An article v1 did not publish, absent from `V1_ARTICLE_SLUGS`, has no row.

Nothing serves the mapping and nothing in the build reads it. A v1 address, any `/learn` path included, answers 404 with the not-found page. Whether the old addresses come back is the restore-v1-urls item of `ROADMAP.md`.

## SEO

`src/seo` holds what a page declares of itself to a search engine: `pageHead`, the only producer of the SEO tags of a head, the indexability rule, the structured data, the sitemap and `robots.txt`. It imports no React and no value of `src/seopyramids.config.ts`, and the build scripts import it from `src`. The landing, listing and article routes get their head from `landingHead`, `listingHead` and `articleHead`, which call `pageHead`. The root route sets the default head: the `head` title and description of the page copy and `robots` `noindex, nofollow`.

An indexable page declares, in this order:

- `<title>` and `description`: `landing.head` on a landing page, the `listing.head` models on a listing page, and on an article its title alone and its excerpt, whole, in plain text.
- `robots`, from `robotsOf(indexable)`.
- The share preview: `og:type`, `article` on an article page and `website` elsewhere, `og:title`, `og:description`, `og:url`, `og:locale` (`en_US`, `fr_FR`, `es_ES`), and `og:image` only on an article with a cover. No default image, no `keywords`, no `twitter:*`.
- `<link rel="canonical">`: `SITE_ORIGIN`, `https://www.robusta.build`, written in `src/routing/scheme.ts` and read by the Site configuration's `domain`, followed by the page's canonical path. The `.html` twin serves the same document, so it declares the canonical URL of its page.
- One `<link rel="alternate" hreflang>` per published version, the page included, in the order `en`, `fr`, `es`, then an `x-default` to the `en` version. A page published in one Locale declares none, a page with no `en` version no `x-default`. The versions of page n of a roll are page n of the same roll in the other Locales, built and indexable only, never their first page.
- Its structured data, one `application/ld+json` script per block: `BlogPosting` and `BreadcrumbList` on an article page, `dateModified` only with `updated` and `image` only with a cover; `BreadcrumbList` on a Category roll; `Organization` on each landing page, with the site name, its canonical URL, the contact e-mail and the LinkedIn profile as `sameAs`. No page declares a `LocalBusiness`, an address or an area. Each field is one the page displays.

No declared URL names `/en…`, a trailing slash other than `/`, or a `.html` file.

`isIndexable` decides: a landing page and an article page are indexable, a roll page when it lists an article, a tag page never. A page that is not indexable declares its title and description only, and `404.html` declares nothing over the root head: neither gets a canonical, an hreflang, a preview, structured data or a sitemap entry.

`INDEXING_OPEN`, in `src/seo/indexing.ts`, is the only switch: true when the build carries `NETLIFY=true` and `CONTEXT=production`, which Netlify sets on its production build alone. The `define` of `vite.config.ts` writes both values into every bundle as literals, so the prerendered HTML and the head recomputed in the browser carry the same `robots`. On that build an indexable page declares `index, follow`; on any other, every document carries `noindex, nofollow`. An indexable page is the one that carries a canonical link.

The breadcrumb is `Breadcrumb`, from `src/components`, a `nav` named by `breadcrumb.navLabel`. On an article page, above the cover: the blog home, its Category when it claims one, then the article as text. On a Category roll, above the `h1`: the blog home, then the Category, as text on page 1 and linked to page 1 from page 2. The blog home has none. The trail shown and the trail declared are the same value.

An article page ends on its Related articles, `findRelated(article, 3)`: published articles of its Locale sharing its Category or a tag, the same Category first, then the most shared tags, then the newest. They are an `h2` titled `article.relatedTitle` and a list of title links, after the end-of-page `nav`, and there is no block when none qualifies.

### Sitemap and robots.txt

`scripts/emit-site-files.mjs` runs after `vite build`, which empties `dist/client`, and writes `dist/client/sitemap.xml` and `dist/client/robots.txt`. The sitemap lists the indexable pages, landing pages first, then the content URLs: 33 entries, 3 landing pages, 13 listing pages and 17 articles. An article's `lastmod` is its `updated`, its `date` otherwise; a landing or roll page takes the most recent of the articles it lists, and a page listing none, `/es`, has no `lastmod`. `robots.txt` allows everything and names the sitemap.

### The SEO audit

`scripts/check-seo.mjs` reads the `.html` files of `dist/client` and the sitemap, and fails the build with one line `{url}: {defect}` per defect:

- a title or a description missing, or shared with another page of the same `<html lang>`
- a canonical URL absent from the sitemap, or a sitemap entry no built page declares canonical
- an internal `href` that leads to no built page and no file of `dist/client`
- an `alternate` that leads to a page not built, or whose page does not link back
- a page without exactly one `<h1>`
- a `robots` other than `robotsOf` applied to the presence of a canonical link
- a raw NUL byte, which the HTML parser reads as U+FFFD

It prints `seo: 34 pages checked, 33 indexable and all in the sitemap; indexing closed`, `indexing open` on the production build.

## Styling

The design system is `@robusta/pyramids-design-system`, the site's only workspace dependency. Per BR-PYRAMID-6 every token the site renders comes from it: the site adds names, never values.

The root route, `src/routes/__root.tsx`, links four stylesheets, and their order is a contract:

1. `src/styles/fonts.css` — the three faces, see Fonts.
2. `src/styles/globals.css` — the Tailwind 4 entry, run by `@tailwindcss/vite`. Tailwind emits its preflight inside `@layer base`.
3. `@robusta/pyramids-design-system/colors_and_type.css` — tokens and element rules. These are unlayered, so they win over preflight.
4. `@robusta/pyramids-design-system/sketch.css` — the `.sk-*` primitives, which read the tokens the previous file defines.

`globals.css` also holds the token bridge: shadcn's expected names (`--background`, `--primary`, `--destructive` and siblings) aliased onto design-system tokens, `--destructive` onto `--brand-error`. Every entry is an alias; none is a literal.

The site does not use DaisyUI, and does not consume `pyramids-layouts`, `pyramids-links` or `pyramids-ctas`, which render DaisyUI classes.

## Fonts

`src/styles/fonts.css` self-hosts the three brand faces from Fontsource, latin subset, `font-display: swap`. Vite bundles the woff2 files into the build, so a page issues no request to a font CDN. IBM Plex Sans (300 to 700) and Caveat (600 and 700) come from the variable files of `@fontsource-variable/*`, declared once per weight over the same file; IBM Plex Mono (400 to 600) from the static cuts of `@fontsource/ibm-plex-mono`. Each face carries the family name `colors_and_type.css` falls back to, and the site sets no `--font-*` property.

Do not link `@robusta/pyramids-design-system/fonts.css` here. It loads the same faces from Google Fonts, and loading both fetches every face twice.

## Assets

Brand assets are resolved through the design system's exports map and hashed by Vite under `/assets`; nothing is copied into `public/`. `src/design-system/assets.ts` exports the published URLs: `wordmarkSrc`, the wordmark, and `heroMascotSrc` and `ctaMascotSrc`, the mascots of `Hero` and `CTA`. Pass `wordmarkSrc` to every `BrandLogo`, `SiteHeader` and `SiteFooter`: their default path does not exist on this site.

## Commands

Two root scripts, run from the repository root:

```bash
yarn build:robusta     # build:deps, then the site's build
yarn dev:robusta       # the site's dev
```

The site's own scripts:

- `build` — `check:types`, `check:source`, `check:translations`, `emit:v1-map`, `copy:assets`, `vite build` with the prerender, then `scripts/check-route-table.mjs`, `scripts/emit-site-files.mjs` and `scripts/check-seo.mjs`.
- `dev` — `emit:v1-map`, `copy:assets`, then `vite dev`. On the dev server the page-data functions run on each call and read the corpus. `netlify.toml` does not apply there: `/en` and `/en/…` answer the not-found page instead of a 301.
- `check:types` — `tsc -p tsconfig.json --noEmit`.
- `check:source` — fails on a `'use client'` or `'use server'` directive, or on a local import, `vi.mock` paths included, that does not name its `.ts` or `.tsx` file exactly, anywhere under `src`, the generated route tree included. Each offence names the file, the line and, when the file exists, the expected specifier. An asset or a `.mjs` keeps its extension.
- `check:translations` — prints the translation notices, see Articles.
- `emit:v1-map` — writes `src/routing/v1-url-map.generated.json`.
- `copy:assets` — rewrites `public/article-images/`.
- `test` — `vitest run`.
- `lint` — eslint over `src`. No build runs it.

The `.mjs` scripts of `scripts/` import the `.ts` files of `src` directly, through Node's type stripping, which needs Node 22.18 or later. A file they reach uses only syntax Node can strip: no `enum`, no parameter property, and `import type` for a type.

This site is part of the green set: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta-v1`, `yarn build:robusta` must all complete from a clean checkout (BR-PYRAMID-5).

## Deployment

Netlify project `robusta-build`, in a team on the Free plan, linked to the repository `nicolas-zozol/pyramids`. It serves robusta.build from the production branch `main`, `www.robusta.build` as primary domain and the apex answering 301 to it.

`netlify.toml`, beside this README, holds what the repository can say:

- the build command, `yarn build:robusta` at the repository root, preceded by `node --version`, `yarn --version` and `yarn config get yarnPath` so the log shows what the build ran with
- the publish directory, `apps/robusta-build/dist/client`: the prerendered output and nothing else. No function, no header rule, no plugin; `@netlify/vite-plugin-tanstack-start` is not a dependency.
- the redirect rules: first, forced, `https://robusta-build.netlify.app/*` to `https://www.robusta.build/:splat` in 301; then the two rules from `/en…` to the unprefixed page, see One URL per page. `www`, branch deploys and deploy previews answer under their own host and are not redirected.
- the ignore rule: production always builds. Elsewhere, `scripts/netlify-ignore.mjs` skips the build when no commit of `CACHED_COMMIT_REF..COMMIT_REF` touches the site, a module it depends on, directly or not, through the four dependency fields of the manifests at `COMMIT_REF`, or a root install file: `package.json`, `yarn.lock`, `.yarnrc.yml`, `.yarn/releases`, `.nvmrc`. A push touching only dakar, v1, the base modules or `features/` is skipped. An absent, unknown or equal ref, a cached ref off the first-parent history of `COMMIT_REF`, and any error of the rule build. The deploy log shows one line, `skip: <reason>` or `build: <reason>`.
- `YARN_FLAGS = "--immutable"`. Netlify's default, `--ignore-optional`, is an unknown option to yarn 4.

The dashboard holds the rest:

- package directory `apps/robusta-build`, base directory empty. Netlify installs and builds at the repository root, reads `.nvmrc` there, and finds `netlify.toml` in the package directory.
- build command and publish directory empty: `netlify.toml` carries both
- production branch `main`, branch deploys for `epic/robusta-v2`, the epic's working branch
- Pretty URLs on: the answers listed under One URL per page depend on it, and with it off a trailing slash would answer 200.
- no environment variable, in particular no `NODE_VERSION`, no `COREPACK_*` and no `YARN_VERSION`

Only the production build opens its indexable pages, see SEO: a branch deploy, a deploy preview, a local build and a CLI build stay `noindex`. A draft deploy is `npx netlify-cli deploy`, without `--prod`: the CLI builds locally with `CONTEXT=production` but without `NETLIFY`, so the draft stays closed. Do not use `netlify deploy --remote`: it builds on Netlify, with an undocumented `CONTEXT`.

A production deploy costs 15 of the team's 300 monthly credits, a branch deploy none, and a spent balance pauses every site of the team: work goes to the epic branch, and `main` receives merges.

Merge `main` into the epic branch with `git merge --no-ff main`. A fast-forward onto `main` followed, in the same push, by a commit outside the watched paths is skipped, and the branch deploy keeps serving its previous build: retry the deploy from the dashboard, which always builds.

DNS stays at Hover, which is the domain's name server: `@` A `75.2.60.5`, Netlify's load balancer, and `www` CNAME `robusta-build.netlify.app`. Every other record of the zone belongs to another service: mail, `race`, `code`. Netlify holds no DNS zone for the domain, and must not: with one, it renews a wildcard certificate it can only validate through its own name servers, and renewal fails. Without one, its Let's Encrypt certificate covers `robusta.build` and `www.robusta.build`.

### Rolling back production

A previous production deploy is published again without a rebuild and without credits:

1. In Deploys, open the last good production deploy and choose Publish deploy.
2. Choose Lock to stop auto publishing. While locked, a merge on `main` still builds, but its deploy is not published, and costs no credit unless published.
3. To roll forward, publish the fixed deploy, then choose Unlock to start auto publishing.

On the Free plan a deploy is deleted after 30 days, except the published one and the latest successful one of each branch. Past that window, revert on `main`, which costs a production deploy. A deploy built from a commit older than go-live, `6182d17`, serves every page `noindex`: publishing it closes the whole site to indexing.

### Yarn on a build agent

Yarn runs from `.yarn/releases/yarn-4.17.1.cjs`, committed and named by `yarnPath` in `.yarnrc.yml`; any yarn on the PATH delegates to it. A `.cjs` file is CommonJS whatever any manifest says, so it loads wherever it sits.

A corepack cache inside the repository breaks the install within seconds:

```
file:///vercel/path0/.vercel/cache/corepack/home/v1/yarn/4.17.1/yarn.js:4
Error: Dynamic require of "util" is not supported
    at ModuleJob.run (node:internal/modules/esm/module_job)
Error: Command "yarn install" exited with 1
```

Node takes a `.js` file's module type from the nearest `package.json` above it. Inside the repository that is the root one, which declares `"type": "module"`, so Node loads yarn's CommonJS bundle as an ES module and its `require` shim throws. Vercel's corepack caches there; a local corepack and Netlify's, which the build image enables itself, cache outside the repository, and yarn then hands over to `yarnPath`.
