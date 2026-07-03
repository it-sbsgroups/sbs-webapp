"use client";

import { useState, useEffect } from "react";
import brandsApi from "@/lib/brandsApi";
import { Plus, Edit, Trash2, X, Save, Search, Building2, Mail, Phone, Globe, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

// Empty form template matching backend schema
const emptyForm = {
  name: "",
  logo: "",
  website: "",
  email: "",
  phone: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  gstin: "",
  pan: "",
  registrationNo: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  foundedYear: "",
  employeeCount: "",
};

export default function BrandsManagementPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ============================================
  // FETCH BRANDS
  // ============================================
  const fetchBrands = async () => {
    try {
      const data = await brandsApi.getAll();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ============================================
  // FILTER & PAGINATION
  // ============================================
  const filteredBrands = searchQuery.trim()
    ? brands.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
          String(b?.name || "").toLowerCase().includes(q) ||
          String(b?.email || "").toLowerCase().includes(q) ||
          String(b?.city || "").toLowerCase().includes(q) ||
          String(b?.state || "").toLowerCase().includes(q)
        );
      })
    : brands;

  const totalPages = Math.ceil(filteredBrands.length / pageSize);
  const paginatedBrands = filteredBrands.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ============================================
  // FORM HANDLERS
  // ============================================
  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setEditingId(brand?.id);
    setFormData({
      name: brand?.name || "",
      logo: brand?.logo || "",
      website: brand?.website || "",
      email: brand?.email || "",
      phone: brand?.phone || "",
      description: brand?.description || "",
      address: brand?.address || "",
      city: brand?.city || "",
      state: brand?.state || "",
      country: brand?.country || "India",
      pincode: brand?.pincode || "",
      gstin: brand?.gstin || "",
      pan: brand?.pan || "",
      registrationNo: brand?.registrationNo || "",
      contactPerson: brand?.contactPerson || "",
      contactPhone: brand?.contactPhone || "",
      contactEmail: brand?.contactEmail || "",
      foundedYear: brand?.foundedYear || "",
      employeeCount: brand?.employeeCount || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Brand name is required");
      return;
    }

    try {
      const payload = {
        ...formData,
        foundedYear: formData.foundedYear ? Number(formData.foundedYear) : null,
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : null,
      };

      if (editingId) {
        await brandsApi.update(editingId, payload);
      } else {
        await brandsApi.create(payload);
      }

      setShowModal(false);
      setFormData(emptyForm);
      setEditingId(null);
      await fetchBrands();
    } catch (error) {
      alert("Failed to save brand: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand? Products under this brand will need reassignment.")) return;
    try {
      await brandsApi.delete(id);
      await fetchBrands();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Brand & Distributor Registry
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {brands.length} brands registered · Manage manufacturers, suppliers, and distribution partners
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm shrink-0 flex items-center gap-2"
        >
          <Plus size={14} /> Register New Brand
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search brands by name, email, city, state..."
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none bg-white"
        />
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Brand Name</th>
                <th className="py-4 px-5">Contact</th>
                <th className="py-4 px-5">Location</th>
                <th className="py-4 px-5">GSTIN</th>
                <th className="py-4 px-5">Products</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedBrands.map((brand) => (
                <tr key={brand?.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {brand?.logo ? (
                        <img src={brand.logo} alt="" className="h-8 w-8 rounded-lg object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Building2 size={14} className="text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-slate-900">{String(brand?.name || "—")}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{String(brand?.id || "")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      {brand?.email && (
                        <p className="flex items-center gap-1 text-[11px]">
                          <Mail size={10} /> {String(brand.email)}
                        </p>
                      )}
                      {brand?.phone && (
                        <p className="flex items-center gap-1 text-[11px]">
                          <Phone size={10} /> {String(brand.phone)}
                        </p>
                      )}
                      {brand?.contactPerson && (
                        <p className="text-[10px] text-slate-400">Contact: {String(brand.contactPerson)}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-slate-400" />
                      <span>
                        {[brand?.city, brand?.state, brand?.country].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-[11px]">
                    {String(brand?.gstin || "—")}
                  </td>
                  <td className="py-4 px-5">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {brand?._count?.products ?? brand?.productCount ?? 0} items
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEditModal(brand)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand?.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedBrands.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Building2 className="mx-auto h-10 w-10 mb-3 opacity-30" />
                    <p className="font-semibold">No brands registered yet</p>
                    <p className="text-xs mt-1">Click "Register New Brand" to add your first manufacturer or distributor.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredBrands.length)} of {filteredBrands.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span className="px-3 py-2 text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
              className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {editingId ? "Edit Brand Details" : "Register New Brand / Distributor"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Brand Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="e.g., Makita Corporation" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Logo URL</label>
                    <input type="text" value={formData.logo} onChange={(e) => handleFieldChange("logo", e.target.value)}
                      placeholder="https://example.com/logo.png" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Website</label>
                    <input type="text" value={formData.website} onChange={(e) => handleFieldChange("website", e.target.value)}
                      placeholder="https://www.brand.com" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Description</label>
                  <textarea rows={2} value={formData.description} onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Brief description of the brand..." className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)}
                      placeholder="info@brand.com" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="+91-22-12345678" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Contact Person</label>
                    <input type="text" value={formData.contactPerson} onChange={(e) => handleFieldChange("contactPerson", e.target.value)}
                      placeholder="John Doe" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Contact Phone</label>
                    <input type="text" value={formData.contactPhone} onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
                      placeholder="+91-9876543210" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Contact Email</label>
                    <input type="email" value={formData.contactEmail} onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
                      placeholder="person@brand.com" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Address</h3>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Street Address</label>
                  <input type="text" value={formData.address} onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="123 Industrial Area" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">City</label>
                    <input type="text" value={formData.city} onChange={(e) => handleFieldChange("city", e.target.value)}
                      placeholder="Mumbai" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">State</label>
                    <input type="text" value={formData.state} onChange={(e) => handleFieldChange("state", e.target.value)}
                      placeholder="Maharashtra" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Pincode</label>
                    <input type="text" value={formData.pincode} onChange={(e) => handleFieldChange("pincode", e.target.value)}
                      placeholder="400001" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">Business Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">GSTIN</label>
                    <input type="text" value={formData.gstin} onChange={(e) => handleFieldChange("gstin", e.target.value)}
                      placeholder="27AAAAA0000A1Z5" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">PAN</label>
                    <input type="text" value={formData.pan} onChange={(e) => handleFieldChange("pan", e.target.value)}
                      placeholder="AAAAA0000A" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Registration No</label>
                    <input type="text" value={formData.registrationNo} onChange={(e) => handleFieldChange("registrationNo", e.target.value)}
                      placeholder="U74999MH2020PTC123456" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Country</label>
                    <input type="text" value={formData.country} onChange={(e) => handleFieldChange("country", e.target.value)}
                      placeholder="India" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Founded Year</label>
                    <input type="number" value={formData.foundedYear} onChange={(e) => handleFieldChange("foundedYear", e.target.value)}
                      placeholder="1915" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Employee Count</label>
                    <input type="number" value={formData.employeeCount} onChange={(e) => handleFieldChange("employeeCount", e.target.value)}
                      placeholder="5000" className="w-full text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4 sticky bottom-0 bg-white rounded-b-2xl">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Save size={14} /> {editingId ? "Update Brand" : "Register Brand"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}