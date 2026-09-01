"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import toast from "react-hot-toast";

const DEFAULT_DATA = {
  titlePart1: "Trusted Protection,",
  titlePart2: "Proven Result",
  description:
    "<p>Our official distributor status ensures you receive authentic products with full manufacturer support.</p>",
  features: [
    {
      id: "f1",
      icon: "Users",
      title: "50+",
      subtitle: "Happy Clients",
      description: "Trusted by leading companies worldwide",
    },
    {
      id: "f2",
      icon: "TrendingUp",
      title: "95%",
      subtitle: "Client Retention",
      description: "Long-term partnerships built on trust",
    },
    {
      id: "f3",
      icon: "Ribbon",
      title: "20+",
      subtitle: "Years Experience",
      description: "Proven track record of excellence",
    },
    {
      id: "f4",
      icon: "CircleCheckBig",
      title: "99%",
      subtitle: "Satisfaction Rate",
      description: "Consistently exceeding expectations",
    },
  ],
};

export default function ProtectionProven() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState({
    title: "",
    subtitle: "",
    description: "",
    icon: "Star",
  });

  useEffect(() => {
    siteConfigApi
      .getProtectionProven()
      .then((d) => {
        if (d && Object.keys(d).length > 0) {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch((err) => console.warn("Failed to load Protection Proven data:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const addFeature = () => {
    const trimmedTitle = newFeature.title.trim();
    const trimmedDesc = newFeature.description.trim();
    if (!trimmedTitle || !trimmedDesc) {
      toast.error("Both title and description are required.");
      return;
    }
    setData((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          id: `f${Date.now()}`,
          icon: newFeature.icon || "Star",
          title: trimmedTitle,
          subtitle: newFeature.subtitle.trim(),
          description: trimmedDesc,
        },
      ],
    }));
    setNewFeature({ title: "", subtitle: "", description: "", icon: "Star" });
  };

  const removeFeature = (index) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index, field, value) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await siteConfigApi.saveProtectionProven(data);
      toast.success("Clients page section Protection Proven saved");
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Clients Page – Protection Proven
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the "Protection Proven" section.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
        {/* Title Parts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Title Part 1
            </label>
            <input
              type="text"
              value={data.titlePart1}
              onChange={(e) => updateField("titlePart1", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Title Part 2 (highlight)
            </label>
            <input
              type="text"
              value={data.titlePart2}
              onChange={(e) => updateField("titlePart2", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-medium">
            Introductory Description
          </label>
          <RichTextEditor
            value={data.description || ""}
            onChange={(html) => updateField("description", html)}
            placeholder="Write a short introduction for the section…"
            uploadFolder="clients-protection-proven"
          />
        </div>

        {/* Features List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium">Feature Cards</label>
            <span className="text-xs text-slate-400">
              {data.features.length} cards
            </span>
          </div>

          <div className="space-y-3">
            {data.features.map((feature, idx) => (
              <div
                key={feature.id || idx}
                className="border rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400">
                    Card #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeFeature(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Icon (Lucide name)
                    </label>
                    <input
                      type="text"
                      value={feature.icon}
                      onChange={(e) =>
                        updateFeature(idx, "icon", e.target.value)
                      }
                      placeholder="e.g. ShieldCheck"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) =>
                        updateFeature(idx, "title", e.target.value)
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Subtitle field for existing cards */}
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={feature.subtitle || ""}
                    onChange={(e) =>
                      updateFeature(idx, "subtitle", e.target.value)
                    }
                    placeholder="Subtitle"
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Description
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) =>
                      updateFeature(idx, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add New Feature Form */}
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-bold text-slate-500 mb-3">
              Add New Card
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Icon</label>
                <input
                  type="text"
                  value={newFeature.icon}
                  onChange={(e) =>
                    setNewFeature((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="Star"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium">Title</label>
                <input
                  type="text"
                  value={newFeature.title}
                  onChange={(e) =>
                    setNewFeature((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Card title"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Subtitle for new card */}
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium">Subtitle</label>
              <input
                type="text"
                value={newFeature.subtitle}
                onChange={(e) =>
                  setNewFeature((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="e.g., Happy Clients"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium">Description</label>
              <textarea
                value={newFeature.description}
                onChange={(e) =>
                  setNewFeature((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Card description"
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
              />
            </div>

            <button
              onClick={addFeature}
              className="mt-3 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add Card
            </button>
          </div>
        </div>
      </div>

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