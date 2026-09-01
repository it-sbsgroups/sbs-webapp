"use client";

import { useEffect, useState } from "react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

/**
 * Default Site Config Design Settings
 * ------------------------------------------------------------------
 * Generalizes the pattern already used by components/shared/BrandCard.jsx
 * (a DEFAULT_SETTINGS object of Tailwind class strings, merged with any
 * admin override) so that OTHER content sections — not just Brand cards —
 * can have their look controlled from Site Config instead of hardcoded
 * per-component. Every value below is a literal Tailwind class string, on
 * purpose: it's the same recipe BrandCard already uses, just keyed by
 * section instead of being local to one component.
 *
 * Backed by the `sectionDesign` site-config key (see central.controller.ts
 * VALID_KEYS and siteConfigApi.getSectionDesign/saveSectionDesign). The
 * saved JSON shape is: { [sectionKey]: { ...tokens } }, so every section's
 * design lives under its own key in one shared config object and saving
 * one section never overwrites another's.
 *
 * To add a new section (beyond whyChooseUs / whyContactUs):
 *   1. Add a DEFAULT_SECTION_TOKENS entry below with a new section key.
 *   2. Render <SectionDesignManager sectionKey="..." sectionLabel="..." />
 *      somewhere in that section's admin manager.
 *   3. Call useSectionDesign("...") in the section's public component and
 *      apply the returned token classes instead of hardcoding them.
 */
export const DEFAULT_SECTION_TOKENS = {
  // Section-level
  sectionBg: "bg-white",
  sectionTitleColor: "text-blue-950",
  sectionTextColor: "text-slate-600",
  accentColor: "text-lime-600",

  // Card container (mirrors BrandCard's cardBg/cardBorder/cardRadius/cardShadow)
  cardBg: "bg-white",
  cardBorder: "border border-slate-200/80",
  cardRadius: "rounded-2xl",
  cardShadow: "shadow-sm hover:shadow-xl",

  // Icon badge
  iconBg: "bg-blue-50",
  iconColor: "text-blue-900",

  // Card text
  cardTitleColor: "text-slate-900",
  cardTextColor: "text-slate-500",
};

export const SECTION_DESIGN_DEFAULTS = {
  whyChooseUs: { ...DEFAULT_SECTION_TOKENS },
  whyContactUs: { ...DEFAULT_SECTION_TOKENS },
};

// Section keys with a human label, for admin UI dropdowns / headings.
export const SECTION_DESIGN_SECTIONS = [
  { key: "whyChooseUs", label: "Why Choose Us" },
  { key: "whyContactUs", label: "Why Contact Us" },
];

/**
 * useSectionDesign("whyChooseUs") -> { design, loading }
 * `design` always has every DEFAULT_SECTION_TOKENS field filled in — any
 * field not explicitly overridden in the saved config falls back to the
 * default, exactly like BrandCard's `{ ...DEFAULT_SETTINGS, ...settings }`.
 */
export function useSectionDesign(sectionKey) {
  const defaults = SECTION_DESIGN_DEFAULTS[sectionKey] || DEFAULT_SECTION_TOKENS;
  const [design, setDesign] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    siteConfigApi
      .getSectionDesign()
      .then((all) => {
        if (!active) return;
        setDesign({ ...defaults, ...(all?.[sectionKey] || {}) });
      })
      .catch(() => {
        // Keep defaults — a design-settings fetch failure should never
        // block a section from rendering.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  return { design, loading };
}
