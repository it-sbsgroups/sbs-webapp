"use client";

import { Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

const inputCls =
  "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const labelCls =
  "text-[10px] font-black text-slate-500 uppercase tracking-wide";
const cardCls =
  "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

export default function VisionMissionManager({ data, setData }) {
  const blocks = data.visionMission || [];

  const addBlock = () => {
    setData((prev) => ({
      ...prev,
      visionMission: [
        ...(prev.visionMission || []),
        {
          type: "vision",
          icon: "visibility",
          points: [{ heading: "", description: "" }],
        },
      ],
    }));
  };

  const removeBlock = (idx) => {
    setData((prev) => ({
      ...prev,
      visionMission: prev.visionMission.filter((_, i) => i !== idx),
    }));
  };

  const updateBlock = (idx, patch) => {
    setData((prev) => {
      const arr = [...prev.visionMission];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, visionMission: arr };
    });
  };

  const addPoint = (blockIdx) => {
    setData((prev) => {
      const arr = [...prev.visionMission];
      arr[blockIdx].points = [
        ...(arr[blockIdx].points || []),
        { heading: "", description: "" },
      ];
      return { ...prev, visionMission: arr };
    });
  };

  const removePoint = (blockIdx, pointIdx) => {
    setData((prev) => {
      const arr = [...prev.visionMission];
      arr[blockIdx].points = arr[blockIdx].points.filter(
        (_, i) => i !== pointIdx
      );
      return { ...prev, visionMission: arr };
    });
  };

  const updatePoint = (blockIdx, pointIdx, field, value) => {
    setData((prev) => {
      const arr = [...prev.visionMission];
      const points = [...arr[blockIdx].points];
      points[pointIdx] = { ...points[pointIdx], [field]: value };
      arr[blockIdx] = { ...arr[blockIdx], points };
      return { ...prev, visionMission: arr };
    });
  };

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Vision & Mission</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Each block can have a rich‑text description per point.
          </p>
        </div>
        <button
          onClick={addBlock}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Block
        </button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, bi) => (
          <div
            key={bi}
            className="border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <select
                className={`${inputCls} w-28`}
                value={block.type}
                onChange={(e) => updateBlock(bi, { type: e.target.value })}
              >
                <option value="vision">Vision</option>
                <option value="mission">Mission</option>
              </select>
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                  block.type === "vision"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {block.type}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <span
                  className="material-symbols-outlined text-blue-700"
                  style={{ fontSize: "24px" }}
                >
                  {block.icon || "star"}
                </span>
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Material Symbol icon"
                  value={block.icon || ""}
                  onChange={(e) => updateBlock(bi, { icon: e.target.value })}
                />
              </div>
              <button
                onClick={() => removeBlock(bi)}
                className="p-1.5 text-red-400 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <p className={labelCls}>Points</p>
              {block.points.map((point, pi) => (
                <div
                  key={pi}
                  className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="text-[10px] font-bold text-slate-400 mt-2 w-4">
                    {pi + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      className={inputCls}
                      placeholder="Point heading (optional)"
                      value={point.heading || ""}
                      onChange={(e) =>
                        updatePoint(bi, pi, "heading", e.target.value)
                      }
                    />
                    <div className="h-36">
                      <RichTextEditor
                        value={point.description || ""}
                        onChange={(html) =>
                          updatePoint(bi, pi, "description", html)
                        }
                        placeholder="Describe this point…"
                        uploadFolder="about-vision-mission"
                        minHeight="120px"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removePoint(bi, pi)}
                    className="p-1.5 text-red-400 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addPoint(bi)}
                className="flex items-center gap-1.5 text-xs font-black text-blue-800 hover:text-blue-950 py-1.5 transition-colors"
              >
                <Plus size={14} /> Add Point
              </button>
            </div>
          </div>
        ))}
        {blocks.length === 0 && (
          <p className="text-xs text-slate-400 font-medium text-center py-4">
            No vision or mission blocks yet. Click "Add Block" to create one.
          </p>
        )}
      </div>
    </div>
  );
}