import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * The site verifies its own corpus, in its own workspace (R-MIGRATELEARN-82).
 *
 * `vite-tsconfig-paths` resolves the `@/*` alias the app's tsconfig declares;
 * Vite resolves the repository's `.js`-suffixed local imports on its own. The
 * corpus root and the asset directory are both resolved against
 * `process.cwd()`, which vitest runs from the app directory exactly as
 * `next build` and `yarn emit:redirects` do — so a spec reads the site's own
 * `corpus` declaration instead of rebuilding one.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
