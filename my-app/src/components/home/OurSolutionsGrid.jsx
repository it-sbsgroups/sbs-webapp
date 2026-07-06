"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import categoriesApi from "@/lib/categoriesApi";
import { ChevronLeft, Package, ArrowRight } from "lucide-react";

const FALLBACK_ICONS = ["📦", "⚙️", "🔧", "🏗️", "⚡", "🛠️", "🚛", "🔩"];

export default function OurSolutionsGrid() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
            subcategories: (c.subcategories || []).filter((s) => s.isActive !== false),
          }));
        setCategories(active);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const goToProducts = (categoryId, subcategoryId) => {
    router.push(`/products?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  const goToCategory = (categoryId) => {
    router.push(`/products?category=${categoryId}`);
  };

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section title & Back Navigation */}
        <div className="text-center relative">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-950 hover:text-lime-600 transition-colors"
            >
              <ChevronLeft size={16} /> Back to Categories
            </button>
          )}
          <h2 className="mt-1 text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
            {selectedCategory ? (
              <>
                {selectedCategory.name} <span className="text-lime-500">Subcategories</span>
              </>
            ) : (
              <>
                Our <span className="text-lime-500">Solutions</span>
              </>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="mx-auto h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-semibold">No categories available yet</p>
          </div>
        ) : !selectedCategory ? (
          /* --- MAIN CATEGORIES VIEW --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {categories.map((category, idx) => {
              const subCount = category.subcategories.length;
              const productCount = category._count?.products ?? 0;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-900 aspect-[16/10] shadow-md transition-all duration-300 hover:shadow-xl hover:border-lime-400 hover:ring-2 hover:ring-lime-200 text-left"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={`${category.name} thumbnail`}
                      className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-950">
                      <span className="text-5xl opacity-80">{FALLBACK_ICONS[idx % FALLBACK_ICONS.length]}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />

                  {productCount > 0 && (
                    <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black text-blue-950 uppercase tracking-wide">
                      {productCount} products
                    </span>
                  )}

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <h3 className="text-lg md:text-xl font-extrabold tracking-wide text-white drop-shadow-md text-center uppercase">
                      {category.name}
                    </h3>
                    <span className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-white/80 uppercase tracking-widest">
                      {subCount} subcategor{subCount === 1 ? "y" : "ies"}
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* --- SELECTED SUBCATEGORIES VIEW --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                Choose a subcategory within {selectedCategory.name}
              </p>
              {(selectedCategory.subcategories?.length ?? 0) > 0 && (
                <button
                  onClick={() => goToCategory(selectedCategory.id)}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-900 hover:text-lime-600 transition-colors"
                >
                  View all products <ArrowRight size={11} />
                </button>
              )}
            </div>

            {selectedCategory.subcategories.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-12">No subcategories added yet.</p>
            ) : (
              /* Subcategories render in the same grid styling as the parent categories */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.subcategories.map((sub) => (
                  <button key={sub.id} onClick={() => goToProducts(selectedCategory.id, sub.id)} className="group text-left rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-lime-400 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between aspect-[16/10]" >
                  {sub.image ? (
                    <img src={sub.image} alt={`${sub.name} thumbnail`} className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-950">
                      <span className="text-5xl opacity-80">{FALLBACK_ICONS[idx % FALLBACK_ICONS.length]}</span>
                    </div>
                  )}
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-base font-extrabold text-blue-950 uppercase tracking-wide group-hover:text-blue-900">
                        {sub.name}
                      </h4>
                      <span className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-black text-gray-500">
                        {sub._count?.products ?? 0}
                      </span>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-lime-600">
                      View products <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}