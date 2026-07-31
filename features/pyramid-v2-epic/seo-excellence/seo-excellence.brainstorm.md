# Brainstorm : SEO excellence on the v2 site

**Date :** 2026-07-29
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Sources read

`seo-excellence.story.md`, `pyramid-v2.epic.md` (Décisions structurantes of 2026-07-29), `root.archi.md`, `ubiquitous-language.md`, `business-rules.md`, `ROADMAP.md`, the stories seo-url-scheme and migrate-learn-content, and the v1 code: `apps/robusta/src/seopyramids.config.ts`, `src/app/layout.tsx`, `src/app/learn/layout.tsx`, `src/app/learn/page.tsx`, `src/app/learn/[...path]/page.tsx`, `src/app/learn/tag/[tag]/`, `src/logic/posts.ts`, `src/logic/tags.tsx`, `src/logic/categories/robusta-categories.ts`, and the frontmatter of the 11 articles of `content/blog`.

Corrections applied to the story's own Contexte, which predates the arbitration pass of 2026-07-29: the corpus is the 11 articles of `apps/robusta/content/blog`, not 13; the declared language split is 6 English and 5 French, and the real split is 8 and 3 because two English articles carry `locale: "fr"`; the "Gap 2 of migrate-learn-content" citation of the story's first decision points at nothing — the matching decision in that story is dated the same day and says the same thing, so the conclusion holds and only the reference is dead.

The registry was read in its state of 2026-07-29 19:16, which holds four rules. It disagrees with the epic on two of them, and this brainstorm cites the registry for what it states and the epic's dated decisions for what the registry no longer covers. Both disagreements are Gaps 1 and 2 below.

## What this story decides, and what it only inherits

Inherited from seo-url-scheme (item 4), and therefore never fixed here: the path of every page, the root segment of the content section, and the shape of pagination. This story states invariants that hold whatever those come out as — a canonical is self-referencing and derived from the route, page one of a roll has exactly one URL, an article URL does not carry its category. One consequence is worth watching on that side: the target scheme uses `/blog` as the root and `articles` as the article discriminant, and the arbitration renamed the root to `articles`, so the two segments now collide in the same path. That is seo-url-scheme's to resolve, not this story's.

Inherited from migrate-learn-content (item 7): which articles exist, their frontmatter, their slugs, their images, and the redirect of the v1 tag URLs.

Decided here: what a page declares about itself, which pages are offered to a search engine at all, how the declaration is verified, and what the site refuses to declare.

## Requirements

BR-PYRAMID-4 — "We focus on SEO best practices" — is the rule this story exists to enforce, and the whole list below is its enforcement. The rule states an intention rather than an invariant, so it is not checkable on its own; every requirement here is, which is the translation the story's Contexte calls "the actual work". It is not the rule about indexable pages that was refused registration — that one is still unrecorded, see Gap 2.

BR-PYRAMID-1 — "The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source." — carries the first three requirements: a page's identity is read off its route, never off the content source, which is exactly what makes a canonical and a sitemap entry derivable without loading an article.

- R-SEOEXCELLENCE-1 — Every indexable page declares one canonical URL, its own, built from the route rather than from the content source.
- R-SEOEXCELLENCE-2 — Two URLs that serve the same content declare the same canonical, and page one of a blog roll is reachable at exactly one URL.
- R-SEOEXCELLENCE-3 — The pages the site generates and the entries of its sitemap come from one inventory of indexable pages, so neither can list what the other omits.
- R-SEOEXCELLENCE-4 — Every indexable page carries a title and a description of its own; no page falls back to the site's default title or description.
- R-SEOEXCELLENCE-5 — Every title and every description is unique across the site.
- R-SEOEXCELLENCE-6 — An article's description comes from its frontmatter description when present, and from its lede otherwise; a description is never empty and never longer than 160 characters.
- R-SEOEXCELLENCE-7 — No keyword is added to a page by site configuration; a page declares only terms carried by its own content.
- R-SEOEXCELLENCE-8 — A category holding no article of its own is neither generated, nor linked, nor listed.
- R-SEOEXCELLENCE-9 — The sitemap lists every indexable page and nothing else, each with a last-modification date, and no page it lists is blocked from crawling.
- R-SEOEXCELLENCE-10 — A page that is not offered to search engines says so on the page itself; the crawl file never blocks a page whose exclusion has to be read on the page.
- R-SEOEXCELLENCE-11 — An article page declares structured data covering the article and its position in the site, limited to what the page displays.
- R-SEOEXCELLENCE-12 — Every page declares the language it is written in, and two articles declare each other as alternates only when one is the translation of the other.
- R-SEOEXCELLENCE-13 — Every article links to its category, and to the related articles it has; the related block is absent when the article has none.
- R-SEOEXCELLENCE-14 — Two articles are related when they share a category, or share a tag carried by at least two articles; a tag carried by a single article relates nothing.
- R-SEOEXCELLENCE-15 — An article slug is unique across the whole site, since the article URL does not carry its category.
- R-SEOEXCELLENCE-16 — No internal link of the site points at a page the site does not generate.
- R-SEOEXCELLENCE-17 — Nothing the site declares for search engines requires code running in the visitor's browser.

