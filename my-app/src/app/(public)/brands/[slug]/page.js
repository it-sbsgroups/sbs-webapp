"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import brandsApi from "@/lib/brands/Api";
import { toStaticUrl } from "@/lib/client";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/800x500/f1f5f9/94a3b8?text=Asset+Not+Available";
};

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Testimonial carousel state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await brandsApi.getBySlug(slug);
        if (data) {
          data.gallery = data.gallery || [];
          data.gallery = data.gallery.map((item) =>
            typeof item === "string" ? { url: item } : item
          );
        }
        setBrand(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Reset carousel when brand changes
  useEffect(() => {
    setCurrentTestimonialIndex(0);
  }, [brand]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-4">🔍</span>
        <h1 className="text-xl font-black text-slate-900">Brand Not Found</h1>
        <p className="text-xs text-slate-500 mt-1">/{slug}</p>
        <Link href="/brands" className="mt-5 text-xs font-black bg-slate-900 text-white px-5 py-3 rounded-xl uppercase tracking-wider hover:bg-indigo-600">Back to Directory</Link>
      </div>
    );
  }

  const {
    name,
    logo,
    website,
    email,
    phone,
    isActive,
    isOwnBrand,
    description,
    gallery,
    brochureUrl,
    products,
    testimonials,
    _count,
  } = brand;
  const productCount = _count?.products ?? 0;
  const approvedTestimonials = testimonials || [];
  const directoryHref = isOwnBrand ? "/own-brands" : "/brands";

  // Carousel controls
  const goToPrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) =>
      prev === 0 ? approvedTestimonials.length - 1 : prev - 1
    );
  };
  const goToNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) =>
      prev === approvedTestimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased pb-16">
      {/* Top navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href={directoryHref} className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900">
            ← Brand Directory
          </Link>
          <div className="flex items-center gap-2">
            {brochureUrl && (
              <a href={toStaticUrl(brochureUrl)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100">
                Download Brochure ↓
              </a>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                Visit Website ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        {/* Identity card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {logo && (
              <img src={logo} alt={name} className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-contain border bg-white p-2 shrink-0" onError={(e) => { e.currentTarget.src = "https://placehold.co/120x120/f1f5f9/94a3b8?text=Logo"; }} />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{name}</h1>
              <div className="flex gap-3 mt-3">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{isOwnBrand ? "Own Brand" : "Partner Brand"}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{productCount} Products</span>
              </div>
            </div>
          </div>
        </div>

        {/* About / Description */}
        {description && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">About {name}</h3>
            <RichTextRenderer html={description} />
          </div>
        )}

        {/* Gallery Section */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Visual Gallery</h3>
          {gallery && gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((item, idx) => {
                const src = item.url || item;
                return (
                  <div key={idx} onClick={() => setLightboxIndex(idx)} className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative">
                    <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={fallbackImg} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold">View</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No gallery images have been added yet.</p>
          )}
        </div>

        {/* Featured Products — CTA to filtered catalog */}
        {products?.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Featured Products
              </h3>
              {productCount > products.length && (
                <span className="text-[10px] font-bold text-slate-400">
                  Showing {products.length} of {productCount}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.sku}`} className="group rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <span className="text-3xl opacity-30">📦</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-snug">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href={`/products?brand=${brand.id}`} className="inline-block rounded-xl bg-blue-950 text-white font-black text-xs uppercase tracking-wider px-6 py-3 hover:bg-blue-900 transition-colors">
                See All Products from {name} →
              </Link>
            </div>
          </div>
        )}

        {/* TESTIMONIALS - Enhanced Carousel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Partner Testimonials ({approvedTestimonials.length})
            </h3>
            {approvedTestimonials.length === 0 && (
              <span className="text-[10px] text-slate-400 font-medium">No testimonials have been approved for this brand yet.</span>
            )}
          </div>

          {approvedTestimonials.length > 0 && (
            <div className="relative">
              {/* Carousel content */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
                >
                  {approvedTestimonials.map((t) => (
                    <div key={t.id} className="w-full flex-shrink-0 px-1">
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-6 md:p-8">
                        <div className="flex items-start gap-2 mb-4">
                          <Quote className="w-8 h-8 text-indigo-200 shrink-0" />
                          <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed italic">
                            "{t.testimony}"
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/60">
                          {/* Avatar – brand logo or fallback */}
                          {t.brand?.logo ? (
                            <img
                              src={t.brand.logo}
                              alt={t.brand.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {t.brand?.name?.[0] || "B"}
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
              {approvedTestimonials.length > 1 && (
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
              {approvedTestimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {approvedTestimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonialIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx === currentTestimonialIndex
                          ? "bg-indigo-600"
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
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && gallery && gallery[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-5 right-5 text-white text-xs font-black bg-white/10 px-3 py-2 rounded-xl uppercase">✕ Close</button>
          <img src={gallery[lightboxIndex].url || gallery[lightboxIndex]} alt="Full view" className="max-h-[85vh] max-w-[95vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          {gallery.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length); }} className="absolute left-4 text-white/70 hover:text-white text-3xl font-black">‹</button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % gallery.length); }} className="absolute right-4 text-white/70 hover:text-white text-3xl font-black">›</button>
            </>
          )}
          <span className="absolute bottom-6 text-xs font-mono text-slate-300 bg-black/50 px-3 py-1 rounded-full">{lightboxIndex + 1} / {gallery.length}</span>
        </div>
      )}
    </div>
  );
}