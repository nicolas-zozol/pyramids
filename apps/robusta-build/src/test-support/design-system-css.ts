import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const STYLESHEETS = [
  '@robusta/pyramids-design-system/sketch.css',
  '@robusta/pyramids-design-system/colors_and_type.css',
];

/** Every class name the design system's stylesheets define. */
export async function designSystemClassNames(): Promise<Set<string>> {
  const require = createRequire(import.meta.url);
  const css = (
    await Promise.all(
      STYLESHEETS.map((sheet) => readFile(require.resolve(sheet), 'utf8')),
    )
  ).join('\n');
  return new Set(
    [...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(([, name]) => name),
  );
}
