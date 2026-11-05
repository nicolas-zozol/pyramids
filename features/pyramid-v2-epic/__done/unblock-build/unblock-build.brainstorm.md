# Brainstorm : Unblock the build chain

**Date :** 2026-07-29
**Feature :** unblock-build
**Infix :** UNBLOCKBUILD
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Preamble — what the reconnaissance found

The two failures named by the story were both reproduced during this brainstorm, and the second one was diagnosed to its root. This changes the shape of the story, so it is stated before the axes.

F5 confirmed by reading the manifests: `packages/links/src/standard/{SimpleLink,PageLink,NeutralLink}.tsx` and `packages/links/src/client-link/ClientPageLinkNavigator.tsx` import `next/link` and `next/navigation`; `packages/ctas/src/cta-link/CtaLink.tsx` imports `next/link`. Neither `packages/links/package.json` nor `packages/ctas/package.json` names `next` in any section. No other shared package imports `next/*` — the blast radius is exactly the two packages the story names.

F6 reproduced and diagnosed. `next build` in `apps/robusta` fails identically under the app's own Next 15.1.8 and under the hoisted 15.5.3. The log is not ambiguous:

```
[TypeError: Cannot read properties of null (reading 'useContext')]
Error occurred prerendering page "/500".
    at exports.useContext (apps/robusta/node_modules/styled-jsx/node_modules/react/cjs/react.production.js:491:33)
    at StyleRegistry (apps/robusta/node_modules/styled-jsx/dist/index/index.js:450:30)
Export encountered an error on /_error: /500, exiting the build.
...
 ⨯ Next.js build worker exited with code: 1 and signal: null
```

Two React copies live inside `apps/robusta`: the app renders with `19.0.0-rc-66855b96-20241106` (an exact pin), while `styled-jsx` — a transitive dependency of Next — resolves its own nested `react@19.1.1`. `StyleRegistry` calls `useContext` on the React that is not driving the render, gets a null dispatcher, and the prerender of `/500` throws. Next reports that as a worker exit, which is why the message says nothing useful.

The repair direction was verified experimentally: moving `apps/robusta/node_modules/styled-jsx/node_modules` aside and rebuilding gives exit 0 and 42/42 static pages. The nested copy was then restored; the working tree is untouched.

Where the cause sits matters for the story's own decision of 2026-07-29 ("repair only if the cause sits in the shared base"). It sits in the shared base. All five `pyramids-*` packages declare `"react": "^19.0.0-rc-66855b96-20241106"`, and `packages/robusta-design-system` on `feat/packagify-design-system` declares the same release candidate as both dependency and peer. A caret over a release candidate admits any stable 19.x, so the resolver is free to pick a different React per subtree — which is exactly what it did. The v2 site inherits the trap the day it copies a manifest.

A third defect surfaced, which the story does not name but its Definition of Done requires. The repository pins no package manager and no Node version: `yarn.lock` is a v1 lockfile, `node_modules` is a v1 hoisted layout, and the ambient yarn on this machine is 4.17.1 with `nodeLinker: pnp`. A fresh clone that runs `yarn install` does not reproduce the working install; it produces a different one.

---

## Requirements

BR-PYRAMID-2 as registered in `business-rules.md` — "We embrace the constraints of Vercel, React Server Component and shadcn" — is the business warrant for the React requirements below: a site that accepts the React Server Component model cannot also carry two Reacts. The registry and the epic state that rule differently, which is Gap 1.

