import { describe, expect, it } from 'vitest';
import { renderInRouter } from '../test-support/render-in-router.js';
import { SiteLink } from './SiteLink.js';

describe('SiteLink', () => {
  it('renders the built URL as the anchor’s address, untouched', async () => {
    const html = await renderInRouter(
      <SiteLink href="/l/fr/articles/c/blockchain">blockchain</SiteLink>,
    );

    expect(html).toMatch(
      /<a [^>]*href="\/l\/fr\/articles\/c\/blockchain"[^>]*>blockchain<\/a>/,
    );
  });

  it('carries the language of the page it targets', async () => {
    const html = await renderInRouter(
      <SiteLink href="/articles/c/web/a-slug" hrefLang="en" lang="en">
        English
      </SiteLink>,
    );

    expect(html).toMatch(/<a [^>]*hreflang="en"/i);
    expect(html).toMatch(/<a [^>]*lang="en"[^>]*>English<\/a>/);
  });
});
