/**
 * Prints the translation notices of the corpus, once per build: one line per
 * notice, with the value to copy into the declaration, then their count. A
 * notice fails nothing; a corpus violation, thrown by the article index, does.
 * Loads the `.ts` seams under `src` through Node type stripping.
 *
 * Design: features/pyramid-v2-epic/__done/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-84, R-MULTILINGUAL-85
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * The lines to print and the exit code, from the site's content API.
 * @template Notice
 * @param {{
 *   getArticleIndex: () => Promise<unknown>,
 *   getTranslationNotices: () => Promise<readonly Notice[]>,
 *   describeTranslationNotice: (notice: Notice) => string,
 * }} content
 * @returns {Promise<{ exitCode: 0 | 1, out: string[], err: string[] }>}
 */
export async function checkTranslations(content) {
  try {
    await content.getArticleIndex();
  } catch (error) {
    return {
      exitCode: 1,
      out: [],
      err: [error instanceof Error ? error.message : String(error)],
    };
  }

  const notices = await content.getTranslationNotices();
  return {
    exitCode: 0,
    out: [
      ...notices.map((notice) => content.describeTranslationNotice(notice)),
      countOf(notices.length),
    ],
    err: [],
  };
}

/** @param {number} count */
function countOf(count) {
  if (count === 0) {
    return 'translations: no notice';
  }
  return `translations: ${count} ${count === 1 ? 'notice' : 'notices'}`;
}

async function main() {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const source = join(app, 'src');

  const { getArticleIndex, getTranslationNotices } = await import(
    join(source, 'content/article-index.ts')
  );
  const { describeTranslationNotice } = await import(
    join(source, 'content/corpus-reader/index.ts')
  );

  const { exitCode, out, err } = await checkTranslations({
    getArticleIndex,
    getTranslationNotices,
    describeTranslationNotice,
  });

  for (const line of out) {
    console.log(line);
  }
  for (const line of err) {
    console.error(line);
  }
  process.exit(exitCode);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
