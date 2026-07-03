// =============================================================================
// FILE: src/lib/headerApi.js  (FULL REPLACEMENT — Phase 1 consolidation)
// The old /api/header endpoint is gone. Header.jsx still imports this file
// unchanged — we just redirect its internals to the unified site-config API
// so the component requires zero edits.
// =============================================================================
import apiClient from './client';
const unwrap = (r) => (r?.data ?? r);

const headerApi = {
  async get() {
    try { return unwrap(await apiClient.get('/site-config/navigation')) || {}; }
    catch { return {}; }
  },
  async save(config) {
    return unwrap(await apiClient.put('/site-config/navigation', config));
  },
};
export default headerApi;