import apiClient from './client';

const brandsApi = {
  async getAll() {
    try {
      const response = await apiClient.get('/brands');
      console.log('Brands raw response:', response);
      
      // NestJS returns { data: [...], meta: {...} } for paginated endpoints
      // But for non-paginated, it might return the array directly or { data: [...] }
      if (Array.isArray(response)) {
        return response;
      }
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      // If response is a single object (unexpected), return empty array
      console.warn('Unexpected brands response format:', response);
      return [];
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      return [];
    }
  },

  async getById(id) {
    const response = await apiClient.get(`/brands/${id}`);
    return response?.data || response;
  },

  async create(data) {
    const response = await apiClient.post('/brands', data);
    return response?.data || response;
  },

  async update(id, data) {
    const response = await apiClient.put(`/brands/${id}`, data);
    return response?.data || response;
  },

  async delete(id) {
    return apiClient.delete(`/brands/${id}`);
  },
};

export default brandsApi;