import { SiteFooter, type FooterColumn } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { wordmarkSrc } from '../design-system/assets.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl, type RollUrl } from '../routing/url-scheme/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';

interface FooterProps {
  /** The page's Locale, whose page copy the footer reads. */
  locale: string;
  /** The first page of each roll of that Locale, blog home first; empty when it publishes nothing. */
  rolls: RollUrl[];
}

/** SiteFooter in the page copy of `locale`, with one column when `rolls` is not empty; its language is the document's. */
export function Footer({ locale, rolls }: FooterProps) {
  const { tagline, footer } = getPageCopy(locale);

  return (
    <SiteFooter
      wordmarkSrc={wordmarkSrc}
      tagline={tagline}
      columns={rolls.length === 0 ? [] : [rollsColumn(locale, rolls)]}
      copyright={footer.copyright}
      versionLine=""
      linkComponent={SiteLink}
    />
  );
}

function rollsColumn(locale: string, rolls: RollUrl[]): FooterColumn {
  const { footer } = getPageCopy(locale).listing;
  const collator = new Intl.Collator(locale);
  const categories = rolls
    .flatMap((roll) =>
      roll.kind === 'category'
        ? [
            {
              label: getCategoryLabel(locale, roll.category),
              href: buildUrl(urlScheme, roll),
            },
          ]
        : [],
    )
    .sort((a, b) => collator.compare(a.label, b.label));
  const blogHome = rolls
    .filter((roll) => roll.kind === 'blog-home')
    .map((roll) => ({
      label: footer.blogHomeLabel,
      href: buildUrl(urlScheme, roll),
    }));

  return { h: footer.title, items: [...blogHome, ...categories] };
}
