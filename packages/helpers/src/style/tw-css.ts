import { mergeCss } from './merge-css';
import { ClassNameValue, twMerge } from 'tailwind-merge';

export function twCss(s1: ClassNameValue, s2: ClassNameValue) {
  s1 = mergeCss(s1);
  s2 = mergeCss(s2);
  return twMerge(s1, s2);
}
export function twCssAll(...classLists: ClassNameValue[]) {
  return twMerge(mergeCss(classLists));
}
