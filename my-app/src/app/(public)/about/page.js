"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import siteConfigApi from "@/lib/siteConfigApi";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import FounderMessage from "@/components/public/FounderMessage";

const ManufacturingIcon = () => (
  <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" xmlns="http://www.w3.org/2000/svg" >
    {/* Handle */}
    <rect x="18" y="68" width="54" height="20" rx="10" transform="rotate(-45 18 68)" fill="#111827" />
    {/* Wrench */}
    <path d="M40 20 C52 10 65 12 73 20 L62 31 L75 44 L86 33 C94 41 95 54 85 64 C75 74 59 74 48 63 C38 52 38 35 40 20Z" fill="#EF4444" />
    {/* Screwdriver */}
    <rect x="64" y="30" width="14" height="62" rx="4" transform="rotate(45 64 30)" fill="#111827" />
    <polygon points="104,24 113,34 100,37" fill="#111827" />
    {/* Accent */}
    <line x1="53" y1="58" x2="90" y2="95" stroke="#EF4444" strokeWidth="5" />
  </svg>
);

const InnovationIcon = () => (
  <svg viewBox="0 0 120 120" className="w-28 h-28" xmlns="http://www.w3.org/2000/svg" >
    {/* Bulb */}
    <path d="M60 18 C42 18 28 33 28 51 C28 64 35 73 43 81 C47 85 50 91 50 97 H70 C70 91 73 85 77 81 C85 73 92 64 92 51 C92 33 78 18 60 18Z" fill="#111827" />
    <rect x="48" y="96" width="24" height="8" rx="3" fill="#EF4444" />
    <rect x="50" y="104" width="20" height="5" rx="2" fill="#111827" />
    {/* Gear */}
    <circle cx="61" cy="53" r="14" fill="#ffffff" />
    <circle cx="61" cy="53" r="6" fill="#EF4444" />

    {[...Array(8)].map((_, i) => (
      <rect key={i} x="59" y="31" width="4" height="8" rx="1" fill="#EF4444" transform={`rotate(${i * 45} 61 53)`} />
    ))}

    {/* Circuit */}
    <circle cx="86" cy="40" r="3" fill="#EF4444" />
    <circle cx="91" cy="52" r="3" fill="#EF4444" />
    <circle cx="86" cy="64" r="3" fill="#EF4444" />
    <line x1="75" y1="45" x2="86" y2="40" stroke="#EF4444" strokeWidth="2" />
    <line x1="75" y1="53" x2="91" y2="52" stroke="#EF4444" strokeWidth="2" />
    <line x1="75" y1="61" x2="86" y2="64" stroke="#EF4444" strokeWidth="2" />
  </svg>
);

