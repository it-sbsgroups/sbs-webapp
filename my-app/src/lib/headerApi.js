// =============================================================================
// FILE: src/lib/headerApi.js  (FULL REPLACEMENT — Phase 1 consolidation)
// The old /api/header endpoint is gone. Header.jsx still imports this file
// unchanged — we just redirect its internals to the unified site-config API
// so the component requires zero edits.
//
// AUDIT FIX (request 6): this previously called `/site-config/navigation`,
// which matches NO backend route — the site-config controller is mounted at
// `/site` (not `/site-config`), and its key whitelist has `'header'`, not
// `'navigation'`. Every admin Logo/Navigation/Login save was silently
// failing, and the public header always fell back to bundled dummy data.
// Both sides (admin managers via headerSections.js, and the public Header
// component) already call through this file unchanged — fixing the URL here
// reconnects the whole chain with no other edits needed.
// =============================================================================
import apiClient from './client';
const unwrap = (r) => (r?.data ?? r);

const headerApi = {
  async get() {
    try { return unwrap(await apiClient.get('/site/header')) || {}; }
    catch { return {}; }
  },
  async save(config) {
    return unwrap(await apiClient.put('/site/header', config));
  },
};
export default headerApi;