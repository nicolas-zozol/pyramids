import { describe, expect, it } from 'vitest';
import type { TranslationNotice } from './contract.ts';
import { describeTranslationNotice } from './describe-translation-notice.ts';

const STALE: TranslationNotice = {
  code: 'stale-translation',
  path: 'privacy/quitter-gmail.md',
  originalPath: 'privacy/leaving-gmail.md',
  fingerprint: '9c1e4a7b2d30',
};

const UNTRACKED: TranslationNotice = {
  code: 'untracked-pair',
  translationId: 'leaving-gmail',
  versions: [
    {
      path: 'privacy/leaving-gmail.md',
      locale: 'en',
      fingerprint: '9c1e4a7b2d30',
    },
    {
      path: 'privacy/quitter-gmail.md',
      locale: 'fr',
      fingerprint: '04f2aa61b7c8',
    },
  ],
};

const MISSING: TranslationNotice = {
  code: 'missing-original',
  path: 'privacy/quitter-gmail.md',
  translationId: 'leaving-gmail',
  locale: 'en',
};

describe('describeTranslationNotice', () => {
  it('names the stale translation, its original and the fingerprint to copy', () => {
    const line = describeTranslationNotice(STALE);

    expect(line).toContain('privacy/quitter-gmail.md');
    expect(line).toContain('privacy/leaving-gmail.md');
    expect(line).toContain("fingerprint: '9c1e4a7b2d30'");
  });

  it('names the translation identifier of an untracked pair, and each version with its fingerprint', () => {
    const line = describeTranslationNotice(UNTRACKED);

    expect(line).toContain("'leaving-gmail'");
    expect(line).toContain(
      "privacy/leaving-gmail.md (en) fingerprint: '9c1e4a7b2d30'",
    );
    expect(line).toContain(
      "privacy/quitter-gmail.md (fr) fingerprint: '04f2aa61b7c8'",
    );
  });

  it('names the translation whose original is missing, with the Locale and the translation identifier it declares', () => {
    const line = describeTranslationNotice(MISSING);

    expect(line).toContain('privacy/quitter-gmail.md');
    expect(line).toContain("locale 'en'");
    expect(line).toContain("'leaving-gmail'");
  });

  it('writes one line per notice', () => {
    for (const notice of [STALE, UNTRACKED, MISSING]) {
      expect(describeTranslationNotice(notice)).not.toContain('\n');
    }
  });
});
