"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import clientsApi from "@/lib/clientsApi";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/800x500/f1f5f9/94a3b8?text=Image+Unavailable";
};
const isImageUrl = (s) => typeof s === "string" && /^https?:\/\//.test(s);

const Eyebrow = ({ children }) => (
  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{children}</p>
);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function PublicClientDynamicProfileView() {
  const params = useParams();
  const slug = params.slug;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Testimonial carousel state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const data = await clientsApi.getBySlug(slug);
        if (alive) setClient(data || null);
      } catch {
        if (alive) setClient(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  // Reset carousel when client changes
  useEffect(() => {
    setCurrentTestimonialIndex(0);
  }, [client]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-950" />
      </div>
    );
  }

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

  const testimonials = client.testimonials || [];
  const gallery = client.gallery || [];

  // Carousel controls
  const goToPrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  const goToNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-950 transition-colors">
          ← Back to Client Directory
        </Link>

        {/* HERO PROFILE CARD */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row gap-5 md:gap-6">
            {isImageUrl(client.logo) ? (
              <img loading="lazy" src={client.logo} alt={`${client.companyName} logo`} onError={fallbackImg}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-contain border border-slate-200 shadow-sm bg-white p-2 shrink-0" />
            ) : (
              <span className="w-28 h-28 md:w-32 md:h-32 text-5xl flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                🏢
              </span>
            )}

            <div className="flex-1 min-w-0 space-y-2.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {client.companyName}
              </h1>

              {client.companyAddress && (
                <p className="text-sm text-slate-600 font-medium">📍 {client.companyAddress}</p>
              )}

              {client.website && (
                <a href={client.website} target="_blank" rel="noopener noreferrer"
                  className="inline-block text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                  🌐 Visit Website ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* GALLERY */}
        {gallery.length > 0 && (
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between">
              <Eyebrow>Site & Operations Gallery</Eyebrow>
              <span className="text-[10px] font-bold text-slate-400">{gallery.length} photo{gallery.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setLightboxIndex(i)}
                  className="h-36 md:h-44 w-full rounded-xl overflow-hidden border border-slate-200 group relative">
                  <img loading="lazy" src={img} alt={`${client.companyName} gallery ${i + 1}`} onError={fallbackImg}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TESTIMONIALS - Enhanced Carousel */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <Eyebrow>Client Testimonials ({testimonials.length})</Eyebrow>
            {testimonials.length === 0 && (
              <span className="text-[10px] text-slate-400 font-medium">No approved testimonials yet</span>
            )}
          </div>

          {testimonials.length > 0 && (
            <div className="relative">
              {/* Carousel content */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
                >
                  {testimonials.map((t) => (
                    <div key={t.id} className="w-full flex-shrink-0 px-1">
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-6 md:p-8">
                        <div className="flex items-start gap-2 mb-4">
                          <Quote className="w-8 h-8 text-blue-200 shrink-0" />
                          <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed italic">
                            "{t.testimony}"
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/60">
                          {/* Avatar – client logo or fallback */}
                          {t.client?.logo ? (
                            <img
                              src={t.client.logo}
                              alt={t.client.companyName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {t.client?.companyName?.[0] || "C"}
                            </div>
                          )}
                          <div>
                            {/* Name removed – only designation and company */}
                            {t.designation && (
                              <p className="text-sm font-medium text-slate-700">{t.designation}</p>
                            )}
                            <p className="text-sm font-bold text-slate-900">{t.companyName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation buttons (only if more than one) */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={goToPrevTestimonial}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-5 bg-white/90 rounded-full p-2 shadow-md border border-slate-200 hover:bg-white transition-colors z-10"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goToNextTestimonial}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-5 bg-white/90 rounded-full p-2 shadow-md border border-slate-200 hover:bg-white transition-colors z-10"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Dots indicator */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonialIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx === currentTestimonialIndex
                          ? "bg-blue-600"
                          : "bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA STRIP */}
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
      </div>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button className="absolute top-5 right-5 text-white/60 hover:text-white text-xl font-bold" aria-label="Close gallery" onClick={() => setLightboxIndex(null)}>✕</button>
          {gallery.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length); }}
              className="absolute left-3 md:left-6 text-white/60 hover:text-white text-3xl font-black" aria-label="Previous image">‹</button>
          )}
          <img
            src={gallery[lightboxIndex]}
            loading="lazy"
            alt={`${client.companyName} gallery ${lightboxIndex + 1}`}
            onError={fallbackImg}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-[92vw] rounded-xl border border-white/10 shadow-2xl object-contain"
          />
          {gallery.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % gallery.length); }}
              className="absolute right-3 md:right-6 text-white/60 hover:text-white text-3xl font-black" aria-label="Next image">›</button>
          )}
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
            {lightboxIndex + 1} / {gallery.length}
          </span>
        </div>
      )}
    </div>
  );
}