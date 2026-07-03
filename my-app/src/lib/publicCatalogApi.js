import apiClient from "./client";

/**
 * Public catalog data layer — fetches live data from the NestJS backend and
 * maps it into the exact shapes the public product pages expect (the same
 * shapes the old static @/data/products file used to provide):
 *
 *   - categories:  [{ id, name, icon, subcategories: [{ id, name, productCount }] }]
 *   - brands:      [{ id, name, slug, productCount }]
 *   - products:    flattened [{ id, name, model, keyFeatures, categoryId,
 *                  subcategoryId, distributorId, brand, images:[{url,...}], ... }]
 *
 * Everything is normalized so the existing UI keeps working unchanged.
 */

const extract = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

// Fetch every product across all pages (admin sets pageSize; here we page through).
async function fetchAllProducts() {
  const pageSize = 100;
  let page = 1;
  let all = [];
  // Guard against infinite loops.
  for (let i = 0; i < 50; i++) {
    const res = await apiClient.get("/products", { page, pageSize, isActive: "true" });
    const batch = extract(res);
    all = all.concat(batch);
    const meta = res?.meta;
    if (!meta || page >= (meta.totalPages || 1) || batch.length === 0) break;
    page += 1;
  }
  return all;
}

// Map a backend product into the flat shape the public UI consumes.
function mapProduct(p) {
  const brandName =
    p.brand && typeof p.brand === "object" ? p.brand.name : p.brand || "";
  return {
    ...p,
    id: p.id,
    name: p.name,
    model: p.model || "",
    keyFeatures: p.keyFeatures || "",
    description: p.description || "",
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId || "",
    // The public UI calls the brand field "distributorId".
    distributorId: p.brandId || (p.brand && p.brand.id) || "",
    brand: brandName,
    images: Array.isArray(p.images) ? p.images : [],
    specifications: p.specifications || [],
    certifications: p.certifications || [],
    brochureUrl: p.brochureUrl || null,
    brochureName: p.brochureName || null,
  };
}

const publicCatalogApi = {
  /**
   * Returns { categories, brands, products } in the legacy public shapes.
   */
  async getCatalog() {
    const [cats, subs, brandsRaw, productsRaw] = await Promise.all([
      apiClient.get("/categories").then(extract).catch(() => []),
      apiClient.get("/categories/subcategories/all").then(extract).catch(() => []),
      apiClient.get("/brands").then(extract).catch(() => []),
      fetchAllProducts().catch(() => []),
    ]);

    const products = productsRaw.map(mapProduct);

    // Build category → subcategories tree with live product counts.
    const countsBySub = products.reduce((acc, p) => {
      if (p.subcategoryId) acc[p.subcategoryId] = (acc[p.subcategoryId] || 0) + 1;
      return acc;
    }, {});

    const categories = cats.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || "📦",
      image: c.image || "",
      subcategories: subs
        .filter((s) => s.categoryId === c.id)
        .map((s) => ({
          id: s.id,
          categoryId: s.categoryId,
          name: s.name,
          productCount: countsBySub[s.id] || 0,
        })),
    }));

    const countsByBrand = products.reduce((acc, p) => {
      if (p.distributorId) acc[p.distributorId] = (acc[p.distributorId] || 0) + 1;
      return acc;
    }, {});

    const brands = brandsRaw.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug || b.id,
      logo: b.logo || "",
      productCount: countsByBrand[b.id] || 0,
    }));

    return { categories, brands, products };
  },

  mapProduct,
};

export default publicCatalogApi;
