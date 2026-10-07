# @robusta/robusta-build

The version 2 site of robusta.build, on TanStack Start and Vite 8. Every page is prerendered to HTML at build, then hydrated, and the browser navigates between pages client-side. Netlify serves the build output as files and runs no code on a request. The eleven migrated articles render as article pages; every other content route renders a placeholder.

The version 1 site lives in `apps/robusta`, whose README documents the v1 route scheme. The v2 scheme is the Routing section below.

## Where the truth of this site lives

`src/seopyramids.config.ts` — domain, site name and title, mission, logo, default and other locales, and the blog configuration (content root, roll size, mandatory keywords, author). A per-site value is read from there, not hardcoded in a component.

What articles exist is answered by `src/content/article-index.ts`, at build time and at no other (BR-PYRAMID-7).

Every document carries `robots` `noindex, nofollow`, set in the head of the root route, `src/routes/__root.tsx`. Lifting it belongs to the go-live item of `ROADMAP.md`.

## Articles

The site's articles are the eleven pieces migrated from v1, and a new one is a markdown file added the same way.

Where the file goes: anywhere under `content/articles`, at any depth. The tree mirrors v1's folders, but a folder carries no meaning: the category is a frontmatter field, and a file at the root of the corpus is as valid as one three directories down. Only `*.md` files are read.

What the frontmatter must carry, or the build fails naming the file:

- `title` — the article's title, and the source of its slug.
- `date` — `YYYY-MM-DD`. Quote it, or YAML reads it as a timestamp; the reader accepts both and compares the calendar day.
- `author` — the name the page shows. An article declaring none fails the build naming the file and the field.
- `locale` — `en` or `fr`, the two the site configuration declares. `en` is the default locale and carries no marker in the URL.
- `published: true` — the boolean, not the string. An article that does not declare itself published is not served (BR-PYRAMID-10), and the build prints the paths it left out. Anything other than a boolean is a violation.
- An excerpt, which is not a field: it is the block of the body before its first `---` separator. An article without one is missing a required field.

What it may carry:

- `category` — exactly one segment, and categories do not nest (BR-PYRAMID-9). A v1 `categoryPath` of `javascript/typescript` becomes `typescript`. An article claiming none is addressed at `/articles/{slug}`; one claiming a category gets `/articles/c/{category}/{slug}` and a category page.
- `tags` — a list, any number of them. Tags are metadata: `/articles/t/{tag}` is reserved and served by nothing.
- `image` — the cover, a path relative to the article's own file.
- `translationId` — the value the locale versions of one article share, so a page can link them. It is authored, not derived: lowercase, locale-neutral, a subject name. Two published articles of one locale may not share one.
- `slug` — pins the slug instead of deriving it. `featured` and any other key the schema does not name travel in the file and cost nothing; the index reads none of them.

The slug is derived, not written: `articleSlug(title, locale)`, the v1 derivation, frozen. Renaming a published article's title changes its URL, and the site serves no redirect.

Write the body in markdown only. HTML written in an article renders as its text alone, and nothing reports it: the renderer drops the tag whole, attributes included, so `<b>C</b>` reaches the page as `C` and an `<img>` tag as nothing. Emphasis is `**bold**` and `_italic_`, an image is `![alt](./images/file.png)`. Two migrated articles carry three such fragments, inline emphasis that renders as plain text.

Images live beside their article, conventionally in an `images/` directory next to it, and are referenced relatively: `./images/vpn.png` from the body or the cover, `../images/shared.png` for the corpus-root folder. The reference is resolved against the article's own place in the corpus and published under the asset root: `blockchain/images/vpn.png` is served at `/article-images/blockchain/images/vpn.png`, so an article can change category without an image moving. A reference resolving to no file of the corpus is a violation and fails the build; an absolute or external URL passes through untouched.

`public/article-images/` is generated, git-ignored and owned by the `copy:assets` script, which removes it and rewrites it in full before every build and at the start of `yarn dev:robusta`. It publishes only what the published articles reference, 44 files. It is not a watcher: an image added mid-session reaches the site on the next run.

Where a mistake surfaces: `emit:v1-map`, a step of both `build` and `dev`, reads the corpus and fails on the first violation with the file named. `yarn workspace @robusta/robusta-build run test` checks the corpus as it stands: what is published, the locale split, the categories, and the byte-for-byte freeze against the v1 tree.

## Routing

The v2 URL scheme. This site owns its routing reference the way `apps/robusta/README.md` owns v1's, and inherits nothing from it.

The shapes, with `articles` as the content root this site names:

