import {
  CTA,
  FlowDiagram,
  Hero,
  PrinciplesList,
  QuestionsList,
} from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { ctaMascotSrc, heroMascotSrc } from '../design-system/assets.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';

export interface RbCompoundPageProps {
  /** The page's Locale, whose page copy the page reads. */
  locale: string;
}

/** The page of RB Compound in a Locale: Hero, the agents, their open questions, boss, PrinciplesList and CTA, every text from its page copy. */
export function RbCompoundPage({ locale }: RbCompoundPageProps) {
  const { contact } = getSeoPyramidsConfig();
  const { hero, agents, openQuestions, boss, principles, cta } =
    getPageCopy(locale).rbCompound;
  const mailto = `mailto:${contact.email}`;

  return (
    <main>
      <Hero
        eyebrow={hero.eyebrow}
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
      <FlowDiagram id="agents" {...agents} />
      <QuestionsList id="open-questions" {...openQuestions} />
      <FlowDiagram id="boss" {...boss} />
      <PrinciplesList
        eyebrow={principles.eyebrow}
        title={principles.title}
        principles={principles.principles}
      />
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
