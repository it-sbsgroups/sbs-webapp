// src/lib/rfqIntegrationsApi.js
import apiClient from "./client";

const rfqIntegrationsApi = {
  async getSettings() {
    return apiClient.get("/rfq/integrations");
  },
  async updateSettings(data) {
    return apiClient.put("/rfq/integrations", data);
  },
};

export default rfqIntegrationsApi;
