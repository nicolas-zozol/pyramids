# Story : SEO URL scheme of the v2 site

**Dernière mise à jour :** 2026-07-31
**Feature :** seo-url-scheme
**Infix :** URLSCHEME
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want every URL of the v2 site to state the kind of page it addresses, so that a page resolves without consulting the content source and a reader can tell from the link where it leads.

## Contexte & objectif

The v1 scheme is documented in the Routing section of `apps/robusta/README.md`: three discriminants — the locale, `page` for the blog roll, `p` for a post — producing paths like `/learn/fr/blockchain/page/2` and `/learn/blockchain/p/what-is-blockchain`. It works, but it is deep, and `learn` names a section nobody searches for. The v2 scheme replaces it with discriminants of its own — `l` for the locale, `c` for a category, `p` for a roll page, and `t` reserved for a tag page it does not build — under a content root the site names, `articles` for robusta.

What does not change is why the discriminants exist. BR-PYRAMID-1 — "The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source." — is the rule this story carries, and it is also what lets Next.js pregenerate pages at build time instead of resolving them at runtime. Pagination was the one point pushing against that rationale, and it is settled: a page number is a path segment, so no content route reads search parameters and every content page is produced at build time.

The domain does not switch. The v2 site therefore inherits the published address space of robusta.build, and the mapping from every v1 address to its v2 destination is this story's deliverable as much as the scheme itself; migrate-learn-content ships the redirects that mapping prescribes.

`apps/robusta-build` exists since bootstrap-robusta-build landed on 2026-07-31 as commit `84c3587`: a deployable shell at 4/4 static pages, in the green set, carrying no page copy and `robots: noindex` site-wide until robusta-landing-page lifts it. Implementation is unblocked.

## Target scheme

- `/` — landing page
- `/articles` — blog home, first page of the roll of every article
- `/articles/p/{n}` — page n of that roll, n ≥ 2
- `/articles/c/{category}` — category page, first page of its roll; no sub-categories, no nesting
- `/articles/c/{category}/p/{n}` — page n of a category roll
- `/articles/c/{category}/{slug}` — an article carrying a category, which most do
- `/articles/{slug}` — an article carrying none
- `/articles/t/{tag}` — reserved, not built: the shape is spoken for so a tag page stays possible later, and nothing may take the segment in the meantime
- `/l/{locale}` prefixing any of the above — the same page in a non-default locale; the default locale carries no marker

The site owns the content root through `seopyramids.config.ts` — `articles` is robusta's editorial word, not a constant of the base. The base owns `l`, `c`, `p`, `t` and the shapes built from them.

## Definition of done

- Every page of `apps/robusta-build` is reachable through a URL that states its kind — landing page, blog home, category, article — and the site resolves it without reading the content source.
- A blog roll is paginated by `/p/{n}` at the roll size of `seopyramids.config.ts`, which never appears in an address; the bare roll address serves page one, and `/p/1` redirects to it permanently, on the blog home as on a category page.
- Every content address is produced at build time and no content route reads search parameters.
- A non-default locale carries `/l/{locale}` at the head of the path; the default locale carries no marker, and the marked form of a default-locale URL redirects permanently to the unmarked one, so a page has one URL.
- An article claims at most one category and any number of tags (BR-PYRAMID-9): an article claiming more fails the build rather than having one picked for it, since `/articles/c/{category}/{slug}` only reads back to a single article if a category is singular.
- An article that carries a category is addressed under it and one that carries none sits directly under the content root; `/articles/articles/{slug}` is never emitted, and no category address nests.
- `/articles/t/{tag}` is reserved without being built: no tag page and no tag route ship here, a tag stays metadata, and no article slug and no category may take the value `t` — as none may take `l`, `c` or `p`.
- The content root comes from `seopyramids.config.ts` and the value `articles` appears nowhere in the shared base.
- The mapping from every address the v1 site published to its v2 destination is written down and reviewable before any redirect ships.
- Every indexed `/learn/tag/{tag}` address has a destination in that mapping, on the condition of the rule rather than on a fixed list: a tag address reaches the category page of the same name when that category has an address, and the blog home otherwise. The split is recomputed from the corpus, and a tag is never promoted to a category to make a redirect land.
- The thirteen raw markdown addresses published under `/learn/**/*.md` are retired deliberately: one whose content travels to v2 redirects permanently to its article, one whose content does not answers 410 Gone.
- `/portfolio` and `/fr/portfolio` appear in the mapping as getting no redirect, rather than being left unlisted.
- The scheme is exercised on a handful of fixture articles — the real content arrives with migrate-learn-content.
- Does not cover the sitemap, the structured data and the canonical or hreflang metadata: those belong to seo-excellence.

