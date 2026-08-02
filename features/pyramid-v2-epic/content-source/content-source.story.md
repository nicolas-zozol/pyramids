# Story : Content source of the v2 site

**Dernière mise à jour :** 2026-08-02
**Feature :** content-source
**Infix :** CONTENTSOURCE
**Status :** LANDED (2026-08-02, commit 82c154f)

## Story

As the publisher of robusta.build, I want the v2 site to read its articles through a content source whose cost at build and at request time is measured, so that the source is chosen on numbers rather than on the impression left by v1.

## Contexte & objectif

The epic held one open point on v1 — the server might rebuild the site from markdown far more often than it should. The measurement of 2026-07-31 answered it on numbers: one traversal per build process and none on a served request, so the suspicion is not founded as it was framed, and markdown stays the v2 content source.

The reading contract shipped on 2026-08-01 as `82c154f`: `@robusta/pyramids-content`, second package of the v2 base, behind the `getArticleIndex` seam `seo-url-scheme` had left, with the fixture articles gone and the v1 mapping regenerated. The package's asset half — `copyCorpusAssets`, `resolveAssetUrl` — came later with `migrate-learn-content` and is not this story's.

## What the v1 measurement found

Measured on 2026-07-31 against `apps/robusta`.

- Traversals per build: six, once per process, verified across six distinct PIDs. 62 calls to the reader in total, 56 of them served from the module-level memo. The count follows build workers — not the 42 routes, not route entries. Next used six processes on a ten-CPU machine.
- Markdown on a served request: none. Three page loads against `next start` — the blog home, an article, a category page — produced no reader call at all.
- Cost of one traversal at today's corpus: walking `content/blog` is 85 files and 16 directories in 0.5 ms, and parsing plus rendering the 11 articles is 58 ms, 5.2 ms per article. At 200 articles, about 1,047 ms per traversal, so roughly 6.3 s per build across six processes.
- Reproduced by `yarn build:robusta`, counting `==== Calculating all` against `+++++ Using cache` in the output, which the reader already logs. Per-process attribution needed one temporary `process.pid` on those two log lines, since reverted.

## Livré

### Requirements

- R-CONTENTSOURCE-01: The site obtains its articles through one call, and no route, script or page builds a second list.
- R-CONTENTSOURCE-02: The corpus is read at build time only; serving a request touches no file. Realizes BR-PYRAMID-7.
- R-CONTENTSOURCE-03: A process reads a corpus at most once, and two callers arriving before that read completes both receive the complete result.
- R-CONTENTSOURCE-04: The reader enumerates the declared corpus root and descends only inside it; no path outside it is enumerated, stated or read.
- R-CONTENTSOURCE-05: A file is an article by an explicit rule — a `.md` extension and none of the corpus's declared exclusions — never by a substring test on its path.
- R-CONTENTSOURCE-06: Answering the article list renders no article body; a body is rendered when one page asks for that one article.
- R-CONTENTSOURCE-07: The list a caller receives cannot be mutated by that caller.
- R-CONTENTSOURCE-08: An article's page copy — its body and its excerpt — comes from the site's own corpus through the reader, and from nowhere else. Realizes BR-PYRAMID-8.
- R-CONTENTSOURCE-09: Every article the reader returns names its source file, and every message about an article names that file.
- R-CONTENTSOURCE-21: The reading contract belongs to the shared base and carries no site's editorial vocabulary: no corpus path, no content root, no category, no locale value.
- R-CONTENTSOURCE-22: Where a site's articles live, and where a locale is read from in that tree, are declared by the site as data; the base calls back into no site-supplied function.
- R-CONTENTSOURCE-23: The base package holds no React and no Next import and runs under plain Node, so the same reader serves the route table, the page bodies and the redirect emitter.
- R-CONTENTSOURCE-24: A tree that carries the locale in its path uses the same contract with no code forked into the site, proved on a fixture corpus of that shape.
- R-CONTENTSOURCE-25: The package takes its slot in the build chain before any site builds, and sites consume its built output. Realizes BR-PYRAMID-5.
- R-CONTENTSOURCE-41: A published article declares a title, a date as `YYYY-MM-DD`, a locale and an excerpt; a file missing any of them is a violation naming the file and the field.
- R-CONTENTSOURCE-42: An article is published only if its frontmatter declares `published: true`; a file that does not is read, left out of the index and named in the build output. Realizes BR-PYRAMID-10.
- R-CONTENTSOURCE-43: A `published` value that is not a boolean is a violation, so no article is unpublished by a typo.
- R-CONTENTSOURCE-44: An article translated into another locale carries a translation identifier shared with that version; two published articles of one locale sharing an identifier is a violation.
- R-CONTENTSOURCE-45: An article's slug is the one its frontmatter pins, or the frozen slugify of its title, and no change to the reader moves a published slug.
- R-CONTENTSOURCE-46: The category an article claims comes from its frontmatter and never from the folder it sits in.
- R-CONTENTSOURCE-47: Validation returns violations and never throws; the site decides a non-empty result fails the build, and it fails before a page is generated.
- R-CONTENTSOURCE-48: A declared corpus root that does not exist is a violation naming the path, not an empty corpus.
- R-CONTENTSOURCE-61: The site configuration states no category set; the categories that carry a page are derived from what articles claim.
- R-CONTENTSOURCE-62: The site builds from its corpus and from nothing else — no fixture article ships in a site build.
- R-CONTENTSOURCE-63: The v1 mapping is regenerated from the real index, and an article the index does not carry has no article row in it.

