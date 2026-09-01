// src/components/public/CoreValues.jsx
"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

// ----- Default configuration (exportable for global adjustments) -----
export const defaultCoreValuesConfig = {
  t1: "Our",
  t2: "Core Values",
  subtitle: "What Drives Us",
  alignment: "center",
  columns: 5,                   // 🔥 Now defaults to 5 cards per row
  gap: "gap-5 md:gap-6",
  cardClassName:
    "bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-blue-200 hover:shadow-lg transition-all",
  iconWrapperClassName:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900 group-hover:bg-blue-950 group-hover:text-white transition-colors",
  titleClassName: "text-sm font-black text-slate-900",
  descriptionClassName:
    "text-xs text-slate-500 leading-relaxed whitespace-pre-line",
  showIcon: true,
  iconSize: 18,
  iconMap: Icons,
};

// ----- Component with props merging into default config -----
export default function CoreValues({ config = {} }) {
  // Merge user‑provided config with default
  const finalConfig = { ...defaultCoreValuesConfig, ...config };
  const {
    t1,
    t2,
    subtitle,
    columns,
    gap,
    cardClassName,
    iconWrapperClassName,
    titleClassName,
    descriptionClassName,
    showIcon,
    iconSize,
    iconMap,
  } = finalConfig;

  const [coreValues, setCoreValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    siteConfigApi
      .getAbout()
      .then((d) => {
        if (!alive) return;
        setCoreValues(Array.isArray(d?.coreValues) ? d.coreValues : []);
      })
      .catch(() => alive && setCoreValues([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && coreValues.length === 0) return null;

  return (
    <section className="w-full bg-white py-16 md:py-20 px-4 md:px-8 border-b border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
            {subtitle}
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-black text-blue-950 tracking-tight">
            {t1} <span className="text-lime-600"> {t2}</span>
          </h2>
        </div>

        {/* 
          🔥 Responsive grid: 
          1 col (mobile) → 2 cols (sm) → 3 cols (md) → 5 cols (lg) 
        */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns} ${gap} justify-items-center`}
        >
          {loading &&
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse w-full text-center`}
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100 mx-auto" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
            ))}

          {!loading &&
            coreValues.map((cv, i) => {
              const DynamicIcon = iconMap[cv.icon] || iconMap.ShieldCheck;
              return (
                <div
                  key={i}
                  className={`group w-full text-center ${cardClassName}`}
                >
                  {showIcon && (
                    <div className="flex justify-center mb-2">
                      <span className={iconWrapperClassName}>
                        <DynamicIcon size={iconSize} />
                      </span>
                    </div>
                  )}
                  <h3 className={titleClassName}>{cv.title}</h3>
                  <p className={descriptionClassName}>{cv.description}</p>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}