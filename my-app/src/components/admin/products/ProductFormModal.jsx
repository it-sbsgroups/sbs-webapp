// src/components/admin/products/ProductFormModal.jsx

"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Plus, Trash2, Upload, FileText, Search, AlertTriangle } from "lucide-react";
import BrochureUploader from "./BrochureUploader";
import DesignFileUploader from "./DesignFileUploader";
import BrochureExtractPanel from "./BrochureExtractPanel";
import productsApi from "@/lib/productsApi";
import applicationsApi from "@/lib/applicationsApi";
import ProductImageUploader from "./ProductImageUploader";
import RichTextEditor from "@/components/shared/RichTextEditor";
import VariantsManager from "./VariantsManager";

const STORAGE_KEY_FORM = "sbs_admin_product_form_data";

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const normalizeVideoUrl = (input) => {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.startsWith("<iframe")) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    if (match) return match[1];
  }
  if (trimmed.includes("watch?v=")) return trimmed.replace("watch?v=", "embed/");
  if (trimmed.includes("youtu.be/")) {
    const id = trimmed.split("youtu.be/")[1]?.split("?")[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  return trimmed;
};

function NotifyMeCount({ productId }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    productsApi.getNotifyList(productId)
      .then((res) => setCount(res?.count ?? 0))
      .catch(() => setCount(null));
  }, [productId]);
  if (count === null) return null;
  return (
    <p className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
      🔔 {count} visitor{count === 1 ? "" : "s"} signed up to be notified at launch
    </p>
  );
}

// ─── Generic Autocomplete Component ────────────────────────────────────────
function AutocompleteInput({ 
  items, 
  selectedItems, 
  onToggle, 
  onAddCustom, 
  placeholder, 
  iconColor = "bg-indigo-500",
  highlightColor = "bg-indigo-50 text-indigo-700",
}) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);
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
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
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
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border px-4 py-3 pl-9 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

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
            No match found. Press Enter to add <strong>"{toTitleCase(inputValue)}"</strong> as a new item.
          </p>
        </div>
      )}

      {inputValue.trim() && (
        <button
          type="button"
          onClick={handleAddCustom}
          className="mt-2 flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Add "{toTitleCase(inputValue)}"
        </button>
      )}
    </div>
  );
}

