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
 * are rows of the v1 mapping today, six of them answering Gone.
 *
 * The directory is empty until `migrate-learn-content` moves the eleven
 * articles of `apps/robusta/content/blog` into it. An empty corpus is a corpus
 * with no article, which the reader answers with an empty index; a corpus root
 * that does not exist is a violation and fails the build.
 */
export const corpus: CorpusSpec = {
  root: 'content/articles',
  localeFrom: 'frontmatter',
};
