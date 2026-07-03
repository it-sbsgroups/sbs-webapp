"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import clientsApi from "@/lib/clientsApi";

const PAGE_CONFIG = {
  layout: { container: "max-w-5xl" },
  card: { variant: "elevated", radius: "xl", padding: "lg" },
  details: { maxChars: 320, expandable: true },   // long-text "details" field
  gallery: { thumbHeight: "h-36 md:h-44", lightbox: true },
  reviews: { initialVisible: 2, showSummary: true, featuredTestimonial: true },
  show: {
    gallery: true,
    details: true,
    contact: true,
    socials: true,
    reviews: true,
    suppliedProducts: true,
    cta: true,
  },
};

const UI = {
  cardVariants: {
    elevated: "bg-white border border-slate-200/80 shadow-sm",
    outlined: "bg-white border-2 border-slate-200",
    flat: "bg-white border border-slate-100",
  },
  radii: { lg: "rounded-xl", xl: "rounded-2xl", "2xl": "rounded-3xl" },
  paddings: { sm: "p-4", md: "p-5 md:p-6", lg: "p-6 md:p-8" },
};
const cardClass = () =>
  `${UI.cardVariants[PAGE_CONFIG.card.variant]} ${UI.radii[PAGE_CONFIG.card.radius]} ${UI.paddings[PAGE_CONFIG.card.padding]}`;

