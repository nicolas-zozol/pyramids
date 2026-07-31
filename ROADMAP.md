# Roadmap

Priority-ordered list of what is left to build. The epic `features/pyramid-v2-epic/pyramid-v2.epic.md` holds the reasoning; this file holds the order. An item becomes a story under `features/pyramid-v2-epic/<feature>/` when work starts on it.

Bootstrapped on 2026-07-29 by `/start` from the epic and from the flags left by the packagify-design-system work.

## Done

- packagify-design-system — `packages/robusta-design-system` turned into the `@robusta/pyramids-design-system` workspace: 6 primitives, 8 marketing surfaces, exports map for CSS and assets.
- merge-design-system — brought onto `dev` on 2026-07-30 as `c0f98fe`, with its slot in `build:deps` between themes and layouts.
- unblock-build — the two failures recorded during the design-system work, both declaration defects rather than code defects. `pyramids-links` failed `tsc` for want of a `next` peer dependency; `next build` of `apps/robusta` crashed a worker because two React copies coexisted. Every workspace now converges on React 19.1.1 stable. The repository moved to yarn 4.17.1 on Node 22 in the same pass, and `@robusta/imagine` was dropped. Landed 2026-07-31 as `d9199ad`.

## Next

1. bootstrap-robusta-build — create `apps/robusta-build`, the v2 site, wired to the design system and to the shared packages. Nothing blocks it.
2. seo-url-scheme — the simplified route scheme: `/articles/{slug}` when the article carries no category and `/articles/c/{category}/{slug}` when it does, `/articles/c/{category}` for a category, `/articles/p/{n}` for pagination as path segments, and `/l/{locale}` prefixing any of them. No sub-categories for now. Carries BR-PYRAMID-1. Depends on 1.
3. content-source — decide how articles reach the site and settle the open point of the epic: whether the server rebuilds from markdown too often. Depends on 1.
4. design-system-responsive — the design system has no responsive behaviour at all: no `@media`, no `clamp()`, no viewport unit in any of the eight marketing surfaces, and inline layout a consuming site cannot override without `!important`. Its CTAs render an `<a>` inside a `<button>`, which is invalid HTML and a WCAG 4.1.2 failure. Both block a page meant for the public, so this comes before the landing page.
5. robusta-landing-page — the landing page built from the design system, reusing the existing pitch content, without the obsolete resume. Depends on 1 and 4.
6. migrate-learn-content — move the 11 articles of `apps/robusta/content/blog` onto the v2 site, redirects included. Depends on 2 and 3.
7. seo-excellence — metadata, sitemap, structured data, internal linking. Deliberately not aggressive. Depends on 2 and 6.

## Loose ends

- font-stack-readme — the design system's README still claims Caveat / Kalam / Architects Daughter / JetBrains Mono while its CSS imports IBM Plex Sans / Plex Mono / Caveat. The epic settled this on 2026-07-29: the README yields, the CSS is right. Never applied.
- vectorize-wordmark — `robusta-build-wordmark.png` is 1603×312. A vector version would scale and weigh less.
- dedupe-crystal-tux — `crystal-tux.png` and `crystal-tux.svg` are the same illustration twice.
- retire-robusta-design — `apps/robusta-design` is the v0 prototype, superseded by the design system package.
- retire-robusta-v1 — what becomes of `apps/robusta` once the v2 site serves the same content. Carries the unwiring of the three packages the shadcn decision deprecates: `pyramids-layouts`, `pyramids-links` and `pyramids-ctas` all render DaisyUI classes, and only the v1 sites consume them.
- scribe-intel-does-not-compile — `packages/scribe-intel` and `services/scribe-intel-collector` fail `tsc` on source defects that predate the unblock-build work. Both sit outside the green set, so nothing gates on them today.
