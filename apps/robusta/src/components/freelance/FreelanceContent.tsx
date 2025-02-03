import { FreelanceAd } from '@/components/freelance/FreelanceAd';
import { PortfolioPreview } from '@/components/freelance/portfolio/PortfolioPreview';
import { WebResume } from '@/components/freelance/resume/WebResume';
import { SocialProof } from '@/components/freelance/social/SocialProof';
import { Skills } from '@/components/freelance/social/Skills';
import { FeaturedPosts } from '@/components/blog/Featured';
import { Post } from '@/logic/posts';
import { FC } from 'react';
import { EmptyLine } from '@robusta/pyramids-layouts';

interface FreelanceContentProps {
  featured: Post[];
}

export const FreelanceContent: FC<FreelanceContentProps> = ({ featured }) => {
  // TODO: add some suspense stuff while post are loading

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
        <FeaturedPosts posts={featured}></FeaturedPosts>
        <EmptyLine />
      </main>
    </div>
  );
};
