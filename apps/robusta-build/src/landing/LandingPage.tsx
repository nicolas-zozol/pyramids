import {
  HomeHero,
  LibraryShowcase,
  ProductDoors,
  Workshop,
  type NotePost,
} from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { useContactEmail } from '../components/use-contact-email.ts';
import {
  presentationMascotSrc,
  rooftopShotSrcs,
  stonksBillboardSrc,
} from '../design-system/assets.ts';
import { rbCompoundUrl } from '../rb-compound/index.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl } from '../routing/url-scheme/index.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';
import {
  MASALA_GITHUB,
  MASALA_PACKAGE,
  MASALA_RECIPES,
  MASALA_VIDEO,
  MASALA_WORDS,
} from './masala-recipes.ts';
import { NotesSection } from './NotesSection.tsx';

export interface LandingPageProps {
  /** The page's Locale, whose page copy and blog home the page reads. */
  locale: string;
  /** The notes feed of that Locale, newest first; empty: no notes section. */
  posts: NotePost[];
}

/** The id of the Rooftop door, which every link to Rooftop leads to until it has a page of its own. */
export const ROOFTOP_ANCHOR = 'rooftop';

/** The id of Masala Parser's section. */
export const MASALA_ANCHOR = 'masala';

/** The landing page of a Locale: the building, the two products, Masala Parser, the notes section and the workshop, every text from its page copy. */
export function LandingPage({ locale, posts }: LandingPageProps) {
  const { contact } = getSeoPyramidsConfig();
  const { hero, products, masala, workshop } = getPageCopy(locale).landing;
  const { agents } = getPageCopy(locale).rbCompound;
  const email = useContactEmail();
  const mailto = `mailto:${email}`;
  const rbCompound = rbCompoundUrl(locale);
  const rbCompoundPath = `robusta.build${rbCompound} →`;
  const rooftop = `${buildUrl(urlScheme, { kind: 'landing', locale })}#${ROOFTOP_ANCHOR}`;
  const waitingList = `${mailto}?subject=${encodeURIComponent(products.rooftop.waitingListSubject)}`;

  return (
    <main>
      <HomeHero
        title={hero.title}
        eyebrow={hero.eyebrow}
        lede={hero.lede}
        primaryCta={{ label: hero.emailLabel, href: mailto }}
        secondaryCta={{ label: hero.linkedInLabel, href: contact.linkedIn }}
        billboardSrc={stonksBillboardSrc}
        billboardAlt={hero.billboardAlt}
        floors={[
          { level: 'roof', ...hero.roof, href: rooftop },
          {
            level: 'floor',
            ...hero.floor,
            href: rbCompound,
            pathLabel: rbCompoundPath,
          },
          { level: 'ground', ...hero.ground },
        ]}
        linkComponent={SiteLink}
      />
      <ProductDoors
        title={products.title}
        eyebrow={products.eyebrow}
        doors={[
          {
            id: ROOFTOP_ANCHOR,
            tone: 'blue',
            where: products.rooftop.where,
            name: products.rooftop.name,
            soon: products.rooftop.soon,
            say: products.rooftop.say,
            shots: rooftopShotSrcs.map((src, i) => ({
              src,
              alt: products.rooftop.shotAlts[i],
            })),
            action: {
              label: products.rooftop.waitingListLabel,
              href: waitingList,
            },
          },
          {
            tone: 'green',
            where: products.rbCompound.where,
            name: products.rbCompound.name,
            say: products.rbCompound.say,
            steps: agents.steps.map((step) => step.label),
            action: {
              label: products.rbCompound.actionLabel,
              href: rbCompound,
            },
            path: { label: rbCompoundPath, href: rbCompound },
          },
        ]}
        linkComponent={SiteLink}
      />
      <LibraryShowcase
        id={MASALA_ANCHOR}
        title={masala.title}
        eyebrow={masala.eyebrow}
        lede={masala.lede}
        ticks={masala.ticks}
        recipes={MASALA_RECIPES.map((recipe, i) => ({
          caption: masala.captions[i],
          lines: recipe.lines,
          result: recipe.result,
          resultLabel: masala.resultLabel,
        }))}
        wordsLead={masala.wordsLead}
        words={MASALA_WORDS.map((word) => ({
          ...word,
          meaning: masala.meanings[word.term],
        }))}
        install={{
          tool: 'npm',
          args: `install ${MASALA_PACKAGE}`,
          note: masala.installNote,
        }}
        links={[
          {
            label: `${MASALA_GITHUB.replace('https://', '')} →`,
            href: MASALA_GITHUB,
          },
          { label: masala.videoLabel, href: MASALA_VIDEO },
        ]}
        linkComponent={SiteLink}
      />
      <NotesSection locale={locale} posts={posts} />
      <Workshop
        title={workshop.title}
        eyebrow={workshop.eyebrow}
        lede={workshop.lede}
        facts={[
          { ...workshop.facts[0], tone: 'yellow' },
          { ...workshop.facts[1], tone: 'blue' },
        ]}
        primaryCta={{ label: email, href: mailto }}
        secondaryCta={{ label: workshop.linkedInLabel, href: contact.linkedIn }}
        fine={workshop.fine}
        mascotSrc={presentationMascotSrc}
        mascotAlt={workshop.mascotAlt}
        linkComponent={SiteLink}
      />
    </main>
  );
}
