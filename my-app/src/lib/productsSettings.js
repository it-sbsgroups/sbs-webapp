import { PRODUCTS_SETTINGS as SEED } from "@/data/products";

const STORAGE_KEY = "sbs_products_settings_v1";

const clone = (obj) => JSON.parse(JSON.stringify(obj));

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

export function getDefaultSettings() {
  return clone(SEED);
}

export function loadProductsSettings() {
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

export function saveProductsSettings(settings) {
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