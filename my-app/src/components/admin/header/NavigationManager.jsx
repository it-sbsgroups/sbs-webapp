"use client";

import { useMemo, useState, useEffect } from "react";
import { loadHeaderSection, saveHeaderSection } from "@/lib/headerSections";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Menu,
  ChevronDown,
} from "lucide-react";

import NavFormModal from "./NavFormModal";

export default function NavigationManager() {
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingNav, setEditingNav] = useState(null);

  const [navItems, setNavItems] = useState([
    {
      id: 1,
      name: "Home",
      link: "/",
      order: 1,
      status: true,
      fontSize: 16,
      fontColor: "#111827",
      hoverFontColor: "#2563eb",
      hoverBgColor: "#eff6ff",
      activeFontColor: "#ffffff",
      activeBgColor: "#2563eb",
      hasDropdown: false,
      dropdownItems: [],
    },
    {
      id: 2,
      name: "Products",
      link: "/products",
      order: 2,
      status: true,
      fontSize: 16,
      fontColor: "#111827",
      hoverFontColor: "#2563eb",
      hoverBgColor: "#eff6ff",
      activeFontColor: "#ffffff",
      activeBgColor: "#2563eb",
      hasDropdown: true,
      dropdownItems: [
        {
          id: 1,
          name: "Mining Equipment",
          link: "/products/mining",
        },
        {
          id: 2,
          name: "Industrial Machinery",
          link: "/products/machinery",
        },
      ],
    },
    {
      id: 3,
      name: "Services",
      link: "/services",
      order: 3,
      status: true,
      fontSize: 16,
      fontColor: "#111827",
      hoverFontColor: "#2563eb",
      hoverBgColor: "#eff6ff",
      activeFontColor: "#ffffff",
      activeBgColor: "#2563eb",
      hasDropdown: false,
      dropdownItems: [],
    },
  ]);

  const filteredNavs = useMemo(() => {
    return navItems.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [navItems, search]);

  // Load saved navigation (falls back to the defaults above).
  useEffect(() => {
    (async () => {
      try {
        const nav = await loadHeaderSection("primaryNavigation");
        if (Array.isArray(nav) && nav.length) setNavItems(nav);
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  // Persist the whole nav array (merges into the full header config).
  const persist = async (items) => {
    try {
      await saveHeaderSection("primaryNavigation", items);
      toast.success("Navigation saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    }
  };

  const handleAddNew = () => {
    setEditingNav(null);
    setIsModalOpen(true);
  };

  const handleEdit = (nav) => {
    setEditingNav(nav);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Delete this navigation item?"
    );

    if (!confirmDelete) return;

    const next = navItems.filter((item) => item.id !== id);
    setNavItems(next);
    persist(next);
  };

  const handleSaveNavigation = (navigationData) => {
    const next = editingNav
      ? navItems.map((item) =>
          item.id === editingNav.id
            ? { ...navigationData, id: editingNav.id }
            : item
        )
      : [...navItems, { ...navigationData, id: Date.now() }];

    setNavItems(next);
    persist(next);

    setIsModalOpen(false);
    setEditingNav(null);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Navigation Manager
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create and customize website navigation
            menus.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Navigation
        </button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Navigations
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {navItems.length}
          </h3>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {
              navItems.filter((x) => x.status)
                .length
            }
          </h3>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Dropdown Menus
          </p>

          <h3 className="mt-2 text-3xl font-bold text-purple-600">
            {
              navItems.filter(
                (x) => x.hasDropdown
              ).length
            }
          </h3>
        </div>
      </div>

      {/* NAVIGATION LIST */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="font-semibold">
              Existing Navigations
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search navigation..."
                className="w-72 rounded-xl border border-slate-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  Order
                </th>

                <th className="px-4 py-4 text-left">
                  Dropdown
                </th>

                <th className="px-4 py-4 text-left">
                  Status
                </th>

                <th className="px-4 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredNavs.map((nav) => (
                <tr
                  key={nav.id}
                  className="border-t"
                >
                  <td className="px-4 py-4 font-medium">
                    {nav.name}
                  </td>

                  <td className="px-4 py-4">
                    {nav.link}
                  </td>

                  <td className="px-4 py-4">
                    {nav.order}
                  </td>

                  <td className="px-4 py-4">
                    {nav.hasDropdown
                      ? "Yes"
                      : "No"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        nav.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {nav.status
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleEdit(nav)
                        }
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(nav.id)
                        }
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredNavs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500"
                  >
                    No navigation found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />

            <h3 className="font-semibold">
              Live Navigation Preview
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <div className="flex min-w-max items-center gap-2 p-4">
              <Menu className="h-5 w-5 text-slate-600" />

              {navItems
                .filter((item) => item.status)
                .sort(
                  (a, b) =>
                    a.order - b.order
                )
                .map((nav) => (
                  <div
                    key={nav.id}
                    className="group relative"
                  >
                    <button
                      style={{
                        color: nav.fontColor,
                        fontSize: `${nav.fontSize}px`,
                      }}
                      className="rounded-lg px-4 py-2 transition"
                    >
                      <span className="flex items-center gap-2">
                        {nav.name}

                        {nav.hasDropdown && (
                          <ChevronDown
                            size={14}
                          />
                        )}
                      </span>
                    </button>

                    {nav.hasDropdown &&
                      nav.dropdownItems
                        .length > 0 && (
                        <div className="absolute left-0 top-full z-20 mt-2 hidden min-w-[220px] rounded-xl border bg-white shadow-lg group-hover:block">
                          {nav.dropdownItems.map(
                            (item) => (
                              <div
                                key={item.id}
                                className="border-b px-4 py-3 last:border-none hover:bg-slate-50"
                              >
                                {item.name}
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            This preview updates automatically
            based on navigation configuration.
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <NavFormModal
          open={isModalOpen}
          initialData={editingNav}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNav(null);
          }}
          onSave={handleSaveNavigation}
        />
      )}
    </div>
  );
}