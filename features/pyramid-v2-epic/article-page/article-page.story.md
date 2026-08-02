# Story : Article page of the v2 site

**Dernière mise à jour :** 2026-08-02
**Feature :** article-page
**Infix :** ARTICLEPAGE
**Status :** ACTIVE

## Story

As a reader of robusta.build, I want an article to render as an article — its title, its date, its body, its cover, and the way out to its category and to its other language — so that the content the v2 site serves is worth arriving at.

## Contexte & objectif

This story exists because of a gap nobody assigned, found on 2026-08-01 while designing migrate-learn-content. Three stories each excluded the article page, each for a defensible reason, and between them they left it owned by no one:

- seo-url-scheme, landed 2026-07-31, built the route table and excluded page copy — "this story produces URLs and route files, not page copy". All four article routes render a `RoutePlaceholder`.
- content-source, implemented 2026-07-31, built the reader and excluded rendering, typography and article layout. It ships `readArticleBody(corpus, entry)`, returning `{ html }`, tested and called by nothing.
- robusta-landing-page owns the home page and nothing else.

migrate-learn-content was going to absorb the rendering until the arbitration of 2026-08-01 sent it here instead, so that the migration stays a corpus and redirect exercise. The consequence is the state the site is about to be in: eleven real articles, at working URLs, every one of them rendering a placeholder.

The pieces are all in place. The body is already rendered to HTML at build time by `@robusta/pyramids-content`; the routes already exist and already pregenerate; the images already resolve through the asset root migrate-learn-content builds. What is missing is the page itself.

## Definition of done

- Every v1 article is readable on the v2 site, in its locale and under its category, with title, date, author, tags and category preserved. Inherited from migrate-learn-content on 2026-08-01, which can no longer meet it once article rendering left its scope.
- The author is a required field of the reading contract, on the same footing as the title and the date: an article declaring none is a `missing-field` violation and fails the build. The contract carries no author field today, so it widens here rather than the page rendering an author when there happens to be one.
- An article page renders its metadata, its cover image, its body, a link to its category page, and a link to the other locale version where a `translationId` pairs the two. An article with no pair shows no such link rather than a dead one.
- The page is built from `@robusta/pyramids-design-system` tokens and shadcn on Tailwind 4, and adds no component to the design system — BR-PYRAMID-6, and the design system is not this story's to grow.
- The page reaches for none of `pyramids-layouts`, `pyramids-links` or `pyramids-ctas`: they render DaisyUI classes and the shadcn decision deprecates them for this site.
- The body is read at build time and never while serving a request. Realizes BR-PYRAMID-7, which the route table already satisfies by construction — `dynamic = 'force-static'` and `dynamicParams = false` — and which this story must not undo by fetching a body lazily.
- The page copy comes from the site's own corpus and the design system supplies none of it. Realizes BR-PYRAMID-8.
- Does not cover the blog roll, the category page or the landing page: this story renders one article, not the pages that list articles.
- Does not cover metadata for search engines — canonical, hreflang, structured data — which belong to seo-excellence. The site carries `robots: noindex` site-wide until robusta-landing-page lifts it, so nothing rendered here is indexable yet.

## Décisions

- 2026-08-02 — the author is required and not optional; an article declaring none is a `missing-field` violation like a missing title or date. Why: the definition of done asks for the author preserved on every article, and an optional field leaves an article without one publishable, which is exactly the case the requirement is about.
- 2026-08-02 — the two articles of the corpus that declare no author are given one by hand, `Nicolas Zozol`, as the nine others declare. Why: eleven articles written by one person, and a required field with two known holes is a correction to make once rather than a rule to weaken. This is implementation work, not a further requirement.

## Dependencies

- Dep 1: migrate-learn-content — supplies the corpus at `apps/robusta-build/content/articles` and the asset root the cover images resolve through. There is no article to render before it lands.

## Documentation updates

- create the article-page section of `apps/robusta-build/robusta-build.archi.md` — why: the site's architecture document describes a shell with a route table and no page rendering, and this is the first real page the v2 site serves.
- change the Routing section of `apps/robusta-build/README.md` — why: it states that every content route renders a placeholder, which stops being true for the four article routes.
- change `packages/pyramids-content/content.archi.md` — why: this story widens the package's reading contract twice, and the architecture document states both as they stand today. A rendered body now carries resolved image references, described at three places — the module map, the `read-article-body.ts` entry and the asset-behaviour note — and `ArticleEntry` gains a required author, in the contract block and in the schema section. A contract change nobody documents is the drift that document exists to prevent.
- change the Articles section of `apps/robusta-build/README.md` — why: it is what a publisher reads before writing a file, and it lists `author` among the keys that travel in the file and cost nothing, which the required field contradicts.
