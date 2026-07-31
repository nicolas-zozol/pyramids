# Story : SEO URL scheme of the v2 site

**Dernière mise à jour :** 2026-07-31
**Feature :** seo-url-scheme
**Infix :** URLSCHEME
**Status :** LANDED (2026-07-31, commit acfbc0a)

## Story

As the publisher of robusta.build, I want every URL of the v2 site to state the kind of page it addresses, so that a page resolves without consulting the content source and a reader can tell from the link where it leads.

## Contexte & objectif

The v2 site carries its own URL scheme — the discriminants `l`, `c`, `p` and a reserved `t` under a content root the site names, `articles` for robusta.build — in place of the v1 `/learn` shape, which was deep and named a section nobody searches for. What does not change is why the discriminants exist: BR-PYRAMID-1, which is also what lets every content page be produced at build time. The domain does not switch, so the mapping from the whole v1 address space onto the new one is this story's deliverable as much as the scheme itself.

Shipped in four commits: `81053ea` for the `@robusta/pyramids-routing` package, `acfbc0a` for the route table and the v1 mapping, `5206bec` for the approved design, `4d096c0` for the documentation.

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

The site owns the content root; the base owns `l`, `c`, `p`, `t` and the shapes built from them.

## Livré

Verified on 2026-07-31: 78/78 tests pass in `@robusta/pyramids-routing`, `apps/robusta-build` builds 62/62 static pages, and the green set holds with dakar at 23/23 and robusta at 42/42 (BR-PYRAMID-5). The generated v1 mapping carries 99 rows — 83 permanent, 6 gone, 10 none.

### Requirements

- R-URLSCHEME-1 : The site determines from the shape of a URL alone whether it designates the landing page, the blog home, a category page, a roll page or an article, without reading any article. Realizes BR-PYRAMID-1.
- R-URLSCHEME-2 : The content section is rooted at one segment named by the site configuration; the discriminants that follow it belong to the shared base, which carries no site's editorial word.
- R-URLSCHEME-3 : An article carrying a category is addressed under that category, and one carrying none directly under the content root; the content root never appears twice in a URL. Realizes BR-PYRAMID-9.
- R-URLSCHEME-4 : A category is addressed under the category discriminant by exactly one segment, and no category URL nests.
- R-URLSCHEME-5 : A category page presents the articles claiming that exact category.
- R-URLSCHEME-6 : The set of category URLs is derived from the categories the articles claim. No category URL exists that no article claims, every category an article claims has one, and no route reads a declared category list.
- R-URLSCHEME-7 : A blog roll is paginated by the roll-page discriminant carrying the page number. The number of articles per page is the roll size, a constant of 12, and never appears in a URL.
- R-URLSCHEME-8 : The first page of a blog roll is addressed by the roll's own URL, on the blog home as on a category page; the explicit page-one form redirects to it permanently.
- R-URLSCHEME-9 : A page in a non-default locale carries the locale discriminant at the head of its URL. The default locale carries no marker, and the marked form of a default-locale URL redirects permanently to the unmarked one.
- R-URLSCHEME-10 : A page is reachable at exactly one URL. Any other form that would serve the same content — explicit page one, marked default locale, trailing slash, letter case — redirects permanently to it.
- R-URLSCHEME-11 : The discriminant segments `l`, `c`, `p` and `t` are reserved words at every level: no article slug and no category may take one of those values, whether or not a page is served under the segment, and the build fails naming the offending article.
- R-URLSCHEME-12 : An article slug is unique within its locale across the whole site, and the build fails naming the slug and the locale on a collision.
- R-URLSCHEME-13 : Every content URL of the site is produced at build time. No content page is resolved at request time and no content route reads a search parameter. Realizes BR-PYRAMID-7.
- R-URLSCHEME-14 : Every URL the v1 site published has a destination, and that mapping is written down and reviewable before any redirect ships.
- R-URLSCHEME-15 : A URL whose content does not travel to the v2 site is retired deliberately rather than redirected to a page that does not answer it.
- R-URLSCHEME-25 : The `/learn` namespace is retired: a document URL under it that no mapping rule claims answers Gone, while an image URL under it falls through to 404, its fate belonging to the content migration.
- R-URLSCHEME-26 : A v1 tag URL redirects to the category page of the same name when that category has a page, and to the blog home otherwise; which tags take which destination is derived from the corpus, and no tag has a page of its own.
- R-URLSCHEME-27 : A raw markdown URL redirects permanently to the article when that article's content travels to v2, and answers Gone when it does not.
- R-URLSCHEME-28 : `/portfolio` and `/fr/portfolio` appear in the mapping as receiving no destination, rather than being left unlisted.
- R-URLSCHEME-21 : The shared base exposes one URL builder and one parser, and the canonical form of a URL is what the builder emits; a form the builder cannot emit is a redirect source whose target is the built value.
- R-URLSCHEME-22 : One derivation of the URL set feeds every route's pregeneration, and no second list accepts or rejects a URL at request time.
- R-URLSCHEME-23 : A URL the route table does not produce answers 404 rather than being resolved on demand.
- R-URLSCHEME-24 : When an article's category changes after publication, its former URL enters the redirect map rather than being dropped.
- R-URLSCHEME-30 : The site's content-root route folder and the configured content root state the same value, and the build fails when they diverge.
- R-URLSCHEME-31 : The tag address is reserved by the scheme: the builder and the parser know its shape, no such URL is produced and no route serves one.

