/**
 * Test support — reads the files the package ships, from the package root.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Compiled to `.test-build/test-support/`, two levels below the package root.
const PACKAGE_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** A file of the package, by its path from the package root. */
export function packageFile(path: string): string {
  return readFileSync(PACKAGE_ROOT + path, 'utf8');
}

/** The stylesheets the package ships, keyed by file name, comments stripped. */
export function shippedStylesheets(): Record<string, string> {
  const names = ['colors_and_type.css', 'sketch.css', 'fonts.css'];
  return Object.fromEntries(
    names.map((name) => [
      name,
      packageFile(name).replace(/\/\*[\s\S]*?\*\//g, ''),
    ]),
  );
}

/** The component sources of `src/`, keyed by path, specs and test support left out. */
export function componentSources(): Record<string, string> {
  const paths = readdirSync(PACKAGE_ROOT + 'src', {
    recursive: true,
    encoding: 'utf8',
  }).filter(
    (path) =>
      /\.tsx?$/.test(path) &&
      !/\.spec\.tsx?$/.test(path) &&
      !path.startsWith('test-support'),
  );
  return Object.fromEntries(
    paths.map((path) => [path, packageFile(`src/${path}`)]),
  );
}
