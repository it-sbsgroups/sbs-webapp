"use client";

// 1. DUMMY DATA FOR FEATURES (Easily driven from Admin Panel / Database)
const dummyFeatures = [
  {
    id: 1,
    icon: (
      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Premium Quality & Certified",
    description: "All products match global standards and come with safety approvals like CE, EN, ANSI, BIS, and DGMS.",
  },
  {
    id: 2,
    icon: (
      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Authorized Network",
    description: "Official channel partners for major industrial manufacturing brands ensuring genuine supply.",
  },
  {
    id: 3,
    icon: (
      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "20+ Years of Experience",
    description: "Deep rooted domain expertise in servicing heavy mining, core power, and manufacturing sectors.",
  },
];

// 2. DUMMY DATA FOR INDUSTRIAL SOLUTIONS (Connected to categories page)
const dummySolutions = [
  { id: 1, name: "Industrial Safety", slug: "safety", count: "120+ Items" },
  { id: 2, name: "Professional Tools", slug: "tools", count: "85+ Items" },
  { id: 3, name: "Lubrication Systems", slug: "lubrication", count: "40+ Items" },
  { id: 4, name: "Spares & Aerosols", slug: "spares", count: "90+ Items" },
  { id: 5, name: "Mechanical Components", slug: "mechanical", count: "150+ Items" },
  { id: 6, name: "Lifting Equipment", slug: "lifting", count: "35+ Items" },
];

export default function FeaturesAndSolutions() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* ================= PART A: WHY CHOOSE US BLOCK ================= */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8 items-start">
          {/* Main Context Left Heading */}
          <div className="space-y-4 lg:col-span-1">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Why Choose SBS Group?
            </span>
            <h2 className="text-3xl font-black tracking-tight text-blue-900 sm:text-4xl uppercase">
              Leading Industry With Innovation
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              We combine absolute market expertise, brand trust, and seamless delivery timelines to bring uncompromised value to heavy core sectors.
            </p>
          </div>

          {/* Features Dynamic Mapping (Admin Panel Control Ready) */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2">
            {dummyFeatures.map((feature) => (
              <div 
                key={feature.id} 
                className="flex items-start space-x-4 p-5 rounded-xl border border-gray-100 bg-gray-50 transition duration-300 hover:bg-gray-100/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 border border-red-100">
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= PART B: CORE SOLUTIONS PORTFOLIO GRID ================= */}
        <div className="space-y-10 pt-10 border-t border-gray-100">
          
          {/* Header Title for Category Links */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-blue-900 sm:text-3xl uppercase">
              Our Core Industrial Solutions
            </h2>
            <div className="h-1 w-16 bg-red-600 mx-auto rounded-full" />
          </div>

          {/* Solution Category Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {dummySolutions.map((solution) => (
              <a
                key={solution.id}
                href={`/products?category=${solution.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-gray-200 p-6 text-center transition-all duration-300 hover:border-blue-900 hover:shadow-lg hover:-translate-y-1 bg-white"
              >
                {/* Visual Accent Bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gray-100 transition-colors group-hover:bg-blue-900" />
                
                {/* Solution Meta */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-black tracking-tight text-gray-800 transition group-hover:text-blue-900 uppercase">
                    {solution.name}
                  </h3>
                  <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    {solution.count}
                  </span>
                </div>
              </a>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}