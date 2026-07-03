"use client";

import { useState } from "react";

import LogoManager from "@/components/admin/header/LogoManager";
import SearchLogsManager from "@/components/admin/header/SearchLogsManager";
import NavigationManager from "@/components/admin/header/NavigationManager";
import LoginManager from "@/components/admin/header/LoginManager";

const tabs = [
  {
    id: "logo",
    label: "Logo",
    description: "Manage company branding",
  },
  {
    id: "search",
    label: "Search Logs",
    description: "Track user searches",
  },
  {
    id: "navigation",
    label: "Navigation Manager",
    description: "Control header navigation",
  },
  {
    id: "login",
    label: "Login Button",
    description: "Manage login button",
  },
];

export default function HeaderManagementPage() {
  const [activeTab, setActiveTab] = useState("logo");

  const renderContent = () => {
    switch (activeTab) {
      case "logo":
        return <LogoManager />;

      case "search":
        return <SearchLogsManager />;

      case "navigation":
        return <NavigationManager />;

      case "login":
        return <LoginManager />;

      default:
        return <LogoManager />;
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Header Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage logo, navigation, search logs and login settings.
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
                    min-w-[220px]
                    border-r
                    border-slate-200
                    px-6
                    py-4
                    text-left
                    transition-all
                    duration-200

                    ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100"
                    }
                  `}
                >
                  <div className="font-semibold">
                    {tab.label}
                  </div>

                  <div
                    className={`text-xs mt-1 ${
                      activeTab === tab.id
                        ? "text-blue-100"
                        : "text-slate-500"
                    }`}
                  >
                    {tab.description}
                  </div>
                </button>
              ))}

            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>

        </div>
      </div>
    </div>
  );
}