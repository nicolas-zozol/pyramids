import { describe, expect, it } from 'vitest';
import { LOCALES } from '../routing/scheme.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';
import { landingHead } from './index.ts';

const ORIGIN = 'https://www.robusta.build';

// R-SEOEXCELLENCE-01, 02, 04 and 64; AC-SEOEXCELLENCE-1 and 4.
describe('landingHead', () => {
  it('declares the landing head of the Locale, indexable, canonical to itself', () => {
    for (const locale of LOCALES) {
      const { title, description } = getPageCopy(locale).landing.head;
      const head = landingHead(locale);

      expect(head.meta.slice(0, 2)).toEqual([
        { title },
        { name: 'description', content: description },
      ]);
      expect(head.links[0]).toEqual({
        rel: 'canonical',
        href: locale === 'en' ? `${ORIGIN}/` : `${ORIGIN}/${locale}`,
      });
    }
  });

  it('names the three landing pages as versions, with an x-default on /', () => {
    expect(
      landingHead('es')
        .links.filter((link) => link.rel === 'alternate')
        .map((link) => [link.hrefLang, link.href]),
    ).toEqual([
      ['en', `${ORIGIN}/`],
      ['fr', `${ORIGIN}/fr`],
      ['es', `${ORIGIN}/es`],
      ['x-default', `${ORIGIN}/`],
    ]);
  });

  it('declares Robusta Build as an Organization, with the contact the page shows, and no local business', () => {
    const { siteName, contact } = getSeoPyramidsConfig();
    const data = landingHead('fr').scripts.map((script) =>
      JSON.parse(script.children),
    );

    expect(data).toEqual([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: `${ORIGIN}/fr`,
        email: contact.email,
        sameAs: [contact.linkedIn],
      },
    ]);
  });

  it('shares no image', () => {
    expect(
      landingHead('en').meta.some(
        (tag) => 'property' in tag && tag.property === 'og:image',
      ),
    ).toBe(false);
  });
});
