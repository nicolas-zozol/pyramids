import { About } from '@/components/freelance/About';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { PortfolioPreview } from '@/components/freelance/portfolio/PortfolioPreview';
import { WebResume } from '@/components/freelance/resume/WebResume';

interface FreelanceContent {}

export const FreelanceContent = () => {
  return (
    <div className={'bg-gray-100'}>
      <main className="main-container">
        <EmptyLine size={2} />
        <About />
        <EmptyLine size={2} />
        <PortfolioPreview />
        <EmptyLine size={2} />
        <WebResume />
      </main>
    </div>
  );
};
