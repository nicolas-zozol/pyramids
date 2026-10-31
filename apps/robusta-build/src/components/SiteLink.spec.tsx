import {
  SkButton,
  type SkLinkComponent,
} from '@robusta/pyramids-design-system';
import { describe, expect, it } from 'vitest';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { SiteLink } from './SiteLink.tsx';

describe('SiteLink', () => {
  it('renders the built URL as the anchor’s address, untouched', async () => {
    const html = await renderInRouter(
      <SiteLink href="/fr/articles/c/blockchain">blockchain</SiteLink>,
    );

    expect(html).toMatch(
      /<a [^>]*href="\/fr\/articles\/c\/blockchain"[^>]*>blockchain<\/a>/,
    );
  });

  it('carries the language of the page it targets', async () => {
    const html = await renderInRouter(
      <SiteLink href="/en/articles/c/web/a-slug" hrefLang="en" lang="en">
        English
      </SiteLink>,
    );

    expect(html).toMatch(/<a [^>]*hreflang="en"/i);
    expect(html).toMatch(/<a [^>]*lang="en"[^>]*>English<\/a>/);
  });

  it('serves as the design system’s link component, passing on the class a surface gives it', async () => {
    const linkComponent: SkLinkComponent = SiteLink;
    const html = await renderInRouter(
      <SkButton href="/en/articles" linkComponent={linkComponent}>
        articles
      </SkButton>,
    );

    expect(html).toMatch(
      /<a [^>]*class="sk-btn"[^>]*href="\/en\/articles"|<a [^>]*href="\/en\/articles"[^>]*class="sk-btn"/,
    );
  });

  it('renders a mailto: or https: address as a plain anchor to it', async () => {
    const html = await renderInRouter(
      <>
        <SiteLink href="mailto:nicolas@robusta.build">écrire</SiteLink>
        <SiteLink href="https://www.linkedin.com/in/robustacode/">
          profil
        </SiteLink>
      </>,
    );

    expect(html).toContain('href="mailto:nicolas@robusta.build"');
    expect(html).toContain('href="https://www.linkedin.com/in/robustacode/"');
  });

  it('marks the current page for assistive technology, adding no class of its own', async () => {
    const html = await renderInRouter(
      <SiteLink href="/en" className="sk-site-header__brand">
        accueil
      </SiteLink>,
      '/en',
    );

    expect(html).toMatch(/aria-current="page"/);
    expect(html).toMatch(/class="sk-site-header__brand"/);
  });

  it('does not mark a link to an ancestor of the current page as the current page', async () => {
    const html = await renderInRouter(
      <SiteLink href="/en/articles/c/blockchain">blockchain</SiteLink>,
      '/en/articles/c/blockchain/ledger-versus-metamask',
    );

    expect(html).toMatch(
      /<a href="\/en\/articles\/c\/blockchain">blockchain<\/a>/,
    );
    expect(html).not.toMatch(/aria-current|data-status|class="active"/);
  });
});
