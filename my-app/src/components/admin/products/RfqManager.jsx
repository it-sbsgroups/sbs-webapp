"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Reply, Trash2, Eye, Lock, Search, ChevronLeft, ChevronRight, X, Users, List
} from "lucide-react";
import rfqApi from "@/lib/rfqApi";
import RfqReplyModal from "./RfqReplyModal";
import RfqDetailModal from "./RfqDetailModal";
import {
  formatDateTimeIST,
  formatTimeIST,
  getTimeDifference,
  getAverageResponseTime,
} from "@/lib/dateUtils";
import toast from "react-hot-toast";

// ---------- Status change dropdown (inline in table) ----------
function StatusDropdown({ rfq, onStatusChange }) {
  const [changing, setChanging] = useState(false);

  const getStatusOptions = (status) => {
    switch (status) {
      case "PENDING":
        return ["PENDING", "CANCELLED"];
      case "REPLIED":
        return ["REPLIED", "PROCESSING", "CANCELLED"];
      case "PROCESSING":
        return ["PROCESSING", "COMPLETED", "CANCELLED"];
      case "CANCELLED":
      case "COMPLETED":
        return [status];
      default:
        return [status];
    }
  };

  const options = getStatusOptions(rfq.status);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === rfq.status) return;
    if (!confirm(`Change status to "${newStatus}"?`)) {
      e.target.value = rfq.status;
      return;
    }
    setChanging(true);
    try {
      await onStatusChange(rfq.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setChanging(false);
    }
  };

  const isLocked = rfq.status === "CANCELLED" || rfq.status === "COMPLETED";

  if (isLocked) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {rfq.status === "CANCELLED" ? (
          <>
            <Lock size={12} className="inline" /> Reply to reopen
          </>
        ) : (
          <>
            <Lock size={12} className="inline" /> Locked
          </>
        )}
      </div>
    );
  }

  return (
    <select
      value={rfq.status}
      onChange={handleChange}
      disabled={changing}
      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold cursor-pointer focus:border-blue-500 focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0) + opt.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}

