import { SiteHeader } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.js';
import { wordmarkSrc } from '../design-system/assets.js';
import { urlScheme } from '../routing/scheme.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';

const NO_NAVIGATION: never[] = [];

/** SiteHeader from the Site configuration: wordmark to /, contact, no nav, read in the default Locale. */
export function Header() {
  const { contact, pageCopy } = getSeoPyramidsConfig();

  return (
    <div lang={urlScheme.defaultLocale}>
      <SiteHeader
        wordmarkSrc={wordmarkSrc}
        links={NO_NAVIGATION}
        ctaLabel={pageCopy.header.contactLabel}
        ctaHref={`mailto:${contact.email}`}
        linkComponent={SiteLink}
      />
    </div>
  );
}
