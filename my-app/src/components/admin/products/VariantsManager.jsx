// src/components/admin/products/VariantsManager.jsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, X, FileText, Upload, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import productsApi from "@/lib/productsApi";
import { toStaticUrl } from "@/lib/client";
import RichTextEditor from "@/components/shared/RichTextEditor";
import ProductImageUploader from "./ProductImageUploader";

const COMMON_ATTRIBUTE_TYPES = ["Color", "Size", "Material", "Warranty", "Design"];

function buildName(attributes) {
  const vals = Object.values(attributes || {}).filter(Boolean);
  return vals.length ? vals.join(" / ") : "New Variant";
}

// ─── Autocomplete Input ───────────────────────────────────────────
function AutocompleteInput({ items, selectedItems, onToggle, onAddCustom, placeholder, iconColor, highlightColor }) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const suggestionRef = useRef(null);

  const filteredSuggestions = items
    .filter((item) => {
      const itemName = typeof item === "string" ? item : item?.name || "";
      return (
        itemName.toLowerCase().startsWith(inputValue.toLowerCase()) &&
        !selectedItems.some((sel) => {
          const selName = typeof sel === "string" ? sel : sel?.name || "";
          return selName.toLowerCase() === itemName.toLowerCase();
        })
      );
    })
    .slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    setHighlightIndex(-1);
  };

  const handleSelectSuggestion = (item) => {
    onToggle(item);
    setInputValue("");
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handleAddCustom = () => {
    if (inputValue.trim()) {
      onAddCustom(inputValue.trim());
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && filteredSuggestions[highlightIndex]) {
        handleSelectSuggestion(filteredSuggestions[highlightIndex]);
      } else if (inputValue.trim()) {
        handleAddCustom();
      }
    } else if (e.key === "Tab") {
      if (highlightIndex >= 0 && filteredSuggestions[highlightIndex]) {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={suggestionRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((item, idx) => {
            const itemName = typeof item === "string" ? item : item?.name || "";
            return (
              <button
                key={item?.id || itemName}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  idx === highlightIndex ? highlightColor : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${iconColor} shrink-0`} />
                  {itemName}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {showSuggestions && inputValue.trim() && filteredSuggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg p-3">
          <p className="text-xs text-slate-400">
            No match found. Press Enter to add <strong>"{inputValue}"</strong>.
          </p>
        </div>
      )}
      {inputValue.trim() && (
        <button
          type="button"
          onClick={handleAddCustom}
          className="mt-2 flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Add "{inputValue}"
        </button>
      )}
    </div>
  );
}

// ─── Editable Tag ───────────────────────────────────────────────────
function EditableTag({ value, onSave, onRemove, icon = null, color = "indigo" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditValue(trimmed || value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleSave();
    }
  };

  const colorClasses = color === "indigo"
    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
    : "bg-green-50 border-green-200 text-green-700";

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${colorClasses}`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-24 bg-transparent border-b border-current outline-none text-current text-xs"
        />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <button
            type="button"
            onClick={() => { setEditValue(value); setIsEditing(true); }}
            className="hover:underline cursor-pointer text-left"
            title="Click to edit"
          >
            {value}
          </button>
        </>
      )}
      <button type="button" onClick={onRemove} className="ml-1 shrink-0 text-red-400 hover:text-red-600">
        <X size={12} />
      </button>
    </span>
  );
}

// ─── VariantFileSlot ─────────────────────────────────────────────
function VariantFileSlot({ label, url, name, uploading, onUpload, onRemove, accept, pendingFileName, pendingFileSize, uploaded }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div>
      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">{label}</label>
      {url || pendingFileName ? (
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-2.5 py-2">
          <FileText size={14} className="text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-indigo-600 truncate">
              {name || pendingFileName || "File"}
            </p>
            {pendingFileSize && (
              <p className="text-[10px] text-slate-400">{(pendingFileSize / 1024).toFixed(0)} KB</p>
            )}
          </div>
          {uploaded ? (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> Uploaded
            </span>
          ) : pendingFileName ? (
            <span className="text-[10px] font-bold text-amber-600">Pending</span>
          ) : null}
          <button type="button" onClick={onRemove} className="text-slate-300 hover:text-red-500 shrink-0">
            <X size={13} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-1.5 border-2 border-dashed rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          <span>{uploading ? "Uploading…" : "Select File"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

// ─── VariantCard ─────────────────────────────────────────────────
function VariantCard({ variant, onSave, onDelete, productId, brands, availableApplications, mainProduct }) {
  const [draft, setDraft] = useState(variant);
  const [expanded, setExpanded] = useState(!variant.id);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [pendingBrochureFile, setPendingBrochureFile] = useState(null);
  const [pendingDesignFile, setPendingDesignFile] = useState(null);
  const [brochureUploaded, setBrochureUploaded] = useState(false);
  const [designUploaded, setDesignUploaded] = useState(false);

  useEffect(() => {
    setDraft(variant);
    setBrochureUploaded(!!variant?.brochureUrl);
    setDesignUploaded(!!variant?.designFileUrl);
  }, [variant]);

  useEffect(() => {
    const name = buildName(draft.attributes);
    if (name && name !== "New Variant") {
      setDraft((d) => ({ ...d, name }));
    }
  }, [draft.attributes]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(variant) || pendingBrochureFile || pendingDesignFile;

  // ── Attributes ──
  const setAttr = (key, value) => {
    setDraft((d) => {
      const attributes = { ...d.attributes, [key]: value };
      return { ...d, attributes, name: buildName(attributes) };
    });
  };
  const removeAttr = (key) => {
    setDraft((d) => {
      const attributes = { ...d.attributes };
      delete attributes[key];
      return { ...d, attributes, name: buildName(attributes) };
    });
  };
  const addCustomAttr = () => {
    const key = prompt("Attribute name (e.g. Finish, Voltage, Capacity)");
    if (key?.trim()) setAttr(key.trim(), "");
  };

  // ── Specifications ──
  const updateSpec = (idx, field, val) => {
    setDraft((d) => {
      const specs = [...(d.specifications || [])];
      specs[idx] = { ...specs[idx], [field]: val };
      return { ...d, specifications: specs };
    });
  };
  const addSpec = () => setDraft((d) => ({ ...d, specifications: [...(d.specifications || []), { key: "", value: "" }] }));
  const removeSpec = (idx) => setDraft((d) => ({ ...d, specifications: (d.specifications || []).filter((_, i) => i !== idx) }));

  // ── Applications ──
  const toggleApp = (app) => {
    setDraft((d) => {
      const list = d.applications || [];
      const already = list.some((a) => (a.id && a.id === app.id) || (!a.id && a.name === app.name));
      return {
        ...d,
        applications: already
          ? list.filter((a) => !((a.id && a.id === app.id) || (!a.id && a.name === app.name)))
          : [...list, { id: app.id, name: app.name }],
      };
    });
  };
  const addCustomApp = (name) => {
    const formatted = name.trim();
    if (!formatted) return;
    setDraft((d) => {
      const list = d.applications || [];
      const already = list.some((a) => a.name.toLowerCase() === formatted.toLowerCase());
      return already ? d : { ...d, applications: [...list, { name: formatted }] };
    });
  };
  const editApp = (oldName, newName) => {
    const formatted = newName.trim();
    if (!formatted) return;
    setDraft((d) => ({
      ...d,
      applications: (d.applications || []).map((a) =>
        a.name.toLowerCase() === oldName.toLowerCase() ? { ...a, name: formatted } : a
      ),
    }));
  };
  const removeApp = (idx) => setDraft((d) => ({ ...d, applications: (d.applications || []).filter((_, i) => i !== idx) }));

  // ── Certifications ──
  const toggleCert = (cert) => {
    setDraft((d) => {
      const list = d.certifications || [];
      const already = list.some((c) => c.toLowerCase() === cert.toLowerCase());
      return {
        ...d,
        certifications: already ? list.filter((c) => c.toLowerCase() !== cert.toLowerCase()) : [...list, cert],
      };
    });
  };
  const addCustomCert = (name) => {
    const formatted = name.trim();
    if (!formatted) return;
    setDraft((d) => {
      const list = d.certifications || [];
      const already = list.some((c) => c.toLowerCase() === formatted.toLowerCase());
      return already ? d : { ...d, certifications: [...list, formatted] };
    });
  };
  const editCert = (oldName, newName) => {
    const formatted = newName.trim();
    if (!formatted) return;
    setDraft((d) => ({
      ...d,
      certifications: (d.certifications || []).map((c) =>
        c.toLowerCase() === oldName.toLowerCase() ? formatted : c
      ),
    }));
  };
  const removeCert = (idx) => setDraft((d) => ({ ...d, certifications: (d.certifications || []).filter((_, i) => i !== idx) }));

  // ── Images ──
  const handleImagesChange = (nextImages) => {
    const urls = nextImages.map((img) => img.url).filter(Boolean);
    setDraft((d) => ({ ...d, images: urls }));
  };
  const imageObjects = (draft.images || []).map((url) => ({ url }));

  // ── Brochure Upload ──
  const handleBrochureSelect = (file) => {
    if (!file) return;
    setPendingBrochureFile(file);
    setBrochureUploaded(false);
    toast.success("Brochure file selected");
  };

  const removeBrochure = () => {
    setPendingBrochureFile(null);
    setBrochureUploaded(false);
  };

  // ── Design File Upload ──
  const handleDesignSelect = (file) => {
    if (!file) return;
    setPendingDesignFile(file);
    setDesignUploaded(false);
    toast.success("Design file selected");
  };

  const removeDesign = () => {
    setPendingDesignFile(null);
    setDesignUploaded(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await onSave(draft, pendingBrochureFile, pendingDesignFile);
      if (result) {
        setPendingBrochureFile(null);
        setPendingDesignFile(null);
        setBrochureUploaded(!!result?.brochureUrl);
        setDesignUploaded(!!result?.designFileUrl);
      }
      toast.success("Variant saved");
    } catch (err) {
      toast.error(err.message || "Failed to save variant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-slate-50">
        <button type="button" onClick={() => setExpanded((e) => !e)} className="text-slate-400 hover:text-slate-600 shrink-0">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        {draft.images?.[0] && <img src={toStaticUrl(draft.images[0])} alt="" className="w-7 h-7 rounded object-cover border shrink-0" />}
        <span className="flex-1 text-xs font-bold text-slate-800 truncate">{draft.name || "New Variant"}</span>
        <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 shrink-0">
          <input type="checkbox" checked={draft.isActive !== false} onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))} />
          Active
        </label>
        <button type="button" onClick={() => onDelete(draft)} className="text-red-400 hover:text-red-600 shrink-0" aria-label="Delete variant"><Trash2 size={14} /></button>
      </div>

      {expanded && (
        <div className="p-4 space-y-6">
          {/* ===== BASIC INFORMATION ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Model</label>
                <input
                  type="text"
                  value={draft.model || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
                  placeholder={mainProduct?.model || "Model number"}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Brand</label>
                <select
                  value={draft.brandId || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, brandId: e.target.value || null }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Using main product's brand</option>
                  {(brands || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ===== ATTRIBUTES ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Attributes</h3>
            <div className="space-y-2">
              {Object.entries(draft.attributes || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input value={key} readOnly className="w-1/4 text-xs font-bold bg-slate-50 border rounded-lg px-2 py-1.5" />
                  <input
                    value={value}
                    onChange={(e) => setAttr(key, e.target.value)}
                    placeholder="Value"
                    className="flex-1 text-xs border rounded-lg px-2 py-1.5"
                  />
                  <button type="button" onClick={() => removeAttr(key)} className="text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {COMMON_ATTRIBUTE_TYPES.filter((t) => !(draft.attributes || {})[t]).map((t) => (
                <button key={t} type="button" onClick={() => setAttr(t, "")} className="text-[10px] font-bold text-indigo-600 border border-dashed border-indigo-300 rounded-lg px-2 py-1 hover:bg-indigo-50">+ {t}</button>
              ))}
              <button type="button" onClick={addCustomAttr} className="text-[10px] font-bold text-slate-500 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50">+ Custom</button>
            </div>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <RichTextEditor
              value={draft.description || ""}
              onChange={(html) => setDraft((d) => ({ ...d, description: html }))}
              placeholder="Variant description... (leave blank to use main product's description)"
              uploadFolder="variant-descriptions"
              resetKey={draft.id || "new-variant"}
            />
          </div>

          {/* ===== KEY FEATURES ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-2">Key Features</h3>
            <RichTextEditor
              value={draft.keyFeatures || ""}
              onChange={(html) => setDraft((d) => ({ ...d, keyFeatures: html }))}
              placeholder="Variant key features... (leave blank to use main product's key features)"
              uploadFolder="variant-key-features"
              resetKey={draft.id || "new-variant"}
            />
          </div>

          {/* ===== SPECIFICATIONS ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Specifications</h3>
            {(draft.specifications || []).length > 0 && (
              <div className="space-y-2 mb-3">
                {draft.specifications.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={spec.key} onChange={(e) => updateSpec(idx, "key", e.target.value)} placeholder="Key" className="w-1/3 text-xs border rounded-lg px-2 py-1.5" />
                    <input value={spec.value} onChange={(e) => updateSpec(idx, "value", e.target.value)} placeholder="Value" className="flex-1 text-xs border rounded-lg px-2 py-1.5" />
                    <button type="button" onClick={() => removeSpec(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={addSpec} className="text-xs font-bold text-blue-600 hover:underline">+ Add Specification</button>
          </div>

          {/* ===== APPLICATIONS ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Applications</h3>
            {(draft.applications || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {draft.applications.map((app, idx) => (
                  <EditableTag
                    key={app.id || app.name}
                    value={app.name}
                    onSave={(newName) => editApp(app.name, newName)}
                    onRemove={() => removeApp(idx)}
                    color="indigo"
                  />
                ))}
              </div>
            )}
            <AutocompleteInput
              items={availableApplications}
              selectedItems={draft.applications || []}
              onToggle={toggleApp}
              onAddCustom={addCustomApp}
              placeholder="Type to search or add application..."
              iconColor="bg-indigo-500"
              highlightColor="bg-indigo-50 text-indigo-700"
            />
          </div>

          {/* ===== CERTIFICATIONS ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Certifications</h3>
            {(draft.certifications || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {draft.certifications.map((cert, idx) => (
                  <EditableTag
                    key={idx}
                    value={cert}
                    onSave={(newCert) => editCert(cert, newCert)}
                    onRemove={() => removeCert(idx)}
                    color="green"
                    icon="🛡️"
                  />
                ))}
              </div>
            )}
            <AutocompleteInput
              items={[]}
              selectedItems={draft.certifications || []}
              onToggle={toggleCert}
              onAddCustom={addCustomCert}
              placeholder="Type to search or add certification..."
              iconColor="bg-green-500"
              highlightColor="bg-green-50 text-green-700"
            />
          </div>

          {/* ===== IMAGES ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Images</h3>
            <ProductImageUploader
              images={imageObjects}
              productId={productId}
              onChange={handleImagesChange}
            />
          </div>

          {/* ===== BROCHURE ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Brochure</h3>
            <VariantFileSlot
              label="Variant Brochure"
              url={draft.brochureUrl}
              name={draft.brochureName}
              uploading={false}
              onUpload={handleBrochureSelect}
              onRemove={removeBrochure}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              pendingFileName={pendingBrochureFile?.name}
              pendingFileSize={pendingBrochureFile?.size}
              uploaded={brochureUploaded}
            />
          </div>

          {/* ===== DESIGN FILE ===== */}
          <div className="rounded-2xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Design File</h3>
            <VariantFileSlot
              label="Variant Design File"
              url={draft.designFileUrl}
              name={draft.designFileName}
              uploading={false}
              onUpload={handleDesignSelect}
              onRemove={removeDesign}
              accept=".pdf,.dwg,.dxf,.ai,.psd,.eps,.svg,.jpg,.jpeg,.png,.webp"
              pendingFileName={pendingDesignFile?.name}
              pendingFileSize={pendingDesignFile?.size}
              uploaded={designUploaded}
            />
          </div>

          {/* ===== SAVE BUTTON ===== */}
          <div className="flex justify-end border-t pt-4">
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="text-xs font-bold px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save Variant"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main VariantsManager ──────────────────────────────────────────────────
export default function VariantsManager({ productId, brands = [], availableApplications = [], mainProduct = {} }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    productsApi.getVariants(productId)
      .then((res) => setVariants(Array.isArray(res) ? res : res?.data || []))
      .catch(() => toast.error("Failed to load variants"))
      .finally(() => setLoading(false));
  };
  useEffect(load, [productId]);

  const addVariant = () => {
    setVariants((v) => [...v, {
      attributes: {},
      name: mainProduct?.name ? `${mainProduct.name} (Variant)` : "New Variant",
      model: mainProduct?.model || "",
      description: mainProduct?.description || "",
      keyFeatures: mainProduct?.keyFeatures || "",
      specifications: Array.isArray(mainProduct?.specifications)
        ? mainProduct.specifications.map((s) => ({ key: s.key, value: s.value }))
        : Object.entries(mainProduct?.specifications || {}).map(([key, value]) => ({ key, value })),
      images: Array.isArray(mainProduct?.images)
        ? mainProduct.images.map((img) => (typeof img === "string" ? img : img.url)).filter(Boolean)
        : [],
      brandId: mainProduct?.brandId || mainProduct?.brand?.id || null,
      applications: Array.isArray(mainProduct?.applications)
        ? mainProduct.applications.map((a) => ({ id: a.id, name: a.name }))
        : [],
      certifications: Array.isArray(mainProduct?.certifications)
        ? mainProduct.certifications.map((c) => (typeof c === "string" ? c : c.name))
        : [],
      isActive: true,
      sortOrder: v.length,
    }]);
  };

  const saveVariant = async (draft, pendingBrochureFile, pendingDesignFile) => {
    try {
      const payload = {
        name: draft.name || "New Variant",
        attributes: draft.attributes || {},
        model: draft.model || undefined,
        description: draft.description || undefined,
        keyFeatures: draft.keyFeatures || undefined,
        brandId: draft.brandId || null,
        isActive: draft.isActive !== undefined ? draft.isActive : true,
        sortOrder: draft.sortOrder || 0,
        specifications: Array.isArray(draft.specifications) ? draft.specifications : [],
        images: Array.isArray(draft.images) ? draft.images : [],
        applicationIds: (draft.applications || []).map((a) => a.id || a),
      };

      let savedVariant;
      if (draft.id) {
        savedVariant = await productsApi.updateVariant(productId, draft.id, payload);
      } else {
        savedVariant = await productsApi.createVariant(productId, payload);
      }

      // Upload pending files after saving
      let brochureResult = null;
      let designResult = null;

      if (pendingBrochureFile) {
        try {
          brochureResult = await productsApi.uploadVariantBrochure(productId, savedVariant.id, pendingBrochureFile);
        } catch (err) {
          toast.error("Brochure upload failed after save: " + err.message);
        }
      }

      if (pendingDesignFile) {
        try {
          designResult = await productsApi.uploadVariantDesignFile(productId, savedVariant.id, pendingDesignFile);
        } catch (err) {
          toast.error("Design file upload failed after save: " + err.message);
        }
      }

      // Merge everything
      const merged = {
        ...draft,
        ...savedVariant,
        applications: savedVariant.applications || draft.applications || [],
        images: savedVariant.images || draft.images || [],
        specifications: savedVariant.specifications || draft.specifications || [],
        brochureUrl: brochureResult?.brochureUrl || savedVariant.brochureUrl || null,
        brochureName: brochureResult?.brochureName || savedVariant.brochureName || null,
        brochureSize: brochureResult?.brochureSize || savedVariant.brochureSize || null,
        brochureFormat: brochureResult?.brochureFormat || savedVariant.brochureFormat || null,
        designFileUrl: designResult?.designFileUrl || savedVariant.designFileUrl || null,
        designFileName: designResult?.designFileName || savedVariant.designFileName || null,
        designFileSize: designResult?.designFileSize || savedVariant.designFileSize || null,
        designFileFormat: designResult?.designFileFormat || savedVariant.designFileFormat || null,
      };

      setVariants((v) => {
        const next = [...v];
        const placeholderIdx = next.findIndex((x) => !x.id);
        if (placeholderIdx !== -1) next[placeholderIdx] = merged;
        else {
          const idx = next.findIndex((x) => x.id === draft.id);
          if (idx !== -1) next[idx] = merged;
          else next.push(merged);
        }
        return next;
      });

      return merged;
    } catch (err) {
      throw err;
    }
  };

  const deleteVariant = async (draft) => {
    if (!draft.id) {
      setVariants((v) => v.filter((x) => x !== draft));
      return;
    }
    if (!confirm(`Delete variant "${draft.name}"?`)) return;
    try {
      await productsApi.deleteVariant(productId, draft.id);
      setVariants((v) => v.filter((x) => x.id !== draft.id));
      toast.success("Variant deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (loading) return <p className="text-xs text-slate-400">Loading variants…</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Optional — use this if the product comes in different colors, sizes, materials, models, etc. (like Flipkart
        variant selectors). Any field you leave blank automatically uses the main product's value — you only
        need to fill in what's actually different about this variant.
      </p>
      {variants.map((v, i) => (
        <VariantCard key={v.id || `new-${i}`} variant={v} productId={productId} brands={brands}
          availableApplications={availableApplications} mainProduct={mainProduct} onSave={saveVariant} onDelete={deleteVariant} />
      ))}
      <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border border-dashed border-indigo-300 rounded-xl px-4 py-2.5 w-full justify-center hover:bg-indigo-50">
        <Plus size={14} /> Add Variant
      </button>
    </div>
  );
}