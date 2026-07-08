// src/components/admin/products/ProductCardDesigner.jsx
"use client";

import { useState, useEffect } from "react";
import settingsApi from "@/lib/settingsApi";
import { Save, Palette, Layout } from "lucide-react";

const STORAGE_KEY = "sbs_admin_card_designer_state";
const defaultSettings = {
  cardsPerRow: 3,
  gap: "md",
  pageBackground: "#f8fafc",
  maxWidth: "max-w-6xl",
  productsPerPage: 12,
  cardStyle: "elevated",
  cardBackground: "#ffffff",
  accentColor: "#1e3a8a",
  cornerRadius: "rounded-2xl",
  imageFit: "contain",
  imageRatio: "square",
  imageBackground: "#f8fafc",
  showBrandBadge: true,
  showModel: true,
  showKeyFeatures: true,
  showSkuId: true,
  showPricePill: true,
  priceLabel: "Price On Request",
  showBrochureButton: true,
  brochureButtonText: "Download Brochure",
  brochureMode: "download",
};

export default function ProductCardDesigner() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await settingsApi.getProductSettings();
        const data = response?.data || response;
        let loaded = { ...defaultSettings };
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          loaded = { ...defaultSettings, ...data };
        }
        // Restore draft
        const draft = sessionStorage.getItem(STORAGE_KEY);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            loaded = { ...loaded, ...parsed };
          } catch {}
        }
        setSettings(loaded);
      } catch (error) {
        console.error("Failed to load product settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      await settingsApi.updateProductSettings(settings);
      sessionStorage.removeItem(STORAGE_KEY);
      alert("Card design settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Card Design Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Customize how product cards appear on the public page.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Layout */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Layout size={18} className="text-blue-600" />
            <h3 className="font-semibold">Layout</h3>
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-medium">Cards Per Row: {settings.cardsPerRow}</label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.cardsPerRow}
              onChange={(e) => updateSetting("cardsPerRow", Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Gap Size</label>
            <select
              value={settings.gap}
              onChange={(e) => updateSetting("gap", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Products Per Page</label>
            <input
              type="number"
              value={settings.productsPerPage}
              onChange={(e) => updateSetting("productsPerPage", Number(e.target.value))}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Max Container Width</label>
            <select
              value={settings.maxWidth}
              onChange={(e) => updateSetting("maxWidth", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="max-w-4xl">Narrow</option>
              <option value="max-w-6xl">Medium</option>
              <option value="max-w-7xl">Wide</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Page Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.pageBackground}
                onChange={(e) => updateSetting("pageBackground", e.target.value)}
                className="h-10 w-12 rounded-lg border cursor-pointer"
              />
              <input
                type="text"
                value={settings.pageBackground}
                onChange={(e) => updateSetting("pageBackground", e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Card Appearance */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-blue-600" />
            <h3 className="font-semibold">Card Appearance</h3>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Card Style</label>
            <select
              value={settings.cardStyle}
              onChange={(e) => updateSetting("cardStyle", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="elevated">Elevated</option>
              <option value="outlined">Outlined</option>
              <option value="flat">Flat</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Image Fit</label>
            <select
              value={settings.imageFit}
              onChange={(e) => updateSetting("imageFit", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Image Ratio</label>
            <select
              value={settings.imageRatio}
              onChange={(e) => updateSetting("imageRatio", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="square">Square</option>
              <option value="video">Video (16:9)</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Card Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.cardBackground}
                onChange={(e) => updateSetting("cardBackground", e.target.value)}
                className="h-10 w-12 rounded-lg border cursor-pointer"
              />
              <input
                type="text"
                value={settings.cardBackground}
                onChange={(e) => updateSetting("cardBackground", e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => updateSetting("accentColor", e.target.value)}
                className="h-10 w-12 rounded-lg border cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => updateSetting("accentColor", e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Price Label</label>
            <input
              type="text"
              value={settings.priceLabel}
              onChange={(e) => updateSetting("priceLabel", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-3 border-t">
            {[
              { label: "Show Brand Badge", key: "showBrandBadge" },
              { label: "Show Model", key: "showModel" },
              { label: "Show Key Features", key: "showKeyFeatures" },
              { label: "Show SKU ID", key: "showSkuId" },
              { label: "Show Price Pill", key: "showPricePill" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <span className="text-sm">{toggle.label}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings[toggle.key] || false}
                    onChange={(e) => updateSetting(toggle.key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>

          {/* Brochure Settings */}
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-xs font-bold text-slate-500 uppercase">📄 Brochure / Catalog Settings</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Show Brochure Button</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.showBrochureButton !== false}
                  onChange={(e) => updateSetting("showBrochureButton", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">Brochure Button Text</label>
              <input
                type="text"
                value={settings.brochureButtonText || "Download Brochure"}
                onChange={(e) => updateSetting("brochureButtonText", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Download Brochure"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">Brochure Mode</label>
              <select
                value={settings.brochureMode || "download"}
                onChange={(e) => updateSetting("brochureMode", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm"
              >
                <option value="download">Download Only</option>
                <option value="preview">Preview Only</option>
                <option value="both">Download + Preview</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                {settings.brochureMode === "download" && "Users can only download the brochure file"}
                {settings.brochureMode === "preview" && "Users can only preview the brochure in browser"}
                {settings.brochureMode === "both" && "Users can both preview and download the brochure"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Card Design"}
        </button>
      </div>
    </div>
  );
}