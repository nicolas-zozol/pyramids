import Link from 'next/link';
import { SimpleLink } from '@robusta/pyramids-links';

type Props = {
  currentPage: number;
  numberOfPages: number;
};

export const PaginationLinks = ({ currentPage, numberOfPages }: Props) => {
  const isFirst = currentPage === 1;
  const isLast = currentPage === numberOfPages;
  const previousPage =
    currentPage - 1 === 1
      ? '/blog'
      : '/blog/page/' + (currentPage - 1).toString();
  const nextPage = '/blog/page/' + (currentPage + 1).toString();

  return (
    <div className="mt-8">
      {isFirst ? (
        <span className="text-light-grey m-2.5 p-2.5 font-normal">
          previous
        </span>
      ) : (
        <SimpleLink
          href={previousPage}
          className="text-dark-blue hover:text-gold m-2.5 p-2.5 font-bold"
        >
          previous
        </SimpleLink>
      )}

      {Array.from({ length: numberOfPages }, (_, i) =>
        currentPage === i + 1 ? (
          <span
            key={i}
            className="text-light-grey m-2.5 border-[1px] border-purple-500 p-2.5 font-normal"
          >
            {i + 1}
          </span>
        ) : (
          <span key={i}>
            <SimpleLink
              href={`${i === 0 ? '/blog' : '/blog/page/' + (i + 1)}`}
              className="text-dark-blue hover:text-gold m-2.5 p-2.5 font-bold"
            >
              {i + 1}
            </SimpleLink>
          </span>
        ),
      )}

      {isLast ? (
        <span className="text-light-grey m-2.5 p-2.5 font-normal">next</span>
      ) : (
        <Link href={nextPage} legacyBehavior={true}>
          <a className="text-dark-blue hover:text-gold m-2.5 p-2.5 font-bold">
            next
          </a>
        </Link>
      )}
    </div>
  );
};
