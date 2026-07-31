# Design: Unblock the build chain

**Last update:** 2026-07-30
**Feature:** unblock-build
**Infix:** UNBLOCKBUILD
**Status:** APPROVED
**Sources:** [story](unblock-build.story.md), [brainstorm](unblock-build.brainstorm.md), [epic](../pyramid-v2.epic.md), [business rules](../../../business-rules.md), [root architecture](../../../root.archi.md)

## Goal

Turn the monorepo's dependency graph from something the resolver discovers into something the manifests declare. Three contracts are written down and made checkable: what a shared package borrows from its host site, which React runs inside a site, and which toolchain installs the repository. Why this comes before the v2 site is in the story — every defect found here is inherited by `apps/robusta-build` the day it copies an existing manifest.

Acceptance for `apps/robusta` is a green `next build` and nothing more: any rendering difference the React move produces is recorded in the story and left unrepaired (story decision of 2026-07-30). No application source file is touched — every defect in scope is a declaration defect, so a source change would signal a wrong diagnosis.

## Ubiquitous Language

Terms used here as `ubiquitous-language.md` defines them: Workspace, Build chain, Site, Watcher.

Two terms this design needs and the glossary does not carry — clean checkout, which BR-PYRAMID-5 is written on, and green set, the named collection of workspaces that must build. Both are used below and both are raised as Gaps.

Deliberately not used: "peer dependency" and "linker" are package-manager mechanics, not domain vocabulary. They belong to the Interfaces and Technical Constraints sections and to no rule.

## Business Rules (cited)

- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.

This is the acceptance bar of the whole feature. Nothing else in the registry is engaged.

## Interfaces

### The peer contract between a shared package and its host site

The contract applies to all six shared packages — `pyramids-helpers`, `pyramids-themes`, `pyramids-layouts`, `pyramids-links`, `pyramids-ctas`, `pyramids-design-system`. It is stated once and holds for the seventh the v2 site will bring.

```jsonc
// every shared package
"peerDependencies": { "react": "^19.1.1" },
"devDependencies":  { "react": "^19.1.1" }
// react MUST NOT appear in "dependencies"

// pyramids-links and pyramids-ctas only — they import next/link and next/navigation
"peerDependencies": { "next": "^15.1.8" },
"devDependencies":  { "next": "^15.5.3", "react-dom": "^19.1.1" }
// next MUST NOT appear in "dependencies"
```

Why `dependencies` is the wrong section for a framework borrowed from the host: `dependencies` authorises the resolver to place a private copy inside the package's own subtree. React holds process-wide state — the current dispatcher, the element registry — so a second copy inside one site's render graph does not merely waste bytes, it answers `useContext` with a null dispatcher. Next carries router and request context the same way. `peerDependencies` states the requirement without authorising a copy: the host's instance is the one that runs. The `devDependencies` line is a separate concern — it is what the package's own `tsc` resolves `next/link` and `next/navigation` against, and it never reaches a site, which consumes `dist/`.

Peer ranges, and why these bounds:

- `next: "^15.1.8"` — the lower bound is `apps/robusta`, the upper bound admits `apps/dakar` on 15.5.3 and every 15.x after it. A narrower `^15.5.0` would leave `apps/robusta` unmet and invite a second Next into a subtree, which is the failure this design removes for React. The two apps stay deliberately unaligned (story decision of 2026-07-29), so the range spans them rather than moving either.
- `react: "^19.1.1"` — both hosts land here. A caret over a stable release also excludes every release candidate by semver's prerelease rule, so the pin this design removes cannot come back through a host without showing up as an unmet peer.
- `react-dom` is a devDependency of `pyramids-links` and `pyramids-ctas` only, to satisfy `next`'s own peer during type-check. It is not a peer of any shared package: no source imports it.

`pyramids-design-system` is the one package that today declares `react` in both `dependencies` and `peerDependencies`. The `dependencies` entry goes; the peer entry moves to the stable range. No shared package other than `pyramids-links` and `pyramids-ctas` imports `next/*` — the design system's only `next` string is a public asset path, not an import.

