// Next.js special file — auto-served at /sitemap.xml
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://sbsgroups.co.in").replace(/\/$/, "");
const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function safeFetch(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

const STATIC_ROUTES = [
  "", "products", "brands", "own-brands", "clients", "news",
  "about", "contact", "testimonials", "certificates", "employees",
];

export default async function sitemap() {
  const now = new Date();
  const entries = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}/${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [products, news, brands, clients] = await Promise.all([
    safeFetch("/products?page=1&pageSize=100"),
    safeFetch("/news/public/posts?page=1&pageSize=100"),
    safeFetch("/brands/public/list"),
    safeFetch("/clients/public"),
  ]);

  const productList = Array.isArray(products) ? products : products?.data || products?.items || [];
  for (const p of productList) {
    entries.push({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  const newsList = Array.isArray(news) ? news : news?.data || news?.items || [];
  for (const n of newsList) {
    if (!n.slug) continue;
    entries.push({
      url: `${SITE_URL}/news/${n.slug}`,
      lastModified: n.publishedAt ? new Date(n.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  const brandList = Array.isArray(brands) ? brands : brands?.data || [];
  for (const b of brandList) {
    if (!b.slug) continue;
    entries.push({
      url: `${SITE_URL}/brands/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  const clientList = Array.isArray(clients) ? clients : clients?.data || [];
  for (const c of clientList) {
    if (!c.slug) continue;
    entries.push({
      url: `${SITE_URL}/clients/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return entries;
}
