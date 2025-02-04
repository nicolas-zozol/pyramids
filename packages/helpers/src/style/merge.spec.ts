import { expect, it, describe } from 'vitest';
import { mergeCss } from './merge-css.js';

describe('mergeCss', () => {
  it('should return an empty string when given an empty array', () => {
    expect(mergeCss([])).toBe('');
  });

  it('should return an empty string when all elements are undefined', () => {
    expect(mergeCss(undefined, undefined)).toBe('');
  });

  it('should return an empty string when all elements are falsy', () => {
    expect(mergeCss(null, false, undefined)).toBe('');
  });

  it('should handle a single class name in a string', () => {
    expect(mergeCss('class1')).toBe('class1');
  });

  it('should handle multiple class names in a single string', () => {
    expect(mergeCss('class1 class2 class3')).toBe('class1 class2 class3');
  });

  it('should handle multiple class names passed as separate strings', () => {
    expect(mergeCss('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('should handle mixed input of arrays and strings', () => {
    expect(mergeCss(['class1'], 'class2', ['class3'])).toBe(
      'class1 class2 class3',
    );
  });

  it('should handle multiple strings with multiple class names', () => {
    expect(mergeCss('class1 class2', 'class2 class3', 'class3 class4')).toBe(
      'class1 class2 class3 class4',
    );
  });

  it('should remove duplicate class names', () => {
    expect(mergeCss('class1', 'class1 class2', 'class2 class3')).toBe(
      'class1 class2 class3',
    );
  });

  it('should ignore undefined values passed as individual arguments', () => {
    expect(mergeCss('class1', undefined, 'class2')).toBe('class1 class2');
  });

  it('should handle empty strings in the array', () => {
    expect(mergeCss('', 'class1', '', 'class2')).toBe('class1 class2');
  });

  it('should handle strings with extra spaces', () => {
    expect(mergeCss('  class1  class2  ', ' class2   class3  ')).toBe(
      'class1 class2 class3',
    );
  });

  it('should handle strings with only spaces', () => {
    expect(mergeCss('   ', 'class1', '  ')).toBe('class1');
  });

  it('should not include empty class names after splitting', () => {
    expect(mergeCss('class1  class2', '   ', 'class3')).toBe(
      'class1 class2 class3',
    );
  });

  it('should handle numerical class names', () => {
    expect(mergeCss('class1', '123', 'class2')).toBe('class1 123 class2');
  });

  it('should handle special characters in class names', () => {
    expect(mergeCss('class@1', 'class#2')).toBe('class@1 class#2');
  });

  it('should handle mixed case class names', () => {
    expect(mergeCss('Class1', 'class1', 'CLASS1')).toBe('Class1 class1 CLASS1');
  });

  it('should preserve the order of first occurrences of class names', () => {
    expect(mergeCss('class3', 'class1 class2', 'class3 class4')).toBe(
      'class3 class1 class2 class4',
    );
  });

  it('should handle individual class names passed as non-array, mixed arguments', () => {
    expect(mergeCss('class1', ['class2', 'class3'], 'class4')).toBe(
      'class1 class2 class3 class4',
    );
  });

  it('should handle all falsy values together in one argument', () => {
    expect(mergeCss(false, null, undefined, '')).toBe('');
  });

  it('should handle mixed falsy and truthy values', () => {
    expect(mergeCss('class1', false, 'class2', null, 'class3')).toBe(
      'class1 class2 class3',
    );
  });
});
