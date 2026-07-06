// lib/clients/api.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Remove empty, null, or undefined values from an object
function clean(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) out[k] = v;
  });
  return out;
}

// Parse a non-OK response into a descriptive error
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

// Add Bearer token if present in localStorage (key 'sbs_auth_token')
function authHeaders(extra = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

// -------------------------------------------
//  PUBLIC ENDPOINTS (no token required)
// -------------------------------------------

/** GET /clients/public – Fetch all active clients */
export async function getActiveClients() {
  const res = await fetch(`${API_BASE}/clients/public`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/** GET /clients/public/:slug – Fetch a single active client by slug */
export async function getClientBySlug(slug) {
  const res = await fetch(`${API_BASE}/clients/public/${encodeURIComponent(slug)}`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

// -------------------------------------------
//  ADMIN ENDPOINTS (require valid auth token)
// -------------------------------------------

/** GET /clients – Fetch all clients (admin) */
export async function getClients() {
  const res = await fetch(`${API_BASE}/clients`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/** GET /clients/:id – Fetch one client by ID (admin) */
export async function getClientById(id) {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/** POST /clients – Create a new client (admin) */
export async function createClient(clientData) {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(clientData)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/** PUT /clients/:id – Update a client (admin) */
export async function updateClient(id, data) {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/** PUT /clients/:id/toggle – Toggle the isActive flag (admin) */
export async function toggleClientActive(id) {
  const res = await fetch(`${API_BASE}/clients/${id}/toggle`, {
    method: 'PUT',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/** DELETE /clients/:id – Delete a client (admin) */
export async function deleteClient(id) {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}