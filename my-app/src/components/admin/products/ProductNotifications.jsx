"use client";

import { useState, useEffect } from "react";
import settingsApi from "@/lib/settingsApi";
import { Save, Bell, Mail, Send, Clock } from "lucide-react";

export default function ProductNotifications() {
  const [settings, setSettings] = useState({
    email: { enabled: false, fromName: "SBS Groups" },
    dailyDigest: { enabled: false, sendAt: "18:00", onlyIfNewProducts: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await settingsApi.getProductSettings();
        const data = response?.data || response;
        if (data?.notificationSettings) {
          setSettings((prev) => ({ ...prev, ...data.notificationSettings }));
        }
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateSetting = (path, value) => {
    setSettings((prev) => {
      const keys = path.split(".");
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateProductSettings({ notificationSettings: settings });
      alert("Notification settings saved!");
    } catch (error) {
      alert("Failed to save: " + error.message);
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
        <h2 className="text-2xl font-bold text-slate-900">Notification Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure automated subscriber notifications.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Mail size={18} className="text-blue-600" /><h3 className="font-semibold">Email Notifications</h3></div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Enable Email</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={settings.email?.enabled || false} onChange={(e) => updateSetting("email.enabled", e.target.checked)} className="peer sr-only" />
              <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">From Name</label>
            <input type="text" value={settings.email?.fromName || ""} onChange={(e) => updateSetting("email.fromName", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
          </div>
        </div>

        {/* Daily Digest */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Clock size={18} className="text-blue-600" /><h3 className="font-semibold">Daily Digest</h3></div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Enable Daily Digest</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={settings.dailyDigest?.enabled || false} onChange={(e) => updateSetting("dailyDigest.enabled", e.target.checked)} className="peer sr-only" />
              <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Send At</label>
            <input type="time" value={settings.dailyDigest?.sendAt || "18:00"} onChange={(e) => updateSetting("dailyDigest.sendAt", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          <Save size={18} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}