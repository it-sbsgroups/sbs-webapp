"use client";

import { useState, useEffect } from "react";
import { loadHeaderSection, saveHeaderSection } from "@/lib/headerSections";
import toast from "react-hot-toast";
import {
  Save,
  Plus,
  Trash2,
  Edit,
  User,
  LogIn,
  ChevronDown,
  Settings,
  Shield,
} from "lucide-react";

export default function LoginManager() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    buttonText: "Login",
    buttonLink: "/login",

    fontSize: 16,
    fontWeight: "600",

    fontColor: "#ffffff",
    backgroundColor: "#2563eb",

    hoverFontColor: "#ffffff",
    hoverBackgroundColor: "#1d4ed8",

    borderRadius: 12,

    paddingX: 20,
    paddingY: 10,

    showDropdownAfterLogin: true,
  });

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Admin Panel",
      link: "/admin",
      icon: "Shield",
    },
    {
      id: 2,
      name: "Profile",
      link: "/profile",
      icon: "User",
    },
    {
      id: 3,
      name: "Logout",
      link: "/logout",
      icon: "LogOut",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    link: "",
    icon: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Load saved login settings (menuItems are stored inside the same section).
  useEffect(() => {
    (async () => {
      try {
        const ls = await loadHeaderSection("loginSettings");
        if (ls && typeof ls === "object") {
          const { userDropdownItems: savedItems, menuItems: legacyItems, ...rest } = ls;
          if (Object.keys(rest).length) setSettings((p) => ({ ...p, ...rest }));
          const items = savedItems || legacyItems;
          if (Array.isArray(items)) setMenuItems(items);
        }
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      link: "",
      icon: "",
    });

    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.name.trim()) {
      alert("Item name required");
      return;
    }

    if (!form.link.trim()) {
      alert("Item link required");
      return;
    }

    if (editingId) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    } else {
      setMenuItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
        },
      ]);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      link: item.link,
      icon: item.icon,
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Delete this menu item?"
    );

    if (!confirmDelete) return;

    setMenuItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHeaderSection("loginSettings", { ...settings, userDropdownItems: menuItems });
      toast.success("Login settings saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Login Button Manager
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Customize login button appearance and
          user dropdown menu.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* LEFT SECTION */}
        <div className="space-y-6 xl:col-span-2">
          {/* BUTTON SETTINGS */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">
              Login Button Settings
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Button Text
                </label>

                <input
                  value={settings.buttonText}
                  onChange={(e) =>
                    updateSetting(
                      "buttonText",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Button Link
                </label>

                <input
                  value={settings.buttonLink}
                  onChange={(e) =>
                    updateSetting(
                      "buttonLink",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">
              Typography
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Font Size
                </label>

                <input
                  type="number"
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSetting(
                      "fontSize",
                      Number(e.target.value)
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
                  value={settings.fontWeight}
                  onChange={(e) =>
                    updateSetting(
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
                  Border Radius
                </label>

                <input
                  type="number"
                  value={settings.borderRadius}
                  onChange={(e) =>
                    updateSetting(
                      "borderRadius",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* COLORS */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">
              Color Settings
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Font Color
                </label>

                <input
                  type="color"
                  value={settings.fontColor}
                  onChange={(e) =>
                    updateSetting(
                      "fontColor",
                      e.target.value
                    )
                  }
                  className="h-12 w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Background Color
                </label>

                <input
                  type="color"
                  value={
                    settings.backgroundColor
                  }
                  onChange={(e) =>
                    updateSetting(
                      "backgroundColor",
                      e.target.value
                    )
                  }
                  className="h-12 w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Hover Font Color
                </label>

                <input
                  type="color"
                  value={
                    settings.hoverFontColor
                  }
                  onChange={(e) =>
                    updateSetting(
                      "hoverFontColor",
                      e.target.value
                    )
                  }
                  className="h-12 w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Hover Background
                </label>

                <input
                  type="color"
                  value={
                    settings.hoverBackgroundColor
                  }
                  onChange={(e) =>
                    updateSetting(
                      "hoverBackgroundColor",
                      e.target.value
                    )
                  }
                  className="h-12 w-full"
                />
              </div>
            </div>
          </div>

          {/* DROPDOWN SETTINGS */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                User Dropdown
              </h3>

              <input
                type="checkbox"
                checked={
                  settings.showDropdownAfterLogin
                }
                onChange={(e) =>
                  updateSetting(
                    "showDropdownAfterLogin",
                    e.target.checked
                  )
                }
              />
            </div>
          </div>

          {/* MENU ITEM FORM */}
          {settings.showDropdownAfterLogin && (
            <>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold">
                  Dropdown Menu Items
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-4 py-3"
                  />

                  <input
                    placeholder="Link"
                    value={form.link}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        link: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-4 py-3"
                  />

                  <input
                    placeholder="Icon Name"
                    value={form.icon}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        icon: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-4 py-3"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleAddOrUpdate}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
                  >
                    <Plus size={16} />

                    {editingId
                      ? "Update"
                      : "Add Item"}
                  </button>

                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="rounded-xl border px-5 py-3"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* MENU TABLE */}
              <div className="rounded-2xl border bg-white shadow-sm">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        Name
                      </th>

                      <th className="px-4 py-4 text-left">
                        Link
                      </th>

                      <th className="px-4 py-4 text-left">
                        Icon
                      </th>

                      <th className="px-4 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {menuItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t"
                      >
                        <td className="px-4 py-4">
                          {item.name}
                        </td>

                        <td className="px-4 py-4">
                          {item.link}
                        </td>

                        <td className="px-4 py-4">
                          {item.icon}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleEdit(item)
                              }
                              className="rounded-lg bg-blue-50 p-2 text-blue-600"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item.id
                                )
                              }
                              className="rounded-lg bg-red-50 p-2 text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* LIVE PREVIEW */}
        <div>
          <div className="sticky top-4 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold">
              Live Preview
            </h3>

            <div className="rounded-xl border bg-slate-50 p-6">
              <button
                style={{
                  color: settings.fontColor,
                  background:
                    settings.backgroundColor,
                  borderRadius:
                    settings.borderRadius,
                  fontSize:
                    settings.fontSize,
                  fontWeight:
                    settings.fontWeight,
                  padding: `${settings.paddingY}px ${settings.paddingX}px`,
                }}
                className="flex items-center gap-2"
              >
                <LogIn size={18} />

                {settings.buttonText}
              </button>

              {settings.showDropdownAfterLogin && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3">
                    <User size={18} />

                    User

                    <ChevronDown
                      size={16}
                    />
                  </div>

                  <div className="mt-2 rounded-xl border bg-white">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="border-b px-4 py-3 last:border-none hover:bg-slate-50"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
              Preview updates instantly while
              changing settings.
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}