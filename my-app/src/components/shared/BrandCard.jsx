// src/components/shared/BrandCard.jsx
"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { useAdaptiveLogoBg } from "@/hooks/useAdaptiveLogoBg";

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Brand";
};

// Max tilt in degrees — kept modest so it reads as a subtle premium effect,
// not a gimmick.
const MAX_TILT = 10;

export default function BrandCard({ brand }) {
  const cardRef = useRef(null);
  const frameRef = useRef(null);
  const adaptiveBg = useAdaptiveLogoBg(brand.logo);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0 → 1 across the card
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * MAX_TILT * 2;
      const rotateX = (0.5 - py) * MAX_TILT * 2;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      // Subtle light-follows-cursor sheen, purely cosmetic.
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

  return (
    <Link
      ref={cardRef}
      href={`/brands/${brand.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="brand-card-3d group relative block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-300"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {/* Logo — background adapts to the logo's own edge color when the
          default light gradient would make it hard to see */}
      <div
        className="h-36 flex items-center justify-center p-6 transition-colors duration-300"
        style={
          adaptiveBg
            ? { backgroundColor: adaptiveBg }
            : { backgroundImage: "linear-gradient(to bottom right, #f8fafc, #ffffff)" }
        }
      >
        <img
          src={brand.logo}
          alt={brand.brandName}
          className="w-full h-full object-contain drop-shadow-sm"
          style={{ transform: "translateZ(20px)" }}
          onError={fallbackImg}
        />
      </div>

      {/* Cursor-following sheen */}
      <div className="brand-card-glare pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Brand name — hidden until hover, appears over the logo */}
      <div className="absolute inset-0 bg-indigo-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="text-center px-3">
          <h3 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-lg">{brand.brandName}</h3>
          {brand.sector && (
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mt-1">{brand.sector}</p>
          )}
        </div>
      </div>

      {/* Small footer for founder / website (optional) */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-500 font-medium truncate relative">
        {brand.website || " "}
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
