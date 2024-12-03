import {
  SimpleCardComponent,
  SimpleGridLayout,
} from '@robusta/pyramids-layouts';

export const AllSpots = () => {
  return (
    <section>
      <h2>Surf Spots</h2>
      <SimpleGridLayout items={getSpotItems()} />
    </section>
  );
};

interface SpotProps {
  name: string;
  description: string;
  anchor: string;
}

const dakarSpots: SpotProps[] = [
  {
    name: 'Ngor Right',
    description:
      'Ngor Right is a world-class reef break suited for intermediate to advanced surfers. Known for its long, clean right-handers, the spot offers powerful waves and consistent swells. The main difficulty lies in the sharp reef beneath the surface and strong currents, which require careful navigation. The charm of Ngor Right is its scenic surroundings, with views of Ngor Island and an authentic Senegalese vibe that makes every session unforgettable.',
    anchor: 'ngor-right',
  },
  {
    name: 'Yoff Beach',
    description:
      'Perfect for beginners and intermediate surfers, Yoff Beach features a sandy bottom with gentle, forgiving waves. The spot is excellent for learning, but it can become crowded with locals and surf schools. While the waves lack the power of reef breaks, the vibrant fishing village atmosphere and accessibility make Yoff a go-to spot for a relaxed surf day.',
    anchor: 'yoff',
  },
  {
    name: 'Secret Spot',
    description:
      'Hidden away from the crowds, Secret Spot is ideal for advanced surfers looking for a challenge. This reef break produces powerful and hollow waves, particularly during big swells. The main difficulties are the shallow reef and tricky paddle-outs, but the secluded beauty and pristine conditions make it worth the effort for thrill-seekers.',
    anchor: 'secret-spot',
  },
  {
    name: 'Virage',
    description:
      "Virage is a versatile spot offering a mix of beach and reef breaks, catering to intermediate surfers. It’s known for its fast, punchy waves that can form barrels on the right day. The main challenge comes from shifting sandbanks and occasional strong winds. Its proximity to Dakar's airport and vibrant local scene makes it a favorite for travelers.",
    anchor: 'virage',
  },
  {
    name: 'Ouakam',
    description:
      'Located near the iconic Mosque of Divinity, Ouakam is a breathtaking reef break for advanced surfers. It features steep, powerful waves with long rides. The shallow reef and strong rip currents pose significant challenges. However, the picturesque cliffs and turquoise waters create a surreal surfing experience.',
    anchor: 'ouakam',
  },
  {
    name: 'Almadies',
    description:
      'Almadies offers consistent reef breaks suited for intermediate to advanced surfers. The spot is renowned for its variety, with both left and right-hand waves depending on the swell direction. The sharp reef and strong tides demand caution, but the laid-back vibe and local seafood joints nearby make it an all-around favorite.',
    anchor: 'almadies',
  },
  {
    name: 'N’gor Left',
    description:
      'N’gor Left is a softer, more forgiving break compared to its counterpart, Ngor Right, making it great for beginners and intermediates. The waves here are playful and less powerful, ideal for practicing turns and building confidence. The main interest lies in its peaceful setting and accessibility via a short boat ride to Ngor Island.',
    anchor: 'ngor-left',
  },
  {
    name: 'Le Monument',
    description:
      'Le Monument, near the African Renaissance Monument, is a powerful beach break for advanced surfers. It produces heavy barrels, especially during the winter months. The main challenges include heavy shore breaks and unpredictable wave sections. The dramatic backdrop of the monument adds cultural significance to this thrilling surf spot.',
    anchor: 'le-monument',
  },
];

function getSpotItems() {
  return dakarSpots.map((spot, index) => (
    <SimpleCardComponent
      key={index}
      content={spot.description}
      title={spot.name}
    />
  ));
}
