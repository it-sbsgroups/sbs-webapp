// src/app/admin/whychooseus/page.jsx
"use client";

import { useState } from "react";
import WhyChooseUsContentManager from "@/components/admin/whychooseus/WhyChooseUsContentManager";
import WhyChooseUsCardsManager from "@/components/admin/whychooseus/WhyChooseUsCardsManager";
import WhyChooseUsDesignManager from "@/components/admin/whychooseus/WhyChooseUsDesignManager";
import WhyChooseUsPreview from "@/components/admin/whychooseus/WhyChooseUsPreview";

const tabs = [
  { id: "content", label: "Content", description: "Section text & stat" },
  { id: "cards", label: "Feature Cards", description: "Manage feature cards" },
  { id: "design", label: "Design", description: "Colors & layout" },
  { id: "preview", label: "Preview", description: "Live preview" },
];

export default function WhyChooseUsManagementPage() {
  const [activeTab, setActiveTab] = useState("content");

  const renderContent = () => {
    switch (activeTab) {
      case "content": return <WhyChooseUsContentManager />;
      case "cards": return <WhyChooseUsCardsManager />;
      case "design": return <WhyChooseUsDesignManager />;
      case "preview": return <WhyChooseUsPreview />;
      default: return <WhyChooseUsContentManager />;
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Why Choose Us Management</h1>
          <p className="mt-2 text-slate-500">Manage the Why Choose Us section content, feature cards, and design settings.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[180px] border-r border-slate-200 px-6 py-4 text-left transition-all duration-200 ${
                    activeTab === tab.id ? "bg-blue-600 text-white" : "hover:bg-slate-100"
                  }`}
                >
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