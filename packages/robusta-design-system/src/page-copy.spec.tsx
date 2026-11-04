import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ReactNode } from 'react';
import * as designSystem from './index.ts';
import {
  BrandLogo,
  CTA,
  FlowDiagram,
  Hero,
  NotesPreview,
  PrinciplesList,
  ServicesGrid,
  SiteFooter,
  SiteHeader,
  SkArrowRight,
  SkButton,
  SkCallout,
  SkInput,
  SkTag,
} from './index.ts';
import {
  byClass,
  byTag,
  readableText,
  renderStatic,
  textNodes,
  type StaticNode,
} from './test-support/render-static.ts';

const BRAND = ['💪', '🏗', 'Robusta Build'];
const MASCOT = '/assets/crystal-tux.svg';
const WORDMARK = '/assets/robusta-build-wordmark.png';

interface ExportRenders {
  /** No text prop, but the props that make each element appear: sources and destinations. */
  withoutText: ReactNode;
  /** Every list carrying one item with empty text fields; every text prop empty for an export with no list. */
  withEmptyItems: ReactNode;
  /** The texts the renders pass themselves, a step number for instance. */
  passed?: string[];
}

const RENDERS: Record<string, ExportRenders> = {
  BrandLogo: {
    withoutText: (
      <>
        <BrandLogo size="full" wordmarkSrc={WORDMARK} />
        <BrandLogo size="compact" wordmarkSrc={WORDMARK} />
        <BrandLogo size="mark" />
      </>
    ),
    withEmptyItems: <BrandLogo size="full" tagline="" wordmarkSrc={WORDMARK} />,
  },
  SkButton: {
    withoutText: <SkButton href="/contact">{null}</SkButton>,
    withEmptyItems: <SkButton>{''}</SkButton>,
  },
  SkCallout: {
    withoutText: <SkCallout>{null}</SkCallout>,
    withEmptyItems: <SkCallout>{''}</SkCallout>,
  },
  SkTag: {
    withoutText: <SkTag tone="pink">{null}</SkTag>,
    withEmptyItems: <SkTag>{''}</SkTag>,
  },
  SkInput: {
    withoutText: <SkInput type="email" />,
    withEmptyItems: <SkInput type="email" placeholder="" />,
  },
  SkArrowRight: {
    withoutText: <SkArrowRight />,
    withEmptyItems: <SkArrowRight width={64} />,
  },
  Hero: {
    withoutText: (
      <Hero
        primaryCtaHref="/contact"
        secondaryCtaHref="/audit"
        mascotSrc={MASCOT}
      />
    ),
    withEmptyItems: (
      <Hero
        eyebrow=""
        title=""
        subtitle=""
        primaryCtaLabel=""
        primaryCtaHref="/contact"
        secondaryCtaLabel=""
        secondaryCtaHref="/audit"
        footnote=""
        mascotSrc={MASCOT}
        mascotAlt=""
        annotation=""
      />
    ),
  },
  SiteHeader: {
    withoutText: (
      <SiteHeader wordmarkSrc={WORDMARK} homeHref="/" ctaHref="/contact" />
    ),
    withEmptyItems: (
      <SiteHeader
        wordmarkSrc={WORDMARK}
        links={[{ label: '', href: '/fr', locale: 'fr' }]}
        ctaHref="/contact"
      />
    ),
  },
  SiteFooter: {
    withoutText: <SiteFooter wordmarkSrc={WORDMARK} />,
    withEmptyItems: (
      <SiteFooter
        wordmarkSrc={WORDMARK}
        columns={[
          { h: '', items: [{ label: '', href: '/notes' }, { label: '' }] },
        ]}
      />
    ),
  },
  ServicesGrid: {
    withoutText: <ServicesGrid />,
    withEmptyItems: (
      <ServicesGrid
        services={[{ title: '', time: '', body: '', moreHref: '/audit' }]}
      />
    ),
  },
  FlowDiagram: {
    withoutText: <FlowDiagram mascotSrc={MASCOT} />,
    withEmptyItems: (
      <FlowDiagram
        mascotSrc={MASCOT}
        steps={[
          { n: 1, label: '', sub: '' },
          { n: 2, label: '', sub: '' },
        ]}
      />
    ),
    passed: ['1', '2'],
  },
  PrinciplesList: {
    withoutText: <PrinciplesList />,
    withEmptyItems: <PrinciplesList principles={[{ k: '', v: '' }]} />,
  },
  NotesPreview: {
    withoutText: <NotesPreview allLinkHref="/articles" />,
    withEmptyItems: (
      <NotesPreview
        allLinkHref="/articles"
        posts={[{ title: '', date: '', href: '/articles/une-note' }]}
      />
    ),
  },
  CTA: {
    withoutText: <CTA ctaHref="/contact" mascotSrc={MASCOT} />,
    withEmptyItems: (
      <CTA
        title=""
        subtitle=""
        emailPlaceholder=""
        ctaLabel=""
        ctaHref="/contact"
        footnote=""
        mascotSrc={MASCOT}
      />
    ),
  },
};

