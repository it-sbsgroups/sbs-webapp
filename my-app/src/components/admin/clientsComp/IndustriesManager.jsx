"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import toast from "react-hot-toast";

const DEFAULT_DATA = {
  headingPart1: "Industries",
  headingPart2: "We Serve",
  description: "<p>Our solutions span across diverse industries, helping businesses of all sizes achieve their goals</p>",
  features: ["Power Plants & Utilities", "Mining & Minerals", "Metals & Cement", "Manufacturing & Industrial Plants", "EPC & Construction Contractors", "Transportation & Material Handling", "Government & Public Sector Units", "Warehousing & Logistics Hubs", "OEMs, Traders & Channel Partners"],
};

export default function IndustriesManager() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    siteConfigApi.getIndustriesManager()
      .then((d) => {
        if (d && Object.keys(d).length > 0) {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch((err) => console.warn("Failed to load IndustriesManager:", err))
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

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveIndustriesManager(data);
      toast.success("Contact Industries Manager Content saved");
    } catch (e) {
      toast.error(e.message || "failed to save industries manager content");
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
        <h2 className="text-2xl font-bold text-slate-900">Contact Us – Industries Serve Section</h2>
        <p className="mt-1 text-sm text-slate-500">Manage the "Industry we serve in" block.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
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

        {/* Description – Rich Text Editor */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Description</label>
          <RichTextEditor value={data.description || ""} onChange={(html) => updateField("description", html)} placeholder="Write a compelling description…" uploadFolder="contact-industry" />
        </div>

        {/* Features List */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">Features (checkmarks)</label>
          <div className="space-y-2">
            {data.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{feature}</span>
                <button onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add a feature…" className="flex-1 rounded-xl border px-4 py-2 text-sm" />
            <button onClick={addFeature} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"><Plus size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"><Save size={18} /> {saving ? "Saving…" : "Save Section"}</button>
      </div>
    </div>
  );
}