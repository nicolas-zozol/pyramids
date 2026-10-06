# Brainstorm : Landing page of robusta.build

**Date :** 2026-10-06 — reworked in place, first version 2026-07-29 (in git)
**Feature :** robusta-landing-page
**Infix :** LANDING
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Sources read: the story (last touched 2026-07-29), `pyramid-v2.epic.md` up to its decisions of 2026-08-02, `ROADMAP.md`, `business-rules.md`, `ubiquitous-language.md`, `root.archi.md`, the story and approved design of design-system-responsive, the stories of seo-excellence, migrate-learn-content, article-page and bootstrap-robusta-build, `apps/robusta-build` as it stands (README, archi, layout, home page, `src/landing`, site configuration, v1 map), the eight surfaces and `SkButton` as committed in `4963dc0` ("wip rebuild"), and the v1 pitch in `apps/robusta/src/components/freelance/FreelanceAd.tsx`.

## What changed since the version of 2026-07-29

- Five stories landed between 2026-07-31 and 2026-08-02. `apps/robusta-build` exists, builds 25 static pages, reads eleven real articles, renders them as articles, and mounts the notes section on `/`, fed by the four newest English articles. The home page around it is still the shell's wiring demonstration.
- The two package defects that drove the first version are being fixed by design-system-responsive (design APPROVED 2026-08-07, code largely in `4963dc0`, story ACTIVE): fluid type scale, layout moved from inline styles to `sk-<surface>__<part>` classes in `sketch.css`, `SkButton` rendering an anchor when given an `href`, footer items carrying an optional destination, an error ramp.
- BR-PYRAMID-8 is recorded: the site supplies all page copy, the design system none. BR-PYRAMID-2 reads again "A site built on the version 2 base must not track visitor intents".
- The fonts are self-hosted by the site through `next/font`; the page makes no third-party request.
- New findings: `Hero` renders a caption no prop can replace; nine listing routes (ten built pages) are placeholders and no roadmap item renders them; the v2 site answers on its own Vercel project, not on robusta.build; the story says nothing about the site-wide `noindex` that ROADMAP and the epic assign to it.

Settled, and built on rather than reopened:

- The story's decisions: first person singular (2026-07-29); the v1 social proof as text in Hero and PrinciplesList, no logo wall, skills grid or portfolio (2026-07-29); NotesPreview delivered by migrate-learn-content (2026-07-29, executed); ServicesGrid and FlowDiagram out of the first release (2026-07-30); fragments carrying design-system class names and bare `id` wrappers only, no class, colour, font or spacing of the site's own (2026-07-30); the hero headline drafted from R-LANDING-6 (2026-07-30).
- The epic's decisions on the first version's entries: Open Question 1 gave `Page copy` and BR-PYRAMID-8; Gap 1 gave design-system-responsive; Gap 2 gave `SkButton.href` and footer items with a destination; Gap 4 closed with the reconciliation of BR-PYRAMID-2 (arbitration C1). Open Question 2, on the Google Fonts `@import`, was overtaken by bootstrap-robusta-build's self-hosted faces.
- The keys of the Open Questions & Gaps below start at 9: Open Questions 1 to 4 and Gaps 1 to 4 of the first version are cited by number in the story and the epic, and their numbers are not reused.

---

## Acceptance Criteria challenge

The story carries no AC: it still has a legacy Definition of done, so there is no `AC-LANDING-n` to cite (Gap-LANDING-9). The verdicts below are on its seven bullets, numbered in order as DoD 1 to DoD 7.

