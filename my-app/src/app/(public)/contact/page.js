"use client";

import { useState } from "react";
import PinnedHotlines from "@/components/public/PinnedHotlines";
import PinnedFaqsStrip from "@/components/public/PinnedFaqsStrip";
import WhyChooseUsPublic from "@/components/home/WhyChooseUs";
import ContactForm from "@/components/public/ContactForm";
import { Toaster } from "react-hot-toast";

export default function PublicContactUsPage() {
  const [settings] = useState({
    pageMaxWidth: "max-w-6xl",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115647.78442385157!2d82.59316131494875!3d24.119253457173268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398eec61df555555%3A0xa6cd46cf98dfad8b!2sSingrauli!5e0!3m2!1sen!2sin!4v1710000000000!3m2!1sen!2sin",
    alertSuccessMessage:
      "Thank you! Your enquiry has been captured seamlessly into SBS central node pipeline.",
  });

  const [hotlines] = useState([
    {
      name: "G.K. Jaiswal",
      designation: "Founder & Technical Chairman",
      phone: "+91 94251 XXXXX",
      email: "gk.jaiswal@sbsgroups.com",
    },
    {
      name: "A.K. Srivastava",
      designation: "Co-Founder & Logistics Director",
      phone: "+91 88188 XXXXX",
      email: "ak.srivastava@sbsgroups.com",
    },
  ]);

  return (
    <div className="bg-slate-50/50 min-h-screen p-4 md:p-12 font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      <div className={`${settings.pageMaxWidth} mx-auto space-y-12`}>
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md uppercase tracking-widest">
            Connect Matrix
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Interface With SBS Core Command
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Transmit secure technical request logs, audit localized distribution coordinates, or initiate direct corporate hotlines.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <ContactForm successMessage={settings.alertSuccessMessage} />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <PinnedHotlines hotlines={hotlines} />
            <div className="w-full h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white p-2">
              <iframe
                src={settings.mapEmbedUrl}
                loading="lazy"
                className="w-full h-full rounded-2xl border-0"
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <WhyChooseUsPublic />
        <PinnedFaqsStrip />
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}
