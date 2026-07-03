// ============================================================================
// GLOBAL SEARCH INDEX  (import as "@/lib/searchIndex")
// ----------------------------------------------------------------------------
// Builds one flat, searchable list across Products, News and Distributors so
// the header search can show mixed results and route to the right page.
// Each entry: { type, id, title, subtitle, href, keywords }
// ============================================================================

import { getAllFlattenedProducts } from "@/data/products";
import { getAllNews } from "@/data/news";
import { DISTRIBUTORS as COMPANY_DISTRIBUTORS } from "@/data/distributors";

let _cache = null;

export function buildSearchIndex() {
  if (_cache) return _cache;
  const entries = [];

  // --- Products → /products/[sku] (sku = product id) ---
  try {
    for (const p of getAllFlattenedProducts()) {
      entries.push({
        type: "product",
        id: p.id,
        title: p.name,
        subtitle: [p.brand, p.model].filter(Boolean).join(" · "),
        href: `/products/${p.id}`,
        keywords: [p.name, p.brand, p.model, p.keyFeatures, p.id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      });
    }
  } catch {}

  // --- News → /news/[slug] ---
  try {
    for (const n of getAllNews()) {
      entries.push({
        type: "news",
        id: n.id,
        title: n.title,
        subtitle: n.tag || n.summary?.slice(0, 60) || "",
        href: `/news/${n.slug}`,
        keywords: [n.title, n.summary, n.tag, n.subtitle]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      });
    }
  } catch {}

  // --- Distributors (companies) → /distributors/[slug] ---
  try {
    for (const d of COMPANY_DISTRIBUTORS) {
      entries.push({
        type: "distributor",
        id: d.id,
        title: d.companyName || d.name,
        subtitle: [d.region, d.name].filter(Boolean).join(" · "),
        href: `/distributors/${d.slug}`,
        keywords: [d.companyName, d.name, d.region, d.details]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      });
    }
  } catch {}

  _cache = entries;
  return entries;
}

// Returns up to `limit` matches; needs 2+ chars. Ranks title hits above body.
export function searchAll(query, { limit = 8 } = {}) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  const index = buildSearchIndex();
  const scored = [];
  for (const e of index) {
    const inTitle = e.title?.toLowerCase().includes(q);
    const inKeywords = e.keywords.includes(q);
    if (!inTitle && !inKeywords) continue;
    // lower score = better
    let score = inTitle ? 0 : 1;
    if (e.title?.toLowerCase().startsWith(q)) score -= 0.5;
    scored.push({ ...e, score });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit);
}

export const TYPE_META = {
  product: { label: "Product", icon: "📦", color: "text-blue-700 bg-blue-50" },
  news: { label: "News", icon: "📰", color: "text-rose-700 bg-rose-50" },
  distributor: { label: "Distributor", icon: "🏭", color: "text-emerald-700 bg-emerald-50" },
};