const CATEGORIES = ["finance", "data", "values"];

// Keep ONE source of truth for your domain
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://majada1812.com";

// Where your category JSONs live (the same base you already use)
const ARTICLES_BASE = process.env.NEXT_PUBLIC_ARTICLES_BASE_URL || SITE_URL + "/data/articles";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchCategory(category) {
  const url = `${ARTICLES_BASE}/${category}.json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getServerSideProps({ res }) {
  // Static pages you want indexed
  const staticUrls = [
    `${SITE_URL}/`,
    `${SITE_URL}/values`,
    `${SITE_URL}/finance`,
    `${SITE_URL}/data`,
    `${SITE_URL}/contacto`,
  ];

  // Collect articles from all category JSONs
  const articlesByCategory = await Promise.all(CATEGORIES.map(fetchCategory));
  const articles = articlesByCategory.flat();

  // Build URL entries
  const articleUrls = articles
    .filter((a) => a?.category && (a?.id === 0 || !!a?.id) && a?.date)
    .map((a) => {
      const loc = `${SITE_URL}/articles/${a.category}/${a.id}`;
      // Expecting YYYY-MM-DD; fallback to today if missing
      const lastmod = a.date ? new Date(a.date).toISOString() : new Date().toISOString();
      return { loc, lastmod };
    });

  const urlsXml = [
    ...staticUrls.map((loc) => ({
      loc,
      lastmod: new Date().toISOString(),
    })),
    ...articleUrls,
  ]
    // de-dup (just in case)
    .reduce((acc, u) => {
      if (!acc.seen.has(u.loc)) {
        acc.seen.add(u.loc);
        acc.items.push(u);
      }
      return acc;
    }, { seen: new Set(), items: [] }).items
    .map(
      ({ loc, lastmod }) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
