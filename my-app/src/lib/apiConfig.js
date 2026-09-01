export function getApiBaseUrl() {
  // In the browser we must use the public URL (NEXT_PUBLIC_API_URL) — the
  // browser has no route to 127.0.0.1 on the server.
  if (typeof window !== 'undefined' && window.location?.origin) {
    const configuredPublicUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
    if (configuredPublicUrl) return configuredPublicUrl.replace(/\/+$/, '');
    return `${window.location.origin.replace(/\/+$/, '')}/api`;
  }

  // On the server (route handlers, SSR, middleware) always prefer the
  // internal address (API_URL) over the public domain. Calling the public
  // domain/IP from the server itself is a "hairpin" self-call that this
  // VPS's firewall/nginx setup does not reliably support — the request
  // just hangs with no error instead of failing fast, which is what broke
  // admin login. Never let a server-side call leave the machine.
  const internalApiUrl = (process.env.API_URL || '').trim();
  if (internalApiUrl) return internalApiUrl.replace(/\/+$/, '');

  const configuredPublicUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (configuredPublicUrl) return configuredPublicUrl.replace(/\/+$/, '');

  return 'http://127.0.0.1:4000/api';
}

export function getFrontendPort() {
  const rawPort = process.env.PORT || '3000';
  const port = Number(rawPort);
  return Number.isFinite(port) && port > 0 ? port : 3000;
}

export const API_BASE_URL = getApiBaseUrl();
