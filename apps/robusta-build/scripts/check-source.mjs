/**
 * Fails the build on a `'use client'` or `'use server'` directive, and on a
 * local import that does not end in `.js`, anywhere under `src`. The generated
 * route tree is the generator's, not the site's, and is skipped.
 *
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-11
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const GENERATED_ROUTE_TREE = /(^|\/)src\/routeTree\.gen\.ts$/;
const DIRECTIVE = /^\s*(['"])use (client|server)\1\s*;?\s*$/;
const SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)(['"])([^'"]+)\1/g;
const ASSET = /\.(css|json|svg|png|jpe?g|webp|gif|woff2?)$/;

/**
 * @typedef {{ path: string, text: string }} SourceFile
 * @typedef {{ path: string, line: number, reason: string }} Offence
 */

/**
 * The offences of the given sources, each named by file and line.
 * @param {SourceFile[]} files
 * @returns {Offence[]}
 */
export function sourceOffences(files) {
  return files
    .filter((file) => !GENERATED_ROUTE_TREE.test(file.path))
    .flatMap((file) =>
      file.text.split('\n').flatMap((text, index) =>
        lineOffences(text).map((reason) => ({
          path: file.path,
          line: index + 1,
          reason,
        })),
      ),
    );
}

/** @param {string} text */
function lineOffences(text) {
  const directive = DIRECTIVE.exec(text);
  if (directive) {
    return [`'use ${directive[2]}' directive`];
  }
  return [...text.matchAll(SPECIFIER)]
    .map((match) => match[2])
    .filter((specifier) => isLocal(specifier) && !isSuffixed(specifier))
    .map((specifier) => `local import '${specifier}' without its .js suffix`);
}

function isLocal(specifier) {
  return specifier.startsWith('.') || specifier.startsWith('@/');
}

function isSuffixed(specifier) {
  const path = specifier.split('?')[0];
  return path.endsWith('.js') || ASSET.test(path);
}

async function sourcesUnder(directory, app) {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  const paths = entries
    .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
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
  console.log('source: no directive, every local import suffixed .js');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
