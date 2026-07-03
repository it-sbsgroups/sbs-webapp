const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Strip '' / null / undefined so optional fields never reach the backend as ""
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
    // Nest validation errors come back as message: string | string[]
    if (Array.isArray(body.message)) msg = body.message.join(', ');
    else if (body.message) msg = body.message;
    else if (body.error) msg = body.error;
  } catch {
    /* ignore */
  }
  return new Error(msg);
}

// Attach the admin Bearer token (set at login) to authenticated requests.
function authHeaders(extra = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

export const api = {
  getEmployees: async (params = {}) => {
    const query = new URLSearchParams(clean(params)).toString();
    const url = `${API_BASE}/employees${query ? `?${query}` : ''}`;
    const res = await fetch(url, { credentials: 'include', headers: authHeaders() });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  getEmployee: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, { credentials: 'include', headers: authHeaders() });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  createEmployee: async (data) => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(clean(data)),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  updateEmployee: async (id, data) => {
    // never send id/createdAt/updatedAt; backend strips them too, but keep payload clean
    const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = data;
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(clean(rest)),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE', credentials: 'include', headers: authHeaders() });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  toggleActive: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}/toggle-active`, { method: 'PATCH', credentials: 'include', headers: authHeaders() });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  getStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/employees/stats`, { credentials: 'include', headers: authHeaders() });
      if (!res.ok) throw await parseError(res);
      return res.json();
    } catch {
      return { total: 0, active: 0, inactive: 0, topStates: [] };
    }
  },

  // Upload a photo file → backend compresses → webp → Cloudinary → { url }
  uploadEmployeeImage: async (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', file, file.name || 'employee-photo.webp');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/employees/upload-image`);
      xhr.withCredentials = true;
      const _t = typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
      if (_t) xhr.setRequestHeader('Authorization', `Bearer ${_t}`);
      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) resolve(body);
          else reject(new Error(body.message || 'Image upload failed'));
        } catch {
          reject(new Error('Image upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  },

  sendTestEmail: async (email) => {
    const res = await fetch(`${API_BASE}/mail/test`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return res.json();
  },
};