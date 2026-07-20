// src/components/admin/notifications/NotificationSettingsManager.jsx
"use client";

import { useState, useEffect } from "react";
import notificationsApi from "@/lib/notificationsApi";
import { Save, Zap, CalendarClock, Package, Newspaper } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_SETTINGS = {
  productsMode: "INSTANT",
  productsBatchTime: "18:00",
  newsMode: "INSTANT",
  newsBatchTime: "18:00",
};

// One mode-picker + optional time field, reused identically for Products and News.
function ModeSection({ icon: Icon, title, blurb, mode, batchTime, onModeChange, onTimeChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{blurb}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onModeChange("INSTANT")}
          className={`flex items-start gap-2.5 rounded-xl border-2 p-3.5 text-left transition-all ${
            mode === "INSTANT" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <Zap size={16} className={mode === "INSTANT" ? "text-blue-600 mt-0.5" : "text-slate-400 mt-0.5"} />
          <div>
            <div className="text-sm font-bold text-slate-800">Instant</div>
            <div className="text-xs text-slate-500">Email goes out the moment each item is added</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("BATCH")}
          className={`flex items-start gap-2.5 rounded-xl border-2 p-3.5 text-left transition-all ${
            mode === "BATCH" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <CalendarClock size={16} className={mode === "BATCH" ? "text-blue-600 mt-0.5" : "text-slate-400 mt-0.5"} />
          <div>
            <div className="text-sm font-bold text-slate-800">Daily Digest</div>
            <div className="text-xs text-slate-500">Everything added today goes out together, once</div>
          </div>
        </button>
      </div>

      {mode === "BATCH" && (
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <label className="text-xs font-semibold text-slate-600">Send daily at</label>
          <input
            type="time"
            value={batchTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <span className="text-xs text-slate-400">server local time</span>
        </div>
      )}
    </div>
  );
}

export default function NotificationSettingsManager() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationsApi.getSettings();
        const s = data?.data || data;
        if (s && typeof s === "object") setSettings({ ...DEFAULT_SETTINGS, ...s });
      } catch (e) {
        console.error("Failed to load notification settings:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { productsMode, productsBatchTime, newsMode, newsBatchTime } = settings;
      await notificationsApi.updateSettings({ productsMode, productsBatchTime, newsMode, newsBatchTime });
      toast.success("Notification settings saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <ModeSection
          icon={Package}
          title="Products"
          blurb="New products added by admin"
          mode={settings.productsMode}
          batchTime={settings.productsBatchTime}
          onModeChange={(v) => setSettings((p) => ({ ...p, productsMode: v }))}
          onTimeChange={(v) => setSettings((p) => ({ ...p, productsBatchTime: v }))}
        />
        <ModeSection
          icon={Newspaper}
          title="News"
          blurb="News articles published by admin"
          mode={settings.newsMode}
          batchTime={settings.newsBatchTime}
          onModeChange={(v) => setSettings((p) => ({ ...p, newsMode: v }))}
          onTimeChange={(v) => setSettings((p) => ({ ...p, newsBatchTime: v }))}
        />
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
        In Daily Digest mode, everything added <em>before</em> the send time goes out together in one
        email at that time. Anything added <em>after</em> the send time has already passed for the
        day goes out on the next check (within a minute) rather than waiting until tomorrow.
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-950 px-6 py-3 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-60"
        >
          <Save size={16} /> {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
