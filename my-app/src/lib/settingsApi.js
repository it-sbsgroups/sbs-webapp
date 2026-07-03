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
  // AD PLACEMENTS
  // ============================================

  /**
   * Get all ads
   */
  async getAds() {
    return apiClient.get('/settings/ads');
  },

  /**
   * Create a new ad
   */
  async createAd(data) {
    return apiClient.post('/settings/ads', data);
  },

  /**
   * Update an ad
   */
  async updateAd(id, data) {
    return apiClient.put(`/settings/ads/${id}`, data);
  },

  /**
   * Delete an ad
   */
  async deleteAd(id) {
    return apiClient.delete(`/settings/ads/${id}`);
  },

  /**
   * Toggle ad active/inactive
   */
  async toggleAd(id) {
    return apiClient.put(`/settings/ads/${id}/toggle`);
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