import { pyramidsColors } from '../colors';

interface TText {
  main: string;
  secondary: string;
  opposite: string;
  filledText: string;
}

interface TButton {
  text: string;
  bg: string;
}

interface TCta {
  text: string;
  bg: string;
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
  hero: string;
  panelBackground: string;
  boxShadow: string;
}

interface TTable {
  rowSeparator: string;
}

interface TSeparation {
  border: string;
  secondary: string;
  hr: string;
}

interface TPanel {
  text: string;
  bg: string;
  borderColor: string;
  boxShadow: string;
}
interface TCard {
  text: string;
  bg: string;
  borderColor: string;
  boxShadow: string;
}

export interface PyramidsTheme {
  main: string;
  opposite: string;
  text: TText;
  buttonPrimary: TButton;
  buttonSecondary: TButton;
  buttonCancel: TButton;
  link: TLink;
  menu: TMenu;
  background: TBackground;
  table: TTable;
  separation: TSeparation;
  ctaPrimary: TCta;
  ctaSecondary: TCta;
  ctaOther: TCta;
  card: TCard;
  panel: TPanel;
}

export const standardPyramidsTheme: PyramidsTheme = {
  main: pyramidsColors.almostBlack,
  opposite: pyramidsColors.almostWhite,
  text: {
    main: pyramidsColors.almostBlack,
    secondary: pyramidsColors.almostWhite,
    opposite: pyramidsColors.almostWhite,
    filledText: '#FDF9FF',
  },
  buttonPrimary: {
    text: '#FFFFFF',
    bg: '#01013D',
  },
  buttonSecondary: {
    text: '#01013D',
    bg: '#FFFFFF',
  },
  buttonCancel: {
    text: '#4e4d4d',
    bg: '#FFFFFF',
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
    hero: '#52459D',
    panelBackground: '#FFFFFF',
    boxShadow: 'rgba(0, 0, 0, 0.1)',
  },
  table: {
    rowSeparator: '#E9E5F4',
  },
  separation: {
    border: '#53536E',
    secondary: '#402d9d',
    hr: '#E9E5F4',
  },
  ctaPrimary: {
    text: pyramidsColors.white,
    bg: pyramidsColors.alpha(pyramidsColors.darkBlue, 0.6),
  },
  ctaSecondary: {
    text: pyramidsColors.darkBlue,
    bg: pyramidsColors.almostWhite,
  },
  ctaOther: {
    text: pyramidsColors.darkBlue,
    bg: pyramidsColors.almostWhite,
  },
  card: {
    text: pyramidsColors.darkBlue,
    bg: pyramidsColors.white,
    borderColor: pyramidsColors.lightGrey,
    boxShadow: 'rgba(0, 0, 0, 0.1)',
  },
  panel: {
    text: pyramidsColors.darkBlue,
    bg: pyramidsColors.white,
    borderColor: pyramidsColors.lightGrey,
    boxShadow: 'rgba(0, 0, 0, 0.1)',
  },
};