const Card = ({ icon, title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-[0_18px_45px_rgba(0,0,0,0.12)] p-10 lg:p-12 mb-10">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-72 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-gray-200 pb-8 lg:pb-0">
          {icon}
          <h2 className="mt-6 text-[42px] leading-none font-black uppercase tracking-tight text-gray-900">{title}</h2>
        </div>
        <div className="flex-1 space-y-6 text-[17px] text-gray-700 leading-8">{children}</div>
      </div>
    </div>
  );
};
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
  const tagline = branding.tagline || "Engineered for Trust. Built for Industry.";

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 antialiased">
      {/* ======================================================================================================================================= */}
      <section className="relative overflow-hidden bg-white py-24">
        {/* Left Dot Pattern */}
        <svg className="absolute left-6 top-16 w-20 opacity-70 hidden lg:block" viewBox="0 0 120 120" fill="none" >
          {[...Array(10)].map((_, row) =>
            [...Array(6)].map((_, col) => (
              <circle key={`${row}-${col}`} cx={12 + col * 18} cy={12 + row * 18} r="2.8" fill="#EF4444" />
            ))
          )}
        </svg>
        {/* Right Triangle */}
        <svg className="absolute right-10 top-12 w-36 opacity-90 hidden lg:block" viewBox="0 0 200 180" fill="none" >
          <polygon points="100,10 190,160 20,130" stroke="#ef4444" strokeWidth="4" />
        </svg>
        {/* Left Circle */}
        <svg className="absolute left-6 top-72 w-10 opacity-30 hidden lg:block" viewBox="0 0 100 100" >
          <circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="3" fill="none" />
        </svg>
        {/* Bottom Left Triangle */}
        <svg className="absolute left-0 bottom-36 w-16 opacity-20 hidden lg:block" viewBox="0 0 100 100" >
          <polygon points="10,90 60,10 90,95" stroke="#ef4444" strokeWidth="3" fill="none" />
        </svg>
        {/* Bottom Right Triangle */}
        <svg className="absolute right-8 bottom-28 w-32 opacity-20 hidden lg:block" viewBox="0 0 200 180" >
          <polygon points="100,10 190,160 20,130" stroke="#ef4444" strokeWidth="3" fill="none" /></svg>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="mt-6 text-4xl md:text-5xl font-black uppercase text-gray-900 leading-tight">About Us</h2>
              <div className="mt-8 h-1 w-24 rounded-full bg-red-600"></div>
              <p className="mt-8 text-gray-600 leading-8">
                {loading ? (
                  <SectionSkeleton />
                ) : about.richContent ? (
                  <div className="max-w-3xl mx-auto text-center space-y-4">
                    <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Our Story</h2>
                    <div className="prose prose-slate prose-sm md:prose-base mx-auto text-left prose-headings:font-black prose-headings:text-slate-900 prose-a:text-blue-700" dangerouslySetInnerHTML={{ __html: about.richContent }} />
                  </div>
                ) : null}
              </p>
              {/* Since */}
              <div className="mt-12 flex items-center gap-6">
                <div>
                  <p className="text-red-600 font-bold uppercase tracking-wider">Since</p>
                  <h3 className="text-6xl font-black text-gray-900">2005</h3>
                </div>
                <div className="h-20 w-px bg-gray-300"></div>
                <p className="text-gray-600 leading-7">Proudly serving industries with innovative safety products, reliable support, and uncompromising quality standards.</p>
              </div>
            </div>
            {/* Right Image */}
            <div className="relative">
              {/* Border */}
              <div className="absolute -left-5 -top-5 h-full w-full border-2 border-red-500 rounded-xl"></div>
              {/* Image */}
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img src="https://res.cloudinary.com/dhrnoojwo/image/upload/v1783947198/ChatGPT_Image_Jul_13_2026_06_23_01_PM_k7cds1.png" alt="About Us" className="h-[550px] w-full object-cover transition duration-700 hover:scale-105" />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-8 left-8 rounded-xl bg-white p-6 shadow-2xl border">
                <h3 className="text-3xl font-black text-red-600">21+</h3>
                <p className="text-gray-600">Years of Excellence</p>
              </div>
              {/* Dot Pattern */}
              <svg className="absolute -left-10 bottom-12 w-20 opacity-70" viewBox="0 0 120 120" >
                {[...Array(7)].map((_, row) =>
                  [...Array(6)].map((_, col) => (
                    <circle key={`${row}${col}`} cx={12 + col * 18} cy={12 + row * 18} r="2.5" fill="#000" />
                  ))
                )}
              </svg>
            </div>
          </div>
        </div>
      </section>
      {/* ======================================================================================================================================= */}
      
      {/* ── HERO — makita.in style: dark, confident, statement-led ─────────── */}
      <div className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center space-y-5 relative">
          <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1 rounded-full uppercase tracking-widest">About {companyName}</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto">{tagline}</h1>
          <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl mx-auto">Every product we supply, every partnership we build, is held to one standard — reliability our clients can plan their operations around.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 space-y-20">
        {/* ── CORE VALUES ────────────────────────────────────────────────────── */}
        {!loading && coreValues.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">What Drives Us</h2>
              <p className="text-2xl font-black text-slate-900 mt-1">Quality Isn&rsquo;t Inspected In — It&rsquo;s Built In</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreValues.map((cv, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2 hover:border-blue-300 hover:shadow-lg transition-all">
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
                  <div key={i} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
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
                  <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center"><Icon n={vm.icon || "star"} cls="text-2xl text-lime-400" /></span>
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
        {/* ── STATS / TRUST INDICATORS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200">
          {[
            { number: "21+", label: "Years of Excellence" },
            { number: "500+", label: "Happy Clients" },
            { number: "10000+", label: "Products Delivered" },
            { number: "100%", label: "Quality Commitment" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-blue-950">{stat.number}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ================================================================================================================================================= */}
        <section className="relative">
          {/* Background */}
          <div className="h-80 bg-cover bg-center" style={{ backgroundImage: "url('/images/about-banner.jpg')", }} >
            <div className="absolute inset-0 bg-black/25" />
          </div>
          {/* Floating Cards */}
          <div className="relative -mt-44 max-w-6xl mx-auto px-5 pb-20">
            <Card title="Manufacturing" icon={<ManufacturingIcon />} >
              <p>Makita manufactures its tools in plants across the globe, from its headquarters in Japan.</p>
              <p>Makita's acquisition of Dolmar in 1991 has also meant that we have one of the strongest histories in the Outdoor Power Equipment market and the plant in Germany constantly delivers tools worldwide to the highest quality.</p>
              <p>At the heart of our manufacturing process is the belief that for a good tool you need a good motor. We source the highest quality raw materials and components to produce efficient motors with maximum performance.</p>
              <p>Premium grade steel is used to produce armature shafts and gears, whilst high grade magnetic copper wire ensures superior current flow even under extreme temperatures.</p>
              <p>Our quality control tests every machine before it leaves our manufacturing plants, ensuring reliability and durability.</p>
              <p>Our high standards go a long way, making every purchase a lasting investment.</p>
            </Card>
            <Card title="Innovation" icon={<InnovationIcon />} >
              <p>Innovation drives everything we do. We continuously develop new technologies that improve productivity, safety and performance.</p>
              <p>Our dedicated research and development teams work tirelessly to enhance power efficiency, ergonomics and overall product quality, delivering solutions that professionals can rely on every day.</p>
            </Card>
          </div>
        </section>
        {/* ================================================================================================================================================= */}
        
        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 md:p-12 text-center text-white space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">Ready to Partner with SBS Groups?</h2>
          <p className="text-blue-200 max-w-xl mx-auto">Get in touch with our team to discuss your industrial supply needs.</p>
          <Link href="/contact">
            <button className="bg-lime-400 text-slate-950 font-black text-xs px-8 py-4 rounded-xl uppercase tracking-wider hover:bg-lime-300 transition-colors">Contact Us Today →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}