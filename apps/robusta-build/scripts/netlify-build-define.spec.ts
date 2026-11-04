import { describe, expect, it } from 'vitest';
import { netlifyBuildDefine } from './netlify-build-define.mjs';

// R-GOLIVE-02: the client and server bundles read the build's NETLIFY and CONTEXT as literals.
describe('netlifyBuildDefine', () => {
  it('replaces process.env.NETLIFY and process.env.CONTEXT by their build values, as string literals', () => {
    expect(
      netlifyBuildDefine({ NETLIFY: 'true', CONTEXT: 'production' }),
    ).toEqual({
      'process.env.NETLIFY': '"true"',
      'process.env.CONTEXT': '"production"',
    });
  });

  it('writes the empty string for a variable the build does not carry', () => {
    expect(netlifyBuildDefine({ NETLIFY_LOCAL: 'true' })).toEqual({
      'process.env.NETLIFY': '""',
      'process.env.CONTEXT': '""',
    });
  });

  it('defines nothing else of process.env', () => {
    expect(
      Object.keys(
        netlifyBuildDefine({
          NETLIFY: 'true',
          CONTEXT: 'production',
          URL: 'https://www.robusta.build',
        }),
      ),
    ).toEqual(['process.env.NETLIFY', 'process.env.CONTEXT']);
  });
});
