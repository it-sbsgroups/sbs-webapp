"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Link2, GripVertical } from "lucide-react";
import { loadFooter, saveFooterFields } from "@/lib/footerSections";
import toast from "react-hot-toast";

export default function FooterLinksManager() {
  const [sectionType, setSectionType] = useState("quickLinks");

  const [quickLinks, setQuickLinks] = useState([
    { id: "ql1", name: "Home", href: "/" },
    { id: "ql2", name: "Products", href: "/products" },
    { id: "ql3", name: "Brands", href: "/brands" },
    { id: "ql4", name: "About Us", href: "/about" },
    { id: "ql5", name: "Contact", href: "/contact" },
    { id: "ql6", name: "Distributors", href: "/distributors" },
  ]);

  const [serviceLinks, setServiceLinks] = useState([
    { id: "s1", name: "Clients", href: "/clients" },
    { id: "s2", name: "Testimonials", href: "/testimonials" },
    { id: "s3", name: "News & Media", href: "/news" },
    { id: "s4", name: "Employees Portal", href: "/employees" },
    { id: "s5", name: "Careers", href: "/careers" },
  ]);

  const [form, setForm] = useState({ name: "", href: "" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await loadFooter();
        if (Array.isArray(c?.quickLinks) && c.quickLinks.length) setQuickLinks(c.quickLinks);
        if (Array.isArray(c?.servicesLinks) && c.servicesLinks.length) setServiceLinks(c.servicesLinks);
      } catch { /* keep defaults */ }
    })();
  }, []);

  const currentLinks = sectionType === "quickLinks" ? quickLinks : serviceLinks;
  const setCurrentLinks = sectionType === "quickLinks" ? setQuickLinks : setServiceLinks;

  const resetForm = () => {
    setForm({ name: "", href: "" });
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.name.trim() || !form.href.trim()) {
      alert("Name and link are required");
      return;
    }

    if (editingId) {
      setCurrentLinks((prev) =>
        prev.map((link) => (link.id === editingId ? { ...link, ...form } : link))
      );
    } else {
      setCurrentLinks((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }
    resetForm();
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setForm({ name: link.name, href: link.href });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this link?")) return;
    setCurrentLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFooterFields({ quickLinks, servicesLinks: serviceLinks });
      toast.success("Footer links saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Footer Navigation Links</h2>
        <p className="mt-1 text-sm text-slate-500">Manage quick links and services links in footer.</p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setSectionType("quickLinks")}
          className={`rounded-xl px-5 py-3 font-medium transition-all ${
            sectionType === "quickLinks" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          Quick Links ({quickLinks.length})
        </button>
        <button
          onClick={() => setSectionType("services")}
          className={`rounded-xl px-5 py-3 font-medium transition-all ${
            sectionType === "services" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          Services Links ({serviceLinks.length})
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h5 className="mb-4 font-semibold">
          {editingId ? "Edit Link" : `Add ${sectionType === "quickLinks" ? "Quick Link" : "Service Link"}`}
        </h5>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Link Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Home"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">URL</label>
            <input
              type="text"
              value={form.href}
              onChange={(e) => setForm((prev) => ({ ...prev, href: e.target.value }))}
              placeholder="/about"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleAddOrUpdate}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="rounded-xl border px-5 py-3 hover:bg-slate-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">URL</th>
              <th className="px-4 py-4 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLinks.map((link) => (
              <tr key={link.id} className="border-t">
                <td className="px-4 py-4 font-medium">{link.name}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link2 size={14} className="text-slate-400" />
                    <span className="text-sm">{link.href}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(link)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentLinks.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-500">No links added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          <Save className="h-4 w-4" /> Save Links
        </button>
      </div>
    </div>
  );
}