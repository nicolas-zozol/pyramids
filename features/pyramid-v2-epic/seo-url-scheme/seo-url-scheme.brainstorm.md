# Brainstorm : SEO URL scheme of the v2 site

**Date :** 2026-07-29
**Feature :** seo-url-scheme
**Infix :** URLSCHEME
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Sources read: the story and its `## Décisions` of 2026-07-29, `pyramid-v2.epic.md` and its `## Décisions structurantes`, `root.archi.md`, `ubiquitous-language.md`, `business-rules.md`, the Routing section of `apps/robusta/README.md`, and the v1 route code itself (`src/app/learn/**`, `src/logic/routing/*`, `src/logic/categories/robusta-categories.ts`, `src/seopyramids.config.ts`). Where a document and the code disagree, the code decides what is live and the dated arbitrations decide what is wanted.

## The scheme this brainstorm converges on

- `/` — landing page
- `/articles` — blog home, first page of the roll of every article
- `/articles/p/{n}` — page n of that roll, n ≥ 2
- `/articles/c/{category}` — category page, first page of its roll
- `/articles/c/{category}/{sub}` — nested category, one segment per level
- `/articles/c/{category}/p/{n}` — page n of a category roll
- `/articles/{slug}` — one article, category-free
- `/l/{locale}` prefixing any of the above — the same page in a non-default locale; the default locale carries no marker

Three reserved segments carry the whole thing: `l` at the head of a path for the locale, `c` under the content root for a category, `p` for a roll page. An address that matches none of them under the content root is an article. That is the smallest set of discriminants that still lets the site name the kind of every page from the address alone.

## Requirements

BR-PYRAMID-1 — "The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source." — is the rule this story carries, and every requirement below either implements it or protects it.

- R-URLSCHEME-1 — The site determines from the shape of an address alone whether it designates the landing page, a blog home, a category page, a roll page or an article, without reading any article.
- R-URLSCHEME-2 — The content section of the site is rooted at one segment, `articles`. That segment is site configuration; the discriminants that follow it belong to the shared base.
- R-URLSCHEME-3 — An article is addressed by its slug alone under the content root. Its category is not part of its address, so recategorizing an article never breaks a published address.
- R-URLSCHEME-4 — A category is addressed under the category discriminant, and a nested category extends that address with one segment per level.
- R-URLSCHEME-5 — A category page presents the articles of that category and of every category descending from it.
- R-URLSCHEME-6 — The set of category addresses is derived from the categories the articles declare. No category address exists that no article claims, and every category an article claims has an address.
- R-URLSCHEME-7 — A blog roll is paginated by a page discriminant carrying the page number. The number of articles per page is the roll size of the site configuration and never appears in an address.
- R-URLSCHEME-8 — The first page of a blog roll is addressed by the roll's own address; the explicit page-one form redirects to it permanently.
- R-URLSCHEME-9 — A page in a non-default locale carries the locale discriminant at the head of its address. The default locale carries no marker, and the marked form of a default-locale address redirects permanently to the unmarked one.
- R-URLSCHEME-10 — A page is reachable at exactly one address. Any other form that would serve the same content redirects permanently to that address.
- R-URLSCHEME-11 — The discriminant segments are reserved words: no article slug and no category slug may take one of those values, and the site refuses to build if one does.
- R-URLSCHEME-12 — An article slug is unique within its locale across the whole site, and the site refuses to build on a collision.
- R-URLSCHEME-13 — Every content address of the site is produced at build time. No content page is resolved at request time, and no content route reads search parameters.
- R-URLSCHEME-14 — Every address the v1 site published has a destination on the v2 site, and that mapping is written down and reviewable before any redirect ships.
- R-URLSCHEME-15 — An address whose content does not travel to the v2 site is retired deliberately rather than redirected to a page that does not answer it.

---

## 1. Product Role

