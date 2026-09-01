"use client";

import { useState, useEffect, useMemo } from "react";
import brandsApi from "@/lib/brands/Api";
import { toStaticUrl } from "@/lib/client";

// ──────────────────────────────────────────────
//  SETTINGS – change these values to manage the page
// ──────────────────────────────────────────────
const brochureSettings = {
  gridColumns: { base: 1, sm: 2, lg: 4 },   // 4 cards per row on large screens
  card: {
    height: "h-72",                        // fixed card height (adjust as needed)
    overlayColor: "bg-slate-900/70",      // hover overlay background
    fallbackLogo: "https://placehold.co/120x120/f1f5f9/94a3b8?text=Logo",
  },
  emptyState: {
    title: "No Brochures Found",
    description: "Check back soon — brochures are added as brands upload them.",
  },
};

function formatSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 0.1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

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
    return brochures.filter((b) =>
      String(b?.name || "").toLowerCase().includes(q)
    );
  }, [query, brochures]);

  const gridClass = `grid grid-cols-${brochureSettings.gridColumns.base} sm:grid-cols-${brochureSettings.gridColumns.sm} lg:grid-cols-${brochureSettings.gridColumns.lg} gap-4`;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                Resource Center
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
                Brand Brochures
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                Download product catalogs and brochures from our own brands and
                distribution partners.
              </p>
            </div>
            {/* <div className="bg-slate-900 text-white rounded-2xl p-5 shrink-0 shadow-md">
              <p className="text-2xl font-black">{brochures.length}</p>
              <p className="text-xs text-slate-300">Brochures Available</p>
            </div> */}
          </div>

          <div className="relative mt-8">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brochures by brand name..."
              className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
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
            <h3 className="text-base font-black text-slate-900">
              {brochureSettings.emptyState.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {brochureSettings.emptyState.description}
            </p>
          </div>
        ) : (
          <div className={gridClass}>
            {filtered.map((b) => {
              const logo = b.logo || brochureSettings.card.fallbackLogo;

              return (
                <div
                  key={b.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 ${brochureSettings.card.height}`}
                >
                  {/* Visible content: logo + name + size */}
                  <div className="flex flex-col items-center h-full p-5">
                    {/* Logo container – fully visible */}
                    <div className="flex-1 flex items-center justify-center w-full mb-3">
                      <img
                        src={logo}
                        alt={b.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = brochureSettings.card.fallbackLogo;
                        }}
                      />
                    </div>

                    {/* Brand name (truncated if long) */}
                    <h3 className="font-black text-sm text-slate-900 text-center leading-tight truncate max-w-full px-1 z-50">
                      {b.name}
                    </h3>

                    {/* {b.brochureSize && (
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {formatSize(b.brochureSize)}
                      </p>
                    )} */}
                  </div>

                  {/* Hover overlay with actions */}
                  <div
                    className={`absolute inset-0 ${brochureSettings.card.overlayColor} flex flex-col items-center justify-center gap-3 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <div className="flex gap-2">
                      <a
                        href={toStaticUrl(b.brochureUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview/download
                      </a>

                      {/* <a
                        href={toStaticUrl(b.brochureUrl)}
                        download
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}