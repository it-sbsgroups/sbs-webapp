"use client";

import { useEffect, useState } from "react";
import clientsApi from "@/lib/clientsApi";

export default function ClientSlider() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await clientsApi.getPublic();
        const mapped = (Array.isArray(data) ? data : [])
          .filter((c) => c.isActive !== false && !!c.logo)
          .map((c) => ({
            name: c.companyName || c.name,
            logo: c.logo,
            url: c.website || undefined,
          }));
        if (!cancelled) {
          setClients(mapped);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch clients for carousel:", error);
        if (!cancelled) setClients([]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Duplicate 4 times to ensure smooth infinite scroll
  const scrollingClients = clients.length ? [...clients, ...clients, ...clients, ...clients] : [];

  if (!loading && clients.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-12 bg-white/50 backdrop-blur-xl">
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mb-8">
        <h2 className="mt-6 text-4xl md:text-5xl font-bold text-blue-950">Our Trusted <span className="text-lime-500">Clients</span></h2>
      </div>

      <div className="relative flex w-screen overflow-hidden" suppressHydrationWarning>
        <div className="flex animate-scroll whitespace-nowrap" style={{ willChange: "transform" }} >
          {scrollingClients.map((client, index) => {
            const card = (
              <div key={index} className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-slate-300/40 bg-white transition-[transform,box-shadow] duration-700 group mx-4 p-3" style={{transformStyle: "preserve-3d", boxShadow: "0 10px 30px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.4)", }} >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <img loading="lazy" src={client.logo} alt={client.name} className="relative z-10 max-h-full max-w-full object-contain transition-[filter,transform] duration-700" style={{ transform: "translateZ(50px)", filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.1))", }} />
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "0 0 20px rgba(100,116,139,0.4), 0 0 40px rgba(100,116,139,0.15)", }} />
              </div>
            );
            return (
              <div key={index} className="group relative" style={{ perspective: "1200px" }}>
                {client.url ? (
                  <a href={client.url} target="_blank" rel="noopener noreferrer">{card}</a>
                ) : (
                  card
                )}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="rounded-full border border-slate-400/40 bg-slate-800/90 px-3 py-1.5 backdrop-blur-xl shadow-2xl">
                    <span className="text-[10px] font-semibold text-slate-200 whitespace-nowrap">{client.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .animate-scroll {
          animation: scroll 20s linear infinite;
          will-change: transform;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-25%, 0, 0); }
        }
      `}</style>
    </section>
  );
}