"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import brandsApi from "@/lib/brands/Api";
import { toStaticUrl } from "@/lib/client";

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx";

function formatSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 0.1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

// Brand-level brochure uploader. Files are stored on the backend's local disk
// under public/brands/brochure and served statically — NOT via Cloudinary.
// Requires an existing brand id (upload happens immediately on file select).
export default function BrandBrochureUploader({ brandId, brochure, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const updatedBrand = await brandsApi.uploadBrochure(brandId, file);
      onChange({
        brochureUrl: updatedBrand.brochureUrl,
        brochureName: updatedBrand.brochureName,
        brochureSize: updatedBrand.brochureSize,
        brochureFormat: updatedBrand.brochureFormat,
      });
      toast.success("Brochure uploaded");
    } catch (err) {
      toast.error(err.message || "Failed to upload brochure");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove this brand's brochure?")) return;
    setUploading(true);
    try {
      await brandsApi.deleteBrochure(brandId);
      onChange({ brochureUrl: null, brochureName: null, brochureSize: null, brochureFormat: null });
      toast.success("Brochure removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove brochure");
    } finally {
      setUploading(false);
    }
  };

  if (!brandId) {
    return (
      <p className="text-[10px] text-slate-400 font-medium italic">
        Save the brand first — you can upload a brochure once it's been created.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {brochure?.brochureUrl ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-slate-50 px-3 py-2.5">
          <a
            href={toStaticUrl(brochure.brochureUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:underline truncate"
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate">{brochure.brochureName || "Brochure"}</span>
          </a>
          <div className="flex items-center gap-2 shrink-0">
            {brochure.brochureSize ? (
              <span className="text-[10px] text-slate-400 font-medium">{formatSize(brochure.brochureSize)}</span>
            ) : null}
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              title="Remove brochure"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-slate-400 font-medium">No brochure uploaded yet.</p>
      )}

      <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-500 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading…" : brochure?.brochureUrl ? "Replace Brochure (PDF/DOC/XLS)" : "Upload Brochure (PDF/DOC/XLS)"}
        <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}
