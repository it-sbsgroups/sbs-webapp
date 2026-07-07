"use client";

import { useState, useEffect } from "react";
import settingsApi from "@/lib/settingsApi";
import notificationsApi from "@/lib/notificationsApi";
import productsApi from "@/lib/productsApi";
import { Save, Bell, Mail, Send, Clock, X, CalendarClock } from "lucide-react";

export default function ProductNotifications() {
  const [settings, setSettings] = useState({
    email: { enabled: false, fromName: "SBS Groups" },
    dailyDigest: { enabled: false, sendAt: "18:00", onlyIfNewProducts: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---- Manual send / scheduler state ----
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, productsRes, scheduledRes] = await Promise.all([
          settingsApi.getProductSettings(),
          productsApi.getAll({ pageSize: 200 }),
          notificationsApi.listScheduled("PRODUCT"),
        ]);
        const data = settingsRes?.data || settingsRes;
        if (data?.notificationSettings) {
          setSettings((prev) => ({ ...prev, ...data.notificationSettings }));
        }
        setProducts(productsRes?.data || []);
        setScheduled(Array.isArray(scheduledRes) ? scheduledRes : scheduledRes?.data || []);
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

  const toggleProduct = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const refreshScheduled = async () => {
    const res = await notificationsApi.listScheduled("PRODUCT");
    setScheduled(Array.isArray(res) ? res : res?.data || []);
  };

  const handleSendNow = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);
    setNotice("");
    try {
      const res = await notificationsApi.sendProductsNow(selectedIds);
      setNotice(`✅ Sent to ${res.sent || 0} subscriber(s) individually${res.failed ? `, ${res.failed} failed` : ""}.`);
      setSelectedIds([]);
    } catch (error) {
      setNotice("❌ Failed to send: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedIds.length === 0 || !scheduleAt) return;
    setScheduling(true);
    setNotice("");
    try {
      await notificationsApi.schedule({
        type: "PRODUCT",
        targetIds: selectedIds,
        scheduledAt: new Date(scheduleAt).toISOString(),
      });
      setNotice("✅ Notification scheduled.");
      setSelectedIds([]);
      setScheduleAt("");
      await refreshScheduled();
    } catch (error) {
      setNotice("❌ Failed to schedule: " + error.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelScheduled = async (id) => {
    try {
      await notificationsApi.cancelScheduled(id);
      await refreshScheduled();
    } catch (error) {
      alert("Failed to cancel: " + error.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    !productSearch.trim() || p.name?.toLowerCase().includes(productSearch.trim().toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.trim().toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Notification Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Send product alerts manually, or schedule them for later — every subscriber gets their own individual email.</p>
      </div>

      {notice && <div className="rounded-xl border bg-slate-50 px-4 py-2.5 text-sm font-medium">{notice}</div>}

      {/* ---- Manual send + scheduler ---- */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2"><Send size={18} className="text-blue-600" /><h3 className="font-semibold">Send / Schedule a Product Notification</h3></div>

        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
        />

        <div className="max-h-56 overflow-y-auto rounded-xl border divide-y">
          {filteredProducts.map((p) => {
            const on = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${on ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <span className={`h-4 w-4 rounded border-2 flex items-center justify-center text-[9px] font-black shrink-0 ${on ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"}`}>
                  {on ? "✓" : ""}
                </span>
                <span className="truncate">{p.name}</span>
                <span className="ml-auto text-xs text-slate-400 shrink-0">{p.sku}</span>
              </button>
            );
          })}
          {filteredProducts.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-400">No products found.</p>}
        </div>

        <p className="text-xs text-slate-500">{selectedIds.length} product(s) selected</p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSendNow}
            disabled={sending || selectedIds.length === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={16} /> {sending ? "Sending..." : "Send Now"}
          </button>

          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="rounded-xl border px-3 py-2.5 text-sm"
            />
            <button
              onClick={handleSchedule}
              disabled={scheduling || selectedIds.length === 0 || !scheduleAt}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <CalendarClock size={16} /> {scheduling ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </div>
      </div>

      {/* ---- Pending / recent scheduled notifications ---- */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2"><Clock size={18} className="text-blue-600" /><h3 className="font-semibold">Scheduled Notifications</h3></div>
        {scheduled.length === 0 && <p className="text-sm text-slate-400">Nothing scheduled yet.</p>}
        <div className="space-y-2">
          {scheduled.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm">
              <div>
                <span className="font-semibold">{Array.isArray(s.targetIds) ? s.targetIds.length : 0} product(s)</span>
                <span className="text-slate-400"> — {new Date(s.scheduledAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  s.status === "sent" ? "bg-emerald-50 text-emerald-700" :
                  s.status === "failed" ? "bg-rose-50 text-rose-700" :
                  s.status === "cancelled" ? "bg-slate-100 text-slate-500" :
                  "bg-amber-50 text-amber-700"
                }`}>{s.status}</span>
                {s.status === "pending" && (
                  <button onClick={() => handleCancelScheduled(s.id)} className="text-slate-400 hover:text-rose-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
