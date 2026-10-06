# Story : SEO excellence on the v2 site

**Dernière mise à jour :** 2026-10-06
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want every page of the v2 site to state to a search engine exactly what it is, and nothing more, so that the content is found on its own merit and the site never reads as manufactured for robots.

## Contexte & objectif

The epic carries one SEO intent: best practice, never aggressive. No business rule comes out of that sentence, so this story is where it becomes checkable criteria.

Read in the code on 2026-10-06, the v2 site declares the same thing on every page: the root layout's title `Robusta Build: Freelance ethers.js, solidity, web, blockchain`, its description `Building Internet the right way`, and `robots: noindex`. There is no canonical URL, no sitemap, no `robots.txt` and no structured data. The articles render as articles since article-page; the blog home and the category pages still show a placeholder, until blog-rolls renders them. Five article bodies declare a second `h1`, and `mandatoryKeywords: ['robusta build', 'freelance']` still sits in the site configuration. article-page left two subjects to this story on purpose: the related-articles block at the end of an article, and those five headings.

The site this story ships on is the one the epic decided on 2026-10-06: TanStack Start on Netlify, entirely French with `fr` as the unmarked default locale and nine French articles (BR-PYRAMID-11), no redirect at all, the v1 addresses answering 404 until restore-v1-urls, and a local business speaking to SMEs. A canonical URL is the form `@robusta/pyramids-routing` builds on `https://www.robusta.build` (BR-PYRAMID-1). The site stays closed to indexing until go-live switches robusta.build to it.

Out of scope: off-site SEO, Core Web Vitals, any analytics (BR-PYRAMID-2), `<html lang>` (tanstack-start-migration), the landing page's own wording, title and description included (robusta-landing-page), the rendering of the rolls (blog-rolls), the opening of the site to indexing (go-live), and the v1 addresses (restore-v1-urls).

## What "not aggressive" means here

- No term is added to a page because the site wants to rank on it. What the page says is what the page declares.
- A page that carries nothing of its own is not indexable, not listed in the sitemap, and not offered as a related article.
- Internal links exist for a reader who would follow them; a link block is left out rather than padded.
- Structured data describes what the page displays, never more.

## Acceptance Criteria