---

## 1. Product Role

The v1 site is the counter-example, and it is worse than the story records. `src/app/learn/layout.tsx` sets the title `Robusta Build: Blog layout` and the description `page description`, and `src/app/learn/[...path]/page.tsx` — the route that serves every article, every category and every roll page — exports a static metadata object holding an icon and a stylesheet, and no title, no description. So the entire v1 blog, articles included, declares one title and one description to search engines. The canonical is a `TODO` comment in `learn/page.tsx`, and there is no sitemap and no `robots.txt` anywhere under `src` or `public`.

This story is the site's declaration layer: what each page says it is. It is not a growth feature, and none of its output changes what a reader sees except the breadcrumb and the related-articles block.

What it is NOT: off-site SEO, keyword research, content rewriting, Core Web Vitals tuning, image optimization, analytics of any kind, and any form of ranking promise.

**Décision (autonome):** seo-excellence delivers a declaration layer plus its verification, and stops at the boundary of the page's own truth.

**Rationale:** the story's four "not aggressive" clauses all reduce to the same statement — a page declares what it is and nothing more — so the deliverable is a contract plus the check that the contract holds.

---

## 2. Target Audience

Three audiences, and only one of them is human at read time.

- The crawler. It never asks a question, it takes what is declared. Everything here is written for it.
- The publisher — one person, technical, sole author, no SEO tooling and no appetite for a maintenance chore. Anything that needs manual upkeep per article will rot; the corpus has not been touched since 2022.
- The implementer of the next site. The epic exists to make a second site cheap, so what robusta-build does here is the template the next site copies. That argues for the SEO contract living in the shared base and being fed by the site configuration, not hand-written per page.

**Décision (autonome):** the metadata contract is derived, never authored — the publisher writes an article, and every declaration follows from the article and its route.

**Rationale:** a sole author with no maintenance budget is the only constraint that matters, and derived metadata cannot drift from the content the way hand-written metadata does.

---

## 3. Core Problem

Search engines cannot tell v1 pages apart: one title and one description for the whole blog, no sitemap to enumerate the pages, no canonical to disambiguate, no structured data to characterize an article. At the same time, `mandatoryKeywords: ['robusta build', 'freelance']` is appended to every article's keyword list in `posts.ts`.

That second half deserves a correction, because it changes how much this story is actually undoing. The keyword list is computed on the `Post` model and never reaches any metadata object — nothing in `src` outside the parser and its tests reads `keywords`. So the aggressive pattern was written but never shipped. Dropping it removes an intention, not an output.

**Décision (autonome):** the problem is stated as declaration, not promotion — pages that cannot be told apart, not pages that rank badly.

**Rationale:** ranking is not something this story can move or measure, while "no page falls back to a shared title" is checkable on the build output.

---

## 4. Unique Value Proposition

Options considered:

- An SEO library or plugin producing the tags from a configuration block. Rejected: it adds a dependency and a second source of truth next to the route scheme, and BR-PYRAMID-1 already makes the route the authority.
- Hand-written metadata per route. Rejected: eleven articles today, and a sole author — it drifts on the first article added.
- One inventory of indexable pages, feeding page generation, the sitemap and the internal links alike.

**Décision (autonome):** the site's indexable pages are enumerated once, and generation, sitemap and verification all read that enumeration.

