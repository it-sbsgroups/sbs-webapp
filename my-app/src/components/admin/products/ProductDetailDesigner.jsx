// src/components/admin/products/ProductDetailDesigner.jsx
"use client";

import { useState, useEffect } from "react";
import settingsApi from "@/lib/settingsApi";
import { Save, Eye, Palette, Image, List } from "lucide-react";

const STORAGE_KEY = "sbs_admin_detail_designer_state";

export default function ProductDetailDesigner() {
  const defaultSettings = {
    recommendMode: "category",
    recommendCount: 4,
    recommendedProductIds: [],
    showImages: true,
    showSpecifications: true,
    showCertifications: true,
    showKeyFeatures: true,
    showBrandInfo: true,
    showMaterial: true,
    showRelated: true,
    showRfqButton: true,
    pageBackground: "#ffffff",
    sectionBackground: "#f8fafc",
    accentColor: "#1e3a8a",
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from API, then merge with saved draft
  useEffect(() => {
    const load = async () => {
      try {
        const response = await settingsApi.getProductSettings();
        const data = response?.data || response;
        let loaded = { ...defaultSettings };
        if (data?.detailSettings) {
          loaded = { ...loaded, ...data.detailSettings };
        }
        // Restore draft from sessionStorage (overwrites API data for unsaved changes)
        const draft = sessionStorage.getItem(STORAGE_KEY);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            loaded = { ...loaded, ...parsed };
          } catch {}
        }
        setSettings(loaded);
      } catch (error) {
        console.error("Failed to load detail settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save draft on every change
  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loading]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateProductSettings({ detailSettings: settings });
      sessionStorage.removeItem(STORAGE_KEY); // clear draft after successful save
      alert("Detail page settings saved!");
    } catch (error) {
      alert("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Detail Page Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Customize product detail pages.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Related Products */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><List size={18} className="text-blue-600" /><h3 className="font-semibold">Related Products</h3></div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Mode</label>
            <select value={settings.recommendMode} onChange={(e) => updateSetting("recommendMode", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm">
              <option value="all">All Products</option>
              <option value="category">Same Category</option>
              <option value="selected">Manual</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Count</label>
            <input type="number" value={settings.recommendCount} onChange={(e) => updateSetting("recommendCount", Number(e.target.value))} min={1} max={12} className="w-full rounded-xl border px-4 py-3 text-sm" />
          </div>
        </div>

        {/* Section Toggles */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Eye size={18} className="text-blue-600" /><h3 className="font-semibold">Sections</h3></div>
          {[
            { label: "Images Gallery", key: "showImages" },
            { label: "Specifications", key: "showSpecifications" },
            { label: "Certifications", key: "showCertifications" },
            { label: "Key Features", key: "showKeyFeatures" },
            { label: "Brand Info", key: "showBrandInfo" },
            { label: "Material", key: "showMaterial" },
            { label: "Related Products", key: "showRelated" },
            { label: "RFQ Button", key: "showRfqButton" },
          ].map((t) => (
            <div key={t.key} className="flex items-center justify-between">
              <span className="text-sm">{t.label}</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={settings[t.key] !== false} onChange={(e) => updateSetting(t.key, e.target.checked)} className="peer sr-only" />
                <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>

        {/* Colors */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2"><Palette size={18} className="text-blue-600" /><h3 className="font-semibold">Colors</h3></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Page BG", key: "pageBackground", d: "#ffffff" },
              { label: "Section BG", key: "sectionBackground", d: "#f8fafc" },
              { label: "Accent", key: "accentColor", d: "#1e3a8a" },
            ].map((item) => (
              <div key={item.key}>
                <label className="mb-1.5 block text-xs font-medium">{item.label}</label>
                <div className="flex gap-2">
                  <input type="color" value={settings[item.key] || item.d} onChange={(e) => updateSetting(item.key, e.target.value)} className="h-10 w-12 rounded-lg border cursor-pointer" />
                  <input type="text" value={settings[item.key] || item.d} onChange={(e) => updateSetting(item.key, e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          <Save size={18} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}