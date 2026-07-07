"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import testimonialsApi from "@/lib/testimonialsApi";

const AVATARS = ["🏭", "⚡", "🔧", "🚛", "🏗️", "⚙️", "🛠️", "📦"];

export default function PublicTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await testimonialsApi.getPublic();
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-12 font-sans text-slate-800 antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">What Our Partners Say</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Verified feedback from the enterprises and industrial partners we serve across the region.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-semibold">No testimonials yet</p>
            <p className="text-sm mt-1">Approved partner testimonials will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((t, i) => {
              const bound = t.client || t.brand;
              const logo = t.client?.logo || t.brand?.logo;
              const href = t.client ? `/clients/${t.client.slug}` : t.brand ? `/brands/${t.brand.slug}` : null;
              const badgeLabel = t.sourceType === "BRAND" ? "Partner Brand" : "Client";

              const AvatarBlock = (
                <span className="h-11 w-11 flex items-center justify-center text-xl bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    AVATARS[i % AVATARS.length]
                  )}
                </span>
              );

              return (
                <article key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                  <p className="text-slate-700 leading-relaxed">“{t.testimony}”</p>
                  <div className="mt-auto flex items-center gap-3 pt-2 border-t border-slate-100">
                    {href ? (
                      <Link href={href} className="shrink-0">{AvatarBlock}</Link>
                    ) : (
                      AvatarBlock
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
                        {bound && <span className="ml-1 text-[9px] font-bold text-slate-400 uppercase">· {badgeLabel}</span>}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
