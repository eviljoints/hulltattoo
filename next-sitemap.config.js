// next-sitemap.js

module.exports = {
  siteUrl: 'https://hulltattoostudio.com', // Replace with your website's URL
  generateRobotsTxt: true, // Automatically generate robots.txt
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://hulltattoostudio.com/sitemap.xml', // Primary sitemap
      // Add additional sitemap URLs if you have multiple
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/hidden-page'], // Paths to exclude from crawling
      },
    ],
  },
  exclude: ['/admin/**', '/hidden-page'], // Ensure patterns match your URLs
  changefreq: 'daily', // Default change frequency
  priority: 0.7, // Default priority
  generateIndexSitemap: true, // Generates a sitemap index if multiple sitemaps are present
};
