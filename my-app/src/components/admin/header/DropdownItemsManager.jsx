"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Link2,
  MoveVertical,
} from "lucide-react";

export default function DropdownItemsManager({
  items = [],
  onChange,
}) {
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    link: "",
    icon: "",
    order: 1,
  });

  const resetForm = () => {
    setForm({
      name: "",
      link: "",
      icon: "",
      order: items.length + 1,
    });

    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.name.trim()) {
      alert("Item name is required");
      return;
    }

    if (!form.link.trim()) {
      alert("Item link is required");
      return;
    }

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...form,
            }
          : item
      );

      onChange(updated);
    } else {
      const updated = [
        ...items,
        {
          id: Date.now(),
          ...form,
        },
      ];

      onChange(updated);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      link: item.link || "",
      icon: item.icon || "",
      order: item.order || 1,
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Delete this dropdown item?"
    );

    if (!confirmDelete) return;

    onChange(
      items.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;

    const updated = [...items];

    [
      updated[index - 1],
      updated[index],
    ] = [
      updated[index],
      updated[index - 1],
    ];

    onChange(updated);
  };

  const moveDown = (index) => {
    if (index === items.length - 1)
      return;

    const updated = [...items];

    [
      updated[index],
      updated[index + 1],
    ] = [
      updated[index + 1],
      updated[index],
    ];

    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">
            Dropdown Items
          </h4>

          <p className="mt-1 text-sm text-slate-500">
            Manage dropdown menu items.
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          {items.length} Item(s)
        </div>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h5 className="mb-4 font-semibold">
          {editingId
            ? "Edit Dropdown Item"
            : "Add Dropdown Item"}
        </h5>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* NAME */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Item Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Products"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* LINK */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Link
            </label>

            <input
              type="text"
              value={form.link}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  link: e.target.value,
                }))
              }
              placeholder="/products"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ICON */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Icon Name
            </label>

            <input
              type="text"
              value={form.icon}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  icon: e.target.value,
                }))
              }
              placeholder="Package"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ORDER */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Display Order
            </label>

            <input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  order: Number(
                    e.target.value
                  ),
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleAddOrUpdate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {editingId ? (
              <>
                <Save size={16} />
                Update Item
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Item
              </>
            )}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-50"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Order
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Name
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Link
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Icon
                </th>

                <th className="px-4 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span>
                          {index + 1}
                        </span>

                        <div className="flex flex-col">
                          <button
                            onClick={() =>
                              moveUp(index)
                            }
                            className="text-xs text-slate-500 hover:text-blue-600"
                          >
                            ▲
                          </button>

                          <button
                            onClick={() =>
                              moveDown(index)
                            }
                            className="text-xs text-slate-500 hover:text-blue-600"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {item.name}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link2
                          size={14}
                          className="text-slate-400"
                        />

                        {item.link}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {item.icon || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleEdit(item)
                          }
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button className="rounded-lg bg-slate-50 p-2 text-slate-600 hover:bg-slate-100">
                          <MoveVertical
                            size={16}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500"
                  >
                    No dropdown items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FUTURE FEATURES */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        Future enhancements:
        <ul className="mt-2 list-disc pl-5">
          <li>
            Drag & Drop Sorting
          </li>
          <li>
            Icon Picker Integration
          </li>
          <li>
            Mega Menu Support
          </li>
          <li>
            Multi-level Nested Menus
          </li>
          <li>
            Dynamic Permission Control
          </li>
        </ul>
      </div>
    </div>
  );
}