import { EmptyLine } from '@robusta/pyramids-layouts';
import { Header } from '../header/Header';
import hero from './hero-secret-surf-small.jpg'; // Use Next.js asset imports

export const HeroSectionWithHeader = () => {
  return (
    <section className="relative bg-background-hero bg-cover bg-center w-full">
      <Header />
      <EmptyLine size={2} />
      <h1 className="text-white text-4xl mx-10">
        The best guide to 🏄 in Dakar 🌊
      </h1>
      <EmptyLine size={2} />

      <div className="relative h-[400px]  w-full ">
        <div className="absolute  mx-auto h-[400px] w-full z-10 ">
          <div className="w-[70%] mx-auto">
            <div
              className="h-[400px] bg-cover bg-center w-full top-40"
              style={{ backgroundImage: `url(${hero.src})` }}
            ></div>
          </div>
        </div>

        <div className="relative h-[100px] bg-background-hero"></div>
        <div className="relative h-[200px] bg-background-hero  w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="200"
            viewBox="0 0 1024 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,200 L1024,0 L1024,200  Z"
              stroke="white"
              strokeWidth="2"
              fill="white"
            />
          </svg>
        </div>
        <div className="h-[100px] bg-background-body"></div>
      </div>
    </section>
  );
};
