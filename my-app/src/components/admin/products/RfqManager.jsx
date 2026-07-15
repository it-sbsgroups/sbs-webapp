// src/components/admin/products/RfqManager.jsx
"use client";

import { useState, useEffect } from "react";
import { Reply, Trash2 } from "lucide-react";
import rfqApi from "@/lib/rfqApi";
import RfqReplyModal from "./RfqReplyModal";
import AdminDataTable from "@/components/admin/shared/AdminDataTable";

export default function RfqManager() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const fetchRfqs = async () => {
    try {
      // AdminDataTable handles search/filter/sort/pagination client-side, so
      // pull a generous batch once rather than round-tripping per keystroke.
      const response = await rfqApi.getAll({ page: 1, pageSize: 500 });
      const data = response?.data || response;
      setRfqs(Array.isArray(data) ? data : []);
      setTotal(response?.meta?.total ?? (Array.isArray(data) ? data.length : 0));
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

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
          <p className="mt-1 text-sm text-slate-500">{total} quotation requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total RFQs", value: total, color: "text-blue-600" },
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

      <AdminDataTable
        data={rfqs}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search by name, company, or reference..."
        searchKeys={["fullName", "companyName", "email", "reference"]}
        exportFilenamePrefix="rfqs"
        pageSize={10}
        emptyMessage="No RFQs found"
        columns={[
          { key: "reference", label: "RFQ Reference", sortable: true, render: (rfq) => (
              <span className="font-mono text-xs font-bold text-blue-700">{rfq?.reference || rfq?.id?.slice(0, 8) || "—"}</span>
            ) },
          { key: "fullName", label: "Client", sortable: true, render: (rfq) => <p className="text-sm font-semibold">{String(rfq?.fullName || "—")}</p> },
          { key: "companyName", label: "Company", sortable: true },
          { key: "email", label: "Email", sortable: true },
          { key: "items", label: "Items", exportValue: (rfq) => rfq?.items?.length || 0, render: (rfq) => `${rfq?.items?.length || 0} item(s)` },
          {
            key: "status", label: "Status", sortable: true, filterType: "select",
            filterOptions: ["PENDING", "REPLIED", "PROCESSING", "COMPLETED", "CANCELLED"],
            render: (rfq) => getStatusBadge(rfq?.status),
          },
          {
            key: "createdAt", label: "Date", sortable: true,
            sortAccessor: (rfq) => (rfq?.createdAt ? new Date(rfq.createdAt).getTime() : 0),
            exportValue: (rfq) => (rfq?.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : ""),
            render: (rfq) => <span className="text-xs text-slate-500">{rfq?.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : "—"}</span>,
          },
        ]}
        rowActions={(rfq) => (
          <>
            <button onClick={() => handleReply(rfq)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Reply">
              <Reply size={15} />
            </button>
            <button onClick={() => handleDelete(rfq?.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

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