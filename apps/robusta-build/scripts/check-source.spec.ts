import { describe, expect, it } from 'vitest';
import { sourceOffences } from './check-source.mjs';

const file = (path: string, ...lines: string[]) => ({
  path,
  text: lines.join('\n'),
});

describe('sourceOffences', () => {
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

  it('flags a relative import without its .js suffix', () => {
    const offences = sourceOffences([
      file('src/d.ts', "import { a } from './a';"),
    ]);

    expect(offences).toEqual([
      {
        path: 'src/d.ts',
        line: 1,
        reason: "local import './a' without its .js suffix",
      },
    ]);
  });

  it('flags an import naming the TypeScript source, aliased or relative', () => {
    const offences = sourceOffences([
      file(
        'src/e.tsx',
        "import { A } from '@/article/ArticleView.tsx';",
        "import { b } from '../b.ts';",
      ),
    ]);

    expect(offences.map((offence) => offence.line)).toEqual([1, 2]);
  });

  it('flags re-exports, side-effect imports and dynamic imports alike', () => {
    const offences = sourceOffences([
      file(
        'src/f.ts',
        "export { a } from './a';",
        "import './side-effect';",
        "const lazy = () => import('../lazy');",
        "export * from '@/routing/scheme';",
      ),
    ]);

    expect(offences.map((offence) => offence.line)).toEqual([1, 2, 3, 4]);
  });

  it('accepts suffixed local imports, package imports and asset imports', () => {
    const offences = sourceOffences([
      file(
        'src/g.tsx',
        "import { a } from './a.js';",
        "import { A } from '@/article/ArticleView.js';",
        "import { buildUrl } from '@robusta/pyramids-routing';",
        "import { Link } from '@tanstack/react-router';",
        "import styles from './ArticleProse.module.css';",
        "import fontsCss from '../styles/fonts.css?url';",
        "import map from './v1-url-map.generated.json';",
      ),
    ]);

    expect(offences).toEqual([]);
  });

  it('reads a multi-line import by the line its specifier sits on', () => {
    const offences = sourceOffences([
      file('src/h.ts', 'import {', '  a,', '  b,', "} from './ab';"),
    ]);

    expect(offences).toEqual([
      {
        path: 'src/h.ts',
        line: 4,
        reason: "local import './ab' without its .js suffix",
      },
    ]);
  });

  it('excepts the generated route tree', () => {
    const offences = sourceOffences([
      file('src/routeTree.gen.ts', "import { Route } from './routes/__root'"),
    ]);

    expect(offences).toEqual([]);
  });
});
