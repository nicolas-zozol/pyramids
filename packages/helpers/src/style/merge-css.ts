import { ClassNameValue } from 'tailwind-merge';

/**
 * A utility function to merge multiple CSS class names into a single string,
 * filtering out falsy values like undefined, null, or empty strings.
 *
 * @param classes - A list of CSS class names or falsy values (can include strings or arrays of strings).
 * @returns A string containing all valid class names separated by a space.
 */
export const mergeCss = (...classes: ClassNameValue[]): string => {
  const listOfStrings = classes
    .flat() // Flatten the input in case an array of strings is passed
    .filter((c) => typeof c === 'string' && c.trim().length > 0) // Filter out empty strings and non-string values
    .join(' ');
  const ar = listOfStrings.split(' ').filter((c) => c.trim().length > 0);
  const unique = [...new Set(ar)];
  // Filter out empty strings and non-string values
  const set = new Set(ar);
  return [...set].join(' ');
};
