// src/components/admin/products/RfqReplyModal.jsx
"use client";

import { useState } from "react";
import { X, Send, Mail, Copy, DollarSign, Percent } from "lucide-react";
import rfqApi from "@/lib/rfqApi";

export default function RfqReplyModal({ open, rfq, onClose, onSave }) {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [replyNote, setReplyNote] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Re: RFQ ${rfq?.reference || rfq?.id || ""} - Quotation from SBS Groups`);
  const [emailBody, setEmailBody] = useState("");

  // Initialize email body when rfq changes
  useState(() => {
    if (rfq) {
      const items = rfq.items || rfq.products || [];
      const productList = items.map((item) => {
        const product = item.product || item;
        return `- ${product.name || "Product"} (Qty: ${item.quantity || 1})`;
      }).join("\n");

      setEmailBody(
        `Dear ${rfq.fullName || rfq.clientName || "Sir/Madam"},\n\n` +
        `Thank you for your quotation request (${rfq.reference || rfq.id}).\n\n` +
        `We have reviewed your requirements for:\n${productList}\n\n` +
        `Please find our best pricing below:\n` +
        `Price: [Enter Price]\n` +
        `Discount: [Enter Discount]\n\n` +
        `Regards,\nSBS Groups Sales Team`
      );
    }
  }, [rfq]);

  if (!open || !rfq) return null;

  const handleSendReply = () => {
    const note = [
      price ? `Price: ${price}` : '',
      discount ? `Discount: ${discount}` : '',
      replyNote || '',
    ].filter(Boolean).join(' | ');

    onSave(rfq.id, note, emailBody, rfq.email);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const items = rfq.items || rfq.products || [];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-bold">Reply to RFQ {rfq.reference || rfq.id}</h3>
            <p className="text-sm text-slate-500">{rfq.fullName || rfq.clientName} · {rfq.companyName || rfq.company || "—"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
          {/* Client Info */}
          <div className="rounded-xl bg-slate-50 p-4 grid gap-3 md:grid-cols-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Client</span>
              <p className="text-sm font-semibold">{rfq.fullName || rfq.clientName || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Company</span>
              <p className="text-sm font-semibold">{rfq.companyName || rfq.company || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Email</span>
              <p className="text-sm">{rfq.email || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Mobile</span>
              <p className="text-sm">{rfq.mobile || "—"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">RFQ Reference</span>
              <p className="text-sm font-mono font-bold text-blue-700">{rfq.reference || rfq.id}</p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Requested Products</h4>
            <div className="rounded-xl border divide-y">
              {items.map((item, idx) => {
                const product = item.product || item;
                return (
                  <div key={product.id || idx} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{product.name || "Product"}</p>
                      <p className="text-[10px] text-slate-400">{product.id || product.sku || ""}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Qty: {item.quantity || 1}</span>
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="px-4 py-3 text-xs text-slate-400">No products listed</p>
              )}
            </div>
          </div>

          {/* Remarks */}
          {rfq.remarks && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <span className="text-[10px] font-bold uppercase text-amber-600">Client Remarks</span>
              <p className="text-sm text-amber-800 mt-1">{rfq.remarks}</p>
            </div>
          )}

          {/* Price & Discount */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} /> Quotation Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Price</label>
                <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. ₹25,000 per unit" className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Discount</label>
                <input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g. 10% bulk discount" className="w-full rounded-xl border px-4 py-3 text-sm" />
              </div>
            </div>
          </div>

          {/* Email Reply */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail size={16} /> Email Reply
            </h4>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Subject</label>
              <div className="flex gap-2">
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="flex-1 rounded-xl border px-4 py-3 text-sm" />
                <button onClick={() => copyToClipboard(emailSubject)} className="rounded-xl border px-3 py-3 text-slate-400 hover:bg-slate-50">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Body</label>
              <textarea rows={10} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm resize-none font-mono" />
            </div>
          </div>

          {/* Internal Note */}
          <div>
            <label className="mb-1.5 block text-xs font-medium">Internal Note</label>
            <textarea rows={2} value={replyNote} onChange={(e) => setReplyNote(e.target.value)} placeholder="Add internal notes about this reply..." className="w-full rounded-xl border px-4 py-3 text-sm resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <button onClick={() => copyToClipboard(`${emailSubject}\n\n${emailBody}`)} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-slate-50">
            <Copy size={16} /> Copy Email
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSendReply} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
              <Send size={16} /> Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}