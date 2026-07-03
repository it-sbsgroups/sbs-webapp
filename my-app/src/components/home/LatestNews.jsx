"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import publicNewsApi from "@/lib/news/publicNewsApi";

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function LatestNews() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    carouselVisibleCards: 4,
    carouselTotalToPull: 10,
    carouselAutoPlay: true,
    carouselPauseOnHover: true,
    carouselIntervalMs: 3000,
  });
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, catData, settingsData] = await Promise.all([
          publicNewsApi.getPublishedPosts({ pageSize: 20 }),
          publicNewsApi.getCategories(),
          publicNewsApi.getSettings(),
        ]);
        setPosts(postsRes?.data || []);
        setCategories(Array.isArray(catData) ? catData : []);
        if (settingsData) {
          setSettings((prev) => ({ ...prev, ...settingsData }));
        }
      } catch (error) {
        console.error("Failed to load latest news:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ============================================
  // CAROUSEL LOGIC
  // ============================================
  const cfg = settings;
  const visible = cfg.carouselVisibleCards || 4;
  const items = useMemo(() => {
    return posts.slice(0, cfg.carouselTotalToPull || 10);
  }, [posts, cfg.carouselTotalToPull]);

  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const maxStart = Math.max(0, items.length - visible);

  useEffect(() => {
    if (!cfg.carouselAutoPlay || items.length <= visible) return;
    if (paused && cfg.carouselPauseOnHover) return;
    timer.current = setInterval(() => {
      setStart((s) => (s >= maxStart ? 0 : s + 1));
    }, cfg.carouselIntervalMs || 3000);
    return () => clearInterval(timer.current);
  }, [paused, maxStart, items.length, visible, cfg.carouselAutoPlay, cfg.carouselPauseOnHover, cfg.carouselIntervalMs]);

  const goPrev = () => setStart((s) => (s <= 0 ? maxStart : s - 1));
  const goNext = () => setStart((s) => (s >= maxStart ? 0 : s + 1));

  const visibleItems = items.slice(start, start + visible);
  while (visibleItems.length < visible && items.length >= visible) {
    visibleItems.push(items[visibleItems.length % items.length]);
  }

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "";
  const getCoverImage = (post) => post?.blocks?.find((b) => b.type === "imageRow")?.images?.[0]?.src || "https://placehold.co/600x400/f1f5f9/94a3b8?text=News";

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-24 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title row */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Updates &amp; Highlights</span>
            <h2 className="text-2xl font-black tracking-tight text-blue-900 sm:text-3xl uppercase">Latest News &amp; Key Deployments</h2>
          </div>
          <Link href="/news" className="group inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 hover:text-red-600 transition-colors">
            <span>View All Updates</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {items.length > visible && (
            <>
              <button onClick={goPrev} aria-label="Previous"
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white border shadow-md flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-colors">‹</button>
              <button onClick={goNext} aria-label="Next"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white border shadow-md flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-colors">›</button>
            </>
          )}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((item, i) => {
              const catName = getCategoryName(item.categoryId);
              const coverImage = getCoverImage(item);
              return (
                <article key={`${item.id}-${i}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img src={coverImage} alt={item.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded bg-blue-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                      {catName || "News"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-400">{fmtDate(item.publishedAt || item.createdAt)}</span>
                      <h3 className="text-base font-black text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2 uppercase tracking-tight">{item.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {item.blocks?.[0]?.content?.substring(0, 150) || "Read more..."}
                      </p>
                    </div>
                    <Link href={`/news/${item.slug}`} className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider uppercase text-red-600 group-hover:text-blue-900 transition-colors">View Details</span>
                      <svg className="h-4 w-4 text-red-600 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Dots */}
          {items.length > visible && (
            <div className="flex justify-center gap-1.5 mt-6">
              {Array.from({ length: maxStart + 1 }, (_, i) => (
                <button key={i} onClick={() => setStart(i)} aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === start ? "w-6 bg-blue-900" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}