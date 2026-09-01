// src/lib/adminGlobalSearchApi.js
import apiClient from "./client";

// ============================================================================
// ADMIN GLOBAL SEARCH  (import as "@/lib/adminGlobalSearchApi")
// ----------------------------------------------------------------------------
// Talks to the backend's protected GET /search/admin endpoint — queries the
// live database (products, news, brands, clients, employees), not the old
// frozen static @/data snapshot. Mirrors the public search's async/debounced
// UX (see lib/globalSearchApi.js) but with admin-appropriate scope: inactive
// products, draft/archived news, inactive brands are all included, since an
// admin needs to find things regardless of public visibility.
// ============================================================================

export async function adminGlobalSearch(q, { limit = 15, signal } = {}) {
  const query = (q || "").trim();
  if (query.length < 2) return [];
  try {
    const res = await apiClient.get("/search/admin", { q: query, limit }, { signal });
    return Array.isArray(res?.results) ? res.results : [];
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    console.error("Admin search failed:", err);
    return [];
  }
}

// Section entries (static — these are the admin's own nav pages, not
// database content) are still searched client-side and merged in by the
// caller, same idea as before, just without the stale content entries.
export const ADMIN_SECTIONS = [
  { title: "Dashboard", href: "/admin/dashboard", keywords: "dashboard home overview stats" },
  { title: "Products", href: "/admin/products", keywords: "products catalogue sku items" },
  { title: "News", href: "/admin/news", keywords: "news blog articles posts media" },
  { title: "Distributors & Brands", href: "/admin/distributors", keywords: "distributors partners brands channel" },
  { title: "Clients", href: "/admin/clients", keywords: "clients customers accounts" },
  { title: "Employees", href: "/admin/employees", keywords: "employees staff team" },
  { title: "Site Configuration", href: "/admin/site-config", keywords: "site config header carousel contact about" },
  { title: "Notification Settings", href: "/admin/notification-settings", keywords: "notifications instant batch digest" },
  { title: "Testimonials", href: "/admin/testimonials", keywords: "testimonials reviews feedback" },
  { title: "Subscribers", href: "/admin/subscribers", keywords: "newsletter email subscribers" },
  { title: "CRM", href: "/admin/crm", keywords: "crm leads enquiries rfq" },
  { title: "FAQ Manager", href: "/admin/faq-manager", keywords: "faq questions answers manage" },
  { title: "Why Choose Us", href: "/admin/whychooseus", keywords: "why choose us features" },
];

export function searchSections(query, limit = 6) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  return ADMIN_SECTIONS.filter(
    (s) => s.title.toLowerCase().includes(q) || s.keywords.includes(q)
  )
    .slice(0, limit)
    .map((s) => ({ type: "section", id: s.href, title: s.title, subtitle: "Admin section", href: s.href }));
}

export const ADMIN_TYPE_META = {
  section: { label: "Section", color: "text-violet-700 bg-violet-50" },
  product: { label: "Product", color: "text-blue-700 bg-blue-50" },
  news: { label: "News", color: "text-rose-700 bg-rose-50" },
  brand: { label: "Brand", color: "text-emerald-700 bg-emerald-50" },
  client: { label: "Client", color: "text-amber-700 bg-amber-50" },
  employee: { label: "Employee", color: "text-cyan-700 bg-cyan-50" },
};

export default { adminGlobalSearch, searchSections, ADMIN_SECTIONS, ADMIN_TYPE_META };