const FALLBACK_CLIENTS = [
  {
    id: "CLNT-01",
    slug: "adani-enterprises",
    name: "Rajesh Malhotra",
    designation: "VP — Procurement Operations",
    companyName: "Adani Enterprises Ltd",
    industry: "Mining & Heavy Infrastructure",
    servingSince: "April 2020",
    logo: "https://placehold.co/160x160/0f172a/a3e635?text=AE",
    url: "https://www.adanienterprises.com",
    details:
      "Collaborating across multiple open-cast mining cells in the Singrauli zone for strategic distribution of high-tensile machinery spares, conveyor systems and site safety equipment.\n\nThe engagement runs on an annual rate contract with consolidated monthly dispatches to three site stores, full test-certificate documentation on every line item, and a dedicated SBS account executive for emergency breakdown sourcing. Quarterly review meetings track fill-rate, documentation compliance and delivery SLA performance against contract benchmarks.",
    contact: { phone: "+91 98765 10001", email: "procurement@adanient.example.com" },
    social: {
      linkedin: "https://linkedin.com/company/adani-enterprises",
      instagram: "https://instagram.com/adanionline",
      twitter: "https://twitter.com/adanionline",
    },
    gallery: [
      "https://placehold.co/800x500?text=Singrauli+Mining+Cell",
      "https://placehold.co/800x500?text=Site+Stores+Dispatch",
      "https://placehold.co/800x500?text=Conveyor+Line+Install",
      "https://placehold.co/800x500?text=Safety+Audit+Walk",
    ],
    reviews: [
      { date: "2026-04-18", rating: 5, description: "The bulk sourcing turnaround time provided by SBS Groups for our Singrauli zone machinery spares has been stellar. Their automated RFQ pipeline eliminated minor order-tracking overheads by almost 35%. Highly recommended for heavy logistics coordination." },
      { date: "2025-12-03", rating: 5, description: "Emergency breakdown order delivered to site in 18 hours with complete test certificates. This is the standard we hold every vendor to now." },
      { date: "2025-07-22", rating: 4, description: "Consistent quality across consignments. One packaging issue in monsoon season was resolved with replacement stock within the week." },
    ],
    suppliedProducts: [
      { id: "SKU-9021", name: "Industrial Safety Leather Boots (Grade A)", category: "Site Safety", spec: "Steel toe, Anti-slip sole" },
      { id: "SKU-1094", name: "Heavy Duty Lifting Webbing Sling 5T", category: "Lifting & Rigging", spec: "Duplex 7:1, Polyester" },
      { id: "SKU-8821", name: "Anti-Rust Spray Premium (Case of 24)", category: "Maintenance", spec: "Moisture displacement, 400ml" },
      { id: "SKU-9026", name: "Machine Oil Premium Grade 20L", category: "Lubricants", spec: "ISO VG 46, Anti-oxidant" },
    ],
  },
  {
    id: "CLNT-02",
    slug: "hindalco-industries",
    name: "Meera Krishnan",
    designation: "Head — Plant Maintenance Stores",
    companyName: "Hindalco Industries",
    industry: "Metallurgy & Aluminium Refineries",
    servingSince: "January 2022",
    logo: "https://placehold.co/160x160/1e3a8a/ffffff?text=HI",
    url: "https://www.hindalco.com",
    details:
      "Core strategic supplier for high-pressure industrial hydraulics, lubrication systems and electrical safety audit equipment across refinery maintenance cells.\n\nProcurement operates on quarterly purchase orders with MSDS sheets mandatory on all chemical lines and IEC-certified PPE for electrical crews. SBS maintains a buffer stock arrangement for fast-moving hydraulic spares at the NCL Spares Depot.",
    contact: { phone: "+91 98765 10002", email: "stores@hindalco.example.com" },
    social: {
      linkedin: "https://linkedin.com/company/hindalco",
      instagram: "",
      twitter: "https://twitter.com/hindalco",
    },
    gallery: [
      "https://placehold.co/800x500?text=Refinery+Maintenance+Cell",
      "https://placehold.co/800x500?text=Hydraulics+Bay",
    ],
    reviews: [
      { date: "2026-02-09", rating: 5, description: "Every electrical safety item arrives with IEC certification and individual test stamps. Audit-ready paperwork without us having to chase — rare in this region." },
      { date: "2025-09-15", rating: 4, description: "Hydraulic spares matched OEM part numbers exactly. Pricing on bulk lubricant orders is consistently competitive." },
    ],
    suppliedProducts: [
      { id: "SKU-4412", name: "High-Pressure Hydraulic Pump 10L", category: "Hydraulics", spec: "400 Bar, 3-Phase motor" },
      { id: "SKU-3112", name: "Insulated Rubber Gloves (Class 3)", category: "Electrical Safety", spec: "26,500V AC, Proof tested" },
      { id: "SKU-9005", name: "Torque Wrench Click Type 1/2-inch", category: "Calibrated Tools", spec: "42-210 N·m, Certified" },
    ],
  },
  {
    id: "CLNT-03",
    slug: "ntpc-vindhyachal",
    name: "Arvind Deshpande",
    designation: "Sr. Manager — Materials",
    companyName: "NTPC Vindhyachal",
    industry: "Thermal Power Generation",
    servingSince: "March 2021",
    logo: "https://placehold.co/160x160/7c2d12/ffffff?text=NV",
    url: "https://www.ntpc.co.in",
    details:
      "Annual rate contract covering calibrated torque tooling, lifting tackle with load-test certification, and Class-3 insulated electrical PPE for one of India's largest thermal power stations.\n\nAll lifting equipment is supplied with EN-standard certificates and colour-coded SWL tagging per station safety protocol. Deliveries are scheduled around planned shutdown windows with advance documentation submission.",
    contact: { phone: "+91 98765 10003", email: "materials@ntpcvin.example.com" },
    social: { linkedin: "https://linkedin.com/company/ntpc", instagram: "", twitter: "" },
    gallery: ["https://placehold.co/800x500?text=Vindhyachal+Power+Station"],
    reviews: [
      { date: "2026-01-27", rating: 5, description: "Calibration certificates traceable to national standards supplied with every torque wrench. Exactly what a power plant audit demands." },
      { date: "2025-06-11", rating: 4, description: "Lifting tackle arrived with complete EN documentation. Delivery scheduling around our shutdown window was handled professionally." },
    ],
    suppliedProducts: [
      { id: "SKU-9005", name: "Torque Wrench Click Type 1/2-inch", category: "Calibrated Tools", spec: "42-210 N·m, Certified" },
      { id: "SKU-9030", name: "Chain Sling Grade 100 5T", category: "Lifting & Rigging", spec: "Alloy steel, Calibrated links" },
      { id: "SKU-9024", name: "Insulated Screwdriver Set (6pcs)", category: "Electrical Safety", spec: "1000V rated, VDE" },
    ],
  },
  {
    id: "CLNT-04",
    slug: "jp-cement-rewa",
    name: "Sunita Agrawal",
    designation: "Purchase Officer",
    companyName: "JP Cement Works, Rewa",
    industry: "Cement Manufacturing",
    servingSince: "June 2023",
    logo: "https://placehold.co/160x160/065f46/ffffff?text=JP",
    url: "https://example.com/jp-cement",
    details:
      "Cement grinding unit sourcing industrial lubricants, hydraulic pump spares and maintenance chemicals. Requires MSDS documentation with every chemical consignment and sealed OEM packaging on all lubricant lines to guarantee against adulteration.",
    contact: { phone: "+91 98765 10004", email: "purchase@jpcement.example.com" },
    social: { linkedin: "https://linkedin.com/company/jp-cement", instagram: "https://instagram.com/jpcement", twitter: "" },
    gallery: [],
    reviews: [
      { date: "2026-03-02", rating: 5, description: "Shell and Mobil lines always arrive in sealed OEM packaging with batch numbers. Zero adulteration concerns since switching to SBS." },
    ],
    suppliedProducts: [
      { id: "SKU-9026", name: "Machine Oil Premium Grade 20L", category: "Lubricants", spec: "ISO VG 46, Anti-oxidant" },
      { id: "SKU-9027", name: "Grease Multi-purpose NLGI 2", category: "Lubricants", spec: "EP additives, Water resistant" },
      { id: "SKU-9028", name: "Degreaser Industrial Strength 5L", category: "Maintenance", spec: "Biodegradable, Fast acting" },
    ],
  },
  {
    id: "CLNT-05",
    slug: "mp-infra-projects",
    name: "Imran Qureshi",
    designation: "Director — Site Operations",
    companyName: "MP Infra Projects Ltd",
    industry: "Roads & Bridge Construction",
    servingSince: "February 2024",
    logo: "https://placehold.co/160x160/581c87/ffffff?text=MP",
    url: "https://example.com/mp-infra",
    details:
      "Road and bridge construction contractor placing seasonal bulk orders for power tools, IS-marked safety helmets and Grade-A work boots across multiple site offices in Madhya Pradesh. Multi-site split deliveries are coordinated against a single consolidated purchase order.",
    contact: { phone: "+91 98765 10005", email: "procure@mpinfra.example.com" },
    social: { linkedin: "https://linkedin.com/company/mpinfra", instagram: "https://instagram.com/mpinfra", twitter: "https://twitter.com/mpinfra" },
    gallery: ["https://placehold.co/800x500?text=Bridge+Site+MP", "https://placehold.co/800x500?text=Site+Office"],
    reviews: [
      { date: "2025-12-29", rating: 4, description: "Multi-site delivery across four locations handled against one PO without a single mix-up. Helmets passed our safety audit first time." },
      { date: "2025-08-14", rating: 4, description: "Good bulk pricing on Bosch and DeWalt lines. Would like faster quote turnaround during peak season, but quality is reliable." },
    ],
    suppliedProducts: [
      { id: "SKU-9007", name: "Corded Impact Drill 850W", category: "Power Tools", spec: "Variable speed, Metal chuck" },
      { id: "SKU-9022", name: "Safety Helmet ABS Yellow", category: "Site Safety", spec: "IS 2925, Adjustable headband" },
      { id: "SKU-9021", name: "Industrial Safety Boots (Grade A)", category: "Site Safety", spec: "Steel toe, Anti-slip sole" },
    ],
  },
];

