import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface FontFace {
  family: string;
  weight: string;
  display: string;
  url: string;
}

const PLEX_SANS_FILE =
  '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2';
const CAVEAT_FILE =
  '@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2';

const css = await readFile(join(process.cwd(), 'src/styles/fonts.css'), 'utf8');

const descriptor = (block: string, name: string): string =>
  new RegExp(`${name}:\\s*([^;]+);`).exec(block)?.[1].trim() ?? '';

const faces: FontFace[] = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
  ([, block]) => ({
    family: descriptor(block, 'font-family').replaceAll("'", ''),
    weight: descriptor(block, 'font-weight'),
    display: descriptor(block, 'font-display'),
    url: /url\('([^']+)'\)/.exec(block)?.[1] ?? '',
  }),
);

const facesOf = (family: string) =>
  faces.filter((face) => face.family === family);

/**
 * The faces the v1 Next build rendered: Google serves IBM Plex Sans and Caveat
 * as variable fonts, declared once per weight, and IBM Plex Mono as static
 * files. Matching that is what keeps a page identical (AC-TANSTACK-3).
 */
describe('fonts.css', () => {
  it('declares IBM Plex Sans at 300 to 700, one face per weight, on Fontsource’s variable latin file', () => {
    expect(facesOf('IBM Plex Sans').map((face) => face.weight)).toEqual([
      '300',
      '400',
      '500',
      '600',
      '700',
    ]);
    expect(
      facesOf('IBM Plex Sans').every((face) => face.url === PLEX_SANS_FILE),
    ).toBe(true);
  });

  it('declares Caveat at 600 and 700 on Fontsource’s variable latin file', () => {
    expect(facesOf('Caveat').map((face) => face.weight)).toEqual([
      '600',
      '700',
    ]);
    expect(facesOf('Caveat').every((face) => face.url === CAVEAT_FILE)).toBe(
      true,
    );
  });

  it('imports no static file of IBM Plex Sans or Caveat', () => {
    expect(css).not.toMatch(/@fontsource\/(ibm-plex-sans|caveat)\//);
  });

  it('swaps every face in and sets no --font-* property', () => {
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.every((face) => face.display === 'swap')).toBe(true);
    expect(css).not.toMatch(/--font-[\w-]+\s*:/);
  });

  it('points every face at a file the package ships', () => {
    const require = createRequire(join(process.cwd(), 'package.json'));

    expect(faces.length).toBeGreaterThan(0);
    for (const face of faces) {
      expect(existsSync(require.resolve(face.url))).toBe(true);
    }
  });
});
