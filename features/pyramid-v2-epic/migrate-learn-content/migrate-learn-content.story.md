# Story : Migrate the learn articles onto the v2 site

**Dernière mise à jour :** 2026-08-02
**Feature :** migrate-learn-content
**Infix :** MIGRATELEARN
**Status :** LANDED (2026-08-02, commit 0282952)

## Story

As the publisher of robusta.build, I want the articles of the v1 site served by the v2 site under the new URL scheme, so that the published content survives the switch and `apps/robusta` can finally be retired.

## Contexte & objectif

The eleven articles of `apps/robusta/content/blog` now live under `apps/robusta-build/content/articles`, converted to the v2 schema, with their images and with the v1 address space mapped onto the new one. The stake was indexation rather than copying: every v1 URL moved, and a slug never changes once published. The v1 tree is frozen since the copy and `retire-robusta-v1` deletes it rather than merging it back.

## Livré

Content and mapping by `0282952`, documentation by `3ebe44a`. The site produces 25 static pages over 21 content URLs, and the generated v1 map holds 82 rows. Article rendering is deliberately absent: both article routes still render `RoutePlaceholder` and reading an article is [article-page](../article-page/article-page.story.md).

### Requirements

- R-MIGRATELEARN-01 : The eleven articles of `apps/robusta/content/blog` are copied into `apps/robusta-build/content/articles`, and no file is removed from the v1 tree.
- R-MIGRATELEARN-02 : A converted article's markdown body is byte-identical to its source; only frontmatter differs between the two files.
- R-MIGRATELEARN-03 : `apps/robusta/content/blog` is frozen from the day of the copy: no article is edited there, and `retire-robusta-v1` deletes it rather than merging it back.
- R-MIGRATELEARN-04 : An article claims one flat category, the last segment of the path v1 declared. Realizes the glossary's Category.
- R-MIGRATELEARN-05 : An article's declared locale is the language the article is written in.
- R-MIGRATELEARN-06 : The four articles forming the two translated pairs share a translation identifier within their pair, authored rather than derived from any slug, file name or date; the other seven carry none.
- R-MIGRATELEARN-07 : Every other frontmatter key a source file carries is present with the same value in its copy.
- R-MIGRATELEARN-08 : An article's slug after conversion is the one the v1 mapping was computed from, the locale corrections included.
- R-MIGRATELEARN-09 : Every migrated article declares itself published. Realizes BR-PYRAMID-10.
- R-MIGRATELEARN-21 : Every image an article references travels with it and is served by the v2 site; an image no article references does not travel.
- R-MIGRATELEARN-22 : An image reference keeps in the file the article-relative form it is authored in; the site resolves it during the build and rewrites no file.
- R-MIGRATELEARN-23 : A reference resolving to a file the corpus does not hold, or to a path outside the corpus, is a violation naming the article and the reference, and fails the build before a page is generated.
- R-MIGRATELEARN-24 : An image is addressed under an asset root of its own, outside every shape the URL scheme reserves for a page. Realizes BR-PYRAMID-1.
- R-MIGRATELEARN-25 : No image is served by reading the content source at request time. Realizes BR-PYRAMID-7.
- R-MIGRATELEARN-26 : A URL whose path is case-significant is not case-normalised, and the asset root is such a namespace.
- R-MIGRATELEARN-27 : An image referenced by an article sits beside it in the corpus, and the corpus is the single tree an author edits.
- R-MIGRATELEARN-28 : The asset directory is produced in full by the build and belongs to no other writer, so no file a previous build produced survives a rename or a deletion.
- R-MIGRATELEARN-29 : The asset directory is generated rather than committed, and the build produces it from a clean checkout. Realizes BR-PYRAMID-5.
- R-MIGRATELEARN-44 : The landing page's notes section takes its posts from the site's published articles, and no default of the design system supplies its copy. Realizes BR-PYRAMID-8.
- R-MIGRATELEARN-45 : That section is mounted on the home page the site serves today, and robusta-landing-page carries it across rather than building it.
- R-MIGRATELEARN-61 : An article row's source is the URL the v1 build generated for that article, which carries no locale segment whatever the article's locale.
- R-MIGRATELEARN-62 : The mapping is regenerated from the real index and committed; no row mentions a fixture slug.
- R-MIGRATELEARN-63 : No redirect from the v1 address space is live while the site answers not to index.
- R-MIGRATELEARN-81 : The green set keeps building from a clean checkout, `@robusta/build` included, from this story's commit until `retire-robusta-v1`. Realizes BR-PYRAMID-5.
- R-MIGRATELEARN-82 : A site's corpus is verified in that site's own workspace; the shared base holds no test reaching into an app, the freeze between the two corpora excepted.

R-MIGRATELEARN-41, 42 and 43 left with article rendering on 2026-08-01 and are not delivered here. The numbers are not reused.

### Acceptance Criteria

