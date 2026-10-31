import { describe, expect, it } from 'vitest';
import { sourceOffences } from './check-source.mjs';

const file = (path: string, ...lines: string[]) => ({
  path,
  text: lines.join('\n'),
});

const namesNoFile = (specifier: string, expected?: string) =>
  expected === undefined
    ? `local import '${specifier}' names no source file`
    : `local import '${specifier}' names no source file, expected '${expected}'`;

describe('sourceOffences, directives', () => {
  it('flags a client directive at the top of a module', () => {
    const offences = sourceOffences([
      file('src/a.tsx', "'use client';", '', 'export const a = 1;'),
    ]);

    expect(offences).toEqual([
      { path: 'src/a.tsx', line: 1, reason: "'use client' directive" },
    ]);
  });

  it('flags a server directive inside a function body, in double quotes', () => {
    const offences = sourceOffences([
      file('src/b.ts', 'export async function save() {', '  "use server"', '}'),
    ]);

    expect(offences).toEqual([
      { path: 'src/b.ts', line: 2, reason: "'use server' directive" },
    ]);
  });

  it('ignores a directive quoted inside an expression or a comment', () => {
    const offences = sourceOffences([
      file(
        'src/c.ts',
        "const label = 'use client';",
        "// 'use server' is banned here",
        "say('use client');",
      ),
    ]);

    expect(offences).toEqual([]);
  });

  it('reports the directives and the imports of a file in line order', () => {
    const offences = sourceOffences([
      file('src/a.tsx', "'use client';", "import { b } from './b.js';"),
      file('src/b.ts', 'export const b = 1;'),
    ]);

    expect(offences).toEqual([
      { path: 'src/a.tsx', line: 1, reason: "'use client' directive" },
      { path: 'src/a.tsx', line: 2, reason: namesNoFile('./b.js', './b.ts') },
    ]);
  });
});

