export const pyramidsColors = {
  almostBlack: '#010122',
  darkerBlue: '#0E0E2B',
  darkBlue: '#01013D',
  otherDarkBlue: '#0E0E2B',
  white: '#FFFFFF',
  almostWhite: '#FDF9FF',
  lightGrey: '#E9E5F4',
  alphaGrey6: 'rgba(255, 255, 255, 0.6)',
  darkGrey: '#53536E',
  black: '#000',

  alpha(color: string, opacity: number): string {
    const hexOpacity = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return `${color}${hexOpacity}`;
  },
};
