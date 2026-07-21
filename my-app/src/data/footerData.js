// src/data/footerData.js

const footerData = {
  // ---------- LOGO & BRANDING ----------
  logoUrl: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png",
  brandText: "SBS GROUP",
  brandHighlight: "INDUSTRIAL",

  // ---------- ADDRESS ----------
  showAddress: true,
  address: "Industrial Area, Singrauli, Madhya Pradesh - 486886",

  // ---------- CONTACT DETAILS ----------
  contacts: {
    mobile1: {
      show: true,
      label: "Sales Desk",
      type: "tel",
      value: "+91-12345-67890",
      icon: "FaPhone",
    },
    mobile2: {
      show: true,
      label: "Support Line",
      type: "tel",
      value: "+91-98765-43210",
      icon: "FaPhone",
    },
    email1: {
      show: true,
      label: "Business Mail",
      type: "mailto",
      value: "info@sbsgroups.co.in",
      icon: "FaEnvelope",
    },
    email2: {
      show: true,
      label: "Sales Inquiry",
      type: "mailto",
      value: "sales@sbsgroups.co.in",
      icon: "FaEnvelope",
    },
    whatsapp: {
      show: true,
      label: "WhatsApp",
      type: "whatsapp",
      value: "911234567890",
      icon: "FaWhatsapp",
    },
  },

  // ---------- QUICK LINKS ----------
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { id: "ql1", name: "Home", href: "/" },
    { id: "ql2", name: "Products", href: "/products" },
    { id: "ql3", name: "Brands", href: "/brands" },
    { id: "ql4", name: "About Us", href: "/about" },
    { id: "ql5", name: "Contact", href: "/contact" },
    { id: "ql6", name: "Distributors", href: "/distributors" },
  ],

  // ---------- SERVICES LINKS ----------
  servicesLinks: [
    { id: "s1", name: "Clients", href: "/clients" },
    { id: "s2", name: "Testimonials", href: "/testimonials" },
    { id: "s3", name: "News & Media", href: "/news" },
    { id: "s4", name: "Employees Portal", href: "/employees" },
    { id: "s5", name: "Careers", href: "/careers" },
  ],

  // ---------- NEWSLETTER SETTINGS ----------
  newsletterSettings: {
    enabled: true,
    title: "Stay Updated",
    description: "Subscribe to our newsletter for latest products and industrial insights.",
    popupDelay: 5000, // ms before popup appears
    showOnScroll: true,
    scrollPercentage: 40,
  },

  // ---------- SOCIAL LINKS ----------
  socialLinks: [
    {
      id: "soc1",
      platform: "Facebook",
      url: "https://facebook.com/sbsgroups",
      iconType: "fb",
      targetBlank: true,
    },
    {
      id: "soc2",
      platform: "LinkedIn",
      url: "https://linkedin.com/company/sbsgroups",
      iconType: "in",
      targetBlank: true,
    },
    {
      id: "soc3",
      platform: "Instagram",
      url: "https://instagram.com/sbsgroups",
      iconType: "ig",
      targetBlank: true,
    },
    {
      id: "soc4",
      platform: "YouTube",
      url: "https://youtube.com/@sbsgroups",
      iconType: "yt",
      targetBlank: true,
    },
    {
      id: "soc5",
      platform: "WhatsApp",
      url: "https://wa.me/911234567890",
      iconType: "wa",
      targetBlank: true,
    },
  ],

  // ---------- FOOTER STYLING ----------
  styling: {
    backgroundColor: "#030712",
    textColor: "#94A3B8",
    accentColor: "#A3E635", // lime-400
    borderColor: "rgba(255,255,255,0.02)",
    fontFamily: "mono",
  },

  // ---------- BOTTOM BAR ----------
  bottomBar: {
    copyrightText: "© 2026 SBS Group. Autonomous Logistics Core Node.",
    statusText: "Protocol Status: Secure",
  },
};

export default footerData;