/* ============================ HELPERS ===================================== */
const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/800x500/f1f5f9/94a3b8?text=Image+Unavailable";
};
const isImageUrl = (s) => typeof s === "string" && /^https?:\/\//.test(s);

const Stars = ({ rating, size = "text-sm" }) => (
  <span className={`${size} leading-none`} aria-label={`${rating} out of 5`}>
    <span className="text-amber-400">{"★".repeat(Math.round(rating))}</span>
    <span className="text-slate-300">{"★".repeat(5 - Math.round(rating))}</span>
  </span>
);

const Eyebrow = ({ children }) => (
  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{children}</p>
);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ============================ PAGE ======================================== */
export default function PublicClientDynamicProfileView() {
  const params = useParams();
  const slug = params.slug;

  const [client, setClient] = useState(() => FALLBACK_CLIENTS.find((c) => c.slug === slug) || null);

  // Load the live client; fall back to the bundled record if API is empty/down.
  useEffect(() => {
    let alive = true;
    setClient(FALLBACK_CLIENTS.find((c) => c.slug === slug) || null);
    (async () => {
      try {
        const data = await clientsApi.getBySlug(slug);
        if (alive && data) setClient(data);
      } catch {
        /* keep fallback */
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(PAGE_CONFIG.reviews.initialVisible);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  /* -------- aggregates -------- */
  const reviews = client?.reviews || [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const featured = PAGE_CONFIG.reviews.featuredTestimonial && reviews.length
    ? [...reviews].sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date))[0]
    : null;

  const SHOW = PAGE_CONFIG.show;

  /* ---------------------------------------------------------------------- */
  /* NOT FOUND                                                               */
  /* ---------------------------------------------------------------------- */
  if (!client) {
    return (
      <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
          <Link href="/clients" className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-950 transition-colors">
            ← Back to Client Directory
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-6xl mb-4 opacity-30">🔍</span>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Client Profile Not Found</h1>
          <p className="text-slate-500 font-medium text-sm mb-1">No alliance record exists for:</p>
          <p className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mb-8">/{slug}</p>
          <Link href="/clients">
            <button className="bg-blue-950 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-md">
              Return to Directory
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6`}>

        {/* ==================== BACK NAV ==================== */}
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-950 transition-colors">
          ← Back to Client Directory
        </Link>

        {/* ==================== HERO PROFILE CARD ==================== */}
        <div className={`${cardClass()} relative overflow-hidden`}>
          {/* soft accent wash */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row gap-5 md:gap-6">
            {/* logo */}
            {isImageUrl(client.logo) ? (
              <img loading="lazy" src={client.logo} alt={`${client.companyName} logo`} onError={fallbackImg}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
            ) : (
              <span className="w-20 h-20 md:w-24 md:h-24 text-4xl flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                {client.logo || "🏢"}
              </span>
            )}

            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {client.companyName}
                  </h1>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-wider">
                    {client.id}
                  </span>
                </div>
                {client.industry && (
                  <p className="text-xs text-blue-900 font-black uppercase tracking-wider mt-0.5">{client.industry}</p>
                )}
              </div>

              {/* contact person */}
              {client.name && (
                <p className="text-sm font-bold text-slate-700">
                  👤 {client.name}
                  {client.designation && <span className="text-slate-400 font-semibold"> · {client.designation}</span>}
                </p>
              )}

              {/* meta chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {client.servingSince && (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                    📅 Client Since: {client.servingSince}
                  </span>
                )}
                {avgRating && PAGE_CONFIG.reviews.showSummary && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                    <Stars rating={Number(avgRating)} size="text-[11px]" /> {avgRating} / 5 · {reviews.length} review{reviews.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* contact + socials + url row */}
              {(SHOW.contact || SHOW.socials) && (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {SHOW.contact && client.contact?.phone && (
                    <a href={`tel:${client.contact.phone}`}
                      className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-900 transition-colors shadow-sm">
                      📞 {client.contact.phone}
                    </a>
                  )}
                  {SHOW.contact && client.contact?.email && (
                    <a href={`mailto:${client.contact.email}`}
                      className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-900 transition-colors shadow-sm">
                      ✉️ {client.contact.email}
                    </a>
                  )}
                  {client.url && (
                    <a href={client.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      🌐 Visit Website ↗
                    </a>
                  )}
                  {SHOW.socials && client.social?.linkedin && (
                    <a href={client.social.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">in LinkedIn</a>
                  )}
                  {SHOW.socials && client.social?.instagram && (
                    <a href={client.social.instagram} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-pink-700 bg-pink-50 border border-pink-100 px-2.5 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">◎ Instagram</a>
                  )}
                  {SHOW.socials && client.social?.twitter && (
                    <a href={client.social.twitter} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">𝕏 Twitter</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== FEATURED TESTIMONIAL (dark hero quote) ==================== */}
        {SHOW.reviews && featured && (
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 md:p-8 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <span className="absolute right-4 -top-10 text-[11rem] text-white/5 font-serif font-black select-none pointer-events-none">"</span>

            <div className="flex flex-wrap items-center gap-2 relative z-10">
              <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-lime-300 bg-lime-950/60 border border-lime-900/60 px-3 py-1 rounded-full">
                <span>🛡️</span> <span>Verified Enterprise Feedback</span>
              </span>
              <Stars rating={featured.rating} size="text-sm" />
            </div>

            <p className="text-sm md:text-base font-medium italic text-slate-100 leading-relaxed relative z-10 max-w-3xl">
              "{featured.description}"
            </p>

            <div className="border-t border-white/10 pt-4 relative z-10 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Authorized Endorsement</p>
                <p className="text-xs font-bold text-white mt-0.5">
                  {client.name}{client.designation ? `, ${client.designation}` : ""}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{fmtDate(featured.date)}</span>
            </div>
          </div>
        )}

        {/* ==================== ABOUT / DETAILS (long text field) ==================== */}
        {SHOW.details && client.details && (
          <div className={cardClass()}>
            <Eyebrow>About This Alliance</Eyebrow>
            <div className="mt-3">
              {(() => {
                const { maxChars, expandable } = PAGE_CONFIG.details;
                const isLong = client.details.length > maxChars;
                const shown = detailsExpanded || !isLong
                  ? client.details
                  : client.details.slice(0, maxChars).trimEnd() + "…";
                return (
                  <>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{shown}</p>
                    {isLong && expandable && (
                      <button
                        onClick={() => setDetailsExpanded((v) => !v)}
                        className="mt-3 text-[10px] font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors"
                      >
                        {detailsExpanded ? "− Read less" : "+ Read more"}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ==================== IMAGE GALLERY ==================== */}
        {SHOW.gallery && client.gallery?.length > 0 && (
          <div className={cardClass()}>
            <div className="flex items-center justify-between">
              <Eyebrow>Site & Operations Gallery</Eyebrow>
              <span className="text-[10px] font-bold text-slate-400">{client.gallery.length} photo{client.gallery.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {client.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => PAGE_CONFIG.gallery.lightbox && setLightboxIndex(i)}
                  className={`${PAGE_CONFIG.gallery.thumbHeight} w-full rounded-xl overflow-hidden border border-slate-200 group relative`}
                >
                  <img loading="lazy" src={img} alt={`${client.companyName} gallery ${i + 1}`} onError={fallbackImg}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xl transition-opacity">🔍</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================== REVIEWS ==================== */}
        {SHOW.reviews && reviews.length > 0 && (
          <div className={cardClass()}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Eyebrow>Client Reviews ({reviews.length})</Eyebrow>
              {avgRating && (
                <span className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                  <Stars rating={Number(avgRating)} size="text-xs" />
                  <span className="text-xs font-black text-amber-800">{avgRating} / 5</span>
                </span>
              )}
            </div>

            <div className="space-y-3 mt-4">
              {reviews.slice(0, visibleReviews).map((review, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <Stars rating={review.rating} size="text-xs" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {fmtDate(review.date)}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
                    "{review.description}"
                  </p>
                </div>
              ))}
            </div>

            {reviews.length > PAGE_CONFIG.reviews.initialVisible && (
              <button
                onClick={() =>
                  setVisibleReviews((v) =>
                    v >= reviews.length ? PAGE_CONFIG.reviews.initialVisible : reviews.length
                  )
                }
                className="mt-4 text-[10px] font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors"
              >
                {visibleReviews >= reviews.length ? "− Show fewer" : `+ View all ${reviews.length} reviews`}
              </button>
            )}
          </div>
        )}

        {/* ==================== SUPPLIED PRODUCTS (product allocation) ==================== */}
        {SHOW.suppliedProducts && client.suppliedProducts?.length > 0 && (
          <div className={cardClass()}>
            <Eyebrow>Active Supply Lines ({client.suppliedProducts.length})</Eyebrow>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Material lines regularly purchased and delivered to this client's operational sites.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {client.suppliedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="bg-slate-50/60 border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-blue-900/50 hover:bg-white hover:shadow-md transition-all h-full">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] font-mono bg-white border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                          {product.id}
                        </span>
                        <span className="text-[9px] font-black uppercase text-blue-900 tracking-tight bg-blue-50 px-2 py-0.5 rounded truncate">
                          {product.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition-colors">
                        {product.name}
                      </h4>
                      {product.spec && (
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">Spec: {product.spec}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                      </span>
                      <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CTA STRIP ==================== */}
        {SHOW.cta && (
          <div className="bg-blue-950 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-base md:text-lg font-black tracking-tight">Want your enterprise on this page?</h3>
              <p className="text-xs text-blue-200/70 font-medium mt-1">
                Partner with SBS Groups for certified industrial supply with documented quality on every dispatch.
              </p>
            </div>
            <Link href="/products" className="shrink-0">
              <button className="bg-lime-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-lime-300 transition-colors shadow-md whitespace-nowrap">
                Browse Catalog & Get Quote →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ==================== LIGHTBOX ==================== */}
      {lightboxIndex !== null && client.gallery?.[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/60 hover:text-white text-xl font-bold"
            aria-label="Close gallery"
            onClick={() => setLightboxIndex(null)}
          >✕</button>

          {client.gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + client.gallery.length) % client.gallery.length); }}
              className="absolute left-3 md:left-6 text-white/60 hover:text-white text-3xl font-black"
              aria-label="Previous image"
            >‹</button>
          )}

          <img
            src={client.gallery[lightboxIndex]}
            loading="lazy"
            alt={`${client.companyName} gallery ${lightboxIndex + 1}`}
            onError={fallbackImg}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-[92vw] rounded-xl border border-white/10 shadow-2xl object-contain"
          />

          {client.gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % client.gallery.length); }}
              className="absolute right-3 md:right-6 text-white/60 hover:text-white text-3xl font-black"
              aria-label="Next image"
            >›</button>
          )}

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
            {lightboxIndex + 1} / {client.gallery.length}
          </span>
        </div>
      )}
    </div>
  );
}