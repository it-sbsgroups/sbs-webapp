// src/components/admin/carousel/SlideEditorModal.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Save, Upload, Image, Video, Palette, Type, Link2,
  ChevronDown, ChevronUp, Eye, EyeOff, Trash2
} from "lucide-react";

// ============================================
// DEFAULT EMPTY SLIDE TEMPLATE
// ============================================
const defaultSlide = {
  id: "",
  nextSlideIn: 5,
  mediaType: "IMAGE",
  solidColor: "#0f172a",
  gradientColor: {
    gradientType: "linear",
    gradientDirection: "to right",
    gradientColorStarts: "#1e3a8a",
    gradientColorEnds: "#3b82f6",
    gradientColorStops: "0%, 100%",
  },
  mediaUrl: "",
  videoLoop: false,
  videoSound: false,
  layoutType: "LEFT",
  badge: "",
  badgeStyle: {
    fontColor: "#ffffff",
    backgroundColor: "#e98a0f",
    padding: "6px 14px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    hoverScale: 1.03,
  },
  title: "",
  titleStyle: {
    fontColor: "#ffffff",
    fontWeight: "900",
    letterSpacing: "-0.02em",
    textTransform: "none",
    fontSize: "text-5xl",
    lineHeight: "leading-tight",
    transition: "all 0.3s ease",
    hoverScale: 1.0,
  },
  description: "",
  descriptionStyle: {
    fontColor: "#e2e8f0",
    fontWeight: "400",
    letterSpacing: "0em",
    textTransform: "none",
    fontSize: "text-lg",
    lineHeight: "leading-relaxed",
    transition: "all 0.3s ease",
    hoverScale: 1.0,
  },
  ctaText: "",
  ctaLink: "",
  ctaOpenInNewTab: false,
  ctaButtonStyle: {
    fontColor: "#ffffff",
    backgroundColor: {
      mediatype: "SOLID",
      solid: "#1e3a8a",
      gradient: {
        gradientType: "linear",
        gradientDirection: "to right",
        gradientColorStarts: "#1e3a8a",
        gradientColorEnds: "#3b82f6",
        gradientColorStops: "0%, 100%",
      },
    },
    padding: "12px 28px",
    borderRadius: "8px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    transition: "all 0.3s ease",
    hoverScale: 1.05,
    borderWidth: "0px",
    borderColor: "#ffffff",
    borderStyle: "solid",
    boxShadow: "none",
  },
};

// ============================================
// OPTIONS CONSTANTS
// ============================================
const gradientDirections = [
  "to right", "to left", "to top", "to bottom",
  "to top right", "to top left", "to bottom right", "to bottom left"
];

const fontWeightOptions = ["300", "400", "500", "600", "700", "800", "900"];
const fontSizeOptions = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"];
const textTransformOptions = ["none", "uppercase", "lowercase", "capitalize"];
const layoutOptions = ["LEFT", "CENTER", "RIGHT"];
const mediaTypeOptions = ["IMAGE", "VIDEO", "SOLID", "GRADIENT"];

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================
function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

