const CATEGORIES = ["finance", "data", "values"];

// ONE source of truth for the domain
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://majada1812.com";

// Base where category JSONs live
const ARTICLES_BASE =
  process.env.NEXT_PUBLIC_ARTICLES_BASE_URL ||
  `${SITE_URL}/data/articles`;

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchCategory(category) {
  try {
    const url = `${ARTICLES_BASE}/${category}.json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    // Nunca romper el sitemap por un fetch
    return [];
  }
}

export async function getServerSideProps({ res }) {
  try {
    // Static pages
    const staticUrls = [
      `${SITE_URL}/`,
      `${SITE_URL}/values`,
      `${SITE_URL}/finance`,
      `${SITE_URL}/data`,
      `${SITE_URL}/contacto`,
    ];

    // Fetch articles
    const articlesByCategory = await Promise.all(
      CATEGORIES.map(fetchCategory)
    );
    const articles = articlesByCategory.flat();

    // Article URLs
    const articleUrls = articles
      .filter(
        (a) =>
          a &&
          a.category &&
          (a.id === 0 || a.id) &&
          a.date
      )
      .map((a) => {
        const loc = `${SITE_URL}/articles/${a.category}/${a.id}`;
        const lastmod = new Date(a.date).toISOString();
        return { loc, lastmod };
      });

    // Merge + dedupe
    const urlsXml = [
      ...staticUrls.map((loc) => ({
        loc,
        lastmod: new Date().toISOString(),
      })),
      ...articleUrls,
    ]
      .reduce(
        (acc, u) => {
          if (!acc.seen.has(u.loc)) {
            acc.seen.add(u.loc);
            acc.items.push(u);
          }
          return acc;
        },
        { seen: new Set(), items: [] }
      ).items
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
  } catch (e) {
    // Último recurso: nunca devolver 500
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.write(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
    res.end();
  }

  // IMPORTANTE: no renderizar nada después de cerrar la response
  return { props: null };
}

export default function Sitemap() {
  return null;
}
