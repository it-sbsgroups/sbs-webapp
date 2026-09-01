// src/lib/notificationsApi.js
import apiClient from "./client";

const notificationsApi = {
  /** Universal instant-vs-batch timing settings (products & news). */
  async getSettings() {
    return apiClient.get("/notifications/settings");
  },
  async updateSettings(data) {
    return apiClient.post("/notifications/settings", data);
  },

  /** Send a product notification RIGHT NOW, one email per subscriber. */
  async sendProductsNow(productIds) {
    return apiClient.post("/notifications/products/send", { productIds });
  },

  /** Schedule a notification (PRODUCT or NEWS) for a future date/time. */
  async schedule({ type, targetIds, scheduledAt }) {
    return apiClient.post("/notifications/schedule", { type, targetIds, scheduledAt });
  },

  /** List pending/sent/cancelled scheduled notifications. */
  async listScheduled(type) {
    return apiClient.get("/notifications/scheduled", type ? { type } : {});
  },

  /** Cancel a pending scheduled notification. */
  async cancelScheduled(id) {
    return apiClient.delete(`/notifications/scheduled/${id}`);
  },

  /** Notification send history/logs. */
  async listLogs(params = {}) {
    return apiClient.get("/notifications/logs", params);
  },
};

export default notificationsApi;
