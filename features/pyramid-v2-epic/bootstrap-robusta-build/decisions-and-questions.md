# Questions & Decisions: bootstrap-robusta-build

**Date:** 2026-07-31
**Status:** In Progress
**Branch:** dev (no feature branch created — see Q0)

> This file logs all decisions made autonomously by Claude during the boss run.
> Review these after implementation. If you disagree with a choice, ask Claude to
> redo that part.

---

## Task Selection

**Chosen:** bootstrap-robusta-build
**Source:** `features/pyramid-v2-epic/bootstrap-robusta-build/bootstrap-robusta-build.story.md` (Status ACTIVE)
**Pipeline entry point:** design. Story and brainstorm already exist and are not rewritten.

---

## Q0: No feature branch, no commit
**Phase:** Pre-flight
**Chosen:** work in place on `dev`, leave everything uncommitted | **Confidence:** High
**Rationale:** The invocation carries two explicit overrides of the boss pipeline — "Do NOT commit, do NOT push [...] hands the diff back" — and names two files (`ROADMAP.md`, `unblock-build.story.md`) as the human's own, untouched. Creating `feat/bootstrap-robusta-build` without ever committing to it would move the human's HEAD to a branch carrying nothing, which is surprise without benefit: the working tree is identical either way. `dev` is not in the boss guard's protected set `{main, master, develop}`, so the guard does not fire.
**Alternatives:**
- `git checkout -B feat/bootstrap-robusta-build`, no commit — Pros: matches the boss pipeline literally. | Cons: silently relocates the human's HEAD, and the branch holds no commit that would justify it.
**Impact if wrong:** Low — `git checkout -b` after the fact carries the whole uncommitted diff onto a branch at any time.
✅ SAFE

---

## Q1: Entry point of the pipeline — design, not story or brainstorm
**Phase:** Pre-flight
**Chosen:** start at designman, leave the story and the brainstorm untouched | **Confidence:** High
**Rationale:** The story is ACTIVE, carries five dated binding decisions and a Documentation updates plan; the brainstorm carries 19 requirements across 10 axes. Re-running either would overwrite arbitrations the human already made through `bulkman resolve` (the C7 font arbitration in particular). designman received both as sources plus the corrections the baseline had moved on since — yarn 4, React 19.1.1 stable, the design system already merged, unblock-build landed, `@robusta/imagine` gone.
**Alternatives:**
- Re-run bsman on the moved baseline — Pros: the brainstorm's stale facts would be corrected at the source. | Cons: it would rewrite a document whose Open Questions have already been arbitrated and folded into the story; the stale facts are corrected in the design doc instead, which is what implementation reads.
**Impact if wrong:** Low — the brainstorm keeps its historical value and the design doc is the reference the code was written against.
✅ SAFE

---

## Q2: Root script names — `build:robusta-build`, against the naming agent's recommendation
**Phase:** Design
**Chosen:** `build:robusta-build` / `dev:robusta-build` | **Confidence:** Medium
**Rationale:** The naming agent, run in autonomous mode on this exact question, retained `build:robusta.build` / `dev:robusta.build` and its argument is good: the dot turns the trailing word from a second verb into a TLD, so `dev:robusta.build` reads as "dev the site robusta.build" while `dev:robusta-build` reads as "dev robusta build" — two verbs and no site. It grounded the dot in `ubiquitous-language.md`, which defines a Site as "one deployed domain", and verified that yarn 4.17.1 resolves a dotted script key.

I overrode it on one count the naming brief did not weigh: the workspace name is already fixed by a binding decision of the story — `@robusta/robusta-build` in `apps/robusta-build`. A dotted script introduces a third spelling of one thing (directory `robusta-build`, workspace `@robusta/robusta-build`, script `robusta.build`), and every other script in the file maps its suffix to a directory. One spelling everywhere beats a marginal readability gain, and the readability problem is mild where the ambiguity of a third spelling is permanent.

