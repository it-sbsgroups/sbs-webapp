// =============================================================================
// FILE: src/lib/footerApi.js  (FULL REPLACEMENT — Phase 1 consolidation)
// Footer.jsx and the admin Footer manager call through this file.
//
// AUDIT FIX: this was calling `/site-config/footer`, which matches no
// backend route at all (FooterController is mounted at `/footer`; there is
// no `/site-config` prefix anywhere in this app) — every load/save 404'd.
// GETs swallowed the 404 into `{}` so the public footer silently fell back
// to empty data; save() had no try/catch so it threw. Also now attaches the
// x-otp-token header, without which save() would 401 even with the URL
// fixed.
// =============================================================================
import apiClient from './client';
import { otpHeaders } from './siteConfig/otpSession';
const unwrap = (r) => (r?.data ?? r);

const footerApi = {
  async get() {
    try { return unwrap(await apiClient.get('/footer')) || {}; }
    catch { return {}; }
  },
  async save(config) {
    return unwrap(await apiClient.put('/footer', config, { headers: otpHeaders() }));
  },
};
export default footerApi;