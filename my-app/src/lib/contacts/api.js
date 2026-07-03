// lib/contacts/api.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Strip empty / null / undefined values
function clean(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) out[k] = v;
  });
  return out;
}

async function parseError(res) {
  let msg = 'Request failed';
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) msg = body.message.join(', ');
    else if (body.message) msg = body.message;
    else if (body.error) msg = body.error;
  } catch {
    /* ignore */
  }
  return new Error(msg);
}

// Attach Bearer token from localStorage (key used by your app)
function authHeaders(extra = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

export async function getAdminContacts(params = {}) {
  const query = new URLSearchParams(clean(params)).toString();
  const url = `${API_BASE}/contacts/admin${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function getContactById(id) {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function createContact(contactData) {
  const res = await fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(contactData)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function updateContact(id, data) {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function deleteContact(id) {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function sendReply(contactId, replyData) {
  const res = await fetch(`${API_BASE}/contacts/${contactId}/reply`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(replyData)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

// Optional: direct CRUD for responses (if needed)
export async function getResponses(contactId) {
  const res = await fetch(`${API_BASE}/contacts/${contactId}/responses`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function createResponse(contactId, data) {
  const res = await fetch(`${API_BASE}/contacts/${contactId}/responses`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function updateResponse(contactId, responseId, data) {
  const res = await fetch(`${API_BASE}/contacts/${contactId}/responses/${responseId}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function deleteResponse(contactId, responseId) {
  const res = await fetch(`${API_BASE}/contacts/${contactId}/responses/${responseId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}