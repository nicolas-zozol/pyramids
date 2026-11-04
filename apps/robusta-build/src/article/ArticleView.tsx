import { SkTag } from '@robusta/pyramids-design-system';
import { Fragment } from 'react';
import { Breadcrumb } from '../components/Breadcrumb.tsx';
import { SiteLink } from '../components/SiteLink.tsx';
import type { ArticlePage } from '../page-data/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';
import { ArticleProse } from './ArticleProse.tsx';
import { articleTrail } from './article-head.ts';

interface ArticleViewProps {
  page: ArticlePage;
}

/** One article page, rendered from its payload and the page copy of the article's Locale: every URL and every date arrives computed. */
export function ArticleView({ page }: ArticleViewProps) {
  const {
    article,
    html,
    coverUrl,
    categoryUrl,
    versions,
    writtenDate,
    writtenUpdated,
    related,
  } = page;
  const copy = getPageCopy(article.locale);
  const {
    navLabel,
    categoryPrefix,
    versionsPrefix,
    relatedTitle,
    updatedPrefix,
  } = copy.article;
  const categoryLabel =
    article.category === undefined
      ? undefined
      : getCategoryLabel(article.locale, article.category);

  return (
    <main
      style={{
        maxWidth: 'var(--measure)',
        margin: '0 auto',
        padding: 'var(--sp-8) var(--sp-6)',
      }}
    >
      <Breadcrumb label={copy.breadcrumb.navLabel} trail={articleTrail(page)} />
      <article lang={article.locale}>
        {coverUrl !== undefined && (
          <div
            style={{
              position: 'relative',
              aspectRatio: '16 / 9',
              marginBottom: 'var(--sp-6)',
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
            }}
          >
            <img
              src={coverUrl}
              alt=""
              loading="eager"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        <h1>{article.title}</h1>

        <p style={{ color: 'var(--fg-3)' }}>
          <time dateTime={article.date}>{writtenDate}</time>
          {article.updated !== undefined && writtenUpdated !== undefined && (
            <>
              {` · ${updatedPrefix} `}
              <time dateTime={article.updated}>{writtenUpdated}</time>
            </>
          )}
          {' — '}
          {article.author}
        </p>

        {article.tags.length > 0 && (
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--sp-2)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            {article.tags.map((tag) => (
              <li key={tag}>
                <SkTag>{tag}</SkTag>
              </li>
            ))}
          </ul>
        )}

        <ArticleProse html={html} />

        <nav
          aria-label={navLabel}
          style={{ marginTop: 'var(--sp-7)', color: 'var(--fg-3)' }}
        >
          {categoryUrl !== undefined && (
            <p>
              {categoryPrefix}
              <SiteLink href={categoryUrl}>{categoryLabel}</SiteLink>
            </p>
          )}
          {versions.length > 0 && (
            <p>
              {versionsPrefix}
              {versions.map((version, index) => (
                <Fragment key={version.locale}>
                  {index > 0 && ', '}
                  <SiteLink
                    href={version.url}
                    hrefLang={version.locale}
                    lang={version.locale}
                  >
                    {getPageCopy(version.locale).localeName}
                  </SiteLink>
                </Fragment>
              ))}
            </p>
          )}
        </nav>
      </article>
      {related.length > 0 && (
        <section style={{ marginTop: 'var(--sp-7)' }}>
          <h2>{relatedTitle}</h2>
          <ul>
            {related.map((entry) => (
              <li key={entry.url}>
                <SiteLink href={entry.url}>{entry.title}</SiteLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
