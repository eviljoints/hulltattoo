/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.hulltattoostudio.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "hulltattoostudio.com",
        pathname: "/images/**",
      },
      { protocol: "https", hostname: "**.wixstatic.com" },
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "**.wix.com" },
    ],
  },
  async redirects() {
    return [{ source: "/Calendar", destination: "/book/", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
