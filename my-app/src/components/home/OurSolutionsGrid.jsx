"use client";

import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import categoriesApi from "@/lib/categoriesApi";
import { ChevronLeft, Package, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────
// 1. Default settings (every colour & style value)
// ─────────────────────────────────────────────────
export const defaultSettings = {
  primaryColor: "#557b01",
  secondaryColor: "#ffffff",
  tertiaryColor: "rgba(255,255,255,0.8)",
  overlayGradientFrom: "rgba(0,0,0,0)",
  overlayGradientVia: "rgba(0,0,0,0)",
  overlayGradientTo: "rgba(0,0,0,0)",
  overlayHoverFrom: "rgba(0,0,0,0)",
  cardBorder: "1px solid #f3f4f6",
  cardHoverBorderColor: "#a3e635",
  cardHoverRing: "2px solid #d9f99d",
  cardShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  cardHoverShadow:
    "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  backButtonColor: "#1e3a8a",
  backButtonHoverColor: "#65a30d",
  subHeaderColor: "#9ca3af",
  viewAllColor: "#1e3a8a",
  viewAllHoverColor: "#65a30d",
  badgeBg: "rgba(255,255,255,0.9)",
  badgeTextColor: "#1e3a8a",
  skeletonBg: "#f3f4f6",
  emptyIconOpacity: 0,
  emptyTextColor: "#9ca3af",
};

// ─────────────────────────────────────────────────
// 2. Context + Provider + Hook
// ─────────────────────────────────────────────────
const OurSolutionsSettingsContext = createContext(defaultSettings);

export function useOurSolutionsSettings() {
  return useContext(OurSolutionsSettingsContext);
}

export function OurSolutionsSettingsProvider({ settings = {}, children }) {
  const merged = useMemo(() => ({ ...defaultSettings, ...settings }), [settings]);
  return (
    <OurSolutionsSettingsContext.Provider value={merged}>
      {children}
    </OurSolutionsSettingsContext.Provider>
  );
}

// ─────────────────────────────────────────────────
// 3. The main component (uses the hook)
// ─────────────────────────────────────────────────
export default function OurSolutionsGrid() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const s = useOurSolutionsSettings();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await categoriesApi.getAll();
        if (!alive) return;
        const active = (Array.isArray(data) ? data : [])
          .filter((c) => c.isActive !== false)
          .map((c) => ({
            ...c,
            subcategories: (c.subcategories || []).filter(
              (s) => s.isActive !== false
            ),
          }));
        setCategories(active);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const goToProducts = (categoryId, subcategoryId) => {
    router.push(`/products?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  const goToCategory = (categoryId) => {
    router.push(`/products?category=${categoryId}`);
  };

  const handleCategoryClick = (category) => {
    if (!category.subcategories || category.subcategories.length === 0) {
      goToCategory(category.id);
    } else {
      setSelectedCategory(category);
    }
  };

  // ── Shared card style helpers ──
  const applyCardHover = (el) => {
    el.style.borderColor = s.cardHoverBorderColor;
    el.style.boxShadow = s.cardHoverShadow;
    el.style.outline = s.cardHoverRing;
  };
  const removeCardHover = (el) => {
    el.style.border = s.cardBorder;
    el.style.boxShadow = s.cardShadow;
    el.style.outline = "none";
  };

  const cardInitialStyle = {
    border: s.cardBorder,
    boxShadow: s.cardShadow,
  };

  // ── Overlay style helpers ──
  const overlayBase = `linear-gradient(to top, ${s.overlayGradientFrom}, ${s.overlayGradientVia}, ${s.overlayGradientTo})`;
  const overlayHover = `linear-gradient(to top, ${s.overlayHoverFrom}, ${s.overlayGradientVia}, ${s.overlayGradientTo})`;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ── Title & Back button ── */}
        <div className="text-center relative">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              style={{ color: s.backButtonColor }}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors"
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = s.backButtonHoverColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = s.backButtonColor)
              }
            >
              <ChevronLeft size={16} /> Back to Categories
            </button>
          )}
          <h1 className="mt-1 text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
            {selectedCategory ? (
              <>
                {selectedCategory.name}{" "}
                <span style={{ color: s.primaryColor }}>Subcategories</span>
              </>
            ) : (
              <h1 className="text-5xl">
                Our <span style={{ color: s.primaryColor }}>Solutions</span>
              </h1>
            )}
          </h1>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{ backgroundColor: s.skeletonBg }}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] aspect-[16/10] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-16" style={{ color: s.emptyTextColor }}>
            <Package
              className="mx-auto h-10 w-10 mb-3"
              style={{ opacity: s.emptyIconOpacity }}
            />
            <p className="text-sm font-semibold">No categories available yet</p>
          </div>
        ) : !selectedCategory ? (
          /* ════════════════════════════════════════
             MAIN CATEGORIES VIEW
          ════════════════════════════════════════ */
          <div className="flex flex-wrap justify-center gap-6 animate-in fade-in duration-300">
            {categories.map((category) => {
              const subCount = category.subcategories.length;
              const productCount = category._count?.products ?? 0;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  style={cardInitialStyle}
                  className="group relative block w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] overflow-hidden rounded-2xl bg-gray-900 aspect-[16/10] transition-all duration-300 text-left"
                  onMouseEnter={(e) => applyCardHover(e.currentTarget)}
                  onMouseLeave={(e) => removeCardHover(e.currentTarget)}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={`${category.name} thumbnail`}
                      className="absolute inset-0 h-full w-full object-fill transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-950" />
                  )}

                  {/* Overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{ background: overlayBase }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = overlayHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = overlayBase)
                    }
                  />

                  {/* Product count badge */}
                  {productCount > 0 && (
                    <span
                      className="absolute top-3 right-3 rounded-full backdrop-blur-sm px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
                      style={{
                        backgroundColor: s.badgeBg,
                        color: s.badgeTextColor,
                      }}
                    >
                      {productCount} products
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* ════════════════════════════════════════
             SUBCATEGORIES VIEW
          ════════════════════════════════════════ */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <p
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: s.subHeaderColor }}
              >
                Choose a subcategory within {selectedCategory.name}
              </p>
              {(selectedCategory.subcategories?.length ?? 0) > 0 && (
                <button
                  onClick={() => goToCategory(selectedCategory.id)}
                  style={{ color: s.viewAllColor }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = s.viewAllHoverColor)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = s.viewAllColor)
                  }
                >
                  View all products <ArrowRight size={11} />
                </button>
              )}
            </div>

            {selectedCategory.subcategories.length === 0 ? (
              <p className="text-sm italic text-center py-12" style={{ color: s.emptyTextColor }}>
                No subcategories added yet.
              </p>
            ) : (
              <div className="flex flex-wrap justify-center gap-6">
                {selectedCategory.subcategories.map((sub) => {
                  const productCount = sub._count?.products ?? 0;
                  return (
                    <button
                      key={sub.id}
                      onClick={() =>
                        goToProducts(selectedCategory.id, sub.id)
                      }
                      style={cardInitialStyle}
                      className="group relative block w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] overflow-hidden rounded-2xl bg-gray-900 aspect-[16/10] transition-all duration-300 text-left"
                      onMouseEnter={(e) => applyCardHover(e.currentTarget)}
                      onMouseLeave={(e) => removeCardHover(e.currentTarget)}
                    >
                      {sub.image ? (
                        <img
                          src={sub.image}
                          alt={`${sub.name} thumbnail`}
                          className="absolute inset-0 h-full w-full object-fill transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-950" />
                      )}

                      <div
                        className="absolute inset-0 transition-opacity duration-300"
                        style={{ background: overlayBase }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = overlayHover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = overlayBase)
                        }
                      />

                      {productCount > 0 && (
                        <span
                          className="absolute top-3 right-3 rounded-full backdrop-blur-sm px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
                          style={{
                            backgroundColor: s.badgeBg,
                            color: s.badgeTextColor,
                          }}
                        >
                          {productCount} product{productCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}