// ---------- Client-wise view (grouped by email) ----------
function ClientWiseView({ rfqs, onView, onReply, onDelete }) {
  const [expandedClient, setExpandedClient] = useState(null);

  const groupedClients = useMemo(() => {
    const groups = {};
    rfqs.forEach((rfq) => {
      const email = (rfq.email || "no-email").toLowerCase();
      if (!groups[email]) {
        groups[email] = {
          email,
          fullName: rfq.fullName || rfq.clientName || "Unknown",
          company: rfq.companyName || "",
          rfqs: [],
        };
      }
      groups[email].rfqs.push(rfq);
    });
    return Object.values(groups).sort((a, b) => b.rfqs.length - a.rfqs.length);
  }, [rfqs]);

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      REPLIED: "bg-blue-100 text-blue-700 border-blue-200",
      PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase ${styles[status] || ""}`}>
        {String(status || "").toLowerCase()}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {groupedClients.length === 0 && (
        <p className="text-center py-12 text-slate-400">No RFQs found.</p>
      )}
      {groupedClients.map((client) => (
        <div key={client.email} className="rounded-2xl border bg-white overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
            onClick={() => setExpandedClient(expandedClient === client.email ? null : client.email)}
          >
            <div className="flex items-center gap-3">
              {expandedClient === client.email ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <div>
                <p className="text-sm font-bold text-slate-800">{client.fullName}</p>
                <p className="text-xs text-slate-500">{client.email}</p>
              </div>
              {client.company && <span className="text-xs text-slate-400">· {client.company}</span>}
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-full border">
              {client.rfqs.length} RFQ{client.rfqs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {expandedClient === client.email && (
            <div>
              {client.rfqs.map((rfq) => (
                <div key={rfq.id} className="flex items-center gap-3 px-4 py-3 border-t hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{rfq.reference || rfq.id?.slice(0, 8) || "—"}</p>
                    <p className="text-xs text-slate-500">
                      {rfq.items?.length || 0} item(s) · {formatDateTimeIST(rfq.createdAt)}
                    </p>
                  </div>
                  <div>{getStatusBadge(rfq.status)}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(rfq)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="View Details">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => onReply(rfq)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Reply">
                      <Reply size={15} />
                    </button>
                    <button onClick={() => onDelete(rfq.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Main Component ----------
export default function RfqManager() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [viewMode, setViewMode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAllPages, setShowAllPages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchRfqs = async () => {
    try {
      const response = await rfqApi.getAll({ page: 1, pageSize: 500 });
      const data = response?.data || response;
      setRfqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRfqs(); }, []);

  const filteredRfqs = useMemo(() => {
    let filtered = [...rfqs];
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (rfq) =>
          (rfq.fullName || "").toLowerCase().includes(q) ||
          (rfq.companyName || "").toLowerCase().includes(q) ||
          (rfq.email || "").toLowerCase().includes(q) ||
          (rfq.reference || "").toLowerCase().includes(q) ||
          (rfq.id || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") filtered = filtered.filter((rfq) => rfq.status === statusFilter);
    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter((rfq) => rfq.createdAt && new Date(rfq.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((rfq) => rfq.createdAt && new Date(rfq.createdAt) <= to);
    }
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "createdAt") {
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (sortField === "responseTime") {
        const aTime = a.responses?.[0]?.sentAt ? new Date(a.responses[0].sentAt) - new Date(a.createdAt) : Infinity;
        const bTime = b.responses?.[0]?.sentAt ? new Date(b.responses[0].sentAt) - new Date(b.createdAt) : Infinity;
        aVal = aTime;
        bVal = bTime;
      } else {
        aVal = String(a[sortField] || "").toLowerCase();
        bVal = String(b[sortField] || "").toLowerCase();
      }
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return filtered;
  }, [rfqs, searchQuery, statusFilter, dateFrom, dateTo, sortField, sortOrder]);

  const stats = useMemo(() => {
    const pending = rfqs.filter((r) => r.status === "PENDING").length;
    const replied = rfqs.filter((r) => r.status === "REPLIED").length;
    const processing = rfqs.filter((r) => r.status === "PROCESSING").length;
    const completed = rfqs.filter((r) => r.status === "COMPLETED").length;
    const cancelled = rfqs.filter((r) => r.status === "CANCELLED").length;
    const avgResponse = getAverageResponseTime(rfqs);
    return { total: rfqs.length, pending, replied, processing, completed, cancelled, avgResponse };
  }, [rfqs]);

  const handleStatusChange = async (id, newStatus) => {
    await rfqApi.updateStatus(id, newStatus);
    await fetchRfqs();
  };

  const handleSaveReply = async (rfqId, payload) => {
    try {
      const rfq = rfqs.find((r) => r.id === rfqId);
      const currentStatus = rfq?.status;
      await rfqApi.reply(rfqId, payload);
      if (currentStatus === "PENDING" || currentStatus === "CANCELLED") {
        await rfqApi.updateStatus(rfqId, "REPLIED");
      }
      setShowReplyModal(false);
      setSelectedRfq(null);
      await fetchRfqs();
    } catch (error) {
      toast.error("Failed to reply: " + error.message);
    }
  };

  const handleReply = (rfq) => {
    if (rfq.status === "COMPLETED") {
      toast.error("Cannot reply to a completed RFQ");
      return;
    }
    setSelectedRfq(rfq);
    setShowReplyModal(true);
    setShowDetailModal(false);
  };

  const handleView = async (rfq) => {
    try {
      const fullRfq = await rfqApi.getById(rfq.id);
      setSelectedRfq(fullRfq);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Failed to load RFQ details: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this RFQ?")) return;
    try {
      await rfqApi.delete(id);
      await fetchRfqs();
    } catch (error) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  const totalPages = Math.ceil(filteredRfqs.length / pageSize);
  const paginatedRfqs = filteredRfqs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPaginationItems = () => {
    if (showAllPages) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const items = [1];
    if (currentPage - delta > 2) items.push("...left");
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    for (let i = start; i <= end; i++) items.push(i);
    if (currentPage + delta < totalPages - 1) items.push("...right");
    items.push(totalPages);
    return items;
  };

  useEffect(() => {
    setCurrentPage(1);
    setShowAllPages(false);
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery.trim() || statusFilter !== "ALL" || dateFrom || dateTo;

  const sortableHeader = (label, field) => (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400 cursor-pointer hover:text-blue-600"
      onClick={() => { if (sortField === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc")); else { setSortField(field); setSortOrder("asc"); } setCurrentPage(1); }}>
      {label} {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
    </th>
  );

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      REPLIED: "bg-blue-100 text-blue-700 border-blue-200",
      PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase ${styles[status] || ""}`}>
        {String(status || "").toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">RFQ Manager</h2>
          <p className="mt-1 text-sm text-slate-500">{stats.total} quotation requests</p>
        </div>
      </div>

      {/* Stats with hover tooltips + avg response */}
      <div className="grid gap-4 md:grid-cols-7">
        {[
          { label: "Total", value: stats.total, color: "text-blue-600", bg: "bg-blue-50", tip: "All received" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50", tip: "Awaiting reply" },
          { label: "Replied", value: stats.replied, color: "text-blue-600", bg: "bg-blue-50", tip: "Sent quotations" },
          { label: "Processing", value: stats.processing, color: "text-purple-600", bg: "bg-purple-50", tip: "Under review" },
          { label: "Completed", value: stats.completed, color: "text-green-600", bg: "bg-green-50", tip: "Orders won" },
          { label: "Cancelled", value: stats.cancelled, color: "text-red-600", bg: "bg-red-50", tip: "Cancelled by client or admin" },
          { label: "Avg Response", value: stats.avgResponse, color: "text-orange-600", bg: "bg-orange-50", tip: "Average time to respond" },
        ].map((stat) => (
          <div key={stat.label} className="relative group">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <h3 className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="absolute z-50 right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg hidden group-hover:block">
              <p className="text-xs font-bold text-slate-800">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.tip}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setViewMode("all")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "all" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
          <List size={16} /> All RFQs
        </button>
        <button onClick={() => setViewMode("client")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "client" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
          <Users size={16} /> Client‑wise
        </button>
      </div>

      {viewMode === "all" ? (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, company, email..." className="w-64 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="REPLIED">Replied</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <span className="text-slate-400">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
                <X size={14} /> Clear all
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {sortableHeader("Reference", "reference")}
                  {sortableHeader("Client", "fullName")}
                  {sortableHeader("Company", "companyName")}
                  {sortableHeader("Email", "email")}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                  {sortableHeader("Created (IST)", "createdAt")}
                  {sortableHeader("Response Time", "responseTime")}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRfqs.map((rfq) => {
                  const responseTime = rfq.responses?.[0]?.sentAt
                    ? getTimeDifference(rfq.createdAt, rfq.responses[0].sentAt)
                    : "—";
                  return (
                    <tr key={rfq.id} className="border-t hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-blue-700">{rfq.reference || rfq.id?.slice(0, 8) || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{rfq.fullName || "—"}</td>
                      <td className="px-4 py-3 text-sm">{rfq.companyName || "—"}</td>
                      <td className="px-4 py-3 text-sm">{rfq.email || "—"}</td>
                      <td className="px-4 py-3 text-sm">{rfq.items?.length || 0} item(s)</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(rfq.status)}
                          <StatusDropdown rfq={rfq} onStatusChange={handleStatusChange} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <div className="space-y-0.5">
                          <p>{formatDateTimeIST(rfq.createdAt)}</p>
                          {rfq.responses?.[0]?.sentAt && (
                            <p className="text-emerald-600">Reply: {formatTimeIST(rfq.responses[0].sentAt)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {responseTime !== "—" ? (
                          <span className="inline-block bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-1 font-bold">
                            ⏱ {responseTime}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleView(rfq)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="View Details">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleReply(rfq)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Reply">
                            <Reply size={15} />
                          </button>
                          <button onClick={() => handleDelete(rfq.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedRfqs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      <Reply className="mx-auto h-8 w-8 mb-2 opacity-40" />
                      <p className="font-semibold">No RFQs found</p>
                      {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="mt-2 text-xs text-blue-600 hover:underline">Clear all filters</button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Rows:</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); setShowAllPages(false); }} className="rounded-lg border px-3 py-1.5 text-sm">
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-sm text-slate-500">
                {filteredRfqs.length > 0 ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredRfqs.length)} of ${filteredRfqs.length}` : "0 results"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border p-2 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              {getPaginationItems().map((item, idx) => {
                if (item === "...left" || item === "...right") {
                  return <button key={`ellipsis-${idx}`} onClick={() => setShowAllPages(true)} className="h-9 w-9 rounded-lg text-sm font-medium border hover:bg-slate-50" title="Show all pages">...</button>;
                }
                return <button key={item} onClick={() => setCurrentPage(item)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === item ? "bg-blue-600 text-white" : "border hover:bg-slate-50"}`}>{item}</button>;
              })}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border p-2 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <ClientWiseView rfqs={filteredRfqs} onView={handleView} onReply={handleReply} onDelete={handleDelete} />
      )}

      {showReplyModal && selectedRfq && (
        <RfqReplyModal open={showReplyModal} rfq={selectedRfq} onClose={() => { setShowReplyModal(false); setSelectedRfq(null); }} onSave={handleSaveReply} />
      )}

      {showDetailModal && selectedRfq && (
        <RfqDetailModal open={showDetailModal} rfq={selectedRfq} allRfqs={rfqs} onClose={() => { setShowDetailModal(false); setSelectedRfq(null); }} onReply={handleReply} />
      )}
    </div>
  );
}