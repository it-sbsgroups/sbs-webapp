// src/components/public/FloatingContactBadge.jsx
//
// A vertical "tab" badge that docks to the left or right edge of the
// viewport. Drag it up/down the edge, or drag it across the screen to flip
// it to the other side — it snaps to whichever edge it's closer to on
// release. Click (without dragging) opens a modal with the exact same
// contact form used on /contact (components/public/ContactForm.jsx), so
// there's only ever one contact-form implementation to maintain.
//
// Position is remembered per-visitor via localStorage, so once someone (or
// you, while testing) drags it somewhere, it stays there on future visits.
//
// Mounted once in app/(public)/layout.js, next to the other floating
// widgets (ChatbotWidget, FloatingWhatsapp, ScrollToTop).

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import Modal from "@/components/shared/Modal";
import ContactForm from "@/components/public/ContactForm";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "sbs-contact-badge-pos";
const DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag, not a click
const BADGE_HEIGHT = 132; // px, keep in sync with the h-[132px] class below

function loadPosition() {
  if (typeof window === "undefined") return { side: "right", top: 55 };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && (saved.side === "left" || saved.side === "right") && typeof saved.top === "number") {
      return saved;
    }
  } catch {
    /* ignore malformed storage */
  }
  return { side: "right", top: 55 };
}

export default function FloatingContactBadge() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(() => ({ side: "right", top: 55 })); // SSR-safe default, hydrated below
  const [dragging, setDragging] = useState(false);
  const badgeRef = useRef(null);
  const dragState = useRef({ startY: 0, moved: false, side: "right" });

  // Hydrate the remembered position after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setPos(loadPosition());
  }, []);

  const clampTop = (topPercent) => {
    const minPercent = (BADGE_HEIGHT / 2 / window.innerHeight) * 100 + 2;
    const maxPercent = 100 - minPercent;
    return Math.min(maxPercent, Math.max(minPercent, topPercent));
  };

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    badgeRef.current?.setPointerCapture?.(e.pointerId);
    dragState.current = { startY: e.clientY, moved: false, side: pos.side };
    setDragging(true);
  }, [pos.side]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const dy = Math.abs(e.clientY - dragState.current.startY);
    if (dy > DRAG_THRESHOLD) dragState.current.moved = true;
    if (!dragState.current.moved) return;

    // Which edge is the pointer nearer to right now?
    const side = e.clientX < window.innerWidth / 2 ? "left" : "right";
    const topPercent = clampTop((e.clientY / window.innerHeight) * 100);
    setPos({ side, top: topPercent });
  }, [dragging]);

  const handlePointerUp = useCallback((e) => {
    badgeRef.current?.releasePointerCapture?.(e.pointerId);
    setDragging(false);

    if (dragState.current.moved) {
      // Finished a drag — persist final resting spot.
      setPos((current) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch {
          /* storage unavailable (private browsing etc.) — non-fatal */
        }
        return current;
      });
    } else {
      // No real movement — treat as a click.
      setOpen(true);
    }
  }, []);

  return (
    <>
      <button
        ref={badgeRef}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Open contact form"
        style={{ top: `${pos.top}%` }}
        className={cn(
          "fixed z-40 h-[132px] w-11 -translate-y-1/2 flex flex-col items-center justify-center gap-2",
          "bg-gradient-to-b from-blue-950 to-blue-800 text-white shadow-lg",
          "touch-none select-none transition-[box-shadow,transform] duration-150",
          dragging ? "cursor-grabbing scale-105 shadow-2xl" : "cursor-grab hover:shadow-xl",
          pos.side === "right" ? "right-0 rounded-l-2xl" : "left-0 rounded-r-2xl"
        )}
      >
        <MessageSquareText size={20} className="shrink-0" />
        <span
          className="text-[11px] font-black tracking-widest uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Contact Us
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Get in Touch" maxWidth="max-w-lg">
        <ContactForm
          embedded
          hideHeader
          successMessage="Thank you! Your enquiry has been received."
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
