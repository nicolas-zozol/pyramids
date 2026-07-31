# Story : Content source of the v2 site

**Dernière mise à jour :** 2026-07-31
**Feature :** content-source
**Infix :** CONTENTSOURCE
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want the v2 site to read its articles through a content source whose cost at build and at request time is measured, so that the source is chosen on numbers rather than on the impression left by v1.

## Contexte & objectif

The epic left one point open on v1: the server might rebuild the site from markdown far more often than it should. The measurement of 2026-07-31 answers it — six traversals per build, one per build worker, and none on a served request — so the point closes on numbers rather than on a refactor. The suspicion, as it was framed, is not founded.

What remains is the v2 contract. The source itself is decided — markdown — and this story still owes the reading contract, its owner (shared base or site), and the article schema.

Nothing blocks implementation any more. `unblock-build` and `bootstrap-robusta-build` both landed on 2026-07-31, and `seo-url-scheme` landed on top of them the same day: the v2 site builds 62 static pages over a fixture corpus. That story also shipped the seam this one implements — `apps/robusta-build/src/content/article-index.ts`, where `getArticleIndex(): Promise<ArticleIndexEntry[]>` returns entries of `slug`, `locale`, `category?`, `title` and `date`, called from `generateStaticParams` and from page bodies at build time and from nowhere else. content-source replaces the fixture implementation and keeps the signature; the `fixture-` prefixed articles leave with it.

## What the v1 measurement found

Measured on 2026-07-31 against `apps/robusta`.

- Traversals per build: six, once per process, verified across six distinct PIDs. 62 calls to the reader in total, 56 of them served from the module-level memo. The count follows build workers — not the 42 routes, not route entries. Next used six processes on a ten-CPU machine.
- Markdown on a served request: none. Three page loads against `next start` — the blog home, an article, a category page — produced no reader call at all.
- Cost of one traversal at today's corpus: walking `content/blog` is 85 files and 16 directories in 0.5 ms, and parsing plus rendering the 11 articles is 58 ms, 5.2 ms per article.
- Cost of the same path at 200 articles: about 1,047 ms per traversal, and six processes make it roughly 6.3 s per build.
- Reproduced by `yarn build:robusta`, counting `==== Calculating all` against `+++++ Using cache` in the output, which the reader already logs. Per-process attribution needed one temporary `process.pid` on those two log lines, since reverted.

## Definition of done

- Delivered 2026-07-31 — the v1 reading path is measured, not presumed: traversal counts for a full build and for a served page, with wall time and the command that reproduces them.
- Delivered 2026-07-31 — the measured counts are set against the expected ones and the difference explained: the reader follows build workers, which is where the impression of reading "far more often than it should" came from. The static-generation worker crash of `unblock-build` is not among the causes — two React copies inside `apps/robusta`, a declaration defect with nothing to do with reading markdown.
- Delivered 2026-07-31 — a decision on the v2 content source is recorded with its rationale: markdown stays, because the numbers do not say otherwise.
- The reading contract is written against the seam that already exists rather than invented: `getArticleIndex` keeps its signature, and the story states plainly whether `ArticleIndexEntry` stays this narrow or has to widen. The entry deliberately carries no article body, and BR-PYRAMID-8 — "A site must supply the page copy of every page it publishes; its design system must supply no page copy." — makes that body something the content source has to hand the site.
- The v2 reader keeps the shape that works — one traversal per process, results reused inside it — and repeats neither defect the measurement found: no flag raised before the parsing it guards has completed, and no traversal whose callback does nothing.
- Parsing once into an artefact cached across the build processes is not done here: the six-fold duplication follows Next's worker model, and at roughly 6.3 s per build for 200 articles the threshold that would make such a cache pay is not reached.
- `ArticleIndexEntry` gains the source path `seo-url-scheme` deferred here, so a build failure names the file a publisher must open instead of naming a slug and a locale.
- When the source may be read is stated, and the bar is BR-PYRAMID-7 — "A site must not read its content source while serving a request."
- The story states whether the reading path belongs to the shared base or to the site, and what `seopyramids.config.ts` carries of it. `getCategories`, still declared there and read by nothing since `seo-url-scheme`, is removed.
- The article schema owes two fields, defined and enforced here while `migrate-learn-content` fills the values: `published: true`, mandatory, which temporarily unpublishes the nine articles carrying no such field, and the translation identifier required when an article is translated.
- Does not cover moving the articles themselves (`migrate-learn-content`), the URL scheme (`seo-url-scheme`), nor repairing v1 — v1 is measured, not fixed.

## Décisions

