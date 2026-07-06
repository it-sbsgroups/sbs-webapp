const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ── Utilities (same as contacts) ──
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
  } catch { /* ignore */ }
  return new Error(msg);
}

function authHeaders(extra = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

// ── API functions ──
export async function getCurrentInnovation() {
  const res = await fetch(`${API_BASE}/industry-innovation/current`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function saveInnovation(data) {
  // POST to create – server auto‑handles singleton (replaces existing)
  const res = await fetch(`${API_BASE}/industry-innovation`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function updateInnovation(id, data) {
  const res = await fetch(`${API_BASE}/industry-innovation/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function deleteInnovation(id) {
  const res = await fetch(`${API_BASE}/industry-innovation/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

// ── Keys ──
export async function addKey(innovationId, data) {
  const res = await fetch(`${API_BASE}/industry-innovation/${innovationId}/keys`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function updateKey(keyId, data) {
  const res = await fetch(`${API_BASE}/industry-innovation/keys/${keyId}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(clean(data)),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function deleteKey(keyId) {
  const res = await fetch(`${API_BASE}/industry-innovation/keys/${keyId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}