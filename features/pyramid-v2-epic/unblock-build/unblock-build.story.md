# Story : Unblock the build chain

**Dernière mise à jour :** 2026-08-02
**Feature :** unblock-build
**Infix :** UNBLOCKBUILD
**Status :** LANDED (2026-07-31, commit d9199ad)

## Story

As the builder of the v2 site, I want the monorepo to build from a clean checkout, so that I can verify a site end to end instead of trusting an installation that only happens to work on one machine.

## Contexte & objectif

Two failures recorded during the design-system work left no site in this repository buildable from a clean state: `pyramids-links` failed `tsc` in a fresh worktree, and `next build` of `apps/robusta` killed a worker during static generation. Both were declaration defects — an undeclared `next` peer, and two React copies inside one site — so no source file changed; three more undeclared imports of the same shape surfaced and were fixed the same way.

The repository now names its own toolchain (yarn 4.17.1, Node 22, `node-modules` linker) instead of inheriting whatever the machine carries, and the green set builds end to end from a wiped tree.

## Livré

### Requirements

- R-UNBLOCKBUILD-1 : A shared package declares in its own manifest every external framework its sources import.
- R-UNBLOCKBUILD-2 : A shared package declares a framework it borrows from its host site as a peer, never as a bundled dependency, so the host's copy is the one that runs.
- R-UNBLOCKBUILD-3 : A peer range declared by a shared package admits every version its host sites run today.
- R-UNBLOCKBUILD-4 : Exactly one copy of React resolves inside a site's render graph.
- R-UNBLOCKBUILD-5 : No shared package pins a release candidate as the version of a runtime dependency.
- R-UNBLOCKBUILD-6 : The repository declares the package manager version, the node linker and the Node major it installs with; resolution does not depend on what the machine happens to carry. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-7 : The set of workspaces that must build green from a clean checkout is named, and what falls outside it is named too. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-8 : `apps/dakar` builds and renders unchanged: it is live and outside the v2 scope.
- R-UNBLOCKBUILD-9 : The cause of the static-generation crash is recorded in the architecture notes in terms a reader can act on, whether or not the v1 site is repaired.
- R-UNBLOCKBUILD-10 : Verification runs from a state the repository can produce on its own — never from an existing `node_modules`. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-11 : A correction applied to the shared packages reaches all six of them, `pyramids-design-system` included.
- R-UNBLOCKBUILD-12 : A workspace script the declared package manager cannot run is removed rather than adapted.
- R-UNBLOCKBUILD-13 : The lockfile the repository commits is the one its declared package manager produces, and a clean install leaves it unchanged. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-14 : Every workspace carrying a manifest installs under the declared toolchain, including those the green set never builds.
- R-UNBLOCKBUILD-15 : A reference from one workspace of this monorepo to another states the workspace protocol, so no intra-monorepo edge can be answered by the registry.

### Acceptance Criteria

