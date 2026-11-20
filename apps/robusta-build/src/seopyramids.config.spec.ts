import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { getArticleIndex } from './content/article-index.ts';
import {
  LOCALES,
  SITE_ORIGIN,
  urlScheme,
  type Locale,
} from './routing/scheme.ts';
import {
  getCategoryLabel,
  getPageCopy,
  getSeoPyramidsConfig,
  type FlowCopy,
  type PageCopy,
} from './seopyramids.config.ts';

const AGENT_WORDS =
  /\b(epicman|storyman|bsman|designman|tddman|codeman|docman|archiman|boss|rloq|DRAFT|APPROVED)\b/g;
const DIAGRAMS = ['agents', 'boss'] as const;

describe('the scheme of the site', () => {
  it('declares en by default, then fr and es, under the content root articles and a roll of twelve, and the page of RB Compound', () => {
    expect(urlScheme).toEqual({
      contentRoot: 'articles',
      defaultLocale: 'en',
      otherLocales: ['fr', 'es'],
      rollSize: 12,
      products: ['rb-compound'],
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

// R-SEOEXCELLENCE-121, 122 and 44.
describe('the SEO of the Site configuration', () => {
  it('declares no mandatory keyword', () => {
    expect(getSeoPyramidsConfig().blogConfig).not.toHaveProperty(
      'mandatoryKeywords',
    );
  });

  it('reads its domain from the origin of the scheme', () => {
    expect(getSeoPyramidsConfig().domain).toBe(SITE_ORIGIN);
  });

  it('titles the Related articles, prefixes the update date and names the breadcrumb in each Locale', () => {
    const texts = (locale: Locale) => {
      const { article, breadcrumb } = getPageCopy(locale);
      return [article.relatedTitle, article.updatedPrefix, breadcrumb.navLabel];
    };

    expect(texts('en')).toEqual([
      'Related articles',
      'Updated on',
      'Breadcrumb',
    ]);
    expect(texts('fr')).toEqual([
      'Articles liés',
      'Mis à jour le',
      "Fil d'Ariane",
    ]);
    expect(texts('es')).toEqual([
      'Artículos relacionados',
      'Actualizado el',
      'Ruta de navegación',
    ]);
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

  it('gives each Locale a listing head model per kind of listing page, the Category one carrying {category}, the page suffix {page}', () => {
    for (const locale of LOCALES) {
      const { head } = getPageCopy(locale).listing;

      expect(head.category.title, locale).toContain('{category}');
      expect(head.category.description, locale).toContain('{category}');
      expect(head.pageSuffix, locale).toContain('{page}');
      for (const text of [head.blogHome.title, head.blogHome.description])
        expect(text, locale).not.toMatch(/\{(category|page)\}/);
    }
  });

  it('writes the listing head models of each Locale apart from those of every other Locale and from its other heads', () => {
    const models = LOCALES.flatMap((locale) => {
      const { head, listing } = getPageCopy(locale);
      return [
        listing.head.blogHome.title,
        listing.head.blogHome.description,
        listing.head.category.title,
        listing.head.category.description,
      ].filter((model) => model !== head.title && model !== head.description);
    });

    expect(models).toHaveLength(LOCALES.length * 4);
    expect(new Set(models).size).toBe(models.length);
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

describe('the copy of the landing page and of the page of RB Compound in every Locale', () => {
  it('speaks to teams building software with AI agents, no copy for the SMEs of Toulouse left', () => {
    const copy = getSeoPyramidsConfig().pageCopy;

    expect(strings(copy).join('\n')).not.toMatch(
      /PME|Haute-Garonne|sur place|Renault|BCG|startups?/i,
    );
    for (const locale of LOCALES)
      for (const page of [
        getPageCopy(locale).landing,
        getPageCopy(locale).rbCompound,
      ])
        expect(page.hero, locale).not.toHaveProperty('note');
  });

  it('draws each diagram in six steps at most, numbered from one', () => {
    for (const locale of LOCALES)
      for (const diagram of DIAGRAMS) {
        const { steps } = getPageCopy(locale).rbCompound[diagram];

        expect(steps.length).toBeGreaterThan(0);
        expect(steps.length).toBeLessThanOrEqual(6);
        expect(steps.map((step) => step.n)).toEqual(
          steps.map((_, index) => index + 1),
        );
      }
  });

  it('keeps the agent names, DRAFT, APPROVED and rloq as they are, in the same places, in the three Locales', () => {
    const reference = getPageCopy(urlScheme.defaultLocale).rbCompound;

    for (const locale of LOCALES)
      for (const diagram of DIAGRAMS)
        expect(
          agentWords(getPageCopy(locale).rbCompound[diagram]),
          locale,
        ).toEqual(agentWords(reference[diagram]));
  });

  it('presents the six agents of RB Compound, one step each, then runs them on an example epic', () => {
    const { agents } = getPageCopy('en').rbCompound;
    const six = [
      'epicman',
      'storyman',
      'bsman',
      'designman',
      'tddman',
      'docman',
    ];

    expect(agents.title).toMatch(/^six agents\b/);
    expect(agents.steps.map((step) => step.label)).toEqual(six);
    expect(agents.intro).toMatch(/^RB Compound\b/);
    expect(agents.example?.lines.map((line) => line.agent)).toEqual([
      'epicman',
      'bsman',
      'storyman',
      'designman',
      'tddman',
      'docman',
      'storyman',
    ]);
    expect(agentWords(agents)).not.toContain('boss');
    expect(agents.caveat).toMatch(/PolyForm Noncommercial 1\.0\.0/);
    expect(agents.caveat).not.toMatch(/open source/);
    expect(agents.caveatLink?.href).toBe(
      'https://github.com/robusta-build/rb-compound',
    );
  });

  it('frames the six agents with boss, runs the example epic in two commands, and comes with a paid accompaniment only', () => {
    const { agents, boss } = getPageCopy('en').rbCompound;

    expect(boss.conductor).toBe('boss');
    expect(boss.steps.map((step) => step.label)).toEqual(
      agents.steps.map((step) => step.label),
    );
    expect(boss.example?.lines.map((line) => line.agent)).toEqual([
      'epicman',
      'boss',
    ]);
    expect(boss.caveat).toMatch(/\bpaid\b/);
    expect(boss.caveat).toMatch(/accompaniment/);
  });

  it('shows two open questions in every Locale, one taken with lgtm and one answered in the reader’s words', () => {
    for (const locale of LOCALES) {
      const { entries, labels } = getPageCopy(locale).rbCompound.openQuestions;

      expect(labels, locale).toEqual({
        proposition: 'Proposition:',
        rationale: 'Rationale:',
        resolution: 'Resolution:',
      });
      expect(
        entries.map((entry) => entry.key),
        locale,
      ).toEqual(['OQ-BENCH-2', 'OQ-BENCH-3']);
      expect(entries[0]?.resolution, locale).toBe('lgtm');
      expect(entries[1]?.resolution, locale).not.toBe('lgtm');
    }
  });

  it('presents the two products, Masala Parser and the workshop on the landing page, and says open source of Masala Parser alone', () => {
    for (const locale of LOCALES) {
      const { landing, rbCompound } = getPageCopy(locale);

      expect(landing.products.rooftop.name, locale).toBe('Rooftop');
      expect(landing.products.rbCompound.name, locale).toBe('RB Compound');
      expect(landing.hero.lede, locale).toContainEqual({
        strong: 'RB Compound',
      });
      expect(landing.hero.lede, locale).toContainEqual({ strong: 'Rooftop' });
      expect(Object.keys(landing.masala.meanings), locale).toEqual([
        'C',
        'N',
        'F',
        'then',
        'or',
        'rep',
        'opt',
        'map',
      ]);
      expect(landing.masala.eyebrow, locale).toMatch(/open source/);
      expect(
        strings({ ...landing, masala: {} }).join('\n') +
          strings(rbCompound).join('\n'),
        locale,
      ).not.toMatch(/open source/i);
    }
  });

  it('gives the page of RB Compound a title and a description apart from those of the landing page', () => {
    for (const locale of LOCALES) {
      const { landing, rbCompound } = getPageCopy(locale);

      expect(rbCompound.head.title, locale).not.toBe(landing.head.title);
      expect(rbCompound.head.description, locale).not.toBe(
        landing.head.description,
      );
    }
  });

  it('states the same four rules of the workflow in every Locale', () => {
    for (const locale of LOCALES)
      expect(
        getPageCopy(locale).rbCompound.principles.principles,
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