- DoD 1 — "`/` renders a complete landing page composed only of design-system surfaces; the site adds no marketing markup of its own". Testable once "complete" becomes the list of surfaces in their order. Insufficient: the composition grew to six surfaces when the notes section was mounted, against the five the decision of 2026-07-30 names, and the bare `id` wrapper allowed by the decision of 2026-07-30 needs stating, or a strict reading fails it.
- DoD 2 — "every surface shows robusta's copy, passed through props — none of the prototype defaults reaches a visitor". Testable by a string guard. Not satisfiable today: `Hero` renders "this is crystal tux. she lives here." and the alt text "crystal tux" whatever props it receives (Gap-LANDING-10). "Passed through props" is implementation; the business statement is "every word a visitor reads is robusta's".
- DoD 3 — the v1 pitch carried over. Testable by presence. Insufficient: "the startups" should name Nauto, Diool and Swaap Finance, and the claims that are not references — twenty years and more, fullstack, EVM and Solidity, scientific background, Toulouse and remote — have no criterion at all, though R-LANDING-6 lists them.
- DoD 4 — "no resume anywhere on the v2 site: no page, no link, no PDF". Testable and in business language. Misses the one resume v1 linked from the pitch itself: the Toptal screening pointed at `toptal.com/resume/nicolas-zozol`.
- DoD 5 — "renders as a server component and survives the site's build". Testable, technical. The business criterion behind it is "the full pitch and the contact route read without JavaScript".
- DoD 6 — scope: "does not cover the article list (migrate-learn-content) …". Stale: the article list is on the page, inherited, and the story carries it across (R-MIGRATELEARN-45).
- DoD 7 — "does not touch `apps/robusta`". Sound.

Missing criteria, beyond the edge cases below: the deletion of the shell's wiring demonstration, which the epic assigns to this story; the first person singular of the decision of 2026-07-29, which no bullet checks; and the site-wide `robots: noindex`, which ROADMAP item 2 and epic item 2 assign to this story and the story never mentions — its shape depends on OQ-LANDING-12.

Business edge cases the story misses, proposed to storyman:

- Given a design-system surface renders a sentence the site cannot replace, When the landing page is built, Then that sentence does not reach the visitor.
- Given the notes section inherited from migrate-learn-content speaks as "we" ("what we publish."), When the landing page renders, Then its headings speak in the first person singular like the rest of the page.
- Given no English article declares itself published, When the site is built, Then the landing page carries no notes section, rather than an empty one or the design system's sample posts.
- Given the blog home still renders a placeholder, When the landing page is offered to search engines, Then no control on it leads to a page carrying no content of its own.
- Given the Toptal screening is cited, When a visitor reads it, Then it is plain text and leads to no Toptal resume page.
- Given a reader arrives on an article from a search engine, When they want to know who wrote it and how to reach him, Then the page offers a route to the landing page and to the contact route (OQ-LANDING-13).
- Given the longest strings the site supplies — the email address, the hero headline, `docker-compose` — When the page is read at 320 px, Then nothing scrolls sideways and nothing is clipped.

---

## Requirements of the first version

Written by bsman on 2026-07-29, before bsman stopped writing requirements. They stay here verbatim because the story cites R-LANDING-4 and R-LANDING-6 and the epic cites R-LANDING-11; designman restates them in the design doc under the same numbers. This version adds none.

Composition — BR-PYRAMID-3 : "Each site must carry its own design system, which no other site may reuse."

- R-LANDING-1 — The landing page is served at the root of the v2 site and is composed only of marketing surfaces of that site's own design system. The site contributes composition and copy; it contributes no presentation.
- R-LANDING-2 — The site may pass a surface's content as a fragment carrying design-system class names, and nothing else. It defines no class, no colour, no font and no spacing of its own.
- R-LANDING-3 — The order in which the surfaces are composed is written down, because the next site starts by copying this page.

Editorial — BR-PYRAMID-8 : "A site must supply the page copy of every page it publishes; its design system must supply no page copy."

- R-LANDING-4 — No wording shipped as a default by the design system reaches a visitor. Every string a visitor reads is passed in by the site.
- R-LANDING-5 — The page speaks in the first person singular of one named engineer.
- R-LANDING-6 — The v1 pitch claims survive: twenty years and more of practice, fullstack from CSS to docker-compose, the EVM and Solidity specialism, the scientific background, Toulouse and remote, and the closing intent to turn ideas into robust products.
- R-LANDING-7 — The named references survive as text: Renault, Boston Consulting Group, Nauto, Diool, Swaap Finance, the Toptal screening and the Oracle Certified Java Master certification.
- R-LANDING-8 — The page states nothing that expires without an edit: no slot count, no named quarter, no dated availability claim.
- R-LANDING-9 — No resume is reachable from the v2 site: no page, no embedded document, no downloadable file, and no link pointing to one.

