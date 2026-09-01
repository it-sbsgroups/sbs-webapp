// src/components/public/WhyContactUs.jsx
"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

// Shown only until the real Site Config → Contact → "Why Contact Us" data
// loads, so the section never renders empty on first paint.
const FALLBACK_DATA = {
  titlePart1: "Why",
  titlePart2: "Contact Us?",
  description:
    "<p>We're committed to providing exceptional service and support to all our clients</p>",
  features: [
    {
      id: "f1",
      icon: "AlarmClockCheck",
      title: "24/7 Support Available",
      description: "Round-the-clock assistance for urgent matters",
    },
    {
      id: "f2",
      icon: "Zap",
      title: "Quick Response Time",
      description: "We respond to all inquiries within 2 hours",
    },
    {
      id: "f3",
      icon: "SquareArrowRightExit",
      title: "Expert Consultation",
      description: "Get advice from our experienced professionals",
    },
    {
      id: "f4",
      icon: "UserRoundSearch",
      title: "Multiple Contact Options",
      description: "Reach us via phone, email, or contact form",
    },
  ],
};

export default function WhyContactUs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    siteConfigApi
      .getWhyContact()
      .then((d) => {
        if (!alive) return;
        if (d && Object.keys(d).length > 0) setData({ ...FALLBACK_DATA, ...d });
        else setData(FALLBACK_DATA);
      })
      .catch(() => alive && setData(FALLBACK_DATA))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const content = data || FALLBACK_DATA;
  const features = content.features || [];

  return (
    <section className="w-full bg-slate-50/70 py-20 px-6 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-blue-950">
            {content.titlePart1}{" "}
            <span className="text-[#557b01]">{content.titlePart2}</span>
          </h2>
          {content.description && (
            <div
              className="mt-4 text-sm md:text-base text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.description) }}
            />
          )}
        </div>

        <div
          className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${
            features.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {loading &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse space-y-3"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
            ))}

          {!loading &&
            features.map((feature) => {
              const DynamicIcon = Icons[feature.icon] || Icons.HelpCircle;
              return (
                <div
                  key={feature.id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-white group-hover:bg-[#557b01] transition-colors">
                    <DynamicIcon size={22} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
