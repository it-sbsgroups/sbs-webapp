"use client";

import { useState, useEffect } from "react";
import { Save, Phone, Mail, MapPin, MessageCircle, Plus, Trash2, Edit, X } from "lucide-react";
import { loadFooter, saveFooterFields } from "@/lib/footerSections";
import toast from "react-hot-toast";

const iconOptions = [
  { value: "FaPhone", label: "Phone" },
  { value: "FaEnvelope", label: "Email" },
  { value: "FaWhatsapp", label: "WhatsApp" },
  { value: "FaWorkspace", label: "Location" },
];

const typeOptions = [
  { value: "tel", label: "Phone Number" },
  { value: "mailto", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "text", label: "Plain Text" },
];

export default function FooterContactsManager() {
  const [contacts, setContacts] = useState([
    { id: "c1", show: true, label: "Sales Desk", type: "tel", value: "+91-12345-67890", icon: "FaPhone" },
    { id: "c2", show: true, label: "Support Line", type: "tel", value: "+91-98765-43210", icon: "FaPhone" },
    { id: "c3", show: true, label: "Business Mail", type: "mailto", value: "info@sbsgroups.co.in", icon: "FaEnvelope" },
    { id: "c4", show: true, label: "Sales Inquiry", type: "mailto", value: "sales@sbsgroups.co.in", icon: "FaEnvelope" },
    { id: "c5", show: true, label: "WhatsApp", type: "whatsapp", value: "911234567890", icon: "FaWhatsapp" },
  ]);

  const [form, setForm] = useState({
    show: true,
    label: "",
    type: "tel",
    value: "",
    icon: "FaPhone",
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Public footer keeps contacts as an OBJECT (mobile1/mobile2/email1/email2/
  // whatsapp); convert it back into this manager's array on load.
  useEffect(() => {
    (async () => {
      try {
        const c = await loadFooter();
        if (c?.contacts && typeof c.contacts === "object" && !Array.isArray(c.contacts)) {
          const order = ["mobile1", "mobile2", "email1", "email2", "whatsapp"];
          const arr = order
            .map((k) => (c.contacts[k] ? { id: k, ...c.contacts[k] } : null))
            .filter(Boolean);
          if (arr.length) setContacts(arr);
        }
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  const resetForm = () => {
    setForm({ show: true, label: "", type: "tel", value: "", icon: "FaPhone" });
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.label.trim() || !form.value.trim()) {
      alert("Label and value are required");
      return;
    }

    if (editingId) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      setContacts((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }
    resetForm();
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setForm({
      show: contact.show,
      label: contact.label,
      type: contact.type,
      value: contact.value,
      icon: contact.icon,
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this contact?")) return;
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleShow = (id) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, show: !c.show } : c))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const strip = (c) =>
        c ? { show: c.show, label: c.label, type: c.type, value: c.value, icon: c.icon } : undefined;
      const tels = contacts.filter((c) => c.type === "tel");
      const mails = contacts.filter((c) => c.type === "mailto");
      const wa = contacts.find((c) => c.type === "whatsapp");
      // Map into the public footer's 5 fixed slots.
      const contactsObj = {
        mobile1: strip(tels[0]),
        mobile2: strip(tels[1]),
        email1: strip(mails[0]),
        email2: strip(mails[1]),
        whatsapp: strip(wa),
      };
      await saveFooterFields({ contacts: contactsObj });
      toast.success("Footer contacts saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Footer Contacts</h2>
        <p className="mt-1 text-sm text-slate-500">Manage phone numbers, emails and contact details.</p>
      </div>

      {/* Add/Edit Form */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h5 className="mb-4 font-semibold">{editingId ? "Edit Contact" : "Add Contact"}</h5>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Label</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Sales Desk"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Value</label>
            <input
              type="text"
              value={form.value}
              onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
              placeholder="+91-12345-67890"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Icon</label>
            <select
              value={form.icon}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              {iconOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold">Show</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Label</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Value</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Icon</th>
              <th className="px-4 py-4 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={contact.show}
                    onChange={() => toggleShow(contact.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-4 font-medium">{contact.label}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{contact.type}</span>
                </td>
                <td className="px-4 py-4 text-sm">{contact.value}</td>
                <td className="px-4 py-4 text-sm">{contact.icon}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(contact)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">No contacts added yet.</td>
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
          <Save className="h-4 w-4" /> Save Contacts
        </button>
      </div>
    </div>
  );
}