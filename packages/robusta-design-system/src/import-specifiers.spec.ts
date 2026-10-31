import assert from 'node:assert/strict';
import { posix } from 'node:path';
import { describe, it } from 'node:test';
import ts from 'typescript';
import { moduleSources } from './test-support/package-files.ts';

const KEPT_AS_WRITTEN = /\.(css|json|svg|png|jpe?g|webp|gif|woff2?|mjs)$/;
const TYPESCRIPT_SOURCE = /\.tsx?$/;
const IMPORT_EXTENSION = /\.(js|tsx?)$/;
const MOCK_CALLS = ['mock', 'doMock', 'importActual', 'importMock'];

function importOffences(sources: Record<string, string>): string[] {
  return Object.entries(sources).flatMap(([path, text]) => {
    const syntax = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    return specifierLiterals(syntax)
      .filter(
        (literal) =>
          literal.text.startsWith('.') &&
          !namesItsFile(path, literal.text, sources),
      )
      .map((literal) => {
        const { line } = syntax.getLineAndCharacterOfPosition(
          literal.getStart(syntax),
        );
        return `src/${path}:${line + 1} ${reasonFor(path, literal.text, sources)}`;
      });
  });
}

function specifierLiterals(syntax: ts.SourceFile): ts.StringLiteralLike[] {
  const literals: ts.StringLiteralLike[] = [];
  const visit = (node: ts.Node) => {
    const literal = specifierOf(node);
    if (literal) {
      literals.push(literal);
    }
    ts.forEachChild(node, visit);
  };
  visit(syntax);
  return literals;
}

function specifierOf(node: ts.Node): ts.StringLiteralLike | undefined {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    return literalOrNothing(node.moduleSpecifier);
  }
  if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
    return literalOrNothing(node.argument.literal);
  }
  if (
    ts.isCallExpression(node) &&
    (isDynamicImport(node) || isMockCall(node))
  ) {
    return literalOrNothing(node.arguments[0]);
  }
  return undefined;
}

function literalOrNothing(node: ts.Node | undefined) {
  return node && ts.isStringLiteralLike(node) ? node : undefined;
}

function isDynamicImport(call: ts.CallExpression): boolean {
  return call.expression.kind === ts.SyntaxKind.ImportKeyword;
}

function isMockCall(call: ts.CallExpression): boolean {
  const callee = call.expression;
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'vi' &&
    MOCK_CALLS.includes(callee.name.text)
  );
}

function namesItsFile(
  importer: string,
  specifier: string,
  sources: Record<string, string>,
): boolean {
  const path = withoutQuery(specifier);
  return (
    KEPT_AS_WRITTEN.test(path) ||
    (TYPESCRIPT_SOURCE.test(path) && targetOf(importer, path) in sources)
  );
}

function reasonFor(
  importer: string,
  specifier: string,
  sources: Record<string, string>,
): string {
  const path = withoutQuery(specifier);
  const bare = path.replace(IMPORT_EXTENSION, '');
  const expected = [
    `${bare}.ts`,
    `${bare}.tsx`,
    `${path}/index.ts`,
    `${path}/index.tsx`,
  ].find((candidate) => targetOf(importer, candidate) in sources);
  const reason = `local import '${specifier}' names no source file`;
  return expected === undefined
    ? reason
    : `${reason}, expected '${expected}${specifier.slice(path.length)}'`;
}

function withoutQuery(specifier: string): string {
  return specifier.split('?')[0];
}

function targetOf(importer: string, path: string): string {
  return posix.join(posix.dirname(importer), path);
}

const namesNoFile = (specifier: string, expected?: string) =>
  expected === undefined
    ? `local import '${specifier}' names no source file`
    : `local import '${specifier}' names no source file, expected '${expected}'`;

