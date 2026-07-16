import apiClient from '@/lib/client';

function apiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  return 'http://localhost:4000/api';
}

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

  /** Active brands for public pages. ownBrand: true -> only own brands, false -> only third-party brands. */
  async getPublic(ownBrand) {
    try {
      const params = ownBrand === undefined ? {} : { ownBrand: String(ownBrand) };
      const response = await apiClient.get('/brands/public/list', params);
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch public brands:', error);
      return [];
    }
  },

  /** All active brands that have a brochure uploaded — for the public brochures catalog page. */
  async getAllBrochures() {
    try {
      const response = await apiClient.get('/brands/public/brochures');
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch brochures:', error);
      return [];
    }
  },

  async uploadBrochure(brandId, file) {
    const formData = new FormData();
    formData.append('brochure', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;

    const res = await fetch(`${apiBase()}/brands/${brandId}/brochure`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Brochure upload failed');
    }
    return res.json();
  },

  async deleteBrochure(brandId) {
    return apiClient.delete(`/brands/${brandId}/brochure`);
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