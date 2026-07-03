// src/components/public/WhyChooseUs.jsx
"use client";

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import whyChooseUsData from "@/data/whyChooseUsData";

export default function WhyChooseUs() {
  const [config, setConfig] = useState(whyChooseUsData);

  // ===== LISTEN FOR ADMIN UPDATES =====
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.config) setConfig(e.detail.config);
    };
    window.addEventListener("why-choose-us-admin-update", handleUpdate);
    return () => window.removeEventListener("why-choose-us-admin-update", handleUpdate);
  }, []);

  const { design, stats, title, mainDescription } = config;
  const visibleStats = stats?.filter((item) => item.show) || [];

  // ===== GET GRID CLASS BASED ON CARDS PER ROW =====
  const getGridClass = () => {
    if (design?.cardsPerRow === 3)
      return "lg:col-span-7 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "lg:col-span-7 grid gap-6 grid-cols-1 sm:grid-cols-2";
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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            {title && (
              <h2
                style={{ color: design?.titleColor || "#1E3A8A" }}
                className="text-3xl font-black tracking-tight sm:text-4xl uppercase leading-tight"
                // 🟢 Render HTML safely
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}
            {mainDescription && (
              <div
                className="text-sm text-gray-600 leading-relaxed max-w-md"
                // 🟢 Render HTML safely
                dangerouslySetInnerHTML={{ __html: mainDescription }}
              />
            )}
          </div>

          {/* ===== RIGHT GRID AREA (Dynamic Cards) ===== */}
          <div className={getGridClass()}>
            {visibleStats.map((item) => {
              const DynamicIcon = Icons[item.iconName] || Icons.HelpCircle;

              return (
                <div
                  key={item.id}
                  style={{ backgroundColor: design?.cardBackgroundColor || "#F9FAFB" }}
                  className="group p-6 rounded-2xl border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-xl"
                >
                  {/* Dynamic Icon */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 transition-colors duration-300 mb-4"
                    style={{
                      backgroundColor: design?.iconDefaultBg || "#F3F4F6",
                      color: design?.iconDefaultColor || "#374151",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        design?.iconHoverBg || design?.primaryColor || "#DC2626";
                      e.currentTarget.style.color =
                        design?.iconHoverColor || "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        design?.iconDefaultBg || "#F3F4F6";
                      e.currentTarget.style.color =
                        design?.iconDefaultColor || "#374151";
                    }}
                  >
                    <DynamicIcon
                      size={24}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Content */}
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
                <p className="text-sm mt-1">Add features from the admin panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}