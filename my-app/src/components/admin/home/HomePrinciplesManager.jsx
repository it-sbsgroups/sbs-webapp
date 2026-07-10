"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Plus, Trash2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadApi";
import RichTextEditor from "@/components/shared/RichTextEditor";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import toast from "react-hot-toast";

const DEFAULT_DATA = {
  headingPart1: "Quality Product with Prompt",
  headingPart2: "Service is our principle",
  description: "<p>SBS GROUPS is a trusted name among the leading Industrial Product Suppliers, dealing in a wide range of products including Industrial Safety, Fire Extinguishers, Road Safety, Lubrication Equipment, and Industrial Tools.</p><p>Established in 2005 as a family-owned company, we are located in the Power Capital of India – Singrauli, Madhya Pradesh. We began with a mission to serve the growing safety needs of the mining, power, and metal sectors.</p><p>Today, we deliver quality industrial products approved by CE, EN, ANSI, BIS, and DGMS. Within a short span, SBS has become synonymous with Quality and Safety.</p>",
  growItems: ["Our Customers", "Our Principles", "Our Service Providers", "Our Team"],
  footerText: "We strongly believe business grows not just because we are commercially competitive, but because of the experience we leave behind — respecting commitments, fulfilling promises, and creating value beyond transactions.",
  topBadgeImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500",
  mainWarehouseImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600",
};

export default function HomePrinciplesManager() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGrowItem, setNewGrowItem] = useState("");

  useEffect(() => {
    siteConfigApi.getHomePrinciples()
      .then((d) => {
        if (d && Object.keys(d).length > 0) {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch((err) => console.warn("Failed to load homePrinciples:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const addGrowItem = () => {
    const trimmed = newGrowItem.trim();
    if (!trimmed) return;
    setData((prev) => ({ ...prev, growItems: [...prev.growItems, trimmed] }));
    setNewGrowItem("");
  };

  const removeGrowItem = (index) => {
    setData((prev) => ({
      ...prev,
      growItems: prev.growItems.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (key) => async (file) => {
    try {
      const url = await uploadImage(file, "home-principles");
      updateField(key, url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error("Upload failed: " + e.message);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveHomePrinciples(data);
      toast.success("Home Principles section saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
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
        <h2 className="text-2xl font-bold text-slate-900">Home – Principles Section</h2>
        <p className="mt-1 text-sm text-slate-500">Manage the "Quality Product with Prompt Service is our principle" block.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
        {/* Heading Parts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium">Heading Part 1</label>
            <input type="text" value={data.headingPart1} onChange={(e) => updateField("headingPart1", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Heading Part 2 (highlight)</label>
            <input type="text" value={data.headingPart2} onChange={(e) => updateField("headingPart2", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
          </div>
        </div>

        {/* Single Description – Rich Text Editor */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Description</label>
          <RichTextEditor value={data.description || ""} onChange={(html) => updateField("description", html)} placeholder="Write the section description… you can use bold, lists, etc." uploadFolder="home-principles" />
        </div>

        {/* Grow Items */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">"We Grow Together With" items</label>
          <div className="space-y-2">
            {data.growItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{item}</span>
                <button onClick={() => removeGrowItem(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input type="text" value={newGrowItem} onChange={(e) => setNewGrowItem(e.target.value)} placeholder="Add an item…" className="flex-1 rounded-xl border px-4 py-2 text-sm" />
            <button onClick={addGrowItem} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Footer Text (Rich Text) */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Footer Text (emotional message)</label>
          <RichTextEditor value={data.footerText || ""} onChange={(html) => updateField("footerText", html)} placeholder="Footer message…" uploadFolder="home-principles" />
        </div>

        {/* Two Images */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium">Top Badge Image</label>
            <div className="flex flex-col gap-2">
              {data.topBadgeImage && (
                <img src={data.topBadgeImage} alt="Badge" className="h-24 w-auto rounded-xl border object-cover" />
              )}
              <input type="text" value={data.topBadgeImage} onChange={(e) => updateField("topBadgeImage", e.target.value)} placeholder="Image URL" className="w-full rounded-xl border px-4 py-2 text-sm" />
              <label className="cursor-pointer text-xs font-bold text-blue-600 flex items-center gap-1">
                <Upload size={14} /> Upload & Compress
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("topBadgeImage")(file);
                    e.target.value = "";
                  }} />
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Main Warehouse Image</label>
            <div className="flex flex-col gap-2">
              {data.mainWarehouseImage && (
                <img src={data.mainWarehouseImage} alt="Warehouse" className="h-24 w-auto rounded-xl border object-cover" />
              )}
              <input type="text" value={data.mainWarehouseImage} onChange={(e) => updateField("mainWarehouseImage", e.target.value)} placeholder="Image URL" className="w-full rounded-xl border px-4 py-2 text-sm" />
              <label className="cursor-pointer text-xs font-bold text-blue-600 flex items-center gap-1">
                <Upload size={14} /> Upload & Compress
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("mainWarehouseImage")(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          <Save size={18} /> {saving ? "Saving…" : "Save Section"}
        </button>
      </div>
    </div>
  );
}