"use client";

import { useState, useEffect, useMemo } from "react";
import brandsApi from "@/lib/brands/Api";
import { toStaticUrl } from "@/lib/client";

function formatSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 0.1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Brand";
};

export default function BrochuresPage() {
  const [query, setQuery] = useState("");
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await brandsApi.getAllBrochures();
        setBrochures(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch brochures:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brochures;
    return brochures.filter((b) => String(b?.name || "").toLowerCase().includes(q));
  }, [query, brochures]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Resource Center</span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">Brand Brochures</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 leading-relaxed">Download product catalogs and brochures from our own brands and distribution partners.</p>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-5 shrink-0 shadow-md">
              <p className="text-2xl font-black">{brochures.length}</p>
              <p className="text-xs text-slate-300">Brochures Available</p>
            </div>
          </div>

          <div className="relative mt-8">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brochures by brand name..." className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
            <span className="text-5xl mb-3 opacity-30">📄</span>
            <h3 className="text-base font-black text-slate-900">No Brochures Found</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon — brochures are added as brands upload them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <div key={b.id} className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-slate-50 to-white flex items-center justify-center border border-slate-100">
                  <img src={b.logo} alt="" className="h-10 w-10 object-contain" onError={fallbackImg} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm text-slate-900 truncate">{b.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {b.isOwnBrand ? "Own Brand" : "Partner Brand"}
                    {b.brochureSize ? ` · ${formatSize(b.brochureSize)}` : ""}
                  </p>
                </div>
                <a
                  href={toStaticUrl(b.brochureUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
