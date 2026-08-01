# @robusta/robusta-build

The version 2 site of robusta.build. Created by the `bootstrap-robusta-build` story of the pyramid-v2 epic as a deployable shell: it builds, it deploys, and it carries no page copy yet.

The version 1 site lives in `apps/robusta` and is being retired. Its README documents the v1 route scheme; that scheme is not this site's. The v2 scheme is the Routing section below.

## Where the truth of this site lives

`src/seopyramids.config.ts` — domain, site name and title, mission, logo, default and other locales, and the blog configuration (roll size, mandatory keywords, author, category resolver). Everything a per-site value should be read from there rather than hardcoded in a component.

`blogConfig.getCategories` returns an empty array today and never throws. It stays that way until `content-source` decides how articles reach the site; per BR-PYRAMID-7 a site does not read its content source while serving a request.

The site is `robots: { index: false, follow: false }` at the root layout, so nothing is indexed while it holds no copy. Removing that directive is an acceptance criterion of `robusta-landing-page`, not a detail to drop in passing.

## Routing

The v2 URL scheme, decided by the `seo-url-scheme` story of the pyramid-v2 epic. This site owns its routing reference the way `apps/robusta/README.md` owns v1's, and it inherits nothing from it.

The shapes, with `articles` as the content root this site names:

- `/` — the landing page.
- `/articles` — the blog roll, page one.
- `/articles/p/{n}` — page n of that roll, n ≥ 2.
- `/articles/c/{category}` — a category roll, page one, and `/articles/c/{category}/p/{n}` for the rest.
- `/articles/c/{category}/{slug}` — an article claiming a category, which most do.
- `/articles/{slug}` — an article claiming none.
- `/articles/t/{tag}` — reserved, and built by nothing.
- `/l/{locale}` in front of any of the above, for a locale that is not the default one. The default locale carries no marker.

Who owns what: the discriminants `l`, `c`, `p` and `t` and the shapes built from them belong to `@robusta/pyramids-routing`; `articles` belongs to this site, written once in `src/routing/scheme.ts` and read from there by `blogConfig.contentRoot`. The roll size is a constant of 12 and not a per-site knob — `ROLL_SIZE`, in the same file.

### The route table

Fourteen route files under `src/app`: seven for the default locale, seven mirroring them under `l/[locale]`. Every one declares `dynamic = 'force-static'` and `dynamicParams = false`, and takes its params from `src/routing/content-urls.ts`, which is `urlSet(urlScheme, await getArticleIndex())` filtered by page kind and by locale scope.

That single derivation is the point. A URL it does not contain answers 404 instead of being resolved on demand, `force-static` makes `searchParams` an empty object so no content route can read one even by accident, and there is no second list to pregenerate a URL the site then refuses at request time. 62 static pages today, on the fixture corpus that stands in until `content-source` lands.

Two build-time checks keep the route folders and the configuration honest. `next.config.ts` asserts inside `redirects()` that every route folder the configured content root implies exists, so renaming the content root without renaming the folders fails the build. `scripts/check-route-table.mjs` runs after `next build` and compares the prerender manifest with the derivation — `/` and `/_not-found` excepted, both being outside the content section — and fails if they disagree.

### `/articles/t/{tag}` is reserved and not built

No tag route ships, so `/articles/t/rxjs` answers 404 exactly like a slug that does not exist. The address is spoken for all the same, so the tag page the scheme must stay able to grow finds it free rather than taken by an article published in the meantime. What keeps it free is `validateArticles`: no slug and no category may take the value `l`, `c`, `p` or `t`, and no category may nest. A corpus breaking either rule fails the build naming the offending article, and a tag stays metadata with no page.

### One URL per page

Four families of non-canonical address redirect permanently to the canonical one, and none of them is hand-written: they are what `buildUrl` and `parseUrl` disagreeing about a path produces.

