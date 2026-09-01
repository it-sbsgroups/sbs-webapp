// FILE: src/lib/dashboardApi.js
import apiClient from '@/lib/client';

const dashboardApi = {
  /** GET /api/dashboard/stats → all stat card counts */
  async getStats() {
    try {
      const r = await apiClient.get('/dashboard/stats');
      return r?.data ?? r ?? {};
    } catch (err) { console.error('[dashboardApi] getStats failed:', err); return {}; }
  },

  /** GET /api/dashboard/rfq-trend?months=12 → area chart data */
  async getRfqTrend(months = 12) {
    try {
      const r = await apiClient.get('/dashboard/rfq-trend', { months });
      return r?.data ?? r ?? [];
    } catch (err) { console.error('[dashboardApi] getRfqTrend failed:', err); return []; }
  },

  /** GET /api/dashboard/growth-trend?months=12 → subscribers/products/news per month */
  async getGrowthTrend(months = 12) {
    try {
      const r = await apiClient.get('/dashboard/growth-trend', { months });
      return r?.data ?? r ?? [];
    } catch (err) { console.error('[dashboardApi] getGrowthTrend failed:', err); return []; }
  },
};

export default dashboardApi;