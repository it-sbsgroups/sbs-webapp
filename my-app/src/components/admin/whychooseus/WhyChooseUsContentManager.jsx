// src/components/admin/whychooseus/WhyChooseUsContentManager.jsx
"use client";

import { useState } from "react";
import whyChooseUsData from "@/data/whyChooseUsData";
import { Save } from "lucide-react";

export default function WhyChooseUsContentManager() {
  const [config, setConfig] = useState(whyChooseUsData);

  const updateField = (key, value) => {
    setConfig((prev) => {
      const updated = { ...prev, [key]: value };
      dispatchUpdate(updated);
      return updated;
    });
  };

  const dispatchUpdate = (data) => {
    window.dispatchEvent(new CustomEvent("why-choose-us-admin-update", { detail: { config: data } }));
  };

  const handleSave = () => {
    alert("Content settings saved!");
    console.log("Why Choose Us Content:", config);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Section Content</h2>
        <p className="mt-1 text-sm text-slate-500">Manage the heading, description, and stat block.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Section Tag</label>
          <input
            type="text"
            value={config.sectionTag}
            onChange={(e) => updateField("sectionTag", e.target.value)}
            placeholder="Our Benchmarks"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Why Industries choose SBS Groups"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={config.mainDescription}
            onChange={(e) => updateField("mainDescription", e.target.value)}
            className="w-full rounded-xl border px-4 py-3 resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2 border-t">
          <input
            type="checkbox"
            checked={config.showStatBlock}
            onChange={(e) => updateField("showStatBlock", e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">Show Stat Block</span>
        </div>

        {config.showStatBlock && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Stat Number</label>
              <input
                type="text"
                value={config.statNumber}
                onChange={(e) => updateField("statNumber", e.target.value)}
                placeholder="20+"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Stat Label</label>
              <input
                type="text"
                value={config.statLabel}
                onChange={(e) => updateField("statLabel", e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
          <Save className="h-4 w-4" /> Save Content
        </button>
      </div>
    </div>
  );
}