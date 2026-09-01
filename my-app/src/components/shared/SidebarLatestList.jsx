"use client";

// =============================================================================
// FILE: src/components/shared/SidebarLatestList.jsx
// Reusable "Latest 10" sidebar widget. Drop it next to a News or Products
// listing page in place of an ad slot.
//
// USAGE:
//   <SidebarLatestList type="news" />
//   <SidebarLatestList type="products" limit={10} />
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import publicNewsApi from "@/lib/news/publicNewsApi";
import publicCatalogApi from "@/lib/publicCatalogApi";

export default function SidebarLatestList({ type = "news", limit = 10, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (type === "news") {
          const res = await publicNewsApi.getPublishedPosts({ pageSize: limit });
          if (alive) setItems((res?.items || res || []).slice(0, limit));
        } else {
          const res = await publicCatalogApi.getCatalog();
          const products = res?.products || [];
          if (alive) {
            setItems(
              [...products]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, limit)
            );
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type, limit]);

  const heading = title || (type === "news" ? "Latest News" : "Latest Products");
  const hrefFor = (item) => (type === "news" ? `/news/${item.slug}` : `/products/${item.sku}`);
  const imgOf = (item) => item.coverImage || item.thumbnail || item.image || item.images?.[0]?.url;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{heading}</h3>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={hrefFor(item)} className="flex gap-3 group items-start">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                  {imgOf(item) ? (
                    <img src={imgOf(item)} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-slate-300 text-lg">
                      {type === "news" ? "📰" : "📦"}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {item.title || item.name}
                  </span>
                  {item.publishedAt || item.createdAt ? (
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
