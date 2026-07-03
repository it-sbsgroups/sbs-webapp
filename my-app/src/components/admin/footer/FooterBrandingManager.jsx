"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Trash2, Save, Building2 } from "lucide-react";
import { loadFooter, saveFooterFields } from "@/lib/footerSections";
import { uploadImage } from "@/lib/uploadApi";
import toast from "react-hot-toast";

export default function FooterBrandingManager() {
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: "SBS GROUP",
    brandHighlight: "INDUSTRIAL",
    logoUrl: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png",
    showAddress: true,
    address: "Industrial Area, Singrauli, Madhya Pradesh - 486886",
    mapLink: "https://maps.google.com/?q=SUPERB+BEARING+STORES+Singrauli",
  });

  const [logo, setLogo] = useState(formData.logoUrl);
  const [saving, setSaving] = useState(false);

  // Load saved branding (public footer reads brandText; we map it to companyName).
  useEffect(() => {
    (async () => {
      try {
        const c = await loadFooter();
        if (c && Object.keys(c).length) {
          setFormData((p) => ({
            ...p,
            companyName: c.brandText ?? p.companyName,
            brandHighlight: c.brandHighlight ?? p.brandHighlight,
            logoUrl: c.logoUrl ?? p.logoUrl,
            showAddress: c.showAddress ?? p.showAddress,
            address: c.address ?? p.address,
            mapLink: c.mapLink ?? p.mapLink,
          }));
          if (c.logoUrl) setLogo(c.logoUrl);
        }
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "footer");
      setLogo(url);
      setFormData((prev) => ({ ...prev, logoUrl: url }));
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
  };

  const deleteLogo = () => {
    setLogo("");
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFooterFields({
        brandText: formData.companyName,
        brandHighlight: formData.brandHighlight,
        logoUrl: formData.logoUrl,
        showAddress: formData.showAddress,
        address: formData.address,
        mapLink: formData.mapLink,
      });
      toast.success("Footer branding saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Footer Branding</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage footer logo, company name and address.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side - Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Company Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Company Information</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Brand Highlight Text</label>
                <input
                  type="text"
                  name="brandHighlight"
                  value={formData.brandHighlight}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Google Maps Link</label>
                <input
                  type="text"
                  name="mapLink"
                  value={formData.mapLink}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="showAddress"
                  checked={formData.showAddress}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <label className="text-sm font-medium">Show Physical Address</label>
              </div>

              {formData.showAddress && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">Footer Logo</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                {logo ? (
                  <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain p-4" />
                ) : (
                  <span className="text-sm text-slate-400">No Logo Uploaded</span>
                )}
              </div>
              <div className="flex flex-col justify-center gap-3">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" /> Upload Logo
                </button>
                <button
                  onClick={deleteLogo}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" /> Delete Logo
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              <Save className="h-4 w-4" /> Save Branding Settings
            </button>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">Live Preview</h3>
            <div className="overflow-hidden rounded-xl bg-[#030712] p-6">
              <div className="flex items-center gap-3">
                {logo && <img src={logo} alt="preview" className="h-10 object-contain brightness-110" />}
                <span className="text-base font-bold tracking-tight text-white font-mono uppercase">
                  {formData.companyName || "SBS GROUP"}
                  <span className="text-lime-400">.{formData.brandHighlight || "INDUSTRIAL"}</span>
                </span>
              </div>
              {formData.showAddress && (
                <p className="mt-3 text-xs text-slate-400">{formData.address}</p>
              )}
            </div>
            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
              Changes reflect on website footer once saved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}