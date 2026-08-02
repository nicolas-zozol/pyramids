# Story : Article page of the v2 site

**Dernière mise à jour :** 2026-08-02
**Feature :** article-page
**Infix :** ARTICLEPAGE
**Status :** LANDED (2026-08-02, commit 3ab28e7)

## Story

As a reader of robusta.build, I want an article to render as an article — its title, its date, its body, its cover, and the way out to its category and to its other language — so that the content the v2 site serves is worth arriving at.

## Contexte & objectif

The v2 site served eleven real articles at working URLs, every one of them rendering a `RoutePlaceholder`: seo-url-scheme built the routes and excluded page copy, content-source built the reader and excluded rendering, and the arbitration of 2026-08-01 kept migrate-learn-content a corpus and redirect exercise. This story is the page itself — one `ArticleView` behind the four article routes, the author added to the reading contract, and the body images finally resolved. It is the first page copy the v2 site carries.

## Livré

Delivered by `3ab28e7`, the design system's measure token by `2e014fb`, the documentation by `8a2d183`. Tests: `@robusta/pyramids-content` at 98, `apps/robusta-build` at 38, `@robusta/pyramids-routing` unchanged at 78. The build produces 21 content URLs and 23 HTML files on disk, while Next announces 25 static pages; the difference of two is attributed to nothing — seven of the fourteen route files pregenerate an empty list, and nothing in the output singles out two of them.

### Requirements

- R-ARTICLEPAGE-01 : The four article routes render one shared view, and each route file keeps only its param shape, its `generateStaticParams` and its static flags.
- R-ARTICLEPAGE-02 : An article page renders the title, the date, the author, the tags and the category its index entry carries, and the body of that article.
- R-ARTICLEPAGE-03 : The excerpt is rendered nowhere on its own — `readArticleBody` already returns it as the opening block of the body.
- R-ARTICLEPAGE-04 : The body HTML reaches the DOM at one boundary, and that boundary is the site's only `dangerouslySetInnerHTML`.
- R-ARTICLEPAGE-05 : The article's content is wrapped in an element whose `lang` states the article's locale.
- R-ARTICLEPAGE-06 : A slug the index does not carry fails the build naming the locale and the slug, and no page renders a not-found state.
- R-ARTICLEPAGE-07 : `ArticleEntry` carries a required `author`, read from the frontmatter; an article declaring none is a `missing-field` violation carrying `author`, indexes no entry and fails the build, as a missing title does.
- R-ARTICLEPAGE-08 : Every article of the corpus declares an author, the two carrying none being given `Nicolas Zozol`.
- R-ARTICLEPAGE-21 : `readArticleBody` returns HTML whose every article-relative image reference is resolved through `resolveAssetUrl`, and whose external, protocol-relative and site-absolute references are untouched.
- R-ARTICLEPAGE-22 : The cover is resolved through `resolveAssetUrl` from `entry.image`, which the reading contract carries unresolved, and is served from the asset root rather than imported through the bundler. The site calls it through one seam, and no component reaches the corpus declaration.
- R-ARTICLEPAGE-23 : The cover renders through `next/image` with `fill` and an explicit `sizes`, inside a container of fixed aspect ratio.
- R-ARTICLEPAGE-24 : The cover carries an empty `alt`. The corpus declares no alt text for it, and repeating the title beside the `h1` announces the same words twice.
- R-ARTICLEPAGE-25 : An article declaring no cover renders neither a cover nor an empty container in its place.
- R-ARTICLEPAGE-26 : Body images render as the `<img>` remark emits, carrying the alt text their author wrote. An image written as raw HTML rather than as markdown renders nothing at all.
- R-ARTICLEPAGE-27 : The body is rendered with remark-html's default sanitizing behaviour, and that default is not relaxed: raw HTML written in an article renders as its text alone, and `allowDangerousHtml` is not enabled to recover it.
- R-ARTICLEPAGE-41 : An article claiming a category links to the first roll page of that category, in the article's locale, through `buildUrl`.
- R-ARTICLEPAGE-42 : An article claiming no category renders no category link.
- R-ARTICLEPAGE-43 : An article links to its other-locale version only when a published article of another locale shares its translation identifier, and renders no such link otherwise.
- R-ARTICLEPAGE-44 : Both links are `next/link`.
- R-ARTICLEPAGE-61 : The body's typography is a CSS Module scoped on the container class and addressing elements by name, covering the elements the design system leaves unstyled and neutralising its inline-`code` rule inside `pre`.
- R-ARTICLEPAGE-62 : Every colour, size, spacing, radius and measure the page renders resolves to a custom property of `@robusta/pyramids-design-system`, and the page declares no literal of its own. Realizes BR-PYRAMID-6.
- R-ARTICLEPAGE-63 : The page adds no component to the design system, and imports none of `pyramids-layouts`, `pyramids-links` or `pyramids-ctas`.
- R-ARTICLEPAGE-64 : `@tailwindcss/typography` is not added to the site.
- R-ARTICLEPAGE-65 : Every string the page renders that is not the article's own content is the site's. Realizes BR-PYRAMID-8.
- R-ARTICLEPAGE-66 : No article page reads the corpus while serving a request. Realizes BR-PYRAMID-7.
- R-ARTICLEPAGE-67 : A value the page needs and no design-system token names is added to the design system as a token, never declared by the page as a literal and never answered by a component. The line length the body is held to is that case, and the only one this page raises. Realizes BR-PYRAMID-6.

### Acceptance Criteria

