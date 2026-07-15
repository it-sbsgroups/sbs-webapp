"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ✅ LIVE DATA — fetched from the NestJS backend (no more static dummy data)
import publicCatalogApi from "@/lib/publicCatalogApi";
import rfqApi from "@/lib/rfqApi";
import LazyCacheImage from "@/components/shared/LazyCacheImage";

// ✅ SETTINGS — admin-controlled recommendation mode (all / category / selected)
import {
  loadProductsSettings,
  resolveRecommendations,
} from "@/lib/productsSettings";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

const PAGE_CONFIG = {
  layout: {
    container: "max-w-7xl",      // page width
    contentSplit: "lg:grid-cols-3", // left 2 cols + right sticky col
  },
  card: {
    variant: "elevated",          // "elevated" | "outlined" | "flat"
    radius: "xl",                 // "md" | "lg" | "xl"
    padding: "lg",                // "sm" | "md" | "lg"
  },
  heading: {
    productName: "lg",            // "sm" | "md" | "lg"  → product title size
    section: "md",                // section eyebrow size
  },
  gallery: {
    aspect: "square",             // "square" | "landscape" | "wide"
    thumbSize: "md",              // "sm" | "md" | "lg"
    showAngleLabels: true,        // angle badge on main image
    showCounter: true,            // 1/4 counter badge
  },
  description: {
    maxChars: 260,                // truncate after N chars
    expandable: true,             // show "Read more / Read less"
  },
  specs: {
    columns: 2,                   // 1 | 2  (spec grid columns)
    mergeCustomAttributes: true,  // merge product.attributes into spec table
  },
  reviews: {
    maxVisiblePerClient: 2,       // reviews shown per client before "view all"
    showSummary: true,            // average-rating strip
  },
  related: {
    enabled: true,
    maxItems: 3,                  // related products from same subcategory
  },
  sections: {                     // turn whole sections on/off
    gallery: true,
    overview: true,
    description: true,
    specifications: true,
    certifications: true,
    brochure: true,
    brand: true,
    clients: true,
    related: true,
  },
};

/* JIT-safe full class strings — PAGE_CONFIG keys map into these */
const UI = {
  cardVariants: {
    elevated: "bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow",
    outlined: "bg-white border-2 border-slate-200",
    flat:     "bg-white border border-slate-100",
  },
  radii:    { md: "rounded-lg", lg: "rounded-xl", xl: "rounded-2xl" },
  paddings: { sm: "p-4", md: "p-6", lg: "p-6 md:p-8" },
  productNameSizes: {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
  },
  sectionTitleSizes: { sm: "text-[10px]", md: "text-xs", lg: "text-sm" },
  galleryAspects: { square: "aspect-square", landscape: "aspect-[4/3]", wide: "aspect-video" },
  thumbSizes: { sm: "w-14 h-14", md: "w-16 h-16", lg: "w-20 h-20" },
  specCols: { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2" },
};

const cardClass = () =>
  `${UI.cardVariants[PAGE_CONFIG.card.variant]} ${UI.radii[PAGE_CONFIG.card.radius]} ${UI.paddings[PAGE_CONFIG.card.padding]}`;

/* ============================================================================
   2–5. DATA LAYER — LIVE FROM BACKEND
   ----------------------------------------------------------------------------
   Lookups (category / subcategory / brand) and the product list are loaded
   from the API inside the component. `reshapeProduct` maps a backend product
   into the structure this page's render expects.
   ========================================================================== */

// Reshape a live backend product into the structure this page's render expects.
function reshapeProduct(p) {
  const brandName =
    p.brand && typeof p.brand === "object" ? p.brand.name : p.brand || "";
  // specifications may arrive as an array [{key,value}] or an object map.
  let attributes = {};
  if (Array.isArray(p.specifications)) {
    attributes = p.specifications.reduce((acc, s) => {
      if (s?.key) acc[s.key] = s.value;
      return acc;
    }, {});
  } else if (p.specifications && typeof p.specifications === "object") {
    attributes = p.specifications;
  }
  const certifications = Array.isArray(p.certifications)
    ? p.certifications.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean)
    : [];
  return {
    sku: p.id,
    id: p.id,
    model: p.model || "",
    name: p.name,
    categoryId: p.categoryId,
    subCategoryId: p.subcategoryId || p.subCategoryId || "",
    subcategoryId: p.subcategoryId || "",
    brandId: p.brandId || p.distributorId || (p.brand && p.brand.id) || "",
    distributorId: p.brandId || p.distributorId || (p.brand && p.brand.id) || "",
    clientIds: [],
    brandName,
    specification: p.keyFeatures || "",
    description: p.description || p.keyFeatures || "",
    manufacturer: p.manufacturer || "",
    material: p.material || "",
    certifications,
    attributes,
    images: Array.isArray(p.images) ? p.images : [],
    // Brochure (now surfaced on the public detail page).
    brochure: p.brochureUrl
      ? {
          url: p.brochureUrl,
          label: p.brochureName || "Download Brochure",
          size: p.brochureSize ? `${(p.brochureSize / 1024).toFixed(0)} KB` : "",
        }
      : undefined,
  };
}

