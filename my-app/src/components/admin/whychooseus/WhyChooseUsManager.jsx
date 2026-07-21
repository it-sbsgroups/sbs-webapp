"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Save } from "lucide-react";

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:4000/api`
      : "http://localhost:4000/api")
  );
}

async function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("sbs_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Talks to the existing dedicated /why-choose-us backend endpoint (its own
// module/table — kept as-is per the audit). This component is what actually
// renders under the Site Config → "Why Choose Us" tab, so content is now
// manageable from the central Site Config panel as required, without
// touching the working backend or breaking the legacy /admin/whychooseus
// route (which now just renders this same component).
export default function WhyChooseUsManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase()}/why-choose-us`);
        const data = await res.json();
        setTitle(data.title || "");
        setDescription(data.description || "");
        setKeys((data.keys || []).map((k) => ({ icon: k.icon, title: k.title, description: k.description })));
      } catch {
        toast.error("Failed to load Why Choose Us content");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addKey = () => setKeys((k) => [...k, { icon: "Shield", title: "", description: "" }]);
  const updateKey = (i, field, value) =>
    setKeys((k) => k.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  const removeKey = (i) => setKeys((k) => k.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${apiBase()}/why-choose-us`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ title, description, keys }),
      });
      if (!res.ok) throw new Error("Save failed");

      // Live-preview the change on any open public page immediately.
      window.dispatchEvent(new CustomEvent("why-choose-us-admin-update", {
        detail: { config: { design: {}, title, mainDescription: description,
          stats: keys.map((k, i) => ({ id: i, title: k.title, description: k.description, iconName: k.icon, show: true })) } },
      }));

      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Why Choose Us</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Shown on the homepage — title, description, and up to several highlight cards.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Section Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full text-sm px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500 resize-none" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">Highlight Cards</h2>
          <button onClick={addKey} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
            <Plus size={14} /> Add Card
          </button>
        </div>

        {keys.length === 0 && <p className="text-xs text-slate-400 italic">No cards yet — click "Add Card".</p>}

        {keys.map((k, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-2 relative">
            <button onClick={() => removeKey(i)} className="absolute top-3 right-3 text-slate-300 hover:text-red-600">
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-3 gap-2">
              <input value={k.icon} onChange={(e) => updateKey(i, "icon", e.target.value)} placeholder="Icon (lucide name, e.g. Shield)"
                className="col-span-1 text-xs px-3 py-2 rounded-lg border bg-slate-50 focus:outline-none focus:border-blue-500" />
              <input value={k.title} onChange={(e) => updateKey(i, "title", e.target.value)} placeholder="Card title"
                className="col-span-2 text-xs px-3 py-2 rounded-lg border bg-slate-50 focus:outline-none focus:border-blue-500" />
            </div>
            <textarea value={k.description} onChange={(e) => updateKey(i, "description", e.target.value)} rows={2} placeholder="Short description"
              className="w-full text-xs px-3 py-2 rounded-lg border bg-slate-50 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
