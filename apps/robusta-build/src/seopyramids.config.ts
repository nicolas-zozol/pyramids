import { wordmarkSrc } from './design-system/assets.js';
import { ROLL_SIZE, urlScheme } from './routing/scheme.js';

const mission = 'Building Internet the right way';
const url = 'https://www.robusta.build';

export { ROLL_SIZE };

export interface BlogConfig {
  /** The single segment under which the site publishes its content section. */
  contentRoot: string;
  defaultLocale: string;
  otherLocales: string[];
  debugImagePath: boolean;
  mandatoryKeywords: string[];
  rollSize: typeof ROLL_SIZE;
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
    // The content section's four values come from the site's scheme module, so
    // the route table and the site configuration cannot state different ones.
    contentRoot: urlScheme.contentRoot,
    defaultLocale: urlScheme.defaultLocale,
    otherLocales: [...urlScheme.otherLocales],
    debugImagePath: false,
    mandatoryKeywords: ['robusta build', 'freelance'],
    rollSize: ROLL_SIZE,
    author: 'Nicolas Zozol',
    // Declared and read by nothing: the category URL set comes from the
    // articles. Removing the field belongs to content-source.
    getCategories: async () => {
      return [];
    },
  },
};

export function getSeoPyramidsConfig() {
  return robustaBuildPyramidsConfig;
}