- An explicit page one — `/articles/p/1`, `/articles/c/{category}/p/1` — and a marked default locale — `/l/en/…` — are `redirects()` rules in `next.config.ts`.
- A trailing slash is `trailingSlash: false`.
- Letter case is `src/middleware.ts`, the only middleware the site carries. Its matcher fires only on a path containing an uppercase letter, and it excludes `/learn`, so the v1 mapping keeps matching addresses as they were published — `/learn/tag/DeFi` included — and `/_next`, without which every hashed asset under `/_next/static/{buildId}/` would be 308'd to a path that does not exist.

### The v1 mapping

`src/routing/v1-url-map.ts` maps the v1 address space onto this one as a rule per class of v1 URL applied to the article index, rather than as a hand-kept table: the day an article changes category, the rows that mention it change without an edit. Its output, `src/routing/v1-url-map.generated.json`, is committed — 99 rows, 83 permanent, 6 gone, 10 none — because the mapping is meant to be reviewable, and a diff is exactly that.

- Permanent rows become `redirects()` entries in `next.config.ts`.
- Gone rows are answered by `src/app/learn/[...path]/route.ts`, which returns 410 for the retired `/learn` namespace and lets any path carrying an `images` segment fall through to 404.
- None rows emit nothing and exist to be read: `/portfolio` and `/fr/portfolio` are visibly let go rather than silently forgotten.

None of it is live. The site is `robots: noindex` site-wide until `robusta-landing-page` lifts that flag, and sending indexed v1 URLs at de-indexed targets would trade away exactly what the mapping exists to protect. The redirects switch on with `retire-robusta-v1`.

### `emit:redirects`, and why the config reads JSON

The app's `build` and `dev` scripts both run `emit:redirects` first: `tsc -p tsconfig.routing.json` compiles the routing and content modules to `.routing-dist/` (git-ignored), then `scripts/emit-redirects.mjs` runs them and writes the generated JSON. `next.config.ts` reads that file with `node:fs`.

It reads rather than imports because it cannot import. Next loads the config outside the webpack pipeline, through a require hook whose module resolution runs before the `require.extensions['.ts']` hook it registers, so this repository's `.js`-suffixed local imports resolve to files that do not exist — and `experimental.extensionAlias`, which solves precisely that, belongs to webpack and does not apply here. Independently, the chain would die on the design system's PNG wordmark, a bundler-only import that `src/seopyramids.config.ts` resolves. Emitting the data and reading it back costs one script and no redesign, because the mapping module imports neither Next nor React.

## Styling

The design system is `@robusta/pyramids-design-system`, consumed as a workspace dependency. Per BR-PYRAMID-3 it belongs to this site alone, and per BR-PYRAMID-6 every token the site renders comes from it — the site adds names, never values.

The CSS load order in `src/app/layout.tsx` is a contract, not a preference:

1. `./globals.css` — the Tailwind 4 entry. Tailwind emits its preflight inside `@layer base`.
2. `@robusta/pyramids-design-system/colors_and_type.css` — tokens and element rules. These are unlayered, so they win over preflight.
3. `@robusta/pyramids-design-system/sketch.css` — the `.sk-*` primitives, which read the tokens the previous file defines.

`globals.css` also holds the token bridge: shadcn's expected names (`--background`, `--primary`, and siblings) aliased onto design-system tokens, so the first story that runs `shadcn init` lands on a layer already pointing at the design system. Every entry is an alias; none is a literal. `--destructive` is deliberately absent — the design system ships no error colour, and coining one at site level is what BR-PYRAMID-6 forbids.

The v2 site does not use DaisyUI, and does not consume `pyramids-layouts`, `pyramids-links` or `pyramids-ctas`, which render DaisyUI classes.

## Fonts

The three brand faces are self-hosted through `next/font/google` in the root layout, so a rendered page issues no request to a font CDN. Each loader publishes its face as a custom property — `--font-ibm-plex-sans`, `--font-ibm-plex-mono`, `--font-caveat` — which is the contract `colors_and_type.css` declares. The package keeps owning the family names, their order and their fallbacks.

