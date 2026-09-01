"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import productsApi from "@/lib/productsApi";

export default function BrochureExtractPanel({ productId, onApply }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [selected, setSelected] = useState({});

  const runExtract = async () => {
    setError("");
    setLoading(true);
    setSuggestions(null);
    try {
      const result = await productsApi.extractBrochureMetadata(productId);
      setSuggestions(result);
      // Pre-check every field that actually came back with something.
      setSelected({
        name: !!result.name,
        modelNumber: !!result.modelNumber,
        description: !!result.description,
        keyFeatures: (result.keyFeatures || []).length > 0,
        specifications: (result.specifications || []).length > 0,
      });
    } catch (err) {
      setError(err.message || "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!suggestions) return;
    const fields = {};
    if (selected.name && suggestions.name) fields.name = suggestions.name;
    if (selected.modelNumber && suggestions.modelNumber) fields.model = suggestions.modelNumber;
    if (selected.description && suggestions.description) fields.description = suggestions.description;
    if (selected.keyFeatures && suggestions.keyFeatures?.length) fields.keyFeatures = suggestions.keyFeatures;
    if (selected.specifications && suggestions.specifications?.length) fields.specifications = suggestions.specifications;
    onApply(fields);
    setSuggestions(null);
  };

  const hasAnything =
    suggestions &&
    (suggestions.name || suggestions.modelNumber || suggestions.description ||
      suggestions.keyFeatures?.length || suggestions.specifications?.length);

  return (
    <div className="mt-3">
      {!suggestions && (
        <button
          type="button"
          onClick={runExtract}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-bold px-4 py-2 hover:bg-purple-100 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "Reading brochure with Gemini..." : "Auto-fill from brochure"}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {suggestions && (
        <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-3">
          <p className="text-xs font-bold text-purple-800">
            Review before applying — uncheck anything you don&apos;t want:
          </p>

          {suggestions.name && (
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={!!selected.name}
                onChange={(e) => setSelected((s) => ({ ...s, name: e.target.checked }))} className="mt-0.5" />
              <span><span className="font-bold">Name:</span> {suggestions.name}</span>
            </label>
          )}
          {suggestions.modelNumber && (
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={!!selected.modelNumber}
                onChange={(e) => setSelected((s) => ({ ...s, modelNumber: e.target.checked }))} className="mt-0.5" />
              <span><span className="font-bold">Model Number:</span> {suggestions.modelNumber}</span>
            </label>
          )}
          {suggestions.description && (
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={!!selected.description}
                onChange={(e) => setSelected((s) => ({ ...s, description: e.target.checked }))} className="mt-0.5" />
              <span><span className="font-bold">Description:</span> {suggestions.description}</span>
            </label>
          )}
          {suggestions.keyFeatures?.length > 0 && (
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={!!selected.keyFeatures}
                onChange={(e) => setSelected((s) => ({ ...s, keyFeatures: e.target.checked }))} className="mt-0.5" />
              <span><span className="font-bold">Key Features ({suggestions.keyFeatures.length}):</span> {suggestions.keyFeatures.join(" · ")}</span>
            </label>
          )}
          {suggestions.specifications?.length > 0 && (
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={!!selected.specifications}
                onChange={(e) => setSelected((s) => ({ ...s, specifications: e.target.checked }))} className="mt-0.5" />
              <span>
                <span className="font-bold">Specifications ({suggestions.specifications.length}):</span>{" "}
                {suggestions.specifications.map((s) => `${s.key}: ${s.value}`).join(" · ")}
              </span>
            </label>
          )}
          {!hasAnything && (
            <p className="text-xs text-slate-500 italic">
              Gemini couldn&apos;t confidently extract any fields from this brochure — you can still fill these in manually.
            </p>
          )}

          {hasAnything && (
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={apply}
                className="flex items-center gap-1 rounded-lg bg-purple-600 text-white text-xs font-bold px-4 py-2 hover:bg-purple-700">
                <Check size={13} /> Apply Selected
              </button>
              <button type="button" onClick={() => setSuggestions(null)}
                className="rounded-lg border text-xs font-bold px-4 py-2 hover:bg-slate-100">
                Discard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
