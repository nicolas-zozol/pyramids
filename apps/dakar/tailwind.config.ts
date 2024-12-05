import { getTheme } from '@robusta/pyramids-themes/dist/themes/get-theme';
import type { Config } from 'tailwindcss';

// tslint:disable-next-line
const theme = getTheme('dakar') as any;

console.log({ theme });
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/layouts/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        main: theme.main,
        opposite: theme.opposite,
        text: theme.text,
        buttonPrimary: theme.buttonPrimary,
        buttonSecondary: theme.buttonSecondary,
        buttonCancel: theme.buttonCancel,
        link: theme.link,
        menu: theme.menu,
        background: theme.background,
        table: theme.table,
        separation: theme.separation,
        ctaPrimary: theme.ctaPrimary,
        ctaSecondary: theme.ctaSecondary,
        ctaOther: theme.ctaOther,
        panel: theme.panel,
      },
    },
  },
  plugins: [],
} satisfies Config;
