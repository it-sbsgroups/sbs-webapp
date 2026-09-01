// src/components/shared/BrandCard.jsx
"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Brand";
};

const MAX_TILT = 10;

// ---------------------------------------------------------------------------
//  DEFAULT SETTINGS – change these to update the entire card design globally
// ---------------------------------------------------------------------------
const DEFAULT_SETTINGS = {
  // Card outer
  cardBg: "bg-white",
  cardBorder: "border border-slate-200/80",
  cardRadius: "rounded-2xl",
  cardShadow: "shadow-sm hover:shadow-2xl",

  // Logo container
  logoHeight: "h-36",          // Tailwind height class
  logoPadding: "p-6",
  logoBg: "bg-white",          // now always white
  logoImgClass: "w-full h-full object-contain drop-shadow-sm",

  // Footer (where the brand name now lives)
  footerPadding: "px-3 py-2",
  footerBg: "bg-slate-50",
  footerBorder: "border-t border-slate-100",
  footerTextSize: "text-[11px]",
  footerTextColor: "text-slate-700",
  footerFontWeight: "font-bold",
  footerText: "text-center",
  footerTruncate: true,

  // Glare
  glareOpacity: "opacity-0 group-hover:opacity-100",
  glareTransition: "transition-opacity duration-300",
};

export default function BrandCard({ brand, settings = {} }) {
  const cardRef = useRef(null);
  const frameRef = useRef(null);

  // Merge default settings with any overrides passed via props.
  // `logoHeightPx`, when provided, overrides `logoHeight` with an exact
  // pixel value via inline style — used by the Own Brands admin size
  // control, which needs finer control than the Tailwind height classes.
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const logoHeightStyle = s.logoHeightPx ? { height: `${s.logoHeightPx}px` } : undefined;

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * MAX_TILT * 2;
      const rotateX = (0.5 - py) * MAX_TILT * 2;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      card.style.setProperty("--glare-x", `${px * 100}%`);
      card.style.setProperty("--glare-y", `${py * 100}%`);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const card = cardRef.current;
    if (card) {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  }, []);

  // Build the footer text class string
  const footerClass = [
    s.footerPadding,
    s.footerBg,
    s.footerBorder,
    s.footerTextSize,
    s.footerTextColor,
    s.footerFontWeight,
    s.footerText,
    s.footerTruncate ? "truncate" : "",
    "relative",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      ref={cardRef}
      href={`/brands/${brand.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`brand-card-3d group relative block ${s.cardBg} ${s.cardBorder} ${s.cardRadius} overflow-hidden ${s.cardShadow} transition-shadow duration-300`}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {/* Logo area – uses settings for height, padding, background */}
      <div className={`${s.logoHeightPx ? "" : s.logoHeight} flex items-center justify-center ${s.logoPadding} ${s.logoBg}`} style={logoHeightStyle}>
        <img
          src={brand.logo}
          alt={brand.brandName}
          className={s.logoImgClass}
          style={{ transform: "translateZ(20px)" }}
          onError={fallbackImg}
        />
      </div>

      {/* Cursor‑following sheen – can be disabled by changing glareOpacity to "" */}
      {s.glareOpacity && (
        <div
          className={`brand-card-glare pointer-events-none absolute inset-0 ${s.glareOpacity} ${s.glareTransition}`}
        />
      )}

      {/* Brand name footer – replaces the old website URL */}
      <div className={footerClass}>
        {brand.brandName || "Unnamed Brand"}
      </div>

      <style jsx>{`
        .brand-card-3d {
          transition: transform 0.15s ease-out, box-shadow 0.3s ease;
        }
        .brand-card-glare {
          background: radial-gradient(
            circle at var(--glare-x, 50%) var(--glare-y, 50%),
            rgba(255, 255, 255, 0.35),
            transparent 60%
          );
        }
      `}</style>
    </Link>
  );
}