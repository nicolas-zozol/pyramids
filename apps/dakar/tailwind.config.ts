import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

const colors = {
  red: '#921514', // Ferrari Red
  green: '#0ac5a9', // Mercedes Green
  blue: '#02284c', // Red Bull Blue
  orange: '#FFA500', // McLaren Orange
};

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/layouts/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ctas/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/links/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/helpers/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  plugins: [typography, daisyui],
  daisyui: {
    // Light & dark themes are added by default (it switches automatically based on OS settings)
    // You can add another theme among the list of 30+
    // Add "data-theme='theme_name" to any HTML tag to enable the 'theme_name' theme.
    // https://daisyui.com/
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: colors.red,
          secondary: colors.blue,
          accent: colors.orange,
          'accent-content': '#FFFFFF',
          'base-100': '#FFFFFF',
          'base-200': '#F3F4F6',
          'base-300': '#CCCCCC',
        },
      },
    ],
  },
} satisfies Config;
