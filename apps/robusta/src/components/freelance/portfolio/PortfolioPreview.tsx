import * as React from 'react';
import { PortfolioItem } from './PortfolioItem';

import docdokuPlm from './images/docdoku-plm.png';
import nautoEventDetails from './images/nauto-event-details.png';
import swaapVault from './images/swaap-vault.png';
import { SimpleLink } from '@robusta/pyramids-links';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { H2Title } from '@/components/title/H2Title';
import { twCss } from '@robusta/pyramids-helpers';
import Link from 'next/link';

interface PortfolioPreviewProps {
  className?: string;
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  className,
}) => {
  const classes = twCss('', className);

  return (
    <section className={classes}>
      <H2Title>Portfolio</H2Title>
      <PortfolioItem
        images={[swaapVault, nautoEventDetails, docdokuPlm]}
        className={'my-10'}
      />
      <EmptyLine />
      <Link className={''} href={'/portfolio'}>
        <span className={'btn btn-accent'}>See full portfolio</span>
      </Link>
    </section>
  );
};
