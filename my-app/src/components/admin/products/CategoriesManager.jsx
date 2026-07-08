// src/components/admin/products/CategoriesManager.jsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, FolderTree, FolderOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import categoriesApi from "@/lib/categoriesApi";

const STORAGE_KEY = "sbs_admin_categories_state";

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", image: "", sortOrder: 0, isActive: true });
  const [subForm, setSubForm] = useState({ name: "", categoryId: "", image: "", sortOrder: 0, isActive: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [catPage, setCatPage] = useState(1);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const pageSize = 6;

  // Restore from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.filterCategory) setFilterCategory(parsed.filterCategory);
        if (parsed.catPage) setCatPage(parsed.catPage);
        if (parsed.catForm) setCatForm(parsed.catForm);
        if (parsed.subForm) setSubForm(parsed.subForm);
        if (parsed.showCatForm !== undefined) setShowCatForm(parsed.showCatForm);
        if (parsed.showSubForm !== undefined) setShowSubForm(parsed.showSubForm);
        if (parsed.editingCat) setEditingCat(parsed.editingCat);
        if (parsed.editingSub) setEditingSub(parsed.editingSub);
      } catch {}
    }
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    const state = {
      searchQuery,
      filterCategory,
      catPage,
      catForm,
      subForm,
      showCatForm,
      showSubForm,
      editingCat,
      editingSub,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [searchQuery, filterCategory, catPage, catForm, subForm, showCatForm, showSubForm, editingCat, editingSub]);

  const fetchData = async () => {
    try {
      const [catData, subData] = await Promise.all([
        categoriesApi.getAll(),
        categoriesApi.getAllSubcategories(),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setSubcategories(Array.isArray(subData) ? subData : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCategories = searchQuery.trim()
    ? categories.filter((c) => String(c?.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  const catTotalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCats = filteredCategories.slice((catPage - 1) * pageSize, catPage * pageSize);

  const resetCatForm = () => { setCatForm({ name: "", image: "", sortOrder: 0, isActive: true }); setEditingCat(null); setShowCatForm(false); };
  const resetSubForm = () => { setSubForm({ name: "", categoryId: "", image: "", sortOrder: 0, isActive: true }); setEditingSub(null); setShowSubForm(false); };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return alert("Category name required");
    try {
      if (editingCat) {
        await categoriesApi.update(editingCat, catForm);
      } else {
        await categoriesApi.create(catForm);
      }
      resetCatForm();
      sessionStorage.removeItem(STORAGE_KEY);
      await fetchData();
    } catch (error) {
      alert("Failed to save: " + error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category and its subcategories?")) return;
    try {
      await categoriesApi.delete(id);
      await fetchData();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  const handleSaveSubcategory = async () => {
    if (!subForm.name.trim() || !subForm.categoryId) return alert("Name and category required");
    try {
      if (editingSub) {
        await categoriesApi.updateSubcategory(editingSub, subForm);
      } else {
        await categoriesApi.createSubcategory(subForm);
      }
      resetSubForm();
      sessionStorage.removeItem(STORAGE_KEY);
      await fetchData();
    } catch (error) {
      alert("Failed to save: " + error.message);
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      await categoriesApi.deleteSubcategory(id);
      await fetchData();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCatPage(1); }}
          placeholder="Search categories..."
          className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FolderTree size={18} /> Categories ({filteredCategories.length})
            </h3>
            <button
              onClick={() => { resetCatForm(); setShowCatForm(true); }}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {showCatForm && (
            <div className="rounded-xl border bg-slate-50 p-3 space-y-2">
              <input
                type="text"
                value={catForm.name}
                onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Category name"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={catForm.image}
                onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="Image URL"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={catForm.sortOrder}
                  onChange={(e) => setCatForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  placeholder="Sort Order"
                  className="w-1/2 rounded-lg border px-3 py-2 text-sm"
                />
                <label className="w-1/2 inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={catForm.isActive}
                    onChange={(e) => setCatForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-green-600">
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full" />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {catForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
              <button
                onClick={handleSaveCategory}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-xs text-white hover:bg-green-700 w-full justify-center"
              >
                <Save size={14} /> {editingCat ? "Update" : "Save"} Category
              </button>
              <button
                onClick={resetCatForm}
                className="flex items-center gap-1 rounded-lg border px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 w-full justify-center"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          )}

          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {paginatedCats.map((cat) => (
              <div key={cat?.id} className="flex items-center justify-between rounded-lg border bg-white p-2.5 hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={`${String(cat?.image || "")}`} alt="" className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{String(cat?.name || "")}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-slate-400">Active: {String(cat?.isActive ? "Yes" : "No")}</span>
                      <span className="text-[10px] text-slate-400">Sort: {String(cat?.sortOrder || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingCat(cat?.id); setCatForm({ name: cat?.name || "", image: cat?.image || "", sortOrder: cat?.sortOrder || 0, isActive: cat?.isActive ?? true }); setShowCatForm(true); }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit size={13} />
                  </button>
                  <button onClick={() => handleDeleteCategory(cat?.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {catTotalPages > 1 && (
            <div className="flex justify-center gap-1">
              <button onClick={() => setCatPage((p) => Math.max(1, p - 1))} disabled={catPage === 1} className="rounded border p-1.5 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs px-3 py-1.5">{catPage}/{catTotalPages}</span>
              <button onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))} disabled={catPage === catTotalPages} className="rounded border p-1.5 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Subcategories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FolderOpen size={18} /> Subcategories ({subcategories.length})
            </h3>
            <button
              onClick={() => { resetSubForm(); setShowSubForm(true); }}
              className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-700"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {showSubForm && (
            <div className="rounded-xl border bg-slate-50 p-3 space-y-2">
              <select
                value={subForm.categoryId}
                onChange={(e) => setSubForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (<option key={c?.id} value={c?.id}>{String(c?.name || "")}</option>))}
              </select>
              <input
                type="text"
                value={subForm.name}
                onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Subcategory name"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={subForm.image}
                onChange={(e) => setSubForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="Image URL"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={subForm.sortOrder}
                  onChange={(e) => setSubForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  placeholder="Sort Order"
                  className="w-1/2 rounded-lg border px-3 py-2 text-sm"
                />
                <label className="w-1/2 inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subForm.isActive}
                    onChange={(e) => setSubForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-green-600">
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full" />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {subForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
              <button
                onClick={handleSaveSubcategory}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-xs text-white hover:bg-green-700 w-full justify-center"
              >
                <Save size={14} /> {editingSub ? "Update" : "Save"} Subcategory
              </button>
              <button
                onClick={resetSubForm}
                className="flex items-center gap-1 rounded-lg border px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 w-full justify-center"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          )}

          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {subcategories.map((sub) => (
              <div key={sub?.id} className="flex items-center justify-between rounded-lg border bg-white p-2.5 hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={`${String(sub?.image || "")}`} alt="" className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{String(sub?.name || "")}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-slate-400">Active: {String(sub?.isActive ? "Yes" : "No")}</span>
                      <span className="text-[10px] text-slate-400">Sort: {String(sub?.sortOrder || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingSub(sub?.id); setSubForm({ name: sub?.name || "", categoryId: sub?.categoryId || "", image: sub?.image || "", sortOrder: sub?.sortOrder || 0, isActive: sub?.isActive ?? true }); setShowSubForm(true); }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit size={13} />
                  </button>
                  <button onClick={() => handleDeleteSubcategory(sub?.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}