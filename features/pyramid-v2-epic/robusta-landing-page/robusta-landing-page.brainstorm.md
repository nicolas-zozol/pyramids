# Brainstorm : Landing page of robusta.build

**Date :** 2026-07-29
**Feature :** robusta-landing-page
**Infix :** LANDING
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Sources read: the story, `pyramid-v2.epic.md` (Décisions structurantes of 2026-07-29), `root.archi.md`, `ubiquitous-language.md`, `business-rules.md`, `ROADMAP.md`, `CLAUDE.md`, the `packagify-design-system` PRD, the eight marketing surfaces and six primitives as they exist on `feat/packagify-design-system` (commit `6fb8d72`), the design system's CSS and brand-voice sheet, and the v1 home page under `apps/robusta/src/components/freelance/`.

Two things found in the package source drive most of what follows: the surfaces carry no responsive rule of any kind, and every call-to-action in them renders an anchor nested inside a button. Both are described in the Gaps.

---

## Requirements

Composition — BR-PYRAMID-3 : "Each site must carry its own design system, which no other site may reuse."

- R-LANDING-1 — The landing page is served at the root of the v2 site and is composed only of marketing surfaces of that site's own design system. The site contributes composition and copy; it contributes no presentation.
- R-LANDING-2 — The site may pass a surface's content as a fragment carrying design-system class names, and nothing else. It defines no class, no colour, no font and no spacing of its own.
- R-LANDING-3 — The order in which the surfaces are composed is written down, because the next site starts by copying this page.

Editorial

- R-LANDING-4 — No wording shipped as a default by the design system reaches a visitor. Every string a visitor reads is passed in by the site.
- R-LANDING-5 — The page speaks in the first person singular of one named engineer.
- R-LANDING-6 — The v1 pitch claims survive: twenty years and more of practice, fullstack from CSS to docker-compose, the EVM and Solidity specialism, the scientific background, Toulouse and remote, and the closing intent to turn ideas into robust products.
- R-LANDING-7 — The named references survive as text: Renault, Boston Consulting Group, Nauto, Diool, Swaap Finance, the Toptal screening and the Oracle Certified Java Master certification.
- R-LANDING-8 — The page states nothing that expires without an edit: no slot count, no named quarter, no dated availability claim.
- R-LANDING-9 — No resume is reachable from the v2 site: no page, no embedded document, no downloadable file, and no link pointing to one.

Contact

- R-LANDING-10 — The contact route is direct — an email address and a LinkedIn profile — reachable without submitting anything.
- R-LANDING-11 — The page offers no action the site does not fulfil. Every control leads to a destination that exists.

Technical — BR-PYRAMID-2 as recorded : "We embrace the constraints of Vercel, React Server Component and shadcn." It warrants R-LANDING-12 and nothing beyond it. R-LANDING-13 rests instead on the epic's decision of 2026-07-29 that the v2 base does not track visitor intents — a prohibition the registry no longer states under any number, which is Gap 4.

- R-LANDING-12 — The page renders entirely as a server component and stays readable with JavaScript disabled.
- R-LANDING-13 — The page loads no analytics client, no intent client and no telemetry.
- R-LANDING-14 — The page's title and description come from the site configuration, not from a string hardcoded in the layout.
- R-LANDING-15 — Stylesheets and brand assets reach the page through the package's exports subpaths, with no copy into the site's public directory.
- R-LANDING-16 — The page is readable on a phone: nothing scrolls horizontally, no text is clipped by a fixed-width grid.

---

## 1. Product Role

The landing page is the one page of robusta.build that sells rather than informs. `ubiquitous-language.md` already fixes the term: a landing page is "the home page of a site, built from the site's design system … a marketing surface, distinct from any content page."

Inside the epic it plays a second role that outweighs the first: it is the proof that a site can be dressed entirely by its own design system, and the template the next site is copied from. That is why the story forbids the site any markup of its own — a page that quietly patches the design system proves nothing.

What it is not: a portfolio, a resume, an article, or a lead-capture funnel. The v1 home page tried to be all of those at once — pitch, logo wall, skills grid, portfolio preview, an embedded CV in an iframe, and a recent-articles roll, in one scroll.

**Décision (autonome):** The landing page is a pitch page with one destination — the contact route — and it carries no portfolio, no skills taxonomy, no resume and, in this story, no article list.

**Rationale:** A page with one job can be judged; the v1 page had six and none of them was measurable.

---

## 2. Target Audience

Two readers, and they are not the same person.

- The buyer: a CTO, a founder or an engineering manager with a system that is hurting, arriving from a LinkedIn profile, a referral, or a search. They read the first screen and decide whether this is a serious engineer. They are technical enough to detect padding.
- The crawler: Googlebot, which indexes mobile-first and reads the server-rendered HTML. Everything the page wants to be found for has to be in that HTML, which the RSC decision already guarantees.

A third reader existed in v1 and is deliberately dropped: the recruiter, who was the audience of the embedded CV and its two PDF downloads. The epic puts the resume out of scope, and that removes the audience conflict — a page addressing both a buyer and a recruiter tells neither of them a clear story.

**Décision (autonome):** The page is written for the buyer and rendered for the crawler; the recruiter is no longer an audience of robusta.build.

**Rationale:** Removing the resume removes the reason the v1 page had to hedge between selling an engagement and selling a candidate.

---

## 3. Core Problem

The v1 home page states the offer as a list of nouns. Its pitch is one `<h2>` reading "Experienced Fullstack freelance", four bullets of technologies, a paragraph of client names, and a LinkedIn button carrying a phone icon. There is no `<h1>`, no headline, no statement of what a buyer would actually be buying. The `<title>` served is a string hardcoded in the root layout that does not match the `siteTitle` in `seopyramids.config.ts` — and `siteTitle`, `mission`, `logo` and `domain` in that file are declared but read by nothing.

So there are two problems stacked. The visible one: the page lists what Nicolas knows rather than what he does for you. The structural one: the site's own configuration is decorative, so the page identity lives in whatever string someone last edited in a layout file.

**Décision (autonome):** The page solves both — it leads with a headline stating the offer, and it reads its title, description and brand values from `seopyramids.config.ts`, making that file load-bearing for the first time.

**Rationale:** bootstrap-robusta-build declares the site configuration to be the per-site source of truth; a source of truth nothing reads is a comment.

---

## 4. Unique Value Proposition

Against the alternatives a buyer holds in the same hand:

- Against an agency: one named engineer with a traceable record, not an account manager and an unnamed team. This is exactly why the story's decision of 2026-07-29 rewrites the surfaces' "we" into the first person singular.
- Against a marketplace profile (Toptal, Malt): the screening is cited as evidence, but the engagement is direct — no intermediary, no platform margin.
- Against the v1 page: the same claims, ordered so that a reader gets the offer before the technology list.

The evidence that carries the proposition is already written and verifiable: Renault, Boston Consulting Group, Nauto, Diool, Swaap Finance, the Toptal screening, the Oracle Certified Java Master certification. The v1 page had it too, and buried it in a paragraph below a logo wall.

**Décision (autonome):** The proposition is "one senior engineer you can name, with a record you can check", and the named references are promoted from a buried paragraph into the surfaces a reader meets first.

**Rationale:** The references are the only unfalsifiable thing on the page, and every competing option is anonymous by construction.

---

## 5. Functional Scope

The design system ships eight marketing surfaces. Five of them have copy that the v1 record actually supports; two of them describe a service business that robusta has never described anywhere in writing; one is deferred by the story.

In scope — the composition, in order:

1. SiteHeader — wordmark, a short nav, the contact CTA
2. Hero — the pitch: the name, the experience claim, the specialism, the location, the contact CTAs
3. PrinciplesList — how the work is done, and the named references as text
4. CTA — the closing contact block
5. SiteFooter — brand block, tagline, copyright

Held out of the first release:

- ServicesGrid and FlowDiagram — their prototype copy ("the audit", "embedded eng", "rebuild surgery", a five-step engagement with a 2–3 week audit) is invented. There is no v1 source for it, and R-LANDING-4 forbids shipping the defaults. See Gap 3.
- NotesPreview — the story already defers it to migrate-learn-content.

Explicitly out: the logo wall, the skills grid, the portfolio preview, the GitHub contribution calendar, the resume in all its forms, and any French version of the page.

Two scope calls worth stating plainly. The footer's `FooterColumn.items` is typed `string[]` and every item renders as `<a href="#">` — the package gives no way to attach a real destination. Passing `columns={[]}` yields a brand-and-copyright footer with no dead link, which satisfies R-LANDING-11. And the v1 home page is English-only — no `fr` route, no dictionary, `lang="en"` hardcoded — so an English-only v2 landing page loses no indexed page, whatever `otherLocales: ['fr']` says for the blog.

**Décision (autonome):** Five surfaces ship, the footer ships with no link columns, and the page ships in English only.

**Rationale:** Shipping only the surfaces whose copy is backed by the v1 record keeps R-LANDING-4 true without inventing commercial claims, and a footer of `#` links would break R-LANDING-11 on the first surface a crawler reads.

---

## 6. Core Features

### Feature: The composed landing route

**Capability:** `/` of `apps/robusta-build` returns a server-rendered page assembled from five design-system surfaces, in a fixed and documented order, with the two stylesheets imported once from the root layout and the wordmark and mascot resolved through the package's `assets/*` subpath.

The page module is a pure function: every surface is server-safe, none is async, none reads a request. That makes the whole page testable by rendering it to a string, which the test approach leans on throughout.

**Acceptance Criteria:**
- Given the site is built, When `/` is requested, Then the response HTML contains the header, hero, principles, CTA and footer sections, and the site's own module tree declares no styled element of its own.
- Given JavaScript is disabled, When `/` is loaded, Then the full pitch, the references and the contact route are readable.
- Given the design system package is absent from `dev`, When the site is built, Then the build fails loudly rather than rendering a page with unstyled fallbacks.
- Given the wordmark is imported through the exports subpath, When the page is built, Then no brand asset has been copied into the site's `public/` directory.

**Test Approach:** A vitest unit test rendering the page function with `renderToStaticMarkup` and asserting the section sequence; a build-output assertion that `public/` contains no file from the package.

---

### Feature: Robusta's copy in place of the prototype defaults

**Capability:** Every string a visitor reads is passed in by the site, in the first person singular, carrying the v1 claims and the named references.

**Acceptance Criteria:**
- Given the page is rendered, When its HTML is searched for the prototype defaults ("small team. long memory.", "we build software", "principles, written down.", "made by hand, with care.", "we read before we write."), Then none is found.
- Given the page is rendered, Then it contains Renault, Boston Consulting Group, Nauto, Diool, Swaap Finance, Toptal and the Oracle certification.
- Given the page is rendered, Then it contains no first-person-plural pronoun in the marketing copy.
- Given a surface is given no prop for a slot the page does not use, When the page renders, Then that slot is absent rather than falling back to the prototype's wording.

**Test Approach:** A single guard test holding the list of forbidden default strings and the list of required claims, run against the rendered markup. It is cheap, it is exact, and it is the only thing standing between a package upgrade and prototype copy silently reappearing in production.

---

### Feature: The contact route

**Capability:** A visitor reaches Nicolas in one click, by email or LinkedIn, from the header, the hero and the closing CTA — with no form, no field and no capture.

The v1 email `nicolas@robusta.build` was rendered behind `TimeDiffered`, a client component that delays the mailto to frustrate scrapers. That mechanism cannot survive R-LANDING-12, and it is not worth reintroducing: the same address already sits in cleartext in the published resume HTML and both PDFs, so the obfuscation protects nothing while costing the page its no-JavaScript readability.

The CTA surface offers an `SkInput` email field with no submit path — a server component cannot handle one. Hiding it with `emailPlaceholder=""` removes a control that would do nothing, and removes the funnel the brand voice sheet explicitly rejects.

**Acceptance Criteria:**
- Given the page is rendered, When the contact controls are inspected, Then each resolves to `mailto:nicolas@robusta.build` or to the LinkedIn profile, and both appear in the static HTML.
- Given the page is rendered, Then it contains no `<input>`, no `<form>` and no element whose destination is `#`.
- Given a visitor uses a keyboard only, When they tab through the page, Then every contact control is reachable and announces itself as a link.

**Test Approach:** Assertions over the rendered markup for the two destinations and for the absence of inputs, forms and `href="#"`; one accessibility pass with axe on the built page for the nested-interactive check of Gap 2.

---

### Feature: No resume, and no way back to one

**Capability:** The v2 site carries nothing from the v1 resume apparatus: no `WebResume` component, no `public/nicolas/` tree, no iframe, no PDF, no link.

The v1 apparatus is larger than the story implies: an iframe over `public/nicolas/resume-web-crypto.html`, two linked PDFs, plus four orphan HTML resumes and six unlinked PDFs including a French CV, none of which anything on the site points at.

**Acceptance Criteria:**
- Given the v2 site is built, When its output is searched, Then it contains no file under a `nicolas/` path, no `.pdf`, and no `<iframe>`.
- Given the page is rendered, When its links are collected, Then none targets a resume, a CV or a downloadable document.

**Test Approach:** A build-output check over the site's static assets, plus the link-collection assertion in the render test.

---

### Feature: Page identity and its measurement

**Capability:** The page's title and description are read from `seopyramids.config.ts`, and the page carries no measurement code at all — what the page achieves is measured off the page.

**Acceptance Criteria:**
- Given `siteTitle` is changed in the site configuration, When the site is rebuilt, Then the `<title>` of `/` changes with it.
- Given the page is rendered, Then it contains no third-party script tag and no request to an analytics endpoint.
- Given the page is loaded, Then the only external network request it makes is the one the design system's font `@import` produces — see Open Question 2.

**Test Approach:** A render assertion tying the metadata to the configuration; a network-request assertion in the accessibility/E2E pass; Lighthouse run against the built page for the performance and SEO scores rather than any runtime instrument.

---

## 7. Critical Edge Cases

Product and usage:

- A phone visitor. The surfaces have no `@media`, no `clamp()`, no `minmax()` and no viewport unit anywhere — the hero is a fixed `1.3fr 1fr` grid with an 88 px headline and 48 px side padding, the footer a fixed four-column grid. On a 390 px screen the page will scroll sideways and clip. Gap 1.
- A visitor who clicks the contact button. Every CTA renders `<button class="sk-btn"><a href="…">…</a></button>`. Gap 2.
- A visitor who reads the availability line. The prototype footnote says "currently booking q3 · 2 slots left this quarter" — fabricated scarcity, of the exact kind the brand-voice sheet lists under "don't", and a claim that rots on a statically generated page. It is replaced by a line that does not expire.
- A visitor who finds the page through a French search. The page is English-only, matching v1. Nothing is lost, but nothing is gained either.

Technical:

- The wordmark is a 1603×312 PNG rendered by `BrandLogo` as a plain `<img>`. The component does not accept `next/image`, so the site cannot optimise it. It carries explicit dimensions, so there is no layout shift, but it is a heavy above-the-fold image on the LCP path. The epic already holds `vectorize-wordmark` as item 9, which would resolve most of the weight without a component change.
- The mascot props default to `''`, which hides the illustration silently. A consumer that forgets the import gets a page that renders fine and is simply missing its brand character — a failure with no error. The render test asserting the asset is present is what catches it.
- The surfaces hardcode `id="approach"` (FlowDiagram) and `id="notes"` (NotesPreview) and nothing else. Neither ships in this release, so no in-page anchor target exists at all.
- Inline styles cannot be overridden by a stylesheet without `!important`. Any correction the site might attempt from the outside is therefore not just forbidden by R-LANDING-2 — it does not work.

**Décision (autonome):** The header nav carries no in-page anchors in this release; it carries the wordmark and the contact CTA only, and grows real destinations when migrate-learn-content ships `/articles`.

**Rationale:** A nav of four anchors pointing at sections that do not exist is the v1 header's `FakeLink` mistake repeated, and R-LANDING-11 exists to prevent exactly that.

---

## 8. Non-Functional Constraints

Rendering and platform, per BR-PYRAMID-2 as recorded — "We embrace the constraints of Vercel, React Server Component and shadcn": the page is a server component, statically generated, and carries no client bundle of its own. Worth noting for the design step: the shadcn decision does not reach this page. The surfaces render inline styles plus CSS custom properties and use no utility class at all — not one Tailwind class, not one DaisyUI token. The landing page therefore imports zero shadcn components and does not wait on the DaisyUI-to-shadcn migration of `pyramids-layouts`, `pyramids-links` and `pyramids-ctas`.

Performance: the LCP element is the hero headline or the wordmark. Two costs are structural — the 1603×312 PNG through a plain `<img>`, and the fonts loaded by an `@import` nested inside `colors_and_type.css`, which serialises the download (site CSS → font CSS → font files) and blocks the first paint at the worst possible point.

Privacy, and the measurement question the constraint forces. The epic puts visitor-intent analytics out of scope and forbids tracking visitor intents; `ubiquitous-language.md` defines an intent as "a named, hierarchical, lifecycle-tracked visitor action". That rules out the usual instrumentation of a landing page — conversion events, funnels, scroll depth, session recording, A/B assignment. It also rules out Vercel Web Analytics and Speed Insights, which are cheap and tempting and both inject a client script that identifies a visit.

What is left is not nothing, and it is arguably better suited to a page that expects tens of visitors a day rather than thousands:

- Acquisition: Google Search Console — queries, impressions, clicks and position for `/`. Google's own aggregate, no code on the page, no visitor identified.
- Conversion: the inbox and the LinkedIn message list. For a freelance landing page the real metric is qualified inbound per month, and it is countable where it lands. One question in the first reply — "how did you find me?" — recovers more attribution than a funnel would, from the only person who actually knows.
- Quality: Lighthouse in CI and the Core Web Vitals report in Search Console, which comes from Chrome's own field data rather than from anything the site collects.

An alternative was considered and rejected: giving each surface's contact link a distinct `mailto:` subject, so the inbox attributes the click without any tracking at all. It works, it breaks no rule, and it puts a machine-readable tag in a subject line the sender sees and did not choose. Not worth it.

**Décision (autonome):** The landing page ships zero client-side measurement of any kind. Acquisition is read in Search Console, conversion is counted in the inbox, quality is measured in CI.

**Rationale:** The rule forbids tracking visitor intents, and the honest reading is that a page which cannot instrument its visitors should measure its outcome instead of its traffic — which for a page with one destination is both cheaper and more truthful.

---

## 9. External Dependencies

- `@robusta/pyramids-design-system` at commit `6fb8d72` — the hard one. Everything this page renders comes from it, and it is on `feat/packagify-design-system`, not on `dev`.
- `apps/robusta-build` — created by bootstrap-robusta-build, which also owns the root layout where the stylesheets are imported and the font decision of Open Question 2 lands.
- unblock-build — until `pyramids-links` compiles in a fresh worktree, the build chain the site sits on does not go green, so nothing here is verifiable end to end.
- Google Fonts CDN — IBM Plex Sans, IBM Plex Mono and Caveat, fetched at render time by the `@import` in `colors_and_type.css`. The only third party the page touches, and the subject of Open Question 2.
- LinkedIn — `https://www.linkedin.com/in/robustacode/`, currently hardcoded in `packages/ctas`, which this page does not use. The v2 site holds it in its own configuration.
- Vercel — the preview project bootstrap-robusta-build sets up; the robusta.build domain does not move until retire-robusta-v1.

The font stack itself is settled and not reopened here: the epic decided on 2026-07-29 that `colors_and_type.css` is canonical — IBM Plex Sans, IBM Plex Mono, Caveat — and that the README's Caveat / Kalam / Architects Daughter / JetBrains Mono claim is the error to correct. The correction is owed by the design system package, not by this story, and `ROADMAP.md` still lists it as an open loose end.

---

## 10. Major Risks

Product:

- The offer is still unwritten. The page can carry who Nicolas is and who he has worked for, because v1 wrote that down. It cannot say what an engagement costs, how long it runs, or what a buyer receives, because nothing in the repo has ever said so. A pitch page that never names its offer converts on reputation alone. Gap 3.
- The page is the template for every later site, so its shortcuts propagate. A footer with no links and a nav with no destinations are defensible for a one-page site and become wrong the moment the second site copies them.

Technical:

- The design system was validated by eye, on desktop, in per-component preview sheets — there is no full-page preview in `preview/`, so this composition has never been seen assembled at any width. The first honest look at the page is also its first integration test.
- Both blocking defects are in the package, and the package is one unmerged commit that has already been declared delivered. Fixing them reopens work everyone considers finished.
- `sketch.css` and `colors_and_type.css` are global and unscoped. They will also apply to the article pages migrate-learn-content brings in, which nobody has looked at.

Adoption:

- The measurement decision means that if the page underperforms, there will be no on-page evidence of why. That is the accepted price of the rule, and it should be a conscious one rather than a discovery in six months.

**Décision (autonome):** The risk register is carried into the design doc as-is; none of these justifies weakening R-LANDING-2 or adding site-level markup.

**Rationale:** Every one of them is either a package fix, a content decision or an accepted cost — none is solved by letting the site patch its own design system, which would forfeit the only thing this story proves.

---

## Next Steps

1. Arbitrate this section. Gaps 1 and 2 are the ones that matter: they are package defects, they block a page that can be shipped to a public URL, and they are likely to become a design-system story sequenced ahead of this one.
2. Run bulkman on the epic so these entries reach `pyramid-v2.bulk.md` alongside the other stories' open points.
3. Once Gaps 1 to 3 are settled, run designman for `robusta-landing-page.design.md`: the surface-by-surface prop mapping, the composition module, the metadata wiring to `seopyramids.config.ts`, and the R-/AC- derived from the requirements above.
4. Implementation stays blocked on merge-design-system, unblock-build and bootstrap-robusta-build, in that order.
