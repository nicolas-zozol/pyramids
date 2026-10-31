import type { TranslationNotice } from './contract.ts';
import type { IndexedArticle } from './read-file-entry.ts';

/** The notices of the published articles, grouped by translation identifier, in the order of their identifiers and paths. */
export function translationNotices(
  published: readonly IndexedArticle[],
): TranslationNotice[] {
  return [...byTranslationId(published).entries()]
    .sort(([a], [b]) => compare(a, b))
    .flatMap(([translationId, versions]) =>
      groupNotices(
        translationId,
        [...versions].sort((a, b) => compare(a.entry.path, b.entry.path)),
      ),
    );
}

function byTranslationId(
  published: readonly IndexedArticle[],
): Map<string, IndexedArticle[]> {
  const groups = new Map<string, IndexedArticle[]>();
  for (const article of published) {
    const { translationId } = article.entry;
    if (translationId !== undefined) {
      groups.set(translationId, [
        ...(groups.get(translationId) ?? []),
        article,
      ]);
    }
  }
  return groups;
}

function groupNotices(
  translationId: string,
  versions: readonly IndexedArticle[],
): TranslationNotice[] {
  const declared = versions.flatMap((version) =>
    declarationNotice(translationId, version, versions),
  );
  const ownOriginals = versions.filter(
    (version) => version.entry.original === undefined,
  );

  return ownOriginals.length > 1
    ? [...declared, untrackedPair(translationId, ownOriginals)]
    : declared;
}

function declarationNotice(
  translationId: string,
  version: IndexedArticle,
  versions: readonly IndexedArticle[],
): TranslationNotice[] {
  const { original, path } = version.entry;
  if (original === undefined) {
    return [];
  }

  const target = versions.find(
    (candidate) => candidate.entry.locale === original.locale,
  );
  if (target === undefined) {
    return [
      {
        code: 'missing-original',
        path,
        translationId,
        locale: original.locale,
      },
    ];
  }
  if (target.fingerprint !== original.fingerprint) {
    return [
      {
        code: 'stale-translation',
        path,
        originalPath: target.entry.path,
        fingerprint: target.fingerprint,
      },
    ];
  }
  return [];
}

function untrackedPair(
  translationId: string,
  versions: readonly IndexedArticle[],
): TranslationNotice {
  return {
    code: 'untracked-pair',
    translationId,
    versions: versions.map(({ entry, fingerprint }) => ({
      path: entry.path,
      locale: entry.locale,
      fingerprint,
    })),
  };
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
