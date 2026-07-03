"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Building2, User, MapPin, Phone, Mail, Plus, Trash2, Share2 } from "lucide-react";
import companyApi, { DEFAULT_COMPANY } from "@/lib/company/companyApi";
import { uploadImage } from "@/lib/uploadApi";
import toast from "react-hot-toast";

export default function CompanyDetailsPage() {
  const [data, setData] = useState(DEFAULT_COMPANY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setData(await companyApi.get());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const uploadTo = async (path, file, folder) => {
    if (!file) return;
    try {
      const url = await uploadImage(file, folder);
      set(path, url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e.message || "Upload failed");
    }
  };

  const addItem = (key) =>
    setData((p) => ({ ...p, contacts: { ...p.contacts, [key]: [...(p.contacts[key] || []), ""] } }));
  const setItem = (key, i, v) =>
    setData((p) => ({ ...p, contacts: { ...p.contacts, [key]: p.contacts[key].map((x, idx) => (idx === i ? v : x)) } }));
  const removeItem = (key, i) =>
    setData((p) => ({ ...p, contacts: { ...p.contacts, [key]: p.contacts[key].filter((_, idx) => idx !== i) } }));

  const save = async () => {
    setSaving(true);
    try {
      const clean = {
        ...data,
        contacts: {
          ...data.contacts,
          phones: (data.contacts.phones || []).map((s) => s.trim()).filter(Boolean),
          emails: (data.contacts.emails || []).map((s) => s.trim()).filter(Boolean),
        },
      };
      await companyApi.save(clean);
      toast.success("Company details saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4";
  const label = "block text-xs font-bold text-slate-500 uppercase mb-1";
  const input = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  const PersonCard = ({ who, title }) => (
    <div className={card}>
      <h3 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-4 h-4" /> {title}</h3>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-xl bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
          {data[who].photo ? <img src={data[who].photo} alt={title} className="h-full w-full object-cover" /> : <User className="w-7 h-7 text-slate-300" />}
        </div>
        <label className="cursor-pointer text-xs font-bold text-blue-600 flex items-center gap-1">
          <Upload className="w-3.5 h-3.5" /> Upload photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadTo(`${who}.photo`, e.target.files?.[0], "company")} />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className={label}>Name</label><input className={input} value={data[who].name} onChange={(e) => set(`${who}.name`, e.target.value)} /></div>
        <div><label className={label}>Designation</label><input className={input} value={data[who].designation} onChange={(e) => set(`${who}.designation`, e.target.value)} /></div>
      </div>
      <div><label className={label}>Bio</label><textarea rows="2" className={input} value={data[who].bio} onChange={(e) => set(`${who}.bio`, e.target.value)} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Company Details</h1>
            <p className="mt-1 text-slate-500">One source for the logo (header + footer), about-us, founders, location and contacts.</p>
          </div>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {/* Identity + logo */}
        <div className={card}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4" /> Identity</h3>
          <div className="flex items-center gap-4">
            <div className="h-20 w-32 rounded-xl bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
              {data.logo ? <img src={data.logo} alt="Logo" className="h-full w-full object-contain" /> : <Building2 className="w-7 h-7 text-slate-300" />}
            </div>
            <label className="cursor-pointer text-xs font-bold text-blue-600 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadTo("logo", e.target.files?.[0], "company")} />
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={label}>Company Name</label><input className={input} value={data.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><label className={label}>Tagline</label><input className={input} value={data.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
          </div>
        </div>

        {/* About */}
        <div className={card}>
          <h3 className="font-bold text-slate-900">About Us</h3>
          <div><label className={label}>Heading</label><input className={input} value={data.about.title} onChange={(e) => set("about.title", e.target.value)} /></div>
          <div><label className={label}>Description</label><textarea rows="4" className={input} value={data.about.description} onChange={(e) => set("about.description", e.target.value)} /></div>
        </div>

        <PersonCard who="founder" title="Founder" />
        <PersonCard who="coFounder" title="Co-Founder" />

        {/* Location */}
        <div className={card}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</h3>
          <div><label className={label}>Address</label><textarea rows="2" className={input} value={data.location.address} onChange={(e) => set("location.address", e.target.value)} /></div>
          <div className="grid sm:grid-cols-4 gap-3">
            <div><label className={label}>City</label><input className={input} value={data.location.city} onChange={(e) => set("location.city", e.target.value)} /></div>
            <div><label className={label}>State</label><input className={input} value={data.location.state} onChange={(e) => set("location.state", e.target.value)} /></div>
            <div><label className={label}>Country</label><input className={input} value={data.location.country} onChange={(e) => set("location.country", e.target.value)} /></div>
            <div><label className={label}>Pincode</label><input className={input} value={data.location.pincode} onChange={(e) => set("location.pincode", e.target.value)} /></div>
          </div>
          <div><label className={label}>Map Link</label><input className={input} value={data.location.mapLink} onChange={(e) => set("location.mapLink", e.target.value)} /></div>
        </div>

        {/* Contacts */}
        <div className={card}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Phone className="w-4 h-4" /> Contacts</h3>
          {["phones", "emails"].map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className={label}>{key === "phones" ? "Phone numbers" : "Email addresses"}</label>
                <button type="button" onClick={() => addItem(key)} className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5"><Plus className="w-3 h-3" /> Add</button>
              </div>
              <div className="space-y-2">
                {(data.contacts[key] || []).map((val, i) => (
                  <div key={i} className="flex gap-2">
                    {key === "phones" ? <Phone className="w-4 h-4 text-slate-400 mt-2.5" /> : <Mail className="w-4 h-4 text-slate-400 mt-2.5" />}
                    <input className={input} value={val} onChange={(e) => setItem(key, i, e.target.value)} />
                    <button type="button" onClick={() => removeItem(key, i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div><label className={label}>WhatsApp number</label><input className={input} value={data.contacts.whatsapp} onChange={(e) => set("contacts.whatsapp", e.target.value)} /></div>
        </div>

        {/* Social */}
        <div className={card}>
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Share2 className="w-4 h-4" /> Social Links</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {["linkedin", "instagram", "facebook", "twitter", "youtube"].map((s) => (
              <div key={s}><label className={`${label} capitalize`}>{s}</label><input className={input} value={data.social[s]} onChange={(e) => set(`social.${s}`, e.target.value)} /></div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pb-10">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Company Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
