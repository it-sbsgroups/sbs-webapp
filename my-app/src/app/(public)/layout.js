"use client";

import { useRouter } from "next/navigation";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";
import FloatingWhatsapp from "@/components/public/FloatingWhatsapp";
import ScrollToTop from "@/components/public/ScrollToTop";
import ChatbotWidget from "@/components/public/ChatbotWidget";
import QuoteBucketModal from "@/components/public/QuoteBucketModal";
import FloatingContactBadge from "@/components/public/FloatingContactBadge";
import { RfqCartProvider, useRfqCart } from "@/context/RfqCartContext";

function PublicLayoutInner({ children }) {
  const { itemCount } = useRfqCart();
  const router = useRouter();

  const triggerCartModalAction = () => {
    // Cart button behavior, from anywhere on the public site:
    // empty bucket -> send them to browse products; has items -> open the
    // Quote Bucket modal so they can review/request a quotation right away.
    if (itemCount === 0) {
      router.push("/products");
      return;
    }
    window.dispatchEvent(new CustomEvent("sbs-open-cart-modal"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* 1. Global Public View Header */}
      <PublicHeader cartCount={itemCount} onCartClick={triggerCartModalAction} />

      {/* 2. Dynamic Viewport Insertion Child Node */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* 3. Global Public Regulatory Footer */}
      <PublicFooter />

      {/* 4. Floating action buttons */}
      <ChatbotWidget />
      <FloatingWhatsapp />
      <ScrollToTop />
      <FloatingContactBadge />

      {/* 5. Quote Bucket — mounted once, opened from any page via the
             "sbs-open-cart-modal" event (header cart button, or any
             product page after an "Add to Quote" action). */}
      <QuoteBucketModal />

    </div>
  );
}

export default function PublicLayout({ children }) {
  return (
    <RfqCartProvider>
      <PublicLayoutInner>{children}</PublicLayoutInner>
    </RfqCartProvider>
  );
}