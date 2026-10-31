import { SiteFooter } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { wordmarkSrc } from '../design-system/assets.ts';
import { getPageCopy } from '../seopyramids.config.ts';

const NO_COLUMN: never[] = [];

interface FooterProps {
  /** The page's Locale, whose page copy the footer reads. */
  locale: string;
}

/** SiteFooter in the page copy of `locale`: tagline, copyright, no column; its language is the document's. */
export function Footer({ locale }: FooterProps) {
  const { tagline, footer } = getPageCopy(locale);

  return (
    <SiteFooter
      wordmarkSrc={wordmarkSrc}
      tagline={tagline}
      columns={NO_COLUMN}
      copyright={footer.copyright}
      versionLine=""
      linkComponent={SiteLink}
    />
  );
}
