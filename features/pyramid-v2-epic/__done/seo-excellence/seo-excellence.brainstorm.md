# Brainstorm : SEO excellence on the v2 site

**Date :** 2026-10-06 — rework of the version of 2026-07-29, which stays in git
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Sources read

`seo-excellence.story.md`; `pyramid-v2.epic.md`, its À faire item 3 and its decisions of 2026-07-30 to 2026-08-02; `ROADMAP.md`; `business-rules.md`; `ubiquitous-language.md`; `root.archi.md`; the article-page story; the robusta-landing-page and design-system-responsive stories; `apps/robusta-build/README.md` and `robusta-build.archi.md`. Code: the root layout, `ArticleView`, the fourteen route files, `content-urls.ts`, `article-index.ts`, `article-lookup.ts`, `corpus-freeze.spec.ts`, `NotesSection`, `check-route-table.mjs` and `seopyramids.config.ts` of `apps/robusta-build`; `url-set.ts` of `pyramids-routing`; `contract.ts` of `pyramids-content`; the eleven articles, read through `readCorpus` and as markdown.

Since the version of 2026-07-29, seo-url-scheme, content-source, migrate-learn-content and article-page have landed, and the four arbitrations of 2026-07-30 are decisions of the story. This version drops what they settled or overtook: the requirements list, which is designman's to write; the retired BR-PYRAMID-4; the two terms now registered in the glossary; the mislabelled locales; the tag redirects; the author fallback; and site-wide slug uniqueness, which the scheme does not need since an article URL carries its category and its locale marker. Every decision of the story's Décisions section is kept as recorded.

What the v2 site declares today, read in the code: every page carries the root layout's title, `Robusta Build: Freelance ethers.js, solidity, web, blockchain`, its description, `Building Internet the right way`, and `robots: { index: false, follow: false }`. No page exports metadata of its own, and there is no canonical URL, no sitemap, no `robots.txt` and no structured data. Of the 21 content URLs, the 11 articles render as articles and the other 10 — 2 blog homes and 8 category pages — render a `RoutePlaceholder`. Five article pages carry a second `h1`.

### Corrections for the story

- Dependencies: Dep 1 and Dep 2 have landed, migrate-learn-content as `0282952` and article-page as `3ab28e7`, both on 2026-08-02. Dep 3 rests on the noindex lift alone, while the webmaster console reports on robusta.build, which keeps serving v1 until `retire-robusta-v1` moves the domain (OQ-SEOEXCELLENCE-14).
- Contexte: "what is missing is what those URLs address" now holds for the listing routes only (Gap-SEOEXCELLENCE-11).
- Contexte: a category page exists per locale, so the count that matters is 8 pages, 6 of them holding one article — English `privacy`, `typescript` and `web`, and all three French ones. The decision of 2026-07-30 counted four of six across locales; its conclusion stands.
- DoD-5: content-source was delivered on 2026-08-01 as `82c154f`, not on 2026-07-31.
- DoD-10: the vitest setup exists since migrate-learn-content landed.
- The two subjects article-page left to this story — the related-articles block and the five bodies declaring a second `h1`, epic decisions of 2026-08-02 — are named in the epic's À faire and not in the story. The heading structure has no criterion at all.
- The decisions of 2026-07-30 on the social-sharing set and on the webmaster console have no Definition-of-done line.
- The exclusions gain html-lang-locale (epic decision of 2026-08-02).

---

## Acceptance Criteria challenge

The story carries no AC-SEOEXCELLENCE-n: its criteria are a legacy Definition of done (Gap-SEOEXCELLENCE-10). Its bullets are cited here as DoD-1 to DoD-12, in their order.

### Verdicts

