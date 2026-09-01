/**
 * A ProductVariant's fields are all OVERRIDES: null/empty means "inherit the
 * parent product's value". This resolves the final, effective values for
 * display, PDFs, and emails — the raw variant record (with its nulls
 * preserved) is what the admin edit UI works with instead, so it can tell
 * "inherited" apart from "explicitly set".
 */
export function resolveVariantFields(product: any, variant: any) {
  if (!variant) return null;
  return {
    id: variant.id,
    name: variant.name,
    attributes: variant.attributes || {},
    model: variant.model || product?.model || null,
    description: variant.description || product?.description || null,
    keyFeatures: variant.keyFeatures || product?.keyFeatures || null,
    specifications:
      Array.isArray(variant.specifications) && variant.specifications.length > 0
        ? variant.specifications
        : product?.specifications || [],
    images: Array.isArray(variant.images) && variant.images.length > 0 ? variant.images : undefined, // undefined → caller falls back to product.images
    brand: variant.brand || product?.brand || null,
    applications:
      Array.isArray(variant.applications) && variant.applications.length > 0
        ? variant.applications
        : product?.applications || [],
    brochureUrl: variant.brochureUrl || product?.brochureUrl || null,
    brochureName: variant.brochureName || product?.brochureName || null,
    designFileUrl: variant.designFileUrl || product?.designFileUrl || null,
    designFileName: variant.designFileName || product?.designFileName || null,
    isActive: variant.isActive,
    sortOrder: variant.sortOrder,
  };
}
