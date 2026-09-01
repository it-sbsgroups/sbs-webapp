// components/public/QuoteBucketModal.jsx
//
// Single, site-wide "Quote Bucket" modal. Mounted once in the public
// layout so it's available on every page — opened by dispatching a
// window "sbs-open-cart-modal" CustomEvent (the header cart button does
// this via PublicLayout's onCartClick, and any product page can do the
// same after adding an item).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import rfqApi from "@/lib/rfqApi";
import { useRfqCart } from "@/context/RfqCartContext";

const EMPTY_FORM = { fullName: "", email: "", mobile: "", companyName: "", address: "", remarks: "" };

export default function QuoteBucketModal() {
  const { cart, removeItem, updateQuantity, clearCart } = useRfqCart();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const openModal = () => setOpen(true);
    window.addEventListener("sbs-open-cart-modal", openModal);
    return () => window.removeEventListener("sbs-open-cart-modal", openModal);
  }, []);

  // Lock body scroll while open, and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    const payload = {
      fullName: formData.fullName || "",
      companyName: formData.companyName || undefined,
      email: formData.email || "",
      mobile: formData.mobile || "",
      address: formData.address || undefined,
      remarks: formData.remarks || undefined,
      items: cart.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity || 1,
        variantId: item.variantId || undefined,
      })),
    };
    try {
      await rfqApi.submit(payload);
      showToast(`✓ Quote request sent for ${cart.length} item line${cart.length > 1 ? "s" : ""}. We'll reply to ${formData.email}.`);
      clearCart();
      setFormData(EMPTY_FORM);
      setOpen(false);
    } catch (err) {
      console.error("RFQ submission failed:", err);
      showToast("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    // Toast can still be visible for a moment right after a successful
    // submit closes the modal.
    return toast ? <Toast message={toast} /> : null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-[70] overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-blue-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">Your Quote Bucket</h2>
              <p className="text-[10px] text-blue-200/70 font-medium">Request a quotation for everything you've added.</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white font-bold text-sm" aria-label="Close">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
                <span className="text-3xl">🛒</span>
                <p className="text-xs font-bold text-slate-500">Your Quote Bucket is empty.</p>
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-block bg-blue-950 text-white font-black text-[11px] px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-blue-900 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Items in Quote Bucket ({cart.length})
                  </p>
                  <div className="divide-y divide-slate-200/60 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.lineId} className="py-2 flex justify-between items-center text-xs gap-2">
                        <div className="truncate">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          {item.variantName && (
                            <span className="ml-1.5 text-[10px] text-blue-900 font-black bg-blue-50 px-1.5 py-0.5 rounded">{item.variantName}</span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.id}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 font-black"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              −
                            </button>
                            <span className="px-2 font-black text-slate-800 text-[11px]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 font-black"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.lineId)}
                            className="text-rose-500 font-bold text-xs hover:text-rose-700"
                            aria-label={`Remove ${item.name}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Contact Full Name</label>
                      <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g., Amit Sharma" className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Company / Enterprise Entity</label>
                      <input type="text" required value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g., Singrauli Minerals Private Ltd" className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Official Email Address</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="procurement@company.com" className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Mobile Number</label>
                      <input type="tel" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="10-digit mobile number" className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Delivery Address (Optional)</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Company address for delivery / quotation" className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Remarks (Optional)</label>
                    <textarea rows="3" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Dispatch preferences, timeline constraints, special packaging protocols..." className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 font-medium" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-blue-950 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-blue-900 transition-colors disabled:opacity-60">
                    {submitting ? "Sending…" : "🚀 Request Quotation"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9px; }
      `}</style>

      {toast && <Toast message={toast} />}
    </>
  );
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl border border-slate-700 max-w-[90vw] text-center">
      {message}
    </div>
  );
}
