import { dakarTheme } from './dakar-theme';
import { robustaTheme } from './robusta-theme';
import { PyramidsTheme, standardPyramidsTheme } from './standard';

export function getTheme(
  site: 'standard' | 'dakar' | 'robusta',
): PyramidsTheme {
  const baseTheme = standardPyramidsTheme;
  const siteOverrides =
    site === 'dakar' ? dakarTheme : site === 'robusta' ? robustaTheme : {};
  return {
    ...baseTheme,
    ...siteOverrides,
    text: {
      ...baseTheme.text,
      ...(siteOverrides.text || {}),
    },
    buttonPrimary: {
      ...baseTheme.buttonPrimary,
      ...(siteOverrides.buttonPrimary || {}),
    },
    buttonSecondary: {
      ...baseTheme.buttonSecondary,
      ...(siteOverrides.buttonSecondary || {}),
    },
    buttonCancel: {
      ...baseTheme.buttonCancel,
      ...(siteOverrides.buttonCancel || {}),
    },
    link: {
      ...baseTheme.link,
      ...(siteOverrides.link || {}),
    },
    menu: {
      ...baseTheme.menu,
      ...(siteOverrides.menu || {}),
    },
    background: {
      ...baseTheme.background,
      ...(siteOverrides.background || {}),
    },
    table: {
      ...baseTheme.table,
      ...(siteOverrides.table || {}),
    },
    separation: {
      ...baseTheme.separation,
      ...(siteOverrides.separation || {}),
    },
    ctaPrimary: {
      ...baseTheme.ctaPrimary,
      ...(siteOverrides.ctaPrimary || {}),
    },
    ctaSecondary: {
      ...baseTheme.ctaSecondary,
      ...(siteOverrides.ctaSecondary || {}),
    },
    ctaOther: {
      ...baseTheme.ctaOther,
      ...(siteOverrides.ctaOther || {}),
    },
    panel: {
      ...baseTheme.panel,
      ...(siteOverrides.panel || {}),
    },
  };
}
