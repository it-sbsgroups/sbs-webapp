"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { employees as fallbackEmployees } from "@/data/employee";
import { api } from "@/lib/employees/api";
import EmployeeCard from "@/components/shared/EmployeeCard";

function toEmpCard(e) {
  const name = e.name || [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");
  return { ...e, name, tag: e.tag || e.designation || e.department || "Team" };
}

/**
 * Drop this anywhere you want to show employees — the public directory page,
 * an About/Brand/Home page section, etc.
 *
 * Props (all optional):
 *  - title            heading text above the grid (omit to skip the heading)
 *  - limit             cap the number of employees shown (e.g. a "meet the team" teaser)
 *  - pageSize           employees per page when pagination is on (default 8)
 *  - showPagination    show pagination controls (default true; ignored if `limit` is set)
 *  - columns           Tailwind grid-cols classes (default 1/2/4 responsive)
 */
export default function EmployeesShowcase({
  title,
  limit,
  pageSize = 8,
  showPagination = true,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState(fallbackEmployees);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getEmployees();
        const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
        if (Array.isArray(list) && list.length) setEmployees(list.map(toEmpCard));
      } catch {
        /* keep fallback */
      }
    })();
  }, []);

  // Apply limit if provided, otherwise show all
  const displayedStaff = useMemo(() => {
    return limit ? employees.slice(0, limit) : employees;
  }, [employees, limit]);

  const paginate = showPagination && !limit;
  const effectivePageSize = pageSize;
  const totalPages = paginate ? Math.max(1, Math.ceil(displayedStaff.length / effectivePageSize)) : 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStaff = paginate
    ? displayedStaff.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize)
    : displayedStaff;

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
      )}

      {displayedStaff.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm font-medium">
          No team members found.
        </div>
      ) : (
        <div className={`grid ${columns} gap-8`}>
          {paginatedStaff.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}

      {paginate && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              aria-current={safePage === page ? "page" : undefined}
              className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                safePage === page
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "border border-slate-200 bg-white text-slate-500 hover:text-white hover:border-slate-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            aria-label="Next page"
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}