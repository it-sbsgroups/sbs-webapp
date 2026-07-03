// Resolves a product's brand display name regardless of shape.
// Backend returns `brand` as an object { id, name, slug, logo } (Prisma relation),
// while older frontend code assumed `brand` was a plain string.
export function getProductBrandName(product, brands = []) {
  if (!product) return "";
  const b = product.brand;
  if (b && typeof b === "object") return b.name || "";
  if (typeof b === "string" && b) return b;
  const id = product.brandId || product.distributorId;
  const found = brands.find((x) => x.id === id);
  return found?.name || "";
}

export function getProductBrandId(product) {
  if (!product) return undefined;
  if (product.brand && typeof product.brand === "object") return product.brand.id;
  return product.brandId || product.distributorId;
}
