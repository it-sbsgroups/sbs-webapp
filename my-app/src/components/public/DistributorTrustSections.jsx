"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

// These three site-config sections (AuthorizedNetwork, PartnershipAdvantages,
// PartnershipWork) already had working admin managers + backend endpoints
// (src/components/admin/distributorComp/*.jsx) but no public component ever
// consumed them — the content admins saved was invisible on the live site.
//
// PLACEMENT: drop <DistributorTrustSections /> into the public
// (public)/distributors/page.js (or /brands, /own-brands) directly below the
// hero/breadcrumb, above the brand grid — these three blocks read as "why
// partner with our distribution network" trust-building content, which is
// exactly the context those pages provide.
function FeatureGrid({ features = [] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-10">
      {features.map((f) => {
        const Icon = Icons[f.icon] || Icons.Star;
        return (
          <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Icon size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900">{f.title}</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.description}</p>
          </div>
        );
      })}
    </div>
  );
}

function TrustBlock({ data, tone = "light" }) {
  if (!data || (!data.titlePart1 && !data.titlePart2)) return null;
  const dark = tone === "dark";
  return (
    <section className={`w-full py-16 px-6 ${dark ? "bg-blue-950 text-white" : "bg-white text-slate-900"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {data.titlePart1}{" "}
            <span className={dark ? "text-blue-300" : "text-blue-600"}>{data.titlePart2}</span>
          </h2>
          {data.description && (
            <div
              className={`mt-3 text-sm leading-relaxed ${dark ? "text-blue-100/80" : "text-slate-500"}`}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>

        <FeatureGrid features={data.features} />

        {Array.isArray(data.CertificationStandards) && data.CertificationStandards.length > 0 && (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {data.CertificationStandards.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-medium">
                <Icons.CircleCheckBig size={16} className={dark ? "text-blue-300 shrink-0 mt-0.5" : "text-blue-600 shrink-0 mt-0.5"} />
                <span className={dark ? "text-blue-50" : "text-slate-600"}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

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
      <TrustBlock data={partnershipAdvantages} tone="dark" />
      <TrustBlock data={partnershipWork} tone="light" />
    </>
  );
}
