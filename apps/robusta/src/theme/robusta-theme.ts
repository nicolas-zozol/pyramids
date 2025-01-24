import {
  pyramidsColors,
  PyramidsTheme,
  standardPyramidsTheme,
} from '@robusta/pyramids-themes';

const standard = standardPyramidsTheme;
export const robustaTheme: Partial<PyramidsTheme> = {
  background: {
    ...standard.background,
    body: pyramidsColors.almostWhite,
  },
};
