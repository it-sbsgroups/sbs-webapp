// ============================================================================
// PRODUCTS SETTINGS LOADER  (import as "@/lib/productsSettings")
// ----------------------------------------------------------------------------
// This is the ONLY place that knows "where products-page settings live".
//
//   • PRODUCTS_SETTINGS (in @/data/products) is the seed / fallback default.
//   • The admin saves overrides to localStorage today (no backend needed).
//   • The public page reads the MERGED result and obeys it.
//
// 🔁 NESTJS MIGRATION: when your API is ready, fill in the two TODO blocks
//    (loadProductsSettings → GET, saveProductsSettings → PUT). Nothing else in
//    the app needs to change — the merge + default-fallback logic stays.
// ============================================================================

import { PRODUCTS_SETTINGS as SEED } from "@/data/products";

const STORAGE_KEY = "sbs_products_settings_v1";

// Deep-clone so callers never mutate the shared seed object.
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Deep-merge `override` onto `base` (arrays are replaced, not merged — so the
// admin can fully control lists like rfq.fields without leftover seed items).
function deepMerge(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override !== undefined ? clone(override) : clone(base);
  }
  if (
    typeof base === "object" &&
    base !== null &&
    typeof override === "object" &&
    override !== null
  ) {
    const out = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = key in base ? deepMerge(base[key], override[key]) : clone(override[key]);
    }
    return out;
  }
  return override !== undefined ? override : base;
}

/** The untouched seed defaults (deep-cloned). Used as the reset target. */
export function getDefaultSettings() {
  return clone(SEED);
}

/**
 * Returns the EFFECTIVE settings the UI should obey:
 *   seed defaults  ⟵ merged with ⟵  admin overrides.
 *
 * Safe to call on the server (returns seed) and in the browser (merges
 * localStorage). Never throws — bad/corrupt storage falls back to the seed.
 */
export function loadProductsSettings() {
  // --- TODO (NestJS): replace the localStorage block below with:
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products-settings`);
  //   return deepMerge(SEED, await res.json());
  // (and make this function async + update callers to await it).
  if (typeof window === "undefined") return clone(SEED);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(SEED);
    const override = JSON.parse(raw);
    return deepMerge(SEED, override);
  } catch {
    return clone(SEED);
  }
}

/**
 * Persists admin-edited settings. Today: localStorage. Returns true on success.
 * Also dispatches a window event so any open public tab can live-refresh.
 */
export function saveProductsSettings(settings) {
  // --- TODO (NestJS): also PUT to your API here:
  //   await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products-settings`, {
  //     method: "PUT", headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(settings),
  //   });
  if (typeof window === "undefined") return false;
  try {
    const stamped = {
      ...settings,
      meta: {
        ...(settings.meta || {}),
        updatedAt: new Date().toISOString(),
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
    window.dispatchEvent(new CustomEvent("sbs-products-settings-updated"));
    return true;
  } catch {
    return false;
  }
}

/** Wipes admin overrides so the page reverts to seed defaults. */
export function resetProductsSettings() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("sbs-products-settings-updated"));
  } catch {
    /* no-op */
  }
}

export const PRODUCTS_SETTINGS_STORAGE_KEY = STORAGE_KEY;

// ----------------------------------------------------------------------------
// Recommendation resolver — used by the product DETAIL page. Picks which
// products to show in the "Recommended" rail based on the admin's settings.
//   mode "selected" → explicit ids
//   mode "category" → same category + subcategory as the current product
//   mode "all"      → any other products
// `allProducts` is the flat product array; `current` is the product being viewed.
// ----------------------------------------------------------------------------
export function resolveRecommendations(settings, allProducts, current) {
  const detail = settings?.detail || {};
  const count = detail.recommendCount || 4;
  const mode = detail.recommendMode || "category";
  const others = (allProducts || []).filter((p) => p.id !== current?.id);

  if (mode === "selected") {
    const ids = detail.recommendedProductIds || [];
    return others.filter((p) => ids.includes(p.id)).slice(0, count);
  }

  if (mode === "category" && current) {
    const sameSub = others.filter(
      (p) =>
        p.categoryId === current.categoryId &&
        p.subcategoryId === current.subcategoryId
    );
    if (sameSub.length >= count) return sameSub.slice(0, count);
    // top up with same-category products if the subcategory is thin
    const sameCat = others.filter(
      (p) => p.categoryId === current.categoryId && !sameSub.includes(p)
    );
    return [...sameSub, ...sameCat].slice(0, count);
  }

  return others.slice(0, count);
}

// ----------------------------------------------------------------------------
// Tailwind mapping helpers — turn settings values into safe, static class
// strings. (Tailwind can't see dynamically-built class names, so we map to
// full literal classes here.)
// ----------------------------------------------------------------------------
export const GAP_CLASS = { sm: "gap-3", md: "gap-6", lg: "gap-8" };

export const COLS_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export const RATIO_CLASS = {
  square: "aspect-square",
  video: "aspect-video",
  auto: "aspect-auto",
};

export const CARD_STYLE_CLASS = {
  elevated: "shadow-sm hover:shadow-md border border-slate-200/80",
  outlined: "border-2 border-slate-200 hover:border-slate-300",
  flat: "border border-transparent",
};

export const IMAGE_FIT_CLASS = { contain: "object-contain", cover: "object-cover" };