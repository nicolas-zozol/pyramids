import { colors } from '../colors';
import { SiteTheme, standardTheme } from './standard';

export const dakarTheme: Partial<SiteTheme> = {
  background: {
    ...standardTheme.background,
    body: colors.darkBlue,
  },
  ctaPrimary: {
    ...standardTheme.ctaPrimary,
    text: colors.white,
    bg: colors.alpha(colors.darkBlue, 0.6),
  },
};
