import { FullHeader } from '@/components/FullHeader';

export default function Home() {
  return (
    <>
      <FullHeader isHome={true} />
      <main className="flex flex-col text-lg">Migration</main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
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
