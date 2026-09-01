"use client";

import { useRef, useState } from "react";
import { Upload, X, Link2, ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/uploadApi";
import toast from "react-hot-toast";

export default function BrandGalleryUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("Please select image files only.");
      return;
    }
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const url = await uploadImage(file, "brands-gallery");
          return { url, alt: "" };
        })
      );
      onChange([...images, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    onChange([...images, { url: trimmed, alt: "" }]);
    setUrlInput("");
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
        {uploading ? (
          <div className="space-y-2">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm font-medium text-slate-600">Uploading & compressing…</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <p className="text-sm font-bold text-slate-600">Drop images here or click to browse</p>
            <p className="text-xs text-slate-400">You can select multiple files</p>
          </>
        )}
      </div>

      {/* URL fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUrl()}
          placeholder="…or paste an image URL and press Enter"
          className="flex-1 text-xs px-3 py-2 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addUrl}
          className="px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 text-xs font-medium"
        >
          <Link2 size={14} className="inline mr-1" /> Add
        </button>
      </div>

      {/* Gallery preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group border rounded-lg overflow-hidden h-24">
              <img
                src={img.url}
                alt={img.alt || "Gallery"}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/placeholder.svg")}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={12} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-[10px] text-slate-400 font-medium text-center">No images yet</p>
      )}
    </div>
  );
}