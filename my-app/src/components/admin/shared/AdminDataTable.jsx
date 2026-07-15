"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import TableExportImport from "./TableExportImport";

/**
 * <AdminDataTable />
 *
 * One reusable table shell for every admin list page — only the column
 * config and data change per page. Comes with:
 *  - Click-to-sort columns (asc/desc/off)
 *  - A global search box + optional per-column filters
 *  - Client-side pagination
 *  - Built-in Export/Import CSV toolbar (via <TableExportImport />)
 *
 * Column shape:
 *  {
 *    key:          string          — property on the row (also the default cell value)
 *    label:        string          — header text
 *    sortable?:    boolean         — enables the sort arrows on this column
 *    sortAccessor?: (row) => any   — value to sort by, if different from row[key]
 *    filterType?:  'text' | 'select'
 *    filterOptions?: string[]      — for 'select'; auto-derived from data if omitted
 *    render?:      (row) => node   — custom cell renderer (falls back to row[key])
 *    exportValue?: (row) => string — value used for the CSV export column
 *    align?:       'left' | 'right' | 'center'
 *    className?:   string          — extra classes on <td>/<th>
 *  }
 */
export default function AdminDataTable({
  data = [],
  columns = [],
  keyField = "id",
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys, // optional explicit list of column keys to search; defaults to all text-ish columns
  rowActions, // (row) => node
  pageSize = 15,
  loading = false,
  emptyMessage = "No records found",
  exportFilenamePrefix = "export",
  onImportRow,
  onImported,
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({}); // { [key]: value }
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'
  const [page, setPage] = useState(1);

  const filterableColumns = columns.filter((c) => c.filterType);
  const effectiveSearchKeys = searchKeys || columns.filter((c) => !c.filterType || c.filterType === "text").map((c) => c.key);

  // Derive select-filter options from data if not explicitly provided
  const selectOptions = useMemo(() => {
    const map = {};
    filterableColumns.forEach((c) => {
      if (c.filterType === "select") {
        map[c.key] = c.filterOptions || [...new Set(data.map((r) => String(r[c.key] ?? "")).filter(Boolean))].sort();
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns]);

  const filtered = useMemo(() => {
    let rows = data;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) =>
        effectiveSearchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
      );
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return;
      rows = rows.filter((row) => String(row[key] ?? "") === value);
    });

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, columnFilters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const accessor = col?.sortAccessor || ((row) => row[sortKey]);
    const rows = [...filtered].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
    });
    return sortDir === "asc" ? rows : rows.reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir("asc"); }
    setPage(1);
  };

  const exportColumns = columns
    .filter((c) => c.key !== "__actions__")
    .map((c) => ({ key: c.key, label: c.label, exportValue: c.exportValue || ((row) => row[c.key]) }));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toolbar: search + per-column filters + export/import */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-[200px]"
              />
            </div>
          )}
          {filterableColumns.map((c) => (
            <select
              key={c.key}
              value={columnFilters[c.key] || ""}
              onChange={(e) => { setColumnFilters((p) => ({ ...p, [c.key]: e.target.value })); setPage(1); }}
              className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-400"
            >
              <option value="">All {c.label}</option>
              {(selectOptions[c.key] || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ))}
        </div>

        <TableExportImport
          data={sorted}
          columns={exportColumns}
          filenamePrefix={exportFilenamePrefix}
          onImportRow={onImportRow}
          onImported={onImported}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-bold">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      onClick={() => c.sortable && toggleSort(c.key)}
                      className={`py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 ${c.sortable ? "cursor-pointer select-none hover:text-slate-600" : ""} ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"} ${c.className || ""}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {c.sortable && (
                          sortKey === c.key
                            ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                            : <ChevronsUpDown size={12} className="opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                  {rowActions && <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paginated.map((row) => (
                  <tr key={row[keyField]} className="hover:bg-slate-50/80 transition-colors">
                    {columns.map((c) => (
                      <td key={c.key} className={`py-3 px-4 ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"} ${c.className || ""}`}>
                        {c.render ? c.render(row) : (row[c.key] ?? "—")}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">{rowActions(row)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && sorted.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={14} /></button>
              <span className="text-xs font-bold text-slate-500">{currentPage} / {totalPages}</span>
              <button disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