This is the one call in this run I would most readily reverse. Renaming two script keys costs a one-line edit in `package.json` and a line in `CLAUDE.md`.
**Alternatives:**
- `build:robusta.build` / `dev:robusta.build` — Pros: reads as a site rather than as two verbs; survives the retirement of v1 untouched; grounded in the registered definition of Site. | Cons: a third spelling of the same workspace; breaks the suffix-to-directory mapping every other script follows.
- `build:v2` / `dev:v2` — Pros: unambiguous today. | Cons: dead the day v1 is retired, which the story's own decision anticipates.
- `build:site`, `build:main`, `build:rb` — rejected by the naming agent: "site" does not distinguish in a multi-site repo, "main" collides with the git default branch, "rb" is cryptic.
**Impact if wrong:** Low — two script keys and one documentation line.
✅ VALIDATED 2026-07-31 by the human, reviewed against the naming agent's case: "on garde build:robusta-build". One spelling everywhere wins over the marginal readability gain, and the readability problem has a clean exit — the day `apps/robusta` is retired, `build:robusta` frees up and the v2 script can take that name.

---

## Q3: `shadcn init` is not run, but the token bridge is written
**Phase:** Design — arbitration of Open Question 1 of the design doc
**Chosen:** write the alias-only bridge in `globals.css`; install no shadcn toolchain | **Confidence:** High
**Rationale:** The story's binding decision of 2026-07-30 puts the v2 site on Tailwind 4 with shadcn, and the brainstorm makes it an acceptance criterion that a shadcn component added later resolves its background, foreground and primary to design-system values rather than to shadcn's default base colour. designman proposed deferring the whole thing, on the ground that `shadcn init` writes a default oklch palette — a second source of colour, which BR-PYRAMID-6 forbids.

Both halves are right about different things, so I split them. The CLI is not run: no `components.json`, no `cn()`, no `clsx`, no `tailwind-merge`, no Radix, because nothing in the shell merges a class and a dependency the shell does not import is dead weight the next story inherits as an endorsement. The bridge is written, because it carries no value of its own — every name in it resolves to a design-system token — and writing it now is what makes the acceptance criterion checkable today instead of a promise. The first story that adds a shadcn component runs the CLI against a token layer already pointing at the design system, which is the ordering BR-PYRAMID-6 wants.
**Alternatives:**
- Run `shadcn init` here — Pros: the toolchain is ready. | Cons: it writes a literal oklch palette, a second colour source, straight against BR-PYRAMID-6.
- Defer both, as designman proposed — Pros: smallest possible diff. | Cons: the styling-foundation acceptance criterion stays unverifiable, and the first component story has to discover the aliasing direction itself.
**Impact if wrong:** Low — the bridge is one CSS block, deletable in one edit.
✅ SAFE

---

## Q4: `--destructive` is deliberately missing from the bridge
**Phase:** Design
**Chosen:** omit `--destructive` and `--destructive-foreground`, with a comment saying why | **Confidence:** High
**Rationale:** shadcn's token set includes a destructive pair. The design system ships no error colour: `colors_and_type.css` has paper, ink, three brand ramps and their soft/deep variants, and nothing semantic for danger. Aliasing destructive onto, say, `--brand-secondary-deep` would be coining a value at site level, which is exactly what BR-PYRAMID-6 forbids, and it would be invisible — a wrong red nobody notices until a delete button ships. Omitting it means a shadcn component using `bg-destructive` renders with an unresolved variable, which is loud. The comment in `globals.css` sends the next story to the design system rather than to a literal.
**Alternatives:**
- Alias it to an existing brand token — Pros: no visual hole. | Cons: coins a semantic the design system never decided, silently.
**Impact if wrong:** Low — but it is a real gap in the design system, reported below for the epic.
✅ SAFE

---

