/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true, // Ensures URLs end with a slash, useful for static exports
  images: {
    unoptimized: true, // Disable Image Optimization for static export
  },
};

module.exports = nextConfig;
