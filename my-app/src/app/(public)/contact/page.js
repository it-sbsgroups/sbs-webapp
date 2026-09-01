// src/app/(public)/contact/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import { Toaster } from "react-hot-toast";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import faqApi from "@/lib/faq/api";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import WhyContactUs from "@/components/public/WhyContactUs";
import ContactForm from "@/components/public/ContactForm";
import LazySection from "@/components/shared/LazySection";

import { Phone, MapPin, Mail, ArrowRight } from "lucide-react";

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

  // ---------- FAQ state ----------
  const [faqList, setFaqList] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);

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

  // Fetch real FAQs (public)
  useEffect(() => {
    faqApi.getPublic()
      .then((data) => setFaqList(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setFaqLoading(false));
  }, []);

  const address = contact.address || {};
  const fullAddress = formatAddress(address);
  const phones = (contact.phones || []).filter((p) => p.number);
  const emails = (contact.emails || []).filter((e) => e.address);

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ── BREADCRUMB HEADER ── */}
      <PageBreadcrumb
        pageKey="contact"
        title="Contact Us"
        items={[{ label: "Contact Us" }]}
        backgroundImage="https://res.cloudinary.com/dhrnoojwo/image/upload/v1783946951/contact_nrlvqo.png"
        gradient="from-blue-950 via-blue-900 to-slate-900"
        enableDotGrid
        dotSpacing={28}
        dotColor="rgba(255, 255, 255, 0.1)"
      />

      {/* ── GET IN TOUCH CARDS (dynamic with fallback) ── */}
      <section className="w-full bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-4xl md:text-5xl font-bold text-blue-950 tracking-wide">
              Get In Touch
            </h4>
            <h2 className="mt-3 text-3xl md:text-4xl capitalize text-[#557b00] font-bold">
              SBS Groups
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {/* Phone – fallback to Part 1 hardcoded numbers */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center hover:bg-black hover:text-white duration-300">
                <span className="inline-block animate-[shake-multi_0.6s_ease-in-out_infinite] group-hover:[animation-play-state:paused]">
                  <Phone size={36} strokeWidth={2} />
                </span>
              </div>
              <p className="mt-8 text-2xl font-medium text-gray-900">
                {phones.length > 0 ? (
                  phones.map((p, i) => (
                    <span key={i}>
                      <a href={`tel:${p.number}`}>+91-{p.number}</a>
                      {i < phones.length - 1 && <br />}
                    </span>
                  ))
                ) : (
                  <>
                    <a href="tel:+91 9826808412">+91 9826808412</a> <br />
                    <a href="tel:+91 8827559826">+91 8827559826</a>
                  </>
                )}
              </p>
            </div>

            {/* Address – fallback to Part 1 hardcoded address */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center hover:bg-black hover:text-white duration-300">
                <MapPin size={36} strokeWidth={2} />
              </div>
              <h4 className="mt-8 text-2xl font-bold text-slate-900">
                Our Corporate Address
              </h4>
              <p className="mt-3 text-gray-700 text-lg leading-8">
                {fullAddress ||
                  "SUPERB BEARING STORES, Main Road, Tali Waidhan, Near Honda Showroom, Singrauli, M.P. 486886 (India)"}
              </p>
            </div>

            {/* Email – fallback to Part 1 hardcoded emails */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center hover:bg-black hover:text-white duration-300 overflow-hidden">
                <Mail size={36} strokeWidth={2} className="relative z-10" />
                <span className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-100 group-hover:animate-[slide-right_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={20} strokeWidth={3} className="text-current" />
                </span>
              </div>
              <p className="mt-8 text-2xl font-medium text-gray-900 break-all">
                {emails.length > 0 ? (
                  emails.map((e, i) => (
                    <span key={i}>
                      <a href={`mailto:${e.address}`}>{e.address}</a>
                      {i < emails.length - 1 && <br />}
                    </span>
                  ))
                ) : (
                  <>
                    {/* <a href="mailto:info@sbsgroups.co.in">info@sbsgroups.co.in</a> <br />
                    <a href="mailto:admin@sbsgroups.co.in">admin@sbsgroups.co.in</a> */}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CONTACT US (only in Part 2) ── */}
      <WhyContactUs />

      {/* ── MAP + FUNCTIONAL FORM ── */}
      <section className="w-full">
        <div className="grid lg:grid-cols-2">
          <div className="h-[500px] lg:h-auto">
            <iframe
              title="Sbs Groups"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3642.8619117311137!2d82.62006837590417!3d24.07116687638525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398f372b3e77d66f%3A0x801e845358eb1be9!2sSUPERB%20BEARING%20STORES!5e0!3m2!1sen!2sin!4v1783935373198!5m2!1sen!2sin"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>

          <div
            className="relative flex items-center justify-center py-12 px-6"
            style={{
              backgroundImage: "url('/images/contact-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#042562] via-[#0248A4] to-[#016BE6]"></div>
            <div className="relative w-full max-w-3xl">
              <h2 className="text-5xl text-white mb-8 font-bold">
                Contact <span className="text-[#557b00]">Us</span>
              </h2>

              {/* Same ContactForm used by the floating badge modal — one
                  implementation, one place to fix bugs or add a field. */}
              <ContactForm hideHeader />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION (Real API data, up to 9 items) ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold text-blue-950 mb-16">
            Frequently Asked
            <br />
            <span className="text-[#557b00]">Question</span>
          </h2>

          {faqLoading ? (
            <div className="text-center text-slate-400 text-sm font-medium">
              Loading FAQs…
            </div>
          ) : faqList.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3">
                {faqList.slice(0, 9).map((faq) => (
                  <div
                    key={faq.id}
                    className="p-10 border-r border-b border-gray-200 transition-all duration-300"
                  >
                    <h3 className="text-2xl font-semibold text-blue-950 mb-6">
                      {faq.question}
                    </h3>
                    <div
                      className="space-y-2 text-gray-800 leading-8 text-lg"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(faq.answer ?? ""),
                      }}
                    />
                  </div>
                ))}
              </div>

              {faqList.length > 9 && (
                <div className="mt-12 text-center">
                  <Link
                    href="/contact/faqs"
                    className="inline-flex items-center gap-2 text-sm font-black text-blue-950 border border-blue-950 px-6 py-3 rounded-xl hover:bg-blue-950 hover:text-white transition-all"
                  >
                    Read All FAQs
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-slate-500 text-sm font-medium">
              No FAQs published yet.
            </p>
          )}
        </div>
      </section>

      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}