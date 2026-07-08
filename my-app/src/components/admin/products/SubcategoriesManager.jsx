// src/components/admin/products/SubcategoriesManager.jsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, FolderOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from "@/data/products";

const STORAGE_KEY = "sbs_admin_subcategories_state";

export default function SubcategoriesManager() {
  const [categories] = useState(PRODUCT_CATEGORIES);
  const [subcategories, setSubcategories] = useState(PRODUCT_SUBCATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: categories[0]?.id || "", image: "", sortOrder: 0, isActive: true });
  const pageSize = 10;

  // Restore from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.filterCategory) setFilterCategory(parsed.filterCategory);
        if (parsed.currentPage) setCurrentPage(parsed.currentPage);
        if (parsed.showForm) setShowForm(parsed.showForm);
        if (parsed.editingId) setEditingId(parsed.editingId);
        if (parsed.form) setForm(parsed.form);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const state = { searchQuery, filterCategory, currentPage, showForm, editingId, form };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [searchQuery, filterCategory, currentPage, showForm, editingId, form]);

  const filteredSubcategories = subcategories.filter((s) => {
    if (searchQuery.trim().length >= 2 && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory !== "ALL" && s.categoryId !== filterCategory) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredSubcategories.length / pageSize);
  const paginatedSubcategories = filteredSubcategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetForm = () => {
    setForm({ name: "", categoryId: categories[0]?.id || "", image: "", sortOrder: 0, isActive: true });
    setEditingId(null);
    setShowForm(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert("Subcategory name is required"); return; }
    if (!form.categoryId) { alert("Please select a parent category"); return; }

    if (editingId) {
      setSubcategories((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form, updatedAt: new Date().toISOString() } : s))
      );
    } else {
      const newId = `SUBCAT-${String(subcategories.length + 1).padStart(3, "0")}`;
      setSubcategories((prev) => [
        ...prev,
        { id: newId, ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this subcategory? Products under this subcategory will need reassignment.")) return;
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  const handleEdit = (subcategory) => {
    setEditingId(subcategory.id);
    setForm({ name: subcategory.name, categoryId: subcategory.categoryId, image: subcategory.image || "", sortOrder: subcategory.sortOrder || 0, isActive: subcategory.isActive ?? true });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subcategories Manager</h2>
          <p className="mt-1 text-sm text-slate-500">{subcategories.length} subcategories across {categories.length} categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Subcategory
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search subcategories..."
            className="w-72 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Subcategory name"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              placeholder="Image URL"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                placeholder="Sort Order"
                className="w-1/2 rounded-lg border px-3 py-2 text-sm"
              />
              <label className="w-1/2 inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-green-600">
                  <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-xs text-white hover:bg-green-700">
              <Save size={14} /> {editingId ? "Update" : "Save"} Subcategory
            </button>
            <button onClick={resetForm} className="flex items-center gap-1 rounded-lg border px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedSubcategories.map((sub) => (
          <div key={sub.id} className="rounded-xl border bg-white p-4 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {sub.image ? (
                    <img src={sub.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"><FolderOpen size={16} className="text-slate-400" /></div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 truncate">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{sub.id}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Sort: {sub.sortOrder || 0} • {sub.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(sub)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(sub.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredSubcategories.length)} of {filteredSubcategories.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border p-2 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "border hover:bg-slate-50"
                }`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border p-2 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}