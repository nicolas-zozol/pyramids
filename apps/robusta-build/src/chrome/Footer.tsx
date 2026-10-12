import { SiteFooter } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.js';
import { wordmarkSrc } from '../design-system/assets.js';
import { urlScheme } from '../routing/scheme.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';

const NO_COLUMN: never[] = [];

/** SiteFooter from the Site configuration: tagline, copyright, no column, read in the default Locale. */
export function Footer() {
  const { pageCopy } = getSeoPyramidsConfig();

  return (
    <div lang={urlScheme.defaultLocale}>
      <SiteFooter
        wordmarkSrc={wordmarkSrc}
        tagline={pageCopy.tagline}
        columns={NO_COLUMN}
        copyright={pageCopy.footer.copyright}
        versionLine=""
        linkComponent={SiteLink}
      />
    </div>
  );
}
