# Story : SEO excellence on the v2 site

**Dernière mise à jour :** 2026-07-29
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want every page of the v2 site to state to a search engine exactly what it is — and nothing more than it is — so that the content is found on its own merit and the site never reads as manufactured for robots.

## Contexte & objectif

The epic carries one SEO intent: everything goes toward best practice, without being aggressive. epicman ran it through the four tests and kept it out of `business-rules.md` — no verifiable declarative statement comes out of that sentence. This story is where it becomes checkable criteria, and that translation is the actual work here.

The v1 site shows the starting point: no sitemap, no `robots.txt`, no structured data, a canonical URL left as a `TODO` in `learn/page.tsx`, and a root layout whose title and description are the same on every page. At the other end, `mandatoryKeywords: ['robusta build', 'freelance']` is appended to the keyword list of every article — two commercial terms pushed onto content that has nothing to do with them. That is the aggressive end of the range, and it is not carried over unexamined.

Scale decides what is honest here: 13 articles, 7 in English and 6 in French, over 5 categories that actually hold content, while the category tree declares 7 paths of which 3 hold no article at all. A site that size cannot fill a deep category tree, and pretending otherwise produces empty pages offered to the index.

Blocked on two items of the epic: seo-url-scheme (4) for stable URLs and migrate-learn-content (7) for the pages themselves. Brainstorm and design can proceed; implementation cannot start before both land. BR-PYRAMID-1 is the rule this story leans on: because a URL states the kind of page it addresses, canonicals and sitemap entries derive from the route rather than from the content source.

## What "not aggressive" means here

- No term is added to a page because the site wants to rank on it. What the page says is what the page declares.
- No indexable page without content of its own — no empty category, no page created only to exist in the tree.
- Internal links exist for a reader who would follow them; a link block is left out rather than padded.
- Structured data describes what the page displays, never more.

## Definition of done

- Every indexable page declares a self-referencing canonical URL derived from the route scheme, pagination parameters included when they change the content.
- Every page carries a title and a description of its own; no page falls back to the root layout defaults. Article descriptions come from the frontmatter when present and from the article lede otherwise.
- Article pages expose structured data for the article — headline, publication date, author, language, image — plus a breadcrumb, and declare nothing that the page does not show.
- `sitemap.xml` is generated from the same source as the routes and lists exactly the indexable pages, with a last-modification date each.
- `robots.txt` exists, points at the sitemap, and blocks nothing the sitemap lists.
- A category holding no article is neither linked, nor listed, nor generated.
- Each article page links to its category and to related articles picked from the categories and tags it shares; the block disappears when there is nothing relevant to link.
- No keyword list is appended to a page by configuration; keywords come from the article or not at all.
- Non-default-locale pages sit under `/l/{locale}/` and declare their own language, with no alternate declared between two articles that are not translations of each other.
- Verified on the production build: no page with a missing or duplicated title or description, no indexable page absent from the sitemap, no broken internal link.
- Does not cover off-site SEO, Core Web Vitals tuning, and any form of analytics — a v2 site tracks no visitor intent (BR-PYRAMID-2).

## Décisions

- 2026-07-29 — No tag routes on the v2 site: tags stay metadata used to pick related articles, and browsing runs through categories. Pourquoi : the corpus split across tags produces pages with one or two entries, which is exactly the thin page this story refuses. Réf : Gap 2 of migrate-learn-content, arbitrated the same way the same day.
- 2026-07-29 — `mandatoryKeywords` is dropped from the v2 `seopyramids.config.ts` rather than ported. Pourquoi : it appends the same two commercial terms to every article regardless of subject, which is exactly the aggressive pattern the epic rules out.
- 2026-07-29 — "An indexable page must carry content of its own" is validated by the human but is not recorded as BR-PYRAMID-4: it fails the vocabulary test of the `business-rule` skill, "indexable page" being absent from `ubiquitous-language.md`, which requires a term to be proposed before it is used in a rule. Pourquoi : the three other tests pass — the publisher can decide it, it states what must hold without any process, and it is a single invariant — so the rule goes back to the registrar once the term is defined, which the Documentation updates below already plan. Until then the statement stays an acceptance criterion of this story.
- 2026-07-30 — A category page holding a single article is indexable and stays. Pourquoi : arbitration of Open Question 1 of `seo-excellence.brainstorm.md` — four of the six category pages hold exactly one article today, refusing them would leave three articles reachable only from the blog home, and the page shows something real rather than being created to fill a tree.
- 2026-07-30 — The site declares a minimal social-sharing metadata set — title, description, image, canonical URL, language — derived from values the page already computes, with nothing authored separately. Pourquoi : arbitration of Open Question 2 of `seo-excellence.brainstorm.md` — it adds no authoring and no maintenance since it reuses the page's own declaration, and a shared link that renders nothing is a loss the story never chose.
- 2026-07-30 — The sitemap's last-modification date comes from an optional `updated` frontmatter field, falling back to the publication date; a category or roll page takes the most recent date among the articles it lists. Pourquoi : arbitration of Open Question 3 of `seo-excellence.brainstorm.md` — it is the only date the content itself owns, it stays correct without upkeep, and a file timestamp is meaningless after a CI checkout.
- 2026-07-30 — Registering the site with a search engine's webmaster console is compatible with the no-tracking rule and is the one measurement kept, verified through a DNS record or a static file. Pourquoi : arbitration of Open Question 4 of `seo-excellence.brainstorm.md` — the console reports on crawling and on results the engine already holds, ships no code to the visitor and identifies nobody (BR-PYRAMID-2), whereas refusing it leaves this story with no outcome signal at all.

## Documentation updates

- change the SEO paragraph of `root.archi.md` — why: the base's SEO contract becomes a real deliverable of the v2 site instead of a passing mention.
- create an SEO section in the README of `apps/robusta-build` — why: what a page must declare, and what the site deliberately refuses to do, is what the next site copies.
- change `ubiquitous-language.md` — why: "indexable page" and "related articles" are used as decision criteria here and need one definition each.

## Dependencies

- Dep 1: seo-url-scheme, item 4 of the epic — no canonical and no sitemap without a stable route scheme. No story written yet.
- Dep 2: migrate-learn-content, item 7 of the epic — nothing to index before the articles are on the site. No story written yet; itself depends on items 4 and 5.
