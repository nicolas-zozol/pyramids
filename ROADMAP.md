# Roadmap

Priority-ordered list of what is left to build. The epic `features/pyramid-v2-epic/pyramid-v2.epic.md` holds the reasoning; this file holds the order. An item becomes a story under `features/pyramid-v2-epic/<feature>/` when work starts on it.

Bootstrapped on 2026-07-29 by `/start` from the epic and from the flags left by the packagify-design-system work.

## Done

- packagify-design-system — `packages/robusta-design-system` turned into the `@robusta/pyramids-design-system` workspace: 6 primitives, 8 marketing surfaces, exports map for CSS and assets.
- merge-design-system — brought onto `dev` on 2026-07-30 as `c0f98fe`, with its slot in `build:deps` between themes and layouts.
- unblock-build — the two failures recorded during the design-system work, both declaration defects rather than code defects. `pyramids-links` failed `tsc` for want of a `next` peer dependency; `next build` of `apps/robusta` crashed a worker because two React copies coexisted. Every workspace now converges on React 19.1.1 stable. The repository moved to yarn 4.17.1 on Node 22 in the same pass, and `@robusta/imagine` was dropped. Landed 2026-07-31 as `d9199ad`.
- bootstrap-robusta-build — `apps/robusta-build`, the v2 site, as a deployable shell: 4/4 static pages, in the green set, the design system as its only workspace dependency at the time, Tailwind 4 with a token bridge that aliases and never coins, three self-hosted faces and no third-party request. It carries no page copy. Landed 2026-07-31 as `84c3587`. `@robusta/pyramids-routing` became a second workspace dependency later the same day, with seo-url-scheme.
- seo-url-scheme — the v2 URL scheme: the discriminants `l`, `c`, `p` and a reserved `t` under the site-named content root `articles`, held by the new `@robusta/pyramids-routing` package (no dependency, first in `build:deps`, 78 tests); fourteen route files taking `apps/robusta-build` from 4 to 62 static pages over a fixture corpus; and the v1 mapping at 99 rows — 83 permanent, 6 gone, 10 none. Every page is a `RoutePlaceholder` and every redirect is dormant until retire-robusta-v1. Landed 2026-07-31 as `acfbc0a`.

## Next

1. content-source — decide how articles reach the site and settle the open point of the epic: whether the server rebuilds from markdown too often. Nothing blocks it. The measurement closed the open point and the reader shipped on 2026-07-31 as `82c154f` — `@robusta/pyramids-content`, second package of the v2 base, 67 tests, wired into the v2 site in place of the fixture articles. Not landed: `content/articles` stays empty until 4 fills it, so the site builds 5 static pages and the generated v1 map is down to 68 rows.
2. design-system-responsive — the design system has no responsive behaviour at all: no `@media`, no `clamp()`, no viewport unit in any of the eight marketing surfaces, and inline layout a consuming site cannot override without `!important`. Its CTAs render an `<a>` inside a `<button>`, which is invalid HTML and a WCAG 4.1.2 failure. Both block a page meant for the public, so this comes before the landing page. Carries the missing error colour too: the design system ships no semantic danger value, which is why the v2 site's token bridge has no `--destructive`.
3. robusta-landing-page — the landing page built from the design system, reusing the existing pitch content, without the obsolete resume. Deletes the placeholder home page and lifts the site-wide `robots: noindex` the shell set. Inherits the notes section working from 4. Depends on 2.
4. migrate-learn-content — copy the 11 articles of `apps/robusta/content/blog` onto the v2 site, images and redirects included, and freeze the v1 tree the day the copy is taken. Article rendering left its scope on 2026-08-01 and became 5. Depends on 1; the URL scheme and the v1 mapping it consumes are delivered.
5. article-page — render an article as an article: title, date, body, cover, and the way out to its category and to its other locale. The eleven migrated articles answer 200 with a route placeholder until this lands, and no other story owns the page. Depends on 4 for the corpus and the images. Story: `features/pyramid-v2-epic/article-page/article-page.story.md`.
6. seo-excellence — metadata, sitemap, structured data, internal linking. Deliberately not aggressive. Depends on 4 and 5: there is nothing to index before the articles are on the site, and an article page rendering a placeholder carries no content of its own.

The v2 site deploys from the Vercel project `robusta-build-v2`, created 2026-07-31 and separate from the project serving robusta.build. Its settings live in `apps/robusta-build/README.md`; the first deployment is what confirms them.

`ENABLE_EXPERIMENTAL_COREPACK=1` has to be set on every Vercel project of this repository before `dev` reaches `main`. `yarn.lock` is a yarn 4 lockfile (`__metadata: version 10`) and Vercel otherwise installs with its bundled yarn 1, which cannot read it. Set on `robusta-build-v2`; still owed by the projects serving robusta.build and dakar.surf.

Two settings, not one: each project's Node Version must also read 22.x. `robusta-build-v2` is on 24.x, where yarn 4.17.1 cannot start at all, and `engines.node` in the manifest does not override it — verified on 2026-08-01 with both a range and `"22.x"`. That is why the v2 site has never deployed: four attempts, four errors. The setting is dashboard-side and no commit can fix it.

## Loose ends

- font-stack-readme — the design system's README still claims Caveat / Kalam / Architects Daughter / JetBrains Mono while its CSS imports IBM Plex Sans / Plex Mono / Caveat. The epic settled this on 2026-07-29: the README yields, the CSS is right. Never applied.
- vectorize-wordmark — `robusta-build-wordmark.png` is 1603×312. A vector version would scale and weigh less.
- dedupe-crystal-tux — `crystal-tux.png` and `crystal-tux.svg` are the same illustration twice.
- retire-robusta-design — `apps/robusta-design` is the v0 prototype, superseded by the design system package.
- retire-robusta-v1 — what becomes of `apps/robusta` once the v2 site serves the same content. Carries the unwiring of the three packages the shadcn decision deprecates: `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` all render DaisyUI classes, and only the v1 sites consume them. Deletes the frozen `apps/robusta/content/blog` rather than merging it back, migrate-learn-content having copied it rather than moved it. Also carries turning on the v1 redirects, which ship dormant with seo-url-scheme and go live only once robusta-landing-page has lifted the site-wide `noindex`; the published-declaration condition of 2026-07-31 is discharged since all eleven articles declare themselves published.
- scribe-intel-does-not-compile — `packages/scribe-intel` and `services/scribe-intel-collector` fail `tsc` on source defects that predate the unblock-build work. Both sit outside the green set, so nothing gates on them today.
