"use client";

import { useEffect, useRef, useState } from "react";

/**
 * <LazyCacheImage />
 *
 * - Only starts fetching once the image is within `rootMargin` of the
 *   viewport (IntersectionObserver), so off-screen news images never block
 *   the initial page load.
 * - On first successful load, caches the image as a data URL in
 *   localStorage so the *next* time this URL is rendered anywhere on the
 *   site it paints instantly with zero network round-trip.
 * - Falls back to a plain lazy <img> if fetch/caching isn't possible
 *   (e.g. CORS-blocked source, private/incognito storage, quota errors) —
 *   it never blocks rendering the image itself.
 */

const CACHE_PREFIX = "sbs_img_cache_v1:";
const CACHE_INDEX_KEY = "sbs_img_cache_v1_index";
const MAX_CACHEABLE_BYTES = 220 * 1024; // skip caching very large images to protect quota
const MAX_CACHE_ENTRIES = 120; // simple LRU cap

function readCache(src) {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CACHE_PREFIX + src);
  } catch {
    return null;
  }
}

function touchIndex(src) {
  try {
    const raw = localStorage.getItem(CACHE_INDEX_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter((k) => k !== src);
    list.push(src);
    while (list.length > MAX_CACHE_ENTRIES) {
      const oldest = list.shift();
      localStorage.removeItem(CACHE_PREFIX + oldest);
    }
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(list));
  } catch {
    /* ignore — index bookkeeping is best-effort */
  }
}

function writeCache(src, dataUrl) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_PREFIX + src, dataUrl);
    touchIndex(src);
  } catch {
    // Quota exceeded — drop the oldest half of our cached images and give up
    // silently for this one; the image still rendered from the network fine.
    try {
      const raw = localStorage.getItem(CACHE_INDEX_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const toDrop = list.splice(0, Math.ceil(list.length / 2));
      toDrop.forEach((k) => localStorage.removeItem(CACHE_PREFIX + k));
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(list));
    } catch {
      /* give up quietly */
    }
  }
}

export default function LazyCacheImage({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  containerClassName = "w-full h-full",
  style,
  rootMargin = "200px",
  ...rest
}) {
  const cached = readCache(src);
  const [resolvedSrc, setResolvedSrc] = useState(cached || null);
  const [inView, setInView] = useState(!!cached); // cached images can render immediately
  const [errored, setErrored] = useState(!src); // no src at all → skip straight to the plain <img> fallback (lets the caller's onError handle it)
  const containerRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Observe visibility (skip entirely if we already have a cached data URL)
  useEffect(() => {
    if (cached || !src) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true); // no IO support — just load it
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Fetch + cache once in view
  useEffect(() => {
    if (!inView || cached || !src || errored) return;
    let cancelled = false;

    fetch(src, { mode: "cors" })
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setResolvedSrc(objectUrl);

        if (blob.size <= MAX_CACHEABLE_BYTES) {
          const reader = new FileReader();
          reader.onload = () => {
            if (!cancelled && typeof reader.result === "string") {
              writeCache(src, reader.result);
            }
          };
          reader.readAsDataURL(blob);
        }
      })
      .catch(() => {
        // CORS-blocked or network error — fall back to a plain <img src>
        if (!cancelled) setErrored(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, src, cached, errored]);

  // Clean up any blob object URL we created
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const showFallbackImg = errored || (inView && !resolvedSrc && !cached);

  return (
    <div ref={containerRef} className={containerClassName} style={style}>
      {resolvedSrc ? (
        <img src={resolvedSrc} alt={alt} className={className} {...rest} />
      ) : showFallbackImg ? (
        <img src={src} alt={alt} loading="lazy" className={className} {...rest} />
      ) : (
        <div className={`${className} animate-pulse bg-slate-200`} aria-hidden="true" />
      )}
    </div>
  );
}
