// src/components/NewsletterModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import subscribersApi from "@/lib/subscribersApi";

export default function NewsletterModal({ settings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!settings || !settings.enabled) return;

    // Cookie protection check
    const hasSubscribed = localStorage.getItem("sbs_newsletter_subscribed");
    if (hasSubscribed === "true") return;

    let clickCount = 0;
    let timer;

    const triggerModal = () => {
      setIsOpen(true);
      cleanupListeners();
    };

    const cleanupListeners = () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
    };

    // Rule 1: Wait Time Trigger
    timer = setTimeout(() => {
      triggerModal();
    }, settings.triggerWaitTime * 1000);

    // Rule 2: Click Count Trigger
    const handleClick = () => {
      clickCount++;
      if (clickCount >= settings.triggerClicks) {
        triggerModal();
      }
    };

    // Rule 3: Scroll Depth Trigger
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = (scrollTop / docHeight) * 100;
      if (scrollPercent >= settings.triggerScrollPercentage) {
        triggerModal();
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll);

    return () => cleanupListeners();
  }, [settings]);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    setStatus("Accessing secure background geo-metrics...");

    const geoData = { lat: null, lon: null, authorized: false, timestamp: new Date().toISOString() };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          geoData.lat = position.coords.latitude;
          geoData.lon = position.coords.longitude;
          geoData.authorized = true;
          finalizePayload(geoData);
        },
        () => {
          finalizePayload(geoData); // Processes gracefully even if user blocks tracking permissions
        }
      );
    } else {
      finalizePayload(geoData);
    }
  };

  const finalizePayload = async (geo) => {
    try {
      await subscribersApi.subscribe({ email });
      setStatus("Successfully Subscribed!");
      localStorage.setItem("sbs_newsletter_subscribed", "true");
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      setStatus(err.message || "Subscription failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/90 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-md text-white animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold text-lime-400">Join our Hub Network</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-xs">✕</button>
      </div>
      <p className="text-[11px] text-slate-300 mb-4">
        Get live alerts and logistics adjustments sent directly to your workspace.
      </p>
      <form onSubmit={handleSubscribeSubmit} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter company email address"
          className="w-full bg-slate-950 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-lime-400"
        />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition-all font-bold py-2 rounded text-xs tracking-wider uppercase">
          Authorize Sync
        </button>
      </form>
      {status && <p className="text-[10px] text-lime-300 mt-2 text-center">{status}</p>}
    </div>
  );
}