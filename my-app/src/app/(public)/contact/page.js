"use client";

import { useState } from "react";
import { createContact } from "@/lib/contacts/api";
import PinnedHotlines from "@/components/public/PinnedHotlines";
import PinnedFaqsStrip from "@/components/public/PinnedFaqsStrip";
import WhyChooseUsPublic from "@/components/home/WhyChooseUs";
import { Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Country codes list (you can extend this as needed)
const COUNTRY_CODES = [
  { code: "+1", label: "US/CA +1" },
  { code: "+7", label: "RU/KZ +7" },
  { code: "+20", label: "EG +20" },
  { code: "+27", label: "ZA +27" },
  { code: "+30", label: "GR +30" },
  { code: "+31", label: "NL +31" },
  { code: "+32", label: "BE +32" },
  { code: "+33", label: "FR +33" },
  { code: "+34", label: "ES +34" },
  { code: "+36", label: "HU +36" },
  { code: "+39", label: "IT/VA +39" },
  { code: "+40", label: "RO +40" },
  { code: "+41", label: "CH +41" },
  { code: "+43", label: "AT +43" },
  { code: "+44", label: "UK +44" },
  { code: "+45", label: "DK +45" },
  { code: "+46", label: "SE +46" },
  { code: "+47", label: "NO +47" },
  { code: "+48", label: "PL +48" },
  { code: "+49", label: "DE +49" },
  { code: "+51", label: "PE +51" },
  { code: "+52", label: "MX +52" },
  { code: "+53", label: "CU +53" },
  { code: "+54", label: "AR +54" },
  { code: "+55", label: "BR +55" },
  { code: "+56", label: "CL +56" },
  { code: "+57", label: "CO +57" },
  { code: "+58", label: "VE +58" },
  { code: "+60", label: "MY +60" },
  { code: "+61", label: "AU +61" },
  { code: "+62", label: "ID +62" },
  { code: "+63", label: "PH +63" },
  { code: "+64", label: "NZ +64" },
  { code: "+65", label: "SG +65" },
  { code: "+66", label: "TH +66" },
  { code: "+81", label: "JP +81" },
  { code: "+82", label: "KR +82" },
  { code: "+84", label: "VN +84" },
  { code: "+86", label: "CN +86" },
  { code: "+90", label: "TR +90" },
  { code: "+91", label: "IN +91" },
  { code: "+92", label: "PK +92" },
  { code: "+93", label: "AF +93" },
  { code: "+94", label: "LK +94" },
  { code: "+95", label: "MM +95" },
  { code: "+98", label: "IR +98" },
  { code: "+211", label: "SS +211" },
  { code: "+212", label: "MA/EH +212" },
  { code: "+213", label: "DZ +213" },
  { code: "+216", label: "TN +216" },
  { code: "+218", label: "LY +218" },
  { code: "+220", label: "GM +220" },
  { code: "+221", label: "SN +221" },
  { code: "+222", label: "MR +222" },
  { code: "+223", label: "ML +223" },
  { code: "+224", label: "GN +224" },
  { code: "+225", label: "CI +225" },
  { code: "+226", label: "BF +226" },
  { code: "+227", label: "NE +227" },
  { code: "+228", label: "TG +228" },
  { code: "+229", label: "BJ +229" },
  { code: "+230", label: "MU +230" },
  { code: "+231", label: "LR +231" },
  { code: "+232", label: "SL +232" },
  { code: "+233", label: "GH +233" },
  { code: "+234", label: "NG +234" },
  { code: "+235", label: "TD +235" },
  { code: "+236", label: "CF +236" },
  { code: "+237", label: "CM +237" },
  { code: "+238", label: "CV +238" },
  { code: "+239", label: "ST +239" },
  { code: "+240", label: "GQ +240" },
  { code: "+241", label: "GA +241" },
  { code: "+242", label: "CG +242" },
  { code: "+243", label: "CD +243" },
  { code: "+244", label: "AO +244" },
  { code: "+245", label: "GW +245" },
  { code: "+246", label: "IO +246" },
  { code: "+247", label: "AC +247" },
  { code: "+248", label: "SC +248" },
  { code: "+249", label: "SD +249" },
  { code: "+250", label: "RW +250" },
  { code: "+251", label: "ET +251" },
  { code: "+252", label: "SO +252" },
  { code: "+253", label: "DJ +253" },
  { code: "+254", label: "KE +254" },
  { code: "+255", label: "TZ +255" },
  { code: "+256", label: "UG +256" },
  { code: "+257", label: "BI +257" },
  { code: "+258", label: "MZ +258" },
  { code: "+260", label: "ZM +260" },
  { code: "+261", label: "MG +261" },
  { code: "+262", label: "RE/YT/TF +262" },
  { code: "+263", label: "ZW +263" },
  { code: "+264", label: "NA +264" },
  { code: "+265", label: "MW +265" },
  { code: "+266", label: "LS +266" },
  { code: "+267", label: "BW +267" },
  { code: "+268", label: "SZ +268" },
  { code: "+269", label: "KM +269" },
  { code: "+290", label: "SH/TA +290" },
  { code: "+291", label: "ER +291" },
  { code: "+297", label: "AW +297" },
  { code: "+298", label: "FO +298" },
  { code: "+299", label: "GL +299" },
  { code: "+350", label: "GI +350" },
  { code: "+351", label: "PT +351" },
  { code: "+352", label: "LU +352" },
  { code: "+353", label: "IE +353" },
  { code: "+354", label: "IS +354" },
  { code: "+355", label: "AL +355" },
  { code: "+356", label: "MT +356" },
  { code: "+357", label: "CY +357" },
  { code: "+358", label: "FI/AX +358" },
  { code: "+359", label: "BG +359" },
  { code: "+370", label: "LT +370" },
  { code: "+371", label: "LV +371" },
  { code: "+372", label: "EE +372" },
  { code: "+373", label: "MD +373" },
  { code: "+374", label: "AM +374" },
  { code: "+375", label: "BY +375" },
  { code: "+376", label: "AD +376" },
  { code: "+377", label: "MC +377" },
  { code: "+378", label: "SM +378" },
  { code: "+380", label: "UA +380" },
  { code: "+381", label: "RS +381" },
  { code: "+382", label: "ME +382" },
  { code: "+383", label: "XK +383" },
  { code: "+385", label: "HR +385" },
  { code: "+386", label: "SI +386" },
  { code: "+387", label: "BA +387" },
  { code: "+389", label: "MK +389" },
  { code: "+420", label: "CZ +420" },
  { code: "+421", label: "SK +421" },
  { code: "+423", label: "LI +423" },
  { code: "+500", label: "FK/GS +500" },
  { code: "+501", label: "BZ +501" },
  { code: "+502", label: "GT +502" },
  { code: "+503", label: "SV +503" },
  { code: "+504", label: "HN +504" },
  { code: "+505", label: "NI +505" },
  { code: "+506", label: "CR +506" },
  { code: "+507", label: "PA +507" },
  { code: "+508", label: "PM +508" },
  { code: "+509", label: "HT +509" },
  { code: "+590", label: "GP/BL/MF +590" },
  { code: "+591", label: "BO +591" },
  { code: "+592", label: "GY +592" },
  { code: "+593", label: "EC +593" },
  { code: "+594", label: "GF +594" },
  { code: "+595", label: "PY +595" },
  { code: "+596", label: "MQ +596" },
  { code: "+597", label: "SR +597" },
  { code: "+598", label: "UY +598" },
  { code: "+599", label: "BQ/CW +599" },
  { code: "+670", label: "TL +670" },
  { code: "+672", label: "NF/AQ +672" },
  { code: "+673", label: "BN +673" },
  { code: "+674", label: "NR +674" },
  { code: "+675", label: "PG +675" },
  { code: "+676", label: "TO +676" },
  { code: "+677", label: "SB +677" },
  { code: "+678", label: "VU +678" },
  { code: "+679", label: "FJ +679" },
  { code: "+680", label: "PW +680" },
  { code: "+681", label: "WF +681" },
  { code: "+682", label: "CK +682" },
  { code: "+683", label: "NU +683" },
  { code: "+685", label: "WS +685" },
  { code: "+686", label: "KI +686" },
  { code: "+687", label: "NC +687" },
  { code: "+688", label: "TV +688" },
  { code: "+689", label: "PF +689" },
  { code: "+690", label: "TK +690" },
  { code: "+691", label: "FM +691" },
  { code: "+692", label: "MH +692" },
  { code: "+850", label: "KP +850" },
  { code: "+852", label: "HK +852" },
  { code: "+853", label: "MO +853" },
  { code: "+855", label: "KH +855" },
  { code: "+856", label: "LA +856" },
  { code: "+880", label: "BD +880" },
  { code: "+886", label: "TW +886" },
  { code: "+960", label: "MV +960" },
  { code: "+961", label: "LB +961" },
  { code: "+962", label: "JO +962" },
  { code: "+963", label: "SY +963" },
  { code: "+964", label: "IQ +964" },
  { code: "+965", label: "KW +965" },
  { code: "+966", label: "SA +966" },
  { code: "+967", label: "YE +967" },
  { code: "+968", label: "OM +968" },
  { code: "+970", label: "PS +970" },
  { code: "+971", label: "AE +971" },
  { code: "+972", label: "IL +972" },
  { code: "+973", label: "BH +973" },
  { code: "+974", label: "QA +974" },
  { code: "+975", label: "BT +975" },
  { code: "+976", label: "MN +976" },
  { code: "+977", label: "NP +977" },
  { code: "+992", label: "TJ +992" },
  { code: "+993", label: "TM +993" },
  { code: "+994", label: "AZ +994" },
  { code: "+995", label: "GE +995" },
  { code: "+996", label: "KG +996" },
  { code: "+998", label: "UZ +998" },
  { code: "", label: "No prefix" }
];

export default function PublicContactUsPage() {
  const [settings] = useState({
    pageMaxWidth: "max-w-6xl",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115647.78442385157!2d82.59316131494875!3d24.119253457173268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398eec61df555555%3A0xa6cd46cf98dfad8b!2sSingrauli!5e0!3m2!1sen!2sin!4v1710000000000!3m2!1sen!2sin",
    alertSuccessMessage:
      "Thank you! Your enquiry has been captured seamlessly into SBS central node pipeline.",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",   // combined value sent to backend
    companyName: "",
    subject: "",
    message: "",
  });

  // Separate state for prefix and raw number for UI
  const [phonePrefix, setPhonePrefix] = useState("+91"); // default India
  const [phoneNumber, setPhoneNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // When prefix or number changes, update the combined phone field
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
    const newNumber = e.target.value.replace(/\D/g, ""); // digits only
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
        phone: formData.phone, // already combined
        companyName: formData.companyName,
        subject: formData.subject,
        message: formData.message,
      });
      toast.success(settings.alertSuccessMessage, { position: "top-right" });
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
    } catch (err) {
      toast.error(`Error: ${err.message}`, { position: "top-right" });
    } finally {
      setSubmitting(false);
    }
  };

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
            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5"
            >
              <h2 className="text-xl font-bold text-slate-900">Send Enquiry</h2>

              {/* Full Name + Company Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="enter company name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="enter your email"
                />
              </div>

              {/* Phone with country code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="flex">
                  <select
                    value={phonePrefix}
                    onChange={handlePrefixChange}
                    className="px-3 py-2 border border-r-0 border-slate-300 rounded-l-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    style={{ minWidth: "100px" }}
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
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="enter phone number"
                    maxLength={15}
                  />
                </div>
                {!phonePrefix && (
                  <p className="text-xs text-slate-400 mt-1">No country code will be added</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Enter subject"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="write your message"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer w-full py-3 bg-gradient-to-r from-blue-950 to-blue-800 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-60 transition"
              >
                <Send className="inline-block mr-2" size={18} />
                {submitting ? "Transmitting..." : "Send Message"}
              </button>
            </form>
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