- DoD-1, canonical URL — testable on the build, sufficient. "The form the scheme's builder emits" names a mechanism where the glossary's `Canonical URL` now carries the meaning. Its roll-page clause has nothing to check on today's corpus — 8 English and 3 French articles against a roll size of 12 — so it is testable on a fixture corpus only.
- DoD-2, title and description — testable, but "every page" reaches the not-found page and the ten placeholders: "every indexable page". It misses two pages of one name in two locales (edge case 1). The excerpt as description is sound: it is the opening paragraph the page shows (R-ARTICLEPAGE-03).
- DoD-3, structured data — testable. "Declare nothing that the page does not show" requires a visible breadcrumb, which the article page does not render today; the criterion should say so.
- DoD-4, sitemap — testable, in business language. It misses the landing page's date (edge case 7) and inherits the absence of the listing pages (Gap-SEOEXCELLENCE-11).
- DoD-5, the `updated` field — states a type and a package rather than an outcome: "an article may declare when it was last updated". It misses what the page shows of that date (edge case 6).
- DoD-6, `robots.txt` — testable. It misses the two namespaces that must stay crawlable although no sitemap entry sits there (edge case 8).
- DoD-7, internal linking — the category-link half is delivered since article-page (R-ARTICLEPAGE-41) and stays as a regression check; today it points at a placeholder (Gap-SEOEXCELLENCE-11). The related half is testable and misses the locale where every set is empty (edge case 2) and the article leaving publication (edge case 4).
- DoD-8, `mandatoryKeywords` — names a field and a type: "no page declares a term the site configuration adds". Testable.
- DoD-9, language — ambiguous: "declares its own language" reads as `<html lang>`, which html-lang-locale owns. What this story declares is the alternate between the two sides of a pair, and the language of the structured data and of the social-sharing set. It misses the pair with one side unpublished (edge case 5).
- DoD-10, verification — testable. "In the vitest setup" places a check of the built output in a runner that does not build (OQ-SEOEXCELLENCE-15). It misses the heading structure (edge case 3).
- DoD-11 and DoD-12, exclusions — sound; html-lang-locale joins them.

### Business edge cases proposed to storyman

1. Given the category `blockchain`, which has a page in each locale, when the site is built, then the two pages carry different titles and descriptions, each in its page's language — and so do the two blog homes.
2. Given the three French articles, which share neither a category nor a tag with one another, when their pages are built, then none renders a related-articles block, and no English article is offered in place of a French one.
3. Given an article whose body declares a first-level heading of its own, when its page is built, then the page carries exactly one first-level heading, the article's title.
4. Given an article that stops declaring itself published, when the site is rebuilt, then it leaves the sitemap, and no related-articles block, breadcrumb or other-locale link of another page points at it (BR-PYRAMID-10).
5. Given a translated pair whose French side stops declaring itself published, when the English side is built, then it declares no alternate language version.
6. Given an article declaring a date of last update, when its page is built, then the page shows that date and its sitemap entry and structured data carry it; given an article declaring none, then the publication date stands alone and no modification date is declared anywhere.
7. Given the landing page, when the sitemap is generated, then its date is the most recent among the articles its notes section lists, as a category page's is (decision of 2026-07-30).
8. Given `robots.txt`, when it is read, then it disallows neither `/learn`, where the v1 addresses answer with a redirect or Gone, nor the asset root `/article-images`, where the covers declared in structured data are served.
9. Given a link to a category page shared on a social platform, when the preview is built, then it carries the page's title and description and no image, the page computing none of its own (decision of 2026-07-30).
10. Given the French Gatsby article, whose excerpt runs to 200 characters, when its description is declared, then it is the excerpt whole, not cut by the site.
11. Given a page that renders a route placeholder, when it is read, then it declares itself not indexable and the sitemap does not list it — the case of the ten listing URLs until they render a roll.

---

## 1. Product Role

The v1 site is the counter-example and is being retired, so the starting point is now v2 itself: one title and one description for every page, no canonical, no sitemap, no crawl file, no structured data. A search engine cannot tell its pages apart.

This story is the site's declaration layer — what each page says it is — plus the check that the declaration holds. It changes what a reader sees in three places only: the breadcrumb, the related-articles block at the end of an article, and the five article bodies whose heading structure it corrects.

What it is NOT: rendering the listing pages (Gap-SEOEXCELLENCE-11); `<html lang>`, which is html-lang-locale's by the epic decision of 2026-08-02; images inside an article body, the subject of the story's own Gap 1; the landing page's wording, its title and description included; the domain switch and the v1 redirects, both `retire-robusta-v1`'s; off-site SEO, Core Web Vitals and analytics of any kind.

**Décision (autonome):** seo-excellence delivers the declaration layer, its verification, and the two subjects article-page left to it — the related-articles block and the heading structure of five bodies.

**Rationale:** the story's four "not aggressive" clauses reduce to one statement, a page declares what it is and nothing more, and the two inherited subjects are the only rendering work that statement needs.

