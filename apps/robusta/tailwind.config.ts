import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import daisyui from 'daisyui';

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
  theme: {
    screens: {
      tab: { max: defaultTheme.screens.md },
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        alt: ['"Roboto Slab"', 'serif'],
        code: ['"Roboto Mono"', 'monospace'],
      },
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

  plugins: [daisyui],
  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#562571',
          secondary: '#FFCC3F',
          accent: '#0B65C2',
          'accent-content': '#FFFFFF',
          'base-100': '#FFFFFF',
          'base-200': '#F3F4F6',
          'base-300': '#CCCCCC',
        },
      },
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
} satisfies Config;
