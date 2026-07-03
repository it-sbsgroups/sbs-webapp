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