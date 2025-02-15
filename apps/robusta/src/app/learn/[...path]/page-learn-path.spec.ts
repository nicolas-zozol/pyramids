import { describe, it, expect } from 'vitest';
import { generateStaticParams } from './page';

describe('Learn path', () => {
  it('should return 404 if no path', async () => {
    const routeParams = await generateStaticParams();

    expect(routeParams.length).toBeGreaterThan(5);
  });
});
