// src/components/admin/products/CategoriesManager.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Save, X, FolderTree, FolderOpen, Upload, Loader2, Link2 } from "lucide-react";
import categoriesApi from "@/lib/categoriesApi";
import AdminDataTable from "@/components/admin/shared/AdminDataTable";
import { uploadImage } from "@/lib/uploadApi";
import toast from "react-hot-toast";

const STORAGE_KEY = "sbs_admin_categories_state";

// ── Image Uploader Component (drag & drop + URL) ──────────────────────────────
function ImageUploader({ value, onChange, folder = "categories" }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    onChange(trimmed);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {/* Preview / Drop zone */}
      {value ? (
        <div className="flex items-start gap-3">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border group">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange("")}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Current image</p>
            <button
              onClick={() => onChange("")}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
          }`}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="mx-auto text-blue-600 animate-spin" size={32} />
              <p className="text-sm font-semibold text-slate-600">Uploading…</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto text-slate-400" size={32} />
              <p className="text-sm font-bold text-slate-600">Drop image here or click to browse</p>
              <p className="text-xs text-slate-400">JPG, PNG, WebP – automatically compressed</p>
            </div>
          )}
        </div>
      )}

      {/* Or paste a URL */}
      {!value && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              placeholder="…or paste an image URL"
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addUrl}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────
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
      // Sort subcategories by sortOrder (ascending) for consistent display
      setSubcategories(
        (Array.isArray(subData) ? subData : []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FolderTree size={18} /> Categories ({categories.length})
            </h3>
            <button
              onClick={() => { resetCatForm(); setShowCatForm(true); }}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {showCatForm && (
            <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
              <ImageUploader
                value={catForm.image}
                onChange={(url) => setCatForm((p) => ({ ...p, image: url }))}
                folder="categories"
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Category Name *</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={catForm.sortOrder}
                    onChange={(e) => setCatForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catForm.isActive}
                      onChange={(e) => setCatForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-xs text-white hover:bg-green-700"
                >
                  <Save size={14} className="inline mr-1" /> {editingCat ? "Update" : "Save"}
                </button>
                <button
                  onClick={resetCatForm}
                  className="flex-1 rounded-lg border px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <AdminDataTable
            data={categories}
            keyField="id"
            searchPlaceholder="Search categories..."
            searchKeys={["name"]}
            exportFilenamePrefix="categories"
            pageSize={6}
            emptyMessage="No categories yet"
            columns={[
              {
                key: "name", label: "Category", sortable: true,
                render: (cat) => (
                  <div className="flex items-center gap-2 min-w-0">
                    {cat.image && <img src={cat.image} alt="" className="h-9 w-9 rounded object-cover shrink-0" />}
                    <p className="font-semibold truncate">{cat.name}</p>
                  </div>
                ),
              },
              {
                key: "isActive", label: "Active", sortable: true, filterType: "select",
                filterOptions: ["Yes", "No"],
                exportValue: (cat) => (cat.isActive ? "Yes" : "No"),
                render: (cat) => (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cat.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {cat.isActive ? "Yes" : "No"}
                  </span>
                ),
              },
              { key: "sortOrder", label: "Sort", sortable: true, align: "center", render: (cat) => cat.sortOrder || 0 },
            ]}
            rowActions={(cat) => (
              <>
                <button
                  onClick={() => { setEditingCat(cat.id); setCatForm({ name: cat.name || "", image: cat.image || "", sortOrder: cat.sortOrder || 0, isActive: cat.isActive ?? true }); setShowCatForm(true); }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={13} />
                </button>
              </>
            )}
            onImportRow={async (row) => {
              const name = row["Category"]?.trim() || row["name"]?.trim();
              if (!name) throw new Error("Category name is required");
              await categoriesApi.create({
                name,
                image: row["image"]?.trim() || "",
                sortOrder: Number(row["Sort"]) || 0,
                isActive: (row["Active"] || "Yes").trim().toLowerCase() !== "no",
              });
            }}
            onImported={fetchData}
          />
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
            <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
              <ImageUploader
                value={subForm.image}
                onChange={(url) => setSubForm((p) => ({ ...p, image: url }))}
                folder="subcategories"
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Subcategory Name *</label>
                <input
                  type="text"
                  value={subForm.name}
                  onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Subcategory name"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Parent Category *</label>
                <select
                  value={subForm.categoryId}
                  onChange={(e) => setSubForm((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={subForm.sortOrder}
                    onChange={(e) => setSubForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subForm.isActive}
                      onChange={(e) => setSubForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveSubcategory}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-xs text-white hover:bg-green-700"
                >
                  <Save size={14} className="inline mr-1" /> {editingSub ? "Update" : "Save"}
                </button>
                <button
                  onClick={resetSubForm}
                  className="flex-1 rounded-lg border px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <AdminDataTable
            data={subcategories}
            keyField="id"
            searchPlaceholder="Search subcategories..."
            searchKeys={["name"]}
            exportFilenamePrefix="subcategories"
            pageSize={6}
            emptyMessage="No subcategories yet"
            columns={[
              {
                key: "name", label: "Subcategory", sortable: true,
                render: (sub) => (
                  <div className="flex items-center gap-2 min-w-0">
                    {sub.image && <img src={sub.image} alt="" className="h-9 w-9 rounded object-cover shrink-0" />}
                    <p className="font-semibold truncate">{sub.name}</p>
                  </div>
                ),
              },
              {
                key: "categoryId", label: "Category", sortable: true,
                // Removed filterType to avoid oversized select; category filter is available at top
                exportValue: (sub) => categories.find((c) => c.id === sub.categoryId)?.name || "",
                render: (sub) => categories.find((c) => c.id === sub.categoryId)?.name || "—",
              },
              {
                key: "isActive", label: "Active", sortable: true, filterType: "select",
                filterOptions: ["Yes", "No"],
                exportValue: (sub) => (sub.isActive ? "Yes" : "No"),
                render: (sub) => (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sub.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {sub.isActive ? "Yes" : "No"}
                  </span>
                ),
              },
              { key: "sortOrder", label: "Sort", sortable: true, align: "center", render: (sub) => sub.sortOrder || 0 },
            ]}
            rowActions={(sub) => (
              <>
                <button
                  onClick={() => { setEditingSub(sub.id); setSubForm({ name: sub.name || "", categoryId: sub.categoryId || "", image: sub.image || "", sortOrder: sub.sortOrder || 0, isActive: sub.isActive ?? true }); setShowSubForm(true); }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDeleteSubcategory(sub.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={13} />
                </button>
              </>
            )}
            onImportRow={async (row) => {
              const name = row["Subcategory"]?.trim() || row["name"]?.trim();
              const categoryName = row["Category"]?.trim();
              const category = categories.find((c) => c.name.toLowerCase() === (categoryName || "").toLowerCase());
              if (!name) throw new Error("Subcategory name is required");
              if (!category) throw new Error(`Category "${categoryName}" not found`);
              await categoriesApi.createSubcategory({
                name,
                categoryId: category.id,
                image: row["image"]?.trim() || "",
                sortOrder: Number(row["Sort"]) || 0,
                isActive: (row["Active"] || "Yes").trim().toLowerCase() !== "no",
              });
            }}
            onImported={fetchData}
          />
        </div>
      </div>
    </div>
  );
}