"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import * as Icons from "lucide-react";
import FounderSimple from "@/components/public/FounderSimple";

// Import custom icons
import SafetyHelmet from "@/components/icons/SafetyHelmet";
import CraneIcon from "@/components/icons/CraneIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import DrillingMachineIcon from "@/components/icons/DrillingMachineIcon";
import IndustrialBuildingIcon from "@/components/icons/IndustrialBuildingIcon";
import FactoryIcon from "@/components/icons/FactoryIcon";

// Fallback content shown only if the admin hasn't configured Vision & Mission yet.
const DEFAULT_VISION_MISSION = [
  {
    type: "vision",
    icon: "Eye",
    iconSize: 90,
    iconColor: "#557b00",
    title: "Our Vision",
    description:
      "<p>Quality product with prompt service is our principle. We initiated to serve towards the growing concern for safety needs in the present industrial scenario at the power capital of India.</p>",
  },
  {
    type: "mission",
    icon: "Goal",
    iconSize: 90,
    iconColor: "#557b00",
    title: "Our Mission",
    description:
      "<p>To deliver quality industrial products and prompt service, creating value not just commercially but also by respecting and fulfilling our commitments to customers, partners, and stakeholders.</p>",
  },
];

const Card = ({ icon, title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-[0_18px_45px_rgba(0,0,0,0.12)] p-10 lg:p-12 mb-10 relative overflow-hidden">
      {/* Background icon – factory outline for subtle touch */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.04] pointer-events-none">
        <FactoryIcon size={180} color="#000" />
      </div>
      <div className="flex flex-col lg:flex-row gap-10 relative z-10">
        <div className="w-full lg:w-72 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-gray-200 pb-8 lg:pb-0">
          {icon}
          <h2 className="mt-6 text-[42px] leading-none font-black uppercase tracking-tight text-blue-950">{title}</h2>
        </div>
        <div className="flex-1 space-y-6 text-[17px] text-gray-700 leading-8">{children}</div>
      </div>
    </div>
  );
};

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
        {/* Left – Worker Icon (replaces dot pattern) */}
        <div className="absolute left-8 top-20 w-24 opacity-70 hidden lg:block -rotate-6">
          <WorkerIcon size={96} color="#ef4444" stroke="#ef4444" strokeWidth={0.8} />
        </div>

        {/* Right – Safety Helmet (already present) */}
        <div className="absolute right-10 top-12 w-36 opacity-90 hidden lg:block rotate-[12deg]">
          <SafetyHelmet size={144} color="#ffd500" stroke="#d4b500" strokeWidth={3} />
        </div>

        {/* Left – Crane Icon (replaces circle) */}
        <div className="absolute left-4 top-72 w-16 opacity-30 hidden lg:block rotate-12">
          <CraneIcon size={64} color="#ef4444" stroke="#ef4444" strokeWidth={1} />
        </div>

        {/* Bottom Left – Drilling Machine */}
        <div className="absolute left-2 bottom-32 w-20 opacity-20 hidden lg:block -rotate-6">
          <DrillingMachineIcon size={80} color="#000" />
        </div>

        {/* Bottom Right – Factory Icon */}
        <div className="absolute right-6 bottom-24 w-28 opacity-20 hidden lg:block rotate-[15deg]">
          <FactoryIcon size={112} color="#000" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="mt-6 text-4xl md:text-5xl font-black uppercase text-blue-950 leading-tight">About Us</h2>
              <div className="mt-8 h-1 w-24 rounded-full bg-[#557b00]"></div>
              {loading ? (
                <SectionSkeleton />
              ) : about.richContent ? (
                <div className="max-w-3xl mx-auto text-center space-y-4">
                  <div
                    className="prose prose-slate prose-sm md:prose-base mx-auto text-left prose-headings:font-black prose-headings:text-slate-900 prose-a:text-blue-700"
                    dangerouslySetInnerHTML={{ __html: about.richContent }}
                  />
                </div>
              ) : null}
              {/* Since */}
              <div className="mt-12 flex items-center gap-6">
                <div className="relative">
                  {/* Industrial Building floating near "Since" */}
                  <div className="absolute -left-6 -top-6 w-10 opacity-40 pointer-events-none">
                    <IndustrialBuildingIcon size={40} color="#557b00" />
                  </div>
                  <p className="text-[#557b00] font-bold uppercase tracking-wider">Since</p>
                  <h3 className="text-6xl font-black text-blue-950">2005</h3>
                </div>
                <div className="h-20 w-px bg-gray-300"></div>
                <p className="text-gray-600 leading-7">
                  Proudly serving industries with innovative safety products, reliable support, and uncompromising quality standards.
                </p>
              </div>
            </div>
            {/* Right Image */}
            <div className="relative">
              {/* Border */}
              <div className="absolute -left-5 -top-5 h-full w-full border-2 border-red-500 rounded-xl"></div>
              {/* Image */}
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img
                  src="https://res.cloudinary.com/dhrnoojwo/image/upload/v1783947198/ChatGPT_Image_Jul_13_2026_06_23_01_PM_k7cds1.png"
                  alt="About Us"
                  className="h-[550px] w-full object-cover filter brightness-150 transition duration-700 hover:scale-105"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-8 left-8 rounded-xl bg-white p-6 shadow-2xl border">
                <h3 className="text-3xl font-black text-red-600">21+</h3>
                <p className="text-gray-600">Years of Excellence</p>
              </div>
              {/* Dot Pattern – replaced with tiny Crane */}
              <div className="absolute -left-10 bottom-12 w-16 opacity-60">
                <CraneIcon size={64} color="#000" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERO – Dark industrial banner ─────────── */}
      <div className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[1] brightness-90"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dhrnoojwo/image/upload/v1783947198/ChatGPT_Image_Jul_13_2026_06_23_01_PM_k7cds1.png')",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center space-y-5 relative">
          <span className="text-[10px] font-black text-white bg-[#557b00] border border-lime-400/30 px-3 py-1 rounded-full uppercase tracking-widest">
            About {companyName}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto">{tagline}</h1>
          <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl mx-auto">
            Every product we supply, every partnership we build, is held to one standard — reliability our clients can plan their operations around.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 space-y-20">
        {/* ── FOUNDER / CO‑FOUNDER CARDS ───────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto relative">
            {/* Decorative – Drilling Machine behind founder cards */}
            <div className="absolute -right-16 -top-16 w-28 opacity-10 pointer-events-none rotate-12 hidden lg:block">
              <DrillingMachineIcon size={112} color="#000" />
            </div>
            <FounderSimple person={founders.founder} />
            <FounderSimple person={founders.coFounder} />
          </div>
        )}

        {/* ── STATS / TRUST INDICATORS ──────────────────────────────────────── */}
        <div className="relative">
          {/* Background Factory icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <FactoryIcon size={280} color="#1e3a8a" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200 sticky top-20 z-50 relative">
            {[
              { number: "21+", label: "Years of Excellence", icon: <IndustrialBuildingIcon size={28} color="#557b00" /> },
              { number: "500+", label: "Happy Clients", icon: <WorkerIcon size={28} color="#557b00" /> },
              { number: "10000+", label: "Products Delivered", icon: <DrillingMachineIcon size={28} color="#557b00" /> },
              { number: "100%", label: "Quality Commitment", icon: <SafetyHelmet size={28} color="#557b00" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center flex flex-col items-center gap-2">
                <div className="text-[#557b00]">{stat.icon}</div>
                <p className="text-3xl font-black text-blue-950">{stat.number}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================================================================================================= */}
        <section className="relative">
          <div className="h-80 bg-cover bg-center">
            <div className="absolute inset-0" />
          </div>
          {/* Floating Cards */}
          <div className="relative -mt-44 max-w-6xl mx-auto px-5 pb-20">
            {loading ? (
              <>
                <div className="bg-white rounded-lg shadow-[0_18px_45px_rgba(0,0,0,0.12)] p-10 lg:p-12 mb-10">
                  <SectionSkeleton />
                </div>
                <div className="bg-white rounded-lg shadow-[0_18px_45px_rgba(0,0,0,0.12)] p-10 lg:p-12 mb-10">
                  <SectionSkeleton />
                </div>
              </>
            ) : (
              (visionMission.length > 0 ? visionMission : DEFAULT_VISION_MISSION).map((vm, i) => {
                const DynamicIcon = (vm.icon && Icons[vm.icon]) || Icons.Sparkles;
                const title = vm.title || (vm.type === "mission" ? "Our Mission" : "Our Vision");
                return (
                  <Card
                    key={i}
                    title={title}
                    icon={
                      <DynamicIcon
                        size={vm.iconSize || 90}
                        color={vm.iconColor || "#7ccf00"}
                      />
                    }
                  >
                    <RichTextRenderer html={vm.description} />
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 md:p-12 text-center text-white space-y-4 overflow-hidden">
          {/* Decorative – Worker & Crane at corners */}
          <div className="absolute -right-8 -bottom-8 w-32 opacity-20 rotate-[15deg] pointer-events-none">
            <CraneIcon size={128} color="#fff" />
          </div>
          <div className="absolute -left-6 -top-6 w-24 opacity-20 -rotate-12 pointer-events-none">
            <WorkerIcon size={96} color="#fff" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black relative z-10">Get in touch with {companyName}?</h2>
          <Link href="/contact" className="relative z-10">
            <button className="bg-[#557b00] text-white font-black text-xs px-8 py-4 rounded-xl uppercase tracking-wider hover:bg-blue-950 transition-colors">
              Contact Us Today →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}