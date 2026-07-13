"use client";

import { useState } from "react";
import { createContact } from "@/lib/contacts/api";
import { Send, User, Mail, Phone, Building2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

// Country codes list (same as before - keeping it short for brevity)
const COUNTRY_CODES = [
  { code: "+91", label: "IN +91" },
  { code: "+1", label: "US/CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+81", label: "JP +81" },
  { code: "+86", label: "CN +86" },
  { code: "+971", label: "AE +971" },
  { code: "", label: "No prefix" },
];

export default function ContactForm({
  successMessage = "Thank you! Your enquiry has been received.",
  onSuccess,
  title = "Get in Touch",
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    subject: "",
    message: "",
  });

  const [phonePrefix, setPhonePrefix] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updatePhone = (prefix, number) => {
    const full = prefix ? prefix + number : number;
    setFormData((prev) => ({ ...prev, phone: full }));
  };

  const handlePrefixChange = (e) => {
    const newPrefix = e.target.value;
    setPhonePrefix(newPrefix);
    updatePhone(newPrefix, phoneNumber);
  };

  const handlePhoneNumberChange = (e) => {
    const newNumber = e.target.value.replace(/\D/g, "");
    if (newNumber.length <= 15) {
      setPhoneNumber(newNumber);
      updatePhone(phonePrefix, newNumber);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createContact({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        subject: formData.subject,
        message: formData.message,
      });
      toast.success(successMessage, { position: "top-right" });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        subject: "",
        message: "",
      });
      setPhonePrefix("+91");
      setPhoneNumber("");
      onSuccess?.();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { position: "top-right" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">We'll respond within 24 hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <User className="w-4 h-4 text-blue-900" />
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Building2 className="w-4 h-4 text-blue-900" />
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            placeholder="Acme Inc."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Mail className="w-4 h-4 text-blue-900" />
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="you@company.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Phone className="w-4 h-4 text-blue-900" />
          Phone Number *
        </label>
        <div className="flex">
          <select
            value={phonePrefix}
            onChange={handlePrefixChange}
            className="px-3 py-3 border border-r-0 border-slate-300 rounded-l-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 min-w-[100px]"
          >
            {COUNTRY_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            required
            placeholder="9876543210"
            maxLength={15}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <MessageCircle className="w-4 h-4 text-blue-900" />
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          placeholder="What is this about?"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <MessageCircle className="w-4 h-4 text-blue-900" />
          Message *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Tell us about your requirement..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-blue-950 to-blue-800 text-white font-black text-sm py-4 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg hover:shadow-xl"
      >
        <Send className="inline-block mr-2" size={18} />
        {submitting ? "Sending..." : "Send Message"}
      </button>
      
      <p className="text-xs text-slate-400 text-center">
        We'll respond within 24 hours. Your information is secure with us.
      </p>
    </form>
  );
}