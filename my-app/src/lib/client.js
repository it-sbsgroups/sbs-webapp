function resolveApiBaseUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) return configuredApiUrl.replace(/\/$/, '');

  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredAppUrl) return `${configuredAppUrl.replace(/\/$/, '')}/api`;

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin.replace(/\/$/, '')}/api`;
  }

  return 'http://localhost:4000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    // Pull headers out separately — merging them AFTER spreading the rest of
    // options avoids a caller-supplied `headers` object silently replacing
    // (rather than extending) the Content-Type/Authorization defaults below.
    const { headers: callerHeaders, ...restOptions } = options;

    // A FormData body (file uploads) must NOT get a JSON Content-Type —
    // the browser needs to set its own `multipart/form-data; boundary=...`
    // header, which it only does when Content-Type is left unset. Forcing
    // 'application/json' here (as this used to do unconditionally) made
    // every file upload through post()/put() silently fail: the body
    // never actually contained the file, so the backend's @UploadedFile()
    // saw nothing and rejected the request.
    const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;

    let headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...callerHeaders,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sbs_auth_token');
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const config = {
      credentials: 'include',
      ...restOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: null, meta: null };
      }

      // Handle CSV/blob responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return response;
      }

      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data.message || `Request failed with status ${response.status}`);
        err.status = response.status;
        throw err;
      }

      return data;
    } catch (error) {
      console.log(`API Error [${options.method || 'GET'} ${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * Build query string from params object
   */
  buildQuery(params = {}) {
    const filtered = Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    );
    if (filtered.length === 0) return '';
    const query = new URLSearchParams(filtered).toString();
    return `?${query}`;
  }

  // HTTP Methods
  async get(endpoint, params, opts = {}) {
    const query = this.buildQuery(params);
    return this.request(`${endpoint}${query}`, { ...opts, method: 'GET' });
  }

  // `opts` (e.g. { headers: { 'x-otp-token': ... } }) is spread BEFORE
  // method/body so a caller can never accidentally override the HTTP verb
  // or payload — only headers and other fetch options are meant to flow
  // through here.
  async post(endpoint, data, opts = {}) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request(endpoint, { ...opts, method: 'POST', body: isFormData ? data : JSON.stringify(data) });
  }

  async put(endpoint, data, opts = {}) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request(endpoint, { ...opts, method: 'PUT', body: isFormData ? data : JSON.stringify(data) });
  }

  async patch(endpoint, data, opts = {}) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request(endpoint, { ...opts, method: 'PATCH', body: isFormData ? data : JSON.stringify(data) });
  }

  async delete(endpoint, opts = {}) {
    return this.request(endpoint, { ...opts, method: 'DELETE' });
  }
}

// Create and export singleton
const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

// The backend serves locally-stored static files (e.g. public/brands/brochure/*)
// outside the '/api' prefix, so this strips '/api' off the API base URL to get
// the plain host, e.g. "http://localhost:4000/api" -> "http://localhost:4000".
export function getStaticBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

// Prefixes a stored relative path (e.g. "/brands/brochure/foo.pdf") with the
// backend host so it can be used directly as a download/view link. Absolute
// URLs (http://, https://) are returned unchanged.
export function toStaticUrl(relativePath) {
  if (!relativePath) return '';
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  return `${getStaticBaseUrl()}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}