---

## 2. Target Audience

- The crawler, which takes what is declared and asks nothing. Everything here is written for it.
- The social platform building a link preview — the audience the decision of 2026-07-30 added, served from the same declaration.
- The publisher: one person, sole author, no SEO tooling and no appetite for upkeep. The corpus was last written in 2022 and was migrated, not edited.
- The implementer of the next site, who copies what robusta-build does.

**Décision (autonome):** every declaration is derived from the page's address and its index entry; the only thing the publisher may add is an optional date of last update.

**Rationale:** a sole author with no maintenance budget is the binding constraint, and derived metadata cannot drift from the content it describes.

---

## 3. Core Problem

The v2 site states the same title and description on its 21 content URLs and on its landing page, and offers a search engine nothing to enumerate or disambiguate them. Five article pages declare two first-level headings. `mandatoryKeywords: ['robusta build', 'freelance']` sits in the v2 configuration and is read by nothing, so removing it removes an intention, not an output.

**Décision (autonome):** the problem is stated as declaration, not promotion — pages that cannot be told apart, not pages that rank badly.

**Rationale:** ranking is something this story can neither move nor measure, while "no indexable page shares its title" is checkable on the build.

---

## 4. Unique Value Proposition

Options considered:

- An SEO library producing the tags from a configuration block. Rejected: a dependency, and a second source of truth beside the URL scheme BR-PYRAMID-1 makes authoritative.
- Metadata written by hand per route. Rejected: it drifts on the first article added.
- One set of indexable pages, built on the site's single URL derivation, feeding each page's declaration, the sitemap and the audit.

**Décision (autonome):** the indexable pages are `contentUrls()` — the derivation every route already pregenerates from (R-URLSCHEME-22) — plus the landing page, minus every page carrying no content of its own; the per-page robots declaration, the sitemap and the audit all read that one set.

**Rationale:** "an indexable page absent from the sitemap" becomes impossible by construction rather than caught by a test, and it is the piece the next site inherits.

---

## 5. Functional Scope

In scope: the declaration of each kind of page; the set of indexable pages; `sitemap.xml` and `robots.txt`; structured data and a visible breadcrumb on article pages; the related-articles block; the heading correction of five bodies; the removal of `mandatoryKeywords`; the optional `updated` field; the build-time audit; the webmaster console's verification.

Out of scope: see axis 1. Tag pages stay out by the decision of 2026-07-29.

Scale, from the code: 21 content URLs — 2 blog homes, 8 category pages, 11 articles — plus the landing page. By the glossary's definition, 11 of them are indexable today: the articles. The landing page joins when robusta-landing-page gives it copy, the 10 listing URLs when they render a roll. No roll page exists in either locale. The category set is derived from what the articles claim since seo-url-scheme, so this story inherits it and decides nothing about it.

**Décision (autonome):** the story covers the article pages fully and the site-wide files; the landing page and the listing pages enter through the same set of indexable pages the day they carry content, with no further work in this story.

**Rationale:** it lets the article half ship on what has landed, and the listing half follows whichever item renders the rolls instead of waiting on it.

---

## 6. Core Features

### Feature: Page declaration

**Capability:** every indexable page declares a title, a description, a canonical URL, its indexability and the social-sharing set of 2026-07-30 — title, description, image, canonical URL, language — derived from its `PageUrl` and its index entry. The title is the page's own followed by the site name through one template at the root; `siteTitle` is the landing page's to word and reaches no other page. An article's description is its excerpt, as text and whole. The canonical URL is `buildUrl` on the configuration's `domain`. A translated pair declares each side as the other's alternate; every article states its language in its structured data and its social-sharing set. No keyword is declared at all: DoD-8 allows "from the article or not at all", and tags already drive related articles. A listing page, once it renders a roll, takes its heading as title and a description written from what the roll lists, in its own language (BR-PYRAMID-8).

**Acceptance Criteria:** DoD-1, DoD-2, DoD-8, DoD-9 (from the story)
- Proposed to storyman: edge cases 1, 5, 9, 10 and 11 above

**Test Approach:** vitest on the declaration of each page kind over fixture corpora, a category of thirteen articles among them for the roll page; the build audit for presence and uniqueness on every built page.

---

### Feature: Indexable pages, sitemap and crawl file

