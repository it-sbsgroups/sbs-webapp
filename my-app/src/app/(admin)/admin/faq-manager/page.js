"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import faqApi from "@/lib/faq/api";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import RichTextEditor from "@/components/shared/RichTextEditor";
import TableExportImport from "@/components/admin/shared/TableExportImport";

const TABS = [
  { key: "pending",  label: "Pending",   emoji: "📥", desc: "User-submitted questions awaiting an answer" },
  { key: "approved", label: "Published",  emoji: "✅", desc: "Answered & live FAQs" },
  { key: "create",   label: "Create FAQ", emoji: "✏️", desc: "Publish a new FAQ directly" },
];

const FAQ_EXPORT_COLUMNS = [
  { key: "question", label: "Question" },
  { key: "answer", label: "Answer", exportValue: (r) => (r.answer || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
  { key: "status", label: "Status" },
];

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
      <span className="text-4xl">{tab === "pending" ? "📭" : "📂"}</span>
      <p className="text-sm font-semibold">
        {tab === "pending" ? "No pending questions right now." : "No published FAQs yet."}
      </p>
      <p className="text-xs">
        {tab === "pending"
          ? "New questions from the public site will appear here."
          : "Answer a pending question or create one directly."}
      </p>
    </div>
  );
}

// ─── Answer Modal ─────────────────────────────────────────────────────────────
function AnswerModal({ faq, onClose, onSave }) {
  const [answer, setAnswer]   = useState("");
  const [listed, setListed]   = useState(false);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) { toast.error("Answer cannot be empty."); return; }
    setSaving(true);
    try {
      await onSave(faq.id, { answer: answer.trim(), isListedOnFaqPage: listed, isFeaturedInComponent: featured });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900">Answer Question</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {faq.email && <span className="text-blue-700">From: {faq.name} ({faq.email})</span>}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors text-lg font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Original question */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Question</p>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{faq.question}</p>
          </div>

          {/* Answer editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
              Your Answer <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={answer}
              onChange={setAnswer}
              placeholder="Write a clear, helpful answer…"
              uploadFolder="faq-answers"
              resetKey={faq?.id}
            />
          </div>

          {/* Listing flags */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-black text-blue-900 uppercase tracking-wide">Publishing Options</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={listed}
                onChange={(e) => setListed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-bold text-slate-800">Show on FAQ page</span>
                <span className="text-slate-500 block text-xs mt-0.5">
                  Displays this Q&A on <code className="bg-white px-1 rounded">/contact/faqs</code>
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-bold text-slate-800">Feature on home page</span>
                <span className="text-slate-500 block text-xs mt-0.5">
                  Shows in the small featured FAQ widget on the homepage
                </span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold
                         text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-950 text-white text-sm font-black
                         hover:bg-blue-900 transition-colors disabled:opacity-60 shadow-md"
            >
              {saving ? "Publishing…" : "Publish Answer & Notify User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create FAQ Form ──────────────────────────────────────────────────────────
function CreateFaqForm({ onSuccess }) {
  const [form, setForm]       = useState({ question: "", answer: "", isListedOnFaqPage: true, isFeaturedInComponent: false });
  const [saving, setSaving]   = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) { toast.error("Question is required."); return; }
    if (!form.answer.trim())   { toast.error("Answer is required."); return; }
    setSaving(true);
    try {
      await faqApi.adminCreate({
        question: form.question.trim(),
        answer:   form.answer.trim(),
        isListedOnFaqPage:     form.isListedOnFaqPage,
        isFeaturedInComponent: form.isFeaturedInComponent,
      });
      toast.success("FAQ published successfully!");
      setForm({ question: "", answer: "", isListedOnFaqPage: true, isFeaturedInComponent: false });
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to create FAQ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
          Question <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          placeholder="e.g. What is the delivery time for bulk orders?"
          className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                     text-slate-800 font-semibold"
          required
          maxLength={1000}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
          Answer <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={form.answer}
          onChange={(html) => set("answer", html)}
          placeholder="Write a clear, complete answer…"
          uploadFolder="faq-answers"
          resetKey="new-faq"
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
        <p className="text-xs font-black text-blue-900 uppercase tracking-wide">Publishing Options</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isListedOnFaqPage}
            onChange={(e) => set("isListedOnFaqPage", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">
            <span className="font-bold text-slate-800">Show on FAQ page</span>
            <span className="text-slate-500 block text-xs mt-0.5">Displays on <code className="bg-white px-1 rounded">/contact/faqs</code></span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeaturedInComponent}
            onChange={(e) => set("isFeaturedInComponent", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">
            <span className="font-bold text-slate-800">Feature on home page</span>
            <span className="text-slate-500 block text-xs mt-0.5">Shows in the homepage featured FAQ widget</span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-950 text-white font-black text-sm
                   hover:bg-blue-900 transition-colors disabled:opacity-60 shadow-md"
      >
        {saving ? "Publishing…" : "✅ Publish FAQ"}
      </button>
    </form>
  );
}

// ─── FAQ Row Card ─────────────────────────────────────────────────────────────
function FaqCard({ faq, isPending, onAnswer, onReject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {isPending && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
                Pending
              </span>
            )}
            {!isPending && faq.isListedOnFaqPage && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
                On FAQ Page
              </span>
            )}
            {!isPending && faq.isFeaturedInComponent && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
                Featured
              </span>
            )}
            {faq.isAdminCreated && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wide">
                Admin Created
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">{timeAgo(faq.createdAt)}</span>
        </div>

        {/* Submitter info */}
        {faq.email && (
          <div className="text-xs text-slate-500 font-semibold mb-2">
            <span className="text-blue-800">{faq.name}</span>
            <span className="text-slate-300 mx-1">·</span>
            <span>{faq.email}</span>
          </div>
        )}

        {/* Question */}
        <p className="text-sm font-bold text-slate-900 leading-snug mb-2">
          {faq.question}
        </p>

        {/* Answer preview (published tab) */}
        {faq.answer && (
          <div>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 mb-2 transition-colors"
            >
              {expanded ? "▲ Hide answer" : "▼ Show answer"}
            </button>
            {expanded && (
              <div
                className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3.5
                           border border-slate-100 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
              />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2">
        {isPending && (
          <button
            onClick={() => onAnswer(faq)}
            className="flex-1 py-2 rounded-xl bg-blue-950 text-white text-xs font-black
                       hover:bg-blue-900 transition-colors shadow"
          >
            ✍️ Write Answer
          </button>
        )}
        <button
          onClick={() => onReject(faq.id)}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-black
                     hover:bg-red-50 transition-colors"
        >
          {isPending ? "✕ Reject" : "🗑 Remove"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminFaqManagerPage() {
  const [activeTab, setActiveTab]     = useState("pending");
  const [faqs, setFaqs]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [meta, setMeta]               = useState({ total: 0, page: 1, totalPages: 1 });
  const [answeringFaq, setAnsweringFaq] = useState(null);

  const load = useCallback(async (tab = activeTab, pg = 1) => {
    if (tab === "create") return;
    setLoading(true);
    try {
      const res = await faqApi.adminGetAll({
        status:   tab === "pending" ? "pending" : "approved",
        search:   search.trim() || undefined,
        page:     pg,
        pageSize: 15,
      });
      setFaqs(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      toast.error(err.message || "Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    load(activeTab, 1);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    load(activeTab, 1);
  };

  const handleAnswer = async (id, data) => {
    try {
      await faqApi.respond(id, data);
      toast.success("Answer published! User has been notified by email.");
      load(activeTab, meta.page);
    } catch (err) {
      toast.error(err.message || "Failed to publish answer.");
      throw err;
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject and hide this FAQ? A notification email will be sent to the user.")) return;
    try {
      await faqApi.reject(id);
      toast.success("FAQ rejected and hidden.");
      load(activeTab, meta.page);
    } catch (err) {
      toast.error(err.message || "Failed to reject FAQ.");
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">FAQ Manager</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Review user questions, publish answers, and manage the FAQ knowledge base.
          </p>
        </div>

        <TableExportImport
          data={faqs}
          columns={FAQ_EXPORT_COLUMNS}
          filenamePrefix={`faqs-${activeTab}`}
          onImportRow={async (row) => {
            const question = row["Question"]?.trim();
            const answer = row["Answer"]?.trim();
            if (!question || !answer) throw new Error("Question and Answer are required");
            await faqApi.adminCreate({
              question,
              answer,
              isListedOnFaqPage: true,
              isFeaturedInComponent: false,
            });
          }}
          onImported={() => load(activeTab, meta.page)}
        />

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-black
                          transition-all ${
                            activeTab === t.key
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              {t.key !== "create" && activeTab === t.key && meta.total > 0 && (
                <span className="ml-1 bg-blue-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {meta.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-xs text-slate-400 font-medium -mt-2">
          {TABS.find((t) => t.key === activeTab)?.desc}
        </p>

        {/* ── CREATE TAB ── */}
        {activeTab === "create" && (
          <CreateFaqForm onSuccess={() => setActiveTab("approved")} />
        )}

        {/* ── LIST TABS (pending / approved) ── */}
        {activeTab !== "create" && (
          <>
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab === "pending" ? "pending questions" : "published FAQs"}…`}
                className="flex-1 text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                           text-slate-700 font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-950 text-white text-xs font-black rounded-xl
                           hover:bg-blue-900 transition-colors shadow"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); load(activeTab, 1); }}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 text-xs font-bold
                             rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* FAQ list */}
            {!loading && (
              <>
                {faqs.length === 0 ? (
                  <EmptyState tab={activeTab} />
                ) : (
                  <div className="grid gap-3">
                    {faqs.map((faq) => (
                      <FaqCard
                        key={faq.id}
                        faq={faq}
                        isPending={activeTab === "pending"}
                        onAnswer={(f) => setAnsweringFaq(f)}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      disabled={meta.page <= 1}
                      onClick={() => load(activeTab, meta.page - 1)}
                      className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl
                                 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs font-bold text-slate-500">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => load(activeTab, meta.page + 1)}
                      className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl
                                 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Answer modal */}
      {answeringFaq && (
        <AnswerModal
          faq={answeringFaq}
          onClose={() => setAnsweringFaq(null)}
          onSave={handleAnswer}
        />
      )}
    </div>
  );
}