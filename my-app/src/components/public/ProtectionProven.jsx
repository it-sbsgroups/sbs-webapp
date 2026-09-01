// src/components/public/ProtectionProven.jsx
"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const FALLBACK_DATA = {
  titlePart1: "Trusted Protection,",
  titlePart2: "Proven Result",
  description:
    "<p>Our official distributor status ensures you receive authentic products with full manufacturer support.</p>",
  features: [
    { id: "f1", icon: "Users", title: "50+", subtitle: "Happy Clients", description: "Trusted by leading companies worldwide" },
    { id: "f2", icon: "TrendingUp", title: "95%", subtitle: "Client Retention", description: "Long-term partnerships built on trust" },
    { id: "f3", icon: "Ribbon", title: "20+", subtitle: "Years Experience", description: "Proven track record of excellence" },
    { id: "f4", icon: "CircleCheckBig", title: "99%", subtitle: "Satisfaction Rate", description: "Consistently exceeding expectations" },
  ],
};

export default function ProtectionProven() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    siteConfigApi
      .getProtectionProven()
      .then((d) => {
        if (!alive) return;
        setData(d && Object.keys(d).length > 0 ? { ...FALLBACK_DATA, ...d } : FALLBACK_DATA);
      })
      .catch(() => alive && setData(FALLBACK_DATA))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const content = data || FALLBACK_DATA;
  const features = content.features || [];

  return (
    <section className="w-full bg-blue-950 py-16 md:py-20 px-4 md:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            {content.titlePart1} <span className="text-lime-400">{content.titlePart2}</span>
          </h2>
          {content.description && (
            <div
              className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.description) }}
            />
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {loading &&
            [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse space-y-3">
                <div className="h-8 w-8 rounded-lg bg-white/10" />
                <div className="h-6 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-full" />
              </div>
            ))}

          {!loading &&
            features.map((feature) => {
              const DynamicIcon = Icons[feature.icon] || Icons.ShieldCheck;
              return (
                <div
                  key={feature.id}
                  className="text-center rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-blue-950">
                    <DynamicIcon size={20} />
                  </div>
                  <div className="text-2xl md:text-3xl font-black">{feature.title}</div>
                  {feature.subtitle && (
                    <div className="text-xs font-black uppercase tracking-wide text-lime-300 mt-1">
                      {feature.subtitle}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