**Rationale:** it makes "an indexable page absent from the sitemap" structurally impossible instead of merely tested, and it is the piece the next site inherits.

---

## 5. Functional Scope

In scope: the metadata contract per kind of page, the indexable-page inventory, the sitemap and the crawl file, structured data on article pages, the breadcrumb and related-articles links, and the build-time audit that gates all of it.

Out of scope, explicitly: analytics and visitor tracking, Core Web Vitals, off-site SEO, tag pages on the v2 site, editorial rewriting of articles, image optimization, and internationalized routing beyond what seo-url-scheme defines.

The v1 category tree is declared in configuration — `robusta-categories.ts` lists seven paths — and it is wrong in both directions: `blockchain/ethers-js`, `blockchain/solidity` and `javascript/react` hold no article, while `privacy` and `theory` hold one each and are not declared at all. The v1 code compounds it, since `getPostsByCategory` requires an exact match of the whole category array.

**Décision (autonome):** the v2 category tree is derived from the articles, and the configured category list is not carried over.

**Rationale:** it satisfies "a category holding no article is neither linked, nor listed, nor generated" by construction rather than by filtering, and it removes the class of bug where the tree and the corpus disagree.

At the current corpus the inventory is about 23 URLs: the landing page, the blog home, six category pages and eight articles in the default locale, plus a blog home, three category pages and three articles in French. At a roll size of 12, no roll has a second page — every pagination URL is hypothetical today.

### Vocabulary proposed to the registrar

Two terms are used above as decision criteria and are absent from `ubiquitous-language.md`. They are proposed here, not registered — the story's Documentation updates already plan the registration, and one business rule is blocked on the first of them.

Indexable page
: A page a site offers to search engines. A page is indexable when it is addressed by a URL of its own and carries content of its own; a page that only routes, redirects, or repeats what another page already holds is not.

Related articles
: The articles a site offers a reader at the end of an article, chosen among published articles of the same locale from the categories and tags they share. An article with nothing relevant to offer has no related articles, and the set is then empty.

---

## 6. Core Features

### Feature: Page metadata contract

**Capability:** every indexable page declares a title, a description, a canonical URL and its language, derived from its route and its content. An article's description is its frontmatter description if it has one, its lede otherwise. Not one of the eleven articles carries a description field today, so the lede is the real source; `posts.ts` throws when an article has no lede, so the source is guaranteed to exist. Ledes measured in the corpus run from 57 to about 200 characters, plus two articles whose separator is `-----` and whose lede has to be cut.

**Acceptance Criteria:**
- Given any generated page of the site, When its head is read, Then it carries a title and a description found on no other page, and neither comes from the site's default.
- Given an article with no description in its frontmatter, When its page is generated, Then the description is its lede, trimmed to at most 160 characters on a word boundary.
- Given the two articles whose lede separator is `-----`, When their pages are generated, Then the description stops at that separator and does not contain the article body.
- Given a URL that differs from the canonical form only by a trailing slash or by a pagination parameter that changes nothing, When the page is served, Then it declares the canonical form and not itself.

**Test Approach:** automated audit over the built output, asserting presence, uniqueness and length bounds on every generated page.

---

### Feature: Indexable-page inventory

**Capability:** one enumeration of the pages the site offers to search engines, derived from the routes and the corpus, consumed by page generation, by the sitemap and by the audit. Empty categories never enter it, because categories come from the articles.

**Acceptance Criteria:**
- Given the corpus of eleven articles, When the site is built, Then the inventory holds the landing page, the blog homes, one category page per category holding at least one article in that locale, and one page per article, and nothing else.
- Given the `security` and `prompt` folders, which hold images and no article, When the site is built, Then no category page is generated for them and no link points at one.
- Given a category whose only article is written in the other locale, When the locale's category pages are generated, Then that category has no page in that locale.

**Test Approach:** unit tests on the inventory against corpus fixtures, including the empty-folder and single-locale cases.

---

### Feature: Sitemap and crawl file

**Capability:** `sitemap.xml` generated from the inventory, each entry carrying a last-modification date; `robots.txt` naming the sitemap and blocking nothing it lists.

