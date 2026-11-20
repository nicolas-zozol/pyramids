import { SiteHeader, type NavLink } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { useContactEmail } from '../components/use-contact-email.ts';
import { wordmarkSrc } from '../design-system/assets.ts';
import { LOCALES, urlScheme } from '../routing/scheme.ts';
import {
  buildUrl,
  type PageUrl,
  type RollUrl,
} from '../routing/url-scheme/index.ts';
import { MASALA_ANCHOR, ROOFTOP_ANCHOR } from '../landing/LandingPage.tsx';
import { rbCompoundUrl } from '../rb-compound/index.ts';
import { getPageCopy } from '../seopyramids.config.ts';

interface HeaderProps {
  /** The page's Locale, whose page copy the header reads. */
  locale: string;
  /** The same page in the other Locales that have it. */
  counterparts: PageUrl[];
  /** The rolls of that Locale, blog home first; no link to the articles when it has none. */
  rolls?: RollUrl[];
}

/** SiteHeader in the page copy of `locale`: wordmark to the landing of `locale`, the two products, Masala Parser and the articles when the Locale has a blog home, one link per other Locale to its counterpart or else its landing, contact. */
export function Header({ locale, counterparts, rolls = [] }: HeaderProps) {
  const { header } = getPageCopy(locale); // first: an unknown Locale throws before any hook
  const email = useContactEmail();

  return (
    <SiteHeader
      wordmarkSrc={wordmarkSrc}
      homeHref={buildUrl(urlScheme, { kind: 'landing', locale })}
      sections={sectionLinks(locale, rolls)}
      links={localeLinks(locale, counterparts)}
      ctaLabel={header.contactLabel}
      ctaHref={`mailto:${email}`}
      linkComponent={SiteLink}
    />
  );
}

function sectionLinks(locale: string, rolls: RollUrl[]): NavLink[] {
  const { nav } = getPageCopy(locale).header;
  const landing = buildUrl(urlScheme, { kind: 'landing', locale });
  const blogHome = rolls.find((roll) => roll.kind === 'blog-home');
  return [
    {
      label: nav.rooftop,
      href: `${landing}#${ROOFTOP_ANCHOR}`,
      emphasis: true,
    },
    { label: nav.rbCompound, href: rbCompoundUrl(locale), emphasis: true },
    { label: nav.masala, href: `${landing}#${MASALA_ANCHOR}` },
    ...(blogHome === undefined
      ? []
      : [{ label: nav.articles, href: buildUrl(urlScheme, blogHome) }]),
  ];
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
