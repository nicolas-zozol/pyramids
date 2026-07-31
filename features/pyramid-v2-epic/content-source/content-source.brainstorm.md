# Brainstorm : Content source of the v2 site

**Date :** 2026-07-29
**Feature :** content-source
**Infix :** CONTENTSOURCE
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Ground facts established during this brainstorm

The story asks for a measurement before a decision. A pre-measurement was taken so the axes below argue from numbers rather than from impressions. It is not the story's deliverable — that one runs inside a real `next build` — but it is enough to settle which problem is worth solving.

The v1 reading path is one module, `apps/robusta/src/logic/posts.ts`, whose only filesystem entry point is `getSortedPostsData`. What it does on a cold call:

- walks `process.cwd()` recursively, in full, with an empty callback body — `traverseDir('', path => { if (path.includes('content/blog')) {} })`. This walk reads `node_modules`, `.next`, `.git` and `public`, and does nothing with any of it.
- then walks `content/blog`, and for every file whose path contains the substring `.md`, parses the frontmatter and renders the whole body to HTML through a freshly constructed `remark()` processor.
- memoizes into a module-scope array behind a boolean flag, so the work happens once per Node process, hence once per static-generation worker.

Measured on this machine, cold, median of 20 runs:

- the 11 articles, read plus frontmatter plus full HTML render: 22.7 ms, about 2.1 ms per article, over 93 KB of markdown
- the same 11 articles, frontmatter only: 0.4 ms
- the empty-callback `process.cwd()` walk: 112 ms over 14 436 filesystem entries in `apps/robusta`
- extrapolated to 200 articles: 412 ms with rendering, 7 ms without

So the useless walk costs roughly five times the real work, and it scales with `node_modules` and build output rather than with content. The articles themselves are noise: the whole corpus renders in the time of a slow HTTP round trip.

Three defects in that module bear on the v2 contract, independently of cost:

- the memo flag is set synchronously before the async rendering completes, and no in-flight promise is stored. A second caller entering during that window gets the shared array while it is still filling.
- `sortPostsByDate` sorts the shared module array in place and returns that same reference, so every call site holds an alias of one mutable array.
- the `BlogConfig` argument is not part of the memo key: the first caller's configuration decides the parsed result for the whole process.

On the corpus itself, verified on disk:

- 11 markdown files, five categories carrying articles — blockchain 4, javascript 4, privacy 1, theory 1, web 1 — and one of the javascript four sits in a nested category, `javascript/typescript`.
- `security` and `prompt` hold images and no article.
- frontmatter is not uniform: `author` is absent on two articles, `published: true` appears on two of eleven, `featured` is absent on two, and `public: ["décideurs", "codeur"]` appears exactly once.
- `styled-components.md` points its image at `../images/`, escaping its own category folder; the other ten use `./images/`.
- two English articles declare `locale: "fr"` — `yield-farming.md` and `why-migration-gatsby-next.md`. The declared split is 6 en / 5 fr; the true split is 8 en / 3 fr.
- no article carries any field linking it to its translation.
- the newest article is dated 2022-01-20, and no article has been added since the App Router migration of early 2025.

On reuse: no package under `packages/` reads the filesystem or depends on `gray-matter`, `remark` or any markdown tooling. The content pipeline lives entirely inside `apps/robusta`. The claim in `root.archi.md` that the shared base carries "a content pipeline that turns markdown files into rendered, indexable pages" describes an intention, not the code.

On the second site: `apps/dakar` stores content as `content/{locale}/guide/{slug}.md` and as `content/spots/{locale}/{slug}.md` — two layouts inside one site, both unlike robusta's `content/blog/{category}/{slug}.md` where the locale is frontmatter rather than a path segment. Dakar also keeps `.brief.md` companions and `example.md` fixtures in the same folders as real content. Its `seopyramids.config.ts` re-declares the `SeoPyramidsConfig` and `BlogConfig` interfaces by copy-paste instead of importing them, and still carries robusta's `mandatoryKeywords` and author.

## Requirements

Functional requirements, carrying BR-PYRAMID-1 — "The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source."

