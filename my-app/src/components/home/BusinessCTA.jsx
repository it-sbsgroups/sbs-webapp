"use client";

import Link from "next/link";

// DUMMY SCHEMAS FOR ADMIN ACCESSIBILITY LATER
const dummyCtaData = {
  title: "Ready to Take Your Business to the Next Level?",
  description: "Contact us today to discover how our products and services can help your business succeed",
  primaryBtnText: "Get Started Now",
  primaryBtnLink: "/contact",
  secondaryBtnText: "View Products",
  secondaryBtnLink: "/products"
};

export default function BusinessCTA() {
  return (
    <section className="relative w-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-600 py-16 md:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Section Heading */}
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3.5xl lg:text-4xl text-balance">
          {dummyCtaData.title}
        </h2>

        {/* Sub-text Paragraph Description */}
        <p className="mx-auto max-w-2xl text-sm md:text-base text-blue-100/90 leading-relaxed font-medium">
          {dummyCtaData.description}
        </p>

        {/* Buttons Action Group (Stacked on mobile, side-by-side on screens >= sm) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          
          {/* Primary Action Button */}
          <Link
            href={dummyCtaData.primaryBtnLink}
            className="w-full sm:w-auto min-w-[160px] rounded bg-white px-6 py-3 text-center text-xs md:text-sm font-bold text-blue-950 transition-all duration-200 hover:bg-gray-100 shadow-md uppercase tracking-wider"
          >
            {dummyCtaData.primaryBtnText}
          </Link>

          {/* Secondary Action Button */}
          <Link
            href={dummyCtaData.secondaryBtnLink}
            className="w-full sm:w-auto min-w-[160px] rounded bg-white px-6 py-3 text-center text-xs md:text-sm font-bold text-blue-950 transition-all duration-200 hover:bg-gray-100 shadow-md uppercase tracking-wider"
          >
            {dummyCtaData.secondaryBtnText}
          </Link>

        </div>

      </div>
    </section>
  );
}