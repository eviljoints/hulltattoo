// next-sitemap.js

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hulltattoostudio.com', // Replace with your website's URL
  generateRobotsTxt: true, // Automatically generate robots.txt
  changefreq: 'weekly', // Default change frequency for all pages
  priority: 0.7, // Default priority for all pages
  generateIndexSitemap: false, // Do not generate a sitemap index
  exclude: ['/admin*'], // Exclude all pages under /admin
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/', // Allow all pages
        disallow: ['/admin'], // Disallow crawling /admin pages
      },
    ],
  },
};
