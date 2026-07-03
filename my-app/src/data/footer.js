// src/data/footer.js

export const initialFooterData = {
  logoUrl: "", // Empty string activates the text fallback (Web3 design)
  brandText: "SBS",
  brandHighlight: "groups",
  address: "SUPERB BEARING STORES, Main Road, Tali Waidhan, Near Honda Showroom, Singrauli, M.P. 486886 (India)",
  showAddress: true,
  contacts: {
    mobile1: { show: true, type: "text", label: "G K Jaiswal (Aman)", value: "", icon: "FaUser" },
    mobile2: { show: true, type: "tel", label: "Mobile 1", value: "9826808412", icon: "FaPhone" },
    email1: { show: true, type: "mailto", label: "Admin Email", value: "admin@sbsgroups.co.in", icon: "FaEnvelope" },
    email2: { show: false, type: "whatsapp", label: "WhatsApp Chat", value: "8827559826", icon: "FaWhatsapp" },
  },
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { id: "1", name: "Home", href: "/" },
    { id: "2", name: "About Us", href: "/about" },
    { id: "3", name: "Products", href: "/products" },
  ],
  servicesTitle: "Services",
  servicesLinks: [
    { id: "1", name: "Authorised Distributor", href: "/services/distributor" },
    { id: "2", name: "Support", href: "/support" },
  ],
  newsletterSettings: {
    enabled: true,
    triggerScrollPercentage: 20,
    triggerClicks: 3,
    triggerWaitTime: 3,
  }
};

export const initialSocialLinks = [
  { id: "s1", platform: "Facebook", url: "https://facebook.com", iconType: "fb", targetBlank: true },
  { id: "s2", platform: "LinkedIn", url: "https://linkedin.com", iconType: "in", targetBlank: true },
  { id: "s3", platform: "Instagram", url: "https://instagram.com", iconType: "ig", targetBlank: true },
];