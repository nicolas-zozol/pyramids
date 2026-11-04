import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { articleSlug } from './article-slug.ts';
import {
  assetReferences,
  corpusAssetPath,
  isExternalReference,
} from './asset-reference.ts';
import type {
  ArticleEntry,
  CorpusSpec,
  CorpusViolation,
  LocaleSource,
  OriginalDeclaration,
} from './contract.ts';
import { fingerprint } from './fingerprint.ts';

const FINGERPRINT = /^[0-9a-f]{12}$/;

/**
 * One markdown file against the schema. Validation runs on every file the
 * corpus holds, the unpublished ones included, so a `published` flag added by
 * hand later cannot reveal a violation that was sitting there.
 */
export interface FileRead {
  path: string;
  published: boolean;
  /** Absent when a required field is missing: there is no article to index. */
  article?: IndexedArticle;
  violations: CorpusViolation[];
}

/** An entry of the index, with the fingerprint its translations are held against. */
export interface IndexedArticle {
  entry: ArticleEntry;
  fingerprint: string;
}

export async function readFileEntry(
  root: string,
  path: string,
  corpus: CorpusSpec,
): Promise<FileRead> {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(await readFile(join(root, path), 'utf8'), {
      excerpt: true,
    });
  } catch (error) {
    return {
      path,
      published: false,
      violations: [
        { code: 'unreadable-frontmatter', path, detail: detailOf(error) },
      ],
    };
  }

  const violations: CorpusViolation[] = [];
  const declared = parsed.data as Record<string, unknown>;

  if (corpus.assets !== undefined) {
    violations.push(
      ...(await unresolvedAssets(
        root,
        path,
        text(declared.image),
        parsed.content,
      )),
    );
  }

  const published = readPublished(declared.published, path, violations);
  const title = required(text(declared.title), 'title', path, violations);
  const locale = required(
    localeOf(corpus.localeFrom, declared.locale, path),
    'locale',
    path,
    violations,
  );
  const excerpt = required(text(parsed.excerpt), 'excerpt', path, violations);
  const author = required(text(declared.author), 'author', path, violations);
  const date = readDate(declared.date, path, violations);
  const updated = readUpdated(declared.updated, path, violations);
  const translationId = text(declared.translationId);
  const original = readOriginal(
    declared.original,
    { locale, translationId },
    path,
    violations,
  );

  if (
    title === undefined ||
    locale === undefined ||
    excerpt === undefined ||
    author === undefined ||
    date === undefined
  ) {
    return { path, published, violations };
  }

  const entry: ArticleEntry = {
    path,
    slug: text(declared.slug) ?? articleSlug(title, locale),
    locale,
    ...optional('category', declared.category),
    title,
    date,
    ...(updated === undefined ? {} : { updated }),
    author,
    tags: readTags(declared.tags),
    excerpt,
    ...optional('image', declared.image),
    ...optional('translationId', translationId),
    ...(original === undefined ? {} : { original }),
  };

  return {
    path,
    published,
    article: {
      entry,
      fingerprint: fingerprint({ title, excerpt, body: parsed.content }),
    },
    violations,
  };
}

/**
 * The declaration of a translation's original, or nothing when the article
 * declares none and is its own original. A malformed declaration is a
 * violation and declares nothing.
 */
function readOriginal(
  value: unknown,
  article: { locale?: string; translationId?: string },
  path: string,
  violations: CorpusViolation[],
): OriginalDeclaration | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const declared = isMapping(value) ? value : {};
  const locale = text(declared.locale);
  const declaredFingerprint = declared.fingerprint;
  const problems = [
    ...declarationProblems(value, locale, article),
    ...fingerprintProblems(declaredFingerprint),
  ];

  if (
    problems.length === 0 &&
    locale !== undefined &&
    typeof declaredFingerprint === 'string'
  ) {
    return { locale, fingerprint: declaredFingerprint };
  }

  violations.push({
    code: 'malformed-original',
    path,
    detail: problems.join('; '),
  });
  return undefined;
}

function declarationProblems(
  value: unknown,
  locale: string | undefined,
  article: { locale?: string; translationId?: string },
): string[] {
  return [
    ...(isMapping(value)
      ? []
      : [
          `it declares original as '${String(value)}', not as a locale and a fingerprint`,
        ]),
    ...(article.translationId === undefined
      ? ['it declares no translationId to find its original by']
      : []),
    ...(locale === undefined ? ['it declares no locale for its original'] : []),
    ...(locale !== undefined && locale === article.locale
      ? [`the locale of its original, '${locale}', is its own`]
      : []),
  ];
}

