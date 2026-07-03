"use client";

import { useState, useMemo } from "react";
import { 
  Plus, Edit, Trash2, Save, X, FolderOpen, Search, 
  ChevronLeft, ChevronRight, Filter, Image as ImageIcon,
  MoveUp, MoveDown, Eye, EyeOff
} from "lucide-react";
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from "@/data/products";

export default function SubcategoriesManager() {
  const [categories] = useState(PRODUCT_CATEGORIES);
  const [subcategories, setSubcategories] = useState(PRODUCT_SUBCATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const pageSize = 10;

  const [form, setForm] = useState({
    name: "",
    categoryId: categories[0]?.id || "",
    image: "",
  });

  const filteredSubcategories = useMemo(() => {
    let filtered = [...subcategories];

    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== "ALL") {
      filtered = filtered.filter((s) => s.categoryId === filterCategory);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [subcategories, searchQuery, filterCategory]);

  const totalPages = Math.ceil(filteredSubcategories.length / pageSize);
  const paginatedSubcategories = filteredSubcategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCategoryName = (catId) => {
    return categories.find((c) => c.id === catId)?.name || "Unknown";
  };

  const getCategoryIcon = (catId) => {
    return categories.find((c) => c.id === catId)?.icon || "📁";
  };

  const resetForm = () => {
    setForm({ name: "", categoryId: categories[0]?.id || "", image: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (subcategory) => {
    setEditingId(subcategory.id);
    setForm({
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      image: subcategory.image || "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Subcategory name is required");
      return;
    }
    if (!form.categoryId) {
      alert("Please select a parent category");
      return;
    }

    if (editingId) {
      setSubcategories((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, ...form, updatedAt: new Date().toISOString() }
            : s
        )
      );
    } else {
      const newId = `SUBCAT-${String(subcategories.length + 1).padStart(3, "0")}`;
      setSubcategories((prev) => [
        ...prev,
        {
          id: newId,
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this subcategory? Products under this subcategory will need reassignment.")) return;
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicate = (subcategory) => {
    const newId = `SUBCAT-${String(subcategories.length + 1).padStart(3, "0")}`;
    setSubcategories((prev) => [
      ...prev,
      {
        ...subcategory,
        id: newId,
        name: `${subcategory.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const moveSubcategory = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= subcategories.length) return;
    const updated = [...subcategories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSubcategories(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subcategories Manager</h2>
          <p className="mt-1 text-sm text-slate-500">{subcategories.length} subcategories across {categories.length} categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700" >
          <Plus size={16} /> Add Subcategory
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Total Subcategories</p>
          <h3 className="mt-2 text-2xl font-bold text-blue-600">{subcategories.length}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Parent Categories</p>
          <h3 className="mt-2 text-2xl font-bold text-green-600">{categories.length}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Avg Subcategories/Category</p>
          <h3 className="mt-2 text-2xl font-bold text-purple-600">{categories.length > 0 ? (subcategories.length / categories.length).toFixed(1) : "0"}</h3>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search subcategories..." className="w-72 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm" >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filterCategory === "ALL" ? (
          categories.map((category) => {
            const catSubs = filteredSubcategories.filter(
              (s) => s.categoryId === category.id
            );
            if (catSubs.length === 0 && searchQuery) return null;

            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon || "📁"}</span>
                  <h3 className="text-lg font-bold text-slate-800">{category.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-500">{catSubs.length} subcategories</span>
                </div>

                {catSubs.length === 0 && !searchQuery ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <FolderOpen className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No subcategories under this category</p>
                    <button onClick={() => {
                        setForm((p) => ({ ...p, categoryId: category.id }));
                        setShowForm(true);
                      }}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline" >
                      + Add first subcategory
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {catSubs.map((sub) => (
                      <div key={sub.id} className="rounded-xl border bg-white p-4 hover:shadow-md transition-all group" >
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
                            <p className="text-[10px] text-slate-400 mt-1">Created: {new Date(sub.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(sub)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDuplicate(sub)} className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600" title="Duplicate" >
                              <Plus size={14} />
                            </button>
                            <button onClick={() => handleDelete(sub.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete" >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Single category view
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {paginatedSubcategories.map((sub) => (
              <div key={sub.id} className="rounded-xl border bg-white p-4 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"><FolderOpen size={16} className="text-slate-400" /> </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 truncate">{sub.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{sub.id}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Category: {getCategoryName(sub.categoryId)}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(sub)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(sub.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredSubcategories.length)} of {filteredSubcategories.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border p-2 disabled:opacity-40" >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "border hover:bg-slate-50"
                }`} >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border p-2 disabled:opacity-40" >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-bold">{editingId ? "Edit Subcategory" : "Create Subcategory"} </h3>
              <button onClick={resetForm} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Parent Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} className="w-full rounded-xl border px-4 py-3 text-sm" >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">Subcategory Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Drill & Screw Bit Set" className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">Image URL (optional)</label>
                <div className="flex gap-2">
                  <input type="text" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://example.com/image.jpg" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
                  {form.image && (
                    <img src={form.image} alt="Preview" className="h-11 w-11 rounded-lg object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button onClick={resetForm} className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
                <Save size={16} /> {editingId ? "Update" : "Create"} Subcategory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}