**Capability:** the set of axis 4 drives each page's robots declaration and `sitemap.xml`. Each sitemap entry carries a date: an article's `updated` when it declares one, its publication date otherwise, and for a page listing articles the most recent of theirs (decision of 2026-07-30). `updated` joins `ArticleEntry` in `@robusta/pyramids-content`. `robots.txt` names the sitemap and disallows nothing. Both files are generated by the build and never on a request (BR-PYRAMID-7).

**Acceptance Criteria:** DoD-4, DoD-5, DoD-6 (from the story)
- Proposed to storyman: edge cases 4, 6, 7, 8 and 11 above

**Test Approach:** vitest on the set over fixture corpora — an unpublished article, an emptied category, a category of thirteen; the audit cross-checks the sitemap against the built pages; one fetch of both files on the deployment.

---

### Feature: Article structured data and breadcrumb

**Capability:** an article page declares the article — headline, publication date, modification date when one is declared, author, language, and the cover as an absolute URL under the asset root — and a breadcrumb, blog home then category then article, which the page also shows. A listing page declares its breadcrumb and nothing else; the landing page declares no structured data from this story. The breadcrumb is site markup on design-system tokens, labelled in the page's language, and the design system gains no component for it (epic decision of 2026-08-02).

**Acceptance Criteria:** DoD-3 (from the story)
- Proposed to storyman: edge cases 4 and 6 above

**Test Approach:** vitest comparing each declared field with the value the page renders; one manual pass per page kind through a rich-results validator.

---

### Feature: Related articles

**Capability:** the end of an article offers its related articles as the glossary defines them: published, of the same locale, sharing its category or at least one tag. Ranked category first, then by the number of tags shared, then newest first; at most three; the block is absent when the set is empty. It sits in the space article-page left free, on design-system tokens, with a heading in the page's language. On today's corpus every English article gets one or two and every French article none — the cap is never reached.

**Acceptance Criteria:** DoD-7 (from the story)
- Proposed to storyman: edge cases 2 and 4 above

**Test Approach:** vitest on the selection over the real corpus, asserting the eleven expected sets, and over a fixture reaching the cap; the audit checks that no related link leaves the built set.

---

### Feature: Heading structure of five bodies

**Capability:** the five bodies are corrected in the corpus, one article at a time, as the epic decided on 2026-08-02. A body heading repeating the title is removed — `leaving-gmail`, `easy-automation-with-sonoff`. One that words something else is demoted to the second level and keeps its wording — the two yield-farming articles. `quel-second-langage` uses the first level for its sections, so its whole tree moves down one level. Where the freeze spec stands on this is Gap-SEOEXCELLENCE-12.

**Acceptance Criteria:** none in the story
- Proposed to storyman: edge case 3 above

**Test Approach:** the audit asserts exactly one first-level heading per built page.

---

### Feature: Build-time SEO audit

**Capability:** a check over the built pages that fails the build on a missing or duplicated title or description, an indexable page absent from the sitemap or a sitemap entry the build did not produce, a broken internal link, a second first-level heading, or a structured-data field the page does not show. On success it prints the count of indexable pages, so a silent drop shows in the build log. Where it runs is OQ-SEOEXCELLENCE-15.

**Acceptance Criteria:** DoD-10 (from the story)
- Proposed to storyman: edge cases 3 and 11 above

**Test Approach:** the audit is itself tested on fixture outputs, each carrying one injected defect.

---

### Feature: Webmaster console

**Capability:** robusta.build is registered with a search engine's webmaster console through a DNS record on the domain. The decision of 2026-07-30 allows a DNS record or a static file; the static file would sit in a v2 deployment that robusta.build does not serve before the domain switch, while the DNS record works now and survives the switch unchanged. Nothing ships to the visitor.

**Acceptance Criteria:** none in the story — the decision of 2026-07-30 has no Definition-of-done line

**Test Approach:** manual — the console shows the domain property verified.

---

## 7. Critical Edge Cases

The proposals are in the Acceptance Criteria challenge. What the corpus adds to them:

