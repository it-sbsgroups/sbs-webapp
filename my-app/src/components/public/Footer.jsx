// src/components/public/Footer.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import footerData from "@/data/footerData";
import footerApi from "@/lib/footerApi";
import companyApi from "@/lib/company/companyApi";
import subscribersApi from "@/lib/subscribersApi";
import NewsletterModal from "./NewsletterModal";

// Products column removed from footer per request (matches sbsgroups.co.in layout)

const RenderIcon = ({ name }) => {
  switch (name) {
    case "FaPhone":
      return (
        <svg className="w-3.5 h-3.5 text-lime-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case "FaEnvelope":
      return (
        <svg className="w-3.5 h-3.5 text-lime-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "FaWorkspace":
    case "location":
      return (
        <svg className="w-3.5 h-3.5 text-lime-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "FaWhatsapp":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.966 0c3.178.001 6.169 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.615-5.34 11.962-11.91 11.962l-5.705-.001L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.742.002-2.602-1.01-5.05-2.85-6.892L16.58 5.83c-1.84-1.84-4.288-2.853-6.89-2.855-5.438 0-9.863 4.37-9.866 9.744-.001 1.765.487 3.489 1.411 4.996l-.944 3.448 3.558-.933z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5 text-lime-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

export default function Footer() {
  // ===== DYNAMIC DATA STATE =====
  const [config, setConfig] = useState(footerData);
  const [socials, setSocials] = useState(footerData.socialLinks);
  const [manualEmail, setManualEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("");

  // ===== LOAD SAVED FOOTER FROM API (merge over bundled defaults) =====
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await footerApi.get();
        if (active && cfg && Object.keys(cfg).length) {
          setConfig((prev) => ({ ...prev, ...cfg }));
          if (cfg.socialLinks) setSocials(cfg.socialLinks);
        }
      } catch {
        /* keep bundled defaults */
      }
    })();
    return () => { active = false; };
  }, []);

  // Single logo source: company details override the footer's own logo.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = await companyApi.get();
        if (active && c?.logo) setConfig((prev) => ({ ...prev, logoUrl: c.logo }));
      } catch {
        /* ignore */
      }
    })();
    return () => { active = false; };
  }, []);

  // ===== LISTEN FOR ADMIN UPDATES (LIVE PREVIEW) =====
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.config) setConfig(e.detail.config);
      if (e.detail?.socials) setSocials(e.detail.socials);
    };
    window.addEventListener("footer-admin-update", handleUpdate);
    return () => window.removeEventListener("footer-admin-update", handleUpdate);
  }, []);

  // ===== NEWSLETTER SUBSCRIPTION =====
  const handleManualSubscribe = (e) => {
    e.preventDefault();
    setSubscribeStatus("Connecting location...");

    const trackDetails = { lat: null, lon: null, date: new Date().toLocaleString() };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          trackDetails.lat = pos.coords.latitude;
          trackDetails.lon = pos.coords.longitude;
          finishSubscription(trackDetails);
        },
        () => finishSubscription(trackDetails)
      );
    } else {
      finishSubscription(trackDetails);
    }
  };

  const finishSubscription = async (details) => {
    try {
      await subscribersApi.subscribe({ email: manualEmail });
      setSubscribeStatus("Subscribed ✓");
      localStorage.setItem("sbs_newsletter_subscribed", "true");
      setManualEmail("");
    } catch (e) {
      setSubscribeStatus(e.message || "Failed, try again");
    }
    setTimeout(() => setSubscribeStatus(""), 3000);
  };

  // ===== RENDER CONTACT FIELD =====
  const renderContactField = (item) => {
    if (!item || !item.show) return null;
    return (
      <div className="flex items-start space-x-2.5 text-slate-400 hover:text-slate-300 transition-colors">
        <div className="p-1 bg-white/[0.02] rounded border border-white/5 shrink-0">
          <RenderIcon name={item.icon} />
        </div>
        <div className="text-[12px] leading-tight">
          <span className="block text-[9px] tracking-wider uppercase text-slate-500 font-mono font-medium">{item.label}</span>
          {item.type === "tel" && <a href={`tel:${item.value}`} className="text-slate-300 font-mono font-medium hover:text-lime-400">{item.value}</a>}
          {item.type === "mailto" && <a href={`mailto:${item.value}`} className="text-slate-300 font-mono hover:text-lime-400 underline decoration-white/5">{item.value}</a>}
          {item.type === "whatsapp" && <a href={`https://wa.me/${item.value}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">WhatsApp Portal</a>}
          {item.type === "text" && <p className="text-slate-300 font-medium">{item.value}</p>}
        </div>
      </div>
    );
  };

  return (
    <footer 
      className="w-full pt-16 pb-6 relative overflow-hidden font-sans border-t border-white/[0.02]"
      style={{ 
        backgroundColor: config.styling?.backgroundColor || "#030712",
        color: config.styling?.textColor || "#94A3B8"
      }}
    >
      {/* Premium background mesh glow */}
      <div className="absolute top-0 left-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-lime-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* MAIN MASTER GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: ADDRESS & CONTACT DETAILS */}
          <div className="lg:col-span-5 space-y-5 pr-4">
            {/* DYNAMIC LOGO */}
            {config.logoUrl ? (
              <div className="relative w-32 h-10 filter brightness-110">
                <img src={config.logoUrl} alt="Logo" fill="true" className="object-contain" />
              </div>
            ) : (
              <div className="inline-block">
                <span className="text-base font-bold tracking-tight text-white font-mono uppercase"
                  style={{ fontFamily: config.styling?.fontFamily === "mono" ? "monospace" : config.styling?.fontFamily }}>
                  {config.brandText}
                  <span style={{ color: config.styling?.accentColor || "#A3E635" }}>
                    .{config.brandHighlight}
                  </span>
                </span>
              </div>
            )}

            <div className="space-y-3">
              {/* DYNAMIC ADDRESS */}
              {config.showAddress && (
                <div className="flex items-start space-x-2.5 text-[12px] leading-relaxed"
                  style={{ color: config.styling?.textColor || "#94A3B8" }}>
                  <div className="p-1 bg-white/[0.02] rounded border border-white/5 shrink-0">
                    <RenderIcon name="location" />
                  </div>
                  <p className="text-slate-300/90">{config.address}</p>
                </div>
              )}

              {/* DYNAMIC CONTACTS */}
              {renderContactField(config.contacts?.mobile1)}
              {renderContactField(config.contacts?.mobile2)}
              {renderContactField(config.contacts?.email1)}
              {renderContactField(config.contacts?.email2)}
              {renderContactField(config.contacts?.whatsapp)}

              {/* MAP NAVIGATION LINK */}
              <div className="pt-2">
                <a 
                  href={config.mapLink || "https://maps.google.com/?q=SBS+Group+Singrauli"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 rounded-md px-3 py-1.5 text-[11px] text-slate-300 transition-all font-mono group"
                >
                  <RenderIcon name="FaWorkspace" />
                  <span className="group-hover:text-lime-400">Open Live Map Navigation</span>
                  <span className="text-[9px] text-slate-600">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2: DYNAMIC QUICK LINKS + SERVICES */}
          <div className="lg:col-span-3 grid grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-y-5 lg:pl-4 border-l border-white/[0.02]">
            {/* QUICK LINKS */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono"
                style={{ fontFamily: config.styling?.fontFamily === "mono" ? "monospace" : config.styling?.fontFamily }}>
                {config.quickLinksTitle || "Quick Links"}
              </h4>
              <ul className="space-y-1.5 text-[12px]">
                {config.quickLinks?.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors block text-[11px] truncate">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SERVICES LINKS */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono"
                style={{ fontFamily: config.styling?.fontFamily === "mono" ? "monospace" : config.styling?.fontFamily }}>
                Services
              </h4>
              <ul className="space-y-1.5 text-[12px]">
                {config.servicesLinks?.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors block text-[11px] truncate">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* COLUMN 4: NEWSLETTER + SOCIAL */}
          <div className="lg:col-span-3 space-y-5">
            {/* DYNAMIC NEWSLETTER */}
            {config.newsletterSettings?.enabled !== false && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold tracking-widest text-slate-200 uppercase font-mono"
                  style={{ fontFamily: config.styling?.fontFamily === "mono" ? "monospace" : config.styling?.fontFamily }}>
                  Subscribe
                </h4>
                <form onSubmit={handleManualSubscribe} className="space-y-1.5">
                  <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-md p-0.5 focus-within:border-lime-500/40 transition-all">
                    <input
                      type="email"
                      required
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="Sync business email ID"
                      className="w-full bg-transparent px-2 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <button type="submit" className="bg-slate-800 text-white hover:bg-white hover:text-black font-mono text-[10px] font-bold px-3 py-1.5 rounded transition-all shrink-0">
                      Join
                    </button>
                  </div>
                  {subscribeStatus && <p className="text-[9px] font-mono text-lime-400 pl-1">{subscribeStatus}</p>}
                </form>
              </div>
            )}

            {/* DYNAMIC SOCIAL HUB */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase font-mono"
                style={{ fontFamily: config.styling?.fontFamily === "mono" ? "monospace" : config.styling?.fontFamily }}>
                Network Ecosystem
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {socials?.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target={social.targetBlank ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="h-7 px-2.5 flex items-center justify-center rounded bg-white/[0.01] border border-white/5 text-slate-400 hover:bg-white hover:text-black transition-all duration-200 text-[10px] font-mono"
                    title={social.platform}
                  >
                    {social.iconType === "fb" && "fb"}
                    {social.iconType === "in" && "ln"}
                    {social.iconType === "ig" && "ig"}
                    {social.iconType === "yt" && "yt"}
                    {social.iconType === "wa" && "wa"}
                    {social.iconType === "custom" && "w3"}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* DYNAMIC BOTTOM BAR */}
        <div 
          className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono pt-4 border-t gap-2"
          style={{ 
            color: config.styling?.textColor || "#475569",
            borderColor: config.styling?.borderColor || "rgba(255,255,255,0.03)"
          }}
        >
          <p>{config.bottomBar?.copyrightText || "© 2026 SBS Group. Autonomous Logistics Core Node."}</p>
          <div className="flex space-x-4 text-[9px]">
            <span className="hover:text-slate-400 cursor-pointer">
              {config.bottomBar?.statusText || "Protocol Status: Secure"}
            </span>
          </div>
        </div>

      </div>

      {/* DYNAMIC NEWSLETTER POPUP */}
      {config.newsletterSettings?.enabled !== false && (
        <NewsletterModal settings={config.newsletterSettings} />
      )}
    </footer>
  );
}