"use client";

import { useState, useEffect } from "react";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

const DEFAULT_DATA = {
  headingPart1: "Quality Product with Prompt",
  headingPart2: "Service is our principle",
  description: "<p>SBS GROUPS is a trusted name among the leading Industrial Product Suppliers, dealing in a wide range of products including Industrial Safety, Fire Extinguishers, Road Safety, Lubrication Equipment, and Industrial Tools.</p><p>Established in 2005 as a family-owned company, we are located in the Power Capital of India – Singrauli, Madhya Pradesh. We began with a mission to serve the growing safety needs of the mining, power, and metal sectors.</p><p>Today, we deliver quality industrial products approved by CE, EN, ANSI, BIS, and DGMS. Within a short span, SBS has become synonymous with Quality and Safety.</p>",
  growItems: ["Our Customers", "Our Principles", "Our Service Providers", "Our Team"],
  footerText: "We strongly believe business grows not just because we are commercially competitive, but because of the experience we leave behind — respecting commitments, fulfilling promises, and creating value beyond transactions.",
  topBadgeImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500",
  mainWarehouseImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600",
};

export default function PrinciplesSection() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    siteConfigApi.getHomePrinciples()
      .then((d) => {
        if (d && Object.keys(d).length > 0) {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch((err) => console.warn("Failed to load homePrinciples:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 md:py-20 border-t border-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-20 border-t border-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 flex flex-col space-y-4 w-full">
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-md">
              <img loading="lazy" src={data.topBadgeImage} alt="SBS Principles Shield Certifications" className="w-full h-auto object-cover max-h-[140px]" />
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-xl">
              <img src={data.mainWarehouseImage} alt="Quality product with prompt service warehouse infrastructure" className="w-full h-auto object-cover max-h-[380px]" loading="lazy" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 text-gray-700">
            <h2 className="text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl leading-tight">
              {data.headingPart1}{" "} <br></br>
              <span className="block text-lime-500 mt-1 md:inline md:mt-0">{data.headingPart2}</span>
            </h2>

            <div className="text-xs md:text-sm text-gray-600 leading-relaxed text-justify font-normal">
              <RichTextRenderer html={data.description} />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-extrabold text-blue-950 flex items-center">
                We <span className="text-lime-500 mx-1">Grow</span> Together With:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {data.growItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f8e41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
                      {/* <CircleCheckBig /> */}
                    </div>
                    <span className="text-xs font-bold text-blue-950">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 italic pt-4 border-t border-gray-100 leading-relaxed">
              <RichTextRenderer html={data.footerText} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}