Contact

- R-LANDING-10 — The contact route is direct — an email address and a LinkedIn profile — reachable without submitting anything.
- R-LANDING-11 — The page offers no action the site does not fulfil. Every control leads to a destination that exists.

Technical — BR-PYRAMID-2 : "A site built on the version 2 base must not track visitor intents."

- R-LANDING-12 — The page renders entirely as a server component and stays readable with JavaScript disabled.
- R-LANDING-13 — The page loads no analytics client, no intent client and no telemetry.
- R-LANDING-14 — The page's title and description come from the site configuration, not from a string hardcoded in the layout.
- R-LANDING-15 — Stylesheets and brand assets reach the page through the package's exports subpaths, with no copy into the site's public directory.
- R-LANDING-16 — The page is readable on a phone: nothing scrolls horizontally, no text is clipped by a fixed-width grid.

What moved under them since:

- R-LANDING-4 cannot hold while `Hero` hardcodes its caption (Gap-LANDING-10).
- R-LANDING-11: a placeholder page exists and answers 200, so the requirement as written is met by a link to the blog home. The edge case above states what it was meant to say.
- R-LANDING-13 realizes BR-PYRAMID-2 again, the registry stating it since 2026-07-30.
- R-LANDING-14 is already true of the layout since bootstrap-robusta-build; what remains is the page declaring its own pair (axis 8).
- R-LANDING-15 extends to the two mascots, which the first version never imported.
- R-LANDING-16 is design-system-responsive's guarantee for the surfaces with their own copy; the site's longer strings are what this story still has to check.

---

## 1. Product Role

The landing page is the one page of robusta.build that sells rather than informs. `ubiquitous-language.md` fixes the term: the home page of a site, built from the site's design system, a marketing surface distinct from any content page.

Inside the epic it is also the proof that a site is dressed entirely by its own design system, and the template the next site is copied from. That is why the site may add no presentation of its own: a page that quietly patches its design system proves nothing.

Since 2026-08-02 it has a third role. The eleven articles render and are where search traffic will land; the landing page is where a reader of those articles goes to find out who wrote them and how to hire him. The articles bring the reader, the landing page converts him.

What it is not: a portfolio, a resume, an article, or a lead-capture funnel.

**Décision (autonome):** The landing page is a pitch page with one destination, the contact route, plus the four newest articles it inherits from migrate-learn-content. No portfolio, no skills taxonomy, no resume.

**Rationale:** A page with one job can be judged; the notes section stays because it was built for this page and shows the record is alive.

---

## 2. Target Audience

- The buyer: a CTO, a founder or an engineering manager with a system that is hurting. Arrives from LinkedIn, a referral, a search, or now an article. Technical enough to detect padding.
- The crawler: indexes mobile-first and reads the server-rendered HTML, which the RSC rendering guarantees.
- The article reader: arrives on one of the eleven articles from a search engine, and is a buyer only if something on the article page leads him to the pitch. Today nothing does: an article page carries no header, no footer and no link to `/` (OQ-LANDING-13).

The recruiter, audience of the v1 embedded CV, stays dropped: the epic puts the resume out of scope.

**Décision (autonome):** The page is written for the buyer and rendered for the crawler; the article reader is treated as a buyer one click away.

**Rationale:** Eleven article pages against one landing page means most first visits will not start on `/`.

---

## 3. Core Problem

The v1 home page states the offer as a list of nouns: one `<h2>` reading "Experienced Fullstack freelance", four bullets of technologies, a paragraph of client names, and a LinkedIn button carrying a phone icon. No `<h1>`, no headline, no statement of what a buyer would be buying.

The structural half of the problem found in the first version — a site configuration nothing read — is half fixed: the v2 layout reads `siteTitle` and `mission` from `seopyramids.config.ts`. But it uses the motto "Building Internet the right way" as the description of every page, the home page included, and the shell's wiring demonstration ("placeholder", a font specimen) is what `/` serves.