- R-UNBLOCKBUILD-1 — A shared package declares in its own manifest every external framework its sources import.
- R-UNBLOCKBUILD-2 — A shared package declares a framework it borrows from its host site as a peer, never as a bundled dependency, so the host's copy is the one that runs.
- R-UNBLOCKBUILD-3 — A peer range declared by a shared package admits every version its host sites run today.
- R-UNBLOCKBUILD-4 — Exactly one copy of React resolves inside a site's render graph.
- R-UNBLOCKBUILD-5 — No shared package pins a release candidate as the version of a runtime dependency.
- R-UNBLOCKBUILD-6 — The repository states the package manager version and the Node major it is installed with; resolution does not depend on what the machine happens to carry.
- R-UNBLOCKBUILD-7 — The set of workspaces that must build green from a clean checkout is named, and what falls outside it is named too.
- R-UNBLOCKBUILD-8 — `apps/dakar` builds and renders unchanged: it is live and outside the v2 scope.
- R-UNBLOCKBUILD-9 — The cause of the static-generation crash is recorded in the architecture notes in terms a reader can act on, whether or not the v1 site is repaired.
- R-UNBLOCKBUILD-10 — Verification runs from a state the repository can produce on its own — a fresh clone or a fresh worktree with its own install — never from an existing `node_modules`.
- R-UNBLOCKBUILD-11 — A correction applied to the shared packages reaches every shared package, including the one that exists only on `feat/packagify-design-system`.

---

## 1. Product Role

The deliverable is a repaired dependency contract for the monorepo, not a feature and not a site. Its output is three manifest-level corrections, one recorded diagnosis, and a named build set that a machine starting from nothing can turn green.

What it is not: a refactor of `apps/robusta`, a Next.js upgrade programme, the DaisyUI-to-shadcn migration the epic decided elsewhere, a CI pipeline, or the retirement of any workspace.

**Décision (autonome):** The story is framed as "the dependency graph becomes declared instead of discovered" rather than "two bugs get patched".

**Rationale:** F5 and F6 are the same defect seen twice — a package importing what it never declared, and packages declaring a range so loose that the resolver decides for them — so a framing that fixes only the two named symptoms leaves the third defect (the unpinned package manager) standing and the Definition of Done unmet.

---

## 2. Target Audience

Two consumers, and the second one is the reason this story exists.

The builder of the v2 site: one developer, high maturity on this codebase, currently working on a machine where the install happens to work. This persona never hits F5 or F6 in daily work, which is precisely why both stayed latent for months.

The Vercel build agent: a machine that starts from a clean checkout every single time, has no memory of a previous install, and reports failure as a build log. It is the only consumer guaranteed to hit all three defects, and it is the consumer `bootstrap-robusta-build` needs to satisfy ("the shell is served from a deployed URL").

A third, occasional: a git worktree, which shares `.git` but not `node_modules` — the exact context in which F5 was first observed.

**Décision (autonome):** The acceptance target is the machine that starts from nothing, not the developer's tree.

**Rationale:** Every one of these failures is invisible on an established install, so any verification run on the current `node_modules` proves nothing.

---

## 3. Core Problem

The monorepo's dependency graph is discovered by yarn's hoisting rather than declared by its manifests. Three consequences, all latent until a clean state exposes them:

- `pyramids-links` and `pyramids-ctas` compile only because some app's Next was hoisted high enough to be found by accident.
- Five shared packages pin React as a caret over a release candidate, which lets the resolver place different React copies in different subtrees; `apps/robusta` ends up with two, and its build dies in `styled-jsx`.
- The repository names no package manager, so "yarn install" means whatever the machine's yarn is — v1 hoisting on the author's setup, v4 with PnP on a corepack-enabled one.

**Options considérées:**
- Treat the two failures as independent bugs and patch each — smallest diff, but leaves the third defect and the same class of failure free to return.
- Treat the resolution graph itself as the defect — slightly wider, and it is the only framing under which the Definition of Done ("no manual step, and without depending on which app's Next version happened to be hoisted") can be met.

**Décision (autonome):** The problem is the undeclared resolution graph, and the fix is to declare it.

**Rationale:** The story's own Definition of Done already forbids depending on what happened to be hoisted, which is a statement about the graph and not about two bugs.

---

## 4. Unique Value Proposition

The alternative on the table was to skip this story and start `bootstrap-robusta-build`, letting the new site outrun a dying one. Three findings kill that option.

The React release candidate is pinned in the shared packages and in the design-system package, so `apps/robusta-build` inherits the F6 trap the moment it declares its dependencies the way every existing workspace does. It would then be diagnosed as a bug in the new site.

`pyramids-links` and `pyramids-ctas` are shared-base packages the v2 site consumes on day one; their undeclared `next` breaks `build:deps`, which sits upstream of every site build.

Without a pinned package manager, "the shell builds green on Vercel" is unprovable from the repository alone.

