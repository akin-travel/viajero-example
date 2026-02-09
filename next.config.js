/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@akin-travel/partner-sdk'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.akintravel.com',
      },
    ],
  },
};

module.exports = nextConfig;