The story is the addressing contract of robusta.build v2: the set of address shapes, what each one means, which of them the site offers to a search engine, and what every address the v1 site published becomes. It is the piece three other stories are waiting on — migrate-learn-content needs the redirect targets, seo-excellence needs stable addresses to derive canonicals and a sitemap from, and content-source needs to know which addresses the build has to produce.

What it is not, and the boundaries matter because four stories overlap here:

- Not the pages themselves. No component, no layout, no roll rendering.
- Not the metadata. Canonical tags, hreflang, sitemap, structured data and internal linking are seo-excellence, even though the scheme is what they compute from.
- Not the content pipeline. How an article's category and locale reach the router is content-source.
- Not the redirect implementation. This story fixes the targets and the map; migrate-learn-content ships the redirects with the content.

**Décision (autonome):** the deliverable is a scheme plus a v1-to-v2 mapping, exercised on fixture articles, with the actual redirects and the real corpus arriving with migrate-learn-content.

**Rationale:** the story cannot ship redirects for content that is not on the site yet, but every other story is blocked until the targets are fixed, so the map is the part that must be finished here.

---

## 2. Target Audience

Four consumers, and they do not want the same thing:

- The search-engine crawler. It is the primary audience and the only one that punishes mistakes durably: an address that changes without a redirect loses its position, and two addresses for one page split it.
- The reader looking at a link before clicking it. `/articles/why-migration-gatsby-next` says what it leads to; `/learn/javascript/s/why-migration-gatsby-next` says the same thing three segments later.
- The next site built on the pyramid. BR-PYRAMID-1 sits at epic level, not story level, so the scheme is the base's contract and not robusta's private arrangement. dakar.surf has spots, not articles, which constrains how much of the scheme may be hard-coded in the shared base.
- The developer of the v2 site, who needs the address to be resolvable by reading it, because that is what allows the whole content section to be pregenerated.

**Décision (autonome):** the crawler arbitrates when the crawler and the reader disagree, and the base-versus-site split is treated as a first-class constraint rather than a detail (see axis 8).

**Rationale:** the site exists to be found; a reader who never sees the page in a result page never reads the link either.

---

## 3. Core Problem

The v1 scheme, as the code actually implements it, has five defects and the fifth is the expensive one.

- It is deep. `/learn/blockchain/s/ledger-versus-metamask` spends three segments before naming the article.
- It buries the category inside every article address, so recategorizing an article breaks a published address — and the UL is explicit that a slug never changes once published.
- `learn` names a section nobody searches for.
- The category tree is declared in `seopyramids.config.ts` independently of what the articles claim, and the two have drifted apart. The config declares seven paths — `blockchain`, `blockchain/ethers-js`, `blockchain/solidity`, `web`, `javascript`, `javascript/typescript`, `javascript/react` — while the eleven articles claim six — `blockchain`, `javascript`, `javascript/typescript`, `privacy`, `theory`, `web`. Three declared categories hold no article at all, and two categories that hold articles are declared nowhere. The consequence is not cosmetic: `parseUrl` rejects any category absent from the declared list, so `/learn/privacy/s/leaving-gmail` and `/learn/theory/s/quel-second-langage` are pregenerated by `generateStaticParams` and then 404 at request time. Two of the eleven articles are unreachable on the live v1 site today.
- Every one of those addresses is already published, and the domain does not switch. The 2026-07-29 arbitration is unambiguous — "the domain won't switch. We need some redirect for old pages in `/learn/...`" — so v2 inherits the whole v1 address space on robusta.build rather than starting clean.

**Décision (autonome):** the problem is stated as one of address migration under a fixed domain, not of address design in a vacuum.

**Rationale:** a scheme that is elegant and unmappable costs more than a scheme that is ordinary and mappable, because the loss is permanent and the gain is aesthetic.

---

## 4. Unique Value Proposition

**Options considérées:**

