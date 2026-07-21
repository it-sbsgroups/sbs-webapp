"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import publicNewsApi from "@/lib/news/publicNewsApi";
import LazyCacheImage from "@/components/shared/LazyCacheImage";

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function PublicNewsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ============================================
  // DATA STATES
  // ============================================
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [settings, setSettings] = useState({
    cardsPerRow: 3,
    cardsPerPage: 9,
    showSearch: true,
    showCategoryFilter: true,
    showSubcategoryFilter: true,
    latestNewsEnabled: true,
    latestNewsCount: 5,
  });
  const [latestNews, setLatestNews] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // first paint only
  const [fetching, setFetching] = useState(false); // subsequent filter/page fetches

  // ============================================
  // FILTER STATES — initialized from the URL so a filtered/tabbed view can
  // be linked and shared directly (?category=...&subcategory=...&search=...&page=...)
  // ============================================
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || ""); // raw input, updates instantly
  const [search, setSearch] = useState(searchParams.get("search") || ""); // debounced value actually sent to the API
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "ALL");
  const [subcategoryId, setSubcategoryId] = useState(searchParams.get("subcategory") || "ALL");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Keep the URL in sync whenever filters/page change, so the current view
  // is always a shareable link (e.g. /news?category=cat_123&page=2).
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== "ALL") params.set("category", categoryId);
    if (subcategoryId && subcategoryId !== "ALL") params.set("subcategory", subcategoryId);
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId, search, page]);

  // ============================================
  // DEBOUNCE SEARCH (avoid firing a request on every keystroke)
  // ============================================
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [search, categoryId, subcategoryId]);

  // ============================================
  // ONE-TIME DATA: categories + settings + latest news sidebar
  // ============================================
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [catData, settingsData] = await Promise.all([
          publicNewsApi.getCategories(),
          publicNewsApi.getSettings(),
        ]);
        setCategories(Array.isArray(catData) ? catData : []);
        if (settingsData) {
          setSettings((prev) => ({ ...prev, ...settingsData }));
          if (settingsData.latestNewsEnabled !== false) {
            const latest = await publicNewsApi.getLatestNews(null, settingsData.latestNewsCount || 5);
            setLatestNews(latest);
          }
        }
      } catch (error) {
        console.error("Failed to load news static data:", error);
      }
    };
    loadStaticData();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryId !== "ALL") {
      publicNewsApi.getSubcategories(categoryId).then((data) => {
        setSubcategories(Array.isArray(data) ? data : []);
      });
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const subOptions = useMemo(() => {
    if (categoryId === "ALL") return [];
    return subcategories.filter((s) => s.categoryId === categoryId);
  }, [subcategories, categoryId]);

  // ============================================
  // SERVER-SIDE POSTS FETCH — the actual perf fix: only the current page's
  // worth of lightweight cards (title/excerpt/coverImage) crosses the wire,
  // filtered and paginated by the backend instead of client-side over a
  // 100-post dump.
  // ============================================
  const requestId = useRef(0);
  useEffect(() => {
    const myId = ++requestId.current;
    const load = async () => {
      setFetching(true);
      try {
        const res = await publicNewsApi.getPublishedPosts({
          page,
          pageSize: settings.cardsPerPage || 9,
          categoryId: categoryId !== "ALL" ? categoryId : undefined,
          subcategoryId: subcategoryId !== "ALL" ? subcategoryId : undefined,
          search: search.length >= 2 ? search : undefined,
        });
        if (myId !== requestId.current) return; // a newer request superseded this one
        setPosts(res?.data || []);
        setTotal(res?.meta?.total ?? (res?.data || []).length);
      } catch (error) {
        console.error("Failed to load news posts:", error);
      } finally {
        if (myId === requestId.current) {
          setFetching(false);
          setInitialLoading(false);
        }
      }
    };
    load();
  }, [page, categoryId, subcategoryId, search, settings.cardsPerPage]);

  // ============================================
  // PAGINATION (server-driven)
  // ============================================
  const perPage = settings.cardsPerPage || 9;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageStart = (page - 1) * perPage;

  // ============================================
  // GRID CLASS
  // ============================================
  const colClass = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[settings.cardsPerRow] || "md:grid-cols-3";

  // ============================================
  // LOADING (first paint)
  // ============================================
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto flex-1 w-full space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-black text-blue-900 uppercase tracking-widest">
          Media &amp; Announcements
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Enterprise News Hub
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Search, filter by category, and open any announcement for its full layout.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {settings.showSearch && (
          <div className="flex-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Search</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Type 2+ characters to search news..."
                className="w-full text-xs font-semibold text-slate-800 border border-slate-300 rounded-xl pl-8 pr-8 py-2.5 bg-white focus:outline-none focus:border-blue-900" />
              {searchInput && (
                <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-xs">✕</button>
              )}
            </div>
          </div>
        )}

        {settings.showCategoryFilter && (
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Category</label>
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId("ALL"); }}
              className="text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-900 min-w-[150px]">
              <option value="ALL">All Categories</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
          </div>
        )}

        {settings.showSubcategoryFilter && categoryId !== "ALL" && subOptions.length > 0 && (
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Subcategory</label>
            <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}
              className="text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-900 min-w-[160px]">
              <option value="ALL">All Subcategories</option>
              {subOptions.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className={`grid gap-8 ${
        latestNews.length > 0 && settings.latestNewsEnabled !== false
          ? "lg:grid-cols-[1fr_280px]" : "grid-cols-1"
      }`}>
        {/* ARTICLES */}
        <div className={fetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <p className="text-[11px] font-bold text-slate-400 mb-4">{total} article{total !== 1 ? "s" : ""} found</p>
          {posts.length > 0 ? (
            <div className={`grid grid-cols-1 ${colClass} gap-6`}>
              {posts.map((post) => {
                const catName = post.category?.name || "";
                return (
                  <Link key={post.id} href={`/news/${post.slug}`}
                    className="bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md border-slate-200/80 flex flex-col hover:border-blue-950 group">
                    {post.coverImage && (
                      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                        <LazyCacheImage
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-black">
                            {catName || "News"}
                          </span>
                          <span>{fmtDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                        <h3 className="text-xs font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-3 font-medium leading-relaxed line-clamp-3">
                          {post.excerpt || "Read more..."}
                        </p>
                      </div>
                      <span className="text-[10px] text-blue-900 font-black uppercase tracking-wider mt-4 block">
                        Read Full News ➔
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <span className="text-3xl">📰</span>
              <h3 className="text-sm font-black text-slate-900 mt-3">No articles match your filters</h3>
              <p className="text-xs text-slate-400 mt-1">Try clearing the search or choosing a different category.</p>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] font-semibold text-slate-400">
                Showing <span className="font-black text-slate-700">{pageStart + 1}–{Math.min(pageStart + perPage, total)}</span> of <span className="font-black text-slate-700">{total}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="text-xs font-black px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">← Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`text-xs font-black w-9 h-9 rounded-lg border ${n === page ? "bg-blue-950 text-white border-blue-950" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="text-xs font-black px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* LATEST NEWS SIDEBAR */}
        {latestNews.length > 0 && settings.latestNewsEnabled !== false && (
          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Latest News</p>
              <div className="space-y-3">
                {latestNews.map((n) => (
                  <Link key={n.id} href={`/news/${n.slug}`}
                    className="flex gap-3 items-center p-2 rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center p-1 overflow-hidden">
                      {n.coverImage ? (
                        <LazyCacheImage src={n.coverImage} alt={n.title} className="w-full h-full object-cover" />
                      ) : (<span className="text-xl">📰</span>)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900">{n.title}</p>
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Read →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function PublicNewsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Loading news…</div>}>
      <PublicNewsPageContent />
    </Suspense>
  );
}
