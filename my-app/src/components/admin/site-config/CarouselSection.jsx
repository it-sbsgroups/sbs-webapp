// src/components/admin/site-config/CarouselSection.jsx
"use client";

import { useState } from "react";
import CarouselSlidesManager from "@/components/admin/carousel/CarouselSlidesManager";
import CarouselSettingsManager from "@/components/admin/carousel/CarouselSettingsManager";

// Hosts the two existing carousel admin panels (Slides / Settings) as a
// sub-tab inside Site Configuration, instead of a standalone top-level nav
// item. The underlying components (and the /carousel API they call) are
// unchanged — this is purely a navigation/placement change.
const subTabs = [
  { id: "slides", label: "Slides", description: "Add, edit & reorder slides" },
  { id: "settings", label: "Behavior", description: "Autoplay, arrows, dots, height" },
];

export default function CarouselSection() {
  const [subTab, setSubTab] = useState("slides");

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 border-b border-slate-200 pb-3">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              subTab === t.id
                ? "bg-blue-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            title={t.description}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "slides" && <CarouselSlidesManager />}
      {subTab === "settings" && <CarouselSettingsManager />}
    </div>
  );
}
