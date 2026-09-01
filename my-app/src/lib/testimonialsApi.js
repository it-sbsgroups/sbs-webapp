import apiClient from './client';

const unwrap = (r) => (Array.isArray(r) ? r : r?.data ?? r);

const testimonialsApi = {
  async getAll(status) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    try { return unwrap(await apiClient.get(`/testimonials${q}`)) || []; }
    catch (e) { console.error('testimonials getAll failed:', e); return []; }
  },
  async getPublic() {
    try { return unwrap(await apiClient.get('/testimonials/public')) || []; }
    catch { return []; }
  },
  async updateStatus(id, status) { return unwrap(await apiClient.put(`/testimonials/${id}/status`, { status })); },
  async remove(id) { return apiClient.delete(`/testimonials/${id}`); },
  // passcode flow
  async listPasscodes() {
    try { return unwrap(await apiClient.get('/testimonials/passcodes')) || []; }
    catch { return []; }
  },
  async issuePasscode(data) { return unwrap(await apiClient.post('/testimonials/passcodes', data)); },
  // request a testimonial from an existing Client / Brand record
  async requestForClient(clientId, overrides = {}) {
    return unwrap(await apiClient.post(`/testimonials/request/client/${clientId}`, overrides));
  },
  async requestForBrand(brandId, overrides = {}) {
    return unwrap(await apiClient.post(`/testimonials/request/brand/${brandId}`, overrides));
  },
  // admin-authored, unlinked testimonial (no passcode flow)
  async createManual(data) { return unwrap(await apiClient.post('/testimonials/manual', data)); },
  async deletePasscode(id) { return apiClient.delete(`/testimonials/passcodes/${id}`); },
  async verify(code) { return unwrap(await apiClient.get(`/testimonials/verify/${encodeURIComponent(code)}`)); },
  async submit(data) { return unwrap(await apiClient.post('/testimonials/submit', data)); },
};
export default testimonialsApi;