"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import publicNewsApi from "@/lib/news/publicNewsApi";

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const coverImageOf = (post) => post?.blocks?.[0]?.images?.[0]?.src || "";

export default function PublicNewsPage() {
  // ============================================
  // DATA STATES
  // ============================================
  const [posts, setPosts] = useState([]);
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
  const [loading, setLoading] = useState(true);

  // ============================================
  // FILTER STATES
  // ============================================
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [subcategoryId, setSubcategoryId] = useState("ALL");
  const [page, setPage] = useState(1);

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, catData, settingsData] = await Promise.all([
          publicNewsApi.getPublishedPosts({ pageSize: 100 }),
          publicNewsApi.getCategories(),
          publicNewsApi.getSettings(),
        ]);

        setPosts(postsRes?.data || []);
        setCategories(Array.isArray(catData) ? catData : []);

        if (settingsData) {
          setSettings((prev) => ({ ...prev, ...settingsData }));
          if (settingsData.latestNewsEnabled !== false) {
            const latest = await publicNewsApi.getLatestNews(null, settingsData.latestNewsCount || 5);
            setLatestNews(latest);
          }
        }
      } catch (error) {
        console.error("Failed to load news data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ============================================
  // FILTERED SUBCATEGORIES
  // ============================================
  const subOptions = useMemo(() => {
    if (categoryId === "ALL") return [];
    return subcategories.filter((s) => s.categoryId === categoryId);
  }, [subcategories, categoryId]);

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryId !== "ALL") {
      publicNewsApi.getSubcategories(categoryId).then((data) => {
        setSubcategories(Array.isArray(data) ? data : []);
      });
    }
  }, [categoryId]);

  // ============================================
  // FILTER ENGINE
  // ============================================
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return posts.filter((post) => {
      if (categoryId !== "ALL" && post.categoryId !== categoryId) return false;
      if (subcategoryId !== "ALL" && post.subcategoryId !== subcategoryId) return false;
      if (q.length >= 2) {
        return (
          (post.title || "").toLowerCase().includes(q) ||
          (post.slug || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, search, categoryId, subcategoryId]);

  // ============================================
  // PAGINATION
  // ============================================
  const perPage = settings.cardsPerPage || 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageStart = (page - 1) * perPage;
  const pageItems = filtered.slice(pageStart, pageStart + perPage);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, subcategoryId]);

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
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "";
  const getFirstImage = (post) => {
    return post?.blocks?.find((b) => b.type === "imageRow")?.images?.[0]?.src || null;
  };

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
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Type 2+ characters to search news..."
                className="w-full text-xs font-semibold text-slate-800 border border-slate-300 rounded-xl pl-8 pr-8 py-2.5 bg-white focus:outline-none focus:border-blue-900" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-xs">✕</button>
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
        <div>
          <p className="text-[11px] font-bold text-slate-400 mb-4">{filtered.length} article{filtered.length !== 1 ? "s" : ""} found</p>
          {pageItems.length > 0 ? (
            <div className={`grid grid-cols-1 ${colClass} gap-6`}>
              {pageItems.map((post) => {
                const coverImage = getFirstImage(post);
                const catName = getCategoryName(post.categoryId);
                return (
                  <Link key={post.id} href={`/news/${post.slug}`}
                    className="bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md border-slate-200/80 flex flex-col hover:border-blue-950 group">
                    {coverImage && (
                      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img loading="lazy" src={coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                          {post.blocks?.[0]?.content?.substring(0, 150) || "Read more..."}
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
                Showing <span className="font-black text-slate-700">{pageStart + 1}–{Math.min(pageStart + perPage, filtered.length)}</span> of <span className="font-black text-slate-700">{filtered.length}</span>
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

        {/* LATEST NEWS SIDEBAR (replaces the old sponsored-products ad slot) */}
        {latestNews.length > 0 && settings.latestNewsEnabled !== false && (
          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Latest News</p>
              <div className="space-y-3">
                {latestNews.map((n) => (
                  <Link key={n.id} href={`/news/${n.slug}`}
                    className="flex gap-3 items-center p-2 rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center p-1 overflow-hidden">
                      {coverImageOf(n) ? (
                        <img loading="lazy" src={coverImageOf(n)} alt={n.title} className="w-full h-full object-cover" />
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