// =============================================================================
// FILE: src/lib/faqApi.js
// API client for the FAQ module — matches the rfqApi.js pattern exactly.
// =============================================================================
import apiClient from '@/lib/client';

const faqApi = {
  // ============================================
  // PUBLIC ENDPOINTS (no auth needed)
  // ============================================

  /** GET /faqs — all approved, listed FAQs. Optional search param. */
  async getPublic(search = '') {
    return apiClient.get('/faqs', search ? { search } : {});
  },

  /** GET /faqs/featured — FAQs for the home-page component */
  async getFeatured() {
    return apiClient.get('/faqs/featured');
  },

  /**
   * POST /faqs/ask — user submits a question.
   * @param {{ name: string, email: string, question: string }} data
   */
  async ask(data) {
    return apiClient.post('/faqs/ask', data);
  },

  // ============================================
  // ADMIN ENDPOINTS (JWT required)
  // ============================================

  /**
   * GET /admin/faqs — paginated list with filters.
   * @param {{ status?: 'pending'|'approved'|'all', search?: string, page?: number, pageSize?: number }} params
   */
  async adminGetAll(params = {}) {
    return apiClient.get('/admin/faqs', params);
  },

  /**
   * PATCH /admin/faqs/:id/respond — answer a pending user question.
   * @param {string} id
   * @param {{ answer: string, isListedOnFaqPage: boolean, isFeaturedInComponent: boolean }} data
   */
  async respond(id, data) {
    return apiClient.patch(`/admin/faqs/${id}/respond`, data);
  },

  /**
   * POST /admin/faqs/create — admin creates a new FAQ directly.
   * @param {{ question: string, answer: string, isListedOnFaqPage: boolean, isFeaturedInComponent: boolean }} data
   */
  async adminCreate(data) {
    return apiClient.post('/admin/faqs/create', data);
  },

  /**
   * DELETE /admin/faqs/:id — soft-delete (reject) a FAQ.
   * @param {string} id
   */
  async reject(id) {
    return apiClient.delete(`/admin/faqs/${id}`);
  },
};

export default faqApi;