"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
  FaWhatsapp,
  FaTelegram,
  FaPinterestP,
  FaThreads,
  FaLink,
} from "react-icons/fa6";
import toast from "react-hot-toast";

import headerApi from "@/lib/headerApi";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import footerApi from "@/lib/footerApi";
import subscribersApi from "@/lib/subscribersApi";

// Helper to extract the first value from an array
const firstValue = (arr) => {
  if (!arr || arr.length === 0) return "";
  const first = arr[0];
  return typeof first === "string" ? first : first.value || first.address || first.number || "";
};

// Default settings – all in one place, easy to change later
const DEFAULT_CONFIG = {
  branding: {
    companyName: "SBS Group",
    logoUrl: "",
    tagline: "",
  },
  contact: {
    address: { line1: "", city: "", state: "", pincode: "", country: "" },
    phones: [],
    emails: [],
  },
  founders: {
    founder: { name: "", phones: [], emails: [] },
    coFounder: { name: "", phones: [], emails: [] },
  },
  footer: {
    quickLinks: [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Products", href: "/products" },
      { name: "Download Brochures", href: "/brochures" },
      { name: "Valuable Employees", href: "/employees" },
      { name: "Growing Partners", href: "/clients" },
      { name: "Latest Updates", href: "/news" },
      { name: "Certificates", href: "/certificates" },
    ],
    servicesLinks: [
      { name: "Authorised Distributor", href: "/brands" },
      { name: "Own Brands", href: "/own-brands" },
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ's", href: "/contact/faqs" },
      { name: "Read Testimonials", href: "/testimonials" },
      { name: "Search", href: "/search" },
    ],
    socialLinks: [],
  },
  newsletterEnabled: true,
  // ----- LOGO SIZE INCREASED HERE -----
  logo: {
    width: 300,                // increased width
    height: 216,               // increased height (aspect ratio)
    className: "h-50 w-auto object-contain sm:h-24", // larger height: 5rem mobile, 6rem desktop
  },
  socialIconMap: {
    facebook: FaFacebookF,
    fb: FaFacebookF,
    linkedin: FaLinkedinIn,
    in: FaLinkedinIn,
    instagram: FaInstagram,
    ig: FaInstagram,
    youtube: FaYoutube,
    yt: FaYoutube,
    "twitter / x": FaXTwitter,
    "twitter/x": FaXTwitter,
    twitter: FaXTwitter,
    x: FaXTwitter,
    whatsapp: FaWhatsapp,
    wa: FaWhatsapp,
    telegram: FaTelegram,
    pinterest: FaPinterestP,
    threads: FaThreads,
    custom: FaLink,
    link: FaLink,
  },
};

// Default icon for a social entry whose platform/icon string doesn't match
// any key above, so a link never silently disappears from the footer.
const DEFAULT_SOCIAL_ICON = FaLink;