**Décision (autonome):** This story runs before `bootstrap-robusta-build`, and its value is stated as protecting the v2 site rather than as repairing the v1 one.

**Rationale:** Every defect found is inherited by the new site, so the work is v2 investment that happens to repair v1 as a side effect.

---

## 5. Functional Scope

In scope:

- `next` declared by `pyramids-links` and `pyramids-ctas`, as a peer for the host contract and as a dev dependency for their own `tsc`.
- React aligned so exactly one copy resolves per site: the release-candidate pin leaves the five `pyramids-*` packages and `apps/robusta`.
- The package manager and the Node major pinned by the repository.
- The green set named, and the clean-checkout verification sequence written down.
- The diagnosis of the static-generation crash recorded in `root.archi.md`, replacing the "known latent build issues" note.
- The Dependencies sections of `links.archi.md` and `ctas.archi.md` checked against what the manifests now actually say — both already claim `next` as a peer, and both say "react (19 RC)", which stops being true.

Out of scope:

- Aligning Next across apps. `apps/dakar` stays on 15.5.3, `apps/robusta` on 15.1.8 (decision of 2026-07-29 in the story).
- Any change to `apps/robusta` source code. Only its manifest is touched.
- The DaisyUI-to-shadcn migration, arbitrated at epic level.
- `apps/robusta-design`, `apps/intel-demo`, `services/*` — none is on the v2 path.
- `@types/react: ^18` declared next to React 19 across every workspace. It type-checks today; correcting it is a separate sweep.
- The dead `build:race` root script, which invokes a workspace `@robusta/race` that does not exist. A one-line chore, not this story.
- CI. Nothing in the Definition of Done asks for automation.

**Décision (autonome):** The story touches manifests, root scripts and two architecture documents, and no application source file.

**Rationale:** Every defect found is a declaration defect, so a source change would be a sign the diagnosis was wrong.

---

## 6. Core Features

### Feature: Declared framework dependency

**Capability:** `pyramids-links` and `pyramids-ctas` name `next` in their own manifests — as a peer dependency, so the host site's Next is the one that runs, and as a dev dependency, so their `tsc` resolves `next/link` and `next/navigation` without borrowing from a sibling.

The peer range must admit both host sites: `apps/robusta` on 15.1.8 and `apps/dakar` on 15.5.3. The story's clause "use a recent version of Next" is read as applying to what the package builds against, not to what it constrains its hosts to — a narrow peer range would break the live site, which R-UNBLOCKBUILD-8 forbids.

**Acceptance Criteria:**
- Given a fresh worktree with its own install, When `yarn build:deps` runs, Then every package compiles, including `pyramids-links` and `pyramids-ctas`.
- Given no Next is hoisted to the root at all, When `pyramids-links` compiles, Then it still resolves `next/link` from its own declared dev dependency.
- Given `apps/dakar` on Next 15.5.3 and `apps/robusta` on Next 15.1.8, When either installs, Then no unmet-peer warning is emitted for `next`.
- Given a host site on a Next major the package does not support, When it installs, Then the mismatch is reported as an unmet peer rather than discovered at build time.

**Test Approach:** Install and `build:deps` in a throwaway git worktree, which is the context where F5 was first seen; plus a manifest assertion that every `next/*` import in `packages/*/src` has a matching declaration.

---

### Feature: One React per site

**Capability:** The React release candidate leaves the shared packages and `apps/robusta`, so no subtree can resolve a second React copy. The target is React 19.1.1 — already the version hoisted at the root and the one `apps/dakar` runs, so the live site moves nowhere.

**Acceptance Criteria:**
- Given a clean install, When the React copies under `apps/robusta` are enumerated, Then exactly one is found and nothing is nested under `styled-jsx`.
- Given a clean install, When `next build` runs in `apps/robusta`, Then the export of `/_error` and `/500` completes and the build exits 0.
- Given a clean install, When `next build` runs in `apps/dakar`, Then it completes exactly as it does today.
- Given a shared package manifest, When its dependency versions are read, Then none is a release candidate.

**Test Approach:** Full `next build` of both sites from a clean install, plus an enumeration of resolved React copies per app. The negative control is already established: with the duplicate present the build dies at `/500`; with it removed it produced 42/42 static pages.

