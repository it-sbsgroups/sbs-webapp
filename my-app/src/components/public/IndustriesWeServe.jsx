// src/components/public/IndustriesWeServe.jsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

// ----- Default configuration (exportable for global tweaks) -----
export const defaultIndustriesConfig = {
  headingClass: "text-3xl md:text-4xl font-black tracking-tight text-blue-950",
  headingHighlightClass: "text-[#557b01]",
  descriptionClass: "mt-4 text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto",
  gridClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  cardClass:
    "group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200",
  iconClass: "shrink-0 text-[#557b01] group-hover:text-blue-700 transition-colors",
  iconSize: 20,
  textClass: "text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors",
  // Optional: override the icon component (default is CheckCircle2)
  iconComponent: CheckCircle2,
  // fallback content (can be overridden)
  fallbackHeadingPart1: "Industries",
  fallbackHeadingPart2: "We Serve",
  fallbackDescription: "<p>Our solutions span across diverse industries, helping businesses of all sizes achieve their goals</p>",
  fallbackFeatures: [
    "Power Plants & Utilities",
    "Mining & Minerals",
    "Metals & Cement",
    "Manufacturing & Industrial Plants",
    "EPC & Construction Contractors",
    "Transportation & Material Handling",
    "Government & Public Sector Units",
    "Warehousing & Logistics Hubs",
    "OEMs, Traders & Channel Partners",
  ],
};

// ----- Component with props merging into default config -----
export default function IndustriesWeServe({ config = {} }) {
  // Merge user‑provided config with default
  const finalConfig = { ...defaultIndustriesConfig, ...config };
  const {
    headingClass,
    headingHighlightClass,
    descriptionClass,
    gridClass,
    cardClass,
    iconClass,
    iconSize,
    textClass,
    iconComponent: Icon,
    fallbackHeadingPart1,
    fallbackHeadingPart2,
    fallbackDescription,
    fallbackFeatures,
  } = finalConfig;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    siteConfigApi
      .getIndustriesManager()
      .then((d) => {
        if (!alive) return;
        const fallback = {
          headingPart1: fallbackHeadingPart1,
          headingPart2: fallbackHeadingPart2,
          description: fallbackDescription,
          features: fallbackFeatures,
        };
        setData(d && Object.keys(d).length > 0 ? { ...fallback, ...d } : fallback);
      })
      .catch(() => alive && setData({ 
        headingPart1: fallbackHeadingPart1,
        headingPart2: fallbackHeadingPart2,
        description: fallbackDescription,
        features: fallbackFeatures,
      }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [fallbackHeadingPart1, fallbackHeadingPart2, fallbackDescription, fallbackFeatures]);

  const content = data || {
    headingPart1: fallbackHeadingPart1,
    headingPart2: fallbackHeadingPart2,
    description: fallbackDescription,
    features: fallbackFeatures,
  };
  const features = content.features || [];

  return (
    <section className="w-full bg-white py-16 md:py-20 px-4 md:px-8 border-b border-slate-100">
      <div className="max-w-6xl mx-auto">
        {/* Heading & Description – centered */}
        <div className="text-center mb-12">
          <h2 className={headingClass}>
            {content.headingPart1}{" "}
            <span className={headingHighlightClass}>{content.headingPart2}</span>
          </h2>
          {content.description && (
            <div
              className={descriptionClass}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.description) }}
            />
          )}
        </div>

        {/* Feature Cards Grid – 3 columns on large screens */}
        <div className={gridClass}>
          {loading &&
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}

          {!loading &&
            features.map((feature, i) => (
              <div key={i} className={cardClass}>
                <Icon size={iconSize} className={iconClass} />
                <span className={textClass}>{feature}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}