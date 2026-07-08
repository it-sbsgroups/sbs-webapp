// src/components/admin/products/RfqIntegrationSettings.jsx
"use client";

import { useState, useEffect } from "react";
import rfqIntegrationsApi from "@/lib/rfqIntegrationsApi";
import { Save, Globe, Sheet, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "sbs_admin_rfq_integration_state";

export default function RfqIntegrationSettings() {
  const defaultSettings = {
    externalApiEnabled: false,
    externalApiUrl: "",
    externalApiKey: "",
    externalApiSecret: "",
    sheetEnabled: false,
    sheetId: "",
    sheetTabName: "RFQs",
    googleServiceAccountJson: "",
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await rfqIntegrationsApi.getSettings();
        const data = res?.data || res;
        let loaded = { ...defaultSettings };
        if (data) loaded = { ...loaded, ...data };
        // Restore draft
        const draft = sessionStorage.getItem(STORAGE_KEY);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            loaded = { ...loaded, ...parsed };
          } catch {}
        }
        setSettings(loaded);
      } catch (error) {
        console.error("Failed to load RFQ integration settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loading]);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await rfqIntegrationsApi.updateSettings(settings);
      sessionStorage.removeItem(STORAGE_KEY);
      alert("RFQ integration settings saved!");
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
        <h2 className="text-2xl font-bold text-slate-900">RFQ Outbound Integrations</h2>
        <p className="mt-1 text-sm text-slate-500 flex items-start gap-2">
          <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
          One-way only: every new RFQ is pushed out here. Nothing on this page ever reads data back in,
          so edits made in the external system or the sheet can never change your project's data.
        </p>
      </div>

      {/* External API */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Globe size={18} className="text-blue-600" /><h3 className="font-semibold">Forward to External API</h3></div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={settings.externalApiEnabled} onChange={(e) => update("externalApiEnabled", e.target.checked)} className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Every new RFQ (name, email, mobile, company, address, product, model, quantity) is POSTed here as JSON,
          with your key/secret sent as headers.
        </p>
        <div>
          <label className="mb-1.5 block text-xs font-medium">API Endpoint URL</label>
          <input type="url" value={settings.externalApiUrl} onChange={(e) => update("externalApiUrl", e.target.value)}
            placeholder="https://partner.example.com/api/rfq-intake"
            className="w-full rounded-xl border px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium">API Key</label>
            <input type="text" value={settings.externalApiKey} onChange={(e) => update("externalApiKey", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm font-mono" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">API Secret</label>
            <input type="password" value={settings.externalApiSecret} onChange={(e) => update("externalApiSecret", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm font-mono" />
          </div>
        </div>
      </div>

      {/* Google Sheet */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Sheet size={18} className="text-emerald-600" /><h3 className="font-semibold">Live Push to Google Sheet</h3></div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={settings.sheetEnabled} onChange={(e) => update("sheetEnabled", e.target.checked)} className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Every new RFQ is appended as a new row to your private Google Sheet, live, as soon as it's submitted.
          Share the sheet with the service account's email (below) as an <b>Editor</b> so it's allowed to write.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium">Sheet ID</label>
            <input type="text" value={settings.sheetId} onChange={(e) => update("sheetId", e.target.value)}
              placeholder="from the sheet's URL: /d/&lt;SHEET_ID&gt;/edit"
              className="w-full rounded-xl border px-4 py-3 text-sm font-mono" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Tab Name</label>
            <input type="text" value={settings.sheetTabName} onChange={(e) => update("sheetTabName", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium">Google Service Account JSON key</label>
          <textarea rows={5} value={settings.googleServiceAccountJson} onChange={(e) => update("googleServiceAccountJson", e.target.value)}
            placeholder='Paste the full service-account JSON key here (from Google Cloud Console → IAM → Service Accounts → Keys)'
            className="w-full rounded-xl border px-4 py-3 text-xs font-mono" />
          <p className="mt-1 text-[11px] text-slate-400">
            Stored on the server only — never shown to public visitors. Rows are appended in this order:
            RFQ ID, Date, Name, Email, Mobile, Company, Address, Product, Model, Quantity, Remarks.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          <Save size={18} /> {saving ? "Saving..." : "Save Integration Settings"}
        </button>
      </div>
    </div>
  );
}