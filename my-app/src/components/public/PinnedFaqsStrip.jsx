"use client";

// =============================================================================
// FILE: src/components/public/PinnedFaqsStrip.jsx
// Replaces the mock-data version. Fetches featured FAQs live from the backend.
// Used on the Contact page and anywhere else the strip is embedded.
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import faqApi from "@/lib/faq/api";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

// ─── Single expandable row ─────────────────────────────────────────────────────

function FaqRow({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`transition-all duration-200 rounded-2xl overflow-hidden
      ${open ? "bg-blue-50/60 border border-blue-200" : "border border-transparent"}`}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start justify-between gap-4 py-4 px-1 text-left group"
      >
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className={`text-sm shrink-0 mt-0.5 transition-colors
            ${open ? "text-blue-700" : "text-blue-400"}`}>
            {open ? "💡" : "❓"}
          </span>
          <p className={`text-xs md:text-sm font-bold leading-relaxed transition-colors
            ${open ? "text-blue-950" : "text-slate-700 group-hover:text-blue-900"}`}>
            {faq.question}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-black transition-all duration-200 mt-0.5
          ${open ? "text-blue-700 rotate-180" : "text-slate-400"}`}>
          ▾
        </span>
      </button>

      {open && faq.answer && (
        <div className="px-1 pb-4">
          <div className="ml-7 pl-4 border-l-2 border-blue-200">
            <div
              className="text-xs md:text-sm text-slate-700 leading-relaxed
                         prose prose-sm max-w-none prose-a:text-blue-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {[70, 85, 60].map((w, i) => (
        <div key={i} className="py-4 flex items-center gap-3">
          <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
          <div className="h-3.5 bg-slate-200 rounded" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function PinnedFaqsStrip() {
  const [faqs, setFaqs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faqApi.getFeatured()
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Don't render the card at all if there's nothing to show after loading
  if (!loading && faqs.length === 0) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-100/40 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <span>📚</span> Featured Questions & Answers
          </h2>
          <p className="text-[11px] md:text-xs text-slate-400 font-medium mt-0.5">
            Quick answers to the questions we hear most often.
          </p>
        </div>
        <Link
          href="/contact/faqs"
          className="bg-blue-50 text-blue-900 border border-blue-100 text-[10px] font-black
                     uppercase px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white
                     transition-all tracking-wider shadow-sm shrink-0 text-center"
        >
          Browse All FAQs ➔
        </Link>
      </div>

      {/* FAQ list */}
      {loading ? (
        <Skeleton />
      ) : (
        <div className="divide-y divide-slate-100">
          {faqs.map((faq) => (
            <FaqRow key={faq.id} faq={faq} />
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <p className="text-xs text-slate-500 font-medium">
          Didn't find your answer?
        </p>
        <Link
          href="/contact/faqs#ask"
          className="text-xs font-black text-blue-950 border border-blue-950 px-4 py-2
                     rounded-xl hover:bg-blue-950 hover:text-white transition-all"
        >
          Ask Us a Question →
        </Link>
      </div>

    </div>
  );
}