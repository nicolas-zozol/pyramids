import { FreelanceAd } from '@/components/freelance/FreelanceAd';
import { PortfolioPreview } from '@/components/freelance/portfolio/PortfolioPreview';
import { WebResume } from '@/components/freelance/resume/WebResume';
import { SocialProof } from '@/components/freelance/social/SocialProof';
import { Skills } from '@/components/freelance/social/Skills';

export const FreelanceContent = () => {
  return (
    <div>
      <div
        className={'full-container bg-secondary/30 mt-0 flex justify-center'}
      >
        <FreelanceAd className={''} />
      </div>
      <main className="main-container">
        <SocialProof />
        <Skills />
        <PortfolioPreview />
        <WebResume className={'hidden md:block'} />
      </main>
    </div>
  );
};
