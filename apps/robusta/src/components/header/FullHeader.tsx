import { FC } from 'react';

import Link from 'next/link';
// TODO: not the right image
import './full-header.scss';
import { SimpleLink } from '@robusta/pyramids-links';
import { twCss } from '@robusta/pyramids-helpers';

interface Props {
  showHomePageLink: boolean;
  invertBar: boolean;
}
export const FullHeader: FC<Props> = ({ showHomePageLink, invertBar }) => {
  return (
    <header id="full-header" className={'bg-base-100'}>
      <nav className={'standard-hero-container flex justify-start gap-2'}>
        {showHomePageLink && (
          <span>
            <TitleLink href="/">💪🏗 Home</TitleLink>
          </span>
        )}

        <div className={'tab:hidden flex justify-start gap-8'}>
          <span>
            <FakeLink>CLEAN CODE</FakeLink>
          </span>
          <span>
            <FakeLink>WEB</FakeLink>
          </span>
          <span>
            <FakeLink>BLOCKCHAIN</FakeLink>
          </span>
          <span>
            <FakeLink>ETHERS.js</FakeLink>
          </span>
          <span>
            <TitleLink href={'/prosemirror'}>PROSE MIRROR</TitleLink>
          </span>
        </div>
        <div className="justify-self-end">
          <span>
            <TitleLink className={'text-primary'} href="/blog">
              BLOG
            </TitleLink>
          </span>
        </div>
      </nav>
      {!invertBar && (
        <div>
          <div className={'border-primary border-b-2'}></div>
        </div>
      )}

      <div className={'flex items-center justify-center'}>
        <div className="font-alt my-6 flex flex-col items-center justify-center text-4xl">
          <div className={'text-primary'}>Robusta Build</div>
          <div className={'my-4 text-6xl'}>💪🏗</div>
        </div>
      </div>
      {invertBar && (
        <div>
          <div className={'border-primary mb-10 border-b-2'}></div>
        </div>
      )}
    </header>
  );
};

// SimpleLink with class uppercase text-neutral-700 no-underline

interface TitleLinkProps {
  children: string;
  href: string;
  className?: string;
}
const TitleLink = ({ children, href, className }: TitleLinkProps) => {
  const classes = twCss(
    'font-bold uppercase text-primary no-underline hover:underline',
    className,
  );
  return (
    <SimpleLink href={href} className={classes}>
      {children}
    </SimpleLink>
  );
};

const FakeLink = ({ children }: { children: string }) => {
  return (
    <span className={'font-bold uppercase text-neutral-700 no-underline'}>
      {children}
    </span>
  );
};
