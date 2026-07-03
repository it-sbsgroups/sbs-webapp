"use client";

import { useState, useEffect, useCallback } from "react";
import clientsApi from "@/lib/clientsApi";

export default function AdminClientsManagementDashboard() {
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "", industry: "Mining & Heavy Infrastructure",
    servingSince: "2026", logo: "🏭", briefDescription: "",
    name: "", designation: "", url: "",
    contactPhone: "", contactEmail: "",
    linkedin: "", instagram: "", twitter: "",
    galleryText: "",
    reviews: [],
  });

  const BLANK_FORM = {
    companyName: "", industry: "Mining & Heavy Infrastructure",
    servingSince: "2026", logo: "🏭", briefDescription: "",
    name: "", designation: "", url: "",
    contactPhone: "", contactEmail: "",
    linkedin: "", instagram: "", twitter: "",
    galleryText: "",
    reviews: [],
  };

  const yearsLabel = (since) => {
    const y = Number(since);
    if (!y) return "—";
    const n = Math.max(0, new Date().getFullYear() - y);
    return `${n} Year${n === 1 ? "" : "s"}`;
  };
  const toRow = (c) => ({
    id: c.id,
    companyName: c.companyName,
    slug: c.slug,
    industry: c.industry || "",
    servingSince: c.servingSince || "",
    logo: c.logo || "🏭",
    briefDescription: c.details || "",
    totalYears: yearsLabel(c.servingSince),
    // carried through so the edit form can repopulate them
    name: c.name || "",
    designation: c.designation || "",
    url: c.url || "",
    contact: c.contact || {},
    social: c.social || {},
    gallery: Array.isArray(c.gallery) ? c.gallery : [],
    reviews: Array.isArray(c.reviews) ? c.reviews : [],
  });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await clientsApi.getAll();
    setClientsList(data.map(toRow));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerCreateState = () => {
    setEditingId(null);
    setFormData(BLANK_FORM);
    setShowModal(true);
  };

  const triggerUpdateState = (client) => {
    setEditingId(client.id);
    setFormData({
      companyName: client.companyName,
      industry: client.industry || "Mining & Heavy Infrastructure",
      servingSince: client.servingSince || "",
      logo: client.logo || "🏭",
      briefDescription: client.briefDescription || "",
      name: client.name || "",
      designation: client.designation || "",
      url: client.url || "",
      contactPhone: client.contact?.phone || "",
      contactEmail: client.contact?.email || "",
      linkedin: client.social?.linkedin || "",
      instagram: client.social?.instagram || "",
      twitter: client.social?.twitter || "",
      galleryText: (client.gallery || []).join("\n"),
      reviews: client.reviews || [],
    });
    setShowModal(true);
  };

  const handleFormSubmitAction = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      companyName: formData.companyName,
      industry: formData.industry,
      servingSince: String(formData.servingSince),
      logo: formData.logo,
      details: formData.briefDescription,
      name: formData.name || undefined,
      designation: formData.designation || undefined,
      url: formData.url || undefined,
      contact: {
        phone: formData.contactPhone || undefined,
        email: formData.contactEmail || undefined,
      },
      social: {
        linkedin: formData.linkedin || undefined,
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
      },
      gallery: formData.galleryText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      reviews: (formData.reviews || [])
        .filter((r) => (r.description || "").trim())
        .map((r) => ({
          date: r.date || "",
          rating: Number(r.rating) || 5,
          description: r.description,
        })),
    };
    try {
      if (editingId) await clientsApi.update(editingId, payload);
      else await clientsApi.create(payload);
      setShowModal(false);
      await load();
    } catch (err) {
      alert(err.message || "Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  const executeTerminalWipe = async (id) => {
    if (!confirm("Remove this client? It will also disappear from the public clients page.")) return;
    try {
      await clientsApi.remove(id);
      await load();
    } catch (err) {
      alert(err.message || "Failed to delete client.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Corporate Clients Registry Terminal</h1>
          <p className="text-xs text-slate-500 font-medium">Provision industrial network clients, update lifecycle metrics, compile slugs, and synchronize accounts.</p>
        </div>
        <button onClick={triggerCreateState}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm shrink-0">
          ➕ Provision Client Workspace
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Corporate Alliance Brand</th>
                <th className="py-4 px-5">Industrial Classification Sector</th>
                <th className="py-4 px-5">Account Tenure Specs</th>
                <th className="py-4 px-5 text-center">Data Matrix Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400 font-semibold">Loading clients…</td></tr>
              ) : clientsList.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400 font-semibold">No clients yet. Provision your first one.</td></tr>
              ) : clientsList.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl bg-slate-100 p-1 rounded-lg border">{client.logo}</span>
                      <div>
                        <span className="font-black text-slate-900 block">{client.companyName}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold block">slug: /clients/{client.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-500">{client.industry}</td>
                  <td className="py-4 px-5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      ⏱️ Since {client.servingSince} ({client.totalYears})
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => triggerUpdateState(client)} className="p-1 px-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-md border text-[10px] font-bold uppercase transition-all">✏️ Edit Config</button>
                      <button onClick={() => executeTerminalWipe(client.id)} className="p-1 px-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-md text-[10px] font-bold uppercase transition-all">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleFormSubmitAction} className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {editingId ? "Modify Alliance Profile" : "Incorporate Fresh Corporate Account"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase">Company Legal Enterprise Name</label>
                <input type="text" required placeholder="e.g., Reliance Industries Ltd" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Icon</label>
                <select value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })} className="w-full text-xs px-2 py-2 border rounded-lg bg-slate-50 focus:outline-none text-center font-bold">
                  <option value="🏭">🏭</option>
                  <option value="⚡">⚡</option>
                  <option value="🚚">🚚</option>
                  <option value="🏗️">🏗️</option>
                  <option value="⛏️">⛏️</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Industrial Core Sector Branch</label>
              <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="w-full text-xs px-3 py-2 border bg-slate-50 rounded-lg font-bold text-slate-700 focus:outline-none">
                <option value="Mining & Heavy Infrastructure">Mining & Heavy Infrastructure</option>
                <option value="Metallurgy & Aluminum Refineries">Metallurgy & Aluminum Refineries</option>
                <option value="Petrochemical Grids & Energy Hubs">Petrochemical Grids & Energy Hubs</option>
                <option value="Power Generation & Core Logistics">Power Generation & Core Logistics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Sourcing Start Year</label>
              <input type="number" required placeholder="e.g., 2021" value={formData.servingSince} onChange={e => setFormData({ ...formData, servingSince: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              <p className="text-[10px] text-slate-400">Tenure is calculated automatically from this year.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Alliance Brief Profile Summary</label>
              <textarea rows="3" required placeholder="Describe cross-supply deployment zones, logistics scope…" value={formData.briefDescription} onChange={e => setFormData({ ...formData, briefDescription: e.target.value })} className="w-full text-xs p-2.5 border rounded-lg bg-slate-50 focus:outline-none" />
            </div>

            {/* Contact person + designation */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Contact Person</label>
                <input type="text" placeholder="e.g., Rajesh Kumar" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Designation</label>
                <input type="text" placeholder="e.g., Procurement Head" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
            </div>

            {/* Phone + email */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                <input type="text" placeholder="+91…" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Email</label>
                <input type="email" placeholder="name@company.com" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Website URL</label>
              <input type="url" placeholder="https://company.com" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
            </div>

            {/* Socials */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">LinkedIn</label>
                <input type="url" placeholder="URL" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} className="w-full text-xs px-2 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Instagram</label>
                <input type="url" placeholder="URL" value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} className="w-full text-xs px-2 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Twitter / X</label>
                <input type="url" placeholder="URL" value={formData.twitter} onChange={e => setFormData({ ...formData, twitter: e.target.value })} className="w-full text-xs px-2 py-2 border rounded-lg bg-slate-50 focus:outline-none" />
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Gallery image URLs (one per line)</label>
              <textarea rows="2" placeholder="https://…/photo1.webp&#10;https://…/photo2.webp" value={formData.galleryText} onChange={e => setFormData({ ...formData, galleryText: e.target.value })} className="w-full text-xs p-2.5 border rounded-lg bg-slate-50 focus:outline-none font-mono" />
            </div>

            {/* Reviews editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase">Reviews</label>
                <button type="button" onClick={() => setFormData(p => ({ ...p, reviews: [...p.reviews, { rating: 5, date: "", description: "" }] }))} className="text-[10px] font-bold text-blue-600 hover:underline">+ Add review</button>
              </div>
              {formData.reviews.map((r, idx) => (
                <div key={idx} className="border rounded-lg p-2 bg-slate-50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <select value={r.rating} onChange={e => setFormData(p => ({ ...p, reviews: p.reviews.map((x, i) => i === idx ? { ...x, rating: Number(e.target.value) } : x) }))} className="text-xs px-2 py-1 border rounded bg-white">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                    <input type="text" placeholder="Date (e.g., 2025-03)" value={r.date} onChange={e => setFormData(p => ({ ...p, reviews: p.reviews.map((x, i) => i === idx ? { ...x, date: e.target.value } : x) }))} className="flex-1 text-xs px-2 py-1 border rounded bg-white" />
                    <button type="button" onClick={() => setFormData(p => ({ ...p, reviews: p.reviews.filter((_, i) => i !== idx) }))} className="text-[10px] font-bold text-red-500 hover:underline">Remove</button>
                  </div>
                  <textarea rows="2" placeholder="What the client said…" value={r.description} onChange={e => setFormData(p => ({ ...p, reviews: p.reviews.map((x, i) => i === idx ? { ...x, description: e.target.value } : x) }))} className="w-full text-xs p-2 border rounded bg-white focus:outline-none" />
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-md disabled:opacity-50">
              {saving ? "Saving…" : "💾 Compile Alliance Profile Records"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
