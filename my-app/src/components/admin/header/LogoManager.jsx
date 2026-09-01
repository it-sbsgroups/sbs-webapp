"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Trash2, Building2, ImageIcon, Save } from "lucide-react";
import { loadHeaderSection, saveHeaderSection } from "@/lib/headerSections";
import { uploadImage } from "@/lib/uploadApi";
import toast from "react-hot-toast";

export default function LogoManager() {
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: "SBS Group",
    tagline: "Engineering Excellence & Innovation",
  });

  const [logo, setLogo] = useState(
    "https://placehold.co/300x120?text=Company+Logo"
  );

  const [favicon, setFavicon] = useState(
    "https://placehold.co/64x64?text=F"
  );

  const [saving, setSaving] = useState(false);

  // Load saved branding (falls back to the defaults above if nothing saved).
  useEffect(() => {
    (async () => {
      try {
        const b = await loadHeaderSection("branding");
        if (b) {
          setFormData({
            companyName: b.companyName ?? "SBS Group",
            tagline: b.tagline ?? "Engineering Excellence & Innovation",
          });
          if (b.logoUrl !== undefined) setLogo(b.logoUrl);
          if (b.faviconUrl !== undefined) setFavicon(b.faviconUrl);
        }
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "header");
      setLogo(url);
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err.message || "Logo upload failed");
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "header");
      setFavicon(url);
      toast.success("Favicon uploaded");
    } catch (err) {
      toast.error(err.message || "Favicon upload failed");
    }
  };

  const deleteLogo = () => {
    setLogo("");
  };

  const deleteFavicon = () => {
    setFavicon("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHeaderSection("branding", {
        companyName: formData.companyName,
        tagline: formData.tagline,
        logoUrl: logo,
        faviconUrl: favicon,
      });
      toast.success("Branding saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Company Branding
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage company name, tagline, logo and favicon.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side */}
        <div className="space-y-6 lg:col-span-2">
          {/* Company Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />

              <h3 className="text-lg font-semibold">
                Company Information
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Company Name
                </label>

                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Company Tagline
                </label>

                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  placeholder="Enter company tagline"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-blue-600" />

              <h3 className="text-lg font-semibold">
                Website Logo
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Current Logo
                </label>

                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain p-4"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">
                      No Logo Uploaded
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </button>

                <button
                  onClick={deleteLogo}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Logo
                </button>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-blue-600" />

              <h3 className="text-lg font-semibold">
                Favicon
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Current Favicon
                </label>

                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt="Favicon"
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">
                      No Favicon Uploaded
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />

                <button
                  onClick={() => faviconInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" />
                  Upload Favicon
                </button>

                <button
                  onClick={deleteFavicon}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Favicon
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save Branding Settings"}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">
              Live Preview
            </h3>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center justify-between bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt="preview"
                      className="h-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-24 rounded bg-slate-100" />
                  )}

                  <div>
                    <h4 className="font-semibold">
                      {formData.companyName}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {formData.tagline}
                    </p>
                  </div>
                </div>

                {favicon && (
                  <img
                    src={favicon}
                    alt="favicon"
                    className="h-8 w-8"
                  />
                )}
              </div>

              <div className="border-t bg-slate-50 px-4 py-2 text-xs text-slate-500">
                Header Preview
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
              Changes made here will reflect on your website
              branding once connected with backend APIs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}