// ─── Editable Tag Component ────────────────────────────────────────────────
function EditableTag({ value, onSave, onRemove, color = "green", icon = null }) {
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
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
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

  const colorClasses =
    color === "green"
      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100";

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${colorClasses}`}>
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
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 shrink-0 text-red-400 hover:text-red-600"
      >
        <X size={12} />
      </button>
    </span>
  );
}

// ─── Editable Specification Row ─────────────────────────────────────────────
function EditableSpecRow({ specKey, value, onSave, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(specKey);
  const [editValue, setEditValue] = useState(value);
  const keyRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      keyRef.current?.focus();
      keyRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newKey = editKey.trim();
    const newValue = editValue.trim();
    if (newKey && (newKey !== specKey || newValue !== value)) {
      onSave(specKey, { key: newKey, value: newValue });
    }
    setEditKey(newKey || specKey);
    setEditValue(newValue || value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditKey(specKey);
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border p-3 bg-slate-50 hover:bg-slate-100 transition-colors">
      {isEditing ? (
        <>
          <input
            ref={keyRef}
            type="text"
            value={editKey}
            onChange={(e) => setEditKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Key"
            className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg min-w-[100px] focus:outline-none focus:border-blue-400"
          />
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Value"
            className="flex-1 text-sm text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => { setEditKey(specKey); setEditValue(value); setIsEditing(true); }}
            className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg min-w-[100px] hover:bg-blue-100 transition-colors"
            title="Click to edit key"
          >
            {specKey}
          </button>
          <button
            type="button"
            onClick={() => { setEditKey(specKey); setEditValue(value); setIsEditing(true); }}
            className="flex-1 text-sm text-slate-700 text-left hover:text-blue-700 hover:underline"
            title="Click to edit value"
          >
            {value}
          </button>
        </>
      )}
      <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 p-1">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Duplicate Model Warning Banner ────────────────────────────────────────
function DuplicateModelWarning({ duplicateProduct, onContinue, onCancel }) {
  if (!duplicateProduct) return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-800">A product with this model already exists!</p>
        <p className="text-xs text-amber-600 mt-1">
          Product: <strong>{duplicateProduct.name}</strong> (SKU: {duplicateProduct.id})
        </p>
        <p className="text-xs text-amber-600 mt-0.5">
          You can continue to create this product, but it may cause confusion in your catalog.
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onContinue}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
        >
          Continue Anyway
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          Change Model
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ProductFormModal({
  open,
  initialData,
  categories,
  subcategories,
  brands,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    id: "",
    categoryId: "",
    subcategoryId: "",
    distributorId: "",
    model: "",
    name: "",
    keyFeatures: "",
    brand: "",
    specifications: {},
    certifications: [],
    applications: [],
    images: [],
    description: "",
    videoUrl: "",
    metaTitle: "",
    metaDescription: "",
    isPrelaunch: false,
    launchDate: "",
    prelaunchTeaser: "",
  });

  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [pendingBrochure, setPendingBrochure] = useState(null);
  const [pendingDesignFile, setPendingDesignFile] = useState(null);

  const [duplicateModel, setDuplicateModel] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  const [availableApplications, setAvailableApplications] = useState([]);
  useEffect(() => {
    if (!open) return;
    applicationsApi.getAll()
      .then((apps) => {
        const normalized = (Array.isArray(apps) ? apps : [])
          .map((a) => ({ ...a, name: toTitleCase(a?.name || "") }))
          .filter((a) => a.name);
        const unique = new Map();
        normalized.forEach((a) => unique.set(a.name.toLowerCase(), a));
        setAvailableApplications(Array.from(unique.values()));
      })
      .catch(() => setAvailableApplications([]));
  }, [open]);

  const [availableCertifications, setAvailableCertifications] = useState([]);
  useEffect(() => {
    if (!open) return;
    productsApi.getAll({ pageSize: 1000 })
      .then((res) => {
        const products = res?.data || res || [];
        const certSet = new Set();
        products.forEach((p) => {
          (p.certifications || []).forEach((c) => {
            const name = typeof c === "string" ? c : c?.name;
            if (name) certSet.add(toTitleCase(name));
          });
        });
        setAvailableCertifications(Array.from(certSet).sort());
      })
      .catch(() => setAvailableCertifications([]));
  }, [open]);

  useEffect(() => {
    if (open && !initialData) {
      const saved = sessionStorage.getItem(STORAGE_KEY_FORM);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm((prev) => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open && !initialData) {
      sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(form));
    }
  }, [form, open, initialData]);

  const clearDraft = () => sessionStorage.removeItem(STORAGE_KEY_FORM);

  useEffect(() => {
    setPendingBrochure(null);
    setPendingDesignFile(null);
    setDuplicateModel(null);
    setAllowDuplicate(false);
    
    if (initialData) {
      clearDraft();
      const brandObj = initialData.brand && typeof initialData.brand === "object" ? initialData.brand : null;
      const resolvedBrandId = initialData.brandId || brandObj?.id || initialData.distributorId || "";
      const resolvedBrandName = brandObj?.name || (typeof initialData.brand === "string" ? initialData.brand : "") || brands.find((b) => b.id === resolvedBrandId)?.name || "";
      const specs = Array.isArray(initialData.specifications)
        ? initialData.specifications.reduce((acc, s) => { if (s?.key) acc[s.key] = s.value; return acc; }, {})
        : initialData.specifications || {};
      const certs = Array.isArray(initialData.certifications)
        ? initialData.certifications.map((c) => typeof c === "string" ? c : c?.name).filter(Boolean)
        : initialData.certifications || [];
      const applications = Array.isArray(initialData.applications)
        ? initialData.applications.map((a) => ({ id: a.id, name: toTitleCase(a.name) }))
        : [];
      setForm({ ...initialData, distributorId: resolvedBrandId, brandId: resolvedBrandId, brand: resolvedBrandName, specifications: specs, certifications: certs, applications, videoUrl: initialData.videoUrl || "", launchDate: initialData.launchDate ? new Date(initialData.launchDate).toISOString().slice(0, 16) : "" });
    } else {
      setForm({ id: "", categoryId: categories[0]?.id || "", subcategoryId: "", distributorId: brands[0]?.id || "", brandId: brands[0]?.id || "", model: "", name: "", keyFeatures: "", brand: brands[0]?.name || "", specifications: {}, certifications: [], applications: [], images: [], description: "", videoUrl: "" });
    }
  }, [initialData, categories, brands]);

  useEffect(() => {
    if (!open || !form.model || form.model.trim().length < 2) {
      setDuplicateModel(null);
      setAllowDuplicate(false);
      return;
    }
    setAllowDuplicate(false);
    const timer = setTimeout(() => {
      setCheckingDuplicate(true);
      productsApi.getAll({ search: form.model.trim(), pageSize: 10 })
        .then((res) => {
          const products = res?.data || res || [];
          const duplicate = products.find((p) => p.model?.toLowerCase() === form.model.trim().toLowerCase() && (!initialData || p.id !== initialData.id));
          setDuplicateModel(duplicate || null);
        })
        .catch((err) => { console.error("Failed to check duplicate model:", err); setDuplicateModel(null); })
        .finally(() => setCheckingDuplicate(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [form.model, open, initialData]);

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

  const updateSpecification = (oldKey, { key, value }) => {
    setForm((prev) => {
      const updated = { ...prev.specifications };
      delete updated[oldKey];
      updated[key] = value;
      return { ...prev, specifications: updated };
    });
  };

  const isCertificationSelected = (cert) =>
    (form.certifications || []).some((c) => c?.toLowerCase() === cert?.toLowerCase());

  const toggleCertification = (cert) => {
    setForm((prev) => {
      const list = prev.certifications || [];
      const certName = toTitleCase(cert);
      const already = list.some((c) => c?.toLowerCase() === certName.toLowerCase());
      return { ...prev, certifications: already ? list.filter((c) => c?.toLowerCase() !== certName.toLowerCase()) : [...list, certName] };
    });
  };

  const addCustomCertification = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const formatted = toTitleCase(trimmed);
    setForm((prev) => {
      const list = prev.certifications || [];
      const already = list.some((c) => c?.toLowerCase() === formatted.toLowerCase());
      return already ? prev : { ...prev, certifications: [...list, formatted] };
    });
  };

  const editCertification = (oldValue, newValue) => {
    const formatted = toTitleCase(newValue.trim());
    setForm((prev) => {
      const list = prev.certifications || [];
      return { ...prev, certifications: list.map((c) => c?.toLowerCase() === oldValue?.toLowerCase() ? formatted : c) };
    });
  };

  const removeCertification = (index) => {
    setForm((prev) => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  const isApplicationSelected = (app) =>
    (form.applications || []).some((a) => (a.id && a.id === app.id) || (!a.id && a.name === app.name));

  const toggleApplication = (app) => {
    setForm((prev) => {
      const list = prev.applications || [];
      const already = list.some((a) => (a.id && a.id === app.id) || (!a.id && a.name === app.name));
      return { ...prev, applications: already ? list.filter((a) => !((a.id && a.id === app.id) || (!a.id && a.name === app.name))) : [...list, { id: app.id, name: toTitleCase(app.name) }] };
    });
  };

  const addCustomApplication = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const formatted = toTitleCase(trimmed);
    const existing = availableApplications.find((a) => a.name.toLowerCase() === formatted.toLowerCase());
    setForm((prev) => {
      const list = prev.applications || [];
      const ref = existing ? { id: existing.id, name: existing.name } : { name: formatted };
      const already = list.some((a) => (a.id && existing && a.id === existing.id) || a.name.toLowerCase() === formatted.toLowerCase());
      return already ? prev : { ...prev, applications: [...list, ref] };
    });
  };

  const editApplication = (oldName, newName) => {
    const formatted = toTitleCase(newName.trim());
    setForm((prev) => {
      const list = prev.applications || [];
      return { ...prev, applications: list.map((a) => a.name?.toLowerCase() === oldName?.toLowerCase() ? { ...a, name: formatted } : a) };
    });
  };

  const removeApplication = (index) => {
    setForm((prev) => ({ ...prev, applications: prev.applications.filter((_, i) => i !== index) }));
  };

  const handleApplyExtracted = (fields) => {
    setForm((prev) => {
      const next = { ...prev };
      if (fields.name) next.name = fields.name;
      if (fields.model) next.model = fields.model;
      if (fields.description) {
        const block = `<p>${escapeHtml(fields.description)}</p>`;
        next.description = prev.description ? prev.description + block : block;
      }
      if (fields.keyFeatures?.length) {
        const list = `<ul>${fields.keyFeatures.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`;
        next.keyFeatures = prev.keyFeatures ? prev.keyFeatures + list : list;
      }
      if (fields.specifications?.length) {
        next.specifications = { ...prev.specifications };
        fields.specifications.forEach((s) => { if (s?.key) next.specifications[s.key] = s.value; });
      }
      return next;
    });
  };

  const getFilteredSubcategories = () =>
    subcategories.filter((s) => s.categoryId === form.categoryId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (duplicateModel && !allowDuplicate) {
      setAllowDuplicate(false);
      alert("A product with this model already exists. Please choose 'Continue Anyway' to proceed.");
      return;
    }
    if (!form.name?.trim()) {
      alert("Product name is required");
      return;
    }

    const base = initialData ? {
      name: initialData.name, model: initialData.model, description: initialData.description, keyFeatures: initialData.keyFeatures, material: initialData.material, manufacturer: initialData.manufacturer, categoryId: initialData.categoryId, subcategoryId: initialData.subcategoryId, brandId: initialData.brandId, isActive: initialData.isActive, isFeatured: initialData.isFeatured, metaTitle: initialData.metaTitle, metaDescription: initialData.metaDescription, slug: initialData.slug, keywords: initialData.keywords, brochureUrl: initialData.brochureUrl, brochureName: initialData.brochureName, brochureSize: initialData.brochureSize, brochureFormat: initialData.brochureFormat, brochurePublicId: initialData.brochurePublicId, brochureResourceType: initialData.brochureResourceType, designFileUrl: initialData.designFileUrl, designFileName: initialData.designFileName, designFileSize: initialData.designFileSize, designFileFormat: initialData.designFileFormat, videoUrl: initialData.videoUrl, images: Array.isArray(initialData.images) ? initialData.images.map((img) => ({ url: img.url, title: img.title || "", angle: img.angle || "", altText: img.altText || "" })) : [], specifications: Array.isArray(initialData.specifications) ? initialData.specifications.reduce((acc, s) => { if (s?.key) acc[s.key] = s.value; return acc; }, {}) : initialData.specifications || {}, certifications: Array.isArray(initialData.certifications) ? initialData.certifications.map((c) => typeof c === "string" ? c : c?.name).filter(Boolean) : initialData.certifications || [], applications: Array.isArray(initialData.applications) ? initialData.applications.map((a) => ({ id: a.id })) : [],
    } : {};

    const payload = {
      ...base,
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
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      isPrelaunch: form.isPrelaunch || false,
      launchDate: form.launchDate || undefined,
      prelaunchTeaser: form.prelaunchTeaser || undefined,
      videoUrl: normalizeVideoUrl(form.videoUrl) || undefined,
      images: (form.images || []).map((img) => ({ url: img.url, title: img.title || "", angle: img.angle || "", altText: img.altText || "" })),
      specifications: Array.isArray(form.specifications) ? form.specifications.reduce((acc, s) => { if (s?.key) acc[s.key] = s.value; return acc; }, {}) : form.specifications || {},
      certifications: (form.certifications || []).map((c) => typeof c === "string" ? c : c?.name).filter(Boolean),
      applications: (form.applications || []).map((a) => a.id ? { id: a.id } : { name: a.name }),
      brochureUrl: form.brochureUrl || undefined,
      brochureName: form.brochureName || undefined,
      brochureSize: form.brochureSize || undefined,
      brochureFormat: form.brochureFormat || undefined,
      brochurePublicId: form.brochurePublicId || undefined,
      brochureResourceType: form.brochureResourceType || undefined,
      designFileUrl: form.designFileUrl || undefined,
      designFileName: form.designFileName || undefined,
      designFileSize: form.designFileSize || undefined,
      designFileFormat: form.designFileFormat || undefined,
    };

    Object.keys(payload).forEach((key) => { if (payload[key] === undefined) delete payload[key]; });

    clearDraft();
    onSave(payload, pendingBrochure, pendingDesignFile);
  };

  const handleClose = () => {
    clearDraft();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold">{initialData ? "Edit Product" : "Create Product"}</h2>
          <button onClick={handleClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {duplicateModel && !allowDuplicate && (
            <DuplicateModelWarning
              duplicateProduct={duplicateModel}
              onContinue={() => setAllowDuplicate(true)}
              onCancel={() => { setAllowDuplicate(false); setForm((prev) => ({ ...prev, model: "" })); setDuplicateModel(null); }}
            />
          )}

          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Product Name *</label>
                <input type="text" value={form.name || ""} onChange={(e) => updateField("name", e.target.value)} placeholder="Product name" className="w-full rounded-xl border px-4 py-3 text-sm" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Model Number {checkingDuplicate && <span className="text-[10px] text-slate-400">(checking...)</span>}</label>
                <input type="text" value={form.model || ""} onChange={(e) => updateField("model", e.target.value)} placeholder="Model number" className={`w-full rounded-xl border px-4 py-3 text-sm ${duplicateModel && !allowDuplicate ? "border-amber-400 bg-amber-50" : "border-slate-200 focus:border-blue-500"}`} />
                {duplicateModel && !allowDuplicate && <p className="text-[10px] text-amber-600 mt-1">⚠️ Model already exists</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <select value={form.categoryId || ""} onChange={(e) => { updateField("categoryId", e.target.value); updateField("subcategoryId", ""); }} className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Subcategory</label>
                <select value={form.subcategoryId || ""} onChange={(e) => updateField("subcategoryId", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Subcategory</option>
                  {getFilteredSubcategories().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand (Manufacturer)</label>
                <select value={form.distributorId || ""} onChange={(e) => handleBrandChange(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm">
                  <option value="">Select Brand</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand Display Name (Auto-filled)</label>
                <input type="text" value={form.brand || ""} readOnly className="w-full rounded-xl border px-4 py-3 text-sm bg-slate-50" />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium">Key Features (Short summary)</label>
              <RichTextEditor value={form.keyFeatures || ""} onChange={(html) => updateField("keyFeatures", html)} placeholder="Brief key features for card display – supports formatting" uploadFolder="product-key-features" resetKey={form.id || "new-product"} />
            </div>
          </div>

          {/* ===== APPLICATION AREAS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-1">Application Areas</h3>
            <p className="text-xs text-slate-500 mb-3">Where this product is used — Industrial, Agriculture, Home DIY, etc.</p>

            {(form.applications || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.applications.map((app, i) => (
                  <EditableTag
                    key={app.id || app.name}
                    value={app.name}
                    onSave={(newName) => editApplication(app.name, newName)}
                    onRemove={() => removeApplication(i)}
                    color="indigo"
                  />
                ))}
              </div>
            )}

            <AutocompleteInput
              items={availableApplications}
              selectedItems={form.applications || []}
              onToggle={toggleApplication}
              onAddCustom={addCustomApplication}
              placeholder="Type to search or add new application..."
              iconColor="bg-indigo-500"
              highlightColor="bg-indigo-50 text-indigo-700"
            />
          </div>

          {/* ===== CERTIFICATIONS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Certifications</h3>
            <p className="text-xs text-slate-500 mb-3">Add ISO, CE, or other certifications. Type to search from existing.</p>

            {(form.certifications || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.certifications.map((cert, i) => (
                  <EditableTag
                    key={i}
                    value={cert}
                    onSave={(newCert) => editCertification(cert, newCert)}
                    onRemove={() => removeCertification(i)}
                    color="green"
                    icon="🛡️"
                  />
                ))}
              </div>
            )}

            <AutocompleteInput
              items={availableCertifications}
              selectedItems={form.certifications || []}
              onToggle={toggleCertification}
              onAddCustom={addCustomCertification}
              placeholder="Type to search or add new certification..."
              iconColor="bg-green-500"
              highlightColor="bg-green-50 text-green-700"
            />
          </div>

          {/* ===== SPECIFICATIONS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Specifications (Key-Value Pairs)</h3>
            <div className="space-y-2 mb-4">
              {Object.entries(form.specifications || {}).map(([key, value]) => (
                <EditableSpecRow
                  key={key}
                  specKey={key}
                  value={value}
                  onSave={(oldKey, newData) => updateSpecification(oldKey, newData)}
                  onRemove={() => removeSpecification(key)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())} placeholder="Key (e.g. Material, Weight, Color)" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
              <input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())} placeholder="Value (e.g. Steel, 5kg, Red)" className="flex-1 rounded-xl border px-4 py-3 text-sm" />
              <button type="button" onClick={addSpecification} className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700 shrink-0"><Plus size={14} /> Add</button>
            </div>
          </div>

          {/* ===== BROCHURE UPLOAD ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Brochure</h3>
            {initialData ? (
              <>
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
                      setForm((prev) => ({ ...prev, brochureUrl: null, brochureName: null, brochureSize: null, brochureFormat: null }));
                    }
                  }}
                />
                {form.brochureUrl && <BrochureExtractPanel productId={initialData.id} onApply={handleApplyExtracted} />}
              </>
            ) : (
              <>
                <PendingBrochurePicker file={pendingBrochure} onPick={setPendingBrochure} onClear={() => setPendingBrochure(null)} />
                <p className="mt-2 text-[11px] text-slate-400">Save the product first, then re-open it here to auto-fill fields from this brochure.</p>
              </>
            )}
          </div>

          {/* ===== PRODUCT DESIGN FILE ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Design File</h3>
            <p className="text-xs text-slate-500 mb-3">CAD drawing, artwork, or spec sheet used internally.</p>
            {initialData ? (
              <DesignFileUploader
                product={initialData}
                onUpdate={(result) => {
                  if (result) {
                    setForm((prev) => ({
                      ...prev,
                      designFileUrl: result.designFileUrl || result.url,
                      designFileName: result.designFileName || result.name,
                      designFileSize: result.designFileSize || result.size,
                      designFileFormat: result.designFileFormat || result.format,
                    }));
                  } else {
                    setForm((prev) => ({ ...prev, designFileUrl: null, designFileName: null, designFileSize: null, designFileFormat: null }));
                  }
                }}
              />
            ) : (
              <PendingDesignFilePicker file={pendingDesignFile} onPick={setPendingDesignFile} onClear={() => setPendingDesignFile(null)} />
            )}
          </div>

          {/* ===== VIDEO URL ===== */}
          <div>
            <label className="mb-1.5 block text-xs font-medium">Video URL (YouTube / Vimeo embed)</label>
            <div className="space-y-2">
              <input
                type="text"
                value={form.videoUrl || ""}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                onBlur={(e) => {
                  const normalized = normalizeVideoUrl(e.target.value);
                  if (normalized !== e.target.value) updateField("videoUrl", normalized);
                }}
                placeholder="https://www.youtube.com/embed/... or paste iframe"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />
              {form.videoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Preview:</p>
                  <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                    <iframe src={form.videoUrl} className="w-full h-full" allowFullScreen loading="lazy" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Description</h3>
            <RichTextEditor
              value={form.description || ""}
              onChange={(html) => updateField("description", html)}
              placeholder="Write a detailed product description…"
              uploadFolder="product-descriptions"
              resetKey={form.id || "new-product"}
            />
          </div>

          {/* ===== SEO ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-1">SEO</h3>
            <p className="text-xs text-slate-500 mb-4">Controls how this product appears in search results.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
                <input type="text" value={form.metaTitle || ""} onChange={(e) => updateField("metaTitle", e.target.value)} maxLength={70} placeholder={form.name || "Product name — SBS Groups"} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                <textarea value={form.metaDescription || ""} onChange={(e) => updateField("metaDescription", e.target.value)} maxLength={160} rows={3} placeholder="A short, compelling summary for search results…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* ===== IMAGES ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Images</h3>
            <ProductImageUploader images={form.images || []} productId={initialData?.id} onChange={(next) => updateField("images", next)} />
          </div>

          {/* ===== PRE-LAUNCH / TEASER ===== */}
          <div className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Pre-launch / Teaser</h3>
                <p className="text-xs text-slate-500 mt-0.5">Announce an upcoming product before it&apos;s available to order.</p>
              </div>
              <label className="flex items-center gap-2 shrink-0 ml-4">
                <input type="checkbox" checked={form.isPrelaunch || false} onChange={(e) => updateField("isPrelaunch", e.target.checked)} className="h-4 w-4" />
                <span className="text-xs font-bold">{form.isPrelaunch ? "Enabled" : "Disabled"}</span>
              </label>
            </div>
            {form.isPrelaunch && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Launch Date</label>
                  <input type="datetime-local" value={form.launchDate || ""} onChange={(e) => updateField("launchDate", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Teaser Text</label>
                  <textarea rows={3} value={form.prelaunchTeaser || ""} onChange={(e) => updateField("prelaunchTeaser", e.target.value)} placeholder="Something exciting is coming…" className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
                </div>
                {initialData?.id && <NotifyMeCount productId={initialData.id} />}
              </div>
            )}
          </div>

          {/* ===== VARIANTS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-1">Variants</h3>
            {initialData?.id ? (
              <VariantsManager productId={initialData.id} brands={brands} availableApplications={availableApplications} mainProduct={form} />
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">Save the product first, then re-open it here to add color/size/material variants.</p>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button type="button" onClick={handleClose} className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleSubmit} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"><Save size={16} /> {initialData ? "Update" : "Create"} Product</button>
        </div>
      </div>
    </div>
  );
}

// ─── PendingBrochurePicker ──
function PendingBrochurePicker({ file, onPick, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/webp", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  const pick = (f) => { if (!f) return; if (!allowed.includes(f.type)) { alert("Invalid file type"); return; } if (f.size > 20 * 1024 * 1024) { alert("File too large"); return; } onPick(f); };
  if (file) return (
    <div className="bg-slate-50 rounded-xl border p-4 flex items-center gap-3">
      <FileText size={22} className="text-blue-600 shrink-0" />
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{file.name}</p><p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB · will upload after product is created</p></div>
      <button type="button" onClick={onClear} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 rounded-lg px-3 py-1.5">Remove</button>
    </div>
  );
  return (
    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"}`} onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx" onChange={(e) => pick(e.target.files?.[0])} />
      <Upload size={32} className="mx-auto text-slate-400" />
      <p className="text-sm font-bold text-slate-600 mt-2">Drop brochure here or click to browse</p>
      <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX (Max 20MB)</p>
    </div>
  );
}

