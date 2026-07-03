// src/components/admin/whychooseus/WhyChooseUsCardsManager.jsx
"use client";

import { useState } from "react";
import whyChooseUsData from "@/data/whyChooseUsData";
import { Save, Plus, Trash2, Edit, X, Eye, EyeOff } from "lucide-react";

export default function WhyChooseUsCardsManager() {
  const [config, setConfig] = useState(whyChooseUsData);
  const [form, setForm] = useState({ iconName: "Star", title: "", description: "", show: true });
  const [editingId, setEditingId] = useState(null);

  const stats = config.stats || [];
  const availableIcons = config.availableIcons || [];

  const dispatchUpdate = (data) => {
    window.dispatchEvent(new CustomEvent("why-choose-us-admin-update", { detail: { config: data } }));
  };

  const updateStats = (newStats) => {
    const updated = { ...config, stats: newStats };
    setConfig(updated);
    dispatchUpdate(updated);
  };

  const resetForm = () => {
    setForm({ iconName: "Star", title: "", description: "", show: true });
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.title.trim()) { alert("Title is required"); return; }
    if (editingId) {
      updateStats(stats.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    } else {
      updateStats([...stats, { ...form, id: Date.now() }]);
    }
    resetForm();
  };

  const handleEdit = (stat) => {
    setEditingId(stat.id);
    setForm({ iconName: stat.iconName, title: stat.title, description: stat.description, show: stat.show });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this card?")) return;
    updateStats(stats.filter((s) => s.id !== id));
  };

  const toggleShow = (id) => {
    updateStats(stats.map((s) => (s.id === id ? { ...s, show: !s.show } : s)));
  };

  const handleSave = () => {
    alert("Cards saved!");
    console.log("Why Choose Us Cards:", config.stats);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Feature Cards</h2>
        <p className="mt-1 text-sm text-slate-500">{stats.length} card(s) configured</p>
      </div>

      {/* Add/Edit Form */}
      <div className="rounded-2xl border bg-slate-50 p-5">
        <h5 className="mb-4 font-semibold">{editingId ? "Edit Card" : "Add Card"}</h5>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Icon</label>
            <select value={form.iconName} onChange={(e) => setForm((p) => ({ ...p, iconName: e.target.value }))}
              className="w-full rounded-xl border px-4 py-3">
              {availableIcons.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Card title" className="w-full rounded-xl border px-4 py-3" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Card description" className="w-full rounded-xl border px-4 py-3 resize-none" />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleAddOrUpdate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
            {editingId ? <Save size={16} /> : <Plus size={16} />}
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && <button onClick={resetForm} className="rounded-xl border px-5 py-3 hover:bg-slate-50"><X size={16} /> Cancel</button>}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.id} className="flex items-center gap-4 rounded-2xl border bg-white p-4">
            <button onClick={() => toggleShow(stat.id)} className="shrink-0">
              {stat.show ? <Eye className="h-5 w-5 text-green-600" /> : <EyeOff className="h-5 w-5 text-slate-400" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{stat.title}</p>
              <p className="text-xs text-slate-500 truncate">{stat.description}</p>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded">{stat.iconName}</span>
            <button onClick={() => handleEdit(stat)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
              <Edit size={16} />
            </button>
            <button onClick={() => handleDelete(stat.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
          <Save className="h-4 w-4" /> Save Cards
        </button>
      </div>
    </div>
  );
}