- AC-MIGRATELEARN-01 : Given the converted corpus, when Tux builds, then eleven published articles are indexed with no violation and no unpublished path, and their slugs are the eleven the v1 mapping was computed from. Realizes BR-PYRAMID-10.
- AC-MIGRATELEARN-02 : Given each of the eleven pairs of files, when their markdown bodies are compared, then they are byte-identical, and given an article edited under `apps/robusta/content/blog` afterwards, then that comparison fails. Realizes R-MIGRATELEARN-02 and 03.
- AC-MIGRATELEARN-03 : Given `javascript/typescript/completes-with.md`, when the site is built, then it claims `typescript`, is addressed at `/articles/c/typescript/completing-a-rxjs-observable-with-another`, and no violation is raised about the folder it sits in.
- AC-MIGRATELEARN-04 : Given the converted corpus, when the index is read, then it splits into eight English and three French articles, and the slugs of the two corrected files are unchanged.
- AC-MIGRATELEARN-05 : Given the converted corpus, when translation identifiers are read, then exactly four articles carry one, forming two pairs, each pair holding one English and one French article.
- AC-MIGRATELEARN-21 : Given the built site, when Barbot requests `/article-images/blockchain/images/aave-small.png` and `/article-images/images/styled-logo.png`, the cover of `styled-components.md` in the corpus's shared folder, then both are served, and the 44 files the corpus references are all reachable the same way. Realizes R-MIGRATELEARN-21 and 22.
- AC-MIGRATELEARN-22 : Given `quel-second-langage.md`, whose body references `./images/M87.jpg`, when Barbot requests that image, then it is served and never redirected to a lowercase path. Realizes R-MIGRATELEARN-26.
- AC-MIGRATELEARN-23 : Given an article referencing an image the corpus does not hold, when Tux builds, then `yarn emit:redirects` fails naming the article's file and the reference, and no page and no asset have been produced. Realizes R-MIGRATELEARN-23.
- AC-MIGRATELEARN-24 : Given the built site, when Barbot follows every image reference the corpus carries, then none answers 404 or 410.
- AC-MIGRATELEARN-25 : Given the built site, when a request is served, then no file of `content/articles` is read. Realizes BR-PYRAMID-7.
- AC-MIGRATELEARN-26 : Given a built site, when Ada renames an image in the corpus, fixes the reference and builds again, then the asset directory holds the new name and not the old one. Realizes R-MIGRATELEARN-28.
- AC-MIGRATELEARN-27 : Given a clean checkout, when Tux builds the site, then the asset directory is created by the build, holds the 44 referenced files, and appears in no diff. Realizes R-MIGRATELEARN-29.
- AC-MIGRATELEARN-43 : Given the home page the site serves, when Barbot requests `/`, then it carries a notes section listing the four newest published English articles, each linking to that article's v2 URL, and none of the design system's default posts and none of its default headings appears. Realizes BR-PYRAMID-8 and R-MIGRATELEARN-45.
- AC-MIGRATELEARN-61 : Given the converted corpus, when the site is built, then the URL set holds 21 URLs — 2 blog homes, 8 category pages, 11 articles, no roll page — and the prerender manifest matches it exactly.
- AC-MIGRATELEARN-62 : Given `/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere`, the address v1 generated for a French article, when Barbot requests it, then it is permanently redirected to `/l/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere` and never answers Gone; and no row of the mapping carries a `/learn/fr/` source that v1 never published. Realizes R-MIGRATELEARN-61.
- AC-MIGRATELEARN-63 : Given the regenerated mapping, when Nina reads it, then it holds 82 rows — 66 permanent, 6 gone, 10 none — no row mentions a fixture slug, and each of the thirteen raw markdown URLs redirects or answers Gone as its article's presence in the index decides.
- AC-MIGRATELEARN-64 : Given each of the fourteen tag URLs and each of the twenty-eight declared category rows, when Barbot requests them, then each reaches a 200 in exactly one hop, twelve category rows and three tag rows landing on a category page rather than on the blog home.
- AC-MIGRATELEARN-81 : Given a clean checkout at this story's commit, when Tux runs the green set, then every workspace of it builds, `@robusta/build` producing its 42 pages from `content/blog`. Realizes BR-PYRAMID-5.
- AC-MIGRATELEARN-82 : Given the deployed site, when Nina checks it, then it still answers not to index and no redirect from the v1 address space is live. Realizes R-MIGRATELEARN-63.
- AC-MIGRATELEARN-83 : Given the repository at this story's commit, when Ada runs the tests of `@robusta/pyramids-content`, then no spec of that package reads a file of any app; and running the tests of `@robusta/robusta-build` verifies the site's corpus against the site's own declaration. Realizes R-MIGRATELEARN-82.

AC-MIGRATELEARN-41 and 42 left with the article page. The numbers are not reused.

## Décisions