// ─── PendingDesignFilePicker ──
function PendingDesignFilePicker({ file, onPick, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const allowedExt = [".pdf", ".dwg", ".dxf", ".ai", ".psd", ".eps", ".svg", ".jpg", ".jpeg", ".png", ".webp"];
  const pick = (f) => { if (!f) return; const lower = f.name.toLowerCase(); if (!allowedExt.some((ext) => lower.endsWith(ext))) { alert("Invalid file type"); return; } if (f.size > 20 * 1024 * 1024) { alert("File too large"); return; } onPick(f); };
  if (file) return (
    <div className="bg-slate-50 rounded-xl border p-4 flex items-center gap-3">
      <FileText size={22} className="text-purple-600 shrink-0" />
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{file.name}</p><p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB · will upload after product is created</p></div>
      <button type="button" onClick={onClear} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 rounded-lg px-3 py-1.5">Remove</button>
    </div>
  );
  return (
    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragOver ? "border-purple-500 bg-purple-50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"}`} onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" className="hidden" accept={allowedExt.join(",")} onChange={(e) => pick(e.target.files?.[0])} />
      <Upload size={32} className="mx-auto text-slate-400" />
      <p className="text-sm font-bold text-slate-600 mt-2">Drop design file here or click to browse</p>
      <p className="text-xs text-slate-400 mt-1">PDF, DWG, DXF, AI, PSD, EPS, SVG, JPG, PNG, WebP (Max 20MB)</p>
    </div>
  );
}