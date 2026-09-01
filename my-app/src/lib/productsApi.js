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
      // Was previously a bare fetch() with no auth token attached, so it
      // hit /products/export/csv (which isn't @Public() on the backend —
      // unlike findAll/catalogue above) as an anonymous request and got
      // rejected by JwtAuthGuard. apiClient.get() already attaches the
      // Bearer token from localStorage and credentials:'include', and it
      // already special-cases text/csv responses to return the raw
      // Response instead of trying to parse it as JSON — so just reuse it.
      const response = await apiClient.get('/products/export/csv');
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

  /**
   * Ask Gemini to read the already-uploaded brochure and suggest Name,
   * Model Number, Description, Key Features and Specifications. Returns
   * suggestions for the caller to show/apply — never writes to the product.
   */
  async extractBrochureMetadata(productId) {
    const response = await apiClient.post(`/products/${productId}/brochure/extract`, {});
    return response?.data || response;
  },

  // ============================================
  // DESIGN FILE UPLOAD (same local-storage pattern as brochure)
  // ============================================

  async uploadDesignFile(productId, file) {
    const formData = new FormData();
    formData.append('design', file);
    const url = `${apiClient.baseUrl}/products/${productId}/design`;
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

  async deleteDesignFile(productId) {
    return apiClient.delete(`/products/${productId}/design`);
  },

  getDesignFileUrl(productId, mode = 'download') {
    return `${apiClient.baseUrl}/products/${productId}/design/download?mode=${mode}`;
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

// ============================================
// VARIANTS
// ============================================
productsApi.getVariants = (productId) => apiClient.get(`/products/${productId}/variants`);
productsApi.createVariant = (productId, data) => apiClient.post(`/products/${productId}/variants`, data);
productsApi.updateVariant = (productId, variantId, data) => apiClient.put(`/products/${productId}/variants/${variantId}`, data);
productsApi.deleteVariant = (productId, variantId) => apiClient.delete(`/products/${productId}/variants/${variantId}`);

async function uploadVariantFile(path, fieldName, file) {
  const formData = new FormData();
  formData.append(fieldName, file);
  const url = `${apiClient.baseUrl}${path}`;
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
}

productsApi.uploadVariantBrochure = (productId, variantId, file) =>
  uploadVariantFile(`/products/${productId}/variants/${variantId}/brochure`, 'brochure', file);
productsApi.deleteVariantBrochure = (productId, variantId) => apiClient.delete(`/products/${productId}/variants/${variantId}/brochure`);
productsApi.uploadVariantDesignFile = (productId, variantId, file) =>
  uploadVariantFile(`/products/${productId}/variants/${variantId}/design`, 'design', file);
productsApi.deleteVariantDesignFile = (productId, variantId) => apiClient.delete(`/products/${productId}/variants/${variantId}/design`);

// ============================================
// PRE-LAUNCH / TEASER
// ============================================
productsApi.notifyMe = (productId, email) => apiClient.post(`/products/${productId}/notify-me`, { email });
productsApi.getNotifyList = (productId) => apiClient.get(`/products/${productId}/notify-list`);