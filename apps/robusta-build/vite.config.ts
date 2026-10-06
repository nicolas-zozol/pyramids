import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { prerenderPages } from './scripts/prerender-pages.mjs';

/**
 * The site builds as files: every page of the derived list is prerendered into
 * `dist/client`, which is all the deploy publishes. The client environment may
 * not reach the content source.
 */
export default defineConfig(async () => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        autoSubfolderIndex: false,
        failOnError: true,
      },
      pages: await prerenderPages(),
      router: { addExtensions: 'js' },
      importProtection: {
        client: {
          specifiers: ['@robusta/pyramids-content', 'gray-matter', 'remark'],
          files: ['**/src/content/**'],
        },
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
}));
