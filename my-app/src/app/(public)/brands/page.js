"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BRANDS as FALLBACK_BRANDS } from "@/data/brands";
import brandsApi from "@/lib/brandsApi";

// Map a backend brand record -> the shape this page renders (degrades gracefully).
function toBrandCard(b) {
  return {
    ...b,
    brandName: b.brandName || b.name || "",
    sector: b.sector || b.category || "",
    founder: b.founder || b.contactPerson || "",
    logo: b.logo || "",
  };
}

/* ============================ DYNAMIC CONFIG ============================== */
const PAGE_CONFIG = {
  layout: { container: "max-w-6xl", gridCols: "md:grid-cols-2 xl:grid-cols-3" },
  card: { variant: "elevated", radius: "xl", padding: "md" },
  description: { maxChars: 120 },
  show: {
    search: true,
    sectorFilter: true,
    founders: true,
    stats: true,
  },
};

const UI = {
  cardVariants: {
    elevated: "bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1",
  },
  radii: { xl: "rounded-2xl" },
  paddings: { md: "p-5 md:p-6" },
};

const cardClass = () =>
  `${UI.cardVariants.elevated} ${UI.radii[PAGE_CONFIG.card.radius]} ${UI.paddings[PAGE_CONFIG.card.padding]}`;

/* ============================ HELPERS ===================================== */
const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Brand";
};

/* ============================ COMPONENT =================================== */
export default function BrandsDirectoryPage() {
  const [query, setQuery] = useState("");
  const [activeSector, setActiveSector] = useState("All");

  const [BRANDS, setBRANDS] = useState(FALLBACK_BRANDS);
  useEffect(() => {
    (async () => {
      try {
        const data = await brandsApi.getAll();
        if (Array.isArray(data) && data.length) setBRANDS(data.map(toBrandCard));
      } catch { /* keep fallback */ }
    })();
  }, []);

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(BRANDS.map((b) => b.sector).filter(Boolean)))],
    [BRANDS]
  );

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRANDS.filter((b) => {
      const matchesQuery =
        !q ||
        b.brandName?.toLowerCase().includes(q) ||
        b.founder?.toLowerCase().includes(q) ||
        b.sector?.toLowerCase().includes(q);
      const matchesSector = activeSector === "All" || b.sector === activeSector;
      return matchesQuery && matchesSector;
    });
  }, [query, activeSector, BRANDS]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-white border-b border-slate-200">
        <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-12`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">In-House Portfolios</span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
                Our Native Proprietary Brands
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                Discover our internally engineered brand labels designed to meet heavy industrial demands, 
                clean chemical processing, and smart field operations.
              </p>
            </div>
            {PAGE_CONFIG.show.stats && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex gap-6 shrink-0 shadow-md">
                <div>
                  <p className="text-2xl font-black tracking-tight">{BRANDS.length}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Active Brands</p>
                </div>
                <div className="w-px bg-slate-800" />
                <div>
                  <p className="text-2xl font-black tracking-tight">30+</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Regions Active</p>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {PAGE_CONFIG.show.search && (
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
            )}
            {PAGE_CONFIG.show.sectorFilter && (
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
            )}
          </div>
        </div>
      </div>

      {/* ==================== BRANDS GRID ==================== */}
      <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-10`}>
        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
            <span className="text-5xl mb-3 opacity-30">📦</span>
            <h3 className="text-base font-black text-slate-900">No House Brands Found</h3>
            <p className="text-xs text-slate-500 mt-1">Refine your active keyword or switch categories tab.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${PAGE_CONFIG.layout.gridCols} gap-6`}>
            {filteredBrands.map((brand) => {
              const shortDesc =
                brand.editorDescription?.length > PAGE_CONFIG.description.maxChars
                  ? brand.editorDescription.slice(0, PAGE_CONFIG.description.maxChars).trimEnd() + "…"
                  : brand.editorDescription;

              return (
                <div key={brand.id} className={`${cardClass()} flex flex-col justify-between transition-all duration-300 group`}>
                  <div className="space-y-4">
                    {/* Brand Meta Top Row */}
                    <div className="flex justify-between items-start gap-4">
                      <img
                        src={brand.logo}
                        alt={`${brand.brandName} logo`}
                        onError={fallbackImg}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm bg-white"
                      />
                      <div className="text-right">
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded tracking-wider">
                          Est. {brand.establishedIn}
                        </span>
                        <span className="block text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md mt-1.5 uppercase tracking-tight">
                          {brand.sector}
                        </span>
                      </div>
                    </div>

                    {/* Brand Identity */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                        {brand.brandName}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 italic mt-0.5">
                        "{brand.tagline}"
                      </p>
                    </div>

                    {/* Founders Metadata */}
                    {PAGE_CONFIG.show.founders && (brand.founder || brand.coFounder) && (
                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-[11px] text-slate-600 font-medium space-y-0.5">
                        {brand.founder && <p>👤 <span className="text-slate-400 font-semibold">Founder:</span> <span className="font-bold text-slate-800">{brand.founder}</span></p>}
                        {brand.coFounder && <p>👥 <span className="text-slate-400 font-semibold">Co-Founder:</span> <span className="font-bold text-slate-800">{brand.coFounder}</span></p>}
                      </div>
                    )}

                    {/* Editor Short Note */}
                    {shortDesc && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {shortDesc}
                      </p>
                    )}

                    {/* Current Footprint Mini Strip */}
                    {brand.currentOperations && (
                      <div className="text-[10px] font-semibold text-slate-400 truncate">
                        <span className="font-black text-slate-600 uppercase text-[9px] tracking-wider mr-1">📍 Footprint:</span> 
                        {brand.currentOperations}
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                    {brand.url ? (
                      <a
                        href={brand.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-wider"
                      >
                        🌐 Live Hub ↗
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic">No external URL</span>
                    )}

                    <Link
                      href={`/brands/${brand.slug}`}
                      className="text-[10px] font-black uppercase tracking-wider bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Explore Brand Details ➔
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}