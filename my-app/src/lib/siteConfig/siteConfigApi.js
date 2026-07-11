import apiClient from "@/lib/client";

function apiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined")
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  return "http://localhost:4000/api";
}

async function fetchSection(key) {
  try {
    const r = await apiClient.get(`/site/${key}`);
    return r?.data ?? r ?? {};
  } catch {
    return {};
  }
}

async function saveSection(key, data) {
  const r = await apiClient.put(`/site/${key}`, data);
  return r?.data ?? r;
}

async function uploadRaw(file, folder = "branding") {
  const form = new FormData();
  form.append("file", file);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("sbs_auth_token") : null;
  const res = await fetch(`${apiBase()}/uploads/raw?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message || "Upload failed");
  }
  const d = await res.json();
  return d.url;
}

async function uploadFavicon(file) {
  const isIco = file.name.toLowerCase().endsWith(".ico") || file.type === "image/x-icon";
  if (!isIco) throw new Error("Favicon must be a .ico file.");
  const form = new FormData();
  form.append("file", file);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("sbs_auth_token") : null;
  const res = await fetch(`${apiBase()}/site/upload/favicon`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message || "Favicon upload failed");
  }
  const d = await res.json();
  return d.url;
}

async function uploadUncompressed(file, folder) {
  return uploadRaw(file, folder);
}

const location = {
  async getStates() {
    const r = await apiClient.get("/location/states");
    return r?.data ?? r ?? [];
  },
  async getCities(stateId) {
    const r = await apiClient.get(`/location/cities?stateId=${stateId}`);
    return r?.data ?? r ?? [];
  },
  async getPincodes(cityId) {
    const r = await apiClient.get(`/location/pincodes?cityId=${cityId}`);
    return r?.data ?? r ?? [];
  },
  async lookupByPincode(pincode) {
    const r = await apiClient.get(`/location/lookup?pincode=${pincode}`);
    return r?.data ?? r ?? [];
  },
  async lookupByCity(cityId) {
    const r = await apiClient.get(`/location/lookup?cityId=${cityId}`);
    return r?.data ?? r;
  },
};

const siteConfigApi = {
  getBranding:  () => fetchSection("branding"),
  getHeader:    () => fetchSection("header"),
  getContact:   () => fetchSection("contact"),
  getAbout:     () => fetchSection("about"),
  getApiKeys:   () => fetchSection("apiKeys"),
  getFounders:  () => fetchSection("founders"),
  getFont:      () => fetchSection("font"),
  getHomeAbout:    () => fetchSection("homeAbout"),
  getHomePrinciples:  () => fetchSection("homePrinciples"),
  getAuthorizedNetwork: () => fetchSection("AuthorizedNetwork"),
  getIndustriesManager: () => fetchSection("IndustriesManager"),
  getProtectionProven: () => fetchSection("ProtectionProven"),
  getWhyContact: () => fetchSection("WhyContact"),
  getPartnershipAdvantages: () => fetchSection("PartnershipAdvantages"),
  getPartnershipWork: () => fetchSection("PartnershipWork"),
  getAll:       async () => { try { const r = await apiClient.get("/site"); return r?.data ?? r ?? {}; } catch { return {}; } },

  saveBranding:       (d) => saveSection("branding", d),
  saveHeader:         (d) => saveSection("header", d),
  saveContact:        (d) => saveSection("contact", d),
  saveAbout:          (d) => saveSection("about", d),
  saveApiKeys:        (d) => saveSection("apiKeys", d),
  saveFounders:       (d) => saveSection("founders", d),
  saveFont:           (d) => saveSection("font", d),
  saveHomeAbout:      (d) => saveSection("homeAbout", d),
  saveHomePrinciples: (d) => saveSection("homePrinciples", d),
  saveAuthorizedNetwork:    (d) => saveSection("AuthorizedNetwork", d),
  saveIndustriesManager:    (d) => saveSection("IndustriesManager", d),
  saveProtectionProven:    (d) => saveSection("ProtectionProven", d),
  saveWhyContact:    (d) => saveSection("WhyContact", d),
  savePartnershipAdvantages:    (d) => saveSection("PartnershipAdvantages", d),
  savePartnershipWork:    (d) => saveSection("PartnershipWork", d),

  uploadLogo:         (file) => uploadUncompressed(file, "branding/logo"),
  uploadFavicon,
  uploadFounder:      (file) => uploadUncompressed(file, "branding/founder"),
  uploadCoFounder:    (file) => uploadUncompressed(file, "branding/cofounder"),
  uploadJourney:      (file) => uploadUncompressed(file, "about/journey"),

  location,
};

export default siteConfigApi;

export const DEFAULT_BRANDING = {
  companyName: "SBS Groups",
  tagline: "Industrial Solutions",
  logoUrl: "",
  faviconUrl: "",
};

export const DEFAULT_HEADER = {
  navs: [],
  loginButton: { enabled: true, label: "Login", link: "/login" },
};

export const DEFAULT_CONTACT = {
  address: { line1: "", city: "", state: "", country: "India", pincode: "" },
  phones: [],      // [{ label, number, isTel: true }]
  emails: [],      // [{ label, address, isMailto: true }]
  quickLinks: [],  // [{ name, link }]
  servicesLinks: [],
  social: [],      // [{ platform, icon, link }]
  newsletter: { enabled: true },
  copyright: "© {year} SBS Groups. All rights reserved.",
};

export const DEFAULT_ABOUT = {
  richContent: "",           // Free rich text (text only, no images)
  journey: { images: [] },  // [{ url, caption, year }]
  visionMission: [],        // [{ type: 'vision'|'mission', icon, points: [{ heading, description }] }]
  coreValues: [],           // max 5 (extendable by 3/5); [{ title, description }]
};

export const DEFAULT_API_KEYS = {
  cloudinary: { cloudName: "", apiKey: "", apiSecret: "" },
  gemini:     { apiKey: "" },
  jwt:        { secret: "" },
  erp:        { apiKey: "", apiSecret: "" },
  whatsapp:   { accessToken: "", phoneNumberId: "" },
};

export const DEFAULT_FOUNDERS = {
  founder:   { name: "", designation: "Founder", photoUrl: "", phones: [], emails: [] },
  coFounder: { name: "", designation: "Co-Founder", photoUrl: "", phones: [], emails: [] },
};

export const DEFAULT_FONT = {
  family: "Inter",
  googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
};

// Popular Google Fonts list for the font selector
export const GOOGLE_FONTS = [
  { name: "Inter",       url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
  { name: "Roboto",      url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" },
  { name: "Poppins",     url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" },
  { name: "Nunito",      url: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" },
  { name: "Lato",        url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" },
  { name: "Montserrat",  url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" },
  { name: "Open Sans",   url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap" },
  { name: "Raleway",     url: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap" },
  { name: "Outfit",      url: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" },
  { name: "DM Sans",     url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" },
  { name: "Plus Jakarta Sans", url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
  { name: "Geist",       url: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap" },
];

export const SOCIAL_PLATFORMS = [
  { name: "Facebook",   icon: "facebook", placeholder: "https://facebook.com/yourpage" },
  { name: "Instagram",  icon: "photo_camera", placeholder: "https://instagram.com/yourhandle" },
  { name: "Twitter / X", icon: "alternate_email", placeholder: "https://x.com/yourhandle" },
  { name: "YouTube",    icon: "play_circle", placeholder: "https://youtube.com/@yourchannel" },
  { name: "LinkedIn",   icon: "work", placeholder: "https://linkedin.com/company/yourcompany" },
  { name: "WhatsApp",   icon: "chat", placeholder: "https://wa.me/91XXXXXXXXXX" },
  { name: "Telegram",   icon: "send", placeholder: "https://t.me/yourhandle" },
  { name: "Pinterest",  icon: "interests", placeholder: "https://pinterest.com/yourprofile" },
  { name: "Threads",    icon: "thread_unread", placeholder: "https://threads.net/@yourhandle" },
  { name: "Custom",     icon: "link", placeholder: "https://example.com" },
];