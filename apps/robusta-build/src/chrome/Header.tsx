import { SiteHeader, type NavLink } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { wordmarkSrc } from '../design-system/assets.ts';
import { LOCALES, urlScheme } from '../routing/scheme.ts';
import { buildUrl, type PageUrl } from '../routing/url-scheme/index.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';

interface HeaderProps {
  /** The page's Locale, whose page copy the header reads. */
  locale: string;
  /** The same page in the other Locales that have it. */
  counterparts: PageUrl[];
}

/** SiteHeader in the page copy of `locale`: wordmark to the landing of `locale`, one link per other Locale to its counterpart or else its landing, contact. */
export function Header({ locale, counterparts }: HeaderProps) {
  const { contact } = getSeoPyramidsConfig();
  const { header } = getPageCopy(locale);

  return (
    <SiteHeader
      wordmarkSrc={wordmarkSrc}
      homeHref={buildUrl(urlScheme, { kind: 'landing', locale })}
      links={localeLinks(locale, counterparts)}
      ctaLabel={header.contactLabel}
      ctaHref={`mailto:${contact.email}`}
      linkComponent={SiteLink}
    />
  );
}

function localeLinks(locale: string, counterparts: PageUrl[]): NavLink[] {
  return LOCALES.filter((other) => other !== locale).map((other) => {
    const counterpart = counterparts.find((page) => page.locale === other) ?? {
      kind: 'landing',
      locale: other,
    };
    return {
      label: getPageCopy(other).localeName,
      href: buildUrl(urlScheme, counterpart),
      locale: other,
    };
  });
}