function fingerprintProblems(value: unknown): string[] {
  if (value === undefined || value === null) {
    return ['it declares no fingerprint of its original'];
  }
  if (typeof value !== 'string') {
    return [
      `YAML reads its fingerprint ${String(value)} as a ${typeof value}: write it quoted`,
    ];
  }
  return FINGERPRINT.test(value)
    ? []
    : [`its fingerprint '${value}' is not 12 lowercase hexadecimal characters`];
}

function isMapping(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Every image reference that names no file of the corpus (R-MIGRATELEARN-23).
 *
 * It costs nothing here: `matter` has already read the whole file to extract the
 * excerpt, so this is a regular expression over a string in memory and not a
 * markdown parse — answering what articles exist still renders no body
 * (R-CONTENTSOURCE-06). Resolution is against the corpus and never against the
 * published tree, which is what lets it run on a clean checkout before the copy
 * step has produced anything.
 */
async function unresolvedAssets(
  root: string,
  path: string,
  image: string | undefined,
  body: string,
): Promise<CorpusViolation[]> {
  const checked = await Promise.all(
    assetReferences(image, body).map(async (reference) => {
      if (isExternalReference(reference)) {
        return undefined;
      }
      // The corpus answers for every relative reference, so one it cannot
      // resolve escapes the root and names a file it does not hold.
      const resolved = corpusAssetPath(path, reference);
      if (resolved === undefined) {
        return reference;
      }
      return (await exists(join(root, resolved))) ? undefined : reference;
    }),
  );

  return checked
    .filter((reference): reference is string => reference !== undefined)
    .map((reference) => ({
      code: 'unresolved-asset' as const,
      path,
      reference,
    }));
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Exactly `true` publishes. Absent leaves the article out silently, which the
 * read reports as an unpublished path (R-CONTENTSOURCE-42). Anything else is a
 * violation, so `published: "true"` cannot unpublish an article by a typo
 * (R-CONTENTSOURCE-43).
 */
function readPublished(
  value: unknown,
  path: string,
  violations: CorpusViolation[],
): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  violations.push({
    code: 'non-boolean-published',
    path,
    value: String(value),
  });
  return false;
}

function readDate(
  value: unknown,
  path: string,
  violations: CorpusViolation[],
): string | undefined {
  if (value === undefined || value === null || value === '') {
    violations.push({ code: 'missing-field', path, field: 'date' });
    return undefined;
  }

  return calendarDate(value, 'date', path, violations);
}

/** The optional update date: absent, or a calendar date like `date` (R-SEOEXCELLENCE-101). */
function readUpdated(
  value: unknown,
  path: string,
  violations: CorpusViolation[],
): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return calendarDate(value, 'updated', path, violations);
}

function calendarDate(
  value: unknown,
  field: 'date' | 'updated',
  path: string,
  violations: CorpusViolation[],
): string | undefined {
  // YAML reads an unquoted `2021-11-30` as a timestamp, whose UTC day is the
  // same YYYY-MM-DD the schema asks for. Anything else is compared as written.
  const written =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : String(value).trim();

  if (!isCalendarDate(written)) {
    violations.push({ code: 'malformed-date', path, field, date: written });
    return undefined;
  }
  return written;
}

function isCalendarDate(written: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(written)) {
    return false;
  }
  const parsed = new Date(`${written}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === written
  );
}

/**
 * Where the locale is read from is the site's declaration, never the base's
 * guess: the frontmatter, or a directory segment of the path for a tree shaped
 * like dakar's `content/{locale}/guide/{slug}.md` (R-CONTENTSOURCE-24).
 */
function localeOf(
  source: LocaleSource,
  declared: unknown,
  path: string,
): string | undefined {
  if (source === 'frontmatter') {
    return text(declared);
  }
  const directories = path.split('/').slice(0, -1);
  return text(directories[source.pathSegment]);
}

function readTags(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function required<T>(
  value: T | undefined,
  field: 'title' | 'locale' | 'excerpt' | 'author',
  path: string,
  violations: CorpusViolation[],
): T | undefined {
  if (value === undefined) {
    violations.push({ code: 'missing-field', path, field });
  }
  return value;
}

/** A field the schema does not name, and an empty one, are the same thing: absent. */
function text(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const written = String(value).trim();
  return written === '' ? undefined : written;
}

function optional<K extends string>(
  field: K,
  value: unknown,
): Record<K, string> | Record<string, never> {
  const written = text(value);
  return written === undefined
    ? {}
    : ({ [field]: written } as Record<K, string>);
}

function detailOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
