// src/components/admin/products/ProductFormModal.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Plus, Trash2, Upload, FileText } from "lucide-react";
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

// ── Normalise video input (iframe, watch URL, short link → embed URL) ──
const normalizeVideoUrl = (input) => {
  if (!input) return "";
  const trimmed = input.trim();

  // 1. Iframe → extract src
  if (trimmed.startsWith("<iframe")) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    if (match) return match[1];
  }

  // 2. YouTube watch URL → embed
  if (trimmed.includes("watch?v=")) {
    return trimmed.replace("watch?v=", "embed/");
  }

  // 3. youtu.be short link → embed
  if (trimmed.includes("youtu.be/")) {
    const id = trimmed.split("youtu.be/")[1]?.split("?")[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  // 4. Already an embed URL (or any other platform) → return as is
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

  const [newCert, setNewCert] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [pendingBrochure, setPendingBrochure] = useState(null);
  const [pendingDesignFile, setPendingDesignFile] = useState(null);

  // --- Application area options (existing + admin can add custom) ---
  const [availableApplications, setAvailableApplications] = useState([]);
  const [newApplicationName, setNewApplicationName] = useState("");
  useEffect(() => {
    if (!open) return;
    applicationsApi.getAll().then(setAvailableApplications);
  }, [open]);

  // --- Load saved draft when modal opens (for new product) ---
  useEffect(() => {
    if (open && !initialData) {
      const saved = sessionStorage.getItem(STORAGE_KEY_FORM);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          /* ignore */
        }
      }
    }
  }, [open, initialData]);

  // --- Save draft to sessionStorage on every change (new product only) ---
  useEffect(() => {
    if (open && !initialData) {
      sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(form));
    }
  }, [form, open, initialData]);

  // --- Clear draft ---
  const clearDraft = () => {
    sessionStorage.removeItem(STORAGE_KEY_FORM);
  };

  // --- Reset form when initialData changes (editing) ---
  useEffect(() => {
    setPendingBrochure(null);
    setPendingDesignFile(null);
    if (initialData) {
      clearDraft(); // remove any draft when editing
      const brandObj =
        initialData.brand && typeof initialData.brand === "object"
          ? initialData.brand
          : null;
      const resolvedBrandId =
        initialData.brandId || brandObj?.id || initialData.distributorId || "";
      const resolvedBrandName =
        brandObj?.name ||
        (typeof initialData.brand === "string" ? initialData.brand : "") ||
        brands.find((b) => b.id === resolvedBrandId)?.name ||
        "";
      const specs = Array.isArray(initialData.specifications)
        ? initialData.specifications.reduce((acc, s) => {
            if (s?.key) acc[s.key] = s.value;
            return acc;
          }, {})
        : initialData.specifications || {};
      const certs = Array.isArray(initialData.certifications)
        ? initialData.certifications.map((c) =>
            typeof c === "string" ? c : c?.name
          ).filter(Boolean)
        : initialData.certifications || [];
      const applications = Array.isArray(initialData.applications)
        ? initialData.applications.map((a) => ({ id: a.id, name: a.name }))
        : [];
      setForm({
        ...initialData,
        distributorId: resolvedBrandId,
        brandId: resolvedBrandId,
        brand: resolvedBrandName,
        specifications: specs,
        certifications: certs,
        applications,
        videoUrl: initialData.videoUrl || "",
        // <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm", not a full ISO string
        launchDate: initialData.launchDate ? new Date(initialData.launchDate).toISOString().slice(0, 16) : "",
      });
    } else {
      // New product defaults
      setForm({
        id: "",
        categoryId: categories[0]?.id || "",
        subcategoryId: "",
        distributorId: brands[0]?.id || "",
        brandId: brands[0]?.id || "",
        model: "",
        name: "",
        keyFeatures: "",
        brand: brands[0]?.name || "",
        specifications: {},
        certifications: [],
        applications: [],
        images: [],
        description: "",
        videoUrl: "",
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
    setForm((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [newSpecKey.trim()]: newSpecValue.trim(),
      },
    }));
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
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert.trim()],
    }));
    setNewCert("");
  };

  const removeCertification = (index) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const isApplicationSelected = (app) =>
    (form.applications || []).some((a) => (a.id && a.id === app.id) || (!a.id && a.name === app.name));

  const toggleApplication = (app) => {
    setForm((prev) => {
      const list = prev.applications || [];
      const already = list.some((a) => (a.id && a.id === app.id) || (!a.id && a.name === app.name));
      return {
        ...prev,
        applications: already
          ? list.filter((a) => !((a.id && a.id === app.id) || (!a.id && a.name === app.name)))
          : [...list, { id: app.id, name: app.name }],
      };
    });
  };

  const addCustomApplication = () => {
    const name = newApplicationName.trim();
    if (!name) return;
    // Already selectable (matches an existing option by name)? Just select it
    // instead of creating a duplicate-looking custom entry.
    const existing = availableApplications.find((a) => a.name.toLowerCase() === name.toLowerCase());
    setForm((prev) => {
      const list = prev.applications || [];
      const ref = existing ? { id: existing.id, name: existing.name } : { name };
      const already = list.some((a) => (a.id && existing && a.id === existing.id) || a.name.toLowerCase() === name.toLowerCase());
      return already ? prev : { ...prev, applications: [...list, ref] };
    });
    setNewApplicationName("");
  };

  const removeApplication = (index) => {
    setForm((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index),
    }));
  };

  // Merge Gemini's brochure suggestions into the form. Description/Key
  // Features are rich-text (HTML) fields — appended as a new block rather
  // than overwriting anything the admin already wrote, since they may have
  // only accepted some of the suggested fields.
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
        fields.specifications.forEach((s) => {
          if (s?.key) next.specifications[s.key] = s.value;
        });
      }
      return next;
    });
  };

  const getFilteredSubcategories = () =>
    subcategories.filter((s) => s.categoryId === form.categoryId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert("Product name is required");
      return;
    }

    // ---- Build a complete payload ----
    // Start with all fields from initialData (if editing) to preserve unchanged values.
    const base = initialData
      ? {
          // Exclude non‑updatable fields
          name: initialData.name,
          model: initialData.model,
          description: initialData.description,
          keyFeatures: initialData.keyFeatures,
          material: initialData.material,
          manufacturer: initialData.manufacturer,
          categoryId: initialData.categoryId,
          subcategoryId: initialData.subcategoryId,
          brandId: initialData.brandId,
          isActive: initialData.isActive,
          isFeatured: initialData.isFeatured,
          metaTitle: initialData.metaTitle,
          metaDescription: initialData.metaDescription,
          slug: initialData.slug,
          keywords: initialData.keywords,
          brochureUrl: initialData.brochureUrl,
          brochureName: initialData.brochureName,
          brochureSize: initialData.brochureSize,
          brochureFormat: initialData.brochureFormat,
          brochurePublicId: initialData.brochurePublicId,
          brochureResourceType: initialData.brochureResourceType,
          designFileUrl: initialData.designFileUrl,
          designFileName: initialData.designFileName,
          designFileSize: initialData.designFileSize,
          designFileFormat: initialData.designFileFormat,
          videoUrl: initialData.videoUrl,
          images: Array.isArray(initialData.images)
            ? initialData.images.map((img) => ({
                url: img.url,
                title: img.title || "",
                angle: img.angle || "",
                altText: img.altText || "",
              }))
            : [],
          specifications: Array.isArray(initialData.specifications)
            ? initialData.specifications.reduce((acc, s) => {
                if (s?.key) acc[s.key] = s.value;
                return acc;
              }, {})
            : initialData.specifications || {},
          certifications: Array.isArray(initialData.certifications)
            ? initialData.certifications.map((c) =>
                typeof c === "string" ? c : c?.name
              ).filter(Boolean)
            : initialData.certifications || [],
          applications: Array.isArray(initialData.applications)
            ? initialData.applications.map((a) => ({ id: a.id }))
            : [],
        }
      : {};

    // Override with current form values (the ones the user may have changed)
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
      // Video URL normalised
      videoUrl: normalizeVideoUrl(form.videoUrl) || undefined,
      // Images, specifications, certifications from form (already processed)
      images: (form.images || []).map((img) => ({
        url: img.url,
        title: img.title || "",
        angle: img.angle || "",
        altText: img.altText || "",
      })),
      specifications: Array.isArray(form.specifications)
        ? form.specifications.reduce((acc, s) => {
            if (s?.key) acc[s.key] = s.value;
            return acc;
          }, {})
        : form.specifications || {},
      certifications: (form.certifications || [])
        .map((c) => (typeof c === "string" ? c : c?.name))
        .filter(Boolean),
      // Existing-option or brand-new-custom refs; ApplicationsService
      // resolves/creates on the backend — see findOrCreateByNames.
      applications: (form.applications || []).map((a) =>
        a.id ? { id: a.id } : { name: a.name }
      ),
      // Brochure fields come from form (they are updated by BrochureUploader)
      brochureUrl: form.brochureUrl || undefined,
      brochureName: form.brochureName || undefined,
      brochureSize: form.brochureSize || undefined,
      brochureFormat: form.brochureFormat || undefined,
      brochurePublicId: form.brochurePublicId || undefined,
      brochureResourceType: form.brochureResourceType || undefined,
      // Design file fields (updated by DesignFileUploader)
      designFileUrl: form.designFileUrl || undefined,
      designFileName: form.designFileName || undefined,
      designFileSize: form.designFileSize || undefined,
      designFileFormat: form.designFileFormat || undefined,
    };

    // Remove keys with undefined values to keep payload clean
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    clearDraft();
    onSave(payload, pendingBrochure, pendingDesignFile);
  };

  // --- Handle close with draft clear ---
  const handleClose = () => {
    clearDraft();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Product" : "Create Product"}
          </h2>
          <button onClick={handleClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* ===== BASIC INFORMATION ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Product Name *</label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Product name"
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Model Number</label>
                <input
                  type="text"
                  value={form.model || ""}
                  onChange={(e) => updateField("model", e.target.value)}
                  placeholder="Model number"
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <select
                  value={form.categoryId || ""}
                  onChange={(e) => {
                    updateField("categoryId", e.target.value);
                    updateField("subcategoryId", "");
                  }}
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Subcategory</label>
                <select
                  value={form.subcategoryId || ""}
                  onChange={(e) => updateField("subcategoryId", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                >
                  <option value="">Select Subcategory</option>
                  {getFilteredSubcategories().map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand (Manufacturer)</label>
                <select
                  value={form.distributorId || ""}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Brand Display Name (Auto-filled)</label>
                <input
                  type="text"
                  value={form.brand || ""}
                  readOnly
                  className="w-full rounded-xl border px-4 py-3 text-sm bg-slate-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium">Key Features (Short summary)</label>
              <RichTextEditor
                value={form.keyFeatures || ""}
                onChange={(html) => updateField("keyFeatures", html)}
                placeholder="Brief key features for card display – supports formatting"
                uploadFolder="product-key-features"
                resetKey={form.id || "new-product"}
              />
            </div>
          </div>

          {/* ===== APPLICATION AREAS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-1">Application Areas</h3>
            <p className="text-xs text-slate-500 mb-3">
              Where this product is used — Industrial, Agriculture, Home DIY, etc. Pick existing tags or type a new one.
            </p>

            {(form.applications || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.applications.map((app, i) => (
                  <span key={app.id || app.name} className="flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    {app.name}
                    <button type="button" onClick={() => removeApplication(i)} className="ml-1 text-red-500 hover:text-red-700">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {availableApplications.filter((a) => !isApplicationSelected(a)).length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-medium text-slate-400 mb-1.5">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableApplications.filter((a) => !isApplicationSelected(a)).map((app) => (
                    <button key={app.id} type="button" onClick={() => toggleApplication(app)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                      + {app.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newApplicationName}
                onChange={(e) => setNewApplicationName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomApplication())}
                placeholder="Type a custom application area…"
                className="flex-1 rounded-xl border px-4 py-3 text-sm"
              />
              <button type="button" onClick={addCustomApplication}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm text-white hover:bg-indigo-700 shrink-0">
                <Plus size={14} /> Add
              </button>
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
                {form.brochureUrl && (
                  <BrochureExtractPanel productId={initialData.id} onApply={handleApplyExtracted} />
                )}
              </>
            ) : (
              <>
                <PendingBrochurePicker
                  file={pendingBrochure}
                  onPick={setPendingBrochure}
                  onClear={() => setPendingBrochure(null)}
                />
                <p className="mt-2 text-[11px] text-slate-400">
                  Save the product first, then re-open it here to auto-fill fields from this brochure.
                </p>
              </>
            )}
          </div>

          {/* ===== PRODUCT DESIGN FILE ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Design File</h3>
            <p className="text-xs text-slate-500 mb-3">
              CAD drawing, artwork, or spec sheet used internally — separate from the customer-facing brochure above.
            </p>
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
                    setForm((prev) => ({
                      ...prev,
                      designFileUrl: null,
                      designFileName: null,
                      designFileSize: null,
                      designFileFormat: null,
                    }));
                  }
                }}
              />
            ) : (
              <PendingDesignFilePicker
                file={pendingDesignFile}
                onPick={setPendingDesignFile}
                onClear={() => setPendingDesignFile(null)}
              />
            )}
          </div>

          {/* ===== VIDEO URL ===== */}
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Video URL (YouTube / Vimeo embed)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={form.videoUrl || ""}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                onBlur={(e) => {
                  const normalized = normalizeVideoUrl(e.target.value);
                  if (normalized !== e.target.value) {
                    updateField("videoUrl", normalized);
                  }
                }}
                placeholder="https://www.youtube.com/embed/... or paste iframe"
                className="w-full rounded-xl border px-4 py-3 text-sm"
              />
              {/* Optional video preview */}
              {form.videoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Preview:</p>
                  <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                    <iframe
                      src={form.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                    />
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
            <p className="text-xs text-slate-500 mb-4">Controls how this product appears in search results and social shares. Leave blank to fall back to the product name/description.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle || ""}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  maxLength={70}
                  placeholder={form.name || "Product name — SBS Groups"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">{(form.metaTitle || "").length}/70</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                <textarea
                  value={form.metaDescription || ""}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="A short, compelling summary for search results…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">{(form.metaDescription || "").length}/160</p>
              </div>
            </div>
          </div>

          {/* ===== SPECIFICATIONS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Specifications (Key-Value Pairs)</h3>
            <p className="text-xs text-slate-500 mb-3">
              Add unlimited custom specifications like Material, Weight, Dimensions, etc.
            </p>
            <div className="space-y-2 mb-4">
              {Object.entries(form.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 rounded-xl border p-3 bg-slate-50">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg min-w-[100px] text-center">
                    {key}
                  </span>
                  <span className="flex-1 text-sm text-slate-700">{value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())}
                placeholder="Key (e.g. Material, Weight, Color)"
                className="flex-1 rounded-xl border px-4 py-3 text-sm"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())}
                placeholder="Value (e.g. Steel, 5kg, Red)"
                className="flex-1 rounded-xl border px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700 shrink-0"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* ===== CERTIFICATIONS ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Certifications</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                placeholder="e.g. ISO 9001:2015"
                className="flex-1 rounded-xl border px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={addCertification}
                className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.certifications || []).map((cert, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700"
                >
                  🛡️ {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ===== IMAGES ===== */}
          <div className="rounded-2xl border p-5">
            <h3 className="text-base font-semibold mb-4">Product Images</h3>
            <ProductImageUploader
              images={form.images || []}
              productId={initialData?.id}
              onChange={(next) => updateField("images", next)}
            />
          </div>

          {/* ===== PRE-LAUNCH / TEASER ===== */}
          <div className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Pre-launch / Teaser</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Announce an upcoming product before it's available to order — like Flipkart's "Coming Soon". Visitors see a countdown and can sign up to be notified; pricing/RFQ actions stay hidden until launch.
                </p>
              </div>
              <label className="flex items-center gap-2 shrink-0 ml-4">
                <input type="checkbox" checked={form.isPrelaunch || false}
                  onChange={(e) => updateField("isPrelaunch", e.target.checked)} className="h-4 w-4" />
                <span className="text-xs font-bold">{form.isPrelaunch ? "Enabled" : "Disabled"}</span>
              </label>
            </div>
            {form.isPrelaunch && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Launch Date</label>
                  <input type="datetime-local" value={form.launchDate || ""}
                    onChange={(e) => updateField("launchDate", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Teaser Text</label>
                  <textarea rows={3} value={form.prelaunchTeaser || ""}
                    onChange={(e) => updateField("prelaunchTeaser", e.target.value)}
                    placeholder="Something exciting is coming… give visitors a reason to check back."
                    className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
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
              <p className="mt-2 text-[11px] text-slate-400">
                Save the product first, then re-open it here to add color/size/material variants.
              </p>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button type="button" onClick={handleClose} className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save size={16} /> {initialData ? "Update" : "Create"} Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PendingBrochurePicker (unchanged) ──
function PendingBrochurePicker({ file, onPick, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const pick = (f) => {
    if (!f) return;
    if (!allowed.includes(f.type)) {
      alert("Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      alert("File size must be under 20MB");
      return;
    }
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
        <button
          type="button"
          onClick={onClear}
          className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 rounded-lg px-3 py-1.5"
        >
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
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        pick(e.dataTransfer.files?.[0]);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <Upload size={32} className="mx-auto text-slate-400" />
      <p className="text-sm font-bold text-slate-600 mt-2">Drop brochure here or click to browse</p>
      <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX (Max 20MB)</p>
    </div>
  );
}

// ── PendingDesignFilePicker (mirrors PendingBrochurePicker) ──
function PendingDesignFilePicker({ file, onPick, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const allowedExt = [".pdf", ".dwg", ".dxf", ".ai", ".psd", ".eps", ".svg", ".jpg", ".jpeg", ".png", ".webp"];

  const pick = (f) => {
    if (!f) return;
    const lower = f.name.toLowerCase();
    if (!allowedExt.some((ext) => lower.endsWith(ext))) {
      alert("Invalid file type. Allowed: PDF, DWG, DXF, AI, PSD, EPS, SVG, JPG, PNG, WebP");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      alert("File size must be under 20MB");
      return;
    }
    onPick(f);
  };

  if (file) {
    return (
      <div className="bg-slate-50 rounded-xl border p-4 flex items-center gap-3">
        <FileText size={22} className="text-purple-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{file.name}</p>
          <p className="text-[10px] text-slate-400">
            {(file.size / 1024).toFixed(0)} KB · will upload after product is created
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 rounded-lg px-3 py-1.5"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver ? "border-purple-500 bg-purple-50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
      }`}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        pick(e.dataTransfer.files?.[0]);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={allowedExt.join(",")}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <Upload size={32} className="mx-auto text-slate-400" />
      <p className="text-sm font-bold text-slate-600 mt-2">Drop design file here or click to browse</p>
      <p className="text-xs text-slate-400 mt-1">PDF, DWG, DXF, AI, PSD, EPS, SVG, JPG, PNG, WebP (Max 20MB)</p>
    </div>
  );
}