const EXPORTS = Object.keys(designSystem).sort();

function unexpectedText(node: ReactNode, passed: string[] = []): string[] {
  return readableText(renderStatic(node)).filter(
    (text) => !BRAND.includes(text) && !passed.includes(text),
  );
}

describe('the module brings no page copy', () => {
  it('gives every export of the module its renders here', () => {
    const unrendered = EXPORTS.filter((name) => !Object.hasOwn(RENDERS, name));
    assert.deepEqual(
      unrendered,
      [],
      `no render of ${unrendered.join(', ')} in page-copy.spec.tsx`,
    );
  });

  for (const name of EXPORTS.filter((name) => Object.hasOwn(RENDERS, name))) {
    const { withoutText, withEmptyItems, passed } = RENDERS[name];

    it(`${name} renders no text it is not given, the brand aside`, () => {
      const unexpected = unexpectedText(withoutText, passed);
      assert.deepEqual(
        unexpected,
        [],
        `${name} renders ${JSON.stringify(unexpected)}`,
      );
    });

    it(`${name} renders no text on items with empty text fields, the brand aside`, () => {
      const unexpected = unexpectedText(withEmptyItems, passed);
      assert.deepEqual(
        unexpected,
        [],
        `${name} renders ${JSON.stringify(unexpected)} on empty items`,
      );
    });
  }

  it('leaves the brand alone readable on the full BrandLogo rendered without text', () => {
    assert.deepEqual(
      readableText(
        renderStatic(<BrandLogo size="full" wordmarkSrc={WORDMARK} />),
      ),
      BRAND,
    );
  });
});

type TextValue = string | null | undefined;

interface ConditionalElement {
  name: string;
  render: (text: TextValue) => ReactNode;
  elementsOf: (tree: StaticNode[]) => StaticNode[];
}

const ofClass = (className: string) => (tree: StaticNode[]) =>
  byClass(tree, className);

const footerBottomLines = (tree: StaticNode[]) =>
  byClass(tree, 'sk-site-footer__bottom').flatMap((bottom) => bottom.children);

const CONDITIONAL_ELEMENTS: ConditionalElement[] = [
  {
    name: 'Hero eyebrow',
    render: (text) => <Hero eyebrow={text as string} />,
    elementsOf: ofClass('sk-hero__eyebrow'),
  },
  {
    name: 'Hero title',
    render: (text) => <Hero title={text} />,
    elementsOf: (tree) => byTag(tree, 'h1'),
  },
  {
    name: 'Hero subtitle',
    render: (text) => <Hero subtitle={text} />,
    elementsOf: ofClass('sk-hero__subtitle'),
  },
  {
    name: 'ServicesGrid eyebrow',
    render: (text) => <ServicesGrid eyebrow={text as string} />,
    elementsOf: ofClass('sk-services-grid__eyebrow'),
  },
  {
    name: 'ServicesGrid title',
    render: (text) => <ServicesGrid title={text as string} />,
    elementsOf: ofClass('sk-services-grid__title'),
  },
  {
    name: 'FlowDiagram eyebrow',
    render: (text) => <FlowDiagram eyebrow={text as string} />,
    elementsOf: ofClass('sk-flow-diagram__eyebrow'),
  },
  {
    name: 'FlowDiagram title',
    render: (text) => <FlowDiagram title={text} />,
    elementsOf: ofClass('sk-flow-diagram__title'),
  },
  {
    name: 'PrinciplesList eyebrow',
    render: (text) => <PrinciplesList eyebrow={text as string} />,
    elementsOf: ofClass('sk-principles-list__eyebrow'),
  },
  {
    name: 'PrinciplesList title',
    render: (text) => <PrinciplesList title={text as string} />,
    elementsOf: ofClass('sk-principles-list__title'),
  },
  {
    name: 'NotesPreview eyebrow',
    render: (text) => <NotesPreview eyebrow={text as string} />,
    elementsOf: ofClass('sk-notes-preview__eyebrow'),
  },
  {
    name: 'NotesPreview title',
    render: (text) => <NotesPreview title={text as string} />,
    elementsOf: ofClass('sk-notes-preview__title'),
  },
  {
    name: 'CTA title',
    render: (text) => <CTA title={text as string} />,
    elementsOf: ofClass('sk-cta__title'),
  },
  {
    name: 'SiteFooter tagline',
    render: (text) => <SiteFooter tagline={text as string} />,
    elementsOf: ofClass('sk-site-footer__tagline'),
  },
  {
    name: 'SiteFooter copyright',
    render: (text) => <SiteFooter copyright={text as string} versionLine="" />,
    elementsOf: footerBottomLines,
  },
  {
    name: 'SiteFooter versionLine',
    render: (text) => <SiteFooter copyright="" versionLine={text as string} />,
    elementsOf: footerBottomLines,
  },
];