- Keep the v1 scheme and only rename `learn` to `articles`. Cheapest map, one rule. Keeps the category buried in every article address, which is the defect the story's own definition of done singles out.
- Flat addresses at the root, `/{slug}`. Shortest possible, best for a reader. Breaks BR-PYRAMID-1 outright: the site cannot tell `/pricing` from an article without asking the content source, and every future top-level page becomes a slug collision.
- One reserved discriminant per page kind — `/articles/a/{slug}` alongside `/articles/c/{category}`. Perfectly symmetric and unambiguous. Spends a meaningless segment on the page kind that carries the site's whole SEO value.
- One content root, reserved discriminants for the non-default kinds, and the bare form for the article.

**Décision (autonome):** the last one. The article, which is what the site is trying to rank, gets the shortest address of the scheme; the category and the roll page pay one reserved segment each.

**Rationale:** reserving `c` and `p` is enough to make every address resolvable by shape alone, so a second discriminant for the article would satisfy symmetry and nothing else.

---

## 5. Functional Scope

In scope:

- The address shape of every kind of page on the v2 site, including the landing page's place in the scheme.
- The reserved segments, and the build-time refusal that protects them.
- The pagination shape and where the roll size comes from.
- The locale prefix and the canonical form of a default-locale address.
- How the set of category addresses is determined.
- The complete mapping from the v1 address space to the v2 one, including the shapes nobody has claimed yet: the tag addresses, the raw markdown addresses under `public/learn`, and `/portfolio`.
- The single-address invariant and the redirects that enforce it.

Explicitly out:

- Canonical tags, hreflang, sitemap, `robots.txt`, structured data, internal linking — seo-excellence, which computes them from this scheme.
- Rendering of the landing page, the rolls and the articles.
- How articles reach the router — content-source.
- The redirects as shipped code, and the content move — migrate-learn-content.
- Which of the five articles that exist only under `public/learn` get republished — an editorial call migrate-learn-content deferred. The scheme states what their addresses do in the meantime, which is not the same question.
- `/prosemirror/*` and `/test/*`, v1 development leftovers with no editorial value.

**Décision (autonome):** the scheme claims the routing half of the tag question and the raw-markdown addresses, both of which currently sit in nobody's story, and leaves the editorial half where it is.

**Rationale:** an address with no owner is an address that ends on a 404 the day the v1 site stops answering, and this is the only story whose subject is addresses.

---

## 6. Core Features

### Feature: The v2 address scheme

**Capability:** a fixed set of address shapes under one configurable content root, with three reserved discriminants — `l`, `c`, `p` — from which the site names the kind of any page without consulting an article.

**Acceptance Criteria:**

- Given the address `/articles/leaving-gmail`, When the site resolves it, Then it identifies an article page with slug `leaving-gmail` and does so without reading the article set.
- Given the address `/articles/c/javascript/typescript`, When the site resolves it, Then it identifies the category page of the nested category `javascript/typescript`.
- Given an article whose slug is `c` or `p`, or a category whose slug is one of them, When the site is built, Then the build fails and names the offending slug.
- Given two articles in the same locale with the same slug in different categories, When the site is built, Then the build fails and names both files.

**Test Approach:** unit tests on the address parser over a table of addresses and expected page kinds, including every reserved-word and boundary case; a build-level check that fails on a reserved or duplicated slug, exercised on fixtures.

---

### Feature: Path pagination at a fixed roll size

**Capability:** a blog roll is paginated by a `/p/{n}` path segment; the number of articles per page comes from the site configuration and never from the address.

**Acceptance Criteria:**

- Given a roll of 30 articles and a roll size of 12, When the site is built, Then `/articles`, `/articles/p/2` and `/articles/p/3` are pregenerated and no other roll address exists.
- Given the address `/articles/p/1`, When it is requested, Then it redirects permanently to `/articles`.
- Given the address `/articles/p/4` on that same roll, When it is requested, Then the site answers 404 rather than an empty roll.
- Given any roll address, When it is requested, Then the route reads no search parameter and the response is served from the pregenerated build output.

