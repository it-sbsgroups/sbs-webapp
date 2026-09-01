"use client";

import { useState } from "react";

import {
  ImageIcon,
  Search,
  Menu,
  LogIn,
} from "lucide-react";

import LogoManager from "./LogoManager";
import SearchLogsManager from "./SearchLogsManager";
import NavigationManager from "./NavigationManager";
import LoginManager from "./LoginManager";

const tabs = [
  {
    id: "logo",
    name: "Logo & Branding",
    icon: ImageIcon,
  },
  {
    id: "search",
    name: "Search Logs",
    icon: Search,
  },
  {
    id: "navigation",
    name: "Navigation",
    icon: Menu,
  },
  {
    id: "login",
    name: "Login Button",
    icon: LogIn,
  },
];

export default function HeaderTabs() {
  const [activeTab, setActiveTab] =
    useState("logo");

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
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Header Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage logo, branding, search logs,
          navigation menus and login button
          settings from a single dashboard.
        </p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon size={18} />

                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
}