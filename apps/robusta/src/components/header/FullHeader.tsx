import { FC } from 'react';

import Link from 'next/link';
// TODO: not the right image
import './full-header.scss';
import { SimpleLink } from '@robusta/pyramids-links';
import { mergeCss, twCss } from '@robusta/pyramids-helpers';

interface Props {
  showHomePageLink?: boolean;
}
export const FullHeader: FC<Props> = ({ showHomePageLink = true }) => {
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
            <TitleLink href={''}>CLEAN CODE</TitleLink>
          </span>
          <span>
            <TitleLink href={''}>WEB</TitleLink>
          </span>
          <span>
            <TitleLink href={''}>BLOCKCHAIN</TitleLink>
          </span>
          <span>
            <TitleLink href={''}>SOLIDITY</TitleLink>
          </span>

          <span>
            <TitleLink href={''}>ETHERS.js</TitleLink>
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
      <div>
        <div className={'border-primary border-b-2'}></div>
      </div>

      <div className={'flex items-center justify-center'}>
        <div className="font-alt my-6 flex flex-col items-center justify-center text-4xl">
          <div className={'text-primary'}>Robusta Build</div>
          <div className={'my-4 text-6xl'}>💪🏗</div>
        </div>
      </div>
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
    'font-bold uppercase text-neutral-700 no-underline ',
    className,
  );
  return (
    <SimpleLink href={href} className={classes}>
      {children}
    </SimpleLink>
  );
};
