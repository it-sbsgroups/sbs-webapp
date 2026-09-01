// src/components/public/BrandTestimonialsSlider.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import testimonialsApi from "@/lib/testimonialsApi";

// ----- Default configuration (exportable for global tweaks) -----
export const defaultTestimonialsConfig = {
  // Section
  sectionClass: "w-full bg-gradient-to-b from-blue-950 to-slate-900 py-20 px-4 md:px-8 text-white",
  containerClass: "max-w-5xl mx-auto",
  headerContainerClass: "text-center mb-12",
  headerBadgeClass: "text-[10px] font-black uppercase tracking-widest text-lime-300/90",
  headerBadgeText: "What Our Brand Partners Say",
  headingClass: "mt-2 text-3xl md:text-4xl font-black tracking-tight",
  headingText: "Trusted By Leading Brands",

  // Loading skeleton
  loadingSkeletonClass: "animate-pulse rounded-3xl bg-white/5 border border-white/10 h-64",

  // Main card
  cardContainerClass: "relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-12",
  quoteIconClass: "absolute top-6 left-6 text-lime-400/20",
  quoteIconSize: 56,
  quoteIcon: Quote,

  // Content inside card
  contentClass: "relative flex flex-col items-center text-center gap-6",
  starsContainerClass: "flex items-center gap-1 text-amber-400",
  starIconSize: 16,
  starIcon: Star,
  starCount: 5,
  testimonyClass: "text-lg md:text-2xl font-medium leading-relaxed max-w-3xl",

  // Author info
  authorContainerClass: "flex items-center gap-3 pt-4 border-t border-white/10 w-full justify-center h-8",
  avatarContainerClass: "h-12 w-15 mt-5 flex items-center justify-center text-xl bg-white/10 rounded-2xl border border-white/10 overflow-hidden shrink-0",
  avatarFallbackEmojis: ["🏭", "⚡", "🔧", "🚛", "🏗️", "⚙️", "🛠️", "📦"],
  authorDetailsClass: "text-left",
  authorNameClass: "font-black flex items-center gap-1.5",
  authorLinkClass: "hover:underline",
  authorBadgeClass: "ml-1 text-[9px] font-bold text-slate-400 uppercase",
  authorBadgeLabel: "Partner Brand", // only used for brand testimonials now

  // Navigation buttons
  navButtonClass:
    "absolute top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors",
  prevButtonClass: "left-3",
  nextButtonClass: "right-3",
  navIconSize: 20,
  prevIcon: ChevronLeft,
  nextIcon: ChevronRight,

  // Pagination dots
  dotsContainerClass: "flex items-center justify-center gap-2 mt-8",
  dotInactiveClass: "h-1.5 rounded-full bg-white/25 hover:bg-white/40 transition-all",
  dotActiveClass: "h-1.5 rounded-full bg-lime-400 transition-all",
  dotWidthInactive: "w-1.5",
  dotWidthActive: "w-6",

  // Autoplay
  autoplayDelay: 6000,

  // "Read All" button
  readAllContainerClass: "text-center mt-10",
  readAllLinkClass:
    "inline-block bg-lime-400 text-blue-950 font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-lime-300 transition-colors",
  readAllText: "Read All Brand Testimonials →",
  readAllHref: "/testimonials/brands", // adjust route as needed
};

// ----- Component with props merging into default config -----
export default function BrandTestimonialsSlider({ config = {} }) {
  const finalConfig = { ...defaultTestimonialsConfig, ...config };
  const {
    sectionClass,
    containerClass,
    headerContainerClass,
    headerBadgeClass,
    headerBadgeText,
    headingClass,
    headingText,
    loadingSkeletonClass,
    cardContainerClass,
    quoteIconClass,
    quoteIconSize,
    quoteIcon: QuoteIcon,
    contentClass,
    starsContainerClass,
    starIconSize,
    starIcon: StarIcon,
    starCount,
    testimonyClass,
    authorContainerClass,
    avatarContainerClass,
    avatarFallbackEmojis,
    authorDetailsClass,
    authorNameClass,
    authorLinkClass,
    authorBadgeClass,
    authorBadgeLabel,
    navButtonClass,
    prevButtonClass,
    nextButtonClass,
    navIconSize,
    prevIcon: PrevIcon,
    nextIcon: NextIcon,
    dotsContainerClass,
    dotInactiveClass,
    dotActiveClass,
    dotWidthInactive,
    dotWidthActive,
    autoplayDelay,
    readAllContainerClass,
    readAllLinkClass,
    readAllText,
    readAllHref,
  } = finalConfig;

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;

    testimonialsApi.getPublic()
      .then((data) => {
        if (!alive) return;
        // Keep only brand testimonials
        const brandItems = (Array.isArray(data) ? data : [])
          .filter(item => item.sourceType === "BRAND" || item.brand);
        setTestimonials(brandItems);
      })
      .catch(() => {
        if (!alive) return;
        setTestimonials([]);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const count = testimonials.length;

  const goTo = useCallback(
    (index) => {
      if (!count) return;
      setActive(((index % count) + count) % count);
    },
    [count]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setInterval(next, autoplayDelay);
    return () => clearInterval(timerRef.current);
  }, [paused, count, next, autoplayDelay]);

  const current = testimonials[active];
  const currentLogo = current?.brand?.logo;
  const currentHref = current?.brand ? `/brands/${current.brand.slug}` : null;

  if (!loading && count === 0) return null;

  return (
    <section className={sectionClass}>
      <div className={containerClass}>
        {/* Header */}
        <div className={headerContainerClass}>
          <span className={headerBadgeClass}>{headerBadgeText}</span>
          <h2 className={headingClass}>{headingText}</h2>
        </div>

        {loading ? (
          <div className={loadingSkeletonClass} />
        ) : (
          <div
            className={cardContainerClass}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <QuoteIcon className={quoteIconClass} size={quoteIconSize} />

            <div className={contentClass}>
              {/* Stars */}
              <div className={starsContainerClass}>
                {[...Array(starCount)].map((_, i) => (
                  <StarIcon key={i} size={starIconSize} fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              {/* Testimony text */}
              <p className={testimonyClass}>“{current?.testimony}”</p>

              {/* Author info */}
              <div className={authorContainerClass}>
                {/* <span className={avatarContainerClass}>
                  {currentLogo ? (
                    <img src={currentLogo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    avatarFallbackEmojis[active % avatarFallbackEmojis.length]
                  )}
                </span> */}
                <div className={authorDetailsClass}>
                  <div className={authorNameClass}>
                    {current?.designation ? `${current.designation} · ` : ""}
                    {currentHref ? (
                      <Link href={currentHref} className={authorLinkClass}>
                        {current?.companyName}
                      </Link>
                    ) : (
                      current?.companyName
                    )}
                    <span className={authorBadgeClass}>· {authorBadgeLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            {count > 1 && (
              <>
                <button
                  aria-label="Previous testimonial"
                  onClick={prev}
                  className={`${navButtonClass} ${prevButtonClass}`}
                >
                  <PrevIcon size={navIconSize} />
                </button>
                <button
                  aria-label="Next testimonial"
                  onClick={next}
                  className={`${navButtonClass} ${nextButtonClass}`}
                >
                  <NextIcon size={navIconSize} />
                </button>

                {/* Dots */}
                <div className={dotsContainerClass}>
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to testimonial ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={`${i === active ? dotActiveClass : dotInactiveClass} ${
                        i === active ? dotWidthActive : dotWidthInactive
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* "Read All" button */}
        {count > 0 && (
          <div className={readAllContainerClass}>
            <Link href={readAllHref} className={readAllLinkClass}>
              {readAllText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}