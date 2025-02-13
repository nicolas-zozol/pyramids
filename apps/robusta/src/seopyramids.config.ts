import { BlogConfig } from '@/logic/posts';
import { getCategories } from '@/logic/categories/robusta-categories';

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
    rollSize: 12,
    otherLocales: ['fr'],
    author: 'Nicolas Zozol',
    getCategories,
  },
};

export function getSeoPyramidsConfig() {
  return robustaPyramidsConfig;
}
