import type { CorpusSpec } from '@robusta/pyramids-content';

/**
 * Where this site's articles live, declared as data (R-CONTENTSOURCE-22).
 *
 * A leaf module, for the same reason `src/routing/scheme.ts` is one:
 * `scripts/emit-redirects.mjs` reaches the article index outside the webpack
 * pipeline, and anything reachable from `seopyramids.config.ts` is out of its
 * reach because the site configuration resolves a bundler-only PNG. So the
 * corpus is declared here and `seopyramids.config.ts` reads it, never the other
 * way round.
 *
 * `content/articles` sits outside `public/` on purpose: v1 published its
 * markdown under `public/learn`, and the thirteen raw `.md` URLs that produced
 * are rows of the v1 mapping today, five of them answering Gone. An image has no
 * such problem — it is meant to be fetched — so the files the articles reference
 * are mirrored into `public/article-images` before the build starts, by
 * `scripts/copy-article-images.mjs`.
 *
 * The asset root is a segment of its own, outside the content section
 * (BR-PYRAMID-1): an image under `/articles/c/{category}/` would sit inside a
 * shape the URL scheme reserves for pages, and a site that has to look at the
 * filesystem to tell a page from a file is what that rule forbids. `publishDir`
 * is generated rather than committed, and the site's middleware excludes
 * `urlPrefix` because a filesystem is case-significant.
 */
export const corpus: CorpusSpec = {
  root: 'content/articles',
  localeFrom: 'frontmatter',
  assets: { publishDir: 'public/article-images', urlPrefix: '/article-images' },
};
