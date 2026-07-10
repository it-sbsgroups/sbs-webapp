"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

const DEFAULT_ABOUT = {
  headingPart1: "Leading the Industry with",
  headingPart2: "Innovation",
  description: "<p>SBS GROUPS – a trusted name among the leading Industrial Products Suppliers, is known for delivering excellence, reliability, and a wide range of solutions for diverse industries. We deal in an extensive product portfolio that includes Industrial Safety Equipment, Fire Extinguishers, Road Safety Products, Hand & Power Tools, Mechanical Components, Electrical Supplies, and many others.</p>",
  features: ["Premium Quality Products", "Authorized Network", "24/7 Customer Support", "Best After-Sales Service", "Competitive Pricing", "Fast Delivery Services"],
  imageSrc: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
  ctaText: "Learn More About Us",
  ctaLink: "/about",
};

export default function AboutIntro() {
  const [content, setContent] = useState(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    siteConfigApi.getHomeAbout()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setContent((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.warn("Failed to load homeAbout:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
              {content.headingPart1}{" "}
              <span className="block text-lime-500 mt-1 md:inline md:mt-0">
                {content.headingPart2}
              </span>
            </h2>

            <RichTextRenderer html={content.description} className="text-sm text-gray-600 leading-relaxed font-normal text-justify" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f8e41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
                  </div>
                  <span className="text-xs font-bold text-blue-950 tracking-tight">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href={content.ctaLink} className="inline-flex items-center space-x-2 rounded bg-blue-900 px-5 py-2.5 text-xs font-bold tracking-wider text-white transition-all duration-150 hover:bg-blue-800 shadow">
                <span>{content.ctaText}</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 w-full">
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-xl transition-transform duration-300 hover:scale-[1.01]">
              <img src={content.imageSrc} alt="Industrial control analytics" className="w-full h-auto object-cover max-h-[400px]" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}