"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import brandsApi from "@/lib/brands/Api";

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
        const data = await brandsApi.getPublic(false); // isOwnBrand: false — distributor/partner brands only
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

  const fallbackImg = (e) => {
    e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Brand";
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Distribution Partners</span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">Brands We Distribute</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 leading-relaxed">Explore the manufacturers and distribution partners we represent across our industrial supply network.</p>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-5 shrink-0 shadow-md">
              <p className="text-2xl font-black">{brands.length}</p>
              <p className="text-xs text-slate-300">Partner Brands</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by brand name, founder or domain..." className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {sectors.map((sec) => (
                <button key={sec} onClick={() => setActiveSector(sec)} className={`whitespace-nowrap text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${activeSector === sec ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`} >{sec}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
            <span className="text-5xl mb-3 opacity-30">📦</span>
            <h3 className="text-base font-black text-slate-900">No Partner Brands Found</h3>
            <p className="text-xs text-slate-500 mt-1">Refine your active keyword or switch categories tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredBrands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="group block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Logo only – full top half */}
                <div className="h-36 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-white">
                  <img src={brand.logo} alt="" className="w-full h-full object-contain" onError={fallbackImg} />
                </div>
                {/* Brand name – hidden until hover, appears over the logo */}
                <div className="absolute inset-0 bg-indigo-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="text-center">
                    <h3 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-lg">{brand.brandName}</h3>
                    {brand.sector && (
                      <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mt-1">{brand.sector}</p>
                    )}
                  </div>
                </div>
                {/* Small footer for founder / website (optional) */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-500 font-medium truncate">{brand.website || " "}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

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