**Décision (autonome):** The page leads with a headline stating the offer, and declares its own title and a description written from the pitch, both held by the site configuration.

**Rationale:** A motto is not a description, and a home page that inherits the layout default shares it with every placeholder.

---

## 4. Unique Value Proposition

Against the alternatives a buyer holds in the same hand:

- Against an agency: one named engineer with a traceable record. This is why the decision of 2026-07-29 rewrites the surfaces' "we" into the first person singular.
- Against a marketplace profile (Toptal, Malt): the screening is cited as evidence, the engagement is direct.
- Against the v1 page: the same claims, ordered so that a reader gets the offer before the technology list.

The evidence is already written and checkable: Renault, Boston Consulting Group, Nauto, Diool, Swaap Finance, the Toptal screening, the Oracle Certified Java Master certification. One loss is accepted knowingly: the v1 portrait lives under `apps/robusta/public/images`, which stays behind by the epic's decision of 2026-07-29, so the named engineer has no face on v2 and the mascot takes the visual slot.

**Décision (autonome):** The proposition is "one senior engineer you can name, with a record you can check", and the references move from a buried paragraph into the hero and the principles.

**Rationale:** The references are the only thing on the page a competitor cannot claim, and every competing option is anonymous by construction.

---

## 5. Functional Scope

In scope — the composition, in order:

1. SiteHeader — the wordmark linking home, the contact call to action
2. Hero — the headline, the experience claim, the specialism, Toulouse and remote, the two contact calls to action
3. PrinciplesList — how the work is done, and the named references as text
4. NotesPreview — inherited as `NotesSection`, the four newest English articles
5. CTA — the closing contact block
6. SiteFooter — brand block, tagline, copyright

Also in scope: deleting the shell's wiring demonstration from `src/app/page.tsx`, and carrying `NotesSection` across with its headings rewritten.

Held out: ServicesGrid and FlowDiagram (decision of 2026-07-30). Out: the logo wall, the skills grid, the portfolio preview, the GitHub calendar, the resume in every form, a French landing page. `/l/fr` keeps building nothing: v1's home page was English-only, so no indexed page is lost.

The site-wide `noindex` is the open scope question. ROADMAP and the epic say this story lifts it; the story is silent. Three paths:

```
  Where the site-wide noindex lifts. Arrow = ships before.

  (a) in this story
      responsive ──→ landing page + lift
                     → 10 placeholder pages and a second host indexed

  (b) a go-live step of its own
      responsive ──→ landing page ──→ seo-excellence ──→ listing pages ──┐
                                                                         │
      go-live: domain switch + lift + v1 redirects on  ←─────────────────┘

  (c) page by page, in this story
      responsive ──→ landing page: `/` and 11 articles indexable,
                     the 10 placeholder pages keep noindex
                     → the second host is still indexed
```

The second host is the Vercel project `robusta-build-v2`: robusta.build keeps answering from v1 until the domain switch, and v1 serves the same eleven articles under `/learn`. Not decided here: OQ-LANDING-12.

Whether SiteHeader and SiteFooter wrap `/` only or every page is the other open scope question: OQ-LANDING-13.

The footer: `FooterLink.href` now makes a real footer link possible, so the first version's reason for an empty footer is gone. What remains to link is the contact route, already in the header, the hero and the closing CTA, and the article list, whose blog home is a placeholder.

**Décision (autonome):** Six surfaces ship in English, the wiring demonstration is deleted, the footer ships with no link column until the listing pages render, and the `noindex` directive is left as it stands pending OQ-LANDING-12.

**Rationale:** Every surface shipped has copy the v1 record supports, and every link shipped leads to a page with something on it.

---

## 6. Core Features

### Feature: The composed landing route

**Capability:** `/` of `apps/robusta-build` serves a statically generated page assembled from six design-system surfaces in a fixed, documented order, with the wordmark and two mascots resolved through the package's `assets/*` subpath and no client bundle of the site's own. The wiring demonstration is gone.

