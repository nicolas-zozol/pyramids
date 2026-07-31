# Questions & Decisions: unblock-build

**Date:** 2026-07-30
**Status:** In Progress
**Branch:** dev (no feature branch created — see Q1)

> This file logs all decisions made autonomously by Claude during the boss run.
> Review these after implementation. If you disagree with a choice, ask Claude to redo that part.

---

## Task Selection

Chosen: unblock-build
Source: `features/pyramid-v2-epic/unblock-build/unblock-build.story.md`, passed explicitly by the user.

Pipeline steps skipped as instructed: story (already ACTIVE and carrying five binding dated decisions) and brainstorm (`unblock-build.brainstorm.md` exists, its Open Questions were arbitrated and purged yesterday). The run starts at the design step and stops before the commit.

---

## Q1: Work on `dev` or cut a `feat/unblock-build` branch?

Phase: Pre-flight
Chosen: stay on `dev`, create no branch | Confidence: High

Rationale:
The boss protocol normally cuts `feat/<feature>` in Phase 2, and its protected-branch guard covers `{main, master, develop}` — `dev` is not literally in that set, so the guard does not fire. But the guard exists to stop the boss committing onto a shared branch, and this run is forbidden from committing at all. Creating a branch without a commit only relocates HEAD: every change stays in the same working tree either way, so the branch buys no isolation. It would however move the human onto a branch he did not ask for, right before he commits by hand, with unrelated in-flight work already in the tree (`M CLAUDE.md`, `M README.md`, `M pyramid-v2.epic.md` and eight untracked feature directories). The story's own decision of 2026-07-30 also assumes this work lands where `merge-design-system` landed, which is `dev` (`c0f98fe`).

Alternatives:
- `git checkout -B feat/unblock-build` — Pros: matches the boss pipeline literally; a later commit lands off `dev`. Cons: no isolation without a commit, and it silently moves the human's HEAD.
- Relaunch under `wk` (worktree isolation) — Pros: true isolation. Cons: the boss never creates worktrees, that is the caller's decision, and a worktree cannot receive the uncommitted design-system state the story depends on.

Impact if wrong: Low — `git switch -c feat/unblock-build` at commit time reproduces the alternative exactly, with nothing lost.

`✅ SAFE`

---

## Q2: Nothing was stashed, and the pre-existing dirty tree was left alone

Phase: Pre-flight
Chosen: touch only the files this story owns | Confidence: High

Rationale:
The tree was already dirty at launch: `CLAUDE.md`, `README.md` and `pyramid-v2.epic.md` modified, plus `ROADMAP.md`, `business-rules.md`, `root.archi.md`, `ubiquitous-language.md` and eight feature directories untracked. None of it belongs to this story. It was neither stashed nor staged nor reverted.

Impact if wrong: Low — nothing was destroyed.

`✅ SAFE`

---

## Q3: The v1 lockfile was migrated in place, not deleted and re-resolved

Phase: Implementation
Chosen: leave `yarn.lock` where it was and let yarn 4 import it | Confidence: High

Rationale:
The design doc says the lockfile "is regenerated in the yarn 4 format" and "replaced, not hand-migrated". Read literally that could mean deleting the file and letting yarn resolve every range from scratch. That was not done, and doing it would have broken R-UNBLOCKBUILD-8. Almost every range in this repository is a caret, so a from-scratch resolution re-resolves the entire tree to today's latest — including `apps/dakar`, a live site the story forbids moving. Yarn 4 imports a classic lockfile on its own (`YN0087: Migrated your project to the latest Yarn version`) and keeps every resolution whose range still matches, so only what this story actually changed got re-resolved. The committed file is the one yarn 4 produces, which is what R-UNBLOCKBUILD-13 asks; it just was not produced from nothing.

Evidence this was the right call: the dakar route table after the change is byte-identical to the baseline captured before it — same 23 routes, same page sizes, same First Load JS.

Alternatives:
- `rm yarn.lock && yarn install` — Pros: matches the design's wording literally; no v1 residue. Cons: silently bumps every transitive dependency of the live site, which no acceptance criterion would have caught.

Impact if wrong: Medium — recoverable by deleting the lockfile and reinstalling, but it should be a deliberate upgrade story with its own dakar verification, not a side effect of this one.

`✅ SAFE`

---

## Q4: `enableScripts: true` had to be written back into `.yarnrc.yml`

Phase: Implementation
Chosen: keep `enableScripts: true`, drop the other two entries yarn added | Confidence: Medium

