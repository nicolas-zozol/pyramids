/**
 * Package corpus-reader — the reading contract of the v2 base: a corpus a site
 * declares, read into an article index, its bodies and its assets.
 *
 * Design: features/pyramid-v2-epic/__done/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-01, R-MULTILINGUAL-02, R-MULTILINGUAL-05, R-MULTILINGUAL-81, R-MULTILINGUAL-82, R-MULTILINGUAL-83, R-MULTILINGUAL-84, R-MULTILINGUAL-85
 * Design: features/pyramid-v2-epic/__done/content-source/content-source.design.md
 * Requirements: R-CONTENTSOURCE-01, R-CONTENTSOURCE-03, R-CONTENTSOURCE-04, R-CONTENTSOURCE-05, R-CONTENTSOURCE-06, R-CONTENTSOURCE-07, R-CONTENTSOURCE-08, R-CONTENTSOURCE-09, R-CONTENTSOURCE-21, R-CONTENTSOURCE-22, R-CONTENTSOURCE-23, R-CONTENTSOURCE-24, R-CONTENTSOURCE-41, R-CONTENTSOURCE-42, R-CONTENTSOURCE-43, R-CONTENTSOURCE-44, R-CONTENTSOURCE-45, R-CONTENTSOURCE-46, R-CONTENTSOURCE-47, R-CONTENTSOURCE-48
 * Design: features/pyramid-v2-epic/__done/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-21, R-MIGRATELEARN-22, R-MIGRATELEARN-23, R-MIGRATELEARN-28, R-MIGRATELEARN-29, R-MIGRATELEARN-82
 * Design: features/pyramid-v2-epic/__done/article-page/article-page.design.md
 * Requirements: R-ARTICLEPAGE-07, R-ARTICLEPAGE-21, R-ARTICLEPAGE-26, R-ARTICLEPAGE-27
 * Design: features/pyramid-v2-epic/__done/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-101
 * Design: features/pyramid-v2-epic/__done/retire-robusta-v1/retire-robusta-v1.design.md
 * Requirements: R-RETIREV1-41, R-RETIREV1-42, R-RETIREV1-61
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
} from './contract.ts';

export { articleSlug } from './article-slug.ts';
export { resolveAssetUrl } from './asset-reference.ts';
export { copyCorpusAssets } from './copy-corpus-assets.ts';
export { describeTranslationNotice } from './describe-translation-notice.ts';
export { describeViolation } from './describe-violation.ts';
export { readArticleBody } from './read-article-body.ts';
export { readCorpus } from './read-corpus.ts';
