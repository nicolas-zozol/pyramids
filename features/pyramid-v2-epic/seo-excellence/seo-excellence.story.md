# Story : SEO excellence on the v2 site

**Dernière mise à jour :** 2026-08-01
**Feature :** seo-excellence
**Infix :** SEOEXCELLENCE
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want every page of the v2 site to state to a search engine exactly what it is — and nothing more than it is — so that the content is found on its own merit and the site never reads as manufactured for robots.

## Contexte & objectif

The epic carries one SEO intent: everything goes toward best practice, without being aggressive. epicman ran it through the four tests and kept it out of `business-rules.md` — no verifiable declarative statement comes out of that sentence. This story is where it becomes checkable criteria, and that translation is the actual work here.

The v1 site shows the starting point: no sitemap, no `robots.txt`, no structured data, a canonical URL left as a `TODO` in `apps/robusta/src/app/learn/page.tsx`, and a root layout whose title and description are the same on every page. At the other end, `mandatoryKeywords: ['robusta build', 'freelance']` is appended to the keyword list of every article — two commercial terms pushed onto content that has nothing to do with them. That is the aggressive end of the range, and bootstrap-robusta-build carried the field into `apps/robusta-build/src/seopyramids.config.ts` with the rest of the shell, so this story removes it rather than declining to port it.

Scale decides what is honest here: 11 articles over six categories — blockchain 4, javascript 3, typescript 1, privacy 1, theory 1, web 1 — four of which hold exactly one article, and a locale split of 8 English and 3 French once migrate-learn-content corrects the two English files declaring `fr`. The `security` and `prompt` folders of the v1 tree hold images and no article, and no category page exists for them: R-URLSCHEME-6 derives the category URLs from what the articles claim, so an empty category cannot be offered to the index in the first place.

What this story computes from is delivered. seo-url-scheme landed on 2026-07-31 as `acfbc0a`: the content root is `articles`, an article sits at `/articles/{slug}` or `/articles/c/{category}/{slug}`, a roll at `/articles/p/{n}` or `/articles/c/{category}/p/{n}`, `/l/{locale}` prefixes a non-default locale, and `/articles/t/{tag}` is reserved and served by nothing. A canonical URL is the form that scheme's builder emits, so canonicals and sitemap entries derive from the route rather than from the content source (BR-PYRAMID-1). What is missing is what those URLs address, which the Dependencies below name.

Nothing on the site is indexable yet: `apps/robusta-build/src/app/layout.tsx` declares `robots: { index: false, follow: false }` site-wide until robusta-landing-page lifts it, and the v1 redirect map ships dormant until retire-robusta-v1 turns it on. Every criterion below is checked against the built output, and none of this story's work can be verified against a live index before that flag is lifted.

## What "not aggressive" means here

- No term is added to a page because the site wants to rank on it. What the page says is what the page declares.
- A page that would carry nothing of its own is not generated, not linked and not listed — it never becomes an indexable page.
- Internal links exist for a reader who would follow them; a link block is left out rather than padded.
- Structured data describes what the page displays, never more.

## Definition of done

- Every indexable page declares a self-referencing canonical URL, which is the form the scheme's builder emits; a roll page beyond the first is canonical to itself and never to the roll's own address.
- Every page carries a title and a description of its own; no page falls back to the root layout defaults. An article's description is its `excerpt`, which the v2 schema already requires of every article.
- Article pages expose structured data for the article — headline, publication date, author, language, image — plus a breadcrumb, and declare nothing that the page does not show. The image is an absolute URL under the site's asset root.
- `sitemap.xml` is generated from the same derivation as the routes and lists exactly the indexable pages, with a last-modification date each. It lists published articles only — BR-PYRAMID-10, "A site publishes an article only if that article declares itself published" — so an article that stops declaring itself published leaves the sitemap along with the index.
- The optional `updated` frontmatter field that the sitemap date rests on is added to `ArticleEntry` in `@robusta/pyramids-content`, which shipped on 2026-07-31 without it.
- `robots.txt` exists, points at the sitemap, and blocks nothing the sitemap lists.
- Each article page links to its category page and offers related articles as the glossary defines them; the block disappears when the set is empty.
- `mandatoryKeywords` leaves `apps/robusta-build/src/seopyramids.config.ts` and its `BlogConfig` type: keywords come from the article or not at all.
- A non-default-locale page declares its own language, and an alternate is declared between two articles only where a `translationId` pairs them.
- Verified on the production build, in the vitest setup migrate-learn-content adds to `apps/robusta-build`: no page with a missing or duplicated title or description, no indexable page absent from the sitemap, no broken internal link.
- Does not cover off-site SEO, Core Web Vitals tuning, and any form of analytics — a v2 site tracks no visitor intent (BR-PYRAMID-2).
- Does not cover turning the v1 redirects on, which belongs to retire-robusta-v1.

## Décisions

