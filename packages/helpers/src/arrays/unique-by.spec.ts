// uniqueBy.test.ts
import { describe, it, expect } from 'vitest';
import { uniqueBy } from './unique'; // Adjust the path as necessary

interface TestItem {
  id: number;
  name: string;
}

describe('uniqueBy', () => {
  it('should return an empty array if given no arrays', () => {
    const result = uniqueBy<TestItem, 'id'>([], 'id');
    expect(result).toEqual([]);
  });

  it('should return unique items when merging arrays with distinct keys', () => {
    const arr1: TestItem[] = [{ id: 1, name: 'Alice' }];
    const arr2: TestItem[] = [{ id: 2, name: 'Bob' }];
    const result = uniqueBy<TestItem, 'id'>([arr1, arr2], 'id');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ id: 1, name: 'Alice' });
    expect(result).toContainEqual({ id: 2, name: 'Bob' });
  });

  it('should keep only the last occurrence of duplicate keys', () => {
    const arr1: TestItem[] = [{ id: 1, name: 'Alice' }];
    const arr2: TestItem[] = [{ id: 1, name: 'Alice Updated' }];
    const result = uniqueBy<TestItem, 'id'>([arr1, arr2], 'id');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 1, name: 'Alice Updated' });
  });

  it('should work with multiple arrays', () => {
    const arr1: TestItem[] = [{ id: 1, name: 'Alice' }];
    const arr2: TestItem[] = [{ id: 2, name: 'Bob' }];
    const arr3: TestItem[] = [
      { id: 1, name: 'Alice Updated' },
      { id: 3, name: 'Charlie' },
    ];
    const result = uniqueBy<TestItem, 'id'>([arr1, arr2, arr3], 'id');
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: 2, name: 'Bob' });
    expect(result).toContainEqual({ id: 3, name: 'Charlie' });
    // Check that the duplicate with id 1 is the one from arr3 (last occurrence)
    expect(result.find((item) => item.id === 1)).toEqual({
      id: 1,
      name: 'Alice Updated',
    });
  });

  it('should not modify the original arrays', () => {
    const arr1: TestItem[] = [{ id: 1, name: 'Alice' }];
    const arr2: TestItem[] = [{ id: 1, name: 'Alice Updated' }];
    const originalArr1 = [...arr1];
    const originalArr2 = [...arr2];
    uniqueBy<TestItem, 'id'>([arr1, arr2], 'id');
    expect(arr1).toEqual(originalArr1);
    expect(arr2).toEqual(originalArr2);
  });
});
