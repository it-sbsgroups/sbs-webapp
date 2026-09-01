// src/components/public/OurJourney.jsx
"use client";

import { useEffect, useState } from "react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

/**
 * Public "Our Journey" section with full 100% screen width green background.
 */
export default function OurJourney() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    siteConfigApi
      .getAbout()
      .then((d) => {
        if (!alive) return;
        const images = d?.journey?.images || [];
        setImage(images.length ? images[images.length - 1] : null);
      })
      .catch(() => alive && setImage(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && !image) return null;

  return (
    <section className="w-full">
      {/* Title */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tight">
            Our <span className="text-[#557b01]">Journey</span>
          </h2>
        </div>
      </div>

      {/* 100% Full-Width Green Background Bar matching image height */}
      <div className="w-full bg-[#557b00] py-4 shadow-xl flex justify-center items-center">
        {loading ? (
          <div className="h-[350px] w-full bg-[#557b00] opacity-80 animate-pulse" />
        ) : (
          <img
            src={image.url}
            alt={image.caption || "Our Journey"}
            className="max-h-[650px] w-auto max-w-[95vw] md:max-w-5xl object-contain block mx-auto py-2"
          />
        )}
      </div>
    </section>
  );
}