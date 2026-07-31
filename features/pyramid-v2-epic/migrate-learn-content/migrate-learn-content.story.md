# Story : Migrate the learn articles onto the v2 site

**Dernière mise à jour :** 2026-07-29
**Feature :** migrate-learn-content
**Infix :** MIGRATELEARN
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want the articles of the v1 site served by the v2 site under the new URL scheme, so that the published content survives the switch and `apps/robusta` can finally be retired.

## Contexte & objectif

The content this story migrates lives as markdown files under `apps/robusta/content/blog`: 11 articles in two locales, spread over five categories, each carrying its title, date, category, tags and author in its frontmatter. Until the v2 site serves them, robusta.build v2 is an empty shell and the v1 site cannot be retired — the last item of the epic.

The stake is indexation, not copying. v1 addresses an article as `/learn/{category}/s/{slug}`, where the slug comes from the title through a slugify implementation the code itself forbids changing. v2 changes every part of that address: `articles` in place of `learn`, `/blog/c/{category}`, `/l/{locale}/` for the non-default locale, pagination as query parameters (BR-PYRAMID-1). So every indexed URL moves, and the migration is as much a redirect exercise as a content move: a slug never changes once published (`ubiquitous-language.md`), and an indexed URL left without a redirect is a page lost from the search results.

Implementation is blocked until seo-url-scheme (item 4 of the epic) fixes the destination URLs and content-source (item 5) fixes how articles reach the site; brainstorm and design can start now. The fate of `apps/robusta/public/images` is arbitrated by the epic, not here — the images the articles actually reference sit elsewhere, under `content/blog/**/images`.

## What travels

- 11 articles across five categories: blockchain 4, javascript 4, privacy 1, theory 1, web 1. The `security` and `prompt` folders hold images but no article.
- Two locales: `en` (default, unmarked in the URL) and `fr`, carried by a `locale` frontmatter field. Two articles exist in both languages — `yield-farming` and the Gatsby-to-NextJS migration piece — as two separate files; this tree carries no field linking the two versions.
- Frontmatter fields to preserve: title, tags, locale, date, categoryPath, image, author.
- Per-article images under `content/blog/**/images`, referenced by relative paths from the markdown.

## Definition of done

- Every v1 article is readable on the v2 site, in its locale and under its category, with title, date, author, tags and category preserved.
- The v2 URL of an article carries the same slug as its v1 URL.
- Every indexed v1 URL — article, category page, roll page — redirects permanently to its v2 counterpart; no indexed URL ends on a 404.
- The link between the two locale versions of the same article resolves to a v2 URL.
- Images referenced by an article are served by the v2 site; no migrated article shows a broken image.
- Does not rewrite article content: an article aged out of date is a separate editorial matter.
- Does not cover sitemap, structured data or internal linking (seo-excellence, item 8), nor the retirement of `apps/robusta` (item 12).

## Décisions

- 2026-07-29 — v2 keeps tags as article metadata without a page of their own, and the indexed tag URLs (`/learn/tag/{tag}`) redirect to the blog home. Pourquoi : the corpus does not justify a second classification axis next to categories, and a redirect keeps the indexed URLs alive at the cost of one rule. Réf : Gap 1 of seo-excellence, arbitrated the same way the same day.
- 2026-07-29 — The migration corpus is content/blog only: the 11 articles of `apps/robusta/content/blog`, as fixed by the epic. The 5 articles that exist only under `public/learn` are out of this migration — what becomes of them is a separate editorial call, not a migration question. Pourquoi : the epic fixed the corpus at content/blog, and the 13-article Proposition contradicted it; re-answered on 2026-07-29, this supersedes the earlier lgtm. Réf : Open Question 1 of this story, held back as CONFLICT on the 2026-07-29 pass.
- 2026-07-30 — This story corrects the frontmatter locale of `yield-farming.md` and `why-migration-gatsby-next.md` while moving them: both are English pieces declaring `locale: "fr"`. Pourquoi : arbitration C6 of `pyramid-v2.bulk.md`, merging Gap 4 of `seo-url-scheme.brainstorm.md`, Open Question 4 of `content-source.brainstorm.md` and Gap 5 of `seo-excellence.brainstorm.md` — this story owns the frontmatter fields that travel, `fr` is a valid locale so no schema can catch the error, and the real split is 8 English and 3 French rather than the 6 and 5 declared.
- 2026-07-30 — Nothing under `apps/robusta/public/images` travels to the v2 site. Pourquoi : arbitration of Gap 1 of this story, which carried no proposition of its own and was blocked on the epic; it confirms the epic's structuring decision of 2026-07-29 — the images the articles reference sit under `public/learn/**/images` and travel with them, while `public/images` holds v1 chrome the design system replaces.
- 2026-07-30 — The redirect map is built from v1's generated route set, which covers all 11 articles unconditionally; the indexed-pages export of Google Search Console is pulled once before v1 is retired, purely to check the map covers what search engines hold. Pourquoi : arbitration of Gap 4 of `migrate-learn-content.brainstorm.md` — the `public/learn` tree is keyed by file name and not by slug, carries a pre-Gatsby schema and holds five articles the site does not serve, so the "8 of 11 articles have a live indexed URL" reading of it does not hold; the Search Console pass is a verification, not an input, and must not block the work.
- 2026-07-30 — `featured: true` travels unchanged on the 7 articles carrying it; the publisher re-picks the featured set when robusta-landing-page decides what a featured article is for. Pourquoi : arbitration of Open Question 2 of `migrate-learn-content.brainstorm.md` — re-picking is an editorial judgement about which articles deserve the front page, not a migration question.
- 2026-07-30 — This story also delivers the landing page's NotesPreview section, fed by the real articles. Pourquoi : arbitration of Gap 5 of `robusta-landing-page.brainstorm.md`, folded here because it is the receiving story — robusta-landing-page defers NotesPreview to this one, and a deferral only holds if the receiver records it. The Definition of done above covers articles, URLs, redirects and images and never mentions the landing page.

## Documentation updates

- change the content section of `root.archi.md` — why: it points at `apps/robusta/public/learn` as the place where articles live, which stops being true once they serve from the v2 site.
- create the article-authoring section of the `apps/robusta-build` README — why: where a new article goes, which frontmatter fields are required, where its images belong.
- create the v1 to v2 URL mapping next to that README — why: the redirects must stay auditable until `apps/robusta` is retired (item 12).

## Dependencies

- Dep 1: seo-url-scheme (item 4 of the epic) — fixes the destination URLs, and therefore the redirect map. Blocks implementation, not brainstorm or design.
- Dep 2: content-source (item 5 of the epic) — fixes how articles reach the site; the move has no target before it is settled.
