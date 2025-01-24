import * as React from 'react';
import { PortfolioItem } from './PortfolioItem';

import docdokuPlm from './images/docdoku-plm.png';
import nautoEventDetails from './images/nauto-event-details.png';
import swaapVault from './images/swaap-vault.png';
import { SimpleLink } from '@robusta/pyramids-links';
import { EmptyLine } from '@robusta/pyramids-layouts';

interface PortfolioPreviewProps {
  className?: string;
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  className,
}) => {
  return (
    <section className={className}>
      <h2>Portfolio</h2>
      <PortfolioItem images={[swaapVault, nautoEventDetails, docdokuPlm]} />
      <EmptyLine />
      <SimpleLink href={'/portfolio'}>See full portfolio</SimpleLink>
    </section>
  );
};
