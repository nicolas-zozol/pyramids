enum Tide {
  Low = 'low',
  Mid = 'mid',
  High = 'high',
}

enum Direction {
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
}

export interface Spot {
  name: string;
  slug: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'beach break' | 'point break' | 'reef break';
  bestTided: Tide[];
  bestSwellDirections: Direction[];
  worstWindDirections: Direction[];
  latitude: number;
  longitude: number;
}

/*
* From North to South
Here are the spots
- Yoff
- Virage
- Ngor Left
- Ngor Right
- Club Med
- Secret
- Vivier left and right
- Ouakam
- La petite côte
- Cap Skirring
* */
export const spots: Spot[] = [
  {
    name: 'Yoff',
    slug: 'yoff',
    description: `BCEAO Beach in Yoff, much appreciated by locals and relatively untouched by
        tourism, is a beach break accessible to all levels, offering several
        peaks along the shoreline.`,
    level: 'beginner',
    type: 'beach break',
    bestTided: [Tide.Low, Tide.Mid],
    bestSwellDirections: [Direction.NW, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.76331102603314,
    longitude: -17.464542383142774,
  },
  {
    name: 'Virage',
    slug: 'virage',
    description:
      'Urban beach break between Ngor and Yoff. Quick to check while passing by. Often uncrowded, with bars close by to stash a key and refuel post‑session.',
    level: 'intermediate',
    type: 'beach break',
    bestTided: [Tide.Low, Tide.Mid],
    bestSwellDirections: [Direction.NW, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.755676530995629,
    longitude: -17.49510178247376,
  },
  {
    name: 'Ngor Left',
    slug: 'ngor-left',
    description:
      'Faster, more condition‑dependent left that needs friendlier wind and extra energy. Shallow reef with urchins.',
    level: 'advanced',
    type: 'reef break',
    bestTided: [Tide.High, Tide.Mid],
    bestSwellDirections: [Direction.N, Direction.NW, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.756008257716884,
    longitude: -17.510895437926944,
  },
  {
    name: 'Ngor Right',
    slug: 'ngor-right',
    description:
      'Sheltered, consistent right off Ngor island with clean, peeling walls. Reef and urchins—booties recommended.',
    level: 'intermediate',
    type: 'reef break',
    bestTided: [Tide.High, Tide.Mid],
    bestSwellDirections: [Direction.NW, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.755177802192229,
    longitude: -17.517504760303797,
  },
  {
    name: 'Club Med',
    slug: 'club-med',
    description:
      'Technical, powerful reef that often works on medium swells. Remote, rocky entry/exit with urchins—best for experienced surfers, not alone.',
    level: 'advanced',
    type: 'reef break',
    bestTided: [Tide.High, Tide.Mid],
    bestSwellDirections: [Direction.NW, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.740590877247234,
    longitude: -17.527472483389396,
  },
  {
    name: 'Secret',
    slug: 'secret',
    description:
      'Family‑friendly Almadies beach zone with a festive vibe. Short, hollow waves with delicate entry/exit—follow the locals’ channel.',
    level: 'intermediate',
    type: 'reef break',
    bestTided: [Tide.Mid, Tide.Low],
    bestSwellDirections: [Direction.NW, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.740632091446791,
    longitude: -17.521779279342535,
  },
  {
    name: 'Vivier Left & Right',
    slug: 'vivier-left-and-right',
    description:
      'Two complementary waves near Secret. Left starts over a rocky, urchin‑studded takeoff; Right often works when Left fades. Entries/exits are delicate.',
    level: 'intermediate',
    type: 'reef break',
    bestTided: [Tide.Low, Tide.Mid, Tide.High],
    bestSwellDirections: [Direction.N, Direction.NW, Direction.S],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.739876447576064,
    longitude: -17.519801698606216,
  },
  {
    name: 'Ouakam',
    slug: 'ouakam',
    description:
      'World‑class but fickle reef by the mosque. Needs solid north (or rare south) swell; otherwise too close to rocks. Experts only when working.',
    level: 'advanced',
    type: 'reef break',
    bestTided: [Tide.High],
    bestSwellDirections: [Direction.N, Direction.NW, Direction.S],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.72739347830483,
    longitude: -17.507487727850425,
  },
  {
    name: 'La Petite Côte',
    slug: 'la-petite-cote',
    description:
      'Southern coastline (Saly, La Somone, Popenguine): mellow beach‑break options that fire less frequently than Dakar—perfect for a balneary getaway.',
    level: 'beginner',
    type: 'beach break',
    bestTided: [Tide.Low],
    bestSwellDirections: [Direction.W, Direction.SW],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 14.48101808737258,
    longitude: -17.084318698047227,
  },
  {
    name: 'Cap Skirring (Casamance)',
    slug: 'cap-skirring',
    description:
      'Tropical Casamance coastline with long beaches and sparse crowds. When conditions align, you’ll find quality waves with a wild backdrop.',
    level: 'intermediate',
    type: 'beach break',
    bestTided: [Tide.Low],
    bestSwellDirections: [Direction.SW, Direction.S, Direction.W],
    worstWindDirections: [Direction.E, Direction.SE, Direction.S],
    latitude: 12.337032298293664,
    longitude: -16.714702962581757,
  },
];

export function getSpotBySlug(slug: string): Spot | undefined {
  return spots.find((spot) => spot.slug === slug);
}
