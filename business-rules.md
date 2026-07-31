# Business Rules

The durable registry of the constraints the business decides on. A rule is stated with the terms of `ubiquitous-language.md`, says what must hold and never how, and stays independent of any solution.

Registrar: epicman is the sole writer of this file, with `bulkman resolve` acting as delegated registrar for arbitrations settled in a bulk. Other agents cite a rule by its identifier; a missing or contradictory rule becomes an Open Question, never a silent addition here.

Bootstrapped on 2026-07-29 by `/start` from the rules the epic author wrote in  `features/pyramid-v2-epic/pyramid-v2.epic.md`, and confirmed the same day by epicman: the four tests were re-applied to each entry, one entry was routed out, two were reworded.

Numbering: the bootstrap draft carried four entries. Closing the gap left by the routed-out entry, draft 3 and draft 4 became BR-PYRAMID-2 and BR-PYRAMID-3. BR-PYRAMID-1 is the only identifier that had been cited outside this file (`ROADMAP.md`) and it did not move. The identifiers below are final and never change again; only wording may evolve, after human validation.

Reconciled on 2026-07-30 by `bulkman resolve` as delegated registrar, arbitration C1 of `pyramid-v2.bulk.md`. Two entries added by hand on 2026-07-29 at 19:16, outside the registrar path, were re-run through the four tests and both failed: "We embrace the constraints of Vercel, React Server Component and shadcn" fails the vocabulary test on three tool names absent from `ubiquitous-language.md` and the declarative test on its phrasing, and "We focus on SEO best practices" states an intention rather than an invariant. BR-PYRAMID-2 therefore goes back to the wording the registrar recorded on 2026-07-29 — the one five live citations point at — and BR-PYRAMID-4 is removed. The identifier 4 is retired and never reused: it was cited under two different meanings in two days, and a third would make every past citation unreadable. Rules recorded on 2026-07-30 start at 5.

Recorded on 2026-07-31 by `bulkman resolve` as delegated registrar, from the arbitration of Gap 2 of `seo-url-scheme.design.md`: BR-PYRAMID-9. The four tests pass — the product owner decides how many classifications an article carries, the wording holds on glossary terms once `Tag` exists, it states an invariant rather than a sequence, and it is one rule rather than a ladder. `Tag` was added to `ubiquitous-language.md` in the same pass, together with `Content root`, `Clean checkout` and `Green set`, the last two closing the vocabulary test BR-PYRAMID-5 was still owed. 9 is the next free identifier: 4 stays retired.

Recorded on 2026-07-31 by epicman as registrar, from the arbitration of Open Question 3 of `content-source.design.md`: BR-PYRAMID-10, after `Published article` entered `ubiquitous-language.md` under Gap 1 of the same document. The four tests pass — the publisher decides which articles a site serves and could decide to serve its whole corpus, the wording holds on glossary terms only, it states an invariant rather than a sequence, and it is one rule rather than a ladder. What a missing declaration costs — an article absent from the index, and its v1 addresses answering Gone — is enforcement and sequencing, deliberately left out of the rule. The glossary entry for `Published article` restates the rule in its explanatory clause and cites it rather than duplicating it silently; unlike the indexable-page rule refused on 2026-07-30, this one stays violable, since it constrains what a site serves rather than defining a property of the thing served. 10 is the next free identifier: 9 was the highest recorded and 4 stays retired.

## PYRAMID — building SEO sites on the shared base

- BR-PYRAMID-1 — The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source.
- BR-PYRAMID-2 — A site built on the version 2 base must not track visitor intents.
- BR-PYRAMID-3 — Each site must carry its own design system, which no other site may reuse.
- BR-PYRAMID-5 — The build chain of a site must complete from a clean checkout of the repository.
- BR-PYRAMID-6 — A site's design tokens must come from its design system alone.
- BR-PYRAMID-7 — A site must not read its content source while serving a request.
- BR-PYRAMID-8 — A site must supply the page copy of every page it publishes; its design system must supply no page copy.
- BR-PYRAMID-9 — An article carries at most one category and any number of tags.
- BR-PYRAMID-10 — A site publishes an article only if that article declares itself published.

BR-PYRAMID-4 is retired: see the reconciliation note above. Nothing is recorded under that identifier again.
