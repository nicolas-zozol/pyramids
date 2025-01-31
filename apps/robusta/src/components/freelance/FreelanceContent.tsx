import { About } from '@/components/freelance/About';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { PortfolioPreview } from '@/components/freelance/portfolio/PortfolioPreview';
import { WebResume } from '@/components/freelance/resume/WebResume';
import { SocialProof } from '@/components/freelance/social/SocialProof';
import { Skills } from '@/components/freelance/social/Skills';
import { DesignSystem } from '@robusta/pyramids-helpers/dist/theme/DesignSystem';

interface FreelanceContent {}

export const FreelanceContent = () => {
  return (
    <div className={'bg-gray-100'}>
      <main className="main-container">
        <EmptyLine size={2} />
        <About />
        <SocialProof />
        <Skills />
        <EmptyLine size={2} />
        <PortfolioPreview />
        <EmptyLine size={2} />
        <WebResume />
      </main>

      <section className={'my-10'}>
        <DesignSystem></DesignSystem>
      </section>
    </div>
  );
};
