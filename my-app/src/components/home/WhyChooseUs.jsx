// src/components/public/WhyChooseUs.jsx
"use client";

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

/** Safely convert a simple HTML string with <span> tags into React elements */
function parseHtmlTitle(htmlString) {
  const parts = [];
  const regex = /(<span\s+className=['"]([^'"]+)['"]>(.*?)<\/span>)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(htmlString)) !== null) {
    // Text before the span
    if (match.index > lastIndex) {
      parts.push(htmlString.substring(lastIndex, match.index));
    }
    const className = match[2];
    const content = match[3];
    parts.push(
      <span key={match.index} className={className}>
        {content}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  // Remaining text after last span
  if (lastIndex < htmlString.length) {
    parts.push(htmlString.substring(lastIndex));
  }
  return parts;
}

export default function WhyChooseUs() {
  const [config, setConfig] = useState({ design: {}, stats: [], title: "", mainDescription: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const base =
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.hostname}:4000/api`
            : "http://localhost:4000/api");
        const res = await fetch(`${base}/why-choose-us`);
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        setConfig({
          design: {},
          title: data.title || "",
          mainDescription: data.description || "",
          stats: (data.keys || []).map((k) => ({
            id: k.id,
            title: k.title,
            description: k.description,
            iconName: k.icon,
            show: true,
          })),
        });
      } catch {
        // keep the empty-state defaults on failure
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.config) setConfig(e.detail.config);
    };
    window.addEventListener("why-choose-us-admin-update", handleUpdate);
    return () =>
      window.removeEventListener("why-choose-us-admin-update", handleUpdate);
  }, []);

  const { design, stats, title, mainDescription } = config;
  const visibleStats = stats?.filter((item) => item.show) || [];

  const getGridClass = () => {
    const perRow = design?.cardsPerRow || 4;
    if (perRow === 3)
      return "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (perRow === 4)
      return "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid gap-6 grid-cols-1 sm:grid-cols-2";
  };

  return (
    <section
      style={{
        backgroundColor: design?.backgroundColor || "#FFFFFF",
        fontFamily: design?.fontFamily || "Inter, sans-serif",
      }}
      className="py-16 md:py-24 border-b border-gray-100"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          {title && (
            <h2
              style={{ color: design?.titleColor || "#1E3A8A" }}
              className="text-3xl font-black tracking-tight sm:text-4xl uppercase leading-tight"
            >
              {parseHtmlTitle(title)}
            </h2>
          )}
          {mainDescription && (
            <div
              className="mt-4 text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mainDescription }}
            />
          )}
        </div>

        {/* CARDS */}
        <div className={getGridClass()}>
          {visibleStats.map((item) => {
            const DynamicIcon = Icons[item.iconName] || Icons.HelpCircle;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: design?.cardBackgroundColor || "#F9FAFB",
                }}
                className="
                  group relative p-6 rounded-2xl border border-gray-100 
                  transition-all duration-300 ease-in-out
                  hover:bg-white hover:shadow-xl
                  hover:scale-[1.05] hover:z-10
                  text-center
                "
              >
                {/* Icon – blue‑500 background, white icon, no hover effect */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white mb-4 mx-auto">
                  <DynamicIcon size={24} />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {visibleStats.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
              <Icons.Package className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p className="font-semibold">No features configured</p>
              <p className="text-sm mt-1">
                Add features from the admin panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}