describe('sourceOffences, local imports', () => {
  it('flags a relative import written in .js and names the source it expects', () => {
    const offences = sourceOffences([
      file('src/a.ts', "import { b } from './b.js';"),
      file('src/b.ts', 'export const b = 1;'),
    ]);

    expect(offences).toEqual([
      { path: 'src/a.ts', line: 1, reason: namesNoFile('./b.js', './b.ts') },
    ]);
  });

  it('accepts a relative import naming the .ts or the .tsx it imports', () => {
    const offences = sourceOffences([
      file(
        'src/a/a.ts',
        "import { b } from './b.ts';",
        "import { C } from '../c/C.tsx';",
      ),
      file('src/a/b.ts', 'export const b = 1;'),
      file('src/c/C.tsx', 'export const C = () => null;'),
    ]);

    expect(offences).toEqual([]);
  });

  it('gives the extension of the imported file, not that of the importer', () => {
    const offences = sourceOffences([
      file('src/a.ts', "import { View } from './View.js';"),
      file('src/View.tsx', "import { a } from './a.js';"),
    ]);

    expect(offences).toEqual([
      {
        path: 'src/a.ts',
        line: 1,
        reason: namesNoFile('./View.js', './View.tsx'),
      },
      {
        path: 'src/View.tsx',
        line: 1,
        reason: namesNoFile('./a.js', './a.ts'),
      },
    ]);
  });

  it('refuses a wrong TypeScript extension and names the right one', () => {
    const offences = sourceOffences([
      file(
        'src/a/Foo.tsx',
        "import { a } from './a.ts';",
        '',
        '',
        "import { Bar } from './Bar.ts';",
      ),
      file('src/a/a.ts', 'export const a = 1;'),
      file('src/a/Bar.tsx', 'export const Bar = () => null;'),
    ]);

    expect(offences).toEqual([
      {
        path: 'src/a/Foo.tsx',
        line: 4,
        reason: namesNoFile('./Bar.ts', './Bar.tsx'),
      },
    ]);
  });

  it('flags an import without extension, a directory import naming its index.ts', () => {
    const offences = sourceOffences([
      file(
        'src/a/b.ts',
        "import { c } from './c';",
        "import { buildUrl } from '../routing/url-scheme';",
      ),
      file('src/a/c.ts', 'export const c = 1;'),
      file('src/routing/url-scheme/index.ts', 'export const buildUrl = 1;'),
    ]);

    expect(offences).toEqual([
      { path: 'src/a/b.ts', line: 1, reason: namesNoFile('./c', './c.ts') },
      {
        path: 'src/a/b.ts',
        line: 2,
        reason: namesNoFile(
          '../routing/url-scheme',
          '../routing/url-scheme/index.ts',
        ),
      },
    ]);
  });

  it('resolves an alias from src and holds it to the same rule', () => {
    const offences = sourceOffences([
      file(
        'src/routes/x.tsx',
        "import { ArticleView } from '@/article/ArticleView.js';",
        "import { scheme } from '@/routing/scheme.ts';",
      ),
      file('src/article/ArticleView.tsx', 'export const ArticleView = 1;'),
      file('src/routing/scheme.ts', 'export const scheme = 1;'),
    ]);

    expect(offences).toEqual([
      {
        path: 'src/routes/x.tsx',
        line: 1,
        reason: namesNoFile(
          '@/article/ArticleView.js',
          '@/article/ArticleView.tsx',
        ),
      },
    ]);
  });

  it('holds re-exports, side-effect imports and dynamic imports alike', () => {
    const sources = [
      file('src/a.ts', 'export const a = 1;'),
      file('src/side-effect.ts', 'export {};'),
      file('src/lazy.ts', 'export const lazy = 1;'),
      file('src/routing/scheme.ts', 'export const scheme = 1;'),
    ];

    const offences = sourceOffences([
      file(
        'src/f.ts',
        "export { a } from './a.js';",
        "import './side-effect';",
        "const lazy = () => import('./lazy.js');",
        "export * from '@/routing/scheme.js';",
        "export type { A } from './a.ts';",
      ),
      ...sources,
    ]);

    expect(offences.map(({ line, reason }) => [line, reason])).toEqual([
      [1, namesNoFile('./a.js', './a.ts')],
      [2, namesNoFile('./side-effect', './side-effect.ts')],
      [3, namesNoFile('./lazy.js', './lazy.ts')],
      [4, namesNoFile('@/routing/scheme.js', '@/routing/scheme.ts')],
    ]);
  });

  it('reads the paths of vi.mock and its siblings, and typeof import(), as imports', () => {
    const offences = sourceOffences([
      file(
        'src/routes/-heads.spec.tsx',
        "vi.mock('../page-data/index.js', async (importOriginal) => ({",
        "  ...(await importOriginal<typeof import('../page-data/index.js')>()),",
        '}));',
        "vi.doMock('../page-data/index.ts');",
        "await vi.importActual('../page-data/index.js');",
        "await vi.importMock('../page-data/index.js');",
        "vi.mock('node:fs/promises');",
      ),
      file('src/page-data/index.ts', 'export const getArticlePage = 1;'),
    ]);

    const expected = namesNoFile(
      '../page-data/index.js',
      '../page-data/index.ts',
    );
    expect(offences).toEqual(
      [1, 2, 5, 6].map((line) => ({
        path: 'src/routes/-heads.spec.tsx',
        line,
        reason: expected,
      })),
    );
  });

  it('accepts package imports, asset imports and real .mjs as they are', () => {
    const offences = sourceOffences([
      file(
        'src/g.tsx',
        "import { Link } from '@tanstack/react-router';",
        "import { Hero } from '@robusta/pyramids-design-system';",
        "import { readFile } from 'node:fs/promises';",
        "import styles from './ArticleProse.module.css';",
        "import fontsCss from '../styles/fonts.css?url';",
        "import map from './v1-url-map.generated.json';",
        "import wordmark from './wordmark.png';",
        "import { prerenderPages } from '../scripts/prerender-pages.mjs';",
      ),
    ]);

    expect(offences).toEqual([]);
  });

  it('does not read an import quoted in a string or a comment, nor a URL', () => {
    const offences = sourceOffences([
      file(
        'src/h.ts',
        'const quoted = "import { a } from \'./a\';";',
        "// import { b } from './b';",
        "/* export * from './c'; */",
        "const root = new URL('./d', import.meta.url);",
      ),
    ]);

    expect(offences).toEqual([]);
  });

  it('names a multi-line import by the line its specifier sits on', () => {
    const offences = sourceOffences([
      file('src/h.ts', 'import {', '  a,', '  b,', "} from './ab.js';"),
      file('src/ab.ts', 'export const a = 1, b = 2;'),
    ]);

    expect(offences).toEqual([
      { path: 'src/h.ts', line: 4, reason: namesNoFile('./ab.js', './ab.ts') },
    ]);
  });

  it('holds the generated route tree to the same rule', () => {
    const offences = sourceOffences([
      file(
        'src/routeTree.gen.ts',
        "import { Route as rootRouteImport } from './routes/__root.js'",
      ),
      file('src/routes/__root.tsx', 'export const Route = 1;'),
    ]);

    expect(offences).toEqual([
      {
        path: 'src/routeTree.gen.ts',
        line: 1,
        reason: namesNoFile('./routes/__root.js', './routes/__root.tsx'),
      },
    ]);
  });

  it('resolves among the given files alone, naming no candidate when none is given', () => {
    const offences = sourceOffences([
      file(
        'src/content/x.ts',
        "import { corpus } from './corpus.ts';",
        "import { gone } from './gone.js';",
      ),
    ]);

    expect(offences).toEqual([
      { path: 'src/content/x.ts', line: 1, reason: namesNoFile('./corpus.ts') },
      { path: 'src/content/x.ts', line: 2, reason: namesNoFile('./gone.js') },
    ]);
  });

  it('matches the file name with its case', () => {
    const offences = sourceOffences([
      file('src/a.ts', "import { Bar } from './bar.tsx';"),
      file('src/Bar.tsx', 'export const Bar = () => null;'),
    ]);

    expect(offences).toEqual([
      { path: 'src/a.ts', line: 1, reason: namesNoFile('./bar.tsx') },
    ]);
  });
});
