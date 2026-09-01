import apiClient from '@/lib/client';

const unwrap = (r) => r?.data ?? r ?? {};

// ── Generic section helpers ───────────────────────────────────────────────────

async function getSection(key) {
  try { return unwrap(await apiClient.get(`/site-config/${key}`)) || {}; }
  catch { return {}; }
}

async function saveSection(key, data) {
  return unwrap(await apiClient.put(`/site-config/${key}`, data));
}

// ── Public: load all sections in one request (homepage, footer, header) ──────

async function getAll() {
  try { return unwrap(await apiClient.get('/site-config')) || {}; }
  catch { return {}; }
}

// ── Exported API ─────────────────────────────────────────────────────────────

const siteConfigApi = {
  getAll,

  // Individual getters
  getBranding:    () => getSection('branding'),
  getNavigation:  () => getSection('navigation'),
  getContact:     () => getSection('contact'),
  getAbout:       () => getSection('about'),
  getSocial:      () => getSection('social'),
  getNewsletter:  () => getSection('newsletter'),
  getFooter:      () => getSection('footer'),
  getFont:        () => getSection('font'),
  getApiKeys:     () => getSection('apiKeys'),
  getFounders:    () => getSection('founders'),

  // Legacy aliases so existing footer/header/company imports still work
  // without touching every call site immediately:
  getHeader:      () => getSection('navigation'),
  getFooterLegacy:() => getSection('footer'),
  getCompany:     () => getSection('branding'),

  // Individual savers
  saveBranding:   (d) => saveSection('branding',   d),
  saveNavigation: (d) => saveSection('navigation', d),
  saveContact:    (d) => saveSection('contact',    d),
  saveAbout:      (d) => saveSection('about',      d),
  saveSocial:     (d) => saveSection('social',     d),
  saveNewsletter: (d) => saveSection('newsletter', d),
  saveFooter:     (d) => saveSection('footer',     d),
  saveFont:       (d) => saveSection('font',       d),
  saveApiKeys:    (d) => saveSection('apiKeys',    d),
  saveFounders:   (d) => saveSection('founders',   d),
};

export default siteConfigApi;

// ── Backward-compat named exports ─────────────────────────────────────────────
// So files that do `import headerApi from '@/lib/headerApi'` still work
// after you point them here:
export const headerApi = {
  get:  () => siteConfigApi.getNavigation(),
  save: (d) => siteConfigApi.saveNavigation(d),
};
export const footerApi = {
  get:  () => siteConfigApi.getFooter(),
  save: (d) => siteConfigApi.saveFooter(d),
};
export const companyApi = {
  get:  () => siteConfigApi.getBranding(),
  save: (d) => siteConfigApi.saveBranding(d),
};