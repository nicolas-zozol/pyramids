# @robusta/pyramids

A yarn-workspaces monorepo that builds several SEO content sites from one shared base: a Vercel + Next.js App Router backbone with React Server Components and ISR, a set of small React packages, and a markdown content pipeline. Each site brings its own content and its own design system; everything else is borrowed.

Live sites: robusta.build (`apps/robusta`) and dakar.surf (`apps/dakar`).

The project is in a v2 restart — the robusta site is being rebuilt from scratch on a simplified URL scheme and a real design system. Scope and reasoning: `features/pyramid-v2-epic/pyramid-v2.epic.md`.

## Where things are

- `apps/*` — deployable Next.js sites and the standalone demos
- `packages/*` — shared libraries, built to `dist/` and consumed as build output, never as sources
- `services/*` — the telemetry collector and its docker-compose observability stack
- `features/*` — the Compound working documents: epics, stories, designs
- `documentation/*` — long-form notes that outlive a feature

## Project documents

- [root.archi.md](root.archi.md) — purpose and architecture of the whole system; each package has its own `<name>.archi.md`
- [ubiquitous-language.md](ubiquitous-language.md) — the shared vocabulary; use these terms, not synonyms
- [business-rules.md](business-rules.md) — the constraints the business decides on
- [ROADMAP.md](ROADMAP.md) — what is left to build, in order
- [CLAUDE.md](CLAUDE.md) — conventions enforced in this repo, and the full command reference

## Getting started

Node 22 (`.nvmrc`) and yarn 4, which corepack activates from the `packageManager` field of the root manifest — `corepack enable` once, and it no longer matters which yarn sits on your PATH.

```bash
yarn install
yarn build:deps      # helpers → themes → layouts → links → ctas
yarn dev:robusta     # or dev:dakar
```

From a clean checkout the whole repository builds with `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta`, in that order and with no manual step. That sequence is what a change to the shared base has to keep green.

Editing a shared package while a site runs? Keep a watcher up (`yarn dev:dev`, or `yarn w:<package>`), otherwise the site keeps serving the previous build output.

Two things bite newcomers: local TypeScript imports must end with `.js` even though the source is `.ts`, and `next build` does not run eslint — `yarn lint` is a separate step.
