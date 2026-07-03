"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import faqApi from "@/lib/faq/api";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SuccessBanner({ name, onDismiss }) {
  return (
    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
      <span className="text-2xl">✅</span>
      <div className="flex-1">
        <p className="text-sm font-black text-green-800">Question received, {name}!</p>
        <p className="text-xs text-green-700 font-medium mt-0.5">
          We've sent a confirmation to your email. Our team will respond within 1–2 business days.
        </p>
      </div>
      <button onClick={onDismiss} className="text-green-400 hover:text-green-700 font-bold text-base">✕</button>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
      <span className="text-xl">⚠️</span>
      <div className="flex-1">
        <p className="text-sm font-black text-red-800">Something went wrong</p>
        <p className="text-xs text-red-700 font-medium mt-0.5">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-700 font-bold text-base">✕</button>
    </div>
  );
}

// ─── Single Accordion Item ─────────────────────────────────────────────────────

function FaqAccordionItem({ faq, isOpen, onToggle }) {
  const contentRef = useRef(null);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200
      ${isOpen ? "border-blue-200 bg-blue-50/40 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`mt-0.5 shrink-0 text-base transition-colors ${isOpen ? "text-blue-700" : "text-slate-400"}`}>
            {isOpen ? "💡" : "❓"}
          </span>
          <p className={`text-sm font-bold leading-snug transition-colors
            ${isOpen ? "text-blue-950" : "text-slate-800"}`}>
            {faq.question}
          </p>
        </div>
        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all
          ${isOpen ? "bg-blue-950 text-white rotate-180" : "bg-slate-100 text-slate-500"}`}>
          ▾
        </span>
      </button>

      {/* Smooth height animation */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 500}px` : "0px" }}
      >
        <div className="px-5 pb-5 pt-0">
          <div className="ml-9 border-l-2 border-blue-200 pl-4">
            <div
              className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none
                         prose-a:text-blue-700 prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer ?? "") }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ask-a-Question Form ───────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", email: "", question: "" };