## Décisions

- 2026-07-29 — The root segment of the content section is `articles`, not `blog`: "No, use `articles` at the root, instead of `blog`". Pourquoi : arbitration of Gap 1, against the proposition that kept `/blog` as the single content root. The Target scheme above, the Contexte of `pyramid-v2.epic.md` and `ROADMAP.md` still read `/blog/c/{category}`; the divergence is recorded as a dated decision of the epic and left to their owners.
- 2026-07-29 — The pagination shape is chosen on SEO and speed grounds rather than fixed here: "do what is better for seo and speed ; for category page, having `/p/1` with fixed size is probably better". Pourquoi : arbitration of Open Question 1, which modifies the proposition — query-parameter pagination is what the epic announces, a fixed-size `/p/1` path segment for category pages is not, and the tension is recorded rather than smoothed over. What "better" resolves to on each kind of page is design work, on numbers.
- 2026-07-29 — The v2 site owes redirects for the indexed `/learn/...` URLs: "the domain won't switch. We need some redirect for old pages in `/learn/...`". Pourquoi : arbitration of Open Question 2, which modifies the proposition — the redirects were to ship with retire-robusta-v1 at the moment of a domain switch, and the arbitration states there is no such switch.
- 2026-07-30 — The v2 article address is `/articles/c/{category}/{slug}` when the article carries a category, which most do, and `/articles/{slug}` otherwise; `/articles/articles/{slug}` is never emitted, and no sub-category is expected for the moment. Pourquoi : arbitration C2 of `pyramid-v2.bulk.md`, which modifies the proposition — the proposition kept the category off the article URL entirely and put it only on `/articles/c/{category}`, the arbitration puts it back into the article address. Impact : the Target scheme above still reads `/blog/articles/{slug}`, and every target of the redirect map of migrate-learn-content depends on this shape.
- 2026-07-30 — The fourteen indexed `/learn/tag/{tag}` URLs become a class of this story's v1-to-v2 mapping, so one document holds the whole map. Pourquoi : arbitration C5 of the bulk, merging Gap 2 of `migrate-learn-content.brainstorm.md` with Gap 4 of `seo-excellence.brainstorm.md` — the target was decided in two consuming stories on 2026-07-29 and recorded in neither the story that owns the map, and a redirect class absent from that map ships as a 404 on fourteen indexed URLs.
- 2026-07-30 — `/portfolio` and `/fr/portfolio` get no redirect: "no SEO tracking for that. Let it build fresh new, with new design system. Don't care of SEO redirect mapping". Pourquoi : arbitration of Gap 3 of `seo-url-scheme.brainstorm.md`, against the proposition that redirected both to the landing page in the matching locale — the two published addresses are let go rather than mapped.
- 2026-07-30 — Pagination is `/p/{n}` on every blog roll, blog home included, and `/p/1` redirects permanently to the bare roll address. Pourquoi : arbitration of Open Question 1 of `seo-url-scheme.brainstorm.md`, taking the delegated reading of the pagination arbitration of 2026-07-29 rather than the literal one — two addresses serving the identical first page is the duplicate the rest of the scheme spends redirects to avoid, and one site with two pagination shapes doubles the canonical surface for no benefit.
- 2026-07-30 — A v1 tag address redirects to the category page of the same name when that category has an address — `javascript`, `blockchain`, `web`, `security`, `solidity`, `react` — and to the blog home for the other eight; the tag itself stays metadata with no page. Pourquoi : arbitration of Open Question 2 of `seo-url-scheme.brainstorm.md`, which refines the standing decision of migrate-learn-content and seo-excellence — a redirect to a page that does not answer the request is treated as a soft 404 and the address is dropped anyway. Superseded by the decision of 2026-07-31 that drops the enumeration: the condition of the rule stands, the six-and-eight split does not, and it is recomputed from the corpus.
- 2026-07-30 — The site owns the section root through `seopyramids.config.ts`; the base owns the discriminants `l`, `c` and `p` and the shapes built from them. Pourquoi : arbitration of Open Question 3 of `seo-url-scheme.brainstorm.md` — dakar.surf has spots and not articles, so a base that hard-codes `articles` forces robusta's editorial vocabulary onto every future site, which is the base and the site growing into each other in one segment.
- 2026-07-30 — "A page must be reachable at exactly one address" is refused as a business rule: "No. I'm not sure it's a good SEO rule, honestly. Definitively not a business rule". Pourquoi : arbitration of Open Question 4 of `seo-url-scheme.brainstorm.md`, against the proposition that recorded it; nothing is written to `business-rules.md`, and the redirects it would have made obligatory — locale-marked default, explicit page one, trailing slash, letter case — stay R-URLSCHEME-8, 9 and 10.
- 2026-07-30 — A category page presents the articles claiming that exact category, and nested categories are dropped: "No. We MUST not have anymore descendants. It makes the parsing of the url too complex for the moment." Pourquoi : arbitration of Open Question 5 of `seo-url-scheme.brainstorm.md`, against the proposition that included descendants. Impact : R-URLSCHEME-5 states the opposite, the corpus carries a `javascript/typescript` category, and the Category entry of `ubiquitous-language.md` still says categories may nest.
- 2026-07-30 — Of the thirteen raw markdown addresses published under `/learn/**/*.md`, one whose content travels to v2 redirects permanently to the article and one whose content does not answers 410 Gone. Pourquoi : arbitration of Open Question 6 of `seo-url-scheme.brainstorm.md` — 410 tells a crawler the address was retired on purpose and gets it dropped cleanly, whereas a redirect to an unrelated page is read as a soft 404 and looks like an accident.
- 2026-07-31 — `typescript` is a flat category of its own: `apps/robusta/content/blog/javascript/typescript/completes-with.md` claims `typescript` alone, is served at `/articles/c/typescript/completes-with`, and the v1 category path `javascript/typescript` maps to `/articles/c/typescript` rather than up to `javascript`. Pourquoi : arbitration of Gap 1, against the proposition that gave the article to `javascript` — an article carries at most one category and `typescript` is the one this article claims; the one-article roll the proposition warned about is accepted knowingly. Impact : `seo-url-scheme.design.md` is written against the proposition in its Interfaces, its mapping section and wherever it enumerates categories, and its rewrite belongs to designman.

