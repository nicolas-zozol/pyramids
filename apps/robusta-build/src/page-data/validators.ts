import type { RollUrl } from '../routing/url-scheme/index.ts';
import type { LocaleRequest } from './types.ts';

/** The input of `getRollPage`; throws unless it is the URL of a roll page at a whole page. */
export function rollUrl(input: RollUrl): RollUrl {
  const page = input?.page;
  const wholePage = Number.isInteger(page);
  if (typeof input?.locale === 'string' && wholePage) {
    if (input.kind === 'blog-home') {
      return { kind: 'blog-home', locale: input.locale, page };
    }
    if (input.kind === 'category' && typeof input.category === 'string') {
      return {
        kind: 'category',
        locale: input.locale,
        category: input.category,
        page,
      };
    }
  }
  throw new Error(
    `A roll page URL is a blog home or a Category page, a locale and a whole page: ${JSON.stringify(input)}`,
  );
}

/** The input of `getLocaleRolls`; throws unless its locale is a string. */
export function localeRequest(input: LocaleRequest): LocaleRequest {
  if (typeof input?.locale !== 'string') {
    throw new Error(
      `A locale request names a locale: ${JSON.stringify(input)}`,
    );
  }
  return { locale: input.locale };
}
