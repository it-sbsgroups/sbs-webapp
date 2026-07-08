// src/lib/rfqIntegrationsApi.js
import apiClient from "./client";

const rfqIntegrationsApi = {
  async getSettings() {
    return apiClient.get("/rfq/integrations");
  },
  async updateSettings(data) {
    return apiClient.put("/rfq/integrations", data);
  },
  // 👇 New test method
  async test() {
    return apiClient.post("/rfq/integrations/test");
  },
};

export default rfqIntegrationsApi;