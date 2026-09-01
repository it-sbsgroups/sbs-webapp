// src/components/shared/LazySection.jsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps one page section so it:
 *  1. Only actually renders once it's about to scroll into view (or is
 *     already visible on load) — sections far below the fold don't cost
 *     anything until the user gets close to them.
 *  2. Gets a stable `id`, so `/page#id` deep-links straight to it.
 *  3. Keeps the browser's address bar hash in sync with whichever section
 *     is currently on screen (via history.replaceState, no extra history
 *     entries), so copying the URL at any scroll position shares that
 *     exact section.
 *  4. If the page was opened with a hash pointing at this section, it
 *     skips the lazy wait, renders immediately, and scrolls into place —
 *     the browser's own native #hash scroll runs before this section
 *     exists in the DOM, so this replaces it.
 *
 * `minHeight` should roughly match the section's real height so the page
 * doesn't jump/reflow once it swaps from placeholder to real content.
 */
export default function LazySection({ id, children, minHeight = 400, rootMargin = "400px 0px", className = "" }) {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const deepLinked = useRef(false);

  // Deep link: if the URL already points here, don't wait for scroll.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === `#${id}`) {
      deepLinked.current = true;
      setShouldRender(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount the real content once we're near the viewport.
  useEffect(() => {
    if (shouldRender) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldRender(true); // no IO support — just render, don't break the page
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  // Finish the deep-link scroll once the section actually has content.
  useEffect(() => {
    if (shouldRender && deepLinked.current) {
      deepLinked.current = false;
      requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [shouldRender]);

  // Keep the address bar pointed at whichever section is on screen.
  useEffect(() => {
    if (!shouldRender) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && window.location.hash !== `#${id}`) {
          window.history.replaceState(null, "", `#${id}`);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, id]);

  return (
    <section id={id} ref={ref} className={className} style={!shouldRender ? { minHeight } : undefined}>
      {shouldRender ? children : null}
    </section>
  );
}
