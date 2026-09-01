import apiClient from './client';

const unwrap = (r) => (Array.isArray(r) ? r : r?.data ?? r);

const clientsApi = {
  async getAll() {
    try { return unwrap(await apiClient.get('/clients')) || []; }
    catch (e) { console.error('clients getAll failed:', e); return []; }
  },
  async getPublic() {
    try { return unwrap(await apiClient.get('/clients/public')) || []; }
    catch (e) { console.error('clients getPublic failed:', e); return []; }
  },
  async getBySlug(slug) { return unwrap(await apiClient.get(`/clients/public/${slug}`)); },
  async create(data) { return unwrap(await apiClient.post('/clients', data)); },
  async update(id, data) { return unwrap(await apiClient.put(`/clients/${id}`, data)); },
  async remove(id) { return apiClient.delete(`/clients/${id}`); },
  async toggle(id) { return unwrap(await apiClient.put(`/clients/${id}/toggle`)); },
};
export default clientsApi;
