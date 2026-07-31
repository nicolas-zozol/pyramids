# @robusta/robusta-build

The version 2 site of robusta.build. Created by the `bootstrap-robusta-build` story of the pyramid-v2 epic as a deployable shell: it builds, it deploys, and it carries no page copy yet.

The version 1 site lives in `apps/robusta` and is being retired. Its README documents the v1 route scheme; that scheme is not this site's. The v2 scheme is decided in `features/pyramid-v2-epic/seo-url-scheme/`.

## Where the truth of this site lives

`src/seopyramids.config.ts` — domain, site name and title, mission, logo, default and other locales, and the blog configuration (roll size, mandatory keywords, author, category resolver). Everything a per-site value should be read from there rather than hardcoded in a component.

`blogConfig.getCategories` returns an empty array today and never throws. It stays that way until `content-source` decides how articles reach the site; per BR-PYRAMID-7 a site does not read its content source while serving a request.

The site is `robots: { index: false, follow: false }` at the root layout, so nothing is indexed while it holds no copy. Removing that directive is an acceptance criterion of `robusta-landing-page`, not a detail to drop in passing.

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
- Node: 22. The root `engines.node` field overrides the project setting, so that is where the real value lives.
- `ENABLE_EXPERIMENTAL_COREPACK=1`. Without it Vercel picks its package manager from `yarn.lock` and uses its bundled yarn 1, which cannot read a yarn 4 lockfile. With it, Vercel honours `packageManager: "yarn@4.17.1"` from the root manifest.

No `vercel.json` anywhere in this repository: every site is configured from the dashboard. Keep it that way or move all three at once, but do not leave one site configured in two places.

