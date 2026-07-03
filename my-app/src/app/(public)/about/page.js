"use client";
// =============================================================================
// FILE: src/app/(public)/about/page.js  (FULL REPLACEMENT)
// Pulls everything live from the site-config API (branding, about, founders).
// Layout mirrors sbsgroups.co.in/about: hero statement → journey timeline →
// vision/mission cards → core values grid → founders → rich content.
// =============================================================================

import { useState, useEffect } from "react";
import siteConfigApi from "@/lib/siteConfigApi";

const Icon = ({ n, cls = "" }) => (
  <span className={`material-symbols-outlined leading-none ${cls}`}>{n}</span>
);

function SectionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-24 bg-slate-100 rounded-2xl" />
    </div>
  );
}

export default function PublicAboutPage() {
  const [branding, setBranding] = useState({});
  const [about,    setAbout]    = useState({});
  const [founders, setFounders] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      siteConfigApi.getBranding(),
      siteConfigApi.getAbout(),
      siteConfigApi.getFounders(),
    ])
      .then(([b, a, f]) => { setBranding(b || {}); setAbout(a || {}); setFounders(f || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const journeyImages = about?.journey?.images || [];
  const visionMission  = about?.visionMission || [];
  const coreValues     = about?.coreValues || [];

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 antialiased">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-16">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-md uppercase tracking-widest">
            About {branding.companyName || "SBS Groups"}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {branding.tagline || "Building Industrial Trust, One Partnership at a Time"}
          </h1>
        </div>

        {/* ── RICH CONTENT (task 12) ─────────────────────────────────────── */}
        {loading ? (
          <SectionSkeleton />
        ) : about.richContent ? (
          <div
            className="max-w-3xl mx-auto prose prose-slate prose-sm md:prose-base
                       prose-headings:font-black prose-headings:text-slate-900
                       prose-a:text-blue-700"
            dangerouslySetInnerHTML={{ __html: about.richContent }}
          />
        ) : null}

        {/* ── OUR JOURNEY (task 13) ───────────────────────────────────────── */}
        {!loading && journeyImages.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Our Journey</h2>
              <p className="text-lg font-black text-slate-900 mt-1">Milestones That Define Us</p>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-10">
                {journeyImages.map((img, i) => (
                  <div key={i} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                    <div className="flex-1">
                      <img loading="lazy" src={img.url} alt={img.caption || ""} className="w-full rounded-2xl border border-slate-200 shadow-sm object-cover max-h-80" />
                    </div>
                    <div className="flex-1 text-center md:text-left px-4">
                      {img.year && (
                        <span className="inline-block text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full mb-2">{img.year}</span>
                      )}
                      {img.caption && <p className="text-sm text-slate-600 font-medium leading-relaxed">{img.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VISION & MISSION (task 14) ─────────────────────────────────── */}
        {!loading && visionMission.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visionMission.map((vm, i) => (
              <div key={i} className="bg-slate-900 text-white p-7 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Icon n={vm.icon || "star"} cls="text-2xl text-lime-400" />
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {vm.type === "mission" ? "Our Mission" : "Our Vision"}
                  </h3>
                </div>
                <div className="space-y-3">
                  {(vm.points || []).map((pt, pi) => (
                    <div key={pi}>
                      {pt.heading && <p className="text-xs font-black text-lime-400 uppercase mb-0.5">{pt.heading}</p>}
                      <p className="text-sm text-slate-300 leading-relaxed">{pt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CORE VALUES (task 15) ───────────────────────────────────────── */}
        {!loading && coreValues.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">What Drives Us</h2>
              <p className="text-lg font-black text-slate-900 mt-1">Our Core Values</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreValues.map((cv, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 hover:border-blue-300 hover:shadow-md transition-all">
                  <span className="text-xs font-black text-blue-900 bg-white border border-blue-100 px-2 py-0.5 rounded-md">0{i + 1}</span>
                  <h3 className="text-sm font-black text-slate-900">{cv.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{cv.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOUNDERS ─────────────────────────────────────────────────────── */}
        {!loading && (founders.founder?.name || founders.coFounder?.name) && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Leadership</h2>
              <p className="text-lg font-black text-slate-900 mt-1">Meet Our Founders</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[founders.founder, founders.coFounder].filter((f) => f?.name).map((f, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-3 shadow-sm">
                  {f.photoUrl ? (
                    <img loading="lazy" src={f.photoUrl} alt={f.name} className="w-24 h-28 object-cover rounded-2xl mx-auto border border-slate-200" />
                  ) : (
                    <div className="w-24 h-28 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Icon n="person" cls="text-3xl text-slate-300" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-black text-slate-900">{f.name}</p>
                    <p className="text-[11px] text-blue-800 font-bold uppercase tracking-wide">{f.designation}</p>
                  </div>
                  {f.emails?.[0] && (
                    <a href={`mailto:${f.emails[0]}`} className="text-xs text-slate-500 hover:text-blue-700 font-medium block">
                      {f.emails[0]}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}