R-URLSCHEME-29 — the redirects go live on the published domain only once the site's pages are indexable — is honoured by the redirects staying dormant, and its realisation belongs to retire-robusta-v1.

### Acceptance Criteria

- AC-URLSCHEME-01 : Given the URL of a fixture article claiming no category, `/articles/fixture-en-uncategorised-01`, when the site resolves it, then it serves an article page and reads no article set to decide that. Realizes BR-PYRAMID-1.
- AC-URLSCHEME-02 : Given an article claiming the category `javascript`, when the site is built, then it is served at `/articles/c/javascript/{slug}` and at no URL repeating the content root.
- AC-URLSCHEME-03 : Given an article claiming no category, when the site is built, then it is served at `/articles/{slug}`.
- AC-URLSCHEME-04 : Given a fixture article whose slug is `l`, `c`, `p` or `t`, or a fixture category taking one of those four values, when Tux builds, then the build fails, naming the offending segment and the slug of the article that carries it.
- AC-URLSCHEME-05 : Given two fixture articles of the same locale sharing a slug, when Tux builds, then the build fails, naming the slug and the locale.
- AC-URLSCHEME-06 : Given a fixture corpus where no article claims `solidity`, when the site is built, then no URL exists for that category; and given one article claiming `privacy` with no configuration mentioning it, then `/articles/c/privacy` exists and serves it.
- AC-URLSCHEME-07 : Given a fixture article claiming the category `typescript`, when the site is built, then it is served at `/articles/c/typescript/{slug}` and under no other category, whatever folder its source file sits in. Realizes BR-PYRAMID-9.
- AC-URLSCHEME-21 : Given a fixture roll of 30 articles at a roll size of 12, when the site is built, then `/articles`, `/articles/p/2` and `/articles/p/3` are produced and no other roll URL exists.
- AC-URLSCHEME-22 : Given `/articles/p/1`, when Barbot requests it, then it is permanently redirected to `/articles`; and the same holds for `/articles/c/{category}/p/1` against `/articles/c/{category}`.
- AC-URLSCHEME-23 : Given `/articles/p/999` on that roll, when Barbot requests it, then the site answers 404 and never an empty roll.
- AC-URLSCHEME-24 : Given a French fixture article, when the site is built, then it is served under `/l/fr/` and no unmarked form of it exists.
- AC-URLSCHEME-25 : Given `/l/en/articles/fixture-en-uncategorised-01` where `en` is the default locale, when Barbot requests it, then it is permanently redirected to `/articles/fixture-en-uncategorised-01`.
- AC-URLSCHEME-26 : Given a reader whose browser prefers French arriving at `/articles/c/privacy/leaving-gmail`, when the page is served, then no redirect to a locale occurs.
- AC-URLSCHEME-27 : Given `/Articles/C/Privacy/Leaving-Gmail` and `/articles/c/privacy/leaving-gmail/`, when Barbot requests either, then both are permanently redirected to `/articles/c/privacy/leaving-gmail`. Realizes R-URLSCHEME-10.
- AC-URLSCHEME-41 : Given any content route, when the site is built, then it is pregenerated, its search parameters resolve to nothing, and no request-time resolution occurs. Realizes BR-PYRAMID-7.
- AC-URLSCHEME-42 : Given the built route table and the URL set the base derives from the fixture corpus, when the two are compared, then they are equal — no URL is pregenerated that the site then refuses, and none is served that the derivation does not contain.
- AC-URLSCHEME-43 : Given the configured content root and the site's route folders, when they diverge, then the build fails.
- AC-URLSCHEME-44 : Given the site is served, when its routes are inspected, then the URL parser is called nowhere on the request path.
- AC-URLSCHEME-45 : Given a fixture corpus whose articles carry tags, when the site is built, then no `/articles/t/{tag}` URL is produced and Barbot requesting one gets a 404, while the builder and the parser both accept that shape. Realizes R-URLSCHEME-31.
- AC-URLSCHEME-61 : Given `/learn/blockchain/s/ledger-versus-metamask`, when Barbot requests it on the v2 site, then it is permanently redirected to that article's v2 URL under its category.
- AC-URLSCHEME-62 : Given `/learn/fr/javascript/page/2`, when Barbot requests it, then it is permanently redirected to the French blog home's counterpart of that roll.
- AC-URLSCHEME-63 : Given the fourteen `/learn/tag/{tag}` URLs, when Barbot requests each, then each is permanently redirected either to a category page that exists or to the blog home, and none lands on a 404.
- AC-URLSCHEME-64 : Given the thirteen raw markdown URLs, when Barbot requests each, then eight are permanently redirected to their article and five answer 410 Gone.
- AC-URLSCHEME-65 : Given a document URL under `/learn` that no rule claims, when Barbot requests it, then the site answers 410 and never a redirect to an unrelated page. Realizes R-URLSCHEME-15.
- AC-URLSCHEME-66 : Given `/portfolio`, when Barbot requests it, then the site answers 404, and the mapping shows that URL listed as receiving no destination.
- AC-URLSCHEME-67 : Given the mapping and the v1 route code, when the two are compared, then every URL shape that code can serve appears in the mapping exactly once.
- AC-URLSCHEME-68 : Given `/learn/javascript/typescript`, when Barbot requests it, then it is permanently redirected to `/articles/c/typescript` and not to `/articles/c/javascript`; and the article URL `/learn/javascript/typescript/s/completes-with` reaches `/articles/c/typescript/completes-with`.
- AC-URLSCHEME-69 : Given an image URL under `/learn`, when Barbot requests it, then the site answers 404 and never 410.

