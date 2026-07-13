"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Breadcrumb({
  items = [],
  title,
  gradient = "from-blue-950 via-blue-900 to-slate-900",
  backgroundImage,
  overlayOpacity = 0.55,
  className = "",
  enableDotGrid = false,
  animateDots = false,          // ← new prop
  dotColor = "rgba(255,255,255,0.2)",
  dotSpacing = 20,
  dotBaseSize = 4,
  dotCenterScale = 1.5,
  dotHoverScale = 1.8,
}) {
  const containerRef = useRef(null);
  const [dots, setDots] = useState([]);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // ── Recalculate grid positions on resize ──────────────────────────
  useEffect(() => {
    if (!enableDotGrid || !containerRef.current) return;

    const updateGrid = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      const cols = Math.floor(w / dotSpacing);
      const rows = Math.floor(h / dotSpacing);
      const offsetX = (w - cols * dotSpacing) / 2 + dotSpacing / 2;
      const offsetY = (h - rows * dotSpacing) / 2 + dotSpacing / 2;
      const centerX = w / 2;
      const centerY = h / 2;
      const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);

      const newDots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = offsetX + c * dotSpacing;
          const baseY = offsetY + r * dotSpacing;
          const dist = Math.sqrt((baseX - centerX) ** 2 + (baseY - centerY) ** 2);
          const t = 1 - Math.min(dist / maxDist, 1);
          const baseScale = 1 + t * dotCenterScale;
          newDots.push({ baseX, baseY, baseScale });
        }
      }
      setDots(newDots);
    };

    updateGrid();
    const observer = new ResizeObserver(updateGrid);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [enableDotGrid, dotSpacing, dotCenterScale]);

  // ── Animation loop (zig‑zag wave) ─────────────────────────────────
  useEffect(() => {
    if (!enableDotGrid || !animateDots) {
      cancelAnimationFrame(animFrameRef.current);
      // Remove dynamic offsets when animation stops
      if (!animateDots) {
        setDots(prev => prev.map(d => ({ ...d, offsetX: 0, offsetY: 0 })));
      }
      return;
    }

    const speed = 0.0015;          // wave speed
    const amplitude = dotSpacing * 0.45; // how far dots move
    const wavelengthX = dotSpacing * 6;
    const wavelengthY = dotSpacing * 6;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      setDots(prev =>
        prev.map(dot => {
          // Zig‑zag pattern: combine two perpendicular sine waves
          const offsetX = amplitude * Math.sin((dot.baseX / wavelengthX) - elapsed * speed * 2);
          const offsetY = amplitude * Math.cos((dot.baseY / wavelengthY) - elapsed * speed);
          return { ...dot, offsetX, offsetY };
        })
      );

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [enableDotGrid, animateDots, dotSpacing]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Background */}
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Dot grid (animated or static) */}
      {enableDotGrid && (
        <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
          {dots.map((dot, idx) => {
            // Use base position + dynamic offset (0 when not animated)
            const left = dot.baseX + (dot.offsetX ?? 0);
            const top = dot.baseY + (dot.offsetY ?? 0);
            const size = dotBaseSize * dot.baseScale;

            return (
              <span
                key={idx}
                className="absolute rounded-full transition-transform duration-200 hover:scale-[--hover-scale] pointer-events-auto"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  backgroundColor: dotColor,
                  transform: "translate(-50%, -50%)",
                  "--hover-scale": dotHoverScale,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Breadcrumb content */}
      <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-25 md:py-20">
        {title && (
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3 text-center">
            {title}
          </h1>
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
                  <Link href={item.href} className="text-white/70 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-white" : "text-white/70"} aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}