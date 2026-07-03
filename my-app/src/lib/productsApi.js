import apiClient from './client';

const productsApi = {
  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/products', params);
      console.log('Products raw response:', response);
      
      // NestJS paginated response: { data: [...], meta: {...} }
      if (response?.data && Array.isArray(response.data)) {
        return response; // Keep meta intact for pagination
      }
      if (Array.isArray(response)) {
        return { data: response, meta: { total: response.length, page: 1, pageSize: response.length } };
      }
      return { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
    }
  },

  async getById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response?.data || response;
  },

  async getBySku(sku) {
    const response = await apiClient.get(`/products/sku/${sku}`);
    return response?.data || response;
  },

  async create(data) {
    const response = await apiClient.post('/products', data);
    return response?.data || response;
  },

  async update(id, data) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response?.data || response;
  },

  async delete(id) {
    return apiClient.delete(`/products/${id}`);
  },

  async softDelete(id) {
    const response = await apiClient.put(`/products/${id}/soft-delete`);
    return response?.data || response;
  },

  async bulkImport(products) {
    const response = await apiClient.post('/products/bulk-import', { products });
    return response?.data || response;
  },

  async exportCSV() {
    try {
      const fullUrl = `${apiClient.baseUrl}/products/export/csv`;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Failed to export CSV');
      return response.blob();
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  },

    // ============================================
  // BROCHURE METHODS
  // ============================================

  /**
   * Upload brochure file for a product
   */
  // BROCHURE
  async uploadBrochure(productId, file) {
    const formData = new FormData();
    formData.append('brochure', file);
    const url = `${apiClient.baseUrl}/products/${productId}/brochure`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  },

  async deleteBrochure(productId) {
    return apiClient.delete(`/products/${productId}/brochure`);
  },

  getBrochureUrl(productId, mode = 'download') {
    return `${apiClient.baseUrl}/products/${productId}/brochure/download?mode=${mode}`;
  },

  // ============================================
  // IMAGE UPLOAD METHODS (server compresses to WebP <100KB)
  // ============================================

  /**
   * Upload a single image. If productId is provided it is tied to that product
   * folder, otherwise it goes to a standalone endpoint (used while creating).
   * Returns { url, bytes, format, width, height, title }.
   */
  async uploadImage(file, productId) {
    const formData = new FormData();
    formData.append('image', file);
    const path = productId
      ? `/products/${productId}/images/upload`
      : `/products/images/upload`;
    const url = `${apiClient.baseUrl}${path}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Image upload failed' }));
      throw new Error(error.message || 'Image upload failed');
    }
    return response.json();
  },
};

export default productsApi;