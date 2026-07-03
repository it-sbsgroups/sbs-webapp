"use client";

import { useState, useEffect, useCallback } from "react";
import testimonialsApi from "@/lib/testimonialsApi";
import toast from "react-hot-toast";

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED", "REWRITE"];
const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REWRITE: "bg-blue-100 text-blue-700",
};

export default function AdminTestimonialsControlPanel() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  const [passcodes, setPasscodes] = useState([]);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issuedLink, setIssuedLink] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        testimonialsApi.getAll(filter),
        testimonialsApi.listPasscodes(),
      ]);
      setItems(Array.isArray(t) ? t : []);
      setPasscodes(Array.isArray(p) ? p : []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, status) => {
    try {
      await testimonialsApi.updateStatus(id, status);
      toast.success(`Marked ${status.toLowerCase()}`);
      load();
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this testimonial permanently?")) return;
    try {
      await testimonialsApi.remove(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const issuePasscode = async (e) => {
    e.preventDefault();
    if (!company.trim()) { toast.error("Company name is required"); return; }
    setIssuing(true);
    setIssuedLink("");
    try {
      const pc = await testimonialsApi.issuePasscode({
        companyName: company.trim(),
        email: email.trim() || undefined,
      });
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/testimonials/write?code=${pc.code}`;
      setIssuedLink(link);
      setCompany("");
      setEmail("");
      toast.success(`Passcode ${pc.code} issued`);
      load();
    } catch (e) {
      toast.error(e.message || "Could not issue passcode");
    } finally {
      setIssuing(false);
    }
  };

  const deletePasscode = async (id) => {
    try {
      await testimonialsApi.deletePasscode(id);
      load();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success("Link copied");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Testimonials</h1>
          <p className="mt-1 text-slate-500">Moderate submissions and issue secure submission links.</p>
        </div>

        {/* Passcode issuer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Invite a partner to submit</h2>
          <form onSubmit={issuePasscode} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name *</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Adani Enterprises Ltd"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={issuing}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {issuing ? "Issuing…" : "Generate Link"}
            </button>
          </form>

          {issuedLink && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <code className="text-xs text-slate-600 break-all flex-1">{issuedLink}</code>
              <button onClick={() => copy(issuedLink)} className="text-xs font-bold text-blue-600 shrink-0">Copy</button>
            </div>
          )}

          {passcodes.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Active passcodes</p>
              <div className="space-y-2">
                {passcodes.map((p) => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const link = `${origin}/testimonials/write?code=${p.code}`;
                  const used = !!p.usedAt;
                  const expired = new Date(p.expiresAt).getTime() < Date.now();
                  return (
                    <div key={p.id} className="flex items-center gap-3 text-sm border border-slate-200 rounded-lg px-3 py-2">
                      <code className="font-mono font-bold text-slate-700">{p.code}</code>
                      <span className="text-slate-600">{p.companyName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${used ? "bg-slate-200 text-slate-600" : expired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {used ? "USED" : expired ? "EXPIRED" : "ACTIVE"}
                      </span>
                      <div className="ml-auto flex items-center gap-3">
                        {!used && !expired && <button onClick={() => copy(link)} className="text-xs font-bold text-blue-600">Copy link</button>}
                        <button onClick={() => deletePasscode(p.id)} className="text-xs font-bold text-red-500">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Moderation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {STATUS_TABS.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" /></div>
          ) : items.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-sm">No {filter.toLowerCase()} testimonials.</p>
          ) : (
            <div className="space-y-3">
              {items.map((t) => (
                <div key={t.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">{t.name}
                        {t.designation && <span className="text-slate-400 font-medium"> · {t.designation}</span>}
                      </div>
                      <div className="text-xs text-slate-500">{t.companyName}{t.email ? ` · ${t.email}` : ""}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status] || ""}`}>{t.status}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">“{t.testimony}”</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {t.status !== "APPROVED" && <button onClick={() => moderate(t.id, "APPROVED")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">Approve</button>}
                    {t.status !== "REJECTED" && <button onClick={() => moderate(t.id, "REJECTED")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">Reject</button>}
                    {t.status !== "REWRITE" && <button onClick={() => moderate(t.id, "REWRITE")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">Ask rewrite</button>}
                    <button onClick={() => removeItem(t.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-600 ml-auto">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
