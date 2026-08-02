import styles from './ArticleProse.module.css';

interface ArticleProseProps {
  html: string;
}

/**
 * The one boundary where a body reaches the DOM, and the site's only
 * `dangerouslySetInnerHTML` (R-ARTICLEPAGE-04). It is what Next.js documents for
 * a markdown body — a server component with a CSS Module for the typography —
 * rather than what is left when nothing better can be done.
 *
 * The string is safe by construction on three counts: it is produced at build
 * time from a corpus committed to this repository, remark-html 16 by default
 * both drops raw HTML and sanitizes what markdown produced (R-ARTICLEPAGE-27),
 * and nothing user-supplied reaches it.
 *
 * The container element exists for the class: the body carries exactly one class
 * the site did not put there, so its elements are addressable only by name from
 * an ancestor, and a fragment would give them none.
 */
export function ArticleProse({ html }: ArticleProseProps) {
  return (
    <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
