"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

export default function PublicStandaloneFaqProfileView() {
  const params = useParams();

  // DUMMY SCHEMAS SYNCED FOR DEMONSTRATING BOTH TEXT AND ENJECTED MULTI-IMAGES RENDERING
  const [solutionNode] = useState({
    question: "What is the tensile rating of your heavy mining conveyor loops?",
    slug: params.slug,
    askedBy: "Verified User Client Node (procurement@adani.com)",
    // Live multi-layered content blocks template holding inline structured media images tags
    answerHtml: `
      <div>
        <p style="font-size: 13px; color: #334155; font-weight: 600; line-height: 1.6;">
          Our proprietary high-impact processing reinforced loops carry registered structural endurance certifications. For all deep extraction layouts, the specifications hold safe load coefficients up to <strong>4500 kN/m</strong> without tracking tensile decay.
        </p>
        
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #1e3a8a; background-color: #f8fafc; border-radius: 8px;">
          <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; display: block;">Field Engineering Operational Status Log Asset Diagram:</span>
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600" alt="Conveyor Infrastructure Layout" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-top: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
        </div>

        <p style="font-size: 13px; color: #334155; font-weight: 600; line-height: 1.6;">
          If specialized engineering audit metrics require higher stress thresholds, custom reinforced modifications can be implemented at our central Singrauli foundry depot.
        </p>
      </div>
    `
  });

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-12 font-sans text-slate-800 antialiased">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* BACK ACTION LINE STRIP */}
        <Link href="/contact/faqs" className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-all">
          ⬅️ Back to Central Knowledge Pool Engine
        </Link>

        {/* RECONCILED CMS DATA SHEET OUTPUT CANVAS */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="border-b pb-4 space-y-1.5">
            <span className="text-[9px] font-mono font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md tracking-wider">
              Asked By / Reference: {solutionNode.askedBy}
            </span>
            <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight pt-2 leading-snug">❓ {solutionNode.question}</h1>
          </div>

          {/* 🆕 HIGH LEVEL CMS RENDERING UNIT INJECTS COMPLEX LAYOUT STRUCTURES SEAMLESSLY */}
          <div 
            className="prose prose-sm max-w-none text-slate-700 font-medium"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(solutionNode.answerHtml) }} 
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <span>Security Index Status: Verified Secure Node</span>
            <span>Target Route Node: /faqs/{params.slug}</span>
          </div>
        </div>

      </div>
    </div>
  );
}