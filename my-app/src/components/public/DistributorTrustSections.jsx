"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

/* ------------------------------------------------------------------ */
/*  Feature Card Grid (centered cards, centered content, larger text) */
/*  Uses auto-fit columns so any number of cards stays centered.      */
/* ------------------------------------------------------------------ */
function FeatureGrid({ features = [] }) {
  if (!features.length) return null;

  return (
    <div className="mt-12 grid gap-6 justify-items-center justify-center grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
      {features.map((f) => {
        const Icon = Icons[f.icon] || Icons.Star;
        return (
          <div
            key={f.id}
            className="group relative w-full max-w-xs rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 text-center"
          >
            {/* Icon container – centered with mx-auto */}
            <div className="mb-5 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-blue-200/50">
              <Icon size={22} strokeWidth={2} />
            </div>

            {/* Title – now text-base (was text-sm) */}
            <h3 className="text-base font-bold text-slate-900">
              {f.title}
            </h3>
            {/* Description – now text-sm (was text-xs) */}
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {f.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Block (centered content)                                     */
/* ------------------------------------------------------------------ */
function TrustBlock({ data, tone = "light" }) {
  if (!data || (!data.titlePart1 && !data.titlePart2)) return null;

  const isDark = tone === "dark";

  return (
    <section
      className={`relative w-full overflow-hidden px-6 py-20 lg:py-24 ${
        isDark
          ? "bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white"
          : "bg-white text-slate-900"
      }`}
    >
      {/* Subtle background pattern for dark section */}
      {isDark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      )}

      <div className="relative mx-auto max-w-6xl">
        {/* Heading area – centered */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            <span className={isDark ? "text-white" : "text-blue-950"}>
              {data.titlePart1}
            </span>{" "}
            <span className="text-[#557b01]">{data.titlePart2}</span>
          </h2>

          {/* Decorative underline centered */}
          <div className="mt-3 h-1 w-12 rounded-full bg-[#557b01]/40 mx-auto" />

          {data.description && (
            <div
              className={`mt-4 text-sm leading-relaxed ${
                isDark ? "text-blue-100/80" : "text-slate-500"
              }`}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>

        {/* Feature cards – auto-fit grid, always centered */}
        <FeatureGrid features={data.features} />

        {/* Certification badges – centered */}
        {Array.isArray(data.CertificationStandards) &&
          data.CertificationStandards.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {data.CertificationStandards.map((s, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isDark
                      ? "border-blue-300/30 bg-blue-400/10 text-blue-100 hover:bg-blue-400/20"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <Icons.CircleCheckBig
                    size={14}
                    className={isDark ? "text-blue-300" : "text-blue-500"}
                  />
                  {s}
                </span>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Distributor Trust Sections                                    */
/* ------------------------------------------------------------------ */
export default function DistributorTrustSections() {
  const [authorizedNetwork, setAuthorizedNetwork] = useState(null);
  const [partnershipAdvantages, setPartnershipAdvantages] = useState(null);
  const [partnershipWork, setPartnershipWork] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      siteConfigApi.getAuthorizedNetwork(),
      siteConfigApi.getPartnershipAdvantages(),
      siteConfigApi.getPartnershipWork(),
    ]).then(([a, b, c]) => {
      if (a.status === "fulfilled") setAuthorizedNetwork(a.value);
      if (b.status === "fulfilled") setPartnershipAdvantages(b.value);
      if (c.status === "fulfilled") setPartnershipWork(c.value);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <>
      <TrustBlock data={authorizedNetwork} tone="light" />
      {/* <TrustBlock data={partnershipAdvantages} tone="dark" />
      <TrustBlock data={partnershipWork} tone="light" /> */}
    </>
  );
}