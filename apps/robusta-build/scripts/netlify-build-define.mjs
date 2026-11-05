/**
 * The Vite `define` that writes the build's `NETLIFY` and `CONTEXT` into every
 * bundle as literals, so the browser, which has no `process`, reads the same
 * `INDEXING_OPEN` as the prerender.
 *
 * Design: features/pyramid-v2-epic/__done/go-live/go-live.design.md
 * Requirements: R-GOLIVE-02
 */

const READ_AT_BUILD = ['NETLIFY', 'CONTEXT'];

/**
 * `process.env.NETLIFY` and `process.env.CONTEXT` mapped to their values in `env` as JSON string literals, the empty string when absent.
 * @param {Record<string, string | undefined>} env
 * @returns {Record<string, string>}
 */
export function netlifyBuildDefine(env) {
  return Object.fromEntries(
    READ_AT_BUILD.map((name) => [
      `process.env.${name}`,
      JSON.stringify(env[name] ?? ''),
    ]),
  );
}
