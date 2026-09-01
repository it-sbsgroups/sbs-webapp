"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { loadFooter, saveFooterFields } from "@/lib/footerSections";
import toast from "react-hot-toast";

const iconTypeOptions = [
  { value: "fb", label: "Facebook (fb)" },
  { value: "in", label: "LinkedIn (ln)" },
  { value: "ig", label: "Instagram (ig)" },
  { value: "yt", label: "YouTube (yt)" },
  { value: "wa", label: "WhatsApp (wa)" },
  { value: "custom", label: "Custom (w3)" },
];

export default function FooterSocialManager() {
  const [socials, setSocials] = useState([
    { id: "soc1", platform: "Facebook", url: "https://facebook.com/sbsgroups", iconType: "fb", targetBlank: true },
    { id: "soc2", platform: "LinkedIn", url: "https://linkedin.com/company/sbsgroups", iconType: "in", targetBlank: true },
    { id: "soc3", platform: "Instagram", url: "https://instagram.com/sbsgroups", iconType: "ig", targetBlank: true },
    { id: "soc4", platform: "YouTube", url: "https://youtube.com/@sbsgroups", iconType: "yt", targetBlank: true },
    { id: "soc5", platform: "WhatsApp", url: "https://wa.me/911234567890", iconType: "wa", targetBlank: true },
  ]);

  const [form, setForm] = useState({
    platform: "",
    url: "",
    iconType: "fb",
    targetBlank: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await loadFooter();
        if (Array.isArray(c?.socialLinks) && c.socialLinks.length) setSocials(c.socialLinks);
      } catch { /* keep defaults */ }
    })();
  }, []);

  const resetForm = () => {
    setForm({ platform: "", url: "", iconType: "fb", targetBlank: true });
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.platform.trim() || !form.url.trim()) {
      alert("Platform name and URL are required");
      return;
    }

    if (editingId) {
      setSocials((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
    } else {
      setSocials((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }
    resetForm();
  };

  const handleEdit = (social) => {
    setEditingId(social.id);
    setForm({
      platform: social.platform,
      url: social.url,
      iconType: social.iconType,
      targetBlank: social.targetBlank,
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this social link?")) return;
    setSocials((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFooterFields({ socialLinks: socials });
      toast.success("Social links saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Social Media Links</h2>
        <p className="mt-1 text-sm text-slate-500">Manage social network links in footer.</p>
      </div>

      {/* Add/Edit Form */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h5 className="mb-4 font-semibold">{editingId ? "Edit Social Link" : "Add Social Link"}</h5>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Platform Name</label>
            <input
              type="text"
              value={form.platform}
              onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
              placeholder="Facebook"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">URL</label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://facebook.com/..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Icon Type</label>
            <select
              value={form.iconType}
              onChange={(e) => setForm((prev) => ({ ...prev, iconType: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              {iconTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 py-3">
              <input
                type="checkbox"
                checked={form.targetBlank}
                onChange={(e) => setForm((prev) => ({ ...prev, targetBlank: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-sm">Open in new tab</span>
            </label>
            <button
              onClick={handleAddOrUpdate}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Socials Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold">Platform</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">URL</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Icon</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Target</th>
              <th className="px-4 py-4 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {socials.map((social) => (
              <tr key={social.id} className="border-t">
                <td className="px-4 py-4 font-medium">{social.platform}</td>
                <td className="px-4 py-4">
                  <a href={social.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                    <ExternalLink size={14} />
                    {social.url.length > 30 ? social.url.substring(0, 30) + "..." : social.url}
                  </a>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono">{social.iconType}</span>
                </td>
                <td className="px-4 py-4 text-sm">{social.targetBlank ? "New Tab" : "Same Tab"}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(social)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(social.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {socials.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">No social links added yet.</td>
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
          <Save className="h-4 w-4" /> Save Social Links
        </button>
      </div>
    </div>
  );
}