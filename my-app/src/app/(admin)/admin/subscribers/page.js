"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/client";
import toast from "react-hot-toast";

// ─── API wrapper ─────────────────────────────────────────────────────────────
const api = {
  list:        (p) => apiClient.get("/subscribers", p),
  stats:       ()  => apiClient.get("/subscribers/stats/overview"),
  unsubscribe: (id) => apiClient.post(`/subscribers/${id}/unsubscribe`),
  resubscribe: (id) => apiClient.post(`/subscribers/${id}/resubscribe`),
  remove:      (id) => apiClient.delete(`/subscribers/${id}`),
  bulkDelete:  (ids) => apiClient.post("/subscribers/bulk-delete", { ids }),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function StatCard({ label, value, color = "text-slate-900" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value ?? "—"}</p>
    </div>
  );
}

function Badge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
      active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`} />
      {active ? "Subscribed" : "Unsubscribed"}
    </span>
  );
}

export default function SubscribersAdminPage() {
  const [rows,     setRows]     = useState([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all"); // all | active | inactive
  const [selected, setSelected] = useState(new Set());
  const [page,     setPage]     = useState(1);

  const loadStats = useCallback(() => {
    api.stats().then((r) => setStats(r?.data ?? r)).catch(console.error);
  }, []);

  const load = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (filter === "active")   params.subscribed = true;
      if (filter === "inactive") params.subscribed = false;
      const r = await api.list(params);
      setRows(r?.data ?? []);
      setMeta(r?.meta ?? { total: 0, page: pg, totalPages: 1 });
    } catch (e) { toast.error("Failed to load subscribers"); }
    finally { setLoading(false); }
  }, [page, search, filter]);

  useEffect(() => { load(1); setPage(1); loadStats(); }, [filter]); // eslint-disable-line
  useEffect(() => { load(page); }, [page]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const toggleSelect = (id) => {
    setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelected((p) => p.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const handleUnsubscribe = async (id) => {
    try { await api.unsubscribe(id); toast.success("Unsubscribed"); load(page); loadStats(); }
    catch (e) { toast.error(e.message); }
  };
  const handleResubscribe = async (id) => {
    try { await api.resubscribe(id); toast.success("Re-subscribed"); load(page); loadStats(); }
    catch (e) { toast.error(e.message); }
  };
  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this subscriber?")) return;
    try { await api.remove(id); toast.success("Deleted"); load(page); loadStats(); }
    catch (e) { toast.error(e.message); }
  };
  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} subscriber(s)? This is permanent.`)) return;
    try { await api.bulkDelete([...selected]); toast.success(`${selected.size} deleted`); setSelected(new Set()); load(1); setPage(1); loadStats(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="min-h-full bg-slate-50 p-5 lg:p-7 space-y-5">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">📰 Newsletter Subscribers</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">View and manage all newsletter subscriptions.</p>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} color="text-green-700" />
          <StatCard label="Unsubscribed" value={stats.inactive} color="text-slate-400" />
          <StatCard label="New this week" value={stats.lastWeekNew} color="text-blue-700" />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email…"
            className="flex-1 text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-medium text-slate-800 placeholder:text-slate-400" />
          <button type="submit" className="px-4 py-2.5 bg-blue-950 text-white text-xs font-black rounded-xl hover:bg-blue-900">Search</button>
          {search && <button type="button" onClick={() => { setSearch(""); setPage(1); setTimeout(() => load(1), 0); }} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50">Clear</button>}
        </form>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {["all","active","inactive"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-black px-3 py-2 rounded-xl capitalize transition-colors ${filter === f ? "bg-blue-950 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Bulk delete */}
        {selected.size > 0 && (
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100">
            🗑 Delete {selected.size} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Loading overlay */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <span className="text-4xl block">📭</span>
            <p className="text-sm font-bold">No subscribers found</p>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 pl-4 pr-2 w-10">
                    <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="rounded" />
                  </th>
                  {["Email","Status","Joined","Actions"].map((h) => ( 
                    //  in future if we wants to show users name we can show by adding name, mobile
                    <th key={h} className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((sub) => {
                  const name = [sub.firstName, sub.middleName, sub.lastName].filter(Boolean).join(" ") || "—";
                  return (
                    <tr key={sub.id} className={`hover:bg-slate-50 transition-colors ${selected.has(sub.id) ? "bg-blue-50" : ""}`}>
                      <td className="pl-4 pr-2 py-3">
                        <input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleSelect(sub.id)} className="rounded" />
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-slate-600 font-medium">{sub.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge active={sub.subscribed} />
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-slate-400 font-medium">{formatDate(sub.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {sub.subscribed
                            ? <button onClick={() => handleUnsubscribe(sub.id)} className="text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50">Unsub</button>
                            : <button onClick={() => handleResubscribe(sub.id)} className="text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50">Resub</button>}
                          <button onClick={() => handleDelete(sub.id)} className="text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              Showing {rows.length} of {meta.total} subscribers
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">← Prev</button>
              <span className="text-xs font-bold text-slate-500">{page} / {meta.totalPages}</span>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}