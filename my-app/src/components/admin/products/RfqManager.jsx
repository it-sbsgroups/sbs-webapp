// src/components/admin/products/RfqManager.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Reply, Trash2, Download, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import rfqApi from "@/lib/rfqApi";
import RfqReplyModal from "./RfqReplyModal";

export default function RfqManager() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const pageSize = 10;

  const fetchRfqs = async () => {
    try {
      const response = await rfqApi.getAll({
        page: currentPage,
        pageSize,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      const data = response?.data || response;
      setRfqs(Array.isArray(data) ? data : []);
      if (response?.meta) setPagination(response.meta);
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [currentPage, statusFilter, searchQuery]);

  const handleReply = (rfq) => {
    setSelectedRfq(rfq);
    setShowReplyModal(true);
  };

  const handleSaveReply = async (rfqId, replyNote, emailBody, sentTo) => {
    try {
      await rfqApi.reply(rfqId, { 
        note: replyNote, 
        emailBody: emailBody || '',
        sentTo: sentTo || '',
      });
      setShowReplyModal(false);
      setSelectedRfq(null);
      await fetchRfqs();
    } catch (error) {
      alert("Failed to reply: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this RFQ?")) return;
    try {
      await rfqApi.delete(id);
      await fetchRfqs();
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await rfqApi.updateStatus(id, status);
      await fetchRfqs();
    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

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
          <p className="mt-1 text-sm text-slate-500">{pagination.total} quotation requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total RFQs", value: pagination.total, color: "text-blue-600" },
          { label: "Pending", value: rfqs.filter((r) => r?.status === "PENDING").length, color: "text-yellow-600" },
          { label: "Replied", value: rfqs.filter((r) => r?.status === "REPLIED").length, color: "text-blue-600" },
          { label: "Completed", value: rfqs.filter((r) => r?.status === "COMPLETED").length, color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <h3 className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, company, or reference..."
            className="w-72 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm">
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="REPLIED">Replied</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* RFQ Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">RFQ Reference</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(rfqs) && rfqs.map((rfq) => (
              <tr key={rfq?.id} className="border-t hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {rfq?.reference || rfq?.id?.slice(0, 8) || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold">{String(rfq?.fullName || "—")}</p>
                </td>
                <td className="px-4 py-3 text-sm">{String(rfq?.companyName || "—")}</td>
                <td className="px-4 py-3 text-sm">{String(rfq?.email || "—")}</td>
                <td className="px-4 py-3 text-sm">{rfq?.items?.length || 0} item(s)</td>
                <td className="px-4 py-3">{getStatusBadge(rfq?.status)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {rfq?.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleReply(rfq)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Reply">
                      <Reply size={15} />
                    </button>
                    <button onClick={() => handleDelete(rfq?.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!rfqs || rfqs.length === 0) && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <Mail className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="font-semibold">No RFQs found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
        </span>
        <div className="flex gap-1">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={currentPage >= pagination.totalPages}
            className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>

      {showReplyModal && selectedRfq && (
        <RfqReplyModal
          open={showReplyModal}
          rfq={selectedRfq}
          onClose={() => { setShowReplyModal(false); setSelectedRfq(null); }}
          onSave={handleSaveReply}
        />
      )}
    </div>
  );
}