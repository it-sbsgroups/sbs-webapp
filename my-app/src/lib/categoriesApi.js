import apiClient from './client';

const categoriesApi = {
  async getAll() {
    try {
      const response = await apiClient.get('/categories');
      console.log('Categories raw response:', response);
      
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      console.warn('Unexpected categories response format:', response);
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  async getById(id) {
    const response = await apiClient.get(`/categories/${id}`);
    return response?.data || response;
  },

  async create(data) {
    const response = await apiClient.post('/categories', data);
    return response?.data || response;
  },

  async update(id, data) {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response?.data || response;
  },

  async delete(id) {
    return apiClient.delete(`/categories/${id}`);
  },

  async getAllSubcategories(categoryId) {
    try {
      const params = categoryId ? { categoryId } : {};
      const response = await apiClient.get('/categories/subcategories/all', params);
      console.log('Subcategories raw response:', response);
      
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      return [];
    }
  },

  async getSubcategoryById(id) {
    const response = await apiClient.get(`/categories/subcategories/${id}`);
    return response?.data || response;
  },

  async createSubcategory(data) {
    const response = await apiClient.post('/categories/subcategories', data);
    return response?.data || response;
  },

  async updateSubcategory(id, data) {
    const response = await apiClient.put(`/categories/subcategories/${id}`, data);
    return response?.data || response;
  },

  async deleteSubcategory(id) {
    return apiClient.delete(`/categories/subcategories/${id}`);
  },
};

export default categoriesApi;