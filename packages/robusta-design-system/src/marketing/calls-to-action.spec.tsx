import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ReactNode } from 'react';
import {
  attribute,
  byClass,
  hostElements,
  renderStatic,
  type HostElement,
} from '../test-support/render-static.ts';
import { CTA } from './CTA.tsx';
import { Hero } from './Hero.tsx';
import { SiteHeader } from './SiteHeader.tsx';

const INTERACTIVE = new Set(['a', 'button', 'input', 'select', 'textarea']);

function nestedInteractive(element: HostElement): HostElement[] {
  return hostElements(element.children).filter((child) =>
    INTERACTIVE.has(child.tag),
  );
}

const SECTIONS: { name: string; section: ReactNode; destinations: string[] }[] =
  [
    {
      name: 'Hero',
      section: (
        <Hero
          primaryCtaLabel="écrire"
          primaryCtaHref="/contact"
          secondaryCtaLabel="lire un audit"
          secondaryCtaHref="/audit"
        />
      ),
      destinations: ['/contact', '/audit'],
    },
    {
      name: 'CTA',
      section: (
        <CTA
          emailPlaceholder="votre e-mail"
          ctaLabel="écrire"
          ctaHref="/contact"
        />
      ),
      destinations: ['/contact'],
    },
    {
      name: 'SiteHeader',
      section: <SiteHeader ctaLabel="écrire" ctaHref="/contact" />,
      destinations: ['/contact'],
    },
  ];

for (const { name, section, destinations } of SECTIONS) {
  describe(`${name} calls to action`, () => {
    const tree = renderStatic(section);
    const callsToAction = byClass(tree, 'sk-btn');

    it('are each one anchor carrying its destination', () => {
      assert.deepEqual(
        callsToAction.map((cta) => [cta.tag, attribute(cta, 'href')]),
        destinations.map((href) => ['a', href]),
      );
    });

    it('nest no interactive element, and no button is rendered at all', () => {
      for (const cta of callsToAction)
        assert.deepEqual(nestedInteractive(cta), []);
      assert.equal(
        hostElements(tree).filter((el) => el.tag === 'button').length,
        0,
      );
    });
  });
}