describe('a text prop of a section', () => {
  for (const { name, render, elementsOf } of CONDITIONAL_ELEMENTS) {
    it(`${name} renders the text it is given`, () => {
      const elements = elementsOf(renderStatic(render('Un texte du site.')));
      assert.equal(elements.length, 1, name);
      assert.deepEqual(textNodes(elements), ['Un texte du site.'], name);
    });

    for (const empty of [undefined, '', null]) {
      it(`${name} renders no element when it is ${String(JSON.stringify(empty))}`, () => {
        assert.deepEqual(elementsOf(renderStatic(render(empty))), [], name);
      });
    }
  }
});

const LISTS: {
  name: string;
  section: ReactNode;
  container: string;
  item: string;
}[] = [
  {
    name: 'SiteHeader links',
    section: <SiteHeader />,
    container: 'sk-site-header__nav',
    item: 'sk-site-header__link',
  },
  {
    name: 'SiteFooter columns',
    section: <SiteFooter />,
    container: 'sk-site-footer',
    item: 'sk-site-footer__col',
  },
  {
    name: 'ServicesGrid services',
    section: <ServicesGrid />,
    container: 'sk-services-grid__list',
    item: 'sk-services-grid__card',
  },
  {
    name: 'FlowDiagram steps',
    section: <FlowDiagram />,
    container: 'sk-flow-diagram__steps',
    item: 'sk-flow-diagram__step',
  },
  {
    name: 'PrinciplesList principles',
    section: <PrinciplesList />,
    container: 'sk-principles-list__items',
    item: 'sk-principles-list__item',
  },
  {
    name: 'NotesPreview posts',
    section: <NotesPreview />,
    container: 'sk-notes-preview__list',
    item: 'sk-notes-preview__post',
  },
];

describe('a list of a section, when absent', () => {
  for (const { name, section, container, item } of LISTS) {
    it(`${name} renders no item, its container staying`, () => {
      const tree = renderStatic(section);
      assert.equal(byClass(tree, container).length, 1, container);
      assert.equal(byClass(tree, item).length, 0, item);
    });
  }
});

describe('the containers of a section rendered without text', () => {
  const CONTAINERS: [ReactNode, string][] = [
    [<Hero key="hero" />, 'sk-hero__actions'],
    [<ServicesGrid key="services" />, 'sk-services-grid__head'],
    [<FlowDiagram key="flow" />, 'sk-flow-diagram__head'],
    [<PrinciplesList key="principles" />, 'sk-principles-list__head'],
    [<NotesPreview key="notes" />, 'sk-notes-preview__head'],
    [<CTA key="cta" />, 'sk-cta__form'],
    [<SiteFooter key="footer" />, 'sk-site-footer__bottom'],
  ];

  for (const [section, container] of CONTAINERS) {
    it(`keep ${container}`, () => {
      assert.equal(byClass(renderStatic(section), container).length, 1);
    });
  }
});

describe('NotesPreview rendered without eyebrow, title nor allLinkLabel', () => {
  const tree = renderStatic(
    <NotesPreview
      posts={[{ title: 'une note', date: '13 déc.', href: '/une-note' }]}
    />,
  );

  it('renders no h2 and no text above its posts, its head staying', () => {
    const [head] = byClass(tree, 'sk-notes-preview__head');
    assert.ok(head, 'the head is rendered');
    assert.deepEqual(byTag(tree, 'h2'), []);
    assert.deepEqual(readableText([head]), []);
    assert.deepEqual(readableText(tree), ['13 déc.', 'une note']);
  });
});

describe('CTA rendered without emailPlaceholder', () => {
  it('renders no field', () => {
    assert.deepEqual(
      byTag(renderStatic(<CTA ctaHref="/contact" />), 'input'),
      [],
    );
  });
});
