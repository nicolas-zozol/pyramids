import hero from './hero-secret-surf-small.jpg'; // Use Next.js asset imports

export const HeroSection = () => {
  return (
    <section
      className="relative h-[400px] bg-cover bg-center w-full"
      style={{ backgroundImage: `url(${hero.src})` }}
    >
      <div className="absolute inset-0 bg-blue-900 bg-opacity-40"></div>
      <div className="absolute bottom-10 z-10  w-full text-center">
        <h1 className="text-white text-4xl font-bold">
          The best guide to surf in Dakar 🌊 🏄‍
        </h1>
      </div>
    </section>
  );
};
