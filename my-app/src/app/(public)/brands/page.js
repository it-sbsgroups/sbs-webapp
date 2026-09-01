"use client";

import { useState, useEffect, useMemo } from "react";
import brandsApi from "@/lib/brands/Api";
import BrandCard from "@/components/shared/BrandCard";
import DistributorTrustSections from "@/components/public/DistributorTrustSections";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import BrandTestimonialsSlider from "@/components/public/BrandTestimonialsSlider";
import LazySection from "@/components/shared/LazySection";

function toBrandCard(b) {
  return {
    ...b,
    brandName: b.brandName || b.name || "",
    sector: b.sector || b.category || "",
    founder: b.founder || b.contactPerson || "",
    logo: b.logo || "",
  };
}

export default function BrandsDirectoryPage() {
  const [query, setQuery] = useState("");
  const [activeSector, setActiveSector] = useState("All");
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await brandsApi.getPublic(false);
        if (Array.isArray(data)) setBrands(data.map(toBrandCard));
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    })();
  }, []);

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(brands.map((b) => b.sector).filter(Boolean)))],
    [brands]
  );

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands.filter((b) => {
      const matchesQuery =
        !q ||
        b.brandName?.toLowerCase().includes(q) ||
        b.founder?.toLowerCase().includes(q) ||
        b.sector?.toLowerCase().includes(q);
      const matchesSector = activeSector === "All" || b.sector === activeSector;
      return matchesQuery && matchesSector;
    });
  }, [query, activeSector, brands]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      <LazySection id="brands-breadcrumb" minHeight={100}>
        <PageBreadcrumb pageKey="brands" title="Brands" items={[{ label: "Brands" }]} />
      </LazySection>

      {/* Title Section (non‑sticky) */}
      <LazySection id="title-brands" minHeight={100}>
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                  Authorized Distributor
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
                  Brands We Distribute
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                  Explore the leading industrial manufacturers we represent as an authorized partner across our supply network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* Sticky Search & Filter Bar */}
      <LazySection id="sticky-search" minHeight={100}>
        <div className="sticky top-22 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by brand name, founder or domain..."
                  className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {sectors.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setActiveSector(sec)}
                    className={`whitespace-nowrap text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${
                      activeSector === sec
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* Card Grid */}
      <LazySection id="card-grid" minHeight={100}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          {filteredBrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
              <span className="text-5xl mb-3 opacity-30">📦</span>
              <h3 className="text-base font-black text-slate-900">No Partner Brands Found</h3>
              <p className="text-xs text-slate-500 mt-1">Refine your active keyword or switch categories tab.</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              style={{ perspective: "1200px" }}
            >
              {filteredBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </LazySection>

      <LazySection id="brands-testimonials" minHeight={600}>
        <BrandTestimonialsSlider />
      </LazySection>

      <LazySection id="distributorships" minHeight={600}>
        <DistributorTrustSections />
      </LazySection>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}