function AskForm({ onSuccess }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name     = "Please enter your name.";
    if (!form.email.trim())   e.email    = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    if (!form.question.trim()) e.question = "Please write your question.";
    else if (form.question.trim().length < 10) e.question = "Please write at least 10 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await faqApi.ask({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        question: form.question.trim(),
      });
      onSuccess(form.name.trim());
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const charLeft = 1000 - form.question.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <ErrorBanner message={serverError} onDismiss={() => setServerError("")} />
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Rahul Sharma"
          maxLength={120}
          className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400
                      transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
        />
        {errors.name && <p className="text-xs text-red-600 font-semibold">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@company.com"
          maxLength={254}
          className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400
                      transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-slate-200"}`}
        />
        {errors.email && <p className="text-xs text-red-600 font-semibold">{errors.email}</p>}
      </div>

      {/* Question */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
            Your Question <span className="text-red-500">*</span>
          </label>
          <span className={`text-[10px] font-mono font-bold transition-colors
            ${charLeft < 100 ? "text-amber-600" : "text-slate-400"}`}>
            {charLeft} left
          </span>
        </div>
        <textarea
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          placeholder="What would you like to know? Be as specific as possible..."
          rows={4}
          maxLength={1000}
          className={`w-full text-sm p-3.5 bg-slate-50 border rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      text-slate-800 font-medium leading-relaxed resize-none
                      placeholder:font-normal placeholder:text-slate-400
                      transition-colors ${errors.question ? "border-red-400 bg-red-50" : "border-slate-200"}`}
        />
        {errors.question && <p className="text-xs text-red-600 font-semibold">{errors.question}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-blue-950 text-white text-sm font-black
                   hover:bg-blue-900 active:scale-[0.98] transition-all shadow-md
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting…
          </span>
        ) : (
          "📨 Submit My Question"
        )}
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        We'll send a confirmation to your email and respond within 1–2 business days.
      </p>
    </form>
  );
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="space-y-3 animate-pulse">
      {[80, 65, 90, 70, 75].map((w, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0" />
            <div className={`h-4 bg-slate-200 rounded`} style={{ width: `${w}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicFaqPage() {
  const [faqs, setFaqs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [openId, setOpenId]       = useState(null);
  const [success, setSuccess]     = useState(""); // stores submitter name on success

  // Fetch all published FAQs once on mount (client-side search after that)
  useEffect(() => {
    faqApi.getPublic()
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Client-side search filter (instant, no extra API call)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        (f.answer ?? "").toLowerCase().includes(q)
    );
  }, [faqs, search]);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const handleSuccess = (name) => {
    setSuccess(name);
    // Scroll to top so user sees the banner
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans text-slate-800 antialiased">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-10">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/contact" className="hover:text-slate-700 transition-colors">Contact</Link>
          <span>›</span>
          <span className="text-slate-700">FAQs</span>
        </nav>

        {/* ── Success banner ──────────────────────────────────────────── */}
        {success && <SuccessBanner name={success} onDismiss={() => setSuccess("")} />}

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 pb-6">
          <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-200/60
                           px-2.5 py-1 rounded-md uppercase tracking-widest">
            Knowledge Base
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
            Browse answers to common questions. Can't find what you're looking for?
            Submit your question below and our team will respond within 1–2 business days.
          </p>
        </div>

        {/* ── Main two-column grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT: FAQ list + search ──────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Search bar */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
                placeholder="Search questions and answers…"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl
                           text-sm font-medium text-slate-800 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                           shadow-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400
                             hover:text-slate-700 text-sm font-bold transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results count */}
            {!loading && search && (
              <p className="text-xs text-slate-500 font-semibold">
                {filtered.length === 0
                  ? "No results found — try different keywords."
                  : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}
              </p>
            )}

            {/* FAQ list */}
            {loading ? (
              <SkeletonList />
            ) : filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((faq) => (
                  <FaqAccordionItem
                    key={faq.id}
                    faq={faq}
                    isOpen={openId === faq.id}
                    onToggle={() => toggle(faq.id)}
                  />
                ))}
              </div>
            ) : !search ? (
              /* No FAQs published yet */
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 space-y-2">
                <span className="text-4xl block">📭</span>
                <p className="text-sm font-bold">No FAQs published yet.</p>
                <p className="text-xs">Use the form to ask us anything.</p>
              </div>
            ) : (
              /* No search results */
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <span className="text-4xl block">🔎</span>
                <p className="text-sm font-bold text-slate-700">No matches found for "{search}"</p>
                <p className="text-xs text-slate-500 font-medium">
                  Try different keywords, or scroll down and submit your question directly.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-blue-700 font-bold underline underline-offset-2 hover:text-blue-900"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Stats strip */}
            {!loading && faqs.length > 0 && !search && (
              <p className="text-[11px] text-slate-400 font-semibold text-center pt-1">
                {faqs.length} question{faqs.length !== 1 ? "s" : ""} answered · Updated regularly
              </p>
            )}
          </div>

          {/* ── RIGHT: Ask-a-question form ─────────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
              {/* Form header */}
              <div className="bg-blue-950 px-6 py-5">
                <h2 className="text-base font-black text-white">Can't find your answer?</h2>
                <p className="text-xs text-blue-200 font-medium mt-0.5">
                  Ask us directly — we'll respond by email within 1–2 business days.
                </p>
              </div>

              {/* Form body */}
              <div className="p-6">
                <AskForm onSuccess={handleSuccess} />
              </div>
            </div>

            {/* Contact card */}
            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-xs font-black text-slate-900">Need urgent help?</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Contact our team directly on our{" "}
                  <Link href="/contact" className="text-blue-700 hover:text-blue-900 font-bold underline underline-offset-2">
                    Contact page
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}