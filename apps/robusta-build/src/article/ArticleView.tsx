import { SkTag } from '@robusta/pyramids-design-system';
import { buildUrl } from '@robusta/pyramids-routing';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleBody, getAssetUrl } from '../content/article-index.js';
import { findArticle, findTranslation } from '../content/article-lookup.js';
import { urlScheme } from '../routing/scheme.js';
import { ArticleProse } from './ArticleProse.js';

interface ArticleViewProps {
  locale: string;
  slug: string;
}

/**
 * The single place the four article routes converge (R-ARTICLEPAGE-01).
 * Everything those files used to differ on is a param shape; everything they
 * share is here.
 *
 * An async server component, statically generated: the index and the body are
 * both read in the build, so no article page reads the corpus while serving a
 * request (BR-PYRAMID-7).
 *
 * The end of the article is left free on purpose. Related articles are defined
 * in the glossary and owned by seo-excellence, which claims them explicitly;
 * this view renders no such block.
 */
export async function ArticleView({ locale, slug }: ArticleViewProps) {
  const entry = await findArticle(locale, slug);
  const [{ html }, translation] = await Promise.all([
    getArticleBody(entry),
    findTranslation(entry),
  ]);

  const cover =
    entry.image === undefined ? undefined : getAssetUrl(entry, entry.image);
  const categoryUrl =
    entry.category === undefined
      ? undefined
      : buildUrl(urlScheme, {
          kind: 'category',
          locale: entry.locale,
          category: entry.category,
          page: 1,
        });

  return (
    <main
      style={{
        maxWidth: 'var(--measure)',
        margin: '0 auto',
        padding: 'var(--sp-8) var(--sp-6)',
      }}
    >
      {/* `lang` states the article's own locale. The root layout sets it on
          `<html>` to the site's default, and App Router allows `<html>` in that
          layout alone, where the locale is unknown — so a French article sits in
          an English document until a later story moves that attribute. */}
      <article lang={entry.locale}>
        {cover !== undefined && (
          <div
            style={{
              position: 'relative',
              aspectRatio: '16 / 9',
              marginBottom: 'var(--sp-6)',
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
            }}
          >
            {/* The cover is a URL computed at build time from a file under
                `public/`, which carries no intrinsic dimensions to read — hence
                `fill` and an explicit `sizes` (R-ARTICLEPAGE-23). Its `alt` is
                empty: the corpus declares none, and repeating the title beside
                the `h1` would announce the same words twice. */}
            <Image
              src={cover}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <h1>{entry.title}</h1>

        <p style={{ color: 'var(--fg-3)' }}>
          <time dateTime={entry.date}>
            {writtenDate(entry.date, entry.locale)}
          </time>
          {' — '}
          {entry.author}
        </p>

        {entry.tags.length > 0 && (
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--sp-2)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            {entry.tags.map((tag) => (
              <li key={tag}>
                <SkTag>{tag}</SkTag>
              </li>
            ))}
          </ul>
        )}

        <ArticleProse html={html} />

        <nav
          aria-label="Ways on from this article"
          style={{ marginTop: 'var(--sp-7)', color: 'var(--fg-3)' }}
        >
          {categoryUrl !== undefined && (
            <p>
              Filed in <Link href={categoryUrl}>{entry.category}</Link>
            </p>
          )}
          {translation !== undefined && (
            <p>
              Also in{' '}
              <Link
                href={buildUrl(urlScheme, {
                  kind: 'article',
                  locale: translation.locale,
                  ...(translation.category === undefined
                    ? {}
                    : { category: translation.category }),
                  slug: translation.slug,
                })}
                hrefLang={translation.locale}
                lang={translation.locale}
              >
                {languageName(translation.locale)}
              </Link>
            </p>
          )}
        </nav>
      </article>
    </main>
  );
}

/**
 * The date as the article's own locale writes it. Formatted from the calendar
 * date in UTC, which is the day the frontmatter declares — reading it in the
 * build machine's zone would move it by one.
 */
function writtenDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

/** A locale names itself, so the site coins no name for a language it may add later. */
function languageName(locale: string): string {
  const display = new Intl.DisplayNames([locale], { type: 'language' });
  return display.of(locale) ?? locale;
}
