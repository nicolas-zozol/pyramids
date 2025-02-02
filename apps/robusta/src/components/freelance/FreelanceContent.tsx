import { About } from '@/components/freelance/About';
import { PortfolioPreview } from '@/components/freelance/portfolio/PortfolioPreview';
import { WebResume } from '@/components/freelance/resume/WebResume';
import { SocialProof } from '@/components/freelance/social/SocialProof';
import { Skills } from '@/components/freelance/social/Skills';
import { DesignSystem } from '@robusta/pyramids-helpers';

interface FreelanceContent {}

export const FreelanceContent = () => {
  return (
    <div className={'bg-gray-100'}>
      <main className="main-container">
        <About />
        <SocialProof />
        <Skills />
        <PortfolioPreview />
        <WebResume className={'hidden md:block'} />
        <DesignSystem className={'mt-80'} />
      </main>
    </div>
  );
};