Rationale:
The first `yarn install` rewrote `.yarnrc.yml`, stripped the comments, and added three entries nobody asked for: `enableScripts: true`, `approvedGitRepositories: ["**"]` and `npmMinimalAgeGate: 0`. The last two are supply-chain guards being switched off — `approvedGitRepositories: "**"` permits any git-protocol dependency, and `npmMinimalAgeGate: 0` disables the delay yarn 4.17 imposes on freshly published versions. This repository has no git-protocol dependency, so both were removed and a clean install still succeeds.

`enableScripts` is different. Removing it flipped yarn 4.17's stricter default and the install reported `lists build scripts, but all build scripts have been disabled` for `sharp`, `esbuild`, `@parcel/watcher`, `protobufjs` and `puppeteer`. `sharp` is what Next uses for image optimisation, and `esbuild` is unusable without its native binary, so the entry was written back with a comment saying why.

Alternatives:
- Keep all three as yarn wrote them — Pros: exactly what the migration produced. Cons: silently weakens two supply-chain protections as a side effect of a build-chain story.
- Drop `enableScripts` too and allow-list per package — Pros: tightest. Cons: yarn 4's per-package approval flow is interactive, and the story forbids anything that needs a manual step.

Impact if wrong: Low for the two removed entries — if some future dependency needs them the install says so explicitly. Medium if `enableScripts` were wrong, but the builds are green with it.

`⚠️ REVIEW` — the two removed entries are a security posture choice made autonomously, not something the story settled.

---

## Q5: A second duplicate-copy defect surfaced, in `vite`, and was fixed the same way

Phase: Implementation
Chosen: `apps/robusta` declares `vite` itself, plus `yarn dedupe vite rollup` | Confidence: High

Rationale:
With the React duplicate gone, `next build` of `apps/robusta` stopped crashing at prerender and started failing earlier, at `Checking validity of types`, on `apps/robusta/vite.config.ts`. Same message shape as F6 — `Next.js build worker exited with code: 1` — and the same underlying defect one layer over. `vite.config.ts` gets `defineConfig` from `vitest/config` and `tsconfigPaths` from `vite-tsconfig-paths`, whose peer range is `vite: "*"`. `apps/robusta` declares `vitest` and `vite-tsconfig-paths` but never `vite`, so the plugin bound to whatever vite was hoisted — which was `vite@5.4.18`, pulled to the root by `services/scribe-intel-collector`, while vitest used `vite@6`. The two `Plugin` types are unrelated, so tsc refused.

This is R-UNBLOCKBUILD-1 exactly: a workspace importing something it never declared, resolved by accident of hoisting. Declaring `vite: "^6.1.1"` in `apps/robusta` moved a vite 6 to the root but left `vitest` still nested on `6.1.1` against the root's `6.4.3`, and two vite 6 minors are still unrelated types — so `yarn dedupe vite rollup` collapsed them. One `vite@6.4.3` now serves everything; `vite@5.4.18` sits inside `services/scribe-intel-collector`, the only workspace that declares it, where it bothers nobody.

Alternatives:
- Exclude `vite.config.ts` from the Next type-check — Pros: one line. Cons: hides the defect instead of declaring it, which is the framing the brainstorm rejected for the story as a whole.
- Bump the collector's `vite` from `^5` to `^6` — Pros: removes the root vite 5. Cons: changes a dormant service nothing verifies, to fix a problem that belongs to `apps/robusta`.

Impact if wrong: Low — contained to `apps/robusta`'s devDependencies and the lockfile.

`✅ SAFE`

---

## Q6: Two more undeclared workspace imports were fixed; a third defect was recorded, not fixed

Phase: Implementation
Chosen: declare what is imported, in `layouts`, `ctas` and `scribe-intel` | Confidence: High

Rationale:
Grepping the shared packages for imports and comparing against their manifests turned up three cases beyond the two the story names. `pyramids-layouts` and `pyramids-ctas` both import `@robusta/pyramids-helpers` (`twCss`, `mergeCss`, `twCssAll`) and declared it nowhere — `ctas.archi.md` even documents the dependency the manifest omits. `packages/scribe-intel` imports `@opentelemetry/api` in three files and declared it nowhere; it is now a peer, which is the OpenTelemetry convention for the same reason React is one — the API object is process-wide state and a second copy is a silent no-op. Its `resolutions` field on `@types/hapi__shot` was removed: yarn 4 reports `Resolutions field will be ignored` outside the root workspace, nothing in the sources imports hapi__shot, and the migration's "delete what is not useful" clause covers it.

What was recorded and deliberately not fixed: `packages/scribe-intel` and `services/scribe-intel-collector` do not compile. `tsc` fails on `VisitorHori` not implementing `Visitor` and on `intent.spec.ts` importing a `createIntelInstance` that no longer exists. Those are source-level defects that predate this work — this feature changed zero source files — and both workspaces sit outside the green set, so repairing them is a different story.