/* ============================================================================
   6. SMALL REUSABLE PIECES (all read PAGE_CONFIG)
   ========================================================================== */

const Eyebrow = ({ children }) => (
  <p className={`${UI.sectionTitleSizes[PAGE_CONFIG.heading.section]} font-black text-slate-400 uppercase tracking-widest`}>
    {children}
  </p>
);

const Card = ({ children, className = "" }) => (
  <div className={`${cardClass()} ${className}`}>{children}</div>
);

const Stars = ({ rating, size = "text-sm" }) => (
  <span className={`${size} leading-none tracking-tight`} aria-label={`${rating} out of 5 stars`}>
    <span className="text-amber-400">{"★".repeat(Math.round(rating))}</span>
    <span className="text-slate-200">{"★".repeat(5 - Math.round(rating))}</span>
  </span>
);

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/600x600/f1f5f9/94a3b8?text=Image+Unavailable";
};

/* Expandable description, length controlled by PAGE_CONFIG.description */
function DescriptionBlock({ text }) {
  const [expanded, setExpanded] = useState(false);
  const { maxChars, expandable } = PAGE_CONFIG.description;
  if (!text) return null;

  // Measure length off the plain text (tags stripped) so long/short detection
  // still works the same way it did for plain-text descriptions.
  const plain = text.replace(/<[^>]+>/g, "");
  const isLong = plain.length > maxChars;

  if (!isLong || expanded) {
    return (
      <div>
        <RichTextRenderer html={text} />
        {isLong && expandable && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-2 text-xs font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors"
          >
            − Read less
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
        {plain.slice(0, maxChars).trimEnd()}…
      </p>
      {expandable && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 text-xs font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors"
        >
          + Read more
        </button>
      )}
    </div>
  );
}

/* Image gallery — main image + thumbnail rail */
function ImageGallery({ images, productName }) {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className={`${UI.galleryAspects[PAGE_CONFIG.gallery.aspect]} bg-slate-100 ${UI.radii[PAGE_CONFIG.card.radius]} flex flex-col items-center justify-center text-slate-400`}>
        <span className="text-4xl mb-2">🖼️</span>
        <span className="text-xs font-bold uppercase tracking-wider">Images coming soon</span>
      </div>
    );
  }
  const img = images[active];
  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className={`relative ${UI.galleryAspects[PAGE_CONFIG.gallery.aspect]} bg-slate-50 ${UI.radii[PAGE_CONFIG.card.radius]} overflow-hidden border border-slate-200/80 group flex items-center justify-center p-4`}>
        <LazyCacheImage
          src={img.url}
          alt={`${productName} — ${img.angle || "view"}`}
          onError={fallbackImg}
          className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {PAGE_CONFIG.gallery.showAngleLabels && img.angle && (
          <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
            {img.angle}
          </span>
        )}
        {PAGE_CONFIG.gallery.showCounter && images.length > 1 && (
          <span className="absolute top-3 right-3 bg-white/90 text-slate-700 text-[10px] font-black px-2 py-1 rounded-md border border-slate-200">
            {active + 1} / {images.length}
          </span>
        )}
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              title={im.angle}
              className={`${UI.thumbSizes[PAGE_CONFIG.gallery.thumbSize]} shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                i === active ? "border-blue-900 ring-2 ring-blue-900/20" : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
              }`}
            >
              <LazyCacheImage src={im.url} alt={im.angle || `view ${i + 1}`} onError={fallbackImg} className="w-full h-full object-contain bg-slate-50 p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Generic spec row */
const SpecItem = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200/60">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-semibold text-slate-900 break-words">{value}</span>
  </div>
);