- AC-UNBLOCKBUILD-01 : Given Arabica in a fresh worktree with its own install and no Next hoisted at the root, when she runs `yarn build:deps`, then `pyramids-links` and `pyramids-ctas` compile against their own declared `next` and every package builds (R-1, R-2).
- AC-UNBLOCKBUILD-02 : Given Excelsa installing `apps/robusta` on Next 15.1.8 and `apps/dakar` on Next 15.5.3, when the install completes, then neither host reports an unmet peer for `next` or for `react` (R-3).
- AC-UNBLOCKBUILD-03 : Given a host site on a Next version outside the declared peer range, when it installs, then the mismatch is reported as an unmet peer instead of surfacing at build time (R-3).
- AC-UNBLOCKBUILD-04 : Given Arabica reading any of the six shared package manifests, when she looks at `dependencies`, then neither `react` nor `next` appears there (R-2, R-11).
- AC-UNBLOCKBUILD-21 : Given Excelsa on a clean install, when the React copies resolved under `apps/robusta` are enumerated, then exactly one is found and none is nested under `styled-jsx` (R-4).
- AC-UNBLOCKBUILD-22 : Given Excelsa on a clean install, when `next build` runs in `apps/robusta`, then the prerender of `/_error` and `/500` completes and the build exits 0 (R-4).
- AC-UNBLOCKBUILD-23 : Given Excelsa on a clean install, when `next build` runs in `apps/dakar`, then it completes exactly as it does today (R-8).
- AC-UNBLOCKBUILD-24 : Given Arabica reading the six shared packages and `apps/robusta`, when she reads every version they state for React, then all state 19.1.1 and none is a release candidate (R-5, R-11).
- AC-UNBLOCKBUILD-41 : Given Bourbon on a machine whose ambient yarn is 4.x with Plug'n'Play defaults, when he clones and runs the repository's install, then the yarn version the repository names is the one that runs and the layout the repository names is the one produced (R-6).
- AC-UNBLOCKBUILD-42 : Given Bourbon after a clean install, when he runs `git status`, then `yarn.lock` shows no change (R-13, BR-PYRAMID-5).
- AC-UNBLOCKBUILD-43 : Given a machine on a Node major outside the declared range, when install runs, then it says so rather than producing a subtly different graph (R-6).
- AC-UNBLOCKBUILD-44 : Given the declared package manager, when any script of the green set runs, then none invokes an option that package manager does not accept (R-12).
- AC-UNBLOCKBUILD-45 : Given Excelsa on a clean checkout, when the root install runs, then every workspace carrying a manifest resolves, `scribe-intel` and `scribe-intel-collector` included, and no intra-monorepo reference is looked up in the registry (R-14, R-15). Corrected at land: the design doc also enumerates `imagine`, a workspace this story removed.
- AC-UNBLOCKBUILD-61 : Given Excelsa on a fresh clone, when the documented verification sequence runs end to end, then every workspace of the green set builds and no manual step is needed (R-7, R-10, BR-PYRAMID-5).
- AC-UNBLOCKBUILD-62 : Given a workspace outside the green set, when the verification runs, then it is not built, and whether it installs at all is stated in the record rather than left to be discovered (R-7).
- AC-UNBLOCKBUILD-63 : Given a reader who meets `Next.js build worker exited with code: 1` on another app, when they read the Notes / Gotchas of `root.archi.md`, then they find the duplicate-React mechanism and learn that the message hides the prerender error that carries the real cause (R-9).

## Décisions

- 2026-07-29 — This story owes the diagnosis of the `next build` crash of `apps/robusta`, and a repair only if the cause sits in the shared base. Pourquoi : what is asked for is a verifiable v2 site, not a healthy v1 — but a cause left unknown is a cause the v2 site can inherit. The cause did sit in the shared base, so it was repaired.
- 2026-07-29 — The two apps stay on their own Next, `apps/robusta` on 15.1.8 and `apps/dakar` on 15.5.3, and the declared peer range `^15.1.8` spans them. Pourquoi : `apps/dakar` is live and out of v2 scope, and bumping the site the epic is retiring buys nothing.
- 2026-07-30 — merge-design-system lands first, so the sweep covers all six shared packages in a single pass. Pourquoi : arbitration C3 of the epic bulk — the design-system manifest declared the React release candidate, so landing this story first would have let the merge silently reintroduce the pin it removes. The merge landed as `c0f98fe`.
- 2026-07-30 — The repository migrates to yarn 4 rather than pinning yarn 1.22.22: "migrate to yarn 4 ; no fear to break ; we'll remove or delete things that are not useful if needed". Pourquoi : arbitration of Open Question 1 of the brainstorm. What the migration broke was removed rather than repaired — the `prebuild` scripts passing `--production`, the dead `build:race`, and the `resolutions` field of `scribe-intel` that yarn 4 ignores outside the root workspace.
- 2026-07-30 — A green build is sufficient acceptance for `apps/robusta`: any rendering difference is recorded and left unrepaired. Pourquoi : the epic retires the v1 site and forbids refactoring it. The build is green at 42/42 static pages, and nothing beyond that was verified.
- 2026-07-31 — The v1 lockfile was migrated in place by yarn 4, not deleted and re-resolved from scratch. Pourquoi : almost every range here is a caret, so a from-scratch resolution would have moved the entire transitive tree to today's latest, `apps/dakar` included, against R-UNBLOCKBUILD-8; the dakar route table after the change is identical to the baseline taken before it. Deleting `yarn.lock` is therefore a deliberate upgrade with its own dakar verification, never a routine step.
- 2026-07-31 — `.yarnrc.yml` is validated as it stands: `enableScripts: true` kept, `approvedGitRepositories: ["**"]` and `npmMinimalAgeGate: 0` removed. Pourquoi : yarn's first install wrote all three on its own. `sharp` (Next image optimisation), `esbuild`, `@parcel/watcher` and `protobufjs` build native binaries at install time and are unusable without scripts; the other two switch off supply-chain guards this repository needs no exemption from, having no git-protocol dependency.
- 2026-07-31 — `@robusta/imagine` is deprecated and the workspace removed. Pourquoi : it pulled Puppeteer, whose install step downloaded a browser on every clean install — 894 MiB measured, on the build agent too — for a package the build chain never opened and nothing imported. This settles Open Question 1 of the design doc by deletion rather than by suppressing the download.
- 2026-07-31 — `@types/react: "^18"` stays alongside React 19 in every workspace. Pourquoi : Open Question 2 of the design doc, answered by implementation — declaring `next` never surfaced the mismatch, everything still compiles, and the repository-wide sweep remains its own chore.
- 2026-07-31 — `packages/scribe-intel` and `services/scribe-intel-collector` do not compile, and were left that way. Pourquoi : `tsc` fails on `VisitorHori` not implementing `Visitor` and on `intent.spec.ts` importing a `createIntelInstance` that no longer exists — source defects predating this work, in two workspaces the epic keeps dormant and outside the green set. Both install, which is all R-UNBLOCKBUILD-14 asks of them.
- 2026-07-31 — `apps/robusta` type-checks its own `vite.config.ts` during `next build`, and that coupling was left in place. Pourquoi : it is what made the undeclared `vite` fatal rather than cosmetic, and excluding the file would hide the defect instead of declaring it. A tsconfig `exclude` line is available the day someone wants it.

