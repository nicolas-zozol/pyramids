import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkTranslations } from './check-translations.mjs';

const STALE = {
  code: 'stale-translation',
  path: 'privacy/quitter-gmail.md',
  originalPath: 'privacy/leaving-gmail.md',
  fingerprint: '9c1e4a7b2d30',
};
const MISSING = {
  code: 'missing-original',
  path: 'web/domotique-facile-avec-sonoff.md',
  translationId: 'easy-automation-with-sonoff',
  locale: 'en',
};

function contentOf(notices: { path: string }[]) {
  return {
    getArticleIndex: async () => [],
    getTranslationNotices: async () => notices,
    describeTranslationNotice: (notice: { path: string }) =>
      `notice on ${notice.path}`,
  };
}

describe('checkTranslations', () => {
  it('prints one line per notice, then their count, and exits 0', async () => {
    const result = await checkTranslations(contentOf([STALE, MISSING]));

    expect(result).toEqual({
      exitCode: 0,
      out: [
        'notice on privacy/quitter-gmail.md',
        'notice on web/domotique-facile-avec-sonoff.md',
        'translations: 2 notices',
      ],
      err: [],
    });
  });

  it('counts a single notice in the singular', async () => {
    const { out } = await checkTranslations(contentOf([STALE]));

    expect(out.at(-1)).toBe('translations: 1 notice');
  });

  it('says there is no notice, and exits 0', async () => {
    expect(await checkTranslations(contentOf([]))).toEqual({
      exitCode: 0,
      out: ['translations: no notice'],
      err: [],
    });
  });

  it('exits 1 on a corpus violation, printing what the article index threw', async () => {
    const result = await checkTranslations({
      ...contentOf([STALE]),
      getArticleIndex: async () => {
        throw new Error(
          'The article corpus breaks its schema:\n  - fr.md: the declaration of its original is malformed — it declares no translationId',
        );
      },
    });

    expect(result.exitCode).toBe(1);
    expect(result.out).toEqual([]);
    expect(result.err.join('\n')).toContain(
      'fr.md: the declaration of its original is malformed',
    );
  });
});

describe('the build', () => {
  it('runs check:translations once, after check:source and before emit:v1-map', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(process.cwd(), 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };
    const steps = manifest.scripts.build.split('&&').map((step) => step.trim());

    expect(manifest.scripts['check:translations']).toBe(
      'node scripts/check-translations.mjs',
    );
    expect(
      steps.filter((step) => step === 'yarn check:translations'),
    ).toHaveLength(1);
    expect(steps.indexOf('yarn check:translations')).toBe(
      steps.indexOf('yarn check:source') + 1,
    );
    expect(steps.indexOf('yarn emit:v1-map')).toBe(
      steps.indexOf('yarn check:translations') + 1,
    );
  });
});
