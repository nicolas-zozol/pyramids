import { colors } from '../colors';
import { SiteTheme, standardTheme } from './standard';

export const robustaTheme: Partial<SiteTheme> = {
  background: {
    ...standardTheme.background,
    body: colors.almostWhite,
  },
};
