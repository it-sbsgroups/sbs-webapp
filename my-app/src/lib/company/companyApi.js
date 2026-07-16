import apiClient from "@/lib/client";

const unwrap = (r) => (r?.data ?? r);

// Sensible defaults so the UI always has shape even before anything is saved.
export const DEFAULT_COMPANY = {
  logo: "",
  name: "SBS Groups",
  tagline: "Industrial Solutions",
  about: { title: "About Us", description: "" },
  founder: { name: "", designation: "Founder", photo: "", bio: "" },
  coFounder: { name: "", designation: "Co-Founder", photo: "", bio: "" },
  location: { address: "", city: "", state: "", country: "India", pincode: "", mapLink: "" },
  contacts: { phones: [], emails: [], whatsapp: "" },
  social: { linkedin: "", instagram: "", facebook: "", twitter: "", youtube: "" },
};

async function getSection(key) {
  try { return unwrap(await apiClient.get(`/site-config/${key}`)) || {}; }
  catch { return {}; }
}

const companyApi = {
  async get() {
    // Pull all four sections in parallel and merge into the legacy shape
    const [branding, contact, founders, social] = await Promise.all([
      getSection("branding"),
      getSection("contact"),
      getSection("founders"),
      getSection("social"),
    ]);

    return {
      ...DEFAULT_COMPANY,
      logo: branding.logoUrl || DEFAULT_COMPANY.logo,
      name: branding.companyName || DEFAULT_COMPANY.name,
      tagline: branding.tagline || DEFAULT_COMPANY.tagline,
      founder: founders.founder
        ? { name: founders.founder.name || "", designation: founders.founder.designation || "Founder", photo: founders.founder.photoUrl || "", bio: "" }
        : DEFAULT_COMPANY.founder,
      coFounder: founders.coFounder
        ? { name: founders.coFounder.name || "", designation: founders.coFounder.designation || "Co-Founder", photo: founders.coFounder.photoUrl || "", bio: "" }
        : DEFAULT_COMPANY.coFounder,
      location: contact.address
        ? { address: contact.address.line1 || "", city: contact.address.city || "", state: contact.address.state || "", country: contact.address.country || "India", pincode: contact.address.pincode || "", mapLink: "" }
        : DEFAULT_COMPANY.location,
      contacts: {
        phones: (contact.phones || []).map((p) => p.number).filter(Boolean),
        emails: (contact.emails || []).map((e) => e.address).filter(Boolean),
        whatsapp: (contact.phones || []).find((p) => p.isWhatsapp)?.number || "",
      },
      social: Array.isArray(social)
        ? social.reduce((acc, s) => {
            const key = (s.platform || "").toLowerCase().replace(/[^a-z]/g, "");
            if (key) acc[key] = s.link || "";
            return acc;
          }, { ...DEFAULT_COMPANY.social })
        : DEFAULT_COMPANY.social,
    };
  },

  /**
   * Legacy save() — splits the flat company payload back into the
   * four underlying site-config sections and saves them in parallel.
   */
  async save(details) {
    const tasks = [];

    if (details.logo !== undefined || details.name !== undefined || details.tagline !== undefined) {
      tasks.push(apiClient.put("/site-config/branding", {
        logoUrl: details.logo,
        companyName: details.name,
        tagline: details.tagline,
      }));
    }

    if (details.location) {
      tasks.push(apiClient.put("/site-config/contact", {
        address: {
          line1: details.location.address,
          city: details.location.city,
          state: details.location.state,
          country: details.location.country,
          pincode: details.location.pincode,
        },
        phones: (details.contacts?.phones || []).map((number) => ({ label: "", number, isTel: true })),
        emails: (details.contacts?.emails || []).map((address) => ({ label: "", address, isMailto: true })),
      }));
    }

    if (details.founder || details.coFounder) {
      tasks.push(apiClient.put("/site-config/founders", {
        founder: details.founder ? { name: details.founder.name, designation: details.founder.designation, photoUrl: details.founder.photo } : undefined,
        coFounder: details.coFounder ? { name: details.coFounder.name, designation: details.coFounder.designation, photoUrl: details.coFounder.photo } : undefined,
      }));
    }

    const results = await Promise.all(tasks);
    return unwrap(results[0]);
  },
};

export default companyApi;