---

### Feature: Pinned toolchain

**Capability:** The repository declares which package manager version and which Node major it installs with, so a clean checkout resolves the same graph on any machine. Today it declares neither, while carrying a yarn 1 lockfile that an ambient yarn 4 would migrate to a different linker.

**Acceptance Criteria:**
- Given a machine whose default yarn is 4.x, When a fresh clone runs the repository's install command, Then the yarn the repository names is used and the v1 lockfile is honoured.
- Given a fresh clone, When install completes, Then `yarn.lock` shows no change in `git status`.
- Given an unsupported Node major, When install runs, Then it says so rather than producing a subtly different graph.

**Test Approach:** Clone into a scratch directory on this machine — where the ambient yarn is 4.17.1 with PnP defaults — install, and check the lockfile is untouched and `build:deps` is green.

---

### Feature: The named green set

**Capability:** The repository states which workspaces must build green from a clean checkout, so "the build chain works" becomes a checkable claim instead of an impression. Proposed set: `build:deps`, then `apps/dakar` and `apps/robusta`, with `apps/robusta-build` joining once it exists. Outside the set: `apps/robusta-design` (v0 prototype, awaiting retirement), `apps/intel-demo` (Vite demo, not a site), `services/*` (dormant, and out of the v2 chain by the epic decision of 2026-07-29).

**Acceptance Criteria:**
- Given a fresh clone, When the documented verification sequence is run end to end, Then every workspace of the green set builds and no manual step is needed.
- Given a workspace outside the green set that does not build, When the verification runs, Then it is not consulted and its state is documented rather than silently ignored.

**Test Approach:** One documented sequence of commands, run once from a scratch clone, its output kept as the evidence for the Definition of Done.

---

### Feature: The recorded diagnosis

**Capability:** `root.archi.md` stops describing two latent failures and instead carries what they were: the rule that a package importing `next/*` declares it, and the duplicate-React mechanism behind the worker crash — including that "Next.js build worker exited with code: 1" is a message that hides its own cause, and that the real line is the prerender error on `/500`.

**Acceptance Criteria:**
- Given the Notes / Gotchas of `root.archi.md`, When they are read after the story lands, Then no entry describes either failure as latent and the crash mechanism is stated.
- Given `links.archi.md` and `ctas.archi.md`, When their Dependencies sections are read, Then "react (19 RC)" no longer appears and the `next` peer claim matches the manifest.
- Given a reader who meets the same worker-exit message on another app, When they read the gotcha, Then they know to look for a duplicate React before anything else.

**Test Approach:** Documentation review against the manifests, run by docman from the story's Documentation updates plan.

---

## 7. Critical Edge Cases

- The merge ordering. `packages/robusta-design-system` on `feat/packagify-design-system` pins the same React release candidate as dependency and peer. If unblock-build lands before merge-design-system, the merge reintroduces the defect this story just removed. The story asserts the two can land in any order; that assertion is now false. See Gap 2.
- A peer range too narrow for `apps/dakar`. Declaring `next` as `^15.5.0` would leave `apps/robusta` unmet and could push a second Next into a subtree — the same class of failure as F6, this time with Next. The range must cover both installed versions.
- `apps/robusta` on stable React. The verified experiment proved the duplicate is the cause; it ran with the release candidate as the surviving copy, so React 19.1.1 under the v1 app remains unverified. See Open Question 2.
- `@types/react: ^18` alongside React 19 in every workspace. It currently type-checks, but declaring `next` brings Next's own React types into the resolution and could surface the mismatch. If it does, the minimal move is to bump the types, not to widen the story.
- `apps/robusta/src/logic/posts.ts` imports `PageRoute` from `next/dist/server/dev/turbopack/types` — a private Next internal, in a file the v2 content pipeline is meant to learn from. It survives today; it is a v1-only fragility and belongs in the record, not in this story's diff.
- A fresh worktree and a fresh clone are not the same test. A worktree shares `.git` and exposes F5 and F6; only a clone exposes the toolchain defect, because only a clone starts without a `node_modules` anywhere in the ancestry.
- yarn 1 `resolutions` as a shortcut. It would force a single React in one line without touching six manifests. It is rejected as the primary fix: it hides the wrong declarations instead of correcting them, and the v2 site would still copy a release-candidate pin. It stays available as a fallback if aligning versions proves impossible.
- The v1 build emits `No route, 404` for two article paths that `generateStaticParams` produced. Pre-existing, unrelated to the crash, and it belongs to `migrate-learn-content` rather than here — but it is a signal the v1 content pipeline disagrees with itself, which is exactly what `content-source` is chartered to measure.

