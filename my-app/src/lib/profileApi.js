import apiClient from "./client";

const profileApi = {
  async get() {
    const res = await apiClient.get("/auth/profile");
    return res?.data || res;
  },
  async update(data) {
    const res = await apiClient.put("/auth/profile", data);
    return res?.data || res;
  },
};

export default profileApi;