`NotesSection` is an async server component, so the page is no longer a synchronous function: it renders only where the article index can be read, at build time (BR-PYRAMID-7).

**Acceptance Criteria:** DoD 1 and DoD 5 of the story — testable, DoD 1 to be rewritten as the ordered list of surfaces.
- Proposed to storyman: Given the site is built, When `/` is requested, Then it carries header, hero, principles, notes, closing call to action and footer in that order, and nothing of the shell's demonstration.
- Proposed to storyman: Given JavaScript is disabled, When `/` is read, Then the full pitch, the references and the contact route are readable.

**Test Approach:** Vitest assertions over the prerendered HTML of `/` emitted by `next build`, in the site's existing vitest setup: the sequence of surface classes (`sk-site-header`, `sk-hero`, …), the absence of the demonstration, and no file of the package under `public/`.

---

### Feature: Robusta's copy in place of the defaults

**Capability:** Every string a visitor reads is supplied by the site, in the first person singular, carrying the v1 claims and the named references. `NotesSection`'s three headings are rewritten in the same voice ("what we publish." is plural).

**Acceptance Criteria:** DoD 2 and DoD 3 — DoD 2 blocked by Gap-LANDING-10, DoD 3 to be completed with the claims of R-LANDING-6 and the three startups by name.
- Proposed to storyman: Given a design-system surface renders a sentence the site cannot replace, When the landing page is built, Then that sentence does not reach the visitor.
- Proposed to storyman: Given the notes section inherited from migrate-learn-content speaks as "we", When the landing page renders, Then its headings speak in the first person singular.

**Test Approach:** One guard test holding two lists, run against the prerendered HTML: the prototype defaults that must not appear ("small team. long memory.", "we build software", "principles, written down.", "this is crystal tux.", "made by hand, with care.", "what we publish.", …) and the claims that must ("Renault", "Boston Consulting Group", "Nauto", "Diool", "Swaap Finance", "Toptal", "Oracle", "Toulouse"). It is what stands between a package upgrade and prototype copy reappearing in production.

---

### Feature: The contact route

**Capability:** A visitor reaches Nicolas in one click, by email or LinkedIn, from the header, the hero and the closing CTA. Every call to action is now one anchor (`SkButton` with an `href`). No form, no field: `CTA` receives an empty `emailPlaceholder`, which hides its input. The email address and the LinkedIn URL are held once, in the site configuration.

The v1 `TimeDiffered` obfuscation of the address does not come back: it needs JavaScript (R-LANDING-12), and the address already sits in cleartext in every v1 resume file.

**Acceptance Criteria:** DoD 3 (its "contact route" clause) — testable.
- Proposed to storyman: Given the page is rendered, When its calls to action are followed, Then each leads to `mailto:nicolas@robusta.build` or to the LinkedIn profile, and the page carries no form and no field.

**Test Approach:** Assertions over the prerendered HTML: the two destinations, no `<input>`, no `<form>`, no `href="#"`, no anchor inside a `<button>`. One axe pass on the built page for link names and nesting.

---

### Feature: No resume, and no way back to one

**Capability:** The v2 site carries nothing of the v1 resume apparatus: no iframe, no PDF, no `nicolas/` tree, no link to a resume — the Toptal profile included, which v1 linked from the pitch.

**Acceptance Criteria:** DoD 4 — testable, in business language, missing the Toptal case.
- Proposed to storyman: Given the Toptal screening is cited, When a visitor reads it, Then it is plain text and leads to no Toptal resume page.

**Test Approach:** A build-output check — no `.pdf`, no `<iframe>`, no path under `nicolas/` — plus a link-collection assertion on `/` refusing any `toptal.com/resume` target.

---

### Feature: Page identity, and no measurement on the page

**Capability:** `/` declares its own title and description, read from the site configuration, instead of inheriting the layout default every placeholder shares. The page carries no measurement code and makes no third-party request — the three faces are self-hosted since bootstrap-robusta-build.

