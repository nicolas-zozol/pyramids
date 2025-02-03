import { FC } from 'react';
import Link from 'next/link';
import { AppRouterPage, PAGES } from '@/app/router';
import { SimpleLink } from '@robusta/pyramids-links';
import { twCss } from '@robusta/pyramids-helpers';
import { EmptyLine } from '@robusta/pyramids-layouts';

interface FooterProps {
  currentPage: AppRouterPage;
  className?: string;
}
export const Footer: FC<FooterProps> = ({ currentPage, className }) => {
  const isHome = currentPage === PAGES.HOME;
  const isAbout = currentPage === PAGES.ABOUT;

  const classes = twCss('flex flex-col', className);
  return (
    // Replace 'flex-layout-column m-20 mt-40' with Tailwind classes
    <footer className={classes}>
      <div className={'main-container w-full'}>
        <div className={'border-primary border-b-2'}>&nbsp;</div>
      </div>
      {/* Nav section */}
      <nav className="mt-10">
        <ul className="flex list-none flex-row justify-center md:flex-col md:p-0 md:text-center">
          {!isHome && (
            <li className="px-[30px]">
              <SimpleLink className={'text-neutral'} href="/">
                Home
              </SimpleLink>
            </li>
          )}
          {/* If not on about, show about link
          {!isAbout && (
            <li className="px-[30px] py-[10px]">
              <SimpleLink className={'text-neutral'} href="/about">
                About
              </SimpleLink>
            </li>
          )}*/}
        </ul>
      </nav>

      <span className="mt-10 text-center">
        <Link href="/" legacyBehavior>
          <a className="inline-flex flex-row items-center justify-center text-[1.2em]">
            <div>Robusta Build</div>
            {/* Emojis */}
            <div className="ml-[10px] text-[1.5em]">💪🏗</div>
          </a>
        </Link>
      </span>
      <EmptyLine size={2} />
    </footer>
  );
};
