# Story : Unblock the build chain

**Dernière mise à jour :** 2026-07-29
**Feature :** unblock-build
**Infix :** UNBLOCKBUILD
**Status :** ACTIVE

## Story

As the builder of the v2 site, I want the monorepo to build from a clean checkout, so that I can verify a site end to end instead of trusting an installation that only happens to work on one machine.

## Contexte & objectif

Two failures were recorded while packaging the design system, and both are older than that work. The first makes `yarn build:deps` fail in a fresh worktree; the second makes `next build` of `apps/robusta` die during static page generation. Together they mean no site in this repo can be built end to end from a clean state, and `bootstrap-robusta-build` — the next item of the epic — would inherit both.

Nothing blocks this story: it is the only item of the epic ready to code today. `merge-design-system` is a merge waiting on a human, and every item after it depends on the v2 site existing.

## The two failures

`pyramids-links` fails `tsc` in a fresh worktree
: the package imports `next/link` and `next/navigation` but declares `next` nowhere. It compiles on the current tree only because yarn 1 hoisted dakar's Next to the root, while `apps/robusta` keeps another version in its own `node_modules`. `pyramids-ctas` has the same undeclared import, so the failure is wider than the single package it was flagged on. Both `.archi.md` already describe `next` as a peer — only the manifests never said so.

`next build` of `apps/robusta` crashes a worker
: "Next.js build worker exited with code: 1", during static page generation, on `dev` and without any design-system change. Never investigated: the cause is unknown, and so is whether a v2 site would reproduce it.

## Definition of done

- A fresh clone or worktree installs and completes `yarn build:deps` with no manual step, and without depending on which app's Next version happened to be hoisted.
- Every package that imports `next/*` declares that dependency itself — `pyramids-links` and `pyramids-ctas` today.
- The static-generation crash is reproduced and its cause identified and written down, whether or not the v1 app ends up repaired.
- Does not cover creating the v2 site, nor any change to `apps/dakar` beyond what these two failures require.

## Décisions

- 2026-07-29 — This story owes the diagnosis of the `next build` crash of `apps/robusta`, and a repair only if the cause sits in the shared base; a cause belonging to v1 app code alone is recorded and left there. Pourquoi : what is asked for is a verifiable v2 site, not a healthy v1 — but a cause left unknown is a cause the v2 site can inherit.
- 2026-07-29 — The Next version is not aligned across apps: the story declares the missing dependencies, leaves `apps/dakar` and `apps/robusta` where they are, and uses a recent version of Next ("lgtm, use recent version of next"). Pourquoi : `apps/dakar` is live and out of v2 scope, and bumping the site the epic is retiring buys nothing; the recent-version clause is the human's own addition to the proposition, and its reach is not settled here.
- 2026-07-30 — merge-design-system lands before this story, which then sweeps all six shared packages in a single pass; if the merge has to wait, the design-system manifest is corrected on the feature branch as part of this story. Pourquoi : arbitration C3 of `pyramid-v2.bulk.md`, which overturns this story's assertion that the two can land in any order — `packages/robusta-design-system` on `feat/packagify-design-system` declares the React release candidate as both dependency and peer, so landing first would let the merge silently reintroduce the very pin this story removes, in the package the v2 site is built from.
- 2026-07-30 — The repository migrates to yarn 4 rather than pinning yarn 1.22.22: "migrate to yarn 4 ; no fear to break ; we'll remove or delete things that are not useful if needed". Pourquoi : arbitration of Open Question 1 of `unblock-build.brainstorm.md`, against the proposition that deferred yarn 4 to its own story; what the migration breaks may be removed or deleted rather than repaired.
- 2026-07-30 — A green build is sufficient acceptance for `apps/robusta`: any rendering difference is recorded here and left unrepaired. Pourquoi : arbitration of Open Question 2 of `unblock-build.brainstorm.md` — the epic retires the v1 site and forbids refactoring it, so verification effort there contradicts the decision of 2026-07-29; the fallback if the site visibly breaks is to force a single React through a root `resolutions` entry and leave the app on the release candidate.

## Documentation updates

- change the Notes / Gotchas of `root.archi.md` — why: it records these two failures as latent; it must instead carry the rule that replaces the first (a package importing `next/*` declares it) and what the static-generation crash turned out to be.
- check the Dependencies section of `packages/links/links.archi.md` and `packages/ctas/ctas.archi.md` — why: both already claim `next` as a peer, so they stay true only if that is the fix retained; anything else makes them wrong.

## Dependencies

- None. `merge-design-system` touches components, not the build chain, so it can land before or after.
- Depended on by `bootstrap-robusta-build` (item 3 of the epic), which cannot be verified end to end until this lands.
