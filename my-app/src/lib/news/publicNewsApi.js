import apiClient from '../client';

const publicNewsApi = {
  /**
   * Get published posts for public view
   */
  async getPublishedPosts(params = {}) {
    try {
      const cleanParams = {};
      if (params.page) cleanParams.page = Number(params.page);
      if (params.pageSize) cleanParams.pageSize = Number(params.pageSize);
      if (params.categoryId) cleanParams.categoryId = params.categoryId;
      if (params.search) cleanParams.search = params.search;

      const res = await apiClient.get('/news/public/posts', cleanParams);
      if (res?.data && Array.isArray(res.data)) return res;
      if (Array.isArray(res)) return { data: res, meta: { total: res.length } };
      return { data: [], meta: { total: 0 } };
    } catch (error) {
      console.error('Failed to fetch public posts:', error);
      return { data: [], meta: { total: 0 } };
    }
  },

  /**
   * Get single post by slug for detail page
   */
  async getPostBySlug(slug) {
    try {
      const res = await apiClient.get(`/news/public/posts/${slug}`);
      return res?.data || res;
    } catch (error) {
      console.error('Failed to fetch post:', error);
      return null;
    }
  },

  /**
   * Submit a public comment
   */
  async submitComment(data) {
    try {
      const res = await apiClient.post('/news/public/comments', data);
      return res?.data || res;
    } catch (error) {
      console.error('Failed to submit comment:', error);
      throw error;
    }
  },

  /**
   * Get news settings (public)
   */
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

  /**
   * Get latest news for the "Latest News" sidebar widget (replaces old ads slot)
   */
  async getLatestNews(excludeSlug, limit = 5) {
    try {
      const res = await apiClient.get('/news/public/latest', { excludeSlug, limit });
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch latest news:', error);
      return [];
    }
  },

  /**
   * Get news categories
   */
  async getCategories() {
    try {
      const res = await apiClient.get('/news/categories');
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  /**
   * Get news subcategories
   */
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
};

export default publicNewsApi;