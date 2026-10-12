import { describe, expect, it } from 'vitest';
import { wordmarkSrc } from '../design-system/assets.js';
import { urlScheme } from '../routing/scheme.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';
import { anchorsTo, hrefs, htmlText } from '../test-support/markup.js';
import { renderInRouter } from '../test-support/render-in-router.js';
import { Footer, Header } from './index.js';

const { contact, pageCopy } = getSeoPyramidsConfig();
const AN_ENGLISH_ARTICLE = '/l/en/articles/c/blockchain/ledger-versus-metamask';

describe('Header', () => {
  it('is the design system’s site header, its wordmark leading home through the router', async () => {
    const html = await renderInRouter(<Header />, AN_ENGLISH_ARTICLE);
    const [wordmark] = anchorsTo(html, '/');

    expect(html).toMatch(/<header class="sk-site-header"/);
    expect(wordmark).toContain('class="sk-site-header__brand"');
    expect(html).toContain(`src="${wordmarkSrc}"`);
  });

  it('carries the contact call to action, an email to Nicolas, and no navigation link', async () => {
    const html = await renderInRouter(<Header />);

    expect(hrefs(html)).toEqual(['/', `mailto:${contact.email}`]);
    expect(html).toContain(`>${htmlText(pageCopy.header.contactLabel)}<`);
    expect(html).not.toContain('sk-site-header__link');
  });

  it('declares the default Locale on a bare element around it, so an English page reads it in French', async () => {
    const html = await renderInRouter(<Header />, AN_ENGLISH_ARTICLE);

    expect(html).toMatch(
      new RegExp(
        `<div lang="${urlScheme.defaultLocale}"><header class="sk-site-header"`,
      ),
    );
  });
});

describe('Footer', () => {
  it('is the design system’s site footer with the tagline and the copyright, and no column', async () => {
    const html = await renderInRouter(<Footer />);

    expect(html).toMatch(/<footer class="sk-site-footer"/);
    expect(html).toContain(`>${htmlText(pageCopy.tagline)}<`);
    expect(html).toContain(`>${htmlText(pageCopy.footer.copyright)}<`);
    expect(html).not.toContain('sk-site-footer__col');
  });

  it('shows no version line', async () => {
    const html = await renderInRouter(<Footer />);
    const bottom =
      /class="sk-site-footer__bottom">([\s\S]*?)<\/div><\/footer>/.exec(
        html,
      )?.[1];

    expect(bottom).toBe(
      `<div>${htmlText(pageCopy.footer.copyright)}</div><div></div>`,
    );
  });

  it('declares the default Locale on a bare element around it', async () => {
    const html = await renderInRouter(<Footer />, AN_ENGLISH_ARTICLE);

    expect(html).toMatch(
      new RegExp(
        `<div lang="${urlScheme.defaultLocale}"><footer class="sk-site-footer"`,
      ),
    );
  });
});
