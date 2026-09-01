// src/lib/api/settingsApi.js
import apiClient from './client';

const settingsApi = {
  // ============================================
  // PRODUCT SETTINGS (Card Design, Layout, Toggles)
  // ============================================

  /**
   * Get product settings
   */
  async getProductSettings() {
    return apiClient.get('/settings/products');
  },

  /**
   * Update product settings
   */
  async updateProductSettings(data) {
    return apiClient.put('/settings/products', data);
  },

  // ============================================
  // SUBSCRIBERS (Newsletter)
  // ============================================

  /**
   * Get all subscribers
   */
  async getSubscribers(params = {}) {
    return apiClient.get('/settings/subscribers', params);
  },

  /**
   * Subscribe an email
   */
  async subscribe(email) {
    return apiClient.post('/settings/subscribers', { email });
  },

  /**
   * Unsubscribe an email
   */
  async unsubscribe(email) {
    return apiClient.delete(`/settings/subscribers/${email}`);
  },
};

export default settingsApi;