// next-sitemap.js

module.exports = {
  siteUrl: 'https://hulltattoostudio.com', // Replace with your website's URL
  changefreq: 'weekly', // Default change frequency for the entire site
  priority: 0.6, // Default priority for pages
  generateIndexSitemap: true, // Generates a sitemap index if multiple sitemaps are present

  robotsTxtOptions: {
    additionalSitemaps: [
      'https://hulltattoostudio.com/sitemap.xml', // Primary sitemap
      // Add additional sitemap URLs if needed
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/hidden-page'], // Paths to exclude from crawling
      },
    ],
  },

  exclude: ['/admin/**', '/hidden-page'], // Patterns for excluded pages

  // Add custom priority and frequency rules for specific pages
  transform: async (config, path) => {
    if (path.startsWith('/blog')) {
      return {
        loc: path,
        changefreq: 'daily', // Blog is updated weekly
        priority: 1.0, // High priority for blog pages
      };
    }
    return {
      loc: path,
      changefreq: 'weekly', // Default frequency for other pages
      priority: 0.6, // Default priority for other pages
    };
  },
};
