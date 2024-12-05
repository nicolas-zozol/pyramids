import { EmptyLine } from '@robusta/pyramids-layouts';
import { Header } from '../header/Header';
import hero from './hero-secret-surf-small.jpg'; // Use Next.js asset imports

export const HeroSectionWithHeader = () => {
  return (
    <section className="relative bg-background-hero bg-cover bg-center w-full">
      <Header />
      <EmptyLine size={2} />
      {/*<div className="absolute inset-0 bg-blue-900 bg-opacity-40"></div>*/}
      <h1 className="text-white text-4xl mx-10">
        The best guide to surf in Dakar 🌊 🏄‍
      </h1>
      <EmptyLine size={2} />

      <div className="relative h-[400px]  w-full ">
        <div className="absolute  mx-auto h-[400px] w-full">
          <div className="w-[70%] mx-auto">
            <div
              className="h-[400px] bg-cover bg-center w-full top-40"
              style={{ backgroundImage: `url(${hero.src})` }}
            ></div>
          </div>
        </div>

        <div className="h-[200px] bg-background-hero"></div>
        <div className="h-[200px] bg-background-body"></div>
      </div>
    </section>
  );
};
