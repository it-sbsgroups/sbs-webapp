"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Plus, Trash2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadApi";
import RichTextEditor from "@/components/shared/RichTextEditor";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import toast from "react-hot-toast";

const DEFAULT_DATA = {
  headingPart1: "Leading the Industry with",
  headingPart2: "Innovation",
  description: "<p>SBS GROUPS – a trusted name among the leading Industrial Products Suppliers, is known for delivering excellence, reliability, and a wide range of solutions for diverse industries. We deal in an extensive product portfolio that includes Industrial Safety Equipment, Fire Extinguishers, Road Safety Products, Hand & Power Tools, Mechanical Components, Electrical Supplies, and many others.</p>",
  features: ["Premium Quality Products", "Authorized Network", "24/7 Customer Support", "Best After-Sales Service", "Competitive Pricing", "Fast Delivery Services"],
  imageSrc: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
  ctaText: "Learn More About Us",
  ctaLink: "/about",
};

export default function HomeAboutManager() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    siteConfigApi.getHomeAbout()
      .then((d) => {
        if (d && Object.keys(d).length > 0) {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch((err) => console.warn("Failed to load homeAbout:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setData((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setNewFeature("");
  };

  const removeFeature = (index) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      const url = await uploadImage(file, "home-about");
      updateField("imageSrc", url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error("Upload failed: " + e.message);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveHomeAbout(data);
      toast.success("Home About section saved");
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
        <h2 className="text-2xl font-bold text-slate-900">Home – About Section</h2>
        <p className="mt-1 text-sm text-slate-500">Manage the "Leading the Industry with Innovation" block.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
        {/* Heading Parts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium">Heading Part 1</label>
            <input
              type="text"
              value={data.headingPart1}
              onChange={(e) => updateField("headingPart1", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Heading Part 2 (highlight)</label>
            <input
              type="text"
              value={data.headingPart2}
              onChange={(e) => updateField("headingPart2", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* Description – Rich Text Editor */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Description</label>
          <RichTextEditor
            value={data.description || ""}
            onChange={(html) => updateField("description", html)}
            placeholder="Write a compelling description…"
            uploadFolder="home-about"
          />
        </div>

        {/* Features List */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Features (checkmarks)</label>
          <div className="space-y-2">
            {data.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{feature}</span>
                <button onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature…"
              className="flex-1 rounded-xl border px-4 py-2 text-sm"
            />
            <button onClick={addFeature} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Image</label>
          <div className="flex items-start gap-4">
            {data.imageSrc && (
              <img src={data.imageSrc} alt="About" className="h-32 w-auto rounded-xl border object-cover" />
            )}
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={data.imageSrc}
                onChange={(e) => updateField("imageSrc", e.target.value)}
                placeholder="Image URL"
                className="w-80 rounded-xl border px-4 py-2 text-sm"
              />
              <label className="cursor-pointer text-xs font-bold text-blue-600 flex items-center gap-1">
                <Upload size={14} /> Upload & Compress
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium">CTA Button Text</label>
            <input
              type="text"
              value={data.ctaText}
              onChange={(e) => updateField("ctaText", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">CTA Link</label>
            <input
              type="text"
              value={data.ctaLink}
              onChange={(e) => updateField("ctaLink", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
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