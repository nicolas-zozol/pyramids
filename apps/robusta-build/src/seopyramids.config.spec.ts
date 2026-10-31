import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { getArticleIndex } from './content/article-index.ts';
import { LOCALES, urlScheme, type Locale } from './routing/scheme.ts';
import {
  getCategoryLabel,
  getPageCopy,
  getSeoPyramidsConfig,
  type FlowCopy,
  type PageCopy,
} from './seopyramids.config.ts';

const AGENT_WORDS =
  /\b(epicman|storyman|bsman|designman|tddman|codeman|docman|archiman|boss|rloq|DRAFT|APPROVED)\b/g;
const DIAGRAMS = ['openSource', 'complete'] as const;

describe('the scheme of the site', () => {
  it('declares en by default, then fr and es, under the content root articles and a roll of twelve', () => {
    expect(urlScheme).toEqual({
      contentRoot: 'articles',
      defaultLocale: 'en',
      otherLocales: ['fr', 'es'],
      rollSize: 12,
    });
  });

  it('lists its three Locales default first, and types a Locale as one of them', () => {
    expect(LOCALES).toEqual(['en', 'fr', 'es']);
    expect([urlScheme.defaultLocale, ...urlScheme.otherLocales]).toEqual(
      LOCALES,
    );
    expectTypeOf<Locale>().toEqualTypeOf<'en' | 'fr' | 'es'>();
  });
});

describe('the Site configuration', () => {
  it('declares en by default, then fr and es', () => {
    const config = getSeoPyramidsConfig();

    expect(config.defaultLocale).toBe('en');
    expect(config.otherLocales).toEqual(['fr', 'es']);
  });

  it('reads its Locales from the scheme, at its root as in its blog configuration', () => {
    const config = getSeoPyramidsConfig();

    expect(config.defaultLocale).toBe(urlScheme.defaultLocale);
    expect(config.otherLocales).toEqual(urlScheme.otherLocales);
    expect(config.blogConfig.defaultLocale).toBe(urlScheme.defaultLocale);
    expect(config.blogConfig.otherLocales).toEqual(urlScheme.otherLocales);
  });

  it('holds no site title and no mission, the head of each Locale taking their place', () => {
    const config = getSeoPyramidsConfig();

    expect(config).not.toHaveProperty('siteTitle');
    expect(config).not.toHaveProperty('mission');
  });
});

describe('the contact of the Site configuration', () => {
  it('holds Nicolas’s email address and his LinkedIn profile as an https URL', () => {
    const { contact } = getSeoPyramidsConfig();

    expect(contact.email).toBe('nicolas@robusta.build');
    expect(contact.linkedIn).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
  });

  it('is the only place the email address is written in the page copy’s module', async () => {
    const source = await readFile(
      new URL('./seopyramids.config.ts', import.meta.url),
      'utf8',
    );

    expect(source.match(/nicolas@robusta\.build/g)).toHaveLength(1);
  });
});

describe('the page copy of the Site configuration', () => {
  it('holds one block per Locale, and no other', () => {
    const { pageCopy } = getSeoPyramidsConfig();

    expect(Object.keys(pageCopy)).toEqual([...LOCALES]);
    expectTypeOf(pageCopy).toEqualTypeOf<Record<Locale, PageCopy>>();
  });

  it('fails the typecheck on a missing Locale or a missing text', () => {
    const { en, fr } = getSeoPyramidsConfig().pageCopy;

    // @ts-expect-error a page copy without es
    const withoutEs: Record<Locale, PageCopy> = { en, fr };
    // @ts-expect-error a diagram without its caveat
    const withoutCaveat: FlowCopy = { eyebrow: 'e', title: 't', steps: [] };

    expect([withoutEs, withoutCaveat]).toHaveLength(2);
  });

  it('translates the default Locale section for section, lists and diagrams included', () => {
    const shape = (copy: PageCopy) => shapeOf({ ...copy, categoryLabels: {} });

    for (const locale of LOCALES)
      expect(shape(getPageCopy(locale)), locale).toEqual(
        shape(getPageCopy(urlScheme.defaultLocale)),
      );
  });

  it('is plain text: no markup, no class name, no empty string', () => {
    for (const text of strings(getSeoPyramidsConfig().pageCopy)) {
      expect(text).not.toMatch(/[<>]|className|\bsk-/);
      expect(text.trim()).not.toBe('');
    }
  });

  it('gives each landing page a title and a description apart from the head of the other pages', () => {
    for (const locale of LOCALES) {
      const { head, landing } = getPageCopy(locale);

      expect(landing.head.title, locale).not.toBe(head.title);
      expect(landing.head.description, locale).not.toBe(head.description);
    }
  });

  it('labels exactly the Categories the published articles of each Locale claim', async () => {
    const articles = await getArticleIndex();

    for (const locale of LOCALES) {
      const claimed = new Set(
        articles
          .filter((article) => article.locale === locale)
          .flatMap((article) =>
            article.category === undefined ? [] : [article.category],
          ),
      );

      expect(
        Object.keys(getPageCopy(locale).categoryLabels).sort(),
        locale,
      ).toEqual([...claimed].sort());
    }
  });

  it('leaves es without any label and en without theory', () => {
    expect(getPageCopy('es').categoryLabels).toEqual({});
    expect(getPageCopy('en').categoryLabels).not.toHaveProperty('theory');
  });

  it('is read through getPageCopy and getCategoryLabel alone', async () => {
    for (const [path, source] of await siteSources())
      expect(source, path).not.toMatch(/\.pageCopy\b|categoryLabels/);
  });
});

