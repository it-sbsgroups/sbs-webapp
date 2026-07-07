"use client";

// =============================================================================
// FILE: src/components/shared/Breadcrumb.jsx
// Reusable page-header breadcrumb strip. Drop it at the top of any internal
// page (products, brands, clients, employees, news, etc.).
//
// USAGE:
//   <Breadcrumb
//     title="Bearings"
//     items={[{ label: "Products", href: "/products" }, { label: "Bearings" }]}
//   />
//
//   // with a background image instead of the default gradient:
//   <Breadcrumb
//     title="About Us"
//     items={[{ label: "About Us" }]}
//     backgroundImage="https://res.cloudinary.com/.../about-hero.jpg"
//   />
//
//   // with a custom gradient:
//   <Breadcrumb
//     title="Our Brands"
//     items={[{ label: "Brands" }]}
//     gradient="from-emerald-950 via-emerald-900 to-slate-900"
//   />
// =============================================================================

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * @param {{label: string, href?: string}[]} items - Trail after Home. Last item is treated as the current page (non-clickable) even if it has an href.
 * @param {string} [title] - Optional large page title shown above the trail.
 * @param {string} [gradient] - Tailwind gradient stop classes (e.g. "from-blue-950 via-blue-900 to-slate-900"). Ignored if backgroundImage is set.
 * @param {string} [backgroundImage] - Image URL. When set, takes priority over `gradient`.
 * @param {number} [overlayOpacity] - Dark overlay strength (0-1) over backgroundImage, for text legibility.
 * @param {string} [className]
 */
export default function Breadcrumb({
  items = [],
  title,
  gradient = "from-blue-950 via-blue-900 to-slate-900",
  backgroundImage = "https://sbsgroups.co.in/assets/Annual5_result-DKMtFeIN.webp",
  overlayOpacity = 0.55,
  className = "",
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {backgroundImage ? (
        <>
          <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {title && (
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">{title}</h1>
        )}

        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm font-semibold">
          <Link href="/" className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
            <Home size={13} />
            Home
          </Link>

          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                <ChevronRight size={13} className="text-white/40" />
                {item.href && !isLast ? (
                  <Link href={item.href} className="text-white/70 hover:text-white transition-colors">{item.label}</Link>
                ) : (
                  <span className={isLast ? "text-white" : "text-white/70"} aria-current={isLast ? "page" : undefined}>{item.label}</span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
