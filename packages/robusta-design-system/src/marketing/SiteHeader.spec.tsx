import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ReactNode } from 'react';
import {
  attribute,
  byClass,
  renderStatic,
} from '../test-support/render-static.ts';
import { SiteHeader } from './SiteHeader.tsx';

function brandOf(node: ReactNode) {
  const [brand] = byClass(renderStatic(node), 'sk-site-header__brand');
  assert.ok(brand, 'the site header renders its wordmark as a link');
  return brand;
}

const linksOf = (node: ReactNode) =>
  byClass(renderStatic(node), 'sk-site-header__link');

describe('SiteHeader homeHref', () => {
  it('becomes the target of the wordmark', () => {
    assert.equal(
      attribute(brandOf(<SiteHeader homeHref="/fr" />), 'href'),
      '/fr',
    );
  });

  it('is / when absent', () => {
    assert.equal(attribute(brandOf(<SiteHeader />), 'href'), '/');
  });
});

describe('SiteHeader link locale', () => {
  const [english, plain] = linksOf(
    <SiteHeader
      links={[
        { label: 'English', href: '/en', locale: 'en' },
        { label: 'notes', href: '#notes' },
      ]}
    />,
  );

  it('is written as the lang and the hrefLang of its link', () => {
    assert.equal(attribute(english, 'lang'), 'en');
    assert.equal(attribute(english, 'hrefLang'), 'en');
    assert.equal(attribute(english, 'href'), '/en');
  });

  it('leaves a link without one free of lang and hrefLang', () => {
    assert.ok(!('lang' in plain.props));
    assert.ok(!('hrefLang' in plain.props));
  });
});

describe('SiteHeader rendered without homeHref nor a link locale', () => {
  it('writes the wordmark attributes it wrote before, in the same order', () => {
    assert.deepEqual(Object.entries(brandOf(<SiteHeader />).props), [
      ['href', '/'],
      ['className', 'sk-site-header__brand'],
    ]);
  });

  it('writes the attributes of each link it wrote before, in the same order', () => {
    assert.deepEqual(
      linksOf(<SiteHeader />).map((link) => Object.entries(link.props)),
      ['#work', '#approach', '#notes', '#about'].map((href) => [
        ['href', href],
        ['className', 'sk-site-header__link'],
      ]),
    );
  });

  it('renders the same tree as with homeHref /', () => {
    assert.deepEqual(
      renderStatic(<SiteHeader />),
      renderStatic(<SiteHeader homeHref="/" />),
    );
  });
});