`pyramids-layouts`, `pyramids-links` and `pyramids-ctas` are deprecated by the epic decision of 2026-07-30 and may eventually be removed. They are repaired here regardless: `apps/dakar` declares all three, and dakar is live and outside v2 scope, so removal is not available until it moves.

### The React convergence target

One version, everywhere React is named: 19.1.1, stable. It is what `apps/dakar` already declares and what resolves at the root today, so the live site moves nowhere.

- Six shared packages leave `^19.0.0-rc-66855b96-20241106` for the peer and dev ranges above.
- `apps/robusta` leaves the exact release-candidate pin on `react` and `react-dom` for `^19.1.1`.
- `apps/dakar` is untouched.

The observed failure is the negative control for this: with two React copies inside `apps/robusta`, `StyleRegistry` inside `styled-jsx` calls `useContext` on the copy that is not driving the render, the prerender of `/500` throws, and Next reports it as `Next.js build worker exited with code: 1`. With the nested copy removed the same build produced 42/42 static pages. Under the declared linker a peer dependency resolves to the dependent's own copy, so once every workspace in a site's render graph names the same React, only one copy can exist inside that site. The check is empirical, not inferred — AC-UNBLOCKBUILD-21 enumerates the copies after a clean install. If a duplicate survives that check, a root `resolutions` entry on `react` and `react-dom` is the available lever, and the reason it was needed is recorded.

### The toolchain declaration

The repository names its own toolchain, so a clean checkout is entitled to assume the same resolution on any machine. Today it names none: a yarn v1 lockfile, a v1 hoisted `node_modules`, and an ambient yarn of 4.17.1 whose default linker is not the one this repository's tooling reads.

The repository migrates to yarn 4 rather than pinning yarn 1 (story decision of 2026-07-30). What the migration breaks may be removed rather than repaired.

```jsonc
// root package.json
"packageManager": "yarn@4.17.1",
"engines": { "node": ">=22 <23" }
```

```yaml
# .yarnrc.yml — new file at the repository root
nodeLinker: node-modules
```

- `packageManager` is what corepack reads, and what Vercel reads. It is the single statement that decides which yarn runs, on the developer's machine and on the build agent alike.
- `nodeLinker: node-modules` keeps the on-disk layout that `tsc`, `next build` and vitest already assume. Yarn 4's default is Plug'n'Play, which would need per-tool support this repository has not established; the linker is therefore part of the declaration, not a default to inherit.
- `engines.node` states Node 22, the major in use. `.nvmrc` carries the same statement for humans.
- `yarn.lock` is regenerated in the yarn 4 format. The v1 lockfile is replaced, not hand-migrated: it is an artefact of the resolver being replaced.
- `.gitignore` gains the yarn 4 working files (`.yarn/*` with `.yarn/patches`, `.yarn/plugins`, `.yarn/releases` kept, and `.pnp.*`). No zero-install: the cache stays out of git.

### The script surface

Root and workspace scripts are an interface — they are what a contributor, the epic's next story and the build agent all call.

- `prebuild: "yarn install --production=false"`, present in `pyramids-helpers`, `pyramids-themes`, `pyramids-layouts`, `pyramids-links`, `pyramids-ctas`, `pyramids-design-system` and `imagine`, is removed. Yarn 4's `install` accepts no `--production` option and fails on an unknown one, so every one of these scripts breaks the build chain under the declared package manager. Nothing is lost: `build:deps` runs after a single root install.
- `build:race` is removed. It invokes `yarn workspace @robusta/race`, a workspace that does not exist.
- `build:deps`, `build:robusta`, `build:dakar`, `clean`, `clean:install`, the `w:*` watchers and `dev:*` keep their names and their meaning. `build:deps` already carries the order the design system merge established: helpers → themes → design-system → layouts → links → ctas.

### Workspace cross-references

