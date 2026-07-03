"use client";

import { useState } from "react";
import CarouselSlidesManager from "@/components/admin/carousel/CarouselSlidesManager";
import CarouselSettingsManager from "@/components/admin/carousel/CarouselSettingsManager";
import CarouselPreview from "@/components/admin/carousel/CarouselPreview";

const tabs = [
  { id: "slides", label: "Slides Manager", description: "Add, edit & reorder slides" },
  { id: "settings", label: "Carousel Settings", description: "Global carousel configuration" },
  { id: "preview", label: "Live Preview", description: "Real-time carousel preview" },
];

export default function CarouselManagementPage() {
  const [activeTab, setActiveTab] = useState("slides");

  const renderContent = () => {
    switch (activeTab) {
      case "slides":
        return <CarouselSlidesManager />;
      case "settings":
        return <CarouselSettingsManager />;
      case "preview":
        return <CarouselPreview />;
      default:
        return <CarouselSlidesManager />;
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Hero Carousel Management</h1>
          <p className="mt-2 text-slate-500">Manage homepage hero carousel slides, content, and settings.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[200px] border-r border-slate-200 px-6 py-4 text-left transition-all duration-200 ${
                    activeTab === tab.id ? "bg-blue-600 text-white" : "hover:bg-slate-100"
                  }`} >
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-xs mt-1 ${activeTab === tab.id ? "text-blue-100" : "text-slate-500"}`}>
                    {tab.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}