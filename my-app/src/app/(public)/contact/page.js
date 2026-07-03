"use client";

import { useState } from "react";
import { createContact } from "@/lib/contacts/api"; // adjust path if needed
import PinnedHotlines from "@/components/public/PinnedHotlines";
import PinnedFaqsStrip from "@/components/public/PinnedFaqsStrip";
import WhyChooseUsPublic from "@/components/home/WhyChooseUs"; // keep if exists

export default function PublicContactUsPage() {
  const [settings] = useState({
    pageMaxWidth: "max-w-6xl",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115647.78442385157!2d82.59316131494875!3d24.119253457173268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398eec61df555555%3A0xa6cd46cf98dfad8b!2sSingrauli!5e0!3m2!1sen!2sin!4v1710000000000!3m2!1sen!2sin",
    alertSuccessMessage: "Thank you! Your enquiry has been captured seamlessly into SBS central node pipeline.",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",           // ✅ new field
    department: "Bulk Procurement RFQ", // still used as subject
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Map to backend DTO
      await createContact({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        subject: formData.department,   // department → subject
        message: formData.message,
      });
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        department: "Bulk Procurement RFQ",
        message: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const [hotlines] = useState([
    { name: "G.K. Jaiswal", designation: "Founder & Technical Chairman", phone: "+91 94251 XXXXX", email: "gk.jaiswal@sbsgroups.com" },
    { name: "A.K. Srivastava", designation: "Co-Founder & Logistics Director", phone: "+91 88188 XXXXX", email: "ak.srivastava@sbsgroups.com" },
  ]);

  return (
    <div className="bg-slate-50/50 min-h-screen p-4 md:p-12 font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      <div className={`${settings.pageMaxWidth} mx-auto space-y-12`}>
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <span className="text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md uppercase tracking-widest">Connect Matrix</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">Interface With SBS Core Command</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Transmit secure technical request logs, audit localized distribution coordinates, or initiate direct corporate hotlines.</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Send Enquiry</h2>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Enterprise Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="e.g. Adani Logistics Hub"
                />
              </div>

              {/* Company Name (new, required) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Organisation Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="sourcing@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* Department (mapped to subject) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option>Bulk Procurement RFQ</option>
                  <option>Logistics & Supply Chain Hub</option>
                  <option>Foundry Metallurgical Technical Audit</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Provide comprehensive breakdown instructions..."
                />
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
              {success && <div className="text-green-700 text-sm bg-green-50 p-2 rounded">{settings.alertSuccessMessage}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-60 transition"
              >
                {submitting ? "Transmitting..." : "Submit Enquiry"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <PinnedHotlines hotlines={hotlines} />
            <div className="w-full h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white p-2">
              <iframe src={settings.mapEmbedUrl} className="w-full h-full rounded-2xl border-0" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        </div>

        <WhyChooseUsPublic />
        <PinnedFaqsStrip />
      </div>
    </div>
  );
}