- AC-ARTICLEPAGE-01 : Given the eleven published articles, when Tux builds, then each answers at its canonical URL with its title, its date, its author and its body, and no article page renders a `RoutePlaceholder`.
- AC-ARTICLEPAGE-02 : Given `javascript/pourquoi-migration-gatsby-next-js.md`, whose body references `./images/promo-gatsby-vs-next.png` and whose text links an image on another host, when Barbot loads the page, then the first is fetched under the asset root and answers 200, and the second is fetched unchanged.
- AC-ARTICLEPAGE-03 : Given a corpus whose `CorpusSpec` declares no assets, when its body is rendered, then every reference is what its author wrote.
- AC-ARTICLEPAGE-04 : Given the two translated pairs, when Barbot reads either side, then a link leads to the other locale's page; and given `theory/quel-second-langage.md`, which declares no translation identifier, then the page carries no such link.
- AC-ARTICLEPAGE-05 : Given `privacy/leaving-gmail.md`, which claims `privacy`, when Barbot reads it, then a link leads to `/articles/c/privacy`; and given an article claiming no category, then the page carries no category link.
- AC-ARTICLEPAGE-06 : Given a built article page, when Barbot requests it, then no file under `content/articles` is read.
- AC-ARTICLEPAGE-07 : Given a rendered article page on a wide viewport, when Ada inspects its computed styles, then every colour, font size, spacing and the width the body is held to traces to a custom property of the design system; the page's own CSS declares no literal, and the one value the system did not name is a token the system gained rather than a component.
- AC-ARTICLEPAGE-08 : Given an article body carrying a fenced code block, a bullet list and a blockquote, when Barbot reads it, then each is styled, and no inline-code box is drawn inside the code block.
- AC-ARTICLEPAGE-09 : Given a French article, when Barbot reads it with a screen reader, then its content is announced as French.
- AC-ARTICLEPAGE-10 : Given an article whose excerpt is its opening paragraph, when Barbot reads the page, then that paragraph appears once.
- AC-ARTICLEPAGE-11 : Given Nina deleting an image an article still references, when Tux builds, then the build fails naming the file, and no page is produced carrying a broken image.
- AC-ARTICLEPAGE-12 : Given an article cover stored as PNG, when Barbot loads the page on a browser accepting WebP, then the optimizer serves WebP.
- AC-ARTICLEPAGE-13 : Given Nina writing an article whose frontmatter declares no author, when Tux builds, then the build fails naming the file and the missing field, and no page is produced for it.
- AC-ARTICLEPAGE-14 : Given `theory/quel-second-langage.md`, whose body carries `<u>le</u>` in mid-sentence, when Barbot reads the page, then the sentence reads `clairement le langage à la mode`, with no underline and no markup shown.

## Décisions

- 2026-08-02 — the author is required and not optional; an article declaring none is a `missing-field` violation like a missing title or date. Why: the definition of done asked for the author preserved on every article, and an optional field leaves an article without one publishable, which is exactly the case the requirement is about.
- 2026-08-02 — the two articles of the corpus that declared no author are given one by hand, `Nicolas Zozol`, as the nine others declare. Why: eleven articles written by one person, and a required field with two known holes is a correction to make once rather than a rule to weaken.
- 2026-08-02 — `--measure: 68ch` is added to the design system rather than declared by the page. Why: the article page had no maximum width and ran its text across the whole window, on the most typographic page of the site. R-ARTICLEPAGE-62 forbids the page declaring a literal of its own and BR-PYRAMID-6 makes the design system the only source of a site's tokens, so the value had to exist there or nowhere. A token is not a component, and the component is what the definition of done meant.
- 2026-08-02 — five article pages carry a second `h1`, their body declaring one of its own, and none was demoted. Why: rewriting an author's headings rewrites their content. Heading structure is a seo-excellence subject, and the site is `robots: noindex` until robusta-landing-page lifts it; the corpus is where each of the five is fixed, one article at a time.
- 2026-08-02 — the page renders no related-articles block, and the end of the article is left free on purpose. Why: the term is defined in the glossary and `seo-excellence.story.md` claims it verbatim, with the relatedness rule and the cap already brainstormed there. A first version rendered here would be built to be replaced.
- 2026-08-02 — `<html lang>` stays the site's default locale on every page. Why: App Router allows that tag in the root layout alone, where the locale is unknown. The three French articles carry `lang="fr"` on their `<article>`, which corrects what this story renders; moving the document attribute is not this story's to do.
- 2026-08-02 — AC-ARTICLEPAGE-02 is proved on the real corpus for its asset-root half alone, its external half resting on unit tests of `@robusta/pyramids-content`. Why: no body of the corpus references an external image. The design's "ten of the eleven articles link external images" counted external pages, not images, and the corpus test verifies instead that external links survive rendering untouched.
- 2026-08-02 — R-ARTICLEPAGE-25, the branch where an article declares no cover, is exercised by no test over the corpus. Why: the eleven articles all declare one. The case stays legal and unrepresented, and the first article published without a cover is what will exercise it.

## Documentation updates

- created the article-page section of `apps/robusta-build/robusta-build.archi.md`, with the five gotchas that go with it
- changed the Routing section of `apps/robusta-build/README.md` — nine routes render a placeholder, not every one
- changed `packages/pyramids-content/content.archi.md` at the three places describing the body contract, plus the required author in the contract block and the schema
- changed the Articles section of `apps/robusta-build/README.md` — `author` moved to what the frontmatter must carry, and HTML written in a body renders as its text alone
- changed the typography section of `packages/robusta-design-system/README.md` — `--measure`, 68ch, and why in `ch` rather than px
- changed the apps/robusta-build entry of `root.archi.md`
- changed the Apps section of `CLAUDE.md` — the v2 site carries page copy since 2026-08-02
