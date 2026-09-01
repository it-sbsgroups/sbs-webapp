"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Newspaper,
  ChevronDown,
  Filter,
  X,
  Loader2,
} from "lucide-react";

function NewsCategoryFilter({ categories, subcategories, value, onChange }) {
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

const STATUS_STYLES = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-yellow-100 text-yellow-700",
  ARCHIVED: "bg-slate-200 text-slate-600",
};

export default function NewsTable({
  posts,
  categories,
  subcategories,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  editLoadingId,
  searchQuery,
  setSearchQuery,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categorySubFilter, setCategorySubFilter] = useState({ type: "ALL", id: null });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFeatured, setFilterFeatured] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categorySubFilter, filterStatus, filterFeatured]);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "—";
  const getSubcategoryName = (id) => subcategories.find((s) => s.id === id)?.name || "";

  const hasActiveFilters =
    categorySubFilter.type !== "ALL" || filterStatus !== "ALL" || filterFeatured !== "ALL";

  const clearAllFilters = () => {
    setCategorySubFilter({ type: "ALL", id: null });
    setFilterStatus("ALL");
    setFilterFeatured("ALL");
  };

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.slug || "").toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q)
      );
    }

    if (categorySubFilter.type === "CATEGORY") {
      filtered = filtered.filter((p) => p.categoryId === categorySubFilter.id);
    } else if (categorySubFilter.type === "SUBCATEGORY") {
      filtered = filtered.filter((p) => p.subcategoryId === categorySubFilter.id);
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((p) => (p.status || "DRAFT") === filterStatus);
    }

    if (filterFeatured === "FEATURED") {
      filtered = filtered.filter((p) => p.isFeatured === true);
    } else if (filterFeatured === "NOT_FEATURED") {
      filtered = filtered.filter((p) => p.isFeatured !== true);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") {
        cmp = (a.title || "").localeCompare(b.title || "");
      } else {
        const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
        cmp = aDate - bDate;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [posts, searchQuery, categorySubFilter, filterStatus, filterFeatured, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, or excerpt…"
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <NewsCategoryFilter
            categories={categories}
            subcategories={subcategories}
            value={categorySubFilter}
            onChange={(v) => {
              setCategorySubFilter(v);
              setCurrentPage(1);
            }}
          />

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              showAdvancedFilters || filterFeatured !== "ALL"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
            {filterFeatured !== "ALL" && <span className="w-2 h-2 rounded-full bg-blue-600" />}
          </button>

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
              <X size={14} /> Clear all
            </button>
          )}
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
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
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Image</th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:text-blue-600"
                onClick={() => {
                  setSortField("title");
                  setSortOrder((o) => (sortField === "title" && o === "asc" ? "desc" : "asc"));
                }}
              >
                Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category / Subcategory</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Featured</th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:text-blue-600"
                onClick={() => {
                  setSortField("date");
                  setSortOrder((o) => (sortField === "date" && o === "asc" ? "desc" : "asc"));
                }}
              >
                Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.map((post) => {
              const catSubcatDisplay = post.subcategoryId
                ? `${getCategoryName(post.categoryId)} / ${getSubcategoryName(post.subcategoryId)}`
                : getCategoryName(post.categoryId);

              return (
                <tr key={post.id} className="border-t hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <ImageOff size={16} className="text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm font-semibold text-slate-800 truncate">{post.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{catSubcatDisplay}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleStatus(post)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        STATUS_STYLES[post.status] || STATUS_STYLES.DRAFT
                      }`}
                    >
                      {post.status || "DRAFT"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onToggleFeatured(post)} className={post.isFeatured ? "text-yellow-500" : "text-slate-300"}>
                      {post.isFeatured ? "⭐" : "☆"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(post)}
                        disabled={editLoadingId === post.id}
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                        title="Edit"
                      >
                        {editLoadingId === post.id ? <Loader2 size={15} className="animate-spin" /> : <Edit size={15} />}
                      </button>
                      <button onClick={() => onDelete(post.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedPosts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Newspaper className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="font-semibold">No posts found</p>
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
      <div className="flex items-center justify-between flex-wrap gap-3">
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
            {filteredPosts.length > 0
              ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredPosts.length)} of ${filteredPosts.length}`
              : "0 results"}
          </span>
          {hasActiveFilters && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {filteredPosts.length} filtered
            </span>
          )}
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
                currentPage === i + 1 ? "bg-blue-600 text-white" : "border hover:bg-slate-50"
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