- Of the five second `h1`, one is written in setext form — `Leaving Gmail` underlined with `====` — so a check grepping the markdown for `# ` misses it. The audit reads the built page.
- Related articles on today's corpus: the three blockchain articles relate to one another; `why-i-made-the-migration…`, `applying-correctly-classname…` and `completing-a-rxjs…` relate through the category or the tags `javascript` and `front`; `leaving-gmail` and `easy-automation-with-sonoff` through `web` and `tech`. The three French articles share nothing.
- Excerpts run from 55 to 200 characters and are plain text today. One carrying emphasis or a link tomorrow would leak markdown into a description, so the declaration takes the excerpt's text, not its markup.
- No article declares `updated`, so every sitemap date is a publication date between 2019 and 2022. That is honest, and stays so without upkeep.
- All eleven articles declare a cover, so an article page declaring no image — legal by R-ARTICLEPAGE-25 — is represented by no test over the corpus.
- A category emptied by an article changing category leaves the indexable pages and answers 404. Whether its address deserves a redirect belongs to the published-address rule the epic validated without recording, not to this story.
- A slug is unique within a locale, which `validateArticles` enforces; the site-wide uniqueness the version of 2026-07-29 asked for is not needed.

---

## 8. Non-Functional Constraints

Everything here is produced by the build and costs nothing at request time: no third-party service, no paid dependency, no script executed in the visitor's browser — structured data is a data block, not code. The sitemap is generated in the build like every page, because generating it on a request would read the corpus while serving one (BR-PYRAMID-7). The breadcrumb and the related block take every value from design-system tokens (BR-PYRAMID-6), and every string they render is the site's, in the page's language (BR-PYRAMID-8).

BR-PYRAMID-2 removes the usual way of knowing whether SEO work worked.

**Décision (autonome):** no measurement code ships. Conformance is measured by the audit on every build, and outcome is read in the webmaster console, which observes the crawler and not the visitor.

**Rationale:** the console needs no code on the site and identifies nobody, which is why the decision of 2026-07-30 kept it; nothing tracked also means no consent banner, and the page a crawler gets is the page a reader gets.

---

## 9. External Dependencies

- Next.js 15.5.3 App Router: the metadata API and the file conventions that produce `sitemap.xml` and `robots.txt`. Its metadata objects merge shallowly from the root layout down: a page declaring `robots` or `openGraph` replaces the root's whole, a page declaring nothing inherits it whole. This is what makes a per-page indexability declaration possible, and what makes any nested default at the root leak into every page.
- schema.org, for the article and breadcrumb vocabulary, and the sitemap protocol — external standards.
- A search engine's webmaster console, verified by DNS on robusta.build.
- The site configuration: `domain`, `https://www.robusta.build`, is the host of every canonical URL; `siteName` is the suffix of every title.
- `@robusta/pyramids-routing` for `buildUrl` and `PageUrl`, unchanged; `@robusta/pyramids-content` for the index, gaining `updated`.
- Stories running in parallel: robusta-landing-page edits the root layout's metadata, which this story edits too; html-lang-locale will reshape the route tree around the same layout; design-system-responsive changes tokens this story only reads.

**Décision (autonome):** no runtime dependency is added. The audit may need an HTML parser as a development dependency, which ships nothing.

**Rationale:** every deliverable is a string in a page's head or a generated file, and Next already produces both.

---

## 10. Major Risks

- Opening the index too early, or all at once. Deleting the root `noindex` makes the ten placeholders indexable under the root's title, and doing it before the domain moves opens a host whose canonical URLs name a host still serving v1. OQ-SEOEXCELLENCE-13 and 14 carry both; the two paths:

```
  Two paths to opening the index. Time runs down.

  Path A, as planned
  robusta-landing-page ─→ noindex lifted site-wide, on the v2 host
                          · the 10 placeholders become indexable
                          · canonical URLs name a host serving v1
  retire-robusta-v1    ─→ domain moves, v1 redirects go live

  Path B, proposed by OQ-SEOEXCELLENCE-13 and 14
  robusta-landing-page ─→ `/` joins the indexable pages, site still closed
  blog-rolls           ─→ the listing pages join them
  retire-robusta-v1    ─→ domain moves: noindex lifted, redirects go live
```

