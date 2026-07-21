import apiClient from "./client";

const systemLogsApi = {
  async list(params = {}) {
    const res = await apiClient.get("/system-logs", params);
    return res?.data ? res : { data: res, meta: {} };
  },
  async markReviewed(id) {
    return apiClient.put(`/system-logs/${id}/review`, {});
  },
  async markUnreviewed(id) {
    return apiClient.put(`/system-logs/${id}/unreview`, {});
  },
  async markAllReviewed() {
    return apiClient.put(`/system-logs/review-all`, {});
  },
  async remove(id) {
    return apiClient.delete(`/system-logs/${id}`);
  },
};

export default systemLogsApi;
