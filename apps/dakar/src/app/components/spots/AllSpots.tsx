import { SimpleGridLayout } from '@robusta/pyramids-layouts';
import { HighlightableCard } from '@robusta/pyramids-layouts/dist/cards/HighligthCard';
import Image, { StaticImageData } from 'next/image';
import pic1 from './images/pic-1.png';
import pic2 from './images/pic-2.png';
import pic3 from './images/pic-3.png';
import pic5 from './images/pic-5.png';
import pic6 from './images/pic-6.png';
import pic7 from './images/pic-7.png';
import pic8 from './images/pic-8.png';
import pic9 from './images/pic-9.png';

export const AllSpots = () => {
  return (
    <section className="text-main bg-background-body mt-16">
      <h2>Surf Spots</h2>
      <SimpleGridLayout items={getSpotItems()} />
    </section>
  );
};

interface SpotProps {
  name: string;
  description: string;
  anchor: string;
  highlight?: boolean;
  image?: StaticImageData;
}

const dakarSpots: SpotProps[] = [
  {
    name: 'Ngor Right',
    description:
      'Ngor Right is a world-class reef break suited for intermediate to advanced surfers. Known for its long, clean right-handers, the spot offers powerful waves and consistent swells. The main difficulty lies in the sharp reef beneath the surface and strong currents, which require careful navigation. The charm of Ngor Right is its scenic surroundings, with views of Ngor Island and an authentic Senegalese vibe that makes every session unforgettable.',
    anchor: 'ngor-right',
    image: pic1,
  },
  {
    name: 'Yoff Beach',
    description:
      'Perfect for beginners and intermediate surfers, Yoff Beach features a sandy bottom with gentle, forgiving waves. The spot is excellent for learning, but it can become crowded with locals and surf schools. While the waves lack the power of reef breaks, the vibrant fishing village atmosphere and accessibility make Yoff a go-to spot for a relaxed surf day.',
    anchor: 'yoff',
    image: pic2,
  },
  {
    name: 'Secret Spot',
    description:
      'Hidden away from the crowds, Secret Spot is ideal for advanced surfers looking for a challenge. This reef break produces powerful and hollow waves, particularly during big swells. The main difficulties are the shallow reef and tricky paddle-outs, but the secluded beauty and pristine conditions make it worth the effort for thrill-seekers.',
    anchor: 'secret-spot',
    highlight: true,
    image: pic3,
  },
  {
    name: 'Virage',
    description:
      "Virage is a versatile spot offering a mix of beach and reef breaks, catering to intermediate surfers. It’s known for its fast, punchy waves that can form barrels on the right day. The main challenge comes from shifting sandbanks and occasional strong winds. Its proximity to Dakar's airport and vibrant local scene makes it a favorite for travelers.",
    anchor: 'virage',
    image: pic9,
  },
  {
    name: 'Ouakam',
    description:
      'Located near the iconic Mosque of Divinity, Ouakam is a breathtaking reef break for advanced surfers. It features steep, powerful waves with long rides. The shallow reef and strong rip currents pose significant challenges. However, the picturesque cliffs and turquoise waters create a surreal surfing experience.',
    anchor: 'ouakam',
    image: pic5,
  },
  {
    name: 'Almadies',
    description:
      'Almadies offers consistent reef breaks suited for intermediate to advanced surfers. The spot is renowned for its variety, with both left and right-hand waves depending on the swell direction. The sharp reef and strong tides demand caution, but the laid-back vibe and local seafood joints nearby make it an all-around favorite.',
    anchor: 'almadies',
    image: pic6,
  },
  {
    name: 'N’gor Left',
    description:
      'N’gor Left is a softer, more forgiving break compared to its counterpart, Ngor Right, making it great for beginners and intermediates. The waves here are playful and less powerful, ideal for practicing turns and building confidence. The main interest lies in its peaceful setting and accessibility via a short boat ride to Ngor Island.',
    anchor: 'ngor-left',
    highlight: true,
    image: pic7,
  },
  {
    name: 'Le Monument',
    description:
      'Le Monument, near the African Renaissance Monument, is a powerful beach break for advanced surfers. It produces heavy barrels, especially during the winter months. The main challenges include heavy shore breaks and unpredictable wave sections. The dramatic backdrop of the monument adds cultural significance to this thrilling surf spot.',
    anchor: 'le-monument',
    image: pic8,
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
    />
  ));
}

function getSpotContentWithImages(spot: SpotProps) {
  // card with image as a top-right floater
  // with float:right css
  return (
    <div>
      <div className="floaterRight pl-4 pb-4">
        {spot.image && <Image src={spot.image} alt={spot.name} width={150} />}
      </div>
      <div className="text-gray-700">{spot.description}</div>
    </div>
  );
}
