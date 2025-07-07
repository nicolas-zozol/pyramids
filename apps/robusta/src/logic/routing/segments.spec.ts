// joinSegments.test.ts

import { describe, it, expect } from 'vitest';
import { joinSegments } from './segments';

describe('joinSegments', () => {
  it('should join basic path segments with a single slash', () => {
    const result = joinSegments(['fr', 'content']);
    expect(result).toBe('fr/content');
  });

  it('should handle leading slashes in segments', () => {
    const result = joinSegments(['/fr', '/content']);
    expect(result).toBe('fr/content');
  });

  it('should handle trailing slashes in segments', () => {
    const result = joinSegments(['fr/', 'content/']);
    expect(result).toBe('fr/content');
  });

  it('should handle multiple slashes within segments', () => {
    const result = joinSegments(['//fr//', '///content']);
    expect(result).toBe('fr/content');
  });

  it('should trim whitespace around segments', () => {
    const result = joinSegments(['  /fr  ', '  content/  ']);
    expect(result).toBe('fr/content');
  });

  it('should remove empty segments', () => {
    const result = joinSegments(['', 'fr', '', 'content', '']);
    expect(result).toBe('fr/content');
  });

  it('should return an empty string if all segments are empty', () => {
    const result = joinSegments(['', '   ', '//']);
    expect(result).toBe('');
  });

  it('should handle a single segment', () => {
    const result = joinSegments(['/fr/']);
    expect(result).toBe('fr');
  });

  it('should handle a more complex array with mixed input', () => {
    const result = joinSegments([' /  ', '/fr///', '', '//content///']);
    expect(result).toBe('fr/content');
  });
});