### Acceptance Criteria

- AC-CONTENTSOURCE-01: Given a corpus of markdown articles, when Tux builds, then every published article appears in the index exactly once with the fields of `ArticleEntry`, newest first, and no article body is rendered.
- AC-CONTENTSOURCE-03: Given two callers asking for the index before the first read resolves, when both settle, then both receive the same complete list and neither receives a partially-filled one. Realizes R-CONTENTSOURCE-03.
- AC-CONTENTSOURCE-04: Given a corpus root beside directories holding thousands of files, when the index is read, then nothing outside the corpus root is enumerated or stat'ed.
- AC-CONTENTSOURCE-05: Given a corpus holding `notes.md.bak`, a directory named `draft.md`, a `.DS_Store` and a declared exclusion `example.md`, when the index is read, then none of them is an article and no violation is raised for them.
- AC-CONTENTSOURCE-06: Given a served page of the built site, when Barbot requests it, then no file of the corpus is read. Realizes BR-PYRAMID-7.
- AC-CONTENTSOURCE-21: Given a dakar-shaped fixture corpus — `content/{locale}/guide/{slug}.md`, locale in the path, `.brief.md` companions beside the articles — when it is read through the same package with its own `CorpusSpec`, then every article is returned with its locale and no code is forked into a site. Realizes R-CONTENTSOURCE-24.
- AC-CONTENTSOURCE-22: Given a clean checkout, when Tux runs the green set, then `@robusta/pyramids-content` builds in `build:deps` before the sites and every site of the set builds. Realizes BR-PYRAMID-5.
- AC-CONTENTSOURCE-23: Given `yarn emit:redirects`, which runs outside the webpack pipeline, when Ada runs it, then it reads the real corpus and writes the mapping without a bundler.
- AC-CONTENTSOURCE-41: Given an article whose frontmatter has no title, when Tux builds, then the build fails naming that file and the missing field, and no page has been generated. Realizes R-CONTENTSOURCE-41 and 47.
- AC-CONTENTSOURCE-43: Given an article declaring `published: "true"`, when Tux builds, then the build fails naming the file, rather than the article disappearing from the site.
- AC-CONTENTSOURCE-44: Given two published English articles carrying the same translation identifier, when Tux builds, then the build fails naming both files; and given an English and a French article sharing one, then the build passes.
- AC-CONTENTSOURCE-45: Given the migrated corpus, when the index is read, then every slug equals the one the v1 mapping was computed from; and given an article pinning `slug` in its frontmatter, then that value is used unchanged.
- AC-CONTENTSOURCE-46: Given an article claiming `typescript` while sitting under `javascript/typescript/`, when the site is built, then it is served at `/articles/c/typescript/{slug}` and no violation is raised about its folder.
- AC-CONTENTSOURCE-47: Given a corpus root that does not exist, when Tux builds, then the build fails naming the path it looked for. Realizes R-CONTENTSOURCE-48.
- AC-CONTENTSOURCE-48: Given an article whose slug is `l`, `c`, `p` or `t`, when Tux builds, then the build fails naming the file that carries it — the tightening AC-URLSCHEME-04 deferred to this story.
- AC-CONTENTSOURCE-61: Given the site configuration, when Ada reads it, then it declares no category set and no executable resolver, and the categories carrying a page are those the articles claim.
- AC-CONTENTSOURCE-62: Given the real index, when the mapping is regenerated, then no row mentions a `fixture-` slug and every published article has its v1 article row.

