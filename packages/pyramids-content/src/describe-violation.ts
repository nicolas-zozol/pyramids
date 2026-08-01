import type { CorpusViolation } from './contract.js';

/**
 * One line per violation, naming the file a publisher has to open
 * (R-CONTENTSOURCE-09). The site turns these into the build failure; the base
 * never throws one itself (R-CONTENTSOURCE-47).
 */
export function describeViolation(violation: CorpusViolation): string {
  switch (violation.code) {
    case 'missing-corpus-root':
      return `the corpus root '${violation.root}' does not exist: the reader looked there and found no directory`;
    case 'unreadable-frontmatter':
      return `${violation.path}: the frontmatter cannot be read — ${violation.detail}`;
    case 'missing-field':
      return `${violation.path}: the article declares no ${violation.field}`;
    case 'malformed-date':
      return `${violation.path}: the date '${violation.date}' is not a YYYY-MM-DD calendar date`;
    case 'non-boolean-published':
      return `${violation.path}: 'published' carries '${violation.value}', which is not a boolean, so the article is neither published nor knowingly unpublished`;
    case 'duplicate-translation-id':
      return `${violation.path}: the translation identifier '${violation.translationId}' is carried by another published article of locale '${violation.locale}'`;
    case 'unresolved-asset':
      return `${violation.path}: the image reference '${violation.reference}' resolves to no file of the corpus, so the article would show a broken image`;
  }
}
