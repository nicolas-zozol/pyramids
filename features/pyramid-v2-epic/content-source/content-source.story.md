# Story : Content source of the v2 site

**Dernière mise à jour :** 2026-07-29
**Feature :** content-source
**Infix :** CONTENTSOURCE
**Status :** ACTIVE

## Story

**En tant que** publisher of robusta.build, **je veux** the v2 site to read its articles through a content source whose cost at build and at request time is measured, **afin de** choose that source on numbers rather than on the impression left by v1.

## Contexte & objectif

The epic leaves one point open on v1: the server may rebuild the site from markdown far more often than it should. The suspicion is founded — every blog route of v1 is declared static with revalidation off, so markdown should be read at build time and never again, yet a single reader is called from every route entry and from every page, and it only remembers its work for the lifetime of one process. Nobody has ever counted the traversals.

The first deliverable of this story is therefore a measurement of v1, not a refactor decided in advance. The decision on the v2 content source comes second, and it is bound by the epic: markdown stays the first source unless the numbers say otherwise. What may change is when and how many times it is read, and who owns that reading — the shared base or the site.

Implementation lands on `apps/robusta-build`, which does not exist yet, so the story cannot finish before the site is bootstrapped. The v1 measurement does not wait for it: the v1 site is on `dev` today.

## What the analysis must answer

- For one `next build`: how many times the markdown tree is fully traversed, parsed and rendered — and whether that count follows the number of routes, of route entries, or of build workers.
- For one page served in production: is markdown read at all, given every blog route is static with revalidation off.
- What one full traversal costs in wall time for the 13 articles of today.
- What the same path costs at 200 articles, since the base is meant to carry several sites.

## Definition of done

- The v1 reading path is measured, not presumed: traversal counts for a full build and for a served page, with wall time, and the command that reproduces them.
- The measured counts are set against the expected ones and the difference is explained, including whether the static-generation worker crash of `unblock-build` shares the same cause.
- A decision on the v2 content source is recorded with its rationale — markdown unless the numbers say otherwise.
- The contract between the site and its articles is stated: what the site may ask for (the full list, one article by category and slug, one blog roll page) and when the source may be read (build, revalidation, request).
- The story states whether the reading path belongs to the shared base or to the site, and what `seopyramids.config.ts` carries of it.
- Does not cover moving the articles themselves (`migrate-learn-content`), the URL scheme (`seo-url-scheme`), nor repairing v1 — v1 is measured, not fixed.

## Décisions

- 2026-07-29 — The bar the v1 measurement is judged against: more than one full traversal of the markdown tree per build worker is too much, and any traversal on a served request is a defect. Pourquoi : every blog route is static with revalidation off, so a request has no reason to touch markdown at all; below that bar the v1 behaviour is a nuisance, not a problem to solve in v2.
- 2026-07-29 — The content source is decided for the pyramid base, not for robusta.build alone: the reading contract belongs to the base, while the location and the blog settings stay per-site in `seopyramids.config.ts`. Pourquoi : the whole point of v2 is that the next site ships without being rewritten, and a content source chosen for one site only would be rewritten by the second.
- 2026-07-30 — The v1 content source of record is `apps/robusta/content/blog` alone: "use only `content/blog`". Pourquoi : arbitration of Gap 1 of this story, against the proposition that measured on `content/blog` but took the union of the two trees as the inventory to migrate; the 5 articles existing only under `public/learn` are out, which aligns this story with the epic's structuring decision of 2026-07-29. Impact : `root.archi.md` still names `public/learn` as the place articles live.
- 2026-07-30 — The article schema gains a translation identifier, a frontmatter field required when an article is translated; migrate-learn-content fills it on the four affected files during the move. Pourquoi : arbitration of Gap 2 of `content-source.brainstorm.md` — the field is part of the article schema, which is this story's contract, while writing values into article files is a content move.
- 2026-07-30 — `published: true` is mandatory in the frontmatter: "no, published:true MUST be mandatory. If other don't have it, unpublish them temporary, I'll will add it manually if I want". Pourquoi : arbitration of Gap 3 of `content-source.brainstorm.md`, against the proposition that treated the field as dead — the nine articles carrying no `published` field are temporarily unpublished, and the publisher adds the flag by hand where he wants it.
- 2026-07-30 — Content stays as markdown inside the site's repository; a CMS is revisited only if someone other than the repository owner starts writing. Pourquoi : arbitration of Open Question 2 of `content-source.brainstorm.md` — the publisher already writes markdown and owns the repository, so a CMS buys an editing interface at the price of a runtime dependency in the content path.
- 2026-07-30 — The reading contract is extracted into a base package now, and proved against a dakar-shaped fixture corpus rather than against dakar itself. Pourquoi : arbitration of Open Question 3 of `content-source.brainstorm.md` — the decision of 2026-07-29 already places the contract in the base, and v1's whole failure was a base and a site growing into each other; dakar being out of scope until robusta ships, the second consumer is a fixture.

## Documentation updates

- change the "Content source" entry in `ubiquitous-language.md` — why: the term currently ends on "whether the server re-reads them too often is an open point", which this story closes.
- change the "Data Flow — a content site" section of `root.archi.md` — why: it hedges the content location as "public/learn, content/" and says nothing about when the markdown is read; both are settled here.
- create a content section in the README of the v2 site — why: an author needs to know where an article file goes and what makes it appear on the site.

## Dependencies

- Dep 1: `bootstrap-robusta-build` (item 3 of the epic) — the chosen source can only be implemented on a site that exists. Blocks implementation, not the analysis, and not the design doc.
- Dep 2: `unblock-build` (item 2 of the epic) — measuring a full `next build` of v1 requires the build to complete; today a worker crashes during static generation.
