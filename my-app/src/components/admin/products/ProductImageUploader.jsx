// src/components/admin/products/ProductImageUploader.jsx

"use client";

import { useState, useRef } from "react";
import { Upload, Link2, X, Loader2, ImagePlus, GripVertical } from "lucide-react";
import productsApi from "@/lib/productsApi";

/**
 * Image manager for the product form.
 *
 * - Drag & drop or click to pick one or more image files.
 * - Files are sent to the backend which converts to WebP and compresses
 *   every image to under 100KB before storing on Cloudinary.
 * - Users can also paste a direct image URL to use an external image as-is.
 * - Images can be reordered by dragging and dropping.
 *
 * `images` is the current array: [{ url, title, angle, altText, bytes? }, ...]
 * `onChange(nextImages)` is called whenever the list changes.
 * `productId` is optional — when present uploads are tied to that product.
 */
export default function ProductImageUploader({ images = [], onChange, productId }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  const update = (next) => onChange?.(next);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Please choose image files only.");
      return;
    }
    setError("");
    setUploading(true);
    const added = [];
    try {
      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) {
          setError(`"${file.name}" is over 25MB and was skipped.`);
          continue;
        }
        const result = await productsApi.uploadImage(file, productId);
        added.push({
          url: result.url,
          title: result.title || file.name.replace(/\.[^.]+$/, "") || "Image",
          angle: "",
          altText: "",
          bytes: result.bytes,
        });
      }
      if (added.length) update([...(images || []), ...added]);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const addLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError("Link must start with http:// or https://");
      return;
    }
    setError("");
    update([
      ...(images || []),
      { url, title: linkTitle.trim() || "Image", angle: "", altText: "", external: true },
    ]);
    setLinkUrl("");
    setLinkTitle("");
  };

  const removeImage = (index) => update((images || []).filter((_, i) => i !== index));

  // ── Drag & Drop reorder handlers ──
  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropReorder = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newImages = [...(images || [])];
    const [movedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, movedItem);
    update(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const fmtSize = (b) =>
    !b ? "" : b < 1024 ? `${b} B` : `${(b / 1024).toFixed(0)} KB`;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-xs">
          {error}
        </div>
      )}

      {/* DROP ZONE */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="space-y-2">
            <Loader2 size={34} className="mx-auto text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Uploading, converting to WebP &amp; compressing…
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={34} className="mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-600">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-slate-400">
              Auto-converted to WebP and compressed to under 100KB. You can select multiple.
            </p>
          </div>
        )}
      </div>

      {/* PASTE A LINK */}
      <div className="rounded-xl border bg-white p-3">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
          <Link2 size={13} /> …or paste a direct image link (used as-is, not compressed)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Title"
            className="w-1/4 rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addLink}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shrink-0"
          >
            <ImagePlus size={16} />
          </button>
        </div>
      </div>

      {/* PREVIEW GRID (with drag-and-drop reorder) */}
      {(images || []).length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative rounded-xl border p-2 group transition-all ${
                draggedIndex === i
                  ? "opacity-50 ring-2 ring-blue-500"
                  : dragOverIndex === i
                  ? "ring-2 ring-blue-300"
                  : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDropReorder(e, i)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag handle */}
              <div className="absolute top-1 left-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <GripVertical size={14} className="text-slate-400" />
              </div>

              <img
                src={img.url}
                alt={img.title || "Image"}
                className="h-20 w-full object-cover rounded-lg cursor-grab"
              />
              <p className="mt-1 text-[10px] text-slate-500 truncate">
                {img.title || "Image"}
                {img.external ? " · link" : img.bytes ? ` · ${fmtSize(img.bytes)}` : ""}
              </p>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>

              {/* Drop indicator when dragging over */}
              {dragOverIndex === i && draggedIndex !== i && (
                <div className="absolute inset-0 rounded-xl border-2 border-blue-400 bg-blue-100/20 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}