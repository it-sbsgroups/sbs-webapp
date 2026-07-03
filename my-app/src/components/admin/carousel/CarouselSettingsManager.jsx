// src/components/admin/carousel/CarouselSettingsManager.jsx
"use client";

import { useState, useEffect } from "react";
import carouselApi from "@/lib/carouselApi";
import { Save, Settings2 } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_SETTINGS = {
  prevButton: true, nextButton: true, bottomDots: true,
  autoplay: true, carouselHeight: "650px", overlayOpacity: 0.55,
};

export default function CarouselSettingsManager() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await carouselApi.getSettings();
        if (s && typeof s === "object") setSettings({ ...DEFAULT_SETTINGS, ...s });
      } catch (e) {
        console.error("carousel getSettings failed:", e);
      }
    })();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      window.dispatchEvent(new CustomEvent("carousel-admin-update", {
        detail: { settings: updated }
      }));
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Send only the persisted fields (drop id/timestamps if present).
      const { prevButton, nextButton, bottomDots, autoplay, carouselHeight, overlayOpacity } = settings;
      await carouselApi.updateSettings({ prevButton, nextButton, bottomDots, autoplay, carouselHeight, overlayOpacity });
      toast.success("Carousel settings saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Carousel Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure global carousel behavior and appearance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* NAVIGATION SETTINGS */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Navigation Controls</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Previous Button</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={settings.prevButton}
                  onChange={(e) => updateSetting("prevButton", e.target.checked)}
                  className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Next Button</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={settings.nextButton}
                  onChange={(e) => updateSetting("nextButton", e.target.checked)}
                  className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Bottom Dots</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={settings.bottomDots}
                  onChange={(e) => updateSetting("bottomDots", e.target.checked)}
                  className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Autoplay</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={settings.autoplay}
                  onChange={(e) => updateSetting("autoplay", e.target.checked)}
                  className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </div>

        {/* APPEARANCE SETTINGS */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Carousel Height</label>
              <select value={settings.carouselHeight}
                onChange={(e) => updateSetting("carouselHeight", e.target.value)}
                className="w-full rounded-xl border px-4 py-3">
                <option value="450px">Small (450px)</option>
                <option value="550px">Medium (550px)</option>
                <option value="650px">Large (650px)</option>
                <option value="750px">Extra Large (750px)</option>
                <option value="100vh">Full Screen</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Overlay Opacity: {settings.overlayOpacity}</label>
              <input type="range" min="0" max="1" step="0.05" value={settings.overlayOpacity}
                onChange={(e) => updateSetting("overlayOpacity", parseFloat(e.target.value))}
                className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}