## Fixes

- 2026-08-01 — six deployments of the v2 site died in five seconds and none reproduced locally: corepack caches yarn inside the repository at `.vercel/cache/corepack/`, where the root manifest's `"type": "module"` reaches it and makes Node load yarn's CommonJS bundle as an ES module, killing the install before a single dependency resolves. Locally corepack caches in `~/.cache/node/corepack`, outside any package, which is why the whole green set passes on a machine. The yarn binary is now committed at `.yarn/releases/yarn-4.17.1.cjs` and named by `yarnPath` in `.yarnrc.yml`, so yarn 1 delegates to it and corepack is abandoned; `ENABLE_EXPERIMENTAL_COREPACK` and `COREPACK_HOME` are removed from the Vercel project. Ruled out first, in both directions: the Node version, and `engines.node` in every form. Commits `a4b0923`, `2281b5f`, `8f1ecde`.
- 2026-08-01 — the delivered contracts are unchanged by that fix: corepack was a mechanism, never a requirement. R-UNBLOCKBUILD-6 asks that the repository declare its toolchain rather than inherit the machine's, and `yarnPath` declares it more strictly than `packageManager` did; AC-UNBLOCKBUILD-41 still holds, the yarn the repository names being the one that runs. What the fix leaves behind is documentation, planned below and due to docman.

## Documentation updates

Delivered in commit `14370d4`.

- changed the Notes / Gotchas of `root.archi.md` — the duplicate-React mechanism behind `Next.js build worker exited with code: 1`, and the second instance of the same defect class, `vite-tsconfig-paths` bound to a hoisted `vite@5`
- changed the Dependencies and Toolchain lines of `root.archi.md` — they named yarn 1; they now carry yarn 4, `packageManager`, `engines.node`, `nodeLinker: node-modules` and the green set
- changed the Getting started of `README.md` and the install and build command reference of `CLAUDE.md` — both described a yarn 1 repository
- changed the Dependencies of `packages/links/links.archi.md` and `packages/ctas/ctas.archi.md` — both already claimed `next` as a peer; they now state the range and why `next` is also a devDependency

Due since the corepack fix of 2026-08-01 and not delivered. The three first entries do not merely read stale: they instruct the reader to run the command that breaks the deployments. `apps/robusta-build/README.md` already carries the true account and is the reference.

- change the Install / clean paragraph of `CLAUDE.md` — it declares yarn 4.17.1 "activated by corepack" and tells the reader to run `corepack enable` once; the install now goes through the committed binary that `yarnPath` names, and enabling corepack is what kills a Vercel build
- change the Toolchain line of the Dependencies section of `root.archi.md` — it ends on "Install is `yarn install`, with corepack honouring `packageManager`", and the same line still states `engines.node: ">=22 <23"` where the root manifest reads `"22.x"`
- change the Getting started of `README.md` — same corepack instruction, sitting in the first commands a newcomer runs
- change the green-set sequence of `README.md` — it names `yarn install`, `yarn build:deps`, `yarn build:dakar` and `yarn build:robusta`, and omits `yarn build:robusta-build`, in the green set since 2026-07-31
