import { colors } from '../colors';

interface TText {
  main: string;
  secondary: string;
  opposite: string;
  filledText: string;
}

interface TButton {
  primaryButtonColor: string;
  primaryButtonBackgroundColor: string;
}

interface TLink {
  standardLinkColor: string;
}

interface TMenu {
  menuLinkColor: string;
  menuLinkSelectedBackgroundColor: string;
  menuLinkSelectedColor: string;
}

interface TBackground {
  body: string;
  panelBackground: string;
  boxShadow: string;
}

interface TTable {
  rowSeparator: string;
}

interface TSeparation {
  standardBorderColor: string;
  hr: string;
}

interface TCtas {
  background: string;
  text: string;
}

export interface SiteTheme {
  text: TText;
  button: TButton;
  link: TLink;
  menu: TMenu;
  background: TBackground;
  table: TTable;
  separation: TSeparation;
  ctas: TCtas;
}

export const standardTheme: SiteTheme = {
  text: {
    main: colors.almostBlack,
    secondary: colors.almostWhite,
    opposite: colors.almostWhite,
    filledText: '#FDF9FF',
  },
  button: {
    primaryButtonColor: '#FFFFFF',
    primaryButtonBackgroundColor: '#01013D',
  },
  link: {
    standardLinkColor: '#0E0E2B',
  },
  menu: {
    menuLinkColor: '#0E0E2B',
    menuLinkSelectedBackgroundColor: '#01013D',
    menuLinkSelectedColor: '#FFFFFF',
  },
  background: {
    body: '#FDF9FF',
    panelBackground: '#FFFFFF',
    boxShadow: 'rgba(0, 0, 0, 0.1)',
  },
  table: {
    rowSeparator: '#E9E5F4',
  },
  separation: {
    standardBorderColor: '#53536E',
    hr: '#E9E5F4',
  },
  ctas: {
    background: colors.alpha(colors.darkBlue, 0.6),
    text: colors.white,
  },
};
