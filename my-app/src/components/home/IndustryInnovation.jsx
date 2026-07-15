"use client";

import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { getCurrentInnovation } from "@/lib/industry-innovation/api";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import LazyCacheImage from "@/components/shared/LazyCacheImage";

// A key point's `icon` field (set via the admin panel) is a free-text CSS
// class string (e.g. a Font Awesome class like "fas fa-bolt") rather than a
// lucide name — the admin UI doesn't currently expose a way to set it, so we
// render it if present (forward-compatible) and fall back to a lucide icon
// otherwise, matching the icon style used across the rest of the site.
function KeyIcon({ iconClass }) {
  if (iconClass) {
    return <i className={`${iconClass} text-lg`} aria-hidden="true" />;
  }
  return <Icons.Sparkles size={18} />;
}

export default function IndustryInnovation() {
  const [innovation, setInnovation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentInnovation()
      .then((data) => { if (active) setInnovation(data); })
      .catch(() => { /* section not configured yet — render nothing */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Nothing configured in the admin panel yet, or still loading — don't
  // reserve space with an empty/skeleton section on a page that otherwise
  // has real content.
  if (loading || !innovation || (!innovation.title && !innovation.description)) {
    return null;
  }

  const keys = (innovation.keys || []).filter((k) => k.title);

  return (
    <section className="bg-slate-50 py-16 md:py-24 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Image */}
          {innovation.image && (
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 aspect-[4/3]">
                <LazyCacheImage src={innovation.image} alt={innovation.title || "Industry Innovation"} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className={innovation.image ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
            {innovation.title && (
              <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
                {innovation.title}
              </h2>
            )}
            {innovation.description && (
              <RichTextRenderer html={innovation.description} className="text-sm text-gray-600 leading-relaxed" />
            )}

            {keys.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {keys.map((key) => (
                  <div key={key.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white shrink-0">
                      <KeyIcon iconClass={key.icon} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-snug pt-1.5">{key.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
