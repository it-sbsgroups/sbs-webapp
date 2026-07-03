"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
    stockedProducts: true,                         // Distributor stock line items
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

const DISTRIBUTORS = [
  {
    id: "DIST-01",
    slug: "vanguard-industrial-spares",
    name: "Amit Sharma",
    designation: "Managing Partner",
    companyName: "Vanguard Industrial Spares",
    region: "Singrauli Zone",
    establishedIn: "June 2018",
    logo: "https://placehold.co/160x160/0f172a/38bdf8?text=VIS",
    url: "https://example.com/vanguard-spares",
    details:
      "Authorized channel partner distributing premium heavy-machinery spares, high-tensile fasteners, and conveyor belt components.\n\nOperating a 5,000 sq.ft. central warehouse in Singrauli, providing 24/7 emergency dispatch support to local mining cells and power plants with full OEM warranties. They maintain a solid buffer stock for urgent replacement requirements to ensure minimum plant downtime.",
    contact: { phone: "+91 98765 20001", email: "sales@vanguardspares.example.com" },
    social: {
      linkedin: "https://linkedin.com/company/vanguard-spares",
      instagram: "",
      twitter: "https://twitter.com/vanguardspares",
    },
    gallery: [
      "https://placehold.co/800x500?text=Singrauli+Warehouse+Hub",
      "https://placehold.co/800x500?text=Fasteners+Stock",
      "https://placehold.co/800x500?text=Loading+Bay+Dispatch",
    ],
    reviews: [
      { date: "2026-05-10", rating: 5, description: "Excellent stock availability for heavy conveyor spares. Vanguard has optimized our emergency breakdown response significantly in the mining sectors." },
      { date: "2026-01-15", rating: 4, description: "Reliable logistics and transparent billing. Their technical team helped us identify the exact replacement part numbers within hours." },
    ],
    stockedProducts: [
      { id: "SKU-1094", name: "Heavy Duty Lifting Webbing Sling 5T", category: "Lifting & Rigging", spec: "Duplex 7:1, Polyester" },
      { id: "SKU-8821", name: "Anti-Rust Spray Premium (Case of 24)", category: "Maintenance", spec: "Moisture displacement, 400ml" },
      { id: "SKU-9026", name: "Machine Oil Premium Grade 20L", category: "Lubricants", spec: "ISO VG 46, Anti-oxidant" },
    ],
  },
  {
    id: "DIST-02",
    slug: "apex-hydraulics-lubricants",
    name: "Karan Johar",
    designation: "Director - Distribution",
    companyName: "Apex Hydraulics & Lubricants",
    region: "Rewa Region",
    establishedIn: "March 2021",
    logo: "https://placehold.co/160x160/1e3a8a/38bdf8?text=AHL",
    url: "https://example.com/apex-hydraulics",
    details:
      "Specialized distributor for high-pressure industrial hydraulic systems, pneumatic valves, and premium brand lubricants.\n\nMaintains ready stock of sealed OEM chemical lines and provides on-site filtration system testing audits. Partners closely with metallurgy units to offer fast turnarounds on critical pipeline fittings.",
    contact: { phone: "+91 98765 20002", email: "karan@apexhydraulics.example.com" },
    social: {
      linkedin: "https://linkedin.com/company/apex-hydraulics",
      instagram: "https://instagram.com/apexhydraulics",
      twitter: "",
    },
    gallery: [
      "https://placehold.co/800x500?text=Hydraulics+Testing+Lab",
      "https://placehold.co/800x500?text=Lubricant+Barrels",
    ],
    reviews: [
      { date: "2026-03-22", rating: 5, description: "Authentic Mobil and Shell lubricants delivered in tamper-proof packaging. Always dependable support from Apex team." },
    ],
    stockedProducts: [
      { id: "SKU-4412", name: "High-Pressure Hydraulic Pump 10L", category: "Hydraulics", spec: "400 Bar, 3-Phase motor" },
      { id: "SKU-9027", name: "Grease Multi-purpose NLGI 2", category: "Lubricants", spec: "EP additives, Water resistant" },
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
    <span className="text-sky-500">{"★".repeat(Math.round(rating))}</span>
    <span className="text-slate-300">{"★".repeat(5 - Math.round(rating))}</span>
  </span>
);

const Eyebrow = ({ children }) => (
  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{children}</p>
);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ============================ PAGE ======================================== */
export default function PublicDistributorDynamicProfileView() {
  const params = useParams();
  const slug = params.slug;

  const distributor = useMemo(() => DISTRIBUTORS.find((d) => d.slug === slug) || null, [slug]);

  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(PAGE_CONFIG.reviews.initialVisible);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  /* -------- aggregates -------- */
  const reviews = distributor?.reviews || [];
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
  if (!distributor) {
    return (
      <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
          <Link href="/distributors" className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-sky-950 transition-colors">
            ← Back to Distributors
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-6xl mb-4 opacity-30">🔍</span>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Partner Record Not Found</h1>
          <p className="text-slate-500 font-medium text-sm mb-1">No distributor profile exists for:</p>
          <p className="font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg mb-8">/{slug}</p>
          <Link href="/distributors">
            <button className="bg-slate-900 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-sky-950 transition-colors shadow-md">
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
        <Link href="/distributors" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-sky-950 transition-colors">
          ← Back to Distributors
        </Link>

        {/* ==================== HERO PROFILE CARD ==================== */}
        <div className={`${cardClass()} relative overflow-hidden`}>
          {/* soft accent wash */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row gap-5 md:gap-6">
            {/* logo */}
            {isImageUrl(distributor.logo) ? (
              <img loading="lazy" src={distributor.logo} alt={`${distributor.companyName} logo`} onError={fallbackImg}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
            ) : (
              <span className="w-20 h-20 md:w-24 md:h-24 text-4xl flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                {distributor.logo || "🏢"}
              </span>
            )}

            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {distributor.companyName}
                  </h1>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-wider">
                    {distributor.id}
                  </span>
                </div>
                {distributor.region && (
                  <p className="text-xs text-sky-900 font-black uppercase tracking-wider mt-0.5">📍 Hub: {distributor.region}</p>
                )}
              </div>

              {/* contact person */}
              {distributor.name && (
                <p className="text-sm font-bold text-slate-700">
                  👤 {distributor.name}
                  {distributor.designation && <span className="text-slate-400 font-semibold"> · {distributor.designation}</span>}
                </p>
              )}

              {/* meta chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {distributor.establishedIn && (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px.5 py-1 rounded-md">
                    📅 Authorized Since: {distributor.establishedIn}
                  </span>
                )}
                {avgRating && PAGE_CONFIG.reviews.showSummary && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-sky-800 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-md">
                    <Stars rating={Number(avgRating)} size="text-[11px]" /> {avgRating} / 5 · {reviews.length} review{reviews.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* contact + socials + url row */}
              {(SHOW.contact || SHOW.socials) && (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {SHOW.contact && distributor.contact?.phone && (
                    <a href={`tel:${distributor.contact.phone}`}
                      className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-sky-400 hover:text-sky-900 transition-colors shadow-sm">
                      📞 {distributor.contact.phone}
                    </a>
                  )}
                  {SHOW.contact && distributor.contact?.email && (
                    <a href={`mailto:${distributor.contact.email}`}
                      className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-sky-400 hover:text-sky-900 transition-colors shadow-sm">
                      ✉️ {distributor.contact.email}
                    </a>
                  )}
                  {distributor.url && (
                    <a href={distributor.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-1.5 rounded-lg hover:bg-sky-100 transition-colors">
                      🌐 Visit Portal ↗
                    </a>
                  )}
                  {SHOW.socials && distributor.social?.linkedin && (
                    <a href={distributor.social.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-1.5 rounded-lg hover:bg-sky-100 transition-colors">in LinkedIn</a>
                  )}
                  {SHOW.socials && distributor.social?.twitter && (
                    <a href={distributor.social.twitter} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">𝕏 Twitter</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== FEATURED TESTIMONIAL ==================== */}
        {SHOW.reviews && featured && (
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 md:p-8 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <span className="absolute right-4 -top-10 text-[11rem] text-white/5 font-serif font-black select-none pointer-events-none">"</span>

            <div className="flex flex-wrap items-center gap-2 relative z-10">
              <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-sky-300 bg-sky-950/60 border border-sky-900/60 px-3 py-1 rounded-full">
                <span>🛡️</span> <span>Verified Network Feedback</span>
              </span>
              <Stars rating={featured.rating} size="text-sm" />
            </div>

            <p className="text-sm md:text-base font-medium italic text-slate-100 leading-relaxed relative z-10 max-w-3xl">
              "{featured.description}"
            </p>

            <div className="border-t border-white/10 pt-4 relative z-10 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Endorsed By</p>
                <p className="text-xs font-bold text-white mt-0.5">
                  {distributor.name}{distributor.designation ? `, ${distributor.designation}` : ""}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{fmtDate(featured.date)}</span>
            </div>
          </div>
        )}

        {/* ==================== ABOUT / DETAILS ==================== */}
        {SHOW.details && distributor.details && (
          <div className={cardClass()}>
            <Eyebrow>Operations & Capability</Eyebrow>
            <div className="mt-3">
              {(() => {
                const { maxChars, expandable } = PAGE_CONFIG.details;
                const isLong = distributor.details.length > maxChars;
                const shown = detailsExpanded || !isLong
                  ? distributor.details
                  : distributor.details.slice(0, maxChars).trimEnd() + "…";
                return (
                  <>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{shown}</p>
                    {isLong && expandable && (
                      <button
                        onClick={() => setDetailsExpanded((v) => !v)}
                        className="mt-3 text-[10px] font-black text-sky-700 uppercase tracking-wider hover:text-sky-900 transition-colors"
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
        {SHOW.gallery && distributor.gallery?.length > 0 && (
          <div className={cardClass()}>
            <div className="flex items-center justify-between">
              <Eyebrow>Hub & Inventory Facility</Eyebrow>
              <span className="text-[10px] font-bold text-slate-400">{distributor.gallery.length} photo{distributor.gallery.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {distributor.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => PAGE_CONFIG.gallery.lightbox && setLightboxIndex(i)}
                  className={`${PAGE_CONFIG.gallery.thumbHeight} w-full rounded-xl overflow-hidden border border-slate-200 group relative`}
                >
                  <img loading="lazy" src={img} alt={`${distributor.companyName} gallery ${i + 1}`} onError={fallbackImg}
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
              <Eyebrow>Performance Audits ({reviews.length})</Eyebrow>
              {avgRating && (
                <span className="flex items-center gap-2 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-lg">
                  <Stars rating={Number(avgRating)} size="text-xs" />
                  <span className="text-xs font-black text-sky-800">{avgRating} / 5</span>
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
                className="mt-4 text-[10px] font-black text-sky-700 uppercase tracking-wider hover:text-sky-900 transition-colors"
              >
                {visibleReviews >= reviews.length ? "− Show fewer" : `+ View all ${reviews.length} reviews`}
              </button>
            )}
          </div>
        )}

        {/* ==================== STOCKED PRODUCTS ==================== */}
        {SHOW.stockedProducts && distributor.stockedProducts?.length > 0 && (
          <div className={cardClass()}>
            <Eyebrow>Ready Supply Line Inventory ({distributor.stockedProducts.length})</Eyebrow>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Products maintained in local warehouse buffer for instant dispatch.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {distributor.stockedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="bg-slate-50/60 border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-sky-900/50 hover:bg-white hover:shadow-md transition-all h-full">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] font-mono bg-white border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                          {product.id}
                        </span>
                        <span className="text-[9px] font-black uppercase text-sky-900 tracking-tight bg-sky-50 px-2 py-0.5 rounded truncate">
                          {product.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight leading-snug group-hover:text-sky-900 transition-colors">
                        {product.name}
                      </h4>
                      {product.spec && (
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">Spec: {product.spec}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> In Stock
                      </span>
                      <span className="text-sky-600 group-hover:translate-x-0.5 transition-transform">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CTA STRIP ==================== */}
        {SHOW.cta && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-base md:text-lg font-black tracking-tight">Interested in becoming a Channel Partner?</h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Expand your territory and get official authorization to distribute certified components.
              </p>
            </div>
            <Link href="/contact" className="shrink-0">
              <button className="bg-sky-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-sky-300 transition-colors shadow-md whitespace-nowrap">
                Apply for Dealership →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ==================== LIGHTBOX ==================== */}
      {lightboxIndex !== null && distributor.gallery?.[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/60 hover:text-white text-xl font-bold"
            aria-label="Close gallery"
            onClick={() => setLightboxIndex(null)}
          >✕</button>

          {distributor.gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + distributor.gallery.length) % distributor.gallery.length); }}
              className="absolute left-3 md:left-6 text-white/60 hover:text-white text-3xl font-black"
              aria-label="Previous image"
            >‹</button>
          )}

          <img
            loading="lazy"
            src={distributor.gallery[lightboxIndex]}
            alt={`${distributor.companyName} gallery ${lightboxIndex + 1}`}
            onError={fallbackImg}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-[92vw] rounded-xl border border-white/10 shadow-2xl object-contain"
          />

          {distributor.gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % distributor.gallery.length); }}
              className="absolute right-3 md:right-6 text-white/60 hover:text-white text-3xl font-black"
              aria-label="Next image"
            >›</button>
          )}

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
            {lightboxIndex + 1} / {distributor.gallery.length}
          </span>
        </div>
      )}
    </div>
  );
}