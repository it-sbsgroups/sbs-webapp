"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import clientsApi from "@/lib/clientsApi";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import LazySection from "@/components/shared/LazySection";
import CoreValues from "@/components/public/CoreValues";
import ProtectionProven from "@/components/public/ProtectionProven";
import IndustriesWeServe from "@/components/public/IndustriesWeServe";
import ClientTestimonialsSlider from "@/components/public/ClientTestimonialsSlider";

// ── DEFAULT SETTINGS ──
const pageSettings = {
  // Logo
  logoSize: "w-24 h-24",                // larger than original w-16 h-16
  logoFit: "object-contain",            // show full logo without cropping
  logoBg: "bg-white",                   // background for logo container

  // Cards
  cardHoverEffect: true,                // enable 3D lift + scale + shadow
  cardShadow: "shadow-sm hover:shadow-2xl",
  cardTransition: "transition-all duration-300",
  cardHoverTransform: "hover:-translate-y-1 hover:scale-[1.02]",
  cardBorder: "border-slate-200/80 hover:border-blue-900/40",

  // Grid
  gridCols: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  gap: "gap-5 md:gap-6",

  // Optional sections
  showAddress: true,
  showWebsite: true,
  showCoreValues: true,
  showProtectionProven: true,
  showIndustriesWeServe: true,

  // Hero
  heroTitle: "Our Valued Corporate Alliances",
  heroSubtitle: "The industrial enterprises across power, mining, cement and infrastructure that rely on SBS Groups for certified supply, documented quality and on-time site delivery.",
};

// ── HELPER COMPONENTS ──
const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Logo";
};
const isImageUrl = (s) => typeof s === "string" && /^https?:\/\//.test(s);

const Logo = ({ client, sizeClass = pageSettings.logoSize }) =>
  isImageUrl(client.logo) ? (
    <img
      loading="lazy"
      src={client.logo}
      alt={`${client.companyName} logo`}
      onError={fallbackImg}
      className={`${sizeClass} rounded-2xl ${pageSettings.logoFit} border border-slate-200 shrink-0 ${pageSettings.logoBg}`}
    />
  ) : (
    <span className={`${sizeClass} text-3xl flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shrink-0`}>
      🏢
    </span>
  );

export default function PublicClientsDirectoryPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await clientsApi.getPublic();
        setClients(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.companyName?.toLowerCase().includes(q));
  }, [query, clients]);

  // ── BUILD CARD CLASSES FROM SETTINGS ──
  const cardClasses = `
    bg-white border rounded-2xl p-5 md:p-6 flex flex-col justify-between
    ${pageSettings.cardBorder}
    ${pageSettings.cardShadow}
    ${pageSettings.cardTransition}
    ${pageSettings.cardHoverEffect ? pageSettings.cardHoverTransform : ""}
  `.trim();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ── BREADCRUMB ── */}
      <LazySection id="clients-breadcrumb" minHeight={100}>
        <PageBreadcrumb
          pageKey="clients"
          title="Clients"
          items={[{ label: "Clients" }]}
        />
      </LazySection>

      {/* ── HERO HEADER ── */}
      <LazySection id="clients-header" minHeight={100}>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="max-w-2xl">
                <span className="text-xs font-black text-blue-950 uppercase tracking-widest">
                  Enterprise Trust
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  {pageSettings.heroTitle}
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                  {pageSettings.heroSubtitle}
                </p>
              </div>
            </div>

            <div className="relative mt-7">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company name..."
                className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-950 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </LazySection>

      {/* ── CLIENT CARDS GRID ── */}
      <LazySection id="clients-cards" minHeight={500}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-950" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4 opacity-30">🔍</span>
              <h3 className="text-lg font-black text-slate-900">
                {clients.length === 0
                  ? "No clients listed yet"
                  : "No clients match your search"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {clients.length === 0 ? "Check back soon." : "Try a different keyword."}
              </p>
            </div>
          ) : (
            <div className={`grid ${pageSettings.gridCols} ${pageSettings.gap}`}>
              {filtered.map((client) => (
                <div key={client.id} className={cardClasses}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Logo client={client} />
                      <div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-blue-900 transition-colors tracking-tight leading-snug">
                          {client.companyName}
                        </h3>
                        {pageSettings.showAddress && client.companyAddress && (
                          <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                            📍 {client.companyAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-100">
                    <Link
                      href={`/clients/${client.slug}`}
                      className="w-full block text-center text-[10px] font-black uppercase bg-slate-900 text-white py-3 rounded-xl tracking-wider hover:bg-blue-950 shadow-sm transition-colors"
                    >
                      View Alliance Profile ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </LazySection>

      {/* ── EXTRA SECTIONS ── */}
      {pageSettings.showCoreValues && (
        <LazySection id="core-values" minHeight={150}>
          <CoreValues />
        </LazySection>
      )}
      {pageSettings.showProtectionProven && (
        <LazySection id="protection-proven" minHeight={150}>
          <ProtectionProven />
        </LazySection>
      )}

      <LazySection id="clients-testimonials" minHeight={600}>
        <ClientTestimonialsSlider />
      </LazySection>

      {pageSettings.showIndustriesWeServe && (
        <LazySection id="industries-we-serve" minHeight={150}>
          <IndustriesWeServe />
        </LazySection>
      )}
    </div>
  );
}