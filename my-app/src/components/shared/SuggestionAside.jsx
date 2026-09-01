"use client";

import Link from "next/link";
import LazyCacheImage from "@/components/shared/LazyCacheImage";

/**
 * @param {string}   title     – heading text (e.g. "You Might Also Like")
 * @param {Array}    items     – array of suggestion objects
 * @param {string}   items[].slug  – URL-friendly identifier
 * @param {string}   items[].title – article / product name
 * @param {string}   [items[].coverImage] – optional image URL
 * @param {string}   [items[].cta] – link text (default: "Read →")
 * @param {Function} [items[].hrefBuilder] – custom href function: (slug) => url
 * @param {object}   [className] – extra classes on the wrapper
 */
export default function SuggestionAside({
  title = "Suggestions",
  items = [],
  className = "",
  hrefBuilder = (slug) => `/news/${slug}`, // default builds a news link
}) {
  if (!items.length) return null;

  return (
    <aside className={`space-y-4 ${className}`}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          {title}
        </p>
        <div className="space-y-3">
          {items.map((item, i) => (
            <Link
              key={item.slug ?? i}
              href={hrefBuilder(item.slug, item)}
              className="flex gap-3 items-center p-2 rounded-xl border hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-lg border flex items-center justify-center p-1 overflow-hidden">
                {item.coverImage ? (
                  <LazyCacheImage
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">📰</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-900 line-clamp-2 group-hover:text-blue-900">
                  {item.title}
                </p>
                <span className="text-[9px] font-bold text-blue-600 uppercase">
                  {item.cta || "Read →"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}