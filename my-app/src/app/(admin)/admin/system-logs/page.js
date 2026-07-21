"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ScrollText, CheckCircle2, RotateCcw, Trash2, Filter, Loader2, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import systemLogsApi from "@/lib/systemLogsApi";

const LEVEL_STYLES = {
  INFO: { icon: Info, className: "bg-blue-50 text-blue-700 border-blue-200" },
  WARN: { icon: AlertTriangle, className: "bg-amber-50 text-amber-700 border-amber-200" },
  ERROR: { icon: AlertOctagon, className: "bg-red-50 text-red-700 border-red-200" },
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, unreviewedCount: 0 });
  const [level, setLevel] = useState("");
  const [reviewed, setReviewed] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemLogsApi.list({ page, pageSize: 25, level, reviewed, search });
      setLogs(res.data || []);
      setMeta(res.meta || {});
    } catch {
      toast.error("Failed to load system logs");
    } finally {
      setLoading(false);
    }
  }, [page, level, reviewed, search]);

  useEffect(() => { load(); }, [load]);

  const toggleReviewed = async (log) => {
    try {
      if (log.reviewed) await systemLogsApi.markUnreviewed(log.id);
      else await systemLogsApi.markReviewed(log.id);
      load();
    } catch {
      toast.error("Failed to update log");
    }
  };

  const removeLog = async (id) => {
    if (!confirm("Delete this log entry permanently?")) return;
    try {
      await systemLogsApi.remove(id);
      load();
    } catch {
      toast.error("Failed to delete log");
    }
  };

  const markAll = async () => {
    try {
      await systemLogsApi.markAllReviewed();
      toast.success("All logs marked as reviewed — they'll auto-delete in 24 hours");
      load();
    } catch {
      toast.error("Failed to mark all reviewed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <ScrollText size={20} className="text-blue-600" /> System Logs
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {meta.total || 0} total · {meta.unreviewedCount || 0} unreviewed · Reviewed logs auto-delete 24 hours after review
          </p>
        </div>
        <button onClick={markAll} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm shrink-0">
          <CheckCircle2 size={14} /> Mark All Reviewed
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-3">
        <Filter size={14} className="text-slate-400" />
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 focus:outline-none">
          <option value="">All Levels</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
        </select>
        <select value={reviewed} onChange={(e) => { setReviewed(e.target.value); setPage(1); }} className="text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 focus:outline-none">
          <option value="">All</option>
          <option value="false">Unreviewed</option>
          <option value="true">Reviewed</option>
        </select>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search message or source…"
          className="flex-1 min-w-[180px] text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={28} /></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs font-bold text-slate-400 uppercase">No log entries found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO;
              const Icon = style.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50">
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black uppercase ${style.className}`}>
                    <Icon size={12} /> {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{log.source}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                      {log.reviewed && (
                        <span className="text-[10px] font-bold text-green-600">
                          Reviewed {log.reviewedAt ? `· deletes ${new Date(new Date(log.reviewedAt).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}` : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-medium mt-0.5 break-words">{log.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleReviewed(log)}
                      title={log.reviewed ? "Mark unreviewed" : "Mark reviewed"}
                      className={`p-2 rounded-lg ${log.reviewed ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                    >
                      {log.reviewed ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                    </button>
                    <button onClick={() => removeLog(log.id)} title="Delete" className="p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-xs font-bold ${p === page ? "bg-blue-950 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
