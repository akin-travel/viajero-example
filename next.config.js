/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@akin-travel/partner-sdk'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;
