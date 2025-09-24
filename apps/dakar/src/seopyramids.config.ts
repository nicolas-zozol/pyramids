const mission = 'Le meilleur guide pour surfer à Dakar';
const url = 'https://www.dakar.surf';

export interface BlogConfig {
  defaultLocale: string;
  otherLocales: string[];
  debugImagePath: boolean;
  mandatoryKeywords: string[];
  rollSize: number;
  author?: string;
  getCategories: () => Promise<string[][]>;
}

interface SeoPyramidsConfig {
  domain: string;
  siteName: string;
  siteTitle: string;
  mission?: string;
  logo: string;
  // number of items to display in the roll
  defaultLocale: string;
  otherLocales: string[];
  blogConfig: BlogConfig;
}

const dakarPyramidsConfig: SeoPyramidsConfig = {
  domain: url,
  siteName: 'Dakar.surf',
  siteTitle: 'Le meilleur guide pour surfer à Dakar',
  mission,
  logo: `${url}/images/logo.png`,
  defaultLocale: 'fr',
  otherLocales: [],
  blogConfig: {
    defaultLocale: 'en',
    debugImagePath: false,
    mandatoryKeywords: ['robusta build', 'freelance'],
    rollSize: 12,
    otherLocales: ['fr'],
    author: 'Nicolas Zozol',
    getCategories: async () => {
      return [];
    },
  },
};

export function getSeoPyramidsConfig() {
  return dakarPyramidsConfig;
}
