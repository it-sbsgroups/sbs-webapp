'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAdminContacts,
  getContactById,
  updateContact,
  deleteContact,
  sendReply,
} from '@/lib/contacts/api';

const REFRESH_INTERVAL = 15000;

export default function AdminContactsPage() {
  // ---------- List state ----------
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ---------- Detail state ----------
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const searchTimeout = useRef(null);

  // ---------- Fetch contacts ----------
  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const params = { page: pagination.page, limit: pagination.limit, sortBy, order };
      if (search.trim()) params.search = search.trim();
      if (filter === 'responded') params.responded = 'true';
      else if (filter === 'unresponded') params.responded = 'false';

      const data = await getAdminContacts(params);
      setContacts(data.data);
      setPagination(prev => ({ ...prev, total: data.meta.total, totalPages: data.meta.totalPages }));
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, [pagination.page, pagination.limit, search, filter, sortBy, order]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const interval = setInterval(() => fetchContacts(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchContacts]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
  };

  const openDetail = async (id) => {
    if (selectedId === id) return;
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await getContactById(id);
      setDetail(data);
      setAdminNote(data.adminNote || '');
      setReplySubject('');
      setReplyBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const saveAdminNote = async () => {
    if (!selectedId) return;
    setSavingNote(true);
    try {
      const updated = await updateContact(selectedId, { adminNote });
      setDetail(prev => ({ ...prev, ...updated }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const sendReplyHandler = async () => {
    if (!selectedId) return;
    setSendingReply(true);
    try {
      await sendReply(selectedId, {
        subject: replySubject || undefined,
        emailBody: replyBody || undefined,
      });
      const updated = await getContactById(selectedId);
      setDetail(updated);
      setReplySubject('');
      setReplyBody('');
      fetchContacts(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete this contact permanently?')) return;
    try {
      await deleteContact(id);
      if (selectedId === id) closeDetail();
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setOrder('asc'); }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-block text-xs">
      {sortBy === field ? (order === 'asc' ? '▲' : '▼') : ''}
    </span>
  );

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      {/* ===== LEFT: TABLE & CONTROLS (independent scroll) ===== */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-black">Contacts</h1>
            {isRefreshing && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
          </div>
          <button
            onClick={() => fetchContacts()}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 transition"
          >
            Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
          />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="responded">Responded</option>
            <option value="unresponded">Unresponded</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
            {error}
            <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none"
                  onClick={() => toggleSort('fullName')}>
                  Name <SortIcon field="fullName" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none"
                  onClick={() => toggleSort('createdAt')}>
                  Received <SortIcon field="createdAt" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                    <div className="animate-pulse flex justify-center gap-2">
                      <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === c.id ? 'bg-blue-50/50' : ''}`}
                    onClick={() => openDetail(c.id)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate">{c.subject}</td>
                    <td className="px-4 py-3">
                      {c.responded ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Replied</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">New</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHandler(c.id); }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Prev
              </button>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== RIGHT DETAIL PANEL (independent scroll + sticky header) ===== */}
      <div
        className={`
          ${selectedId ? 'w-2/5 lg:w-1/3 border-l' : 'w-0'}
          transition-all duration-300 ease-in-out border-gray-200 flex flex-col overflow-y-auto shrink-0 bg-gray-50/50
        `}
      >
        {selectedId ? (
          detailLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : detail ? (
            <div className="flex flex-col h-full">
              {/* STICKY HEADER SECTION */}
              <div className="sticky top-0 z-10 bg-gray-50/50 backdrop-blur-sm border-b border-gray-200 p-6 pb-4 space-y-4">
                {/* Name + Close */}
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-black truncate">{detail.fullName}</h2>
                  <button onClick={closeDetail} className="text-gray-400 hover:text-black text-2xl leading-none">×</button>
                </div>

                {/* Contact info grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                    <div className="font-medium">{detail.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Phone</div>
                    <div className="font-medium">{detail.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Company</div>
                    <div className="font-medium">{detail.companyName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                    <span className={`font-medium ${detail.responded ? 'text-green-700' : 'text-gray-700'}`}>
                      {detail.responded ? 'Responded' : 'New'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Subject</div>
                    <div className="font-medium">{detail.subject}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Message</div>
                    <div className="mt-1 bg-white border border-gray-200 rounded-lg p-3 text-gray-700 whitespace-pre-wrap">
                      {detail.message}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Received</div>
                    <div>{new Date(detail.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="p-6 pt-0 space-y-6">
                {/* Admin Note */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Note</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-black"
                    placeholder="Internal note..."
                  />
                  <button
                    onClick={saveAdminNote}
                    disabled={savingNote}
                    className="mt-2 text-xs bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                  >
                    {savingNote ? 'Saving…' : 'Save Note'}
                  </button>
                </div>

                {/* Responses */}
                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Responses</h3>
                  {detail.responses?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {detail.responses.map(r => (
                        <div key={r.id} className="bg-white border border-gray-100 rounded-lg p-3 text-sm">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{new Date(r.sentAt).toLocaleString()}</span>
                            <span>{r.sentFrom}</span>
                          </div>
                          <div className="whitespace-pre-wrap text-gray-800">{r.emailBody}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No responses yet.</p>
                  )}
                </div>

                {/* Reply */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-black">Reply to {detail.fullName}</h3>
                  <input
                    type="text"
                    placeholder="Subject (optional)"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    placeholder="Your reply (leave empty for default template)"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={sendReplyHandler}
                    disabled={sendingReply}
                    className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                  >
                    {sendingReply ? 'Sending…' : 'Send Reply'}
                  </button>
                </div>

                <button
                  onClick={() => deleteHandler(detail.id)}
                  className="text-sm text-red-500 hover:text-red-700 mt-2"
                >
                  Delete this contact
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-red-500">Failed to load.</div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Select a contact to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}