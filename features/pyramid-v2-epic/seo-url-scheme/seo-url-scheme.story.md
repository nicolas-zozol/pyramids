# Story : SEO URL scheme of the v2 site

**Dernière mise à jour :** 2026-07-29
**Feature :** seo-url-scheme
**Infix :** URLSCHEME
**Status :** ACTIVE

## Story

As the publisher of robusta.build, I want every URL of the v2 site to state the kind of page it addresses, so that a page resolves without consulting the content source and a reader can tell from the link where it leads.

## Contexte & objectif

The v1 scheme is documented in the Routing section of `apps/robusta/README.md`: three discriminants — the locale, `page` for the blog roll, `p` for a post — producing paths like `/learn/fr/blockchain/page/2` and `/learn/blockchain/p/what-is-blockchain`. It works, but it is deep, it buries the category inside every article URL, and `learn` names a section nobody searches for. The v2 scheme flattens it: `/blog/c/{category}`, `/l/{locale}/` for non-default locales, pagination as query parameters, `articles` in place of `learn`.

What does not change is why the discriminants exist. BR-PYRAMID-1 — "The URL of a page must state the kind of page it addresses, so that a site can resolve it without consulting its content source." — is the rule this story carries, and it is also what lets Next.js pregenerate pages at build time instead of resolving them at runtime. Pagination as query parameters is the one point where the target scheme pushes against that rationale, since a page that reads search parameters is resolved at request time. The tension is posed in Open Question 1, not settled here.

The scheme applies to the v2 site `apps/robusta-build`, which does not exist yet — it is created by bootstrap-robusta-build, item 3 of the epic. Brainstorm and design can proceed now; implementation waits for that workspace.

## Target scheme

- `/` — landing page
- `/blog` — blog home, the blog roll of every article
- `/blog/c/{category}` — category page, nesting allowed: `/blog/c/blockchain/security`
- `/blog/articles/{slug}` — one article
- `?page=12&size=20` — pagination of any blog roll, on `/blog` as on a category page
- `/l/fr/blog/c/blockchain` — the same pages in a non-default locale; the default locale carries no marker

The root segment of the content section is the one ambiguity left by the epic — see Gap 1.

## Definition of done

- Every page of `apps/robusta-build` is reachable through a URL that states its kind — landing page, blog home, category, article — and the site resolves it without reading the content source.
- A blog roll takes its page and its size from query parameters; a URL without them serves the first page at the roll size of `seopyramids.config.ts`.
- A non-default locale carries `/l/{locale}/` at the head of the path; the default locale carries no marker, and the marked form of a default-locale URL redirects to the unmarked one, so a page has one URL.
- An article URL does not carry its category: recategorizing an article never breaks an indexed URL.
- Any page the pagination choice turns dynamic is named explicitly; every other content page is still pregenerated at build time.
- The mapping from the v1 paths to the new ones is written down, even if the redirects themselves ship with the retirement of the v1 site.
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
- 2026-07-30 — A v1 tag address redirects to the category page of the same name when that category has an address — `javascript`, `blockchain`, `web`, `security`, `solidity`, `react` — and to the blog home for the other eight; the tag itself stays metadata with no page. Pourquoi : arbitration of Open Question 2 of `seo-url-scheme.brainstorm.md`, which refines the standing decision of migrate-learn-content and seo-excellence — a redirect to a page that does not answer the request is treated as a soft 404 and the address is dropped anyway.
- 2026-07-30 — The site owns the section root through `seopyramids.config.ts`; the base owns the discriminants `l`, `c` and `p` and the shapes built from them. Pourquoi : arbitration of Open Question 3 of `seo-url-scheme.brainstorm.md` — dakar.surf has spots and not articles, so a base that hard-codes `articles` forces robusta's editorial vocabulary onto every future site, which is the base and the site growing into each other in one segment.
- 2026-07-30 — "A page must be reachable at exactly one address" is refused as a business rule: "No. I'm not sure it's a good SEO rule, honestly. Definitively not a business rule". Pourquoi : arbitration of Open Question 4 of `seo-url-scheme.brainstorm.md`, against the proposition that recorded it; nothing is written to `business-rules.md`, and the redirects it would have made obligatory — locale-marked default, explicit page one, trailing slash, letter case — stay R-URLSCHEME-8, 9 and 10.
- 2026-07-30 — A category page presents the articles claiming that exact category, and nested categories are dropped: "No. We MUST not have anymore descendants. It makes the parsing of the url too complex for the moment." Pourquoi : arbitration of Open Question 5 of `seo-url-scheme.brainstorm.md`, against the proposition that included descendants. Impact : R-URLSCHEME-5 states the opposite, the corpus carries a `javascript/typescript` category, and the Category entry of `ubiquitous-language.md` still says categories may nest.
- 2026-07-30 — Of the thirteen raw markdown addresses published under `/learn/**/*.md`, one whose content travels to v2 redirects permanently to the article and one whose content does not answers 410 Gone. Pourquoi : arbitration of Open Question 6 of `seo-url-scheme.brainstorm.md` — 410 tells a crawler the address was retired on purpose and gets it dropped cleanly, whereas a redirect to an unrelated page is read as a soft 404 and looks like an accident.

## Documentation updates

- create the Routing section in `apps/robusta-build/README.md` — why: each site's README owns its own routing scheme, and the v2 site needs the reference that `apps/robusta/README.md` holds for v1.
- change the data-flow note "routes carry explicit discriminants (locale, page, p)" and the v1 line of Key Components in `root.archi.md` — why: two schemes now coexist, and the archi must say which site carries which.
- change the Discriminant entry in `ubiquitous-language.md` — why: it gives pregeneration as the reason discriminants exist, which pagination in query parameters qualifies.

## Dependencies

- Dep 1: bootstrap-robusta-build (item 3 of the epic) — no route ships before the `apps/robusta-build` workspace exists. Brainstorm and design are not blocked.
- Dep 2: the arbitration of Gap 1 — the root segment is a slug that never changes once published, so it is settled before the first URL is served.
