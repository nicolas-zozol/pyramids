import hero from './hero.png'; // Use Next.js asset imports

export const HeroSection = () => {
    return (

    <section
        style={{
            backgroundImage: `url(${hero.src})`,
            height: '400px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
    >
        <h1>Welcome to Dakar Surf 🌊 🏄‍</h1>
    </section>
    );
};