Every reference from one workspace of this monorepo to another states the workspace protocol — `"@robusta/pyramids-helpers": "workspace:*"` in place of `"1.0.0"` or `"*"`. These packages are private and published nowhere, so an intra-monorepo edge that the resolver could answer from the registry is an edge that can fail on a clean checkout with a 404 rather than resolve locally. The protocol removes the ambiguity instead of relying on transparent workspace resolution staying enabled.

### The green set

What must build green from a clean checkout, in this order:

1. `yarn install` at the root — every workspace carrying a manifest resolves and installs.
2. `yarn build:deps` — the six shared packages.
3. `yarn build:dakar`.
4. `yarn build:robusta`.

`apps/robusta-build` joins the set at step 5 the day `bootstrap-robusta-build` creates it.

Inside the set but install-only, never built by it: `packages/imagine`, `packages/scribe-intel`, `services/scribe-intel-collector`. They carry manifests, so a clean install must resolve them; the epic decision of 2026-07-29 keeps the telemetry path dormant and off the v2 chain, and `packages/imagine` scripts are never run automatically because each call costs paid tokens.

Outside the set entirely, and outside yarn's view: `apps/robusta-design` and `apps/intel-demo` carry no `package.json` at all, so despite the `apps/*` glob they are not workspaces — nothing installs or builds them. `services/scribe-intel-backend` is a docker-compose stack with no manifest, same situation.

The sequence is written down, not merely performed. There is no CI, so a claim that is only executed once decays from the day it is made.

## Technical Constraints

- Node 22.18.0, with corepack activating the yarn version `packageManager` names. Nothing in the repository may assume a globally installed yarn.
- Yarn 4.17.1 with the `node-modules` linker. Consequences that constrain implementation: unknown CLI options are errors rather than warnings, peer dependencies are resolved and reported rather than ignored as they were under v1, and `resolutions` is honoured only in the root workspace — `packages/scribe-intel` declares one on `@types/hapi__shot`, which has never had effect and gains none here.
- React 19.1.1 stable and Next 15 App Router with React Server Components. Both apps stay on their own Next: 15.1.8 for `apps/robusta`, 15.5.3 for `apps/dakar`.
- `styled-jsx` is a transitive dependency of Next that nobody here declares. It is the site of the crash and not its cause; nothing is done to it.
- `@types/react: "^18"` sits next to React 19 in every workspace. It type-checks today, and declaring `next` brings Next's own React types into the resolution, which may surface the mismatch. If it does, the bounded move is to bump the types in the workspaces that fail — see Open Question 2.
- `packages/imagine` depends on Puppeteer 21, whose install step downloads a browser. A clean install therefore costs network and disk beyond the registry, on the build agent too — see Open Question 1.
- Local TypeScript imports keep their `.js` extension. Nothing in this design touches that rule, and a non-conforming import is flagged, never silently rewritten.
- `eslint.ignoreDuringBuilds: true` in both apps: a green build says nothing about lint, and this design makes no lint claim.
- The full clean-checkout verification runs in minutes. It is a per-story gate, not a per-save one.

## Requirements

R-UNBLOCKBUILD-1 through 11 come from the brainstorm. Those marked restated changed because the yarn 4 arbitration and the design-system merge landed after it was written; the rest carry over verbatim.