Impact if wrong: Low — three added declarations and one removed dead field, none of which changes a resolved version.

`✅ SAFE`

---

## Q7: `apps/robusta` type-checks its own `vite.config.ts` during `next build`

Phase: Implementation
Chosen: leave it that way | Confidence: Medium

Rationale:
It is unusual for a Next build to type-check a vitest config, and it is why Q5's defect was fatal rather than cosmetic. Excluding the file from the app's tsconfig would make the build faster and less brittle. It was left alone because the story forbids widening into `apps/robusta`, and because the file now type-checks correctly — the coupling is real, so making it pass is more honest than making it invisible.

Impact if wrong: Low — a tsconfig `exclude` line whenever someone wants it.

---

## Q8: The pipeline overlapped design and implementation

Phase: Process
Chosen: begin the manifest edits while designman was still writing | Confidence: Medium

Rationale:
designman took about six and a half minutes and writes exactly one file, which implementation never touches, so there was no file conflict. The binding inputs — the story's five dated decisions and the brainstorm's diagnosis — were already read and already determined the edits. The design doc was read in full before anything was verified, and it did sharpen the plan in four places that were adopted: a tighter `next` peer bound (`^15.1.8` rather than the `^15.1.0` first planned), `react-dom` as a devDependency of links and ctas, `.nvmrc`, and removing the dead `build:race` script the brainstorm had left out of scope.

Impact if wrong: Low — the design doc and the implementation agree; the differences were adopted, not overridden.

---

## Q9: Implementation ran in this agent rather than in codeman or tddman

Phase: Process
Chosen: keep it in context | Confidence: Medium

Rationale:
The boss pipeline delegates implementation to a coding agent. This work is manifest surgery plus an iterative install-and-build loop where each failure changes the next move, and it ran under two hard prohibitions — never commit, never stash. A subagent that commits or stashes would have violated the run's constraints irreversibly, and the judgement calls in Q4 and Q5 only appear once an install has been run and its output read. Output was kept out of context by logging every build to a file and grepping it.

Impact if wrong: Low — the artefact is the diff and the green build, both verifiable independently of who typed them.

---

## Q10: The design doc was flipped to APPROVED without human validation

Phase: Design
Chosen: APPROVED | Confidence: High

Rationale:
The Code Routine of `CLAUDE.md` has the human validate DRAFT into APPROVED before implementation starts. The boss protocol overrides this for autonomous runs and makes the flip the boss's own act, which is logged here as such. designman wrote DRAFT, as it should.

Impact if wrong: Low — the design doc restates decisions the human already arbitrated on 2026-07-29 and 2026-07-30; it introduced no new commitment beyond the four refinements listed in Q8.

---

## Open questions carried from the design doc, unresolved

These are the design doc's own Gaps and Open Questions. Two were answered by implementation; the rest still need the human and belong in the epic bulk.

- Gap 1 (three doc locations the story's plan misses) — acted on. docman was told to correct `root.archi.md` Dependencies, `README.md` and `CLAUDE.md` alongside the story's plan. The story's own Documentation updates section was not edited: storyman owns it, and `storyman refine` should fold those three locations in.
- Gap 2 ("clean checkout" is absent from `ubiquitous-language.md`) — still open, and it decides what this feature's acceptance means. Verification here ran from a wiped tree: every `node_modules` and every `packages/*/dist` deleted, then `yarn install` from the manifests and the lockfile alone. That is not literally a fresh clone — a clone was impossible, because the changes are uncommitted by instruction and `git clone` only carries commits. For resolution it is equivalent; for anything a clone would carry that this tree does not, it is not.
- Gap 3 ("green set" has no glossary entry) — still open, epicman's call.
- Open Question 1 (Puppeteer downloads a browser on every clean install, via `packages/imagine`) — still open, and now measured: the clean install fetched 894 MiB in total. The design proposed suppressing the download; nothing was done, because suppressing it also disarms `yarn puppets` and the trade-off is the human's.
- Open Question 2 (`@types/react: "^18"` alongside React 19) — answered by implementation. It never surfaced: declaring `next` did not break any type-check, every workspace still compiles with `^18`, and nothing was bumped. The repository-wide sweep remains its own chore.

---

## Outcome

Done. The story's Definition of done is met and verified from a wiped tree: `yarn install`, then `yarn build:deps`, `yarn build:dakar` and `yarn build:robusta`, all green. One React 19.1.1 resolves in the whole repository. `apps/robusta` produces 42/42 static pages, `apps/dakar` 23/23 with a route table identical to the baseline taken before any change. A second `yarn install` leaves `yarn.lock` byte-identical.

Not committed, by instruction. Everything is left in the working tree for the human to commit.
