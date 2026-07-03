"use client";

import { useState, useEffect } from "react";
import settingsApi from "@/lib/settingsApi";
import { Save, Eye, Palette, Image, List, Plus, Trash2, X } from "lucide-react";

export default function ProductDetailDesigner() {
  const [settings, setSettings] = useState({
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
    ads: { enabled: false, placements: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ad form
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAdIndex, setEditingAdIndex] = useState(null);
  const [adForm, setAdForm] = useState({ title: "", image: "", productIds: "", categoryId: "", ctaText: "Grab Offer", ctaLink: "/products", active: true });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await settingsApi.getProductSettings();
        const data = response?.data || response;
        if (data?.detailSettings) {
          setSettings((prev) => ({ ...prev, ...data.detailSettings }));
        }
      } catch (error) {
        console.error("Failed to load detail settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateProductSettings({ detailSettings: settings });
      alert("Detail page settings saved!");
    } catch (error) {
      alert("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Ad CRUD
  const resetAdForm = () => { setAdForm({ title: "", image: "", productIds: "", categoryId: "", ctaText: "Grab Offer", ctaLink: "/products", active: true }); setEditingAdIndex(null); setShowAdForm(false); };

  const handleAddOrUpdateAd = () => {
    if (!adForm.title.trim()) return alert("Enter a title");
    const newPlacement = {
      id: editingAdIndex !== null ? settings.ads.placements[editingAdIndex]?.id : `AD-${Date.now()}`,
      title: adForm.title,
      image: adForm.image,
      productIds: adForm.productIds ? adForm.productIds.split(",").map((s) => s.trim()).filter(Boolean) : [],
      categoryId: adForm.categoryId,
      ctaText: adForm.ctaText,
      ctaLink: adForm.ctaLink,
      active: adForm.active,
    };
    const placements = [...(settings.ads?.placements || [])];
    if (editingAdIndex !== null) placements[editingAdIndex] = newPlacement;
    else placements.push(newPlacement);
    updateSetting("ads", { ...settings.ads, placements });
    resetAdForm();
  };

  const handleEditAd = (index) => {
    const p = settings.ads?.placements?.[index];
    if (!p) return;
    setAdForm({ title: p.title || "", image: p.image || "", productIds: (p.productIds || []).join(", "), categoryId: p.categoryId || "", ctaText: p.ctaText || "Grab Offer", ctaLink: p.ctaLink || "/products", active: p.active !== false });
    setEditingAdIndex(index);
    setShowAdForm(true);
  };

  const handleDeleteAd = (index) => {
    const placements = settings.ads?.placements?.filter((_, i) => i !== index) || [];
    updateSetting("ads", { ...settings.ads, placements });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  const placements = settings.ads?.placements || [];

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

        {/* Ads */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Image size={18} className="text-blue-600" /><h3 className="font-semibold">Ads ({placements.length})</h3></div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm">Enable Ads</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={settings.ads?.enabled || false} onChange={(e) => updateSetting("ads", { ...settings.ads, enabled: e.target.checked })} className="peer sr-only" />
              <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
            </label>
          </div>

          {placements.map((p, i) => (
            <div key={p?.id || i} className="flex items-center justify-between rounded-xl border p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{String(p?.title || "Untitled")}</p>
                <p className="text-[10px] text-slate-400">{p?.active ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEditAd(i)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50">✏️</button>
                <button onClick={() => handleDeleteAd(i)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}

          {showAdForm ? (
            <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-4 space-y-3">
              <input type="text" value={adForm.title} onChange={(e) => setAdForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ad Title" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input type="text" value={adForm.image} onChange={(e) => setAdForm((p) => ({ ...p, image: e.target.value }))} placeholder="Image URL" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <input type="text" value={adForm.ctaText} onChange={(e) => setAdForm((p) => ({ ...p, ctaText: e.target.value }))} placeholder="CTA Text" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <input type="text" value={adForm.ctaLink} onChange={(e) => setAdForm((p) => ({ ...p, ctaLink: e.target.value }))} placeholder="CTA Link" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddOrUpdateAd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">{editingAdIndex !== null ? "Update" : "Add"}</button>
                <button onClick={resetAdForm} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdForm(true)} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-3 text-sm text-slate-500 hover:border-blue-400 w-full justify-center">
              <Plus size={16} /> Add Ad
            </button>
          )}
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