**Test Approach:** integration tests over the generated route table on a fixture corpus sized to force three pages; a build assertion that no content route is marked dynamic; a redirect test on the page-one and out-of-range forms.

---

### Feature: Locale prefix

**Capability:** a non-default locale is a `/l/{locale}` prefix at the head of the path, applying to every kind of page including the landing page; the default locale carries no marker.

**Acceptance Criteria:**

- Given a French article, When the site is built, Then it is addressed `/l/fr/articles/{slug}` and no unmarked form of it exists.
- Given the address `/l/en/articles/leaving-gmail` where `en` is the default locale, When it is requested, Then it redirects permanently to `/articles/leaving-gmail`.
- Given a reader whose browser prefers French arriving at `/articles/leaving-gmail`, When the page is served, Then no automatic redirect to a locale occurs.

**Test Approach:** route-table assertions per locale on fixtures carrying both locales; redirect tests on the marked default-locale form; an explicit test that no negotiation-based redirect exists, since that is the failure mode that silently breaks crawling.

---

### Feature: Derived category addresses

**Capability:** the set of category addresses comes from the categories the articles declare, not from a list maintained beside them, and a category page presents its own articles and those of its descendants.

**Acceptance Criteria:**

- Given a corpus where no article claims `blockchain/solidity`, When the site is built, Then no address exists for that category.
- Given an article claiming `privacy` and no configuration mentioning it, When the site is built, Then `/articles/c/privacy` exists and serves that article.
- Given articles claiming `javascript` and `javascript/typescript`, When `/articles/c/javascript` is requested, Then the roll presents both.

**Test Approach:** build the fixture corpus and compare the generated category address set against the categories declared by the fixtures; a roll-composition test on a parent category with a populated descendant.

---

### Feature: The v1 to v2 mapping

**Capability:** a written, reviewable mapping covering every address shape the v1 site published on robusta.build, expressed as a small set of patterns plus a short exception list.

**Acceptance Criteria:**

- Given the address `/learn/blockchain/s/ledger-versus-metamask`, When it is requested on the v2 site, Then it redirects permanently to `/articles/ledger-versus-metamask`.
- Given the address `/learn/fr/javascript/page/2`, When it is requested, Then it redirects permanently to `/l/fr/articles/c/javascript/p/2`.
- Given an address under `/learn` whose article is not part of the migrated corpus, When it is requested, Then the site answers 410 rather than redirecting to an unrelated page.
- Given the mapping, When it is checked against the v1 route code, Then every address shape that code can serve appears in it exactly once.

**Test Approach:** a table-driven redirect test running the full mapping against the built v2 site, one case per v1 address shape and one per known live article address; a completeness check that enumerates the v1 route table and asserts each entry is covered.

---

## 7. Critical Edge Cases

Technical:

- Reserved word as a slug. An article slugged `c` or a category named `p` makes the scheme ambiguous. Handled by R-URLSCHEME-11, at build time rather than at request time.
- Global slug uniqueness. Dropping the category from the article address is what makes the redirect map expressible as a pattern — `/learn/:cats*/s/:slug` maps to `/articles/:slug` only because the slug alone identifies the article. The eleven articles of the corpus have eleven distinct slugs today, so the constraint costs nothing now and must be enforced before it does.
- Out-of-range roll pages. `/articles/p/999` answers 404, not an empty roll, so the site never offers an empty page to the index.
- Trailing slash and letter case. One form is canonical, the other redirects. This is the cheapest way for two addresses of one page to appear, and it appears without anyone deciding it.
- Nested category boundaries. `/articles/c/blockchain/security/p/2` has to split into a two-level category and a page number, which works because `p` is reserved at every level.

Product and content:

