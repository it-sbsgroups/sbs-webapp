"use client";

import { useState, useEffect } from "react";
import testimonialsApi from "@/lib/testimonialsApi";
import Link from "next/link";

const AVATARS = ["🏭", "⚡", "🔧", "🚛", "🏗️", "⚙️", "🛠️", "📦"];

export default function TestimonialsGrid({ 
  limit = 6, 
  showViewAll = true,
  showSourceLink = true,
  className = "" 
}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testimonialsApi.getPublic()
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setTestimonials(items.slice(0, limit));
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
            <div className="h-24 bg-slate-100 rounded" />
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-full" />
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-2 bg-slate-200 rounded w-1/3 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => {
          const bound = t.client || t.brand;
          const logo = t.client?.logo || t.brand?.logo;
          const href = t.client ? `/clients/${t.client.slug}` : t.brand ? `/brands/${t.brand.slug}` : null;
          const badgeLabel = t.sourceType === "BRAND" ? "Partner Brand" : "Client";

          return (
            <article key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <p className="text-slate-700 leading-relaxed flex-1">“{t.testimony}”</p>
              <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-100">
                {href ? (
                  <Link href={href} className="shrink-0">
                    <span className="h-10 w-10 flex items-center justify-center text-lg bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                      {logo ? (
                        <img src={logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        AVATARS[i % AVATARS.length]
                      )}
                    </span>
                  </Link>
                ) : (
                  <span className="h-10 w-10 flex items-center justify-center text-lg bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                    {logo ? (
                      <img src={logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      AVATARS[i % AVATARS.length]
                    )}
                  </span>
                )}
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    {t.name}
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">VERIFIED</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.designation ? `${t.designation} · ` : ""}
                    {href ? (
                      <Link href={href} className="hover:underline">{t.companyName}</Link>
                    ) : (
                      t.companyName
                    )}
                    {showSourceLink && bound && (
                      <span className="ml-1 text-[9px] font-bold text-slate-400 uppercase">· {badgeLabel}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {showViewAll && testimonials.length >= limit && (
        <div className="text-center mt-8">
          <Link href="/testimonials" className="inline-block bg-blue-950 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-blue-900 transition-colors">View All Testimonials →</Link>
        </div>
      )}
    </div>
  );
}