import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextConfig } from 'next';

/**
 * The mapping is read as JSON rather than imported: Next loads this file
 * outside the webpack pipeline, through a require hook that resolves import
 * paths verbatim, so it cannot follow the repository's `.js`-suffixed local
 * imports down to `src/routing/v1-url-map.ts`. `scripts/emit-redirects.mjs`
 * writes the file and the app's `build` script runs it first — the design's
 * stated fallback.
 */
interface V1MappingFile {
  contentRoot: string;
  defaultLocale: string;
  otherLocales: string[];
  rows: {
    from: string;
    destination:
      | { kind: 'permanent'; to: string }
      | { kind: 'gone' }
      | { kind: 'none' };
  }[];
}

const mappingPath = join(process.cwd(), 'src/routing/v1-url-map.generated.json');

function readMapping(): V1MappingFile {
  if (!existsSync(mappingPath)) {
    throw new Error(
      `Missing ${mappingPath}. Run \`yarn workspace @robusta/robusta-build run emit:redirects\`; the app's build script does it for you.`,
    );
  }
  return JSON.parse(readFileSync(mappingPath, 'utf8')) as V1MappingFile;
}

/**
 * R-URLSCHEME-30: the configured content root and the site's route folders
 * state the same value, and the build fails when they diverge.
 */
function assertRouteTableMatchesContentRoot(mapping: V1MappingFile): void {
  const root = mapping.contentRoot;
  const shape = [root, `${root}/p/[n]`, `${root}/[slug]`, `${root}/c/[category]`, `${root}/c/[category]/p/[n]`, `${root}/c/[category]/[slug]`];
  const expected = [
    ...shape.map((folder) => join('src/app', folder)),
    ...shape.map((folder) => join('src/app/l/[locale]', folder)),
  ];

  const missing = expected.filter(
    (folder) => !existsSync(join(process.cwd(), folder)),
  );
  if (missing.length > 0) {
    throw new Error(
      `The configured content root '${root}' has no route folder at: ${missing.join(', ')}`,
    );
  }
}

/**
 * The two canonical-form families Next does not give for free: the explicit
 * page one and the marked default locale (R-URLSCHEME-8 and 9). The trailing
 * slash is `trailingSlash: false`, and the letter case is the middleware's.
 */
function canonicalFormRedirects(mapping: V1MappingFile) {
  const { contentRoot, defaultLocale, otherLocales } = mapping;
  const prefixes = ['', ...otherLocales.map((locale) => `/l/${locale}`)];

  const pageOne = prefixes.flatMap((prefix) => [
    {
      source: `${prefix}/${contentRoot}/p/1`,
      destination: `${prefix}/${contentRoot}`,
      permanent: true,
    },
    {
      source: `${prefix}/${contentRoot}/c/:category/p/1`,
      destination: `${prefix}/${contentRoot}/c/:category`,
      permanent: true,
    },
  ]);

  return [
    ...pageOne,
    { source: `/l/${defaultLocale}`, destination: '/', permanent: true },
    {
      source: `/l/${defaultLocale}/:path*`,
      destination: '/:path*',
      permanent: true,
    },
  ];
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Local TypeScript imports end in `.js` throughout this repository, which
  // `moduleResolution: "Bundler"` accepts in tsc but webpack does not resolve
  // on its own. Same declaration as `apps/dakar`.
  experimental: {
    extensionAlias: {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    },
  },
  async redirects() {
    const mapping = readMapping();
    assertRouteTableMatchesContentRoot(mapping);

    const fromV1 = mapping.rows
      .filter((row) => row.destination.kind === 'permanent')
      .map((row) => ({
        source: row.from,
        destination: (row.destination as { kind: 'permanent'; to: string }).to,
        permanent: true,
      }));

    return [...fromV1, ...canonicalFormRedirects(mapping)];
  },
};

export default nextConfig;
