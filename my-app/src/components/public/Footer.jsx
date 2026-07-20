"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import toast from "react-hot-toast";

import headerApi from "@/lib/headerApi";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import footerApi from "@/lib/footerApi";
import subscribersApi from "@/lib/subscribersApi";

const firstValue = (arr) => {
  if (!arr || arr.length === 0) return "";
  const first = arr[0];
  return typeof first === "string" ? first : first.value || first.address || first.number || "";
};

export default function Footer() {
  const [data, setData] = useState({
    branding: { companyName: "SBS Group", logoUrl: "", tagline: "" },
    contact: { address: { line1: "", city: "", state: "", pincode: "", country: "" }, phones: [], emails: [] },
    founders: { founder: { name: "", phones: [], emails: [] }, coFounder: { name: "", phones: [], emails: [] } },
    footer: { quickLinks: [], servicesLinks: [], socialLinks: [] },
    newsletterEnabled: true,
  });

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

        setData({
          branding: {
            companyName: headerData?.branding?.companyName || "SBS Group",
            logoUrl: headerData?.branding?.logoUrl || "",
            tagline: headerData?.branding?.tagline || "",
          },
          contact: {
            address: contactData?.address || { line1: "", city: "", state: "", pincode: "", country: "" },
            phones: contactData?.phones || [],
            emails: contactData?.emails || [],
          },
          founders: {
            founder: foundersData?.founder || { name: "", phones: [], emails: [] },
            coFounder: foundersData?.coFounder || { name: "", phones: [], emails: [] },
          },
          footer: {
            quickLinks: footerData?.quickLinks || [],
            servicesLinks: footerData?.servicesLinks || [],
            socialLinks: footerData?.socialLinks || [],
          },
          newsletterEnabled: footerData?.newsletterSettings?.enabled !== false,
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

  // Social links: dynamic or fallback
  const socialLinks = data.footer.socialLinks;
  const hasSocial = socialLinks && socialLinks.length > 0;

  const socialIconMap = {
    facebook: FaFacebookF,
    fb: FaFacebookF,
    linkedin: FaLinkedinIn,
    in: FaLinkedinIn,
    instagram: FaInstagram,
    ig: FaInstagram,
    youtube: FaYoutube,
    yt: FaYoutube,
  };

  const quickLinks = data.footer.quickLinks.length > 0 ? data.footer.quickLinks : [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Our Clients", href: "/clients" },
    { name: "Our Employees", href: "/employees" },
  ];

  const servicesLinks = data.footer.servicesLinks.length > 0 ? data.footer.servicesLinks : [
    { name: "Authorised Distributor", href: "/brands" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ's", href: "/contact/faqs" },
    { name: "Brands", href: "/brands" },
    { name: "Own Brands", href: "own-brands" },
  ];

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
    <footer className="bg-gradient-to-b from-[#0d5fd3] to-[#103b87] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            {data.branding.logoUrl ? (
            <div className="inline-block mb-4">
              <Image
                src={data.branding.logoUrl}
                alt={data.branding.companyName}
                width={160}
                height={160}
                priority
                className="
                  drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]
                  drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]
                "
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
              {/*  */}
              <div className="flex gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  {data.founders.coFounder.name && (
                    <p>{data.founders.coFounder.name}</p>
                  )}
                  {allPhones.map((phone, idx) => (
                    <span key={idx}><a href="tel:{phone}">+91-{phone} </a></span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  {allEmails.map((email, idx) => (
                    <p key={idx}><a href="mailto:{email}">{email} </a></p>
                  ))}
                </div>
              </div>
              {/*  */}
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
                  const Icon = socialIconMap[social.iconType?.toLowerCase()] || socialIconMap[social.platform?.toLowerCase()];
                  if (!Icon) return null;
                  return (
                    <a key={social.id || social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition" >
                      <Icon className="text-sm" />
                    </a>
                  );
                })
              ) : (
                // Static fallback
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
                  <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm bg-white text-black outline-none" required />
                  <button type="submit" disabled={subscribing} className="bg-blue-500 hover:bg-blue-600 px-4 text-sm disabled:opacity-60" >
                    {subscribing ? "..." : "Subscribe"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 text-sm text-white/90 text-center">
          © {new Date().getFullYear()} {data.branding.companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}