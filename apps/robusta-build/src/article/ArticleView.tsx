/**
 * Package article — one article page rendered from its payload, and the one boundary where its body reaches the DOM.
 *
 * Design: features/pyramid-v2-epic/article-page/article-page.design.md
 * Requirements: R-ARTICLEPAGE-02, R-ARTICLEPAGE-03, R-ARTICLEPAGE-04, R-ARTICLEPAGE-05, R-ARTICLEPAGE-41, R-ARTICLEPAGE-42, R-ARTICLEPAGE-43, R-ARTICLEPAGE-61, R-ARTICLEPAGE-62, R-ARTICLEPAGE-63, R-ARTICLEPAGE-65
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-47, R-TANSTACK-48
 */
import { SkTag } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.js';
import type { ArticlePage } from '../page-data/index.js';
import { ArticleProse } from './ArticleProse.js';

interface ArticleViewProps {
  page: ArticlePage;
}

/** One article page, rendered from its payload: every URL and every date arrives computed. */
export function ArticleView({ page }: ArticleViewProps) {
  const { article, html, coverUrl, categoryUrl, translation, writtenDate } =
    page;

  return (
    <main
      style={{
        maxWidth: 'var(--measure)',
        margin: '0 auto',
        padding: 'var(--sp-8) var(--sp-6)',
      }}
    >
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
          aria-label="Ways on from this article"
          style={{ marginTop: 'var(--sp-7)', color: 'var(--fg-3)' }}
        >
          {categoryUrl !== undefined && (
            <p>
              {'Filed in '}
              <SiteLink href={categoryUrl}>{article.category}</SiteLink>
            </p>
          )}
          {translation !== undefined && (
            <p>
              Also in{' '}
              <SiteLink
                href={translation.url}
                hrefLang={translation.locale}
                lang={translation.locale}
              >
                {translation.label}
              </SiteLink>
            </p>
          )}
        </nav>
      </article>
    </main>
  );
}