- A default leaking from the root. Any nested metadata the root declares reaches every page that does not redeclare it, which is the shared title and description this story removes. Mitigation: the root declares the canonical host, the title template and the robots default, nothing else, and the audit checks uniqueness.
- Three stories on one file. robusta-landing-page, html-lang-locale and this story all touch the root layout. Mitigation: this story's change there is limited to the three declarations above.
- Correcting five bodies turns the freeze spec red (Gap-SEOEXCELLENCE-12).
- Declaring more than the page shows, which is what draws a structured-data penalty. Mitigation: the declaration is derived from the values the page renders, and the audit compares the two.
- No proof of improvement, only of conformance — and no outcome at all before the domain serves v2. Accepted.
- An article silently dropping out of the sitemap after a refactor. Mitigation: the audit prints the indexable-page count on success.

---

## 11. Boundaries

The work sits inside `apps/robusta-build`, plus one field of `@robusta/pyramids-content`. Where the layer lives is OQ-SEOEXCELLENCE-16; the blocks draw its proposition.

```
  Apps and modules. Arrow = depends on, from client code to the API.
  Nothing points into an app, no loop.

  app `robusta-build` [modified]
      │                               │
      │ library                       │ library
      ↓                               ↓
  module `pyramids-routing`       module `pyramids-content` [modified]
```

```
  Packages of app `robusta-build`. Arrow = depends on, library API.
  One way only, no loop.

  `app` [modified] ──→ `article` [modified] ──→ `content` [modified]
    │                      │                        ↑
    │                      ↓                        │
    └──────────────────→ `seo` [new] ───────────────┘
                           │
                           ├──→ `routing`
                           └──→ `seopyramids.config` [modified]
```

`article` keeps its API — `ArticleView` takes the same props and renders the breadcrumb and the related block inside — so it has no block. `routing` is unchanged and read through `contentUrls()`.

### HTTP API of app `robusta-build` — modified

Client code: crawlers and social platforms, outside the repository.

- `GET /sitemap.xml` · new — 200, the indexable pages with a date each, generated by the build
- `GET /robots.txt` · new — 200, names the sitemap, disallows nothing
- `GET` on any page · modified — its head declares a title, a description, a canonical URL, whether it is indexable and the social-sharing set; the two sides of a translated pair declare each other; an article page carries its structured data

### library API of package `seo` in app `robusta-build` — new

Client code: package `app` — the route files, `sitemap.ts`, `robots.ts` — and package `article`.

- interface `IndexablePages` · new
  - `indexablePages()` — the pages the site offers to search engines, each with its date; built on `contentUrls()` plus the landing page, never on a second list
  - `isIndexable(page)` — whether one `PageUrl` belongs to that set; what the page's robots declaration reads
- interface `PageDeclaration` · new
  - `metadataOf(page)` — title, description, canonical URL, indexability, alternates and social-sharing set of one `PageUrl`
  - `breadcrumbOf(page)` — the trail an article page shows and declares
  - `structuredDataOf(entry)` — the article and breadcrumb declaration of one article page, limited to what it renders

### library API of package `content` in app `robusta-build` — modified

Client code: packages `article` and `seo`.

- `findRelated(entry)` · new — the related articles of one article, empty when it has none; beside `findArticle` and `findTranslation`, which do not change

### library API of package `seopyramids.config` in app `robusta-build` — modified

Client code: packages `app` and `seo`.

- `BlogConfig` · modified — loses `mandatoryKeywords`

### library API of module `@robusta/pyramids-content` — modified

Client code: app `robusta-build`.

- `ArticleEntry` · modified — gains an optional date of last update, read from an `updated` frontmatter field
- `readCorpus(corpus)` · modified — refuses a malformed update date as it refuses a malformed `date`

**Décision (autonome):** one new package in the site, `seo`, depending on `content`, `routing` and the site configuration and depended on by `app` and `article`; one new lookup beside the existing ones; one optional field in the base.

**Rationale:** the declarations read the index and the URL derivation and nothing reads them back, so dependencies run one way, and the base gains a field rather than an API.

---

## Next Steps

- Arbitrate Gap-SEOEXCELLENCE-11 first: if `blog-rolls` is accepted, epicman places it in À faire and `ROADMAP.md` through the `roadmap` skill.
- Arbitrate OQ-SEOEXCELLENCE-13 and 14 together with the robusta-landing-page brainstorm running in parallel, since both decide what the root layout declares and when the site opens.
- `storyman refine seo-excellence`: Gap-SEOEXCELLENCE-10, the Corrections for the story, and the eleven edge cases as AC.
- designman on the refined story. The article half — declaration, structured data, related articles, headings, sitemap, crawl file, audit — waits on nothing that has not landed.