**Acceptance Criteria:** DoD 6 grants this story the page's own title and description; no criterion checks them.
- Proposed to storyman: Given the site configuration's title changes, When the site is rebuilt, Then the title of `/` changes with it, and no other page carries the same description.

**Test Approach:** A metadata assertion on the prerendered `<head>`; a network check in the axe pass confirming no request leaves the site's own origin.

---

### Feature: The inherited notes section

**Capability:** `NotesSection` stays as migrate-learn-content built it: the four newest published articles of the locale, newest first, each linking to its article page, and an "all articles" link to the blog home.

migrate-learn-content left one choice to this story: what a `featured` article is for. Eight articles carry `featured: true`, the index does not read the field, and `ArticleEntry` does not carry it.

**Décision (autonome):** `featured` gets no role on the landing page; the section stays newest-first and the publisher has nothing to re-pick.

**Rationale:** A curated set needs an editorial rule nobody has written and a wider reading contract in `@robusta/pyramids-content`; newest-first needs neither and is what a preview of notes means.

**Acceptance Criteria:** R-MIGRATELEARN-44 and 45, AC-MIGRATELEARN-43, already met by migrate-learn-content; nothing in the story.
- Proposed to storyman: Given no English article declares itself published, When the site is built, Then the landing page carries no notes section, rather than an empty one or the design system's sample posts.
- Proposed to storyman: Given the blog home still renders a placeholder, When the landing page is offered to search engines, Then no control on it leads to a page carrying no content of its own.

**Test Approach:** The existing AC-MIGRATELEARN-43 spec, extended with the rewritten headings; a unit test of the section on an empty feed.

---

## 7. Critical Edge Cases

Product:

- A visitor following "all articles" lands on a placeholder: the blog home renders `RoutePlaceholder`, as do the eight category pages. Nothing in ROADMAP renders them (Gap-LANDING-11).
- A visitor reading the hero meets "this is crystal tux. she lives here.", written into `Hero` and rendered whether or not a mascot is passed, with its doodle arrow (Gap-LANDING-10).
- A visitor reading the notes section meets "what we publish." on a page that speaks as "I".
- A reader on an article page has no way to the pitch: no header, no footer, no link to `/` (OQ-LANDING-13).
- A visitor checking the Toptal claim: v1 linked it to a Toptal resume page, which R-LANDING-9 forbids.
- A visitor reading the availability line: the prototype's "2 slots left this quarter" is replaced by Toulouse and remote (decision of 2026-07-30).
- A French visitor: the page is English-only, as v1's was.

Technical:

- The wordmark is a 1603×312 PNG rendered by `BrandLogo` as a plain `<img>` with explicit dimensions: no layout shift, but a heavy image on the LCP path. vectorize-wordmark (epic item 7) is the fix, without a component change.
- Mascot props default to `''`, which hides the illustration silently. The site imports the SVGs (`crystal-tux.svg` for the hero, `crystal-tux-waving.svg` for the CTA), which dedupe-crystal-tux already names canonical, and the render test asserts both are present.
- The surfaces hardcode three ids: `work` (ServicesGrid), `approach` (FlowDiagram), `notes` (NotesPreview). Only `#notes` exists on this page.
- design-system-responsive makes every surface's layout overridable by a selector one class stronger. The decision of 2026-07-30 keeps this site from using that surface: a correction this page needs goes into the package.

**Décision (autonome):** The header carries the wordmark (linking `/`) and the contact call to action and no nav link; the "all articles" link of the notes section stays, pointing at the blog home.

**Rationale:** A nav would point at placeholders or at one in-page anchor; the "all articles" link is a canonical URL of the scheme, and if OQ-LANDING-12 is accepted nothing is offered to a search engine before the blog home renders — if it is rejected, the link is hidden until then.

---

## 8. Non-Functional Constraints

Rendering: the page is a server component, statically generated, with no client bundle of its own (R-LANDING-12). The surfaces now carry class names styled in `sketch.css` and read the fluid `--t-*` scale; they still use no Tailwind utility and no shadcn component, so the page does not wait on anything shadcn.

