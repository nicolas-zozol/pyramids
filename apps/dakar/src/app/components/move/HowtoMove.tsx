import { SimplePhoneCTA } from '@robusta/pyramids-cta';
import Image from 'next/image';
import Pistard from './pistard.png';

export const HowToMove = () => {
  return (
    <section>
      <h2>How to Move Around Dakar</h2>
      <div>
        Upon arrival at Blaise Diagne International Airport, it's advisable to
        use official airport taxis. Be aware that these taxis are often older
        models and may not meet modern safety standards. The journey to central
        Dakar typically takes around 40 minutes and costs approximately 25,000
        XOF (about 38 euros).
      </div>
      <div>
        For greater flexibility during your stay, consider renting a vehicle
        from local providers such as Pistard Rent a Car.{' '}
        {/* Placeholder for Pistard Rent a Car image */}
        <Image src={Pistard} alt="Pistard Rent a Car" width={400} />
        <SimplePhoneCTA phoneNumber={'+221 76 875 50 95'} />
      </div>
      <div>
        Within the city, hailing a traditional yellow taxi is straightforward.
        While services like Uber are not available in Dakar, ride-hailing apps
        such as Heetch and Yango operate in the area. However, their service
        quality may not match that of Uber in larger cities.
      </div>
    </section>
  );
};
