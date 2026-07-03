// src/lib/api/searchLogsApi.js
import apiClient from './client';

const searchLogsApi = {
  /**
   * Get search logs with filters
   */
  async getAll(params = {}) {
    return apiClient.get('/settings/search-logs', params);
  },

  /**
   * Log a search query
   */
  async log(keyword, results, ipAddress) {
    return apiClient.post('/settings/search-logs', { keyword, results, ipAddress });
  },

  /**
   * Delete search logs (by IDs or all)
   */
  async delete(ids) {
    return apiClient.delete('/settings/search-logs', { body: JSON.stringify({ ids }) });
  },
};

export default searchLogsApi;