- The frontmatter locale is wrong on at least two articles. `yield-farming.md` and `why-migration-gatsby-next.md` are English pieces declaring `locale: "fr"`, and the locale is what puts a page under `/l/fr/`. A wrong locale is a wrong address, which redirects the article to a page nobody asked for. Raised as Gap 4.
- Raw markdown addresses. `apps/robusta/public/learn` holds thirteen `.md` files, and everything under `public/` is served verbatim, so `/learn/privacy/leaving-gmail.md` returns the raw source of an article that also exists as HTML at another address. That is duplicate content published on the domain by accident. The v2 site inherits those addresses along with the rest.
- Two of the eleven articles 404 on v1 today because their category is undeclared. The mapping must be built from what the v1 code actually resolves and verified against the live site, not from `generateStaticParams`, which pregenerates addresses the route then refuses.
- Tag addresses. `/learn/tag/{tag}` and `/learn/tag/{tag}/page/{n}` exist in v1 over fourteen distinct tags. Six of those tags — `javascript`, `blockchain`, `web`, `security`, `solidity`, `react` — name something that is or was a category; the other eight name nothing on the v2 site. See Open Question 2.
- `/portfolio` and `/fr/portfolio` are published v1 addresses that no v2 story claims. See Gap 3.

Usage:

- A category emptied of its articles. Under R-URLSCHEME-6 its address stops existing at the next build, which turns a published address into a 404 silently. The mapping is the place where that becomes visible, and the general answer is R-URLSCHEME-15.
- An article moved between categories. Under R-URLSCHEME-3 nothing happens to its address, which is the whole point of the choice.

---

## 8. Non-Functional Constraints

The registry rule BR-PYRAMID-2 — "We embrace the constraints of Vercel, React Server Component and shadcn" — is the one that decides the pagination shape, and it decides it against the shape the epic and the ROADMAP still announce.

**Problème:** query-parameter pagination, `?page=12&size=20`, was the epic's announced shape. The 2026-07-29 arbitration reopened it — "do what is better for seo and speed ; for category page, having `/p/1` with fixed size is probably better" — and asked for the answer on SEO and speed grounds.

**Options considérées:**

- Query parameters with a reader-controllable size. Speed: a route that reads search parameters is resolved per request, which takes the whole content section out of static generation and contradicts the reason `ubiquitous-language.md` gives for discriminants existing at all. SEO: a `size` parameter multiplies addresses over the same articles, which is duplicate content and wasted crawl budget, and each combination needs a canonical decision nobody wants to make.
- A path segment at a fixed size. Speed: every roll page is pregenerated and served from the CDN, and nothing is resolved at request time. SEO: one address per page of the roll, each self-canonical, no parameter surface at all.

**Décision (autonome):** pagination is a `/p/{n}` path segment at the roll size of the site configuration, on every blog roll — the blog home as well as a category page — and no `size` appears in any address.

**Rationale:** the path form wins on both criteria the arbitration named, and applying it to only one kind of roll would give one site two pagination shapes, two canonical stories and two redirect patterns for nothing.

The numbers behind that, since the arbitration asked for numbers: the corpus is 11 articles and the configured roll size is 12, so the blog home is one page and every category is one page. Pagination produces zero additional addresses on robusta.build today. The whole content section comes to roughly two dozen pregenerated pages. Build cost is not a criterion at this scale, which is precisely why the choice should be made on what the scheme costs when it is wrong rather than on what it costs to build.

Other constraints:

- Every content page is pregenerated. R-URLSCHEME-13 turns the story's line "any page the pagination choice turns dynamic is named explicitly" into a shorter answer: none.
- Redirects are permanent and served before rendering. The mapping is roughly ten patterns plus a short exception list, small enough to stay readable in review.
- No locale negotiation. A redirect based on the reader's browser language makes the site serve different content to a crawler than to a reader at the same address.
- Addresses are lowercase and ASCII. The corpus already complies; the constraint is there so the first accented French slug does not decide it by accident.
- The base-versus-site split. `articles` is robusta's editorial word and belongs to `seopyramids.config.ts`; `l`, `c` and `p` are the pyramid's contract and belong to the shared base. Hard-coding `articles` in the base would repeat, in one segment, the exact mistake the epic diagnosed — the base and the site growing into each other. See Open Question 3.

