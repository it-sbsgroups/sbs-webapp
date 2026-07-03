"use client";

import { useMemo } from "react";
import { JOURNEY_MILESTONES } from "@/data/journey";

export default function CorporateJourneyTimeline() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans py-16 px-4 sm:px-6 lg:px-8">
      
      {/* SECTION HEADER ZONE */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-900 px-3 py-1 rounded-full border border-blue-200">
          Corporate Timeline Evolution
        </span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
          The Journey of SBS Groups
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
          From a focused regional setup to an industrial distribution powerhouse serving 
          Central India's heavy manufacturing clusters.
        </p>
      </div>

      {/* TIMELINE TRACK MECHANISM */}
      <div className="max-w-5xl mx-auto relative">
        
        {/* CENTER AXIS PATH (The winding green line abstraction) */}
        <div className="absolute left-4 md:left-1/2 top-2 bottom-2 w-1 bg-gradient-to-b from-lime-400 via-emerald-500 to-green-600 md:-translate-x-1/2 rounded-full shadow-inner opacity-80" />

        <div className="space-y-12 md:space-y-16 relative">
          {JOURNEY_MILESTONES.map((milestone, idx) => (
            <div 
              key={milestone.year} 
              className={`flex flex-col md:flex-row items-start ${
                milestone.side === "left" ? "md:flex-row-reverse" : ""
              } relative`}
            >
              
              {/* COMPONENT 1: SPACER CORNER FOR PERFECT GRID ALIGNMENT */}
              <div className="w-full md:w-1/2 hidden md:block" />

              {/* COMPONENT 2: INTERACTIVE DYNAMIC RADIAL NODE INSIGNIA */}
              <div className={`absolute left-4 md:left-1/2 w-10 h-10 rounded-full border-4 shadow-md bg-white flex items-center justify-center z-20 -translate-x-1/2 transition-transform duration-300 hover:scale-110 select-none ${
                milestone.isFuture ? "border-red-500 ring-4 ring-red-100" : "border-lime-500 ring-4 ring-lime-100"
              }`}>
                <span className={`text-[11px] font-black tracking-tighter ${
                  milestone.isFuture ? "text-red-600" : "text-slate-900"
                }`}>
                  {milestone.year}
                </span>
              </div>

              {/* COMPONENT 3: CONTENT MATRIC CARD */}
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8 group">
                <div className={`bg-white border p-5 md:p-6 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md ${
                  milestone.isFuture 
                    ? "border-red-200 hover:border-red-400" 
                    : "border-slate-200/80 hover:border-lime-500/50"
                }`}>
                  
                  {/* Card Header & Badging */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      milestone.isFuture 
                        ? "bg-red-50 text-red-600 border-red-200" 
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {milestone.isFuture ? "🎯 Future Outlook" : `🏁 Milestone — 0${idx + 1}`}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-black tracking-tight transition-colors ${
                    milestone.isFuture 
                      ? "text-red-600 group-hover:text-red-700" 
                      : "text-slate-900 group-hover:text-lime-600"
                  }`}>
                    {milestone.title}
                  </h3>

                  {/* Body Paragraph Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 whitespace-normal">
                    {milestone.description}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* METRIC BOTTOM FOOTER SUMMARY CARD */}
      <div className="max-w-xl mx-auto text-center mt-20 bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <p className="text-xs font-semibold text-slate-400 leading-relaxed">
          ⚡ Building partnerships and scaling operations continuously since <b className="text-white font-black">2005</b>. 
          SBS Groups is driven by precision engineering delivery compliance.
        </p>
      </div>

    </div>
  );
}