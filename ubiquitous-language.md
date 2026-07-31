# Ubiquitous Language

The shared vocabulary of Pyramids. Every story, design doc and business rule uses these terms and no synonyms. A term that does not appear here is either implementation detail or a term still to be agreed — propose it before using it in a rule.

Bootstrapped on 2026-07-29 from the existing code and from the pyramid-v2 epic. Terms marked _v1_ describe the legacy site and are expected to disappear with v2. Three terms were added on 2026-07-30 by `bulkman resolve` as delegated registrar, from arbitrations C4 and LANDING Open Question 1 of `pyramid-v2.bulk.md`: Page copy, Indexable page, Related articles. Four more on 2026-07-31 by the same path, from Gaps 2 and 3 of `seo-url-scheme.design.md` and Gaps 2 and 3 of `unblock-build.design.md`: Tag, Content root, Clean checkout, Green set.

## Product

Pyramid
: The reusable base that turns content plus a design system into a deployable SEO site. It is not a site itself; it is what several sites are built from.

Site
: One deployed domain built on the pyramid — robusta.build, dakar.surf. A site owns its content, its design system and its configuration; it borrows everything else.

Site configuration
: The per-site source of truth: domain, site name and title, mission, logo, default locale, other locales, blog settings. Lives in `src/seopyramids.config.ts` inside the site.

Design system
: The visual identity of one site: colour and typography tokens, brand assets, and the primitives and page surfaces built on them. One design system per site; they are not shared between sites.

Design token
: A named visual value (colour, font, spacing) exposed as a CSS variable and consumed by components. Tokens are the only sanctioned way for a component to know a colour.

Landing page
: The home page of a site, built from the site's design system. It is a marketing surface, distinct from any content page.

Page copy
: The wording a visitor reads on a page, supplied by the site that publishes it.

## Content

Article
: A piece of written content published on a site, addressed by its slug. The v2 term. _v1_ called the same thing a post and served it under `/learn`.

Category
: The classification an article belongs to. An article claims at most one (BR-PYRAMID-9), which is what makes a category readable in an article's address, and a category is exactly one segment: categories do not nest. Each category has its own page. _v1_ declared nested paths such as `javascript/typescript`; on v2 such a path names its leaf.

Tag
: A classification an article may carry freely, any number of them, alongside the single category it may claim (BR-PYRAMID-9). A tag is metadata: it has no page of its own today, and the URL scheme reserves an address for the tag page it must stay able to grow.

Blog roll
: The paginated list of articles shown on a category or blog home page. Its length per page is the roll size, set in the site configuration.

Slug
: The stable, URL-safe identifier of an article or category. A slug never changes once published — changing it breaks indexed URLs.

Locale
: The language a page is served in. A site has one default locale, which carries no marker in the URL, and zero or more other locales, which do.

Content source
: Where a site's articles come from. Today: markdown files shipped with the site. Whether the server re-reads them too often is an open point of the v2 epic.

Content root
: The single segment under which a site publishes its content section, named by the site configuration. `articles` for robusta.build; another site names its own.

Discriminant
: A segment of a URL that states what kind of page follows. The v2 set is four — `l` for the locale, `c` for a category, `p` for a roll page, and `t`, which reserves the address of a tag page the scheme keeps possible without building it. They belong to the shared base, they are reserved words at every level of the scheme, and they exist so pages can be pregenerated at build time instead of resolved at runtime. _v1_ used the locale, `page` for the blog roll and `s` for a post.

Indexable page
: A page a site offers to search engines. A page is indexable when it is addressed by a URL of its own and carries content of its own; a page that only routes, redirects, or repeats what another page already holds is not.

Related articles
: The articles a site offers a reader at the end of an article, chosen among published articles of the same locale from the categories and tags they share. An article with nothing relevant to offer has no related articles, and the set is then empty.

## Delivery

Workspace
: One yarn package in the monorepo. Three kinds: an app (a deployable site or demo), a package (a shared library), a service (a backend process).

Build chain
: The ordered rebuild of the shared packages that must complete before any site builds. A site never reads a package's sources, only its build output.

Clean checkout
: A checkout carrying no installed dependency and no build output anywhere in its ancestry. A git worktree beside an installed repository is not one.

Green set
: The named collection of workspaces that must build from a clean checkout: the build chain plus every site the repository claims to ship.

Watcher
: A rebuild loop kept running during development so a package edit reaches the running site. Without it, the site keeps serving the previous build output.

## Observability

Telemetry
: Structured logs and spans emitted by a site and shipped to the collector. Available in the base, deliberately switched off for the v2 site.

Intent
: A named, hierarchical, lifecycle-tracked visitor action — the product-analytics unit of the intel tool. Two client implementations exist; both are stubs today.

## Method

Epic
: A body of work grouping several stories, recorded in `features/<epic>/<epic>.epic.md`.

Story
: One feature, recorded in `features/<epic>/<feature>/<feature>.story.md`, active until landed. The unit of work.

Business rule
: A constraint the business can decide on, stated in the terms above and independent of any solution. Registry: `business-rules.md`.
