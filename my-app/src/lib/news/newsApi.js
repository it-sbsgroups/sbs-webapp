import apiClient from '../client';

const newsApi = {
  // ============================================
  // IMPORT / EXPORT / TEMPLATE
  // ============================================
  async bulkImport(posts) {
    const res = await apiClient.post('/news/bulk-import', { posts });
    return res?.data || res;
  },

  exportCsvUrl() {
    return `${apiClient.baseUrl || ''}/news/export/csv`;
  },

  templateUrl() {
    return `${apiClient.baseUrl || ''}/news/export/template`;
  },

  // ============================================
  // CATEGORIES
  // ============================================
  async getCategories() {
    try {
      const res = await apiClient.get('/news/categories');
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch news categories:', error);
      return [];
    }
  },

  async createCategory(data) {
    const res = await apiClient.post('/news/categories', data);
    return res?.data || res;
  },

  async updateCategory(id, data) {
    const res = await apiClient.put(`/news/categories/${id}`, data);
    return res?.data || res;
  },

  async deleteCategory(id) {
    return apiClient.delete(`/news/categories/${id}`);
  },

  // ============================================
  // SUBCATEGORIES
  // ============================================
  async getSubcategories(categoryId) {
    try {
      const params = categoryId ? { categoryId } : {};
      const res = await apiClient.get('/news/subcategories', params);
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      return [];
    }
  },

  async createSubcategory(data) {
    const res = await apiClient.post('/news/subcategories', data);
    return res?.data || res;
  },

  async updateSubcategory(id, data) {
    const res = await apiClient.put(`/news/subcategories/${id}`, data);
    return res?.data || res;
  },

  async deleteSubcategory(id) {
    return apiClient.delete(`/news/subcategories/${id}`);
  },

  // ============================================
  // POSTS
  // ============================================
  async getPosts(params = {}) {
    try {
      // Ensure numbers are passed as numbers, not strings
      const cleanParams = {};
      if (params.page) cleanParams.page = Number(params.page);
      if (params.pageSize) cleanParams.pageSize = Number(params.pageSize);
      if (params.categoryId) cleanParams.categoryId = params.categoryId;
      if (params.subcategoryId) cleanParams.subcategoryId = params.subcategoryId;
      if (params.status) cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;

      const res = await apiClient.get('/news/posts', cleanParams);
      if (res?.data && Array.isArray(res.data)) return res;
      if (Array.isArray(res)) return { data: res, meta: { total: res.length } };
      return { data: [], meta: { total: 0 } };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return { data: [], meta: { total: 0 } };
    }
  },

  async getPost(id) {
    try {
      const res = await apiClient.get(`/news/posts/${id}`);
      return res?.data || res;
    } catch (error) {
      console.error('Failed to fetch post:', error);
      return null;
    }
  },

  async createPost(data) {
    const res = await apiClient.post('/news/posts', data);
    return res?.data || res;
  },

  async updatePost(id, data) {
    const res = await apiClient.put(`/news/posts/${id}`, data);
    return res?.data || res;
  },

  async deletePost(id) {
    return apiClient.delete(`/news/posts/${id}`);
  },

  async publishPost(id) {
    const res = await apiClient.put(`/news/posts/${id}/publish`);
    return res?.data || res;
  },

  // ============================================
  // COMMENTS
  // ============================================
  async getComments(params = {}) {
    try {
      const cleanParams = {};
      if (params.postId) cleanParams.postId = params.postId;
      if (params.page) cleanParams.page = Number(params.page);
      if (params.pageSize) cleanParams.pageSize = Number(params.pageSize);

      const res = await apiClient.get('/news/comments', cleanParams);
      if (res?.data && Array.isArray(res.data)) return res;
      if (Array.isArray(res)) return { data: res, meta: { total: res.length } };
      return { data: [], meta: { total: 0 } };
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return { data: [], meta: { total: 0 } };
    }
  },

  async updateCommentStatus(id, status) {
    const res = await apiClient.put(`/news/comments/${id}/status`, { status });
    return res?.data || res;
  },

  async softDeleteComment(id) {
    const res = await apiClient.put(`/news/comments/${id}/soft-delete`);
    return res?.data || res;
  },

  async restoreComment(id) {
    const res = await apiClient.put(`/news/comments/${id}/restore`);
    return res?.data || res;
  },

  async hardDeleteComment(id) {
    return apiClient.delete(`/news/comments/${id}`);
  },

  // ============================================
  // SETTINGS
  // ============================================
  async getSettings() {
    try {
      const res = await apiClient.get('/news/settings');
      if (res?.data) return res.data;
      if (res && typeof res === 'object' && !Array.isArray(res)) return res;
      return null;
    } catch (error) {
      console.error('Failed to fetch news settings:', error);
      return null;
    }
  },

  async updateSettings(data) {
    const res = await apiClient.put('/news/settings', data);
    return res?.data || res;
  },
};

export default newsApi;