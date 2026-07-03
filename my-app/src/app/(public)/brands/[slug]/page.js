"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const PAGE_CONFIG = {
  layout: { container: "max-w-5xl" },
  card: { radius: "2xl", variant: "elevated" },
};

/* ============================ DATA INJECTION ============================== */
const BRANDS_DATASET = [
  {
    id: "BRAND-01",
    slug: "nexis-automation",
    brandName: "Nexis Automation",
    logo: "https://placehold.co/160x160/0f172a/38bdf8?text=NEXIS",
    sector: "Industrial Tech",
    founder: "Rajesh Vardhan",
    coFounder: "Amit K. Sharma",
    establishedIn: "October 2020",
    url: "https://nexisautomation.example.com",
    tagline: "Intelligent Robotics & Edge Computing Ecosystems",
    
    vision: "To eliminate unexpected dangerous downtimes in power generation systems using automated local computing arrays.",
    mission: "Deploy highly redundant, self-healing edge microcontrollers directly at line valves and telemetry loops within 3 years.",
    
    editorDescription: "Nexis started out as an internal experimental wing of SBS Groups. Over the last 6 years, it has become a full-fledged leader in autonomous telemetry architectures. Their hardware has logged over 40,000 operation cycles across automated continuous cast plants without requiring human code patches.",
    
    currentOperations: "Operating heavily across industrial belts of Madhya Pradesh (Singrauli Energy Hub), manufacturing corridors of Gujarat (Sanand), and automation units in Pune, Maharashtra.",
    
    journey: [
      { period: "2020", event: "Incubated as a specialized hardware loop design project within our core technical cell." },
      { period: "2022", event: "Secured complete CE-Industrial certification and finalized real-time OS microkernel kernels." },
      { period: "2024", event: "Scaled operations up to 4 major power plants, managing millions of automated system sensor records daily." },
      { period: "2026", event: "Integrating autonomous deep generative diagnostics inside current operating arrays." }
    ],
    
    awards: [
      { year: "2023", title: "National Heavy Tech Innovation Gold Circle", body: "Awarded for exceptional field dependability in automated plant architecture setups." },
      { year: "2025", title: "Sustainable Clean Plant Infrastructure Laurel", body: "Recognized for optimizing continuous valve control flow loops resulting in carbon reductions." }
    ],
    
    gallery: [
      "https://placehold.co/800x500/0f172a/ffffff?text=Testing+Automation+Lab",
      "https://placehold.co/800x500/1e293b/ffffff?text=Sensor+Integration+Line",
      "https://placehold.co/800x500/334155/ffffff?text=Field+Deployment+Singrauli"
    ]
  }
];

const fallbackImg = (e) => {
  e.currentTarget.src = "https://placehold.co/800x500/f1f5f9/94a3b8?text=Asset+Not+Available";
};

