"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Send, Mail, Copy, FileText, Eye, Percent } from "lucide-react";
import rfqApi from "@/lib/rfqApi";
import { formatDateTimeIST } from "@/lib/dateUtils";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RfqReplyModal({ open, rfq, onClose, onSave }) {
  const items = rfq?.items || rfq?.products || [];
  const [pricing, setPricing] = useState({});
  const [overallDiscountPercent, setOverallDiscountPercent] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [defaultTerms, setDefaultTerms] = useState("");
  const [termsDecision, setTermsDecision] = useState(null);
  const [includePrivacyPolicy, setIncludePrivacyPolicy] = useState(false);
  const [replyNote, setReplyNote] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Re: RFQ ${rfq?.reference || rfq?.id || ""} - Quotation from SBS Groups`);
  const [emailBody, setEmailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (!rfq) return;
    setTermsDecision(null);
    const initial = {};
    items.forEach((item) => { initial[item.id] = { unitPrice: "", discountPercent: "" }; });
    setPricing(initial);

    const productList = items.map((item) => {
      const product = item.product || item;
      const variant = item.variant;
      return `- ${product.name || "Product"}${variant ? ` (${variant.name})` : ""} (Qty: ${item.quantity || 1})`;
    }).join("\n");

    setEmailBody(
      `Dear ${rfq.fullName || rfq.clientName || "Sir/Madam"},\n\n` +
      `Thank you for your quotation request (${rfq.reference || rfq.id}).\n\n` +
      `Please find attached our detailed quotation for:\n${productList}\n\n` +
      `We look forward to your confirmation.\n\n` +
      `Regards,\nSBS Groups Sales Team`
    );

    rfqApi.getSettings().then((s) => {
      if (s?.defaultTermsAndConditions) { setTermsAndConditions(s.defaultTermsAndConditions); setDefaultTerms(s.defaultTermsAndConditions); }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfq?.id]);

  const setItemPrice = (itemId, field, value) => {
    setPricing((p) => ({ ...p, [itemId]: { ...p[itemId], [field]: value } }));
  };

  const { lineTotals, subtotal, preDiscountTotal, overallDiscountAmount, grandTotal } = useMemo(() => {
    let subtotal = 0, preDiscountTotal = 0;
    const lineTotals = {};
    items.forEach((item) => {
      const p = pricing[item.id] || {};
      const unitPrice = Number(p.unitPrice) || 0;
      const discountPercent = Math.min(100, Math.max(0, Number(p.discountPercent) || 0));
      const qty = item.quantity || 1;
      const gross = unitPrice * qty;
      const lineTotal = gross - (gross * discountPercent) / 100;
      lineTotals[item.id] = lineTotal;
      subtotal += gross;
      preDiscountTotal += lineTotal;
    });
    const overallDiscountAmount = (preDiscountTotal * (Number(overallDiscountPercent) || 0)) / 100;
    const grandTotal = preDiscountTotal - overallDiscountAmount;
    return { lineTotals, subtotal, preDiscountTotal, overallDiscountAmount, grandTotal };
  }, [items, pricing, overallDiscountPercent]);

  if (!open || !rfq) return null;

  const buildDraft = () => ({
    items: items.map((item) => ({
      rfqItemId: item.id,
      unitPrice: Number(pricing[item.id]?.unitPrice) || 0,
      discountPercent: Number(pricing[item.id]?.discountPercent) || 0,
    })),
    overallDiscountPercent: Number(overallDiscountPercent) || 0,
    termsAndConditions,
    includePrivacyPolicy,
  });

  const hasAnyPricing = items.some((item) => Number(pricing[item.id]?.unitPrice) > 0);

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      await rfqApi.previewQuotationPdf(rfq.id, buildDraft());
    } catch (err) {
      alert(err.message || "Failed to preview quotation");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSendReply = async () => {
    setSending(true);
    try {
      const payload = {
        ...(hasAnyPricing ? buildDraft() : {}),
        note: replyNote,
        emailSubject,
        emailBody,
        sentTo: rfq.email,
      };
      await onSave(rfq.id, payload);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-bold">Reply to RFQ {rfq.reference || rfq.id}</h3>
            <p className="text-sm text-slate-500">
              {rfq.fullName || rfq.clientName} · {rfq.companyName || rfq.company || "—"} · Received: {formatDateTimeIST(rfq.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Client Info */}
          <div className="rounded-xl bg-slate-50 p-4 grid gap-3 md:grid-cols-2">
            <div><span className="text-[10px] font-bold uppercase text-slate-400">Client</span><p className="text-sm font-semibold">{rfq.fullName || rfq.clientName || "—"}</p></div>
            <div><span className="text-[10px] font-bold uppercase text-slate-400">Company</span><p className="text-sm font-semibold">{rfq.companyName || rfq.company || "—"}</p></div>
            <div><span className="text-[10px] font-bold uppercase text-slate-400">Email</span><p className="text-sm">{rfq.email || "—"}</p></div>
            <div><span className="text-[10px] font-bold uppercase text-slate-400">Mobile</span><p className="text-sm">{rfq.mobile || "—"}</p></div>
          </div>

          {rfq.remarks && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <span className="text-[10px] font-bold uppercase text-amber-600">Client Remarks</span>
              <p className="text-sm text-amber-800 mt-1">{rfq.remarks}</p>
            </div>
          )}

          {/* Itemized pricing */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16} /> Quotation — Per-Item Pricing</h4>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center w-16">Qty</th>
                    <th className="px-3 py-2 text-left w-32">Unit Price (₹)</th>
                    <th className="px-3 py-2 text-left w-28">Discount %</th>
                    <th className="px-3 py-2 text-right w-28">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => {
                    const product = item.product || item;
                    const variant = item.variant;
                    const p = pricing[item.id] || {};
                    return (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <p className="font-semibold">{product.name || "Product"}</p>
                          {variant && <p className="text-[10px] text-indigo-500 font-bold">{variant.name}</p>}
                        </td>
                        <td className="px-3 py-2 text-center font-bold">{item.quantity || 1}</td>
                        <td className="px-3 py-2">
                          <input type="number" min="0" step="0.01" value={p.unitPrice}
                            onChange={(e) => setItemPrice(item.id, "unitPrice", e.target.value)}
                            placeholder="0.00" className="w-full rounded-lg border px-2 py-1.5 text-xs" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min="0" max="100" value={p.discountPercent}
                            onChange={(e) => setItemPrice(item.id, "discountPercent", e.target.value)}
                            placeholder="0" className="w-full rounded-lg border px-2 py-1.5 text-xs" />
                        </td>
                        <td className="px-3 py-2 text-right font-bold">{inr(lineTotals[item.id])}</td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-400">No products listed</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-3 rounded-xl bg-slate-50 border p-4 space-y-2 max-w-sm ml-auto text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{inr(subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1"><Percent size={11} /> Overall Discount</span>
                <input type="number" min="0" max="100" value={overallDiscountPercent}
                  onChange={(e) => setOverallDiscountPercent(e.target.value)}
                  className="w-16 rounded-lg border px-2 py-1 text-right text-xs" />
              </div>
              {overallDiscountAmount > 0 && (
                <div className="flex justify-between text-red-500"><span>Discount Amount</span><span>- {inr(overallDiscountAmount)}</span></div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-2"><span>Grand Total</span><span>{inr(grandTotal)}</span></div>
            </div>
          </div>

          {/* T&C + Privacy */}
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">Terms &amp; Conditions</label>
              {termsDecision === null ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <p className="text-xs text-amber-800 font-semibold">
                    Do you want to change the Terms &amp; Conditions for this quotation, or use the default?
                  </p>
                  <pre className="text-[11px] text-slate-500 bg-white border rounded-lg p-2.5 max-h-24 overflow-y-auto whitespace-pre-wrap font-sans">
                    {defaultTerms || "(No default set — add one under RFQ Settings, or customize below.)"}
                  </pre>
                  <div className="flex gap-2">
                    <button onClick={() => setTermsDecision("default")}
                      className="flex-1 text-xs font-bold py-2.5 rounded-lg bg-white border border-amber-300 text-amber-700 hover:bg-amber-100">
                      No — use default
                    </button>
                    <button onClick={() => { setTermsDecision("custom"); }}
                      className="flex-1 text-xs font-bold py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                      Yes — customize
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea rows={4} value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)}
                    readOnly={termsDecision === "default"}
                    placeholder="Payment terms, delivery timeline, validity period, warranty…"
                    className={`w-full rounded-xl border px-4 py-3 text-sm resize-none ${termsDecision === "default" ? "bg-slate-50 text-slate-500" : ""}`} />
                  <button onClick={() => setTermsDecision(null)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600">
                    ← Change this decision
                  </button>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked={includePrivacyPolicy} onChange={(e) => setIncludePrivacyPolicy(e.target.checked)} />
              Include our Privacy Policy in the quotation PDF
            </label>
          </div>

          {/* Email Reply */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={16} /> Email Reply</h4>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Subject</label>
              <div className="flex gap-2">
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="flex-1 rounded-xl border px-4 py-3 text-sm" />
                <button onClick={() => copyToClipboard(emailSubject)} className="rounded-xl border px-3 py-3 text-slate-400 hover:bg-slate-50"><Copy size={16} /></button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Body</label>
              <textarea rows={8} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm resize-none font-mono" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Internal Note</label>
            <textarea rows={2} value={replyNote} onChange={(e) => setReplyNote(e.target.value)} placeholder="Add internal notes about this reply..." className="w-full rounded-xl border px-4 py-3 text-sm resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <button onClick={handlePreview} disabled={!hasAnyPricing || termsDecision === null || previewing}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-40">
            <Eye size={16} /> {previewing ? "Generating…" : "Preview PDF"}
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-xl border px-5 py-3 text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSendReply} disabled={sending || (hasAnyPricing && termsDecision === null)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              <Send size={16} /> {sending ? "Sending…" : "Send Quotation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}