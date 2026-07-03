// src/components/admin/carousel/CarouselPreview.jsx
"use client";

import { useState, useEffect } from "react";
import carouselApi from "@/lib/carouselApi";

const DEFAULT_SETTINGS = {
  prevButton: true, nextButton: true, bottomDots: true,
  autoplay: true, carouselHeight: "650px", overlayOpacity: 0.55,
};

export default function CarouselPreview() {
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      try {
        const [s, cfg] = await Promise.all([
          carouselApi.getSlides(),
          carouselApi.getSettings(),
        ]);
        setSlides(s || []);
        if (cfg && typeof cfg === "object") setSettings((p) => ({ ...p, ...cfg }));
      } catch (e) {
        console.error("carousel preview load failed:", e);
      }
    })();

    const handleUpdate = (e) => {
      if (e.detail?.slides) setSlides(e.detail.slides);
      if (e.detail?.settings) setSettings(e.detail.settings);
    };
    window.addEventListener("carousel-admin-update", handleUpdate);
    return () => window.removeEventListener("carousel-admin-update", handleUpdate);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Live Preview</h2>
        <p className="mt-1 text-sm text-slate-500">Real-time preview of your carousel. Changes update instantly.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border shadow-lg">
        <div
          className="relative w-full overflow-hidden bg-gray-900"
          style={{ height: "400px" }}
        >
          {slides.length > 0 ? (
            <div
              className="absolute inset-0 flex transition-transform duration-700"
              style={{ backgroundImage: `url(${slides[0]?.mediaUrl || ""})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 bg-black/55" />
              <div className="relative z-10 flex items-center p-8">
                <div className="max-w-lg text-white">
                  {slides[0]?.badge && (
                    <span className="inline-block rounded-md px-4 py-1.5 text-xs font-bold uppercase"
                      style={{ backgroundColor: slides[0]?.badgeStyle?.backgroundColor || "#e98a0f" }}>
                      {slides[0]?.badge}
                    </span>
                  )}
                  <h2 className="mt-3 text-2xl font-black">{slides[0]?.title || "Untitled Slide"}</h2>
                  <p className="mt-2 text-sm opacity-80">{slides[0]?.description || "No description"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              <p className="text-lg">No slides configured</p>
            </div>
          )}

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`h-2 rounded-full ${i === 0 ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* SLIDE LIST */}
      <div className="rounded-2xl border bg-white p-5">
        <h4 className="mb-3 font-semibold">Slide Order ({slides.length} total)</h4>
        <div className="space-y-2">
          {slides.map((slide, i) => (
            <div key={slide.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="font-medium">{slide.title || "Untitled"}</span>
              <span className="ml-auto text-xs text-slate-400">{slide.mediaType} · {slide.layoutType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}