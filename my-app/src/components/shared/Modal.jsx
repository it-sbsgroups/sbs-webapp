// src/components/shared/Modal.jsx
//
// One modal shell for the app. VariantPickerModal, QuoteBucketModal, and now
// FloatingContactBadge all previously hand-rolled the same
// fixed-inset-0/backdrop/stopPropagation/Escape-to-close pattern. Centralize
// it here; feature-specific modals just provide the content.
//
// USAGE
//   <Modal open={open} onClose={() => setOpen(false)} title="Get in Touch">
//     <ContactForm />
//   </Modal>

"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  showHeader = true,
}) {
  // Escape key closes, and lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "w-full rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && (
          <div className="flex items-center justify-between border-b px-5 py-3.5 sticky top-0 bg-white z-10">
            <h3 className="text-sm font-black text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
