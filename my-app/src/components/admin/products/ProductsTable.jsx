// src/components/admin/products/ProductsTable.jsx

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
  Filter,
  X,
} from "lucide-react";

// ---------- Helper component for Category/Subcategory filter ----------
function CategorySubcategoryFilter({ categories, subcategories, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm w-48 justify-between hover:bg-slate-50"
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
            const isCategorySelected = value?.type === "CATEGORY" && value.id === cat.id;

            return (
              <div key={cat.id}>
                <button
                  onClick={() => handleSelect("CATEGORY", cat.id)}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold border-t border-slate-100 hover:bg-blue-50 ${
                    isCategorySelected ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`}
                >
                  All {cat.name}
                </button>
                {subs.map((sub) => {
                  const isSubSelected = value?.type === "SUBCATEGORY" && value.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelect("SUBCATEGORY", sub.id)}
                      className={`w-full text-left pl-8 pr-4 py-2 text-sm hover:bg-blue-50 ${
                        isSubSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600"
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

// ---------- MAIN COMPONENT ----------
export default function ProductsTable({
  products,
  categories,
  subcategories,
  brands,
  onEdit,
  onDelete,
  onDuplicate,
  onCreate,
  onBulkDelete,
  searchQuery,
  setSearchQuery,
}) {
  // ---------- helper functions (defined BEFORE useMemo) ----------
  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "—";
  const getSubcategoryName = (subId) => subcategories.find((s) => s.id === subId)?.name || "—";
  const getBrandName = (brandId) => brands.find((b) => b.id === brandId)?.name || "—";
  const brandLabel = (p) => {
    if (p?.brand && typeof p.brand === "object") return p.brand.name || "—";
    if (typeof p?.brand === "string" && p.brand) return p.brand;
    return getBrandName(p?.brandId || p?.distributorId);
  };

  // ---------- state ----------
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ===== NEW FILTERS =====
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFeatured, setFilterFeatured] = useState("ALL");
  const [filterStock, setFilterStock] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState({ from: "", to: "" });
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterSkuFrom, setFilterSkuFrom] = useState("");
  const [filterSkuTo, setFilterSkuTo] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [categorySubFilter, setCategorySubFilter] = useState({ type: "ALL", id: null });

  // For pagination expansion
  const [showAllPages, setShowAllPages] = useState(false);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
    setShowAllPages(false); // collapse pagination on filter change
  }, [searchQuery, categorySubFilter, filterBrand, filterStatus, filterFeatured, filterStock, filterDateRange, filterPriceMin, filterPriceMax, filterSkuFrom, filterSkuTo]);

  // ===== FILTER ENGINE =====
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.id || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.model || "").toLowerCase().includes(q) ||
          (p.keyFeatures || "").toLowerCase().includes(q) ||
          (p.brand && typeof p.brand === "object" && (p.brand.name || "").toLowerCase().includes(q)) ||
          (typeof p.brand === "string" && p.brand.toLowerCase().includes(q)) ||
          (getCategoryName(p.categoryId) || "").toLowerCase().includes(q) ||
          (getSubcategoryName(p.subcategoryId) || "").toLowerCase().includes(q)
      );
    }

    if (filterSkuFrom) {
      filtered = filtered.filter((p) => (p.sku || "").localeCompare(filterSkuFrom) >= 0);
    }
    if (filterSkuTo) {
      filtered = filtered.filter((p) => (p.sku || "").localeCompare(filterSkuTo) <= 0);
    }

    if (categorySubFilter.type === "CATEGORY") {
      filtered = filtered.filter((p) => p.categoryId === categorySubFilter.id);
    } else if (categorySubFilter.type === "SUBCATEGORY") {
      filtered = filtered.filter((p) => p.subcategoryId === categorySubFilter.id);
    }

    if (filterBrand !== "ALL") {
      filtered = filtered.filter((p) => (p.brandId || p.brand?.id || p.distributorId) === filterBrand);
    }

    if (filterStatus === "ACTIVE") {
      filtered = filtered.filter((p) => p.isActive !== false);
    } else if (filterStatus === "INACTIVE") {
      filtered = filtered.filter((p) => p.isActive === false);
    }

    if (filterFeatured === "FEATURED") {
      filtered = filtered.filter((p) => p.isFeatured === true);
    } else if (filterFeatured === "NOT_FEATURED") {
      filtered = filtered.filter((p) => p.isFeatured !== true);
    }

    if (filterStock === "IN_STOCK") {
      filtered = filtered.filter((p) => p.stock > 0);
    } else if (filterStock === "OUT_OF_STOCK") {
      filtered = filtered.filter((p) => p.stock === 0 || p.stock === undefined);
    }

    if (filterDateRange.from) {
      const from = new Date(filterDateRange.from);
      filtered = filtered.filter((p) => new Date(p.createdAt) >= from);
    }
    if (filterDateRange.to) {
      const to = new Date(filterDateRange.to);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((p) => new Date(p.createdAt) <= to);
    }

    if (filterPriceMin) {
      filtered = filtered.filter((p) => Number(p.price) >= Number(filterPriceMin));
    }
    if (filterPriceMax) {
      filtered = filtered.filter((p) => Number(p.price) <= Number(filterPriceMax));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "createdAt") {
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
      } else if (sortField === "sku") {
        aVal = String(a.sku || "").toLowerCase();
        bVal = String(b.sku || "").toLowerCase();
      } else {
        aVal = String(a[sortField] || "").toLowerCase();
        bVal = String(b[sortField] || "").toLowerCase();
      }
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [products, searchQuery, categorySubFilter, filterBrand, filterStatus, filterFeatured, filterStock, filterDateRange, filterPriceMin, filterPriceMax, filterSkuFrom, filterSkuTo, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Generate pagination items (numbers + ellipsis)
  const getPaginationItems = () => {
    if (showAllPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 2; // pages before/after current
    const items = [];

    // Always include first page
    items.push(1);

    // Left ellipsis if gap > 1
    if (currentPage - delta > 2) {
      items.push("...left");
    }

    // Window around current
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    // Right ellipsis if gap > 1
    if (currentPage + delta < totalPages - 1) {
      items.push("...right");
    }

    // Always include last page
    items.push(totalPages);

    return items;
  };

  const pageIds = paginatedProducts.map((p) => p.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someFilteredSelected = filteredProducts.some((p) => selectedIds.has(p.id));
  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAllFiltered = () => setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategorySubFilter({ type: "ALL", id: null });
    setFilterBrand("ALL");
    setFilterStatus("ALL");
    setFilterFeatured("ALL");
    setFilterStock("ALL");
    setFilterDateRange({ from: "", to: "" });
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterSkuFrom("");
    setFilterSkuTo("");
    setCurrentPage(1);
    setShowAllPages(false);
  };

  const hasActiveFilters =
    searchQuery ||
    categorySubFilter.type !== "ALL" ||
    filterBrand !== "ALL" ||
    filterStatus !== "ALL" ||
    filterFeatured !== "ALL" ||
    filterStock !== "ALL" ||
    filterDateRange.from ||
    filterDateRange.to ||
    filterSkuFrom ||
    filterSkuTo;

  const handleExportCSV = () => {
    const headers = ["ID", "SKU", "Name", "Category / Subcategory", "Brand", "Model", "Key Features", "Status", "Featured", "Created At"];
    const rows = filteredProducts.map((p) => [
      p.id,
      p.sku || "",
      p.name,
      `${getCategoryName(p.categoryId)} / ${getSubcategoryName(p.subcategoryId)}`,
      brandLabel(p),
      p.model || "",
      p.keyFeatures || "",
      p.isActive !== false ? "Active" : "Inactive",
      p.isFeatured ? "Yes" : "No",
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products_export.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
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
              placeholder="Search products..."
              className="w-64 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category/Subcategory filter */}
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
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              showAdvancedFilters || hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600" />}
          </button>

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
              <X size={14} /> Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Featured</label>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All</option>
                <option value="FEATURED">Featured</option>
                <option value="NOT_FEATURED">Not Featured</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Date From</label>
              <input
                type="date"
                value={filterDateRange.from}
                onChange={(e) => setFilterDateRange((p) => ({ ...p, from: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Date To</label>
              <input
                type="date"
                value={filterDateRange.to}
                onChange={(e) => setFilterDateRange((p) => ({ ...p, to: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {/* SKU Range Filter */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">SKU From</label>
              <input
                type="text"
                value={filterSkuFrom}
                onChange={(e) => setFilterSkuFrom(e.target.value)}
                placeholder="e.g. PROD-0001"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">SKU To</label>
              <input
                type="text"
                value={filterSkuTo}
                onChange={(e) => setFilterSkuTo(e.target.value)}
                placeholder="e.g. PROD-0099"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk selection bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="text-xs font-bold text-blue-800">
            {selectedIds.size} selected
            {!allFilteredSelected && filteredProducts.length > pageIds.length && (
              <button onClick={selectAllFiltered} className="ml-2 underline hover:text-blue-900">
                Select all {filteredProducts.length} filtered
              </button>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={clearSelection} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5">
              Clear
            </button>
            <button
              onClick={() => { onBulkDelete?.(Array.from(selectedIds)); clearSelection(); }}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              <Trash2 size={13} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => { if (el) el.indeterminate = someFilteredSelected && !allPageSelected; }}
                  onChange={togglePage}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Select all products on this page"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Image</th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:text-blue-600"
                onClick={() => { setSortField("name"); setSortOrder((o) => (o === "asc" ? "desc" : "asc")); }}
              >
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:text-blue-600"
                onClick={() => { setSortField("sku"); setSortOrder((o) => (o === "asc" ? "desc" : "asc")); }}
              >
                SKU {sortField === "sku" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category / Subcategory</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:text-blue-600"
                onClick={() => { setSortField("createdAt"); setSortOrder((o) => (o === "asc" ? "desc" : "asc")); }}
              >
                Created {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => {
              const firstImage = product.images?.[0]?.url || "";
              const catSubcatDisplay = product.subcategoryId
                ? `${getCategoryName(product.categoryId)} / ${getSubcategoryName(product.subcategoryId)}`
                : getCategoryName(product.categoryId);

              return (
                <tr key={product.id} className={`border-t hover:bg-slate-50/50 ${selectedIds.has(product.id) ? "bg-blue-50/60" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {firstImage ? (
                      <img src={firstImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <ImageOff size={16} className="text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    {product.id && <p className="text-[10px] text-slate-400 font-mono">{product.id}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono text-slate-700">{product.sku || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{catSubcatDisplay}</td>
                  <td className="px-4 py-3 text-sm">{brandLabel(product)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{product.model || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${product.isActive !== false ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs">{product.isActive !== false ? "Active" : "Inactive"}</span>
                      {product.isFeatured && <span className="text-[10px] text-yellow-500">★</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit(product)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => onDuplicate(product)} className="rounded-lg p-2 text-slate-400 hover:bg-green-50 hover:text-green-600" title="Duplicate">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => onDelete(product.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="font-semibold">No products found</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="mt-2 text-xs text-blue-600 hover:underline">
                      Clear all filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
              setShowAllPages(false);
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
          {hasActiveFilters && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {filteredProducts.length} filtered
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Dynamic pagination */}
            {getPaginationItems().map((item, idx) => {
              if (item === "...left" || item === "...right") {
                return (
                  <button
                    key={`ellipsis-${idx}`}
                    onClick={() => setShowAllPages(true)}
                    className="h-9 w-9 rounded-lg text-sm font-medium border hover:bg-slate-50"
                    title="Show all pages"
                  >
                    ...
                  </button>
                );
              }
              const pageNum = item;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${
                    currentPage === pageNum ? "bg-blue-600 text-white" : "border hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

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
    </div>
  );
}