// src/components/admin/products/RfqIntegrationSettings.jsx
"use client";

import { useState, useEffect } from "react";
import rfqIntegrationsApi from "@/lib/rfqIntegrationsApi";
import { Save, Globe, Sheet, ShieldCheck, Play } from "lucide-react";
import toast from "react-hot-toast";

const STORAGE_KEY = "sbs_admin_rfq_integration_state";

// Default settings – all fields are strings, not null
const defaultSettings = {
  externalApiEnabled: false,
  externalApiUrl: "",
  externalApiKey: "",
  externalApiSecret: "",
  sheetEnabled: false,
  sheetId: "",
  sheetTabName: "RFQs",
  googleServiceAccountJson: "",
  inboundWebhookEnabled: false,
  inboundWebhookSecret: "",
};

export default function RfqIntegrationSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await rfqIntegrationsApi.getSettings();
        const data = res?.data || res;
        // Merge with defaults, ensuring no null values
        const loaded = { ...defaultSettings, ...data };
        // Ensure every string field is at least an empty string
        Object.keys(loaded).forEach(key => {
          if (loaded[key] === null || loaded[key] === undefined) {
            loaded[key] = "";
          }
        });
        // Load draft from sessionStorage (client only)
        const draft = sessionStorage.getItem(STORAGE_KEY);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            // Merge draft, also ensure no nulls
            Object.keys(parsed).forEach(key => {
              if (parsed[key] === null || parsed[key] === undefined) {
                parsed[key] = "";
              }
            });
            Object.assign(loaded, parsed);
          } catch {}
        }
        setSettings(loaded);
      } catch (error) {
        console.error("Failed to load RFQ integration settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save draft to sessionStorage on every change
  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loading]);

  const update = (key, value) => {
    // Ensure we never set null – convert to empty string for string fields
    if (typeof value === "string" && value === null) value = "";
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rfqIntegrationsApi.updateSettings(settings);
      sessionStorage.removeItem(STORAGE_KEY);
      toast.success("RFQ integration settings saved!");
    } catch (error) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await rfqIntegrationsApi.test();
      if (res.success) {
        toast.success(`✅ ${res.message}`);
      } else {
        toast.error(`❌ ${res.message}`);
      }
    } catch (error) {
      toast.error("Test request failed: " + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSyncSheet = async () => {
    setSyncing(true);
    try {
      const res = await rfqIntegrationsApi.syncSheet();
      if (res.success) {
        toast.success(`✅ ${res.message}`);
      } else {
        toast.error(`❌ ${res.message}`);
      }
    } catch (error) {
      toast.error("Sync failed: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
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
        <div className="flex items-center gap-4">
          <button
            onClick={handleTest}
            disabled={testing || !settings.externalApiEnabled || !settings.externalApiUrl}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? <span className="animate-spin">⏳</span> : <Play size={16} />}
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <span className="text-xs text-slate-400">Sends a test payload to the configured endpoint</span>
        </div>
      </div>

      {/* Google Sheet */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        {/* ... same as before ... */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Sheet size={18} className="text-emerald-600" /><h3 className="font-semibold">Live Push to Google Sheet</h3></div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={settings.sheetEnabled} onChange={(e) => update("sheetEnabled", e.target.checked)} className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Every new RFQ is appended here automatically. This is strictly one-way: nothing here ever reads the
          sheet's data back in, so edits made directly in the sheet can never change your website's data.
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
        <div className="flex items-center gap-4">
          <button
            onClick={handleSyncSheet}
            disabled={syncing || !settings.sheetEnabled || !settings.sheetId || !settings.googleServiceAccountJson}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {syncing ? <span className="animate-spin">⏳</span> : <Sheet size={16} />}
            {syncing ? "Syncing..." : "Sync All RFQs to Sheet Now"}
          </button>
          <span className="text-xs text-slate-400">
            One-time backfill — writes every RFQ ever submitted into the sheet, so it's fully up to date the moment
            it's opened. Safe to click again anytime; it never creates duplicates.
          </span>
        </div>
      </div>

      {/* Inbound Webhook */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-600" /><h3 className="font-semibold">Inbound Webhook (Status Updates)</h3></div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={settings.inboundWebhookEnabled} onChange={(e) => update("inboundWebhookEnabled", e.target.checked)} className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Allow external systems to update RFQ status and add remarks via a webhook.
          The external system must send a POST request to <code className="bg-slate-100 px-1 rounded">/api/rfq/integrations/webhook</code> with an <code className="bg-slate-100 px-1 rounded">x-api-key</code> header.
        </p>
        <div>
          <label className="mb-1.5 block text-xs font-medium">Webhook Secret (API Key)</label>
          <input
            type="password"
            value={settings.inboundWebhookSecret || ""}
            onChange={(e) => update("inboundWebhookSecret", e.target.value)}
            placeholder="Generate a strong secret and share it with the external system"
            className="w-full rounded-xl border px-4 py-3 text-sm font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            This secret must be sent as the <code className="bg-slate-100 px-1 rounded">x-api-key</code> header in webhook calls.
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