# Roadmap

Priority-ordered list of what is left to build. The epic `features/pyramid-v2-epic/pyramid-v2.epic.md` holds the reasoning; this file holds the order. An item becomes a story under `features/pyramid-v2-epic/<feature>/` when work starts on it.

Bootstrapped on 2026-07-29 by `/start` from the epic and from the flags left by the packagify-design-system work.

## Done

- packagify-design-system — `packages/robusta-design-system` turned into the `@robusta/pyramids-design-system` workspace: 6 primitives, 8 marketing surfaces, exports map for CSS and assets. Delivered on `feat/packagify-design-system`, not yet on `dev`.

## Next

1. merge-design-system — bring `feat/packagify-design-system` onto `dev`. One commit, `6fb8d72`. Everything below that touches components depends on it.
2. unblock-build — fix the two failures recorded during the design-system work: `pyramids-links` needs `next` as a peer dependency, and `next build` of `apps/robusta` crashes a worker during static generation. Blocks any end-to-end verification of the v2 site.
3. bootstrap-robusta-build — create `apps/robusta-build`, the v2 site, wired to the design system and to the shared packages. Depends on 1 and 2.
4. seo-url-scheme — the simplified route scheme: `/blog/c/{category}`, `/l/{locale}/` for non-default locales, pagination as query parameters (`?page=12&size=20`), `articles` in place of `learn`. Carries BR-PYRAMID-1. Depends on 3.
5. content-source — decide how articles reach the site and settle the open point of the epic: whether the server rebuilds from markdown too often. Depends on 3.
6. robusta-landing-page — the landing page built from the design system, reusing the existing pitch content, without the obsolete resume. Depends on 3.
7. migrate-learn-content — move the articles of `apps/robusta/public/learn` onto the v2 site. Images from `public/images` are presumed unnecessary — confirm before dropping them. Depends on 4 and 5.
8. seo-excellence — metadata, sitemap, structured data, internal linking. Deliberately not aggressive. Depends on 4 and 7.

## Loose ends

- font-stack-mismatch — the design system's README claims Caveat / Kalam / Architects Daughter / JetBrains Mono, its CSS imports IBM Plex Sans / Plex Mono / Caveat. One of the two must give. A content decision, left to the author.
- vectorize-wordmark — `robusta-build-wordmark.png` is 1603×312. A vector version would scale and weigh less.
- dedupe-crystal-tux — `crystal-tux.png` and `crystal-tux.svg` are the same illustration twice.
- retire-robusta-design — `apps/robusta-design` is the v0 prototype, superseded by the design system package.
- retire-robusta-v1 — what becomes of `apps/robusta` once the v2 site serves the same content.
