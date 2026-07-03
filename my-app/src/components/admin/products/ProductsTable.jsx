"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Package,
  ChevronDown,
} from "lucide-react";

// Custom nested dropdown for category / subcategory
function CategorySubcategoryFilter({
  categories,
  subcategories,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = useMemo(() => {
    if (!value || value.type === "ALL") return "All Categories";
    if (value.type === "CATEGORY") {
      const cat = categories.find((c) => c.id === value.id);
      return cat ? `All ${cat.name}` : "All Categories";
    }
    if (value.type === "SUBCATEGORY") {
      const sub = subcategories.find((s) => s.id === value.id);
      return sub ? sub.name : "All Categories";
    }
    return "All Categories";
  }, [value, categories, subcategories]);

  const handleSelect = (type, id) => {
    onChange({ type, id });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm w-56 justify-between hover:bg-slate-50"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-56 rounded-xl border bg-white shadow-lg max-h-64 overflow-y-auto">
          <button
            onClick={() => handleSelect("ALL", null)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
              !value || value.type === "ALL" ? "bg-blue-50 text-blue-700 font-medium" : ""
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const subs = subcategories.filter((s) => s.categoryId === cat.id);
            const isCategorySelected =
              value?.type === "CATEGORY" && value.id === cat.id;

            return (
              <div key={cat.id}>
                {/* Category header – selectable as "All [Category]" */}
                <button
                  onClick={() => handleSelect("CATEGORY", cat.id)}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold border-t border-slate-100 hover:bg-blue-50 ${
                    isCategorySelected ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`}
                >
                  All {cat.name}
                </button>

                {/* Subcategories */}
                {subs.map((sub) => {
                  const isSubSelected =
                    value?.type === "SUBCATEGORY" && value.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelect("SUBCATEGORY", sub.id)}
                      className={`w-full text-left pl-8 pr-4 py-2 text-sm hover:bg-blue-50 ${
                        isSubSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Main component ----------
export default function ProductsTable({
  products,
  categories,
  subcategories,
  brands,
  onEdit,
  onDelete,
  onDuplicate,
  onCreate,
  searchQuery,
  setSearchQuery,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // single nested filter state: { type: 'ALL' | 'CATEGORY' | 'SUBCATEGORY', id: string }
  const [categorySubFilter, setCategorySubFilter] = useState({
    type: "ALL",
    id: null,
  });

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search
    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.id || "").toLowerCase().includes(q) ||
          (brandLabel(p) || "").toLowerCase().includes(q) ||
          (p.model || "").toLowerCase().includes(q) ||
          (p.keyFeatures || "").toLowerCase().includes(q)
      );
    }

    // Category / Subcategory filter (from nested dropdown)
    if (categorySubFilter.type === "CATEGORY") {
      filtered = filtered.filter(
        (p) => p.categoryId === categorySubFilter.id
      );
    } else if (categorySubFilter.type === "SUBCATEGORY") {
      filtered = filtered.filter(
        (p) => p.subcategoryId === categorySubFilter.id
      );
    }

    // Brand filter
    if (filterBrand !== "ALL") {
      filtered = filtered.filter(
        (p) =>
          (p.brandId || p.brand?.id || p.distributorId) === filterBrand
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = String(a[sortField] || "").toLowerCase();
      const bVal = String(b[sortField] || "").toLowerCase();
      if (sortOrder === "asc") return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });

    return filtered;
  }, [
    products,
    searchQuery,
    categorySubFilter,
    filterBrand,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ----- Resolvers -----
  const getCategoryName = (catId) =>
    categories.find((c) => c.id === catId)?.name || "—";
  const getSubcategoryName = (subId) =>
    subcategories.find((s) => s.id === subId)?.name || "—";
  const getBrandName = (brandId) =>
    brands.find((b) => b.id === brandId)?.name || "—";
  const brandLabel = (p) => {
    if (p?.brand && typeof p.brand === "object") return p.brand.name || "—";
    if (typeof p?.brand === "string" && p.brand) return p.brand;
    return getBrandName(p?.brandId || p?.distributorId);
  };

  // CSV export
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Category / Subcategory",
      "Brand",
      "Model",
      "Key Features",
    ];
    const rows = filteredProducts.map((p) => [
      p.id,
      p.name,
      `${getCategoryName(p.categoryId)} / ${getSubcategoryName(p.subcategoryId)}`,
      brandLabel(p),
      p.model || "",
      p.keyFeatures || "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products_export.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products (min 2 chars)..."
              className="w-64 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Single nested Category / Subcategory dropdown */}
          <CategorySubcategoryFilter
            categories={categories}
            subcategories={subcategories}
            value={categorySubFilter}
            onChange={(newVal) => {
              setCategorySubFilter(newVal);
              setCurrentPage(1);
            }}
          />

          {/* Brand filter */}
          <select
            value={filterBrand}
            onChange={(e) => {
              setFilterBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table (unchanged except column header) */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Image
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer"
                onClick={() => {
                  setSortField("name");
                  setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                }}
              >
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Category / Subcategory
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Model
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => {
              const firstImage = product.images?.[0]?.url || "";
              const catSubcatDisplay = product.subcategoryId
                ? `${getCategoryName(product.categoryId)} / ${getSubcategoryName(product.subcategoryId)}`
                : getCategoryName(product.categoryId);

              return (
                <tr key={product.id} className="border-t hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <ImageOff size={16} className="text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {product.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm">{catSubcatDisplay}</td>
                  <td className="px-4 py-3 text-sm">{brandLabel(product)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {product.model || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(product)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onDuplicate(product)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-green-50 hover:text-green-600"
                        title="Duplicate"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="font-semibold">No products found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (same as before) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {filteredProducts.length > 0
              ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredProducts.length)} of ${filteredProducts.length}`
              : "0 results"}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border p-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border p-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}