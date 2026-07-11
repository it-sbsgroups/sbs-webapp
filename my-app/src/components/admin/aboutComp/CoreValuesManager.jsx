"use client";

import { Plus, Trash2 } from "lucide-react";

const inputCls =
  "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const cardCls =
  "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

export default function CoreValuesManager({ data, setData }) {
  const coreValues = data.coreValues || [];
  const maxCoreValues =
    coreValues.length < 5
      ? 5
      : Math.ceil((coreValues.length || 5) / 5) * 5;

  const addValue = () => {
    setData((prev) => ({
      ...prev,
      coreValues: [...(prev.coreValues || []), { title: "", description: "" }],
    }));
  };

  const removeValue = (idx) => {
    setData((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== idx),
    }));
  };

  const updateValue = (idx, field, value) => {
    setData((prev) => {
      const arr = [...prev.coreValues];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, coreValues: arr };
    });
  };

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Core Values</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Max {maxCoreValues} values. Extend in batches of +3 or +5.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {coreValues.length >= maxCoreValues && (
            <>
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    _maxCoreValues: (prev._maxCoreValues || 5) + 3,
                  }))
                }
                className="text-xs font-black px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                +3 slots
              </button>
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    _maxCoreValues: (prev._maxCoreValues || 5) + 5,
                  }))
                }
                className="text-xs font-black px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                +5 slots
              </button>
            </>
          )}
          {coreValues.length < maxCoreValues && (
            <button
              onClick={addValue}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add Value
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {coreValues.map((cv, idx) => (
          <div key={idx} className="border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Value {idx + 1}
              </span>
              <button
                onClick={() => removeValue(idx)}
                className="p-1 text-red-400 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              className={inputCls}
              placeholder="Title (e.g. Integrity)"
              value={cv.title || ""}
              onChange={(e) => updateValue(idx, "title", e.target.value)}
            />
            <textarea
              className={`${inputCls} min-h-[80px] resize-none`}
              placeholder="Description"
              value={cv.description || ""}
              onChange={(e) => updateValue(idx, "description", e.target.value)}
            />
          </div>
        ))}
        {coreValues.length === 0 && (
          <p className="col-span-2 text-xs text-slate-400 text-center py-4">
            No core values defined yet.
          </p>
        )}
      </div>
    </div>
  );
}