AC-URLSCHEME-81 — no redirect from the v1 address space live on the published domain while the site says not to index — is a deployment-ordering criterion rather than code, and is not met by this story: see the decision of 2026-07-31 below.

### What is not yet real

The route table is real; almost everything it addresses is a placeholder, and a reader should not take the 62 pages for a site.

- Every page renders a `RoutePlaceholder`. The landing copy arrives with robusta-landing-page and the articles with migrate-learn-content.
- The article index is a fixture. content-source replaces the implementation and keeps the signature.
- The redirects exist in `next.config.ts` and none is live: the site carries `robots: noindex` site-wide until robusta-landing-page lifts it, and the redirects switch on with retire-robusta-v1. The mapping is delivered; the SEO value is not yet realised.
- `/articles/t/{tag}` is reserved and served by nothing — no route, no page, no redirect target.

## Décisions

- 2026-07-29 — The root segment of the content section is `articles`, not `blog`: "No, use `articles` at the root, instead of `blog`". Pourquoi : arbitration of Gap 1, against the proposition that kept `/blog` as the single content root.
- 2026-07-29 — The v2 site owes redirects for the indexed `/learn/...` URLs: "the domain won't switch. We need some redirect for old pages in `/learn/...`". Pourquoi : arbitration of Open Question 2, which modifies the proposition — the redirects were to ship with retire-robusta-v1 at the moment of a domain switch, and the arbitration states there is no such switch.
- 2026-07-30 — The v2 article address is `/articles/c/{category}/{slug}` when the article carries a category, which most do, and `/articles/{slug}` otherwise; `/articles/articles/{slug}` is never emitted, and no sub-category is expected for the moment. Pourquoi : arbitration C2 of `pyramid-v2.bulk.md`, which modifies the proposition — the proposition kept the category off the article URL entirely and put it only on `/articles/c/{category}`, the arbitration puts it back into the article address.
- 2026-07-30 — A category page presents the articles claiming that exact category, and nested categories are dropped: "No. We MUST not have anymore descendants. It makes the parsing of the url too complex for the moment." Pourquoi : arbitration of Open Question 5 of `seo-url-scheme.brainstorm.md`, against the proposition that included descendants.
- 2026-07-30 — Pagination is `/p/{n}` on every blog roll, blog home included, and `/p/1` redirects permanently to the bare roll address. Pourquoi : arbitration of Open Question 1 of `seo-url-scheme.brainstorm.md`, taking the delegated reading of the pagination arbitration of 2026-07-29 rather than the literal one — two addresses serving the identical first page is the duplicate the rest of the scheme spends redirects to avoid, and one site with two pagination shapes doubles the canonical surface for no benefit.
- 2026-07-30 — The fourteen indexed `/learn/tag/{tag}` URLs become a class of this story's v1-to-v2 mapping, so one document holds the whole map. Pourquoi : arbitration C5 of the bulk, merging Gap 2 of `migrate-learn-content.brainstorm.md` with Gap 4 of `seo-excellence.brainstorm.md` — the target was decided in two consuming stories and recorded in neither the story that owns the map, and a redirect class absent from that map ships as a 404 on fourteen indexed URLs.
- 2026-07-30 — `/portfolio` and `/fr/portfolio` get no redirect: "no SEO tracking for that. Let it build fresh new, with new design system. Don't care of SEO redirect mapping". Pourquoi : arbitration of Gap 3 of `seo-url-scheme.brainstorm.md`, against the proposition that redirected both to the landing page in the matching locale.
- 2026-07-30 — Of the thirteen raw markdown addresses published under `/learn/**/*.md`, one whose content travels to v2 redirects permanently to the article and one whose content does not answers 410 Gone. Pourquoi : arbitration of Open Question 6 of `seo-url-scheme.brainstorm.md` — 410 tells a crawler the address was retired on purpose and gets it dropped cleanly, whereas a redirect to an unrelated page is read as a soft 404 and looks like an accident.
- 2026-07-30 — The site owns the section root through its own configuration; the base owns the discriminants and the shapes built from them. Pourquoi : arbitration of Open Question 3 of `seo-url-scheme.brainstorm.md` — dakar.surf has spots and not articles, so a base that hard-codes `articles` forces robusta's editorial vocabulary onto every future site, which is the base and the site growing into each other in one segment.
- 2026-07-30 — "A page must be reachable at exactly one address" is refused as a business rule: "No. I'm not sure it's a good SEO rule, honestly. Definitively not a business rule". Pourquoi : arbitration of Open Question 4 of `seo-url-scheme.brainstorm.md`, against the proposition that recorded it; nothing is written to `business-rules.md`, and the redirects it would have made obligatory — locale-marked default, explicit page one, trailing slash, letter case — stay R-URLSCHEME-8, 9 and 10.
- 2026-07-31 — `typescript` is a flat category of its own: `apps/robusta/content/blog/javascript/typescript/completes-with.md` is served at `/articles/c/typescript/completes-with`, and the v1 category path `javascript/typescript` maps to `/articles/c/typescript` rather than up to `javascript`. Pourquoi : arbitration of Gap 1, against the proposition that gave the article to `javascript` — an article carries at most one category and `typescript` is the one this article claims; the one-article roll the proposition warned about is accepted knowingly.
- 2026-07-31 — A v1 tag address reaches the category page of the same name when that category has an address and the blog home otherwise; the split is recomputed from the corpus by `v1UrlMap` rather than fixed in prose, and no tag is ever promoted to a category to make a redirect land. Pourquoi : arbitration of Gap 2 of the design doc, refining the decision of 2026-07-30 that had enumerated six tags and eight — the enumeration did not survive the corpus, and the condition of the rule settles it on its own.
- 2026-07-31 — The discriminant set is `l`, `c`, `p`, `t`, and `/articles/t/{tag}` is reserved now, without a tag page or a tag route shipping. Pourquoi : reserving the segment costs one line, where reopening the scheme later costs a second redirect on the tag addresses plus whatever slug has taken `t` in the meantime.
- 2026-07-31 — The roll size is a constant of 12 and not a per-site knob : "Approve, no roll size : make it fix with a constant parameter of 12". Pourquoi : at 12 the corpus of 11 articles produces no roll page, and rather than lower the value so pagination becomes visible on today's content, the value is fixed and the shape ships exercised by the fixture corpus alone. The twelfth article then needs no route work.
- 2026-07-31 — The story lands with every redirect dormant and AC-URLSCHEME-81 unmet. Pourquoi : the shell says not to index site-wide, so sending the indexed v1 URLs at unindexable targets would trade indexed pages for de-indexed ones. The criterion is a deployment-ordering one owned by retire-robusta-v1, which turns the redirects on once robusta-landing-page has lifted the flag.
- 2026-07-31 — The documentation pass went beyond its plan on `apps/robusta-build/robusta-build.archi.md` and on `CLAUDE.md`. Pourquoi : both stated things the implementation contradicted — the archi doc called the design system the site's only workspace dependency and counted 4 routes, and `CLAUDE.md` carried the old `build:deps` ordering, a watcher list without `w:routing`, a Tests section ignoring the new suite and an Apps entry describing a site with no routes. `CLAUDE.md` is read by whoever implements next, so a stale line there misleads the next pass. Impact : a fuller `/archi`-shaped pass on `robusta-build.archi.md` stays owed and is carried below as an imperative bullet.

