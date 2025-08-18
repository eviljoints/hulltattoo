/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  images: {
    // Keep unoptimized for static export; if you move to SSR you can switch this off.
    unoptimized: true,
    remotePatterns: [
      // Your own site (absolute src like https://www.hulltattoostudio.com/images/...)
      {
        protocol: 'https',
        hostname: 'www.hulltattoostudio.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hulltattoostudio.com',
        pathname: '/**',
      },
      // Vercel Blob (design uploads)
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/designs/**',
      },
    ],
  },
};

module.exports = nextConfig;