// ============================================
// COLOR INPUT WITH PICKER
// ============================================
function ColorInput({ label, value, onChange, placeholder = "#ffffff" }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

// ============================================
// RANGE SLIDER COMPONENT
// ============================================
function RangeInput({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}: <span className="text-blue-600 font-bold">{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ============================================
// SELECT COMPONENT
// ============================================
function SelectInput({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ============================================
// MAIN SLIDE EDITOR MODAL
// ============================================
export default function SlideEditorModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(defaultSlide);
  const [activeTab, setActiveTab] = useState("media"); // media | content | badge | title | description | cta
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setForm({ ...defaultSlide, ...initialData });
    } else {
      setForm({ ...defaultSlide, id: `slide-${Date.now()}` });
    }
  }, [initialData]);

  // Helper to update nested form fields
  const updateField = (path, value) => {
    setForm((prev) => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  // Handle file upload (mock - replace with Cloudinary upload)
  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock validation
    if (type === "IMAGE" && file.size > 200 * 1024) {
      alert("Image must be under 200KB after compression");
      return;
    }
    if (type === "VIDEO" && file.size > 5 * 1024 * 1024) {
      alert("Video must be under 5MB");
      return;
    }

    // Mock URL (replace with Cloudinary upload)
    const mockUrl = URL.createObjectURL(file);
    updateField("mediaUrl", mockUrl);
    updateField("mediaType", type.toUpperCase());
  };

  const handleSave = () => {
    if (!form.title?.trim()) {
      alert("Slide title is required");
      return;
    }
    onSave(form);
  };

  if (!open) return null;

  // ============================================
  // SUB-TABS FOR ADVANCED STYLING SECTIONS
  // ============================================
  const subTabs = [
    { id: "media", label: "Media & BG", icon: Image },
    { id: "content", label: "Content Layout", icon: Type },
    { id: "badge", label: "Badge Style", icon: Eye },
    { id: "title", label: "Title Style", icon: Type },
    { id: "description", label: "Description Style", icon: Type },
    { id: "cta", label: "CTA Button", icon: Link2 },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10 pb-10">
      <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl my-4">
        
        {/* ===== MODAL HEADER ===== */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? "Edit Slide" : "Create New Slide"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure all slide settings including advanced styling</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ===== SUB-TABS ===== */}
        <div className="border-b bg-slate-50/50 px-6">
          <div className="flex overflow-x-auto gap-1 py-2">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== MODAL BODY ===== */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
          
          {/* ============================================ */}
          {/* TAB 1: MEDIA & BACKGROUND */}
          {/* ============================================ */}
          {activeTab === "media" && (
            <div className="space-y-5">
              {/* Media Type Selection */}
              <div className="rounded-2xl border p-5">
                <h3 className="text-base font-semibold mb-4">Media Type</h3>
                <div className="grid grid-cols-4 gap-3">
                  {mediaTypeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        updateField("mediaType", type);
                        if (type === "SOLID" || type === "GRADIENT") {
                          updateField("layoutType", "CENTER");
                        }
                      }}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        form.mediaType === type
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {type === "IMAGE" && <Image className="h-8 w-8 text-blue-600" />}
                      {type === "VIDEO" && <Video className="h-8 w-8 text-purple-600" />}
                      {type === "SOLID" && <Palette className="h-8 w-8 text-gray-600" />}
                      {type === "GRADIENT" && <Palette className="h-8 w-8 text-indigo-600" />}
                      <span className="text-xs font-semibold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IMAGE / VIDEO URL & UPLOAD */}
              {(form.mediaType === "IMAGE" || form.mediaType === "VIDEO") && (
                <div className="rounded-2xl border p-5 space-y-4">
                  <h3 className="text-base font-semibold">
                    {form.mediaType === "IMAGE" ? "Image" : "Video"} Source
                  </h3>

                  {/* URL Input */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Media URL</label>
                    <input
                      type="text"
                      value={form.mediaUrl || ""}
                      onChange={(e) => updateField("mediaUrl", e.target.value)}
                      placeholder="https://example.com/media.jpg"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Upload Button */}
                  <div className="flex gap-3">
                    <input
                      ref={form.mediaType === "IMAGE" ? imageInputRef : videoInputRef}
                      type="file"
                      accept={form.mediaType === "IMAGE" ? "image/*" : "video/*"}
                      onChange={(e) => handleFileUpload(e, form.mediaType)}
                      className="hidden"
                    />
                    <button
                      onClick={() => form.mediaType === "IMAGE" ? imageInputRef.current?.click() : videoInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Upload size={16} />
                      Upload {form.mediaType === "IMAGE" ? "Image" : "Video"}
                    </button>
                    {form.mediaUrl && (
                      <button
                        onClick={() => updateField("mediaUrl", "")}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>

                  {/* File Requirements */}
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                    {form.mediaType === "IMAGE" ? (
                      <p>📸 Image max size: <strong>200KB</strong> (auto-compressed). Formats: JPG, PNG, WebP.</p>
                    ) : (
                      <p>🎬 Video max size: <strong>5MB</strong>, max length: <strong>10 seconds</strong>. Format: MP4.</p>
                    )}
                  </div>

                  {/* VIDEO SPECIFIC SETTINGS */}
                  {form.mediaType === "VIDEO" && (
                    <div className="space-y-4 pt-2 border-t">
                      <h4 className="text-sm font-semibold text-slate-700">Video Behavior</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Loop Video (never advance)</span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={form.videoLoop || false}
                            onChange={(e) => updateField("videoLoop", e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Enable Sound</span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={form.videoSound || false}
                            onChange={(e) => updateField("videoSound", e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                        </label>
                      </div>

                      {form.videoLoop && (
                        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-700">
                          ⚠️ Looping video will never auto-advance. Make sure prev/next buttons are visible in settings.
                        </div>
                      )}

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                          Advance after video ends? {!form.videoLoop ? "✅ Yes" : "❌ No (looping)"}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SOLID COLOR */}
              {form.mediaType === "SOLID" && (
                <div className="rounded-2xl border p-5 space-y-4">
                  <h3 className="text-base font-semibold">Solid Background Color</h3>
                  <ColorInput
                    label="Select Color"
                    value={form.solidColor}
                    onChange={(v) => updateField("solidColor", v)}
                  />
                  <div
                    className="h-32 rounded-xl border"
                    style={{ backgroundColor: form.solidColor || "#000" }}
                  />
                </div>
              )}

              {/* GRADIENT COLOR */}
              {form.mediaType === "GRADIENT" && (
                <div className="rounded-2xl border p-5 space-y-4">
                  <h3 className="text-base font-semibold">Gradient Builder</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectInput
                      label="Gradient Type"
                      value={form.gradientColor?.gradientType || "linear"}
                      onChange={(v) => updateField("gradientColor.gradientType", v)}
                      options={["linear", "radial"]}
                    />
                    {form.gradientColor?.gradientType === "linear" && (
                      <SelectInput
                        label="Direction"
                        value={form.gradientColor?.gradientDirection || "to right"}
                        onChange={(v) => updateField("gradientColor.gradientDirection", v)}
                        options={gradientDirections}
                      />
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ColorInput
                      label="Start Color"
                      value={form.gradientColor?.gradientColorStarts}
                      onChange={(v) => updateField("gradientColor.gradientColorStarts", v)}
                    />
                    <ColorInput
                      label="End Color"
                      value={form.gradientColor?.gradientColorEnds}
                      onChange={(v) => updateField("gradientColor.gradientColorEnds", v)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Color Stops</label>
                    <input
                      type="text"
                      value={form.gradientColor?.gradientColorStops || "0%, 100%"}
                      onChange={(e) => updateField("gradientColor.gradientColorStops", e.target.value)}
                      placeholder="0%, 100%"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Example: "0%, 50%, 100%" for 3-stop gradient</p>
                  </div>

                  {/* Live Preview */}
                  <div
                    className="h-32 rounded-xl border"
                    style={{
                      background: form.gradientColor?.gradientType === "radial"
                        ? `radial-gradient(circle, ${form.gradientColor?.gradientColorStarts}, ${form.gradientColor?.gradientColorEnds})`
                        : `linear-gradient(${form.gradientColor?.gradientDirection || "to right"}, ${form.gradientColor?.gradientColorStarts}, ${form.gradientColor?.gradientColorEnds})`
                    }}
                  />
                </div>
              )}

              {/* Slide Duration */}
              {form.mediaType !== "VIDEO" && (
                <div className="rounded-2xl border p-5">
                  <h3 className="text-base font-semibold mb-4">Slide Duration</h3>
                  <RangeInput
                    label="Duration"
                    value={form.nextSlideIn || 5}
                    onChange={(v) => updateField("nextSlideIn", v)}
                    min={1}
                    max={30}
                    step={1}
                    unit="s"
                  />
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 2: CONTENT LAYOUT */}
          {/* ============================================ */}
          {activeTab === "content" && (
            <div className="space-y-5">
              <div className="rounded-2xl border p-5">
                <h3 className="text-base font-semibold mb-4">Content Position</h3>
                <div className="grid grid-cols-3 gap-3">
                  {layoutOptions.map((layout) => (
                    <button
                      key={layout}
                      onClick={() => updateField("layoutType", layout)}
                      disabled={form.mediaType === "SOLID" || form.mediaType === "GRADIENT"}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        form.layoutType === layout
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300"
                      } ${(form.mediaType === "SOLID" || form.mediaType === "GRADIENT") && layout !== "CENTER" ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-sm font-bold">{layout}</span>
                    </button>
                  ))}
                </div>
                {(form.mediaType === "SOLID" || form.mediaType === "GRADIENT") && (
                  <p className="text-xs text-amber-600 mt-2">⚠️ SOLID/GRADIENT backgrounds only support CENTER layout.</p>
                )}
              </div>

              {/* Content Fields */}
              <div className="rounded-2xl border p-5 space-y-4">
                <h3 className="text-base font-semibold">Content Text</h3>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Badge Text</label>
                  <input
                    type="text"
                    value={form.badge || ""}
                    onChange={(e) => updateField("badge", e.target.value)}
                    placeholder="e.g. Industrial Solutions"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Title</label>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Enter slide title"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Description</label>
                  <textarea
                    rows={3}
                    value={form.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Enter slide description"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 3: BADGE STYLE */}
          {/* ============================================ */}
          {activeTab === "badge" && (
            <div className="space-y-5">
              <CollapsibleSection title="Badge Colors" icon={Palette} defaultOpen={true}>
                <div className="grid gap-4 md:grid-cols-2">
                  <ColorInput
                    label="Font Color"
                    value={form.badgeStyle?.fontColor}
                    onChange={(v) => updateField("badgeStyle.fontColor", v)}
                  />
                  <ColorInput
                    label="Background Color"
                    value={form.badgeStyle?.backgroundColor}
                    onChange={(v) => updateField("badgeStyle.backgroundColor", v)}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Badge Typography" icon={Type} defaultOpen={true}>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectInput
                    label="Font Weight"
                    value={form.badgeStyle?.fontWeight || "700"}
                    onChange={(v) => updateField("badgeStyle.fontWeight", v)}
                    options={fontWeightOptions}
                  />
                  <SelectInput
                    label="Text Transform"
                    value={form.badgeStyle?.textTransform || "uppercase"}
                    onChange={(v) => updateField("badgeStyle.textTransform", v)}
                    options={textTransformOptions}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Badge Spacing & Effects" icon={Eye} defaultOpen={true}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Padding</label>
                    <input
                      type="text"
                      value={form.badgeStyle?.padding || "6px 14px"}
                      onChange={(e) => updateField("badgeStyle.padding", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Border Radius</label>
                    <input
                      type="text"
                      value={form.badgeStyle?.borderRadius || "4px"}
                      onChange={(e) => updateField("badgeStyle.borderRadius", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Letter Spacing</label>
                    <input
                      type="text"
                      value={form.badgeStyle?.letterSpacing || "0.05em"}
                      onChange={(e) => updateField("badgeStyle.letterSpacing", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Transition</label>
                    <input
                      type="text"
                      value={form.badgeStyle?.transition || "all 0.3s ease"}
                      onChange={(e) => updateField("badgeStyle.transition", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <RangeInput
                  label="Hover Scale"
                  value={parseFloat(form.badgeStyle?.hoverScale || 1.03)}
                  onChange={(v) => updateField("badgeStyle.hoverScale", v)}
                  min={0.9}
                  max={1.5}
                  step={0.01}
                  unit="x"
                />
              </CollapsibleSection>

              {/* Badge Preview */}
              <div className="rounded-2xl border p-5 bg-slate-900">
                <h4 className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Badge Preview</h4>
                <span
                  className="inline-block"
                  style={{
                    color: form.badgeStyle?.fontColor || "#fff",
                    backgroundColor: form.badgeStyle?.backgroundColor || "#e98a0f",
                    padding: form.badgeStyle?.padding || "6px 14px",
                    fontWeight: form.badgeStyle?.fontWeight || "700",
                    letterSpacing: form.badgeStyle?.letterSpacing || "0.05em",
                    textTransform: form.badgeStyle?.textTransform || "uppercase",
                    borderRadius: form.badgeStyle?.borderRadius || "4px",
                    transition: form.badgeStyle?.transition || "all 0.3s ease",
                  }}
                >
                  {form.badge || "Badge Text"}
                </span>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 4: TITLE STYLE */}
          {/* ============================================ */}
          {activeTab === "title" && (
            <div className="space-y-5">
              <CollapsibleSection title="Title Colors" icon={Palette} defaultOpen={true}>
                <ColorInput
                  label="Font Color"
                  value={form.titleStyle?.fontColor}
                  onChange={(v) => updateField("titleStyle.fontColor", v)}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Title Typography" icon={Type} defaultOpen={true}>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectInput
                    label="Font Weight"
                    value={form.titleStyle?.fontWeight || "900"}
                    onChange={(v) => updateField("titleStyle.fontWeight", v)}
                    options={fontWeightOptions}
                  />
                  <SelectInput
                    label="Font Size"
                    value={form.titleStyle?.fontSize || "text-5xl"}
                    onChange={(v) => updateField("titleStyle.fontSize", v)}
                    options={fontSizeOptions}
                  />
                  <SelectInput
                    label="Text Transform"
                    value={form.titleStyle?.textTransform || "none"}
                    onChange={(v) => updateField("titleStyle.textTransform", v)}
                    options={textTransformOptions}
                  />
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Line Height</label>
                    <input
                      type="text"
                      value={form.titleStyle?.lineHeight || "leading-tight"}
                      onChange={(e) => updateField("titleStyle.lineHeight", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Title Effects" icon={Eye}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Letter Spacing</label>
                    <input
                      type="text"
                      value={form.titleStyle?.letterSpacing || "-0.02em"}
                      onChange={(e) => updateField("titleStyle.letterSpacing", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Transition</label>
                    <input
                      type="text"
                      value={form.titleStyle?.transition || "all 0.3s ease"}
                      onChange={(e) => updateField("titleStyle.transition", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <RangeInput
                  label="Hover Scale"
                  value={parseFloat(form.titleStyle?.hoverScale || 1.0)}
                  onChange={(v) => updateField("titleStyle.hoverScale", v)}
                  min={0.9}
                  max={1.5}
                  step={0.01}
                  unit="x"
                />
              </CollapsibleSection>

              {/* Title Preview */}
              <div className="rounded-2xl border p-5 bg-slate-900">
                <h4 className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Title Preview</h4>
                <h2
                  style={{
                    color: form.titleStyle?.fontColor || "#fff",
                    fontWeight: form.titleStyle?.fontWeight || "900",
                    letterSpacing: form.titleStyle?.letterSpacing || "-0.02em",
                    textTransform: form.titleStyle?.textTransform || "none",
                    transition: form.titleStyle?.transition || "all 0.3s ease",
                  }}
                >
                  {form.title || "Slide Title Preview"}
                </h2>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 5: DESCRIPTION STYLE */}
          {/* ============================================ */}
          {activeTab === "description" && (
            <div className="space-y-5">
              <CollapsibleSection title="Description Colors" icon={Palette} defaultOpen={true}>
                <ColorInput
                  label="Font Color"
                  value={form.descriptionStyle?.fontColor}
                  onChange={(v) => updateField("descriptionStyle.fontColor", v)}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Description Typography" icon={Type} defaultOpen={true}>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectInput
                    label="Font Weight"
                    value={form.descriptionStyle?.fontWeight || "400"}
                    onChange={(v) => updateField("descriptionStyle.fontWeight", v)}
                    options={fontWeightOptions}
                  />
                  <SelectInput
                    label="Font Size"
                    value={form.descriptionStyle?.fontSize || "text-lg"}
                    onChange={(v) => updateField("descriptionStyle.fontSize", v)}
                    options={fontSizeOptions}
                  />
                  <SelectInput
                    label="Text Transform"
                    value={form.descriptionStyle?.textTransform || "none"}
                    onChange={(v) => updateField("descriptionStyle.textTransform", v)}
                    options={textTransformOptions}
                  />
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Line Height</label>
                    <input
                      type="text"
                      value={form.descriptionStyle?.lineHeight || "leading-relaxed"}
                      onChange={(e) => updateField("descriptionStyle.lineHeight", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Description Preview */}
              <div className="rounded-2xl border p-5 bg-slate-900">
                <h4 className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Description Preview</h4>
                <p
                  style={{
                    color: form.descriptionStyle?.fontColor || "#e2e8f0",
                    fontWeight: form.descriptionStyle?.fontWeight || "400",
                    letterSpacing: form.descriptionStyle?.letterSpacing || "0em",
                    textTransform: form.descriptionStyle?.textTransform || "none",
                    transition: form.descriptionStyle?.transition || "all 0.3s ease",
                  }}
                >
                  {form.description || "Slide description preview text goes here..."}
                </p>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 6: CTA BUTTON STYLE */}
          {/* ============================================ */}
          {activeTab === "cta" && (
            <div className="space-y-5">
              {/* CTA Content */}
              <div className="rounded-2xl border p-5 space-y-4">
                <h3 className="text-base font-semibold">Button Content & Link</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Button Text</label>
                    <input
                      type="text"
                      value={form.ctaText || ""}
                      onChange={(e) => updateField("ctaText", e.target.value)}
                      placeholder="Explore Products"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Button Link</label>
                    <input
                      type="text"
                      value={form.ctaLink || ""}
                      onChange={(e) => updateField("ctaLink", e.target.value)}
                      placeholder="/products"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.ctaOpenInNewTab || false}
                    onChange={(e) => updateField("ctaOpenInNewTab", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-600">Open in new tab</span>
                </div>
              </div>

              {/* Button Colors */}
              <CollapsibleSection title="Button Colors" icon={Palette} defaultOpen={true}>
                <ColorInput
                  label="Font Color"
                  value={form.ctaButtonStyle?.fontColor}
                  onChange={(v) => updateField("ctaButtonStyle.fontColor", v)}
                />
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Background Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateField("ctaButtonStyle.backgroundColor.mediatype", "SOLID")}
                      className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                        form.ctaButtonStyle?.backgroundColor?.mediatype === "SOLID"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200"
                      }`}
                    >
                      Solid Color
                    </button>
                    <button
                      onClick={() => updateField("ctaButtonStyle.backgroundColor.mediatype", "GRADIENT")}
                      className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                        form.ctaButtonStyle?.backgroundColor?.mediatype === "GRADIENT"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200"
                      }`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {form.ctaButtonStyle?.backgroundColor?.mediatype === "SOLID" ? (
                  <ColorInput
                    label="Solid Color"
                    value={form.ctaButtonStyle?.backgroundColor?.solid}
                    onChange={(v) => updateField("ctaButtonStyle.backgroundColor.solid", v)}
                  />
                ) : (
                  <div className="space-y-3">
                    <SelectInput
                      label="Gradient Type"
                      value={form.ctaButtonStyle?.backgroundColor?.gradient?.gradientType || "linear"}
                      onChange={(v) => updateField("ctaButtonStyle.backgroundColor.gradient.gradientType", v)}
                      options={["linear", "radial"]}
                    />
                    {form.ctaButtonStyle?.backgroundColor?.gradient?.gradientType === "linear" && (
                      <SelectInput
                        label="Direction"
                        value={form.ctaButtonStyle?.backgroundColor?.gradient?.gradientDirection || "to right"}
                        onChange={(v) => updateField("ctaButtonStyle.backgroundColor.gradient.gradientDirection", v)}
                        options={gradientDirections}
                      />
                    )}
                    <ColorInput
                      label="Start Color"
                      value={form.ctaButtonStyle?.backgroundColor?.gradient?.gradientColorStarts}
                      onChange={(v) => updateField("ctaButtonStyle.backgroundColor.gradient.gradientColorStarts", v)}
                    />
                    <ColorInput
                      label="End Color"
                      value={form.ctaButtonStyle?.backgroundColor?.gradient?.gradientColorEnds}
                      onChange={(v) => updateField("ctaButtonStyle.backgroundColor.gradient.gradientColorEnds", v)}
                    />
                  </div>
                )}
              </CollapsibleSection>

              {/* Button Typography */}
              <CollapsibleSection title="Button Typography" icon={Type}>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectInput
                    label="Font Weight"
                    value={form.ctaButtonStyle?.fontWeight || "700"}
                    onChange={(v) => updateField("ctaButtonStyle.fontWeight", v)}
                    options={fontWeightOptions}
                  />
                  <SelectInput
                    label="Text Transform"
                    value={form.ctaButtonStyle?.textTransform || "uppercase"}
                    onChange={(v) => updateField("ctaButtonStyle.textTransform", v)}
                    options={textTransformOptions}
                  />
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Letter Spacing</label>
                    <input
                      type="text"
                      value={form.ctaButtonStyle?.letterSpacing || "0.05em"}
                      onChange={(e) => updateField("ctaButtonStyle.letterSpacing", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Button Spacing & Border */}
              <CollapsibleSection title="Button Spacing & Border" icon={Eye}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Padding</label>
                    <input
                      type="text"
                      value={form.ctaButtonStyle?.padding || "12px 28px"}
                      onChange={(e) => updateField("ctaButtonStyle.padding", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Border Radius</label>
                    <input
                      type="text"
                      value={form.ctaButtonStyle?.borderRadius || "8px"}
                      onChange={(e) => updateField("ctaButtonStyle.borderRadius", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Border Width</label>
                    <input
                      type="text"
                      value={form.ctaButtonStyle?.borderWidth || "0px"}
                      onChange={(e) => updateField("ctaButtonStyle.borderWidth", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <ColorInput
                    label="Border Color"
                    value={form.ctaButtonStyle?.borderColor}
                    onChange={(v) => updateField("ctaButtonStyle.borderColor", v)}
                  />
                </div>
              </CollapsibleSection>

              {/* Button Effects */}
              <CollapsibleSection title="Button Effects" icon={Eye}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Transition</label>
                    <input
                      type="text"
                      value={form.ctaButtonStyle?.transition || "all 0.3s ease"}
                      onChange={(e) => updateField("ctaButtonStyle.transition", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Box Shadow</label>
                    <input
                      type="text"
                      value={form.ctaButtonStyle?.boxShadow || "none"}
                      onChange={(e) => updateField("ctaButtonStyle.boxShadow", e.target.value)}
                      placeholder="e.g. 0 4px 12px rgba(0,0,0,0.15)"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <RangeInput
                  label="Hover Scale"
                  value={parseFloat(form.ctaButtonStyle?.hoverScale || 1.05)}
                  onChange={(v) => updateField("ctaButtonStyle.hoverScale", v)}
                  min={0.9}
                  max={3.0}
                  step={0.01}
                  unit="x"
                />
              </CollapsibleSection>

              {/* CTA Preview */}
              <div className="rounded-2xl border p-5 bg-slate-900">
                <h4 className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Button Preview</h4>
                <button
                  style={{
                    color: form.ctaButtonStyle?.fontColor || "#fff",
                    background: form.ctaButtonStyle?.backgroundColor?.mediatype === "SOLID"
                      ? form.ctaButtonStyle?.backgroundColor?.solid || "#1e3a8a"
                      : form.ctaButtonStyle?.backgroundColor?.gradient?.gradientType === "radial"
                        ? `radial-gradient(circle, ${form.ctaButtonStyle?.backgroundColor?.gradient?.gradientColorStarts}, ${form.ctaButtonStyle?.backgroundColor?.gradient?.gradientColorEnds})`
                        : `linear-gradient(${form.ctaButtonStyle?.backgroundColor?.gradient?.gradientDirection || "to right"}, ${form.ctaButtonStyle?.backgroundColor?.gradient?.gradientColorStarts}, ${form.ctaButtonStyle?.backgroundColor?.gradient?.gradientColorEnds})`,
                    padding: form.ctaButtonStyle?.padding || "12px 28px",
                    borderRadius: form.ctaButtonStyle?.borderRadius || "8px",
                    fontWeight: form.ctaButtonStyle?.fontWeight || "700",
                    letterSpacing: form.ctaButtonStyle?.letterSpacing || "0.05em",
                    textTransform: form.ctaButtonStyle?.textTransform || "uppercase",
                    transition: form.ctaButtonStyle?.transition || "all 0.3s ease",
                    borderWidth: form.ctaButtonStyle?.borderWidth || "0px",
                    borderColor: form.ctaButtonStyle?.borderColor || "transparent",
                    borderStyle: "solid",
                    boxShadow: form.ctaButtonStyle?.boxShadow || "none",
                    cursor: "pointer",
                  }}
                >
                  {form.ctaText || "Button Text"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ===== MODAL FOOTER ===== */}
        <div className="flex items-center justify-between border-t px-6 py-4 sticky bottom-0 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Save size={18} />
              {initialData ? "Update Slide" : "Create Slide"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}