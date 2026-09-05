// src/components/admin/products/VariantsBrowser.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Package, ImageOff,
  Search, X, Eye, EyeOff, RefreshCw, Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import productsApi from "@/lib/productsApi";
import { toStaticUrl } from "@/lib/client";

// Helper: format date for display
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Helper: get month name
const getMonthName = (month) => {
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return months[month - 1] || "Unknown";
};

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
      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(variant.createdAt)}</td>
      <td className="px-4 py-3">
        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${variant.isActive !== false ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
          {variant.isActive !== false ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit in product form">
          <Edit size={15} />
        </button>
        <button onClick={handleDelete} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete variant">
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

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
            className="ml-1 rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Created</th>
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
                      <td colSpan={7} className="px-4 py-4 text-center text-sm text-slate-400">
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

export default function VariantsBrowser({ onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");

  // Date filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterMonth, setFilterMonth] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterQuarter, setFilterQuarter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAllPages, setShowAllPages] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Fetch ALL products (paginated loop)
  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const allProducts = [];
      let page = 1;
      const pageSize = 100;
      let totalPages = 1;

      while (true) {
        const response = await productsApi.getAll({ page, pageSize, isActive: 'true' });
        const data = Array.isArray(response) ? response : (response?.data || []);
        allProducts.push(...data);

        if (response?.meta?.totalPages) {
          totalPages = response.meta.totalPages;
        } else if (response?.meta?.total) {
          totalPages = Math.ceil(response.meta.total / pageSize);
        } else {
          totalPages = page;
        }

        if (page >= totalPages) break;
        page++;
      }

      // Keep only products that have variants
      const withVariants = allProducts.filter((p) => p.variants?.length > 0);
      setProducts(withVariants);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load variants");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Unique brands for filter
  const uniqueBrands = useMemo(() => {
    return [...new Set(products.map((p) => p.brand?.name || "").filter(Boolean))];
  }, [products]);

  // Available years from variants
  const availableYears = useMemo(() => {
    const years = new Set();
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (v.createdAt) {
          years.add(new Date(v.createdAt).getFullYear());
        }
      });
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [products]);

  // Filtered products based on all filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Brand filter
    if (brandFilter !== "ALL") {
      filtered = filtered.filter((p) => p.brand?.name === brandFilter);
    }

    // Search by product name or variant name/attributes
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const productMatch = (p.name || "").toLowerCase().includes(q);
        const variantMatch = (p.variants || []).some((v) =>
          (v.name || "").toLowerCase().includes(q) ||
          Object.entries(v.attributes || {}).some(([k, val]) => `${k}: ${val}`.toLowerCase().includes(q))
        );
        return productMatch || variantMatch;
      });
    }

    // Status filter (based on variants)
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((p) =>
        filterStatus === "ACTIVE"
          ? (p.variants || []).some((v) => v.isActive !== false)
          : (p.variants || []).some((v) => v.isActive === false)
      );
    }

    // Date range filter (based on variant.createdAt)
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

    // Month filter
    if (filterMonth !== "ALL") {
      const monthNum = parseInt(filterMonth, 10);
      filtered = filtered.filter((p) =>
        (p.variants || []).some((v) => {
          if (!v.createdAt) return false;
          return new Date(v.createdAt).getMonth() + 1 === monthNum;
        })
      );
    }

    // Year filter
    if (filterYear !== "ALL") {
      const yearNum = parseInt(filterYear, 10);
      filtered = filtered.filter((p) =>
        (p.variants || []).some((v) => {
          if (!v.createdAt) return false;
          return new Date(v.createdAt).getFullYear() === yearNum;
        })
      );
    }

    // Quarter filter
    if (filterQuarter !== "ALL") {
      const quarterNum = parseInt(filterQuarter, 10);
      filtered = filtered.filter((p) =>
        (p.variants || []).some((v) => {
          if (!v.createdAt) return false;
          const month = new Date(v.createdAt).getMonth() + 1;
          const q = Math.ceil(month / 3);
          return q === quarterNum;
        })
      );
    }

    return filtered;
  }, [products, search, brandFilter, filterStatus, dateFrom, dateTo, filterMonth, filterYear, filterQuarter]);

  // Total variant count across filtered products
  const totalVariants = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  }, [filteredProducts]);

  // Pagination (client-side)
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const toggleExpand = (productId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setBrandFilter("ALL");
    setFilterStatus("ALL");
    setDateFrom("");
    setDateTo("");
    setFilterMonth("ALL");
    setFilterYear("ALL");
    setFilterQuarter("ALL");
    setCurrentPage(1);
  };

  const hasFilters = search || brandFilter !== "ALL" || filterStatus !== "ALL" || dateFrom || dateTo || filterMonth !== "ALL" || filterYear !== "ALL" || filterQuarter !== "ALL";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Variants Browser</h2>
          <p className="text-sm text-slate-500">
            {filteredProducts.length} products · {totalVariants} total variants
          </p>
        </div>
        <button
          onClick={fetchAllProducts}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 space-y-4">
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
          <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="ALL">All Brands</option>
            {uniqueBrands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 border-t pt-3">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1"><Calendar size={14} /> Date</span>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <span className="text-slate-400">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />

          <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="ALL">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>

          <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="ALL">All Years</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={filterQuarter} onChange={(e) => { setFilterQuarter(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="ALL">All Quarters</option>
            <option value="1">Q1 (Jan-Mar)</option>
            <option value="2">Q2 (Apr-Jun)</option>
            <option value="3">Q3 (Jul-Sep)</option>
            <option value="4">Q4 (Oct-Dec)</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
              <X size={14} /> Clear All
            </button>
          )}
        </div>
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
                  {hasFilters && (
                    <button onClick={clearFilters} className="mt-2 text-xs text-blue-600 hover:underline">Clear filters</button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Rows:</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); setShowAllPages(false); }} className="rounded-lg border px-3 py-1.5 text-sm">
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-sm text-slate-500">
              {filteredProducts.length > 0 ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredProducts.length)} of ${filteredProducts.length}` : "0 results"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border p-2 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {getPaginationItems().map((item, idx) => {
              if (item === "...left" || item === "...right") {
                return <button key={`ellipsis-${idx}`} onClick={() => setShowAllPages(true)} className="h-9 w-9 rounded-lg text-sm font-medium border hover:bg-slate-50" title="Show all pages">...</button>;
              }
              return <button key={item} onClick={() => setCurrentPage(item)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === item ? "bg-blue-600 text-white" : "border hover:bg-slate-50"}`}>{item}</button>;
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border p-2 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}