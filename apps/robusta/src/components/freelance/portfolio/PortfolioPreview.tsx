import * as React from 'react';
import { PortfolioCollection } from './PortfolioCollection';

import docdokuPlm from './images/docdoku-plm.png';
import nautoEventDetails from './images/nauto-event-details.png';
import swaapVault from './images/swaap-vault.png';
import { SimpleLink } from '@robusta/pyramids-links';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { H2Title } from '@/components/title/H2Title';
import { twCss } from '@robusta/pyramids-helpers';

interface PortfolioPreviewProps {
  className?: string;
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  className,
}) => {
  const classes = twCss('my-20', className);

  return (
    <section className={classes}>
      <H2Title>Portfolio</H2Title>
      <PortfolioCollection
        images={[swaapVault, nautoEventDetails, docdokuPlm]}
        className={'my-10'}
      />
      <EmptyLine />
      <SimpleLink href={'/portfolio'}>See full portfolio</SimpleLink>
    </section>
  );
};
