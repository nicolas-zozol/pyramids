import { describe, expect, it } from 'vitest';
import type { CorpusViolation } from './contract.js';
import { describeViolation } from './describe-violation.js';

/**
 * R-CONTENTSOURCE-09: every message about an article names the file a publisher
 * has to open. The corpus root violation names the path the reader looked for
 * (AC-CONTENTSOURCE-47), which is what a build run from the wrong working
 * directory needs said.
 */
const VIOLATIONS: readonly [CorpusViolation, string][] = [
  [
    { code: 'missing-corpus-root', root: '/repo/apps/robusta-build/content/articles' },
    '/repo/apps/robusta-build/content/articles',
  ],
  [
    {
      code: 'unreadable-frontmatter',
      path: 'blockchain/ledger.md',
      detail: 'unexpected end of the stream',
    },
    'blockchain/ledger.md',
  ],
  [
    { code: 'missing-field', path: 'blockchain/ledger.md', field: 'title' },
    'blockchain/ledger.md',
  ],
  [
    { code: 'malformed-date', path: 'web/sonoff.md', date: '20/01/2022' },
    'web/sonoff.md',
  ],
  [
    { code: 'non-boolean-published', path: 'theory/langage.md', value: 'true' },
    'theory/langage.md',
  ],
  [
    {
      code: 'duplicate-translation-id',
      path: 'javascript/gatsby.md',
      translationId: 'gatsby-next',
      locale: 'fr',
    },
    'javascript/gatsby.md',
  ],
];

describe('describeViolation', () => {
  for (const [violation, named] of VIOLATIONS) {
    it(`names '${named}' when describing ${violation.code}`, () => {
      expect(describeViolation(violation)).toContain(named);
    });
  }

  it('says which field is missing, not only that one is', () => {
    expect(
      describeViolation({ code: 'missing-field', path: 'a.md', field: 'excerpt' }),
    ).toContain('excerpt');
  });

  it('quotes the value a non-boolean `published` carries', () => {
    expect(
      describeViolation({ code: 'non-boolean-published', path: 'a.md', value: 'true' }),
    ).toContain("'true'");
  });

  it('describes every violation the contract declares', () => {
    for (const [violation] of VIOLATIONS) {
      expect(describeViolation(violation).length).toBeGreaterThan(20);
    }
  });
});