## Documentation updates

- create the Routing section in `apps/robusta-build/README.md` — why: each site's README owns its own routing scheme, and the v2 site needs the reference that `apps/robusta/README.md` holds for v1.
- change the data-flow note "routes carry explicit discriminants (locale, page, p)" and the v1 line of Key Components in `root.archi.md` — why: two schemes now coexist, and the archi must say which site carries which.
- change the Discriminant entry in `ubiquitous-language.md` — why: it lists the locale, the roll page and the article, where the v2 set is `l`, `c`, `p` and `t`, the last reserving `/articles/t/{tag}` for a tag page the scheme keeps possible without building it.
- change the Category entry in `ubiquitous-language.md` — why: it states that categories may nest, which the scheme no longer allows, and it says nothing of an article claiming at most one category, which BR-PYRAMID-9 now requires and which the article address depends on.
- created the `Content root` entry in `ubiquitous-language.md` — why: the definition of done rests on the term, and the glossary is where a term the base and the site both use is settled.
- create `packages/pyramids-routing/routing.archi.md` — why: the design puts the discriminant contract in a new shared workspace, `@robusta/pyramids-routing`, and the convention of the repository is one architecture document per package.
- add the `pyramids-routing` child entry to `root.archi.md` and its package line to the Packages section of `CLAUDE.md` — why: a base package absent from the architecture document is a package the next site will not know it may reuse.
