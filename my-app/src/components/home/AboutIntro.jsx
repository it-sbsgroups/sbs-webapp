"use client";

import Link from "next/link";
import { dummyAboutContent } from "@/data/aboutIntro";

export default function AboutIntro() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Grid Matrix matching screenshot */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* LEFT CONTAINER: Text & Checkmarks (6 Columns on Large Desktop screens) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Main Header Typography */}
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
              {dummyAboutContent.headingPart1}{" "}
              <span className="block text-lime-500 mt-1 md:inline md:mt-0">
                {dummyAboutContent.headingPart2}
              </span>
            </h2>

            {/* Paragraph Body Content */}
            <p className="text-sm text-gray-600 leading-relaxed font-normal text-justify">
              {dummyAboutContent.description}
            </p>

            {/* Features Green Grid (Exactly 2 columns on tablets/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2">
              {dummyAboutContent.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2.5">
                  {/* Custom green circular checkmark matching the live design layout */}
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-300">
                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-blue-950 tracking-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button Box Layout */}
            <div className="pt-4">
              <Link
                href={dummyAboutContent.ctaLink}
                className="inline-flex items-center space-x-2 rounded bg-blue-900 px-5 py-2.5 text-xs font-bold tracking-wider text-white transition-all duration-150 hover:bg-blue-800 shadow"
              >
                <span>{dummyAboutContent.ctaText}</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* RIGHT CONTAINER: Graphic Image Visual (6 Columns with shadow layout matching card look) */}
          <div className="lg:col-span-6 w-full">
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-xl transition-transform duration-300 hover:scale-[1.01]">
              <img
                src={dummyAboutContent.imageSrc}
                alt="Industrial control analytics and metrics interface board design"
                className="w-full h-auto object-cover max-h-[400px]"
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}