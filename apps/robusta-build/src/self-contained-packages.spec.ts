import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(process.cwd(), 'src');
const SELF_CONTAINED = ['routing/url-scheme', 'content/corpus-reader'];
const SPEC_SUPPORT = 'test-support';
const SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)(['"])([^'"]+)\1/gm;

interface SourceFile {
  path: string;
  text: string;
}

function escapingImports(files: SourceFile[], directory: string): string[] {
  return files.flatMap((file) =>
    [...file.text.matchAll(SPECIFIER)]
      .map((match) => match[2])
      .filter((specifier) => {
        const target = localTarget(file.path, specifier);
        return (
          target !== null &&
          !isUnder(target, directory) &&
          !(isSpec(file.path) && isUnder(target, SPEC_SUPPORT))
        );
      })
      .map((specifier) => `${file.path} → ${specifier}`),
  );
}

function localTarget(path: string, specifier: string): string | null {
  if (specifier.startsWith('@/')) {
    return specifier.slice(2);
  }
  if (specifier.startsWith('.')) {
    return join(dirname(path), specifier).split(sep).join('/');
  }
  return null;
}

function isUnder(path: string, directory: string): boolean {
  return path.startsWith(`${directory}/`);
}

function isSpec(path: string): boolean {
  return /\.spec\.tsx?$/.test(path);
}

async function sourcesOf(directory: string): Promise<SourceFile[]> {
  const entries = await readdir(join(SRC, directory), {
    recursive: true,
    withFileTypes: true,
  });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
      .map(async (entry) => {
        const absolute = join(entry.parentPath, entry.name);
        return {
          path: relative(SRC, absolute).split(sep).join('/'),
          text: await readFile(absolute, 'utf8'),
        };
      }),
  );
}

describe('escapingImports', () => {
  const directory = 'routing/url-scheme';

  it('names a relative import that climbs out of the directory', () => {
    const files = [
      {
        path: 'routing/url-scheme/build-url.ts',
        text: "import { urlScheme } from '../scheme.js';",
      },
    ];

    expect(escapingImports(files, directory)).toEqual([
      'routing/url-scheme/build-url.ts → ../scheme.js',
    ]);
  });

  it('names an alias import, a re-export and a dynamic import that leave it', () => {
    const files = [
      {
        path: 'routing/url-scheme/index.ts',
        text: [
          "import { a } from '@/content/corpus.js';",
          "export * from '../content-urls.js';",
          "const lazy = () => import('../../page-data/types.js');",
        ].join('\n'),
      },
    ];

    expect(escapingImports(files, directory)).toHaveLength(3);
  });

  it('accepts sibling, nested and package imports', () => {
    const files = [
      {
        path: 'routing/url-scheme/url-set.ts',
        text: [
          "import { buildUrl } from './build-url.js';",
          "import { x } from './nested/x.js';",
          "import { join } from 'node:path';",
          "import slugify from 'slugify';",
        ].join('\n'),
      },
    ];

    expect(escapingImports(files, directory)).toEqual([]);
  });

  it('lets a spec reach the test support, and only a spec', () => {
    const fixture =
      "import { article } from '../../test-support/corpus-fixture.js';";
    const files = [
      { path: 'routing/url-scheme/a.spec.ts', text: fixture },
      { path: 'routing/url-scheme/a.ts', text: fixture },
    ];

    expect(escapingImports(files, directory)).toEqual([
      'routing/url-scheme/a.ts → ../../test-support/corpus-fixture.js',
    ]);
  });

  it('does not take a sibling directory sharing the prefix for the directory', () => {
    const files = [
      {
        path: 'routing/url-scheme/a.ts',
        text: "import { b } from '../url-scheme-old/b.js';",
      },
    ];

    expect(escapingImports(files, directory)).toHaveLength(1);
  });
});

describe.each(SELF_CONTAINED)('%s', (directory) => {
  it('imports nothing outside its own directory', async () => {
    const files = await sourcesOf(directory);

    expect(files.length).toBeGreaterThan(0);
    expect(escapingImports(files, directory)).toEqual([]);
  });
});
