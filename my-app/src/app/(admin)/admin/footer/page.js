// src/app/admin/footer/page.jsx
"use client";

import { useState } from "react";
import FooterBrandingManager from "@/components/admin/footer/FooterBrandingManager";
import FooterContactsManager from "@/components/admin/footer/FooterContactsManager";
import FooterLinksManager from "@/components/admin/footer/FooterLinksManager";
import FooterSocialManager from "@/components/admin/footer/FooterSocialManager";
import FooterNewsletterManager from "@/components/admin/footer/FooterNewsletterManager";
import FooterStylingManager from "@/components/admin/footer/FooterStylingManager";

const tabs = [
  {
    id: "branding",
    label: "Branding",
    description: "Logo & company info",
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Phone, email, address",
  },
  {
    id: "links",
    label: "Navigation Links",
    description: "Quick links & services",
  },
  {
    id: "social",
    label: "Social Media",
    description: "Social network links",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Subscription settings",
  },
  {
    id: "styling",
    label: "Styling",
    description: "Colors & appearance",
  },
];

export default function FooterManagementPage() {
  const [activeTab, setActiveTab] = useState("branding");

  const renderContent = () => {
    switch (activeTab) {
      case "branding":
        return <FooterBrandingManager />;
      case "contacts":
        return <FooterContactsManager />;
      case "links":
        return <FooterLinksManager />;
      case "social":
        return <FooterSocialManager />;
      case "newsletter":
        return <FooterNewsletterManager />;
      case "styling":
        return <FooterStylingManager />;
      default:
        return <FooterBrandingManager />;
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Footer Management
          </h1>
          <p className="mt-2 text-slate-500">
            Manage footer branding, contacts, links, social media, newsletter and styling.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Tabs */}
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    min-w-[200px] border-r border-slate-200 px-6 py-4 text-left transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100"
                    }
                  `}
                >
                  <div className="font-semibold">{tab.label}</div>
                  <div
                    className={`text-xs mt-1 ${
                      activeTab === tab.id ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {tab.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}