Responsive: design-system-responsive guarantees no sideways scroll from 320 px for the surfaces with their own copy (AC-RESPONSIVE-01). The site's copy is longer in places — an email address inside a button, a headline carrying `docker-compose` — and that check is this story's.

Performance: the LCP element is the hero headline or the wordmark. The font chain of the first version (site CSS, then font CSS, then font files) is gone: `next/font` self-hosts the faces at build time. The wordmark PNG is the one structural cost left.

Privacy and measurement: BR-PYRAMID-2 rules out conversion events, funnels, scroll depth, session recording, A/B assignment, and Vercel Web Analytics or Speed Insights, which inject a client script identifying a visit. What is left fits a page expecting tens of visits a day:

- Acquisition: a search engine's webmaster console, which seo-excellence's arbitration of 2026-07-30 keeps as its one measurement. It reports nothing while the site is `noindex` and not on its domain.
- Conversion: the inbox and the LinkedIn message list. One question in the first reply — "how did you find me?" — recovers more attribution than a funnel would.
- Quality: Lighthouse on the built page.

Page identity: seo-excellence requires every page to carry its own title and description. This story owns the pair for `/` (DoD 6); the layout default and every other page are seo-excellence's.

**Décision (autonome):** The landing page ships zero client-side measurement, and declares its own title and description from the site configuration.

**Rationale:** A page that may not instrument its visitors measures its outcome instead, and a home page that owns its metadata is unaffected when seo-excellence changes the layout default.

---

## 9. External Dependencies

- design-system-responsive — the blocking one. Design APPROVED 2026-08-07, code largely in `4963dc0` on `dev`, story ACTIVE, not landed. Every surface this page renders, `SkButton.href` and `FooterLink.href` come from it, and Gap-LANDING-10 proposes one more prop there.
- `@robusta/pyramids-design-system` — on `dev` and in `build:deps` since 2026-07-30. The first version's dependency on `feat/packagify-design-system` is closed.
- `apps/robusta-build` — landed; the root layout, the site configuration, `src/landing` and the vitest setup this story extends.
- `@robusta/pyramids-routing` and `@robusta/pyramids-content` — reached through `NotesSection` and the site's index seam, unchanged.
- seo-excellence — running in parallel, and both stories touch `src/app/layout.tsx` metadata. No dependency in either direction for implementation; the `noindex` question (OQ-LANDING-12) is where the two meet.
- LinkedIn — `https://www.linkedin.com/in/robustacode/`, hardcoded in `packages/ctas` today, which the v2 site does not import; the site configuration holds it.
- Vercel — project `robusta-build-v2`, separate from the project serving robusta.build, which keeps answering from v1 until the domain switch.

The stories the current story's Dependencies section names — bootstrap-robusta-build, merge-design-system, unblock-build, migrate-learn-content — have all landed.

---

## 10. Major Risks

Product:

- The offer is still unwritten. The page says who Nicolas is and who he has worked for; it cannot say what an engagement costs, how long it runs or what a buyer receives, which is why ServicesGrid and FlowDiagram are held out. A pitch page that never names its offer converts on reputation alone.
- The page is the template for every later site, so its shortcuts propagate: a footer with no columns and a header with no nav are right for a one-page site and wrong the day the listing pages exist.
- Publishing before the listing pages render: two thirds of the v1 redirects target them — of 66 permanent rows, 29 land on a blog home and 15 on a category page, all placeholders today (Gap-LANDING-11, OQ-LANDING-12).

Technical:

- This story builds on code that is committed as "wip rebuild" and not landed. If design-system-responsive changes a prop or a class name before it lands, this page follows.
- `Hero` still carries copy no prop reaches, in a package declared to supply none (BR-PYRAMID-8). The same class of defect sits in ServicesGrid ("see how it works") and in `BrandLogo`'s full variant ("senior engineering, hand-built."), outside this page.
- Three stories run in parallel — design-system-responsive in `Hero.tsx`, seo-excellence in the layout metadata, this one in both. Collisions are textual, not conceptual, but they are likely.

