"use client";

import { useState, useEffect, useCallback } from "react";
import clientsApi from "@/lib/clientsApi";
import testimonialsApi from "@/lib/testimonialsApi";
import toast from "react-hot-toast";
import {
  Plus, Edit, Trash2, X, Save, Search, Building2, Mail, Phone,
  Globe, MapPin, ChevronLeft, ChevronRight, MessageSquareQuote,
} from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
  </button>
);

const BLANK_FORM = {
  contactName: "",
  companyName: "",
  companyAddress: "",
  email: "",
  phone: "",
  logo: "",
  website: "",
  isActive: true,
  order: 0,
};

export default function AdminClientsManagementDashboard() {
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(BLANK_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [requestingId, setRequestingId] = useState(null);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    const data = await clientsApi.getAll();
    setClientsList(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = searchQuery.trim()
    ? clientsList.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          String(c?.companyName || "").toLowerCase().includes(q) ||
          String(c?.contactName || "").toLowerCase().includes(q) ||
          String(c?.email || "").toLowerCase().includes(q)
        );
      })
    : clientsList;

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const triggerCreateState = () => {
    setEditingId(null);
    setFormData(BLANK_FORM);
    setShowModal(true);
  };

  const triggerUpdateState = (client) => {
    setEditingId(client.id);
    setFormData({
      contactName: client.contactName || "",
      companyName: client.companyName || "",
      companyAddress: client.companyAddress || "",
      email: client.email || "",
      phone: client.phone || "",
      logo: client.logo || "",
      website: client.website || "",
      isActive: client.isActive ?? true,
      order: client.order ?? 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(BLANK_FORM);
  };

  const handleField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFormSubmitAction = async (e) => {
    e.preventDefault();
    if (!formData.contactName.trim()) { toast.error("Contact name is required"); return; }
    if (!formData.companyName.trim()) { toast.error("Company name is required"); return; }
    if (!formData.email.trim()) { toast.error("Email is required"); return; }
    if (!formData.phone.trim()) { toast.error("Phone is required"); return; }

    setSaving(true);
    const payload = {
      contactName: formData.contactName.trim(),
      companyName: formData.companyName.trim(),
      companyAddress: formData.companyAddress.trim() || undefined,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      logo: formData.logo.trim() || undefined,
      website: formData.website.trim() || undefined,
      isActive: formData.isActive,
      order: Number(formData.order) || 0,
    };
    try {
      if (editingId) await clientsApi.update(editingId, payload);
      else await clientsApi.create(payload);
      toast.success(editingId ? "Client updated" : "Client added");
      closeModal();
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this client? It will also disappear from the public clients page.")) return;
    try {
      await clientsApi.remove(id);
      toast.success("Client removed");
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to delete client.");
    }
  };

  const handleToggleActive = async (client) => {
    try {
      await clientsApi.toggle(client.id);
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleRequestTestimonial = async (client) => {
    if (!client.email) { toast.error("This client has no email on file."); return; }
    if (!confirm(`Send a testimonial request email to ${client.contactName} (${client.email})?`)) return;
    setRequestingId(client.id);
    try {
      await testimonialsApi.requestForClient(client.id);
      toast.success(`Testimonial request sent to ${client.email}`);
    } catch (err) {
      toast.error(err.message || "Failed to send testimonial request.");
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Clients</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">{clientsList.length} client(s) on file · Manage client records and request testimonials</p>
        </div>
        <button onClick={triggerCreateState} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm shrink-0 flex items-center gap-2">
          <Plus size={14} /> Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search clients by company, contact, or email..."
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Company</th>
                <th className="py-4 px-5">Contact</th>
                <th className="py-4 px-5">Address</th>
                <th className="py-4 px-5">Active</th>
                <th className="py-4 px-5">Testimonials</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginated.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {client.logo ? (
                        <img src={client.logo} alt="" className="h-8 w-8 rounded-lg object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 size={14} className="text-blue-600" /></div>
                      )}
                      <div>
                        <p className="font-black text-slate-900">{client.companyName}</p>
                        {client.website && (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                            <Globe size={9} /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-slate-800">{client.contactName}</p>
                    <p className="flex items-center gap-1 text-[11px] mt-0.5"><Mail size={10} /><a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a></p>
                    <p className="flex items-center gap-1 text-[11px] mt-0.5"><Phone size={10} /><a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">{client.phone}</a></p>
                  </td>
                  <td className="py-4 px-5 max-w-[220px]">
                    {client.companyAddress ? (
                      <p className="flex items-start gap-1 text-[11px] text-slate-600"><MapPin size={10} className="mt-0.5 shrink-0" />{client.companyAddress}</p>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <Toggle checked={Boolean(client.isActive)} onChange={() => handleToggleActive(client)} />
                      <span className="text-[10px]">{client.isActive ? "Yes" : "No"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {client?._count?.testimonials ?? 0} submitted
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleRequestTestimonial(client)}
                        disabled={requestingId === client.id}
                        title="Send testimonial request email"
                        className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-40"
                      >
                        <MessageSquareQuote size={15} />
                      </button>
                      <button onClick={() => triggerUpdateState(client)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Building2 className="mx-auto h-10 w-10 mb-3 opacity-30" />
                    <p className="font-semibold">No clients yet</p>
                    <p className="text-xs mt-1">Click "Add Client" to add your first client record.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span className="px-3 py-2 text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleFormSubmitAction} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">{editingId ? "Edit Client" : "Add New Client"}</h2>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 font-bold"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Company Name *</label>
                    <input type="text" required value={formData.companyName} onChange={(e) => handleField("companyName", e.target.value)} placeholder="e.g., Adani Enterprises Ltd" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Company Address</label>
                    <textarea value={formData.companyAddress} onChange={(e) => handleField("companyAddress", e.target.value)} placeholder="Street, city, state, PIN" rows={2} className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Company Logo URL</label>
                    <input type="text" value={formData.logo} onChange={(e) => handleField("logo", e.target.value)} placeholder="https://example.com/logo.png" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Company Website</label>
                    <input type="text" value={formData.website} onChange={(e) => handleField("website", e.target.value)} placeholder="https://www.company.com" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Contact Person</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Contact Name *</label>
                    <input type="text" required value={formData.contactName} onChange={(e) => handleField("contactName", e.target.value)} placeholder="e.g., Rohan Mehta" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Email * <span className="text-slate-400 font-medium">(testimonial requests go here)</span></label>
                    <input type="email" required value={formData.email} onChange={(e) => handleField("email", e.target.value)} placeholder="contact@company.com" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Phone *</label>
                    <input type="text" required value={formData.phone} onChange={(e) => handleField("phone", e.target.value)} placeholder="+91-98765-43210" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Status</h3>
                <div className="flex items-center gap-3">
                  <Toggle checked={formData.isActive} onChange={() => handleField("isActive", !formData.isActive)} />
                  <span className="text-xs font-medium">{formData.isActive ? "Active (shown on public clients page)" : "Inactive"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4 sticky bottom-0 bg-white rounded-b-2xl">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                <Save size={14} /> {saving ? "Saving…" : editingId ? "Update Client" : "Add Client"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
