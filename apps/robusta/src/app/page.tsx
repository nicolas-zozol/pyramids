import { FullHeader } from '@/components/header/FullHeader';
import { FreelanceContent } from '@/components/freelance/FreelanceContent';

export default function Home() {
  return (
    <>
      <FullHeader showHomePageLink={false} />
      <FreelanceContent></FreelanceContent>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.robusta.build"
          target="_blank"
        >
          Edited by Robusta Build
        </a>
      </footer>
    </>
  );
}
