"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ImageIcon, Save, Upload, X } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import { uploadImage } from "@/lib/uploadApi";

// Every public page that renders <Breadcrumb pageKey="..."> reads its banner
// from this list (site-config key "breadcrumbBanners"). Add a new page here
// whenever a new public route gets a breadcrumb.
export const BREADCRUMB_PAGES = [
  { key: "about", label: "About Us" },
  { key: "contact", label: "Contact Us" },
  { key: "products", label: "Products" },
  { key: "brands", label: "Brands" },
  { key: "own-brands", label: "Own Brands" },
  { key: "distributors", label: "Distributors" },
  { key: "clients", label: "Clients" },
  { key: "news", label: "News & Media" },
  { key: "employees", label: "Employees" },
  { key: "testimonials", label: "Testimonials" },
  { key: "faqs", label: "FAQs" },
  { key: "search", label: "Search Results" },
];

export default function BreadcrumbBannerManager() {
  const [banners, setBanners] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const fileInputRefs = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const data = await siteConfigApi.getBreadcrumbBanners();
        setBanners(data && typeof data === "object" ? data : {});
      } catch {
        toast.error("Failed to load breadcrumb banners");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async (pageKey, file) => {
    if (!file) return;
    setUploadingKey(pageKey);
    try {
      const url = await uploadImage(file, `breadcrumbs/${pageKey}`);
      setBanners((prev) => ({ ...prev, [pageKey]: { ...(prev[pageKey] || {}), image: url } }));
      toast.success("Image uploaded — remember to Save Changes");
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const removeBanner = (pageKey) => {
    setBanners((prev) => {
      const next = { ...prev };
      delete next[pageKey];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveBreadcrumbBanners(banners);
      toast.success("Breadcrumb banners saved");
    } catch (e) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><ImageIcon size={16} className="text-blue-600" /> Breadcrumb Banners</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Assign a background image for the breadcrumb/hero strip at the top of each public page. Pages without an image fall back to the default gradient.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {BREADCRUMB_PAGES.map((page) => {
          const banner = banners[page.key] || {};
          return (
            <div key={page.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-24 bg-slate-100 relative">
                {banner.image ? (
                  <img src={banner.image} alt={page.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">No image set</div>
                )}
                {banner.image && (
                  <button
                    onClick={() => removeBanner(page.key)}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-700">{page.label}</span>
                <input
                  ref={(el) => (fileInputRefs.current[page.key] = el)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(page.key, e.target.files?.[0])}
                />
                <button
                  onClick={() => fileInputRefs.current[page.key]?.click()}
                  disabled={uploadingKey === page.key}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <Upload size={12} /> {uploadingKey === page.key ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
