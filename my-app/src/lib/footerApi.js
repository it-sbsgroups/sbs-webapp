// =============================================================================
// FILE: src/lib/footerApi.js  (FULL REPLACEMENT — Phase 1 consolidation)
// The old /api/footer endpoint is gone. Footer.jsx still imports this file
// unchanged — redirected internals to the unified site-config API.
// =============================================================================
import apiClient from './client';
const unwrap = (r) => (r?.data ?? r);

const footerApi = {
  async get() {
    try { return unwrap(await apiClient.get('/site-config/footer')) || {}; }
    catch { return {}; }
  },
  async save(config) {
    return unwrap(await apiClient.put('/site-config/footer', config));
  },
};
export default footerApi;