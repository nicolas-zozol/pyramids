import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shippedStylesheets } from './test-support/package-files.js';

const stylesheets = shippedStylesheets();
const foundations = stylesheets['colors_and_type.css'];
const sketch = stylesheets['sketch.css'];
const allCss = Object.values(stylesheets).join('\n');

function customProperties(css: string, prefix: string): Map<string, string> {
  const pattern = new RegExp(`(${prefix}[a-z0-9-]*)\\s*:\\s*([^;]+);`, 'g');
  return new Map(
    [...css.matchAll(pattern)].map(([, name, value]) => [name, value.trim()]),
  );
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = (hex.match(/[0-9a-f]{2}/gi) ?? []).map((pair) => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [
    relativeLuminance(first),
    relativeLuminance(second),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('type scale', () => {
  const scale = customProperties(foundations, '--t-');
  const FLUID_STEP =
    /^clamp\(\s*([\d.]+)px\s*,[^,]*vw[^,]*,\s*([\d.]+)px\s*\)$/;
  const floorOf = (step: string) =>
    Number(FLUID_STEP.exec(scale.get(step) ?? '')?.[1]);

  it('keeps its eight step names and gains display and lead', () => {
    assert.deepEqual([...scale.keys()].sort(), [
      '--t-body',
      '--t-code',
      '--t-display',
      '--t-h1',
      '--t-h2',
      '--t-h3',
      '--t-h4',
      '--t-lead',
      '--t-small',
      '--t-tiny',
    ]);
  });

  it('makes every step a clamp whose value moves with the viewport', () => {
    for (const [step, value] of scale) {
      const match = FLUID_STEP.exec(value);
      assert.ok(match, `${step} is a fluid clamp: ${value}`);
      assert.ok(
        Number(match[1]) < Number(match[2]),
        `${step} grows with the viewport`,
      );
    }
  });

  it('floors no step below 12px and the body at 16px or above', () => {
    for (const step of scale.keys())
      assert.ok(floorOf(step) >= 12, `${step} floors at ${floorOf(step)}px`);
    assert.ok(floorOf('--t-body') >= 16);
  });

  it('keeps the measure, the line heights and the spacing at their values', () => {
    assert.equal(
      customProperties(foundations, '--measure').get('--measure'),
      '68ch',
    );
    assert.deepEqual(
      Object.fromEntries(customProperties(foundations, '--lh-')),
      {
        '--lh-display': '1.0',
        '--lh-tight': '1.15',
        '--lh-body': '1.45',
      },
    );
    assert.deepEqual(
      [...customProperties(foundations, '--sp-').values()],
      ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px', '96px'],
    );
  });

  it('is what every font size of the shipped stylesheets reads', () => {
    const sizes = [...allCss.matchAll(/font-size\s*:\s*([^;]+);/g)].map(
      ([, value]) => value.trim(),
    );
    assert.ok(sizes.length > 0);
    assert.deepEqual(
      sizes.filter((value) => !/^var\(--t-[a-z0-9]+\)$/.test(value)),
      [],
    );
    assert.doesNotMatch(allCss, /(^|[\s;{])font\s*:/);
  });
});

describe('breakpoints', () => {
  it('are the five Tailwind default widths, each written once, and no other', () => {
    const preludes = [...allCss.matchAll(/@media\s*([^{]+)\{/g)].map(
      ([, prelude]) => prelude.trim(),
    );
    assert.deepEqual(preludes, [
      '(min-width: 40rem)',
      '(min-width: 48rem)',
      '(min-width: 64rem)',
      '(min-width: 80rem)',
      '(min-width: 96rem)',
    ]);
  });
});

describe('layout override surface', () => {
  const SURFACE_BLOCKS = [
    'sk-hero',
    'sk-site-header',
    'sk-site-footer',
    'sk-services-grid',
    'sk-flow-diagram',
    'sk-principles-list',
    'sk-notes-preview',
    'sk-cta',
    'sk-brand-logo',
  ];
  const selectors = [...sketch.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .flatMap(([, list]) => list.split(','))
    .map((selector) => selector.trim());
  const surfaceSelectors = selectors.filter((selector) =>
    SURFACE_BLOCKS.some((block) =>
      new RegExp(`\\.${block}(?![a-z-])`).test(selector),
    ),
  );

  it('writes every surface rule at single-class specificity', () => {
    assert.ok(surfaceSelectors.length > 0);
    assert.deepEqual(
      surfaceSelectors.filter((selector) => !/^\.[a-z0-9_-]+$/.test(selector)),
      [],
    );
  });

  it('carries no !important', () => {
    assert.doesNotMatch(allCss, /!important/);
  });
});

describe('error ramp', () => {
  const ramp = customProperties(foundations, '--brand-error');
  const paper = customProperties(foundations, '--paper').get('--paper') ?? '';

  it('is three tokens in the shape of the brand ramps', () => {
    assert.deepEqual(
      [...ramp.keys()],
      ['--brand-error', '--brand-error-soft', '--brand-error-deep'],
    );
    for (const value of ramp.values()) assert.match(value, /^#[0-9a-f]{6}$/i);
  });

  it('reads at 4.5:1 or better against the paper, both ways', () => {
    assert.ok(contrastRatio(ramp.get('--brand-error') ?? '', paper) >= 4.5);
  });

  it('is consumed by no rule of the package', () => {
    assert.doesNotMatch(sketch, /--brand-error/);
  });
});
