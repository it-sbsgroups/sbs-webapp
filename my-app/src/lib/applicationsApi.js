import apiClient from './client';

const applicationsApi = {
  async getAll(includeInactive = false) {
    try {
      const response = await apiClient.get('/applications', includeInactive ? { includeInactive: 'true' } : {});
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return [];
    }
  },

  async create(data) {
    const response = await apiClient.post('/applications', data);
    return response?.data || response;
  },

  async update(id, data) {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response?.data || response;
  },

  async delete(id) {
    return apiClient.delete(`/applications/${id}`);
  },
};

export default applicationsApi;
