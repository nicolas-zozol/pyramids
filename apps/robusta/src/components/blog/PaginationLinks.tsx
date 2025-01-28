import Link from 'next/link';

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
    <div className={'mt-80'}>
      {isFirst ? (
        <span className={'pagination disabled'}>previous</span>
      ) : (
        <span>
          <Link href={previousPage} legacyBehavior={true}>
            <a>previous</a>
          </Link>
        </span>
      )}

      {Array.from({ length: numberOfPages }, (_, i) =>
        currentPage === i + 1 ? (
          <span className={'pagination current disabled'} key={i}>
            {i + 1}
          </span>
        ) : (
          <span key={i}>
            <Link
              href={`${i === 0 ? '/blog' : '/blog/page/' + (i + 1)}`}
              legacyBehavior={true}
            >
              <a className={'pagination'}>{i + 1}</a>
            </Link>
          </span>
        ),
      )}
      {isLast ? (
        <span className={'pagination disabled'}>next</span>
      ) : (
        <span>
          <Link href={nextPage} legacyBehavior={true}>
            <a>next</a>
          </Link>
        </span>
      )}
    </div>
  );
};
