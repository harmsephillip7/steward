/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@steward/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
};

module.exports = nextConfig;
