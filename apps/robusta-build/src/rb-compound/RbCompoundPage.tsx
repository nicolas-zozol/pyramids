import {
  CTA,
  FlowDiagram,
  PrinciplesList,
  ProductHero,
  QuestionsList,
} from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.tsx';
import { useContactEmail } from '../components/use-contact-email.ts';
import { ctaMascotSrc } from '../design-system/assets.ts';
import { getPageCopy } from '../seopyramids.config.ts';
import { rbCompoundUrl } from './rb-compound-head.ts';

export interface RbCompoundPageProps {
  /** The page's Locale, whose page copy the page reads. */
  locale: string;
}

/** The page of RB Compound in a Locale: ProductHero, the agents, their open questions, boss, PrinciplesList and CTA, every text from its page copy. */
export function RbCompoundPage({ locale }: RbCompoundPageProps) {
  const email = useContactEmail();
  const { hero, agents, openQuestions, boss, principles, cta } =
    getPageCopy(locale).rbCompound;
  const mailto = `mailto:${email}`;
  const [epic, stories, questions, design, docs] = hero.documents;
  const [epicman, storyman, bsman, designman, tddman, docman] =
    agents.steps.map((step) => step.label);
  const codeHref = agents.caveatLink?.href ?? '';

  return (
    <main>
      <ProductHero
        kicker={hero.kicker}
        title={hero.title}
        lede={hero.lede}
        primaryCta={{ label: hero.codeLabel, href: codeHref }}
        secondaryCta={{
          label: hero.agentsLabel,
          href: `${rbCompoundUrl(locale)}#agents`,
        }}
        note={hero.license}
        cascadeLabel={hero.cascadeLabel}
        cascade={[
          { kind: 'sheet', name: epic, who: epicman },
          { kind: 'sheet', name: stories, who: storyman },
          { kind: 'sheet', name: questions, who: bsman },
          { kind: 'sheet', name: design, who: designman },
          { kind: 'gate', ...hero.gate },
          { kind: 'command', agent: tddman },
          { kind: 'sheet', name: docs, who: docman },
        ]}
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
        ctaLabel={email}
        ctaHref={mailto}
        mascotSrc={ctaMascotSrc}
        linkComponent={SiteLink}
      />
    </main>
  );
}