- 2026-07-29 — No tag routes on the v2 site: tags stay metadata used to pick related articles, and browsing runs through categories. Pourquoi : the corpus split across tags produces pages with one or two entries, which is exactly the thin page this story refuses. Réf : Gap 2 of migrate-learn-content, arbitrated the same way the same day. Refined on 2026-07-31 by seo-url-scheme: the scheme reserves the tag address rather than ignoring it — the builder and the parser know the shape of `/articles/t/{tag}`, no such URL is produced and no route serves one (R-URLSCHEME-31) — and a v1 tag address reaches the category page of the same name when that category has one, the blog home otherwise. Tags still carry no page, so nothing this story computes changes.
- 2026-07-29 — `mandatoryKeywords` is dropped from the v2 `seopyramids.config.ts` rather than ported. Pourquoi : it appends the same two commercial terms to every article regardless of subject, which is exactly the aggressive pattern the epic rules out. Overtaken on 2026-07-31 by the shell: bootstrap-robusta-build ported the field in commit `84c3587`, so the decision is executed by removing it from the v2 configuration rather than by never adding it.
- 2026-07-29 — "An indexable page must carry content of its own" is validated by the human but is not recorded as BR-PYRAMID-4: it fails the vocabulary test of the `business-rule` skill, "indexable page" being absent from `ubiquitous-language.md`, which requires a term to be proposed before it is used in a rule. Pourquoi : the three other tests pass — the publisher can decide it, it states what must hold without any process, and it is a single invariant — so the rule goes back to the registrar once the term is defined, which the Documentation updates below already plan. Until then the statement stays an acceptance criterion of this story. Superseded on 2026-07-30: `Indexable page` entered `ubiquitous-language.md` by arbitration C4 of `pyramid-v2.bulk.md`, and the rule was then deliberately left unrecorded — the registered definition already reads "addressed by a URL of its own and carries content of its own", so the rule restates its own term, and a definitional fact belongs to the glossary rather than to the registry. The identifier BR-PYRAMID-4 is retired and never reused; the statement stays an acceptance criterion here, and the glossary entry this decision planned is delivered.
- 2026-07-30 — A category page holding a single article is indexable and stays. Pourquoi : arbitration of Open Question 1 of `seo-excellence.brainstorm.md` — four of the six category pages hold exactly one article today, refusing them would leave three articles reachable only from the blog home, and the page shows something real rather than being created to fill a tree.
- 2026-07-30 — The site declares a minimal social-sharing metadata set — title, description, image, canonical URL, language — derived from values the page already computes, with nothing authored separately. Pourquoi : arbitration of Open Question 2 of `seo-excellence.brainstorm.md` — it adds no authoring and no maintenance since it reuses the page's own declaration, and a shared link that renders nothing is a loss the story never chose.
- 2026-07-30 — The sitemap's last-modification date comes from an optional `updated` frontmatter field, falling back to the publication date; a category or roll page takes the most recent date among the articles it lists. Pourquoi : arbitration of Open Question 3 of `seo-excellence.brainstorm.md` — it is the only date the content itself owns, it stays correct without upkeep, and a file timestamp is meaningless after a CI checkout.
- 2026-07-30 — Registering the site with a search engine's webmaster console is compatible with the no-tracking rule and is the one measurement kept, verified through a DNS record or a static file. Pourquoi : arbitration of Open Question 4 of `seo-excellence.brainstorm.md` — the console reports on crawling and on results the engine already holds, ships no code to the visitor and identifies nobody (BR-PYRAMID-2), whereas refusing it leaves this story with no outcome signal at all.

## Open Questions & Gaps

- Gap 1: an image inside a rendered article body reaches the page as a plain `<img>` through `dangerouslySetInnerHTML`, with no `sizes`, no WebP and no lazy loading. `migrate-learn-content.design.md` hands the question to article-page and to this story without answering it, and neither has taken it.
- Proposition: this story takes the cover image only — the one the page renders itself and structured data declares — and leaves body images as the markdown pipeline emits them, recording the limit rather than hiding it.
- Rationale: answering it for body images means either rewriting eleven article bodies or replacing remark's HTML with a component pipeline, which is a content-pipeline decision and not a metadata one; image loading also sits in the Core Web Vitals tuning this story excludes.
- Resolution:

## Documentation updates

- change the Overview and the site-configuration line of `root.archi.md` — why: the Overview describes the base as a pipeline producing indexable pages while the v2 site declares `noindex` and ships no sitemap, and the configuration line still names the mandatory keywords this story removes.
- create an SEO section in the README of `apps/robusta-build`, beside its Routing section — why: what a page must declare, and what the site deliberately refuses to do, is what the next site copies.

## Dependencies

- Dep 1: migrate-learn-content — nothing to index before the articles are on the site. `apps/robusta-build/content/articles` holds a `.gitkeep` today; story ACTIVE, design APPROVED on 2026-08-01, implementation not started.
- Dep 2: article-page — an article route that renders a `RoutePlaceholder` carries no content of its own, so it is not an indexable page by the glossary's own definition, and there is nothing for metadata, structured data or a sitemap entry to describe until it lands. Story ACTIVE, no design yet.
- Dep 3: robusta-landing-page — for the outcome signal alone, not for implementation: the site-wide `robots: noindex` it lifts is what makes the webmaster console of the decision of 2026-07-30 report anything.
