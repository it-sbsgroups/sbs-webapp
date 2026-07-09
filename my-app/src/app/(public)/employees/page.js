"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import {
  employees as fallbackEmployees,
  generateEmployeeSlug,
  SOCIAL_PLATFORMS,
  isValidLink,
} from "@/data/employee";
import { api } from "@/lib/employees/api";

function toEmpCard(e) {
  const name = e.name || [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");
  return { ...e, name, tag: e.tag || e.designation || e.department || "Team" };
}

const PAGE_SIZE = 8; // cards per page (2 rows of 4 on desktop)

export default function PublicEmployeesDirectory() {
  const [activeTagFilter, setActiveTagFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState(fallbackEmployees);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getEmployees();
        const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
        if (Array.isArray(list) && list.length) setEmployees(list.map(toEmpCard));
      } catch { /* keep fallback */ }
    })();
  }, []);

  const tags = ["All", ...new Set(employees.map((emp) => emp.tag))];

  // ── Filtering ──
  const filteredStaff = useMemo(
    () =>
      activeTagFilter === "All"
        ? employees
        : employees.filter((emp) => emp.tag === activeTagFilter),
    [activeTagFilter, employees]
  );

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStaff = filteredStaff.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleTagChange = (tag) => {
    setActiveTagFilter(tag);
    setCurrentPage(1); // reset page when filter changes
  };

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white min-h-screen p-6 md:p-12 font-sans text-black-900 antialiased selection:bg-blue-500 selection:text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black-400 animate-pulse"></span>
              {/* <span className="text-xs font-black text-black-600 uppercase tracking-widest">Team Ecosystem</span> */}
            </div>
            <h1 className="text-3xl font-bold text-black tracking-tight">Meet Our Professional Sales Workforce</h1>
            <p className="text-xs text-black-500 font-medium">
              {filteredStaff.length} member{filteredStaff.length !== 1 && "s"}
              {activeTagFilter !== "All" && ` in ${activeTagFilter}`}
            </p>
          </div>

          {/* FILTER SYSTEM */}
          {/* <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 backdrop-blur-md">
            {tags.map((tag) => (
              <button key={tag} onClick={() => handleTagChange(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTagFilter === tag
                    ? "bg-blue-500 text-black-950 font-black shadow-lg shadow-black-500/10"
                    : "text-black-500 hover:text-black hover:bg-slate-100"
                }`} >
                {tag}
              </button>
            ))}
          </div> */}
        </div>

        {/* CARDS GRID (RESPONSIVE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {paginatedStaff.map((emp) => {
            const staffSlug = generateEmployeeSlug(emp.name, emp.role); 
            const availableSocials = SOCIAL_PLATFORMS.filter(
              ({ key }) => key !== "email" && key !== "phone" && isValidLink(emp[key])
            );
            const hasEmail = isValidLink(emp.email) && emp.email.includes("@");

            return (
              <div key={emp.id}
                className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-blue-500/5 transition-all duration-300 group" >
                {/* 1. UPPER PANEL — avatar */}
                <div className={`h-64 bg-gradient-to-br ${emp.bgGradient} relative flex items-end justify-center border-b border-slate-200 overflow-hidden`} >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  <img loading="lazy" src={emp.image} alt={emp.name} className="h-full w-auto object-cover object-top relative z-[1] group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 right-4 z-[2] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/80 border border-slate-200 text-black-600 backdrop-blur-sm">
                    {emp.tag}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="border-b border-slate-200 pb-3 space-y-1">
                    <h3 className="text-base font-slate text-slate-900 tracking-tight truncate">{emp.name}</h3>
                    <p className="text-[10px] text-black-600 uppercase tracking-wider truncate">{emp.designation}</p>
                  </div>
                  {/* <Link href={`/employees/${staffSlug}`} className="text-[10px] font-black uppercase text-center tracking-widest text-slate-500 hover:text-cyan-600 transition-colors py-1.5 block bg-slate-50 rounded-lg border border-slate-100" >View Profile ➔</Link> */}

                  {/* Full email address with working mailto: link */}
                  {hasEmail && (
                    <a href={`mailto:${emp.email}`} title={`Email ${emp.name}`} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-blue-700 transition-colors px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 break-all" >
                      {/* <span className="shrink-0">✉️</span> */}
                      <span className="truncate">{emp.email}</span>
                    </a>
                  )}

                  {/* 3. ICON STRIP — looped, centered, only valid links */}
                  {/* {availableSocials.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-center gap-2.5 flex-wrap">
                      {availableSocials.map(({ key, label, Icon }) => (
                        <a key={key} href={emp[key]} itle={label} aria-label={`${emp.name} — ${label}`}
                          target={
                            emp[key].startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            emp[key].startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          } className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all duration-200" >
                          <Icon size={15} />
                        </a>
                      ))}
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredStaff.length === 0 && (
          <div className="text-center py-20 text-slate-500 text-sm font-medium">No team members found in this category.</div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} aria-label="Previous page" className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all" >
              <MdChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => goToPage(page)} aria-label={`Page ${page}`} aria-current={safePage === page ? "page" : undefined}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  safePage === page
                    ? "bg-blue-500 text-slate-950 shadow-lg shadow-black-500/20"
                    : "border border-slate-200 bg-white text-slate-500 hover:text-white hover:border-slate-300"
                }`} >
                {page}
              </button>
            ))}

            <button onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} aria-label="Next page" className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all">
              <MdChevronRight size={20} />
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className="text-center text-[10px] uppercase tracking-widest text-slate-600 font-bold">Page {safePage} of {totalPages}</p>
        )}
      </div>
    </div>
  );
}