- 2026-07-29 — The bar the v1 measurement is judged against: more than one full traversal of the markdown tree per build worker is too much, and any traversal on a served request is a defect. Pourquoi : every blog route is static with revalidation off, so a request has no reason to touch markdown at all; below that bar the v1 behaviour is a nuisance, not a problem to solve in v2. Impact : the request-time half was recorded as BR-PYRAMID-7 on 2026-07-30, so the story cites the rule rather than restating it.
- 2026-07-29 — The content source is decided for the pyramid base, not for robusta.build alone: the reading contract belongs to the base, while the location and the blog settings stay per-site in `seopyramids.config.ts`. Pourquoi : the whole point of v2 is that the next site ships without being rewritten, and a content source chosen for one site only would be rewritten by the second.
- 2026-07-30 — The v1 content source of record is `apps/robusta/content/blog` alone: "use only `content/blog`". Pourquoi : arbitration of Gap 1 of this story, against the proposition that measured on `content/blog` but took the union of the two trees as the inventory to migrate; the 5 articles existing only under `public/learn` are out, which aligns this story with the epic's structuring decision of 2026-07-29. Impact : `root.archi.md` still names `public/learn` as the place articles live.
- 2026-07-30 — The article schema gains a translation identifier, a frontmatter field required when an article is translated; migrate-learn-content fills it on the four affected files during the move. Pourquoi : arbitration of Gap 2 of `content-source.brainstorm.md` — the field is part of the article schema, which is this story's contract, while writing values into article files is a content move.
- 2026-07-30 — `published: true` is mandatory in the frontmatter: "no, published:true MUST be mandatory. If other don't have it, unpublish them temporary, I'll will add it manually if I want". Pourquoi : arbitration of Gap 3 of `content-source.brainstorm.md`, against the proposition that treated the field as dead — the nine articles carrying no `published` field are temporarily unpublished, and the publisher adds the flag by hand where he wants it.
- 2026-07-30 — Content stays as markdown inside the site's repository; a CMS is revisited only if someone other than the repository owner starts writing. Pourquoi : arbitration of Open Question 2 of `content-source.brainstorm.md` — the publisher already writes markdown and owns the repository, so a CMS buys an editing interface at the price of a runtime dependency in the content path.
- 2026-07-30 — The reading contract is extracted into a base package now, and proved against a dakar-shaped fixture corpus rather than against dakar itself. Pourquoi : arbitration of Open Question 3 of `content-source.brainstorm.md` — the decision of 2026-07-29 already places the contract in the base, and v1's whole failure was a base and a site growing into each other; dakar being out of scope until robusta ships, the second consumer is a fixture.
- 2026-07-31 — v1 meets the bar this story set on 2026-07-29, on both halves: one traversal per build worker is exactly one, and a served request reads nothing. Pourquoi : the measurement above, six traversals across six distinct PIDs and no reader call on three served pages. Impact : the suspicion the epic recorded — that the server rebuilds from markdown far more often than it should — is not founded as it was framed, and the epic's open point closes on the measurement rather than on a refactor.
- 2026-07-31 — Markdown stays the content source of v2. Pourquoi : the epic bound the decision to markdown unless the numbers said otherwise, and they do not — 5.2 ms per article, six processes, roughly 6.3 s per build at a corpus twenty times today's. A cost the build absorbs and a request never pays.
- 2026-07-31 — v1's dead traversal is recorded and not fixed. `getSortedPostsData` opens with a recursive walk of the entire working directory whose callback body is empty — `traverseDir('', (path) => { if (path.includes('content/blog')) {} })` at `apps/robusta/src/logic/posts.ts:246`. It walks 8,024 files and 781 directories with an `lstatSync` on each, 167 ms, to do nothing, on every cache miss: six times per build, about a second. Pourquoi : the defect is the real cost of v1's reading path, but this story measures v1 and does not repair it, and the repository forbids refactoring v1. Impact : it scales with the size of the working directory — `node_modules` and `.next` included — not with the article count, so it grows while the corpus stands still; recorded so the v2 reader does not inherit the shape, not as work to do.
- 2026-07-31 — A latent defect in the same function is recorded for the same reason: `postsGenerated = true` is set before the asynchronous parsing completes, so a second caller inside the same process would receive a partially-filled array. Pourquoi : nothing hits it today because the calls are sequential, and v1 is measured rather than fixed. Impact : the v2 reader must not memoize a promise in flight by raising a flag ahead of the work — it memoizes the promise itself.

## Documentation updates

- changed the v1 content location in `root.archi.md` — delivered on 2026-07-31 by `seo-url-scheme`: the data flow names `apps/robusta/content/blog` and the gotchas say why the `public/learn` tree is not the corpus, which retires the Impact of the decision of 2026-07-30 above
- change the "Data Flow — a content site" diagram of `root.archi.md` — why: it still shows one v1 tree feeding build-time parsing, and says nothing of the base package that owns the reading nor of the corpus each site declares
- change the Children list and the Key Components of `root.archi.md` — why: a base package the architecture document does not name is a package the next site will not know it may reuse; the Children entry points at `content.archi.md` and the Key Components bullet says what `pyramids-content` owns and what it depends on, next to the zero-dependency line of `pyramids-routing`. The diagram of the same file belongs to the bullet above, not to this one
- create `packages/pyramids-content/content.archi.md` — why: this story creates the second package of the v2 base, `@robusta/pyramids-content`, and the repository keeps one architecture document per package; `packages/pyramids-routing/routing.archi.md`, written on 2026-07-31, is both the precedent and the shape to follow
- change the Packages section, the `build:deps` order and the watcher list of `CLAUDE.md` — why: the package line tells a contributor what `@robusta/pyramids-content` is for, and the build order and the watchers both change when a second base package takes the slot behind `pyramids-routing`
- change the `getCategories` statements of `apps/robusta-build/README.md` and of `apps/robusta-build/robusta-build.archi.md` — why: both say the field returns an empty array until `content-source` decides, and both become false the day this story removes it — the README in prose, the architecture document in its diagram and in its `seopyramids.config.ts` entry
- change the "Content source" entry of `ubiquitous-language.md` — why: it ends on "whether the server re-reads them too often is an open point of the v2 epic", where BR-PYRAMID-7 settles the request-time half and this story's measurement settles the build-time one
- create a content section in the README of the v2 site — why: an author needs to know where an article file goes and what makes it appear on the site, the mandatory `published: true` included
