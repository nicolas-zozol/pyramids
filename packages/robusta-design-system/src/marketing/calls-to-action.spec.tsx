import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ReactNode } from 'react';
import {
  attribute,
  byClass,
  hostElements,
  renderStatic,
  type HostElement,
} from '../test-support/render-static.js';
import { CTA } from './CTA.js';
import { Hero } from './Hero.js';
import { SiteHeader } from './SiteHeader.js';

const INTERACTIVE = new Set(['a', 'button', 'input', 'select', 'textarea']);

function nestedInteractive(element: HostElement): HostElement[] {
  return hostElements(element.children).filter((child) =>
    INTERACTIVE.has(child.tag),
  );
}

const SURFACES: { name: string; surface: ReactNode; destinations: string[] }[] =
  [
    {
      name: 'Hero',
      surface: <Hero primaryCtaHref="/contact" secondaryCtaHref="/audit" />,
      destinations: ['/contact', '/audit'],
    },
    {
      name: 'CTA',
      surface: <CTA ctaHref="/contact" />,
      destinations: ['/contact'],
    },
    {
      name: 'SiteHeader',
      surface: <SiteHeader ctaHref="/contact" />,
      destinations: ['/contact'],
    },
  ];

for (const { name, surface, destinations } of SURFACES) {
  describe(`${name} calls to action`, () => {
    const tree = renderStatic(surface);
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
