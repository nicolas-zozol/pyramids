import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import { robustaTheme } from './src/theme/robusta-theme';
import defaultTheme from 'tailwindcss/defaultTheme';

const theme = robustaTheme;

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/layouts/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ctas/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      tab: { max: '800px' },
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        /*main: theme.main,
        text: theme.text,
        background: theme.background,
        opposite: theme.opposite,
        panel: theme.panel,
        buttonPrimary: theme.buttonPrimary,
        buttonSecondary: theme.buttonSecondary,
        buttonCancel: theme.buttonCancel,
        link: theme.link,
        menu: theme.menu,
        table: theme.table,
        separation: theme.separation,
        ctaPrimary: theme.ctaPrimary,
        ctaSecondary: theme.ctaSecondary,
        ctaOther: theme.ctaOther,*/
      },
    },
  },
  plugins: [typography, daisyui],
} satisfies Config;
