"use client";

import { useState, useEffect } from "react";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";
import GeminiChat from "@/components/public/GeminiChat"; // ← AI chat assistant
import FloatingWhatsapp from "@/components/public/FloatingWhatsapp";
import ScrollToTop from "@/components/public/ScrollToTop";

export default function PublicLayout({ children }) {
  const [cartLinesCount, setCartLinesCount] = useState(0);

  // Custom global event listening mechanism to read cart counts safely across public child components
  useEffect(() => {
    const handleCartUpdate = () => {
      if (typeof window !== "undefined") {
        const cartData = localStorage.getItem("sbs_rfq_cart");
        if (cartData) {
          try {
            const parsed = JSON.parse(cartData);
            setCartLinesCount(parsed.length || 0);
          } catch (e) {
            setCartLinesCount(0);
          }
        } else {
          setCartLinesCount(0);
        }
      }
    };

    // Initialize counts on first page mounting lifecycle
    handleCartUpdate();

    // Listen to custom operational tracking events trigger
    window.addEventListener("sbs-cart-updated", handleCartUpdate);
    return () => window.removeEventListener("sbs-cart-updated", handleCartUpdate);
  }, []);

  const triggerCartModalAction = () => {
    // Dispatches a global proxy call down to page nodes to toggle open form panels
    const customEvent = new CustomEvent("sbs-open-cart-modal");
    window.dispatchEvent(customEvent);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* 1. Global Public View Header */}
      <PublicHeader cartCount={cartLinesCount} onCartClick={triggerCartModalAction} />

      {/* 2. Dynamic Viewport Insertion Child Node */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* 3. Global Public Regulatory Footer */}
      <PublicFooter />

      {/* 4. Gemini AI Floating Chat Assistant */}
      <GeminiChat />
      <FloatingWhatsapp />
      <ScrollToTop />

    </div>
  );
}