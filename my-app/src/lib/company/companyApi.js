// =============================================================================
// FILE: src/lib/company/companyApi.js  (FULL REPLACEMENT)
//
// AUDIT FIX: this used to stitch its data together from FOUR separate
// site-config keys (branding/contact/founders/social) via a URL prefix
// (/site-config/*) that matches no backend route — every field silently
// fell back to its default on load, and save() threw on its first PUT
// attempt. The backend has had a dedicated CompanyController at /company
// this whole time, purpose-built to store exactly the DEFAULT_COMPANY shape
// below "verbatim" (its own doc comment) — this file just never called it.
// It now does, as a single GET/PUT round trip instead of four, and attaches
// the OTP session header CompanyController's PUT route requires.
//
// NOTE ON DATA MODEL: this is a deliberately separate store from the main
// Site Config page's Branding/Contact/Founders sections (which write to the
// 'branding', 'contact', and 'founders' keys respectively). Saving here does
// NOT update those sections, and vice versa — they're two independent
// editors that happen to cover overlapping real-world facts (founder name,
// contact phone, company name). Worth unifying in a follow-up if that's
// causing confusion for whoever edits these day to day.
// =============================================================================
import apiClient from "@/lib/client";
import { otpHeaders } from "@/lib/siteConfig/otpSession";

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

const companyApi = {
  async get() {
    try {
      const data = unwrap(await apiClient.get("/company"));
      if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
        return DEFAULT_COMPANY;
      }
      // Shallow-merge each nested section so a partially-saved document
      // (or one saved before a new field was added) still has full shape.
      return {
        ...DEFAULT_COMPANY,
        ...data,
        about: { ...DEFAULT_COMPANY.about, ...(data.about || {}) },
        founder: { ...DEFAULT_COMPANY.founder, ...(data.founder || {}) },
        coFounder: { ...DEFAULT_COMPANY.coFounder, ...(data.coFounder || {}) },
        location: { ...DEFAULT_COMPANY.location, ...(data.location || {}) },
        contacts: { ...DEFAULT_COMPANY.contacts, ...(data.contacts || {}) },
        social: { ...DEFAULT_COMPANY.social, ...(data.social || {}) },
      };
    } catch {
      return DEFAULT_COMPANY;
    }
  },

  async save(details) {
    return unwrap(await apiClient.put("/company", details, { headers: otpHeaders() }));
  },
};

export default companyApi;
