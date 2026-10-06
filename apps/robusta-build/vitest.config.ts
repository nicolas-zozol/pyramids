import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * The site's specs, on the site's own Vite. The corpus root and the asset
 * directory resolve against `process.cwd()`, which vitest runs from the app
 * directory exactly as `vite build` does.
 */
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.spec.{ts,tsx}', 'scripts/**/*.spec.ts'],
    environment: 'node',
  },
});
