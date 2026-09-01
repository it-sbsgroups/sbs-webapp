// src/lib/api/rfqApi.js
import apiClient from './client';

const rfqApi = {
  // ============================================
  // RFQ REQUESTS
  // ============================================

  /**
   * Get all RFQs with filters
   */
  async getAll(params = {}) {
    return apiClient.get('/rfq', params);
  },

  /**
   * Get single RFQ by ID
   */
  async getById(id) {
    return apiClient.get(`/rfq/${id}`);
  },

  /**
   * Submit a new RFQ (public endpoint)
   */
  async submit(data) {
    return apiClient.post('/rfq', data);
  },

  /**
   * Reply to an RFQ
   */
  async reply(id, data) {
    const res = await apiClient.post(`/rfq/${id}/reply`, data);
    return res?.data || res;
  },

  /**
   * Preview the quotation PDF before sending (opens in a new tab).
   * `draft` = { items, overallDiscountPercent, termsAndConditions, includePrivacyPolicy }
   */
  async previewQuotationPdf(id, draft) {
    const base = apiClient.baseUrl;
    const token = typeof window !== "undefined" ? localStorage.getItem("sbs_auth_token") : null;
    const res = await fetch(`${base}/rfq/${id}/quotation-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error("Failed to generate quotation preview");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  },

  /** Downloads the PDF for an already-sent quotation reply. */
  async downloadQuotationPdf(rfqId, replyId) {
    const base = apiClient.baseUrl;
    const token = typeof window !== "undefined" ? localStorage.getItem("sbs_auth_token") : null;
    const res = await fetch(`${base}/rfq/${rfqId}/replies/${replyId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to download quotation PDF");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SBS-Quotation-${rfqId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Update RFQ status
   */
  async updateStatus(id, status) {
    return apiClient.put(`/rfq/${id}/status`, { status });
  },

  /**
   * Delete an RFQ
   */
  async delete(id) {
    return apiClient.delete(`/rfq/${id}`);
  },

  // ============================================
  // RFQ SETTINGS
  // ============================================

  /**
   * Get RFQ settings
   */
  async getSettings() {
    return apiClient.get('/rfq/settings');
  },

  /**
   * Update RFQ settings
   */
  async updateSettings(data) {
    return apiClient.put('/rfq/settings', data);
  },

  // ============================================
  // API KEYS
  // ============================================

  /**
   * Get all API keys
   */
  async getApiKeys() {
    return apiClient.get('/rfq/api-keys/all');
  },

  /**
   * Create a new API key
   */
  async createApiKey(data) {
    return apiClient.post('/rfq/api-keys', data);
  },

  /**
   * Delete an API key
   */
  async deleteApiKey(id) {
    return apiClient.delete(`/rfq/api-keys/${id}`);
  },

  /**
   * Toggle API key active/inactive
   */
  async toggleApiKey(id) {
    return apiClient.put(`/rfq/api-keys/${id}/toggle`);
  },
};

export default rfqApi;