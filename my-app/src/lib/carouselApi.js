import apiClient from './client';

const unwrap = (r) => (Array.isArray(r) ? r : r?.data ?? r);

// First-class columns on the backend CarouselSlide model. Every other slide field
// (gradientColor, badgeStyle, titleStyle, descriptionStyle, ctaButtonStyle, …)
// round-trips losslessly through the `styles` JSON column — otherwise the backend
// ValidationPipe (whitelist) would strip those undeclared top-level fields.
const FIRST_CLASS = [
  'order', 'isActive', 'nextSlideIn', 'mediaType', 'mediaUrl', 'videoLoop',
  'videoSound', 'solidColor', 'layoutType', 'badge', 'title', 'description',
  'ctaText', 'ctaLink', 'ctaOpenInNewTab',
];

// flat editor slide  →  { ...firstClass, styles }
function toApi(slide = {}) {
  const out = {};
  const styles = {};
  for (const [k, v] of Object.entries(slide)) {
    if (k === 'id' || k === 'createdAt' || k === 'updatedAt') continue;
    if (FIRST_CLASS.includes(k)) out[k] = v;
    else styles[k] = v;
  }
  out.styles = styles;
  return out;
}

// backend row  →  flat editor slide (styles spread back to the top level)
function fromApi(row = {}) {
  const { styles, createdAt, updatedAt, ...rest } = row;
  return { ...(styles || {}), ...rest };
}

const carouselApi = {
  async getPublic() {
    const r = unwrap(await apiClient.get('/carousel/public')) || {};
    return { slides: (r.slides || []).map(fromApi), settings: r.settings || {} };
  },
  async getSlides() {
    try { return (unwrap(await apiClient.get('/carousel/slides')) || []).map(fromApi); }
    catch (e) { console.error('carousel getSlides failed:', e); return []; }
  },
  async createSlide(data) { return fromApi(unwrap(await apiClient.post('/carousel/slides', toApi(data)))); },
  async updateSlide(id, data) { return fromApi(unwrap(await apiClient.put(`/carousel/slides/${id}`, toApi(data)))); },
  async deleteSlide(id) { return apiClient.delete(`/carousel/slides/${id}`); },
  async toggleSlide(id) { return fromApi(unwrap(await apiClient.put(`/carousel/slides/${id}/toggle`))); },
  async reorder(order) { return (unwrap(await apiClient.put('/carousel/slides/reorder', { order })) || []).map(fromApi); },
  async getSettings() { return unwrap(await apiClient.get('/carousel/settings')); },
  async updateSettings(data) { return unwrap(await apiClient.put('/carousel/settings', data)); },
};

export default carouselApi;
export { toApi, fromApi };
