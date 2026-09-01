"use client";

import { Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

const inputCls =
  "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const cardCls =
  "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

export default function AboutContentManager({ data, setData }) {
  const keyDetails = data.keyDetails || [];

  const addKeyDetail = () =>
    setData((prev) => ({
      ...prev,
      keyDetails: [
        ...(prev.keyDetails || []),
        { icon: "star", title: "", description: "" },
      ],
    }));

  const removeKeyDetail = (idx) =>
    setData((prev) => ({
      ...prev,
      keyDetails: prev.keyDetails.filter((_, i) => i !== idx),
    }));

  const updateKeyDetail = (idx, field, value) =>
    setData((prev) => {
      const arr = [...prev.keyDetails];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, keyDetails: arr };
    });

  return (
    <>
      {/* Main rich‑text content */}
      <div className={cardCls}>
        <div>
          <h3 className="text-sm font-black text-slate-900">
            About Us — Main Content
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Use the rich text editor to format your content and add images.
          </p>
        </div>
        <RichTextEditor
          value={data.richContent || ""}
          onChange={(html) => setData((prev) => ({ ...prev, richContent: html }))}
          placeholder="Write your About Us content here…"
          uploadFolder="about-us"
        />
      </div>

      {/* Key Details / Features */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              📋 Key Details
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Add highlights with icon, title and description.
            </p>
          </div>
          <button
            onClick={addKeyDetail}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {keyDetails.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-blue-700"
                    style={{ fontSize: "22px" }}
                  >
                    {item.icon || "star"}
                  </span>
                  <input
                    className={inputCls}
                    placeholder="Material Symbol icon (e.g., factory, verified)"
                    value={item.icon || ""}
                    onChange={(e) =>
                      updateKeyDetail(idx, "icon", e.target.value)
                    }
                  />
                </div>
                <input
                  className={inputCls}
                  placeholder="Title (e.g., ISO Certified)"
                  value={item.title || ""}
                  onChange={(e) =>
                    updateKeyDetail(idx, "title", e.target.value)
                  }
                />
                <textarea
                  className={`${inputCls} min-h-[60px] resize-none`}
                  placeholder="Description"
                  value={item.description || ""}
                  onChange={(e) =>
                    updateKeyDetail(idx, "description", e.target.value)
                  }
                />
              </div>
              <button
                onClick={() => removeKeyDetail(idx)}
                className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {keyDetails.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              No key details yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}