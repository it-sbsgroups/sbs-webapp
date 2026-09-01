// =============================================================================
// FILE: src/lib/headerApi.js  (FULL REPLACEMENT — Phase 1 consolidation)
// Header.jsx and the admin Logo/Navigation/Login managers all call through
// this file. It targets /site/header (CentralSiteController's generic
// :key route) rather than the dedicated /header (HeaderController) — both
// read/write the same underlying 'header' SiteConfig row, so either works;
// this one is kept for consistency with the rest of the admin Site Config
// editor, which is entirely /site/:key-based.
//
// AUDIT FIX: `save()` never attached the x-otp-token header, so every header
// save 401'd from SiteConfigOtpGuard regardless of the URL being correct —
// the admin had already verified OTP (SiteConfigOtpGate), but that session
// token was never being read/sent from here.
// =============================================================================
import apiClient from './client';
import { otpHeaders } from './siteConfig/otpSession';
const unwrap = (r) => (r?.data ?? r);

const headerApi = {
  async get() {
    try { return unwrap(await apiClient.get('/site/header')) || {}; }
    catch { return {}; }
  },
  async save(config) {
    return unwrap(await apiClient.put('/site/header', config, { headers: otpHeaders() }));
  },
};
export default headerApi;