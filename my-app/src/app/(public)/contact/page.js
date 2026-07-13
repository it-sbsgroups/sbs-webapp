"use client";

import { useState, useEffect } from "react";
import PinnedFaqsStrip from "@/components/public/PinnedFaqsStrip";
import WhyChooseUsPublic from "@/components/home/WhyChooseUs";
import ContactForm from "@/components/public/ContactForm";
import PinnedHotlines from "@/components/public/PinnedHotlines";
import { Toaster } from "react-hot-toast";
import siteConfigApi from "@/lib/siteConfigApi";

const Icon = ({ n, cls = "" }) => (
  <span className={`material-symbols-outlined leading-none ${cls}`}>{n}</span>
);

function formatAddress(address = {}) {
  return [address.line1, address.city, address.state, address.pincode, address.country]
    .filter(Boolean)
    .join(", ");
}

export default function PublicContactUsPage() {
  const [contact, setContact] = useState({});
  const [branding, setBranding] = useState({});
  const [founders, setFounders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      siteConfigApi.getContact(),
      siteConfigApi.getBranding(),
      siteConfigApi.getFounders(),
    ])
      .then(([c, b, f]) => {
        setContact(c || {});
        setBranding(b || {});
        setFounders(f || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const address = contact.address || {};
  const fullAddress = formatAddress(address);
  const phones = (contact.phones || []).filter((p) => p.number);
  const emails = (contact.emails || []).filter((e) => e.address);

  // Auto-generated map embed from the saved address — no API key required,
  // and it always matches whatever address is currently saved (no more
  // stale/hardcoded coordinates to keep in sync manually).
  const mapEmbedUrl = fullAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
    : null;

  // Leadership direct-lines, built from the founders section so this page
  // never ships placeholder names/numbers again.
  const hotlines = [founders.founder, founders.coFounder]
    .filter((f) => f?.name)
    .map((f) => ({
      name: f.name,
      designation: f.designation,
      phone: f.phones?.[0]?.value || "",
      email: f.emails?.[0]?.value || "",
    }));

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ── HERO — "Get In Touch" (kanexfire.com style) ─────────────────────── */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20 text-center space-y-3">
          <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1 rounded-full uppercase tracking-widest">
            Get In Touch
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Talk to {branding.companyName || "Our Team"}</h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl mx-auto">
            Send us your requirement, reach our registered office directly, or
            speak with our leadership for urgent enquiries.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 md:-mt-10 pb-16 space-y-10">
        {/* ── REGISTERED OFFICE CARD ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Icon n="location_on" cls="text-sm text-blue-900" /> Registered Office
            </p>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">{fullAddress || (loading ? "Loading address…" : "Address coming soon")}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Icon n="call" cls="text-sm text-blue-900" /> Phone
            </p>
            {phones.length > 0 ? (
              phones.map((p, i) => (
                <a key={i} href={p.isTel !== false ? `tel:${p.number}` : undefined} className="block text-sm font-bold text-slate-800 hover:text-blue-800" >
                  {p.label ? `${p.label}: ` : ""}
                  {p.number}
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-400">{loading ? "Loading…" : "Not set"}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Icon n="mail" cls="text-sm text-blue-900" /> Email
            </p>
            {emails.length > 0 ? (
              emails.map((e, i) => (
                <a key={i} href={e.isMailto !== false ? `mailto:${e.address}` : undefined} className="block text-sm font-bold text-slate-800 hover:text-blue-800 break-all" >
                  {e.label ? `${e.label}: ` : ""}
                  {e.address}
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-400">{loading ? "Loading…" : "Not set"}</p>
            )}
          </div>
        </div>

        {/* ── FORM + DIRECT CONTACTS / MAP ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <ContactForm successMessage="Thank you! Your enquiry has been received — our team will get back to you shortly." />
          </div>

          <div className="lg:col-span-5 space-y-6">
            {hotlines.length > 0 && <PinnedHotlines hotlines={hotlines} />}

            {mapEmbedUrl && (
              <div className="w-full h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white p-2">
                <iframe src={mapEmbedUrl} loading="lazy" title="Office location map" className="w-full h-full rounded-2xl border-0" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </div>

        <WhyChooseUsPublic />
        <PinnedFaqsStrip />
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}