---

## 9. External Dependencies

- bootstrap-robusta-build, item 3 of the epic. No route ships before `apps/robusta-build` exists. Brainstorm and design proceed; implementation does not.
- content-source, item 5. The scheme needs an article's slug, category and locale at build time. Which mechanism delivers them is that story's; that they are available at build time and not at request time is this story's constraint on it.
- migrate-learn-content, item 7. Consumes the mapping, ships the redirects, and owns the correction of the frontmatter defects the scheme surfaces.
- seo-excellence, item 8. Derives canonicals, hreflang, sitemap and structured data from the scheme. Its criterion "no indexable page without content of its own" is what decides whether a thin nested category deserves an address at all; the scheme decides the shape of that address, not its existence.
- Next.js App Router on Vercel. Static segments, catch-all segments and `generateStaticParams` are what make the scheme pregenerable, and reading search parameters is what would break it.
- `seopyramids.config.ts`. Holds the content root, the roll size, the default locale and the other locales. `mandatoryKeywords` is dropped by seo-excellence and does not concern the scheme.
- The published address space of robusta.build itself. It is an external dependency in the sense that matters: it is not under the project's control, and what is actually indexed has to be checked against the live site and Search Console rather than inferred from the v1 code alone.

---

## 10. Major Risks

- Losing indexed traffic through an incomplete map. The highest-consequence risk of the story, because the loss is silent and slow. Mitigation: R-URLSCHEME-14 makes the map a reviewable artefact enumerated from the v1 route code, and the completeness check is an acceptance criterion rather than a habit.
- The cutover is atomic. Since the domain does not switch, robusta.build cannot be served by both sites, so the v2 site must carry the whole v1 address space on the day it goes live. Item 12 of the epic, retire-robusta-v1, is therefore a switch rather than a fade, and the redirects have to be right on the first attempt.
- The scheme is published and then regretted. A slug never changes once published, and the same is true of a discriminant: `c` and `p` are as permanent as any slug. Mitigation: keep the reserved set at three, and keep the section root in site configuration so a future site is not forced into robusta's vocabulary.
- Global slug uniqueness becomes a constraint on the editor. Dropping the category from the article address means two articles can never share a slug within a locale. The corpus complies today; a growing corpus will eventually collide, and a build failure at that moment is a good outcome only if it is expected.
- Four stories overlapping on one subject. seo-excellence, migrate-learn-content and this story all legislate on addresses, and two dated decisions about tag addresses already exist in two other stories citing each other. Mitigation: the scheme claims the routing statements explicitly (axis 5) instead of assuming someone else did.
- Documents that contradict the arbitrations. The epic's Contexte, item 4 of its À faire and ROADMAP item 4 still describe `/blog/c/{category}` and query-parameter pagination, and the story's own Target scheme section still lists `/blog` and `?page=12&size=20`. Anyone implementing from those lands somewhere else entirely. Mitigation: this document states the scheme once, in full, at the top.

---

## Next Steps

- Arbitrate the entries above. Open Question 1 gates the design: the pagination shape decides the route table, the sitemap surface and the redirect patterns, and three other stories consume all three.
- Run designman on the story once Open Questions 1 and 3 are settled, to produce the route table, the parser contract and the v1-to-v2 mapping as a reviewable artefact.
- Two documentation consequences worth carrying into the story rather than discovering later. The story's plan to change the Discriminant entry of `ubiquitous-language.md` reverses direction: with path pagination the roll page is a discriminant like the others and the pregeneration rationale holds without qualification, so the edit is to add the pagination discriminant, not to weaken the reason. And `apps/robusta/README.md` documents the v1 article discriminant as `p` while the code uses `s` — the mapping is built from the code, and the README stays wrong as v1 documentation debt unless someone claims it.
- Feed Gap 2 to seo-excellence: with "indexable page" defined, the rule it holds returns to the registrar, and Gap 1 says under which number.
