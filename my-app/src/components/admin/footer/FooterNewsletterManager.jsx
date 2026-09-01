"use client";

import { useState, useEffect } from "react";
import { Save, Mail } from "lucide-react";
import { loadFooter, saveFooterFields } from "@/lib/footerSections";
import toast from "react-hot-toast";

export default function FooterNewsletterManager() {
  const [settings, setSettings] = useState({
    enabled: true,
    title: "Stay Updated",
    description: "Subscribe to our newsletter for latest products and industrial insights.",
    popupDelay: 5000,
    showOnScroll: true,
    scrollPercentage: 40,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await loadFooter();
        if (c?.newsletterSettings) setSettings((p) => ({ ...p, ...c.newsletterSettings }));
      } catch { /* keep defaults */ }
    })();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFooterFields({ newsletterSettings: settings });
      toast.success("Newsletter settings saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Newsletter Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure newsletter subscription popup and form.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Enable/Disable */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Newsletter Popup</h3>
                <p className="text-sm text-slate-500">Enable or disable the newsletter subscription popup.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSetting("enabled", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>

          {/* Content Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">Popup Content</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => updateSetting("title", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => updateSetting("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">Popup Behavior</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Popup Delay (ms)</label>
                <input
                  type="number"
                  value={settings.popupDelay}
                  onChange={(e) => updateSetting("popupDelay", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.showOnScroll}
                  onChange={(e) => updateSetting("showOnScroll", e.target.checked)}
                  className="h-4 w-4"
                />
                <label className="text-sm font-medium">Show on scroll</label>
              </div>
              {settings.showOnScroll && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Scroll Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.scrollPercentage}
                    onChange={(e) => updateSetting("scrollPercentage", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">Preview</h3>
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-sm">{settings.title || "Stay Updated"}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{settings.description}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  disabled
                  className="flex-1 rounded-lg border px-3 py-2 text-xs bg-white"
                />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white">Subscribe</button>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
              {settings.enabled ? "Newsletter popup is enabled." : "Newsletter popup is disabled."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}