- R-UNBLOCKBUILD-1: A shared package declares in its own manifest every external framework its sources import.
- R-UNBLOCKBUILD-2: A shared package declares a framework it borrows from its host site as a peer, never as a bundled dependency, so the host's copy is the one that runs.
- R-UNBLOCKBUILD-3: A peer range declared by a shared package admits every version its host sites run today.
- R-UNBLOCKBUILD-4: Exactly one copy of React resolves inside a site's render graph.
- R-UNBLOCKBUILD-5: No shared package pins a release candidate as the version of a runtime dependency.
- R-UNBLOCKBUILD-6: The repository declares the package manager version, the node linker and the Node major it installs with; resolution does not depend on what the machine happens to carry. Restated — the brainstorm named the package manager and the Node major only, and the migration to yarn 4 makes the linker part of the declaration rather than a default to inherit. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-7: The set of workspaces that must build green from a clean checkout is named, and what falls outside it is named too. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-8: `apps/dakar` builds and renders unchanged: it is live and outside the v2 scope.
- R-UNBLOCKBUILD-9: The cause of the static-generation crash is recorded in the architecture notes in terms a reader can act on, whether or not the v1 site is repaired.
- R-UNBLOCKBUILD-10: Verification runs from a state the repository can produce on its own — never from an existing `node_modules`. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-11: A correction applied to the shared packages reaches all six of them, `pyramids-design-system` included. Restated — the brainstorm described the sixth package as existing only on `feat/packagify-design-system`; it has been on `dev` since `c0f98fe`, so the sweep is a single pass with no branch clause.
- R-UNBLOCKBUILD-12: A workspace script the declared package manager cannot run is removed rather than adapted.
- R-UNBLOCKBUILD-13: The lockfile the repository commits is the one its declared package manager produces, and a clean install leaves it unchanged. Realizes BR-PYRAMID-5.
- R-UNBLOCKBUILD-14: Every workspace carrying a manifest installs under the declared toolchain, including those the green set never builds.
- R-UNBLOCKBUILD-15: A reference from one workspace of this monorepo to another states the workspace protocol, so no intra-monorepo edge can be answered by the registry.

## Acceptance Criteria

Characters: Arabica, the builder of the v2 site, working on the machine where the install happens to work. Excelsa, the build agent, which starts from a clean checkout every time and has no memory of a previous install. Bourbon, a newcomer cloning the repository on a machine whose ambient yarn is 4.x.

- AC-UNBLOCKBUILD-01: Given Arabica in a fresh worktree with its own install and no Next hoisted at the root, when she runs `yarn build:deps`, then `pyramids-links` and `pyramids-ctas` compile against their own declared `next` and every package builds (R-1, R-2).
- AC-UNBLOCKBUILD-02: Given Excelsa installing `apps/robusta` on Next 15.1.8 and `apps/dakar` on Next 15.5.3, when the install completes, then neither host reports an unmet peer for `next` or for `react` (R-3).
- AC-UNBLOCKBUILD-03: Given a host site on a Next version outside the declared peer range, when it installs, then the mismatch is reported as an unmet peer instead of surfacing at build time (R-3).
- AC-UNBLOCKBUILD-04: Given Arabica reading any of the six shared package manifests, when she looks at `dependencies`, then neither `react` nor `next` appears there (R-2, R-11).
- AC-UNBLOCKBUILD-21: Given Excelsa on a clean install, when the React copies resolved under `apps/robusta` are enumerated, then exactly one is found and none is nested under `styled-jsx` (R-4).
- AC-UNBLOCKBUILD-22: Given Excelsa on a clean install, when `next build` runs in `apps/robusta`, then the prerender of `/_error` and `/500` completes and the build exits 0 (R-4).
- AC-UNBLOCKBUILD-23: Given Excelsa on a clean install, when `next build` runs in `apps/dakar`, then it completes exactly as it does today (R-8).
- AC-UNBLOCKBUILD-24: Given Arabica reading the six shared packages and `apps/robusta`, when she reads every version they state for React, then all state 19.1.1 and none is a release candidate (R-5, R-11).
- AC-UNBLOCKBUILD-41: Given Bourbon on a machine whose ambient yarn is 4.x with Plug'n'Play defaults, when he clones and runs the repository's install, then the yarn version the repository names is the one that runs and the layout the repository names is the one produced (R-6).
- AC-UNBLOCKBUILD-42: Given Bourbon after a clean install, when he runs `git status`, then `yarn.lock` shows no change (R-13, BR-PYRAMID-5).
- AC-UNBLOCKBUILD-43: Given a machine on a Node major outside the declared range, when install runs, then it says so rather than producing a subtly different graph (R-6).
- AC-UNBLOCKBUILD-44: Given the declared package manager, when any script of the green set runs, then none invokes an option that package manager does not accept (R-12).
- AC-UNBLOCKBUILD-45: Given Excelsa on a clean checkout, when the root install runs, then every workspace carrying a manifest resolves, including `imagine`, `scribe-intel` and `scribe-intel-collector`, and no intra-monorepo reference is looked up in the registry (R-14, R-15).
- AC-UNBLOCKBUILD-61: Given Excelsa on a fresh clone, when the documented verification sequence runs end to end, then every workspace of the green set builds and no manual step is needed (R-7, R-10, BR-PYRAMID-5).
- AC-UNBLOCKBUILD-62: Given a workspace outside the green set, when the verification runs, then it is not built, and whether it installs at all is stated in the record rather than left to be discovered (R-7).
- AC-UNBLOCKBUILD-63: Given a reader who meets `Next.js build worker exited with code: 1` on another app, when they read the Notes / Gotchas of `root.archi.md`, then they find the duplicate-React mechanism and learn that the message hides the prerender error that carries the real cause (R-9).

