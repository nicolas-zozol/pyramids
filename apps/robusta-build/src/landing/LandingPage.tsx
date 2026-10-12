import {
  CTA,
  Hero,
  PrinciplesList,
  type NotePost,
} from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.js';
import { ctaMascotSrc, heroMascotSrc } from '../design-system/assets.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';
import { NotesSection } from './NotesSection.js';

export interface LandingPageProps {
  /** The default Locale's notes feed, newest first; empty: no notes section. */
  posts: NotePost[];
}

/** The landing page: Hero, PrinciplesList, the notes section and CTA, every text from the page copy. */
export function LandingPage({ posts }: LandingPageProps) {
  const { contact, pageCopy } = getSeoPyramidsConfig();
  const { hero, principles, cta } = pageCopy.landing;
  const mailto = `mailto:${contact.email}`;

  return (
    <main>
      <Hero
        eyebrow={pageCopy.tagline}
        title={hero.title}
        subtitle={hero.subtitle}
        primaryCtaLabel={hero.emailLabel}
        primaryCtaHref={mailto}
        secondaryCtaLabel={hero.linkedInLabel}
        secondaryCtaHref={contact.linkedIn}
        footnote={hero.note}
        mascotSrc={heroMascotSrc}
        mascotAlt={hero.mascotAlt}
        annotation={hero.annotation}
        linkComponent={SiteLink}
      />
      <PrinciplesList
        eyebrow={principles.eyebrow}
        title={principles.title}
        principles={principles.principles}
      />
      <NotesSection posts={posts} />
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
