import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { uniqueValues } from '@robusta/pyramids-helpers';

export function getAllLocales(): string[] {
  const config = getSeoPyramidsConfig();
  return uniqueValues([config.defaultLocale, ...config.otherLocales]);
}

export function getDefaultLocale(): string {
  return getSeoPyramidsConfig().defaultLocale;
}

let otherLocales: string[] | undefined = undefined;
export function getOtherLocales(): string[] {
  if (otherLocales) {
    return otherLocales;
  }
  const config = getSeoPyramidsConfig();
  otherLocales = uniqueValues([
    ...config.otherLocales.filter((locale) => locale !== config.defaultLocale),
  ]);
  return otherLocales;
}
