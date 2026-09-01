"use client";

import { useState, useMemo } from "react";
import { X, ShoppingCart } from "lucide-react";
import { toStaticUrl } from "@/lib/client";
import { useRfqCart } from "@/context/RfqCartContext";

/**
 * Renders nothing until `product` is set. Used whenever "Add to Quote" is
 * clicked for a product that has variants — the listing page and the
 * chatbot's search results both open this instead of adding blindly.
 */
export default function VariantPickerModal({ product, onClose }) {
  const { addItem, updateQuantity, cart } = useRfqCart();
  const variants = product?.variants || [];

  const attributeGroups = useMemo(() => {
    if (!variants.length) return [];
    const groups = {};
    for (const v of variants) {
      for (const [key, value] of Object.entries(v.attributes || {})) {
        if (!value) continue;
        if (!groups[key]) groups[key] = new Set();
        groups[key].add(value);
      }
    }
    return Object.entries(groups).map(([key, values]) => ({ key, values: Array.from(values) }));
  }, [variants]);

  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;

  if (!product) return null;

  const selectByAttribute = (key, value) => {
    const current = { ...(selectedVariant?.attributes || {}), [key]: value };
    const exact = variants.find((v) => Object.entries(current).every(([k, val]) => !val || v.attributes?.[k] === val));
    const fallback = variants.find((v) => v.attributes?.[key] === value);
    setSelectedVariantId((exact || fallback)?.id || null);
  };

  const handleAdd = () => {
    const lineId = selectedVariant ? `${product.id}::${selectedVariant.id}` : product.id;
    const existing = cart.find((l) => l.lineId === lineId);
    if (existing) {
      updateQuantity(lineId, quantity);
    } else {
      addItem(
        { id: product.id, productId: product.id, name: product.name, variantId: selectedVariant?.id, variantName: selectedVariant?.name },
        quantity
      );
    }
    onClose();
  };

  const thumb = selectedVariant?.images?.[0] || product.images?.[0]?.url || product.images?.[0];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h3 className="text-sm font-black text-slate-900">Select Options</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            {thumb && <img src={toStaticUrl(thumb)} alt="" className="w-14 h-14 rounded-lg object-cover border" />}
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
              {(selectedVariant?.model || product.model) && (
                <p className="text-xs text-slate-400">Model: {selectedVariant?.model || product.model}</p>
              )}
            </div>
          </div>

          {attributeGroups.map(({ key, values }) => (
            <div key={key}>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                {key}{selectedVariant?.attributes?.[key] ? `: ${selectedVariant.attributes[key]}` : ""}
              </label>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const active = selectedVariant?.attributes?.[key] === value;
                  return (
                    <button key={value} onClick={() => selectByAttribute(key, value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${active ? "bg-blue-950 text-white border-blue-950" : "bg-white text-slate-600 border-slate-200 hover:border-blue-950"}`}>
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Quantity</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border font-bold text-slate-500 hover:bg-slate-50">−</button>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 text-center text-sm font-bold border rounded-lg py-1.5" />
              <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 rounded-lg border font-bold text-slate-500 hover:bg-slate-50">+</button>
            </div>
          </div>
        </div>

        <div className="border-t px-5 py-4">
          <button onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-xl">
            <ShoppingCart size={15} /> Add to Quote Bucket
          </button>
        </div>
      </div>
    </div>
  );
}