/* ============================================================================
   7. PAGE COMPONENT
   ========================================================================== */
export default function ProductDetailPage() {
  const params = useParams();
  // Folder is /products/[sku], so the route param key is `sku`,
  // but its VALUE is the real product id (e.g. "PROD-0001").
  const productId = params.sku;

  /* ---- live catalog load ---- */
  const [products, setProducts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    publicCatalogApi
      .getCatalog()
      .then(({ categories, brands, products }) => {
        if (cancelled) return;
        setProducts(products.map(reshapeProduct));
        setCategoriesMap(
          Object.fromEntries(
            categories.map((c) => [
              c.id,
              { name: c.name, image: c.image || "", icon: c.icon || "📦", description: "" },
            ])
          )
        );
        setSubcategoriesMap(
          Object.fromEntries(
            categories.flatMap((c) =>
              (c.subcategories || []).map((s) => [
                s.id,
                { name: s.name, categoryId: c.id },
              ])
            )
          )
        );
        setBrandsMap(
          Object.fromEntries(
            brands.map((b) => [b.id, { id: b.id, name: b.name, productCount: b.productCount }])
          )
        );
      })
      .catch((err) => console.error("Failed to load product:", err))
      .finally(() => !cancelled && setLoadingData(false));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  /* ---- look up product + linked entities ---- */
  const product = useMemo(
    () => products.find((p) => p.id === productId) || null,
    [products, productId]
  );
  const category = product ? categoriesMap[product.categoryId] : null;
  const subCategory = product ? subcategoriesMap[product.subCategoryId] : null;
  const brand = product?.brandId
    ? brandsMap[product.brandId] || { name: product.brandName }
    : product?.brandName
    ? { name: product.brandName }
    : null;
  const clients = [];
  // ✅ Recommendations obey the admin's settings (all / category / selected).
  const [prodSettings, setProdSettings] = useState(loadProductsSettings);
  useEffect(() => {
    const reload = () => setProdSettings(loadProductsSettings());
    reload();
    window.addEventListener("sbs-products-settings-updated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("sbs-products-settings-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const realCurrent = products.find((p) => p.id === product.id) || product;
    return resolveRecommendations(prodSettings, products, realCurrent);
  }, [product, prodSettings, products]);

  /* ---- review aggregates ---- */
  const allReviews = clients.flatMap((c) => (c.reviews || []).map((r) => ({ ...r, client: c })));
  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : null;

  /* ---- RFQ cart state (unchanged behaviour, nicer toast) ---- */
  const [rfqCart, setRfqCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [formData, setFormData] = useState({ fullName: "", email: "", mobile: "", companyName: "", address: "", remarks: "" });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleQtyChange = (productId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const stepQty = (productId, delta) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, (prev[productId] || 1) + delta) }));
  };

  const addToRfqCart = (p) => {
    const selectedQty = quantities[p.sku] || 1;
    const pid = p.id || p.sku; // reshapeProduct sets both to the backend product id
    setRfqCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === pid);
      if (existing) {
        return prevCart.map((item) => (item.id === pid ? { ...item, quantity: selectedQty } : item));
      }
      return [...prevCart, { id: pid, productId: pid, name: p.name, quantity: selectedQty }];
    });
    showToast(`✓ ${selectedQty} unit${selectedQty > 1 ? "s" : ""} of ${p.sku} added to Quote Bucket`);
  };

  const removeFromCart = (id) => setRfqCart((prev) => prev.filter((item) => item.id !== id));

  const handleQuoteSubmission = async (e) => {
    e.preventDefault();
    if (rfqCart.length === 0) {
      showToast("Your Quote bucket is empty.");
      return;
    }
    const payload = {
      fullName: formData.fullName || "",
      companyName: formData.companyName || undefined,
      email: formData.email || "",
      mobile: formData.mobile || "",
      address: formData.address || undefined,
      remarks: formData.remarks || undefined,
      items: rfqCart.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity || 1,
      })),
    };
    try {
      await rfqApi.submit(payload);
      showToast(`✓ Quote request sent for ${rfqCart.length} item line${rfqCart.length > 1 ? "s" : ""}. We'll reply to ${formData.email}.`);
      setRfqCart([]);
      setShowFormModal(false);
      setFormData({ fullName: "", email: "", mobile: "", companyName: "", address: "", remarks: "" });
    } catch (err) {
      console.error("RFQ submission failed:", err);
      showToast("Submission failed: " + err.message);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* NOT FOUND                                                               */
  /* ---------------------------------------------------------------------- */
  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Loading product…
        </p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-6`}>
            <Link href="/products" className="text-blue-600 hover:text-blue-900 font-semibold text-sm">
              ← Back to Products
            </Link>
          </div>
        </div>
        <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center`}>
          <div className="text-6xl mb-4 opacity-30">🔍</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-500 font-medium mb-1">No catalogue entry exists for:</p>
          <p className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mb-8">{productId}</p>
          <Link href="/products">
            <button className="bg-blue-950 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-md">
              Return to Catalog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const currentInputQty = quantities[product.sku] || 1;
  const cartItem = rfqCart.find((item) => item.id === product.sku);
  const isAlreadyInCart = !!cartItem;
  const S = PAGE_CONFIG.sections;

  /* ---------------------------------------------------------------------- */
  /* MAIN RENDER                                                             */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">

      {/* ==================== HEADER ==================== */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3`}>
          <div>
            <Link href="/products" className="text-blue-600 hover:text-blue-900 font-semibold text-xs uppercase tracking-wider">
              ← Back to Products
            </Link>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">Product Details</h1>
          </div>
          <button
            onClick={() => {
              if (rfqCart.length === 0) { showToast("Your Quote Bucket is empty — add items below."); return; }
              setShowFormModal(true);
            }}
            className="bg-blue-950 text-white font-bold text-xs px-5 py-3 rounded-xl uppercase tracking-wider shadow-lg flex items-center space-x-3 hover:bg-blue-900 transition-all transform active:scale-95 whitespace-nowrap w-fit"
          >
            <span>📋</span>
            <span>Quote Bucket</span>
            <span className={`bg-lime-400 text-slate-950 rounded-md px-1.5 py-0.5 font-black text-[10px] ${rfqCart.length > 0 ? "animate-pulse" : ""}`}>
              {rfqCart.length} Lines
            </span>
          </button>
        </div>
      </div>

      {/* ==================== BREADCRUMB ==================== */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3">
        <div className={`${PAGE_CONFIG.layout.container} mx-auto text-xs font-medium text-slate-600 flex flex-wrap items-center gap-y-1`}>
          <Link href="/products" className="text-blue-600 hover:text-blue-900">Products</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span>{category?.icon} {category?.name}</span>
          <span className="mx-2 text-slate-300">/</span>
          <span>{subCategory?.name}</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-black text-slate-900 font-mono">{product.sku}</span>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-8 md:py-12`}>
        <div className={`grid grid-cols-1 ${PAGE_CONFIG.layout.contentSplit} gap-6 lg:gap-8 items-start`}>

          {/* ========== LEFT COLUMN (2/3) ========== */}
          <div className="lg:col-span-2 space-y-6">

            {/* ---- HERO: GALLERY + OVERVIEW ---- */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                {S.gallery && (
                  <ImageGallery images={product.images} productName={product.name} />
                )}

                {S.overview && (
                  <div className="flex flex-col">
                    {/* SKU + model chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {product.model && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                          Model: {product.model}
                        </span>
                      )}
                    </div>

                    {/* Product name — size from config */}
                    <h1 className={`${UI.productNameSizes[PAGE_CONFIG.heading.productName]} font-black text-slate-900 tracking-tight leading-tight`}>
                      {product.name}
                    </h1>

                    {product.specification && (
                      <p className="text-sm text-slate-500 font-medium mt-2">{product.specification}</p>
                    )}

                    {/* Brand chip (brand allocation) */}
                    {brand && (
                      <div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 w-fit">
                        <LazyCacheImage src={brand.logo} alt={brand.name} onError={fallbackImg} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</p>
                          <p className="text-sm font-black text-slate-900">{brand.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Category / subcategory allocation chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {category && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg">
                          {category.icon} {category.name}
                        </span>
                      )}
                      {subCategory && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                          {subCategory.name}
                        </span>
                      )}
                    </div>

                    {/* Zone + rating row */}
                    <div className="mt-auto pt-5 space-y-2.5">
                      {product.zone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>📍</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warehouse:</span>
                          <span className="font-bold text-emerald-700">{product.zone}</span>
                        </div>
                      )}
                      {avgRating && PAGE_CONFIG.reviews.showSummary && (
                        <div className="flex items-center gap-2">
                          <Stars rating={Number(avgRating)} />
                          <span className="text-xs font-black text-slate-900">{avgRating}</span>
                          <span className="text-xs text-slate-400 font-medium">({allReviews.length} client review{allReviews.length > 1 ? "s" : ""})</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Value:</span>
                        <span className="text-xs font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          Price On Request
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* ---- DESCRIPTION ---- */}
            {S.description && product.description && (
              <Card>
                <Eyebrow>Product Description</Eyebrow>
                <div className="mt-3">
                  <DescriptionBlock text={product.description} />
                </div>
              </Card>
            )}

            {/* ---- SPECIFICATIONS (standard fields + custom key/values) ---- */}
            {S.specifications && (
              <Card>
                <Eyebrow>Technical Specifications</Eyebrow>
                <div className={`grid ${UI.specCols[PAGE_CONFIG.specs.columns]} gap-2.5 mt-4`}>
                  {product.manufacturer && <SpecItem label="Manufacturer" value={product.manufacturer} />}
                  {product.material && <SpecItem label="Material" value={product.material} />}
                  {product.weight && <SpecItem label="Weight" value={product.weight} />}
                  {product.capacity && <SpecItem label="Capacity" value={product.capacity} />}
                  {product.wattage && <SpecItem label="Power" value={product.wattage} />}
                  {product.dimensions && (
                    <SpecItem
                      label="Dimensions (H × W × D)"
                      value={`${product.dimensions.height} × ${product.dimensions.width} × ${product.dimensions.depth}`}
                    />
                  )}
                  {/* CUSTOM KEY/VALUE PAIRS — "we can create our own key and value" */}
                  {PAGE_CONFIG.specs.mergeCustomAttributes &&
                    product.attributes &&
                    Object.entries(product.attributes).map(([key, value]) => (
                      <SpecItem key={key} label={key} value={value} />
                    ))}
                </div>

                {/* Certifications */}
                {S.certifications && product.certifications?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <Eyebrow>Certifications & Standards</Eyebrow>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.certifications.map((cert) => (
                        <span key={cert} className="flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                          <span>🛡️</span> {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brochure download */}
                {S.brochure && product.brochure && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <a
                      href={product.brochure.url}
                      download
                      className="flex items-center justify-between gap-4 p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">📄</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                            {product.brochure.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            PDF {product.brochure.size ? `• ${product.brochure.size}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider border border-blue-200 px-3 py-2 rounded-lg group-hover:bg-blue-700 group-hover:text-white transition-colors shrink-0">
                        ⬇ Download
                      </span>
                    </a>
                  </div>
                )}
              </Card>
            )}

            {/* ---- DISTRIBUTOR BRAND (full node from flow) ---- */}
            {S.brand && brand && (
              <Card>
                <Eyebrow>Distributor Brand</Eyebrow>
                <div className="flex flex-col sm:flex-row gap-5 mt-4">
                  <LazyCacheImage src={brand.logo} alt={brand.name} onError={fallbackImg} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{brand.name}</h3>
                      <span className="text-[10px] font-black text-lime-700 bg-lime-50 border border-lime-200 px-2 py-0.5 rounded uppercase tracking-wider">
                        Authorized Partner
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">{brand.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                      {/* <SpecItem label="Location" value={brand.location} /> */}
                      <SpecItem label="Products Listed" value={`${brand.productCount}+`} />
                      {/* <SpecItem label="Operational Zone" value={brand.operationalZone} /> */}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {brand.webUrl && (
                        <a href={brand.webUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors">
                          🌐 Visit Website →
                        </a>
                      )}
                      {brand.email && (
                        <a href={`mailto:${brand.email}`}
                          className="text-xs font-black text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors">
                          ✉️ {brand.email}
                        </a>
                      )}
                    </div>

                    {brand.gallery?.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto custom-scrollbar pb-1">
                        {brand.gallery.map((g, i) => (
                          <LazyCacheImage key={i} src={g} alt={`${brand.name} gallery ${i + 1}`} onError={fallbackImg}
                            className="h-20 rounded-lg object-cover border border-slate-200 shrink-0" containerClassName="h-20 shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* ---- CLIENTS & REVIEWS (full node from flow) ---- */}
            {S.clients && clients.length > 0 && (
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Eyebrow>Trusted By {clients.length} Client{clients.length > 1 ? "s" : ""}</Eyebrow>
                  {avgRating && PAGE_CONFIG.reviews.showSummary && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                      <Stars rating={Number(avgRating)} size="text-xs" />
                      <span className="text-xs font-black text-amber-800">{avgRating} / 5</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mt-4">
                  {clients.map((client) => {
                    const reviews = client.reviews || [];
                    const isExpanded = !!expandedReviews[client.id];
                    const visibleReviews = isExpanded ? reviews : reviews.slice(0, PAGE_CONFIG.reviews.maxVisiblePerClient);
                    return (
                      <div key={client.id} className="border border-slate-200/80 rounded-xl p-4 md:p-5 bg-slate-50/50">
                        {/* client header */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <LazyCacheImage src={client.logo} alt={client.company} onError={fallbackImg}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" containerClassName="shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <h4 className="text-sm font-black text-slate-900">{client.company}</h4>
                              {client.url && (
                                <a href={client.url} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:text-blue-900">
                                  Visit ↗
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-semibold">{client.name}</p>
                            {client.details && (
                              <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">{client.details}</p>
                            )}

                            {/* contacts + socials */}
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              {client.contact?.phone && (
                                <a href={`tel:${client.contact.phone}`} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md hover:border-blue-300 transition-colors">
                                  📞 {client.contact.phone}
                                </a>
                              )}
                              {client.contact?.email && (
                                <a href={`mailto:${client.contact.email}`} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md hover:border-blue-300 transition-colors">
                                  ✉️ {client.contact.email}
                                </a>
                              )}
                              {client.social?.linkedin && (
                                <a href={client.social.linkedin} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">in LinkedIn</a>
                              )}
                              {client.social?.instagram && (
                                <a href={client.social.instagram} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] font-black text-pink-700 bg-pink-50 border border-pink-100 px-2 py-1 rounded-md hover:bg-pink-100 transition-colors">◎ Instagram</a>
                              )}
                              {client.social?.twitter && (
                                <a href={client.social.twitter} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors">𝕏 Twitter</a>
                              )}
                            </div>

                            {/* client gallery */}
                            {client.gallery?.length > 0 && (
                              <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
                                {client.gallery.map((g, i) => (
                                  <LazyCacheImage key={i} src={g} alt={`${client.company} site ${i + 1}`} onError={fallbackImg}
                                    className="h-16 rounded-lg object-cover border border-slate-200 shrink-0" containerClassName="h-16 shrink-0" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* reviews */}
                        {reviews.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-3">
                            {visibleReviews.map((review, i) => (
                              <div key={i} className="bg-white rounded-lg border border-slate-200/70 p-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                  <Stars rating={review.rating} size="text-xs" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">"{review.description}"</p>
                              </div>
                            ))}
                            {reviews.length > PAGE_CONFIG.reviews.maxVisiblePerClient && (
                              <button
                                onClick={() => setExpandedReviews((prev) => ({ ...prev, [client.id]: !isExpanded }))}
                                className="text-[10px] font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors"
                              >
                                {isExpanded ? "− Show fewer reviews" : `+ View all ${reviews.length} reviews`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* ---- RELATED PRODUCTS (same category + subcategory) ---- */}
            {S.related && relatedProducts.length > 0 && (
              <Card>
                <Eyebrow>
                  More in {category?.name} · {subCategory?.name}
                </Eyebrow>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {relatedProducts.map((rp) => (
                    <Link key={rp.id} href={`/products/${rp.id}`} className="group">
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white hover:shadow-md hover:border-blue-300 transition-all h-full flex flex-col">
                        <div className="aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                          <LazyCacheImage src={rp.images?.[0]?.url} alt={rp.name} onError={fallbackImg}
                            className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-3.5 flex flex-col flex-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{rp.id}</span>
                          <h5 className="text-xs font-black text-slate-900 mt-0.5 leading-snug group-hover:text-blue-900 transition-colors">
                            {rp.name}
                          </h5>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider mt-auto pt-2">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* ========== RIGHT COLUMN — STICKY ADD-TO-QUOTE ========== */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <Card>
              <h2 className="text-base font-black text-slate-900">Add to Quote</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 mb-5">
                B2B bulk pricing • GST invoice
              </p>

              {/* quantity stepper */}
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                Required Quantity (Units)
              </label>
              <div className="flex items-stretch gap-2 mb-5">
                <button onClick={() => stepQty(product.sku, -1)}
                  className="w-11 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-lg hover:border-blue-950 hover:text-blue-950 transition-colors active:scale-95"
                  aria-label="Decrease quantity">−</button>
                <input
                  type="number" min="1" value={currentInputQty}
                  onChange={(e) => handleQtyChange(product.sku, e.target.value)}
                  className="flex-1 text-center font-black text-lg border-2 border-slate-200 rounded-xl py-2.5 focus:outline-none focus:border-blue-950 bg-slate-50"
                  title="Set Bulk Quantity Requirement"
                />
                <button onClick={() => stepQty(product.sku, 1)}
                  className="w-11 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-lg hover:border-blue-950 hover:text-blue-950 transition-colors active:scale-95"
                  aria-label="Increase quantity">+</button>
              </div>

              {/* add to cart */}
              <button
                onClick={() => addToRfqCart(product)}
                className={`w-full text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-colors border-2 mb-3 ${
                  isAlreadyInCart
                    ? "bg-lime-500 text-slate-900 border-lime-500 hover:bg-lime-400"
                    : "bg-blue-950 text-white border-blue-950 hover:bg-blue-900"
                }`}
              >
                {isAlreadyInCart ? "✓ Added — Update Quantity" : "➕ Add to Quote Bucket"}
              </button>

              {isAlreadyInCart && (
                <div className="bg-lime-50 border border-lime-200 rounded-lg p-2.5 mb-3">
                  <p className="text-[11px] font-black text-lime-900 text-center">
                    In Quote Bucket • {cartItem.quantity} units
                  </p>
                </div>
              )}

              {/* request quotation */}
              <button
                onClick={() => { if (rfqCart.length === 0) { showToast("Add items to your Quote Bucket first."); return; } setShowFormModal(true); }}
                className={`w-full text-xs font-black uppercase tracking-wider py-3.5 rounded-xl border-2 transition-colors ${
                  rfqCart.length === 0
                    ? "text-slate-300 border-slate-200 cursor-not-allowed"
                    : "text-blue-950 border-blue-950 hover:bg-blue-50"
                }`}
              >
                🚀 Request Quotation
              </button>

              {/* quick facts */}
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
                {[
                  product.zone && ["📍 Warehouse", product.zone],
                  brand && ["🏷️ Brand", brand.name],
                  product.model && ["🔢 Model", product.model],
                  ["📦 Availability", "In Stock — Bulk Ready"],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">{label}</span>
                    <span className="font-black text-slate-800 text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* assurance strip */}
            <Card className="!p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["🛡️", "Genuine Brands"], ["📑", "Test Certificates"], ["🚚", "Site Delivery"]].map(([icon, label]) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="text-xl">{icon}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ==================== RFQ MODAL ==================== */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="bg-blue-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">Compile Procurement RFQ Slip</h2>
                <p className="text-[10px] text-blue-200/70 font-medium">Please supply accurate communication coordinates below.</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-white/60 hover:text-white font-bold text-sm" aria-label="Close">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Items Bundled Inside Order Line ({rfqCart.length})
                </p>
                <div className="divide-y divide-slate-200/60 max-h-36 overflow-y-auto pr-1">
                  {rfqCart.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                      <div className="truncate max-w-sm">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.id}</span>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="bg-blue-50 text-blue-900 font-black px-2 py-0.5 rounded text-[10px]">
                          QTY: {item.quantity} Units
                        </span>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-500 font-bold text-xs hover:text-rose-700" aria-label={`Remove ${item.name}`}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleQuoteSubmission} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Contact Full Name</label>
                    <input type="text" required value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g., Amit Sharma"
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Company / Enterprise Entity</label>
                    <input type="text" required value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g., Singrauli Minerals Private Ltd"
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Official Email Address</label>
                    <input type="email" required value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="procurement@company.com"
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Mobile Number</label>
                    <input type="tel" required value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Delivery Address (Optional)</label>
                  <input type="text" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Company address for delivery / quotation"
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Specific Dispatch Requirements / Remarks (Optional)</label>
                  <textarea rows="3" value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Provide warehouse dispatch preferences, timeline constraints, or special packaging protocols..."
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                </div>

                <button type="submit"
                  className="w-full bg-blue-950 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-blue-900 transition-colors">
                  🚀 Dispatch Quotation Slip via Email & SMS
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST ==================== */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl border border-slate-700 max-w-[90vw] text-center animate-[toastIn_.25s_ease-out]">
          {toast}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9px; }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}