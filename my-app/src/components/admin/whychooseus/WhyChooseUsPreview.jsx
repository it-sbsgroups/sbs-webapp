// src/components/admin/whychooseus/WhyChooseUsPreview.jsx
"use client";

import { useState, useEffect } from "react";
import whyChooseUsData from "@/data/whyChooseUsData";
import * as Icons from "lucide-react";

export default function WhyChooseUsPreview() {
  const [config, setConfig] = useState(whyChooseUsData);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.config) setConfig(e.detail.config);
    };
    window.addEventListener("why-choose-us-admin-update", handleUpdate);
    return () => window.removeEventListener("why-choose-us-admin-update", handleUpdate);
  }, []);

  const { design, stats, sectionTag, title, mainDescription, statNumber, statLabel, showStatBlock } = config;
  const visibleStats = stats?.filter((s) => s.show) || [];
  const d = design || {};

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Live Preview</h2>
        <p className="mt-1 text-sm text-slate-500">Real-time preview updates automatically.</p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: d.backgroundColor, fontFamily: d.fontFamily }}>
        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <span style={{ color: d.primaryColor, backgroundColor: `${d.primaryColor}15` }}
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                {sectionTag || "Section Tag"}
              </span>
              <h2 style={{ color: d.titleColor }} className="text-2xl font-black uppercase">{title || "Title"}</h2>
              <p className="text-sm text-gray-600">{mainDescription || "Description"}</p>
              {showStatBlock && (
                <div className="inline-flex items-center gap-3 bg-gray-50 border p-4 rounded-xl">
                  <span style={{ color: d.titleColor }} className="text-3xl font-black">{statNumber || "20+"}</span>
                  <p className="text-xs text-gray-500 font-bold uppercase">{statLabel || "Stat Label"}</p>
                </div>
              )}
            </div>

            <div className={`lg:col-span-7 grid gap-4 grid-cols-1 sm:grid-cols-2 ${d.cardsPerRow === 3 ? 'lg:grid-cols-3' : ''}`}>
              {visibleStats.slice(0, 4).map((item) => {
                const DynamicIcon = Icons[item.iconName] || Icons.HelpCircle;
                return (
                  <div key={item.id} style={{ backgroundColor: d.cardBackgroundColor }}
                    className="p-4 rounded-xl border">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg mb-3"
                      style={{ backgroundColor: d.iconDefaultBg, color: d.iconDefaultColor }}>
                      <DynamicIcon size={20} />
                    </div>
                    <h4 className="text-xs font-black uppercase">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{item.description?.substring(0, 60)}...</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}