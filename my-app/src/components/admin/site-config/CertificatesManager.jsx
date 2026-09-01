"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import apiClient, { toStaticUrl } from "@/lib/client";
import { Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

export default function CertificatesManager() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchCertificates = async () => {
    try {
      const data = await apiClient.get("/certificates");
      setCertificates(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editingId && !imageFile) {
      toast.error("Please select an image");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      if (form.description) formData.append("description", form.description);
      if (imageFile) formData.append("image", imageFile);

      if (editingId) {
        await apiClient.put(`/certificates/${editingId}`, formData);
        toast.success("Certificate updated");
      } else {
        await apiClient.post("/certificates", formData);
        toast.success("Certificate created");
      }
      resetForm();
      fetchCertificates();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await apiClient.delete(`/certificates/${id}`);
      toast.success("Deleted");
      fetchCertificates();
    } catch (error) {
      toast.error(error.message || "Delete failed");
    }
  };

  const startEdit = (cert) => {
    setEditingId(cert.id);
    setForm({ name: cert.name, description: cert.description || "" });
    setPreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Certificates</h2>
        <button
          onClick={resetForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700"
        >
          <Plus size={16} /> Add Certificate
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <RichTextEditor
              value={form.description || ""}
              onChange={(html) => setForm({ ...form, description: html })}
              placeholder="Write a description…"
              uploadFolder="certificates"
              resetKey={editingId || "new-certificate"}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {editingId ? "Replace Image (optional)" : "Image *"}
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
              />
              {preview && (
                <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {editingId && !preview && (
                <span className="text-xs text-slate-400">Current image will be kept if left unchanged</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {editingId ? "Update" : "Create"}
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : certificates.length === 0 ? (
        <p className="text-center text-slate-400 py-8">No certificates yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] bg-slate-100">
                <img src={toStaticUrl(cert.imageUrl)} alt={cert.name} className="w-full h-full object-contain" />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-slate-900">{cert.name}</h3>
                {cert.description && (
                  <div className="text-sm text-slate-500 prose prose-sm" dangerouslySetInnerHTML={{ __html: cert.description }} />
                )}
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => startEdit(cert)} className="p-1.5 text-slate-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(cert.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}