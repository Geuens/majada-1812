module.exports = {
  async redirects() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap',
        permanent: true,
      },
    ];
  },
};