## Open Questions & Gaps

- Gap 1: The `Blog roll` entry of `ubiquitous-language.md` says the roll size is "set in the site configuration", which reads as a per-site knob, where the decision of 2026-07-31 makes it a constant of 12. Glossary wording belongs to the registrar, so this story did not touch it.
- Proposition: epicman rewords the entry to say the roll size is a constant of the base, 12 today, exposed by the site configuration rather than chosen by it.
- Rationale: the glossary is where a term is settled, and an entry that contradicts a delivered decision will be read as the decision by the next story.
- Resolution: recorded 2026-07-31 by epicman as registrar — the `Blog roll` entry now reads "a constant of 12 rather than a per-site setting: a site configuration exposes the value, it does not choose it". The glossary and not `business-rules.md`: the roll size is a definitional fact already carried as R-URLSCHEME-7, not an invariant the business decides.

- Gap 2: `Canonical` and `canonicality` carry the whole redirect design — canonicality is the fixed point of `buildUrl` and `parseUrl` — and are load-bearing in `packages/pyramids-routing/routing.archi.md` and in the Routing section of `apps/robusta-build/README.md`, with no entry in `ubiquitous-language.md`.
- Proposition: epicman records `Canonical URL` — the single form of a URL a site serves, the one the builder emits, every other form redirecting to it permanently — and lets `canonicality` read as its property rather than as a second term.
- Rationale: seo-excellence computes canonical tags from this scheme and will use the word in its own sense unless the glossary fixes one; the term is also the name of the property the package's test suite asserts.
- Resolution: recorded 2026-07-31 by epicman as registrar — `ubiquitous-language.md` gains `Canonical URL` in the proposed sense, and canonicality reads as the property of being that form rather than as a second term. A definition belongs to the glossary, never to the registry.

