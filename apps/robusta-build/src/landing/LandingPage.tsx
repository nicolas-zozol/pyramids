import {
  CTA,
  FlowDiagram,
  Hero,
  PrinciplesList,
  type NotePost,
} from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { ctaMascotSrc, heroMascotSrc } from '../design-system/assets.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';
import { NotesSection } from './NotesSection.tsx';

export interface LandingPageProps {
  /** The page's Locale, whose page copy and blog home the page reads. */
  locale: string;
  /** The notes feed of that Locale, newest first; empty: no notes section. */
  posts: NotePost[];
}

/** The landing page of a Locale: Hero, the two diagrams, PrinciplesList, the notes section and CTA, every text from its page copy. */
export function LandingPage({ locale, posts }: LandingPageProps) {
  const { contact } = getSeoPyramidsConfig();
  const { tagline, landing } = getPageCopy(locale);
  const { hero, openSource, complete, principles, cta } = landing;
  const mailto = `mailto:${contact.email}`;

  return (
    <main>
      <Hero
        eyebrow={tagline}
        title={hero.title}
        subtitle={hero.subtitle}
        primaryCtaLabel={hero.emailLabel}
        primaryCtaHref={mailto}
        secondaryCtaLabel={hero.linkedInLabel}
        secondaryCtaHref={contact.linkedIn}
        footnote=""
        mascotSrc={heroMascotSrc}
        mascotAlt={hero.mascotAlt}
        annotation={hero.annotation}
        linkComponent={SiteLink}
      />
      <FlowDiagram id="open-source" {...openSource} />
      <FlowDiagram id="complete" {...complete} />
      <PrinciplesList
        eyebrow={principles.eyebrow}
        title={principles.title}
        principles={principles.principles}
      />
      <NotesSection locale={locale} posts={posts} />
      <CTA
        title={cta.title}
        subtitle={cta.subtitle}
        footnote={cta.footnote}
        emailPlaceholder=""
        ctaLabel={contact.email}
        ctaHref={mailto}
        mascotSrc={ctaMascotSrc}
        linkComponent={SiteLink}
      />
    </main>
  );
}
