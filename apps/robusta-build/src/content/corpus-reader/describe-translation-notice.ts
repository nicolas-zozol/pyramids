import type { TranslationNotice } from './contract.ts';

/** One line naming the translation, its original and the value to copy into the declaration. */
export function describeTranslationNotice(notice: TranslationNotice): string {
  switch (notice.code) {
    case 'stale-translation':
      return `${notice.path}: stale translation — its original ${notice.originalPath} changed its title, excerpt or body since the translation was declared up to date; once the translation is updated, declare under original: fingerprint: '${notice.fingerprint}'`;
    case 'untracked-pair':
      return `translation identifier '${notice.translationId}': ${notice.versions.length} versions declare no original — in each translation, declare original: { locale, fingerprint } of its original, among ${notice.versions
        .map(
          (version) =>
            `${version.path} (${version.locale}) fingerprint: '${version.fingerprint}'`,
        )
        .join(', ')}`;
    case 'missing-original':
      return `${notice.path}: its original, locale '${notice.locale}' under translation identifier '${notice.translationId}', is not published or has left the corpus — the translation is served without a link to it`;
  }
}