- R-CONTENTSOURCE-1 — A site serves any article, category page or blog roll page without reading its content source at request time.
- R-CONTENTSOURCE-2 — The content source answers exactly three questions: the full article list, one article by slug, one blog roll page for a locale and an optional category.
- R-CONTENTSOURCE-3 — An article is addressed by its slug alone; its category is metadata and not part of its identity.
- R-CONTENTSOURCE-4 — Categories nest, and the blog roll of a category includes the articles of its descendant categories.
- R-CONTENTSOURCE-5 — Every article declares the locale it is written in, and a blog roll for one locale lists only articles of that locale.
- R-CONTENTSOURCE-6 — The two locale versions of one article are linkable to each other through a durable identifier the article carries.
- R-CONTENTSOURCE-7 — A category holding no article, directly or through its descendants, carries no page.
- R-CONTENTSOURCE-8 — Asking for the article list does not require rendering article bodies.

Technical requirements.

- R-CONTENTSOURCE-9 — The corpus is read at build time only; serving a request never touches the filesystem.
- R-CONTENTSOURCE-10 — A build worker reads the corpus at most once, and reads nothing outside the corpus root.
- R-CONTENTSOURCE-11 — The reading contract belongs to the shared base; the corpus root and the blog settings belong to the site configuration.
- R-CONTENTSOURCE-12 — The site configuration is data: it carries no executable resolver that the base has to call back into.
- R-CONTENTSOURCE-13 — A file under the corpus root that is not an article is excluded by an explicit rule, never by a substring match on its path.
- R-CONTENTSOURCE-14 — An article whose frontmatter lacks a required field fails the build instead of publishing a degraded page.
- R-CONTENTSOURCE-15 — No caller can mutate the corpus that another caller is reading.
- R-CONTENTSOURCE-16 — The images an article references resolve from that article's own location and are served by the site.
- R-CONTENTSOURCE-17 — A second site whose content tree has a different shape uses the same contract without forking it.
- R-CONTENTSOURCE-18 — The read cost is established by a command anyone can re-run, not by an estimate.

---

## 1. Product Role

The content source is the part of the pyramid base that turns a site's tree of markdown files into articles, once, at build time, and hands them to the site through a small fixed contract. It is the seam between "what the publisher writes" and "what the router renders".

What it is not: it is not a CMS, it is not an editing interface, it is not the thing that moves the v1 articles (migrate-learn-content), it is not the URL scheme (seo-url-scheme), and it is not a repair of `apps/robusta` — v1 is measured here and left alone.

**Décision (autonome):** The content source is a reading contract owned by the shared base, shipped as a new workspace package, with the corpus location and the blog settings supplied by the site.

**Rationale:** No package reads content today, so "the base owns it" means creating one — and the story's own decision of 2026-07-29 already binds this to the base rather than to robusta.build.

---

## 2. Target Audience

Two personas, both technical, both currently one person.

The publisher-author writes an article as a markdown file, commits it, and expects the deployed site to show it. He owns the repository, so he has no need of an interface that protects him from it. The evidence says this loop is not merely slow, it is stopped: the newest article dates from 2022-01-20 and nothing has been published since the App Router migration of early 2025.

The site integrator bootstraps site number two and wants to point a configuration at a folder rather than reimplement a reader. Dakar is the concrete case and it already diverges: two tree layouts, locale in the path rather than in frontmatter, non-article markdown mixed into the content folders.

**Décision (autonome):** Design for the integrator first and the author second, and treat the authoring loop as a documentation problem rather than a tooling problem.

**Rationale:** The author is the repository owner and needs no abstraction over git, whereas the integrator is the persona v2 exists for; and nothing in the measured numbers suggests build cost is what stopped publishing.

**Alternative considered:** Optimising for the author with a git-based editing UI — rejected as a second product, not a content source.

---

## 3. Core Problem

Two candidate problems compete, and the numbers separate them.

The problem the epic suspected is that the server rebuilds from markdown far too often. Measured, that is half true and mostly harmless: the memo does hold within a process, so the corpus is traversed once per static-generation worker, which meets the bar the story set. What fails the bar is the companion walk of the entire working directory with an empty callback — 112 ms of pure waste per worker, five times the cost of the real work, growing with `node_modules` rather than with content. Meanwhile every blog route is `force-static` with `revalidate = false`, so a served request reads nothing, which is the other half of the bar met.

The problem nobody wrote down is that reading articles has no contract at all. It is app-private code with three latent defects — a memo flag set before the work completes, a shared mutable array handed to every caller, a configuration argument absent from the memo key — and a second site inherits none of it.

**Décision (autonome):** The core problem is the absence of a contract, not the cost of reading markdown. The measurement is kept as the evidence that closes the epic's suspicion, not as the motivation for the work.

