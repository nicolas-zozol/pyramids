/**
 * Merges multiple arrays of objects and ensures uniqueness based on a specified key.
 *
 * @template T The type of objects within the arrays.
 * @param arrays An array of arrays you want to merge.
 * @param key The key by which uniqueness is determined.
 * @returns A new array of merged objects that are unique by the given key.
 */
export function uniqueBy<T, K extends keyof T>(arrays: T[][], key: K): T[] {
  // Flatten all arrays into one
  const merged = arrays.flat();

  // Use a Map to ensure uniqueness by the given key
  const map = new Map<T[K], T>();
  for (const item of merged) {
    map.set(item[key], item);
  }

  // Return the unique items
  return Array.from(map.values());
}

export function uniqueValues<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}
