// src/components/public/HeroCarousel.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import carouselApi from "@/lib/carouselApi";

// ------------------------------------------------------------------
// Reasonable defaults so the carousel does not crash even before the
// API responds.  They are overridden by whatever the admin configures.
// ------------------------------------------------------------------
const DEFAULT_SETTINGS = {
  autoplay: true,
  overlayOpacity: 0.55,
  carouselHeight: "650vh",
  prevButton: true,
  nextButton: true,
  bottomDots: true,
};

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slides, setSlides] = useState([]);          // no more dummy slides
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const videoRef = useRef(null);

  // Fetch live data from the backend – only source of slides / settings.
  useEffect(() => {
    (async () => {
      try {
        const { slides: s, settings: cfg } = await carouselApi.getPublic();
        if (Array.isArray(s) && s.length) setSlides(s);
        if (cfg && Object.keys(cfg).length) {
          setSettings((prev) => ({ ...prev, ...cfg }));
        }
      } catch {
        // API unreachable → stays with empty slides and default settings
      }
    })();
  }, []);

  // Listen for real‑time admin updates (custom event).
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.slides) setSlides(e.detail.slides);
      if (e.detail?.settings) setSettings(e.detail.settings);
    };
    window.addEventListener("carousel-admin-update", handleUpdate);
    return () => window.removeEventListener("carousel-admin-update", handleUpdate);
  }, []);

  // Guard against empty slides
  const currentSlide = slides[currentIndex] || slides[0];

  // ----- HELPERS (unchanged) -----
  const toBool = (v) => v === true || v === "true";
  const mediaType = (currentSlide?.mediaType || "IMAGE").toUpperCase();
  const isVideo = mediaType === "VIDEO";
  const isLoopingVideo = isVideo && toBool(currentSlide?.videoLoop);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handleVideoEnded = () => {
    if (isVideo && !isLoopingVideo) nextSlide();
  };

  // Reload video when slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  // Autoplay timer
  useEffect(() => {
    if (isHovered || isLoopingVideo || isVideo || !settings.autoplay) return;
    const duration = (currentSlide?.nextSlideIn || 5) * 1000;
    const timer = setTimeout(() => nextSlide(), duration);
    return () => clearTimeout(timer);
  }, [currentIndex, isHovered, isVideo, isLoopingVideo, settings.autoplay, currentSlide, nextSlide]);

  // ----- STYLING HELPERS (unchanged) -----
  const getAlignmentClass = (layout) => {
    const val = (layout || "LEFT").toUpperCase();
    if (val === "CENTER") return "items-center text-center mx-auto";
    if (val === "RIGHT") return "items-end text-right ml-auto";
    return "items-start text-left mr-auto";
  };

  const getBackgroundStyle = (slide) => {
    const type = (slide?.mediaType || "IMAGE").toUpperCase();
    if (type === "SOLID") {
      return { backgroundColor: slide.solidColor || "#0f172a" };
    }
    if (type === "GRADIENT") {
      const g = slide.gradientColor || {};
      if (g.gradientType === "radial") {
        return { background: `radial-gradient(circle, ${g.gradientColorStarts}, ${g.gradientColorEnds})` };
      }
      return { background: `linear-gradient(${g.gradientDirection || "to right"}, ${g.gradientColorStarts}, ${g.gradientColorEnds})` };
    }
    return {
      backgroundImage: `url(${slide?.mediaUrl || ""})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  const getButtonBackground = (btnStyle) => {
    if (!btnStyle?.backgroundColor) return "#1e3a8a";
    const bg = btnStyle.backgroundColor;
    if (bg.mediatype === "SOLID") return bg.solid || "#1e3a8a";
    if (bg.mediatype === "GRADIENT") {
      const g = bg.gradient || {};
      if (g.gradientType === "radial") {
        return `radial-gradient(circle, ${g.gradientColorStarts}, ${g.gradientColorEnds})`;
      }
      return `linear-gradient(${g.gradientDirection || "to right"}, ${g.gradientColorStarts}, ${g.gradientColorEnds})`;
    }
    return bg.solid || "#1e3a8a";
  };

  // ----- EMPTY STATE -----
  if (!slides.length) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-semibold">No slides configured</p>
      </div>
    );
  }

  // ----- RENDER -----
  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{ height: settings.carouselHeight || "650px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SLIDES WRAPPER */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const type = (slide.mediaType || "IMAGE").toUpperCase();
          const isActive = idx === currentIndex;

          return (
            <div key={slide.id || idx} className="relative h-full w-full flex-shrink-0">
              {/* BACKGROUND */}
              {type === "VIDEO" ? (
                <video
                  ref={isActive ? videoRef : null}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted={!toBool(slide.videoSound)}
                  playsInline
                  loop={toBool(slide.videoLoop)}
                  onEnded={isActive ? handleVideoEnded : undefined}
                >
                  <source src={slide.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 h-full w-full" style={getBackgroundStyle(slide)} />
              )}

              {/* OVERLAY */}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: settings.overlayOpacity ?? 0.55 }}
              />

              {/* CONTENT */}
              <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12 lg:px-16">
                <div className={`max-w-2xl text-white space-y-4 md:space-y-6 flex flex-col ${getAlignmentClass(slide.layoutType)}`}>
                  {/* BADGE */}
                  {/* {slide.badge && (
                    <span
                      className="inline-block"
                      style={{
                        color: slide.badgeStyle?.fontColor || "#fff",
                        backgroundColor: slide.badgeStyle?.backgroundColor || "#e98a0f",
                        padding: slide.badgeStyle?.padding || "6px 14px",
                        fontWeight: slide.badgeStyle?.fontWeight || "700",
                        letterSpacing: slide.badgeStyle?.letterSpacing || "0.05em",
                        textTransform: slide.badgeStyle?.textTransform || "uppercase",
                        borderRadius: slide.badgeStyle?.borderRadius || "4px",
                        transition: slide.badgeStyle?.transition || "all 0.3s ease",
                        cursor: "default",
                      }}
                    >
                      {slide.badge}
                    </span>
                  )} */}

                  {/* TITLE */}
                  {/* {slide.title && (
                    <h1
                      className="text-balance"
                      style={{
                        color: slide.titleStyle?.fontColor || "#fff",
                        fontWeight: slide.titleStyle?.fontWeight || "900",
                        letterSpacing: slide.titleStyle?.letterSpacing || "-0.02em",
                        textTransform: slide.titleStyle?.textTransform || "none",
                        fontSize: slide.titleStyle?.fontSize === "text-6xl" ? "3.75rem" :
                                 slide.titleStyle?.fontSize === "text-5xl" ? "3rem" :
                                 slide.titleStyle?.fontSize === "text-4xl" ? "2.25rem" :
                                 slide.titleStyle?.fontSize === "text-3xl" ? "1.875rem" :
                                 slide.titleStyle?.fontSize === "text-2xl" ? "1.5rem" : "3rem",
                        lineHeight: slide.titleStyle?.lineHeight === "leading-tight" ? "1.25" :
                                    slide.titleStyle?.lineHeight === "leading-snug" ? "1.375" :
                                    slide.titleStyle?.lineHeight === "leading-normal" ? "1.5" : "1.25",
                        transition: slide.titleStyle?.transition || "all 0.3s ease",
                      }}
                    >
                      {slide.title}
                    </h1>
                  )} */}

                  {/* DESCRIPTION */}
                  {/* {slide.description && (
                    <p
                      className="max-w-xl"
                      style={{
                        color: slide.descriptionStyle?.fontColor || "#e2e8f0",
                        fontWeight: slide.descriptionStyle?.fontWeight || "400",
                        letterSpacing: slide.descriptionStyle?.letterSpacing || "0em",
                        textTransform: slide.descriptionStyle?.textTransform || "none",
                        fontSize: slide.descriptionStyle?.fontSize === "text-xl" ? "1.25rem" :
                                 slide.descriptionStyle?.fontSize === "text-lg" ? "1.125rem" :
                                 slide.descriptionStyle?.fontSize === "text-base" ? "1rem" :
                                 slide.descriptionStyle?.fontSize === "text-sm" ? "0.875rem" : "1.125rem",
                        lineHeight: slide.descriptionStyle?.lineHeight === "leading-relaxed" ? "1.625" :
                                    slide.descriptionStyle?.lineHeight === "leading-normal" ? "1.5" : "1.625",
                        transition: slide.descriptionStyle?.transition || "all 0.3s ease",
                      }}
                    >
                      {slide.description}
                    </p>
                  )} */}

                  {/* CTA BUTTON */}
                  {slide.ctaText && (
                    <div className="pt-2">
                      <a
                        href={slide.ctaLink || "#"}
                        target={toBool(slide.ctaOpenInNewTab) ? "_blank" : "_self"}
                        rel={toBool(slide.ctaOpenInNewTab) ? "noopener noreferrer" : undefined}
                        className="inline-block"
                        style={{
                          color: slide.ctaButtonStyle?.fontColor || "#fff",
                          background: getButtonBackground(slide.ctaButtonStyle),
                          padding: slide.ctaButtonStyle?.padding || "12px 28px",
                          borderRadius: slide.ctaButtonStyle?.borderRadius || "8px",
                          fontWeight: slide.ctaButtonStyle?.fontWeight || "700",
                          letterSpacing: slide.ctaButtonStyle?.letterSpacing || "0.05em",
                          textTransform: slide.ctaButtonStyle?.textTransform || "uppercase",
                          transition: slide.ctaButtonStyle?.transition || "all 0.3s ease",
                          borderWidth: slide.ctaButtonStyle?.borderWidth || "0px",
                          borderColor: slide.ctaButtonStyle?.borderColor || "transparent",
                          borderStyle: "solid",
                          boxShadow: slide.ctaButtonStyle?.boxShadow || "none",
                        }}
                      >
                        {slide.ctaText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PREV BUTTON */}
      {settings.prevButton && (
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm hover:bg-white/40 transition-all z-10"
          aria-label="Previous slide"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* NEXT BUTTON */}
      {settings.nextButton && (
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm hover:bg-white/40 transition-all z-10"
          aria-label="Next slide"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* BOTTOM DOTS */}
      {settings.bottomDots && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2.5 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? "bg-white w-8" : "bg-white/50 w-2.5"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}