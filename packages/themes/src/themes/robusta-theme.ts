import { pyramidsColors } from '../colors';
import { PyramidsTheme, standardPyramidsTheme } from './standard';

export const robustaTheme: Partial<PyramidsTheme> = {
  background: {
    ...standardPyramidsTheme.background,
    body: pyramidsColors.almostWhite,
  },
};
