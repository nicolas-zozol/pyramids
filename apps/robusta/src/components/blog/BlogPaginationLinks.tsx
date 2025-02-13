import Link from 'next/link';
import { SimpleLink } from '@robusta/pyramids-links';
import { cleanUrl } from '@/logic/routing/parse-url';

type Props = {
  currentPage: number;
  numberOfPages: number;
  baseUrl: string;
};

export const BlogPaginationLinks = ({
  currentPage,
  numberOfPages,
  baseUrl,
}: Props) => {
  // CSS classes for different states:
  const disabledLinkClasses =
    'text-light-grey m-2 p-2 px-4 font-normal opacity-50';
  const activeLinkClasses =
    'text-primary hover:opacity-80 m-2 p-2 px-4 font-bold';
  const currentPageClasses =
    'text-light-grey border-primary m-2 rounded border-2 p-2 px-4 font-normal';

  // Determine if we're on the first or last page
  const isFirst = currentPage === 1;
  const isLast = currentPage === numberOfPages;

  // Calculate the URL for the previous page.
  // Note: if the previous page is the first page, we use '/blog'
  const previousPage =
    currentPage - 1 === 1 ? `${baseUrl}` : `${baseUrl}/page/${currentPage - 1}`;

  // Calculate the URL for the next page.
  const nextPage = `${baseUrl}/page/${currentPage + 1}`;
  return (
    <div className="mt-8">
      {/**
       * Previous Link:
       * - If on the first page, display a non-clickable (disabled) element.
       * - Otherwise, render a clickable link to the previous page.
       */}
      {isFirst ? (
        <span className={disabledLinkClasses}>previous</span>
      ) : (
        <SimpleLink href={cleanUrl(previousPage)} className={activeLinkClasses}>
          previous
        </SimpleLink>
      )}

      {/**
       * Page Number Links:
       * - For each page, we render an element:
       *   - If it's the current page, show it as disabled (non-clickable) with a border.
       *   - Otherwise, render a clickable link to that page.
       * - For page 1, we use the URL '/${baseUrl}' instead of '/${baseUrl}/page/1'.
       */}
      {Array.from({ length: numberOfPages }, (_, i) => {
        const page = i + 1;
        const isCurrent = page === currentPage;
        const href = page === 1 ? `/${baseUrl}` : `/${baseUrl}/page/${page}`;

        return isCurrent ? (
          <span key={page} className={currentPageClasses}>
            {page}
          </span>
        ) : (
          <span key={page}>
            <SimpleLink href={cleanUrl(href)} className={activeLinkClasses}>
              {page}
            </SimpleLink>
          </span>
        );
      })}

      {/**
       * Next Link:
       * - If on the last page, display a non-clickable (disabled) element.
       * - Otherwise, render a clickable link to the next page.
       * - Here we use Next.js’s Link with legacyBehavior.
       */}
      {isLast ? (
        <span className={disabledLinkClasses}>next</span>
      ) : (
        <Link href={cleanUrl(nextPage)} className={activeLinkClasses}>
          next
        </Link>
      )}
    </div>
  );
};
