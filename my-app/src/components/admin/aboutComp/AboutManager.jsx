"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import toast from "react-hot-toast";

import AboutContentManager from "@/components/admin/aboutComp/AboutContentManager";
import OurJourneyManager from "@/components/admin/aboutComp/OurJourneyManager";
import VisionMissionManager from "@/components/admin/aboutComp/VisionMissionManager";
import CoreValuesManager from "@/components/admin/aboutComp/CoreValuesManager";

const DEFAULT_ABOUT_DATA = {
  richContent: "",
  keyDetails: [],
  journey: { images: [] },
  visionMission: [],
  coreValues: [],
  _maxCoreValues: 5,
};

const ABOUT_TABS = [
  { key: "content", label: "Content & Details" },
  { key: "journey", label: "Our Journey" },
  { key: "vision",  label: "Vision & Mission" },
  { key: "values",  label: "Core Values" },
];

export default function AboutManager() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive the active sub‑tab from the URL query parameter `sub`
  const subParam = searchParams.get("sub") || "content";
  const validSubs = ABOUT_TABS.map((t) => t.key);
  const activeTab = validSubs.includes(subParam) ? subParam : "content";

  // Change sub‑tab by updating the URL without full page reload
  const changeSubTab = useCallback(
    (newSub) => {
      const params = new URLSearchParams(searchParams);
      params.set("sub", newSub);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const [data, setData] = useState(DEFAULT_ABOUT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    siteConfigApi
      .getAbout()
      .then((d) =>
        setData((prev) => ({
          ...prev,
          ...d,
          keyDetails: d.keyDetails || [],
          journey: { images: d.journey?.images || [] },
          visionMission: d.visionMission || [],
          coreValues: d.coreValues || [],
        }))
      )
      .catch((err) => console.warn("Failed to load About data:", err))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveAbout(data);
      toast.success("About Us section saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">About Us</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the About Us page content.
        </p>
      </div>

      {/* Sub‑tab bar – uses URL‑driven activeTab */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5">
        <nav className="flex gap-1">
          {ABOUT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => changeSubTab(tab.key)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-black transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-950 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conditional rendering based on active sub‑tab */}
      {activeTab === "content" && <AboutContentManager data={data} setData={setData} />}
      {activeTab === "journey" && <OurJourneyManager data={data} setData={setData} />}
      {activeTab === "vision"  && <VisionMissionManager data={data} setData={setData} />}
      {activeTab === "values"  && <CoreValuesManager data={data} setData={setData} />}

      {/* Global save button */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving…" : "Save Section"}
        </button>
      </div>
    </div>
  );
}