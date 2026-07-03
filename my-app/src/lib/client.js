// src/lib/api/client.js

// Resolve the API base URL.
// - Use NEXT_PUBLIC_API_URL when explicitly set.
// - Otherwise, in the browser, derive the backend host from the current page host
//   so that when the app is opened over the LAN (e.g. http://192.168.1.20:3000),
//   API calls go to http://192.168.1.20:4000/api instead of localhost (which a
//   phone/other device on the network cannot reach).
function resolveApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4000/api`;
  }
  return 'http://localhost:4000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an HTTP request to the API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      // Send cookies too, so same-domain deployments authenticate via the
      // httpOnly session cookie even without the Bearer token below.
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sbs_auth_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

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
        throw new Error(data.message || `Request failed with status ${response.status}`);
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
  async get(endpoint, params) {
    const query = this.buildQuery(params);
    return this.request(`${endpoint}${query}`, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create and export singleton
const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;