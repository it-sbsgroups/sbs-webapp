"use client";

import { Plus, Trash2 } from "lucide-react";
import * as Icons from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

const inputCls =
  "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors";
const labelCls =
  "text-[10px] font-black text-slate-500 uppercase tracking-wide";
const cardCls =
  "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm";

// A curated shortlist so the datalist isn't 1500+ items — but any valid
// lucide-react export name typed in works too.
const SUGGESTED_ICONS = [
  "Eye", "Goal", "Target", "Compass", "Rocket", "Lightbulb", "Star",
  "Shield", "ShieldCheck", "Award", "Trophy", "Heart", "Gem", "Sparkles",
  "TrendingUp", "Flag", "Sun", "Globe", "Handshake", "Users",
];

function IconPreview({ name, size, color }) {
  const DynamicIcon = (name && Icons[name]) || Icons.HelpCircle;
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 shrink-0"
      style={{ width: 56, height: 56 }}
      title={Icons[name] ? name : "Unknown icon — showing fallback"}
    >
      <DynamicIcon size={Math.min(size || 28, 32)} color={color || "#0f172a"} />
    </div>
  );
}

export default function VisionMissionManager({ data, setData }) {
  const blocks = data.visionMission || [];

  const addBlock = () => {
    setData((prev) => ({
      ...prev,
      visionMission: [
        ...(prev.visionMission || []),
        {
          type: "vision",
          icon: "Eye",
          iconSize: 90,
          iconColor: "#7ccf00",
          title: "Our Vision",
          description: "",
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

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Vision & Mission</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Set a lucide-react icon (with size &amp; color), a title, and a rich-text description for each block.
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
            className="border border-slate-200 rounded-xl p-4 space-y-4"
          >
            {/* Type + delete */}
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
              <div className="flex-1" />
              <button
                onClick={() => removeBlock(bi)}
                className="p-1.5 text-red-400 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Icon + size + color */}
            <div className="flex flex-wrap items-end gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <IconPreview name={block.icon} size={block.iconSize} color={block.iconColor} />

              <div className="min-w-[160px] flex-1">
                <label className={labelCls}>Lucide Icon Name</label>
                <input
                  list={`icon-suggestions-${bi}`}
                  className={inputCls}
                  placeholder="e.g. Eye, Goal, Target…"
                  value={block.icon || ""}
                  onChange={(e) => updateBlock(bi, { icon: e.target.value })}
                />
                <datalist id={`icon-suggestions-${bi}`}>
                  {SUGGESTED_ICONS.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                {block.icon && !Icons[block.icon] && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    Unknown icon name — check spelling (case-sensitive, e.g. "ShieldCheck").
                  </p>
                )}
              </div>

              <div className="w-24">
                <label className={labelCls}>Size (px)</label>
                <input
                  type="number"
                  min={16}
                  max={200}
                  className={inputCls}
                  value={block.iconSize ?? 90}
                  onChange={(e) =>
                    updateBlock(bi, { iconSize: Number(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="w-28">
                <label className={labelCls}>Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-[38px] w-10 rounded-lg border border-slate-200 cursor-pointer bg-white"
                    value={block.iconColor || "#7ccf00"}
                    onChange={(e) => updateBlock(bi, { iconColor: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    value={block.iconColor || "#7ccf00"}
                    onChange={(e) => updateBlock(bi, { iconColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelCls}>Title</label>
              <input
                className={inputCls}
                placeholder="e.g. Our Vision"
                value={block.title || ""}
                onChange={(e) => updateBlock(bi, { title: e.target.value })}
              />
            </div>

            {/* Description (rich text) */}
            <div>
              <label className={labelCls}>Description</label>
              <div className="mt-1.5">
                <RichTextEditor
                  value={block.description || ""}
                  onChange={(html) => updateBlock(bi, { description: html })}
                  placeholder="Describe this vision or mission…"
                  uploadFolder="about-vision-mission"
                  minHeight="140px"
                  resetKey={bi}
                />
              </div>
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
