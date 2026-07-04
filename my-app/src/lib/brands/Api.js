import apiClient from '@/lib/client';

const brandsApi = {
  async getAll() {
    try {
      const response = await apiClient.get('/brands');
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
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

  async getBySlug(slug) {
    const response = await apiClient.get(`/brands/slug/${slug}`);
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

  async uploadGalleryImage(file, folder = 'brands-gallery') {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/uploads/image', formData, {
      params: { folder },
      headers: { 'Content-Type': undefined },
    });

    return {
      url: response?.data?.url || response?.url,
      ...response?.data,
    };
  },
};

export default brandsApi;