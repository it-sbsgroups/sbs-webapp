"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Raw Extended Media Database for Brands
const GALLERY_REGISTRY = {
  "nexis-automation": {
    brandName: "Nexis Automation",
    photos: [
      "https://placehold.co/800x600/0f172a/ffffff?text=Main+R+and+D+Facility",
      "https://placehold.co/800x600/1e293b/ffffff?text=Edge+Computing+Rig+Testing",
      "https://placehold.co/800x600/334155/ffffff?text=Heavy+Continuous+Loop+Telemetry",
      "https://placehold.co/800x600/475569/ffffff?text=Singrauli+Power+Grid+Integration",
      "https://placehold.co/800x600/64748b/ffffff?text=Assembly+Microchip+Line",
      "https://placehold.co/800x600/0284c7/ffffff?text=CE+Certification+Audit+2025",
      "https://placehold.co/800x600/0369a1/ffffff?text=Smart+Valves+Beta+Trial",
      "https://placehold.co/800x600/0f766e/ffffff?text=Core+Engineering+Team"
    ]
  }
};

export default function BrandDeepNestedGalleryView() {
  const params = useParams();
  const slug = params.slug;

  // Fetch target brand data from dedicated gallery registry
  const folder = useMemo(() => GALLERY_REGISTRY[slug] || null, [slug]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!folder) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col justify-center items-center p-6 text-center">
        <span className="text-4xl mb-3">🖼️</span>
        <h1 className="text-lg font-black text-slate-900">Gallery Sub-Directory Empty</h1>
        <p className="text-xs text-slate-400 mt-1">No media assets mapped under the slug route: <code>/brands/{slug}/gallery</code></p>
        <Link href={`/brands/${slug}`} className="mt-5 text-xs font-black bg-slate-900 text-white px-4 py-2.5 rounded-xl uppercase tracking-wider">
          Return to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 antialiased font-sans pb-16">
      
      {/* GALLERY HUB HEADER */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <Link href={`/brands/${slug}`} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
              ← Back to {folder.brandName} Profile
            </Link>
            <h1 className="text-base md:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Media Repository Label:</span>
              <span className="text-slate-400 font-medium font-mono text-sm">[{slug}]</span>
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl font-bold">
              📂 Total Stocked Assets: {folder.photos.length} Items
            </span>
          </div>
        </div>
      </div>

      {/* DETAILED CARDS GRID LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folder.photos.map((url, index) => (
            <div 
              key={index}
              onClick={() => setLightboxIndex(index)}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-2 group cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl"
            >
              {/* Image Frame */}
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-900 relative">
                <img 
                  src={url} 
                  alt={`Asset Frame ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <span className="absolute bottom-2.5 right-2.5 text-[9px] font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                  FRAME-0{index + 1}
                </span>
              </div>
              
              {/* Asset Caption Card footer */}
              <div className="p-2 pt-3 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Operational Media</span>
                <span className="text-[10px] text-slate-500 group-hover:text-white transition-colors">View Frame ➔</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL SCREEN IMMERSIVE LIGHTBOX OVERLAY SYSTEM */}
      {lightboxIndex !== null && folder.photos[lightboxIndex] && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Action Trigger */}
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 text-xs text-white/70 font-black bg-white/10 px-3 py-2 rounded-xl uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5"
          >
            ✕ Dismiss View
          </button>

          {/* Stepper Controllers */}
          {folder.photos.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + folder.photos.length) % folder.photos.length); }}
              className="absolute left-4 text-white/50 hover:text-white text-3xl font-black bg-slate-900/50 p-3 rounded-full border border-slate-800 transition-all"
            >
              ‹
            </button>
          )}

          {/* Core HD Image viewport */}
          <img 
            loading="lazy" 
            src={folder.photos[lightboxIndex]} 
            alt="Immersive Active Asset View" 
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain border border-slate-800 shadow-2xl"
          />

          {folder.photos.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % folder.photos.length); }}
              className="absolute right-4 text-white/50 hover:text-white text-3xl font-black bg-slate-900/50 p-3 rounded-full border border-slate-800 transition-all"
            >
              ›
            </button>
          )}

          {/* Tracking Layer Counter Indicator */}
          <span className="absolute bottom-6 text-[10px] font-mono text-slate-400 font-bold bg-slate-950 border border-slate-800 px-4 py-2 rounded-full">
            Asset Inventory Index: {lightboxIndex + 1} / {folder.photos.length}
          </span>
        </div>
      )}

    </div>
  );
}