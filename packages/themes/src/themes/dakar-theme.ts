import { pyramidsColors } from '../colors';
import { PyramidsTheme, standardPyramidsTheme } from './standard';

export const dakarTheme: Partial<PyramidsTheme> = {
  background: {
    ...standardPyramidsTheme.background,
    body: pyramidsColors.almostWhite,
  },
  ctaPrimary: {
    ...standardPyramidsTheme.ctaPrimary,
    text: pyramidsColors.white,
    bg: pyramidsColors.alpha(pyramidsColors.darkBlue, 0.6),
  },
};
