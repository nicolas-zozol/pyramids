import { About } from '@/components/freelance/About';
import { EmptyLine } from '@robusta/pyramids-layouts';

interface FreelanceContent {}

export const FreelanceContent = () => {
  return (
    <div className={'bg-gray-100'}>
      <main className="main-container">
        <EmptyLine size={2} />
        <About></About>
      </main>
    </div>
  );
};
