import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()], // ✅ Fixes TypeScript alias resolution
  test: {
    globals: true,
    environment: 'node', // Or "node" depending on your tests
  },
});