Do not link `@robusta/pyramids-design-system/fonts.css` here. That file is the opt-in Google Fonts path for consumers with no build step, and loading both fetches every face twice.

## Assets

Brand assets are resolved through the design system's exports map and hashed by the bundler; nothing is copied into `public/`. `src/design-system/assets.ts` is the single seam that normalises what the bundler returns — Next.js hands back a `StaticImageData`, other pipelines hand back a string.

## Commands

Both are root scripts — run them from the repository root, not from here:

```bash
yarn build:robusta-build     # build:deps, then next build
yarn dev:robusta-build       # next dev with Turbopack
```

This site is part of the green set: `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`, `yarn build:robusta-build` must all complete from a clean checkout (BR-PYRAMID-5).

## Deployment

Vercel project `robusta-build-v2`, under `nicoramas-projects`, created 2026-07-31. It is its own project: robusta.build keeps answering from the v1 project until a later story decides the switch.

- Root Directory: `apps/robusta-build`
- Include source files outside the Root Directory: on. This is what makes the yarn workspaces resolve; Vercel enables it by default for projects created after 2020-08-27, so verify rather than assume.
- Install Command: `yarn install`
- Build Command: `cd ../.. && yarn build:robusta-build`. The `cd` is not decoration. Vercel runs the build command inside the Root Directory, and from there yarn sees only this workspace's four scripts — `build:robusta-build` lives in the root manifest and is not inherited. Plain `yarn build` would resolve, and would fail differently: the site reads the design system's `dist/`, which only `build:deps` produces.
- Node: 22, and the only place that decides it is the Vercel project's own Node Version setting. `engines.node` in the root manifest does not override it — tested on 2026-08-01 with both `">=22 <23"` and `"22.x"`, and the project ran Node 24.15.0 either way. The manifest still declares `"22.x"` because that is what a human reads and what other tooling honours, but it has no say in what Vercel installs with.

  Set it to 22 for the reason `.nvmrc` gives, not to fix a build: Node 24 was suspected of breaking the install and was not the cause. The same failure reproduces identically on 22.22.2.

  Check the setting before assuming the repository decides it: `vercel project ls` prints the Node version per project, and `vercel inspect --logs <url>` prints the one the build actually ran on.

- The install failure that has blocked every deployment of this project, and its cause. Every build dies in about five seconds:

  ```
  file:///vercel/path0/.vercel/cache/corepack/home/v1/yarn/4.17.1/yarn.js:4
  Error: Dynamic require of "util" is not supported
      at ModuleJob.run (node:internal/modules/esm/module_job)
  Error: Command "yarn install" exited with 1
  ```

  yarn's CLI bundle is CommonJS. Node is loading it as an ES module — the `file://` URL and the ESM loader in the stack say so — and its `require` shim throws. Node decides a `.js` file's module type from the nearest `package.json` above it, and on Vercel corepack caches yarn at `.vercel/cache/corepack/...`, which is *inside the repository*. The nearest manifest above it is the root one, which declares `"type": "module"`. So the repository's own ESM declaration reaches a file that is not ours.

  It never reproduces locally, which is the whole trap: corepack caches in `~/.cache/node/corepack`, outside any package, so `yarn install` and the full green set pass on a machine while every deployment fails.

  What does not fix it, each tested: raising or lowering the Node version, and `engines.node` in any form. `vercel redeploy` does not test a fix either — it replays a deployment with the environment it was created with, so an environment variable added afterwards is not picked up and the build looks unchanged.
- `ENABLE_EXPERIMENTAL_COREPACK=1`. Without it Vercel picks its package manager from `yarn.lock` and uses its bundled yarn 1, which cannot read a yarn 4 lockfile. With it, Vercel honours `packageManager: "yarn@4.17.1"` from the root manifest.

No `vercel.json` anywhere in this repository: every site is configured from the dashboard. Keep it that way or move all three at once, but do not leave one site configured in two places.