## Documentation updates

Delivered in commit `4d096c0`.

- created the Routing section of `apps/robusta-build/README.md` — the site's own README owns its routing scheme, as the v1 README does for v1
- created `packages/pyramids-routing/routing.archi.md` — one architecture document per package, and canonicality as a fixed point is the idea the package turns on
- changed `root.archi.md` — the data-flow note and the v1 line of Key Components now say which site carries which scheme, and `pyramids-routing` has its child entry
- changed the `Discriminant` and `Category` entries of `ubiquitous-language.md` — the v2 set is `l`, `c`, `p`, `t`, categories no longer nest, and an article claims at most one (BR-PYRAMID-9)
- created the `Content root` entry of `ubiquitous-language.md` — the term the base and the site both use, settled in the glossary
- changed `CLAUDE.md` — the `pyramids-routing` package line, and beyond the plan the Apps entry, the `build:deps` ordering, the watcher list and the Tests section, all contradicted by what shipped
- changed the Dependencies line and the static-generation figure of `apps/robusta-build/robusta-build.archi.md` — beyond the plan; two statements the routing package made false

Still due:

- change the Overview, the Diagram and the Key Components of `apps/robusta-build/robusta-build.archi.md` — why: they still describe a site with no routing layer, where it now carries fourteen route files, a middleware, two build scripts and 62 pages; the pass owed is `/archi`-shaped rather than a doc edit