describe('importOffences', () => {
  it('names a relative import written in .js by file and line, with the source it expects', () => {
    const offences = importOffences({
      'primitives/index.ts': [
        '/** header */',
        "export { SkTag } from './SkTag.js';",
      ].join('\n'),
      'primitives/SkTag.tsx': 'export const SkTag = () => null;',
    });

    assert.deepEqual(offences, [
      `src/primitives/index.ts:2 ${namesNoFile('./SkTag.js', './SkTag.tsx')}`,
    ]);
  });

  it('accepts a relative import naming the .ts or the .tsx it imports', () => {
    const offences = importOffences({
      'index.ts': "export * from './primitives/index.ts';",
      'primitives/index.ts': "export { SkTag } from './SkTag.tsx';",
      'primitives/SkTag.tsx': 'export const SkTag = () => null;',
    });

    assert.deepEqual(offences, []);
  });

  it('gives the extension of the imported file, not that of the importer', () => {
    const offences = importOffences({
      'a.ts': "import { View } from './View.js';",
      'View.tsx': "import { a } from './a.js';",
    });

    assert.deepEqual(offences, [
      `src/a.ts:1 ${namesNoFile('./View.js', './View.tsx')}`,
      `src/View.tsx:1 ${namesNoFile('./a.js', './a.ts')}`,
    ]);
  });

  it('refuses a wrong TypeScript extension and names the right one', () => {
    const offences = importOffences({
      'marketing/Hero.tsx':
        "import { SkButton } from '../primitives/SkButton.ts';",
      'primitives/SkButton.tsx': 'export const SkButton = () => null;',
    });

    assert.deepEqual(offences, [
      `src/marketing/Hero.tsx:1 ${namesNoFile('../primitives/SkButton.ts', '../primitives/SkButton.tsx')}`,
    ]);
  });

  it('names an import without extension, a directory import naming its index.ts', () => {
    const offences = importOffences({
      'index.ts': [
        "export * from './primitives';",
        "export { Hero } from './marketing/Hero';",
      ].join('\n'),
      'primitives/index.ts': 'export {};',
      'marketing/Hero.tsx': 'export const Hero = () => null;',
    });

    assert.deepEqual(offences, [
      `src/index.ts:1 ${namesNoFile('./primitives', './primitives/index.ts')}`,
      `src/index.ts:2 ${namesNoFile('./marketing/Hero', './marketing/Hero.tsx')}`,
    ]);
  });

  it('holds re-exports, dynamic imports and typeof import() alike', () => {
    const offences = importOffences({
      'a.spec.ts': [
        "export type { A } from './a.js';",
        "const lazy = () => import('./a.js');",
        "type Module = typeof import('./a.js');",
      ].join('\n'),
      'a.ts': 'export type A = 1;',
    });

    assert.deepEqual(
      offences,
      [1, 2, 3].map(
        (line) => `src/a.spec.ts:${line} ${namesNoFile('./a.js', './a.ts')}`,
      ),
    );
  });

  it('accepts package imports, asset imports and real .mjs as they are', () => {
    const offences = importOffences({
      'a.ts': [
        "import type { ReactNode } from 'react';",
        "import { readFileSync } from 'node:fs';",
        "import '../sketch.css';",
        "import manifest from '../package.json';",
        "import mascot from '../assets/crystal-tux.svg';",
        "import { run } from './tool.mjs';",
      ].join('\n'),
    });

    assert.deepEqual(offences, []);
  });

  it('does not read an import quoted in a string or a comment, nor a URL', () => {
    const offences = importOffences({
      'a.ts': [
        'const quoted = "import { b } from \'./b\';";',
        "// import { c } from './c';",
        "const root = new URL('../../', import.meta.url);",
      ].join('\n'),
    });

    assert.deepEqual(offences, []);
  });

  it('names a multi-line import by the line its specifier sits on', () => {
    const offences = importOffences({
      'a.ts': [
        'import {',
        '  hostElements,',
        '  renderStatic,',
        "} from './render.js';",
      ].join('\n'),
      'render.ts': 'export {};',
    });

    assert.deepEqual(offences, [
      `src/a.ts:4 ${namesNoFile('./render.js', './render.ts')}`,
    ]);
  });

  it('names no candidate when the file is absent, its case included', () => {
    const offences = importOffences({
      'a.ts': [
        "import { gone } from './gone.js';",
        "import { Tag } from './sktag.tsx';",
      ].join('\n'),
      'SkTag.tsx': 'export const SkTag = () => null;',
    });

    assert.deepEqual(offences, [
      `src/a.ts:1 ${namesNoFile('./gone.js')}`,
      `src/a.ts:2 ${namesNoFile('./sktag.tsx')}`,
    ]);
  });
});

describe('the module sources', () => {
  it('include the components, the specs and the test support', () => {
    const paths = Object.keys(moduleSources());

    for (const path of [
      'index.ts',
      'primitives/SkButton.tsx',
      'import-specifiers.spec.ts',
      'test-support/package-files.ts',
    ]) {
      assert.ok(paths.includes(path), path);
    }
  });

  it('name the file of every relative import', () => {
    const offences = importOffences(moduleSources());

    assert.deepEqual(offences, [], offences.join('\n'));
  });
});