## Dependencies

- Depends on: merge-design-system, landed on `dev` as `c0f98fe`. The sixth shared package is on `dev`, so the sweep has no branch clause.
- Blocks: `bootstrap-robusta-build`, which cannot be verified end to end until a clean checkout builds.

## Decisions

- 2026-07-31 — `Clean checkout` enters `ubiquitous-language.md`: a checkout carrying no installed dependency and no build output anywhere in its ancestry; a git worktree beside an installed repository is not one. Pourquoi : lgtm on the proposition of Gap 2, applied by `bulkman resolve` as delegated registrar — BR-PYRAMID-5 is recorded on the term, and a registered rule whose central term has no definition cannot be verified the same way twice. The vocabulary test of BR-PYRAMID-5 is met from this point.
- 2026-07-31 — `Green set` enters `ubiquitous-language.md`: the named collection of workspaces that must build from a clean checkout, being the build chain plus every site the repository claims to ship. Pourquoi : lgtm on the proposition of Gap 3, applied in the same registrar pass — without a name, "the build chain works" stays an impression; with one, R-UNBLOCKBUILD-7 states exactly what was and was not verified. Impact : this supplies the definition Gap 1 of `pyramid-v2.epic.md` asked for and left blank, so epicman can fold that entry.

## Open Questions & Gaps

### Gaps

- Gap 1: the story's Documentation updates plan covers `root.archi.md` Notes / Gotchas and the Dependencies sections of `links.archi.md` and `ctas.archi.md`, but the toolchain declaration falsifies statements in three places the plan does not name — the Dependencies section of `root.archi.md` ("Build: yarn 1 workspaces"), the Getting started section of `README.md`, and the install and build command reference of `CLAUDE.md`.
- Proposition: storyman adds those three locations to the Documentation updates plan, each with its why, so docman corrects them in the same pass.
- Rationale: a design doc never writes into a story, and a doc plan that misses the files contradicted by the change leaves the repository describing a package manager it no longer uses.
- Resolution:

### Open Questions

- Open Question 1: `packages/imagine` depends on Puppeteer 21, whose install step downloads a browser on every clean install — including on the build agent, which is precisely the consumer BR-PYRAMID-5 protects.
- Proposition: keep the workspace and suppress the download at install time through the environment variable Puppeteer reads, leaving the scripts runnable for whoever explicitly wants the browser.
- Rationale: the download costs minutes and hundreds of megabytes on a build that never uses it, and removing the workspace outright — which the migration's "delete what is not useful" clause would permit — loses a working image-generation tool to save a configuration line.
- Resolution:

- Open Question 2: `@types/react: "^18"` sits next to React 19 in every workspace. The brainstorm scoped the mismatch out as a separate sweep, and declaring `next` pulls Next's own React types into the resolution, which may make it fail here.
- Proposition: bump the types to `^19` only in the workspaces whose type-check actually fails, and leave the repository-wide sweep to its own chore.
- Rationale: the story's diff is meant to be declarations, and a type bump in a workspace that already compiles buys nothing while widening what has to be re-verified.
- Resolution:
