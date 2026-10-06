# Brainstorm : Move the v2 site from Next.js on Vercel to TanStack Start on Netlify

**Date :** 2026-10-06
**Feature :** tanstack-start-migration
**Infix :** TANSTACK
**Participants :** bsman (autonomous)

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

## Sources read

`tanstack-start-migration.story.md`; `pyramid-v2.epic.md`, its decision of 2026-10-06 and its Vercel and corepack entries of 2026-08-01 and 2026-08-02; `pyramid-v2.bulk.md`; `business-rules.md`; `ubiquitous-language.md`; `root.archi.md`; `ROADMAP.md`. Code of `apps/robusta-build`: `package.json`, `next.config.ts`, `src/middleware.ts`, the root layout, `src/app/learn/[...path]/route.ts`, a route file, `ArticleView`, `NotesSection`, `article-index.ts`, `content-urls.ts`, `assets.ts`, the three scripts, both `tsconfig` files, `vitest.config.ts`, `v1-url-map.generated.json`; its `README.md` and `robusta-build.archi.md`. The imports of `@robusta/pyramids-content`, which reads the filesystem (`node:fs`, `gray-matter`, `remark`). The font contract of `colors_and_type.css`. The published sources of `@tanstack/start-static-server-functions` 1.167.39 and `@netlify/vite-plugin` 3.0.1.

The story's OQ-TANSTACK-1 to 4 carry `lgtm` and wait for storyman's fold. This brainstorm builds on them as decided.

### Verified against the documentation

Checked on 2026-10-06 against the source named, not from memory.

- Loaders are isomorphic: on the first request they run on the server, on later client-side navigation in the browser. [Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)
- A server function carrying `staticFunctionMiddleware` (package `@tanstack/start-static-server-functions`, marked experimental) runs during prerender and writes its result to `/__tsr/staticServerFnCache/{sha1}.json` in the client output. In a production browser the middleware fetches that file instead of calling a server. Read in the package source: the client branch has no fallback, so a payload the build did not produce throws; on a server at request time the handler runs like any server function. [Static server functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)
- Prerender: `autoSubfolderIndex` defaults to `true` (`/page/index.html`), `crawlLinks` to `true`, `autoStaticPathsDiscovery` to `true` and skips routes with params; with discovery off, only `/` and the `pages` list are prerendered; `failOnError` defaults to `true`. The guide names the use case "deploying static sites to platforms that do not support server-side rendering". [Static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- `@netlify/vite-plugin-tanstack-start` writes one Netlify Function, `server.mjs`, configured `path: "/*"` and `preferStatic: true` (read in `@netlify/vite-plugin` 3.0.1).
- Netlify evaluates path-matched functions (step 10) before redirects (step 11) and static files (step 12): a request a function matches never reaches the redirect rules. [Request chain](https://docs.netlify.com/resources/troubleshooting/request-chain)
- `_redirects` documents 301 (default), 302, 404 and 200; 307 is unsupported; neither 308 nor 410 is documented, and a forum report of 2026-04-29 shows a 410 rule served as 404. A rule matches with or without a trailing slash and cannot add or remove one. Paths are case-sensitive. [Redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options), [overview](https://docs.netlify.com/manage/routing/redirects/overview), [410 served as 404](https://answers.netlify.com/t/410-redirects-served-as-404/161825)
- Pretty URLs, on by default: a file `x.html` answers `/x` with 200 and redirects `/x/` to `/x`; a file `x/index.html` redirects `/x` to `/x/`. [Trailing-slash guide](https://github.com/slorber/trailing-slash-guide)
- Netlify redirects an uppercase path to its lowercase form for static files, a behaviour its support forum confirms and its documentation does not state. [Forum](https://answers.netlify.com/t/enforcing-case-sensitivity-for-url-paths-on-netlify/123969)
- A fully prerendered TanStack Start site served statically hydrated its 404 page into an empty page. The issue was closed on 2026-08-04 by a router rewrite (PR #7805) that documents no option for it. [TanStack/router#5427](https://github.com/TanStack/router/issues/5427)
- `useParams({ strict: false })` reads the params of every matched route from any component, the root included. [Path params](https://tanstack.com/router/latest/docs/framework/react/guide/path-params)
- Migration guide: `next/font` becomes self-hosted files or Fontsource; `next/image` has no equivalent, plain `<img>` for preprocessed assets. [Migrate from Next.js](https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js)
- npm today: `@tanstack/react-start` 1.168.60, peer `vite >=7`, engines `node >=22.12.0`; `@vitejs/plugin-react` 6.1.2, peer `vite ^8`; vite 8.3.3; vitest 5.0.3, peer `vite ^6.4 || ^7 || ^8`; `@tailwindcss/vite` 4.3.3. The repository hoists vite 6.4.3 and vitest 3.0.6.
- Vite resolves a `.js` import from a TypeScript file to its `.ts` source (`isPossibleTsOutput` in its resolver); the site's `vitest.config.ts` already relies on it.
- Netlify reads `.nvmrc` in the base directory before `NODE_VERSION` and the UI, default Node 24. It installs Yarn when `yarn.lock` or `packageManager` names it, honours `yarnPath`, and documents `--ignore-optional` as the default of `YARN_FLAGS`, an option yarn 4 rejects. Monorepo: package directory `apps/robusta-build`, base unset, install and build at the root. [Manage dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies), [Monorepos](https://docs.netlify.com/build/configure-builds/monorepos)
- Credits: 15 per production deploy, 0 per deploy preview or branch deploy, 20 per GB of bandwidth, 2 per 10,000 web requests, 10 per GB-hour of function compute. Free: 300 a month, hard cap, every project of the team paused once spent. [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)

### Corrections for the story

- What depends on Next, Data: "that data reaches them from the route, at build time" holds for the first load only. On client-side navigation the loader runs in the browser and needs the data again (Gap-TANSTACK-5).
- Boundaries: "The story adds no server route and no server function" collides with the only documented channel for that data (Gap-TANSTACK-5). The paragraph on the 410 and the lowercase redirect still reads as open: both are settled by OQ-TANSTACK-2 and 3. Netlify offers no 410 (verified above), so OQ-TANSTACK-2's fallback branch applies: `/learn` answers 404 and R-URLSCHEME-25 is amended.
- OQ-TANSTACK-1 promised an AC for the three French articles; the AC list does not carry it (edge case 6 below).
- What depends on Next misses `src/design-system/assets.ts` (its `StaticImageData` branch), `tsconfig.json` (the `next` plugin and `next-env.d.ts`), `postcss.config.mjs` (`@tailwindcss/postcss`), the app's `lint` and `start` scripts (`next lint`, `next start`), and the R-URLSCHEME-30 assertion inside `next.config.ts` that the route folders match the content root.
- Dep 2: the Netlify site needs a package directory, a production branch and an ignore rule, not only a link to the repository (OQ-TANSTACK-7).
- AC-TANSTACK-4, "301 or 308": every permanent redirect this site answers on Netlify is a 301.

---

## Acceptance Criteria challenge

### Verdicts

- AC-TANSTACK-1 — testable and sufficient. The route-table check reads the written `.html` files instead of Next's prerender manifest, and a grep proves both directives absent. "Every URL of `urlSet` plus `/`" misses the not-found page, `/404.html`. It does not forbid `createServerFn`, which Gap-TANSTACK-5 needs.
- AC-TANSTACK-2 — not realizable as written: a category page is a placeholder with no other-locale link, and two articles only have another locale. Proposed: "Given the English article on yield farming open in a browser, when Barbot follows its other-locale link and then the French article's category link, then each page renders without a full reload, and every request answers with a file of the deploy — page, script, stylesheet, image or prerendered data — and none runs server code (BR-PYRAMID-7)." If OQ-TANSTACK-6 is accepted, add "the deploy carries no function", which makes the last clause hold by construction.
- AC-TANSTACK-3 — testable only if the reference survives: the Next build is gone once this story lands. Screenshots of `/` and the eleven articles at named widths, 375, 768 and 1280, are taken on the Next build before the first change, and Ada compares against them once the faces have loaded — the size-adjusted fallback face of `next/font` goes away.
- AC-TANSTACK-4 — testable on the deploy preview by requesting each rule source; "301 or 308" becomes "301". It misses the retired `/learn` documents (edge case 2).
- AC-TANSTACK-5 — testable, in business language. Exposed to two Vite majors in one tree (Axis 10, risk 3).
- AC-TANSTACK-6 — "no corepack" is beyond the repository's reach: Netlify hands the Yarn version named by `packageManager` to Corepack. Proposed: "the build log shows Node 22 and yarn 4.17.1 run from `.yarn/releases`, and no build variable enables corepack". The committed `.cjs` cannot fail the way the corepack-cached `yarn.js` failed on 2026-08-01, whoever starts it.
- AC-TANSTACK-7 — testable. An article no page links to is today's normal case: `/` links the four newest English articles, which link two French ones, category pages link none, and five of the eleven articles are reached by no chain of links from `/`. The cover clause cannot be tested on the corpus, every article declaring a cover: it needs a fixture. The 404 clause says nothing about JavaScript (edge case 1).

### Business edge cases proposed to storyman

1. Given `/articles/c/web/an-article-that-does-not-exist`, when Barbot opens it in a browser with JavaScript on, then the status is 404 and the not-found page is still on screen once the scripts have run.
2. Given a retired v1 document address — one of the six gone rows, or any `/learn` path no permanent row claims — when Barbot requests it, then it answers 404 with the not-found page.
3. Given a page URL carrying an uppercase letter, when Barbot requests it, then it answers 404 or redirects permanently to its lowercase form, and never serves the page under the uppercase address; given `/article-images/theory/images/M87.jpg`, then the file answers 200 at its exact case.
4. Given a reader whose tab was opened before a new deploy, when they follow a link afterwards, then the target page renders, through a full load if need be, and never as an error page.
5. Given a commit that changes nothing the v2 site is built from — `apps/dakar` alone — when it reaches the production branch, then Netlify makes no production deploy of the v2 site.
6. Given the three French articles, when the site is built, then their documents declare `lang="fr"` and every other page `en`; given an English article open, when Barbot follows its other-locale link, then the document's language reads `fr` without a reload.

---

## 1. Product Role

**Problème:** the v2 site runs on a framework and a host the publisher has set aside, and its preview was never recorded rendering (AC-BOOTSTRAP-81).

What it is: a re-platform. The same pages, URLs, redirects and rules, served by TanStack Start's prerender from Netlify. What it is NOT: a redesign, the landing page, SEO metadata, the domain switch, a server feature, or a change to the three base packages.

**Décision (autonome):** the story delivers the site's HTTP contract unchanged from a new host, plus the data channel a hydrated page needs to navigate without a server.

**Rationale:** the statuses are what browsers and crawlers depend on; everything else in `apps/robusta-build` is internal code and may move.

---

## 2. Target Audience

- The publisher, one person on a Free team with no operations budget, whose credits pause every site of the team when spent.
- Readers and crawlers (Barbot), who see the statuses and the HTML before any script runs.
- Tux, building from a clean checkout; Nina, adding an article and opening a preview; Ada, comparing renders.
- designman of robusta-landing-page and seo-excellence, who write their designs against TanStack Start once this lands (Dep 3).

**Décision (autonome):** the publisher's constraint weighs most: nothing runs on a served request, and nothing spends a credit outside a deliberate production deploy.

**Rationale:** on the Free plan cost is an availability concern — an empty balance takes the sites offline — not a budget line.

---

## 3. Core Problem

**Problème:** a hydrated TanStack Start page navigates client-side, and the target route's loader then runs in the browser. The article data comes from `@robusta/pyramids-content`, which reads the filesystem and cannot run there. Left alone, the framework answers that navigation with a call to a server function: a Netlify Function reading the content source on a served request, which BR-PYRAMID-7 forbids and which costs credits.

**Options considérées:**
- Ordinary server functions — work everywhere; every client navigation becomes a function invocation reading the corpus. Rejected on BR-PYRAMID-7.
- Static server functions — the framework's mechanism for this case: results written at prerender, fetched as static JSON on navigation. Experimental.
- Build-generated JSON modules loaded by the loaders through `import.meta.glob` — no framework feature, plainly isomorphic; costs a generator and a generated tree inside the site.
- A full reload on every link — needs no channel; contradicts AC-TANSTACK-2 and the story's decision to hydrate into client navigation.

**Décision (autonome):** static server functions, with the generated JSON modules as the named fallback should the package fail AC-TANSTACK-2 (Gap-TANSTACK-5).

**Rationale:** the reads stay behind the existing seams — `getArticleIndex`, `getArticleBody`, `getAssetUrl` — for the price of one middleware per function.

---

## 4. Unique Value Proposition

Against the Next build: standard React with one component world, a host whose free plan allows commercial use, and a server one configuration change away. Against a static generator: the same framework carries server routes and functions the day they are wanted. What makes it cheap to run is the deploy shape.

```
  A request reaching Netlify, under the two deploy shapes.

  A. client output only                B. with the plugin's SSR function,
     (OQ-TANSTACK-6)                      path "/*", preferStatic
  request                              request
    │                                    │
    ├─→ file of the deploy? → 200        ├─→ function "/*" matches, always
    │                                    │     │
    ├─→ rule in _redirects? → 301        │     ├─→ file of the deploy? → 200
    │                                    │     │
    └─→ otherwise → /404.html, 404       │     └─→ otherwise → SSR render,
                                         │         loaders run on the server
                                         │
                                         └─→ _redirects: never reached
```

**Options considérées:**
- B, the plugin Netlify documents for TanStack Start — redirects and the 410 would move into server code, and an unknown article URL would run its loader, corpus read included, at request time.
- A, the client output published alone — `_redirects` answers, `/404.html` answers, no function exists to invoke.

**Décision (autonome):** shape A (OQ-TANSTACK-6).

**Rationale:** it is the only shape where BR-PYRAMID-7 and a zero compute bill hold by construction, and TanStack Start stays the framework, so the server the story keeps within reach is still one plugin away.

---

## 5. Functional Scope

In scope:

- The route tree: the root layout and the fourteen page files of `src/app` become TanStack Start routes — the root route, twelve content routes, the home page, the locale landing — plus a not-found route. The `/learn` handler and `src/middleware.ts` are deleted, not ported (OQ-TANSTACK-2 and 3).
- The data channel of Axis 3.
- The document shell: `noindex`, the CSS order, the fonts, `<html lang>` from the matched locale (OQ-TANSTACK-1).
- The article page on plain components: the cover as `<img>` (OQ-TANSTACK-4), links through the router.
- URL hygiene on the host: `_redirects` emitted at build, trailing slashes through Pretty URLs, the not-found page.
- Build: Vite with TanStack Start, `@tailwindcss/vite`, Fontsource, vitest aligned with the site's Vite; `emit-redirects.mjs` also writes `_redirects`, `check-route-table.mjs` reads the written HTML.
- The Netlify site, its `netlify.toml`, and the README record of its first deploy.
- The documentation plan of the story.

Out of scope, beyond the story's list: the Netlify plugin and any function (OQ-TANSTACK-6), Netlify Image CDN (OQ-TANSTACK-4), edge functions, `robots.txt` and `sitemap.xml` (seo-excellence), deleting the Vercel project in its dashboard.

**Décision (autonome):** the scope is what the HTTP contract and the two rules on reading content need, and nothing visual is added.

**Rationale:** Dep 3 holds two designs on this story, so every addition delays them.

---

## 6. Core Features

### Feature: Prerendered page set

**Capability:** `vite build` writes `/`, every URL of `urlSet` and `/404.html` as complete HTML. The `pages` list comes from `contentUrls()`, read through the compiled `.routing-dist` modules the build scripts already use; `autoStaticPathsDiscovery` and `crawlLinks` are off; `autoSubfolderIndex` is off, so `/articles/c/web` is written as `articles/c/web.html`, which Pretty URLs serve at the canonical form and redirect `/articles/c/web/` from — the default `index.html` layout would redirect the canonical form to its slashed one. The route-table check compares the written files with the derivation and fails the build on any difference.

Crawling stays off: the derivation already lists every page, five articles are reached by no chain of links from `/`, and a crawled page outside `urlSet` is what AC-URLSCHEME-42 refuses.

**Acceptance Criteria:** AC-TANSTACK-1, AC-TANSTACK-7 (the unlinked article, the article added with no code change)

**Test Approach:** the route-table check inside `build`; a build-level check that an article's HTML carries its title, author and body text with no script executed; a grep for both directives over `src`.

---

### Feature: Static data for client-side navigation

**Capability:** a new package `page-data` holds two server functions carrying `staticFunctionMiddleware`: `getArticlePage`, everything one article page renders, and `getNotesFeed`, the posts the notes section lists. Each runs in the prerender of the page that calls it and leaves one JSON file under `/__tsr/staticServerFnCache/`; a hydrated page navigating to another fetches that file from the CDN. `ArticleView` and `NotesSection` become plain components fed by their route's loader, every URL they render computed in `page-data`. An article Nina adds gets its page and its data file from the same derivation.

**Acceptance Criteria:** AC-TANSTACK-2 (reworded above), AC-TANSTACK-1
- Proposed to storyman: edge case 4

**Test Approach:** a build check that no client chunk contains `@robusta/pyramids-content`, `gray-matter` or `node:fs`; the count of data files equals the eleven articles plus the home page; the AC-TANSTACK-2 path walked on the deploy preview with the network panel open, or as a Playwright run against the preview URL.

---

### Feature: Document shell

**Capability:** the root route renders `<html lang>` from `useParams({ strict: false }).locale`, the site's default locale otherwise; `robots` `noindex, nofollow` on every page, the not-found page included; the three stylesheets in their contractual order; the three faces from `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono` and `@fontsource/caveat` at today's weights, bundled and served by the site. The site sets none of the `--font-*` properties: `colors_and_type.css` falls back to the family names Fontsource declares, so no value is coined at site level (BR-PYRAMID-6).

**Acceptance Criteria:** AC-TANSTACK-3
- Proposed to storyman: edge case 6

**Test Approach:** screenshot comparison against the Next reference; the network panel shows no third-party request; a check over the built HTML for `lang` and `noindex` on every page, then the language switch on client navigation on the preview.

---

### Feature: Article page on TanStack Start

**Capability:** `ArticleView` renders the loaded data in the same markup. The cover is a plain `<img>` in today's 16:9 box, loaded eagerly as the page's largest image, and the box is absent when the article declares no cover. Links go through the router's `Link` on the URLs `buildUrl` produced, `@robusta/pyramids-routing` staying the single builder.

**Acceptance Criteria:** AC-TANSTACK-3, AC-TANSTACK-7 (no empty cover box)

**Test Approach:** a vitest render to string of `ArticleView` on a fixture entry declaring no cover; the visual comparison of AC-TANSTACK-3 for the rest.

---

### Feature: URL hygiene on the host

**Capability:** `emit:redirects` writes `public/_redirects` in Netlify syntax, 301 throughout: the 66 permanent v1 rows and six canonical-form rules — explicit page one, four, and marked default locale, two. Vite copies it into the client output. Pretty URLs answer the trailing slash. No rule answers case or `/learn`: both fall to the not-found page, which Netlify serves with 404 for any path matching no file and no rule. `v1-url-map.generated.json` stays committed as the reviewable mapping.

**Acceptance Criteria:** AC-TANSTACK-4, AC-TANSTACK-7 (unknown URL)
- Proposed to storyman: edge cases 1, 2 and 3

**Test Approach:** vitest on the emitter's output — 72 rules, Netlify syntax; a script run against the deploy preview requesting each rule source with one sample per placeholder, three trailing-slash forms, an uppercase form, `/learn/theory/solid-principles.md` and an unknown article, asserting status and `Location`; its result recorded in the README.

---

### Feature: Build chain and green set

**Capability:** the site builds with Vite and TanStack Start, Tailwind 4 through `@tailwindcss/vite`, the `.js`-suffixed local imports resolved by Vite itself. The site declares its own `vite` and a `vitest` whose range covers it. `yarn build:robusta-build` and `yarn dev:robusta-build` keep their names at the root.

**Acceptance Criteria:** AC-TANSTACK-5

**Test Approach:** the green set from a fresh clone; dakar at 23/23 and robusta at 42/42; the 38 tests; a grep for a local import without `.js`.

---

### Feature: Netlify deployment

**Capability:** a site under the Free team, package directory `apps/robusta-build`, base unset so install and build run at the root and read its `.nvmrc`. `netlify.toml` in the package: build command `yarn build:robusta-build`, publish the client output, the ignore command of OQ-TANSTACK-7. The README's Deployment section records the first green branch deploy.

**Acceptance Criteria:** AC-TANSTACK-6 (reworded above)
- Proposed to storyman: edge case 5

**Test Approach:** the deploy log — Node 22, yarn 4.17.1 from `.yarn/releases`, no function bundled; the eleven article URLs opened on the preview; a commit touching `apps/dakar` alone, showing a skipped build.

---

## 7. Critical Edge Cases

The six business edge cases above go to storyman. Five host behaviours are settled here and need no AC:

- `/articles/c/web/{slug}.html` and `/index.html` answer 200 with the page, a second address Netlify serves for every prerendered file. Accepted: the site is `noindex` until the switch, and seo-excellence's canonical tag names the canonical form.
- `/404` answers 200 with the not-found page, since `/404.html` is produced by a real route — a prerender of an unmatched path fails the build. Accepted for the same reasons.
- Rules are case-sensitive: a v1 address redirects in the case v1 published it, `/learn/tag/DeFi` included, and in no other.
- A non-canonical form combining two families, `/l/en/articles/p/1`, takes two 301s to the same destination, as on the Next build.
- `/articles/t/{tag}` answers 404 like any unknown URL.

**Décision (autonome):** the five behaviours above are accepted as they stand.

**Rationale:** each concerns a URL the site never emits, on a site that is `noindex` until the domain switch.

---

## 8. Non-Functional Constraints

- Security: no function, no secret, no code running on a request; what is exposed is a static file server.
- Cost: branch deploys and previews cost nothing; a production deploy costs 15 of 300 monthly credits. Bandwidth at 20 credits a GB covers tens of thousands of first visits a month, enough until the domain switch, which the story plans on the Personal plan.
- Performance: every page now ships React and the router and hydrates, giving back the tens of KB RSC saved, as the decision of 2026-10-06 accepts. Covers lose WebP (OQ-TANSTACK-4). Fonts lose the size-adjusted fallback; `font-display: swap` stays.
- Rules: BR-PYRAMID-2, no telemetry client; BR-PYRAMID-5, clean checkout; BR-PYRAMID-6, no font value coined; BR-PYRAMID-7, served requests are files; `noindex` on every page.

**Décision (autonome):** the budget for this story is zero function invocations and no credit spent outside a deliberate production deploy.

**Rationale:** both are verifiable on the deploy summary, and both keep the team's other sites safe from a paused account.

---

## 9. External Dependencies

- `@tanstack/react-start` 1.168.x — framework, router, prerender. New.
- `@tanstack/start-static-server-functions` 1.167.x — the data channel. New, experimental.
- vite 8 with `@vitejs/plugin-react` 6. New in the site; the repository keeps vite 6 for `apps/robusta`.
- `@tailwindcss/vite` 4.3 — replaces `@tailwindcss/postcss`.
- `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, `@fontsource/caveat` 5.3 — replace `next/font`.
- vitest within the range of the site's vite.
- Netlify: a site under the Free team, `_redirects`, Pretty URLs, the build image reading `.nvmrc` and `yarnPath`.
- Not taken: `@netlify/vite-plugin-tanstack-start` (OQ-TANSTACK-6), Netlify Image CDN (OQ-TANSTACK-4).
- Removed from the site: `next`, `@tailwindcss/postcss`.

**Décision (autonome):** the TanStack packages are declared at one exact version and move together.

**Rationale:** the static-functions package peers on `@tanstack/react-start ^1.168.60`, the family releases several times a week, and its data channel is experimental.

---

## 10. Major Risks

1. Static server functions are experimental, and their client branch throws on a missing payload. Mitigation: exact versions, AC-TANSTACK-2 walked on the preview, the fallback named in Gap-TANSTACK-5.
2. The not-found page may hydrate into an empty page at an unknown URL (TanStack/router#5427, closed by a rewrite with no documented option). Mitigation: edge case 1 checked on the first branch deploy, before anything else is asked of the preview.
3. Two Vite majors in one tree: TanStack Start needs vite 7 or later, the React plugin needs 8, `apps/robusta` declares 6 and the root hoists 6.4.3 with vitest 3.0.6 — the defect class unblock-build fixed, a plugin binding to the hoisted copy. Mitigation: the site declares `vite` and a matching `vitest`; the green set and robusta's 42 pages are the check.
4. Netlify and yarn 4: a documented `YARN_FLAGS` default yarn 4 rejects, and Corepack driven by `packageManager`. Mitigation: the first branch deploy proves the install; `YARN_FLAGS` is set explicitly if it fails; the committed `.cjs` loads under any launcher.
5. Typed links: the router's `Link` is typed by route and params, while `buildUrl` is the single URL builder of the scheme (BR-PYRAMID-1). Mitigation: one site-level seam takes a built URL; a second builder is the drift seo-url-scheme removed.
6. Undocumented host behaviours — lowercase redirection, the Pretty URLs status, `.html` duplicates. Mitigation: the preview script of the URL hygiene feature records them in the README.
7. Sequencing: two designs wait on this story (Dep 3). Mitigation: scope held to the HTTP contract.

**Décision (autonome):** risks 2, 3 and 4 are retired on a first branch deploy of a minimal port — root route, one article route, `_redirects` — before the remaining routes are ported.

**Rationale:** the three fail on the host or the install, never in a local build, which is how the six failed Vercel deployments of 2026-08-01 went unnoticed.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Packages of app `@robusta/robusta-build`. No loop.

                  package `routes` [new]
          ┌──────────────────┼──────────────────────┐
          │ library          │ library              │ library
          ↓                  ↓                      ↓
  package `article`  package `landing`  package `page-data` [new]
  [modified]         [modified]             │               │
                                            │ library       │ library
                                            ↓               │
                                   package `routing`        │
                                            │               │
                                            │ library       │
                                            ↓               │
                                   package `content` ←──────┘
  `routes` also reads the scheme from `routing`, arrow omitted.
```

Kept as they are: packages `content` (`article-index`, `article-lookup`, `corpus`) and `routing` (`scheme`, `content-urls`, `v1-url-map`), `ArticleProse` and its CSS Module, `seopyramids.config.ts`, `globals.css` and the token bridge, `copy-article-images.mjs`, the 38 specs. Replaced: `src/app/**` by package `routes`; `next.config.ts` by `vite.config.ts`, `netlify.toml` and the emitted `_redirects`; `postcss.config.mjs` by `@tailwindcss/vite`. Deleted: `src/middleware.ts`, `src/app/learn/[...path]/route.ts`. The library APIs of the three base packages do not change.

### HTTP API of app `@robusta/robusta-build` — modified

Client code: browsers and crawlers. Served by Netlify from the client output alone (OQ-TANSTACK-6).

- `GET /` and every URL of `urlSet` — 200, the prerendered `.html` file, `noindex`
- `GET /__tsr/staticServerFnCache/{hash}.json` · new — 200, the data a hydrated page reads on client navigation
- `GET /article-images/{path}` — 200, case-significant
- `GET` a page URL with a trailing slash — 301 to the form without, answered by Pretty URLs · was 308
- `GET` an explicit page one or a marked default locale — 301, a rule of `_redirects` · was 308
- `GET` a v1 address of a permanent row — 301, a rule of `_redirects`
- `GET /learn/{path}` no row claims — 404, not-found page · was 410
- `GET` a page URL carrying an uppercase letter — 404, or the host's redirect to the lowercase form · was the middleware's 308
- any other `GET` — 404, the not-found page `/404.html`

No path runs code: there is no `/_serverFn/*` endpoint and no function.

### library API of package `page-data` in app `@robusta/robusta-build` — new

Client code: package `routes`, from route loaders.

- server function `getArticlePage` · new — everything one article page renders: entry, body, cover URL, category URL, other-locale URL
- server function `getNotesFeed` · new — the posts the notes section lists; takes over `notesFeed` from package `landing`

Both carry `staticFunctionMiddleware`: they run at build, and the client reaches their results as files. The one path from the client bundle to the corpus's data.

### library API of package `routes` in app `@robusta/robusta-build` — new

Client code: TanStack Start, which mounts the route tree.

- root route · new — the document shell: `<html lang>` from the matched locale, `noindex`, the three stylesheets in order, the three faces, the not-found component
- twelve content routes · new — one per shape of the scheme and its `l/$locale` mirror; an article route's loader calls `getArticlePage`, a listing route renders `RoutePlaceholder`
- home route and locale landing · new — the home loader calls `getNotesFeed`
- not-found route · new — prerendered once, to `/404.html`

### library API of package `article` in app `@robusta/robusta-build` — modified

- `ArticleView` · modified — renders one article page from the data its route loaded; reads nothing, imports nothing from `content` or `routing`

### library API of package `landing` in app `@robusta/robusta-build` — modified

- `NotesSection` · modified — renders the posts it receives
- `notesFeed` · moved to package `page-data`

### CLI API of app `@robusta/robusta-build` — modified

Client code: the root scripts `yarn build:robusta-build` and `yarn dev:robusta-build`, unchanged, and Netlify's build.

- `build` — `emit:redirects`, which now also writes `public/_redirects`; `copy:assets`; `vite build` with prerender; the route-table check on the written `.html` files. Exit 1 on a corpus violation or a route-table difference.
- `dev` — `emit:redirects`, `copy:assets`, `vite dev`.
- `test` — unchanged.
- `start` · replaced by `preview`, `vite preview` over the build; `lint` · `next lint` replaced by eslint over `src`.

---

## Next Steps

- Nicolas arbitrates Gap-TANSTACK-5, OQ-TANSTACK-6 and OQ-TANSTACK-7, directly or through `bulkman refresh`.
- `storyman refine tanstack-start-migration`: fold OQ-TANSTACK-1 to 4, the Corrections for the story, the AC rewordings and edge cases 1 to 6.
- Before the first line of code: screenshots of `/` and the eleven articles at 375, 768 and 1280 on the Next build, the reference AC-TANSTACK-3 compares against.
- Nicolas creates the Netlify site under the Free team (Dep 2), with the settings OQ-TANSTACK-7 settles.
- `designman` writes `tanstack-start-migration.design.md` from the story and this brainstorm; the minimal port of Axis 10 is its first group of requirements.