describe('the landing copy of every Locale', () => {
  it('speaks to teams building software with AI agents, no copy for the SMEs of Toulouse left', () => {
    const copy = getSeoPyramidsConfig().pageCopy;

    expect(strings(copy).join('\n')).not.toMatch(
      /PME|Haute-Garonne|sur place|Renault|BCG|startups?/i,
    );
    for (const locale of LOCALES)
      expect(getPageCopy(locale).landing.hero, locale).not.toHaveProperty(
        'note',
      );
  });

  it('draws each diagram in five steps at most, numbered from one', () => {
    for (const locale of LOCALES)
      for (const diagram of DIAGRAMS) {
        const { steps } = getPageCopy(locale).landing[diagram];

        expect(steps.length).toBeGreaterThan(0);
        expect(steps.length).toBeLessThanOrEqual(5);
        expect(steps.map((step) => step.n)).toEqual(
          steps.map((_, index) => index + 1),
        );
      }
  });

  it('keeps the agent names, DRAFT, APPROVED and rloq as they are, in the same places, in the three Locales', () => {
    const reference = getPageCopy(urlScheme.defaultLocale).landing;

    for (const locale of LOCALES)
      for (const diagram of DIAGRAMS)
        expect(
          agentWords(getPageCopy(locale).landing[diagram]),
          locale,
        ).toEqual(agentWords(reference[diagram]));
  });

  it('shows the open source version as the epic, the story, the design, its validation, then test-first code by tddman', () => {
    const { openSource } = getPageCopy('en').landing;

    expect(agentWords(openSource)).toEqual([
      'epicman',
      'storyman',
      'designman',
      'DRAFT',
      'APPROVED',
      'tddman',
    ]);
    expect(openSource.caveat).toMatch(/\bfree\b/);
    expect(openSource.caveat).toMatch(/not published yet/);
  });

  it('shows the complete version from the story to the documentation, chained by boss under rloq, with a paid accompaniment only', () => {
    const { complete } = getPageCopy('en').landing;

    expect(agentWords({ ...complete, caveat: '' })).toEqual([
      'storyman',
      'bsman',
      'designman',
      'APPROVED',
      'tddman',
      'codeman',
      'docman',
      'archiman',
    ]);
    expect(complete.caveat.match(AGENT_WORDS)).toEqual(['boss', 'rloq']);
    expect(complete.caveat).toMatch(/\bpaid\b/);
    expect(complete.caveat).toMatch(/accompaniment/);
  });

  it('states the same four rules of the workflow in every Locale', () => {
    for (const locale of LOCALES)
      expect(
        getPageCopy(locale).landing.principles.principles,
        locale,
      ).toHaveLength(4);
  });
});

describe('getPageCopy', () => {
  it('reads the page copy of each Locale the site declares', () => {
    const { pageCopy } = getSeoPyramidsConfig();

    for (const locale of LOCALES)
      expect(getPageCopy(locale)).toBe(pageCopy[locale]);
  });

  it('throws naming a Locale the site does not declare', () => {
    expect(() => getPageCopy('de')).toThrow(/"de"/);
    expect(() => getPageCopy('constructor')).toThrow(/"constructor"/);
  });
});

describe('getCategoryLabel', () => {
  it('reads the label of a Category in the page copy of a Locale', () => {
    const { pageCopy } = getSeoPyramidsConfig();

    expect(getCategoryLabel('fr', 'privacy')).toBe(
      pageCopy.fr.categoryLabels.privacy,
    );
    expect(getCategoryLabel('en', 'privacy')).toBe(
      pageCopy.en.categoryLabels.privacy,
    );
  });

  it('throws naming the Category and the Locale when that Locale has no label for it', () => {
    expect(() => getCategoryLabel('en', 'theory')).toThrow(
      /"theory"[\s\S]*"en"/,
    );
    expect(() => getCategoryLabel('es', 'web')).toThrow(/"web"[\s\S]*"es"/);
    expect(() => getCategoryLabel('en', 'toString')).toThrow(/"toString"/);
  });

  it('throws naming a Locale the site does not declare', () => {
    expect(() => getCategoryLabel('de', 'web')).toThrow(/"de"/);
  });
});

function agentWords(diagram: FlowCopy): string[] {
  return strings(diagram).flatMap((text) => text.match(AGENT_WORDS) ?? []);
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (typeof value === 'object' && value !== null)
    return Object.values(value).flatMap(strings);
  return [];
}

function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shapeOf);
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(
      Object.entries(value).map(([key, field]) => [key, shapeOf(field)]),
    );
  return typeof value;
}

async function siteSources(): Promise<[string, string][]> {
  const files = (await readdir('src', { recursive: true })).filter(
    (file) =>
      /\.tsx?$/.test(file) &&
      !/\.spec\.tsx?$/.test(file) &&
      file !== 'seopyramids.config.ts',
  );
  return Promise.all(
    files.map(
      async (file) =>
        [file, await readFile(join('src', file), 'utf8')] as [string, string],
    ),
  );
}
