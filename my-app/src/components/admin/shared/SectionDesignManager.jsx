"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Palette, Save } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import { DEFAULT_SECTION_TOKENS, SECTION_DESIGN_DEFAULTS } from "@/lib/sectionDesign";

// Curated, safe Tailwind presets — admins pick from known-good classes
// instead of free-typing arbitrary Tailwind (which is easy to typo into a
// class that silently does nothing).
const BG_PRESETS = [
  { label: "White", value: "bg-white" },
  { label: "Slate", value: "bg-slate-50" },
  { label: "Blue tint", value: "bg-blue-50" },
  { label: "Lime tint", value: "bg-lime-50" },
  { label: "Orange tint", value: "bg-orange-50" },
  { label: "Deep navy", value: "bg-blue-950" },
  { label: "Slate 900", value: "bg-slate-900" },
];
const TEXT_PRESETS = [
  { label: "Navy", value: "text-blue-950" },
  { label: "Slate", value: "text-slate-600" },
  { label: "Slate dark", value: "text-slate-900" },
  { label: "Blue", value: "text-blue-900" },
  { label: "Lime", value: "text-lime-600" },
  { label: "Orange", value: "text-orange-600" },
  { label: "White", value: "text-white" },
];
const RADIUS_PRESETS = [
  { label: "Soft", value: "rounded-lg" },
  { label: "Medium", value: "rounded-2xl" },
  { label: "Bold", value: "rounded-3xl" },
];
const SHADOW_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft", value: "shadow-sm hover:shadow-md" },
  { label: "Elevated", value: "shadow-sm hover:shadow-xl" },
  { label: "Dramatic", value: "shadow-md hover:shadow-2xl" },
];
const BORDER_PRESETS = [
  { label: "None", value: "" },
  { label: "Subtle", value: "border border-slate-200/80" },
  { label: "Defined", value: "border-2 border-slate-200" },
];

const FIELD_GROUPS = [
  {
    heading: "Section",
    fields: [
      { key: "sectionBg", label: "Section Background", presets: BG_PRESETS },
      { key: "sectionTitleColor", label: "Section Title Color", presets: TEXT_PRESETS },
      { key: "sectionTextColor", label: "Section Text Color", presets: TEXT_PRESETS },
      { key: "accentColor", label: "Accent Color", presets: TEXT_PRESETS },
    ],
  },
  {
    heading: "Cards",
    fields: [
      { key: "cardBg", label: "Card Background", presets: BG_PRESETS },
      { key: "cardBorder", label: "Card Border", presets: BORDER_PRESETS },
      { key: "cardRadius", label: "Card Roundness", presets: RADIUS_PRESETS },
      { key: "cardShadow", label: "Card Shadow", presets: SHADOW_PRESETS },
      { key: "cardTitleColor", label: "Card Title Color", presets: TEXT_PRESETS },
      { key: "cardTextColor", label: "Card Text Color", presets: TEXT_PRESETS },
    ],
  },
  {
    heading: "Icon",
    fields: [
      { key: "iconBg", label: "Icon Background", presets: BG_PRESETS },
      { key: "iconColor", label: "Icon Color", presets: TEXT_PRESETS },
    ],
  },
];

/**
 * Reusable design-settings editor for any section registered in
 * lib/sectionDesign.js. Persists real changes to the shared `sectionDesign`
 * site-config key (siteConfigApi.saveSectionDesign) without touching other
 * sections' saved design — unlike the old WhyChooseUsDesignManager.jsx
 * (removed), whose Save button only showed an alert() and never called
 * any API.
 */
export default function SectionDesignManager({ sectionKey, sectionLabel }) {
  const defaults = SECTION_DESIGN_DEFAULTS[sectionKey] || DEFAULT_SECTION_TOKENS;
  const [allDesign, setAllDesign] = useState(null); // full saved config, all sections
  const [tokens, setTokens] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    siteConfigApi
      .getSectionDesign()
      .then((all) => {
        if (!active) return;
        setAllDesign(all || {});
        setTokens({ ...defaults, ...(all?.[sectionKey] || {}) });
      })
      .catch(() => {
        if (active) setAllDesign({});
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const updateToken = (key, value) => setTokens((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Merge into the FULL config so saving this section never wipes out
      // another section's design tokens.
      const merged = { ...(allDesign || {}), [sectionKey]: tokens };
      await siteConfigApi.saveSectionDesign(merged);
      setAllDesign(merged);
      toast.success(`${sectionLabel} design saved`);
    } catch (e) {
      toast.error(e.message || "Failed to save design settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">{sectionLabel} — Design Settings</h3>
      </div>

      {FIELD_GROUPS.map((group) => (
        <div key={group.heading} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400">{group.heading}</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">{field.label}</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {field.presets.map((preset) => (
                    <button
                      key={preset.value || "none"}
                      type="button"
                      onClick={() => updateToken(field.key, preset.value)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        tokens[field.key] === preset.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tokens[field.key] || ""}
                  onChange={(e) => updateToken(field.key, e.target.value)}
                  placeholder="Tailwind class(es)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={14} /> {saving ? "Saving…" : `Save ${sectionLabel} Design`}
        </button>
      </div>
    </div>
  );
}
