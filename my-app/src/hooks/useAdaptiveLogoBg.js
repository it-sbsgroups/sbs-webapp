// src/hooks/useAdaptiveLogoBg.js
"use client";

import { useEffect, useState } from "react";

/**
 * Loads `src`, samples the pixels around its outer edge (this is the logo's
 * own background — not its artwork, which is almost always centered with
 * padding) and returns a CSS color to use behind it.
 *
 * Returns null when no adaptation is needed/possible:
 *  - the image is still loading
 *  - the sampled edge is transparent (nothing to match — default card
 *    background already works fine)
 *  - the sampled edge is already near-white (blends fine with the default
 *    light gradient, no need to override it)
 *  - the image failed to load, or canvas access was blocked by CORS
 *    (silently falls back — a missing 3rd-party CORS header shouldn't ever
 *    break the page)
 */
export function useAdaptiveLogoBg(src) {
  const [bg, setBg] = useState(null);

  useEffect(() => {
    setBg(null);
    if (!src) return;

    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0, g = 0, b = 0, count = 0;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const onEdge = x === 0 || y === 0 || x === size - 1 || y === size - 1;
            if (!onEdge) continue;
            const i = (y * size + x) * 4;
            if (data[i + 3] < 200) continue; // skip transparent pixels
            r += data[i]; g += data[i + 1]; b += data[i + 2];
            count++;
          }
        }

        if (!count) { setBg(null); return; } // fully transparent edge — nothing to adapt to

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance > 0.92) { setBg(null); return; } // already near-white, default bg is fine

        setBg(`rgb(${r}, ${g}, ${b})`);
      } catch {
        setBg(null); // CORS-blocked canvas read etc. — fail silently, keep default bg
      }
    };
    img.onerror = () => setBg(null);
    img.src = src;

    return () => { cancelled = true; };
  }, [src]);

  return bg;
}
