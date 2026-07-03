"use client";

import { useState, useEffect } from "react";
import settingsApi from "@/lib/settingsApi";
import { Save, Settings2, RefreshCw, Globe } from "lucide-react";

export default function ProductSettings({ autoRefresh, setAutoRefresh }) {
  const [settings, setSettings] = useState({
    showSearch: true,
    showBrandFilter: true,
    showSidebar: true,
    showPagination: true,
    showQuoteBucketButton: true,
    autoRefreshSeconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getProductSettings();
        const data = response?.data || response;
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
          if (data.autoRefreshSeconds !== undefined) {
            setAutoRefresh(data.autoRefreshSeconds);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateToggle = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateProductSettings({
        ...settings,
        autoRefreshSeconds: autoRefresh,
      });
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save: " + error.message);
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
        <h2 className="text-2xl font-bold text-slate-900">Global Product Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure global behavior for the products catalog.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Feature Toggles */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-blue-600" />
            <h3 className="font-semibold">Feature Toggles</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Show Search Bar", key: "showSearch" },
              { label: "Show Brand Filter", key: "showBrandFilter" },
              { label: "Show Category Sidebar", key: "showSidebar" },
              { label: "Show Pagination", key: "showPagination" },
              { label: "Show Quote Bucket Button", key: "showQuoteBucketButton" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <span className="text-sm">{toggle.label}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings[toggle.key] || false}
                    onChange={(e) => updateToggle(toggle.key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Refresh */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-blue-600" />
            <h3 className="font-semibold">Auto Refresh</h3>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Auto Refresh Interval: {autoRefresh}s
            </label>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={autoRefresh}
              onChange={(e) => setAutoRefresh(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Off</span>
              <span>30s</span>
              <span>60s</span>
              <span>120s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          <Save size={18} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}