import { FreelanceAd } from '@/components/freelance/FreelanceAd';
import { PortfolioPreview } from '@/components/freelance/portfolio/PortfolioPreview';
import { WebResume } from '@/components/freelance/resume/WebResume';
import { SocialProof } from '@/components/freelance/social/SocialProof';
import { Skills } from '@/components/freelance/social/Skills';

export const FreelanceContent = () => {
  return (
    <div className={'bg-gray-100'}>
      <main className="main-container">
        <FreelanceAd />
        <SocialProof />
        <Skills />
        <PortfolioPreview />
        <WebResume className={'hidden md:block'} />
      </main>
    </div>
  );
};
