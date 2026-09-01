"use client";

import { useState, useEffect } from "react";
import { PRODUCTS_SETTINGS } from "@/data/products";
import { Eye, RefreshCw, Maximize2 } from "lucide-react";

export default function ProductPreview({ products }) {
  const [settings, setSettings] = useState(PRODUCTS_SETTINGS);
  const [previewMode, setPreviewMode] = useState("grid"); // grid | list | single

  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem("sbs-products-settings");
        if (saved) setSettings(JSON.parse(saved));
      } catch {}
    };
    loadSettings();
    window.addEventListener("sbs-products-settings-updated", loadSettings);
    window.addEventListener("storage", loadSettings);
    return () => {
      window.removeEventListener("sbs-products-settings-updated", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  const { layout, card } = settings;
  const previewProducts = products.slice(0, 6);

  const getGridCols = () => {
    const cols = layout?.cardsPerRow || 3;
    if (cols === 1) return "grid-cols-1";
    if (cols === 2) return "grid-cols-1 sm:grid-cols-2";
    if (cols === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (cols === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  const getGapClass = () => {
    if (layout?.gap === "sm") return "gap-2";
    if (layout?.gap === "lg") return "gap-8";
    return "gap-4";
  };

  const getCardStyle = () => {
    if (card?.style === "outlined") return "border-2 border-slate-200";
    if (card?.style === "flat") return "border border-slate-100";
    return "border border-slate-100 shadow-md hover:shadow-xl";
  };

  const getImageRatio = () => {
    if (card?.imageRatio === "video") return "aspect-video";
    if (card?.imageRatio === "auto") return "";
    return "aspect-square";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live Card Preview</h2>
          <p className="mt-1 text-sm text-slate-500">Preview how product cards will appear on the public page.</p>
        </div>
        <div className="flex gap-2">
          {["grid", "list", "single"].map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                previewMode === mode
                  ? "bg-blue-600 text-white"
                  : "border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: layout?.pageBackground || "#f8fafc" }}
      >
        {previewMode === "grid" && (
          <div className={`grid ${getGridCols()} ${getGapClass()}`}>
            {previewProducts.map((product) => {
              const firstImage = product.images?.[0]?.url || "";
              return (
                <div
                  key={product.id}
                  className={`flex flex-col bg-white overflow-hidden group ${
                    card?.cornerRadius || "rounded-2xl"
                  } ${getCardStyle()}`}
                  style={{ backgroundColor: card?.cardBackground || "#ffffff" }}
                >
                  <div
                    className={`relative w-full ${getImageRatio()} flex items-center justify-center p-4 border-b`}
                    style={{ backgroundColor: card?.imageBackground || "#f8fafc" }}
                  >
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className={`w-full h-full ${card?.imageFit === "cover" ? "object-cover" : "object-contain"}`}
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    {card?.showBrandBadge && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-white/90 px-2 py-0.5 rounded">
                        {typeof product.brand === "object" ? product.brand?.name : product.brand}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    {card?.showSkuId && (
                      <span className="text-[10px] font-mono text-slate-400 mb-1">{product.id}</span>
                    )}
                    <h3 className="text-sm font-black text-slate-900">{product.name}</h3>
                    {card?.showKeyFeatures && product.keyFeatures && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{product.keyFeatures}</p>
                    )}
                    {card?.showModel && product.model && (
                      <p className="text-[10px] text-slate-400 mt-2">Model: {product.model}</p>
                    )}
                    {card?.showPricePill && (
                      <div className="mt-auto pt-3">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {card?.priceLabel || "Price On Request"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {previewMode === "list" && (
          <div className="space-y-3">
            {previewProducts.map((product) => {
              const firstImage = product.images?.[0]?.url || "";
              return (
                <div key={product.id} className="flex items-center gap-4 bg-white rounded-xl border p-4">
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                    {firstImage ? (
                      <img src={firstImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                    <p className="text-xs text-slate-500">{typeof product.brand === "object" ? product.brand?.name : product.brand} · {product.model || "N/A"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {previewMode === "single" && previewProducts[0] && (
          <div className="max-w-lg mx-auto">
            <div
              className={`flex flex-col bg-white overflow-hidden ${
                card?.cornerRadius || "rounded-2xl"
              } ${getCardStyle()}`}
            >
              <div className={`relative w-full ${getImageRatio()} flex items-center justify-center p-6`}
                style={{ backgroundColor: card?.imageBackground || "#f8fafc" }}>
                {previewProducts[0].images?.[0]?.url ? (
                  <img src={previewProducts[0].images[0].url} alt="" className="max-h-64 object-contain" />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
              <div className="p-6 space-y-3">
                <h2 className="text-xl font-black text-slate-900">{previewProducts[0].name}</h2>
                <p className="text-sm text-slate-600">{previewProducts[0].keyFeatures}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw size={12} />
        <span>Preview updates automatically when you save design settings</span>
      </div>
    </div>
  );
}