## Q5: The Google Fonts `@import` is moved, not deleted
**Phase:** Design — arbitration of Open Question 2 of the design doc
**Chosen:** move it to an opt-in `packages/robusta-design-system/fonts.css`, exported as a subpath; the 22 preview files link it | **Confidence:** High
**Rationale:** The story's decision of 2026-07-30 makes this story neutralise the `@import`, and designman's Open Question 2 weighed one consumer — `apps/robusta/src/app/_design-test/page.tsx` — and proposed accepting its degradation. It missed the other 22: every file under `packages/robusta-design-system/preview/` carries `<link rel="stylesheet" href="../colors_and_type.css">`, and the epic's decision of 2026-07-29 fixed the canonical font stack precisely because "the CSS is what renders in `preview/*.html` today [...] so changing it changes a visual already validated by eye". Deleting the `@import` outright would silently break the design system's own validation artefacts, against a decision the epic recorded on purpose.

Moving it costs one small file, one line in the `exports` map, and one `<link>` line per preview. The token stylesheet carries no third-party request either way, which is all the story's decision asked for, and a non-Next consumer keeps a working path — which is what the epic's 2026-04-27 decision ("the CSS must stay valid for non-Next consumers") was protecting.
**Alternatives:**
- Delete the `@import` outright, as designman proposed — Pros: smallest diff, 23 files untouched. | Cons: 22 validated previews silently lose their typography, against a recorded epic decision.
- Leave the `@import` in `colors_and_type.css` — Pros: zero package change. | Cons: the v2 site then carries a render-blocking third-party request on every page, which is the whole point of the story's decision.
**Impact if wrong:** Low — the preview `<link>` lines are mechanical and revert cleanly.
✅ SAFE

---

## Q6: Next stays on 15, React on 19.1.1
**Phase:** Design
**Chosen:** `"next": "^15.5.3"` | **Confidence:** High
**Rationale:** 15.5.3 is already the copy hoisted in the tree (`apps/dakar` states `^15.5.3`, `apps/robusta` pins `15.1.8`), so the new site introduces no second Next major and no second React. Next 16.2.12 is published today and is deliberately not taken: unblock-build's whole diagnosis was that a package holding process-wide state resolving to two copies is what broke the build, and a new major on a new workspace is the most likely way to reproduce it. Moving the repository to Next 16 is a decision about three sites, not a side effect of bootstrapping one.
**Alternatives:**
- `next@^16` — Pros: current major, matches the "never deal with old stuff" stance the story applied to Tailwind. | Cons: a second Next major and a likely second React in a tree that was unbroken four days ago; and the stance was recorded about Tailwind and shadcn, not about Next.
**Impact if wrong:** Medium — a later Next 16 migration covering all three sites. Reported to the epic below.
✅ SAFE

---

## Q7: Documentation exceeds the story's plan on `CLAUDE.md`
**Phase:** Design — arbitration of Gap 2 of the design doc
**Chosen:** also scope the Styling and Telemetry sections of `CLAUDE.md`, beyond the two sections the story's plan names | **Confidence:** Medium
**Rationale:** The story's Documentation updates plan puts the Apps list and the Commands section of `CLAUDE.md` in scope. designman found two further sections of the same file instructing the opposite of this story: Styling mandates DaisyUI semantic tokens for every generated component, against R-BOOTSTRAP-11, and Telemetry asks for `Telemetry.component(...)` at the top of pages and components, against R-BOOTSTRAP-17 and BR-PYRAMID-2. `CLAUDE.md` is read by whoever implements next, so both will be followed unless scoped. Leaving a file that actively instructs a rule violation is worse than exceeding a plan by two paragraphs in a file already in scope.
The story itself is not edited — that is storyman's file. The addition is recorded here for a later `storyman refine`.
**Alternatives:**
- Execute the plan literally and report the contradiction — Pros: strict plan discipline. | Cons: the next agent to open the repo reads a mandate to use DaisyUI on a site whose design doc forbids it.
**Impact if wrong:** Low — a documentation edit, revertible.
✅ VALIDATED 2026-07-31 by the human ("lgtm pour CLAUDE.md"). Delivered: the Styling section now states which rule governs which site — design system alone plus shadcn for the v2 site, DaisyUI for `apps/robusta` and `apps/dakar` — and the Telemetry section opens on the prohibition BR-PYRAMID-2 carries before describing the usage that still holds on the two older sites. The story's Documentation updates plan still names only two sections of `CLAUDE.md`; folding the two extra ones in is for `storyman land`.

---
