"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Image as ImageIcon, FileText, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import productsApi from "@/lib/productsApi";
import { toStaticUrl } from "@/lib/client";
import { uploadImage } from "@/lib/uploadApi";

const COMMON_ATTRIBUTE_TYPES = ["Color", "Size", "Material", "Warranty", "Design"];

function buildName(attributes) {
  const vals = Object.values(attributes || {}).filter(Boolean);
  return vals.length ? vals.join(" / ") : "New Variant";
}

/**
 * Every field below is an OVERRIDE — leaving it blank means the public site
 * falls back to the main product's value. This wrapper shows that inherited
 * value as a hint and gives a one-click way to start overriding it (or clear
 * back to inheriting).
 */
function InheritableField({ label, inheritedValue, value, onChange, multiline, placeholder }) {
  const isOverridden = value !== undefined && value !== null && value !== "";
  const [overriding, setOverriding] = useState(isOverridden);
  const Field = multiline ? "textarea" : "input";

  if (!overriding) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black uppercase text-slate-400">{label}</label>
          <button type="button" onClick={() => setOverriding(true)} className="text-[10px] font-bold text-indigo-600 hover:underline">
            Override
          </button>
        </div>
        <p className="text-xs text-slate-500 bg-slate-50 border border-dashed rounded-lg px-2.5 py-2 italic truncate">
          {inheritedValue ? `Using main product: "${String(inheritedValue).replace(/<[^>]+>/g, " ").slice(0, 80)}"` : "Using main product's value"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-black uppercase text-slate-400">{label}</label>
        <button type="button" onClick={() => { setOverriding(false); onChange(""); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
          Use main product&apos;s value
        </button>
      </div>
      <Field
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        className="w-full text-xs border rounded-lg px-2.5 py-2"
      />
    </div>
  );
}

function VariantSpecifications({ specs, inheritedSpecs, onChange }) {
  const isOverridden = Array.isArray(specs) && specs.length > 0;
  const [overriding, setOverriding] = useState(isOverridden);
  const rows = overriding ? (specs || []) : [];

  const update = (idx, field, val) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };
  const addRow = () => onChange([...rows, { key: "", value: "" }]);
  const removeRow = (idx) => onChange(rows.filter((_, i) => i !== idx));

  if (!overriding) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Specifications</label>
          <button type="button" onClick={() => setOverriding(true)} className="text-[10px] font-bold text-indigo-600 hover:underline">Override</button>
        </div>
        <p className="text-xs text-slate-500 bg-slate-50 border border-dashed rounded-lg px-2.5 py-2 italic">
          Using main product&apos;s {inheritedSpecs?.length || 0} spec{inheritedSpecs?.length === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-black uppercase text-slate-400">Specifications</label>
        <button type="button" onClick={() => { setOverriding(false); onChange([]); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
          Use main product&apos;s specs
        </button>
      </div>
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input value={row.key} onChange={(e) => update(i, "key", e.target.value)} placeholder="Spec name" className="w-28 text-xs border rounded-lg px-2 py-1.5" />
            <input value={row.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="Value" className="flex-1 text-xs border rounded-lg px-2 py-1.5" />
            <button type="button" onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className="mt-1.5 text-[10px] font-bold text-indigo-600 hover:underline">+ Add spec</button>
    </div>
  );
}

function VariantApplications({ selectedIds, inheritedApps, availableApplications, onChange }) {
  const isOverridden = Array.isArray(selectedIds) && selectedIds.length > 0;
  const [overriding, setOverriding] = useState(isOverridden);

  if (!overriding) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Applications</label>
          <button type="button" onClick={() => setOverriding(true)} className="text-[10px] font-bold text-indigo-600 hover:underline">Override</button>
        </div>
        <p className="text-xs text-slate-500 bg-slate-50 border border-dashed rounded-lg px-2.5 py-2 italic">
          Using main product&apos;s: {(inheritedApps || []).map((a) => a.name).join(", ") || "none set"}
        </p>
      </div>
    );
  }

  const toggle = (id) => {
    const set = new Set(selectedIds || []);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange(Array.from(set));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-black uppercase text-slate-400">Applications</label>
        <button type="button" onClick={() => { setOverriding(false); onChange([]); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
          Use main product&apos;s
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(availableApplications || []).map((app) => {
          const active = (selectedIds || []).includes(app.id);
          return (
            <button key={app.id} type="button" onClick={() => toggle(app.id)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200"}`}>
              {app.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VariantFileSlot({ label, url, name, uploading, onUpload, onRemove, accept }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">{label}</label>
      {url ? (
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-2.5 py-2">
          <FileText size={14} className="text-indigo-500 shrink-0" />
          <a href={toStaticUrl(url)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 truncate flex-1 hover:underline">
            {name || "View file"}
          </a>
          <button type="button" onClick={onRemove} className="text-slate-300 hover:text-red-500 shrink-0"><X size={13} /></button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-1.5 border-2 border-dashed rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500">
          {uploading ? <span>Uploading…</span> : <><Upload size={13} /> Upload (optional — inherits product&apos;s otherwise)</>}
          <input type="file" accept={accept} className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

function VariantCard({ variant, onSave, onDelete, productId, brands, availableApplications, mainProduct }) {
  const [draft, setDraft] = useState(variant);
  const [expanded, setExpanded] = useState(!variant.id);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(variant);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file, `products/${productId}/variants`);
      setDraft((d) => ({ ...d, images: [...(d.images || []), url] }));
    } catch (err) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImg(false);
    }
  };
  const removeImage = (idx) => setDraft((d) => ({ ...d, images: d.images.filter((_, i) => i !== idx) }));

  const handleBrochureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !draft.id) {
      if (!draft.id) toast.error("Save the variant once first, then attach a brochure.");
      return;
    }
    setUploadingBrochure(true);
    try {
      const updated = await productsApi.uploadVariantBrochure(productId, draft.id, file);
      setDraft((d) => ({ ...d, brochureUrl: updated.brochureUrl, brochureName: updated.brochureName }));
      toast.success("Brochure uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingBrochure(false);
    }
  };
  const removeBrochure = async () => {
    if (!draft.id) return;
    try {
      await productsApi.deleteVariantBrochure(productId, draft.id);
      setDraft((d) => ({ ...d, brochureUrl: null, brochureName: null }));
    } catch (err) {
      toast.error(err.message || "Failed to remove");
    }
  };

  const handleDesignUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !draft.id) {
      if (!draft.id) toast.error("Save the variant once first, then attach a design file.");
      return;
    }
    setUploadingDesign(true);
    try {
      const updated = await productsApi.uploadVariantDesignFile(productId, draft.id, file);
      setDraft((d) => ({ ...d, designFileUrl: updated.designFileUrl, designFileName: updated.designFileName }));
      toast.success("Design file uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingDesign(false);
    }
  };
  const removeDesign = async () => {
    if (!draft.id) return;
    try {
      await productsApi.deleteVariantDesignFile(productId, draft.id);
      setDraft((d) => ({ ...d, designFileUrl: null, designFileName: null }));
    } catch (err) {
      toast.error(err.message || "Failed to remove");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      toast.success("Variant saved");
    } catch (err) {
      toast.error(err.message || "Failed to save variant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <button type="button" onClick={() => setExpanded((e) => !e)} className="text-slate-400 hover:text-slate-600 shrink-0">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        {draft.images?.[0] && (
          <img src={toStaticUrl(draft.images[0])} alt="" className="w-7 h-7 rounded object-cover border shrink-0" />
        )}
        <span className="flex-1 text-xs font-bold text-slate-800 truncate">{draft.name || "New Variant"}</span>
        <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 shrink-0">
          <input type="checkbox" checked={draft.isActive !== false} onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))} />
          Active
        </label>
        <button type="button" onClick={() => onDelete(draft)} className="text-red-400 hover:text-red-600 shrink-0" aria-label="Delete variant">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-4">
          {/* Attributes */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Attributes</label>
            <div className="space-y-1.5">
              {Object.entries(draft.attributes || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 w-20 shrink-0 truncate">{key}</span>
                  <input
                    value={value}
                    onChange={(e) => setAttr(key, e.target.value)}
                    className="flex-1 text-xs border rounded-lg px-2 py-1.5"
                    placeholder={`e.g. ${key === "Color" ? "Yellow" : key === "Size" ? "Large" : "value"}`}
                  />
                  <button type="button" onClick={() => removeAttr(key)} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_ATTRIBUTE_TYPES.filter((t) => !(draft.attributes || {})[t]).map((t) => (
                <button key={t} type="button" onClick={() => setAttr(t, "")} className="text-[10px] font-bold text-indigo-600 border border-dashed border-indigo-300 rounded-lg px-2 py-1 hover:bg-indigo-50">
                  + {t}
                </button>
              ))}
              <button type="button" onClick={addCustomAttr} className="text-[10px] font-bold text-slate-500 border border-dashed border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50">
                + Custom
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InheritableField label="Model" value={draft.model} inheritedValue={mainProduct?.model}
              onChange={(v) => setDraft((d) => ({ ...d, model: v }))} placeholder="Falls back to product model" />
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Brand</label>
              <select value={draft.brandId || ""} onChange={(e) => setDraft((d) => ({ ...d, brandId: e.target.value || null }))}
                className="w-full text-xs border rounded-lg px-2.5 py-2">
                <option value="">Using main product&apos;s brand</option>
                {(brands || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <InheritableField label="Description" multiline value={draft.description} inheritedValue={mainProduct?.description}
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))} placeholder="Only if this variant needs its own description" />

          <InheritableField label="Key Features" multiline value={draft.keyFeatures} inheritedValue={mainProduct?.keyFeatures}
            onChange={(v) => setDraft((d) => ({ ...d, keyFeatures: v }))} placeholder="Only if this variant has different key features" />

          <VariantSpecifications specs={draft.specifications} inheritedSpecs={mainProduct?.specifications}
            onChange={(v) => setDraft((d) => ({ ...d, specifications: v }))} />

          <VariantApplications selectedIds={(draft.applications || []).map((a) => a.id || a)}
            inheritedApps={mainProduct?.applications} availableApplications={availableApplications}
            onChange={(ids) => setDraft((d) => ({ ...d, applications: ids }))} />

          <div className="grid grid-cols-2 gap-3">
            <VariantFileSlot label="Brochure" url={draft.brochureUrl} name={draft.brochureName} uploading={uploadingBrochure}
              onUpload={handleBrochureUpload} onRemove={removeBrochure} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            <VariantFileSlot label="Design File" url={draft.designFileUrl} name={draft.designFileName} uploading={uploadingDesign}
              onUpload={handleDesignUpload} onRemove={removeDesign} accept=".pdf,.dwg,.dxf,.ai,.psd,.eps,.svg,.jpg,.jpeg,.png,.webp" />
          </div>

          {/* Images */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Variant Images</label>
            <div className="flex flex-wrap gap-2">
              {(draft.images || []).map((img, idx) => (
                <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border group">
                  <img src={toStaticUrl(img)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <label className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500">
                {uploadingImg ? <span className="text-[9px]">…</span> : <ImageIcon size={16} />}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={save} disabled={saving || !dirty}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40">
              {saving ? "Saving…" : "Save Variant"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
    setVariants((v) => [...v, { attributes: {}, name: "New Variant", images: [], isActive: true, sortOrder: v.length }]);
  };

  const saveVariant = async (draft) => {
    const payload = {
      ...draft,
      applicationIds: (draft.applications || []).map((a) => a.id || a),
    };
    delete payload.applications;
    if (draft.id) {
      const updated = await productsApi.updateVariant(productId, draft.id, payload);
      setVariants((v) => v.map((x) => (x.id === draft.id ? updated : x)));
    } else {
      const created = await productsApi.createVariant(productId, payload);
      setVariants((v) => {
        const next = [...v];
        const placeholderIdx = next.findIndex((x) => !x.id);
        if (placeholderIdx !== -1) next[placeholderIdx] = created; else next.push(created);
        return next;
      });
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
        variant selectors). Any field you leave blank automatically uses the main product&apos;s value — you only
        need to fill in what&apos;s actually different about this variant.
      </p>
      {variants.map((v, i) => (
        <VariantCard key={v.id || `new-${i}`} variant={v} productId={productId} brands={brands}
          availableApplications={availableApplications} mainProduct={mainProduct}
          onSave={saveVariant} onDelete={deleteVariant} />
      ))}
      <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border border-dashed border-indigo-300 rounded-xl px-4 py-2.5 w-full justify-center hover:bg-indigo-50">
        <Plus size={14} /> Add Variant
      </button>
    </div>
  );
}
