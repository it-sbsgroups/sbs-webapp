"use client";

import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import toast from "react-hot-toast";

const inputCls =
  "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const cardCls =
  "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

export default function OurJourneyManager({ data, setData }) {
  const [uploading, setUploading] = useState(false);
  const images = data.journey?.images || [];

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await siteConfigApi.uploadJourney(file);
      const newImg = {
        url,
        caption: "",
        year: new Date().getFullYear().toString(),
      };
      setData((prev) => ({
        ...prev,
        journey: { images: [...(prev.journey?.images || []), newImg] },
      }));
      toast.success("Journey image uploaded");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const updateImage = (idx, field, value) => {
    setData((prev) => {
      const imgs = [...(prev.journey?.images || [])];
      imgs[idx] = { ...imgs[idx], [field]: value };
      return { ...prev, journey: { images: imgs } };
    });
  };

  const removeImage = (idx) => {
    setData((prev) => {
      const imgs = (prev.journey?.images || []).filter((_, i) => i !== idx);
      return { ...prev, journey: { images: imgs } };
    });
  };

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Our Journey</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Upload uncompressed timeline images.
          </p>
        </div>
        <label className="cursor-pointer flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-xs font-black text-blue-800 hover:bg-blue-50">
          <Upload size={16} />
          {uploading ? "Uploading…" : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="space-y-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
          >
            <img
              src={img.url}
              alt=""
              className="w-20 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                className={inputCls}
                placeholder="Caption"
                value={img.caption || ""}
                onChange={(e) => updateImage(idx, "caption", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Year (e.g. 2018)"
                value={img.year || ""}
                onChange={(e) => updateImage(idx, "year", e.target.value)}
              />
            </div>
            <button
              onClick={() => removeImage(idx)}
              className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="text-xs text-slate-400 font-medium text-center py-4">
            No journey images yet. Upload one above.
          </p>
        )}
      </div>
    </div>
  );
}