export default function Footer() {
  const [data, setData] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [headerData, contactData, foundersData, footerData] = await Promise.all([
          headerApi.get(),
          siteConfigApi.getContact(),
          siteConfigApi.getFounders(),
          footerApi.get(),
        ]);

        // Merge API data with defaults
        setData({
          ...DEFAULT_CONFIG,
          branding: {
            ...DEFAULT_CONFIG.branding,
            companyName: headerData?.branding?.companyName || DEFAULT_CONFIG.branding.companyName,
            logoUrl: headerData?.branding?.logoUrl || DEFAULT_CONFIG.branding.logoUrl,
            tagline: headerData?.branding?.tagline || DEFAULT_CONFIG.branding.tagline,
          },
          contact: {
            ...DEFAULT_CONFIG.contact,
            address: contactData?.address || DEFAULT_CONFIG.contact.address,
            phones: contactData?.phones || DEFAULT_CONFIG.contact.phones,
            emails: contactData?.emails || DEFAULT_CONFIG.contact.emails,
          },
          founders: {
            founder: foundersData?.founder || DEFAULT_CONFIG.founders.founder,
            coFounder: foundersData?.coFounder || DEFAULT_CONFIG.founders.coFounder,
          },
          footer: {
            ...DEFAULT_CONFIG.footer,
            quickLinks: footerData?.quickLinks || DEFAULT_CONFIG.footer.quickLinks,
            servicesLinks: footerData?.servicesLinks || DEFAULT_CONFIG.footer.servicesLinks,
            // Site Config → "Contact & Footer" tab → "Social Media Handles"
            // (contact.social, saved via siteConfigApi.saveContact) is the
            // only admin screen that actually persists social links. The
            // dedicated footer.socialLinks field has no editor wired into
            // any admin route, so it's kept only as a legacy fallback.
            socialLinks:
              contactData?.social?.length > 0
                ? contactData.social
                : footerData?.socialLinks || DEFAULT_CONFIG.footer.socialLinks,
          },
          newsletterEnabled: footerData?.newsletterSettings?.enabled ?? DEFAULT_CONFIG.newsletterEnabled,
        });
      } catch (error) {
        console.error("Failed to load footer data:", error);
        toast.error("Could not load footer information.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setSubscribing(true);
    try {
      await subscribersApi.subscribe({ email: email.trim() });
      toast.success("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      toast.error(error.message || "Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  // Build address string
  const addr = data.contact.address;
  const addressParts = [addr.line1, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  // --- Phones: contact + co‑founder's first phone (deduplicated) ---
  const contactPhones = data.contact.phones
    .map((p) => p.number || p.value || p)
    .filter(Boolean);
  const coFounderPhone = firstValue(data.founders.coFounder?.phones);
  const phoneSet = new Set(contactPhones);
  if (coFounderPhone) phoneSet.add(coFounderPhone);
  const allPhones = Array.from(phoneSet);

  // --- Emails: contact + co‑founder's first email (deduplicated) ---
  const contactEmails = data.contact.emails
    .map((e) => e.address || e.value || e)
    .filter(Boolean);
  const coFounderEmail = firstValue(data.founders.coFounder?.emails);
  const emailSet = new Set(contactEmails);
  if (coFounderEmail) emailSet.add(coFounderEmail);
  const allEmails = Array.from(emailSet);

  // Social links (from Site Config's Social Media Handles editor)
  const socialLinks = (data.footer.socialLinks || []).filter(
    (s) => s?.link || s?.url
  );
  const hasSocial = socialLinks.length > 0;

  // Use default links if API didn't provide
  const quickLinks = data.footer.quickLinks;
  const servicesLinks = data.footer.servicesLinks;

  if (loading) {
    return (
      <footer className="bg-gradient-to-b from-[#0d5fd3] to-[#103b87] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-sm text-white/70">Loading footer...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-r from-[#006ff0] to-[#042058] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding & Contact */}
          <div>
            {data.branding.logoUrl ? (
              <div className="mb-6">
                <Image
                  src={data.branding.logoUrl}
                  alt={data.branding.companyName}
                  width={DEFAULT_CONFIG.logo.width}
                  height={DEFAULT_CONFIG.logo.height}
                  priority
                  className={`${DEFAULT_CONFIG.logo.className} bg-white`}
                />
              </div>
            ) : (
              <div className="text-2xl font-bold mb-4">{data.branding.companyName}</div>
            )}
            <div className="space-y-3 text-sm leading-relaxed">
              {fullAddress && (
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{fullAddress}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  {data.founders.coFounder.name && <p>{data.founders.coFounder.name}</p>}
                  {allPhones.map((phone, idx) => (
                    <span key={idx}>
                      <a href={`tel:${phone}`}>+91-{phone} </a>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  {allEmails.map((email, idx) => (
                    <p key={idx}>
                      <a href={`mailto:${email}`}>{email} </a>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-l">
              {quickLinks.map((link) => (
                <li key={link.href || link.name}>
                  <Link href={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-l">
              {servicesLinks.map((link) => (
                <li key={link.href || link.name}>
                  {link.href ? <Link href={link.href}>{link.name}</Link> : link.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Connect */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-6">
              {hasSocial ? (
                socialLinks.map((social) => {
                  const Icon =
                    DEFAULT_CONFIG.socialIconMap[social.platform?.toLowerCase()] ||
                    DEFAULT_CONFIG.socialIconMap[social.iconType?.toLowerCase()] ||
                    DEFAULT_CONFIG.socialIconMap[social.icon?.toLowerCase()] ||
                    DEFAULT_SOCIAL_ICON;
                  const href = social.link || social.url;
                  return (
                    <a
                      key={social.id || href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform || "Social link"}
                      className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition"
                    >
                      <Icon className="text-sm" />
                    </a>
                  );
                })
              ) : (
                // Static fallback social icons (if no socialLinks provided)
                <>
                  <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                    <FaFacebookF className="text-sm" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                    <FaLinkedinIn className="text-sm" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                    <FaInstagram className="text-sm" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                    <FaYoutube className="text-sm" />
                  </a>
                </>
              )}
            </div>
            {data.newsletterEnabled && (
              <>
                <p className="text-sm mb-2">Subscribe to our newsletter</p>
                <form onSubmit={handleSubscribe} className="flex overflow-hidden rounded-lg">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white text-black outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="bg-blue-500 hover:bg-blue-600 px-4 text-sm disabled:opacity-60"
                  >
                    {subscribing ? "..." : "Subscribe"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-sm text-white/90 text-center">
          <span>
            © {new Date().getFullYear()} {data.branding.companyName}. All rights reserved.
          </span>
          <nav className="flex items-center gap-4 text-white/80">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/terms-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/admin/dashboard" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" >
              Admin Panel
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}