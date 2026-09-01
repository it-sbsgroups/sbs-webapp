"use client";

import { useEffect, useState } from "react";
import {
  X,
  Save,
  Palette,
  Type,
  ChevronDown,
} from "lucide-react";

import DropdownItemsManager from "./DropdownItemsManager";

const defaultForm = {
  name: "",
  link: "",
  order: 1,
  status: true,

  fontSize: 16,
  fontWeight: "500",
  fontColor: "#111827",

  hoverFontColor: "#2563eb",
  hoverBgColor: "#eff6ff",

  activeFontColor: "#ffffff",
  activeBgColor: "#2563eb",

  hasDropdown: false,

  dropdownWidth: 250,
  dropdownPosition: "left",
  dropdownBgColor: "#ffffff",
  dropdownTextColor: "#111827",
  dropdownBorderRadius: 12,
  dropdownShadow: true,

  dropdownItems: [],
};

export default function NavFormModal({
  open,
  onClose,
  onSave,
  initialData,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...defaultForm,
        ...initialData,
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Navigation name is required");
      return;
    }

    if (!form.link.trim()) {
      alert("Navigation link is required");
      return;
    }

    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">
              {initialData
                ? "Edit Navigation"
                : "Create Navigation"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure navigation styling,
              dropdowns and behavior.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
          <div className="grid gap-6 p-6 xl:grid-cols-3">
            {/* LEFT SIDE */}
            <div className="space-y-6 xl:col-span-2">
              {/* BASIC SETTINGS */}
              <div className="rounded-2xl border p-5">
                <h3 className="mb-5 text-lg font-semibold">
                  Basic Settings
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Navigation Name
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        updateField(
                          "name",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                      placeholder="Products"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Navigation Link
                    </label>

                    <input
                      type="text"
                      value={form.link}
                      onChange={(e) =>
                        updateField(
                          "link",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                      placeholder="/products"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Display Order
                    </label>

                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) =>
                        updateField(
                          "order",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Status
                    </label>

                    <select
                      value={
                        form.status
                          ? "active"
                          : "inactive"
                      }
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value ===
                            "active"
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    >
                      <option value="active">
                        Active
                      </option>
                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TYPOGRAPHY */}
              <div className="rounded-2xl border p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Type className="h-5 w-5 text-blue-600" />

                  <h3 className="text-lg font-semibold">
                    Typography
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Font Size
                    </label>

                    <input
                      type="number"
                      value={form.fontSize}
                      onChange={(e) =>
                        updateField(
                          "fontSize",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Font Weight
                    </label>

                    <select
                      value={form.fontWeight}
                      onChange={(e) =>
                        updateField(
                          "fontWeight",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    >
                      <option value="400">
                        Regular
                      </option>
                      <option value="500">
                        Medium
                      </option>
                      <option value="600">
                        Semi Bold
                      </option>
                      <option value="700">
                        Bold
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Font Color
                    </label>

                    <input
                      type="color"
                      value={form.fontColor}
                      onChange={(e) =>
                        updateField(
                          "fontColor",
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border"
                    />
                  </div>
                </div>
              </div>

              {/* HOVER SETTINGS */}
              <div className="rounded-2xl border p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-600" />

                  <h3 className="text-lg font-semibold">
                    Hover Settings
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Hover Font Color
                    </label>

                    <input
                      type="color"
                      value={form.hoverFontColor}
                      onChange={(e) =>
                        updateField(
                          "hoverFontColor",
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Hover Background
                    </label>

                    <input
                      type="color"
                      value={form.hoverBgColor}
                      onChange={(e) =>
                        updateField(
                          "hoverBgColor",
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border"
                    />
                  </div>
                </div>
              </div>

              {/* ACTIVE SETTINGS */}
              <div className="rounded-2xl border p-5">
                <h3 className="mb-5 text-lg font-semibold">
                  Active State
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Active Font Color
                    </label>

                    <input
                      type="color"
                      value={
                        form.activeFontColor
                      }
                      onChange={(e) =>
                        updateField(
                          "activeFontColor",
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Active Background
                    </label>

                    <input
                      type="color"
                      value={
                        form.activeBgColor
                      }
                      onChange={(e) =>
                        updateField(
                          "activeBgColor",
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border"
                    />
                  </div>
                </div>
              </div>

              {/* DROPDOWN */}
              <div className="rounded-2xl border p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Dropdown Settings
                  </h3>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.hasDropdown}
                      onChange={(e) =>
                        updateField(
                          "hasDropdown",
                          e.target.checked
                        )
                      }
                    />

                    <span className="text-sm font-medium">
                      Enable Dropdown
                    </span>
                  </label>
                </div>

                {form.hasDropdown && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Dropdown Width
                        </label>

                        <input
                          type="number"
                          value={
                            form.dropdownWidth
                          }
                          onChange={(e) =>
                            updateField(
                              "dropdownWidth",
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Position
                        </label>

                        <select
                          value={
                            form.dropdownPosition
                          }
                          onChange={(e) =>
                            updateField(
                              "dropdownPosition",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        >
                          <option value="left">
                            Left
                          </option>
                          <option value="center">
                            Center
                          </option>
                          <option value="right">
                            Right
                          </option>
                        </select>
                      </div>
                    </div>

                    <DropdownItemsManager
                      items={
                        form.dropdownItems
                      }
                      onChange={(items) =>
                        updateField(
                          "dropdownItems",
                          items
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE PREVIEW */}
            <div>
              <div className="sticky top-4 rounded-2xl border p-5">
                <h3 className="mb-5 text-lg font-semibold">
                  Live Preview
                </h3>

                <div className="rounded-xl border bg-white p-4">
                  <div
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2"
                    style={{
                      color: form.fontColor,
                      fontSize: `${form.fontSize}px`,
                      fontWeight:
                        form.fontWeight,
                    }}
                  >
                    {form.name || "Navigation"}

                    {form.hasDropdown && (
                      <ChevronDown
                        size={14}
                      />
                    )}
                  </div>

                  {form.hasDropdown && (
                    <div
                      className="mt-3 rounded-xl border p-2"
                      style={{
                        width:
                          form.dropdownWidth,
                        background:
                          form.dropdownBgColor,
                        color:
                          form.dropdownTextColor,
                      }}
                    >
                      {form.dropdownItems
                        .length ? (
                        form.dropdownItems.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="rounded-lg px-3 py-2 hover:bg-slate-100"
                            >
                              {item.name}
                            </div>
                          )
                        )
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-400">
                          No dropdown items
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                  Preview updates instantly
                  while changing settings.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Save size={18} />
            Save Navigation
          </button>
        </div>
      </div>
    </div>
  );
}