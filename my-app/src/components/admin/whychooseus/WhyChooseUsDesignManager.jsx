// src/components/admin/whychooseus/WhyChooseUsDesignManager.jsx
"use client";

import { useState } from "react";
import whyChooseUsData from "@/data/whyChooseUsData";
import { Save, Palette } from "lucide-react";

export default function WhyChooseUsDesignManager() {
  const [config, setConfig] = useState(whyChooseUsData);

  const updateDesign = (key, value) => {
    setConfig((prev) => {
      const updated = { ...prev, design: { ...prev.design, [key]: value } };
      window.dispatchEvent(new CustomEvent("why-choose-us-admin-update", { detail: { config: updated } }));
      return updated;
    });
  };

  const handleSave = () => {
    alert("Design settings saved!");
    console.log("Design:", config.design);
  };

  const d = config.design || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Design Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Customize colors, layout, and appearance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Colors */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Colors</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Background Color", key: "backgroundColor" },
              { label: "Card Background", key: "cardBackgroundColor" },
              { label: "Primary/Accent Color", key: "primaryColor" },
              { label: "Title Color", key: "titleColor" },
              { label: "Icon Default BG", key: "iconDefaultBg" },
              { label: "Icon Default Color", key: "iconDefaultColor" },
              { label: "Icon Hover BG", key: "iconHoverBg" },
              { label: "Icon Hover Color", key: "iconHoverColor" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={d[item.key] || "#ffffff"}
                  onChange={(e) => updateDesign(item.key, e.target.value)}
                  className="h-10 w-14 rounded-lg border cursor-pointer"
                />
                <input
                  type="text"
                  value={d[item.key] || ""}
                  onChange={(e) => updateDesign(item.key, e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <span className="text-xs text-slate-500 w-32">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold">Layout</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Cards Per Row</label>
              <div className="flex gap-3">
                {[2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateDesign("cardsPerRow", num)}
                    className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all ${
                      d.cardsPerRow === num ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200"
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Font Family</label>
              <input
                type="text"
                value={d.fontFamily || "Inter, sans-serif"}
                onChange={(e) => updateDesign("fontFamily", e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={d.cardHoverShadow !== false}
                onChange={(e) => updateDesign("cardHoverShadow", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Enable Card Hover Shadow</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
          <Save className="h-4 w-4" /> Save Design
        </button>
      </div>
    </div>
  );
}