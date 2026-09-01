// src/components/admin/products/RfqApiKeys.jsx
"use client";

import { useState, useEffect } from "react";
import rfqApi from "@/lib/rfqApi";
import { Key, Plus, Trash2, Copy, Eye, EyeOff, RefreshCw, X } from "lucide-react";

const STORAGE_KEY = "sbs_admin_rfq_apikeys_state";

export default function RfqApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  // Restore from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.showCreate) setShowCreate(parsed.showCreate);
        if (parsed.newName) setNewName(parsed.newName);
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ showCreate, newName }));
  }, [showCreate, newName]);

  const fetchKeys = async () => {
    try {
      const response = await rfqApi.getApiKeys();
      const data = response?.data || response;
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const toggleKeyVisibility = (id) => setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  const copyKey = (key) => { navigator.clipboard.writeText(key); alert("Copied!"); };

  const deleteKey = async (id) => {
    if (!confirm("Delete this API key?")) return;
    try {
      await rfqApi.deleteApiKey(id);
      await fetchKeys();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  const toggleActive = async (id) => {
    try {
      await rfqApi.toggleApiKey(id);
      await fetchKeys();
    } catch (error) {
      alert("Failed to toggle: " + error.message);
    }
  };

  const createKey = async () => {
    if (!newName.trim()) return alert("Enter a name");
    try {
      await rfqApi.createApiKey({ name: newName.trim(), permissions: ["read", "write"] });
      setNewName("");
      setShowCreate(false);
      sessionStorage.removeItem(STORAGE_KEY);
      await fetchKeys();
    } catch (error) {
      alert("Failed to create: " + error.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">API Key Manager</h2>
          <p className="mt-1 text-sm text-slate-500">{apiKeys.length} key(s)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={16} /> Generate Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey?.id} className={`rounded-2xl border p-5 ${apiKey?.isActive ? "bg-white" : "bg-red-50/30 border-red-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${apiKey?.isActive ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">{String(apiKey?.name || "Unknown")}</h4>
                  <p className="text-xs text-slate-400">Created: {String(apiKey?.createdAt ? new Date(apiKey.createdAt).toLocaleDateString() : "—")}</p>
                </div>
                <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${apiKey?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {apiKey?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(apiKey?.id)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${apiKey?.isActive ? "border border-red-200 text-red-600" : "border border-green-200 text-green-600"}`}>
                  {apiKey?.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => deleteKey(apiKey?.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl bg-slate-50 border px-4 py-2.5">
                <code className="text-xs font-mono text-slate-600">
                  {showKey[apiKey?.id] ? apiKey?.key : String(apiKey?.key || "").substring(0, 20) + "•".repeat(40)}
                </code>
              </div>
              <button onClick={() => toggleKeyVisibility(apiKey?.id)} className="rounded-xl border p-2.5 hover:bg-slate-50">
                {showKey[apiKey?.id] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => copyKey(apiKey?.key)} className="rounded-xl border p-2.5 hover:bg-slate-50">
                <Copy size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-bold">Generate API Key</h3>
              <button onClick={() => { setShowCreate(false); setNewName(""); sessionStorage.removeItem(STORAGE_KEY); }} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Key Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. ERP Integration"
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button onClick={() => { setShowCreate(false); setNewName(""); sessionStorage.removeItem(STORAGE_KEY); }} className="rounded-xl border px-5 py-3 text-sm">Cancel</button>
              <button onClick={createKey} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">Generate Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}