## Décisions

- 2026-07-29 — The bar the v1 measurement is judged against: more than one full traversal of the markdown tree per build worker is too much, and any traversal on a served request is a defect. Pourquoi : every blog route is static with revalidation off, so a request has no reason to touch markdown at all; below that bar the v1 behaviour is a nuisance, not a problem to solve in v2. Impact : the request-time half was recorded as BR-PYRAMID-7 on 2026-07-30, so the story cites the rule rather than restating it.
- 2026-07-29 — The content source is decided for the pyramid base, not for robusta.build alone: the reading contract belongs to the base, while the location and the blog settings stay per-site in `seopyramids.config.ts`. Pourquoi : the whole point of v2 is that the next site ships without being rewritten, and a content source chosen for one site only would be rewritten by the second.
- 2026-07-30 — The v1 content source of record is `apps/robusta/content/blog` alone: "use only `content/blog`". Pourquoi : arbitration of Gap 1 of this story, against the proposition that measured on `content/blog` but took the union of the two trees as the inventory to migrate; the 5 articles existing only under `public/learn` are out, which aligns this story with the epic's structuring decision of 2026-07-29.
- 2026-07-30 — The article schema gains a translation identifier, a frontmatter field required when an article is translated; migrate-learn-content fills it on the four affected files during the move. Pourquoi : arbitration of Gap 2 of `content-source.brainstorm.md` — the field is part of the article schema, which is this story's contract, while writing values into article files is a content move.
- 2026-07-30 — `published: true` is mandatory in the frontmatter: "no, published:true MUST be mandatory. If other don't have it, unpublish them temporary, I'll will add it manually if I want". Pourquoi : arbitration of Gap 3 of `content-source.brainstorm.md`, against the proposition that treated the field as dead — the nine articles carrying no `published` field are temporarily unpublished, and the publisher adds the flag by hand where he wants it.
- 2026-07-30 — Content stays as markdown inside the site's repository; a CMS is revisited only if someone other than the repository owner starts writing. Pourquoi : arbitration of Open Question 2 of `content-source.brainstorm.md` — the publisher already writes markdown and owns the repository, so a CMS buys an editing interface at the price of a runtime dependency in the content path.
- 2026-07-30 — The reading contract is extracted into a base package now, and proved against a dakar-shaped fixture corpus rather than against dakar itself. Pourquoi : arbitration of Open Question 3 of `content-source.brainstorm.md` — the decision of 2026-07-29 already places the contract in the base, and v1's whole failure was a base and a site growing into each other; dakar being out of scope until robusta ships, the second consumer is a fixture.
- 2026-07-31 — v1 meets the bar this story set on 2026-07-29, on both halves: one traversal per build worker is exactly one, and a served request reads nothing. Pourquoi : the measurement above, six traversals across six distinct PIDs and no reader call on three served pages. Impact : the suspicion the epic recorded — that the server rebuilds from markdown far more often than it should — is not founded as it was framed, and the epic's open point closes on the measurement rather than on a refactor.
- 2026-07-31 — Markdown stays the content source of v2. Pourquoi : the epic bound the decision to markdown unless the numbers said otherwise, and they do not — 5.2 ms per article, six processes, roughly 6.3 s per build at a corpus twenty times today's. A cost the build absorbs and a request never pays.
- 2026-07-31 — Parsing once into an artefact cached across the build processes is not done: the six-fold duplication follows Next's worker model, and at roughly 6.3 s per build for 200 articles the threshold that would make such a cache pay is not reached. Pourquoi : the numbers, again — the cache would be a moving part bought against seconds the build already absorbs.
- 2026-07-31 — v1's dead traversal is recorded and not fixed. `getSortedPostsData` opens with a recursive walk of the entire working directory whose callback body is empty — `traverseDir('', (path) => { if (path.includes('content/blog')) {} })` at `apps/robusta/src/logic/posts.ts:246`. It walks 8,024 files and 781 directories with an `lstatSync` on each, 167 ms, to do nothing, on every cache miss: six times per build, about a second. Pourquoi : the defect is the real cost of v1's reading path, but this story measures v1 and does not repair it, and the repository forbids refactoring v1. Impact : it scales with the size of the working directory — `node_modules` and `.next` included — not with the article count, so it grows while the corpus stands still; recorded so the v2 reader does not inherit the shape, not as work to do.
- 2026-07-31 — A latent defect in the same function is recorded for the same reason: `postsGenerated = true` is set before the asynchronous parsing completes, so a second caller inside the same process would receive a partially-filled array. Pourquoi : nothing hits it today because the calls are sequential, and v1 is measured rather than fixed. Impact : the v2 reader must not memoize a promise in flight by raising a flag ahead of the work — it memoizes the promise itself, which `corpus-traversal.spec.ts` proves.
- 2026-08-01 — All eleven articles declare `published: true`: the publisher added the flag by hand to the nine files that lacked it, in `978eb7e`, before the reader was wired. Pourquoi : the arbitration of 2026-07-30 left that call to him, and he wanted the whole corpus served rather than nine articles left out. Impact : the scenario of AC-CONTENTSOURCE-42 — two published, nine named in the build output — never ran as written, and the ordering obligation this story placed on `retire-robusta-v1` is discharged: no v1 address answers Gone for want of a flag.
- 2026-08-02 — Nothing is printed. The traversal count of AC-CONTENTSOURCE-02 and the unpublished paths of R-CONTENTSOURCE-42 stop at the contract: `readCorpus` returns them in `CorpusRead.unpublished`, `corpus-traversal.spec.ts` proves the once-per-process read, and no build-output line carries either. Pourquoi : a test proves the property more cheaply than a log line the build output would carry forever, and since `978eb7e` there is no unpublished file left to name.
- 2026-08-02 — AC-CONTENTSOURCE-07 is delivered by half, deliberately: `getArticleBody` sits on the seam and reads the article's own file, and no page calls it yet. Pourquoi : the epic's decision of 2026-08-01 gave rendering an article to `article-page`; this story ships the reading path, not the page that consumes it.
- 2026-08-02 — This story carries two dates and not one: the measurement is 2026-07-31, the reader ships on 2026-08-01 as `82c154f`. Pourquoi : both were written 2026-07-31 in the ROADMAP and in the epic, the measurement's date standing in for the delivery's. Impact : the ROADMAP is corrected by this land; the epic entry is `epicman update`'s to correct.

## Documentation updates

- changed the v1 content location in `root.archi.md` — delivered on 2026-07-31 by `seo-url-scheme`
- changed the "Data Flow — a content site" diagram of `root.archi.md` in `3ebe44a`: it names both corpora, the reader package and one traversal per corpus root per process
- changed the Children list of `root.archi.md` in `3ebe44a` and its Key Components in `1c555d1`: `pyramids-content` has its child entry, its bullet next to the zero-dependency line of `pyramids-routing`, and its slot in the build chain
- created `packages/pyramids-content/content.archi.md` in `3ebe44a`, on the shape of `routing.archi.md`
- changed the Packages section, the `build:deps` order and the watcher list of `CLAUDE.md` in `1c555d1`
- changed the `getCategories` statements of `apps/robusta-build/README.md` and of `apps/robusta-build/robusta-build.archi.md` in `3ebe44a`: both went with the field
- changed the "Content source" entry of `ubiquitous-language.md` in `5ec8f0d`, by epicman as registrar: request time closed by BR-PYRAMID-7, build time by this story's measurement
- created the content section of the v2 site's README in `3ebe44a`: `## Articles` says where an article file goes and what makes it appear on the site, mandatory `published: true` included