**Rationale:** 93 KB of markdown renders in 23 ms and would render in 412 ms at 200 articles, so cost cannot justify a story — whereas the same module cannot be handed to a second site, and its cache is provably racy.

**Alternative considered:** Framing the story around build performance — rejected because it would deliver a cache nobody needs and leave the reuse problem untouched.

---

## 4. Unique Value Proposition

The alternatives to markdown-in-the-repo are a headless CMS (Contentful, Sanity), a git-based CMS layered over the same files (Decap), a database, or a build-time content framework (Contentlayer, Velite, Next's own MDX pipeline).

A hosted CMS buys an editing interface and a preview workflow, and costs a runtime dependency, an API key, a network read somewhere in the pipeline, and a third party between the publisher and his own words. For a corpus of 11 articles written by the repository owner, all of that is overhead against a benefit he does not need.

**Décision (autonome):** Content stays as markdown files inside the site's own workspace. The value proposition is that content is a build input rather than a runtime service: nothing is fetched, nothing can fail at request time, an article is reviewed in a pull request like code, and the site has no third party in its content path.

**Rationale:** The publisher owns the repository and writes in markdown already, so a CMS would add a dependency and a failure mode to buy an interface he does not need; and BR-PYRAMID-1 exists precisely so that page resolution never consults the content source.

**Alternative considered:** Contentlayer-style frameworks — they would supply schema validation and typed output for free, but they own the build pipeline, and the one thing v2 must keep is the freedom to point the same contract at two differently shaped trees.

---

## 5. Functional Scope

In scope:

- the measurement of the v1 reading path, with its reproduction command
- the reading contract as a package of the shared base, with the three questions of R-CONTENTSOURCE-2
- the corpus root and blog settings declared as data in `seopyramids.config.ts`
- frontmatter validation at build time, with a stated required set
- nested categories, locale partitioning, and the exclusion rule for non-article files
- a guarantee, verifiable, that no request-time read happens

Out of scope, and named so nobody assumes otherwise:

- moving the articles and their redirects (migrate-learn-content)
- the URL shape and the pagination decision (seo-url-scheme)
- rendering, typography and article layout (the design system)
- fixing `apps/robusta`; it is measured and retired, never repaired
- search, tags as a browsable axis, related-article computation, an editing interface
- the editorial fate of the 5 articles that live only under `public/learn` — the corpus is `content/blog`, fixed by the epic on 2026-07-29

**Décision (autonome):** The story delivers the contract and the evidence, and stops at the point where the first real article would be moved.

**Rationale:** migrate-learn-content already owns the move and depends on this story, so overlapping them would give two stories the same definition of done.

---

## 6. Core Features

### Feature: Measurement of the v1 reading path

**Capability:** Counts and times what `apps/robusta` actually does to its markdown during a full build and on a served page, and records the command that reproduces it.

**Acceptance Criteria:**

- Given a full `next build` of `apps/robusta`, When the build completes, Then the number of full corpus traversals is reported per worker process, with wall time, and the count is one per worker.
- Given the same build, When the traversal is instrumented, Then the `process.cwd()` walk with the empty callback is reported separately from the corpus read, with its own entry count and wall time.
- Given a page served from the deployed v1 site, When the request is served, Then no filesystem read of the corpus occurs, consistent with `force-static` and `revalidate = false` on every blog route.
- Given the build crashes a static-generation worker as recorded in unblock-build, When the measurement runs, Then the report states whether the crash shares a cause with the reading path or does not.

**Test Approach:** Instrumented build run from a clean checkout, counters emitted per process id, compared against the expected one-per-worker bar; the command is committed so the numbers can be re-taken.

---

### Feature: The article reading contract

**Capability:** A package of the shared base that reads a corpus once and answers the full article list, one article by slug, and one blog roll page for a locale and an optional category.

**Acceptance Criteria:**

- Given a corpus root holding articles in nested category folders, When the full list is requested, Then every article is returned once, with its frontmatter, sorted by date, and `javascript/typescript` articles appear under both `javascript` and `javascript/typescript`.
- Given the full list has already been read in this process, When it is requested again, Then no filesystem read occurs and the caller cannot mutate what the previous caller received.
- Given two callers request the corpus concurrently before the first read completes, When both resolve, Then both receive the complete corpus and neither receives a partially filled one.
- Given only the article list is needed, When it is requested, Then article bodies are not rendered to HTML.
- Given an article is requested by a slug that no article carries, When the request is made, Then the contract reports absence rather than returning an empty article.

**Test Approach:** Unit tests over fixture corpora — one nested, one flat, one empty — plus a concurrency test that fires two readers at once and asserts both get the full set, and an assertion that the returned collection cannot be sorted or pushed into by a caller.

---

### Feature: Corpus declaration in the site configuration

**Capability:** The site states where its articles live and how its blog behaves, as data, and the base needs nothing else to read them.

**Acceptance Criteria:**

- Given a site configuration naming a corpus root, a default locale, other locales and a roll size, When the base reads the corpus, Then it uses those values and reads nothing outside the declared root.
- Given a second site whose tree puts the locale in the path rather than in frontmatter, When it declares its own corpus shape, Then it uses the same contract with no code forked into the site.
- Given the configuration declares a corpus root that does not exist, When the build runs, Then it fails with a message naming the missing path.
- Given the category list, When it is requested, Then it is derived from the corpus rather than from a hand-maintained literal.

**Test Approach:** Two fixture site configurations, robusta-shaped and dakar-shaped, exercised against the same package; plus an assertion that the configuration type is imported from the base and not redeclared per site.

---

### Feature: Frontmatter validation at build time

**Capability:** Rejects a corpus that would publish a broken page, at build, with the offending file named.

**Acceptance Criteria:**

- Given an article missing a required field, When the build runs, Then it fails and the message names the file and the field.
- Given an article whose declared locale is not the site's default nor one of its other locales, When the build runs, Then it fails and names the file.
- Given an article referencing an image that does not resolve from its own location, When the build runs, Then it fails and names both the article and the unresolved path.
- Given the current corpus of 11 articles, When validation runs, Then it passes — the two mislabelled locales are valid values and are an editorial defect, not a schema violation.

**Test Approach:** Fixture articles, one per violation, asserting the build fails with the expected message; the real corpus is run through the same validator as a regression fixture.

---

### Feature: The build-time-only guarantee

**Capability:** Makes the "never read at request time" property checkable rather than assumed.

**Acceptance Criteria:**

- Given a built site, When any content page is served, Then no filesystem read of the corpus occurs.
- Given a route that would read the corpus at request time, When the check runs, Then it fails and names the route.
- Given the site's home page, which in v1 reads articles while declaring no segment configuration, When the v2 equivalent is built, Then it is statically generated and declares so explicitly.

**Test Approach:** A build-output assertion that every content route is prerendered, plus a runtime guard that fails loudly if the reader is entered outside the build phase.

---

## 7. Critical Edge Cases

Technical:

- A file whose path contains `.md` without being a markdown article. v1 filters with `path.includes('.md')`, a substring test that also matches `.mdx`, `notes.md.bak` and any directory named `x.md`.
- Non-article markdown living in the content tree: dakar keeps `.brief.md` companions and `example.md` fixtures beside real content.
- Files a filesystem adds by itself. `content/blog/prompt/.DS_Store` is already committed.
- Concurrent cold reads. Two callers entering before the first read resolves is the v1 race, and `generateMetadata` plus the page component of the same route are exactly that pair.
- A caller sorting or filtering the returned collection in place, which in v1 mutates every other caller's view.
- Reading anything outside the corpus root, which is what the `process.cwd()` walk does today.

Product:

- Nested categories. `javascript/typescript` exists, so a category page must decide whether it shows its descendants; R-CONTENTSOURCE-4 says it does.
- Categories with images and no article. `security` and `prompt` would otherwise produce empty indexable pages.
- Two articles with the same slug in different categories, which becomes possible the moment an article is addressed by slug alone.
- An article count below the roll size. With 11 articles and `rollSize: 12`, pagination has never once been exercised, so the first article to trigger page two will exercise untested code.
- A locale declared on an article that the site does not serve.
- An article whose translation is absent, and an article whose translation exists but is linked by nothing — the current state of both bilingual pairs.

Usage:

- The corpus grows to 200 articles: 412 ms if bodies are rendered eagerly, 7 ms if only frontmatter is read. This is the one number that argues for a design choice.
- An author adds an article and it silently fails to appear because a frontmatter field was omitted, which is why R-CONTENTSOURCE-14 fails the build instead.
- A category folder is renamed, changing the URL of every article it holds — the reason R-CONTENTSOURCE-3 keeps category out of an article's identity.

---

## 8. Non-Functional Constraints

Performance. A full corpus read costs 23 ms at 11 articles and an extrapolated 412 ms at 200 when bodies are rendered, against 7 ms when only frontmatter is read. The constraint that matters is not total time but the shape of the curve: rendering every body to answer "how many articles are there" is what makes the cost scale.

**Décision (autonome):** Article bodies are rendered per article on demand, and the list path reads frontmatter only.

**Rationale:** It is the difference between 7 ms and 412 ms at 200 articles, and every call site but the article page itself asks for metadata only.

Platform. BR-PYRAMID-2 as recorded — "We embrace the constraints of Vercel, React Server Component and shadcn" — puts the reader inside the build, in server components, across forked static-generation workers with no shared memory. Per-worker work is therefore multiplied by the worker count and no cache can span them.

Security and compliance. The corpus is public content committed to the repository, so there is no secret in the content path and no personal data to handle. Content is read, never written, at build time.

Cost. No hosting cost, no third-party subscription, no API quota. Build minutes are the only budget, and the corpus is not what consumes them.

**Décision (autonome):** No runtime dependency of any kind is introduced by the content path.

**Rationale:** A content source that can fail at request time contradicts BR-PYRAMID-1 and turns an outage of someone else's service into an outage of the site.

---

## 9. External Dependencies

Present in `apps/robusta` today: `gray-matter` ^4.0.3 for frontmatter, `remark` ^15.0.1 with `remark-html` ^16.0.1 for markdown to HTML, `slugify` 1.6.6 for slugs, on Next 15.1.8 and React 19 RC.

**Décision (autonome):** Keep gray-matter, remark and remark-html in the base package, and keep slugify with its existing behaviour frozen.

**Rationale:** They are already proven on this corpus, they are build-time-only, and a slug that changes breaks every indexed URL — the one dependency whose behaviour must not move.

**Alternative considered:** MDX, which would let articles embed components; rejected because it couples content to the design system and no article needs it.

Also depended on: the Next App Router build pipeline for static generation, Vercel as the build and hosting environment, and the git repository as the storage of record for content.

---

## 10. Major Risks

Product risk: the measurement lands and shows nothing dramatic, so the story reads as effort spent to confirm a non-problem. Mitigation is the framing of axis 3 — the deliverable is the contract, the measurement is the evidence that closes the epic's open point, and it did find one real defect worth naming.

Product risk: designing for 200 articles that never arrive. Publishing has been stopped since 2022 and the corpus has not grown since the App Router migration. Mitigation is to spend nothing on scale beyond not rendering bodies on the list path, which is a design choice rather than an investment.

Technical risk: a base package shaped around robusta's tree and unusable by dakar's. Dakar already has two layouts and neither matches robusta's. Mitigation is R-CONTENTSOURCE-17 and the two-fixture test of the configuration feature — the contract is proven against a second shape before a second site exists.

Technical risk: carrying the v1 defects forward by porting the module. The race, the shared mutable array and the config-less memo key are all in code that would be tempting to copy. Mitigation is that the acceptance criteria of the contract name each of them explicitly.

Adoption risk: the site configuration keeps growing into executable logic. Robusta's `seopyramids.config.ts` already imports `getCategories` from app code and its `BlogConfig` type from `@/logic/posts`, so the configuration currently depends on the app it is supposed to configure, and dakar copy-pasted both interfaces rather than importing them. Mitigation is R-CONTENTSOURCE-12.

Adoption risk: v1 has no `sitemap.ts` and no `robots.ts` anywhere, so seo-excellence will ask the content source for a full article list with URLs and dates. Mitigation is that R-CONTENTSOURCE-2 already covers it with the full-list question.

---

## Next Steps

- Arbitrate the gaps and open questions above, or fold them into the epic bulk with bulkman.
- Run the v1 measurement inside a real `next build`, which needs the worker crash of unblock-build lifted first; the pre-measurement in this document stands in until then.
- Hand this brainstorm to designman for `content-source.design.md`: the three questions of the contract, the article schema, the configuration shape as data, and the build-time-only guarantee.
- Carry back into the story what the brainstorm settled: the corpus is 11 articles and not 13, the bar of the story's own decision is met on traversal count and missed on the working-directory walk, and the story's Gap 1 is closed by the epic's arbitration of 2026-07-29.
