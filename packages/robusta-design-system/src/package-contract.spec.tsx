import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CSSProperties, ReactNode } from 'react';
import * as designSystem from './index.js';
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
} from './index.js';
import { componentSources, packageFile } from './test-support/package-files.js';
import {
  hostElements,
  renderStatic,
  textNodes,
} from './test-support/render-static.js';

const MASCOT = '/assets/crystal-tux.svg';
const LOCKUP_GLYPHS = ['💪', '🏗'];

const EVERY_COMPONENT: ReactNode[] = [
  <BrandLogo key="full" size="full" />,
  <BrandLogo key="compact" size="compact" />,
  <BrandLogo key="mark" size="mark" />,
  <SkButton key="button">x</SkButton>,
  <SkCallout key="callout">x</SkCallout>,
  <SkTag key="tag">x</SkTag>,
  <SkInput key="input" />,
  <SkArrowRight key="arrow" />,
  <Hero key="hero" mascotSrc={MASCOT} />,
  <SiteHeader key="header" />,
  <SiteFooter key="footer" />,
  <ServicesGrid key="services" />,
  <FlowDiagram key="flow" mascotSrc={MASCOT} />,
  <PrinciplesList key="principles" />,
  <NotesPreview key="notes" />,
  <CTA key="cta" mascotSrc={MASCOT} />,
];

describe('the package', () => {
  it('exports the six primitives and the eight surfaces it had, and no other component', () => {
    assert.deepEqual(Object.keys(designSystem).sort(), [
      'BrandLogo',
      'CTA',
      'FlowDiagram',
      'Hero',
      'NotesPreview',
      'PrinciplesList',
      'ServicesGrid',
      'SiteFooter',
      'SiteHeader',
      'SkArrowRight',
      'SkButton',
      'SkCallout',
      'SkInput',
      'SkTag',
    ]);
  });

  it('renders no inline font size, the emoji glyphs of the logo lockup aside', () => {
    const sized = hostElements(renderStatic(EVERY_COMPONENT)).filter(
      (element) =>
        (element.props.style as CSSProperties | undefined)?.fontSize !==
        undefined,
    );
    assert.deepEqual(
      sized
        .filter(
          (element) => !LOCKUP_GLYPHS.includes(textNodes([element]).join('')),
        )
        .map((element) => `${element.tag}.${String(element.props.className)}`),
      [],
    );
  });

  it('keeps every component server-component-safe', () => {
    for (const [path, source] of Object.entries(componentSources())) {
      assert.doesNotMatch(source, /['"]use client['"]/, path);
    }
  });

  it('consumes the error ramp in no component', () => {
    for (const [path, source] of Object.entries(componentSources())) {
      assert.doesNotMatch(source, /--brand-error/, path);
    }
  });

  it('depends on react alone, as a peer', () => {
    const manifest = JSON.parse(packageFile('package.json')) as Record<
      string,
      unknown
    >;
    assert.equal(manifest.dependencies, undefined);
    assert.deepEqual(manifest.peerDependencies, { react: '^19.1.1' });
  });
});
