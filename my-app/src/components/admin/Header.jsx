"use client";

import { useState, useEffect } from "react";
import { adminSearch } from "@/lib/adminSearchIndex";

export default function Header({
  headerThemeStyle,
  setIsLeftCollapsed,
  isLeftCollapsed,
  setIsRightOpen,
  showThemeModal,
  setShowThemeModal,
  showNotificationModal,
  setShowNotificationModal,
  showProfileModal,
  setShowProfileModal,
  presetThemes,
  isGradient,
  setIsGradient,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
  solidColor,
  setSolidColor,
  notifications,
  user,
  onLogout,
  // NEW: search wiring
  searchQuery,
  setSearchQuery,
  setSearchResults,
}) {
  const displayName = user?.name || "Admin";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const q = (searchQuery || "").trim();
    if (q.length < 2) {
      setSearchResults?.([]);
      return;
    }
    setSearchResults?.(adminSearch(q, { limit: 12 }));
    setIsRightOpen?.(true);
  }, [searchQuery, setSearchResults, setIsRightOpen]);

  return (
    <header
      style={headerThemeStyle}
      className="h-16 w-full text-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-xl border-b border-white/10 shrink-0 transition-all duration-500"
    >
      {/* Left branding sector */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-md hover:bg-lime-500 hover:text-slate-900 transition-all duration-200 focus:outline-none"
          title={isLeftCollapsed ? "Expand Menu" : "Collapse Menu"}
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M3 5H21V7H3V5ZM3 11H21V13H3V11ZM3 17H21V19H3V17Z" />
          </svg>
        </button>
        <img src="/logos/logo.png" alt="SBS Logo" className="h-9 w-auto object-contain" onError={(e) => { e.target.style.display = "none"; }} />
      </div>

      {/* Centered GLOBAL search box → results stream into the right sidebar */}
      <div className="flex-1 max-w-lg mx-8">
        <div className="relative group">
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            onFocus={() => setIsRightOpen(true)}
            placeholder="Search anything — products, news, distributors, sections..."
            className="w-full rounded-lg bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 pl-10 text-xs text-white placeholder-white/50 focus:outline-none focus:border-lime-400 focus:bg-white/20 transition-all duration-200"
          />
          <span className="absolute left-3.5 top-2.5 text-xs text-white/40">🔍</span>
        </div>
      </div>

      {/* Right utility elements */}
      <div className="flex items-center space-x-4 relative">
        <button
          onClick={() => { setShowThemeModal(!showThemeModal); setShowNotificationModal(false); setShowProfileModal(false); }}
          className={`p-2 rounded-lg text-lg transition-all duration-200 ${showThemeModal ? "bg-lime-500 text-slate-900 scale-105" : "bg-white/10 hover:bg-white/20"}`}
        >
          🎨
        </button>

        <button
          onClick={() => { setShowNotificationModal(!showNotificationModal); setShowProfileModal(false); setShowThemeModal(false); }}
          className={`relative p-2 rounded-lg text-lg transition-all duration-200 ${showNotificationModal ? "bg-white/20 text-lime-400" : "bg-white/10 hover:bg-white/20"}`}
        >
          <span>🔔</span>
          {notifications?.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full text-white ring-2 ring-indigo-950">
              {notifications.length}
            </span>
          )}
        </button>

        <button onClick={() => { setShowProfileModal(!showProfileModal); setShowNotificationModal(false); setShowThemeModal(false); }} className="focus:outline-none">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-lime-400 to-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border border-white/20">
            {initials || "AD"}
          </div>
        </button>

        {/* THEME PANEL MODAL */}
        {showThemeModal && (
          <div className="absolute right-24 top-13 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 text-slate-800 z-50 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Theme Engine Panel</span>
              <button onClick={() => setShowThemeModal(false)} className="text-xs font-bold text-slate-400 hover:text-red-500">✕</button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setIsGradient(true)} className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase ${isGradient ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Gradient</button>
              <button onClick={() => setIsGradient(false)} className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase ${!isGradient ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Solid</button>
            </div>
            <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {isGradient ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 block">Start</label>
                    <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 block">End</label>
                    <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-slate-200" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 block">Solid Color</label>
                  <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-slate-200" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presets</p>
              <div className="grid grid-cols-1 gap-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                {presetThemes.map((theme, i) => (
                  <button key={i}
                    onClick={() => {
                      if (theme.type === "gradient") { setIsGradient(true); setGradientStart(theme.start); setGradientEnd(theme.end); }
                      else { setIsGradient(false); setSolidColor(theme.color); }
                    }}
                    className="w-full flex items-center justify-between text-[11px] p-2 rounded-md border border-slate-100 hover:bg-slate-50">
                    <span className="font-medium text-slate-700">{theme.name}</span>
                    <div style={theme.type === "gradient" ? { backgroundImage: `linear-gradient(to right, ${theme.start}, ${theme.end})` } : { backgroundColor: theme.color }} className="w-8 h-3.5 rounded" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS MODAL */}
        {showNotificationModal && (
          <div className="absolute right-12 top-13 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 text-slate-800 z-50 py-2">
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase">Live Event Alerts</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 text-[11px] hover:bg-slate-50">
                  <p className="text-slate-700 leading-tight font-medium">{n.text}</p>
                  <span className="text-[9px] text-slate-400 block mt-1.5">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE MODAL */}
        {showProfileModal && (
          <div className="absolute right-0 top-13 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 text-slate-800 z-50 p-4 space-y-3">
            <div className="text-center pb-2 border-b border-slate-100">
              <p className="text-xs font-black text-slate-900">{user?.name || "Admin"}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user?.designation || "Administrator"}</p>
              {user?.email && <p className="text-[10px] text-slate-400 mt-1">{user.email}</p>}
            </div>
            <button className="w-full text-center text-[10px] font-bold uppercase bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800">View Details</button>
            <button onClick={() => { if (confirm("Are you sure you want to log out?")) onLogout?.(); }}
              className="w-full text-center text-[10px] font-bold uppercase bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors" >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}