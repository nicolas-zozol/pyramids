import { BlogConfig } from '@/logic/posts';

const mission = 'Building Internet the right way';
const url = 'https://www.robusta.build';

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

const robustaPyramidsConfig: SeoPyramidsConfig = {
  domain: url,
  siteName: 'Robusta Build',
  siteTitle: 'Robusta Build: Freelance ethers.js, solidity, web, blockchain',
  mission,
  logo: `${url}/images/logo.png`,
  defaultLocale: 'en',
  otherLocales: ['fr'],
  blogConfig: {
    defaultLocale: 'en',
    debugImagePath: true,
    mandatoryKeywords: ['robusta build', 'freelance'],
    rollSize: 4,
    author: 'Nicolas Zozol',
  },
};

export function getSeoPyramidsConfig() {
  return robustaPyramidsConfig;
}
