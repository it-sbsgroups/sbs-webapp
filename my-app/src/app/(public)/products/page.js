"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ✅ LIVE DATA — fetched from the NestJS backend (no more static dummy data)
import publicCatalogApi from "@/lib/publicCatalogApi";
// import Breadcrumb from "@/components/shared/Breadcrumb";
import apiClient from "@/lib/client";
import rfqApi from "@/lib/rfqApi";

// ✅ SETTINGS — admin-controlled look & behavior (read-only here)
import {
  loadProductsSettings,
  GAP_CLASS,
  COLS_CLASS,
  RATIO_CLASS,
  CARD_STYLE_CLASS,
  IMAGE_FIT_CLASS,
} from "@/lib/productsSettings";

// First usable image url for a product, with a safe fallback.
const getProductImage = (product) => {
  const img = Array.isArray(product.images)
    ? product.images.find((i) => i?.url)
    : null;
  return img?.url || "";
};

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const globalSearchQuery = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlSubcategory = searchParams.get("subcategory") || "";

  // ---- SETTINGS (live) ----------------------------------------------------
  // Loaded on mount; re-loaded whenever the admin saves (cross-tab event).
  const [settings, setSettings] = useState(loadProductsSettings);
  useEffect(() => {
    const reload = () => setSettings(loadProductsSettings());
    reload(); // hydrate from localStorage after mount
    window.addEventListener("sbs-products-settings-updated", reload);
    window.addEventListener("storage", reload); // other tabs
    return () => {
      window.removeEventListener("sbs-products-settings-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const { layout, card, toggles, rfq } = settings;

  // ---- LIVE DATA (categories / brands / products from backend) ------------
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allFlattenedProducts, setAllFlattenedProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dataNonce, setDataNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    publicCatalogApi
      .getCatalog()
      .then(({ categories, brands, products }) => {
        if (cancelled) return;
        setCategories(categories);
        setBrands(brands);
        setAllFlattenedProducts(products);
        setLoadError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load catalog:", err);
        setLoadError("Could not load products. Please try again.");
      })
      .finally(() => !cancelled && setLoadingData(false));
    return () => {
      cancelled = true;
    };
  }, [dataNonce]);

  // Optional silent auto-refresh (re-fetch from API).
  useEffect(() => {
    const secs = toggles?.autoRefreshSeconds || 0;
    if (!secs || secs < 1) return;
    const t = setInterval(() => setDataNonce((n) => n + 1), secs * 1000);
    return () => clearInterval(t);
  }, [toggles?.autoRefreshSeconds]);

  // Inline live search (2+ chars, auto-searches, no Enter needed)
  const [liveSearch, setLiveSearch] = useState("");

  // Pagination (size from settings)
  const PRODUCTS_PER_PAGE = layout?.productsPerPage || 12;
  const [currentPage, setCurrentPage] = useState(1);

  // RFQ cart state
  const [rfqCart, setRfqCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);

  // Sidebar selection state
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedItems, setSelectedItems] = useState({});

  // Brand filter
  const [distributorFilter, setDistributorFilter] = useState("ALL");

  // Support ?brand=<id> deep-links (e.g. from a Brand detail page's
  // "See All Products" CTA) — same underlying filter as the sidebar dropdown.
  useEffect(() => {
    const urlBrand = searchParams.get("brand");
    if (urlBrand) setDistributorFilter(urlBrand);
  }, [searchParams]);

  // Dynamic RFQ form data — keyed by each configured field.key
  const initialFormData = useMemo(() => {
    const o = {};
    (rfq?.fields || []).forEach((f) => {
      o[f.key] = "";
    });
    return o;
  }, [rfq?.fields]);
  const [formData, setFormData] = useState(initialFormData);
  useEffect(() => setFormData(initialFormData), [initialFormData]);

  // Pre-apply sidebar selection from ?category=&subcategory=
  useEffect(() => {
    if (!urlCategory && !urlSubcategory) return;
    const category = categories.find((c) => c.id === urlCategory);
    if (!category) return;
    setExpandedCategories((prev) => ({ ...prev, [category.id]: true }));
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (urlSubcategory) {
        const sub = category.subcategories.find((s) => s.id === urlSubcategory);
        if (sub) updated[sub.id] = true;
        const allChecked = category.subcategories.every((s) => updated[s.id]);
        if (allChecked) updated[category.id] = true;
      } else {
        updated[category.id] = true;
        category.subcategories.forEach((s) => {
          updated[s.id] = true;
        });
      }
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlSubcategory]);

  const handleToggleCategory = (categoryId) =>
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));

  const handleSelectCategory = (categoryId) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      const category = categories.find((c) => c.id === categoryId);
      if (updated[categoryId]) {
        delete updated[categoryId];
        category?.subcategories.forEach((sub) => delete updated[sub.id]);
      } else {
        updated[categoryId] = true;
        category?.subcategories.forEach((sub) => (updated[sub.id] = true));
      }
      return updated;
    });
  };

  const handleSelectSubcategory = (categoryId, subcategoryId) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[subcategoryId]) delete updated[subcategoryId];
      else updated[subcategoryId] = true;
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        const allChecked = category.subcategories.every((sub) => updated[sub.id]);
        if (allChecked) updated[categoryId] = true;
        else delete updated[categoryId];
      }
      return updated;
    });
  };

  // All subcategory IDs across every category. Selections are stored by raw ID
  // (categories AND subcategories live in one `selectedItems` map), so a selected
  // *subcategory* is identified by membership in this set — not a string prefix.
  const subcategoryIdSet = useMemo(() => {
    const set = new Set();
    categories.forEach((c) =>
      (c.subcategories || []).forEach((s) => set.add(s.id))
    );
    return set;
  }, [categories]);

  const getSelectedCount = () =>
    Object.keys(selectedItems).filter((key) => subcategoryIdSet.has(key)).length;

  const handleQtyChange = (productId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const addToRfqCart = (product) => {
    const selectedQty = quantities[product.id] || 1;
    setRfqCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: selectedQty } : item
        );
      }
      return [...prevCart, { ...product, quantity: selectedQty }];
    });
    alert(`Successfully appended ${selectedQty} units of ${product.id} to your Quote Bucket.`);
  };

  const removeFromCart = (id) =>
    setRfqCart((prev) => prev.filter((item) => item.id !== id));

  const handleQuoteSubmission = async (e) => {
    e.preventDefault();
    if (rfqCart.length === 0) {
      alert("Your Quote bucket is empty.");
      return;
    }

    // The form fields are admin-configured (rfq.fields, keyed by f.key). Map the
    // well-known keys onto the backend's fixed columns; everything else is kept
    // in customFields so nothing is lost.
    const known = ["fullName", "companyName", "email", "mobile", "remarks"];
    const customFields = {};
    Object.entries(formData || {}).forEach(([k, v]) => {
      if (!known.includes(k) && v !== "" && v != null) customFields[k] = v;
    });

    const payload = {
      fullName: formData.fullName || formData.name || "",
      companyName: formData.companyName || undefined,
      email: formData.email || "",
      mobile: formData.mobile || formData.phone || "",
      remarks: formData.remarks || formData.message || undefined,
      customFields: Object.keys(customFields).length ? customFields : undefined,
      items: rfqCart.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
      })),
    };

    try {
      await rfqApi.submit(payload);
      alert(
        `Thank you, ${payload.fullName || ""}! Your quotation request for ${rfqCart.length} item line${rfqCart.length !== 1 ? "s" : ""} has been submitted.`
      );
      setRfqCart([]);
      setShowFormModal(false);
      setFormData(initialFormData);
    } catch (err) {
      console.error("RFQ submission failed:", err);
      alert("Sorry, your request could not be submitted: " + err.message);
    }
  };

  // Brands available within the current subcategory selection (or all if none).
  const availableDistributors = useMemo(() => {
    const activeSubcatIds = Object.keys(selectedItems).filter((k) =>
      subcategoryIdSet.has(k)
    );
    const scope =
      activeSubcatIds.length > 0
        ? allFlattenedProducts.filter((p) => activeSubcatIds.includes(p.subcategoryId))
        : allFlattenedProducts;
    const ids = [...new Set(scope.map((p) => p.distributorId))];
    return brands.filter((d) => ids.includes(d.id));
  }, [allFlattenedProducts, selectedItems, brands, subcategoryIdSet]);

  // ============================ FILTER ENGINE ============================
  const finalVisibleProducts = useMemo(() => {
    const activeSubcatIds = Object.keys(selectedItems).filter((key) =>
      subcategoryIdSet.has(key)
    );
    const liveQuery = liveSearch.trim();
    const effectiveQuery = liveQuery.length >= 2 ? liveQuery : globalSearchQuery;
    const query = effectiveQuery.toLowerCase().trim();

    return allFlattenedProducts.filter((product) => {
      if (activeSubcatIds.length > 0 && !activeSubcatIds.includes(product.subcategoryId))
        return false;
      if (distributorFilter !== "ALL" && product.distributorId !== distributorFilter)
        return false;
      if (query) {
        return (
          (product.name || "").toLowerCase().includes(query) ||
          (product.id || "").toLowerCase().includes(query) ||
          (product.keyFeatures || "").toLowerCase().includes(query) ||
          ((typeof product.brand === "object" ? product.brand?.name : product.brand) || "").toLowerCase().includes(query) ||
          (product.model || "").toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allFlattenedProducts, selectedItems, distributorFilter, globalSearchQuery, liveSearch, subcategoryIdSet]);

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(finalVisibleProducts.length / PRODUCTS_PER_PAGE));
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = toggles?.showPagination
    ? finalVisibleProducts.slice(pageStart, pageStart + PRODUCTS_PER_PAGE)
    : finalVisibleProducts;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedItems, distributorFilter, globalSearchQuery, liveSearch, PRODUCTS_PER_PAGE]);

  // ---- derived style values from settings ---------------------------------
  const gridColsClass = COLS_CLASS[layout?.cardsPerRow] || COLS_CLASS[3];
  const gridGapClass = GAP_CLASS[layout?.gap] || GAP_CLASS.md;
  const cardStyleClass = CARD_STYLE_CLASS[card?.style] || CARD_STYLE_CLASS.elevated;
  const imageFitClass = IMAGE_FIT_CLASS[card?.imageFit] || IMAGE_FIT_CLASS.contain;
  const imageRatioClass = RATIO_CLASS[card?.imageRatio] || RATIO_CLASS.square;
  const containerWidth = layout?.maxWidth || "max-w-6xl";

  return (
    <div
      className="min-h-screen font-sans antialiased text-slate-800"
      style={{ backgroundColor: layout?.pageBackground || "#f8fafc" }}
    >
      {/* BREADCRUMB */}
      {/* <Breadcrumb items={[{ label: "Products" }]} /> */}

      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">Our Products</h1>
            <div className="flex items-end gap-3 self-start sm:self-center">
              {toggles?.showSearch && (
                <div className="flex flex-col">
                  <div className="relative">
                    <input type="text" value={liveSearch} onChange={(e) => setLiveSearch(e.target.value)} placeholder="Type 2+ characters to search..." className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg pl-8 pr-7 py-2 bg-white focus:outline-none focus:border-blue-900 min-w-[180px]" />
                    {liveSearch && (
                      <button onClick={() => setLiveSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-xs" aria-label="Clear search" >✕</button>
                    )}
                  </div>
                </div>
              )}

              {toggles?.showBrandFilter && (
                <div className="flex flex-col">
                  <select value={distributorFilter} onChange={(e) => setDistributorFilter(e.target.value)} className="text-xs font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-900 min-w-[150px]" >
                    <option value="ALL">All Brands</option>
                    {availableDistributors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {globalSearchQuery && (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 self-end">
                  <span>Filter: <b className="font-black">"{globalSearchQuery}"</b></span>
                  <Link href="/products" className="text-red-500 hover:text-red-700 font-bold ml-2 border-l border-blue-200 pl-2 uppercase tracking-wide text-[10px]">Clear ×</Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href={`${apiClient.baseUrl}/products/catalogue/download`} className="text-blue-900 font-bold text-xs px-5 py-3 rounded-xl uppercase tracking-wider border-2 border-blue-900 flex items-center gap-2 hover:bg-blue-50 transition-all whitespace-nowrap" >⬇ Download Catalogue</a>

            {toggles?.showQuoteBucketButton && rfq?.enabled && (
            <button onClick={() => {
                if (rfqCart.length === 0) {
                  alert("Your Quote bucket is empty.");
                  return;
                }
                setShowFormModal(true);
              }}
              className="text-white font-bold text-xs px-5 py-3 rounded-xl uppercase tracking-wider shadow-lg flex items-center space-x-3 hover:opacity-90 transition-all transform active:scale-95 whitespace-nowrap"
              style={{ backgroundColor: rfq?.buttonColor || "#172554" }} >
              <span>📋</span>
              <span>{rfq?.buttonText || "Quote Bucket"}</span>
              <span className="bg-lime-400 text-slate-950 rounded-md px-1.5 py-0.5 font-black text-[10px]">{rfqCart.length} Lines</span>
            </button>
          )}
          </div>
        </div>
      </div>

      {/* VIEW ENGINE LAYOUT CONTROLLER */}
      {loadingData ? (
        <div className="p-16 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Loading live catalog…</div>
      ) : loadError ? (
        <div className="p-16 text-center">
          <p className="text-sm font-bold text-red-600">{loadError}</p>
          <button onClick={() => setDataNonce((n) => n + 1)} className="mt-4 text-xs font-black uppercase tracking-wider border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50" >Retry</button>
        </div>
      ) : (
      <div className="flex flex-col md:flex-row gap-0">
        {/* LEFT NAVIGATION SIDEBAR */}
        {toggles?.showSidebar && (
          <div className="w-full md:w-80 bg-white border-r border-slate-200 overflow-y-auto max-h-[calc(100vh-140px)] sticky top-24">
            <div className="p-4">
              <div className="mb-4 pb-4 border-b border-slate-200">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Categories</h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  Active Selection Tags:{" "}
                  <span className="font-black text-blue-900">{getSelectedCount()}</span>
                </p>
              </div>

              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <input type="checkbox" checked={!!selectedItems[category.id]} onChange={() => handleSelectCategory(category.id)} className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-900" />
                      <button onClick={() => handleToggleCategory(category.id)} className="flex-1 text-left flex items-center justify-between hover:text-blue-900 transition-colors" >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{category.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">{expandedCategories[category.id] ? "▼" : "▶"}</span>
                      </button>
                    </div>

                    {expandedCategories[category.id] && (
                      <div className="pl-8 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors bg-slate-50">
                            <input type="checkbox" checked={!!selectedItems[subcategory.id]} onChange={() =>
                                handleSelectSubcategory(category.id, subcategory.id)
                              }
                              className="w-3 h-3 rounded border-slate-300 cursor-pointer accent-blue-900" />
                            <span className="flex-1 text-xs font-semibold text-slate-700">{subcategory.name}</span>
                            <span className="text-[9px] text-slate-500 font-medium">({subcategory.productCount})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {getSelectedCount() > 0 && (
                <button onClick={() => setSelectedItems({})} className="w-full mt-6 text-xs font-bold text-slate-600 hover:text-slate-900 py-2 px-3 rounded-lg border border-slate-300 transition-colors" >✕ Clear Selection Filters</button>
              )}
            </div>
          </div>
        )}

        {/* MAIN PRODUCT CATALOG REGION */}
        <div className="flex-1 p-4 md:p-8">

          {/* DYNAMIC FEED GRID */}
          {finalVisibleProducts.length > 0 ? (
            <>
              <div className={`${containerWidth} mx-auto grid ${gridColsClass} ${gridGapClass}`}>
                {paginatedProducts.map((product) => {
                  const currentInputQty = quantities[product.id] || 1;
                  const isAlreadyInCart = rfqCart.some((item) => item.id === product.id);
                  const imageUrl = getProductImage(product);

                  return (
                    <div key={product.id} className={`flex flex-col ${card?.cornerRadius || "rounded-2xl"} ${cardStyleClass} transition-shadow relative overflow-hidden group`} style={{ backgroundColor: card?.cardBackground || "#ffffff" }} >
                      {/* IMAGE — fit/ratio/bg all admin-controlled */}
                      <div className={`relative w-full ${imageRatioClass} border-b border-slate-100 flex items-center justify-center p-4`} style={{ backgroundColor: card?.imageBackground || "#f8fafc" }}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} loading="lazy" className={`w-full h-full ${imageFitClass}`} />
                        ) : (
                          <span className="text-4xl text-slate-300">📦</span>
                        )}
                        {card?.showBrandBadge && (
                          <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-white/90 backdrop-blur text-slate-600 px-2 py-0.5 rounded tracking-wide border border-slate-200">
                            {typeof product.brand === "object" ? product.brand?.name : product.brand}
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-sm font-black text-black-400 tracking-tight transition-colors group-hover:[color:var(--accent)]" style={{ "--accent": card?.accentColor || "#1e3a8a" }} >{product.name}</h3>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col space-y-3">

                          {rfq?.enabled && (
                            <div className="flex items-center gap-2">
                              <div className="w-20 shrink-0">
                                <input type="number" min="1" value={currentInputQty} onChange={(e) => handleQtyChange(product.id, e.target.value)} className="w-full text-center font-bold text-xs border border-slate-200 rounded-lg py-2 focus:outline-none focus:border-blue-950 bg-slate-50" />
                              </div>
                              <button onClick={() => addToRfqCart(product)} className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg transition-colors border ${
                                  isAlreadyInCart
                                    ? "bg-lime-500 text-slate-900 border-lime-500"
                                    : "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
                                }`} >
                                {isAlreadyInCart ? "🔄 Update Bulk Units" : "➕ Add to Quote"}
                              </button>
                            </div>
                          )}

                          <Link href={`/products/${product.id}`}>
                            <button className="w-full text-[10px] font-black text-blue-600 uppercase tracking-wider py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">View Details</button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {toggles?.showPagination && totalPages > 1 && (
                <div className={`${containerWidth} mx-auto mt-10 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Showing{" "}
                    <span className="font-black text-slate-700">
                      {pageStart + 1}–
                      {Math.min(pageStart + PRODUCTS_PER_PAGE, finalVisibleProducts.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-slate-700">
                      {finalVisibleProducts.length}
                    </span>{" "}
                    items
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-xs font-black px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" >
                      ← Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`text-xs font-black w-9 h-9 rounded-lg border transition-colors ${
                          pageNum === currentPage
                            ? "bg-blue-950 text-white border-blue-950"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`} >
                        {pageNum}
                      </button>
                    ))}

                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-xs font-black px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto mt-12 shadow-sm">
              <span className="text-3xl">📦</span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight mt-3">No matching items indexed</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">We couldn't locate any catalog entry matching your query criteria.</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* RFQ MODAL — fields rendered dynamically from settings */}
      {showFormModal && rfq?.enabled && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="text-white px-6 py-4 flex justify-between items-center shrink-0" style={{ backgroundColor: rfq?.buttonColor || "#172554" }} >
              <h2 className="text-sm font-black uppercase tracking-wider">Compile Procurement RFQ Slip</h2>
              <button onClick={() => setShowFormModal(false)} className="text-white/60 hover:text-white font-bold text-sm" >✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Bundled Inside Order Line ({rfqCart.length})</p>
                <div className="divide-y divide-slate-200/60 max-h-36 overflow-y-auto pr-1">
                  {rfqCart.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                      <div className="truncate max-w-sm"><span className="font-bold text-slate-900">{item.name}</span></div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="bg-blue-50 text-blue-900 font-black px-2 py-0.5 rounded text-[10px]">QTY: {item.quantity} Units</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-500 font-bold text-xs" >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleQuoteSubmission} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(rfq?.fields || [])
                    .filter((f) => f.show && f.type !== "textarea")
                    .map((f) => (
                      <input key={f.key} type={f.type || "text"} required={!!f.required} value={formData[f.key] ?? ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.label} className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 font-medium bg-slate-50" />
                    ))}
                </div>

                {(rfq?.fields || [])
                  .filter((f) => f.show && f.type === "textarea")
                  .map((f) => (
                    <textarea key={f.key} rows={3} required={!!f.required} value={formData[f.key] ?? ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value }) } placeholder={f.label} className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 font-medium bg-slate-50" />
                  ))}

                <button type="submit" className="w-full text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider" style={{ backgroundColor: rfq?.buttonColor || "#172554" }} >
                  {rfq?.submitText || "🚀 Dispatch Quotation Slip"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicProductsCatalog() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Initialising Procurement Data Grid...</div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}