"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Plus, Trash2, Bold, Italic, List as ListIcon, Upload, FileText } from "lucide-react";
import BrochureUploader from "./BrochureUploader";
import productsApi from "@/lib/productsApi";
import ProductImageUploader from "./ProductImageUploader";

export default function ProductFormModal({ open, initialData, categories, subcategories, brands, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "", categoryId: "", subcategoryId: "", distributorId: "",
    model: "", name: "", keyFeatures: "", brand: "",
    specifications: {}, certifications: [], images: [],
    description: "",
  });

  const [newCert, setNewCert] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  // Brochure picked during CREATE (no product id yet) — uploaded after save.
  const [pendingBrochure, setPendingBrochure] = useState(null);

  useEffect(() => {
    setPendingBrochure(null);
    if (initialData) {
      const brandObj = (initialData.brand && typeof initialData.brand === "object") ? initialData.brand : null;
      const resolvedBrandId = initialData.brandId || brandObj?.id || initialData.distributorId || "";
      const resolvedBrandName = brandObj?.name || (typeof initialData.brand === "string" ? initialData.brand : "")
        || brands.find((b) => b.id === resolvedBrandId)?.name || "";
      const specs = Array.isArray(initialData.specifications)
        ? initialData.specifications.reduce((acc, s) => { if (s?.key) acc[s.key] = s.value; return acc; }, {})
        : (initialData.specifications || {});
      const certs = Array.isArray(initialData.certifications)
        ? initialData.certifications.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean)
        : (initialData.certifications || []);
      setForm({
        ...initialData,
        distributorId: resolvedBrandId,
        brandId: resolvedBrandId,
        brand: resolvedBrandName,
        specifications: specs,
        certifications: certs,
      });
    } else {
      setForm({
        id: "", categoryId: categories[0]?.id || "", subcategoryId: "", distributorId: brands[0]?.id || "",
        brandId: brands[0]?.id || "",
        model: "", name: "", keyFeatures: "", brand: brands[0]?.name || "",
        specifications: {}, certifications: [], images: [], description: "",
      });
    }
  }, [initialData, categories, brands]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleBrandChange = (distributorId) => {
    const selectedBrand = brands.find((b) => b.id === distributorId);
    updateField("distributorId", distributorId);
    updateField("brandId", distributorId);
    updateField("brand", selectedBrand?.name || "");
  };

  const addSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [newSpecKey.trim()]: newSpecValue.trim() } }));
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const removeSpecification = (key) => {
    setForm((prev) => {
      const updated = { ...prev.specifications };
      delete updated[key];
      return { ...prev, specifications: updated };
    });
  };

  const addCertification = () => {
    if (!newCert.trim()) return;
    setForm((prev) => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
    setNewCert("");
  };

  const removeCertification = (index) => {
    setForm((prev) => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  const insertFormatting = (format) => {
    const textarea = document.getElementById("product-description-editor");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.description || "";
    let replacement = "";
    switch (format) {
      case "bold": replacement = `**${text.substring(start, end) || "bold text"}**`; break;
      case "italic": replacement = `*${text.substring(start, end) || "italic text"}*`; break;
      case "list": replacement = `\n- ${text.substring(start, end) || "list item"}`; break;
      case "heading": replacement = `\n## ${text.substring(start, end) || "heading"}\n`; break;
      default: break;
    }
    const newText = text.substring(0, start) + replacement + text.substring(end);
    updateField("description", newText);
  };

  const getFilteredSubcategories = () => subcategories.filter((s) => s.categoryId === form.categoryId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) { alert("Product name is required"); return; }
    const specifications = Array.isArray(form.specifications)
      ? form.specifications.reduce((acc, s) => { if (s?.key) acc[s.key] = s.value; return acc; }, {})
      : (form.specifications || {});
    const certifications = (form.certifications || []).map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean);
    const images = (form.images || []).map((img) => ({
      url: img.url, title: img.title || "", angle: img.angle || "", altText: img.altText || "",
    }));
    const payload = {
      name: form.name,
      model: form.model || undefined,
      description: form.description || undefined,
      keyFeatures: form.keyFeatures || undefined,
      material: form.material || undefined,
      manufacturer: form.manufacturer || undefined,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || undefined,
      brandId: form.brandId || form.distributorId || undefined,
      isActive: form.isActive !== undefined ? form.isActive : true,
      isFeatured: form.isFeatured || false,
      images,
      specifications,
      certifications,
    };
    // Second arg carries a brochure file chosen during CREATE so the parent
    // can upload it once the product (and its id) exists.
    onSave(payload, pendingBrochure);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold">{initialData ? "Edit Product" : "Create Product"}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          
          {/* ============================================ */}
          {/* 1. BASIC INFORMATION */}
          {/* ============================================ */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Product Name *</label>
                <input type="text" value={form.name || ""} onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Product name" className="w-full rounded-xl border px-4 py-3 text-sm" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Model Number</label>
                <input type="text" value={form.model || ""} onChange={(e) => updateField("model", e.target.value)}
                  placeholder="Model number" className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <select value={form.categoryId || ""} onChange={(e) => { updateField("categoryId", e.target.value); updateField("subcategoryId", ""); }}
                  className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Category</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Subcategory</label>
                <select value={form.subcategoryId || ""} onChange={(e) => updateField("subcategoryId", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Subcategory</option>
                  {getFilteredSubcategories().map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand (Manufacturer) *</label>
                <select value={form.distributorId || ""} onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Brand</option>
                  {brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand Display Name (Auto-filled)</label>
                <input type="text" value={form.brand || ""} readOnly
                  className="w-full rounded-xl border px-4 py-3 text-sm bg-slate-50" />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium">Key Features (Short summary)</label>
              <textarea rows={2} value={form.keyFeatures || ""} onChange={(e) => updateField("keyFeatures", e.target.value)}
                placeholder="Brief key features for card display" className="w-full rounded-xl border px-4 py-3 text-sm resize-none" />
            </div>
          </div>

          {/* ============================================ */}
          {/* 2. BROCHURE UPLOAD */}
          {/* ============================================ */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">📄 Product Brochure / Catalog</h3>
            {initialData ? (
              <BrochureUploader
                product={initialData}
                onUpdate={(result) => {
                  if (result) {
                    setForm((prev) => ({
                      ...prev,
                      brochureUrl: result.brochureUrl || result.url,
                      brochureName: result.brochureName || result.name,
                      brochureSize: result.brochureSize || result.size,
                      brochureFormat: result.brochureFormat || result.format,
                    }));
                  } else {
                    setForm((prev) => ({
                      ...prev,
                      brochureUrl: null,
                      brochureName: null,
                      brochureSize: null,
                      brochureFormat: null,
                    }));
                  }
                }}
              />
            ) : (
              /* CREATE mode: no product id yet, so collect the file and upload
                 it right after the product is created. */
              <PendingBrochurePicker
                file={pendingBrochure}
                onPick={setPendingBrochure}
                onClear={() => setPendingBrochure(null)}
              />
            )}
          </div>

          {/* ============================================ */}
          {/* 3. DESCRIPTION */}
          {/* ============================================ */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Description (Rich Text)</h3>
            <div className="flex gap-1 mb-2 bg-slate-100 rounded-lg p-1.5">
              {[
                { icon: <Bold size={14} />, format: "bold", title: "Bold" },
                { icon: <Italic size={14} />, format: "italic", title: "Italic" },
                { icon: <ListIcon size={14} />, format: "list", title: "Bullet List" },
                { icon: <span className="text-xs font-bold">H</span>, format: "heading", title: "Heading" },
              ].map((btn) => (
                <button key={btn.format} type="button" onClick={() => insertFormatting(btn.format)}
                  title={btn.title} className="rounded-lg p-2 hover:bg-white hover:shadow-sm transition-all text-slate-600">
                  {btn.icon}
                </button>
              ))}
            </div>
            <textarea id="product-description-editor" rows={8} value={form.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Write detailed product description here...&#10;&#10;**bold text** for emphasis&#10;*italic text* for notes&#10;- list items&#10;## headings"
              className="w-full rounded-xl border px-4 py-3 text-sm resize-none font-mono" />
            <p className="text-[10px] text-slate-400 mt-1">Supports Markdown: **bold**, *italic*, - lists, ## headings</p>
          </div>

          {/* ============================================ */}
          {/* 4. SPECIFICATIONS */}
          {/* ============================================ */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Specifications (Key-Value Pairs)</h3>
            <p className="text-xs text-slate-500 mb-3">Add unlimited custom specifications like Material, Weight, Dimensions, etc.</p>
            <div className="space-y-2 mb-4">
              {Object.entries(form.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 rounded-xl border p-3 bg-slate-50">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg min-w-[100px] text-center">{key}</span>
                  <span className="flex-1 text-sm text-slate-700">{value}</span>
                  <button type="button" onClick={() => removeSpecification(key)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())}
                placeholder="Key (e.g. Material, Weight, Color)" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
              <input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())}
                placeholder="Value (e.g. Steel, 5kg, Red)" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
              <button type="button" onClick={addSpecification}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700 shrink-0">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* ============================================ */}
          {/* 5. CERTIFICATIONS */}
          {/* ============================================ */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Certifications</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newCert} onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                placeholder="e.g. ISO 9001:2015" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
              <button type="button" onClick={addCertification}
                className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.certifications || []).map((cert, i) => (
                <span key={i} className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700">
                  🛡️ {cert}
                  <button type="button" onClick={() => removeCertification(i)} className="text-red-500 hover:text-red-700"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* 6. IMAGES */}
          {/* ============================================ */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Images</h3>
            <ProductImageUploader
              images={form.images || []}
              productId={initialData?.id}
              onChange={(next) => updateField("images", next)}
            />
          </div>

        </form>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            <Save size={16} /> {initialData ? "Update" : "Create"} Product
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Brochure picker used during CREATE (before a product id exists).
 * It only holds the chosen file in memory; the actual upload happens in the
 * parent page once the product has been created.
 */
function PendingBrochurePicker({ file, onPick, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const allowed = [
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg", "image/png", "image/webp",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const pick = (f) => {
    if (!f) return;
    if (!allowed.includes(f.type)) { alert("Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX"); return; }
    if (f.size > 20 * 1024 * 1024) { alert("File size must be under 20MB"); return; }
    onPick(f);
  };

  if (file) {
    return (
      <div className="bg-slate-50 rounded-xl border p-4 flex items-center gap-3">
        <FileText size={22} className="text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{file.name}</p>
          <p className="text-[10px] text-slate-400">
            {(file.size / 1024).toFixed(0)} KB · will upload after product is created
          </p>
        </div>
        <button type="button" onClick={onClear}
          className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 rounded-lg px-3 py-1.5">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
      }`}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
        onChange={(e) => pick(e.target.files?.[0])} />
      <Upload size={32} className="mx-auto text-slate-400" />
      <p className="text-sm font-bold text-slate-600 mt-2">Drop brochure here or click to browse</p>
      <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX (Max 20MB)</p>
    </div>
  );
}