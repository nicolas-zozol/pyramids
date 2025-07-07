import { SimpleGridLayout } from '@robusta/pyramids-layouts';
import { HighlightableCard } from '@robusta/pyramids-layouts';
import Image, { StaticImageData } from 'next/image';
import fakeClubMed from './images/small-fake-club-med-640-427.jpg';
import fakeNgorLeft from './images/small-fake-ngor-left-640-360.jpg';
import fakeNgorRight from './images/small-fake-ngor-right-640-427.jpg';
import fakeSecret from './images/small-fake-secret-640-427.jpg';
import fakeVirage from './images/small-fake-virage-640-444.jpg';
import fakeVivier from './images/small-fake-vivier-640-369.jpg';
import fakeOuakam from './images/small-fake-ouakam-640-426.jpg';
import fakeYoff from './images/small-fake-yoff-640-401.jpg';

export const AllSpots = () => {
  return (
    <section className="mt-16">
      <h2>Surf Spots</h2>
      <SimpleGridLayout items={getSpotItems()} />
    </section>
  );
};

interface SpotProps {
  name: string;
  description: React.ReactNode;
  anchor: string;
  highlight?: boolean;
  image: StaticImageData;
  imageWidth: number;
  imageHeight: number;
}

const dakarSpots: SpotProps[] = [
  {
    name: 'Ngor Right',
    description: (
      <>
        Ngor Right is a world-class reef break for intermediate to advanced
        surfers. Known for its flawless rights, it offers powerful and
        consistent waves. Pay attention to the reef and sea urchins. It can also
        get very crowded.
      </>
    ),
    anchor: 'ngor-right',
    highlight: true,
    image: fakeNgorRight,
    imageWidth: 640,
    imageHeight: 427,
  },
  {
    name: 'Ngor Left',
    description: (
      <>
        Located on the other side of the island, Ngor Left is a softer spot.
        However, it requires a stronger swell and is less protected from the
        wind. The sea urchins are still there...
      </>
    ),
    anchor: 'ngor-left',
    image: fakeNgorLeft,
    imageWidth: 640,
    imageHeight: 360,
  },
  {
    name: 'Ouakam',
    description: (
      <>
        Located in the heart of the city, Ouakam is a 5-star spot. Protected by
        magnificent cliffs, the spot requires a significant ocean swell to work,
        almost exclusively in winter.
      </>
    ),
    anchor: 'ouakam',
    image: fakeOuakam,
    imageWidth: 640,
    imageHeight: 426,
  },
  {
    name: 'Yoff Beach',
    description: (
      <>
        Yoff Beach, much appreciated by locals and relatively untouched by
        tourism, is a beach break accessible to all levels, offering several
        peaks along the shoreline. It works particularly well in light winds
        with a northwest swell.
      </>
    ),
    anchor: 'yoff',
    image: fakeYoff,
    imageWidth: 640,
    imageHeight: 401,
  },
  {
    name: 'Virage',
    description: (
      <>
        Also a beach break, Virage shares many similarities with Yoff, featuring
        the same orientation. However, it has fewer peaks, leading to tougher
        competition in the lineup.
      </>
    ),
    anchor: 'virage',
    image: fakeVirage,
    imageWidth: 640,
    imageHeight: 444,
  },
  {
    name: 'Secret Spot',
    description: (
      <>
        Located in the heart of the Almadies Riviera, “Secret Spot” is no longer
        much of a secret. Despite a few sea urchins, access remains relatively
        easy and even allows parents to keep an eye on their children. The wave
        is fun yet very short and technical, attracting a crowd: it’s where
        surfers come to show off and impress one another.
      </>
    ),
    anchor: 'secret-spot',

    image: fakeSecret,
    imageWidth: 640,
    imageHeight: 427,
  },

  {
    name: 'Vivier',
    description: (
      <>
        Vivier offers two waves: a left and a right. The first works at low
        tide, the other at high tide. It requires either a large north swell or
        a south swell. At entrance and lower tide, beware of the sharp rocks.
      </>
    ),
    anchor: 'vivier',
    image: fakeVivier,
    imageWidth: 640,
    imageHeight: 369,
    highlight: true,
  },

  {
    name: 'Club Med',
    description: (
      <>
        Located near the now-abandoned Club Med, this third spot in the Almadies
        is more powerful than Vivier, but also more dangerous and extremely
        difficult to access. However, it is rarely crowded.
      </>
    ),
    anchor: 'club-med',
    image: fakeClubMed,
    imageWidth: 640,
    imageHeight: 427,
  },
];

function getSpotItems() {
  return dakarSpots.map((spot, index) => (
    <HighlightableCard
      key={index}
      content={getSpotContentWithImages(spot)}
      title={spot.name}
      highlight={spot.highlight}
      highlightClass="border-2 border-separation-secondary"
      highlightText="Favourite spot"
    />
  ));
}

function getSpotContentWithImages(spot: SpotProps) {
  // card with image as a top-right floater
  // with float:right css
  return (
    <div>
      <div className="floaterRight max-w-[40%] pb-4 pl-4">
        {spot.image && (
          <Image
            src={spot.image}
            alt={spot.name}
            width={spot.imageWidth}
            height={spot.imageHeight}
          />
        )}
      </div>
      <div className="text-gray-700">{spot.description}</div>
    </div>
  );
}
