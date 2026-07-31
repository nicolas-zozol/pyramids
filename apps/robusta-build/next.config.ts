import type { NextConfig } from 'next';

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
};

export default nextConfig;
