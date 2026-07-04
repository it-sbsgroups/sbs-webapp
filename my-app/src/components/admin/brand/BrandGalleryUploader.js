"use client";

import { useState } from "react";
import { X, Link2, ImageIcon } from "lucide-react";

export default function BrandGalleryUploader({ images = [], onChange }) {
  const [urlInput, setUrlInput] = useState("");

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, { url: trimmed, alt: "" }]);
    setUrlInput("");
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* URL input */}
      <div className="flex gap-2">
        <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addUrl()} placeholder="Paste an image URL and press Enter or click Add" className="flex-1 text-xs px-3 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:border-blue-500" />
        <button type="button" onClick={addUrl} className="px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 flex items-center gap-1" >
          <Link2 size={14} /> <span className="text-xs font-medium">Add</span>
        </button>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group border rounded-lg overflow-hidden">
              <img src={img.url} alt={img.alt || "Gallery"} className="h-24 w-full object-cover" onError={(e) => (e.target.src = "/placeholder.svg")} />
              <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition" >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-[10px] text-slate-400 font-medium text-center">No images yet — add URLs above</p>
      )}
    </div>
  );
}