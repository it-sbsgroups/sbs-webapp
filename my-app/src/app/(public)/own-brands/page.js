"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import brandsApi from "@/lib/brands/Api";

/* ---------- Carousel Slides ---------- */
const SLIDES = [
  {
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    tag: "Engineered Excellence",
    title: "Our Proprietary Brands",
    desc: "Built in-house for the toughest industrial demands.",
  },
  {
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    tag: "Innovation First",
    title: "Quality That Speaks",
    desc: "Every product crafted with precision & pride.",
  },
  {
    bg: "linear-gradient(135deg, #3b0764 0%, #581c87 100%)",
    tag: "Trusted Globally",
    title: "Made for Heavy Industry",
    desc: "Reliable solutions since 2005.",
  },
];

function toBrandCard(b) {
  return {
    ...b,
    brandName: b.brandName || b.name || "",
    sector: b.sector || b.category || "",
    founder: b.founder || b.contactPerson || "",
    logo: b.logo || "",
  };
}

export default function OwnBrandsDirectoryPage() {
  const [query, setQuery] = useState("");
  const [activeSector, setActiveSector] = useState("All");
  const [brands, setBrands] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto‑rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Fetch OWN brands (true flag intact)
  useEffect(() => {
    (async () => {
      try {
        const data = await brandsApi.getPublic(true); // ← YEH TRUE FILTER HAI, HATAYA NAHI
        if (Array.isArray(data)) setBrands(data.map(toBrandCard));
      } catch (error) {
        console.error("Failed to fetch own brands:", error);
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
    e.currentTarget.src = "https://placehold.co/120x120/1e293b/94a3b8?text=Brand";
  };

  const getBrandTagline = (brandName) => {
    const name = brandName?.toLowerCase() || "";
    if (name.includes("ozone")) return "The Ultimate Kote – Premium Paint Solutions";
    if (name.includes("rita") && name.includes("engineering")) return "Innovative Industrial Solutions";
    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ══════════════════ HERO CAROUSEL ══════════════════ */}
      <div className="relative overflow-hidden h-[520px] md:h-[480px]">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ background: slide.bg }}
          />
        ))}

        <div className="relative z-20 h-full flex flex-col justify-center px-4 md:px-8 max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-white transition-colors">Brands</Link>
            <span>/</span>
            <span className="text-white">Own Brands</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black text-indigo-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                {SLIDES[activeSlide].tag}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-3">
                {SLIDES[activeSlide].title}
              </h1>
              <p className="text-sm text-indigo-200/80 mt-2 max-w-xl">{SLIDES[activeSlide].desc}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white shrink-0 shadow-lg">
              <p className="text-3xl font-black">{brands.length}</p>
              <p className="text-xs text-indigo-200">Own Brands</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-sm">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by brand name, founder or domain..."
                className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {sectors.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSector(sec)}
                  className={`whitespace-nowrap text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${
                    activeSector === sec
                      ? "bg-white text-indigo-900 border-white shadow-md"
                      : "bg-white/10 text-white/80 border-white/30 hover:bg-white/20"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === activeSlide ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ CARD GRID (CENTERED, BADA, SPACING) ══════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
            <span className="text-5xl mb-3 opacity-30">📦</span>
            <h3 className="text-base font-black text-slate-900">No House Brands Found</h3>
            <p className="text-xs text-slate-500 mt-1">Refine your active keyword or switch categories tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
            {filteredBrands.map((brand) => {
              const tagline = getBrandTagline(brand.brandName);
              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
                >
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-20 rotate-[-6deg]">
                    <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg ring-2 ring-white/50">
                      New Arrival
                    </span>
                  </div>

                  {/* Logo container – larger (h-48) */}
                  <div className="h-48 flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-50">
                    <img
                      src={brand.logo}
                      alt=""
                      className="w-full h-full object-contain drop-shadow-md"
                      onError={fallbackImg}
                    />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-indigo-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <div className="text-center p-4">
                      <h3 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-lg">
                        {brand.brandName}
                      </h3>
                      {brand.sector && (
                        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mt-1">
                          {brand.sector}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer with tagline */}
                  <div className="mt-auto px-3 py-3 bg-slate-50 border-t border-slate-100">
                    {tagline ? (
                      <p className="text-[10px] font-bold text-indigo-700 leading-tight">{tagline}</p>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-medium truncate">{brand.website || " "}</p>
                    )}
                  </div>
                </Link>
              );
            })}
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