**Acceptance Criteria:**
- Given the built site, When the sitemap is compared to the generated pages, Then every indexable page appears exactly once and no entry points at a page that was not generated.
- Given `robots.txt`, When it is read, Then it names the sitemap URL and disallows no path that the sitemap lists.
- Given a page the site chooses not to offer, When it is inspected, Then the page itself declares the exclusion and `robots.txt` leaves it crawlable, so the exclusion can be read.

**Test Approach:** automated audit cross-checking the sitemap against the generated route list, plus one fetch of the deployed files.

---

### Feature: Structured data on article pages

**Capability:** an article page declares the article — headline, publication date, author, language, image — and its breadcrumb. Two articles carry no author in their frontmatter (`leaving-gmail`, `easy-automation-with-sonoff`) and fall back to the author of the site configuration. Image paths are relative in the frontmatter, one of them climbing out of its folder (`../images/styled-logo.png`), so they are resolved to absolute URLs.

Options considered: adding a site-level organization declaration and a search action. The search action is refused outright — the site has no search — and the organization declaration is kept to the landing page, where it describes something the page actually shows.

**Acceptance Criteria:**
- Given an article page, When its structured data is read, Then every field it declares matches a value the page displays, and the breadcrumb path matches the page's own URL.
- Given an article with no author in its frontmatter, When its page is generated, Then the declared author is the site configuration's author and the page displays that same name.
- Given a category page or a blog roll, When its structured data is read, Then it declares nothing beyond the breadcrumb.

**Test Approach:** automated validation of the extracted structured data against the rendered page values, plus one manual pass through a rich-results validator per kind of page.

---

### Feature: Internal linking

**Capability:** each article links to its category through a breadcrumb, and to its related articles. Relatedness follows R-SEOEXCELLENCE-14, which reuses the v1 notion of a valuable tag from `tags.tsx` — a tag carried by at least two articles, minus the silent ones. Related articles are ranked category first, then by recency, and capped at three.

The corpus shows both ends of it. `leaving-gmail` is alone in `privacy`, but shares the tag `web` with `easy-automation-with-sonoff`, so it has one related article across categories. `quel-second-langage` is alone in `theory`, its two tags are carried by no other article, and it is the only French article of its category — so it has none, and its block disappears rather than being padded.

**Acceptance Criteria:**
- Given an article sharing a category with others, When its page is generated, Then it links to at most three of them, most recent first, and never to itself.
- Given `quel-second-langage`, When its page is generated, Then no related-articles block is rendered at all.
- Given any generated page, When its internal links are followed, Then each resolves to a page the site generated.

**Test Approach:** unit tests on the relatedness selection over corpus fixtures, plus a link crawl of the built output.

---

### Feature: Build-time SEO audit

**Capability:** a check running against the built output that enforces the requirements above and fails the build when one breaks. It is the only enforcement available, since no measurement code ships to the browser.

**Acceptance Criteria:**
- Given a build where two pages share a title, When the audit runs, Then it fails and names both pages.
- Given a build where an indexable page is missing from the sitemap, or the sitemap lists a page that was not generated, When the audit runs, Then it fails and names the URL.
- Given a build where an internal link points at a page that does not exist, When the audit runs, Then it fails and names the link and its source page.
- Given a conforming build, When the audit runs, Then it passes and reports the count of indexable pages, so a silent drop in that count is visible.

**Test Approach:** the audit is itself tested on fixture builds carrying each injected defect; it runs in CI after `next build`.

---

## 7. Critical Edge Cases

- Two articles declare `locale: "fr"` while being written in English — `yield-farming.md` ("The source of Yield Farming profits") and `why-migration-gatsby-next.md`. Every language declaration, alternate and locale-scoped URL derived from that field is wrong for them. Raised as a Gap; not corrected here.
- Only two translation pairs exist — the yield-farming articles and the Gatsby-to-Next pair — and no frontmatter field links a translation to its original. Alternates are declared only where such a link exists; absent it, a page declares its own language and no alternate, which is what the story's definition of done demands.
- Ledes of 57 and 58 characters (`leaving-gmail`, `completes-with`) are short for a description but honest; they are not padded.
- `javascript/typescript` is a nested category holding one article, so the breadcrumb runs three levels deep on `completes-with`.
- Four of six category pages hold exactly one article. Raised as an Open Question.
- Page one of a roll is reachable both bare and with an explicit page-one parameter, whatever shape pagination takes; that duplicate is the one place this story pushes back onto seo-url-scheme.
- The v1 site generates a page for all fourteen tags plus their roll pages; none of them exists in v2, and their redirect is a Gap below.
- An article slug is unique site-wide, because the v2 article URL drops the category. Today's eleven slugs are distinct, and the audit is what keeps that true.
- The shadcn migration will churn the markup around the breadcrumb and the related block. Structured data is declared separately from the rendering, so a restyle cannot silently strip it.

