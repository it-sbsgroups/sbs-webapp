"use client";

import { useState, useEffect } from "react";
import siteConfigApi from "@/lib/siteConfigApi";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import * as Icons from "lucide-react";

const DEFAULT_DATA = {
  headingPart1: "Why Choose Our",
  headingPart2: "Authorized Network?",
  description:
    "<p>Our official distributor status ensures you receive authentic products with full manufacturer support.</p>",
  features: [
    {
      id: "f1",
      icon: "ShieldCheck",
      title: "Certified Excellence",
      description:
        "All our partnerships are backed by official certifications and quality guarantees from leading manufacturers.",
    },
    {
      id: "f2",
      icon: "CheckCircle",
      title: "Genuine Products",
      description:
        "We guarantee 100% authentic products with full warranty coverage and manufacturer support.",
    },
    {
      id: "f3",
      icon: "Globe",
      title: "Network To OEM",
      description:
        "Access to an extensive global network of suppliers and manufacturers for diverse product offerings.",
    },
    {
      id: "f4",
      icon: "DollarSign",
      title: "Competitive Pricing",
      description:
        "Direct manufacturer relationships allow us to offer the most competitive pricing in the market.",
    },
  ],
};

export default function WhyChooseDistributor() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    siteConfigApi
      .getDistributor()
      .then((d) => {
        if (d && Object.keys(d).length > 0) {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch((err) => console.warn("Failed to load distributor content:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Two-part Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
          {data.headingPart1}{" "}
          <span className="text-lime-500">{data.headingPart2}</span>
        </h2>

        {/* Description */}
        <div className="max-w-3xl mx-auto text-center text-slate-600 mb-12">
          <RichTextRenderer html={data.description} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.features.map((feature) => {
            const IconComponent = Icons[feature.icon] || Icons.HelpCircle;
            return (
              <div
                key={feature.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}