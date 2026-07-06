"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getActiveClients } from "@/lib/clients/api";

/* ============================ DYNAMIC CONFIG ============================== */
const PAGE_CONFIG = {
  layout: {
    container: "max-w-6xl",
    gridCols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5",
  },
  show: {
    search: true,
    industryFilter: true,
  },
};

/* ============================ HELPERS ===================================== */
const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Logo";
};

const isImageUrl = (s) => typeof s === "string" && /^https?:\/\//.test(s);

/* ============================ PAGE ======================================== */
export default function PublicClientsDirectoryPage() {
  const [CLIENTS, setCLIENTS] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");

  // -------- Fetch real data only, no fallback --------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getActiveClients();
        if (!cancelled) {
          if (Array.isArray(data)) {
            setCLIENTS(data);
          } else {
            setCLIENTS([]);
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch clients:", err);
          setError("Could not load clients. Please try again later.");
          setCLIENTS([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(CLIENTS.map((c) => c.industry).filter(Boolean)))],
    [CLIENTS]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      const matchesQuery =
        !q ||
        c.companyName?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q);
      const matchesIndustry = industry === "All" || c.industry === industry;
      return matchesQuery && matchesIndustry;
    });
  }, [query, industry, CLIENTS]);

  const SHOW = PAGE_CONFIG.show;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ==================== HERO HEADER ==================== */}
      <div className="bg-white border-b border-slate-200">
        <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-8 md:py-10`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-blue-950 uppercase tracking-widest">
                Enterprise Trust
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Our Valued Corporate Alliances
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                The industrial enterprises across power, mining, cement and infrastructure that rely
                on SBS Groups for certified supply, documented quality and on-time site delivery.
              </p>
            </div>
          </div>

          {/* search + industry filter – show only if data has loaded */}
          {!loading && !error && (SHOW.search || SHOW.industryFilter) && (
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              {SHOW.search && (
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by company, contact person or sector..."
                    className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 focus:bg-white transition-colors"
                  />
                </div>
              )}
              {SHOW.industryFilter && (
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      className={`whitespace-nowrap text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl border transition-colors ${
                        industry === ind
                          ? "bg-blue-950 text-white border-blue-950"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== CLIENT LOGO GRID ==================== */}
      <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-8 md:py-10`}>
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-300 border-t-blue-950 mb-4"></div>
            <p className="text-sm text-slate-500 font-medium">Loading clients…</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4 opacity-30">⚠️</span>
            <h3 className="text-lg font-black text-slate-900">Something went wrong</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 text-[10px] font-black uppercase tracking-wider text-blue-950 border border-blue-950 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state (no clients after filtering) */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4 opacity-30">🔍</span>
            <h3 className="text-lg font-black text-slate-900">No clients match your search</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Try a different keyword or clear the sector filter.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setIndustry("All");
              }}
              className="mt-5 text-[10px] font-black uppercase tracking-wider text-blue-950 border border-blue-950 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              ✕ Clear Filters
            </button>
          </div>
        )}

        {/* Client logo grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className={`grid ${PAGE_CONFIG.layout.gridCols} gap-4 md:gap-5`}>
            {filtered.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.slug}`}
                className="group relative block aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                {isImageUrl(client.logo) ? (
                  <img
                    src={client.logo}
                    alt={client.companyName}
                    className="w-full h-full object-cover"
                    onError={fallbackImg}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-5xl sm:text-6xl">
                    {client.logo || "🏢"}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                  <h3 className="text-white text-xs sm:text-sm font-bold leading-tight">
                    {client.companyName}
                  </h3>
                </div>
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
          background: #e2e8f0;
          border-radius: 9px;
        }
      `}</style>
    </div>
  );
}