- 2026-07-29 — v2 keeps tags as article metadata without a page of their own. Pourquoi : the corpus does not justify a second classification axis next to categories. Refined by seo-url-scheme on 2026-07-31 and delivered that way: a tag URL reaches the category page of the same name when that category has a page, and the blog home otherwise, the split being computed from the corpus by `v1UrlMap` rather than enumerated.
- 2026-07-29 — The migration corpus is content/blog only: the 11 articles of `apps/robusta/content/blog`, as fixed by the epic. The 5 articles existing only under `public/learn` are out of it, and their five raw markdown URLs keep answering 410. Pourquoi : the epic fixed the corpus at content/blog; what becomes of the other five is a separate editorial call, not a migration question.
- 2026-07-30 — This story corrects the frontmatter locale of `yield-farming.md` and `why-migration-gatsby-next.md` while moving them: both are English pieces declaring `locale: "fr"`. Pourquoi : this story owns the frontmatter fields that travel, `fr` is a valid locale so no schema can catch the error, and the real split is 8 English and 3 French rather than the 6 and 5 declared.
- 2026-07-30 — Nothing under `apps/robusta/public/images` travels to the v2 site. Pourquoi : the images the articles reference sit beside them and travel with them, while `public/images` holds v1 chrome the design system replaces. Confirms the epic's structuring decision of 2026-07-29.
- 2026-07-30 — The redirect map is built from v1's generated route set, which covers all 11 articles unconditionally; the indexed-pages export of Google Search Console is pulled once before v1 is retired, purely to check the map covers what search engines hold. Pourquoi : the `public/learn` tree is keyed by file name and not by slug, carries a pre-Gatsby schema and holds five articles the site does not serve, so it is no input; the Search Console pass is a verification and must not block the work.
- 2026-07-30 — `featured: true` travels unchanged on the articles carrying it; the publisher re-picks the featured set when robusta-landing-page decides what a featured article is for. Pourquoi : re-picking is an editorial judgement about which articles deserve the front page, not a migration question. Its figure was wrong: eight articles carry the flag, not the seven first recorded, counted against the corpus on 2026-08-01.
- 2026-07-30 — This story also delivers the landing page's notes section, fed by the real articles. Pourquoi : robusta-landing-page defers it here and a deferral only holds if the receiver records it; it inherits a working section rather than a receipt.
- 2026-08-01 — The eleven articles are copied into `apps/robusta-build/content/articles` rather than moved, and `apps/robusta/content/blog` is frozen the day the copy is taken. Pourquoi : a move empties the tree `apps/robusta` renders, so `yarn build:robusta` stops producing 42/42 and the green set of BR-PYRAMID-5 stays red for the remaining length of the epic, which costs more than a duplicated corpus nobody is allowed to edit. `corpus-freeze.spec.ts` is what stops the two corpora diverging, and it does not catch frontmatter edits on the v1 side, which rest on discipline.
- 2026-08-01 — Article rendering leaves this story and becomes [article-page](../article-page/article-page.story.md), which took the readable-articles bullet with it. Pourquoi : seo-url-scheme excluded page copy, content-source excluded layout and robusta-landing-page owns the home page alone, so the gap was real; it is answered with a story of its own rather than by widening the migration. Impact : this story delivers eleven addressable articles that render a placeholder until article-page runs.
- 2026-08-01 — Images sit beside their article under `content/articles/**/images` and a build step copies them into a git-ignored `public/article-images/`; the notes section is built and mounted here rather than deferred; and `apps/robusta-build` gains a vitest setup, with the corpus and freeze specs living in the app. Pourquoi : one tree and working editor previews are worth a copy script and a generated subtree, a section fed by real articles survives the page being rebuilt around it, and a base package holding tests that reach into an app is the thing to end rather than to schedule.
- 2026-08-02 — The figures the documents carried were re-measured rather than copied, and corrected everywhere: the site produces 25 static pages and not 62, the route table holds 21 content URLs, and the generated v1 map 82 rows — 66 permanent, 6 gone, 10 none — and not 99. Pourquoi : 62 and 99 were the fixture corpus, which left with the fixtures. Against that documented map the only class that moved is the article rows, 31 to 14; the category and markdown gains the design lists are relative to the empty-corpus state of 68 rows, which no document ever published, so they are not to be quoted as gains.

## Documentation updates

Delivered by `3ebe44a`. Four locations outside the plan were touched in the same pass and are recorded here.

- changed the content section of `root.archi.md` — both corpora, the reader package and the asset mirror are named, and the `public/learn` open point is recorded as settled by the decision of 2026-07-29.
- changed the Children entry of `root.archi.md` — outside the plan: `content` is listed beside the other packages.
- created the Articles section of the `apps/robusta-build` README — where a new file goes, which frontmatter the v2 schema requires, how the slug is derived, where images belong, where a mistake surfaces.
- changed the v1 mapping section of the same README — 82 rows over the real corpus in place of the fixture era's 99, and the article rows moving from 31 to 14.
- changed the route table paragraph of the same README — outside the plan: 21 content URLs and 25 static pages in place of the fixture figure of 62.
- changed the `getCategories` paragraph of the same README — outside the plan: the resolver left with content-source, and `src/content/article-index.ts` is what answers now.
- changed `apps/robusta-build/robusta-build.archi.md` — the asset root, the build step that copies images into `public/`, the mounted notes section and the middleware exclusion the one uppercase asset forces.
- created `packages/pyramids-content/content.archi.md` — the plan said change, but the file did not exist. Creating it discharges the same bullet from content-source's plan.
- changed the Apps entry of `CLAUDE.md` — outside the plan: the migrated corpus and 25 static pages in place of the fixture description.
