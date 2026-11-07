# @robusta/pyramids

A yarn-workspaces monorepo that builds several SEO content sites from one shared base, a set of small React modules. `apps/dakar` is a Next.js App Router site on Vercel; the robusta site, `apps/robusta-build`, is TanStack Start, prerendered at build and served as files by Netlify. Each site carries its content and a design system, which several sites may share (BR-PYRAMID-3); what a single site uses lives in that site (BR-PYRAMID-12).

Live sites: robusta.build (`apps/robusta-build`, indexable pages open on the Netlify production build only) and dakar.surf (`apps/dakar`).

The v2 epic, `features/__done/pyramid-v2-epic/pyramid-v2.epic.md`, rebuilds the robusta site on a simplified URL scheme and a design system.

## Where things are

- `apps/*` — deployable sites
- `packages/*` — shared libraries, built to `dist/` and consumed as build output, never as sources
- `features/*` — the Compound working documents: epics, stories, designs
- `documentation/*` — long-form notes that outlive a feature

## Project documents

- [root.archi.md](root.archi.md) — purpose and architecture of the whole system; each package has its own `<name>.archi.md`
- [ubiquitous-language.md](ubiquitous-language.md) — the shared vocabulary; use these terms, not synonyms
- [business-rules.md](business-rules.md) — the constraints the business decides on
- [ROADMAP.md](ROADMAP.md) — what is left to build, in order
- [CLAUDE.md](CLAUDE.md) — conventions enforced in this repo, and the full command reference

## Getting started

Node 22 (`.nvmrc`), 22.18 or later, and yarn 4.17.1, whose binary is committed at `.yarn/releases/yarn-4.17.1.cjs` and named by `yarnPath` in `.yarnrc.yml`: any yarn on your PATH delegates to it. Corepack is not needed, and a corepack cache inside the repository breaks the install: see Yarn on a build agent in `apps/robusta-build/README.md`.

```bash
yarn install
yarn build:deps      # helpers → themes → design-system → layouts → links → ctas
yarn dev:robusta     # or dev:dakar
```

From a clean checkout the whole repository builds with `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`, in that order and with no manual step. That sequence is what a change to the shared base has to keep green.

A site reads the build output of the shared packages: while one is edited and a site runs, keep its watcher up (`yarn w:<package>`).

Two things bite newcomers: a local TypeScript import ends with `.js` even though the source is `.ts`, except in `apps/robusta-build` and the design system, where it names the `.ts` or `.tsx` file itself; and no site's build runs eslint: `yarn lint` is a separate step.
