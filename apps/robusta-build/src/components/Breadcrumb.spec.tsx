import { describe, expect, it } from 'vitest';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { Breadcrumb } from './Breadcrumb.tsx';

// R-SEOEXCELLENCE-62, 63 and 66.
describe('Breadcrumb', () => {
  it('renders the trail in a named nav, an ordered list, each crumb with a url a link, the others text of the current page', async () => {
    const html = await renderInRouter(
      <Breadcrumb
        label="Breadcrumb"
        trail={[{ label: 'articles', url: '/articles' }, { label: 'Privacy' }]}
      />,
    );

    expect(html).toMatch(
      /<nav aria-label="Breadcrumb"[^>]*><ol[^>]*><li><a href="\/articles">articles<\/a><\/li><li><span aria-current="page">Privacy<\/span><\/li><\/ol><\/nav>/,
    );
  });

  it('styles with values of the design system alone, and no class name', async () => {
    const html = await renderInRouter(
      <Breadcrumb
        label="Breadcrumb"
        trail={[{ label: 'articles', url: '/articles' }]}
      />,
    );
    const values = [...html.matchAll(/\sstyle="([^"]*)"/g)].flatMap(
      ([, style]) => style.split(';').map((rule) => rule.split(':')[1]?.trim()),
    );

    expect(html).not.toContain('class=');
    for (const value of values)
      if (value !== undefined)
        expect(value).toMatch(/^(var\(--[\w-]+\)|0|flex|wrap)$/);
  });
});
