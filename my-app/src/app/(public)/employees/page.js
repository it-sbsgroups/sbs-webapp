"use client";

import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import EmployeesShowcase from "@/components/shared/EmployeesShowcase";

export default function PublicEmployeesDirectory() {
  return (
    <div className="bg-white min-h-screen font-sans text-black-900 antialiased selection:bg-blue-500 selection:text-slate-900">
      <PageBreadcrumb pageKey="employees" title="Employees" items={[{ label: "Employees" }]} />
      <div className="p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="border-b border-slate-200 pb-8 space-y-2">
            <h1 className="text-3xl font-bold text-black tracking-tight">Meet Our Professional Sales Workforce</h1>
          </div>

          <EmployeesShowcase showFilters showPagination pageSize={8} />
        </div>
      </div>
    </div>
  );
}
