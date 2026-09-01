"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Download, Eye, Trash2, Loader2 } from "lucide-react";
import productsApi from "@/lib/productsApi";

const ALLOWED_EXTENSIONS = ".pdf,.dwg,.dxf,.ai,.psd,.eps,.svg,.jpg,.jpeg,.png,.webp";
// Design files come from CAD/illustration tools whose MIME types browsers
// often report inconsistently (or as generic octet-stream), so this
// validates by extension rather than file.type — unlike BrochureUploader,
// which can rely on well-known document MIME types.
const ALLOWED_EXT_LIST = ALLOWED_EXTENSIONS.split(",");

function hasAllowedExtension(filename) {
  const lower = filename.toLowerCase();
  return ALLOWED_EXT_LIST.some((ext) => lower.endsWith(ext));
}

export default function DesignFileUploader({ product, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!hasAllowedExtension(file.name)) {
      setError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.replace(/\./g, " ").trim()}`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB");
      return;
    }
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const result = await productsApi.uploadDesignFile(product.id, file);
      setSuccess(`"${file.name}" uploaded!`);
      if (onUpdate) onUpdate(result);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this design file?")) return;
    setDeleting(true);
    try {
      await productsApi.deleteDesignFile(product.id);
      setSuccess("Design file deleted");
      if (onUpdate) onUpdate(null);
    } catch (err) {
      setError("Failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const designFileUrl = product?.designFileUrl;
  const downloadUrl = designFileUrl ? productsApi.getDesignFileUrl(product.id, "download") : null;
  const previewUrl = designFileUrl ? productsApi.getDesignFileUrl(product.id, "preview") : null;

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-xs">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-xs">{success}</div>}

      {designFileUrl ? (
        <div className="bg-slate-50 rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-purple-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{product.designFileName || "Design file"}</p>
              <p className="text-[10px] text-slate-400">{formatSize(product.designFileSize)} · {(product.designFileFormat || "").toUpperCase()}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-purple-700">
              <Download size={14} /> Download
            </a>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 border text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-100">
              <Eye size={14} /> Preview
            </a>
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragOver ? "border-purple-500 bg-purple-50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden"
            accept={ALLOWED_EXTENSIONS}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 size={40} className="mx-auto text-purple-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload size={40} className="mx-auto text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-600">Drop design file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DWG, DXF, AI, PSD, EPS, SVG, JPG, PNG, WebP (Max 20MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