Adoption:

- With no on-page measurement, an underperforming page leaves no evidence of why — the accepted price of BR-PYRAMID-2. Under OQ-LANDING-12's proposition, the console reports nothing before go-live either.

**Décision (autonome):** The risk register goes into the design doc as-is; none of these justifies site-level markup or a style override.

**Rationale:** Each is a package fix, a sequencing call or an accepted cost; letting the site patch its design system would forfeit the only thing this story proves.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Nothing points into an app, no loop.

  app `robusta-build` [modified]
      │
      ├── library ──→ module `@robusta/pyramids-design-system`
      │               [modified, if Gap-LANDING-10 lands as proposed]
      ├── library ──→ module `@robusta/pyramids-routing`
      └── library ──→ module `@robusta/pyramids-content`
```

Inside `apps/robusta-build` the dependencies run one way: the `/` route uses `landing`, the layout uses `chrome` if OQ-LANDING-13 is accepted; both use the site configuration and the asset seam; the asset seam uses the design-system module. The site configuration already imports the asset seam for its `logo`.

### library API of module `@robusta/pyramids-design-system` — modified

Client code: package `landing` in app `robusta-build`. Modified by design-system-responsive if Gap-LANDING-10 is accepted as proposed, by this story otherwise. `SkButton.href` and `FooterLink` are design-system-responsive's own blocks and are consumed here unchanged.

- type `HeroProps` · modified
  - `annotation` — new; the caption beside the mascot, empty hides it with its doodle
  - `mascotAlt` — new; the mascot's accessible name

### library API of package `landing` in app `robusta-build` — modified

Client code: the `/` route, `src/app/page.tsx`.

- component `LandingPage` · new — the six surfaces in their written order, every string supplied by the site
- component `NotesSection` · modified — headings in the first person singular; selection and feed unchanged

### library API of package `chrome` in app `robusta-build` — new

Client code: `src/app/layout.tsx` if OQ-LANDING-13 is accepted, package `landing` otherwise.

- component `Header` — `SiteHeader` fed by the site: wordmark linking `/`, the contact call to action, no nav link
- component `Footer` — `SiteFooter` fed by the site: brand block, tagline, copyright, no link column

### library API of the site configuration `seopyramids.config` in app `robusta-build` — modified

Client code: packages `landing` and `chrome`, and `src/app/layout.tsx`.

- type `SeoPyramidsConfig` · modified
  - `contact` — new; the email address and the LinkedIn profile, the single source of the contact route
  - `description` — new; the home page's description, written from the pitch, beside the `mission` motto

### library API of package `design-system` in app `robusta-build` — modified

The asset URL seam. Client code: packages `landing` and `chrome`, the site configuration.

- `heroMascotSrc` — new; the hero's mascot, `crystal-tux.svg`
- `ctaMascotSrc` — new; the closing CTA's mascot, `crystal-tux-waving.svg`

### HTTP API of app `robusta-build` — modified

- `GET /` — 200, the landing page, statically generated; its robots directive is the site-wide one until OQ-LANDING-12 is arbitrated

---

## Next Steps

1. Arbitrate the entries above. Gap-LANDING-10 blocks DoD 2 and is cheapest while design-system-responsive is still open; OQ-LANDING-12 changes ROADMAP and the epic, not only this story.
2. `storyman refine robusta-landing-page`: the AC of Gap-LANDING-9; the six-surface composition; the deletion of the wiring demonstration; the `noindex` criterion in the shape OQ-LANDING-12 settles; and, if kept, the autonomous decisions worth a dated line — `featured` given no role, the contact route held in the site configuration, `NotesSection`'s headings rewritten in the first person singular, a footer without link columns until the listing pages render.
3. Run bulkman on the epic if these entries should reach `pyramid-v2.bulk.md` with seo-excellence's.
4. designman once the story carries AC and design-system-responsive's props are final: the surface-by-surface prop mapping, the composition module, the metadata, R-LANDING-1 to 16 under their numbers, the boundaries of axis 11 at full zoom.
5. Implementation after design-system-responsive lands.
