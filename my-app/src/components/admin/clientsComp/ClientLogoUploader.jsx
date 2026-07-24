"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadImage } from "@/lib/uploadApi";
import toast from "react-hot-toast";

export default function ClientLogoUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, "clients-logos");
      onChange(url);
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
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

  const removeLogo = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      {/* Current logo preview */}
      {value ? (
        <div className="relative w-32 h-32 border rounded-xl overflow-hidden group">
          <img src={value} alt="Client logo" className="w-full h-full object-contain" />
          <button
            type="button"
            onClick={removeLogo}
            className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center bg-slate-50">
          <span className="text-slate-400 text-xs">No logo</span>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
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
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <div className="space-y-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm font-medium text-slate-600">Uploading…</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-6 w-6 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Drop an image or click to browse</p>
          </>
        )}
      </div>

      {/* URL input fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUrl()}
          placeholder="…or paste an image URL"
          className="flex-1 text-xs px-3 py-2 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addUrl}
          className="px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 text-xs font-medium"
        >
          Add
        </button>
      </div>
    </div>
  );
}