/**
 * Fails the build on a `'use client'` or `'use server'` directive, and on a
 * local import that names no TypeScript source of `src`, anywhere under `src`,
 * the generated route tree included.
 *
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-11
 * Design: features/pyramid-v2-epic/__done/ts-import-extensions/ts-import-extensions.design.md
 * Requirements: R-TSIMPORTS-41, R-TSIMPORTS-42, R-TSIMPORTS-43
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const DIRECTIVE = /^\s*(['"])use (client|server)\1\s*;?\s*$/;
const KEPT_AS_WRITTEN = /\.(css|json|svg|png|jpe?g|webp|gif|woff2?|mjs)$/;
const TYPESCRIPT_SOURCE = /\.tsx?$/;
const IMPORT_EXTENSION = /\.(js|tsx?)$/;
const MOCK_CALLS = ['mock', 'doMock', 'importActual', 'importMock'];

/**
 * @typedef {{ path: string, text: string }} SourceFile
 * @typedef {{ path: string, line: number, reason: string }} Offence
 */

/**
 * The offences of the given sources, each named by file and line; every local specifier resolves among `files` alone.
 * @param {SourceFile[]} files
 * @returns {Offence[]}
 */
export function sourceOffences(files) {
  const sources = new Set(files.map((file) => file.path));
  return files.flatMap((file) =>
    [...directiveOffences(file), ...importOffences(file, sources)].sort(
      (a, b) => a.line - b.line,
    ),
  );
}

function directiveOffences(file) {
  return file.text.split('\n').flatMap((text, index) => {
    const directive = DIRECTIVE.exec(text);
    return directive
      ? [
          {
            path: file.path,
            line: index + 1,
            reason: `'use ${directive[2]}' directive`,
          },
        ]
      : [];
  });
}

function importOffences(file, sources) {
  const syntax = ts.createSourceFile(
    file.path,
    file.text,
    ts.ScriptTarget.Latest,
    true,
    file.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  return specifierLiterals(syntax)
    .filter(
      (literal) =>
        isLocal(literal.text) &&
        !namesItsFile(file.path, literal.text, sources),
    )
    .map((literal) => ({
      path: file.path,
      line:
        syntax.getLineAndCharacterOfPosition(literal.getStart(syntax)).line + 1,
      reason: reasonFor(file.path, literal.text, sources),
    }));
}

function specifierLiterals(syntax) {
  const literals = [];
  const visit = (node) => {
    const literal = specifierOf(node);
    if (literal) {
      literals.push(literal);
    }
    ts.forEachChild(node, visit);
  };
  visit(syntax);
  return literals;
}

function specifierOf(node) {
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

function literalOrNothing(node) {
  return node && ts.isStringLiteralLike(node) ? node : undefined;
}

function isDynamicImport(call) {
  return call.expression.kind === ts.SyntaxKind.ImportKeyword;
}

function isMockCall(call) {
  const callee = call.expression;
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'vi' &&
    MOCK_CALLS.includes(callee.name.text)
  );
}

function isLocal(specifier) {
  return specifier.startsWith('.') || specifier.startsWith('@/');
}

function namesItsFile(importer, specifier, sources) {
  const path = withoutQuery(specifier);
  return (
    KEPT_AS_WRITTEN.test(path) ||
    (TYPESCRIPT_SOURCE.test(path) && sources.has(targetOf(importer, path)))
  );
}

function reasonFor(importer, specifier, sources) {
  const expected = expectedSpecifier(importer, specifier, sources);
  const reason = `local import '${specifier}' names no source file`;
  return expected === undefined ? reason : `${reason}, expected '${expected}'`;
}

function expectedSpecifier(importer, specifier, sources) {
  const path = withoutQuery(specifier);
  const query = specifier.slice(path.length);
  const bare = path.replace(IMPORT_EXTENSION, '');
  const candidate = [
    `${bare}.ts`,
    `${bare}.tsx`,
    `${path}/index.ts`,
    `${path}/index.tsx`,
  ].find((candidate) => sources.has(targetOf(importer, candidate)));
  return candidate === undefined ? undefined : candidate + query;
}

function withoutQuery(specifier) {
  return specifier.split('?')[0];
}

function targetOf(importer, path) {
  return path.startsWith('@/')
    ? posix.join('src', path.slice(2))
    : posix.join(posix.dirname(importer), path);
}

async function sourcesUnder(directory, app) {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  const paths = entries
    .filter((entry) => entry.isFile() && TYPESCRIPT_SOURCE.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
  return Promise.all(
    paths.map(async (path) => ({
      path: relative(app, path).split(sep).join('/'),
      text: await readFile(path, 'utf8'),
    })),
  );
}

async function main() {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const offences = sourceOffences(await sourcesUnder(join(app, 'src'), app));

  if (offences.length > 0) {
    console.error('The source breaks the site’s import and directive rules:');
    for (const { path, line, reason } of offences) {
      console.error(`  ${path}:${line} ${reason}`);
    }
    process.exit(1);
  }
  console.log('source: no directive, every local import names its file');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