- `/` — the landing page.
- `/articles` — the blog roll, page one.
- `/articles/p/{n}` — page n of that roll, n ≥ 2.
- `/articles/c/{category}` — a category roll, page one, and `/articles/c/{category}/p/{n}` for the rest.
- `/articles/c/{category}/{slug}` — an article claiming a category, which most do.
- `/articles/{slug}` — an article claiming none.
- `/articles/t/{tag}` — reserved, and built by nothing.
- `/l/{locale}` in front of any of the above, for a locale that is not the default one. The default locale carries no marker.

Who owns what: the discriminants `l`, `c`, `p` and `t` and the shapes built from them belong to `@robusta/pyramids-routing`; `articles` belongs to this site, written once in `src/routing/scheme.ts` and read from there by `blogConfig.contentRoot`. The roll size is a constant of 12, not a per-site knob: `ROLL_SIZE`, in the same file.

### The route table

The routes live under `src/routes`, in TanStack Router's file convention, and the generator writes `src/routeTree.gen.ts` with `.js`-suffixed imports. Beside the root route `__root.tsx`: `/`, `/404`, six content routes for the default locale, the same six under `l/$locale`, and the locale landing `l/$locale/index.tsx`. `<html lang>` follows the `locale` param of the matched route, the default locale when it has none, at prerender and after every client navigation.

What they render: the four article routes render `src/article/ArticleView` from the payload their loader gets from `getArticlePage`. The eight listing routes and the locale landing render `RoutePlaceholder` from their params until the stories that own their copy arrive. `/` renders the placeholder home robusta-landing-page replaces, with the notes section `getNotesFeed` feeds. `/404` renders `NotFoundPage`.

`getArticlePage` and `getNotesFeed`, in `src/page-data`, are server functions marked static, and the only path from a route to the content. They run at prerender only and leave one JSON file per distinct input under `dist/client/__tsr/staticServerFnCache`. A prerendered page carries its own data; a hydrated page navigating client-side fetches the file. The build's import protection fails on a client import of `src/content`, `@robusta/pyramids-content`, `gray-matter` or `remark`.

A client navigation whose route chunk or data file fails to load ends in a full load of the target address; a second failure at the same address in the same tab renders the site's error state, `src/components/NavigationFailure.tsx`.

The prerender walks one list: `/`, `/404`, then every URL `src/routing/content-urls.ts` derives, which is `urlSet(urlScheme, await getArticleIndex())`, built with `buildUrl` by `scripts/prerender-pages.mjs`. Link crawling and path discovery are off. Each page is written under `dist/client` as its canonical path plus `.html`, `/` as `index.html` and `/404` as `404.html`. A URL outside the list is not built and answers 404.

21 content URLs, derived from the eleven migrated articles: 2 blog homes, 8 category pages and 11 articles. The build writes 23 HTML files, those 21 plus `index.html` and `404.html`, and 12 data files, one per article and one for the notes feed. Seven route files build no page: `/articles/{slug}` and its mirror, since every article claims a category; the four roll-page routes, since 8 English articles and 3 French stay under a roll size of 12; and the locale landing.

Two build-time checks keep the route files and the configuration in line. `scripts/prerender-pages.mjs` fails the build, naming the content root and the missing files, when a route file the configured content root implies does not exist. `scripts/check-route-table.mjs` runs after `vite build`, compares the written `.html` files, `index.html` and `404.html` excepted, with the derivation, expects one data file per article plus one, and fails on any difference.

### `/articles/t/{tag}` is reserved and not built

No tag route ships, so `/articles/t/rxjs` answers 404 like a slug that does not exist. `validateArticles` keeps the address free: no slug and no category may take the value `l`, `c`, `p` or `t`, and no category may nest. A corpus breaking either rule fails the build naming the offending article.

### One URL per page

The site builds the canonical form of each page and nothing else, and serves no redirect. The other forms get what Netlify answers for a static deploy:

- An explicit page one, `/articles/p/1` or `/articles/c/{category}/p/1`, and a marked default locale, `/l/en/…`, are not built: 404, with the not-found page.
- A trailing slash: 301 to the canonical form.
- An uppercase letter: 301 to the lowercase form when that file exists, 404 otherwise. A file under `/article-images` answers at its exact case, `M87.jpg` included.
- The canonical path plus `.html`: 200, the same document.
- Any other path: `404.html`, with status 404. The not-found document loads no client script, so it stays on screen.

### The v1 mapping

