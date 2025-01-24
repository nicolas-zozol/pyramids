import { FC } from 'react';

import Link from 'next/link';
// TODO: not the right image
import './full-header.scss';
import { SimpleLink } from '@robusta/pyramids-links';

interface Props {
  isHome: boolean;
}
export const FullHeader: FC<Props> = ({ isHome }) => {
  return (
    <header id="full-header">
      <nav className={'horizontalNav blog-container'}>
        {isHome && (
          <span className={'mr-40'}>
            <SimpleLink href="/apps/robusta/public">Home</SimpleLink>
          </span>
        )}

        <div className={'start'}>
          <span>
            <SimpleLink>CLEAN CODE</SimpleLink>
          </span>
          <span>
            <SimpleLink>WEB</SimpleLink>
          </span>
          <span>
            <SimpleLink>BLOCKCHAIN</SimpleLink>
          </span>
          <span>
            <SimpleLink>SOLIDITY</SimpleLink>
          </span>

          <span>
            <SimpleLink>ETHERS.js</SimpleLink>
          </span>
        </div>
        <div className="end">
          <span>
            <SimpleLink href="/blog">BLOG</SimpleLink>
          </span>
        </div>
      </nav>

      <div className={'mainLogo'}>
        <Link href={'/apps/robusta/public'} legacyBehavior={true}>
          <div className="logo">
            <div>Robusta Build</div>
            <div className={'emojis'}>💪🏗</div>
          </div>
        </Link>
      </div>
    </header>
  );
};
