/**
 * Package corpus-reader — the reading contract of the v2 base: a corpus a site
 * declares, read into an article index, its bodies and its assets.
 *
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-01, R-MULTILINGUAL-02, R-MULTILINGUAL-05, R-MULTILINGUAL-81, R-MULTILINGUAL-82, R-MULTILINGUAL-83, R-MULTILINGUAL-84, R-MULTILINGUAL-85, R-MULTILINGUAL-86
 * Design: features/pyramid-v2-epic/content-source/content-source.design.md
 * Requirements: R-CONTENTSOURCE-01, R-CONTENTSOURCE-03, R-CONTENTSOURCE-04, R-CONTENTSOURCE-05, R-CONTENTSOURCE-06, R-CONTENTSOURCE-07, R-CONTENTSOURCE-08, R-CONTENTSOURCE-09, R-CONTENTSOURCE-21, R-CONTENTSOURCE-22, R-CONTENTSOURCE-23, R-CONTENTSOURCE-24, R-CONTENTSOURCE-25, R-CONTENTSOURCE-41, R-CONTENTSOURCE-42, R-CONTENTSOURCE-43, R-CONTENTSOURCE-44, R-CONTENTSOURCE-45, R-CONTENTSOURCE-46, R-CONTENTSOURCE-47, R-CONTENTSOURCE-48
 * Design: features/pyramid-v2-epic/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-21, R-MIGRATELEARN-22, R-MIGRATELEARN-23, R-MIGRATELEARN-28, R-MIGRATELEARN-29, R-MIGRATELEARN-82
 * Design: features/pyramid-v2-epic/article-page/article-page.design.md
 * Requirements: R-ARTICLEPAGE-07, R-ARTICLEPAGE-21, R-ARTICLEPAGE-26, R-ARTICLEPAGE-27
 */
export type {
  ArticleBody,
  ArticleEntry,
  AssetSpec,
  CorpusRead,
  CorpusSpec,
  CorpusViolation,
  LocaleSource,
  OriginalDeclaration,
  TranslationNotice,
} from './contract.js';

export { articleSlug } from './article-slug.js';
export { resolveAssetUrl } from './asset-reference.js';
export { copyCorpusAssets } from './copy-corpus-assets.js';
export { describeTranslationNotice } from './describe-translation-notice.js';
export { describeViolation } from './describe-violation.js';
export { readArticleBody } from './read-article-body.js';
export { readCorpus } from './read-corpus.js';
