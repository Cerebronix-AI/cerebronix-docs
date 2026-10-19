import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@cerebronix/docs-ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'docs-cdn.cerebronix.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/getting-started/what-cerebronix-is',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
