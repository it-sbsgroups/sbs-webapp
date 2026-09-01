// src/components/admin/products/VariantsBrowser.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown, ChevronRight, ChevronLeft, Edit, Trash2, Package, ImageOff,
  Search, X, Eye, EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import productsApi from "@/lib/productsApi";
import { toStaticUrl } from "@/lib/client";

// ---------- Sub‑component: Variant Row (inside expanded table) ----------
function VariantRow({ variant, productId, onEdit, onDeleted }) {
  const thumb = variant.images?.[0];
  const attrSummary = Object.entries(variant.attributes || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete variant "${variant.name}"?`)) return;
    try {
      await productsApi.deleteVariant(productId, variant.id);
      toast.success("Variant deleted");
      onDeleted(variant.id);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <tr className="border-t hover:bg-slate-50/80">
      <td className="px-4 py-3">
        {thumb ? (
          <img src={toStaticUrl(thumb)} alt="" className="w-10 h-10 rounded-lg object-cover border" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-100 border flex items-center justify-center text-slate-300">
            <ImageOff size={16} />
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-slate-800">{variant.name}</p>
        <p className="text-xs text-slate-500">{attrSummary || "No attributes"}</p>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{variant.model || "—"}</td>
      <td className="px-4 py-3 text-sm text-indigo-600 font-bold">{variant.brand?.name || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${variant.isActive !== false ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
          {variant.isActive !== false ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit in product form">
          <Edit size={15} />
        </button>
        <button onClick={handleDelete} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete variant">
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

// ---------- Sub‑component: Product Row ----------
function ProductRow({ product, expanded, onToggleExpand, onEditProduct }) {
  const variants = product.variants || [];

  return (
    <>
      <tr className="hover:bg-slate-50/50">
        <td className="px-4 py-3">
          {product.images?.[0]?.url ? (
            <img src={toStaticUrl(product.images[0].url)} alt="" className="h-10 w-10 rounded-lg object-cover border" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-slate-100 border flex items-center justify-center text-slate-300">
              <Package size={16} />
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-bold text-slate-800">{product.name}</p>
          <p className="text-xs text-slate-400">{product.id}</p>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">{product.brand?.name || "—"}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{product.model || "—"}</td>
        <td className="px-4 py-3">
          <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {variants.length} variant{variants.length === 1 ? "" : "s"}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => onToggleExpand(product.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            {expanded ? (
              <>
                <EyeOff size={14} /> Hide Variants
              </>
            ) : (
              <>
                <Eye size={14} /> View Variants
              </>
            )}
          </button>
          <button
            onClick={() => onEditProduct(product)}
            className="ml-1 rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Edit product"
          >
            <Edit size={15} />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/30">
          <td colSpan={6} className="px-4 py-4">
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Image</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Variant</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Model</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Brand</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      productId={product.id}
                      onEdit={() => onEditProduct(product)}
                      onDeleted={() => {}}
                    />
                  ))}
                  {variants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-400">
                        No variants available for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------- Main Component ----------
export default function VariantsBrowser({ onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'created' | 'variantCount'
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAllPages, setShowAllPages] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    productsApi.getAll({ pageSize: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setProducts(list.filter((p) => p.variants?.length > 0));
      })
      .catch(() => toast.error("Failed to load variants"))
      .finally(() => setLoading(false));
  }, []);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Brand filter
    if (brandFilter !== "ALL") {
      filtered = filtered.filter((p) => (p.brand?.name || "Unassigned") === brandFilter);
    }

    // Status filter (based on variants)
    if (filterStatus === "ACTIVE") {
      filtered = filtered.filter((p) => (p.variants || []).some((v) => v.isActive !== false));
    } else if (filterStatus === "INACTIVE") {
      filtered = filtered.filter((p) => (p.variants || []).some((v) => v.isActive === false));
    }

    // Date range filter on variant createdAt
    if (dateFrom || dateTo) {
      filtered = filtered.filter((p) =>
        (p.variants || []).some((v) => {
          if (!v.createdAt) return false;
          const d = new Date(v.createdAt);
          if (dateFrom && d < new Date(dateFrom)) return false;
          if (dateTo && d > new Date(dateTo)) return false;
          return true;
        })
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => {
        const productMatch = p.name.toLowerCase().includes(q);
        const variantMatch = (p.variants || []).some((v) =>
          v.name?.toLowerCase().includes(q) ||
          Object.entries(v.attributes || {}).some(([k, val]) => `${k}: ${val}`.toLowerCase().includes(q))
        );
        return productMatch || variantMatch;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "created") {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        cmp = aDate - bDate;
      } else if (sortBy === "variantCount") {
        cmp = (a.variants?.length || 0) - (b.variants?.length || 0);
      }
      if (sortDir === "desc") cmp = -cmp;
      return cmp;
    });

    return filtered;
  }, [products, search, filterStatus, brandFilter, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const uniqueBrands = [...new Set(products.map((p) => p.brand?.name).filter(Boolean))];

  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  const activeVariants = products.reduce((acc, p) => acc + (p.variants?.filter((v) => v.isActive !== false).length || 0), 0);
  const inactiveVariants = totalVariants - activeVariants;

  // For hover tooltips
  const productsWithActive = products.filter((p) => (p.variants || []).some((v) => v.isActive !== false)).length;
  const productsWithInactive = products.filter((p) => (p.variants || []).some((v) => v.isActive === false)).length;

  const toggleExpand = (productId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const getPaginationItems = () => {
    if (showAllPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const items = [1];
    if (currentPage - delta > 2) items.push("...left");
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    for (let i = start; i <= end; i++) items.push(i);
    if (currentPage + delta < totalPages - 1) items.push("...right");
    items.push(totalPages);
    return items;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats with hover tooltips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Products</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{products.length}</h3>
          </div>
          <div className="absolute z-50 right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg hidden group-hover:block">
            <p className="text-xs font-bold text-slate-800">Products with variants</p>
            <p className="text-xs text-slate-500 mt-1">
              {productsWithActive} have active variants<br />
              {productsWithInactive} have inactive variants
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Variants</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{totalVariants}</h3>
          </div>
          <div className="absolute z-50 right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg hidden group-hover:block">
            <p className="text-xs font-bold text-slate-800">All variant entries</p>
            <p className="text-xs text-slate-500 mt-1">
              Across {products.length} products
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Active</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeVariants}</h3>
          </div>
          <div className="absolute z-50 right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg hidden group-hover:block">
            <p className="text-xs font-bold text-slate-800">Active variants</p>
            <p className="text-xs text-slate-500 mt-1">
              {activeVariants} currently live<br />
              {productsWithActive} products have active variants
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Inactive</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{inactiveVariants}</h3>
          </div>
          <div className="absolute z-50 right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg hidden group-hover:block">
            <p className="text-xs font-bold text-slate-800">Inactive variants</p>
            <p className="text-xs text-slate-500 mt-1">
              {inactiveVariants} currently hidden<br />
              {productsWithInactive} products have inactive variants
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Sorting bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by product, variant, or attribute..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ALL">All Brands</option>
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>

        {/* Date range */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          title="Variant added from"
        />
        <span className="text-slate-400">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          title="Variant added to"
        />

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="created">Sort by Created</option>
          <option value="variantCount">Sort by Variant Count</option>
        </select>
        <select
          value={sortDir}
          onChange={(e) => { setSortDir(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {(filterStatus !== "ALL" || brandFilter !== "ALL" || search.trim() || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setFilterStatus("ALL");
              setBrandFilter("ALL");
              setSearch("");
              setDateFrom("");
              setDateTo("");
              setCurrentPage(1);
            }}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
          >
            <X size={14} /> Clear all
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Variants</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                expanded={expandedIds.has(product.id)}
                onToggleExpand={toggleExpand}
                onEditProduct={onEditProduct}
              />
            ))}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="font-semibold">No products found</p>
                  {products.length === 0 ? "No products have variants set up yet." : "No products match your search/filter."}
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
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); setShowAllPages(false); }}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border p-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
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
            return (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  currentPage === item ? "bg-blue-600 text-white" : "border hover:bg-slate-50"
                }`}
              >
                {item}
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
  );
}