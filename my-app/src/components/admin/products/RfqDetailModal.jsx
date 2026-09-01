// src/components/admin/products/RfqDetailModal.jsx

"use client";

import { X, Calendar, User, Building2, Mail, Phone, MapPin, MessageSquare, Package, Tag, Clock, ChevronDown, ChevronRight, ImageOff, CheckCircle2, Reply } from "lucide-react";
import { useState } from "react";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    REPLIED: "bg-blue-100 text-blue-700 border-blue-200",
    PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase ${styles[status] || ""}`}>
      {String(status || "").toLowerCase()}
    </span>
  );
}

function ProductDetails({ product }) {
  if (!product) return null;
  const images = product.images || [];
  const specifications = product.specifications || {};
  const certifications = product.certifications || [];
  const applications = product.applications || [];
  const categories = product.categoryName ? { category: product.categoryName, subcategory: product.subcategoryName } : {};

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {images[0] ? (
          <img
            src={images[0].url}
            alt={product.name}
            className="h-32 w-32 rounded-xl object-cover border shrink-0"
          />
        ) : (
          <div className="h-32 w-32 rounded-xl bg-slate-100 border flex items-center justify-center text-slate-300 shrink-0">
            <ImageOff size={32} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-slate-900">{product.name}</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">{product.model || "No Model"}</span>
            {product.brand && (
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                {typeof product.brand === "object" ? product.brand.name : product.brand}
              </span>
            )}
            {categories.category && (
              <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded">{categories.category}</span>
            )}
            {categories.subcategory && (
              <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-1 rounded">{categories.subcategory}</span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-3 line-clamp-3">{product.description || "No description"}</p>
        </div>
      </div>

      {product.keyFeatures && (
        <div>
          <h5 className="text-xs font-black uppercase text-slate-400 mb-1">Key Features</h5>
          <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
            <div dangerouslySetInnerHTML={{ __html: product.keyFeatures }} />
          </div>
        </div>
      )}

      {Object.keys(specifications).length > 0 && (
        <div>
          <h5 className="text-xs font-black uppercase text-slate-400 mb-1">Specifications</h5>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                <span className="font-semibold text-slate-600">{key}</span>
                <span className="text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {applications.length > 0 && (
        <div>
          <h5 className="text-xs font-black uppercase text-slate-400 mb-1">Applications</h5>
          <div className="flex flex-wrap gap-2">
            {applications.map((app, idx) => (
              <span key={idx} className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1">
                {typeof app === "string" ? app : app.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <h5 className="text-xs font-black uppercase text-slate-400 mb-1">Certifications</h5>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, idx) => (
              <span key={idx} className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                {typeof cert === "string" ? cert : cert.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VariantDetails({ variant }) {
  if (!variant) return null;
  const attributes = variant.attributes || {};
  const thumb = variant.images?.[0];

  return (
    <div className="mt-3 bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
      <h5 className="text-xs font-black uppercase text-indigo-600 mb-2">Requested Variant Details</h5>
      <div className="flex items-start gap-3">
        {thumb ? (
          <img src={thumb.url || thumb} alt={variant.name} className="h-16 w-16 rounded-lg object-cover border" />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-slate-100 border flex items-center justify-center text-slate-300">
            <ImageOff size={20} />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">{variant.name}</p>
          {Object.keys(attributes).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(attributes).map(([k, v]) => (
                <span key={k} className="text-[10px] font-bold bg-white border border-indigo-200 rounded px-2 py-0.5">
                  {k}: {v}
                </span>
              ))}
            </div>
          )}
          {variant.model && <p className="text-xs text-slate-500 mt-1">Model: {variant.model}</p>}
          {variant.sku && <p className="text-xs text-slate-500">SKU: {variant.sku}</p>}
        </div>
      </div>
    </div>
  );
}

function OtherVariants({ product, requestedVariant }) {
  const variants = product.variants || [];
  if (variants.length === 0) return null;

  return (
    <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
      <h5 className="text-xs font-black uppercase text-slate-400 mb-2">Available Variants ({variants.length})</h5>
      <div className="space-y-1.5">
        {variants.map((v) => {
          const isRequested = requestedVariant && v.id === requestedVariant.id;
          const thumb = v.images?.[0];
          return (
            <div
              key={v.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                isRequested ? "border-emerald-300 bg-emerald-50" : "border-transparent hover:border-slate-200"
              }`}
            >
              {thumb ? (
                <img src={thumb.url || thumb} alt={v.name} className="w-10 h-10 rounded-lg object-cover border" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-slate-300">
                  <ImageOff size={14} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{v.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(" · ")}
                </p>
              </div>
              {isRequested && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                  <CheckCircle2 size={12} /> Requested
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const product = item.product || item;
  const variant = item.variant;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <span className="text-sm font-semibold text-slate-800">{product.name || "Unnamed Product"}</span>
          {variant && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Variant: {variant.name}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Qty: {item.quantity || 1}</span>
          {product.model && <span className="text-xs text-slate-400">{product.model}</span>}
        </div>
      </div>
      {expanded && (
        <div className="p-4 border-t space-y-4">
          <ProductDetails product={product} />
          <VariantDetails variant={variant} />
          <OtherVariants product={product} requestedVariant={variant} />
        </div>
      )}
    </div>
  );
}

function PreviousQuotations({ rfq, allRfqs, onReply }) {
  if (!rfq?.email) return null;

  const previous = allRfqs.filter(
    (r) =>
      r.id !== rfq.id &&
      r.email &&
      r.email.toLowerCase() === rfq.email.toLowerCase()
  );

  if (previous.length === 0) return null;

  return (
    <div className="border rounded-xl p-5 space-y-3">
      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Clock size={18} className="text-blue-600" /> Previous Quotations from this Client
      </h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {previous.map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border">
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.reference || r.id?.slice(0, 8) || "—"}</p>
              <p className="text-xs text-slate-500">{r.items?.length || 0} item(s) · {formatDate(r.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(r.status)}
              <button
                onClick={() => onReply(r)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                title="Reply to this RFQ"
              >
                <Reply size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RfqDetailModal({ open, rfq, onClose, allRfqs = [], onReply }) {
  if (!open || !rfq) return null;

  const items = rfq.items || rfq.products || [];
  const client = rfq.client || {};

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">RFQ Details</h3>
            <p className="text-sm text-slate-500">Reference: <span className="font-mono font-bold text-blue-700">{rfq.reference || rfq.id}</span></p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 rounded-xl p-4 border">
            <div className="flex items-center gap-4">
              <Clock size={18} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Received: {formatDate(rfq.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              {getStatusBadge(rfq.status)}
            </div>
          </div>

          {/* Client Information */}
          <div className="border rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Client Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Full Name</p>
                <p className="font-semibold">{rfq.fullName || rfq.clientName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Company</p>
                <p className="font-semibold">{rfq.companyName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><Mail size={14} /> Email</p>
                <a href={`mailto:${rfq.email}`} className="text-blue-600 hover:underline">{rfq.email || "—"}</a>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><Phone size={14} /> Mobile</p>
                <p>{rfq.mobile || "—"}</p>
              </div>
              {rfq.address && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><MapPin size={14} /> Address</p>
                  <p className="whitespace-pre-line">{rfq.address}</p>
                </div>
              )}
              {rfq.remarks && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><MessageSquare size={14} /> Remarks</p>
                  <p className="whitespace-pre-line text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border">{rfq.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products / Items */}
          <div className="border rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Package size={18} className="text-blue-600" /> Requested Items ({items.length})
            </h4>
            {items.length === 0 ? (
              <p className="text-sm text-slate-400">No products listed.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <ItemCard key={idx} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Previous Quotations */}
          {onReply && <PreviousQuotations rfq={rfq} allRfqs={allRfqs} onReply={onReply} />}

          {/* Reply History */}
          {rfq.responses && rfq.responses.length > 0 && (
            <div className="border rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" /> Reply History
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {rfq.responses.map((resp) => (
                  <div key={resp.id} className="bg-slate-50 rounded-lg p-3 border">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{resp.sentFrom || "Admin"}</span>
                      <span>{formatDate(resp.sentAt)}</span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{resp.emailBody || resp.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          {rfq.status !== "COMPLETED" && onReply && (
            <button
              onClick={() => onReply(rfq)}
              className="mr-2 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Reply size={16} /> Reply
            </button>
          )}
          <button onClick={onClose} className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}