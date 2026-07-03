"use client";

const clients = [
  {
    name: "Northern Coalfields Ltd (NCL)",
    logo: "https://sbsgroups.co.in/assets/7-gxWNX6DG.webp",
    url: "https://www.nclcil.in/",
  },
  {
    name: "NTPC Limited",
    logo: "https://sbsgroups.co.in/assets/6-wlFXflvm.webp",
    url: "https://www.ntpc.co.in/",
  },
  {
    name: "Hindalco Industries",
    logo: "https://sbsgroups.co.in/assets/2-BEdwMCg4.webp",
    url: "https://www.hindalco.com/",
  },
  {
    name: "Coal India Limited",
    logo: "/logos/coal-india.png",
    url: "https://www.coalindia.in/",
  },
  {
    name: "Tata Projects",
    logo: "https://sbsgroups.co.in/assets/9-DiZBQZuz.webp",
    url: "https://tataprojects.com/",
  },
  {
    name: "Larsen & Toubro (L&T)",
    logo: "https://sbsgroups.co.in/assets/4-Cm7IJDPQ.webp",
    url: "https://www.larsentoubro.com/",
  },
];

// Duplicate 4 times → enough to cover any viewport width
const scrollingClients = [...clients, ...clients, ...clients, ...clients];

export default function ClientSlider() {
  return (
    <section className="relative overflow-hidden py-12 bg-white/80 backdrop-blur-xl">
      {/* Heading */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mb-8">
        <h2 className="mt-6 text-4xl md:text-5xl font-bold text-blue-950">Our Trusted <span className="text-lime-500">Clients</span></h2>
      </div>

      {/* Slider – full viewport width, no fades */}
      <div className="relative flex w-screen overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap" style={{ willChange: "transform" }} >
          {scrollingClients.map((client, index) => (
            <div key={index} className="group relative mx-4" style={{ perspective: "1200px" }} >
              {/* Glass‑style card without expensive backdrop‑blur */}
              <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-slate-300/40 bg-slate-200/70 transition-[transform,box-shadow] duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.4)",
                }} >
                {/* Top highlight – subtle and static */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                {/* Logo */}
                <img src={client.logo} alt={client.name}
                  className="relative z-10 h-full w-full object-cover grayscale transition-[filter,transform] duration-700"
                  style={{
                    transform: "translateZ(50px)",
                    filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.1))",
                  }} />

                {/* Glow border – appears only on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(100,116,139,0.4), 0 0 40px rgba(100,116,139,0.15)",
                  }} />
              </div>

              {/* Tooltip with company name */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="rounded-full border border-slate-400/40 bg-slate-800/90 px-3 py-1.5 backdrop-blur-xl shadow-2xl">
                  <span className="text-[10px] font-semibold text-slate-200 whitespace-nowrap">
                    {client.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-25%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}