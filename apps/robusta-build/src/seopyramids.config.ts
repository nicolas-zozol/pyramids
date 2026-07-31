import { wordmarkSrc } from './design-system/assets.js';

const mission = 'Building Internet the right way';
const url = 'https://www.robusta.build';

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
  defaultLocale: string;
  otherLocales: string[];
  blogConfig: BlogConfig;
}

const robustaBuildPyramidsConfig: SeoPyramidsConfig = {
  domain: url,
  siteName: 'Robusta Build',
  siteTitle: 'Robusta Build: Freelance ethers.js, solidity, web, blockchain',
  mission,
  // The design system's wordmark, resolved through the package's assets
  // subpath — no brand file is copied into `public/`. `logo` is a bare URL and
  // `domain` is absolute, so the root-relative hashed path is prefixed here.
  logo: `${url}${wordmarkSrc}`,
  defaultLocale: 'en',
  otherLocales: ['fr'],
  blogConfig: {
    defaultLocale: 'en',
    otherLocales: ['fr'],
    debugImagePath: false,
    mandatoryKeywords: ['robusta build', 'freelance'],
    rollSize: 12,
    author: 'Nicolas Zozol',
    // Empty until content-source lands: an empty result, never a throw, and no
    // content source read.
    getCategories: async () => {
      return [];
    },
  },
};

export function getSeoPyramidsConfig() {
  return robustaBuildPyramidsConfig;
}