`src/routing/v1-url-map.ts` maps the v1 address space onto this one as a rule per class of v1 URL applied to the article index, not as a hand-kept table: when an article changes category, the rows that mention it change without an edit. Its output, `src/routing/v1-url-map.generated.json`, is committed and reviewable: 82 rows over the real corpus, 66 permanent, 6 gone, 10 none. An article of a non-default locale contributes two permanent rows, its v1 path with no locale segment and the locale-marked form.

Nothing serves the mapping and nothing in the build reads it. A v1 address, any `/learn` path included, answers 404 with the not-found page. Whether the old addresses come back is the restore-v1-urls item of `ROADMAP.md`.

## Styling

The design system is `@robusta/pyramids-design-system`, consumed as a workspace dependency. Per BR-PYRAMID-3 it belongs to this site alone, and per BR-PYRAMID-6 every token the site renders comes from it: the site adds names, never values.

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

Brand assets are resolved through the design system's exports map and hashed by Vite under `/assets`; nothing is copied into `public/`. `src/design-system/assets.ts` exports `wordmarkSrc`, the URL the wordmark is published under. Pass it to every `BrandLogo` and `SiteHeader`: their default path does not exist on this site.

## Commands

Two root scripts, run from the repository root:

```bash
yarn build:robusta     # build:deps, then the site's build
yarn dev:robusta       # the site's dev
```

The site's own scripts:

- `build` — `check:source`, `compile:seams`, `emit:v1-map`, `copy:assets`, `vite build` with the prerender, then `scripts/check-route-table.mjs`.
- `dev` — `compile:seams`, `emit:v1-map`, `copy:assets`, then `vite dev`. On the dev server the two page-data functions run on each call and read the corpus.
- `check:source` — fails on a `'use client'` or `'use server'` directive, or on a local import without its `.js` suffix, anywhere under `src`, the generated route tree excepted.
- `compile:seams` — `tsc -p tsconfig.routing.json` compiles the routing and content modules to `.routing-dist/`, git-ignored, which the plain-Node scripts import.
- `emit:v1-map` — writes `src/routing/v1-url-map.generated.json`.
- `copy:assets` — rewrites `public/article-images/`.
- `test` — `vitest run`.
- `lint` — eslint over `src`. No build runs it.

This site is part of the green set: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta-v1`, `yarn build:robusta` must all complete from a clean checkout (BR-PYRAMID-5).

## Deployment

Netlify project `robusta-build`, in a team on the Free plan, linked to the repository `nicolas-zozol/pyramids`. It serves robusta.build from the production branch `main`, `www.robusta.build` as primary domain and the apex answering 301 to it. The first deploy of this site is `6ac53fd1`, on 2026-10-06: commit `04e70d6`, 23 pages and 41 assets, no function.

`netlify.toml`, beside this README, holds what the repository can say:

- the build command, `yarn build:robusta` at the repository root, preceded by `node --version`, `yarn --version` and `yarn config get yarnPath` so the log shows what the build ran with
- the publish directory, `apps/robusta-build/dist/client`: the prerendered output and nothing else. No function, no redirect rule, no header rule, no plugin; `@netlify/vite-plugin-tanstack-start` is not a dependency.
- the ignore rule: `git diff --quiet` between the cached and the current commit over the site, its three workspace dependencies and the root build files. Exit 0 skips the build.
- `YARN_FLAGS = "--immutable"`. Netlify's default, `--ignore-optional`, is an unknown option to yarn 4.

The dashboard holds the rest:

- package directory `apps/robusta-build`, base directory empty. Netlify installs and builds at the repository root, reads `.nvmrc` there, and finds `netlify.toml` in the package directory.
- build command and publish directory empty: `netlify.toml` carries both
- production branch `main`, branch deploys for `epic/robusta-v2`, the epic's working branch
- Pretty URLs on: the answers listed under One URL per page depend on it, and with it off a trailing slash would answer 200.
- no environment variable, in particular no `NODE_VERSION`, no `COREPACK_*` and no `YARN_VERSION`

A production deploy costs 15 of the team's 300 monthly credits, a branch deploy none, and a spent balance pauses every site of the team: work goes to the epic branch, and `main` receives merges.

DNS stays at Hover, which is the domain's name server: `@` A `75.2.60.5`, Netlify's load balancer, and `www` CNAME `robusta-build.netlify.app`. Every other record of the zone belongs to another service: mail, `race`, `code`. Netlify holds no DNS zone for the domain, and must not: with one, it renews a wildcard certificate it can only validate through its own name servers, and renewal fails. Without one, its Let's Encrypt certificate covers `robusta.build` and `www.robusta.build`.

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
