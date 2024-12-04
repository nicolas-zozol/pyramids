import { colors } from '../colors';
import { SiteTheme, standardTheme } from './standard';

export const dakarTheme: Partial<SiteTheme> = {
  ctas: {
    ...standardTheme.ctas,
    background: colors.alpha(colors.darkBlue, 0.6),
    text: colors.white,
  },
  background: {
    ...standardTheme.background,
    body: colors.almostWhite,
  },
};
