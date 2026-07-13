"use client";

import { useState, useEffect } from "react";
import siteConfigApi from "@/lib/siteConfigApi";
import FounderMessage from "@/components/public/FounderMessage";

const Icon = ({ n, cls = "" }) => (
  <span className={`material-symbols-outlined leading-none ${cls}`}>{n}</span>
);

function SectionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
      <div className="h-24 bg-slate-100 rounded-2xl" />
    </div>
  );
}

export default function PublicAboutPage() {
  const [branding, setBranding] = useState({});
  const [about, setAbout] = useState({});
  const [founders, setFounders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      siteConfigApi.getBranding(),
      siteConfigApi.getAbout(),
      siteConfigApi.getFounders(),
    ])
      .then(([b, a, f]) => {
        setBranding(b || {});
        setAbout(a || {});
        setFounders(f || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const journeyImages = about?.journey?.images || [];
  const visionMission = about?.visionMission || [];
  const coreValues = about?.coreValues || [];
  const companyName = branding.companyName || "SBS Groups";

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 antialiased">
      {/* ── HERO — makita.in style: dark, confident, statement-led ─────────── */}
      <div className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center space-y-5 relative">
          <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1 rounded-full uppercase tracking-widest">About {companyName}</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto">{branding.tagline || "Engineered for Trust. Built for Industry."}</h1>
          <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl mx-auto">Every product we supply, every partnership we build, is held to one standard — reliability our clients can plan their operations around.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 space-y-20">
        {/* ── OUR STORY (rich content, admin-editable) ─────────────────────── */}
        {loading ? (
          <SectionSkeleton />
        ) : about.richContent ? (
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Our Story</h2>
            <div className="prose prose-slate prose-sm md:prose-base mx-auto text-left prose-headings:font-black prose-headings:text-slate-900 prose-a:text-blue-700" dangerouslySetInnerHTML={{ __html: about.richContent }} />
          </div>
        ) : null}

        {!loading && coreValues.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest"> What Drives Us </h2>
              <p className="text-2xl font-black text-slate-900 mt-1">Quality Isn&rsquo;t Inspected In — It&rsquo;s Built In</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreValues.map((cv, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2 hover:border-blue-300 hover:shadow-lg transition-all" >
                  <span className="text-xs font-black text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">0{i + 1}</span>
                  <h3 className="text-sm font-black text-slate-900">{cv.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{cv.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OUR JOURNEY — timeline of milestones ──────────────────────────── */}
        {!loading && journeyImages.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Our Journey</h2>
              <p className="text-2xl font-black text-slate-900 mt-1">Milestones That Define Us</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-10">
                {journeyImages.map((img, i) => (
                  <div key={i} className={`flex flex-col md:flex-row items-center gap-6 ${ i % 2 === 1 ? "md:flex-row-reverse" : "" }`} >
                    <div className="flex-1">
                      <img loading="lazy" src={img.url} alt={img.caption || ""} className="w-full rounded-2xl border border-slate-200 shadow-sm object-cover max-h-80" />
                    </div>
                    <div className="flex-1 text-center md:text-left px-4">
                      {img.year && (
                        <span className="inline-block text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full mb-2">{img.year}</span>
                      )}
                      {img.caption && (
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{img.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VISION & MISSION ──────────────────────────────────────────────── */}
        {!loading && visionMission.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visionMission.map((vm, i) => (
              <div key={i} className="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Icon n={vm.icon || "star"} cls="text-2xl text-lime-400" />
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider">{vm.type === "mission" ? "Our Mission" : "Our Vision"}</h3>
                </div>
                <div className="space-y-3">
                  {(vm.points || []).map((pt, pi) => (
                    <div key={pi}>
                      {pt.heading && (
                        <p className="text-xs font-black text-lime-400 uppercase mb-0.5">{pt.heading}</p>
                      )}
                      <p className="text-sm text-slate-300 leading-relaxed">{pt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FOUNDER / CO-FOUNDER MESSAGE ───────────────────────────────────── */}
        {!loading && <FounderMessage founders={founders} />}
      </div>
    </div>
  );
}
