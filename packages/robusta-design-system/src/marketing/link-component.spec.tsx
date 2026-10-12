import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ReactElement } from 'react';
import type { SkLinkComponent, SkLinkProps } from '../index.js';
import {
  byTag,
  renderStatic,
  type StaticNode,
} from '../test-support/render-static.js';
import { CTA } from './CTA.js';
import { Hero } from './Hero.js';
import { NotesPreview } from './NotesPreview.js';
import { ServicesGrid } from './ServicesGrid.js';
import { SiteFooter } from './SiteFooter.js';
import { SiteHeader } from './SiteHeader.js';

const PROBE = 'data-probe';

function ProbeLink(props: SkLinkProps) {
  return <a {...{ [PROBE]: '' }} {...props} />;
}

const probe: SkLinkComponent = ProbeLink;

function withoutProbe(nodes: StaticNode[]): StaticNode[] {
  return nodes.map((node) => {
    if (typeof node === 'string') return node;
    const props = Object.fromEntries(
      Object.entries(node.props).filter(([name]) => name !== PROBE),
    );
    return { ...node, props, children: withoutProbe(node.children) };
  });
}

const SURFACES: {
  name: string;
  render: (linkComponent?: SkLinkComponent) => ReactElement;
}[] = [
  {
    name: 'SiteHeader',
    render: (linkComponent) => (
      <SiteHeader ctaHref="mailto:x@y.z" linkComponent={linkComponent} />
    ),
  },
  {
    name: 'SiteFooter',
    render: (linkComponent) => (
      <SiteFooter
        columns={[
          {
            h: 'notes',
            items: [
              { label: 'articles', href: '/articles' },
              { label: 'bientôt' },
            ],
          },
        ]}
        linkComponent={linkComponent}
      />
    ),
  },
  {
    name: 'Hero',
    render: (linkComponent) => (
      <Hero
        primaryCtaHref="mailto:x@y.z"
        secondaryCtaHref="https://example.org"
        linkComponent={linkComponent}
      />
    ),
  },
  {
    name: 'CTA',
    render: (linkComponent) => (
      <CTA ctaHref="mailto:x@y.z" linkComponent={linkComponent} />
    ),
  },
  {
    name: 'NotesPreview',
    render: (linkComponent) => (
      <NotesPreview
        allLinkHref="/articles"
        posts={[
          {
            title: 'une note',
            href: '/articles/c/web/une-note',
            date: '13 déc.',
          },
        ]}
        linkComponent={linkComponent}
      />
    ),
  },
  {
    name: 'ServicesGrid',
    render: (linkComponent) => (
      <ServicesGrid
        services={[
          {
            title: 'audit',
            time: '2 semaines',
            body: 'x',
            moreLabel: 'voir',
            moreHref: '/audit',
          },
        ]}
        linkComponent={linkComponent}
      />
    ),
  },
];

for (const { name, render } of SURFACES) {
  describe(`${name} given a linkComponent`, () => {
    const plain = renderStatic(render());
    const linked = renderStatic(render(probe));

    it('renders anchors to check', () => {
      assert.ok(byTag(plain, 'a').length > 0);
    });

    it('renders every anchor through it', () => {
      for (const anchor of byTag(linked, 'a'))
        assert.ok(PROBE in anchor.props, JSON.stringify(anchor.props));
    });

    it('hands it the href, className and children the plain anchor carries', () => {
      assert.deepEqual(withoutProbe(linked), plain);
    });
  });
}
