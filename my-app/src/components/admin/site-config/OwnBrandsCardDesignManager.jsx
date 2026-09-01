"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Maximize2, Save } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import BrandCard from "@/components/shared/BrandCard";

const DEFAULT_HEIGHT = 200;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 320;

// Preview brand used only to demo the size live — not saved anywhere.
const PREVIEW_BRAND = {
  slug: "#",
  brandName: "Sample Own Brand",
  logo: "https://placehold.co/300x300/eef2ff/4338ca?text=Logo",
};

export default function OwnBrandsCardDesignManager() {
  const [logoHeightPx, setLogoHeightPx] = useState(DEFAULT_HEIGHT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await siteConfigApi.getOwnBrandsCardDesign();
        if (data?.logoHeightPx) setLogoHeightPx(data.logoHeightPx);
      } catch {
        toast.error("Failed to load Own Brands card settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveOwnBrandsCardDesign({ logoHeightPx });
      toast.success("Own Brands card size saved");
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
    <div className="max-w-xl space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Maximize2 size={16} className="text-blue-600" /> Own Brands Card Size
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Controls how large the logo area is on cards on the public Own Brands page only.
          The regular Brands directory is unaffected.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-black text-slate-700 flex justify-between">
            <span>Card Logo Height</span>
            <span className="text-blue-600">{logoHeightPx}px</span>
          </label>
          <input
            type="range"
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            step={10}
            value={logoHeightPx}
            onChange={(e) => setLogoHeightPx(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </div>

        <div className="w-40 mx-auto">
          <BrandCard brand={PREVIEW_BRAND} settings={{ logoHeightPx }} />
        </div>

        <div className="flex justify-end">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