export default function SingleBrandDynamicProfileView() {
  const params = useParams();
  const slug = params.slug;

  const brand = useMemo(() => BRANDS_DATASET.find((b) => b.slug === slug) || null, [slug]);
  const [activeImgIndex, setActiveImgIndex] = useState(null);

  if (!brand) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col justify-center items-center font-sans p-6 text-center">
        <span className="text-5xl mb-4">⚙️</span>
        <h1 className="text-xl font-black text-slate-900">Brand Portfolio Missing</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">No dynamic profile matches the route code <code>/{slug}</code> inside our registries.</p>
        <Link href="/brands" className="mt-6 text-xs font-black bg-slate-900 text-white px-5 py-3 rounded-xl uppercase tracking-wider hover:bg-indigo-600 transition-colors">
          Return to Brands List
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased pb-16">
      {/* HEADER CONTROL BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 py-4 flex justify-between items-center`}>
          <Link href="/brands" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors">
            ← Brand Directory
          </Link>
          {brand.url && (
            <a href={brand.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
              Launch Brand Hub ↗
            </a>
          )}
        </div>
      </div>

      <div className={`${PAGE_CONFIG.layout.container} mx-auto px-4 md:px-8 mt-8 space-y-6`}>
        
        {/* ==================== IDENTITY OVERVIEW HERO ==================== */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
          
          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            <img 
              loading="lazy"
              src={brand.logo} 
              alt={`${brand.brandName} Logo`}
              onError={fallbackImg}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-slate-200/80 p-1 bg-white object-cover shadow-sm shrink-0"
            />
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded">
                  {brand.sector}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                  {brand.brandName}
                </h1>
                <p className="text-xs md:text-sm font-semibold italic text-slate-400 mt-0.5">"{brand.tagline}"</p>
              </div>

              {/* Founder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl text-xs bg-slate-50 border border-slate-200/80 p-3 rounded-xl font-medium">
                <p>👤 <span className="text-slate-400 font-semibold">Founder:</span> <span className="font-bold text-slate-800">{brand.founder || "N/A"}</span></p>
                <p>👥 <span className="text-slate-400 font-semibold">Co-Founder:</span> <span className="font-bold text-slate-800">{brand.coFounder || "N/A"}</span></p>
                <p className="sm:col-span-2 pt-1 mt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                  📅 <span className="font-semibold">Established:</span> {brand.establishedIn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== TWO COLUMN LAYOUT (MISSION & EDITOR) ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT: VISION & MISSION & PRESENT RUNTIME */}
          <div className="md:col-span-1 space-y-6">
            {/* Vision and Mission */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-5">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">The Core Vision</p>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">"{brand.vision}"</p>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Strategic Mission</p>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">{brand.mission}</p>
              </div>
            </div>

            {/* Current Operations Footprint */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">📍 Live Operations Footprint</p>
              <p className="text-xs text-slate-700 font-bold leading-relaxed mt-2 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                {brand.currentOperations}
              </p>
            </div>
          </div>

          {/* RIGHT: EDITOR IN-DEPTH ANALYSIS */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">In-Depth Review by Editorial Desk</h3>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
              {brand.editorDescription}
            </p>
          </div>
        </div>

        {/* ==================== STRATEGIC JOURNEY TIMELINE ==================== */}
        {brand.journey && brand.journey.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-6">Corporate Milestone Journey</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {brand.journey.map((step, idx) => (
                <div key={idx} className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-2xl relative space-y-1.5">
                  <span className="text-lg font-black text-indigo-600 font-mono tracking-tight block">
                    {step.period}
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {step.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== AWARDS & LAURELS ==================== */}
        {brand.awards && brand.awards.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Recognitions & Verified Laurels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brand.awards.map((award, index) => (
                <div key={index} className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-4 rounded-2xl flex gap-3 items-start">
                  <span className="text-xl shrink-0 bg-amber-50 border border-amber-200 rounded-xl p-1.5 leading-none">🏆</span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{award.title}</h4>
                      <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">({award.year})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{award.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== GALLERY VISUAL REPOSITORY ==================== */}
        {brand.gallery && brand.gallery.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Facility & Field Visual Repository</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {brand.gallery.map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImgIndex(idx)}
                  className="h-40 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group relative"
                >
                  <img 
                    src={imgUrl} 
                    loading="lazy" 
                    alt="Gallery Image" 
                    onError={fallbackImg}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-sm font-bold">
                    View Asset 🔍
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX SYSTEM FOR ASSETS */}
      {activeImgIndex !== null && brand.gallery?.[activeImgIndex] && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setActiveImgIndex(null)}
        >
          <button className="absolute top-6 right-6 text-white text-sm font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">✕ Close</button>
          <img 
            src={brand.gallery[activeImgIndex]} 
            loading="lazy"
            alt="Asset View" 
            onError={fallbackImg}
            className="max-h-[85vh] max-w-[95vw] rounded-xl object-contain border border-white/10"
          />
        </div>
      )}
    </div>
  );
}