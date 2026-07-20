// ============================================================================
// ADMIN GLOBAL SEARCH INDEX  (import as "@/lib/adminSearchIndex")
// ----------------------------------------------------------------------------
// Searches across:
//   (a) Admin SECTIONS/pages (Dashboard, Products, News, Distributors, …)
//   (b) Real CONTENT — products, news posts, distributors — each linking to its
//       admin management page so you can jump straight to editing it.
// Each entry: { type, id, title, subtitle, href, keywords }
// ============================================================================

import { getAllFlattenedProducts } from "@/data/products";
import { getAllNews } from "@/data/news";
import { DISTRIBUTORS as COMPANY_DISTRIBUTORS } from "@/data/distributors";

// All admin sections (kept in sync with /admin/* route folders)
export const ADMIN_SECTIONS = [
  { title: "Dashboard", href: "/admin/dashboard", keywords: "dashboard home overview stats" },
  { title: "Products", href: "/admin/products", keywords: "products catalogue sku items" },
  { title: "News", href: "/admin/news", keywords: "news blog articles posts media" },
  { title: "Distributors", href: "/admin/distributors", keywords: "distributors partners channel" },
  { title: "Brands", href: "/admin/brands", keywords: "brands makita bosch manufacturers" },
  { title: "Clients", href: "/admin/clients", keywords: "clients customers accounts" },
  { title: "Employees", href: "/admin/employees", keywords: "employees staff team" },
  { title: "Carousel", href: "/admin/site-config?tab=carousel", keywords: "carousel hero banner slides cta" },
  { title: "Testimonials", href: "/admin/testimonials", keywords: "testimonials reviews feedback" },
  { title: "Newsletter", href: "/admin/newsletter", keywords: "newsletter email subscribers" },
  { title: "CRM", href: "/admin/crm", keywords: "crm leads enquiries rfq" },
  { title: "FAQ Manager", href: "/admin/faq-manager", keywords: "faq questions answers manage" },
  { title: "FAQs", href: "/admin/faqs", keywords: "faqs help support" },
  { title: "Contact Settings", href: "/admin/contact-settings", keywords: "contact phone email address settings" },
  { title: "About CMS", href: "/admin/about-cms", keywords: "about company cms content" },
  { title: "About Onboarding", href: "/admin/about-onboarding", keywords: "about onboarding intro journey" },
];

let _cache = null;

export function buildAdminSearchIndex() {
  if (_cache) return _cache;
  const entries = [];

  // Sections
  for (const s of ADMIN_SECTIONS) {
    entries.push({
      type: "section",
      id: s.href,
      title: s.title,
      subtitle: "Admin section",
      href: s.href,
      keywords: `${s.title} ${s.keywords}`.toLowerCase(),
    });
  }

  // Products → admin products (deep-link by id for edit)
  try {
    for (const p of getAllFlattenedProducts()) {
      entries.push({
        type: "product",
        id: p.id,
        title: p.name,
        subtitle: [p.brand, p.id].filter(Boolean).join(" · "),
        href: `/admin/products?edit=${p.id}`,
        keywords: [p.name, p.brand, p.model, p.id].filter(Boolean).join(" ").toLowerCase(),
      });
    }
  } catch {}

  // News → admin news
  try {
    for (const n of getAllNews()) {
      entries.push({
        type: "news",
        id: n.id,
        title: n.title,
        subtitle: n.tag || "News post",
        href: `/admin/news?edit=${n.id}`,
        keywords: [n.title, n.summary, n.tag].filter(Boolean).join(" ").toLowerCase(),
      });
    }
  } catch {}

  // Distributors → admin distributors
  try {
    for (const d of COMPANY_DISTRIBUTORS) {
      entries.push({
        type: "distributor",
        id: d.id,
        title: d.companyName || d.name,
        subtitle: d.region || "Distributor",
        href: `/admin/distributors?edit=${d.id}`,
        keywords: [d.companyName, d.name, d.region].filter(Boolean).join(" ").toLowerCase(),
      });
    }
  } catch {}

  _cache = entries;
  return entries;
}

export function adminSearch(query, { limit = 12 } = {}) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  const index = buildAdminSearchIndex();
  const scored = [];
  for (const e of index) {
    const inTitle = e.title?.toLowerCase().includes(q);
    const inKw = e.keywords.includes(q);
    if (!inTitle && !inKw) continue;
    let score = inTitle ? 0 : 1;
    if (e.type === "section") score -= 0.3; // sections rank a bit higher
    if (e.title?.toLowerCase().startsWith(q)) score -= 0.5;
    scored.push({ ...e, score });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit);
}

export const ADMIN_TYPE_META = {
  section: { label: "Section", color: "text-violet-700 bg-violet-50" },
  product: { label: "Product", color: "text-blue-700 bg-blue-50" },
  news: { label: "News", color: "text-rose-700 bg-rose-50" },
  distributor: { label: "Distributor", color: "text-emerald-700 bg-emerald-50" },
};