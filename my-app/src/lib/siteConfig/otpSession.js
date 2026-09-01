// Single source of truth for the verified Site-Config OTP session token.
//
// Every PUT/POST/DELETE the admin makes to a SiteConfigOtpGuard-protected
// backend route (all of /site/:key, /header, /footer, /company) must carry
// this as the `x-otp-token` header, or the backend rejects it with 401 even
// for a fully logged-in ADMIN/FOUNDER/COFOUNDER account. Kept in
// sessionStorage (survives a refresh, clears when the tab closes) so it
// roughly tracks the server's 30-minute OTP session window.

const OTP_STORAGE_KEY = "sbs_site_config_otp_id";

export function getOtpToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(OTP_STORAGE_KEY);
}

export function setOtpToken(otpId) {
  if (typeof window === "undefined") return;
  if (otpId) sessionStorage.setItem(OTP_STORAGE_KEY, otpId);
  else sessionStorage.removeItem(OTP_STORAGE_KEY);
}

export function isOtpVerified() {
  return !!getOtpToken();
}

export function clearOtpToken() {
  setOtpToken(null);
}

// Spread the result into the `headers` option of any apiClient.put/post/
// patch/delete call that hits a SiteConfigOtpGuard-protected route:
//   apiClient.put(`/footer`, data, { headers: otpHeaders() })
// Returns {} (no-op) when there's no verified session yet, so the backend's
// existing "OTP verification required" 401 still fires with a clear message
// instead of silently sending a blank/garbage header.
export function otpHeaders() {
  const token = getOtpToken();
  return token ? { "x-otp-token": token } : {};
}
