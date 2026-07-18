import apiClient from "./client";

// ============================================================================
// GLOBAL SEARCH  (import as "@/lib/globalSearchApi")
// ----------------------------------------------------------------------------
// Talks to the backend's public GET /search endpoint, which queries live
// Products, News and Brands directly from the database (no more static
// @/data files). Used by:
//   - Header.jsx      -> type: "all"      (small mixed preview dropdown)
//   - app/search page -> type: "products" | "news" | "brands" (full pages)
// ============================================================================

const EMPTY_BUCKET = { data: [], total: 0, page: 1, pageSize: 8, totalPages: 0 };
const EMPTY_RESPONSE = {
  query: "",
  counts: { products: 0, news: 0, brands: 0, total: 0 },
  results: { products: EMPTY_BUCKET, news: EMPTY_BUCKET, brands: EMPTY_BUCKET },
};

/**
 * @param {string} q - search text
 * @param {object} opts
 * @param {"all"|"products"|"news"|"brands"} [opts.type="all"]
 * @param {string} [opts.categoryId]  - products only
 * @param {string} [opts.subcategoryId] - products only
 * @param {string} [opts.brandId]     - products only
 * @param {number} [opts.page=1]
 * @param {number} [opts.pageSize=8]
 * @param {AbortSignal} [opts.signal] - to cancel stale requests while typing
 */
export async function fetchGlobalSearch(q, opts = {}) {
  const { type = "all", categoryId, subcategoryId, brandId, page = 1, pageSize = 8, signal } = opts;
  try {
    const res = await apiClient.get("/search", {
      q: (q || "").trim(),
      type,
      categoryId,
      subcategoryId,
      brandId,
      page,
      pageSize,
    }, { signal });
    if (!res || !res.results) return EMPTY_RESPONSE;
    return res;
  } catch (err) {
    if (err?.name === "AbortError") throw err; // let caller ignore silently
    console.error("Global search failed:", err);
    return EMPTY_RESPONSE;
  }
}

// Flattens the mixed "all" response into one ranked list (products, then
// news, then brands) — used for the header's compact dropdown.
export function flattenPreview(response, limitPerType = 5) {
  const { products, news, brands } = response?.results || {};
  return [
    ...(products?.data || []).slice(0, limitPerType),
    ...(news?.data || []).slice(0, limitPerType),
    ...(brands?.data || []).slice(0, limitPerType),
  ];
}

export const TYPE_META = {
  product: { label: "Product", icon: "📦", color: "text-blue-700 bg-blue-50" },
  news: { label: "News", icon: "📰", color: "text-rose-700 bg-rose-50" },
  brand: { label: "Brand", icon: "🏷️", color: "text-emerald-700 bg-emerald-50" },
};

export default { fetchGlobalSearch, flattenPreview, TYPE_META };
