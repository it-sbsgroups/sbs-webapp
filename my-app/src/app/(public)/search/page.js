"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchGlobalSearch, TYPE_META } from "@/lib/globalSearchApi";
import categoriesApi from "@/lib/categoriesApi";
import brandsApi from "@/lib/brands/Api";

const TABS = [
  { key: "all", label: "All" },
  { key: "products", label: "Products" },
  { key: "news", label: "News" },
  { key: "brands", label: "Brands" },
];

const PAGE_SIZE = 12;

function ResultCard({ item }) {
  const meta = TYPE_META[item.type] || {};
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-2xl">{meta.icon || "🔎"}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 ${meta.color || "bg-gray-100 text-gray-600"}`}>
          {meta.label || item.type}
        </span>
        <p className="text-sm font-black text-gray-900 truncate group-hover:text-blue-900">{item.title}</p>
        {item.subtitle && <p className="text-xs font-semibold text-gray-400 truncate">{item.subtitle}</p>}
      </div>
      <svg className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-blue-900 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(urlQuery);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Filters — products only.
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  // Keep the input in sync if the URL changes elsewhere (e.g. header search).
  useEffect(() => setInputValue(urlQuery), [urlQuery]);

  // Reset pagination whenever the query, tab, or filters change.
  useEffect(() => setPage(1), [urlQuery, tab, categoryId, brandId]);

  // Load filter option lists once.
  useEffect(() => {
    categoriesApi.getAll().then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => setCategories([]));
    brandsApi.getPublic().then((b) => setBrands(Array.isArray(b) ? b : [])).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (!urlQuery.trim()) {
      setResponse(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    fetchGlobalSearch(urlQuery, {
      type: tab,
      categoryId: tab === "products" ? categoryId : undefined,
      brandId: tab === "products" ? brandId : undefined,
      page,
      pageSize: PAGE_SIZE,
      signal: controller.signal,
    })
      .then((res) => !cancelled && setResponse(res))
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") setResponse(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [urlQuery, tab, page, categoryId, brandId]);

  const submitSearch = useCallback(
    (e) => {
      e?.preventDefault?.();
      const q = inputValue.trim();
      if (!q) return;
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [inputValue, router]
  );

  const counts = response?.counts || { products: 0, news: 0, brands: 0, total: 0 };

  // What to render: for "all" tab, three short sections; for a specific tab,
  // one full paginated grid using that bucket directly.
  const activeBucket = tab !== "all" ? response?.results?.[tab] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* ===== SEARCH BAR ===== */}
      <form onSubmit={submitSearch} className="relative max-w-2xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products, news, brands..."
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-5 pr-14 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-900 focus:bg-white transition-all shadow-inner"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-blue-900 p-2.5 text-white hover:bg-blue-800 transition-colors" aria-label="Search">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {!urlQuery.trim() ? (
        <p className="mt-10 text-sm font-semibold text-gray-400">Type something above to search across products, news and brands.</p>
      ) : (
        <>
          <h1 className="mt-8 text-lg font-black text-gray-900">
            {loading && !response ? "Searching…" : `${counts.total} result${counts.total === 1 ? "" : "s"} for "${urlQuery}"`}
          </h1>

          {/* ===== TABS ===== */}
          <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-100 pb-3">
            {TABS.map((t) => {
              const count = t.key === "all" ? counts.total : counts[t.key];
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                    tab === t.key ? "bg-blue-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {t.label} {response ? `(${count ?? 0})` : ""}
                </button>
              );
            })}
          </div>

          {/* ===== FILTERS (products tab only) ===== */}
          {tab === "products" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-900"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-900"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {(categoryId || brandId) && (
                <button
                  onClick={() => { setCategoryId(""); setBrandId(""); }}
                  className="text-xs font-black uppercase tracking-wider text-blue-900 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* ===== RESULTS ===== */}
          <div className="mt-6 space-y-10">
            {tab === "all" ? (
              <>
                {TABS.slice(1).map((t) => {
                  const bucket = response?.results?.[t.key];
                  if (!bucket || bucket.data.length === 0) return null;
                  return (
                    <section key={t.key}>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">{t.label}</h2>
                        {counts[t.key] > bucket.data.length && (
                          <button onClick={() => setTab(t.key)} className="text-xs font-black uppercase tracking-wider text-blue-900 hover:underline">
                            View all {counts[t.key]} →
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {bucket.data.map((item) => (
                          <ResultCard key={`${item.type}-${item.id}`} item={item} />
                        ))}
                      </div>
                    </section>
                  );
                })}
                {response && counts.total === 0 && !loading && (
                  <p className="text-sm font-semibold text-gray-400">No results found. Try a different search term.</p>
                )}
              </>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(activeBucket?.data || []).map((item) => (
                    <ResultCard key={`${item.type}-${item.id}`} item={item} />
                  ))}
                </div>
                {activeBucket && activeBucket.data.length === 0 && !loading && (
                  <p className="text-sm font-semibold text-gray-400">No {tab} matched your search.</p>
                )}

                {/* ===== PAGINATION ===== */}
                {activeBucket && activeBucket.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs font-bold text-gray-500">
                      Page {activeBucket.page} of {activeBucket.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(activeBucket.totalPages, p + 1))}
                      disabled={page >= activeBucket.totalPages}
                      className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-sm font-semibold text-gray-400">Loading…</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
