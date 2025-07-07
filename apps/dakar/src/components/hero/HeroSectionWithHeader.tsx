import { EmptyLine } from '@robusta/pyramids-layouts';
import { Header } from '../header/Header';
import hero from './secret-llm.png'; // Use Next.js asset imports

export const HeroSectionWithHeader = () => {
  return (
    <section className="bg-base-100 text-base-content relative w-full bg-cover bg-center">
      <Header />

      <div className="hero relative h-[400px] w-full">
        <div className="absolute z-10 mx-auto h-[400px] w-full">
          <div
            className="h-[400px] w-full bg-black bg-cover bg-center opacity-70"
            style={{ backgroundImage: `url(${hero.src})` }}
          >
            {/* Opacity overlay */}
          </div>
        </div>
        <div className="rounded-lg absolute left-2 top-5 z-20 mt-2 bg-neutral-200 p-2 opacity-90">
          <h1 className="mx-10 text-2xl">The best guide to Surf in Dakar 🏄</h1>
        </div>
        <div className="h-[100px]"></div>
      </div>
    </section>
  );
};
