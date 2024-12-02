import { TwoColumn } from '@robusta/pyramids-layouts';
import Image from 'next/image';
import { FiMapPin } from 'react-icons/fi';
import Almadies from './almadies-small.png';

export const PlacesToStay = () => {
  return (
    <section>
      <h2>Places to Stay</h2>

      <TwoColumn
        leftContent={<MaremeText />}
        rightContent={<AlmadiesMap />}
        leftClassName="flex flex-col justify-center"
      />
      <div></div>
    </section>
  );
};

const MaremeText = () => {
  return (
    <div className="flex flex-col center">
      <div className="flex flex-col">
        <p>
          The best place to stay for surfers is{' '}
          <a
            href={'https://www.airbnb.fr/rooms/40506484'}
            className="standard"
            target="_blank"
          >
            Mareme&apos;s home
          </a>
        </p>
        <p>
          It's exactly between the spots of Ngor and Vivier. You can walk to the
          beach in 5 minutes.
        </p>
      </div>
    </div>
  );
};

const AlmadiesMap = () => {
  return (
    <div className="relative w-full h-[400px]">
      {/* Google Map Image */}
      <Image src={Almadies} alt="Map" className="h-[400px] object-cover" />
      {/* Pinpoint */}
      <FiMapPin
        className="absolute text-red-600"
        style={{
          top: '70%',
          left: '40%',
          transform: 'translate(-50%, -50%)', // Center the icon at the point
          fontSize: '2rem', // Adjust the size of the icon
        }}
      />
    </div>
  );
};