"use client";

import { useState, useEffect } from "react";
import { Save, Palette } from "lucide-react";
import { loadFooter, saveFooterFields } from "@/lib/footerSections";
import toast from "react-hot-toast";

export default function FooterStylingManager() {
  const [styling, setStyling] = useState({
    backgroundColor: "#030712",
    textColor: "#94A3B8",
    accentColor: "#A3E635",
    borderColor: "rgba(255,255,255,0.02)",
    fontFamily: "mono",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await loadFooter();
        if (c?.styling) setStyling((p) => ({ ...p, ...c.styling }));
      } catch { /* keep defaults */ }
    })();
  }, []);

  const updateStyling = (key, value) => {
    setStyling((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFooterFields({ styling });
      toast.success("Footer styling saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const fontOptions = [
    { value: "mono", label: "Monospace" },
    { value: "sans", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Footer Styling</h2>
        <p className="mt-1 text-sm text-slate-500">Customize footer colors and appearance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Palette className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Color Settings</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Background Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={styling.backgroundColor}
                    onChange={(e) => updateStyling("backgroundColor", e.target.value)}
                    className="h-12 w-16 rounded-xl border"
                  />
                  <input
                    type="text"
                    value={styling.backgroundColor}
                    onChange={(e) => updateStyling("backgroundColor", e.target.value)}
                    className="flex-1 rounded-xl border px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Text Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={styling.textColor}
                    onChange={(e) => updateStyling("textColor", e.target.value)}
                    className="h-12 w-16 rounded-xl border"
                  />
                  <input
                    type="text"
                    value={styling.textColor}
                    onChange={(e) => updateStyling("textColor", e.target.value)}
                    className="flex-1 rounded-xl border px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Accent Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={styling.accentColor}
                    onChange={(e) => updateStyling("accentColor", e.target.value)}
                    className="h-12 w-16 rounded-xl border"
                  />
                  <input
                    type="text"
                    value={styling.accentColor}
                    onChange={(e) => updateStyling("accentColor", e.target.value)}
                    className="flex-1 rounded-xl border px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Border Color</label>
                <input
                  type="text"
                  value={styling.borderColor}
                  onChange={(e) => updateStyling("borderColor", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Font Family</label>
              <select
                value={styling.fontFamily}
                onChange={(e) => updateStyling("fontFamily", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              <Save className="h-4 w-4" /> Save Styling
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">Live Preview</h3>
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: styling.backgroundColor,
                color: styling.textColor,
                borderColor: styling.borderColor,
                fontFamily: styling.fontFamily === "mono" ? "monospace" : styling.fontFamily,
              }}
            >
              <p className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
                Company<span style={{ color: styling.accentColor }}>.Brand</span>
              </p>
              <p className="mt-2 text-xs">Sample footer text content</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded px-2 py-1 text-xs" style={{ backgroundColor: styling.accentColor, color: "#000" }}>
                  Accent
                </span>
                <span className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${styling.borderColor}` }}>
                  Border
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}