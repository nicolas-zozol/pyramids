import { SimplePhoneCTA } from '@robusta/pyramids-ctas';
import { TwoColumn } from '@robusta/pyramids-layouts';
import Image from 'next/image';
import React from 'react';
import Pistard from './pistard.png';

export const HowToMove = () => {
  return (
    <section className="bg-base-200 mt-16 p-2">
      <h2>How to Move Around Dakar</h2>

      <TwoColumn
        leftContent={<HailText />}
        rightContent={<PistardComponent />}
      />
    </section>
  );
};

const PistardComponent = () => {
  return (
    <div className="flex flex-col justify-center align-middle">
      <Image src={Pistard} alt="Pistard Rent a Car" width={400} />
      <SimplePhoneCTA phoneNumber={'+221 76 875 50 95'} />
    </div>
  );
};

const HailText = () => {
  return (
    <div className="prose">
      <h3>From the airport to Dakar</h3>
      <p>
        Upon arrival at Blaise Diagne International Airport, it's advisable to
        use official airport taxis. Be aware that these taxis are often older
        models and may not meet modern safety standards. The journey to central
        Dakar typically takes around 40 minutes and costs approximately 25,000
        XOF (about 38 euros).
      </p>
      <h3>Renting a car</h3>
      <p>
        Renting a car at the airport is feasable but expensive. I had too bad
        experience in Canaries to try at Dakar.
      </p>
      <p>
        I strongly recommend to contact{' '}
        <strong>Eric from Pistard Rent a car</strong>. The price is fair, they
        have{' '}
        <a
          href="https://www.google.fr/maps/place/Pistard+Rents+a+Car/@14.7441621,-17.5146305,17z/data=!3m1!4b1!4m6!3m5!1s0xec113be48e6886d:0x4693b6b73119d4ea!8m2!3d14.7441621!4d-17.5120556!16s%2Fg%2F11sf2c6knz!5m1!1e4?entry=ttu&g_ep=EgoyMDI0MTIwMi4wIKXMDSoASAFQAw%3D%3D"
          target={'_blank'}
          rel="nofollow"
        >
          {' '}
          great notations on Google
        </a>{' '}
        and the service is the best you can have.
      </p>
      <h3>Taxis</h3>
      <p>
        Within the city, hailing a traditional yellow taxi is straightforward.
        While services like Uber are not available in Dakar, ride-hailing apps
        such as Heetch and Yango operate in the area. However, their service
        quality may not match that of Uber in larger cities.
      </p>
    </div>
  );
};
