import { FC } from 'react';
import Link from 'next/link';
import { AppRouterPage, PAGES } from '@/app/router';
import { SimpleLink } from '@robusta/pyramids-links';

interface FooterProps {
  currentPage: AppRouterPage;
}
export const Footer: FC<FooterProps> = ({ currentPage }) => {
  const isHome = currentPage === PAGES.HOME;
  const isAbout = currentPage === PAGES.ABOUT;

  return (
    // Replace 'flex-layout-column m-20 mt-40' with Tailwind classes
    <footer className="m-[20px] mt-[40px] flex flex-col">
      {/* Nav section */}
      <nav className="ml-[40px] border-b-2 border-purple-500 px-0">
        <ul className="-ml-[40px] flex list-none flex-row justify-center md:flex-col md:p-0 md:text-center">
          {!isHome && (
            <li className="px-[30px] py-[10px]">
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

      <span className="mt-[80px] text-center">
        <Link href="/" legacyBehavior>
          <a className="mb-[40px] inline-flex flex-row items-center justify-center text-[1.2em]">
            <div>Robusta Build</div>
            {/* Emojis */}
            <div className="ml-[10px] text-[1.5em]">💪🏗</div>
          </a>
        </Link>
      </span>
    </footer>
  );
};
