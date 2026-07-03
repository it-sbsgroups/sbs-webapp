// FILE: src/lib/dashboardApi.js
import apiClient from '@/lib/client';

const dashboardApi = {
  /** GET /api/dashboard/stats → all stat card counts */
  async getStats() {
    try {
      const r = await apiClient.get('/dashboard/stats');
      return r?.data ?? r ?? {};
    } catch { return {}; }
  },

  /** GET /api/dashboard/rfq-trend?months=12 → area chart data */
  async getRfqTrend(months = 12) {
    try {
      const r = await apiClient.get('/dashboard/rfq-trend', { months });
      return r?.data ?? r ?? [];
    } catch { return []; }
  },
};

export default dashboardApi;