---

## 8. Non-Functional Constraints

- No regression on `apps/dakar`. It is a live site outside v2 scope; a broken dakar build is a production incident, not a story defect.
- Determinism. `yarn.lock` must stay unchanged by a clean install, otherwise the pinned toolchain has not achieved anything.
- Runtime weight unchanged. Moving `next` to a peer declaration keeps it out of the packages' shipped closure; a plain dependency would risk a second Next reaching a site.
- Build duration. The full clean-checkout verification is minutes, not seconds. It is a per-story gate, not something to run on every save.
- No security or compliance surface. No secret, no data, no user-facing behaviour is touched.
- Offline-hostile by nature. A clean install needs the registry; this is inherent and not worth engineering around.

**Décision (autonome):** The only hard non-functional gate is "dakar unchanged"; everything else is verified once and recorded.

**Rationale:** The story has one irreversible risk — the live site — and the rest is a repository whose failures are already visible.

---

## 9. External Dependencies

- Next.js 15 — 15.1.8 in `apps/robusta`, 15.5.3 in `apps/dakar`, deliberately unaligned by the story's decision of 2026-07-29.
- React 19 — the release candidate `19.0.0-rc-66855b96-20241106` across six packages and `apps/robusta`, stable 19.1.1 in `apps/dakar` and at the hoisted root. The version this story converges on.
- `styled-jsx` — a transitive dependency of Next, never declared by anyone here, and the exact site of the crash. Nothing is done to it; it stops failing once one React resolves.
- yarn 1 workspaces — the install model the lockfile and the hoisted layout encode. Ambient yarn on the author's machine is 4.17.1, which is the conflict.
- Node — 22.18.0 in use, declared nowhere.
- Vercel — the deployment target whose clean-checkout builds are what this story ultimately protects.

**Décision (autonome):** No dependency is upgraded beyond what a single React copy requires.

**Rationale:** An upgrade is a story of its own, and this one already touches the manifest of a live-adjacent workspace.

---

## 10. Major Risks

- React 19.1.1 changes v1 rendering. Likelihood low, impact contained: `apps/robusta` is a thrash the epic retires. Mitigation: the acceptance is a green build; a visual regression on v1 is recorded, not chased.
- The design-system merge reintroduces the release-candidate pin. Likelihood high if ordering is not settled, impact medium — the defect returns silently and is next seen on the v2 site. Mitigation: Gap 2.
- yarn 1 is a dead end. Pinning it buys reproducibility today and postpones a migration that grows more expensive as workspaces multiply. Mitigation: Open Question 1 states the choice rather than making it silently.
- Scope creep into `apps/robusta`. Having the diagnosis makes the repair tempting to widen. Mitigation: the scope axis forbids any source change; a source-level cause would be a signal to stop and record instead.
- Over-fixing a retired app. The counter-argument is that the fix costs one manifest line and protects the v2 site, which is cheaper than writing down why it was skipped.
- The verification is run once and rots. There is no CI, so the clean-checkout claim decays from the day it is made. Accepted here — automation is not in the Definition of Done — but it is the reason the verification sequence must be written down rather than merely performed.

---

## Next Steps

1. Arbitrate Gap 2 first — it decides whether this story runs before or after merge-design-system, and nothing else can be sequenced until it is settled.
2. Run designman on this story: the interfaces at stake are six package manifests, the root scripts and the peer contract between the shared packages and their host sites.
3. Fold Gap 1 to epicman, which owns both the epic and the registry.
4. Carry the F6 diagnosis into the story's Documentation updates: the `root.archi.md` gotcha it names must now say what the crash was, not that it is unknown.