- AC-SEOEXCELLENCE-1 : Given any indexable page, When a search engine or a social platform reads it, Then it finds a title and a description of its own (an article's description is its excerpt, whole, as plain text), a canonical URL pointing at the page itself, the language `fr` and a sharing preview built from those same values; it finds no keyword the site configuration adds and no alternate-language version.
- AC-SEOEXCELLENCE-2 : Given a page with no content of its own (a listing page still showing a placeholder, the not-found page) or a page that declares nothing about its indexing, When the site is built, Then that page declares itself not indexable and the sitemap leaves it out; once a listing page renders its roll, it is indexable like any other page. Until go-live, no page is open to indexing, whatever it carries.
- AC-SEOEXCELLENCE-3 : Given the built site, When a crawler fetches `/sitemap.xml` and `/robots.txt`, Then the sitemap lists exactly the indexable pages, published articles only (BR-PYRAMID-10), each with a date: an article's date of last update when it declares one, its publication date otherwise, and for a page listing articles the most recent date among them; `robots.txt` names the sitemap and blocks nothing it lists, nor the asset root that serves the covers.
- AC-SEOEXCELLENCE-4 : Given an article page or `/`, When a reader or a crawler reads it, Then an article page shows a breadcrumb (blog home, category, article) labelled in French and the date of last update when the article declares one, and declares as structured data the article (headline, publication date, date of last update, author, language, cover as an absolute URL under the asset root) and that breadcrumb; `/` declares Robusta Build as a local business with the name, service area and contact it shows, the same as its Google Business Profile, and no other page declares the business; no structured data carries a field its page does not show.
- AC-SEOEXCELLENCE-5 : Given an article, When its page is built, Then it links to its category page and ends on its related articles, three at most, or on no block at all when it has none.
- AC-SEOEXCELLENCE-6 : Given the production build, When it is checked, Then no page lacks or shares a title or a description, every indexable page is in the sitemap and every sitemap entry is a built page, no internal link is broken, and every page carries exactly one first-level heading; a failure names the page. The outcome is read in a search engine's webmaster console, where robusta.build is a verified property and nothing ships to the visitor.
- AC-SEOEXCELLENCE-7 : Given the business edge cases, When the site is rebuilt, Then an article that stops declaring itself published leaves the sitemap, and no related block or breadcrumb of another page points at it; an article declaring no date of last update declares no modification date anywhere; an article whose body repeats its title as a heading shows that title once, and a body using the first level for its sections keeps them one level down; a category page holding a single article stays indexable; a page with no image of its own shares a preview with no image rather than a default one; the second page of a roll is canonical to itself, never to the first.

## Boundaries

```
  Apps and modules. Arrow = depends on, from client code to the API.
  Nothing points into an app, no loop.

  app `robusta-build` [modified]
      │                            │
      │ library                    │ library
      ↓                            ↓
  module `pyramids-routing`    module `pyramids-content` [modified]
```

Where the declarations live inside the site, or in a base package, is the design's to draw, against TanStack Start.

### HTTP API of app `robusta-build` — modified

Client code: crawlers and social platforms.

- `GET /sitemap.xml` · new — 200, the indexable pages with a date each, generated at build
- `GET /robots.txt` · new — 200, names the sitemap, disallows nothing
- `GET` on any page · modified — its head declares a title, a description, a canonical URL, its indexability and the sharing preview; an article page adds its structured data, and shows a breadcrumb and its related articles; `/` adds the local business

### library API of module `@robusta/pyramids-content` — modified

Client code: app `robusta-build`.

- `ArticleEntry` · modified — gains an optional date of last update, read from an `updated` frontmatter field
- `readCorpus(corpus)` · modified — refuses a malformed update date as it refuses a malformed `date`

### library API of package `seopyramids.config` in app `robusta-build` — modified

- `BlogConfig` · modified — loses `mandatoryKeywords`

## Décisions

- 2026-07-29 — No tag routes: tags stay metadata that picks related articles, and browsing runs through categories. Pourquoi : split across tags, the corpus yields pages of one or two entries, the thin page this story refuses. seo-url-scheme reserves `/articles/t/{tag}` and serves nothing there (R-URLSCHEME-31).
- 2026-07-29 — `mandatoryKeywords` leaves the v2 configuration. Pourquoi : it appends the same two commercial terms to every article whatever its subject, the aggressive pattern the epic rules out. bootstrap-robusta-build had ported it in `84c3587`, so the decision is carried out by removing it.
- 2026-07-30 — "An indexable page must carry content of its own" stays a criterion of this story, not a business rule. Pourquoi : `Indexable page` entered `ubiquitous-language.md` with that very definition, so the rule would restate its own term. BR-PYRAMID-4 is retired and never reused.
- 2026-07-30 — A category page holding a single article is indexable. Pourquoi : Open Question 1 of the brainstorm; refusing it leaves articles reachable from the blog home alone, and the page shows something real.
- 2026-07-30 — The site declares a minimal sharing set (title, description, image, canonical URL, language) derived from values the page already computes, nothing authored separately. Pourquoi : Open Question 2; no authoring, no upkeep, and a shared link that renders nothing is a loss.
- 2026-07-30 — The sitemap date comes from an optional `updated` frontmatter field, falling back to the publication date; a page listing articles takes the most recent among them. Pourquoi : Open Question 3; it is the only date the content owns, and a file timestamp means nothing after a CI checkout.
- 2026-07-30 — Registering the site with a search engine's webmaster console is the one measurement kept, verified through a DNS record or a static file. Pourquoi : Open Question 4; the console reports on crawling, ships no code to the visitor and identifies nobody (BR-PYRAMID-2).
- 2026-08-02 — Image rendering is settled outside this story: article-page renders the cover and the body images (R-ARTICLEPAGE-23 and 26), and tanstack-start-migration carries them over, the cover as a plain `<img>`. Pourquoi : Gap 1 of this story said nobody owned the question; it was closed as stale on 2026-10-06.
- 2026-10-06 — The design is written against TanStack Start on Netlify, the head each route declares and files generated at build, not against Next's metadata API or `sitemap.ts`. Pourquoi : epic decision of 2026-10-06; the brainstorm of the same day still reasons on Next.
- 2026-10-06 — One locale: every page declares `fr` and none declares an alternate-language version, so the alternates between translated pairs leave the story. Pourquoi : BR-PYRAMID-11, and items 3 and 4 of the epic, which leave nine French articles under one unmarked locale.
- 2026-10-06 — A new item, `blog-rolls`, renders the blog home and the category rolls from the index, page copy included, and comes before this story; it is the item robusta-landing-page calls listing-pages. Only the listing-page half of the criteria and the breadcrumb wait on it, the article half does not. Pourquoi : Gap-SEOEXCELLENCE-17; a roll is page copy, not declaration, the reason article-page was split out of migrate-learn-content on 2026-08-01, and folding the rolls in here would double the story.
- 2026-10-06 — Of the five bodies declaring a second `h1`, the three English ones (`leaving-gmail`, `easy-automation-with-sonoff`, `yield-farming`) leave with item 4, whose translations carry no `h1` in their body; the two French bodies that stay, `yield-farming-fr` and `quel-second-langage`, are corrected in the v2 tree and the frozen v1 tree in one commit, so `corpus-freeze.spec.ts` keeps holding the copies identical. Pourquoi : Gap-SEOEXCELLENCE-18; v1 renders its own `<h1>` above the same bodies and has the same defect, so a lockstep edit costs nothing, and exempting files would weaken the one check guarding the copy, for a tree retire-robusta-v1 deletes anyway.
- 2026-10-06 — The root keeps `noindex` as the default and each indexable page declares itself indexable. The pages open at go-live, the separate step where robusta.build switches to the Netlify v2 site, the same step robusta-landing-page raises, and not when robusta-landing-page lands, as item 5 of the epic has it. Pourquoi : OQ-SEOEXCELLENCE-19; deleting the root directive also opens the placeholders and the not-found page under the root's title, and every canonical URL names `https://www.robusta.build`, which serves v1 until the switch, so a Netlify host opened earlier gets indexed under addresses that answer a v1 404.
- 2026-10-06 — `/` declares Robusta Build as a local business in its structured data, with the name, service area and contact the page shows, the same as the Google Business Profile in `documentation/google-business-profile.md`, whose website field moves to the canonical host `https://www.robusta.build`. No other page declares it. Pourquoi : OQ-SEOEXCELLENCE-20; the positioning of 2026-10-06 makes Robusta Build a local business, and a site and a profile stating the same name, area and address is the usual local-search signal.

## Documentation updates

- change the Overview and the site-configuration line of `root.archi.md` — why: the Overview describes a pipeline producing indexable pages while the v2 site declares `noindex` and ships no sitemap, and the configuration line still names the mandatory keywords this story removes.
- create an SEO section in `apps/robusta-build/README.md`, beside its Routing section — why: what a page declares, and what the site refuses to do, is what the next site copies.

## Dependencies

- Dep 1: tanstack-start-migration, item 2 of the epic — the design is written against TanStack Start and the code lands on it. Story ACTIVE, design DRAFT.
- Dep 2: default-locale-fr and translate-english-articles, items 3 and 4 — the criteria hold on one unmarked locale and nine French articles, and the three English bodies declaring a second `h1` leave with item 4, whose translations must carry none. Neither has a story.
- Dep 3: robusta-landing-page, item 5 — for `/` alone: it becomes indexable once it carries copy, its sitemap date reads the articles its notes section lists, and its local business reads the name, service area and contact the page shows. Story ACTIVE.
- Dep 4: blog-rolls, the new item rendering the blog home and the category rolls — for the listing-page criteria and the breadcrumb only. No story yet.
- migrate-learn-content and article-page, the two former dependencies, landed on 2026-08-02 as `0282952` and `3ab28e7` — levées.