---

## 8. Non-Functional Constraints

Everything here is produced at build time and costs nothing at request time. There is no third-party service, no paid dependency, and no script added to the page.

The privacy constraint is the sharp one, and its authority has to be named carefully. The registry does not forbid visitor tracking under any number today, so this section does not rest on a business rule. It rests on the epic's dated decision of 2026-07-29, which keeps `packages/scribe-intel` and `services/scribe-intel-collector` dormant and out of the v2 build chain, and on the story's own definition of done, which excludes any form of analytics. A decision is enough to settle what this story builds; the missing rule is Gap 1 and belongs to the registrar.

That constraint removes the usual way of knowing whether SEO work worked. Options considered: ship a privacy-respecting analytics tool anyway, wire the dormant intel client back in for this story alone, or measure outside the site.

**Décision (autonome):** no measurement code ships to the visitor. Conformance is measured at build time by the audit, and outcome is read from the search engine's own console, which observes the crawler and not the visitor.

**Rationale:** the epic's decision is about what the site does to a visitor, and a search console reports on crawling and on results the engine already holds, so it needs no code on the site and identifies nobody — it is the one measurement that survives the constraint rather than an exception carved out of it.

A welcome consequence: with nothing tracked, the site owes no consent banner, and the page a crawler and a reader get is the same page.

---

## 9. External Dependencies

- seo-url-scheme (item 4) and migrate-learn-content (item 7) — implementation blockers, per the story.
- Next.js 15.1.8 App Router, for the metadata API and the file conventions that produce the sitemap and the crawl file. No SEO package is added.
- schema.org, for the article and breadcrumb vocabulary. An external standard, not a decision of the publisher.
- The sitemap protocol, likewise.
- Google Search Console and its equivalents, for outcome reading. Verification through a DNS record or a static file, no script.
- The site configuration `seopyramids.config.ts`, for domain, site name, locales, roll size and default author. `mandatoryKeywords` is not carried over.
- Vercel, for hosting and for the build that the audit gates.

**Décision (autonome):** no dependency is added beyond what Next.js already provides.

**Rationale:** every deliverable of this story is a string in a head tag or a generated file, and the corpus is small enough that a library would only add a second place to look.

---

## 10. Major Risks

- The two stories this one depends on are still moving. The pagination shape is arbitrated but not resolved, and the content root segment collides with the article discriminant. Mitigation: the requirements are invariants over whatever the scheme becomes, and the audit checks the invariant, not the path.
- No measurement means no proof of improvement, only proof of conformance. Accepted, and stated as such in axis 8 rather than worked around.
- Over-engineering an eleven-article corpus dating from 2019 to 2022. Every criterion here is checkable on the build; nothing was added because a bigger site would want it.
- Declaring more than the page shows, which is what earns a structured-data penalty. Mitigation: the declaration is derived from the values the page renders, and the audit compares the two.
- The locale data bug shipping as-is, producing wrong language declarations on two of eleven articles. Raised as a Gap; owned upstream.
- A silent regression — an article dropping out of the sitemap after a refactor. Mitigation: the audit reports the indexable-page count on success, so a drop is visible in the build log.

---

## Next Steps

- Arbitrate the five Gaps — three of them are registry and vocabulary work owned by epicman, two are upstream corrections owned by seo-url-scheme and migrate-learn-content.
- Run designman on this story once items 4 and 7 have settled their route scheme and their corpus, since the canonical and the sitemap take their shape from both.
- Feed the corrections of the Sources section back into the story's Contexte: the corpus is 11 articles, the language split is wrong in the frontmatter, and the "Gap 2 of migrate-learn-content" reference is dead.
