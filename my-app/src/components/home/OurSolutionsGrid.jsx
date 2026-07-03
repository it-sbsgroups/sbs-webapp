"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Pull real categories/subcategories from the single source of truth
import { categories } from "@/data/products";

export default function OurSolutionsGrid() {
  const router = useRouter();
  const [openCategoryId, setOpenCategoryId] = useState("");

  const toggleCategory = (categoryId) =>
    setOpenCategoryId((prev) => (prev === categoryId ? "" : categoryId));

  const goToProducts = (categoryId, subcategoryId) => {
    router.push(`/products?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section title */}
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
            Our <span className="text-lime-500">Solutions</span>
          </h2>
          <p className="mt-2 text-xs font-semibold text-gray-400">
            Pick a category, then choose a subcategory to view its products.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const isOpen = openCategoryId === category.id;
            return (
              <div
                key={category.id}
                className={
                  isOpen
                    ? "sm:col-span-2 lg:col-span-3 transition-all"
                    : "transition-all"
                }
              >
                {/* Category card */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`group relative block w-full overflow-hidden rounded-2xl border bg-gray-900 aspect-[16/10] shadow-md transition-all duration-300 hover:shadow-xl ${
                    isOpen
                      ? "border-lime-400 ring-2 ring-lime-200"
                      : "border-gray-100"
                  }`}
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
                      <span className="text-5xl opacity-80">
                        {category.icon || "📦"}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <h3 className="text-lg md:text-xl font-extrabold tracking-wide text-white drop-shadow-md text-center uppercase">
                      {category.name}
                    </h3>
                    <span className="mt-2 text-[11px] font-bold text-white/80 uppercase tracking-widest">
                      {category.subcategoriesCount} subcategories{" "}
                      <span className="ml-1 inline-block transition-transform duration-300">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </span>
                  </div>
                </button>

                {/* Subcategory cards (revealed on click) */}
                {isOpen && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 md:p-6">
                    <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {category.name} — choose a subcategory
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => goToProducts(category.id, sub.id)}
                          className="group text-left rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-lime-400 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-extrabold text-blue-950 group-hover:text-blue-900">
                              {sub.name}
                            </h4>
                            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-500">
                              {sub.productCount}
                            </span>
                          </div>
                          <span className="mt-3 inline-block text-[10px] font-black uppercase tracking-wider text-lime-600">
                            View products →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}